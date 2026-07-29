const MAX_BYTES = 300 * 1024; // free-tier guardrail: Storage 1GB cap
const MAX_WIDTH = 1600;

const COVER_WIDTH = 1200;
const COVER_HEIGHT = 630;

/**
 * Cover pipeline (design 2i): center-crop to 1.91:1, resize to exactly
 * 1200×630, JPEG-encode under 300KB. No crop editor — crop is automatic.
 */
export async function compressCover(
  file: File
): Promise<{ file: File; originalBytes: number }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.max(COVER_WIDTH / bitmap.width, COVER_HEIGHT / bitmap.height);
  const cropWidth = COVER_WIDTH / scale;
  const cropHeight = COVER_HEIGHT / scale;
  const sx = (bitmap.width - cropWidth) / 2;
  const sy = (bitmap.height - cropHeight) / 2;

  const canvas = document.createElement("canvas");
  canvas.width = COVER_WIDTH;
  canvas.height = COVER_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unavailable");
  ctx.drawImage(bitmap, sx, sy, cropWidth, cropHeight, 0, 0, COVER_WIDTH, COVER_HEIGHT);

  for (const quality of [0.85, 0.7, 0.55, 0.4]) {
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality)
    );
    if (blob && blob.size <= MAX_BYTES) {
      return {
        file: new File([blob], "cover.jpg", { type: "image/jpeg" }),
        originalBytes: file.size,
      };
    }
  }
  throw new Error("Cover too large even after compression");
}

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
