'use client';

import React, { useContext, useEffect, useRef, useState } from 'react';

import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import ReactHtmlParser from 'react-html-parser';
import { DataTable } from 'primereact/datatable';
import { addS, amountFormatter, properCasing, uuidv4 } from '@utils/helper';
import DeleteSidebar from './deleteSidebar';
import { Dropdown } from 'primereact/dropdown';
import { Skeleton } from 'primereact/skeleton';
import { TabPanel, TabView } from 'primereact/tabview';
import moment from '@constant/momentTZ';
import PostSidebar from './postSidebar';
import { table } from 'console';
import { Dialog } from 'primereact/dialog';
import { isCompanyProcessing } from '@utils/companyDetailsGetter';
import { classNames } from 'primereact/utils';

const AttendanceTable = ({
  attendanceQuery,
  departmentsQuery,
  setSideBarConfig,
  filters,
  setFilters,
  pagination,
  setPagination,
  tableFor,
  isSubmitting,
  setIsSubmitting,
  postedAttendanceQuery,
  pendingAttendanceQuery,
  // setHasCreditableOT,
  // hasCreditableOT,
  // employeesWithCreditableOT,
  toast,
  pageActions,
  forceResetSelectedRows,
}: {
  attendanceQuery: any;
  departmentsQuery: any;
  setSideBarConfig: (p: any) => void;
  filters: any;
  setFilters: (p: any) => void;
  pagination: any;
  setPagination: (p: any) => void;
  tableFor?: string;
  isSubmitting: boolean;
  setIsSubmitting: (p: boolean) => void;
  postedAttendanceQuery?: any;
  pendingAttendanceQuery?: any;
  // setHasCreditableOT: (p: boolean) => void;
  // hasCreditableOT: boolean;
  // employeesWithCreditableOT: any[];
  toast: any;
  pageActions: any;
  forceResetSelectedRows: boolean;
}) => {
  const [selectedRows, setSelectedRows] = useState<any>([]);
  const departmentsAdded = useRef<any>({});
  // const [bulkError, setBulkError] = useState<any>([]);
  // const [bulkErrorHeader, setBulkErrorHeader] = useState<string>('');
  const [visible, setVisible] = useState(false);
  const [postSidebarConfig, setPostSidebarConfig] = useState<PostSidebarConfig>(
    {
      header: '',
      subHeader: '',
      submitText: '',
      cancelText: '',
      rowData: {},
      isOpen: false,
      bulk: false,
    }
  );
  const bulkDelete = () => {
    setDeleteSidebarConfig({
      header: `Delete SelectedAttendances`,
      subHeader:
        'Removing these attendance entries cannot be undone. Are you sure you want to continue?',
      submitText: 'Delete',
      cancelText: 'Cancel',
      rowData: {},
      isOpen: true,
      bulk: true,
    });
  };
  const bulkPost = () => {
    let hasRepeat = false;
    for (let i = 0; i < selectedRows.length; i++) {
      1;
      if (
        departmentsAdded.current[selectedRows[i].departmentId] &&
        (departmentsAdded.current[selectedRows[i].departmentId].businessMonth !=
          selectedRows[i].businessMonth ||
          departmentsAdded.current[selectedRows[i].departmentId].cycle !=
            selectedRows[i].cycle)
      ) {
        hasRepeat = true;
        break;
      }
      departmentsAdded.current[selectedRows[i].departmentId] = {
        businessMonth: selectedRows[i].businessMonth,
        cycle: selectedRows[i].cycle,
      };
    }
    departmentsAdded.current = {};
    if (hasRepeat === true) {
      toast.current?.replace({
        severity: 'error',
        summary: 'Bulk Posting Error',
        detail: 'You may only process one payroll at a time per department.',
        sticky: true,
        closable: true,
      });
      return null;
    }
    setPostSidebarConfig({
      header: `Post Selected Attendance/s`,
      subHeader: 'Are you sure you want to post the selected attendance/s?',
      submitText: 'Post',
      cancelText: 'Cancel',
      rowData: {},
      isOpen: true,
      bulk: true,
    });
  };
  useEffect(() => {
    setSelectedRows([]);
    // console.log('restttt!');
  }, [forceResetSelectedRows]);
  const [deleteSidebarConfig, setDeleteSidebarConfig] =
    useState<DeleteSidebarConfig>({
      header: '',
      subHeader: '',
      submitText: '',
      cancelText: '',
      rowData: {},
      isOpen: false,
      bulk: false,
    });

  useEffect(() => {
    if (attendanceQuery.isLoading || attendanceQuery.isRefetching) {
      setPostSidebarConfig((prev: any) => ({ ...prev, isOpen: false }));
      setDeleteSidebarConfig((prev: any) => ({ ...prev, isOpen: false }));
    }
  }, [attendanceQuery.isLoading, attendanceQuery.isRefetching]);

  const dataNotReady = selectedRows.length == 0 || attendanceQuery.isLoading || attendanceQuery.isRefetching

  const isPosted = tableFor == 'POSTED';

  return (
    <>
      {
        <div className="flex gap-2 flex-row-reverse mb-2">
          {pageActions.deleteAttendance && (
            <Button
              className="p-button-secondary rounded-full"
              onClick={() => {
                if (
                  dataNotReady
                ) {
                  return;
                }
                bulkDelete();
              }}
              disabled={
                dataNotReady ||
                isSubmitting
              }
            >
              <p>Delete All</p>
            </Button>
          )}
          {pageActions.postAttendance && (
            <Button
              className="rounded-full"
              onClick={() => {
                if (
                  dataNotReady
                ) {
                  return;
                }
                bulkPost();
              }}
              disabled={
                dataNotReady ||
                isSubmitting 
              }
            >
              <p>Post All</p>
            </Button>
          )}
        </div>
      }
      <DataTable
        value={
          attendanceQuery.isLoading || attendanceQuery.isRefetching
            ? [
                {
                  dummy: '',
                },
              ]
            : attendanceQuery?.data?.rows
        }
        selection={selectedRows}
        disabled={isSubmitting}
        selectionMode={'single'}
        onSelectionChange={async (e) => {
          if (
            attendanceQuery.isLoading ||
            attendanceQuery.isRefetching ||
            isSubmitting
          ) {
            return null;
          }
          if (tableFor == 'PENDING') {
            setSelectedRows(e.value);
          } else {
            setSideBarConfig({
              title: `${e.value.businessMonthCycle}`,
              action: 'view',
              rowData: e.value,
              isOpen: true,
            });
          }
        }}
        frozenWidth="95rem"
        scrollable={true}
        tableStyle={{ minWidth: '95rem' }}
        filters={filters}
        filterDisplay="row"
        // header={header}
      >
        {tableFor == 'POSTED' ? null : (
          <Column
            selectionMode="multiple"
            headerStyle={{ width: '3rem' }}
          ></Column>
        )}

        <Column
          field="departmentId"
          header="Department"
          filterField="departmentId"
          showFilterMenu={false}
          filterMenuStyle={{ width: '14rem' }}
          style={{ minWidth: '14rem' }}
          filter
          filterElement={(options: any) => (
            <Dropdown
              filter
              value={options.value}
              options={
                
                !departmentsQuery.isLoading &&
                departmentsQuery.data.length > 0
                  ? departmentsQuery.data
                      .filter((dpt: any) =>
                        (isPosted && dpt.hasPosted) || (!isPosted && dpt.hasPending)
                      )
                      .map((i: any) => ({
                        name: !i.deletedAt
                          ? i.departmentName
                          : i.departmentName + ' - DELETED',
                        value: i.departmentId,
                      }))
                  : []
              }
              onChange={(e) => {
                const value = e.target.value;
                let _filters: any = { ...filters };

                if (value) {
                  setPagination((prev: any) => ({
                    ...prev,
                    offset: 0,
                  }));
                } else {
                  setPagination((prev: any) => ({
                    ...prev,
                    limit: 5,
                    offset: pagination.first,
                  }));
                }
                _filters['departmentId'].value = value;
                setFilters(_filters);
              }}
              optionLabel="name"
              placeholder="All Departments"
              className="p-column-filter"
              showClear
              // maxSelectedLabels={1}
              style={{ minWidth: '14rem' }}
            />
          )}
          body={(data) => {
            return attendanceQuery.isLoading || attendanceQuery.isRefetching ? (
              <Skeleton />
            ) : (
              data?.department?.departmentName
            );
          }}
        />
        <Column
          field="businessMonth"
          header="Business Month - Cycle"
          body={(data) => {
            return attendanceQuery.isLoading || attendanceQuery.isRefetching ? (
              <Skeleton />
            ) : (
              `${data.businessMonth} - ${properCasing(data.cycle)}`
            );
          }}
        />
        <Column
          field="createdAt"
          header="Date Created"
          body={(data) => {
            if (attendanceQuery.isLoading || attendanceQuery.isRefetching)
              return <Skeleton />;
            return moment(data.createdAt).format('LL');
          }}
          hidden={tableFor == 'POSTED'}
        />
        <Column
          field="datePosted"
          header="Date Posted"
          body={(data) => {
            if (attendanceQuery.isLoading || attendanceQuery.isRefetching)
              return <Skeleton />;
            return data.isPosted ? moment(data.datePosted).format('LL') : '';
          }}
          hidden={tableFor == 'PENDING'}
        />
        <Column
          field="actions"
          header="Actions"
          body={(rowData) => {
            return attendanceQuery.isLoading || attendanceQuery.isRefetching ? (
              <Skeleton />
            ) : !rowData.isPosted ? (
              <div
                className="flex flex-nowrap gap-2"
                data-testid={rowData.attendanceId}
              >
                <Button
                  type="button"
                  text
                  icon="pi pi-eye"
                  tooltip="View"
                  id="view-attendances-button"
                  tooltipOptions={{ position: 'top' }}
                  onClick={async () => {
                    if (
                      attendanceQuery.isRefetching ||
                      attendanceQuery.isLoading
                    ) {
                      return null;
                    }
                    if (
                      await isCompanyProcessing({
                        taskName: 'Post Attendance',
                        departmentName: rowData.department.departmentName,
                        businessMonth: rowData.businessMonth,
                        cycle: rowData.cycle,
                      })
                    ) {
                      return toast.current?.replace({
                        severity: 'warn',
                        summary: 'This action is prohibited',
                        detail:
                          'The system is currently processing this entry.',
                        life: 5000,
                        closable: true,
                      });
                    }
                    setSideBarConfig({
                      title: `${rowData.businessMonthCycle}`,
                      action: 'view',
                      rowData: rowData,
                      isOpen: true,
                    });
                  }}
                />
                {pageActions.deleteAttendance && (
                  <Button
                    type="button"
                    text
                    icon="pi pi-trash"
                    tooltip="Delete"
                    tooltipOptions={{ position: 'top' }}
                    onClick={async () => {
                      toast.current?.clear();
                      if (
                        attendanceQuery.isRefetching ||
                        attendanceQuery.isLoading
                      ) {
                        return null;
                      }
                      if (
                        await isCompanyProcessing({
                          taskName: 'Post Attendance',
                          departmentName: rowData.department.departmentName,
                          businessMonth: rowData.businessMonth,
                          cycle: rowData.cycle,
                        })
                      ) {
                        return toast.current?.replace({
                          severity: 'warn',
                          summary: 'This action is prohibited',
                          detail:
                            'The system is currently processing this entry.',
                          life: 5000,
                          closable: true,
                        });
                      }
                      setDeleteSidebarConfig({
                        header: `Delete ${rowData.businessMonth} - ${rowData.cycle}`,
                        subHeader:
                          'Removing this attendance cannot be undone. Are you sure you want to continue?',
                        submitText: 'Delete',
                        cancelText: 'Cancel',
                        rowData: rowData,
                        isOpen: true,
                        bulk: false,
                      });
                    }}
                  />
                )}
              </div>
            ) : null;
          }}
          hidden={tableFor == 'POSTED'}
        />
      </DataTable>

      <Button
        className="w-full hover:!bg-[#dfffdf]"
        text
        onClick={() => {
          attendanceQuery.refetch();
          tableFor == 'POSTED'
            ? pendingAttendanceQuery?.refetch()
            : postedAttendanceQuery?.refetch();
        }}
        style={{
          display: 'block',
          background: '#edffed',
          color: '#4CAF50',
          textAlign: 'center',
        }}
        disabled={attendanceQuery.isRefetching}
      >
        <i
          className={classNames('pi pi-sync text-[12px]', {
            'pi pi-spin pi-spinner': attendanceQuery.isRefetching,
          })}
        ></i>{' '}
        {attendanceQuery.isRefetching ? 'Refreshing...' : 'Refresh'}
      </Button>
      {/* DELETE SIDEBAR */}
      {tableFor == 'PENDING' && !attendanceQuery.isRefetching && (
        <>
          <DeleteSidebar
            deleteSidebarConfig={deleteSidebarConfig}
            setDeleteSidebarConfig={setDeleteSidebarConfig}
            refetch={attendanceQuery.refetch}
            selectedRows={selectedRows}
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
            setSelectedRows={setSelectedRows}
            departmentsAdded={departmentsAdded}
            toast={toast}
          />
          <PostSidebar
            postSidebarConfig={postSidebarConfig}
            setPostSidebarConfig={setPostSidebarConfig}
            refetch={attendanceQuery.refetch}
            selectedRows={selectedRows}
            setIsSubmitting={setIsSubmitting}
            isSubmitting={isSubmitting}
            postedAttendanceQuery={postedAttendanceQuery}
            setSelectedRows={setSelectedRows}
            departmentsAdded={departmentsAdded}
            setVisible={setVisible}
            // setBulkError={setBulkError}
            // setBulkErrorHeader={setBulkErrorHeader}
            // setHasCreditableOT={setHasCreditableOT}
            // hasCreditableOT={hasCreditableOT}
            // employeesWithCreditableOT={employeesWithCreditableOT}
            toast={toast}
          ></PostSidebar>
          {/* <Dialog
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
          </Dialog> */}
        </>
      )}
    </>
  );
};

export default AttendanceTable;
