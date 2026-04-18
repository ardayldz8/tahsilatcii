import { NextRequest, NextResponse } from "next/server";
import { badRequest, internalError, notFound } from "@/lib/api/errors";
import { parseRouteParams } from "@/lib/api/validation";
import { safeRevalidateTags } from "@/lib/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getRequestUserId, unauthorizedResponse } from "@/lib/supabase/auth";
import {
  attachSignedPhotoUrl,
  PHOTO_BUCKET,
} from "@/lib/invoices/photos";
import { uuidParamsSchema } from "@/lib/validation/common";

type RouteContext = { params: Promise<{ id: string }> };

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const paramsResult = await parseRouteParams(context.params, uuidParamsSchema);
    if (!paramsResult.success) return paramsResult.response;

    const { id } = paramsResult.data;
    const supabase = await createClient();
    const userId = await getRequestUserId(supabase);
    if (!userId) return unauthorizedResponse();

    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("id, photo_url")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (invoiceError || !invoice) {
      return notFound("Invoice not found");
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return badRequest("File is required");
    }

    if (!file.type.startsWith("image/")) {
      return badRequest("Only image uploads are supported");
    }

    if (file.size > MAX_FILE_SIZE) {
      return badRequest("File size must be 5 MB or smaller");
    }

    const admin = createAdminClient();

    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const sanitizedExtension = fileExtension.replace(/[^a-z0-9]/g, "") || "jpg";
    const filePath = `${userId}/${id}/${Date.now()}.${sanitizedExtension}`;

    const { error: uploadError } = await admin.storage
      .from(PHOTO_BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Photo upload error:", uploadError);
      return internalError(`Fotograf yuklenemedi: ${uploadError.message}`);
    }

    const { error: updateError } = await supabase
      .from("invoices")
      .update({
        photo_url: filePath,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", userId);

    if (updateError) {
      console.error("Invoice update error:", updateError);
      await admin.storage.from(PHOTO_BUCKET).remove([filePath]);
      return internalError(`Fatura guncellenemedi: ${updateError.message}`);
    }

    safeRevalidateTags([
      `invoices:${userId}`,
      `dashboard:${userId}`,
      `customers:${userId}`,
    ]);

    const photoResult = await attachSignedPhotoUrl({ photo_url: filePath });

    return NextResponse.json(photoResult, { status: 201 });
  } catch (err) {
    console.error("Photo POST exception:", err);
    return internalError(err instanceof Error ? err.message : undefined);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const paramsResult = await parseRouteParams(context.params, uuidParamsSchema);
    if (!paramsResult.success) return paramsResult.response;

    const { id } = paramsResult.data;
    const supabase = await createClient();
    const userId = await getRequestUserId(supabase);
    if (!userId) return unauthorizedResponse();

    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("id, photo_url")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (invoiceError || !invoice) {
      return notFound("Invoice not found");
    }

    if (!invoice.photo_url) {
      return notFound("Invoice photo not found");
    }

    const admin = createAdminClient();

    try {
      await admin.storage.from(PHOTO_BUCKET).remove([invoice.photo_url]);
    } catch (removeErr) {
      console.warn("Storage remove warning:", removeErr);
    }

    const { error: updateError } = await supabase
      .from("invoices")
      .update({
        photo_url: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", userId);

    if (updateError) {
      console.error("Invoice photo delete update error:", updateError);
      return internalError(updateError.message);
    }

    safeRevalidateTags([
      `invoices:${userId}`,
      `dashboard:${userId}`,
      `customers:${userId}`,
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Photo DELETE exception:", err);
    return internalError(err instanceof Error ? err.message : undefined);
  }
}
