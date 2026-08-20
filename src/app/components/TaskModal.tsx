import { useEffect, useState } from "react";
import { Plus, Minus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Button } from "./ui/button";

const MIN_DURATION = 1;
const MAX_DURATION = 12;

export function TaskModal({
  open,
  onOpenChange,
  dayName,
  isPast,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dayName: string;
  isPast: boolean;
  onSubmit: (params: { text: string; duration: number; repeat: "once" | "weekly" | "daily" }) => void;
}) {
  const [text, setText] = useState("");
  const [repeat, setRepeat] = useState<"once" | "weekly" | "daily">("weekly");
  const [duration, setDuration] = useState(1);

  useEffect(() => {
    if (open) {
      setText("");
      setRepeat("weekly");
      setDuration(1);
    }
  }, [open]);

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSubmit({ text: trimmed, duration, repeat: isPast ? "once" : repeat });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isPast ? "Log what happened" : "Add task"} — {dayName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          {isPast && (
            <p className="text-xs font-semibold" style={{ color: "#8a4066" }}>
              This day has already passed, so the plan is locked. You can still log what you
              actually did — it won't repeat.
            </p>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="task-text">Task</Label>
            <Input
              id="task-text"
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
              }}
              placeholder="e.g. Team standup"
            />
          </div>

          {!isPast && (
            <div className="flex flex-col gap-2">
              <Label>Repeat</Label>
              <RadioGroup value={repeat} onValueChange={(v) => setRepeat(v as "once" | "weekly" | "daily")}>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="once" id="repeat-once" />
                  <Label htmlFor="repeat-once" className="font-normal">
                    This day only
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="weekly" id="repeat-weekly" />
                  <Label htmlFor="repeat-weekly" className="font-normal">
                    Repeats every {dayName}
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="daily" id="repeat-daily" />
                  <Label htmlFor="repeat-daily" className="font-normal">
                    Repeat daily
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label>Duration</Label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9 shrink-0"
                onClick={() => setDuration((d) => Math.max(MIN_DURATION, d - 1))}
                disabled={duration <= MIN_DURATION}
              >
                <Minus size={14} />
              </Button>
              <div className="flex-1 text-center text-sm font-semibold tabular-nums">
                {duration} {duration === 1 ? "hour" : "hours"}
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9 shrink-0"
                onClick={() => setDuration((d) => Math.min(MAX_DURATION, d + 1))}
                disabled={duration >= MAX_DURATION}
              >
                <Plus size={14} />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!text.trim()}>
            {isPast ? "Log task" : "Add task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
