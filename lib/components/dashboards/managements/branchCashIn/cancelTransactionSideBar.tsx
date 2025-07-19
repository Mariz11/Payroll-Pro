import React, { useRef, useState } from 'react';

import { Button } from 'primereact/button';
import { Sidebar } from 'primereact/sidebar';
import axios from 'axios';
import { Toast } from 'primereact/toast';
import { GlobalContainer } from 'lib/context/globalContext';

function CancelTransactionSidebar({
  sideBarConfig: { rowData, isOpen },
  setSideBarConfig,
  refetchParent,
  createNewTransaction,
}: {
  sideBarConfig: any;
  setSideBarConfig: (v: any) => void;
  refetchParent?: () => void;
  createNewTransaction: () => void;
}) {
  const toast = useRef<Toast>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCancel = async () => {
    setIsSubmitting(true);
    toast.current?.replace({
      severity: 'info',
      summary: 'Cancelling Transaction',
      detail: 'Please wait...',
      closable: false,
      sticky: true,
    });
    const cancelCashIn: any = await axios.put(
      '/api/companies/cashin',
      {
        status: 'CANCELLED',
        transactionCode: rowData.transactionCode,
        type: rowData.via,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
        },
      }
    );

    const response = cancelCashIn?.data;
    if (!response.success) {
      toast.current?.replace({
        severity: 'error',
        summary: response.message,
        sticky: true,
        closable: true,
      });
      return false;
    }

    toast.current?.replace({
      severity: 'success',
      summary: `Transaction [${rowData.transactionCode}] has been cancelled.`,
      life: 3000,
    });
    setSideBarConfig((prev: any) => ({
      ...prev,
      isOpen: false,
    }));
    refetchParent && refetchParent();
    createNewTransaction();
  };

  return (
    <>
      <Toast ref={toast} position="bottom-left" />
      <Sidebar
        position="right"
        className="p-sidebar-md"
        visible={isOpen}
        onHide={() =>
          setSideBarConfig((prev: any) => ({ ...prev, isOpen: false }))
        }
      >
        <div className="px-5">
          <h1 className="text-black font-medium text-3xl pt-[50%]">
            Cancelling Transaction [{rowData.transactionCode}]
          </h1>
          <h3 className="font-medium mt-5">
            Cancelling this transaction cannot be undone. Are you sure you want
            to continue?
          </h3>

          {/* BUTTONS */}
          <div className="mt-5 w-full flex flex-nowrap justify-center items-center gap-2">
            <Button
              rounded
              className="w-full"
              severity="secondary"
              text
              label={'Cancel'}
              onClick={() =>
                setSideBarConfig((prev: any) => ({
                  ...prev,
                  isOpen: false,
                }))
              }
            />
            <Button
              rounded
              className="w-full"
              label={'Yes'}
              onClick={handleCancel}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </Sidebar>
    </>
  );
}

export default CancelTransactionSidebar;
