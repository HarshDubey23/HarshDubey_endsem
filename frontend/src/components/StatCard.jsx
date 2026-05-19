function StatCard({ icon, label, value, accent, trend }) {
  return (
    <div className={`stat-card pro-stat ${accent || ""}`}>
      <div className="stat-glow" aria-hidden="true" />
      <div className="stat-icon-ring">{icon}</div>
      <div className="stat-info">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
        {trend && <span className="stat-trend">{trend}</span>}
      </div>
    </div>
  );
}

export default StatCard;
