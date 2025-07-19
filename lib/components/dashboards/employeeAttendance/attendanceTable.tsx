'use client';

import React, { useContext, useEffect, useRef, useState } from 'react';

import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import ReactHtmlParser from 'react-html-parser';
import { DataTable } from 'primereact/datatable';
import { addS, amountFormatter, properCasing, uuidv4 } from '@utils/helper';
import { Dropdown } from 'primereact/dropdown';
import { Skeleton } from 'primereact/skeleton';
import { TabPanel, TabView } from 'primereact/tabview';
import moment from '@constant/momentTZ';

const AttendanceTable = ({
  attendanceQuery,
  departmentsQuery,
  setSideBarConfig,
  filters,
  setFilters,
  pagination,
  setPagination,
  tableFor,
}: {
  attendanceQuery: any;
  departmentsQuery: any;
  setSideBarConfig: (p: any) => void;
  filters: any;
  setFilters: (p: any) => void;
  pagination: any;
  setPagination: (p: any) => void;
  tableFor?: string;
}) => {
  const [deleteSidebarConfig, setDeleteSidebarConfig] =
    useState<DeleteSidebarConfig>({
      header: '',
      subHeader: '',
      submitText: '',
      cancelText: '',
      rowData: {},
      isOpen: false,
    });
  return (
    <>
      <DataTable
        value={
          attendanceQuery.isLoading
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
            : attendanceQuery?.data?.rows
        }
        selectionMode={'single'}
        onSelectionChange={(e) =>
          attendanceQuery.isLoading
            ? null
            : setSideBarConfig({
                title: `${e.value.businessMonthCycle}`,
                action: 'view',
                rowData: e.value,
                isOpen: true,
              })
        }
        frozenWidth="95rem"
        scrollable={true}
        tableStyle={{ minWidth: '95rem' }}
      >
        <Column
          field="departmentId"
          header="Department"
          style={{ minWidth: '14rem' }}
          body={(data) => {
            return attendanceQuery.isLoading ? (
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
            return attendanceQuery.isLoading ? (
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
            if (attendanceQuery.isLoading) return <Skeleton />;
            return moment(data.createdAt).format('LL');
          }}
          hidden={tableFor == 'POSTED'}
        />
        <Column
          field="updatedAt"
          header="Date Posted"
          body={(data) => {
            if (attendanceQuery.isLoading) return <Skeleton />;
            return data.isPosted ? moment(data.createdAt).format('LL') : '';
          }}
          hidden={tableFor == 'PENDING'}
        />
        {/* <Column
          field="status"
          header="Status"
          body={(data) => {
            return attendanceQuery.isLoading ? (
              <Skeleton />
            ) : data.isPosted ? (
              <span className="py-2 px-5 rounded-full bg-green-200 text-green-700">
                POSTED
              </span>
            ) : (
              <span className="py-2 px-5 rounded-full bg-orange-200 text-orange-700">
                PENDING
              </span>
            );
          }}
        /> */}
      </DataTable>
    </>
  );
};

export default AttendanceTable;
