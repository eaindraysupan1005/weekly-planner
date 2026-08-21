import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { toISODate } from "../lib/dateUtils";

export interface TaskDef {
  id: string;
  text: string;
  duration: number; // hours
  repeat: "once" | "weekly" | "daily";
  dayIdx: number;
  date?: string; // ISO date, only set when repeat === "once"
  createdDate: string; // ISO date the task was created, used to keep weekly/daily tasks off past days
}

export function occurrenceKey(taskId: string, dateISO: string) {
  return `${taskId}::${dateISO}`;
}

export function useTasks(userId: string | undefined) {
  const [tasks, setTasks] = useState<TaskDef[]>([]);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!userId) {
      setTasks([]);
      setCompleted({});
      return;
    }

    (async () => {
      const [{ data: taskRows }, { data: completionRows }] = await Promise.all([
        supabase.from("tasks").select("*").eq("user_id", userId),
        supabase.from("task_completions").select("*").eq("user_id", userId).eq("completed", true),
      ]);

      setTasks(
        (taskRows ?? []).map((row) => ({
          id: row.id,
          text: row.text,
          duration: row.duration,
          repeat: row.repeat,
          dayIdx: row.day_idx,
          date: row.date ?? undefined,
          createdDate: toISODate(new Date(row.created_at)),
        })),
      );

      const completedMap: Record<string, boolean> = {};
      for (const row of completionRows ?? []) {
        completedMap[occurrenceKey(row.task_id, row.occurrence_date)] = true;
      }
      setCompleted(completedMap);
    })();
  }, [userId]);

  const getTasksForDay = (dayIdx: number, dateISO: string): TaskDef[] =>
    tasks.filter((t) => {
      if (t.repeat === "daily") return dateISO >= t.createdDate;
      if (t.repeat === "weekly") return t.dayIdx === dayIdx && dateISO >= t.createdDate;
      return t.dayIdx === dayIdx && t.date === dateISO;
    });

  const toggleTask = async (taskId: string, dateISO: string) => {
    if (!userId) return;
    const key = occurrenceKey(taskId, dateISO);
    const nowCompleted = !completed[key];
    setCompleted((prev) => ({ ...prev, [key]: nowCompleted }));

    if (nowCompleted) {
      await supabase.from("task_completions").upsert({
        task_id: taskId,
        user_id: userId,
        occurrence_date: dateISO,
        completed: true,
      });
    } else {
      await supabase
        .from("task_completions")
        .delete()
        .eq("task_id", taskId)
        .eq("occurrence_date", dateISO);
    }
  };

  const removeTask = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    await supabase.from("tasks").delete().eq("id", taskId);
  };

  const addTask = async (params: {
    text: string;
    duration: number;
    repeat: "once" | "weekly" | "daily";
    dayIdx: number;
    dateISO: string;
  }): Promise<string | null> => {
    if (!userId) return null;
    const { text, duration, repeat, dayIdx, dateISO } = params;

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        user_id: userId,
        text,
        duration,
        repeat,
        day_idx: dayIdx,
        date: repeat === "once" ? dateISO : null,
      })
      .select()
      .single();

    if (error || !data) return null;

    setTasks((prev) => [
      ...prev,
      {
        id: data.id,
        text: data.text,
        duration: data.duration,
        repeat: data.repeat,
        dayIdx: data.day_idx,
        date: data.date ?? undefined,
        createdDate: toISODate(new Date(data.created_at)),
      },
    ]);
    return data.id;
  };

  return { tasks, completed, getTasksForDay, toggleTask, removeTask, addTask };
}
