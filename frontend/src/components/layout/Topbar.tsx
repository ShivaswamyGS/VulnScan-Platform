import React, { useState } from "react";

import {
  Bell,
  ChevronDown,
  LogOut,
  Search,
  ShieldCheck,
  User,
  Settings,
  X,
} from "lucide-react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

interface TopbarProps {
  title: string;
}

export function Topbar({ title }: TopbarProps) {
  const { user, logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] =
    useState(false);
  const [profileOpen, setProfileOpen] =
    useState(false);
  const [searchText, setSearchText] = useState("");

  // =========================================================
  // COMPANY DETECTION
  // =========================================================

  const isCompany =
    location.pathname.startsWith("/company");

  // =========================================================
  // DISPLAY NAME
  // =========================================================

  const displayName =
    user?.full_name?.trim() ||
    (isCompany ? "Company" : "Administrator");

  const initials =
    displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) =>
        part.charAt(0).toUpperCase()
      )
      .join("") || "U";

  // =========================================================
  // SEARCH
  // =========================================================

  function handleSearch(event: React.FormEvent) {
    event.preventDefault();

    const query = searchText.trim().toLowerCase();

    if (!query) {
      return;
    }

    // -------------------------------------------------------
    // COMPANY SEARCH
    // -------------------------------------------------------

    if (isCompany) {
      if (
        query.includes("report") ||
        query.includes("vulnerability")
      ) {
        navigate("/company/reports");
      } else if (
        query.includes("submission")
      ) {
        navigate("/company/submissions");
      } else if (
        query.includes("program") ||
        query.includes("bounty")
      ) {
        navigate("/company/programs");
      } else if (
        query.includes("employee")
      ) {
        navigate("/company/employees");
      } else if (
        query.includes("project")
      ) {
        navigate("/company/projects");
      } else if (
        query.includes("asset")
      ) {
        navigate("/company/assets");
      } else if (
        query.includes("analytic")
      ) {
        navigate("/company/analytics");
      } else if (
        query.includes("profile")
      ) {
        navigate("/company/profile");
      } else if (
        query.includes("setting")
      ) {
        navigate("/company/settings");
      } else {
        return;
      }

      setSearchText("");
      setSearchOpen(false);

      return;
    }

    // -------------------------------------------------------
    // ADMIN SEARCH
    // -------------------------------------------------------

    if (query.includes("user")) {
      navigate("/admin/users");
    } else if (query.includes("compan")) {
      navigate("/admin/companies");
    } else if (query.includes("report")) {
      navigate("/admin/reports");
    } else if (
      query.includes("program") ||
      query.includes("bounty")
    ) {
      navigate("/admin/programs");
    } else if (
      query.includes("dataset")
    ) {
      navigate("/admin/datasets");
    } else if (
      query.includes("training") ||
      query.includes("ai")
    ) {
      navigate("/admin/ai-training");
    } else if (
      query.includes("audit")
    ) {
      navigate("/admin/audit-logs");
    } else if (
      query.includes("setting")
    ) {
      navigate("/admin/settings");
    } else {
      return;
    }

    setSearchText("");
    setSearchOpen(false);
  }

  // =========================================================
  // LOGOUT
  // =========================================================

  function handleLogout() {
    setProfileOpen(false);

    if (isCompany) {
      localStorage.removeItem(
        "company_access_token"
      );

      localStorage.removeItem(
        "company_refresh_token"
      );

      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");

      navigate("/login", {
        replace: true,
      });

      return;
    }

    logout();

    navigate("/login", {
      replace: true,
    });
  }

  // =========================================================
  // MENU HANDLERS
  // =========================================================

  function openSearch() {
    setSearchOpen((value) => !value);

    setNotificationOpen(false);
    setProfileOpen(false);
  }

  function openNotifications() {
    setNotificationOpen((value) => !value);

    setSearchOpen(false);
    setProfileOpen(false);
  }

  function openProfile() {
    setProfileOpen((value) => !value);

    setSearchOpen(false);
    setNotificationOpen(false);
  }

  // =========================================================
  // CLOSE MENUS
  // =========================================================

  function closeMenus() {
    setSearchOpen(false);
    setNotificationOpen(false);
    setProfileOpen(false);
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <header
      className="
        relative
        z-[9999]
        flex
        h-[68px]
        shrink-0
        items-center
        justify-between
        border-b
        border-[var(--color-border)]
        bg-white
        px-6
        pointer-events-auto
      "
    >
      {/* =====================================================
          LEFT
      ===================================================== */}

      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-[15px] font-semibold text-[var(--color-ink)]">
            {title}
          </h1>

          <p className="mt-0.5 text-[11px] text-[var(--color-ink-muted)]">
            {isCompany
              ? "Company vulnerability management and security operations"
              : "Vulnerability management and security operations"}
          </p>
        </div>
      </div>

      {/* =====================================================
          RIGHT
      ===================================================== */}

      <div className="relative z-[10000] flex items-center gap-3 pointer-events-auto">

        {/* ===================================================
            SEARCH
        =================================================== */}

        <div className="relative z-[10001]">

          <button
            type="button"
            onClick={openSearch}
            className={[
              "relative z-[10002]",
              "flex h-9 w-9 items-center justify-center",
              "rounded-md",
              "cursor-pointer",
              "text-slate-400",
              "transition",
              "hover:bg-slate-100",
              "hover:text-slate-700",
              searchOpen
                ? "bg-slate-100 text-slate-700"
                : "",
            ].join(" ")}
            aria-label="Search"
            title="Search"
          >
            {searchOpen ? (
              <X size={17} />
            ) : (
              <Search size={17} />
            )}
          </button>

          {searchOpen && (
            <form
              onSubmit={handleSearch}
              className="
                absolute
                right-0
                top-11
                z-[10010]
                w-[300px]
                rounded-lg
                border
                border-slate-200
                bg-white
                p-2
                shadow-xl
              "
            >
              <div className="flex items-center gap-2 rounded-md border border-slate-200 px-3">

                <Search
                  size={15}
                  className="shrink-0 text-slate-400"
                />

                <input
                  autoFocus
                  type="text"
                  value={searchText}
                  onChange={(event) =>
                    setSearchText(
                      event.target.value
                    )
                  }
                  placeholder={
                    isCompany
                      ? "Search reports, programs..."
                      : "Search users, companies..."
                  }
                  className="
                    h-9
                    w-full
                    bg-transparent
                    text-xs
                    text-slate-800
                    outline-none
                    placeholder:text-slate-400
                  "
                />

              </div>

              <p className="px-2 pb-1 pt-2 text-[10px] text-slate-400">
                Press Enter to search
              </p>
            </form>
          )}

        </div>

        {/* ===================================================
            NOTIFICATIONS
        =================================================== */}

        <div className="relative z-[10001]">

          <button
            type="button"
            onClick={openNotifications}
            className={[
              "relative z-[10002]",
              "flex h-9 w-9 items-center justify-center",
              "rounded-md",
              "cursor-pointer",
              "text-slate-400",
              "transition",
              "hover:bg-slate-100",
              "hover:text-slate-700",
              notificationOpen
                ? "bg-slate-100 text-slate-700"
                : "",
            ].join(" ")}
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell size={17} />

            <span className="absolute right-[7px] top-[6px] h-1.5 w-1.5 rounded-full bg-blue-600" />
          </button>

          {notificationOpen && (
            <div
              className="
                absolute
                right-0
                top-11
                z-[10010]
                w-[320px]
                overflow-hidden
                rounded-lg
                border
                border-slate-200
                bg-white
                shadow-xl
              "
            >

              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">

                <div>
                  <h3 className="text-xs font-semibold text-slate-800">
                    Notifications
                  </h3>

                  <p className="mt-0.5 text-[10px] text-slate-400">
                    Recent security activity
                  </p>
                </div>

                <span className="rounded-full bg-blue-50 px-2 py-1 text-[9px] font-semibold text-blue-600">
                  New
                </span>

              </div>

              <div className="border-b border-slate-100 px-4 py-4">

                <div className="flex gap-3">

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <ShieldCheck size={15} />
                  </div>

                  <div>

                    <p className="text-[11px] font-semibold text-slate-800">
                      Security platform operational
                    </p>

                    <p className="mt-1 text-[10px] leading-4 text-slate-400">
                      Your security services are currently online.
                    </p>

                  </div>

                </div>

              </div>

              <div className="px-4 py-4 text-center">

                <p className="text-[10px] text-slate-400">
                  No new notifications
                </p>

              </div>

            </div>
          )}

        </div>

        {/* ===================================================
            DIVIDER
        =================================================== */}

        <div className="h-7 w-px bg-[var(--color-border)]" />

        {/* ===================================================
            PROFILE
        =================================================== */}

        <div className="relative z-[10001]">

          <button
            type="button"
            onClick={openProfile}
            className="
              relative
              z-[10002]
              flex
              cursor-pointer
              items-center
              gap-3
              rounded-lg
              px-2
              py-1.5
              transition
              hover:bg-slate-50
            "
            aria-label="Account menu"
            title="Account menu"
          >

            <div className="hidden text-right sm:block">

              <p className="text-[12px] font-semibold text-[var(--color-ink)]">
                {displayName}
              </p>

              <p className="mt-0.5 max-w-[160px] truncate text-[10px] text-[var(--color-ink-muted)]">
                {isCompany
                  ? "Organization account"
                  : user?.email}
              </p>

            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-[12px] font-semibold text-blue-700">
              {initials}
            </div>

            <ChevronDown
              size={14}
              className={[
                "hidden text-slate-400 transition-transform sm:block",
                profileOpen
                  ? "rotate-180"
                  : "",
              ].join(" ")}
            />

          </button>

          {profileOpen && (
            <div
              className="
                absolute
                right-0
                top-12
                z-[10010]
                w-[230px]
                overflow-hidden
                rounded-lg
                border
                border-slate-200
                bg-white
                shadow-xl
              "
            >

              {/* Account */}

              <div className="border-b border-slate-100 px-4 py-3">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">
                    {initials}
                  </div>

                  <div className="min-w-0">

                    <p className="truncate text-xs font-semibold text-slate-800">
                      {displayName}
                    </p>

                    <p className="truncate text-[10px] text-slate-400">
                      {user?.email ||
                        (isCompany
                          ? "Company account"
                          : "")}
                    </p>

                  </div>

                </div>

              </div>

              {/* Profile */}

              <Link
                to={
                  isCompany
                    ? "/company/profile"
                    : "/profile"
                }
                onClick={closeMenus}
                className="
                  flex
                  cursor-pointer
                  items-center
                  gap-3
                  px-4
                  py-3
                  text-xs
                  text-slate-600
                  transition
                  hover:bg-slate-50
                  hover:text-slate-900
                "
              >
                <User size={15} />

                <span>
                  {isCompany
                    ? "Company Profile"
                    : "Profile"}
                </span>
              </Link>

              {/* Settings */}

              <Link
                to={
                  isCompany
                    ? "/company/settings"
                    : "/settings"
                }
                onClick={closeMenus}
                className="
                  flex
                  cursor-pointer
                  items-center
                  gap-3
                  px-4
                  py-3
                  text-xs
                  text-slate-600
                  transition
                  hover:bg-slate-50
                  hover:text-slate-900
                "
              >
                <Settings size={15} />

                <span>
                  Settings
                </span>
              </Link>

              {/* Logout */}

              <div className="border-t border-slate-100 p-1.5">

                <button
                  type="button"
                  onClick={handleLogout}
                  className="
                    flex
                    w-full
                    cursor-pointer
                    items-center
                    gap-3
                    rounded-md
                    px-3
                    py-2.5
                    text-xs
                    text-red-500
                    transition
                    hover:bg-red-50
                    hover:text-red-600
                  "
                >
                  <LogOut size={15} />

                  <span>
                    Log out
                  </span>
                </button>

              </div>

            </div>
          )}

        </div>

      </div>

      {/* =====================================================
          INVISIBLE BACKDROP
          Closes menus when clicking outside
      ===================================================== */}

      {(searchOpen ||
        notificationOpen ||
        profileOpen) && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={closeMenus}
          className="
            fixed
            inset-0
            z-[9990]
            cursor-default
            bg-transparent
          "
        />
      )}

    </header>
  );
}

export default Topbar;
