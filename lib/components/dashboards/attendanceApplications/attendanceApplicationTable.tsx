import { timeStringToDate } from '@utils/dashboardFunction';
import { convertMinsToHours, properCasing } from '@utils/helper';
import { VDivider } from 'lib/components/blocks/divider';
import moment from '@constant/momentTZ';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Skeleton } from 'primereact/skeleton';
import React, { use, useContext, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import { GlobalContainer } from 'lib/context/globalContext';
import axios from 'axios';
import { Paginator } from 'primereact/paginator';
import ConfirmationSidebar from './confirmationSidebar';
import { message } from 'antd';
import { Dialog } from 'primereact/dialog';
import { request } from 'http';
import { classNames } from 'primereact/utils';

interface BadgeData {
  pending: number;
  approved: number;
  disapproved: number;
  cancelled: number;
}

const AttendanceApplicationTable = ({
  toast,
  tableData,
  setAttendanceAppFormConfig,
  tableFor,
  refetchDataFromParent,
  moduleRole,
}: {
  toast: any;
  tableData: any;
  setAttendanceAppFormConfig: ({
    title,
    submitBtnText,
    action,
    rowData,
    isOpen,
  }: SideBarConfig) => void;
  tableFor: string;
  refetchDataFromParent?: () => void;
  moduleRole?: string;
}) => {
  const context = useContext(GlobalContainer);
  const currentLoggedInRole = moduleRole ? moduleRole : context?.userData.role;
  const currentLogginUserId = context?.userData.userId;
  const [selectedRows, setSelectedRows] = useState<any>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bulkError, setBulkError] = useState<any>([]);
  const [bulkErrorHeader, setBulkErrorHeader] = useState<string>('');
  const [visible, setVisible] = useState(false);
  const [confirmationSidebarConfig, setConfirmationSidebarConfig] =
    useState<SideBarConfig>({
      title: '',
      subTitle: '',
      submitBtnText: '',
      action: '',
      rowData: {},
      isOpen: false,
      bulk: false,
    });

  const bulkApprove = () => {
    setConfirmationSidebarConfig({
      title: `Approve Selected Attendance Application/s`,
      subTitle:
        'Are you sure you want to approve the selected attendance application/s?',
      submitBtnText: 'Approve',
      action: 'APPROVE',
      rowData: {},
      isOpen: true,
      bulk: true,
    });
  };
  const bulkDisapprove = () => {
    setConfirmationSidebarConfig({
      title: `Disapprove Selected Attendance Application/s`,
      subTitle:
        'Are you sure you want to disapprove the selected attendance application/s?',
      submitBtnText: 'Disapprove',
      action: 'DISAPPROVE',
      rowData: {},
      isOpen: true,
      bulk: true,
    });
  };
  useEffect(() => {
    if (tableData.isLoading || tableData.isRefetching) {
      setConfirmationSidebarConfig((prev: any) => ({ ...prev, isOpen: false }));
    }
  }, [tableData.isLoading, tableData.isRefetching]);

  return (
    <>
      {moduleRole === 'ADMIN' && tableFor == 'PENDING' && (
        <div className="flex gap-2 flex-row-reverse mb-2">
          <Button
            className="rounded-full"
            onClick={() => {
              if (selectedRows.length == 0) {
                return;
              }
              bulkDisapprove();
            }}
            disabled={
              tableData.isLoading ||
              tableData.isRefetching ||
              isSubmitting ||
              selectedRows.length == 0
            }
          >
            <p>Disapprove All</p>
          </Button>
          <Button
            className="p-button-secondary rounded-full"
            onClick={() => {
              if (selectedRows.length == 0) {
                return;
              }
              bulkApprove();
            }}
            disabled={
              tableData.isLoading ||
              tableData.isRefetching ||
              isSubmitting ||
              selectedRows.length == 0
            }
          >
            <p>Approve All</p>
          </Button>
        </div>
      )}
      <DataTable
        value={
          tableData.isLoading || tableData.isRefetching
            ? [{ dummy: '' }]
            : tableData.data.rows
        }
        tableStyle={{ minWidth: '90rem' }}
        selectionMode={'multiple'}
        selection={selectedRows}
        onSelectionChange={(e) => {
          if (tableData.isLoading || tableData.isRefetching || isSubmitting) {
            return null;
          }
          if (moduleRole === 'ADMIN' && tableFor == 'PENDING') {
            setSelectedRows(e.value);
          } else {
            setAttendanceAppFormConfig({
              isOpen: true,
              title: 'View Attendance Application',
              action: 'view',
              rowData: e.value[0],
            });
          }
        }}
      >
        {moduleRole === 'ADMIN' && tableFor == 'PENDING' ? (
          <Column
            selectionMode="multiple"
            headerStyle={{ width: '3rem' }}
          ></Column>
        ) : null}

        <Column
          header="Employee Name"
          body={(data) => {
            if (tableData.isLoading || tableData.isRefetching) {
              return <Skeleton />;
            }
            return (
              <span>{data.employee?.employee_profile.employeeFullName}</span>
            );
          }}
        />
        <Column
          field="type"
          header="Type"
          body={(data) => {
            if (tableData.isLoading || tableData.isRefetching) {
              return <Skeleton />;
            }
            return <span>{data.type}</span>;
          }}
        />

        <Column
          field="isApproved"
          header="Status"
          body={(data) => {
            if (tableData.isLoading || tableData.isRefetching) {
              return <Skeleton />;
            }
            if (data.isApproved == 1) {
              return (
                <span className="py-2 px-5 rounded-full bg-green-200 text-green-700">
                  APPROVED
                </span>
              );
            } else if (data.isApproved == 2) {
              return (
                <span className="py-2 px-5 rounded-full bg-red-200 text-red-700">
                  CANCELLED
                </span>
              );
            } else if (data.isApproved == 3) {
              return (
                <span className="py-2 px-5 rounded-full bg-red-200 text-red-700">
                  DISAPPROVED
                </span>
              );
            } else {
              return (
                <span className="py-2 px-5 rounded-full bg-orange-200 text-orange-700">
                  PENDING
                </span>
              );
            }
          }}
        />
        <Column
          field="approvedBy"
          hidden={tableFor == 'PENDING' || tableFor == 'CANCELLED'}
          header={
            tableFor == 'APPROVED'
              ? 'Approved By'
              : tableFor == 'DISAPPROVED'
              ? 'Disapproved By'
              : ''
          }
          body={(data) => {
            return data.user ? data.user.approverFullName : '';
          }}
        />
        <Column
          header="Filed at"
          body={(data) => {
            if (tableData.isLoading || tableData.isRefetching) {
              return <Skeleton />;
            }
            return <span>{moment(data.createdAt).format('LL - LT')}</span>;
          }}
        />
        <Column
          field="action"
          hidden={tableFor !== 'PENDING' && tableFor !== 'APPROVED'}
          header="Actions"
          body={(data) => {
            if (tableData.isLoading || tableData.isRefetching) {
              return <Skeleton />;
            }
            return (
              <div className="flex flex-row gap-1">
                <>
                  {tableFor == 'PENDING' && data.isApproved == 0 && (
                    <>
                      <Button
                        type="button"
                        text
                        severity="secondary"
                        icon="pi pi-eye"
                        tooltip="View"
                        tooltipOptions={{ position: 'top' }}
                        disabled={data.isApproved}
                        onClick={() => {
                          setAttendanceAppFormConfig({
                            isOpen: true,
                            title: 'View Attendance Application',
                            action: 'view',
                            rowData: data,
                          });
                        }}
                      />
                      <VDivider />
                    </>
                  )}
                  {!data.isApproved && (
                    <Button
                      type="button"
                      text
                      severity="secondary"
                      icon="pi pi-file-edit"
                      tooltip="Edit"
                      tooltipOptions={{ position: 'top' }}
                      style={{ color: 'black' }}
                      onClick={(e) => {
                        setAttendanceAppFormConfig({
                          isOpen: true,
                          title: 'Edit Attendance Application',
                          submitBtnText: 'Save Changes',
                          action: 'edit',
                          rowData: data,
                          bulk: false,
                        });
                      }}
                    />
                  )}

                  {!data.isApproved && currentLoggedInRole != 'EMPLOYEE' && (
                    <>
                      <VDivider />
                      <Button
                        type="button"
                        text
                        severity="secondary"
                        icon="pi pi-check"
                        tooltip="Approve"
                        tooltipOptions={{ position: 'top' }}
                        disabled={data.isApproved}
                        onClick={() =>
                          setConfirmationSidebarConfig({
                            isOpen: true,
                            title: `${data.type} application Approval`,
                            subTitle: `Are you sure you want to approve the ${data.type} application of ${data.employee.employee_profile?.employeeFullName}?`,
                            submitBtnText: 'Confirm',
                            action: 'APPROVE',
                            rowData: data,
                            bulk: false,
                          })
                        }
                        style={{ color: 'black' }}
                      />
                      <VDivider />
                      <Button
                        type="button"
                        text
                        severity="secondary"
                        icon="pi pi-thumbs-down"
                        tooltip="Disapprove"
                        tooltipOptions={{ position: 'top' }}
                        disabled={data.isApproved}
                        onClick={() => {
                          setConfirmationSidebarConfig({
                            isOpen: true,
                            title: `${data.type} application Disapproval`,
                            subTitle: `Are you sure you want to Disapprove the ${data.type} application of ${data.employee.employee_profile?.employeeFullName}?`,
                            submitBtnText: 'Confirm',
                            action: 'DISAPPROVE',
                            rowData: data,
                            bulk: false,
                          });
                        }}
                        style={{ color: 'red' }}
                      />
                    </>
                  )}
                  {data.isApproved == 1 &&
                    data.type == 'Change Schedule' &&
                    data.pendingAttendance > 0 && (
                      <Button
                        type="button"
                        text
                        severity="secondary"
                        icon="pi pi-arrow-left"
                        tooltip="Undo Approval"
                        tooltipOptions={{ position: 'top' }}
                        style={{ color: 'black' }}
                        onClick={(e) => {
                          setConfirmationSidebarConfig({
                            isOpen: true,
                            title: `Undo Approval`,
                            subTitle: `Are you sure you want to undo the approval of ${data.type} application of ${data.employee.employee_profile?.employeeFullName}?`,
                            submitBtnText: 'Confirm',
                            action: 'UNDO APPROVAL',
                            rowData: data,
                            bulk: false,
                          });
                        }}
                      />
                    )}
                </>
                {!data.isApproved && currentLoggedInRole == 'EMPLOYEE' && (
                  <>
                    <Button
                      type="button"
                      text
                      severity="secondary"
                      icon="pi pi-times"
                      tooltip="Cancel"
                      tooltipOptions={{ position: 'top' }}
                      disabled={data.isApproved}
                      onClick={() => {
                        setConfirmationSidebarConfig({
                          isOpen: true,
                          title: `${data.type} application Cancellation`,
                          subTitle: `Are you sure you want to Cancel your ${data.type} application?`,
                          submitBtnText: 'Confirm',
                          action: 'CANCEL',
                          rowData: data,
                          bulk: false,
                        });
                      }}
                      style={{ color: 'red' }}
                    />
                  </>
                )}
              </div>
            );
          }}
        />
      </DataTable>
      <Button
        className="w-full hover:!bg-[#dfffdf]"
        text
        onClick={() => {
          tableData.refetch();
        }}
        style={{
          display: 'block',
          background: '#edffed',
          color: '#4CAF50',
          textAlign: 'center',
        }}
        disabled={tableData.isRefetching}
      >
        <i
          className={classNames('pi pi-sync text-[12px]', {
            'pi pi-spin pi-spinner': tableData.isRefetching,
          })}
        ></i>{' '}
        {tableData.isRefetching ? 'Refreshing...' : 'Refresh'}
      </Button>
      <Dialog
        header={bulkErrorHeader}
        visible={visible}
        maximizable
        style={{ width: '40vw', minHeight: '10vw', maxHeight: '50vh' }}
        onHide={() => setVisible(false)}
      >
        <ul className="m-0 py-5">
          {bulkError.map((item: any, index: number) => {
            let errorString = item;
            // if (index < holidayError.current.holidays.length - 1) {
            //   holidayString += ',';
            // }
            return (
              <li className=" text-red-600" key={index}>
                {errorString}
              </li>
            );
          })}
        </ul>
      </Dialog>

      {!tableData.isRefetching && (
        <ConfirmationSidebar
          configuration={confirmationSidebarConfig}
          setSideBarConfig={setConfirmationSidebarConfig}
          actionButton={async () => {
            setConfirmationSidebarConfig((prev: any) => ({
              ...prev,
              isOpen: false,
            }));
            setIsSubmitting(true);
            let config;

            const data = selectedRows
              .filter(
                (item: any, index: number, arr: any) =>
                  !arr
                    .map((item2: any) => item2.attendanceAppId)
                    .includes(item.attendanceAppId, index + 1)
              )
              .map((row: any) => {
                return {
                  attendanceAppId: row.attendanceAppId,
                  companyId: row.companyId,
                  employeeId: row.employeeId,
                  type: row.type,
                  fromDate: row.fromDate,
                  toDate: row.toDate,
                  dateOvertime: row.dateOvertime,
                  timeFrom: row.timeFrom,
                  timeTo: row.timeTo,
                  numberOfDays: row.numberOfDays,
                  employee: row.employee,
                  createdAt: row.createdAt,
                };
              });
            setSelectedRows([]);
            if (confirmationSidebarConfig.bulk) {
              config = {
                method: 'PUT',
                maxBodyLength: Infinity,
                url: `/api/attendanceApplication/bulk`,
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
                },
                data: {
                  rowData: data,
                  action: confirmationSidebarConfig.action,
                },
              };
            } else {
              config = {
                method: 'PUT',
                maxBodyLength: Infinity,
                url: `/api/attendanceApplication`,
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
                },
                data: {
                  rowData: JSON.stringify(confirmationSidebarConfig.rowData),
                  action: confirmationSidebarConfig.action,
                },
              };
            }
            toast.current?.replace({
              severity: 'info',
              summary: 'Submitting request',
              detail: 'Please wait...',
              sticky: true,
              closable: false,
            });

            await axios
              .request(config)
              .then((res) => {
                refetchDataFromParent && refetchDataFromParent();

                if (
                  confirmationSidebarConfig.bulk &&
                  (res.data.severity == 'warn' || res.data.severity == 'error')
                ) {
                  setBulkError(
                    res.data.errorMessageArr ? res.data.errorMessageArr : []
                  );
                  setBulkErrorHeader(res.data.summary);
                  setVisible(true);
                  toast.current.clear();
                } else {
                  toast.current?.replace({
                    severity: res.data.severity,
                    summary: res.data.summary,
                    life: 10000,
                  });
                }
              })
              .catch((error: any) => {
                (function () {
                  error.response.data.severity == 'warn'
                    ? toast.current.show({
                        severity: 'warn',
                        summary: `Incomplete Approval/Disapproval of Applications`,
                        detail: error.response.data.message,
                        sticky: true,
                        closable: true,
                      })
                    : toast.current?.show({
                        severity: 'error',
                        summary: error.response.data.message,
                        sticky: true,
                        closable: true,
                      });
                })();
              });
            setConfirmationSidebarConfig((prev: any) => ({
              ...prev,
              bulk: false,
            }));
            setIsSubmitting(false);
          }}
        />
      )}
    </>
  );
};

export default AttendanceApplicationTable;
