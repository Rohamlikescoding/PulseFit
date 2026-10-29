import React, { useMemo } from 'react';
import { formatDateIso } from '../../lib/schedule';
import { SessionLog } from '../../types/workout';

interface HeatMapProps {
  sessionLogs: SessionLog[];
  referenceDate?: Date;
}

interface DayCell {
  date: Date;
  dateIso: string;
  count: number;
  totalSets: number;
  totalVolume: number;
  dayName: string;
}

export const HeatMap: React.FC<HeatMapProps> = ({
  sessionLogs,
  referenceDate = new Date(),
}) => {
  // Aggregate session logs by date string
  const logsByDate = useMemo(() => {
    const map = new Map<string, { count: number; totalSets: number; totalVolume: number }>();
    sessionLogs.forEach((log) => {
      const existing = map.get(log.date) || { count: 0, totalSets: 0, totalVolume: 0 };
      const setsCount = (log.exercises || []).reduce(
        (acc, ex) => acc + (ex.sets ? ex.sets.length : 0),
        0
      );
      const volume = (log.exercises || []).reduce(
        (acc, ex) =>
          acc +
          (ex.sets || []).reduce(
            (sAcc, s) => sAcc + (s.reps || 0) * (s.weight || 0),
            0
          ),
        0
      );

      map.set(log.date, {
        count: existing.count + 1,
        totalSets: existing.totalSets + setsCount,
        totalVolume: existing.totalVolume + volume,
      });
    });
    return map;
  }, [sessionLogs]);

  // Compute 52 weeks ending at referenceDate
  const { weeks, monthLabels } = useMemo(() => {
    const ref = new Date(referenceDate);
    const dayOfWeek = ref.getDay();

    const endDate = new Date(ref);
    endDate.setDate(ref.getDate() + (6 - dayOfWeek));

    const totalDays = 52 * 7;
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - totalDays + 1);

    const weeksArray: DayCell[][] = [];
    const months: { label: string; weekIndex: number }[] = [];
    let currentWeek: DayCell[] = [];
    let lastMonth = -1;

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const iso = formatDateIso(d);
      const data = logsByDate.get(iso);

      const cell: DayCell = {
        date: d,
        dateIso: iso,
        count: data?.count || 0,
        totalSets: data?.totalSets || 0,
        totalVolume: data?.totalVolume || 0,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      };

      currentWeek.push(cell);

      if (currentWeek.length === 7) {
        const weekIndex = weeksArray.length;
        const firstDayOfMonth = currentWeek[0].date.getMonth();
        if (firstDayOfMonth !== lastMonth) {
          months.push({
            label: currentWeek[0].date.toLocaleDateString('en-US', { month: 'short' }),
            weekIndex,
          });
          lastMonth = firstDayOfMonth;
        }

        weeksArray.push(currentWeek);
        currentWeek = [];
      }
    }

    return { weeks: weeksArray, monthLabels: months };
  }, [referenceDate, logsByDate]);

  const activeDaysCount = useMemo(() => {
    let count = 0;
    weeks.forEach((w) =>
      w.forEach((day) => {
        if (day.totalSets > 0) count++;
      })
    );
    return count;
  }, [weeks]);

  const getCellColor = (sets: number) => {
    if (sets === 0) return 'bg-surface-secondary border border-token';
    if (sets <= 4) return 'bg-[#74a87c]/30 border border-[#74a87c]/40';
    if (sets <= 8) return 'bg-[#74a87c]/60 border border-[#74a87c]/70';
    if (sets <= 12) return 'bg-[#74a87c] border border-[#5d8b64]';
    return 'bg-[#9dd3a4] border border-[#b9f0bf]';
  };

  return (
    <div className="card-token p-5 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-token-primary tracking-tight">
            Workout Activity Heat Map
          </h2>
          <p className="text-xs text-token-muted mt-0.5">
            52-week training consistency derived from your session logs
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="font-mono text-accent-brand font-bold">
            {activeDaysCount} Days Active
          </span>
          <div className="flex items-center gap-1">
            <span className="text-token-subtle text-[10px]">Less</span>
            <span className="h-2.5 w-2.5 rounded-sm bg-surface-secondary border border-token" />
            <span className="h-2.5 w-2.5 rounded-sm bg-[#74a87c]/30" />
            <span className="h-2.5 w-2.5 rounded-sm bg-[#74a87c]/60" />
            <span className="h-2.5 w-2.5 rounded-sm bg-[#74a87c]" />
            <span className="text-token-subtle text-[10px]">More</span>
          </div>
        </div>
      </div>

      {/* Grid container with horizontal scroll */}
      <div className="overflow-x-auto pb-2">
        <div className="inline-block min-w-[720px] select-none">
          {/* Months header */}
          <div className="flex text-[10px] text-token-muted mb-1 pl-8 font-mono">
            {monthLabels.map((m, idx) => (
              <span
                key={idx}
                style={{
                  position: 'relative',
                  left: `${m.weekIndex * 13.5}px`,
                  marginRight: '12px',
                }}
              >
                {m.label}
              </span>
            ))}
          </div>

          {/* Grid rows */}
          <div className="flex gap-2">
            {/* Weekday indicators */}
            <div className="flex flex-col gap-[3px] text-[9px] text-token-muted font-mono pt-[1px] w-6 shrink-0 text-right pr-1">
              <span>Sun</span>
              <span className="mt-[6px]">Mon</span>
              <span className="mt-[6px]">Wed</span>
              <span className="mt-[6px]">Fri</span>
              <span className="mt-[6px]">Sat</span>
            </div>

            {/* Weeks columns */}
            <div className="flex gap-[3px]">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-[3px]">
                  {week.map((day) => {
                    const titleText = `${day.dateIso}: ${
                      day.totalSets > 0
                        ? `${day.totalSets} sets, ${Math.round(day.totalVolume)} volume`
                        : 'No workouts'
                    }`;

                    return (
                      <div
                        key={day.dateIso}
                        title={titleText}
                        className={`h-[11px] w-[11px] rounded-[2px] transition-all hover:scale-125 hover:z-20 cursor-pointer ${getCellColor(
                          day.totalSets
                        )}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
