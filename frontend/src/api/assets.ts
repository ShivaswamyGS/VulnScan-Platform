import { companyApiClient } from "./companyClient";

export async function getAssets() {
  const { data } = await companyApiClient.get("/assets");
  return data;
}

export async function getAsset(id: number) {
  const { data } = await companyApiClient.get(
    `/assets/${id}`
  );

  return data;
}

export async function createAsset(asset: any) {
  const { data } = await companyApiClient.post("/assets", asset);
  return data;
}

export async function updateAsset(id: number, asset: any) {
  const { data } = await companyApiClient.put(`/assets/${id}`, asset);
  return data;
}

export async function deleteAsset(id: number) {
  await companyApiClient.delete(`/assets/${id}`);
}