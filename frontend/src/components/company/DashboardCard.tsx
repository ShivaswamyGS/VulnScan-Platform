interface DashboardCardProps {
  title: string;
  value: number | string;
}

export default function DashboardCard({
  title,
  value,
}: DashboardCardProps) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-gray-500">{title}</h2>

      <h1 className="text-4xl font-bold mt-3">
        {value}
      </h1>
    </div>
  );
}