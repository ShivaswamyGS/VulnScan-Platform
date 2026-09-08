import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Pie } from "react-chartjs-2";

import type { DashboardStats } from "../../api/dashboard";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

interface DashboardChartsProps {
  stats?: DashboardStats | null;
}

export default function DashboardCharts({
  stats,
}: DashboardChartsProps) {
  /*
   * Safe defaults.
   * This prevents the dashboard from crashing while
   * the API data is loading or if stats is temporarily undefined.
   */
  const critical = stats?.critical_reports ?? 0;
  const high = stats?.high_reports ?? 0;
  const medium = stats?.medium_reports ?? 0;
  const low = stats?.low_reports ?? 0;

  const total =
    critical +
    high +
    medium +
    low;

  const data = {
    labels: [
      "Critical",
      "High",
      "Medium",
      "Low",
    ],

    datasets: [
      {
        data: [
          critical,
          high,
          medium,
          low,
        ],

        backgroundColor: [
          "#DC2626",
          "#EA580C",
          "#D97706",
          "#0891B2",
        ],

        borderColor: "#FFFFFF",
        borderWidth: 2,

        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,

    maintainAspectRatio: false,

    plugins: {
      legend: {
        position: "bottom" as const,

        labels: {
          usePointStyle: true,

          pointStyle: "circle",

          padding: 18,

          font: {
            size: 11,
          },
        },
      },

      tooltip: {
        callbacks: {
          label: function (
            context: {
              label?: string;
              parsed: number;
            }
          ) {
            const value = context.parsed;

            const percentage =
              total > 0
                ? Math.round(
                    (value / total) * 100
                  )
                : 0;

            return ` ${context.label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="w-full">
      <div className="relative mx-auto h-[300px] w-full max-w-[420px]">
        {total === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <span className="text-lg text-slate-400">
                —
              </span>
            </div>

            <p className="mt-3 text-sm font-medium text-slate-600">
              No vulnerability data
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Severity distribution will appear here.
            </p>
          </div>
        ) : (
          <Pie
            data={data}
            options={options}
          />
        )}
      </div>

      <div className="mt-3 text-center">
        <span className="text-[10px] uppercase tracking-[0.12em] text-slate-400">
          {total} total findings
        </span>
      </div>
    </div>
  );
}