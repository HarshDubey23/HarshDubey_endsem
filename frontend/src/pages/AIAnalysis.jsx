import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { analyzeAllComplaints, analyzeSingleComplaint } from "../api";
import { parseAISections } from "../utils/parseAI";
import { getApiError } from "../utils/getApiError";
import AIInsightCard from "../components/AIInsightCard";
import StatCard from "../components/StatCard";
import LoadingSpinner from "../components/LoadingSpinner";
import PageHero from "../components/PageHero";

function AIAnalysis() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const runAnalysis = async (complaintId = null) => {
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const { data } = complaintId
        ? await analyzeSingleComplaint(complaintId)
        : await analyzeAllComplaints();
      setResult(data);
    } catch (err) {
      setError(getApiError(err, "AI analysis failed. Try again."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location.state?.complaintId) {
      runAnalysis(location.state.complaintId);
    }
  }, [location.state?.complaintId]);

  const analytics = result?.computedAnalytics || {};
  const sections = parseAISections(result?.aiAnalysis || "");
  const categoryEntries = Object.entries(analytics.categoryBreakdown || {});
  const locationEntries = Object.entries(analytics.locationAnalysis || {});
  const urgencyEntries = Object.entries(analytics.urgencyBreakdown || {});
  const deptEntries = Object.entries(analytics.departmentLoad || {});
  const maxCategory = Math.max(...categoryEntries.map(([, v]) => v), 1);

  return (
    <div className="page ai-page">
      <section className="ai-hero-pro">
        <PageHero
          badge="OpenRouter GPT-3.5 · Advanced Civic AI"
          title="AI Complaint Intelligence Center"
          subtitle="Deep priority analysis, department routing, citizen auto-responses, and operational action plans — powered by your live complaint data."
        >
          <div className="hero-actions">
            <button
              type="button"
              className="btn btn-primary btn-lg btn-glow"
              onClick={() => runAnalysis()}
              disabled={loading}
            >
              {loading ? "◌ Analyzing..." : "✦ Run Full AI Analysis"}
            </button>
            {result && (
              <span className="hero-meta">
                Last report: {result.complaintCount} complaint(s) processed
              </span>
            )}
          </div>
        </PageHero>
      </section>

      {loading && (
        <div className="ai-loading-panel glass-card">
          <LoadingSpinner text="Generating detailed AI intelligence report... Render free tier may take 20–60 seconds." />
          <div className="loading-steps">
            <span>▸ Computing analytics</span>
            <span>▸ Detecting urgency levels</span>
            <span>▸ Calling OpenRouter AI</span>
            <span>▸ Formatting report sections</span>
          </div>
        </div>
      )}

      {error && <p className="alert alert-error">{error}</p>}

      {result && !loading && (
        <>
          <section className="stats-grid">
            <StatCard icon="📊" label="Total Complaints" value={analytics.totalComplaints || 0} accent="accent-blue" trend="Dataset" />
            <StatCard icon="⏳" label="Pending" value={analytics.pendingComplaints || 0} accent="accent-amber" />
            <StatCard icon="✅" label="Resolved" value={analytics.resolvedComplaints || 0} accent="accent-green" trend={analytics.resolutionRate} />
            <StatCard icon="🚨" label="High Priority" value={analytics.highPriorityCount || 0} accent="accent-red" />
          </section>

          {urgencyEntries.length > 0 && (
            <section className="glass-card urgency-panel">
              <h2>Urgency Intelligence</h2>
              <div className="urgency-chips">
                {urgencyEntries.map(([level, count]) => (
                  <span key={level} className={`urgency-chip urgency-${level.toLowerCase()}`}>
                    {level}: <strong>{count}</strong>
                  </span>
                ))}
              </div>
              {(analytics.highPriorityComplaints || []).length > 0 && (
                <div className="priority-list">
                  <h3>Critical Cases</h3>
                  {analytics.highPriorityComplaints.map((c) => (
                    <div key={c.id} className="priority-item">
                      <span className="priority-title">{c.title}</span>
                      <span className="priority-meta">{c.location} · {c.urgency}</span>
                      <span className="priority-dept">{c.recommendedDepartment}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          <div className="analytics-grid pro-grid">
            <div className="glass-card analytics-card">
              <h2>📂 Category Breakdown</h2>
              {categoryEntries.map(([cat, count]) => (
                <div key={cat} className="progress-row">
                  <div className="progress-label"><span>{cat}</span><span>{count}</span></div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${(count / maxCategory) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="glass-card analytics-card">
              <h2>📍 Location Heatmap</h2>
              <ul className="location-list pro-location">
                {locationEntries.map(([loc, count]) => (
                  <li key={loc}><span>{loc}</span><strong>{count}</strong></li>
                ))}
              </ul>
            </div>

            <div className="glass-card analytics-card">
              <h2>🏛️ Department Load</h2>
              <ul className="location-list pro-location">
                {deptEntries.map(([dept, count]) => (
                  <li key={dept}><span>{dept}</span><strong>{count}</strong></li>
                ))}
              </ul>
            </div>

            <div className="glass-card analytics-card full-width">
              <h2>📋 Complaints Data Matrix</h2>
              <div className="table-wrap inner-table">
                <table className="complaints-table pro-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>AI Urgency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(analytics.complaintInsights || result.complaints || []).map((c) => (
                      <tr key={c.id || c._id}>
                        <td>{c.title}</td>
                        <td>{c.category}</td>
                        <td>{c.location}</td>
                        <td>{c.status}</td>
                        <td>
                          <span className={`urgency-chip urgency-${(c.urgency || "medium").toLowerCase()}`}>
                            {c.urgency || "—"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <section className="ai-insights-section">
            <div className="section-head">
              <h2>🧠 AI Intelligence Report</h2>
              <p>Structured analysis with detailed recommendations for civic administration</p>
            </div>
            <div className="ai-insights-grid featured-grid">
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
                <div className="glass-card raw-ai-fallback">
                  <pre>{result.aiAnalysis}</pre>
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
