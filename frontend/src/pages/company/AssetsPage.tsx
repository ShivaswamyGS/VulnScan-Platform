import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

import {
  getAssets,
  deleteAsset,
} from "../../api/assets";

import { getProjects } from "../../api/projects";
import CompanyLayout from "../../components/company/CompanyLayout";

import AssetModal from "../../components/assets/AssetModal";

export default function AssetsPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [openModal, setOpenModal] = useState(false);
  const [selectedAsset, setSelectedAsset] =
    useState<any>(null);

  useEffect(() => {
    loadAssets();
    loadProjects();
  }, []);

  useEffect(() => {
    const value = search.toLowerCase();

    let filtered = assets.filter((asset) => {
      const projectName =
        projects.find(
          (project) =>
            project.id === asset.project_id
        )?.name ?? "";

      return (
        asset.name
          .toLowerCase()
          .includes(value) ||
        asset.asset_type
          .toLowerCase()
          .includes(value) ||
        String(asset.value)
          .toLowerCase()
          .includes(value) ||
        projectName
          .toLowerCase()
          .includes(value)
      );
    });

    if (statusFilter !== "All") {
      filtered = filtered.filter(
        (asset) =>
          asset.status === statusFilter
      );
    }

    setFilteredAssets(filtered);
  }, [
    search,
    statusFilter,
    assets,
    projects,
  ]);

  async function loadAssets() {
    try {
      const data = await getAssets();

      setAssets(data);
      setFilteredAssets(data);
    } catch (err) {
      console.error(
        "Failed to load assets:",
        err
      );
    }
  }

  async function loadProjects() {
    try {
      const data = await getProjects();

      setProjects(data);
    } catch (err) {
      console.error(
        "Failed to load projects:",
        err
      );
    }
  }

  async function handleDelete(id: number) {
    const ok = window.confirm(
      "Delete this asset?"
    );

    if (!ok) return;

    try {
      await deleteAsset(id);

      await loadAssets();
    } catch (err) {
      console.error(err);
      alert("Failed to delete asset");
    }
  }

  const totalAssets = assets.length;

  const activeAssets = assets.filter(
    (asset) =>
      asset.status === "Active"
  ).length;

  const inactiveAssets = assets.filter(
    (asset) =>
      asset.status === "Inactive"
  ).length;

  const assignedAssets = assets.filter(
    (asset) =>
      asset.project_id !== null &&
      asset.project_id !== undefined
  ).length;

  return (
  <CompanyLayout title="Assets">
    {/* existing AssetsPage content */}
  

      {/* Header */}

      <div className="flex justify-between items-center mb-6">

        <h1 className="text-3xl font-bold">
          Assets
        </h1>

        <button
          onClick={() => {
            setSelectedAsset(null);
            setOpenModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Asset
        </button>

      </div>


      {/* Statistics */}

      <div className="grid grid-cols-4 gap-5 mb-6">

        <div className="border rounded-xl p-5 shadow-sm">

          <h3 className="text-gray-500 text-sm">
            Total Assets
          </h3>

          <p className="text-3xl font-bold mt-2">
            {totalAssets}
          </p>

        </div>


        <div className="border rounded-xl p-5 shadow-sm">

          <h3 className="text-gray-500 text-sm">
            Active
          </h3>

          <p className="text-3xl font-bold text-green-600 mt-2">
            {activeAssets}
          </p>

        </div>


        <div className="border rounded-xl p-5 shadow-sm">

          <h3 className="text-gray-500 text-sm">
            Inactive
          </h3>

          <p className="text-3xl font-bold text-red-600 mt-2">
            {inactiveAssets}
          </p>

        </div>


        <div className="border rounded-xl p-5 shadow-sm">

          <h3 className="text-gray-500 text-sm">
            Assigned to Projects
          </h3>

          <p className="text-3xl font-bold text-blue-600 mt-2">
            {assignedAssets}
          </p>

        </div>

      </div>


      {/* Search + Filter */}

      <div className="mb-5 flex gap-4 items-center">

        <input
          className="w-80 border rounded-lg px-4 py-2"
          placeholder="Search assets..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
          className="border rounded-lg px-4 py-2"
        >
          <option value="All">
            All Status
          </option>

          <option value="Active">
            Active
          </option>

          <option value="Inactive">
            Inactive
          </option>
        </select>

      </div>


      {/* Results */}

      <div className="mb-3 text-sm text-gray-500">
        Showing {filteredAssets.length} of{" "}
        {totalAssets} assets
      </div>


      {/* Table */}

      <table className="w-full border">

        <thead>

          <tr className="bg-gray-100">

            <th className="p-3 text-left">
              Name
            </th>

            <th className="p-3 text-left">
              Type
            </th>

            <th className="p-3 text-left">
              Value
            </th>

            <th className="p-3 text-left">
              Project
            </th>

            <th className="p-3 text-left">
              Status
            </th>

            <th className="p-3 text-left">
              Actions
            </th>

          </tr>

        </thead>


        <tbody>

          {filteredAssets.length === 0 ? (

            <tr>

              <td
                colSpan={6}
                className="p-8 text-center text-gray-500"
              >
                No assets found.
              </td>

            </tr>

          ) : (

            filteredAssets.map(
              (asset) => {

                const projectName =
                  projects.find(
                    (project) =>
                      project.id ===
                      asset.project_id
                  )?.name;

                return (

                  <tr
                    key={asset.id}
                    className="border-b hover:bg-gray-50"
                  >

                    <td className="p-3 font-medium">
  <Link
    to={`/company/assets/${asset.id}`}
    className="text-blue-600 hover:underline"
  >
    {asset.name}
  </Link>
</td>


                    <td className="p-3">
                      {asset.asset_type}
                    </td>


                    <td className="p-3">
                      {asset.value}
                    </td>


                    <td className="p-3">

                      {projectName ? (
                        <span className="text-blue-600">
                          {projectName}
                        </span>
                      ) : (
                        <span className="text-gray-400">
                          No Project
                        </span>
                      )}

                    </td>


                    <td className="p-3">

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          asset.status ===
                          "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {asset.status}
                      </span>

                    </td>


                    <td className="p-3">

                      <button
                        onClick={() => {
                          setSelectedAsset(
                            asset
                          );

                          setOpenModal(true);
                        }}
                        className="bg-yellow-500 text-white px-3 py-1 rounded mr-2 hover:bg-yellow-600"
                      >
                        Edit
                      </button>


                      <button
                        onClick={() =>
                          handleDelete(
                            asset.id
                          )
                        }
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      >
                        Delete
                      </button>

                    </td>

                  </tr>

                );
              }
            )

          )}

        </tbody>

      </table>


      {/* Asset Modal */}

      <AssetModal
        open={openModal}
        asset={selectedAsset}
        onClose={() => {
          setOpenModal(false);
          setSelectedAsset(null);
        }}
        onSuccess={loadAssets}
      />

        
  </CompanyLayout>
);
}