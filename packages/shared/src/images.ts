export type PreparedJobImage = {
  file: File;
  originalFileName: string;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  mimeType: string;
  width: number;
  height: number;
};

const MAX_IMAGE_DIMENSION = 1600;
const TARGET_QUALITY = 0.78;

function getCanvasMimeType(): "image/webp" | "image/jpeg" {
  if (typeof document === "undefined") {
    return "image/jpeg";
  }

  const canvas = document.createElement("canvas");
  return canvas.toDataURL("image/webp").startsWith("data:image/webp") ? "image/webp" : "image/jpeg";
}

function buildCompressedName(fileName: string, mimeType: string): string {
  const baseName = fileName.replace(/\.[^.]+$/, "") || "job-image";
  const extension = mimeType === "image/webp" ? "webp" : "jpg";
  return `${baseName}.${extension}`;
}

async function loadImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);

  try {
    const image = new Image();
    image.decoding = "async";
    image.src = url;
    await image.decode();
    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function getTargetSize(width: number, height: number): { width: number; height: number } {
  const largestSide = Math.max(width, height);

  if (largestSide <= MAX_IMAGE_DIMENSION) {
    return { width, height };
  }

  const scale = MAX_IMAGE_DIMENSION / largestSide;
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale)
  };
}

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Không thể nén ảnh. Vui lòng thử ảnh khác."));
          return;
        }

        resolve(blob);
      },
      mimeType,
      quality
    );
  });
}

export async function prepareJobImageForUpload(file: File): Promise<PreparedJobImage> {
  if (typeof document === "undefined") {
    return {
      file,
      originalFileName: file.name,
      originalSizeBytes: file.size,
      compressedSizeBytes: file.size,
      mimeType: file.type || "application/octet-stream",
      width: 0,
      height: 0
    };
  }

  const image = await loadImage(file);
  const targetSize = getTargetSize(image.naturalWidth, image.naturalHeight);
  const canvas = document.createElement("canvas");
  canvas.width = targetSize.width;
  canvas.height = targetSize.height;

  const context = canvas.getContext("2d", { alpha: false });
  if (!context) {
    throw new Error("Trình duyệt không hỗ trợ xử lý ảnh.");
  }

  context.drawImage(image, 0, 0, targetSize.width, targetSize.height);

  const mimeType = getCanvasMimeType();
  const blob = await canvasToBlob(canvas, mimeType, TARGET_QUALITY);
  const compressedFile = new File([blob], buildCompressedName(file.name, mimeType), {
    type: mimeType,
    lastModified: Date.now()
  });

  const finalFile = compressedFile.size < file.size ? compressedFile : file;
  const finalMimeType = finalFile.type || file.type || mimeType;

  return {
    file: finalFile,
    originalFileName: file.name,
    originalSizeBytes: file.size,
    compressedSizeBytes: finalFile.size,
    mimeType: finalMimeType,
    width: targetSize.width,
    height: targetSize.height
  };
}
