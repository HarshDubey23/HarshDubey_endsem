function ComplaintCard({ complaint, onEdit, onDelete, onAnalyze }) {
  const statusClass = (complaint.status || "Pending")
    .toLowerCase()
    .replace(/\s+/g, "-");

  return (
    <article className="complaint-card glass-card pro-complaint">
      <div className="complaint-card-top">
        <span className="complaint-id">#{complaint._id?.slice(-6).toUpperCase()}</span>
        <span className={`status-badge status-${statusClass}`}>
          {complaint.status || "Pending"}
        </span>
      </div>
      <h3>{complaint.title}</h3>
      <p className="complaint-desc">{complaint.description}</p>
      <div className="complaint-meta-grid">
        <span><em>👤</em> {complaint.name}</span>
        <span><em>📧</em> {complaint.email}</span>
        <span><em>📂</em> {complaint.category}</span>
        <span><em>📍</em> {complaint.location}</span>
      </div>
      <div className="complaint-card-actions">
        {onAnalyze && (
          <button type="button" className="btn btn-ai btn-sm" onClick={() => onAnalyze(complaint._id)}>
            ✦ AI Analyze
          </button>
        )}
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => onEdit(complaint)}>
          Edit
        </button>
        <button type="button" className="btn btn-danger btn-sm" onClick={() => onDelete(complaint._id)}>
          Delete
        </button>
      </div>
    </article>
  );
}

export default ComplaintCard;
