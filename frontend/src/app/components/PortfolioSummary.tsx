'use client';

import { useEffect, useState } from "react";
import axios from "axios";

type Holding = {
  symbol: string;
  shares: number;
  buyPrice: number;
};

export default function PortfolioSummary({ holdings }: { holdings: Holding[] }) {
  const [summary, setSummary] = useState({
    totalValue: 0,
    totalCost: 0,
    gainLoss: 0,
  });

  useEffect(() => {
    if (!holdings.length) return;

    axios
      .post("http://localhost:8000/portfolio/prices", { holdings })
      .then((res) => {
        const prices = res.data.prices;

        let value = 0;
        let cost = 0;

        for (const h of holdings) {
          const livePrice = prices[h.symbol];
          if (livePrice) {
            value += h.shares * livePrice;
            cost += h.shares * h.buyPrice;
          }
        }

        setSummary({
          totalValue: parseFloat(value.toFixed(2)),
          totalCost: parseFloat(cost.toFixed(2)),
          gainLoss: parseFloat((value - cost).toFixed(2)),
        });
      });
  }, [holdings]);

  return (
    <div className="bg-white shadow-md rounded-lg p-6 text-black">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Portfolio Summary</h2>
      <p className="text-lg">Total Value: ${summary.totalValue}</p>
      <p className="text-lg">Invested Cost: ${summary.totalCost}</p>
      <p className="text-lg">
        Gain/Loss:{" "}
        <span className={summary.gainLoss >= 0 ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
          ${summary.gainLoss}
        </span>
      </p>
    </div>
  );
}
