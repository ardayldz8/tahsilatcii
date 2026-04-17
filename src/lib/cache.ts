import { revalidateTag } from "next/cache";

export function safeRevalidateTags(tags: string[]) {
  for (const tag of tags) {
    try {
      revalidateTag(tag, "max");
    } catch {
      // Ignore in non-request or test environments.
    }
  }
}
