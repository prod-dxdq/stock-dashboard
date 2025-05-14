'use client';

import { useState } from 'react';
import axios from 'axios';

type Result = {
  symbol: string;
  price: number;
  changePct: number;
};

export default function StockScreener() {
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(1000);
  const [changeMin, setChangeMin] = useState(-10);
  const [changeMax, setChangeMax] = useState(10);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchResults = () => {
    setLoading(true);
    axios
      .get("http://localhost:8000/screener/filter", {
        params: {
          price_min: priceMin,
          price_max: priceMax,
          change_min: changeMin,
          change_max: changeMax,
        },
      })
      .then((res) => setResults(res.data.results))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">📊 Stock Screener</h2>

      {/* Filters */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-gray-700 font-medium mb-1">Min Price</label>
          <input
            type="number"
            value={priceMin}
            onChange={(e) => setPriceMin(Number(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Max Price</label>
          <input
            type="number"
            value={priceMax}
            onChange={(e) => setPriceMax(Number(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Min % Change</label>
          <input
            type="number"
            value={changeMin}
            onChange={(e) => setChangeMin(Number(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Max % Change</label>
          <input
            type="number"
            value={changeMax}
            onChange={(e) => setChangeMax(Number(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
      </div>

      {/* Screen Button */}
      <button
        onClick={fetchResults}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        disabled={loading}
      >
        {loading ? "Screening..." : "Screen"}
      </button>

      {/* Results */}
      <div className="mt-4">
        {loading ? (
          <p className="text-gray-600">Loading results...</p>
        ) : results.length > 0 ? (
          <ul className="space-y-2">
            {results.map((result) => (
              <li
                key={result.symbol}
                className={`text-gray-800 p-2 rounded ${
                  result.changePct > 0 ? "bg-green-100" : "bg-red-100"
                }`}
              >
                <span className="font-semibold">{result.symbol}</span> — ${result.price.toFixed(2)} ({result.changePct}%)
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No results found.</p>
        )}
      </div>
    </div>
  );
}
