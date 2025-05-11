'use client';

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import axios from "axios";

type Holding = {
  symbol: string;
  shares: number;
  buyPrice: number;
};

export default function Chart({ holdings, setHoldings }: { holdings: Holding[]; setHoldings: (holdings: Holding[]) => void }) {
  const [data, setData] = useState<{ symbol: string; value: number }[]>([]);
  const [newHolding, setNewHolding] = useState<Holding>({
    symbol: "",
    shares: 0,
    buyPrice: 0,
  });

  useEffect(() => {
    if (holdings.length > 0) {
      axios
        .post("http://localhost:8000/portfolio/prices", { holdings })
        .then((res) => {
          const prices = res.data.prices;
          const chartData = holdings.map((h) => ({
            symbol: h.symbol,
            value: h.shares * prices[h.symbol],
          }));
          setData(chartData);
        })
        .catch((err) => console.error(err));
    } else {
      setData([]);
    }
  }, [holdings]);

  const handleAddHolding = () => {
    if (newHolding.symbol && newHolding.shares > 0 && newHolding.buyPrice > 0) {
      setHoldings([...holdings, newHolding]);
      setNewHolding({ symbol: "", shares: 0, buyPrice: 0 }); // Reset the form
    }
  };

  const handleRemoveHolding = (symbol: string) => {
    setHoldings(holdings.filter((h) => h.symbol !== symbol));
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">📊 Portfolio Value by Stock</h2>

      {/* Add Holding Form */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-2">Add a Holding</h3>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Symbol</label>
            <input
              type="text"
              placeholder="Symbol (e.g., AAPL)"
              className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newHolding.symbol}
              onChange={(e) => setNewHolding({ ...newHolding, symbol: e.target.value.toUpperCase() })}
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Shares</label>
            <input
              type="number"
              placeholder="Shares"
              className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newHolding.shares}
              onChange={(e) => setNewHolding({ ...newHolding, shares: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Buy Price</label>
            <input
              type="number"
              placeholder="Buy Price"
              className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newHolding.buyPrice}
              onChange={(e) => setNewHolding({ ...newHolding, buyPrice: Number(e.target.value) })}
            />
          </div>
          <button
            onClick={handleAddHolding}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition self-end"
          >
            Add
          </button>
        </div>
      </div>

      {/* Holdings List with Checkboxes */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-2">Manage Holdings</h3>
        <ul className="space-y-2">
          {holdings.map((h) => (
            <li key={h.symbol} className="flex items-center gap-4">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                onChange={(e) => {
                  if (!e.target.checked) handleRemoveHolding(h.symbol);
                }}
                checked
              />
              <span className="text-gray-700">{h.symbol}</span>
              <span className="text-gray-500">({h.shares} shares @ ${h.buyPrice})</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="symbol" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#4A90E2" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
