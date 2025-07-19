import { DocumentDataProps, ChangeTypeProps } from "lib/interfaces";

export abstract class BaseFirestoreService {
  public abstract setCollectionName(collectionName: string): this;
  public abstract fetchCollection(
    condition: object | null,
    orderByField: string,
    orderDirection: "asc" | "desc"
  ): Promise<any>;
  public abstract listenToDocument(
    docId: string, 
    callback: (data: DocumentDataProps) => void
  ): () => void;
  public abstract listenToSubCollection(
    docId: string, 
    subCollectionName: string,
    type: ChangeTypeProps | ChangeTypeProps[], 
    orderByField: string, // Default orderBy field
    orderDirection: "asc" | "desc", // Default order direction
    callback: (items: DocumentDataProps[]) => void
  ): () => void;
}