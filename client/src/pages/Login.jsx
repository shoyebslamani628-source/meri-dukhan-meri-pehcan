import { LockKeyhole, Wrench } from "lucide-react";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/");
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-md border border-line bg-white shadow-soft lg:grid-cols-[1fr_420px]">
        <section className="hidden bg-cyan-800 p-10 text-white lg:block">
          <div className="flex h-full flex-col justify-between">
            <div>
              <div className="mb-8 inline-flex rounded-md bg-white/10 p-3">
                <Wrench size={28} />
              </div>
              <h1 className="max-w-md text-3xl font-bold">Mechanic Inventory</h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-cyan-50">
                Inventory, billing, supplier dues, and repair-shop reporting in
                one owner console.
              </p>
            </div>
            <p className="text-xs text-cyan-100">Currency: Indian Rupee (₹)</p>
          </div>
        </section>

        <section className="p-6 sm:p-8">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="rounded-md bg-cyan-700 p-3 text-white">
              <Wrench size={22} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-ink">Mechanic Inventory</h1>
              <p className="text-xs text-slate-500">Owner Console</p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold text-ink">Owner Login</h2>
            <p className="mt-1 text-sm text-slate-500">
              Sign in with your email and password.
            </p>
          </div>

          {error ? (
            <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
              {error}
            </div>
          ) : null}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="label" htmlFor="email">
                Email
              </label>
              <input
                className="input mt-1"
                id="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="owner@mechanicshop.com"
                required
                type="email"
                value={email}
              />
            </div>

            <div>
              <label className="label" htmlFor="password">
                Password
              </label>
              <input
                className="input mt-1"
                id="password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                required
                type="password"
                value={password}
              />
            </div>

            <button className="btn-primary w-full" disabled={loading} type="submit">
              <LockKeyhole size={18} />
              {loading ? "Signing in" : "Login"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Login;

