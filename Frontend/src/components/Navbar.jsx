import React, { useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../store/AuthContext";
import { FileText, LayoutDashboard, Copy, BarChart3, LogOut, Briefcase } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return null;

  const links = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Grade Resume", path: "/analyze", icon: BarChart3 },
    { name: "Job Descriptions", path: "/jd", icon: Briefcase },
    { name: "Comparison", path: "/compare", icon: Copy },
  ];

  return (
    <nav className="glass sticky top-0 z-50 border-b border-white/5 px-6 py-4 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight bg-gradient-to-r from-brand-400 to-violet-500 bg-clip-text text-transparent">
        <FileText className="h-6 w-6 text-brand-500" />
        <span>ATS Grader</span>
      </Link>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-brand-500/10 text-brand-400 border border-brand-500/20"
                    : "text-dark-500 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.name}
              </Link>
            );
          })}
        </div>

        <div className="h-6 w-[1px] bg-white/10 hidden md:block"></div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white">{user.name}</p>
            <p className="text-xs text-dark-500">{user.email}</p>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-danger-500 hover:bg-danger-50/5 border border-transparent hover:border-danger-500/10 transition-all"
            title="Log Out"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
