import { apiClient } from "./client";

export interface Bookmark {
  id: number;
  user_id: number;
  program_id: number;
  created_at: string;
}

/**
 * Bookmark a program.
 */
export async function createBookmark(
  programId: number
): Promise<Bookmark> {
  const response =
    await apiClient.post<Bookmark>(
      `/bookmarks/${programId}`
    );

  return response.data;
}

/**
 * Get bookmarks belonging to the
 * authenticated researcher.
 */
export async function getMyBookmarks(): Promise<
  Bookmark[]
> {
  const response =
    await apiClient.get<Bookmark[]>(
      "/bookmarks/"
    );

  return response.data;
}

/**
 * Get a single bookmark.
 */
export async function getBookmarkById(
  bookmarkId: number
): Promise<Bookmark> {
  const response =
    await apiClient.get<Bookmark>(
      `/bookmarks/${bookmarkId}`
    );

  return response.data;
}

/**
 * Delete a bookmark.
 */
export async function deleteBookmark(
  bookmarkId: number
): Promise<void> {
  await apiClient.delete(
    `/bookmarks/${bookmarkId}`
  );
}