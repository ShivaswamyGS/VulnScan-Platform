import { useEffect, useState } from "react";
import {
  createProject,
  updateProject,
} from "../../api/projects";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;

  project?: any;
}

export default function ProjectModal({
  open,
  onClose,
  onSuccess,
  project,
}: Props) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    repository_url: "",
    status: "Active",
  });

  useEffect(() => {
  if (project) {
    setForm({
      name: project.name,
      description: project.description,
      repository_url: project.repository_url ?? "",
      status: project.status,
    });
  } else {
    setForm({
      name: "",
      description: "",
      repository_url: "",
      status: "Active",
    });
  }
}, [project, open]);


  if (!open) return null;

async function handleSubmit(
  e: React.FormEvent
) {
  e.preventDefault();

  try {
    setLoading(true);

    if (project) {
      await updateProject(
        project.id,
        form
      );
    } else {
      await createProject(form);
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
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center">

      <div className="bg-white rounded-xl w-[550px] p-6">

        <h2 className="text-2xl font-bold mb-6">
  {project ? "Edit Project" : "Create Project"}
</h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          <input
            className="w-full border rounded-lg p-3"
            placeholder="Project Name"
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
          />

          <textarea
            className="w-full border rounded-lg p-3"
            rows={4}
            placeholder="Description"
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value,
              })
            }
          />

          <input
            className="w-full border rounded-lg p-3"
            placeholder="Repository URL"
            value={form.repository_url}
            onChange={(e) =>
              setForm({
                ...form,
                repository_url:
                  e.target.value,
              })
            }
          />

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
            <option>Active</option>
            <option>Inactive</option>
          </select>

          <div className="flex justify-end gap-3">

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 border rounded-lg"
            >
              Cancel
            </button>

            <button
  disabled={loading}
  className="bg-blue-600 text-white px-5 py-2 rounded-lg"
>
  {loading
    ? "Saving..."
    : project
    ? "Update Project"
    : "Create Project"}
</button>

          </div>

        </form>

      </div>

    </div>
  );
}