import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, signInWithCustomToken, onAuthStateChanged, Auth } from "firebase/auth";
import { 
  Firestore, 
  getFirestore, 
  collection, 
  onSnapshot, 
  doc, 
  query, 
  where, 
  orderBy, 
  startAfter, 
  limit, 
  getDocs, 
  getCountFromServer,
  updateDoc, 
  DocumentChangeType, 
  QueryConstraint, 
  DocumentSnapshot 
} from 'firebase/firestore';
import { BaseFirestoreService } from './BaseFirestoreService';
import { DocumentDataProps, ChangeTypeProps, ConditionProps } from "lib/interfaces";

const FIREBASE_DATABASE_ID = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID || '';
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDING_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

export class FirestoreService extends BaseFirestoreService {
  private db: Firestore;
  private auth: Auth;
  private collectionName: string | null = null;

  constructor() {
    super();

    // Initialize Firebase
    const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

    this.auth = getAuth(app);

    // If not set to "(default)", the database ID must be specified;
    this.db = FIREBASE_DATABASE_ID.indexOf('default') === -1 ? getFirestore(app, FIREBASE_DATABASE_ID) : getFirestore(app);
  }

  public async onAuthStateChanged(callback) {
    onAuthStateChanged(this.auth, (firebaseUser) => {
      callback(firebaseUser);
    })
  }

  public async signInWithCustomToken(token: string) {
    await signInWithCustomToken(this.auth, token);
  }

  public async signOut() {
    this.auth.signOut();
  }

  public setCollectionName(collectionName: string): this {
    this.collectionName = collectionName;
    
    return this;
  }

  public async getCollectionCount(
    condition: ConditionProps | null,
  ): Promise<number> {
    if (!this.collectionName) {
      throw new Error("Collection name is not set");
    }

    try {
      const colRef = collection(this.db, this.collectionName);
      const constraints: QueryConstraint[] = [];

      if (condition) {
        constraints.push(where(condition.field, condition.operator, condition.value));
      }

      const q = query(
        colRef, 
        ...constraints
      );

      const snapshot = await getCountFromServer(q);
      return snapshot.data().count;
    } catch (error) {
      console.error("Error fetching collection count:", error);
      throw new Error("Failed to fetch collection count");
    }    
  }

  public async fetchCollection(
    condition: ConditionProps | null,
    orderByField: string = "timestamp",
    orderDirection: "asc" | "desc" = "asc",
    offsetDoc?: DocumentSnapshot, 
    size: number = 5   
  ): Promise<any> {
    if (!this.collectionName) {
      throw new Error("Collection name is not set");
    }

    try {
      const colRef = collection(this.db, this.collectionName);
      const constraints: QueryConstraint[] = [];

      if (condition) {
        constraints.push(where(condition.field, condition.operator, condition.value));
      }

      constraints.push(orderBy(orderByField, orderDirection));

      if (offsetDoc) {
        constraints.push(startAfter(offsetDoc));
      }
      
      constraints.push(limit(size));

      const q = query(
        colRef, 
        ...constraints
      );
      return await getDocs(q);
    } catch (error) {
      console.error("Error fetching collection:", error);
      throw new Error("Failed to fetch collection");
    }
  }

  public listenToSubCollection(
    docId: string, 
    subCollectionName: string,
    type: ChangeTypeProps | ChangeTypeProps[], 
    orderByField: string = "row", 
    orderDirection: "asc" | "desc" = "asc",
    callback: (items: DocumentDataProps[]) => void
  ): () => void {
    if (!this.collectionName) {
      throw new Error("Collection name is not set");
    }

    const subCollectionRef = collection(this.db, this.collectionName, docId, subCollectionName);
    const orderedQuery = query(subCollectionRef, orderBy(orderByField, orderDirection));

    return onSnapshot(orderedQuery, (snapshot) => {
      let items: DocumentDataProps[] = [];

      if (type === "all") {
        items = snapshot.docs.map((doc) => ({
          id: doc.id,
          data: () => doc.data()
        }));
      } else {
        const typeArray = Array.isArray(type) ? type : [type];

        items = snapshot.docChanges().flatMap((change) =>
          typeArray.includes(change.type as DocumentChangeType) ? [{
            id: change.doc.id,
            data: () => change.doc.data()
          }] : []
        );
      }

      callback(items);
    });
  }

  public listenToDocument(docId: string, callback: (data: DocumentDataProps) => void): () => void {
    if (!this.collectionName) {
      throw new Error("Collection name is not set");
    }
    const docRef = doc(this.db, this.collectionName, docId);
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        callback({ id: snapshot.id, data: () => snapshot.data() });
      } else {
        console.log("Document does not exist");
      }
    });
  }

  public updateDocument(docId: string, data: any): Promise<void> {
    if (!this.collectionName) {
      throw new Error("Collection name is not set");
    }
    const docRef = doc(this.db, this.collectionName, docId);
    return updateDoc(docRef, data);
  }
}