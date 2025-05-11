'use client';

import { useEffect, useState } from "react";
import axios from "axios";

type Holding = {
  symbol: string;
  shares: number;
  buyPrice: number;
};

export default function HoldingsTable({ holdings }: { holdings: Holding[] }) {
  const [prices, setPrices] = useState<{ [symbol: string]: number }>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!holdings.length) return;

    setLoading(true); // Set loading to true while fetching data
    axios
      .post("http://localhost:8000/portfolio/prices", { holdings })
      .then((res) => {
        const prices = res.data.prices;
        setPrices(prices);
        setLoading(false); // Set loading to false once data is fetched
      })
      .catch((err) => {
        console.error("Error fetching prices:", err);
        setLoading(false); // Set loading to false even if there's an error
      });
  }, [holdings]);

  return (
    <div className="bg-white shadow-md rounded-lg p-6 text-black">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Holdings</h2>

      {/* Table */}
      <table className="min-w-full border-collapse border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-4 border border-gray-200 text-left text-gray-600 font-medium">Symbol</th>
            <th className="p-4 border border-gray-200 text-left text-gray-600 font-medium">Shares</th>
            <th className="p-4 border border-gray-200 text-left text-gray-600 font-medium">Buy Price</th>
            <th className="p-4 border border-gray-200 text-left text-gray-600 font-medium">Live Price</th>
            <th className="p-4 border border-gray-200 text-left text-gray-600 font-medium">Total Value</th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((h) => (
            <tr key={h.symbol} className="hover:bg-gray-50 transition-colors duration-200">
              <td className="p-4 border border-gray-200">{h.symbol}</td>
              <td className="p-4 border border-gray-200">{h.shares}</td>
              <td className="p-4 border border-gray-200">${h.buyPrice.toFixed(2)}</td>
              <td className="p-4 border border-gray-200">
                {loading
                  ? "Loading..."
                  : prices[h.symbol]
                  ? `$${prices[h.symbol].toFixed(2)}`
                  : "N/A"}
              </td>
              <td className="p-4 border border-gray-200">
                {loading
                  ? "Loading..."
                  : prices[h.symbol]
                  ? `$${(h.shares * prices[h.symbol]).toFixed(2)}`
                  : "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
