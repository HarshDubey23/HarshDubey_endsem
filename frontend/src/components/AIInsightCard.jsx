import MarkdownBody from "./MarkdownBody";

const META = {
  "Complaint Summary": { icon: "📋", accent: "accent-blue", desc: "Executive overview" },
  "Priority Detection": { icon: "🚨", accent: "accent-red", desc: "Urgency & risk analysis" },
  "Department Recommendation": { icon: "🏛️", accent: "accent-purple", desc: "Responsible authority" },
  "Suggested Response": { icon: "💬", accent: "accent-green", desc: "Citizen communication" },
  "Action Steps": { icon: "✅", accent: "accent-cyan", desc: "Field operations plan" },
};

function AIInsightCard({ title, content, index }) {
  const meta = META[title] || {
    icon: ["📋", "🚨", "🏛️", "💬", "✅"][index % 5],
    accent: ["accent-blue", "accent-red", "accent-purple", "accent-green", "accent-cyan"][index % 5],
    desc: "AI intelligence",
  };

  return (
    <article className={`ai-insight-card glass-card ${meta.accent} featured-card`}>
      <header className="ai-insight-header">
        <div className="ai-icon-wrap">{meta.icon}</div>
        <div>
          <h3>{title}</h3>
          <span className="ai-section-desc">{meta.desc}</span>
        </div>
      </header>
      <div className="ai-insight-body">
        <MarkdownBody content={content} />
      </div>
    </article>
  );
}

export default AIInsightCard;
