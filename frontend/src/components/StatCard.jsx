function StatCard({ icon, label, value, accent }) {
  return (
    <div className={`stat-card ${accent || ""}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-info">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
      </div>
    </div>
  );
}

export default StatCard;
