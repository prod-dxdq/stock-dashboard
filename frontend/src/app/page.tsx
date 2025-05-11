"use client";

import { useState } from "react";
import PortfolioSummary from "./components/PortfolioSummary";
import HoldingsTable from "./components/HoldingsTable";
import Chart from "./components/Chart";
import Prediction from "./components/Prediction";
import DecisionBoundary from "./components/DecisionBoundary";

type Holding = {
  symbol: string;
  shares: number;
  buyPrice: number;
};

export default function Home() {
  const [holdings, setHoldings] = useState<Holding[]>([]); // State for holdings

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white text-gray-800 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-blue-600 mb-2">
            📊 My Stock Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Track your portfolio, analyze your holdings, and stay informed.
          </p>
        </header>

        <section className="mb-8">
          <PortfolioSummary holdings={holdings} />
        </section>

        <section className="mb-8">
          <Prediction />
        </section>

        <section className="mb-8">
          <HoldingsTable holdings={holdings} setHoldings={setHoldings} />
        </section>

        <section className="mb-8">
          <Chart holdings={holdings} setHoldings={setHoldings} />
        </section>

        <section className="mb-8">
          <DecisionBoundary />
        </section>

      </div>
    </main>
  );
}
