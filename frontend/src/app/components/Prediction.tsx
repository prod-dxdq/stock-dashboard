'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Prediction() {
  const [symbols, setSymbols] = useState<string[]>([]);
  const [selectedStock, setSelectedStock] = useState<string>("");
  const [result, setResult] = useState<{ prediction: string; confidence: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch symbols from the backend
  useEffect(() => {
    axios
      .get("http://localhost:8000/symbols")
      .then((res) => {
        setSymbols(res.data.symbols);
        setSelectedStock(res.data.symbols[0]); // Set the first symbol as the default
      })
      .catch((err) => console.error("Error fetching symbols:", err));
  }, []);

  // Fetch prediction for the selected stock
  useEffect(() => {
    if (selectedStock) {
      axios
        .get(`http://localhost:8000/predict/${selectedStock}`)
        .then((res) => {
          if (res.data.error) {
            setError(res.data.error);
            setResult(null);
          } else {
            setResult(res.data);
            setError(null);
          }
        })
        .catch((err) => console.error(err));
    }
  }, [selectedStock]);

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">🧠 ML Prediction</h2>

      <label className="block mb-4 text-gray-700 font-medium">
        Choose a stock:
        <select
          className="ml-2 bg-gray-100 text-gray-800 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedStock}
          onChange={(e) => setSelectedStock(e.target.value)}
        >
          {symbols.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      {error ? (
        <p className="text-red-600">{error}</p>
      ) : result ? (
        <div className="mt-4 text-lg text-gray-800">
          <p>
            <span className="font-medium">Symbol:</span> <strong>{selectedStock}</strong>
          </p>
          <p>
            <span className="font-medium">Prediction:</span> <strong>{result.prediction}</strong>
          </p>
          <p>
            <span className="font-medium">Confidence:</span>{" "}
            <strong>{result.confidence}%</strong>
          </p>
        </div>
      ) : (
        <p className="text-gray-600">Loading prediction...</p>
      )}
    </div>
  );
}
