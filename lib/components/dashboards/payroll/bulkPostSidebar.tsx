import React, { useRef, useState } from 'react';

import { postPayroll } from '@utils/disbursementFn';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Sidebar } from 'primereact/sidebar';
import { Toast } from 'primereact/toast';
interface Details {
  header: string;
  subHeader: string;
  submitText: string;
  cancelText: string;
  rowData?: any;
  isOpen: boolean;
  bulk?: boolean;
}

function BulkPostSidebar({
  postSidebarConfig: {
    header,
    subHeader,
    submitText,
    cancelText,
    rowData,
    isOpen,
    bulk,
  },
  setPostSidebarConfig,
  refetch,
  selectedRows,
  setIsSubmitting,
  postedPayrollQuery,
  setSelectedRows,
  setBulkError,
  setBulkErrorHeader,
  setVisible,
  isSubmitting,
  postedTotalsQuery,
  pendingTotalsQuery,
  postedOptsQuery,
  pendingOptsQuery,
  failedPayrollQuery,
  processingPayroll,
  setProcessingPayroll,
  toast,
}: {
  postSidebarConfig: Details;
  setPostSidebarConfig: (v: any) => void;
  refetch: () => void;
  selectedRows?: any[];
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
  postedPayrollQuery?: any;
  isSubmitting: boolean;
  setSelectedRows: (v: any) => void;
  setBulkError: (v: any) => void;
  setBulkErrorHeader: (v: string) => void;
  setVisible: (v: boolean) => void;
  postedTotalsQuery: any;
  pendingTotalsQuery: any;
  postedOptsQuery: any;
  pendingOptsQuery: any;
  failedPayrollQuery?: any;
  processingPayroll: ProcessingPayroll[];
  setProcessingPayroll: (p: any) => void;
  toast: any;
}) {
  const [backendError, setBackendError] = useState<any>([]);

  const handlePost = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setPostSidebarConfig((prev: any) => ({ ...prev, isOpen: false }));
    setProcessingPayroll([]);
    toast.current?.replace({
      severity: 'info',
      summary: 'Posting Selected Payroll/s',
      detail: 'Please wait...',
      sticky: true,
      closable: false,
    });

    if (processingPayroll.filter((i: any) => i.status == 0).length) {
      toast.current?.replace({
        severity: 'warn',
        summary: 'This action is prohibited',
        detail: 'The system is currently processing this entry.',
        life: 5000,
        closable: true,
      });
      return;
    }

    if (selectedRows) {
      const seen = new Set();
      const data = selectedRows
        .map((row: any) => ({
          departmentId: row.departmentId,
          businessMonth: row.businessMonth,
          cycle: row.cycle,
          departmentName: row.departmentName,
          isDirect: row.isDirect,
          isReposting: false,
        }))
        .filter((item) => {
          const key = `${item.businessMonth}-${item.cycle}-${item.departmentId}`;
          if (seen.has(key)) {
            return false;
          }
          seen.add(key);
          return true;
        });

      setSelectedRows([]);
      await postPayroll({
        toast,
        data,
        processingPayroll,
        setProcessingPayroll,
        setIsSubmitting,
        refetchParent: () => {
          refetch();
          pendingTotalsQuery.refetch();
          postedPayrollQuery.refetch();
          postedTotalsQuery.refetch();
          postedOptsQuery.refetch();
          pendingOptsQuery.refetch();
          failedPayrollQuery?.refetch();
        },
      });
    }
  };

  return (
    <>
      <Sidebar
        position="right"
        style={{
          width: '50%',
        }}
        visible={isOpen}
        onHide={() =>
          setPostSidebarConfig((prev: any) => ({ ...prev, isOpen: false }))
        }
      >
        <div className="h-full flex flex-col justify-center items-start mx-20">
          <React.Fragment>
            <h1 className="text-black font-medium text-3xl">{header}</h1>
            <h3 className="font-medium mt-5">{subHeader}</h3>
          </React.Fragment>

          <div className="my-5 w-full flex justify-end items-center gap-3">
            <Button
              rounded
              className="w-full"
              severity="secondary"
              text
              label={cancelText}
              onClick={() =>
                setPostSidebarConfig((prev: any) => ({
                  ...prev,
                  isOpen: false,
                }))
              }
            />
            <Button
              rounded
              className="w-full"
              label={submitText}
              onClick={() => {
                handlePost();
              }}
            />
          </div>
        </div>
      </Sidebar>

      <Dialog
        maximizable
        header="Some payrolls are not posted successfully:"
        visible={backendError.length > 0}
        style={{ width: '50vw' }}
        onHide={() => setBackendError([])}
      >
        <div className="my-5">
          {backendError.length > 0 &&
            backendError.map((item: any, index: number) => (
              <div className="my-4" key={index}>
                <h4 className="font-bold">{item.departmentName}</h4>
                <>
                  {Array.isArray(item.message) ? (
                    item.message.map((message: any, msgIndex: number) => (
                      <ul
                        style={{
                          listStyleType: 'disc',
                          paddingLeft: '20px',
                        }}
                        key={msgIndex}
                      >
                        <li key={msgIndex}>
                          <strong>{message.headerTitle}</strong>
                          <p>{message.error}</p>
                        </li>
                      </ul>
                    ))
                  ) : (
                    <p>{item.message}</p>
                  )}
                </>
                <br />
              </div>
            ))}
        </div>
      </Dialog>
    </>
  );
}

export default BulkPostSidebar;
