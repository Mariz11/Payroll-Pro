'use client';
import React, { useState } from 'react';

import {
  getEmployeesWithCreditableOT,
  logTaskProcess,
} from '@utils/companyDetailsGetter';
import axios from 'axios';
import moment from '@constant/momentTZ';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Sidebar } from 'primereact/sidebar';
import { TabPanel, TabView } from 'primereact/tabview';
import { Toast } from 'primereact/toast';
import { uuidv4 } from '@utils/helper';

interface Details {
  header: string;
  subHeader: string;
  submitText: string;
  cancelText: string;
  rowData?: any;
  isOpen: boolean;
  bulk?: boolean;
}

function PostSidebar({
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
  isSubmitting,
  setIsSubmitting,
  postedAttendanceQuery,
  setSelectedRows,
  departmentsAdded,
  setVisible,
  // setBulkError,
  // setBulkErrorHeader,
  // setHasCreditableOT,
  // hasCreditableOT,
  // employeesWithCreditableOT,
  toast,
}: {
  postSidebarConfig: Details;
  setPostSidebarConfig: (v: any) => void;
  refetch: () => void;
  selectedRows?: any[];
  isSubmitting: boolean;
  setIsSubmitting: (v: boolean) => void;
  postedAttendanceQuery?: any;
  setSelectedRows: (v: any) => void;
  departmentsAdded: any;
  setVisible: (v: boolean) => void;
  // setBulkError: (v: any) => void;
  // setBulkErrorHeader: (v: string) => void;
  // setHasCreditableOT: (v: boolean) => void;
  // hasCreditableOT: boolean;
  // employeesWithCreditableOT: any[];
  toast: any;
}) {
  const [bulkEmployeesWithCreditableOT, setBulkEmployeesWithCreditableOT] =
    useState<any>(null);
  const [openModal, setOpenModal] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isBulkPosting, setIsBulkPosting] = useState(false); // used to adjust displays of prompt
  const [backendError, setBackendError] = useState<any>([]);

  const handlePost = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setPostSidebarConfig((prev: any) => ({ ...prev, isOpen: false }));
    toast.current?.replace({
      severity: 'info',
      summary: 'Posting Selected Attendance/s',
      detail: 'Please wait...',
      sticky: true,
      closable: false,
    });

    try {
      let res = null;
      if (selectedRows) {
        const seen = new Set();
        const data = selectedRows
          .map((item: any) => ({
            ...item,
            departmentName: item.department.departmentName,
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
        let employees: any = [];
        let semiWeeklyStartDate: any = null;
        let semiWeeklyEndDate: any = null;

        // New modal for creditable OT --- Updated by Clyde (10/18/24)
        await Promise.all(
          data.map(async (item: any) => {
            if (item.cycle && item.cycle.startsWith('[')) {
              semiWeeklyStartDate = moment(
                item.cycle.split('-')[0].replace('[', ''),
                'MM/DD/YYYY'
              )
                .toDate()
                .toString();
              semiWeeklyEndDate = moment(
                item.cycle.split('-')[1].replace(']', ''),
                'MM/DD/YYYY'
              )
                .toDate()
                .toString();
            }

            const response = await getEmployeesWithCreditableOT({
              departmentId: item.departmentId,
              cycle: item.cycle,
              businessMonth: item.businessMonth,
              semiWeeklyStartDate: semiWeeklyStartDate,
              semiWeeklyEndDate: semiWeeklyEndDate,
            });
            if (response.data != null && response.data[0] != null) {
              employees.push(response.data[0]);
            }
            return;
          })
        );

        // console.log(employees);
        if (employees.length > 0) {
          setBulkEmployeesWithCreditableOT(employees);
          setIsBulkPosting(true);
        } else {
          setBulkEmployeesWithCreditableOT(null);
        }

        res = await axios.post('/api/attendances/bulk', data, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
          },
        });

        if (res) {
          let errors = false;
          const hasErrors = res.data.filter(
            (item: any) => item.success == false
          );
          toast.current?.clear();
          if (hasErrors.length > 0) {
            errors = true;
            setBackendError(hasErrors);
            setActiveIndex(1);
          } else {
            toast.current?.replace({
              severity: 'success',
              summary: 'Successfully posted',
              life: 5000,
            });
            
            refetch();
            postedAttendanceQuery.refetch();
          }

          if (employees?.length > 0 || errors === true) {
            setOpenModal(true);
          }
          setIsSubmitting(false);
        }
      }
    } catch (error: any) {
      setSelectedRows([]);
      setIsSubmitting(false);
      const response = error?.response?.data;
      // problem with error
      response.severity == 'warn'
        ? toast.current?.replace({
            severity: 'warn',
            summary: `Incomplete Posting of Attendances`,
            detail: response.message,
            life: 10000,
          })
        : toast.current?.replace({
            severity: 'error',
            summary: response.message,
            life: 10000,
          });
    }
    departmentsAdded.current = {};
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
              onClick={handlePost}
            />
          </div>
        </div>
      </Sidebar>
      <Dialog
        onHide={() => {
          if (!openModal) return;
          setBackendError([]);
          setOpenModal(false);
        }}
        visible={openModal}
        position="top"
        draggable={false}
        resizable={false}
        style={{ width: '50vw', minHeight: '30vh', maxHeight: '80vh' }}
        modal={true}
      >
        <TabView
          activeIndex={activeIndex}
          onTabChange={(e) => setActiveIndex(e.index)}
        >
          {bulkEmployeesWithCreditableOT?.length > 0 && (
            <TabPanel
              header={
                <span
                  style={{
                    backgroundColor: activeIndex === 0 ? '#d61117' : '',
                    color: activeIndex === 0 ? 'white' : '',
                    padding: '10px 20px',
                    textAlign: 'center',
                  }}
                >
                  Employee/s with uncredited overtime
                </span>
              }
            >
              <div className="mb-5 p-2">
                <div className="grid grid-cols-2 gap-4">
                  {bulkEmployeesWithCreditableOT?.length > 0 &&
                    bulkEmployeesWithCreditableOT?.map(
                      (item: any, index: number) => {
                        const departmentInfo = `Department: ${item?.departmentName}`;

                        return (
                          <div key={index} style={{ marginBottom: '10px' }}>
                            <strong className="block mb-2">
                              {departmentInfo}
                            </strong>
                            <ul className="list-disc list-inside space-y-1">
                              {item.employeesWithCreditableOT.map(
                                (employee: any) => (
                                  <li key={employee.employeeId}>
                                    {employee.employeeFullName}:{' '}
                                    {employee.totalCreditableOvertime}hrs
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        );
                      }
                    )}
                </div>
              </div>
            </TabPanel>
          )}
          {backendError.length > 0 && (
            <TabPanel
              header={
                <span
                  style={{
                    backgroundColor: activeIndex === 1 ? '#d61117' : '',
                    color: activeIndex === 1 ? 'white' : '',
                    padding: '10px 20px',
                    textAlign: 'center',
                  }}
                >
                  Error
                </span>
              }
            >
              <span className="text-red-600">
                Some attendances are not posted successfully:
              </span>
              <div className="my-5">
                {backendError.length > 0 &&
                  backendError.map((item: any, index: number) => (
                    <div className="my-4" key={index}>
                      <h4 className="font-bold">{item.departmentName}</h4>
                      {Array.isArray(item.message) ? (
                        <ul
                          style={{ listStyleType: 'disc', paddingLeft: '20px' }}
                        >
                          {item.message.map(
                            (message: any, msgIndex: number) => (
                              <li key={msgIndex}>
                                <strong>{message.headerTitle}</strong>
                                <p>{message.error}</p>
                              </li>
                            )
                          )}
                        </ul>
                      ) : (
                        <p>{item.message}</p>
                      )}
                      <br />
                    </div>
                  ))}
              </div>
            </TabPanel>
          )}
        </TabView>
      </Dialog>

      {/* <Dialog
        maximizable
        header="Some attendances are not posted successfully:"
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
      </Dialog> */}
    </>
  );
}

export default PostSidebar;
