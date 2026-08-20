import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export interface TaskTimerDef {
  id: string;
  taskId: string;
  date: string;
  targetSeconds: number;
  elapsedSeconds: number;
  isRunning: boolean;
  startedAt: string | null;
}

export function useTaskTimers(
  userId: string | undefined,
  dateISO: string,
  onComplete: (taskId: string) => void,
) {
  const [taskTimers, setTaskTimers] = useState<TaskTimerDef[]>([]);

  useEffect(() => {
    if (!userId) {
      setTaskTimers([]);
      return;
    }

    (async () => {
      const { data } = await supabase
        .from("task_timers")
        .select("*")
        .eq("user_id", userId)
        .eq("date", dateISO)
        .order("created_at", { ascending: true });

      setTaskTimers(
        (data ?? []).map((row) => ({
          id: row.id,
          taskId: row.task_id,
          date: row.date,
          targetSeconds: row.target_seconds,
          elapsedSeconds: row.elapsed_seconds,
          isRunning: row.is_running,
          startedAt: row.started_at,
        })),
      );
    })();
  }, [userId, dateISO]);

  const startTaskTimer = async (taskId: string, targetSeconds: number): Promise<boolean> => {
    if (!userId) return false;
    const startedAt = new Date().toISOString();

    const { data, error } = await supabase
      .from("task_timers")
      .insert({
        user_id: userId,
        task_id: taskId,
        date: dateISO,
        target_seconds: targetSeconds,
        elapsed_seconds: 0,
        is_running: true,
        started_at: startedAt,
      })
      .select()
      .single();

    if (error || !data) {
      console.error("Failed to start task timer:", error);
      return false;
    }

    setTaskTimers((prev) => [
      ...prev,
      {
        id: data.id,
        taskId: data.task_id,
        date: data.date,
        targetSeconds: data.target_seconds,
        elapsedSeconds: data.elapsed_seconds,
        isRunning: data.is_running,
        startedAt: data.started_at,
      },
    ]);
    return true;
  };

  const pauseTaskTimer = async (id: string) => {
    const timer = taskTimers.find((t) => t.id === id);
    if (!timer || !timer.isRunning || !timer.startedAt) return;

    const extra = Math.floor((Date.now() - new Date(timer.startedAt).getTime()) / 1000);
    const newElapsed = Math.min(timer.targetSeconds, timer.elapsedSeconds + Math.max(0, extra));

    setTaskTimers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, elapsedSeconds: newElapsed, isRunning: false, startedAt: null } : t)),
    );

    await supabase
      .from("task_timers")
      .update({ elapsed_seconds: newElapsed, is_running: false, started_at: null })
      .eq("id", id);
  };

  const resumeTaskTimer = async (id: string) => {
    const timer = taskTimers.find((t) => t.id === id);
    if (!timer || timer.isRunning) return;

    const startedAt = new Date().toISOString();
    setTaskTimers((prev) => prev.map((t) => (t.id === id ? { ...t, isRunning: true, startedAt } : t)));

    await supabase.from("task_timers").update({ is_running: true, started_at: startedAt }).eq("id", id);
  };

  const removeTaskTimerForTask = async (taskId: string) => {
    const timer = taskTimers.find((t) => t.taskId === taskId);
    if (!timer) return;

    setTaskTimers((prev) => prev.filter((t) => t.id !== timer.id));
    await supabase.from("task_timers").delete().eq("id", timer.id);
  };

  // Ticks once a second to detect when a running countdown has reached zero,
  // so the linked task gets auto-completed even if no card re-renders it.
  useEffect(() => {
    const interval = setInterval(() => {
      taskTimers.forEach((t) => {
        if (!t.isRunning || !t.startedAt) return;
        const liveElapsed = t.elapsedSeconds + Math.floor((Date.now() - new Date(t.startedAt).getTime()) / 1000);
        if (liveElapsed >= t.targetSeconds) {
          setTaskTimers((prev) => prev.filter((x) => x.id !== t.id));
          supabase.from("task_timers").delete().eq("id", t.id);
          onComplete(t.taskId);
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [taskTimers, onComplete]);

  return { taskTimers, startTaskTimer, pauseTaskTimer, resumeTaskTimer, removeTaskTimerForTask };
}
