import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import type { Session } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { AuthGate } from "./components/AuthGate";
import { WeekGridPage } from "./pages/WeekGridPage";
import { DayPage } from "./pages/DayPage";
import { useTasks } from "./hooks/useTasks";
import { todayISO as getTodayISO } from "./lib/dateUtils";

export default function App() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const userId = session?.user.id;
  const { completed, getTasksForDay, toggleTask, removeTask, addTask } = useTasks(userId);
  const todayISO = getTodayISO();

  if (!isSupabaseConfigured) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "#fdeff6", fontFamily: "'Nunito', sans-serif" }}
      >
        <div
          className="w-full max-w-md rounded-2xl border p-6"
          style={{ background: "#fff5fb", borderColor: "rgba(225,53,153,0.15)" }}
        >
          <h1 className="text-lg font-black" style={{ color: "#1c0411" }}>
            Supabase not configured
          </h1>
          <p className="text-sm font-semibold mt-2" style={{ color: "#8a4066" }}>
            Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to{" "}
            <code>.env.local</code>, then restart the dev server.
          </p>
        </div>
      </div>
    );
  }

  if (session === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#fdeff6" }}>
        <p className="text-sm font-semibold" style={{ color: "#8a4066" }}>
          Loading…
        </p>
      </div>
    );
  }

  if (!session) {
    return <AuthGate />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <WeekGridPage
              session={session}
              completed={completed}
              getTasksForDay={getTasksForDay}
              toggleTask={toggleTask}
              removeTask={removeTask}
              todayISO={todayISO}
            />
          }
        />
        <Route
          path="/day/:date"
          element={
            <DayPage
              userId={userId}
              completed={completed}
              getTasksForDay={getTasksForDay}
              toggleTask={toggleTask}
              removeTask={removeTask}
              addTask={addTask}
              todayISO={todayISO}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
