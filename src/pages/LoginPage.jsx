import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Lock, User, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.username, form.password);
      navigate("/frontdesk");
    } catch (err) {
      setError(err.message || "Login failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500 text-slate-950 font-bold text-2xl shadow-xl shadow-amber-500/20 mb-3">
            TH
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
            TABOR HOTEL
          </h1>
          <p className="text-amber-400 mt-1 text-xs font-semibold uppercase tracking-wider">
            Room Reservation & Front Desk
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <h2 className="text-lg font-bold text-white mb-5">Sign In</h2>

          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm"
                  placeholder="Enter username"
                  required
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm"
                  placeholder="Enter password"
                  required
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-600/50 text-slate-950 font-bold rounded-xl transition mt-2 shadow-lg shadow-amber-500/20 text-sm flex items-center justify-center gap-2"
            >
              {loading ? "Signing in..." : "Sign In to Front Desk"}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          Tabor Hotel Management System v1.0
        </p>
      </div>
    </div>
  );
}
