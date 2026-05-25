import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../store/AuthContext";
import api from "../services/api";
import { FileText, Mail, Lock, User, AlertCircle, ArrowRight } from "lucide-react";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let data;
      if (isLogin) {
        data = await api.login(email, password);
      } else {
        if (!name) {
          throw new Error("Name is required for registration");
        }
        data = await api.register(name, email, password);
      }
      login(data);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const autofillDemo = () => {
    setEmail("demo@resumegrader.com");
    setPassword("password123");
    setName("Demo User");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950 px-4 relative overflow-hidden">
      {/* Background Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[100px]"></div>

      <div className="w-full max-w-md relative">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3.5 rounded-2xl bg-brand-600/10 text-brand-500 border border-brand-500/20 mb-4">
            <FileText className="h-8 w-8" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-sm text-dark-500 mt-2 text-center">
            {isLogin
              ? "Upload and grade your resumes against ATS standards."
              : "Join to grade resumes and optimize your profile."}
          </p>
        </div>

        <div className="glass rounded-2xl p-8 border border-white/5 shadow-2xl">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
              <div className="p-4 rounded-xl bg-danger-500/10 border border-danger-500/20 text-xs text-danger-500 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {!isLogin && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-dark-500 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-dark-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-11 pr-4 py-3 bg-dark-900 border border-white/10 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none focus:border-brand-500/50 transition-all"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-dark-500 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-dark-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-dark-900 border border-white/10 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none focus:border-brand-500/50 transition-all"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-dark-500 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-dark-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-dark-900 border border-white/10 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none focus:border-brand-500/50 transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? "Processing..." : isLogin ? "Login" : "Sign Up"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/5 flex flex-col gap-4">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs text-brand-400 hover:text-brand-300 font-medium text-center transition-all"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
            </button>

            <button
              type="button"
              onClick={autofillDemo}
              className="text-xs text-dark-500 hover:text-white text-center transition-all underline decoration-dashed underline-offset-4"
            >
              Use Demo Credentials
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
