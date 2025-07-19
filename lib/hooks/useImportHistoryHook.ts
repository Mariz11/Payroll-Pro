import { useMemo, useState, useEffect } from "react";
import moment from "@constant/momentTZ";
import { calcProgressPercentage } from "@utils/helper";
import { useFirestorePagination } from "./useFirestorePagination"; // adjust path
import { EmployeeImportHistoryListProps } from "lib/interfaces";
import { FirestoreService } from "lib/classes/gcp/FirestoreService";

const collectionName = "bulk_employee_responses";

const useImportHistoryHook = ({
  userType,
  id,
  pageSize = 5,
}: {
  userType: string;
  id: string;
  pageSize?: number;
}): {
  fetching: boolean;
  list: EmployeeImportHistoryListProps[];
  total: number;
  page: number;
  setPageIndex: (targetPage: number) => void;
} => {
  const [total, setTotal] = useState(0);
  const firestoreService = useMemo(() => new FirestoreService(), []);

  const condition = useMemo(() => ({
    field: userType === "SUPER_ADMIN" ? "data.companyId" : "data.userId",
    operator: "==" as FirebaseFirestore.WhereFilterOp,
    value: id,
  }), [userType, id]);

  const {
    data: rawDocs,
    fetching,
    page,
    fetchPage
  } = useFirestorePagination({
    collection: collectionName,
    condition,
    orderByField: "timestamp",
    orderDirection: "desc",
    pageSize,
  });

  useEffect(() => {
    let mounted = true;

    const fetchTotal = async () => {
      firestoreService.setCollectionName(collectionName);
      const count = await firestoreService.getCollectionCount(condition);
      if (mounted) setTotal(count);
    };

    fetchTotal();
    return () => {
      mounted = false;
    };
  }, [userType, id, pageSize, condition, firestoreService]);

  const setPageIndex = async (targetPage: number) => {
    if (targetPage === page) return;
    await fetchPage(targetPage);
  };

  const list: EmployeeImportHistoryListProps[] = useMemo(() => {
    return rawDocs.map((doc) => {
      const timestamp = doc.timestamp?.seconds ? new Date(doc.timestamp.seconds * 1000) : null;
      const formattedDate = timestamp ? moment(timestamp).format("MM/DD/YYYY") : "Unknown";

      return {
        documentId: doc.id,
        uploadDate: formattedDate,
        fileName: doc.file_name ?? "Unknown",
        totalRows: doc.total ?? 0,
        progress: calcProgressPercentage(Number(doc.total), Number(doc.success), Number(doc.failed)),
      };
    });
  }, [rawDocs]);

  return {
    fetching,
    list,
    total,
    page,
    setPageIndex,
  };
};

export default useImportHistoryHook;
