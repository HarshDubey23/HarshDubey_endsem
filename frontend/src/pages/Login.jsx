import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api";
import LoadingSpinner from "../components/LoadingSpinner";
import { getApiError } from "../utils/getApiError";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
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
      const { data } = await loginUser(form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(getApiError(err, "Login failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-split">
      <section className="auth-showcase">
        <span className="showcase-tag">AI308B · ESE Project</span>
        <h1>Smart Civic<br />Complaint Hub</h1>
        <p>
          Register grievances, track resolution, and unlock AI-powered
          department routing with priority intelligence.
        </p>
        <ul className="showcase-features">
          <li>✦ AI Priority Detection</li>
          <li>✦ Department Recommendation</li>
          <li>✦ Auto Citizen Response</li>
          <li>✦ Real-time Analytics</li>
        </ul>
      </section>

      <section className="auth-card glass-card pro-auth-card">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Sign in to your dashboard</p>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full btn-glow" disabled={loading}>
            {loading ? "Signing in..." : "Access Dashboard →"}
          </button>
        </form>
        {loading && <LoadingSpinner text="Securing session..." />}
        <p className="auth-footer">
          New user? <Link to="/register">Create free account</Link>
        </p>
      </section>
    </div>
  );
}

export default Login;
