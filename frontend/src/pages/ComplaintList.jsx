import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getComplaints,
  updateComplaint,
  deleteComplaint,
  searchComplaints,
} from "../api";
import ComplaintCard from "../components/ComplaintCard";
import LoadingSpinner from "../components/LoadingSpinner";
import PageHero from "../components/PageHero";

const CATEGORIES = [
  "Water Supply",
  "Electricity",
  "Sanitation",
  "Roads",
  "Health",
  "Other",
];

function ComplaintList() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [statusEdit, setStatusEdit] = useState({ id: "", status: "Pending" });

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError("");
      const params = filterCategory ? { category: filterCategory } : {};
      const { data } = await getComplaints(params);
      setComplaints(data.complaints || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [filterCategory]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchLocation.trim()) {
      fetchComplaints();
      return;
    }
    try {
      setLoading(true);
      const { data } = await searchComplaints(searchLocation);
      setComplaints(data.complaints || []);
    } catch (err) {
      setError(err.response?.data?.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!statusEdit.id) return;
    try {
      await updateComplaint(statusEdit.id, { status: statusEdit.status });
      setStatusEdit({ id: "", status: "Pending" });
      fetchComplaints();
    } catch (err) {
      setError(err.response?.data?.message || "Status update failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this complaint?")) return;
    try {
      await deleteComplaint(id);
      fetchComplaints();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    }
  };

  const handleEdit = (complaint) => {
    setStatusEdit({
      id: complaint._id,
      status: complaint.status || "Pending",
    });
  };

  const handleAiAnalyze = (id) => {
    navigate("/ai-analysis", { state: { complaintId: id } });
  };

  return (
    <div className="page complaints-page">
      <PageHero
        badge="Tracking Module"
        title="Complaint Tracking Hub"
        subtitle="Filter by category, search by location, update status, and run per-case AI analysis."
      />

      <div className="toolbar glass-card">
        <form onSubmit={handleSearch} className="search-form">
          <input
            placeholder="Search by location..."
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
          />
          <button type="submit" className="btn btn-secondary btn-sm">
            Search
          </button>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => {
              setSearchLocation("");
              fetchComplaints();
            }}
          >
            Reset
          </button>
        </form>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="filter-select"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <section className="status-update-panel glass-card">
        <h2>Complaint Status Update</h2>
        <form onSubmit={handleStatusUpdate} className="status-form">
          <select
            value={statusEdit.status}
            onChange={(e) => setStatusEdit({ ...statusEdit, status: e.target.value })}
            disabled={!statusEdit.id}
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>
          <button type="submit" className="btn btn-primary btn-sm" disabled={!statusEdit.id}>
            Update Status
          </button>
          <span className="status-hint">
            {statusEdit.id ? "Updating selected complaint" : "Click Edit on a card to select"}
          </span>
        </form>
      </section>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <LoadingSpinner text="Fetching complaints..." />
      ) : (
        <>
          <div className="table-wrap glass-card">
            <table className="complaints-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c._id}>
                    <td>{c.title}</td>
                    <td>{c.category}</td>
                    <td>{c.location}</td>
                    <td>
                      <span
                        className={`status-badge status-${(c.status || "Pending")
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td>{c.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {complaints.length === 0 && (
              <p className="table-empty">No complaints found.</p>
            )}
          </div>

          <div className="complaints-list">
            {complaints.map((c) => (
              <ComplaintCard
                key={c._id}
                complaint={c}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAnalyze={handleAiAnalyze}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default ComplaintList;
