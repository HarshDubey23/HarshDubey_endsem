import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getComplaints,
  addComplaint,
  updateComplaint,
  deleteComplaint,
  searchComplaints,
} from "../api";
import { getApiError } from "../utils/getApiError";
import StatCard from "../components/StatCard";
import ComplaintCard from "../components/ComplaintCard";
import LoadingSpinner from "../components/LoadingSpinner";
import PageHero from "../components/PageHero";

const emptyForm = {
  name: "",
  email: "",
  title: "",
  description: "",
  category: "",
  location: "",
  status: "Pending",
};

const CATEGORIES = [
  "Water Supply",
  "Electricity",
  "Sanitation",
  "Roads",
  "Health",
  "Other",
];

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [complaints, setComplaints] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const fetchComplaints = async () => {
    try {
      setLoading(true);
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

  const stats = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === "Pending").length,
    resolved: complaints.filter((c) => c.status === "Resolved").length,
    inProgress: complaints.filter((c) => c.status === "In Progress").length,
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      if (editingId) {
        await updateComplaint(editingId, form);
        setSuccess("Complaint updated successfully!");
      } else {
        await addComplaint(form);
        setSuccess("Complaint registered successfully!");
      }
      resetForm();
      fetchComplaints();
    } catch (err) {
      setError(getApiError(err, "Operation failed"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (complaint) => {
    setEditingId(complaint._id);
    setForm({
      name: complaint.name,
      email: complaint.email,
      title: complaint.title,
      description: complaint.description,
      category: complaint.category,
      location: complaint.location,
      status: complaint.status || "Pending",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this complaint?")) return;
    try {
      await deleteComplaint(id);
      setSuccess("Complaint deleted successfully!");
      fetchComplaints();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    }
  };

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
      setSuccess(`Found ${data.count} complaint(s) in ${searchLocation}`);
    } catch (err) {
      setError(err.response?.data?.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAiAnalyze = (id) => {
    navigate("/ai-analysis", { state: { complaintId: id } });
  };

  return (
    <div className="page dashboard-page">
      <PageHero
        badge={`Welcome, ${user.name || "Officer"}`}
        title="Complaint Command Center"
        subtitle="Register grievances, monitor status, and route cases to AI intelligence."
      />

      <section className="stats-grid">
        <StatCard icon="📊" label="Total Complaints" value={stats.total} accent="accent-blue" />
        <StatCard icon="⏳" label="Pending" value={stats.pending} accent="accent-amber" />
        <StatCard icon="🔄" label="In Progress" value={stats.inProgress} accent="accent-purple" />
        <StatCard icon="✅" label="Resolved" value={stats.resolved} accent="accent-green" />
      </section>

      <div className="dashboard-grid">
        <section className="glass-card form-section">
          <h2>{editingId ? "Update Complaint" : "Register New Complaint"}</h2>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit} className="complaint-form">
            <div className="form-row">
              <div className="form-group">
                <label>Name</label>
                <input name="name" value={form.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label>Complaint Title</label>
              <input name="title" value={form.title} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                rows={4}
                value={form.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <select name="category" value={form.category} onChange={handleChange} required>
                  <option value="">Select category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Location</label>
                <input name="location" value={form.location} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? "Saving..." : editingId ? "Update Complaint" : "Submit Complaint"}
              </button>
              {editingId && (
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="complaints-section">
          <div className="section-toolbar glass-card">
            <form onSubmit={handleSearch} className="search-form">
              <input
                placeholder="Search by location (e.g. Ghaziabad)"
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

          {loading ? (
            <LoadingSpinner text="Loading complaints..." />
          ) : complaints.length === 0 ? (
            <div className="empty-state glass-card">
              <p>No complaints yet. Register your first complaint!</p>
            </div>
          ) : (
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
          )}
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
