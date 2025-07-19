import React, { useRef, useState } from 'react';

import { Button } from 'primereact/button';
import { Sidebar } from 'primereact/sidebar';
import { Toast } from 'primereact/toast';

import { postPayroll } from '@utils/disbursementFn';
import { Dialog } from 'primereact/dialog';
interface Details {
  header: string;
  subHeader: string;
  submitText: string;
  cancelText: string;
  rowData?: any;
  isOpen: boolean;
}

export default function RepostSidebar({
  repostSidebarConfig: {
    header,
    subHeader,
    submitText,
    cancelText,
    rowData,
    isOpen,
  },
  setRepostSidebarConfig,
  refetch,
  setIsSubmitting,
  postedPayrollQuery,
  setVisible,
  isSubmitting,
  postedTotalsQuery,
  pendingTotalsQuery,
  postedOptsQuery,
  pendingOptsQuery,
  processingPayroll,
  setSelectedRows,
  setProcessingPayroll,
}: {
  repostSidebarConfig: Details;
  setRepostSidebarConfig: (v: any) => void;
  refetch: () => void;
  selectedRows?: any[];
  setSelectedRows: (v: any) => void;
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
  postedPayrollQuery?: any;
  isSubmitting: boolean;
  setVisible: (v: boolean) => void;
  postedTotalsQuery: any;
  pendingTotalsQuery: any;
  postedOptsQuery: any;
  pendingOptsQuery: any;
  processingPayroll: ProcessingPayroll[];
  setProcessingPayroll: (p: any) => void;
}) {
  const toast = useRef<Toast>(null);
  const [backendError, setBackendError] = useState<any>([]);

  const handlePost = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    setRepostSidebarConfig((prev: any) => ({ ...prev, isOpen: false }));
    setProcessingPayroll([]);

    toast.current?.replace({
      severity: 'info',
      summary: 'Posting Selected Payroll/s',
      detail: 'Please wait...',
      sticky: true,
      closable: false,
    });

    setSelectedRows([]);
    const data = [{ ...rowData, isReposting: true }];
    await postPayroll({
      toast,
      data,
      processingPayroll,
      setProcessingPayroll,
      setIsSubmitting,
      refetchParent: () => {
        refetch();
        postedPayrollQuery.refetch();
        postedTotalsQuery.refetch();
        pendingTotalsQuery.refetch();
        pendingOptsQuery.refetch();
        postedOptsQuery.refetch();
      },
    });
  };

  return (
    <>
      <Dialog
        maximizable
        header="Errors on the following:"
        visible={backendError.length > 0}
        style={{ width: '50vw' }}
        onHide={() => setBackendError([])}
      >
        <div className="my-5">
          {backendError.length > 0 &&
            backendError.map((item: any, index: number) => (
              <div className="my-4" key={index}>
                <h4 className="font-bold">{item.headerTitle}</h4>
                <>
                  {Array.isArray(item.error) ? (
                    <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
                      {item.error.map((message: any, msgIndex: number) => (
                        <li key={msgIndex}>{message}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>{item.error}</p>
                  )}
                </>
                <br />
              </div>
            ))}
        </div>
      </Dialog>
      <Toast ref={toast} position="bottom-left" />
      <Sidebar
        position="right"
        style={{
          width: '50%',
        }}
        visible={isOpen}
        onHide={() =>
          setRepostSidebarConfig((prev: any) => ({ ...prev, isOpen: false }))
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
                setRepostSidebarConfig((prev: any) => ({
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
    </>
  );
}
