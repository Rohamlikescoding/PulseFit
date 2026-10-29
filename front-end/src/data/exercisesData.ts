import { Exercise } from '../types/workout';

export const CURATED_EXERCISES: Exercise[] = [
  // Chest
  {
    id: 'db-bench-press',
    name: 'Dumbbell Bench Press',
    bodyPart: 'chest',
    equipment: 'dumbbell',
    target: 'pectorals',
    secondaryMuscles: ['anterior deltoids', 'triceps brachii'],
    difficulty: 'intermediate',
    gifUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
    instructions: [
      'Lie flat on a sturdy bench holding a pair of dumbbells firmly at chest level with an overhand grip.',
      'Plant your feet firmly into the floor, retract your shoulder blades, and brace your abdominal core.',
      'Press the dumbbells upwards in a controlled arc directly above your mid-chest until your arms are extended.',
      'Pause for a split second at peak chest contraction without clanking the dumbbells together.',
      'Slowly lower the dumbbells over a 2 to 3-second descent until you feel a comfortable stretch across your pectorals.',
      'Repeat for the prescribed repetitions with consistent breathing.'
    ],
    tips: [
      'Avoid flaring your elbows at a 90-degree angle; keep them tucked around 45 to 60 degrees to safeguard your shoulder joints.',
      'Maintain an active arch in your thoracic spine while keeping your glutes and upper back glued to the bench.'
    ]
  },
  {
    id: 'db-incline-bench-press',
    name: 'Incline Dumbbell Press',
    bodyPart: 'chest',
    equipment: 'dumbbell',
    target: 'upper chest',
    secondaryMuscles: ['clavicular pectoralis', 'anterior deltoids', 'triceps'],
    difficulty: 'intermediate',
    gifUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80',
    instructions: [
      'Position an adjustable bench at approximately a 30 to 45-degree incline angle.',
      'Sit back with dumbbells resting on your thighs, then kick them up to shoulder height as you lie back.',
      'Press both dumbbells vertically over your upper chest until elbows are locked out soft.',
      'Inhale as you lower the weights smoothly until the dumbbells are level with your upper chest.',
      'Drive powerfully through your palms to press the dumbbells back up to the starting lockout.'
    ],
    tips: [
      'Setting the bench incline higher than 45 degrees shifts tension away from the upper chest into the front shoulders.',
      'Keep your wrists neutral and directly over your forearms throughout the entire press.'
    ]
  },
  {
    id: 'db-chest-fly',
    name: 'Flat Dumbbell Fly',
    bodyPart: 'chest',
    equipment: 'dumbbell',
    target: 'pectorals',
    secondaryMuscles: ['anterior deltoids', 'biceps short head'],
    difficulty: 'beginner',
    gifUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    instructions: [
      'Lie flat on a bench holding dumbbells extended above your chest, palms facing each other.',
      'Maintain a slight, fixed bend in your elbows throughout the movement.',
      'Lower the weights outward in a wide, sweeping arc until your chest feels a deep, comfortable stretch.',
      'Contract your pectoral muscles to squeeze the dumbbells back together along the same path as if hugging a barrel.'
    ],
    tips: [
      'Never allow your elbows to drop below the level of the bench to prevent shoulder impingement.',
      'Focus on a deliberate stretch on the way down and squeeze through your chest at the top.'
    ]
  },
  {
    id: 'db-pushup-to-row',
    name: 'Renegade Push-up',
    bodyPart: 'chest',
    equipment: 'dumbbell',
    target: 'chest & core',
    secondaryMuscles: ['lats', 'obliques', 'triceps'],
    difficulty: 'advanced',
    gifUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=800&q=80',
    instructions: [
      'Set up in a push-up plank position with both hands gripping hex dumbbells resting on the ground.',
      'Perform a deep, rigid push-up until your chest approaches the floor.',
      'Press back up, and at the top, row one dumbbell up to your hip while stabilizing with your core.',
      'Lower the dumbbell with control and repeat on the alternating side.'
    ],
    tips: [
      'Widen your foot stance slightly to minimize hip rotation during the rowing phase.',
      'Keep your hips level and avoid sagging your lower back.'
    ]
  },

  // Back
  {
    id: 'db-single-arm-row',
    name: 'Single-Arm Dumbbell Row',
    bodyPart: 'back',
    equipment: 'dumbbell',
    target: 'latissimus dorsi',
    secondaryMuscles: ['rhomboids', 'biceps', 'posterior deltoids'],
    difficulty: 'intermediate',
    gifUrl: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=800&q=80',
    instructions: [
      'Place one knee and one hand on a flat bench, keeping your spine neutral and parallel to the floor.',
      'Hold a dumbbell in the opposite hand hanging at full arm extension.',
      'Pull your elbow back towards your hip, keeping the dumbbell close to your torso.',
      'Pause and firmly contract your lats and middle back at the peak of the row.',
      'Lower the dumbbell smoothly back down into a full lat stretch.'
    ],
    tips: [
      'Think of pulling with your elbow rather than your hand to isolate your back instead of your biceps.',
      'Keep your torso static; avoid jerking your shoulder upwards to lift the weight.'
    ]
  },
  {
    id: 'db-bent-over-row',
    name: 'Bent-Over Dumbbell Row',
    bodyPart: 'back',
    equipment: 'dumbbell',
    target: 'upper back',
    secondaryMuscles: ['lats', 'rear delts', 'core'],
    difficulty: 'intermediate',
    gifUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80',
    instructions: [
      'Stand feet shoulder-width apart, hinge at your hips until your torso is at roughly 45 degrees.',
      'Let the dumbbells hang naturally with an overhand or neutral grip while keeping your spine straight.',
      'Row the dumbbells upward towards your lower ribcage, driving your elbows back.',
      'Squeeze your shoulder blades together tightly at the top for one second.',
      'Lower under control to full extension.'
    ],
    tips: [
      'Brace your core and keep your knees slightly bent to protect your lower back.',
      'Keep your neck neutral by gazing 3 to 4 feet in front of your feet on the floor.'
    ]
  },
  {
    id: 'db-romanian-deadlift',
    name: 'Dumbbell Romanian Deadlift',
    bodyPart: 'back',
    equipment: 'dumbbell',
    target: 'lower back & hamstrings',
    secondaryMuscles: ['glutes', 'erector spinae', 'trapezius'],
    difficulty: 'intermediate',
    gifUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    instructions: [
      'Stand upright holding dumbbells in front of your thighs with a pronated grip.',
      'Keep a soft micro-bend in your knees, pin your shoulder blades back, and brace your core.',
      'Hinge at your hips and push your hips straight backward as the dumbbells slide down along your shins.',
      'Descend until you feel a deep stretch in your hamstrings (usually mid-shin level).',
      'Drive through your heels and squeeze your glutes forward to return to standing.'
    ],
    tips: [
      'This is a hip hinge, not a squat. Do not bend your knees excessively during the descent.',
      'Keep the weights close to your body to minimize shear stress on your lumbar spine.'
    ]
  },
  {
    id: 'db-pullover',
    name: 'Dumbbell Pullover',
    bodyPart: 'back',
    equipment: 'dumbbell',
    target: 'lats & serratus',
    secondaryMuscles: ['chest', 'triceps long head', 'core'],
    difficulty: 'intermediate',
    gifUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
    instructions: [
      'Lie perpendicular across a flat bench with your upper back supported and hips slightly dropped.',
      'Hold one dumbbell with both hands cupping the inner plate directly over your chest.',
      'Lower the dumbbell back and over your head in an arc, feeling a deep stretch across your lats and ribcage.',
      'Pull the dumbbell back up through the same arc using your lats until it is over your chest.'
    ],
    tips: [
      'Keep your elbows slightly bent and locked in that position throughout the movement.',
      'Inhale deeply as the weight stretches back over your head to expand your ribcage.'
    ]
  },

  // Shoulders
  {
    id: 'db-overhead-press',
    name: 'Seated Dumbbell Shoulder Press',
    bodyPart: 'shoulders',
    equipment: 'dumbbell',
    target: 'anterior deltoid',
    secondaryMuscles: ['triceps', 'upper pectorals', 'trapezius'],
    difficulty: 'intermediate',
    gifUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=800&q=80',
    instructions: [
      'Sit on an upright bench with your back firmly supported and dumbbells held at shoulder level.',
      'Your palms should face forward or slightly inwards at a 45-degree angle.',
      'Press the dumbbells upwards smoothly until arms are fully overhead.',
      'Lower the dumbbells with control back to ear level and repeat.'
    ],
    tips: [
      'Avoid arching your lower back away from the benchpad; keep your abs engaged.',
      'Do not clang the dumbbells at the peak; maintain tension throughout the range of motion.'
    ]
  },
  {
    id: 'db-lateral-raise',
    name: 'Dumbbell Lateral Raise',
    bodyPart: 'shoulders',
    equipment: 'dumbbell',
    target: 'lateral deltoid',
    secondaryMuscles: ['supraspinatus', 'upper traps'],
    difficulty: 'beginner',
    gifUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80',
    instructions: [
      'Stand tall holding dumbbells at your sides with a slight forward torso lean.',
      'With a slight bend in your elbows, raise the dumbbells out to the sides until parallel to the floor.',
      'Lead with your elbows and ensure your pinky fingers are slightly elevated.',
      'Pause briefly at shoulder height, then lower slowly back to your sides.'
    ],
    tips: [
      'Use modest weight and avoid swinging your body or shrugging your traps up to your ears.',
      'Pouring imaginary water at the top emphasizes the lateral deltoid head.'
    ]
  },
  {
    id: 'db-arnold-press',
    name: 'Arnold Press',
    bodyPart: 'shoulders',
    equipment: 'dumbbell',
    target: 'deltoids',
    secondaryMuscles: ['triceps', 'traps', 'rotator cuff'],
    difficulty: 'intermediate',
    gifUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
    instructions: [
      'Hold dumbbells in front of your chest with palms facing your torso, like the top of a bicep curl.',
      'As you press upwards, rotate your wrists outwards so your palms face forward at the top.',
      'At full extension, your arms are overhead with palms facing away.',
      'Reverse the motion on the descent, rotating back to the starting curl position.'
    ],
    tips: [
      'Execute the rotation smoothly throughout the press rather than abruptly at the beginning or end.',
      'Keep your core tight to avoid leaning back.'
    ]
  },

  // Upper Arms (Biceps & Triceps)
  {
    id: 'db-bicep-curl',
    name: 'Dumbbell Bicep Curl',
    bodyPart: 'upper arms',
    equipment: 'dumbbell',
    target: 'biceps brachii',
    secondaryMuscles: ['brachialis', 'forearms'],
    difficulty: 'beginner',
    gifUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
    instructions: [
      'Stand feet hip-width apart holding dumbbells at your sides with palms facing forward.',
      'Keep your elbows pinned close to your torso and curl the weights upward toward your shoulders.',
      'Squeeze your biceps hard at the peak for one full count.',
      'Lower the dumbbells slowly under tension to the bottom starting position.'
    ],
    tips: [
      'Do not swing your hips or use momentum to move the weight.',
      'Fully extend your arms at the bottom of every rep to achieve a full stretch.'
    ]
  },
  {
    id: 'db-hammer-curl',
    name: 'Dumbbell Hammer Curl',
    bodyPart: 'upper arms',
    equipment: 'dumbbell',
    target: 'brachialis & forearms',
    secondaryMuscles: ['biceps brachii', 'brachioradialis'],
    difficulty: 'beginner',
    gifUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80',
    instructions: [
      'Stand upright holding dumbbells with a neutral grip (palms facing inward toward each other).',
      'Keeping your upper arms stationary, curl the dumbbells upward until your forearms are vertical.',
      'Pause and squeeze at the top of the contraction.',
      'Lower the dumbbells back down under strict control.'
    ],
    tips: [
      'Neutral grip places significant load on the brachialis and forearm muscles for arm thickness.',
      'Keep your wrists locked and straight throughout the rep.'
    ]
  },
  {
    id: 'db-tricep-overhead-extension',
    name: 'Overhead Tricep Extension',
    bodyPart: 'upper arms',
    equipment: 'dumbbell',
    target: 'triceps long head',
    secondaryMuscles: ['medial and lateral triceps heads'],
    difficulty: 'intermediate',
    gifUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=800&q=80',
    instructions: [
      'Sit upright holding one dumbbell overhead with both hands forming a diamond cupping the inner plate.',
      'Lower the dumbbell behind your head by bending only at your elbows until you feel a tricep stretch.',
      'Extend your elbows to press the dumbbell back overhead to full lockout.',
      'Squeeze your triceps at the top of the extension.'
    ],
    tips: [
      'Keep your elbows pointing forward rather than flaring wide out to the sides.',
      'Brace your abdominal muscles to prevent overarching your lower back.'
    ]
  },

  // Upper Legs (Quads & Hamstrings)
  {
    id: 'db-goblet-squat',
    name: 'Goblet Squat',
    bodyPart: 'upper legs',
    equipment: 'dumbbell',
    target: 'quadriceps & glutes',
    secondaryMuscles: ['hamstrings', 'calves', 'core'],
    difficulty: 'beginner',
    gifUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80',
    instructions: [
      'Stand with feet slightly wider than shoulder-width, toes pointing out 15 to 30 degrees.',
      'Hold a single dumbbell vertically against your chest, cupping the top plate with both hands.',
      'Hinge hips and bend your knees to squat down between your legs, keeping your chest elevated.',
      'Descend until your thighs are at or slightly below parallel with the floor.',
      'Drive through your full foot to stand up, extending hips and knees completely.'
    ],
    tips: [
      'Push your knees outwards in the direction of your toes as you descend.',
      'Keep your elbows tucked inside your knees at the bottom of the squat.'
    ]
  },
  {
    id: 'db-walking-lunge',
    name: 'Dumbbell Walking Lunge',
    bodyPart: 'upper legs',
    equipment: 'dumbbell',
    target: 'quads & glutes',
    secondaryMuscles: ['hamstrings', 'calves', 'hip stabilizers'],
    difficulty: 'intermediate',
    gifUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    instructions: [
      'Stand upright holding dumbbells at your sides with arms hanging naturally.',
      'Take a large controlled step forward with your right leg and bend both knees to lower your hips.',
      'Descend until your back knee gently hovers just above the floor and front thigh is parallel.',
      'Push through your front right heel to rise and step forward with your left leg into the next stride.'
    ],
    tips: [
      'Keep your torso upright with your shoulders back throughout every step.',
      'Avoid letting your front knee collapse inwards; track it directly over your middle toes.'
    ]
  },
  {
    id: 'db-bulgarian-split-squat',
    name: 'Bulgarian Split Squat',
    bodyPart: 'upper legs',
    equipment: 'dumbbell',
    target: 'glutes & quads',
    secondaryMuscles: ['hamstrings', 'adductors', 'calves'],
    difficulty: 'advanced',
    gifUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80',
    instructions: [
      'Stand about two to three feet in front of a bench, holding dumbbells at your sides.',
      'Rest the top of your rear foot on the bench behind you.',
      'Lower your body by bending your front knee and hip until your front thigh is parallel to the ground.',
      'Drive through the heel of your front foot to return to the starting position.'
    ],
    tips: [
      'Lean your torso slightly forward to maximize glute recruitment while sparing the lower back.',
      'Find a stable stance before adding heavy weight to maintain balance.'
    ]
  },

  // Waist & Core
  {
    id: 'db-russian-twist',
    name: 'Weighted Russian Twist',
    bodyPart: 'waist',
    equipment: 'dumbbell',
    target: 'obliques',
    secondaryMuscles: ['rectus abdominis', 'transverse abdominis', 'hip flexors'],
    difficulty: 'intermediate',
    gifUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=800&q=80',
    instructions: [
      'Sit on an exercise mat, bend your knees, and lean your torso back to a 45-degree angle.',
      'Hold a dumbbell with both hands across your chest with feet slightly elevated off the floor.',
      'Rotate your torso smoothly to the right, tapping the dumbbell lightly beside your hip.',
      'Contract your core and rotate across to the left side in one continuous controlled tempo.'
    ],
    tips: [
      'Rotate from your ribcage and core rather than just swinging your arms side to side.',
      'Keep your spine straight without rounding your lower back excessively.'
    ]
  },

  // Cardio / Full Body Conditioning
  {
    id: 'db-thruster',
    name: 'Dumbbell Thruster',
    bodyPart: 'cardio',
    equipment: 'dumbbell',
    target: 'full body power',
    secondaryMuscles: ['quads', 'shoulders', 'glutes', 'triceps'],
    difficulty: 'advanced',
    gifUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    instructions: [
      'Stand shoulder-width apart holding dumbbells resting on your shoulders in a front rack position.',
      'Perform a deep squat until your hips are below parallel.',
      'Explosively drive upward out of the squat, using the leg drive momentum to press the dumbbells overhead.',
      'Lock out arms overhead, then smoothly bring weights back to shoulders as you enter the next squat.'
    ],
    tips: [
      'Synchronize your leg drive with your overhead press for maximum kinetic energy transfer.',
      'Breathe in on the descent and exhale powerfully as you drive up.'
    ]
  }
];

export const BODY_PARTS = [
  'all',
  'chest',
  'back',
  'shoulders',
  'upper arms',
  'upper legs',
  'lower legs',
  'waist',
  'cardio',
] as const;
