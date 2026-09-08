import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import {
  getProjects,
  deleteProject,
} from "../../api/projects";

import ProjectModal from "../../components/projects/ProjectModal";
import CompanyLayout from "../../components/company/CompanyLayout";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [openModal, setOpenModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
  const value = search.toLowerCase();

  let filtered = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(value) ||
      project.description.toLowerCase().includes(value)
  );

  if (statusFilter !== "All") {
    filtered = filtered.filter(
      (project) => project.status === statusFilter
    );
  }

  setFilteredProjects(filtered);

}, [search, statusFilter, projects]);

  async function loadProjects() {
    try {
      const data = await getProjects();
      setProjects(data);
setFilteredProjects(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id: number) {
    const ok = window.confirm(
      "Delete this project?"
    );

    if (!ok) return;

    try {
      await deleteProject(id);
      loadProjects();
    } catch (err) {
      console.error(err);
      alert("Failed to delete project");
    }
  }

  const totalProjects = projects.length;

const activeProjects = projects.filter(
  (project) => project.status === "Active"
).length;

const inactiveProjects = projects.filter(
  (project) => project.status === "Inactive"
).length;

const completion =
  totalProjects === 0
    ? 0
    : Math.round(
        (activeProjects / totalProjects) * 100
      );

 return (
  <CompanyLayout title="Projects">
    <div className="...">

      <div className="flex justify-between items-center mb-6">

        <h1 className="text-3xl font-bold">
          Projects
        </h1>

        <button
          onClick={() => {
            setSelectedProject(null);
            setOpenModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Project
        </button>

      </div>

      <div className="grid grid-cols-4 gap-5 mb-6">

  <div className="border rounded-xl p-5 shadow-sm">
    <h3 className="text-gray-500 text-sm">
      Total Projects
    </h3>

    <p className="text-3xl font-bold mt-2">
      {totalProjects}
    </p>
  </div>

  <div className="border rounded-xl p-5 shadow-sm">
    <h3 className="text-gray-500 text-sm">
      Active
    </h3>

    <p className="text-3xl font-bold text-green-600 mt-2">
      {activeProjects}
    </p>
  </div>

  <div className="border rounded-xl p-5 shadow-sm">
    <h3 className="text-gray-500 text-sm">
      Inactive
    </h3>

    <p className="text-3xl font-bold text-red-600 mt-2">
      {inactiveProjects}
    </p>
  </div>

  <div className="border rounded-xl p-5 shadow-sm">
    <h3 className="text-gray-500 text-sm">
      Completion
    </h3>

    <p className="text-3xl font-bold text-blue-600 mt-2">
      {completion}%
    </p>
  </div>

</div>

      <div className="mb-4 flex gap-4">
  <input
    type="text"
    placeholder="Search projects..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="w-80 border rounded-lg px-4 py-2"
  />
</div>

<select
  value={statusFilter}
  onChange={(e) =>
    setStatusFilter(e.target.value)
  }
  className="border rounded-lg px-4 py-2"
>
  <option>All</option>
  <option>Active</option>
  <option>Inactive</option>
</select>

      <table className="w-full border">

        <thead>

          <tr className="bg-gray-100">

            <th className="p-3 text-left">
              Project Name
            </th>

            <th>Description</th>

            <th>Status</th>

            <th>Actions</th>

          </tr>

        </thead>

       <tbody>

  {filteredProjects.length === 0 ? (

    <tr>

      <td
        colSpan={5}
        className="text-center py-8 text-gray-500"
      >
        No projects found.
      </td>

    </tr>

  ) : (

    filteredProjects.map((project) => (

    <tr
      key={project.id}
      className="border-b"
    >
<td className="p-3">

  <Link
    to={`/company/projects/${project.id}`}
    className="text-blue-600 hover:underline"
  >
    {project.name}
  </Link>

</td>

      <td>
  {project.description}
</td>

<td>
  {project.repository_url ? (
    <a
      href={project.repository_url}
      target="_blank"
      rel="noreferrer"
      className="text-blue-600 hover:underline"
    >
      Open
    </a>
  ) : (
    "-"
  )}
</td>

<td>

  <span
    className={
      project.status === "Active"
        ? "bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
        : "bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm"
    }
  >
    {project.status}
  </span>

</td>

      <td className="space-x-2">

        <button
          onClick={() => {
            setSelectedProject(project);
            setOpenModal(true);
          }}
          className="bg-yellow-500 text-white px-3 py-1 rounded"
        >
          ✏ Edit
        </button>

        <button
          onClick={() => handleDelete(project.id)}
          className="bg-red-600 text-white px-3 py-1 rounded"
        >
          🗑 Delete
        </button>

      </td>

    </tr>

     ))
  )}

</tbody>

      </table>

      <ProjectModal
        open={openModal}
        project={selectedProject}
        onClose={() => {
          setOpenModal(false);
          setSelectedProject(null);
        }}
        onSuccess={loadProjects}
      />

       </div>
  </CompanyLayout>
);
}