import React, { useRef } from 'react';

import { Button } from 'primereact/button';
import { Sidebar } from 'primereact/sidebar';
import axios from 'axios';
import { Toast } from 'primereact/toast';
import { set } from 'lodash';

interface Details {
  header: string;
  subHeader: string;
  submitText: string;
  cancelText: string;
  rowData?: any;
  isOpen: boolean;
  bulk?: boolean;
}

function DeleteSidebar({
  deleteSidebarConfig: {
    header,
    subHeader,
    submitText,
    cancelText,
    rowData,
    isOpen,
    bulk,
  },
  setDeleteSidebarConfig,
  refetch,
  selectedRows,
  isSubmitting,
  setIsSubmitting,
  setSelectedRows,
  pendingTotalsQuery,
  pendingOptsQuery,
  toast,
}: {
  deleteSidebarConfig: Details;
  setDeleteSidebarConfig: (v: any) => void;
  refetch: () => void;
  selectedRows?: any[];
  isSubmitting: boolean;
  setIsSubmitting: (v: boolean) => void;
  setSelectedRows: (v: any) => void;
  pendingTotalsQuery: any;
  pendingOptsQuery: any;
  toast: any;
}) {
  const handleDelete = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setDeleteSidebarConfig((prev: any) => ({ ...prev, isOpen: false }));
    toast.current?.replace({
      severity: 'info',
      summary: 'Submitting delete request',
      detail: 'Please wait...',
      sticky: true,
      closable: false,
    });

    try {
      let data: any = [];
      if (bulk) {
        data = selectedRows?.map((i: any) => ({
          businessMonth: i.businessMonth,
          cycle: i.cycle,
          departmentId: i.departmentId,
        }));
      } else {
        data = [
          {
            businessMonth: rowData.businessMonth,
            cycle: rowData.cycle,
            departmentId: rowData.departmentId,
          },
        ];
      }
      const del = await axios.delete('/api/payrolls', {
        data: data,
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}` },
      });

      if (del) {
        toast.current?.replace({
          severity: 'success',
          summary: del.data.message,
          life: 5000,
        });
        refetch();
        pendingTotalsQuery.refetch();
        pendingOptsQuery.refetch();

        setIsSubmitting(false);
      }
    } catch (error: any) {
      setIsSubmitting(false);
      const response = error?.response?.data;
      toast.current?.replace({
        severity: 'error',
        detail: response.message,
        life: 5000,
      });
    }
    setSelectedRows([]);
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
          setDeleteSidebarConfig((prev: any) => ({ ...prev, isOpen: false }))
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
                setDeleteSidebarConfig((prev: any) => ({
                  ...prev,
                  isOpen: false,
                }))
              }
            />
            <Button
              rounded
              className="w-full"
              label={submitText}
              onClick={handleDelete}
            />
          </div>
        </div>
      </Sidebar>
    </>
  );
}

export default DeleteSidebar;
