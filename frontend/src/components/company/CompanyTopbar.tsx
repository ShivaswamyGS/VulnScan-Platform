import React, { useState } from "react";

import {
  Bell,
  ChevronDown,
  LogOut,
  Search,
  X,
  User,
  Settings,
  ShieldCheck,
  FileText,
  Bug,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useCompanyAuth } from "../../context/CompanyAuthContext";

interface CompanyTopbarProps {
  title: string;
}

export default function CompanyTopbar({
  title,
}: CompanyTopbarProps) {
  const { logout } = useCompanyAuth();
  const navigate = useNavigate();

  const [searchOpen, setSearchOpen] =
    useState(false);

  const [notificationOpen, setNotificationOpen] =
    useState(false);

  const [profileOpen, setProfileOpen] =
    useState(false);

  const [searchText, setSearchText] =
    useState("");

  /*
   * =========================================================
   * SEARCH
   * =========================================================
   */

  function handleSearch(
    event: React.FormEvent
  ) {
    event.preventDefault();

    const query =
      searchText.trim().toLowerCase();

    if (!query) {
      return;
    }

    /*
     * COMPANY ROUTES
     */

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
    } else if (
      query.includes("dashboard") ||
      query.includes("home")
    ) {
      navigate("/company/dashboard");
    } else {
      /*
       * No matching route.
       * Keep search open.
       */
      return;
    }

    setSearchText("");
    setSearchOpen(false);
  }

  /*
   * =========================================================
   * SEARCH BUTTON
   * =========================================================
   */

  function handleSearchButton() {
    setSearchOpen((current) => !current);

    setNotificationOpen(false);
    setProfileOpen(false);
  }

  /*
   * =========================================================
   * NOTIFICATION BUTTON
   * =========================================================
   */

  function handleNotificationButton() {
    setNotificationOpen((current) => !current);

    setSearchOpen(false);
    setProfileOpen(false);
  }

  /*
   * =========================================================
   * PROFILE BUTTON
   * =========================================================
   */

  function handleProfileButton() {
    setProfileOpen((current) => !current);

    setSearchOpen(false);
    setNotificationOpen(false);
  }

  /*
   * =========================================================
   * LOGOUT
   * =========================================================
   */

  function handleLogout() {
    logout();

    localStorage.removeItem(
      "company_access_token"
    );

    localStorage.removeItem(
      "company_refresh_token"
    );

    navigate("/login", {
      replace: true,
    });
  }

  /*
   * =========================================================
   * CLOSE MENUS
   * =========================================================
   */

  function closeMenus() {
    setSearchOpen(false);
    setNotificationOpen(false);
    setProfileOpen(false);
  }

  return (
    <header className="relative z-50 flex h-[68px] shrink-0 items-center justify-between border-b border-[var(--color-border)] bg-white px-6">

      {/* =====================================================
          LEFT
      ===================================================== */}

      <div>
        <h1 className="text-[15px] font-semibold text-[var(--color-ink)]">
          {title}
        </h1>

        <p className="mt-0.5 text-[11px] text-[var(--color-ink-muted)]">
          Company vulnerability management and security operations
        </p>
      </div>


      {/* =====================================================
          RIGHT
      ===================================================== */}

      <div className="flex items-center gap-3">

        {/* ===================================================
            SEARCH
        =================================================== */}

        <div className="relative">

          <button
            type="button"
            onClick={handleSearchButton}
            className={[
              "flex h-9 w-9 items-center justify-center rounded-md",
              "text-slate-400 transition",
              "hover:bg-slate-100 hover:text-slate-700",
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


          {/* SEARCH DROPDOWN */}

          {searchOpen && (
            <form
              onSubmit={handleSearch}
              className="absolute right-0 top-11 z-[100] w-[320px] rounded-xl border border-slate-200 bg-white p-3 shadow-xl"
            >

              <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3">

                <Search
                  size={16}
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
                  placeholder="Search company pages..."
                  className="h-10 w-full bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400"
                />

              </div>


              <div className="mt-3">

                <p className="px-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Quick search
                </p>


                <div className="mt-2 grid grid-cols-2 gap-1">

                  <button
                    type="button"
                    onClick={() => {
                      navigate(
                        "/company/reports"
                      );
                      closeMenus();
                    }}
                    className="flex items-center gap-2 rounded-md px-2.5 py-2 text-left text-[11px] text-slate-600 hover:bg-slate-50"
                  >
                    <FileText size={14} />
                    Reports
                  </button>


                  <button
                    type="button"
                    onClick={() => {
                      navigate(
                        "/company/programs"
                      );
                      closeMenus();
                    }}
                    className="flex items-center gap-2 rounded-md px-2.5 py-2 text-left text-[11px] text-slate-600 hover:bg-slate-50"
                  >
                    <Bug size={14} />
                    Bug Bounty
                  </button>


                  <button
                    type="button"
                    onClick={() => {
                      navigate(
                        "/company/submissions"
                      );
                      closeMenus();
                    }}
                    className="flex items-center gap-2 rounded-md px-2.5 py-2 text-left text-[11px] text-slate-600 hover:bg-slate-50"
                  >
                    <ShieldCheck size={14} />
                    Submissions
                  </button>


                  <button
                    type="button"
                    onClick={() => {
                      navigate(
                        "/company/dashboard"
                      );
                      closeMenus();
                    }}
                    className="flex items-center gap-2 rounded-md px-2.5 py-2 text-left text-[11px] text-slate-600 hover:bg-slate-50"
                  >
                    <ShieldCheck size={14} />
                    Dashboard
                  </button>

                </div>

              </div>

            </form>
          )}

        </div>


        {/* ===================================================
            NOTIFICATIONS
        =================================================== */}

        <div className="relative">

          <button
            type="button"
            onClick={handleNotificationButton}
            className={[
              "relative flex h-9 w-9 items-center justify-center rounded-md",
              "text-slate-400 transition",
              "hover:bg-slate-100 hover:text-slate-700",
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


          {/* NOTIFICATION PANEL */}

          {notificationOpen && (
            <div className="absolute right-0 top-11 z-[100] w-[320px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">

              {/* HEADER */}

              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">

                <div>

                  <h3 className="text-xs font-semibold text-slate-800">
                    Notifications
                  </h3>

                  <p className="mt-0.5 text-[10px] text-slate-400">
                    Recent company activity
                  </p>

                </div>

                <span className="rounded-full bg-blue-50 px-2 py-1 text-[9px] font-semibold text-blue-600">
                  New
                </span>

              </div>


              {/* NOTIFICATION */}

              <div className="border-b border-slate-100 px-4 py-4">

                <div className="flex gap-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <ShieldCheck size={16} />
                  </div>


                  <div>

                    <p className="text-[11px] font-semibold text-slate-800">
                      Company account active
                    </p>

                    <p className="mt-1 text-[10px] leading-4 text-slate-400">
                      Your company security workspace is ready to use.
                    </p>

                  </div>

                </div>

              </div>


              {/* SECOND NOTIFICATION */}

              <div className="px-4 py-4">

                <div className="flex gap-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <Bug size={16} />
                  </div>


                  <div>

                    <p className="text-[11px] font-semibold text-slate-800">
                      Bug bounty workspace
                    </p>

                    <p className="mt-1 text-[10px] leading-4 text-slate-400">
                      Manage your company's programs and vulnerability reports.
                    </p>

                  </div>

                </div>

              </div>


              {/* VIEW */}

              <div className="border-t border-slate-100 p-2">

                <button
                  type="button"
                  onClick={() => {
                    navigate(
                      "/company/reports"
                    );
                    closeMenus();
                  }}
                  className="w-full rounded-md py-2 text-[10px] font-medium text-blue-600 hover:bg-blue-50"
                >
                  View company reports
                </button>

              </div>

            </div>
          )}

        </div>


        {/* DIVIDER */}

        <div className="h-7 w-px bg-[var(--color-border)]" />


        {/* ===================================================
            COMPANY PROFILE
        =================================================== */}

        <div className="relative">

          <button
            type="button"
            onClick={handleProfileButton}
            className={[
              "flex items-center gap-2 rounded-md px-2 py-1.5",
              "transition hover:bg-slate-50",
              profileOpen
                ? "bg-slate-50"
                : "",
            ].join(" ")}
            aria-label="Company account"
          >

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-[12px] font-semibold text-blue-700">
              CO
            </div>


            <div className="hidden text-left sm:block">

              <p className="text-[12px] font-semibold text-slate-800">
                Company
              </p>

              <p className="text-[10px] text-slate-400">
                Organization account
              </p>

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


          {/* PROFILE MENU */}

          {profileOpen && (
            <div className="absolute right-0 top-12 z-[100] w-[230px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">

              {/* ACCOUNT */}

              <div className="border-b border-slate-100 px-4 py-3">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">
                    CO
                  </div>

                  <div>

                    <p className="text-xs font-semibold text-slate-800">
                      Company
                    </p>

                    <p className="text-[10px] text-slate-400">
                      Organization account
                    </p>

                  </div>

                </div>

              </div>


              {/* PROFILE */}

              <Link
                to="/company/profile"
                onClick={() =>
                  setProfileOpen(false)
                }
                className="flex items-center gap-3 px-4 py-3 text-xs text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              >

                <User size={15} />

                Company Profile

              </Link>


              {/* SETTINGS */}

              <Link
                to="/company/settings"
                onClick={() =>
                  setProfileOpen(false)
                }
                className="flex items-center gap-3 px-4 py-3 text-xs text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              >

                <Settings size={15} />

                Settings

              </Link>


              {/* LOGOUT */}

              <div className="border-t border-slate-100 p-1.5">

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-xs text-red-500 transition hover:bg-red-50 hover:text-red-600"
                >

                  <LogOut size={15} />

                  Log out

                </button>

              </div>

            </div>
          )}

        </div>


        {/* ===================================================
            LOGOUT
        =================================================== */}

        <button
          onClick={handleLogout}
          type="button"
          className="flex items-center gap-1.5 rounded-md px-2.5 py-2 text-[11px] font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
        >

          <LogOut size={14} />

          <span className="hidden md:inline">
            Log out
          </span>

        </button>

      </div>

    </header>
  );
}
