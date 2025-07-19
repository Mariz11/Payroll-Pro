'use client';
import React, { useState, useEffect, useContext } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import 'primereact/resources/primereact.min.css';
import { formatDateTime } from '../../../utils/dashboardFunction';
import classNames from 'classnames';
import { Paginator } from 'primereact/paginator';
import { Rowdies } from 'next/font/google';
import { Skeleton } from 'primereact/skeleton';
import moment from '@constant/momentTZ';
import { GlobalContainer } from 'lib/context/globalContext';
function RecentLogs({
  logsData,
  tableHeaders,
  data,
  pagination,
  loading,
  setPagination,
}: {
  logsData: Logs;
  tableHeaders: TableHeaders;
  data: any;

  loading: boolean;
  pagination: Pagination;
  setPagination: React.Dispatch<React.SetStateAction<Pagination>>;
}) {
  const context = useContext(GlobalContainer);
  const [first, setFirst] = useState(0);
  const columns = [
    { field: 'name', header: tableHeaders.header1 },
    { field: 'timeDate', header: tableHeaders.header2 },
  ];

  const formattedData = logsData?.logsData?.map((item) => {
    return {
      ...item,
      name: (
        <div>
          <div className="truncate overflow-hidden">
            {item.name ? item.name : 'N/A'}
          </div>
          <div
            className={`text-gray-400 text-[10px] md:text-[12px] truncate overflow-hidden ${
              typeof item.action === 'string' &&
              [
                'Cancelled',
                'Disapproved',
                'removed',
                'Removed',
                'Deactivated',
                'Deleted',
                'Unposted',
              ].some((word) => item.action.includes(word))
                ? 'text-red-600'
                : ''
            }`}
          >
            {item.action}
          </div>
        </div>
      ),
      timeDate: (
        <div className="text-[12px] md:text-[15px]  truncate overflow-hidden">
          {`${item.timeDate}`}
        </div>
      ),
    };
  });

  return (
    <div className="sm:ml-[20px] md:pr-5 lg:py-4 w-full h-auto lg:mt-0 mt-5">
      <div className="flex flex-row justify-between w-full items-center mb-4">
        <span className="text-[20px] font-bold">{tableHeaders.title}</span>
      </div>
      <div className="overflow-auto h-[450px]">
        <div className="card">
          {!loading && data && logsData && (
            <DataTable
              // paginator
              // rowsPerPageOptions={[5, 15, 25, 50, 100]}
              // rows={10}
              value={formattedData}
              tableStyle={{
                minWidth: '10rem',
                fontSize: '14px',
              }}
            >
              <Column
                key={columns[1].field}
                field={columns[1].field}
                header={columns[1].header}
                // className="min-w-[300px] max-w-[300px]"
                className={
                  context && context.authRole === 'EMPLOYEE'
                    ? 'max-w-[300px]'
                    : 'min-w-[300px] max-w-[300px]'
                }
                body={(rowData) => {
                  if (loading) {
                    return <Skeleton />;
                  }
                  return <div>{rowData[`${columns[1].field}`]}</div>;
                }}
              />
              <Column
                key={columns[0].field}
                field={columns[0].field}
                header={columns[0].header}
                // className="max-w-[1000px] min-w-[320px]"
                className={
                  context && context.authRole === 'EMPLOYEE'
                    ? 'max-w-[230px]'
                    : 'max-w-[1000px] min-w-[320px]'
                }
                body={(rowData) => {
                  if (loading) {
                    return <Skeleton />;
                  }
                  return <div>{rowData[`${columns[0].field}`]}</div>;
                }}
              />
            </DataTable>
          )}
        </div>
      </div>
      <Paginator
        first={first}
        rows={pagination.limit}
        totalRecords={data && data.count}
        rowsPerPageOptions={[5, 15, 25, 50, 100]}
        onPageChange={(event: any) => {
          const { page, rows, first }: any = event;

          setFirst(first);
          setPagination({
            offset: rows * page,
            limit: rows,
          });
        }}
      />
    </div>
  );
}

export default RecentLogs;
