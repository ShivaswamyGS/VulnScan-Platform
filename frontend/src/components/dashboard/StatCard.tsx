interface StatCardProps {
  title: string;
  value: number;
  color: string;
}

export default function StatCard({
  title,
  value,
  color,
}: StatCardProps) {
  return (
    <div
      style={{
        background: "#1e293b",
        borderLeft: `6px solid ${color}`,
        borderRadius: "12px",
        padding: "20px",
        color: "white",
        boxShadow: "0 5px 15px rgba(0,0,0,.25)",
      }}
    >
      <h4>{title}</h4>

      <h1
        style={{
          fontSize: "32px",
          marginTop: "10px",
        }}
      >
        {value}
      </h1>
    </div>
  );
}