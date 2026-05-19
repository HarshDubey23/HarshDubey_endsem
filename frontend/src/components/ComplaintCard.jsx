function ComplaintCard({ complaint, onEdit, onDelete }) {
  const statusClass = (complaint.status || "Pending")
    .toLowerCase()
    .replace(/\s+/g, "-");

  return (
    <article className="complaint-card glass-card">
      <div className="complaint-card-header">
        <h3>{complaint.title}</h3>
        <span className={`status-badge status-${statusClass}`}>
          {complaint.status || "Pending"}
        </span>
      </div>

      <p className="complaint-desc">{complaint.description}</p>

      <div className="complaint-meta">
        <span>👤 {complaint.name}</span>
        <span>📧 {complaint.email}</span>
        <span>📂 {complaint.category}</span>
        <span>📍 {complaint.location}</span>
      </div>

      <div className="complaint-card-actions">
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
