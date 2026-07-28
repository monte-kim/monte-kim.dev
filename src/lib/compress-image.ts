const MAX_BYTES = 300 * 1024; // free-tier guardrail: Storage 1GB cap
const MAX_WIDTH = 1600;

/**
 * Client-side image compression before upload: scale to ≤1600px wide and
 * re-encode as JPEG, stepping quality down until under 300KB.
 */
export async function compressImage(file: File): Promise<File> {
  if (file.size <= MAX_BYTES && file.type !== "image/heic") return file;

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_WIDTH / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  for (const quality of [0.85, 0.7, 0.55, 0.4]) {
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality)
    );
    if (blob && blob.size <= MAX_BYTES) {
      return new File([blob], file.name.replace(/\.\w+$/, ".jpg"), {
        type: "image/jpeg",
      });
    }
  }
  throw new Error("Image too large even after compression");
}
