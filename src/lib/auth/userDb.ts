/**
 * DEV-ONLY file-backed user store (./.data/users.json) with scrypt password hashing.
 * Import from Route Handlers only (uses node:fs / node:crypto).
 *
 * This is a stand-in for the Django backend: swap these functions for API calls
 * and nothing else in the app has to change. It will NOT persist on read-only /
 * serverless filesystems.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import type { PublicUser, SignupInput } from '../../types/auth';

interface StoredUser extends PublicUser {
  passwordHash: string; // "salt:hash" (hex)
}

const DB_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DB_DIR, 'users.json');

function scrypt(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    scryptCb(password, salt, 64, (err, key) => (err ? reject(err) : resolve(key))),
  );
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt);
  return `${salt.toString('hex')}:${key.toString('hex')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, keyHex] = stored.split(':');
  if (!saltHex || !keyHex) return false;
  const expected = Buffer.from(keyHex, 'hex');
  const actual = await scrypt(password, Buffer.from(saltHex, 'hex'));
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

async function readAll(): Promise<StoredUser[]> {
  try {
    return JSON.parse(await fs.readFile(DB_FILE, 'utf8')) as StoredUser[];
  } catch {
    return [];
  }
}

// Serialise writes so two simultaneous signups can't clobber each other.
let queue: Promise<unknown> = Promise.resolve();
function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.catch(() => undefined);
  return run;
}

const toPublic = ({ passwordHash: _ph, ...user }: StoredUser): PublicUser => user;

export class EmailTakenError extends Error {}

export function createUser(input: SignupInput): Promise<PublicUser> {
  return withLock(async () => {
    const users = await readAll();
    if (users.some((u) => u.email === input.email)) throw new EmailTakenError();
    const user: StoredUser = {
      id: `usr_${randomBytes(8).toString('hex')}`,
      name: input.name,
      email: input.email,
      age: input.age,
      heightCm: input.heightCm,
      weightKg: input.weightKg,
      goal: input.goal,
      experience: input.experience,
      createdAt: new Date().toISOString(),
      passwordHash: await hashPassword(input.password),
    };
    await fs.mkdir(DB_DIR, { recursive: true });
    await fs.writeFile(DB_FILE, JSON.stringify([...users, user], null, 2), 'utf8');
    return toPublic(user);
  });
}

// Used to keep login timing similar whether or not the email exists.
const DUMMY_HASH =
  '00000000000000000000000000000000:' + '00'.repeat(64);

export async function authenticateUser(email: string, password: string): Promise<PublicUser | null> {
  const users = await readAll();
  const found = users.find((u) => u.email === email.trim().toLowerCase());
  const ok = await verifyPassword(password, found?.passwordHash ?? DUMMY_HASH);
  return found && ok ? toPublic(found) : null;
}

export async function findUserById(id: string): Promise<PublicUser | null> {
  const found = (await readAll()).find((u) => u.id === id);
  return found ? toPublic(found) : null;
}
