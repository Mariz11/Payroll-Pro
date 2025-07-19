'use client';

import { useQueries } from '@tanstack/react-query';
import {
  convertMinsToHours,
  properCasing,
  removeExtraSpaces,
} from '@utils/helper';
import axios from 'axios';
import DashboardNav from 'lib/components/blocks/dashboardNav';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Paginator } from 'primereact/paginator';
import { Sidebar } from 'primereact/sidebar';
import { Skeleton } from 'primereact/skeleton';
import { Toast } from 'primereact/toast';
import { useEffect, useRef, useState } from 'react';
import AttendanceSidebar from './attendanceSidebar';
// import { forEach } from 'lodash';
import { isCompanyProcessing } from '@utils/companyDetailsGetter';
import ErrorDialog from 'lib/components/blocks/errorDialog';
const romanNumeralRe =
  /^(M{0,3})(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;
const EmployeeAttendanceSidebar = ({
  configuration: { title, submitBtnText, action, rowData, isOpen },
  setSideBarConfig,
  refetchDataFromParent,
  forceResetSelectedRows,
  setForceResetSelectedRows,
}: {
  configuration: SideBarConfig;
  setSideBarConfig: any;
  refetchDataFromParent: () => void;
  forceResetSelectedRows: boolean;
  setForceResetSelectedRows: any;
}) => {
  const toast = useRef<Toast>(null);
  const [attendanceSidebarConfig, setAttendanceSidebarConfig] =
    useState<SideBarConfig>({
      title: '',
      submitBtnText: '',
      action: '',
      rowData: {},
      isOpen: false,
    });
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    offset: 0,
    limit: 5,
    first: 0,
  });
  const { limit, offset, first } = pagination;

  const [attendanceEmployeesQuery] = useQueries({
    queries: [
      {
        refetchOnWindowFocus: false,
        queryKey: ['attendanceEmployees', pagination, searchQuery],
        enabled: !!rowData.departmentId && !!rowData.companyId,
        queryFn: async () => {
          const response = await axios.get(
            `/api/attendances/employees?businessMonth=${
              rowData.businessMonth
            }&cycle=${rowData.cycle}&departmentId=${
              rowData.departmentId
            }&companyId=${
              rowData.companyId
            }&limit=${limit}&offset=${offset}&isPosted=${
              rowData.isPosted ? 1 : 0
            }&search=${searchQuery}`,
            {
              headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
              },
            }
          );
          var transformedData = response.data.rows.map((item: any) => {
            item.employeeFullName = `${removeExtraSpaces(
              item.lastName
            )}, ${removeExtraSpaces(item.firstName)}${
              removeExtraSpaces(item.middleName)
                ? ' ' + removeExtraSpaces(item.middleName)
                : ''
            }${
              !removeExtraSpaces(item.suffix) ||
              removeExtraSpaces(item.suffix) == ''
                ? ''
                : romanNumeralRe.test(removeExtraSpaces(item.suffix))
                ? ', ' + removeExtraSpaces(item.suffix).toUpperCase()
                : ', ' + properCasing(removeExtraSpaces(item.suffix)) + '.'
            }`;

            return item;
          });

          response.data.rows = transformedData;

          return response.data;
        },
      },
    ],
  });

  useEffect(() => {
    setPagination({
      offset: 0,
      limit: 5,
      first: 0,
    });
  }, [isOpen]);

  return (
    <>
      <Toast ref={toast} position="bottom-left" />
      <Sidebar
        closeOnEscape={true}
        position="right"
        style={{
          width: '87%',
        }}
        visible={isOpen}
        onShow={() => attendanceEmployeesQuery.refetch()}
        onHide={() =>
          setSideBarConfig((prev: any) => ({ ...prev, isOpen: false }))
        }
      >
        <DashboardNav
          navTitle={properCasing(title)}
          buttons={[]}
          isShowSearch={true}
          setValueSearchText={setSearchQuery}
          valueSearchText={searchQuery}
          searchPlaceholder=""
        />
        {attendanceEmployeesQuery.error ? (
          <ErrorDialog />
        ) : (
          <DataTable
            id="employee-attendance-datatable"
            value={
              attendanceEmployeesQuery.isFetching
                ? [
                    {
                      dummy: '',
                    },
                    {
                      dummy: '',
                    },
                    {
                      dummy: '',
                    },
                  ]
                : attendanceEmployeesQuery?.data?.rows
            }
            selectionMode={'single'}
            onSelectionChange={async (e) => {
              if (!e.value.isPosted) {
                toast.current?.clear();
                if (
                  await isCompanyProcessing({
                    taskName: 'Post Attendance',
                    departmentName: e.value.departmentName,
                    businessMonth: e.value.businessMonth,
                    cycle: e.value.cycle,
                  })
                ) {
                  return toast.current?.replace({
                    severity: 'warn',
                    summary: 'This action is prohibited',
                    detail: 'The system is currently processing this entry.',
                    life: 5000,
                    closable: true,
                  });
                }
              }

              attendanceEmployeesQuery.isFetching
                ? null
                : setAttendanceSidebarConfig({
                    title: 'Edit Employee',
                    submitBtnText: 'Update',
                    action: 'edit',
                    rowData: e.value,
                    isOpen: true,
                  });
            }}
            frozenWidth="95rem"
            scrollable={true}
            tableStyle={{ minWidth: '95rem' }}
          >
            <Column
              field="employeeFullName"
              header="Employee Name"
              body={(data) => {
                return attendanceEmployeesQuery.isFetching ? (
                  <Skeleton />
                ) : (
                  data.employeeFullName
                );
              }}
            />
            <Column
              field="department"
              header="Department"
              body={(data) => {
                return attendanceEmployeesQuery.isFetching ? (
                  <Skeleton />
                ) : (
                  data.departmentName
                );
              }}
            />
            <Column
              field="totalDaysWorked"
              header="Days Present"
              body={(data) => {
                if (attendanceEmployeesQuery.isFetching) {
                  return <Skeleton />;
                }
                const totalDaysPresent = Number(data.totalDaysPresent);
                const totalDaysLeave = Number(data.totalDaysLeave);
                const totalHalfDays = Number(data.totalHalfDays);
                return totalDaysPresent + totalDaysLeave - totalHalfDays * 0.5;
              }}
            />
            <Column
              field="totalLateHours"
              header="Late (hrs)"
              body={(data) => {
                if (attendanceEmployeesQuery.isFetching) {
                  return <Skeleton />;
                }
                const totalLateHoursInMins = Number(data.totalLateHours) * 60;
                return convertMinsToHours({
                  minutes: totalLateHoursInMins,
                  withUnit: true,
                });
              }}
            />
            <Column
              field="totalUndertimeHours"
              header="Undertime (hrs)"
              body={(data) => {
                if (attendanceEmployeesQuery.isFetching) {
                  return <Skeleton />;
                }
                const totalUndertimeHoursInMins =
                  Number(data.totalUndertimeHours) * 60;
                return convertMinsToHours({
                  minutes: totalUndertimeHoursInMins,
                  withUnit: true,
                });
              }}
            />
            <Column
              field="totalOvertimeHours"
              header="Overtime (hrs)"
              body={(data) => {
                if (attendanceEmployeesQuery.isFetching) {
                  return <Skeleton />;
                }
                const totalOvertimeHoursInMins =
                  Number(data.totalOvertimeHours) * 60;
                return convertMinsToHours({
                  minutes: totalOvertimeHoursInMins,
                  withUnit: true,
                });
              }}
            />

            <Column
              field="totalNightDiffHours"
              header="Night Differential (hrs)"
              body={(data) => {
                if (attendanceEmployeesQuery.isFetching) {
                  return <Skeleton />;
                }
                const totalNightDiffHours =
                  Number(data.totalNightDiffHours) * 60;
                return convertMinsToHours({
                  minutes: totalNightDiffHours,
                  withUnit: true,
                });
              }}
            />
            {/* <Column
              field="totalNightDiffHours"
              header="Night Diff (hrs)"
              body={(data) => {
                if (attendanceEmployeesQuery.isFetching) {
                  return <Skeleton />;
                }
                const totalNightDiffHoursInMins =
                  Number(data.totalNightDiffHours) * 60;
                return convertMinsToHours({
                  minutes: totalNightDiffHoursInMins,
                  withUnit: true,
                });
              }}
            /> */}
            {/* <Column
              field="datePosted"
              header="Date Posted"
              body={(data) => {
                if (attendanceEmployeesQuery.isFetching) return <Skeleton />;
                return data.isPosted
                  ? moment(data.datePosted).format('LL - LT')
                  : '';
              }}
              // hidden={tableFor == 'PENDING'}
            ></Column> */}
            <Column
              field="actions"
              header="Actions"
              hidden={rowData.isPosted}
              body={actionTemplate}
            />
          </DataTable>
        )}
        <Paginator
          first={first}
          rows={limit}
          totalRecords={
            attendanceEmployeesQuery.data &&
            attendanceEmployeesQuery.data?.count?.length
          }
          rowsPerPageOptions={[5, 15, 25, 50, 100]}
          onPageChange={(event) => {
            const { page, rows, first }: any = event;
            setPagination((prev: any) => ({
              ...prev,
              first: first,
              offset: rows * page,
              limit: rows,
            }));
          }}
        />
      </Sidebar>

      {/* SIDEBAR */}
      <AttendanceSidebar
        configuration={attendanceSidebarConfig}
        setSideBarConfig={setAttendanceSidebarConfig}
        refetchDataFromParent={attendanceEmployeesQuery.refetch}
        setForceResetSelectedRows={setForceResetSelectedRows}
        forceResetSelectedRows={forceResetSelectedRows}
      />
    </>
  );

  function actionTemplate(tableData: any) {
    if (attendanceEmployeesQuery.isFetching) {
      return <Skeleton />;
    }
    return (
      <div className="flex flex-nowrap gap-2">
        <Button
          id="edit-attendance-button"
          type="button"
          text
          severity="secondary"
          icon="pi pi-file-edit"
          tooltip="Edit"
          tooltipOptions={{ position: 'top' }}
          onClick={async (e) => {
            e.stopPropagation();
            toast.current?.clear();

            if (!tableData.isPosted) {
              if (
                await isCompanyProcessing({
                  taskName: 'Post Attendance',
                  departmentName: tableData.departmentName,
                  businessMonth: tableData.businessMonth,
                  cycle: tableData.cycle,
                })
              ) {
                return toast.current?.replace({
                  severity: 'warn',
                  summary: 'This action is prohibited',
                  detail: 'The system is currently processing this entry.',
                  life: 5000,
                  closable: true,
                });
              }
            }

            setAttendanceSidebarConfig({
              title: 'Edit Employee',
              submitBtnText: 'Update',
              action: 'edit',
              rowData: tableData,
              isOpen: true,
            });
          }}
        />
      </div>
    );
  }
};

export default EmployeeAttendanceSidebar;
