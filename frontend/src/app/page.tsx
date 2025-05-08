import PortfolioSummary from "./components/PortfolioSummary";
import HoldingsTable from "./components/HoldingsTable";
import Chart from "./components/Chart";

export default function Home() {
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
          <PortfolioSummary />
        </section>

        <section className="mb-8">
          <HoldingsTable />
        </section>

        <section>
          <Chart />
        </section>
      </div>
    </main>
  );
}
