import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const parseStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

const getNavItems = (role) => {
  if (role === "admin") {
    return [
      { to: "/admin", label: "Dashboard" },
      { to: "/submissions", label: "Submissions" },
      { to: "/create-rubric", label: "Rubrics" },
    ];
  }

  if (role === "teacher") {
    return [
      { to: "/teacher", label: "Courses" },
      { to: "/submissions", label: "Submissions" },
      { to: "/create-rubric", label: "Rubrics" },
    ];
  }

  return [
    { to: "/student", label: "Courses" },
    { to: "/upload", label: "Upload" },
  ];
};

const getRoleHome = (role) => {
  if (role === "admin") return "/admin";
  if (role === "teacher") return "/teacher";
  return "/student";
};

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "U";
};

const LiquidPageShell = ({
  badge,
  title,
  description,
  children,
  maxWidth = "max-w-6xl",
  headerActions = null,
}) => {
  const user = useMemo(() => parseStoredUser(), []);
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = getNavItems(user?.role);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="page-shell min-h-screen text-white">
      <div className={`mx-auto px-6 py-6 ${maxWidth}`}>
        <div className="liquid-nav sticky top-4 z-20 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link to={getRoleHome(user?.role)} className="flex items-center gap-3">
              <div className="liquid-brand-mark">AR</div>
              <div>
                <p className="text-sm font-semibold tracking-[0.22em] text-sky-100/90 uppercase">
                  AI Rubric
                </p>
                <p className="glass-muted text-xs">Liquid workspace</p>
              </div>
            </Link>

            <div className="flex flex-1 flex-wrap items-center justify-center gap-2">
              {navItems.map((item) => {
                const isActive =
                  location.pathname === item.to ||
                  (item.to !== "/" && location.pathname.startsWith(item.to));

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`liquid-nav-link ${isActive ? "is-active" : ""}`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="glass-card glass-interactive flex items-center gap-3 px-3 py-2"
              >
                <div className="liquid-avatar">{getInitials(user?.name)}</div>
                <div className="text-left">
                  <p className="text-sm font-semibold">{user?.name || "User"}</p>
                  <p className="glass-muted text-xs capitalize">
                    {user?.role || "guest"}
                  </p>
                </div>
              </button>

              {menuOpen && (
                <div className="glass-panel absolute right-0 mt-3 w-64 p-4">
                  <p className="text-sm font-semibold">{user?.name || "User"}</p>
                  <p className="glass-muted mt-1 text-sm">{user?.email || "No email"}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="glass-badge capitalize">{user?.role || "guest"}</span>
                    <Link
                      to={getRoleHome(user?.role)}
                      className="glass-link text-sm"
                      onClick={() => setMenuOpen(false)}
                    >
                      Home
                    </Link>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="glass-button-secondary mt-4 w-full"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            {badge ? <span className="glass-badge mb-4">{badge}</span> : null}
            {title ? (
              <h1 className="mb-2 text-3xl font-bold tracking-tight">{title}</h1>
            ) : null}
            {description ? (
              <p className="glass-muted max-w-3xl">{description}</p>
            ) : null}
          </div>

          {headerActions}
        </div>

        {children}
      </div>
    </div>
  );
};

export default LiquidPageShell;
