'use client';

import React, { useRef, useState } from 'react';

import DashboardNav from 'lib/components/blocks/dashboardNav';
import { useQueries } from '@tanstack/react-query';
import axios from 'axios';
import { Paginator } from 'primereact/paginator';
import { Toast } from 'primereact/toast';
import { FilterMatchMode } from 'primereact/api';
import AttendanceTable from './attendanceTable';
import { TabPanel, TabView } from 'primereact/tabview';
import { Badge } from 'primereact/badge';
import ErrorDialog from 'lib/components/blocks/errorDialog';
import AttendanceSidebar from './attendanceSidebar';

const Index = () => {
  const toast = useRef<Toast>(null);
  const [pedningAttendanceFilters, setPedningAttendanceFilters] = useState({
    departmentId: {
      value: null,
      matchMode: FilterMatchMode.EQUALS,
    },
  });
  const [postedAttendanceFilters, setPostedAttendanceFilters] = useState({
    departmentId: {
      value: null,
      matchMode: FilterMatchMode.EQUALS,
    },
  });

  const [sideBarConfig, setSideBarConfig] = useState<SideBarConfig>({
    title: '',
    submitBtnText: '',
    action: '',
    rowData: {},
    isOpen: false,
  });

  const [searchQuery, setSearchQuery] = useState('');

  const [pendingAttendancePagination, setPendingAttendancePagination] =
    useState({
      offset: 0,
      limit: 5,
      first: 0,
    });
  const [postedAttendancePagination, setPostedAttendancePagination] = useState({
    offset: 0,
    limit: 5,
    first: 0,
  });

  const [departmentsQuery, pendingAttendanceQuery, postedAttendanceQuery] =
    useQueries({
      queries: [
        {
          refetchOnWindowFocus: false,
          queryKey: ['departments'],
          queryFn: async () => {
            const response = await axios.get(
              `/api/companies/paycycles/departments`,
              {
                headers: {
                  Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
                },
              }
            );
            return response.data;
          },
        },
        {
          refetchOnWindowFocus: false,
          queryKey: [
            'pendingAttendances',
            pendingAttendancePagination,
            searchQuery,
            pedningAttendanceFilters,
          ],
          queryFn: async () => {
            const response = await axios.get(
              `/api/attendances?status=PENDING&limit=${pendingAttendancePagination.limit}&offset=${pendingAttendancePagination.offset}&search=${searchQuery}`,
              {
                headers: {
                  Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
                },
              }
            );
            return response.data;
          },
        },
        {
          refetchOnWindowFocus: false,
          queryKey: [
            'postedAttendances',
            postedAttendancePagination,
            searchQuery,
            postedAttendanceFilters,
          ],
          queryFn: async () => {
            const response = await axios.get(
              `/api/attendances?status=POSTED&limit=${postedAttendancePagination.limit}&offset=${postedAttendancePagination.offset}&search=${searchQuery}`,
              {
                headers: {
                  Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
                },
              }
            );
            return response.data;
          },
        },
      ],
    });

  return (
    <div className="w-screen h-screen overflow-auto p-5">
      <Toast ref={toast} position="bottom-left" />
      {/* DASHBOARD NAV */}
      <DashboardNav
        navTitle="Attendance"
        buttons={[]}
        isShowSearch={true}
        searchPlaceholder=""
        setValueSearchText={setSearchQuery}
        valueSearchText={searchQuery}
      />

      {/* MAIN CONTENT */}
      <div className="line-container rounded-lg p-5">
        <React.Fragment>
          {pendingAttendanceQuery.error ? (
            <ErrorDialog />
          ) : (
            <>
              <TabView>
                <TabPanel
                  className=" mb-[2px]"
                  header={
                    <div className="table-header overflow-hidden bg-transparent">
                      Pending{' '}
                      <Badge
                        className="table-badge"
                        value={
                          pendingAttendanceQuery.data
                            ? pendingAttendanceQuery?.data.count
                            : 0
                        }
                      ></Badge>
                    </div>
                  }
                >
                  <AttendanceTable
                    attendanceQuery={pendingAttendanceQuery}
                    departmentsQuery={departmentsQuery}
                    setSideBarConfig={setSideBarConfig}
                    filters={pedningAttendanceFilters}
                    setFilters={setPedningAttendanceFilters}
                    pagination={pendingAttendancePagination}
                    setPagination={setPendingAttendancePagination}
                    tableFor={'PENDING'}
                  />

                  <Paginator
                    first={pendingAttendancePagination.first}
                    rows={pendingAttendancePagination.limit}
                    totalRecords={
                      pendingAttendanceQuery &&
                      pendingAttendanceQuery?.data?.count
                    }
                    rowsPerPageOptions={[5, 15, 25, 50, 100]}
                    onPageChange={(event) => {
                      const { page, rows, first }: any = event;
                      setPendingAttendancePagination((prev: any) => ({
                        ...prev,
                        first: first,
                        offset: rows * page,
                        limit: rows,
                      }));
                    }}
                  />
                </TabPanel>
                <TabPanel
                  className=" mb-[2px]"
                  header={
                    <div className="table-header overflow-hidden bg-transparent">
                      Posted{' '}
                      <Badge
                        className="table-badge"
                        value={
                          postedAttendanceQuery.data
                            ? postedAttendanceQuery.data.count
                            : 0
                        }
                      ></Badge>
                    </div>
                  }
                >
                  <AttendanceTable
                    attendanceQuery={postedAttendanceQuery}
                    departmentsQuery={departmentsQuery}
                    setSideBarConfig={setSideBarConfig}
                    filters={postedAttendanceFilters}
                    setFilters={setPostedAttendanceFilters}
                    pagination={postedAttendancePagination}
                    setPagination={setPostedAttendancePagination}
                    tableFor={'POSTED'}
                  />

                  <Paginator
                    first={postedAttendancePagination.first}
                    rows={postedAttendancePagination.limit}
                    totalRecords={
                      postedAttendanceQuery &&
                      postedAttendanceQuery?.data?.count
                    }
                    rowsPerPageOptions={[5, 15, 25, 50, 100]}
                    onPageChange={(event) => {
                      const { page, rows, first }: any = event;
                      setPostedAttendancePagination((prev: any) => ({
                        ...prev,
                        first: first,
                        offset: rows * page,
                        limit: rows,
                      }));
                    }}
                  />
                </TabPanel>
              </TabView>
            </>
          )}
        </React.Fragment>
      </div>

      {/* SIDEBAR */}
      <AttendanceSidebar
        configuration={sideBarConfig}
        setSideBarConfig={setSideBarConfig}
      />
    </div>
  );
};

export default Index;
