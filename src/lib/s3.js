import { S3Client, PutObjectCommand, CopyObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

const BUCKET = process.env.S3_BUCKET_NAME

export async function generatePresignedUrl(key, contentType, expiresIn = 300) {
  const command = new PutObjectCommand({
    Bucket:      BUCKET,
    Key:         key,
    ContentType: contentType,
  })
  const url = await getSignedUrl(s3, command, { expiresIn })
  return url
}

export async function moveObject(sourceKey, destKey) {
  await s3.send(new CopyObjectCommand({
    Bucket:     BUCKET,
    CopySource: `${BUCKET}/${sourceKey}`,
    Key:        destKey,
  }))
  await s3.send(new DeleteObjectCommand({
    Bucket: BUCKET,
    Key:    sourceKey,
  }))
}

export async function generatePresignedGetUrl(key, expiresIn = 3600) {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key })
  return getSignedUrl(s3, command, { expiresIn })
}

/** Returns true if the string looks like an S3 key (not a full URL) */
export function isS3Key(value) {
  return value && !value.startsWith('http')
}
