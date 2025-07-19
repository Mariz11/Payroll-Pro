import React, { useRef } from 'react';

import { Button } from 'primereact/button';
import { Sidebar } from 'primereact/sidebar';
import axios from 'axios';
import { Toast } from 'primereact/toast';
import { GlobalContainer } from 'lib/context/globalContext';

interface Details {
  header: string;
  subHeader: string;
  submitText: string;
  cancelText: string;
  rowData: any;
  isOpen: boolean;
}

function DeleteSidebar({
  deleteSidebarConfig: {
    header,
    subHeader,
    submitText,
    cancelText,
    rowData,
    isOpen,
  },
  setDeleteSidebarConfig,
  refetch,
  companyId,
}: {
  deleteSidebarConfig: Details;
  setDeleteSidebarConfig: (v: any) => void;
  refetch: () => void;
  companyId: string;
}) {
  const context = React.useContext(GlobalContainer);
  const userId = context?.userData.userId;

  const toast = useRef<Toast>(null);
  const toastInfo = useRef<Toast>(null);

  const handleDelete = async () => {
    setDeleteSidebarConfig((prev: any) => ({ ...prev, isOpen: false }));
    toastInfo.current?.show({
      severity: 'info',
      summary: 'Submitting delete request',
      detail: 'Please wait...',
      sticky: true,
      closable: false,
    });

    try {
      const requestBody = {
        companyId: companyId,
        userId: userId,
      };

      const del = await axios.delete(`/api/holidays/${rowData.holidayId}`, {
        data: JSON.stringify(requestBody),
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}` },
      });

      if (del) {
        refetch();
        toastInfo.current?.clear();
        toast.current?.show({
          severity: 'success',
          summary: 'Successfully Deleted',
          life: 5000,
        });
      }
    } catch (error: any) {
      const response = error?.response?.data;
      toastInfo.current?.clear();
      toast.current?.show({
        severity: 'error',
        detail: error,
        life: 5000,
      });
    }
  };

  return (
    <>
      <Toast ref={toast} position="bottom-left" />
      <Toast ref={toastInfo} position="bottom-left" />
      <Sidebar
        position="right"
        className="p-sidebar-md"
        visible={isOpen}
        onHide={() =>
          setDeleteSidebarConfig((prev: any) => ({ ...prev, isOpen: false }))
        }
      >
        <React.Fragment>
          <h1 className="text-black font-medium text-3xl pt-[50%]">{header}</h1>
          <h3 className="font-medium mt-5">{subHeader}</h3>
        </React.Fragment>

        {/* BUTTONS */}
        <div className="mt-2 w-full flex flex-nowrap justify-center items-center gap-2">
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
      </Sidebar>
    </>
  );
}

export default DeleteSidebar;
