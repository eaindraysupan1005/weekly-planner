import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export interface TimerDef {
  id: string;
  taskName: string;
  date: string;
  elapsedSeconds: number;
  isRunning: boolean;
  startedAt: string | null;
}

export function useTimers(userId: string | undefined, dateISO: string) {
  const [timers, setTimers] = useState<TimerDef[]>([]);

  useEffect(() => {
    if (!userId) {
      setTimers([]);
      return;
    }

    (async () => {
      const { data } = await supabase
        .from("timers")
        .select("*")
        .eq("user_id", userId)
        .eq("date", dateISO)
        .order("created_at", { ascending: true });

      setTimers(
        (data ?? []).map((row) => ({
          id: row.id,
          taskName: row.task_name,
          date: row.date,
          elapsedSeconds: row.elapsed_seconds,
          isRunning: row.is_running,
          startedAt: row.started_at,
        })),
      );
    })();
  }, [userId, dateISO]);

  const startTimer = async (taskName: string): Promise<boolean> => {
    if (!userId) return false;
    const startedAt = new Date().toISOString();

    const { data, error } = await supabase
      .from("timers")
      .insert({
        user_id: userId,
        task_name: taskName,
        date: dateISO,
        elapsed_seconds: 0,
        is_running: true,
        started_at: startedAt,
      })
      .select()
      .single();

    if (error || !data) return false;

    setTimers((prev) => [
      ...prev,
      {
        id: data.id,
        taskName: data.task_name,
        date: data.date,
        elapsedSeconds: data.elapsed_seconds,
        isRunning: data.is_running,
        startedAt: data.started_at,
      },
    ]);
    return true;
  };

  const pauseTimer = async (id: string) => {
    const timer = timers.find((t) => t.id === id);
    if (!timer || !timer.isRunning || !timer.startedAt) return;

    const extra = Math.floor((Date.now() - new Date(timer.startedAt).getTime()) / 1000);
    const newElapsed = timer.elapsedSeconds + Math.max(0, extra);

    setTimers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, elapsedSeconds: newElapsed, isRunning: false, startedAt: null } : t)),
    );

    await supabase.from("timers").update({ elapsed_seconds: newElapsed, is_running: false, started_at: null }).eq("id", id);
  };

  const resumeTimer = async (id: string) => {
    const timer = timers.find((t) => t.id === id);
    if (!timer || timer.isRunning) return;

    const startedAt = new Date().toISOString();
    setTimers((prev) => prev.map((t) => (t.id === id ? { ...t, isRunning: true, startedAt } : t)));

    await supabase.from("timers").update({ is_running: true, started_at: startedAt }).eq("id", id);
  };

  const deleteTimer = async (id: string) => {
    setTimers((prev) => prev.filter((t) => t.id !== id));
    await supabase.from("timers").delete().eq("id", id);
  };

  const stopTimer = async (id: string): Promise<{ taskName: string; elapsedSeconds: number } | null> => {
    const timer = timers.find((t) => t.id === id);
    if (!timer) return null;

    const extra =
      timer.isRunning && timer.startedAt
        ? Math.max(0, Math.floor((Date.now() - new Date(timer.startedAt).getTime()) / 1000))
        : 0;
    const finalElapsed = timer.elapsedSeconds + extra;

    setTimers((prev) => prev.filter((t) => t.id !== id));
    await supabase.from("timers").delete().eq("id", id);

    return { taskName: timer.taskName, elapsedSeconds: finalElapsed };
  };

  return { timers, startTimer, pauseTimer, resumeTimer, deleteTimer, stopTimer };
}
