import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getAsset } from "../../api/assets";
import { getProjects } from "../../api/projects";
import CompanyLayout from "../../components/company/CompanyLayout";

interface Asset {
  id: number;
  name: string;
  asset_type: string;
  value: string;
  status: string;
  project_id?: number | null;
  company_id: number;
  created_at: string;
  updated_at: string;
}

interface Project {
  id: number;
  name: string;
}

export default function AssetDetailsPage() {
  const { id } = useParams();

  const [asset, setAsset] =
    useState<Asset | null>(null);

  const [project, setProject] =
    useState<Project | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadAsset();
  }, [id]);

  async function loadAsset() {
    try {
      setLoading(true);

      const assetData = await getAsset(
        Number(id)
      );

      setAsset(assetData);

      if (assetData.project_id) {
        const projects = await getProjects();

        const selectedProject =
          projects.find(
            (item: Project) =>
              item.id === assetData.project_id
          );

        setProject(
          selectedProject ?? null
        );
      }

    } catch (err) {
      console.error(
        "Failed to load asset:",
        err
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
  return (
    <CompanyLayout title="Asset Details">
      <div className="p-8">
        Loading asset...
      </div>
    </CompanyLayout>
  );
}

  if (!asset) {
  return (
    <CompanyLayout title="Asset Details">
      <div className="p-8">

        <h1 className="text-2xl font-bold">
          Asset not found
        </h1>

        <Link
          to="/company/assets"
          className="text-blue-600 hover:underline mt-4 inline-block"
        >
          ← Back to Assets
        </Link>

            </div>
    </CompanyLayout>
  );
}

  return (
  <CompanyLayout title="Asset Details">
    <div className="p-8">

      {/* Back */}

      <Link
        to="/company/assets"
        className="text-blue-600 hover:underline"
      >
        ← Back to Assets
      </Link>


      {/* Header */}

      <div className="mt-5 flex justify-between items-center">

        <div>

          <h1 className="text-3xl font-bold">
            {asset.name}
          </h1>

          <p className="text-gray-500 mt-1">
            Asset Details
          </p>

        </div>

        <span
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            asset.status === "Active"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {asset.status}
        </span>

      </div>


      {/* Information */}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Asset Type */}

        <div className="border rounded-xl p-6">

          <h2 className="font-semibold text-gray-500">
            Asset Type
          </h2>

          <p className="text-lg font-medium mt-2">
            {asset.asset_type}
          </p>

        </div>


        {/* Asset Value */}

        <div className="border rounded-xl p-6">

          <h2 className="font-semibold text-gray-500">
            Asset Value
          </h2>

          <p className="text-lg font-medium mt-2 break-all">
            {asset.value}
          </p>

        </div>


        {/* Project */}

        <div className="border rounded-xl p-6">

          <h2 className="font-semibold text-gray-500">
            Project
          </h2>

          {project ? (
            <Link
              to={`/company/projects/${project.id}`}
              className="text-blue-600 hover:underline text-lg font-medium mt-2 inline-block"
            >
              {project.name}
            </Link>
          ) : (
            <p className="text-gray-500 mt-2">
              No Project Assigned
            </p>
          )}

        </div>


        {/* Asset ID */}

        <div className="border rounded-xl p-6">

          <h2 className="font-semibold text-gray-500">
            Asset ID
          </h2>

          <p className="text-lg font-medium mt-2">
            #{asset.id}
          </p>

        </div>

      </div>


      {/* Timestamps */}

      <div className="mt-8 border rounded-xl p-6">

        <h2 className="text-xl font-bold mb-4">
          Record Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div>

            <p className="text-sm text-gray-500">
              Created
            </p>

            <p className="font-medium mt-1">
              {new Date(
                asset.created_at
              ).toLocaleString()}
            </p>

          </div>

          <div>

            <p className="text-sm text-gray-500">
              Last Updated
            </p>

            <p className="font-medium mt-1">
              {new Date(
                asset.updated_at
              ).toLocaleString()}
            </p>

          </div>

        </div>

      </div>


      {/* Security Context */}

      <div className="mt-8 border rounded-xl p-6">

        <h2 className="text-xl font-bold mb-3">
          Security Context
        </h2>

        <p className="text-gray-600">
          This asset belongs to the authenticated
          company and can only be accessed through
          company-scoped asset operations.
        </p>

      </div>

            </div>
  </CompanyLayout>
  );
}