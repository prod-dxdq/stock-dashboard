'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

type Suggestion = {
  symbol: string;
  confidence: number;
};

export default function SidebarSuggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => {
    axios.get("http://localhost:8000/suggestions")
      .then(res => setSuggestions(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mt-6 w-full sm:w-80">
      <h2 className="text-xl font-bold text-gray-700 mb-4">🧠 What stocks should I buy?</h2>
      {suggestions.length === 0 ? (
        <p className="text-gray-600">Loading suggestions...</p>
      ) : (
        <ul className="space-y-2">
          {suggestions.map((s, index) => (
            <li key={s.symbol} className="text-gray-800">
              <span className="font-semibold">{index + 1}. {s.symbol}</span> — {s.confidence}% ↑
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
