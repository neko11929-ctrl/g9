import "server-only";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Upload } from "@aws-sdk/lib-storage";

export const PRIVATE_BUCKET = process.env.R2_PRIVATE_BUCKET!;
export const PUBLIC_BUCKET = process.env.R2_PUBLIC_BUCKET!;

let client: S3Client | null = null;
function s3() {
  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }
  return client;
}

export function r2Configured() {
  return !!(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    PRIVATE_BUCKET &&
    PUBLIC_BUCKET
  );
}

export function presignPut(bucket: string, key: string, contentType: string, expires = 3600) {
  return getSignedUrl(s3(), new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType }), {
    expiresIn: expires,
  });
}

/** Signed GET. With `downloadName`, forces a file download with the right headers. */
const VIDEO_CONTENT_TYPES: Record<string, string> = {
  mp4: "video/mp4",
  mov: "video/quicktime",
  webm: "video/webm",
};

export function presignGet(bucket: string, key: string, opts?: { downloadName?: string; expires?: number; contentType?: string }) {
  const extension = key.split(".").pop()?.toLowerCase() ?? "";
  const contentType = opts?.contentType ?? VIDEO_CONTENT_TYPES[extension] ?? "application/octet-stream";
  return getSignedUrl(
    s3(),
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
      ResponseContentType: contentType,
      ...(opts?.downloadName
        ? { ResponseContentDisposition: `attachment; filename="${opts.downloadName}"` }
        : {}),
    }),
    { expiresIn: opts?.expires ?? 300 }
  );
}

export async function headObject(bucket: string, key: string) {
  try {
    const r = await s3().send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return { size: Number(r.ContentLength ?? 0), type: r.ContentType ?? "" };
  } catch {
    return null;
  }
}

export async function deleteObject(bucket: string, key: string | null | undefined) {
  if (!key) return;
  try {
    await s3().send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  } catch {
    /* best effort */
  }
}

export async function uploadStream(bucket: string, key: string, body: ReadableStream | Buffer, contentType: string) {
  const { Readable } = await import("node:stream");
  const payload = Buffer.isBuffer(body) ? body : Readable.fromWeb(body as never);
  await new Upload({ client: s3(), params: { Bucket: bucket, Key: key, Body: payload, ContentType: contentType } }).done();
}

