"use client";

const EXT_TYPES: Record<string, string> = {
  mp4: "video/mp4", mov: "video/quicktime", webm: "video/webm",
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp",
};

export function typeOf(file: File) {
  return file.type || EXT_TYPES[file.name.split(".").pop()?.toLowerCase() ?? ""] || "";
}

/** Direct-to-R2 upload through a presigned URL, with progress. */
export async function uploadFile(kind: "video" | "thumbnail" | "preview", file: File, onProgress: (pct: number) => void) {
  const contentType = typeOf(file);
  const r = await fetch("/api/admin/upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, contentType, size: file.size }),
  });
  if (!r.ok) {
    const j = await r.json().catch(() => ({}));
    throw new Error(j.error || "upload_failed");
  }
  const { key, url } = (await r.json()) as { key: string; url: string };
  await new Promise<void>((resolve, reject) => {
    const x = new XMLHttpRequest();
    x.open("PUT", url);
    x.setRequestHeader("Content-Type", contentType);
    x.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
    x.onload = () => (x.status >= 200 && x.status < 300 ? resolve() : reject(new Error("upload_failed")));
    x.onerror = () => reject(new Error("network"));
    x.send(file);
  });
  onProgress(100);
  return key;
}

/** Reads dimensions and grabs a still frame from a local video file. */
export function inspectVideo(file: File): Promise<{ width: number; height: number; frame: Blob | null }> {
  return new Promise((resolve, reject) => {
    const v = document.createElement("video");
    const src = URL.createObjectURL(file);
    v.muted = true; v.playsInline = true; v.preload = "metadata"; v.src = src;
    const done = (frame: Blob | null) => { resolve({ width: v.videoWidth, height: v.videoHeight, frame }); URL.revokeObjectURL(src); };
    v.onerror = () => { URL.revokeObjectURL(src); reject(new Error("unreadable")); };
    v.onloadedmetadata = () => { v.currentTime = Math.min(1, (v.duration || 2) / 2); };
    v.onseeked = () => {
      try {
        const scale = Math.min(1, 1280 / v.videoWidth);
        const c = document.createElement("canvas");
        c.width = Math.round(v.videoWidth * scale); c.height = Math.round(v.videoHeight * scale);
        c.getContext("2d")!.drawImage(v, 0, 0, c.width, c.height);
        c.toBlob((b) => done(b), "image/jpeg", 0.85);
      } catch { done(null); }
    };
  });
}
