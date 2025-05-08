'use client';

import { useEffect, useState } from "react";
import axios from "axios";

type Gainer = {
  symbol: string;
  gain: number;
};

export default function TopGainers() {
  const [gainers, setGainers] = useState<Gainer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:8000/top-gainers")
      .then((res) => {
        setGainers(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching top gainers:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p className="text-center text-gray-600">Loading top gainers...</p>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Top Gainers</h2>
      <ul className="space-y-2">
        {gainers.map((gainer) => (
          <li
            key={gainer.symbol}
            className="flex justify-between items-center border-b border-gray-200 pb-2"
          >
            <span className="font-medium text-gray-800">{gainer.symbol}</span>
            <span className="text-green-700 font-bold">+{gainer.gain}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
