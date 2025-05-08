'use client';

import { useEffect, useState } from "react";
import axios from "axios";

type Holding = {
  symbol: string;
  shares: number;
  buyPrice: number;
};

const holdings: Holding[] = [
  { symbol: "AAPL", shares: 10, buyPrice: 145 },
  { symbol: "GOOGL", shares: 5, buyPrice: 110 },
  { symbol: "TSLA", shares: 8, buyPrice: 210 },
];

export default function HoldingsTable() {
  const [prices, setPrices] = useState<{ [symbol: string]: number }>({});

  useEffect(() => {
    axios
      .post("http://localhost:8000/portfolio/prices", { holdings })
      .then((res) => {
        setPrices(res.data.prices);
      })
      .catch((err) => console.error("AxiosError:", err));
  }, []);

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Holdings</h2>
      <table className="min-w-full border-collapse border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-4 border border-gray-200 text-left text-gray-600 font-medium">
              Symbol
            </th>
            <th className="p-4 border border-gray-200 text-left text-gray-600 font-medium">
              Shares
            </th>
            <th className="p-4 border border-gray-200 text-left text-gray-600 font-medium">
              Live Price
            </th>
            <th className="p-4 border border-gray-200 text-left text-gray-600 font-medium">
              Value
            </th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((h) => (
            <tr
              key={h.symbol}
              className="hover:bg-gray-50 transition-colors duration-200"
            >
              <td className="p-4 border border-gray-200">{h.symbol}</td>
              <td className="p-4 border border-gray-200">{h.shares}</td>
              <td className="p-4 border border-gray-200">
                {prices[h.symbol] ? `$${prices[h.symbol].toFixed(2)}` : "Loading..."}
              </td>
              <td className="p-4 border border-gray-200">
                {prices[h.symbol]
                  ? `$${(h.shares * prices[h.symbol]).toFixed(2)}`
                  : "Loading..."}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
