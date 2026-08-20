import { useEffect, useState } from "react";
import { Pause, Play } from "lucide-react";
import type { TaskTimerDef } from "../hooks/useTaskTimers";

function formatRemaining(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}

export function TaskTimerCard({
  timer,
  taskName,
  onPause,
  onResume,
}: {
  timer: TaskTimerDef;
  taskName: string;
  onPause: () => void;
  onResume: () => void;
}) {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!timer.isRunning) return;
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [timer.isRunning]);

  const liveElapsed =
    timer.elapsedSeconds +
    (timer.isRunning && timer.startedAt
      ? Math.max(0, Math.floor((Date.now() - new Date(timer.startedAt).getTime()) / 1000))
      : 0);
  const remaining = Math.max(0, timer.targetSeconds - liveElapsed);

  return (
    <div
      className="flex items-center gap-3 rounded-2xl border px-4 py-3"
      style={{ background: "#fff5fb", borderColor: "rgba(225,53,153,0.15)" }}
    >
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-bold break-words"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: "#1c0411" }}
        >
          {taskName}
        </p>
        <p
          className="text-2xl font-black tabular-nums mt-0.5"
          style={{ color: timer.isRunning ? "#e13599" : "#8a4066" }}
        >
          {formatRemaining(remaining)}
        </p>
      </div>

      <button
        onClick={timer.isRunning ? onPause : onResume}
        className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-150 hover:brightness-110 hover:scale-110 active:scale-100 cursor-pointer"
        style={{ background: "#e13599", color: "#ffffff" }}
        aria-label={timer.isRunning ? "Pause" : "Resume"}
      >
        {timer.isRunning ? <Pause size={15} fill="#ffffff" /> : <Play size={15} fill="#ffffff" />}
      </button>
    </div>
  );
}
