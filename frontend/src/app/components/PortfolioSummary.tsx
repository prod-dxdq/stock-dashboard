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

export default function PortfolioSummary() {
  const gain = 1200; // Example gain value

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Portfolio Summary</h2>
      <p className="text-lg">
        Total Gain: <span className="text-green-700 font-bold">${gain}</span>
      </p>
    </div>
  );
}
