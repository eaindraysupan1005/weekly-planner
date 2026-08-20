import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Plus, Timer } from "lucide-react";
import { DAY_NAMES, dayIdxOf, fromISODate, isPastDate, isToday } from "../lib/dateUtils";
import { occurrenceKey, type TaskDef } from "../hooks/useTasks";
import { useTimers } from "../hooks/useTimers";
import { TaskRow } from "../components/TaskRow";
import { TaskModal } from "../components/TaskModal";
import { TimerStartModal } from "../components/TimerStartModal";
import { TimerCard } from "../components/TimerCard";

export function DayPage({
  userId,
  completed,
  getTasksForDay,
  toggleTask,
  removeTask,
  addTask,
  todayISO,
}: {
  userId: string | undefined;
  completed: Record<string, boolean>;
  getTasksForDay: (dayIdx: number, dateISO: string) => TaskDef[];
  toggleTask: (taskId: string, dateISO: string) => void;
  removeTask: (taskId: string) => void;
  addTask: (params: { text: string; duration: number; repeat: "once" | "weekly"; dayIdx: number; dateISO: string }) => Promise<boolean>;
  todayISO: string;
}) {
  const navigate = useNavigate();
  const { date: dateISO } = useParams<{ date: string }>();
  const [modalOpen, setModalOpen] = useState(false);
  const [timerModalOpen, setTimerModalOpen] = useState(false);

  const date = dateISO ? fromISODate(dateISO) : new Date();
  const dayIdx = dayIdxOf(date);
  const today = isToday(date);
  const isPast = dateISO ? isPastDate(dateISO, todayISO) : false;
  const dayTasks = dateISO ? getTasksForDay(dayIdx, dateISO) : [];
  const done = dayTasks.filter((t) => dateISO && completed[occurrenceKey(t.id, dateISO)]).length;
  const total = dayTasks.length;

  const { timers, startTimer, pauseTimer, resumeTimer, deleteTimer } = useTimers(
    today ? userId : undefined,
    dateISO ?? todayISO,
  );

  if (!dateISO) return null;

  return (
    <div className="min-h-screen" style={{ background: "#fdeff6", fontFamily: "'Nunito', sans-serif" }}>
      <header
        className="sticky top-0 z-10 backdrop-blur-md border-b"
        style={{ background: "rgba(253,239,246,0.85)", borderColor: "rgba(225,53,153,0.12)" }}
      >
        <div className="max-w-2xl mx-auto px-4 sm:px-8 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-bold transition-all duration-150"
            style={{ color: "#8a4066", background: "rgba(225,53,153,0.08)" }}
          >
            <ArrowLeft size={14} />
            Week
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-8 py-6 flex flex-col gap-6">
        {/* Day header card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: today ? "#fbd7e9" : "#fff5fb", border: today ? "none" : "1px solid rgba(225,53,153,0.15)" }}
        >
          <div className={["px-5 pt-5 pb-4", today ? "bg-[#f7c0dd]" : ""].join(" ")}>
            <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: today ? "#a8447a" : "#8a4066" }}>
              {DAY_NAMES[dayIdx]}
            </p>
            <p className="text-4xl font-black leading-none mt-1" style={{ color: "#1c0411" }}>
              {date.getDate()}
            </p>
            <p className="text-xs mt-1 font-semibold" style={{ color: today ? "#a8447a" : "#8a4066" }}>
              {date.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>

            {total > 0 && (
              <div className="mt-4">
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: today ? "#f3b6d8" : "#f5d8ea" }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${(done / total) * 100}%`, background: "#e6e35a" }}
                  />
                </div>
                <p className="text-[11px] mt-1.5 font-bold" style={{ color: today ? "#a8447a" : "#8a4066" }}>
                  {done}/{total} done
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setModalOpen(true)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold transition-all duration-150"
            style={{ background: "rgba(225,53,153,0.1)", color: "#1c0411" }}
          >
            <Plus size={15} strokeWidth={2.5} />
            {isPast ? "Log what happened" : "Add task"}
          </button>

          {today && (
            <button
              onClick={() => setTimerModalOpen(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold transition-all duration-150"
              style={{ background: "#e13599", color: "#ffffff" }}
            >
              <Timer size={15} strokeWidth={2.5} />
              Start task with timer
            </button>
          )}
        </div>

        {/* Task list */}
        <div className="flex flex-col gap-2">
          {dayTasks.length === 0 && (
            <p className="text-sm text-center py-10 font-semibold" style={{ color: "#c9a0b8" }}>
              No tasks yet
            </p>
          )}
          {dayTasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              isDone={!!completed[occurrenceKey(task.id, dateISO)]}
              isPast={isPast}
              tint={today}
              onToggle={() => toggleTask(task.id, dateISO)}
              onRemove={() => removeTask(task.id)}
            />
          ))}
        </div>

        {/* Timers */}
        {today && timers.length > 0 && (
          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-black flex items-center gap-1.5" style={{ color: "#1c0411" }}>
              <Timer size={14} />
              Running timers
            </h2>
            {timers.map((timer) => (
              <TimerCard
                key={timer.id}
                timer={timer}
                onPause={() => pauseTimer(timer.id)}
                onResume={() => resumeTimer(timer.id)}
                onDelete={() => deleteTimer(timer.id)}
              />
            ))}
          </div>
        )}
      </main>

      <TaskModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        dayName={DAY_NAMES[dayIdx]}
        isPast={isPast}
        onSubmit={async ({ text, duration, repeat }) => {
          const ok = await addTask({ text, duration, repeat, dayIdx, dateISO });
          if (ok) setModalOpen(false);
        }}
      />

      {today && (
        <TimerStartModal
          open={timerModalOpen}
          onOpenChange={setTimerModalOpen}
          onStart={async (taskName) => {
            const ok = await startTimer(taskName);
            if (ok) setTimerModalOpen(false);
          }}
        />
      )}

      <style>{`
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
