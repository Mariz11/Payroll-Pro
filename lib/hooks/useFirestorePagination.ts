import { useState, useEffect, useMemo } from "react";
import {
  getDocs,
  orderBy,
  limit,
  query,
  startAfter,
  where,
  QueryDocumentSnapshot,
  DocumentData,
  collection,
} from "firebase/firestore";
import { FirestoreService } from "lib/classes/gcp/FirestoreService";

interface Props {
  collection: string;
  condition: {
    field: string;
    operator: FirebaseFirestore.WhereFilterOp;
    value: any;
  };
  orderByField: string;
  orderDirection?: "asc" | "desc";
  pageSize?: number;
}

export const useFirestorePagination = ({
  collection: collectionName,
  condition,
  orderByField,
  orderDirection = "desc",
  pageSize = 5,
}: Props) => {
  const firestoreService = useMemo(() => new FirestoreService(), []);
  const [data, setData] = useState<DocumentData[]>([]);
  const [fetching, setFetching] = useState(false);
  const [page, setPage] = useState(0);
  const [snapshots, setSnapshots] = useState<QueryDocumentSnapshot[]>([]); 

  // Load initial page
  useEffect(() => {
    firestoreService.setCollectionName(collectionName);
    fetchPage(0);
  }, [collectionName, condition.field, condition.value, pageSize]);

  const fetchPage = async (targetPage: number) => {
    setFetching(true);
  
    const cursor = snapshots[targetPage - 1]; // previous page's last doc
    const colRef = collection(firestoreService.db, collectionName);
  
    let q = query(
      colRef,
      where(condition.field, condition.operator, condition.value),
      orderBy(orderByField, orderDirection),
      limit(pageSize)
    );
  
    if (cursor) {
      q = query(q, startAfter(cursor));
    } else if (targetPage > 0) {
      // Fetch intermediate pages if cursor is missing
      const intermediateSnapshots = [...snapshots];
      for (let i = snapshots.length; i < targetPage; i++) {
        const intermediateQuery = query(
          colRef,
          where(condition.field, condition.operator, condition.value),
          orderBy(orderByField, orderDirection),
          limit(pageSize),
          startAfter(intermediateSnapshots[i - 1])
        );
        const intermediateSnapshot = await getDocs(intermediateQuery);
        if (intermediateSnapshot.docs.length > 0) {
          intermediateSnapshots[i] = intermediateSnapshot.docs[intermediateSnapshot.docs.length - 1];
        } else {
          break;
        }
      }
      setSnapshots(intermediateSnapshots);
      q = query(q, startAfter(intermediateSnapshots[targetPage - 1]));
    }
  
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  
    // Cache cursors
    if (snapshot.docs.length > 0 && !snapshots[targetPage]) {
      const newSnapshots = [...snapshots];
      newSnapshots[targetPage] = snapshot.docs[snapshot.docs.length - 1];
      setSnapshots(newSnapshots);
    }
  
    setData(docs);
    setPage(targetPage);
    setFetching(false);
  };

  return {
    data,
    fetching,
    page,
    fetchPage
  };
};
