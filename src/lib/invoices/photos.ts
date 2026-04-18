import { createAdminClient } from "@/lib/supabase/admin";

const PHOTO_BUCKET = "invoice-photos";
const SIGNED_URL_EXPIRES_IN_SECONDS = 60 * 30;

function getStorageBaseUrl() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return supabaseUrl
    ? `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/`
    : null;
}

export function resolveInvoicePhotoPath(photoUrl: string | null | undefined) {
  if (!photoUrl) {
    return null;
  }

  if (!photoUrl.startsWith("http")) {
    return photoUrl;
  }

  const storageBaseUrl = getStorageBaseUrl();
  if (!storageBaseUrl || !photoUrl.startsWith(storageBaseUrl)) {
    return null;
  }

  const parsedUrl = new URL(photoUrl);
  const path = parsedUrl.pathname.split("/object/")[1];

  if (!path) {
    return null;
  }

  const normalizedPath = decodeURIComponent(path);

  if (normalizedPath.startsWith(`public/${PHOTO_BUCKET}/`)) {
    return normalizedPath.replace(`public/${PHOTO_BUCKET}/`, "");
  }

  if (normalizedPath.startsWith(`sign/${PHOTO_BUCKET}/`)) {
    return normalizedPath.replace(`sign/${PHOTO_BUCKET}/`, "");
  }

  return null;
}

export async function createInvoicePhotoSignedUrl(photoUrl: string | null | undefined) {
  if (!photoUrl) {
    return null;
  }

  const photoPath = resolveInvoicePhotoPath(photoUrl);
  if (!photoPath) {
    return photoUrl;
  }

  try {
    const admin = createAdminClient();
    const { data, error } = await admin.storage
      .from(PHOTO_BUCKET)
      .createSignedUrl(photoPath, SIGNED_URL_EXPIRES_IN_SECONDS);

    if (error || !data?.signedUrl) {
      return null;
    }

    return data.signedUrl;
  } catch {
    return null;
  }
}

export async function attachSignedPhotoUrl<T extends { photo_url: string | null }>(item: T) {
  return {
    ...item,
    photo_url: await createInvoicePhotoSignedUrl(item.photo_url),
  };
}

export async function attachSignedPhotoUrls<T extends { photo_url: string | null }>(items: T[]) {
  return Promise.all(items.map((item) => attachSignedPhotoUrl(item)));
}

export async function removeInvoicePhotoObject(photoUrl: string | null | undefined) {
  const photoPath = resolveInvoicePhotoPath(photoUrl);
  if (!photoPath) {
    return;
  }

  try {
    const admin = createAdminClient();
    await admin.storage.from(PHOTO_BUCKET).remove([photoPath]);
  } catch (err) {
    console.warn("Failed to remove photo from storage:", err);
  }
}

export { PHOTO_BUCKET };
