import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Validate that AWS credentials are provided
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  console.warn('AWS credentials not set in environment variables');
}

if (!process.env.AWS_REGION) {
  console.warn('AWS_REGION not set in environment variables');
}

if (!process.env.AWS_S3_BUCKET_NAME) {
  console.warn('AWS_S3_BUCKET_NAME not set in environment variables');
}

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const bucketName = process.env.AWS_S3_BUCKET_NAME || '';

/**
 * Upload a file to S3
 * @param key S3 object key (file path)
 * @param body File content (Buffer, string, or Readable stream)
 * @param contentType MIME type of the file
 * @returns S3 upload result
 */
export async function uploadFile(key: string, body: any, contentType?: string): Promise<string> {
  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
      Metadata: {
        uploadedAt: new Date().toISOString(),
      },
    });
    
    await s3Client.send(command);
    
    // Return the URL of the uploaded file
    return `https://${bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw new Error(`Failed to upload file: ${error}`);
  }
}

/**
 * Generate a presigned URL for uploading a file
 * @param key S3 object key (file path)
 * @param expiresIn URL expiration time in seconds (default: 3600)
 * @returns Presigned URL for upload
 */
export async function getUploadUrl(key: string, expiresIn: number = 3600): Promise<string> {
  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    
    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error('Error generating S3 upload URL:', error);
    throw new Error(`Failed to generate upload URL: ${error}`);
  }
}

/**
 * Generate a presigned URL for downloading a file
 * @param key S3 object key (file path)
 * @param expiresIn URL expiration time in seconds (default: 3600)
 * @returns Presigned URL for download
 */
export async function getDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    
    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error('Error generating S3 download URL:', error);
    throw new Error(`Failed to generate download URL: ${error}`);
  }
}

/**
 * Delete a file from S3
 * @param key S3 object key (file path)
 * @returns Deletion confirmation
 */
export async function deleteFile(key: string): Promise<boolean> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    
    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    return false;
  }
}

/**
 * Get file metadata
 * @param key S3 object key (file path)
 * @returns File metadata
 */
export async function getFileMetadata(key: string): Promise<any> {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    
    const response = await s3Client.send(command);
    return {
      contentType: response.ContentType,
      contentLength: response.ContentLength,
      lastModified: response.LastModified,
      metadata: response.Metadata,
    };
  } catch (error) {
    console.error('Error getting file metadata from S3:', error);
    throw new Error(`Failed to get file metadata: ${error}`);
  }
}

export { s3Client, bucketName };