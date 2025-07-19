import { useEffect, useState } from "react";
import { FirestoreService } from "lib/classes/gcp/FirestoreService";
import { 
  DocumentDataProps,
  EmployeeImportHistoryDetailsSummaryProps, 
  EmployeeImportHistoryDetailsLogsProps,
  EmployeeImportHistoryDetailsLogsFirestoreProps
} from "lib/interfaces";

const collectionName = "bulk_employee_responses";
const firestoreService = new FirestoreService();

const useImportHistoryDetailsHook = (docId: string, isVisible: boolean) => {
  const [summary, setSummary] = useState<EmployeeImportHistoryDetailsSummaryProps>({
    read: 0, 
    success: 0, 
    failed: 0, 
    total: 0, 
    csv_download_status: 0,
    csv_download_file: '',
    csv_signed_url: '',
    csv_signed_expiry: 0
  });
  const [logs, setLogs] = useState<EmployeeImportHistoryDetailsLogsProps[]>([]);
  const [fetching, setFetching] = useState<boolean>(false);

  useEffect(() => {
    if (!isVisible || !docId) return;
    
    firestoreService.setCollectionName(collectionName);
    setFetching(true);
    
    const unsubscribeDocument = firestoreService.listenToDocument(docId, (snapshot) => {
      const data = snapshot.data() as Partial<EmployeeImportHistoryDetailsSummaryProps> | undefined;
      if (data) {
        setSummary({
          read: Number(data.read) || 0,
          success: Number(data.success) || 0,
          failed: Number(data.failed) || 0,
          total: Number(data.total) || 0,
          csv_download_status: data?.csv_download_status || 0,
          csv_download_file: data?.csv_download_file || '',
          csv_signed_url: data?.csv_signed_url || '',
          csv_signed_expiry: data?.csv_signed_expiry || 0
        });
      }
    });

    const unsubscribeSubCollection = firestoreService.listenToSubCollection(
      docId,
      "errors",
      ["added"],
      "row", 
      "asc",
      (data: DocumentDataProps[]) => {
        setLogs(data.map(item => {
          const itemData = item.data() as Partial<EmployeeImportHistoryDetailsLogsFirestoreProps>;
          
          return {
            row: Number(itemData?.row) || 0,
            employeeId: itemData?.employee_code || "",
            errorMessage: itemData?.message || "",
            raw: itemData?.raw || {}
          };
        }));
      }
    );

    return () => {
      if (unsubscribeDocument) unsubscribeDocument();
      if (unsubscribeSubCollection) unsubscribeSubCollection();
    };
  }, [docId, isVisible]);

  return { summary, logs, fetching };
};

export default useImportHistoryDetailsHook;