import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import { getProjects } from "../../api/projects";
import { getAssets } from "../../api/assets";
import CompanyLayout from "../../components/company/CompanyLayout";
interface Project {
  id: number;
  name: string;
  description: string;
  repository_url?: string;
  status: string;
}

interface Asset {
  id: number;
  name: string;
  asset_type: string;
  value: string;
  status: string;
  project_id?: number | null;
}

export default function ProjectDetailsPage() {
  const { id } = useParams();

  const [project, setProject] =
    useState<Project | null>(null);

  const [assets, setAssets] =
    useState<Asset[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadProject();
  }, [id]);

  async function loadProject() {
    try {
      setLoading(true);

      const [projects, allAssets] =
        await Promise.all([
          getProjects(),
          getAssets(),
        ]);

      const selectedProject = projects.find(
        (p: Project) =>
          p.id === Number(id)
      );

      setProject(
        selectedProject ?? null
      );

      const projectAssets =
        allAssets.filter(
          (asset: Asset) =>
            asset.project_id === Number(id)
        );

      setAssets(projectAssets);

    } catch (err) {
      console.error(
        "Failed to load project:",
        err
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
  return (
    <CompanyLayout title="Project Details">
      <div className="p-8">
        Loading project...
      </div>
    </CompanyLayout>
  );
}

  if (!project) {
  return (
    <CompanyLayout title="Project Details">
      <div className="p-8">

        <h1 className="text-2xl font-bold">
          Project not found
        </h1>

        <Link
          to="/company/projects"
          className="text-blue-600 hover:underline mt-4 inline-block"
        >
          ← Back to Projects
        </Link>

            </div>
    </CompanyLayout>
  );
}

  return (
  <CompanyLayout title="Project Details">
    <div className="p-8">

      {/* Back */}

      <Link
        to="/company/projects"
        className="text-blue-600 hover:underline"
      >
        ← Back to Projects
      </Link>


      {/* Project Header */}

      <div className="mt-5 flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-bold">
            {project.name}
          </h1>

          <p className="text-gray-500 mt-1">
            Project Details
          </p>

        </div>

        <span
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            project.status === "Active"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {project.status}
        </span>

      </div>


      {/* Project Information */}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Description */}

        <div className="border rounded-xl p-6">

          <h2 className="font-semibold text-lg mb-3">
            Description
          </h2>

          <p className="text-gray-600">
            {project.description ||
              "No description available."}
          </p>

        </div>


        {/* Repository */}

        <div className="border rounded-xl p-6">

          <h2 className="font-semibold text-lg mb-3">
            Repository
          </h2>

          {project.repository_url ? (
            <a
              href={project.repository_url}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 underline break-all"
            >
              {project.repository_url}
            </a>
          ) : (
            <p className="text-gray-500">
              Not Available
            </p>
          )}

        </div>

      </div>


      {/* Assets */}

      <div className="mt-10">

        <div className="flex items-center justify-between mb-4">

          <div>

            <h2 className="text-2xl font-bold">
              Project Assets
            </h2>

            <p className="text-gray-500 text-sm mt-1">
              Assets associated with this project
            </p>

          </div>

          <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium">
            {assets.length}{" "}
            {assets.length === 1
              ? "Asset"
              : "Assets"}
          </div>

        </div>


        {assets.length === 0 ? (

          <div className="border rounded-xl p-10 text-center">

            <h3 className="font-semibold text-lg">
              No assets assigned
            </h3>

            <p className="text-gray-500 mt-2">
              This project does not have any
              assets assigned to it yet.
            </p>

            <Link
              to="/company/assets"
              className="inline-block mt-4 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
            >
              Manage Assets
            </Link>

          </div>

        ) : (

          <div className="border rounded-xl overflow-hidden">

            <table className="w-full text-sm">

              <thead>

                <tr className="bg-gray-100 border-b">

                  <th className="p-4 text-left">
                    Asset Name
                  </th>

                  <th className="p-4 text-left">
                    Type
                  </th>

                  <th className="p-4 text-left">
                    Value
                  </th>

                  <th className="p-4 text-left">
                    Status
                  </th>

                </tr>

              </thead>

              <tbody>

                {assets.map((asset) => (

                  <tr
                    key={asset.id}
                    className="border-b last:border-b-0 hover:bg-gray-50"
                  >

                    <td className="p-4 font-medium">
                      {asset.name}
                    </td>

                    <td className="p-4">
                      {asset.asset_type}
                    </td>

                    <td className="p-4">
                      {asset.value}
                    </td>

                    <td className="p-4">

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          asset.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {asset.status}
                      </span>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

        </div>
  </CompanyLayout>
  );
}