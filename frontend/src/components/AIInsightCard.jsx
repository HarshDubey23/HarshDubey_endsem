function AIInsightCard({ title, content, index }) {
  const icons = ["📋", "🚨", "🏛️", "💬", "✅"];
  const accents = ["accent-blue", "accent-red", "accent-purple", "accent-green", "accent-cyan"];

  return (
    <div className={`ai-insight-card glass-card ${accents[index % accents.length]}`}>
      <div className="ai-insight-header">
        <span className="ai-insight-icon">{icons[index % icons.length]}</span>
        <h3>{title}</h3>
      </div>
      <div className="ai-insight-body">
        {content.split("\n").map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
    </div>
  );
}

export default AIInsightCard;
