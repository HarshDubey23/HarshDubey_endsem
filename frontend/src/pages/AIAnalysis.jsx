import { useState } from "react";
import { analyzeAllComplaints } from "../api";
import { parseAISections } from "../utils/parseAI";
import AIInsightCard from "../components/AIInsightCard";
import StatCard from "../components/StatCard";
import LoadingSpinner from "../components/LoadingSpinner";

function AIAnalysis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const { data } = await analyzeAllComplaints();
      setResult(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "AI analysis failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const analytics = result?.computedAnalytics || {};
  const sections = parseAISections(result?.aiAnalysis || "");
  const categoryEntries = Object.entries(analytics.categoryBreakdown || {});
  const locationEntries = Object.entries(analytics.locationAnalysis || {});
  const maxCategory = Math.max(...categoryEntries.map(([, v]) => v), 1);

  return (
    <div className="page ai-page">
      <section className="ai-hero glass-card">
        <div className="ai-hero-content">
          <span className="hero-badge">Powered by OpenRouter AI</span>
          <h1>AI Complaint Intelligence Center</h1>
          <p>
            Detect urgency, recommend departments, summarize complaints, and get
            actionable civic management insights.
          </p>
          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={handleAnalyze}
            disabled={loading}
          >
            {loading ? "Analyzing..." : "Run AI Analysis"}
          </button>
        </div>
      </section>

      {loading && (
        <LoadingSpinner text="Analyzing complaints... Render free tier may take 20-60 seconds." />
      )}

      {error ? <p className="alert alert-error">{error}</p> : null}

      {result && !loading && (
        <>
          <section className="stats-grid">
            <StatCard
              icon="📊"
              label="Total Complaints"
              value={analytics.totalComplaints || 0}
              accent="accent-blue"
            />
            <StatCard
              icon="⏳"
              label="Pending"
              value={analytics.pendingComplaints || 0}
              accent="accent-amber"
            />
            <StatCard
              icon="✅"
              label="Resolved"
              value={analytics.resolvedComplaints || 0}
              accent="accent-green"
            />
            <StatCard
              icon="🚨"
              label="High Priority"
              value={analytics.highPriorityCount || 0}
              accent="accent-red"
            />
          </section>

          <div className="analytics-grid">
            <div className="glass-card analytics-card">
              <h2>Category Breakdown</h2>
              {categoryEntries.length === 0 ? (
                <p className="muted">No category data yet.</p>
              ) : (
                categoryEntries.map(([cat, count]) => (
                  <div key={cat} className="progress-row">
                    <div className="progress-label">
                      <span>{cat}</span>
                      <span>{count}</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${(count / maxCategory) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="glass-card analytics-card">
              <h2>Location Analysis</h2>
              {locationEntries.length === 0 ? (
                <p className="muted">No location data yet.</p>
              ) : (
                <ul className="location-list">
                  {locationEntries.map(([loc, count]) => (
                    <li key={loc}>
                      <span>{loc}</span>
                      <strong>{count}</strong>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="glass-card analytics-card full-width">
              <h2>Complaints Overview</h2>
              <div className="table-wrap inner-table">
                <table className="complaints-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Location</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(result.complaints || []).map((c) => (
                      <tr key={c._id}>
                        <td>{c.title}</td>
                        <td>{c.category}</td>
                        <td>{c.location}</td>
                        <td>{c.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <section className="ai-insights-section">
            <h2>AI Insights</h2>
            <div className="ai-insights-grid">
              {sections.length > 0 ? (
                sections.map((section, index) => (
                  <AIInsightCard
                    key={section.title}
                    title={section.title}
                    content={section.content}
                    index={index}
                  />
                ))
              ) : (
                <div className="glass-card">
                  <p>{result.aiAnalysis || "No AI analysis returned."}</p>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default AIAnalysis;
