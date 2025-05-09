'use client';

import { useEffect, useState } from "react";
import axios from "axios";

type Holding = {
  symbol: string;
  shares: number;
  buyPrice: number;
};

export default function HoldingsTable() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [prices, setPrices] = useState<{ [symbol: string]: number }>({});
  const [validSymbols, setValidSymbols] = useState<string[]>([]);

  // Fetch valid symbols from the backend
  useEffect(() => {
    axios
      .get("http://localhost:8000/symbols") // Fetch symbols from the backend
      .then((res) => {
        setValidSymbols(res.data.symbols); // Set valid symbols
        setHoldings(
          res.data.symbols.map((symbol: string) => ({
            symbol,
            shares: 0,
            buyPrice: 0,
          }))
        );
      })
      .catch((err) => console.error("Error fetching symbols:", err));
  }, []);

  // Fetch live prices for the holdings
  useEffect(() => {
    if (holdings.length > 0) {
      axios
        .post("http://localhost:8000/portfolio/prices", { holdings })
        .then((res) => {
          setPrices(res.data.prices);
        })
        .catch((err) => console.error("AxiosError:", err));
    }
  }, [holdings]);

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
