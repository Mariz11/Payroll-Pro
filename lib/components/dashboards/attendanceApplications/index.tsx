'use client';

import { useQueries, useQuery } from '@tanstack/react-query';
import DashboardNav from 'lib/components/blocks/dashboardNav';
import React, { useContext, useRef, useState } from 'react';
import axios from 'axios';
import { Toast } from 'primereact/toast';
import { TabPanel, TabView } from 'primereact/tabview';
import AttendanceApplicationTable from './attendanceApplicationTable';
import { Badge } from 'primereact/badge';
import { ButtonType } from '@enums/button';
import AttendanceAppForm from './attendanceAppForm';
import { Paginator } from 'primereact/paginator';

function Index({ moduleRole }: { moduleRole?: string }) {
  const toast = useRef<Toast>(null);

  const [attendanceAppFormConfig, setAttendanceAppFormConfig] =
    useState<SideBarConfig>({
      title: '',
      submitBtnText: '',
      action: '',
      rowData: {},
      isOpen: false,
    });

  const [pendingPagination, setPendingPagination] = useState({
    offset: 0,
    limit: 5,
    first: 0,
  });
  const [approvedPagination, setApprovedPagination] = useState({
    offset: 0,
    limit: 5,
    first: 0,
  });
  const [cancelledPagination, setCancelledPagination] = useState({
    offset: 0,
    limit: 5,
    first: 0,
  });
  const [disapprovedPagination, setDisapprovedPagination] = useState({
    offset: 0,
    limit: 5,
    first: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');

  const [tblPending, tblApproved, tblCancelled, tblDisapproved] = useQueries({
    queries: [
      // Pending
      {
        refetchOnWindowFocus: false,
        queryKey: ['tblPending', pendingPagination, searchQuery],
        queryFn: async () => {
          try {
            const response = await axios.get(
              `/api/attendanceApplication?status=0&limit=${pendingPagination.limit}&offset=${pendingPagination.offset}&search=${searchQuery}`,
              {
                method: 'GET',
                headers: {
                  Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
                },
              }
            );
            return response.data;
          } catch (error) {
            return [];
          }
        },
      },
      // Approved
      {
        refetchOnWindowFocus: false,
        queryKey: ['tblApproved', approvedPagination, searchQuery],
        queryFn: async () => {
          try {
            const response = await axios.get(
              `/api/attendanceApplication?status=1&limit=${approvedPagination.limit}&offset=${approvedPagination.offset}&search=${searchQuery}`,
              {
                method: 'GET',
                headers: {
                  Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
                },
              }
            );
            return response.data;
          } catch (error) {
            return [];
          }
        },
      },
      // Cancelled
      {
        refetchOnWindowFocus: false,
        queryKey: ['tblCancelled', cancelledPagination, searchQuery],
        queryFn: async () => {
          try {
            const response = await axios.get(
              `/api/attendanceApplication?status=2&limit=${cancelledPagination.limit}&offset=${cancelledPagination.offset}&search=${searchQuery}`,
              {
                method: 'GET',
                headers: {
                  Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
                },
              }
            );
            return response.data;
          } catch (error) {
            return [];
          }
        },
      },
      // Disapproved
      {
        refetchOnWindowFocus: false,
        queryKey: ['tblDisapproved', disapprovedPagination, searchQuery],
        queryFn: async () => {
          try {
            const response = await axios.get(
              `/api/attendanceApplication?status=3&limit=${disapprovedPagination.limit}&offset=${disapprovedPagination.offset}&search=${searchQuery}`,
              {
                method: 'GET',
                headers: {
                  Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
                },
              }
            );
            return response.data;
          } catch (error) {
            return [];
          }
        },
      },
    ],
  });

  return (
    <div className="w-screen h-screen overflow-auto p-5">
      {/* DASHBOARD NAV */}
      <DashboardNav
        navTitle="Attendance Applications"
        buttons={[
          {
            label: 'Create',
            type: ButtonType.Red,
            handler: () =>
              setAttendanceAppFormConfig({
                isOpen: true,
                title: 'Create Attendance Application',
                submitBtnText: 'Submit Application',
                action: 'add',
                rowData: null,
              }),
            isDropdown: false,
            isIcon: false,
          },
        ]}
        isShowSearch={true}
        searchPlaceholder=""
        valueSearchText={searchQuery}
        setValueSearchText={setSearchQuery}
      />

      {/* MAIN CONTENT */}
      <div className="line-container rounded-lg p-5">
        <TabView>
          {/* Pending */}
          <TabPanel
            className="mb-[2px]"
            header={
              <div className="table-header overflow-hidden bg-transparent">
                Pending{' '}
                <Badge
                  className="table-badge"
                  value={tblPending.isLoading ? 0 : tblPending.data?.count}
                ></Badge>
              </div>
            }
          >
            <AttendanceApplicationTable
              toast={toast}
              tableData={tblPending}
              setAttendanceAppFormConfig={setAttendanceAppFormConfig}
              tableFor={'PENDING'}
              refetchDataFromParent={() => {
                tblPending.refetch();
                tblApproved.refetch();
                tblCancelled.refetch();
                tblDisapproved.refetch();
              }}
              moduleRole={moduleRole}
            ></AttendanceApplicationTable>
            <Paginator
              first={pendingPagination.first}
              rows={pendingPagination.limit}
              totalRecords={tblPending && tblPending?.data?.count}
              rowsPerPageOptions={[5, 15, 25, 50, 100]}
              onPageChange={(event) => {
                const { page, rows, first }: any = event;
                setPendingPagination((prev: any) => ({
                  ...prev,
                  first: first,
                  offset: rows * page,
                  limit: rows,
                }));
              }}
            />
          </TabPanel>
          {/* Approved */}
          <TabPanel
            header={
              <div className="table-header overflow-hidden bg-transparent">
                Approved{' '}
                <Badge
                  className="table-badge"
                  value={tblApproved.isLoading ? 0 : tblApproved.data?.count}
                ></Badge>
              </div>
            }
          >
            <AttendanceApplicationTable
              toast={toast}
              tableData={tblApproved}
              setAttendanceAppFormConfig={setAttendanceAppFormConfig}
              tableFor={'APPROVED'}
              refetchDataFromParent={() => {
                tblPending.refetch();
                tblApproved.refetch();
                tblCancelled.refetch();
                tblDisapproved.refetch();
              }}
              moduleRole={moduleRole}
            ></AttendanceApplicationTable>
            <Paginator
              first={approvedPagination.first}
              rows={approvedPagination.limit}
              totalRecords={tblApproved && tblApproved?.data?.count}
              rowsPerPageOptions={[5, 15, 25, 50, 100]}
              onPageChange={(event) => {
                const { page, rows, first }: any = event;
                setApprovedPagination((prev: any) => ({
                  ...prev,
                  first: first,
                  offset: rows * page,
                  limit: rows,
                }));
              }}
            />
          </TabPanel>

          {/* Disapproved */}
          <TabPanel
            header={
              <div className="table-header overflow-hidden bg-transparent">
                Disapproved{' '}
                <Badge
                  className="table-badge"
                  value={
                    tblDisapproved.isLoading ? 0 : tblDisapproved.data?.count
                  }
                ></Badge>
              </div>
            }
          >
            <AttendanceApplicationTable
              toast={toast}
              tableData={tblDisapproved}
              setAttendanceAppFormConfig={setAttendanceAppFormConfig}
              tableFor={'DISAPPROVED'}
              refetchDataFromParent={() => {
                tblPending.refetch();
                tblApproved.refetch();
                tblCancelled.refetch();
                tblDisapproved.refetch();
              }}
              moduleRole={moduleRole}
            ></AttendanceApplicationTable>
            <Paginator
              first={disapprovedPagination.first}
              rows={disapprovedPagination.limit}
              totalRecords={tblDisapproved && tblDisapproved?.data?.count}
              rowsPerPageOptions={[5, 15, 25, 50, 100]}
              onPageChange={(event) => {
                const { page, rows, first }: any = event;
                setDisapprovedPagination((prev: any) => ({
                  ...prev,
                  first: first,
                  offset: rows * page,
                  limit: rows,
                }));
              }}
            />
          </TabPanel>

          {/* Cancelled */}
          <TabPanel
            header={
              <div className="table-header overflow-hidden bg-transparent">
                Cancelled{' '}
                <Badge
                  className="table-badge"
                  value={tblCancelled.isLoading ? 0 : tblCancelled.data?.count}
                ></Badge>
              </div>
            }
          >
            <AttendanceApplicationTable
              toast={toast}
              tableData={tblCancelled}
              setAttendanceAppFormConfig={setAttendanceAppFormConfig}
              tableFor={'CANCELLED'}
              refetchDataFromParent={() => {
                tblPending.refetch();
                tblApproved.refetch();
                tblCancelled.refetch();
                tblDisapproved.refetch();
              }}
              moduleRole={moduleRole}
            ></AttendanceApplicationTable>
            <Paginator
              first={cancelledPagination.first}
              rows={cancelledPagination.limit}
              totalRecords={tblCancelled && tblCancelled?.data?.count}
              rowsPerPageOptions={[5, 15, 25, 50, 100]}
              onPageChange={(event) => {
                const { page, rows, first }: any = event;
                setCancelledPagination((prev: any) => ({
                  ...prev,
                  first: first,
                  offset: rows * page,
                  limit: rows,
                }));
              }}
            />
          </TabPanel>
        </TabView>
      </div>

      {/* SIDEBAR */}

      <AttendanceAppForm
        toast={toast}
        configuration={attendanceAppFormConfig}
        setSideBarConfig={setAttendanceAppFormConfig}
        refetchDataFromParent={() => {
          tblPending.refetch();
          tblApproved.refetch();
          tblCancelled.refetch();
          tblDisapproved.refetch();
        }}
        moduleRole={moduleRole}
      />

      {/* TOAST */}
      <Toast ref={toast} position="bottom-left" />
    </div>
  );
}

export default Index;
