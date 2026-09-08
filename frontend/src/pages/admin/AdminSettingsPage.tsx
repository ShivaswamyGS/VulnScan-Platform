import React, { useEffect, useState } from "react";
import {
  Shield,
  Bell,
  BrainCircuit,
  Settings as SettingsIcon,
  X,
  Save,
  CheckCircle2,
} from "lucide-react";

type Section = "security" | "notifications" | "ai" | "system" | null;

type SettingsState = {
  twoFactor: boolean;
  loginAlerts: boolean;
  sessionTimeout: string;
  emailNotifications: boolean;
  criticalAlerts: boolean;
  reportNotifications: boolean;
  aiEnabled: boolean;
  autoPrediction: boolean;
  confidenceThreshold: string;
  maintenanceMode: boolean;
  auditLogging: boolean;
  maxUploadSize: string;
};

const DEFAULT_SETTINGS: SettingsState = {
  twoFactor: true,
  loginAlerts: true,
  sessionTimeout: "30",
  emailNotifications: true,
  criticalAlerts: true,
  reportNotifications: true,
  aiEnabled: true,
  autoPrediction: true,
  confidenceThreshold: "70",
  maintenanceMode: false,
  auditLogging: true,
  maxUploadSize: "10",
};

export default function AdminSettingsPage() {
  const [activeSection, setActiveSection] = useState<Section>(null);
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("admin_platform_settings");
      if (stored) {
        setSettings({
          ...DEFAULT_SETTINGS,
          ...JSON.parse(stored),
        });
      }
    } catch {
      setSettings(DEFAULT_SETTINGS);
    }
  }, []);

  function updateSetting<K extends keyof SettingsState>(
    key: K,
    value: SettingsState[K]
  ) {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
    setSaved(false);
  }

  function saveSettings() {
    localStorage.setItem(
      "admin_platform_settings",
      JSON.stringify(settings)
    );
    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 2000);
  }

  function openSection(section: Section) {
    setSaved(false);
    setActiveSection(section);
  }

  function closeSection() {
    setActiveSection(null);
    setSaved(false);
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-xs text-slate-500">
          Manage administrator and platform settings.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-5">
          <h2 className="text-sm font-bold text-slate-900">
            Platform Settings
          </h2>
          <p className="mt-1 text-[11px] text-slate-400">
            Administrator configuration and security preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
          <SettingsCard
            icon={<Shield size={19} />}
            title="Security"
            description="Configure security-related platform preferences."
            iconClass="bg-blue-50 text-blue-600"
            onClick={() => openSection("security")}
          />

          <SettingsCard
            icon={<Bell size={19} />}
            title="Notifications"
            description="Manage administrator notification preferences."
            iconClass="bg-blue-50 text-blue-600"
            onClick={() => openSection("notifications")}
          />

          <SettingsCard
            icon={<BrainCircuit size={19} />}
            title="AI Configuration"
            description="Manage AI training and prediction configuration."
            iconClass="bg-purple-50 text-purple-600"
            onClick={() => openSection("ai")}
          />

          <SettingsCard
            icon={<SettingsIcon size={19} />}
            title="System"
            description="Manage general platform configuration."
            iconClass="bg-slate-100 text-slate-600"
            onClick={() => openSection("system")}
          />
        </div>
      </div>

      {activeSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  {activeSection === "security" && <Shield size={18} />}
                  {activeSection === "notifications" && <Bell size={18} />}
                  {activeSection === "ai" && <BrainCircuit size={18} />}
                  {activeSection === "system" && <SettingsIcon size={18} />}
                </div>

                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    {activeSection === "security" && "Security Settings"}
                    {activeSection === "notifications" && "Notification Settings"}
                    {activeSection === "ai" && "AI Configuration"}
                    {activeSection === "system" && "System Settings"}
                  </h2>
                  <p className="text-[10px] text-slate-400">
                    Configure platform preferences
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeSection}
                className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close settings"
              >
                <X size={17} />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-5">
              {activeSection === "security" && (
                <div className="space-y-5">
                  <SettingToggle
                    title="Two-factor authentication"
                    description="Require additional authentication for administrator accounts."
                    checked={settings.twoFactor}
                    onChange={(value) => updateSetting("twoFactor", value)}
                  />
                  <SettingToggle
                    title="Login alerts"
                    description="Record and notify administrators about login activity."
                    checked={settings.loginAlerts}
                    onChange={(value) => updateSetting("loginAlerts", value)}
                  />
                  <SelectSetting
                    label="Session timeout"
                    value={settings.sessionTimeout}
                    onChange={(value) => updateSetting("sessionTimeout", value)}
                    options={[
                      ["15", "15 minutes"],
                      ["30", "30 minutes"],
                      ["60", "1 hour"],
                      ["120", "2 hours"],
                    ]}
                  />
                </div>
              )}

              {activeSection === "notifications" && (
                <div className="space-y-5">
                  <SettingToggle
                    title="Email notifications"
                    description="Send important platform notifications by email."
                    checked={settings.emailNotifications}
                    onChange={(value) =>
                      updateSetting("emailNotifications", value)
                    }
                  />
                  <SettingToggle
                    title="Critical severity alerts"
                    description="Notify administrators when critical vulnerabilities are reported."
                    checked={settings.criticalAlerts}
                    onChange={(value) => updateSetting("criticalAlerts", value)}
                  />
                  <SettingToggle
                    title="Report notifications"
                    description="Notify administrators when report status changes."
                    checked={settings.reportNotifications}
                    onChange={(value) =>
                      updateSetting("reportNotifications", value)
                    }
                  />
                </div>
              )}

              {activeSection === "ai" && (
                <div className="space-y-5">
                  <SettingToggle
                    title="AI vulnerability analysis"
                    description="Enable AI-assisted vulnerability analysis."
                    checked={settings.aiEnabled}
                    onChange={(value) => updateSetting("aiEnabled", value)}
                  />
                  <SettingToggle
                    title="Automatic severity prediction"
                    description="Automatically predict severity for submitted vulnerability reports."
                    checked={settings.autoPrediction}
                    onChange={(value) =>
                      updateSetting("autoPrediction", value)
                    }
                  />
                  <SelectSetting
                    label="Minimum confidence threshold"
                    value={settings.confidenceThreshold}
                    onChange={(value) =>
                      updateSetting("confidenceThreshold", value)
                    }
                    options={[
                      ["50", "50%"],
                      ["60", "60%"],
                      ["70", "70%"],
                      ["80", "80%"],
                      ["90", "90%"],
                    ]}
                  />
                </div>
              )}

              {activeSection === "system" && (
                <div className="space-y-5">
                  <SettingToggle
                    title="Maintenance mode"
                    description="Temporarily restrict normal platform access."
                    checked={settings.maintenanceMode}
                    onChange={(value) =>
                      updateSetting("maintenanceMode", value)
                    }
                  />
                  <SettingToggle
                    title="Audit logging"
                    description="Record administrator and security-sensitive actions."
                    checked={settings.auditLogging}
                    onChange={(value) =>
                      updateSetting("auditLogging", value)
                    }
                  />
                  <SelectSetting
                    label="Maximum upload size"
                    value={settings.maxUploadSize}
                    onChange={(value) => updateSetting("maxUploadSize", value)}
                    options={[
                      ["5", "5 MB"],
                      ["10", "10 MB"],
                      ["25", "25 MB"],
                      ["50", "50 MB"],
                    ]}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
              <div>
                {saved && (
                  <div className="flex items-center gap-2 text-xs font-medium text-green-600">
                    <CheckCircle2 size={15} />
                    Settings saved
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={closeSection}
                  className="rounded-md border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={saveSettings}
                  className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  <Save size={14} />
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsCard({
  icon,
  title,
  description,
  iconClass,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  iconClass: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group rounded-lg border border-slate-200 bg-white p-5 text-left transition hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-sm"
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconClass}`}
        >
          {icon}
        </div>
        <div>
          <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
            {title}
          </h3>
          <p className="mt-1 text-[10px] leading-5 text-slate-400">
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}

function SettingToggle({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-5 rounded-lg border border-slate-200 p-4">
      <div>
        <p className="text-xs font-semibold text-slate-800">{title}</p>
        <p className="mt-1 text-[10px] leading-4 text-slate-400">
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-blue-600" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

function SelectSetting({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-700">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 h-10 w-full rounded-md border border-slate-200 px-3 text-xs outline-none focus:border-blue-500"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </div>
  );
}