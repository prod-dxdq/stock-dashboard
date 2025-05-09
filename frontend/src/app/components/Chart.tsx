'use client';

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import axios from "axios";

type Holding = {
  symbol: string;
  shares: number;
  buyPrice: number;
};

export default function Chart() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);
  const [data, setData] = useState<{ symbol: string; value: number }[]>([]);
  const [newHolding, setNewHolding] = useState<Holding>({
    symbol: "",
    shares: 0,
    buyPrice: 0,
  });

  const handleCheckboxChange = (symbol: string) => {
    setSelectedSymbols((prev) =>
      prev.includes(symbol)
        ? prev.filter((s) => s !== symbol)
        : [...prev, symbol]
    );
  };

  const handleAddHolding = () => {
    if (newHolding.symbol && newHolding.shares > 0 && newHolding.buyPrice > 0) {
      setHoldings((prev) => [...prev, newHolding]);
      setSelectedSymbols((prev) => [...prev, newHolding.symbol]); // Automatically select the new holding
      setNewHolding({ symbol: "", shares: 0, buyPrice: 0 }); // Reset the form
    }
  };

  useEffect(() => {
    const selectedHoldings = holdings.filter((h) => selectedSymbols.includes(h.symbol));

    if (selectedHoldings.length > 0) {
      axios
        .post("http://localhost:8000/portfolio/prices", { holdings: selectedHoldings })
        .then((res) => {
          const prices = res.data.prices;
          const chartData = selectedHoldings.map((h) => ({
            symbol: h.symbol,
            value: h.shares * prices[h.symbol],
          }));
          setData(chartData);
        })
        .catch((err) => console.error(err));
    } else {
      setData([]); // Clear the chart if no holdings are selected
    }
  }, [selectedSymbols, holdings]);

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">📊 Portfolio Value by Stock</h2>

      {/* Form to Add Holdings */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-2">Add a Holding</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col">
            <label htmlFor="symbol" className="text-gray-700 font-medium mb-1">
              Symbol
            </label>
            <input
              id="symbol"
              type="text"
              placeholder="Symbol (e.g., AAPL)"
              className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newHolding.symbol}
              onChange={(e) =>
                setNewHolding((prev) => ({ ...prev, symbol: e.target.value.toUpperCase() }))
              }
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="shares" className="text-gray-700 font-medium mb-1">
              Shares
            </label>
            <input
              id="shares"
              type="number"
              placeholder="Shares"
              className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newHolding.shares}
              onChange={(e) =>
                setNewHolding((prev) => ({ ...prev, shares: Number(e.target.value) }))
              }
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="buyPrice" className="text-gray-700 font-medium mb-1">
              Buy Price
            </label>
            <input
              id="buyPrice"
              type="number"
              placeholder="Buy Price"
              className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newHolding.buyPrice}
              onChange={(e) =>
                setNewHolding((prev) => ({ ...prev, buyPrice: Number(e.target.value) }))
              }
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

      {/* Checkboxes */}
      <div className="flex flex-wrap gap-4 mb-4">
        {holdings.map((h) => (
          <label key={h.symbol} className="flex items-center space-x-2 text-gray-700">
            <input
              type="checkbox"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              checked={selectedSymbols.includes(h.symbol)}
              onChange={() => handleCheckboxChange(h.symbol)}
            />
            <span>{h.symbol}</span>
          </label>
        ))}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="symbol" />
          <YAxis />
          <Tooltip contentStyle={{ backgroundColor: "#fff", color: "#000" }} />
          <Bar dataKey="value" fill="#4A90E2" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
