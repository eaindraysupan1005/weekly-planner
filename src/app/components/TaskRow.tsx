import { X, Check } from "lucide-react";
import type { TaskDef } from "../hooks/useTasks";

export function TaskRow({
  task,
  isDone,
  isPast,
  tint,
  onToggle,
  onRemove,
}: {
  task: TaskDef;
  isDone: boolean;
  isPast: boolean;
  tint: boolean;
  onToggle: () => void;
  onRemove: () => void;
}) {
  return (
    <div
      className="group flex items-start gap-2 px-2.5 py-2 rounded-xl transition-all duration-150"
      style={{
        background: isDone ? "rgba(245,216,234,0.4)" : tint ? "rgba(255,255,255,0.55)" : "rgba(255,245,251,0.8)",
      }}
    >
      <button
        onClick={onToggle}
        className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-150"
        style={{
          background: isDone ? "#e6e35a" : "transparent",
          borderColor: isDone ? "#1c0411" : "#d490b8",
        }}
      >
        {isDone && <Check size={9} strokeWidth={3.5} color="#1c0411" />}
      </button>

      <div className="flex-1 min-w-0">
        <span
          className="block text-sm leading-relaxed break-words font-bold"
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            color: isDone ? "#c9a0b8" : "#1c0411",
            textDecoration: isDone ? "line-through" : "none",
          }}
        >
          {task.text}
        </span>
        <div className="flex items-center gap-2 mt-1">
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
            style={{ background: "rgba(225,53,153,0.1)", color: "#8a4066" }}
          >
            {task.duration}hr
          </span>
        </div>
      </div>

      {!isPast && (
        <button
          onClick={onRemove}
          className="flex-shrink-0 mt-0.5 transition-opacity duration-150"
          style={{ color: "#c9a0b8" }}
        >
          <X size={11} />
        </button>
      )}
    </div>
  );
}
