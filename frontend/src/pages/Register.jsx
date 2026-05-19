import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api";
import LoadingSpinner from "../components/LoadingSpinner";
import { getApiError } from "../utils/getApiError";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await registerUser(form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch (err) {
      const msg = getApiError(err, "Registration failed.");
      if (msg.toLowerCase().includes("already exists")) {
        setError(`${msg} — please Login instead.`);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-split">
      <section className="auth-showcase">
        <span className="showcase-tag">Join the Platform</span>
        <h1>Start Managing<br />Complaints Smarter</h1>
        <p>
          One account for registration, tracking, filtering, and
          enterprise-grade AI analysis for your civic operations.
        </p>
      </section>

      <section className="auth-card glass-card pro-auth-card">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Free · Secure · AI-Ready</p>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input id="name" name="name" type="text" placeholder="Your full name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" placeholder="name@example.com" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" placeholder="Min 6 characters" value={form.password} onChange={handleChange} minLength={6} required />
          </div>
          <button type="submit" className="btn btn-primary btn-full btn-glow" disabled={loading}>
            {loading ? "Creating..." : "Create Account →"}
          </button>
        </form>
        {loading && <LoadingSpinner text="Setting up your account..." />}
        <p className="auth-footer">
          Already registered? <Link to="/login">Login here</Link>
        </p>
      </section>
    </div>
  );
}

export default Register;
