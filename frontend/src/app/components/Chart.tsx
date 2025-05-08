'use client';

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
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

export default function Chart() {
  const [data, setData] = useState<{ symbol: string; value: number }[]>([]);

  useEffect(() => {
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
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-2">Portfolio Value by Stock</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="symbol" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
