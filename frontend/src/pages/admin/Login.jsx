import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function AdminLogin() {
  const { admin, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (admin) return <Navigate to="/admin" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      navigate("/admin");
    } catch (err) {
      setError("Email o contraseña incorrectos");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border w-full max-w-sm">
        <h1 className="text-xl font-bold text-center mb-6">🐾 Panel de Administración</h1>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-stone-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-stone-700">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mt-1"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            disabled={loading}
            className="w-full bg-brand-600 text-white py-2 rounded-lg font-semibold hover:bg-brand-700"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </div>
      </form>
    </div>
  );
}
