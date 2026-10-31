import { useState, useRef, useEffect } from "react";
import { User, Settings, LogOut, ChevronDown, Menu } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function AppHeader({
  title = "Dashboard",
  description = "TABOR HOTEL Management System",
  onMenuClick,
}) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-3 sm:px-6">
      {/* Left */}
      <div className="flex items-center gap-2.5 min-w-0">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden shrink-0"
            aria-label="Toggle navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate">
            {title}
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500 truncate">
            {description}
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {/* Online Status */}
        <div className="hidden items-center gap-2 sm:flex">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span className="text-xs font-medium text-slate-500">Online</span>
        </div>

        {/* Profile */}
        <div ref={dropdownRef} className="relative border-l border-slate-200 pl-4">
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-slate-100"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white shadow-xs">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div className="hidden text-left md:block">
              <p className="text-xs font-bold text-slate-900">{user?.name || "User"}</p>
              <p className="text-[11px] text-slate-500 font-medium capitalize">
                {user?.role || "Front Desk"}
              </p>
            </div>

            <ChevronDown
              className={`hidden h-4 w-4 text-slate-400 transition md:block ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>

          {open && (
            <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.email || "admin@tabor.com"}</p>
                <p className="text-[11px] text-amber-600 font-medium mt-1 capitalize">
                  Role: <span className="font-bold text-slate-700">{user?.role || "Receptionist"}</span>
                </p>
              </div>

              <div className="border-t border-slate-100">
                <button
                  onClick={() => {
                    setOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default AppHeader;
