"use client";

import { useState } from "react";

export default function Home() {
  const [carModel, setCarModel] = useState("");
  const [budget, setBudget] = useState("");
  const [goal, setGoal] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult("");

    const res = await fetch("/api/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ carModel, budget, goal }),
    });

    const data = await res.json();
    setResult(data.result || data.error);
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold mb-6 text-blue-400">Build Buddy</h1>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-zinc-900 p-6 rounded-2xl shadow-xl"
      >
        <input
          className="w-full mb-3 p-3 rounded-md text-black"
          placeholder="Car model (e.g. 2012 Mazda3 2.5L)"
          value={carModel}
          onChange={(e) => setCarModel(e.target.value)}
        />
        <input
          className="w-full mb-3 p-3 rounded-md text-black"
          placeholder="Budget (e.g. $3000)"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
        />
        <input
          className="w-full mb-3 p-3 rounded-md text-black"
          placeholder="Goal (e.g. daily driver with power gains)"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
        />
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 py-3 rounded-md font-semibold"
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Build Plan"}
        </button>
      </form>

      {result && (
        <div className="mt-6 max-w-2xl bg-zinc-800 p-4 rounded-xl whitespace-pre-wrap">
          {result}
        </div>
      )}
    </main>
  );
}
