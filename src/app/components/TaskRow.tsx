import { X, Check, Timer } from "lucide-react";
import type { TaskDef } from "../hooks/useTasks";

function formatDuration(hours: number): string {
  const totalMinutes = Math.round(hours * 60);
  if (totalMinutes < 60) return `${totalMinutes}min`;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return m === 0 ? `${h}hr` : `${h}h ${m}min`;
}

export function TaskRow({
  task,
  isDone,
  isPast,
  isFuture,
  tint,
  onToggle,
  onRemove,
  onStartTimer,
  hasActiveTimer,
}: {
  task: TaskDef;
  isDone: boolean;
  isPast: boolean;
  isFuture?: boolean;
  tint: boolean;
  onToggle: () => void;
  onRemove: () => void;
  onStartTimer?: () => void;
  hasActiveTimer?: boolean;
}) {
  return (
    <div
      className="group flex items-start gap-2 px-2.5 py-2 rounded-xl transition-all duration-150 hover:brightness-95"
      style={{
        background: isDone ? "rgba(245,216,234,0.4)" : tint ? "rgba(255,255,255,0.55)" : "rgba(255,245,251,0.8)",
      }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (isFuture) return;
          onToggle();
        }}
        disabled={isFuture}
        title={isFuture ? "Can't mark future tasks as complete" : undefined}
        className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-150 hover:scale-125"
        style={{
          background: isDone ? "#e6e35a" : "transparent",
          borderColor: isDone ? "#1c0411" : "#d490b8",
          cursor: isFuture ? "not-allowed" : "pointer",
          opacity: isFuture ? 0.5 : 1,
        }}
      >
        {isDone && <Check size={9} strokeWidth={3.5} color="#1c0411" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center flex-wrap gap-2">
          <span
            className="text-sm leading-relaxed break-words font-bold"
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              color: isDone ? "#c9a0b8" : "#1c0411",
              textDecoration: isDone ? "line-through" : "none",
            }}
          >
            {task.text}
          </span>
          <span
            className="text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0"
            style={{ background: "rgba(225,53,153,0.1)", color: "#8a4066" }}
          >
            {formatDuration(task.duration)}
          </span>
        </div>

        {onStartTimer && !isDone && !hasActiveTimer && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStartTimer();
            }}
            className="mt-2 flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-xs font-bold transition-all duration-150 hover:brightness-110 hover:scale-[1.01] active:scale-100 cursor-pointer"
            style={{ background: "#e13599", color: "#ffffff" }}
          >
            <Timer size={13} />
            Start Task
          </button>
        )}
      </div>

      {!isPast && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="flex-shrink-0 mt-0.5 transition-all duration-150 hover:scale-125 text-[#c9a0b8] hover:text-[#e13599] cursor-pointer"
        >
          <X size={11} />
        </button>
      )}
    </div>
  );
}
