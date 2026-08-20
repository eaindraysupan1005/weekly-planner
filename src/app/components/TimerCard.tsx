import { useEffect, useState } from "react";
import { Pause, Play, X } from "lucide-react";
import type { TimerDef } from "../hooks/useTimers";

function formatElapsed(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export function TimerCard({
  timer,
  onPause,
  onResume,
  onDelete,
}: {
  timer: TimerDef;
  onPause: () => void;
  onResume: () => void;
  onDelete: () => void;
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
          {timer.taskName}
        </p>
        <p
          className="text-2xl font-black tabular-nums mt-0.5"
          style={{ color: timer.isRunning ? "#e13599" : "#8a4066" }}
        >
          {formatElapsed(liveElapsed)}
        </p>
      </div>

      <button
        onClick={timer.isRunning ? onPause : onResume}
        className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-150"
        style={{ background: "#e13599", color: "#ffffff" }}
        aria-label={timer.isRunning ? "Pause" : "Resume"}
      >
        {timer.isRunning ? <Pause size={15} fill="#ffffff" /> : <Play size={15} fill="#ffffff" />}
      </button>

      <button
        onClick={onDelete}
        className="flex-shrink-0"
        style={{ color: "#c9a0b8" }}
        aria-label="Delete timer"
      >
        <X size={14} />
      </button>
    </div>
  );
}
