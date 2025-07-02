import { S3Client } from 'bun';

export const s3 = new S3Client({
  accessKeyId: 'ROOTNAME',
  secretAccessKey: 'CHANGEME123',
  endpoint: 'http://localhost:9000',
  bucket: 'auth',
});
