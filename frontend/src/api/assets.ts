import { companyApiClient } from "./companyClient";

// =========================================================
// COMPANY ASSETS
// Backend prefix: /company/assets
// =========================================================

export async function getAssets() {
  const { data } = await companyApiClient.get("/company/assets/");
  return data;
}

export async function getAsset(id: number) {
  const { data } = await companyApiClient.get(
    `/company/assets/${id}`
  );

  return data;
}

export async function createAsset(asset: any) {
  const { data } = await companyApiClient.post(
    "/company/assets/",
    asset
  );

  return data;
}

export async function updateAsset(
  id: number,
  asset: any
) {
  const { data } = await companyApiClient.put(
    `/company/assets/${id}`,
    asset
  );

  return data;
}

export async function deleteAsset(id: number) {
  await companyApiClient.delete(
    `/company/assets/${id}`
  );
}