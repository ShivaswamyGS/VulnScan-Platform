import { useEffect, useState } from "react";

import {
  createAsset,
  updateAsset,
} from "../../api/assets";

import { getProjects } from "../../api/projects";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  asset?: any;
}

export default function AssetModal({
  open,
  onClose,
  onSuccess,
  asset,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);

  const [form, setForm] = useState({
    name: "",
    asset_type: "",
    value: "",
    status: "Active",
    project_id: "",
  });

  useEffect(() => {
    if (!open) return;

    loadProjects();

    if (asset) {
      setForm({
        name: asset.name ?? "",
        asset_type: asset.asset_type ?? "",
        value: asset.value ?? "",
        status: asset.status ?? "Active",
        project_id:
          asset.project_id !== null &&
          asset.project_id !== undefined
            ? String(asset.project_id)
            : "",
      });
    } else {
      setForm({
        name: "",
        asset_type: "",
        value: "",
        status: "Active",
        project_id: "",
      });
    }
  }, [asset, open]);

  async function loadProjects() {
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (err) {
      console.error("Failed to load projects:", err);
    }
  }

  if (!open) return null;

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    try {
      setLoading(true);

      const payload = {
        name: form.name,
        asset_type: form.asset_type,
        value: form.value,
        status: form.status,
        project_id: form.project_id
          ? Number(form.project_id)
          : null,
      };

      if (asset) {
        await updateAsset(asset.id, payload);
      } else {
        await createAsset(payload);
      }

      onSuccess();
      onClose();

    } catch (err) {
      console.error(err);
      alert("Operation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-xl w-[550px] p-6 shadow-xl">

        <h2 className="text-2xl font-bold mb-6">
          {asset ? "Edit Asset" : "Create Asset"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          {/* Name */}

          <div>
            <label className="block text-sm font-medium mb-1">
              Asset Name
            </label>

            <input
              required
              className="w-full border rounded-lg p-3"
              placeholder="e.g. Main Website"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
            />
          </div>

          {/* Type */}

          <div>
            <label className="block text-sm font-medium mb-1">
              Asset Type
            </label>

            <select
              required
              className="w-full border rounded-lg p-3"
              value={form.asset_type}
              onChange={(e) =>
                setForm({
                  ...form,
                  asset_type: e.target.value,
                })
              }
            >
              <option value="">
                Select asset type
              </option>

              <option value="Domain">
                Domain
              </option>

              <option value="Website">
                Website
              </option>

              <option value="API">
                API
              </option>

              <option value="IP Address">
                IP Address
              </option>

              <option value="Server">
                Server
              </option>

              <option value="Mobile App">
                Mobile App
              </option>

              <option value="Cloud">
                Cloud
              </option>

              <option value="Repository">
                Repository
              </option>

              <option value="Other">
                Other
              </option>
            </select>
          </div>

          {/* Value */}

          <div>
            <label className="block text-sm font-medium mb-1">
              Asset Value
            </label>

            <input
              required
              className="w-full border rounded-lg p-3"
              placeholder="e.g. example.com"
              value={form.value}
              onChange={(e) =>
                setForm({
                  ...form,
                  value: e.target.value,
                })
              }
            />
          </div>

          {/* Project */}

          <div>
            <label className="block text-sm font-medium mb-1">
              Project
            </label>

            <select
              className="w-full border rounded-lg p-3"
              value={form.project_id}
              onChange={(e) =>
                setForm({
                  ...form,
                  project_id: e.target.value,
                })
              }
            >
              <option value="">
                No Project
              </option>

              {projects.map((project) => (
                <option
                  key={project.id}
                  value={project.id}
                >
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}

          <div>
            <label className="block text-sm font-medium mb-1">
              Status
            </label>

            <select
              className="w-full border rounded-lg p-3"
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value,
                })
              }
            >
              <option value="Active">
                Active
              </option>

              <option value="Inactive">
                Inactive
              </option>
            </select>
          </div>

          {/* Buttons */}

          <div className="flex justify-end gap-3 pt-3">

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 border rounded-lg"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : asset
                ? "Update Asset"
                : "Create Asset"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}