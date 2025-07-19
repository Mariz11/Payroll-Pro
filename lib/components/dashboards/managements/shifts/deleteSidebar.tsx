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
  deleteType,
  setSelectedRows,
  setIsDeleting,
}: {
  deleteSidebarConfig: Details;
  setDeleteSidebarConfig: (v: any) => void;
  refetch: () => void;
  deleteType: 'single' | 'bulk';
  setSelectedRows: any;
  setIsDeleting: any;
}) {
  const context = React.useContext(GlobalContainer);
  const companyId = context?.userData.companyId;
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
    setIsDeleting(true);
    try {
      if (deleteType === 'single') {
        const requestBody = {
          companyId: companyId,
          userId: userId,
        };
        const del = await axios.delete(`/api/shifts/${rowData.shiftId}`, {
          data: JSON.stringify(requestBody),
          headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}` },
        });

        // const employeesResponse = await axios.get(
        //   `/api/shifts/${rowData.shiftId}`,
        //   {
        //     headers: {
        //       'Content-Type': 'application/json',
        //       Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
        //     },
        //   }
        // );

        // console.log(employeesResponse);

        if (del) {
          // if (employeesResponse) {
          //   employeesResponse.data.map(async (employee: any) => {
          //     if (employee.shiftId === rowData.shiftId) {
          //       const requestBody = {
          //         shiftId: null,
          //       };

          //       await fetch(`/api/shifts/employee/${employee.employeeId}`, {
          //         method: 'PUT',
          //         headers: {
          //           'Content-Type': 'application/json',
          //           Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
          //         },
          //         body: JSON.stringify(requestBody),
          //       });
          //     }
          //   });
          // }

          refetch();
          toastInfo.current?.clear();
          toast.current?.show({
            severity: 'success',
            summary: 'Successfully Deleted',
            life: 5000,
          });
        }
      } else if (deleteType === 'bulk') {
        if (rowData.length == 0) {
          return;
        }
        const shiftIds = rowData.map((data: any) => data.shiftId);
        const requestBody = {
          companyId: companyId,
          userId: userId,
          shiftIds: shiftIds,
        };

        const del = await axios.delete(`/api/shifts/bulkdelete`, {
          data: JSON.stringify(requestBody),
          headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}` },
        });

        // const employeesResponse = await axios.get(`/api/shifts/employee`, {
        //   headers: {
        //     'Content-Type': 'application/json',
        //     Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
        //   },
        // });

        if (del) {
          // if (employeesResponse) {
          //   // console.log(employeesResponse);
          //   employeesResponse.data.map(async (employee: any) => {
          //     if (shiftIds.includes(employee.shiftId)) {
          //       const requestBody = {
          //         shiftId: null,
          //       };

          //       await fetch(`/api/shifts/employee/${employee.employeeId}`, {
          //         method: 'PUT',
          //         headers: {
          //           'Content-Type': 'application/json',
          //           Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
          //         },
          //         body: JSON.stringify(requestBody),
          //       });
          //     }
          //   });
          // }

          refetch();
          toastInfo.current?.clear();
          toast.current?.show({
            severity: 'success',
            summary: 'Successfully Deleted',
            life: 5000,
          });
        }
      }
    } catch (error: any) {
      toastInfo.current?.clear();
      toast.current?.show({
        severity: 'error',
        detail: error,
        life: 5000,
      });
    }
    setIsDeleting(false);
    setSelectedRows([]);
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
