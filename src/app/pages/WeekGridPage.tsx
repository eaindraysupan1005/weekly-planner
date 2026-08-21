import { useState } from "react";
import { useNavigate } from "react-router";
import { Check, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabaseClient";
import { DAY_NAMES, SHORT_NAMES, formatWeekRange, getWeekDates, isToday, isPastDate, isFutureDate, toISODate } from "../lib/dateUtils";
import { occurrenceKey, type TaskDef } from "../hooks/useTasks";
import { TaskRow } from "../components/TaskRow";

export function WeekGridPage({
  session,
  completed,
  getTasksForDay,
  toggleTask,
  removeTask,
  todayISO,
}: {
  session: Session;
  completed: Record<string, boolean>;
  getTasksForDay: (dayIdx: number, dateISO: string) => TaskDef[];
  toggleTask: (taskId: string, dateISO: string) => void;
  removeTask: (taskId: string) => void;
  todayISO: string;
}) {
  const navigate = useNavigate();
  const [weekOffset, setWeekOffset] = useState(0);
  const [activeMobile, setActiveMobile] = useState<number>(() => {
    const dow = new Date().getDay();
    return dow === 0 ? 6 : dow - 1;
  });

  const weekDates = getWeekDates(weekOffset);

  function DayColumn({ dayIdx }: { dayIdx: number }) {
    const date = weekDates[dayIdx];
    const dateISO = toISODate(date);
    const dayTasks = getTasksForDay(dayIdx, dateISO);
    const done = dayTasks.filter((t) => completed[occurrenceKey(t.id, dateISO)]).length;
    const total = dayTasks.length;
    const today = isToday(date);
    const isWeekend = dayIdx >= 5;
    const isPast = isPastDate(dateISO, todayISO);
    const isFuture = isFutureDate(dateISO, todayISO);

    return (
      <div
        onClick={() => navigate(`/day/${dateISO}`)}
        role="link"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter") navigate(`/day/${dateISO}`);
        }}
        className={[
          "group flex flex-col rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer",
          "hover:shadow-xl hover:-translate-y-1",
          today ? "shadow-lg ring-2 ring-[#e13599]/30 hover:ring-[#e13599]/50" : "border border-[#e13599]/15 hover:border-[#e13599]/40",
        ].join(" ")}
        style={{
          background: today ? "#fbd7e9" : isWeekend ? "#fff0f8" : "#fff5fb",
          minHeight: 480,
        }}
      >
        {/* Header */}
        <div className={["px-4 pt-4 pb-3", today ? "bg-[#f7c0dd]" : ""].join(" ")}>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: today ? "#a8447a" : "#8a4066" }}>
              {DAY_NAMES[dayIdx]}
            </p>
            <p className="text-3xl font-black leading-none mt-1" style={{ color: "#1c0411" }}>
              {date.getDate()}
            </p>
            <p className="text-[10px] mt-1 font-semibold" style={{ color: today ? "#a8447a" : "#8a4066" }}>
              {date.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
            </p>
          </div>

          {total > 0 && (
            <div className="mt-3">
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: today ? "#f3b6d8" : "#f5d8ea" }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${(done / total) * 100}%`, background: "#e6e35a" }}
                />
              </div>
              <p className="text-[10px] mt-1 font-bold" style={{ color: today ? "#a8447a" : "#8a4066" }}>
                {done}/{total} done
              </p>
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(225,53,153,0.12)", margin: "0 16px" }} />

        {/* Task list */}
        <div className="flex-1 overflow-y-auto px-3 py-2.5 space-y-1.5 scrollbar-hide">
          {dayTasks.length === 0 && (
            <p className="text-xs text-center py-8 font-semibold" style={{ color: "#c9a0b8" }}>
              No tasks yet
            </p>
          )}

          {dayTasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              isDone={!!completed[occurrenceKey(task.id, dateISO)]}
              isPast={isPast}
              isFuture={isFuture}
              tint={today}
              onToggle={() => toggleTask(task.id, dateISO)}
              onRemove={() => removeTask(task.id)}
            />
          ))}
        </div>

        <div className="pb-3" />
      </div>
    );
  }

  const allDayTasks = DAY_NAMES.map((_, i) => getTasksForDay(i, toISODate(weekDates[i])));
  const totalAll = allDayTasks.reduce((s, t) => s + t.length, 0);
  const doneAll = allDayTasks.reduce(
    (s, t, i) => s + t.filter((task) => completed[occurrenceKey(task.id, toISODate(weekDates[i]))]).length,
    0,
  );

  return (
    <div className="min-h-screen" style={{ background: "#fdeff6", fontFamily: "'Nunito', sans-serif" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-10 backdrop-blur-md border-b"
        style={{ background: "rgba(253,239,246,0.85)", borderColor: "rgba(225,53,153,0.12)" }}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight" style={{ color: "#1c0411" }}>
              Weekly Planner
            </h1>
            <p className="text-xs font-semibold mt-0.5 hidden sm:block" style={{ color: "#8a4066" }}>
              {formatWeekRange(weekDates)}
            </p>
          </div>

          <button
            onClick={() => supabase.auth.signOut()}
            className="flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-bold transition-all duration-150 hover:brightness-95 active:brightness-90 cursor-pointer"
            style={{ color: "#8a4066", background: "rgba(225,53,153,0.08)" }}
            title={session.user.email ?? undefined}
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      {/* Desktop 7-col */}
      <main className="hidden lg:block max-w-[1400px] mx-auto px-4 sm:px-8 py-6">
        <div className="grid grid-cols-7 gap-3">
          {DAY_NAMES.map((_, i) => (
            <DayColumn key={i} dayIdx={i} />
          ))}
        </div>
      </main>

      {/* Tablet 4+3 */}
      <main className="hidden md:block lg:hidden max-w-3xl mx-auto px-4 py-6">
        <div className="grid grid-cols-4 gap-3 mb-3">
          {[0, 1, 2, 3].map((i) => (
            <DayColumn key={i} dayIdx={i} />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[4, 5, 6].map((i) => (
            <DayColumn key={i} dayIdx={i} />
          ))}
        </div>
      </main>

      {/* Mobile */}
      <div className="md:hidden">
        <div className="px-4 pt-4 pb-2 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 min-w-max">
            {DAY_NAMES.map((_, i) => {
              const date = weekDates[i];
              const today = isToday(date);
              const count = getTasksForDay(i, toISODate(date)).length;
              const active = activeMobile === i;
              return (
                <button
                  key={i}
                  onClick={() => setActiveMobile(i)}
                  className="flex flex-col items-center px-3 py-2 rounded-xl transition-all duration-150 hover:brightness-95 active:brightness-90 cursor-pointer"
                  style={{
                    background: active ? "#e13599" : today ? "#fff0f8" : "#fff5fb",
                    border: `2px solid ${active ? "#e13599" : today ? "#e13599" : "rgba(225,53,153,0.15)"}`,
                    color: active ? "#ffffff" : "#1c0411",
                  }}
                >
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-70">{SHORT_NAMES[i]}</span>
                  <span className="text-xl font-black leading-tight">{date.getDate()}</span>
                  {count > 0 && <span className="text-[9px] font-bold opacity-60">{count}</span>}
                </button>
              );
            })}
          </div>
        </div>
        <div className="px-4 pb-8">
          <DayColumn dayIdx={activeMobile} />
        </div>
      </div>

      {/* Summary bar */}
      {totalAll > 0 && (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 pb-8">
          <div
            className="flex items-center gap-4 rounded-2xl px-5 py-3 border w-fit"
            style={{ background: "#fff5fb", borderColor: "rgba(225,53,153,0.15)" }}
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#e6e35a" }}>
              <Check size={15} strokeWidth={3} color="#1c0411" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#8a4066" }}>
                Week progress
              </p>
              <p className="text-sm font-black" style={{ color: "#1c0411" }}>
                {doneAll} of {totalAll} tasks complete
              </p>
            </div>
            <div className="w-28 h-2 rounded-full overflow-hidden ml-2" style={{ background: "#f5d8ea" }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${(doneAll / totalAll) * 100}%`, background: "#e13599" }}
              />
            </div>
            <span className="text-xs font-black" style={{ color: "#e13599" }}>
              {Math.round((doneAll / totalAll) * 100)}%
            </span>
          </div>
        </div>
      )}

      {/* Bottom week navigation */}
      <div className="flex justify-center gap-3 pb-10">
        <button
          onClick={() => setWeekOffset((w) => w - 1)}
          className="flex items-center gap-2 h-11 px-5 rounded-2xl border transition-all duration-150 hover:scale-105 hover:brightness-95 active:scale-100 cursor-pointer"
          style={{ borderColor: "rgba(225,53,153,0.2)", background: "#fff5fb", color: "#1c0411" }}
        >
          <ChevronLeft size={16} />
          <span className="text-xs font-bold">Previous week</span>
        </button>
        {weekOffset !== 0 && (
          <button
            onClick={() => setWeekOffset(0)}
            className="flex items-center gap-2 h-11 px-5 rounded-2xl transition-all duration-150 hover:scale-105 hover:brightness-110 active:scale-100 cursor-pointer"
            style={{ background: "#e13599", color: "#ffffff" }}
          >
            <span className="text-xs font-bold">This week</span>
          </button>
        )}
        <button
          onClick={() => setWeekOffset((w) => w + 1)}
          className="flex items-center gap-2 h-11 px-5 rounded-2xl border transition-all duration-150 hover:scale-105 hover:brightness-95 active:scale-100 cursor-pointer"
          style={{ borderColor: "rgba(225,53,153,0.2)", background: "#fff5fb", color: "#1c0411" }}
        >
          <span className="text-xs font-bold">Next week</span>
          <ChevronRight size={16} />
        </button>
      </div>

      <style>{`
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
