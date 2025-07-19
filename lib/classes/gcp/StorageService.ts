import { Bucket, Storage, GetSignedUrlConfig } from '@google-cloud/storage';
import { BaseStorageService } from './BaseStorageService';

const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || '';
const SERVICE_ACCOUNT_CLIENT_EMAIL = process.env.GCP_CLOUD_SERVICE_ACCOUNT_CLIENT_EMAIL || '';
const SERVICE_ACCOUNT_PRIVATE_KEY = process.env.GCP_CLOUD_SERVICE_ACCOUNT_PRIVATE_KEY || '';
export class StorageService extends BaseStorageService {
  private storage: Storage;
  private storageBucket: Bucket | null = null;
  private path: string | null = null;
  private buffer: Buffer | null = null;

  constructor(storageInstance?: Storage) {
    super(StorageService.name);
    this.storage = storageInstance || new Storage({
      projectId: FIREBASE_PROJECT_ID,
      credentials: {
        client_email: SERVICE_ACCOUNT_CLIENT_EMAIL,
        private_key: SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
    });
  }

  public setBucket(bucketName: string): this {
    this.storageBucket = this.storage.bucket(bucketName);
    this.logger.info(`Bucket set: ${bucketName}`);

    return this;
  }

  public setPath(path: string): this {
    this.path = path;
    this.logger.info(`Path set: ${path}`);

    return this;
  }

  public async setBuffer(file: File): Promise<this> {
    try {
      const bytes = await file.arrayBuffer();
      this.buffer = Buffer.from(bytes);
      this.logger.info(`Buffer set for file: ${file.name}`);

      return this;
    } catch (error) {
      this.logger.error('Error setting buffer', error);
      throw error;
    }
  }

  public async uploadFile(): Promise<void> {
    if (!this.storageBucket || !this.path || !this.buffer) {
      const errorMsg = 'Storage bucket, path, or buffer is not set.';
      this.logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      await this.storageBucket.file(this.path).save(this.buffer);
      this.logger.info(`File uploaded successfully to ${this.path}`);
    } catch (error) {
      this.logger.error('Error uploading file', error);
      throw error;
    }
  }

  public async signedUrl(
    action: 'read' | 'write' | 'delete' | 'resumable', 
    expires: number, 
    contentType: string
  ): Promise<string> {
    if (!this.storageBucket || !this.path) {
      const errorMsg = 'Storage bucket or path is not set.';
      this.logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      const options: GetSignedUrlConfig = {
        version: 'v4',
        action,
        expires,
        // contentType // Do not force the content type to prevent intermittent problems with signed URL generation
      };

      const [url] = await this.storageBucket.file(this.path).getSignedUrl(options);
      this.logger.info(`Generated signed URL: ${url}`);

      return url;
    } catch (error) {
      this.logger.error('Error generating signed URL', error);
      throw error;
    }
  }
}