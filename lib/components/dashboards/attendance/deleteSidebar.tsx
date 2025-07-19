import React, { useRef } from 'react';

import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Password } from 'primereact/password';
import { Sidebar } from 'primereact/sidebar';
import axios from 'axios';
import { Toast } from 'primereact/toast';
import { set } from 'lodash';

interface Details {
  header: string;
  subHeader: string;
  submitText: string;
  cancelText: string;
  rowData: any;
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
  departmentsAdded,
  toast,
}: {
  deleteSidebarConfig: Details;
  setDeleteSidebarConfig: (v: any) => void;
  refetch: () => void;
  selectedRows?: any[];
  setSelectedRows: (v: any) => void;
  isSubmitting: boolean;
  setIsSubmitting: (v: boolean) => void;
  departmentsAdded: any;
  toast: any;
}) {
  const handleDelete = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
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
      setDeleteSidebarConfig((prev: any) => ({ ...prev, isOpen: false }));
      toast.current?.replace({
        severity: 'info',
        summary: 'Submitting delete request',
        detail: 'Please wait...',
        sticky: true,
        closable: false,
      });
      const del = await axios.delete('/api/attendances', {
        data: data,
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}` },
      });

      if (del) {
        refetch();
        toast.current?.replace({
          severity: 'success',
          summary: del.data.message,
          life: 5000,
        });
        setIsSubmitting(false);
      }
    } catch (error: any) {
      const response = error?.response?.data;
      toast.current?.replace({
        severity: 'error',
        detail: response.message,
        life: 5000,
      });
      setIsSubmitting(false);
    }
    departmentsAdded.current = {};
    setSelectedRows([]);
  };
  return (
    <>
      {/* <Toast ref={toast} position="bottom-left" /> */}
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
