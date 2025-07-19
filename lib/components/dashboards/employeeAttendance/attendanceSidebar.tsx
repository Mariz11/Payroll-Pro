'use client';

import { convertMinsToHours } from '@utils/helper';
import axios from 'axios';
import { Dayjs } from 'dayjs';
import DashboardNav from 'lib/components/blocks/dashboardNav';
import { GlobalContainer } from 'lib/context/globalContext';
import moment from '@constant/momentTZ';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Sidebar } from 'primereact/sidebar';
import { Skeleton } from 'primereact/skeleton';
import { useContext, useEffect, useState } from 'react';

const date = new Date();
const dateToday = date.toISOString().split('T')[0];

interface Attendance {
  date?: string;
  holiday?: {
    holidayType?: string;
  };
  attendanceId: number;
  timeIn: Dayjs | null;
  timeOut: Dayjs | null;
  lunchTimeIn: Dayjs | null;
  lunchTimeOut: Dayjs | null;
  undertimeHours: number;
  lateHours: number;
  status: string;
  isDayOff: boolean;
  isPresent: boolean;
  isLeave: boolean;
  isHalfDay: boolean;
}

const AttendanceSidebar = ({
  configuration: { title, submitBtnText, action, rowData, isOpen },
  setSideBarConfig,
  refetchDataFromParent,
}: {
  configuration: SideBarConfig;
  setSideBarConfig: any;
  refetchDataFromParent?: () => void;
}) => {
  const [items, setItems] = useState<any[]>([]);
  const context = useContext(GlobalContainer);

  useEffect(() => {
    if (isOpen) {
      axios
        .get(
          `/api/attendances/employees/details?businessMonth=${rowData.businessMonth}&cycle=${rowData.cycle}&employeeId=${context?.userData.employeeId}&companyId=${rowData.companyId}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
            },
          }
        )
        .then((response) => {
          setItems(response.data);
        });
    }
  }, [rowData, isOpen, context]);

  return (
    <>
      <Sidebar
        closeOnEscape={false}
        dismissable={false}
        position="right"
        style={{
          width: '87%',
        }}
        visible={isOpen}
        onHide={() =>
          setSideBarConfig((prev: any) => ({ ...prev, isOpen: false }))
        }
      >
        {rowData && (
          <DashboardNav
            navTitle={`${rowData?.businessMonthCycle}`}
            buttons={[]}
            isShowSearch={false}
          />
        )}

        <DataTable
          value={items}
          frozenWidth="120rem"
          scrollable={true}
          tableStyle={{ minWidth: '120rem' }}
          size="small"
          scrollHeight="650px"
          selectionMode={action == 'edit' ? 'single' : undefined}
        >
          <Column
            field="date"
            header="Date"
            body={(data) => {
              return items.length == 0 ? (
                <Skeleton />
              ) : (
                <>
                  {moment(data.date).format('MM/DD (ddd)')}{' '}
                  {data.manualLoginAction ? (
                    <i className="pi pi-sign-in text-green-500 text-[13px]"></i>
                  ) : (
                    ''
                  )}
                </>
              );
            }}
          />
          <Column
            field="holidayType"
            header="Holiday Type"
            body={(data) => {
              const holiday = data.holiday;
              return items.length == 0 ? (
                <Skeleton />
              ) : holiday ? (
                holiday.holidayType
              ) : (
                '-'
              );
            }}
          />
          <Column
            field="timeIn"
            header="Time-in"
            body={(data) => {
              return items.length == 0 ? (
                <Skeleton />
              ) : data.isPresent &&
                moment(data.timeIn, 'HH:mm:ss').isValid() ? (
                moment(data.timeIn, 'HH:mm:ss').format('LT')
              ) : (
                '-'
              );
            }}
          />

          <Column
            field="lunchTimeOut"
            header="Lunch-out"
            body={(data) => {
              return items.length == 0 ? (
                <Skeleton />
              ) : data.isPresent &&
                moment(data.lunchTimeOut, 'HH:mm:ss').isValid() ? (
                moment(data.lunchTimeOut, 'HH:mm:ss').format('LT')
              ) : (
                '-'
              );
            }}
          />
          <Column
            field="lunchTimeIn"
            header="Lunch-in"
            body={(data) => {
              return items.length == 0 ? (
                <Skeleton />
              ) : data.isPresent &&
                moment(data.lunchTimeIn, 'HH:mm:ss').isValid() ? (
                moment(data.lunchTimeIn, 'HH:mm:ss').format('LT')
              ) : (
                '-'
              );
            }}
          />
          <Column
            field="timeOut"
            header="Time-out"
            body={(data) => {
              return items.length == 0 ? (
                <Skeleton />
              ) : data.isPresent &&
                moment(data.timeOut, 'HH:mm:ss').isValid() ? (
                moment(data.timeOut, 'HH:mm:ss').format('LT')
              ) : (
                '-'
              );
            }}
          />
          <Column
            field="creditableOvertime"
            header="Creditable Overtime (hrs)"
            body={(data) => {
              if (items.length == 0) return <Skeleton />;
              if (data.isPresent) {
                const overtimeHoursInMins =
                  Number(data.creditableOvertime) * 60;
                return convertMinsToHours({
                  minutes: overtimeHoursInMins,
                  withUnit: true,
                });
              } else {
                return '-';
              }
            }}
          />
          <Column
            field="overtimeHours"
            header="Approved Overtime (hrs)"
            body={(data) => {
              if (items.length == 0) return <Skeleton />;
              if (data.isPresent) {
                const overtimeHoursInMins = Number(data.overtimeHours) * 60;
                return convertMinsToHours({
                  minutes: overtimeHoursInMins,
                  withUnit: true,
                });
              } else {
                return '-';
              }
            }}
          />

          <Column
            field="nightDiffHours"
            header="Night Differential (hrs)"
            body={(data) => {
              if (items.length == 0) return <Skeleton />;
              if (data.isPresent) {
                const nightDiffHoursInMins = Number(data.nightDiffHours) * 60;
                return convertMinsToHours({
                  minutes: nightDiffHoursInMins,
                  withUnit: true,
                });
              } else {
                return '-';
              }
            }}
          />
          <Column
            field="lateHours"
            header="Late (hrs)"
            body={(data) => {
              if (items.length == 0) return <Skeleton />;
              if (data.isPresent) {
                const lateHoursInMins = Number(data.lateHours) * 60;
                return convertMinsToHours({
                  minutes: lateHoursInMins,
                  withUnit: true,
                });
              } else {
                return '-';
              }
            }}
          />
          <Column
            field="undertimeHours"
            header="Undertime (hrs)"
            body={(data) => {
              if (items.length == 0) return <Skeleton />;
              if (data.isPresent) {
                const undertimeHoursInMins = Number(data.undertimeHours) * 60;
                return convertMinsToHours({
                  minutes: undertimeHoursInMins,
                  withUnit: true,
                });
              } else {
                return '-';
              }
            }}
          />
          {/* <Column
            field="nightDiffHours"
            header="Night Differential (hrs)"
            body={(data) => {
              if (items.length == 0) return <Skeleton />;
              if (data.isPresent) {
                const nightDiffHoursInMins = Number(data.nightDiffHours) * 60;
                return convertMinsToHours({
                  minutes: nightDiffHoursInMins,
                  withUnit: true,
                });
              } else {
                return '-';
              }
            }}
          /> */}
          <Column
            field="isHalfDay"
            header="Half Day"
            body={(data) => {
              if (items.length == 0) return <Skeleton />;
              return data.isHalfDay ? 'Yes' : 'No';
            }}
          />
          <Column
            field="status"
            header="Status"
            body={(data) => {
              if (items.length == 0) return <Skeleton />;
              const isPresent = data.isPresent;
              const isLeave = data.isLeave;
              const isDayOff = data.isDayOff;
              const isHalfDay = data.isHalfDay;
              let status = 'PRESENT';

              if (isPresent) status = 'PRESENT';
              else if (isLeave) status = 'LEAVE';
              else if (isDayOff) status = 'DAY-OFF';
              else status = 'ABSENT';
              return status;
            }}
          />
        </DataTable>

        <div className="mt-10 w-full flex justify-end">
          <Button
            type="button"
            severity="secondary"
            text
            label="Cancel"
            className="rounded-full px-10"
            onClick={() =>
              setSideBarConfig((prev: any) => ({
                ...prev,
                isOpen: false,
              }))
            }
          />
        </div>
      </Sidebar>
    </>
  );
};

export default AttendanceSidebar;
