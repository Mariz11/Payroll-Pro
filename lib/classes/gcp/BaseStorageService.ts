import { LoggerService } from "./LoggerService";

export abstract class BaseStorageService extends LoggerService {
  public abstract setBucket(bucketName: string): this;
  public abstract setPath(path: string): this;
  public abstract setBuffer(file: File): Promise<this>;
  public abstract uploadFile(): Promise<void>;
  public abstract signedUrl(action: string, expires: number, contentType: string): Promise<string>;
}