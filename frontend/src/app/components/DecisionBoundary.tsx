'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function DecisionBoundary() {
  const [symbols, setSymbols] = useState<string[]>([]);
  const [symbol, setSymbol] = useState("AAPL");

  // Fetch symbols from the backend
  useEffect(() => {
    axios
      .get("http://localhost:8000/symbols")
      .then((res) => {
        setSymbols(res.data.symbols);
        setSymbol(res.data.symbols[0]); // Set the first symbol as the default
      })
      .catch((err) => console.error("Error fetching symbols:", err));
  }, []);

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mt-8">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">📉 ML Decision Boundary</h2>

      <label className="block mb-4 text-gray-700 font-medium">
        Choose a stock:
        <select
          className="ml-2 bg-gray-100 text-gray-800 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
        >
          {symbols.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      <img
        src={`http://localhost:8000/plot/decision-boundary/${symbol}`}
        alt={`Decision Boundary for ${symbol}`}
        className="w-full border border-gray-300 rounded"
      />

      {/* Legend Explanation */}
      <div className="mt-4 text-gray-600">
        <p><span className="font-medium">Blue:</span> Indicates areas where the model predicts the stock price will go down.</p>
        <p><span className="font-medium">Red:</span> Indicates areas where the model predicts the stock price will go up.</p>
      </div>
    </div>
  );
}
