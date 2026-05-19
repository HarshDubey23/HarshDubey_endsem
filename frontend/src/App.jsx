import { Routes, Route, Navigate } from "react-router-dom";
import Protected from "./components/Protected";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ComplaintList from "./pages/ComplaintList";
import AIAnalysis from "./pages/AIAnalysis";

function App() {
  const token = localStorage.getItem("token");

  return (
    <div className="app">
      <div className="bg-orbs" aria-hidden="true">
        <span className="orb orb-1" />
        <span className="orb orb-2" />
        <span className="orb orb-3" />
      </div>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={<Navigate to={token ? "/dashboard" : "/login"} replace />}
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <Protected>
                <Dashboard />
              </Protected>
            }
          />
          <Route
            path="/complaints"
            element={
              <Protected>
                <ComplaintList />
              </Protected>
            }
          />
          <Route
            path="/ai-analysis"
            element={
              <Protected>
                <AIAnalysis />
              </Protected>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
