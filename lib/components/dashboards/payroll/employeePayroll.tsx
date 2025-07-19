'use client';

import { useQuery } from '@tanstack/react-query';
import { amountFormatter } from '@utils/helper';
import axios from 'axios';
import DashboardNav from 'lib/components/blocks/dashboardNav';
import ErrorDialog from 'lib/components/blocks/errorDialog';
import moment from '@constant/momentTZ';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Paginator } from 'primereact/paginator';
import { Sidebar } from 'primereact/sidebar';
import { Skeleton } from 'primereact/skeleton';
import { Tag } from 'primereact/tag';
import React, { Dispatch, useEffect, useState } from 'react';
import EditPayrollSidebar from './editPayrollSidebar';
const EmployeePayroll = ({
  configuration: { title, submitBtnText, action, rowData, isOpen, tableFor },
  setSideBarConfig,
  refetchDataFromParent,
  setSelectedRows,
  pendingTotalsQuery,
  pendingOptsQuery,
  pageActions,
  activeTabIndex,
  toast,
}: {
  configuration: SideBarConfig;
  setSideBarConfig: any;
  refetchDataFromParent: () => void;
  setSelectedRows: Dispatch<React.SetStateAction<any>>;
  pendingTotalsQuery: any;
  pendingOptsQuery: any;
  pageActions: any;
  activeTabIndex: number;
  toast: any;
}) => {
  const [editPayrollSideBarConfig, setEditPayrollSideBarConfig] =
    useState<SideBarConfig>({
      title: '',
      submitBtnText: '',
      action: '',
      rowData: {},
      isOpen: false,
    });
  const [failedRemarks, setFailedRemarks] = useState({
    isShow: false,
    remarks: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    offset: 0,
    limit: 5,
    first: 0,
  });
  const { limit, offset, first } = pagination;

  const { isFetching, isRefetching, isLoading, error, data, refetch }: any =
    useQuery({
      refetchOnWindowFocus: false,
      enabled: isOpen,
      queryKey: ['employeePayroll', pagination, searchQuery],
      queryFn: async () => {
        // converted to post since possible issue with url characters if we use get
        const res = await axios.post(
          `/api/payrolls/employees`,
          {
            businessMonth: rowData.businessMonth,
            cycle: rowData.cycle,
            departmentId: rowData.departmentId,
            companyId: rowData.companyId,
            isDirect: rowData.isDirect,
            isPosted: rowData.isPosted,
            limit: limit,
            offset: offset,
            search: searchQuery,
            // disbursementSchedule: rowData.disbursementSchedule
            //   ? moment(rowData.disbursementSchedule).format(
            //       'YYYY-MM-DD HH:mm:ss'
            //     )
            //   : null,
            datePosted: rowData.datePosted
              ? moment(rowData.datePosted).format('YYYY-MM-DD HH:mm:ss')
              : null,
            disbursementStatus: rowData.disbursementStatus,
            tableFor:
              activeTabIndex == 0
                ? 'PENDING'
                : activeTabIndex == 1
                ? 'POSTED'
                : 'FAILED',
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
            },
          }
        );
        return res.data;
      },
      // fetch(
      //   `/api/payrolls/employees?businessMonth=${
      //     rowData.businessMonth
      //   }&cycle=${rowData.cycle}&departmentId=${
      //     rowData.departmentId
      //   }&companyId=${rowData.companyId}&isDirect=${
      //     rowData.isDirect ? true : ''
      //   }&isPosted=${
      //     rowData.isPosted
      //   }&limit=${limit}&offset=${offset}&search=${searchQuery}&disbursementSchedule=${
      //     rowData.disbursementSchedule
      //   }&datePosted=${rowData.datePosted}`,
      //   {
      //     headers: {
      //       Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
      //     },
      //   }
      // )
      //   .then((res) => res.json())
      //   .catch((err) => console.error(err)),
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
      <Sidebar
        position="right"
        style={{
          width: '87%',
        }}
        visible={isOpen}
        onShow={() => refetch()}
        onHide={() => {
          refetchDataFromParent();
          pendingTotalsQuery.refetch();

          setSideBarConfig((prev: any) => ({
            ...prev,
            isOpen: false,
          }));
        }}
      >
        <DashboardNav
          navTitle={title}
          buttons={[]}
          isShowSearch={true}
          setValueSearchText={setSearchQuery}
          valueSearchText={searchQuery}
          searchPlaceholder=""
        />
        {rowData.isDirect === 1 && (
          <div className="flex justify-start gap-2 mb-5">
            <Tag value="Direct Upload" severity={'success'}></Tag>{' '}
            {/* {rowData.isPosted && (
              <p className="text-green-500">
                <i className="pi pi-clock font-bold"></i>{' '}
                {moment(rowData.disbursementSchedule).format('LL - LT')}
              </p>
            )} */}
          </div>
        )}
        {error ? (
          <ErrorDialog />
        ) : (
          <div>
            <DataTable
              value={
                isRefetching || isLoading || isFetching
                  ? [{ dummy: '' }, { dummy: '' }, { dummy: '' }]
                  : data.rows
              }
              selectionMode={'single'}
              onSelectionChange={(e) => {
                const row = e.value;
                isRefetching || isLoading || isFetching
                  ? null
                  : row.isDirect
                  ? null
                  : setEditPayrollSideBarConfig((prev: any) => ({
                      ...prev,
                      isOpen: true,
                      rowData: row,
                      action: 'view',
                    }));
              }}
              frozenWidth="450px"
              scrollable={true}
              tableStyle={{ minWidth: '120rem' }}
            >
              <Column
                field="employeeFullName"
                header="Employee Name"
                body={(data) => {
                  if (isRefetching || isFetching || isLoading)
                    return <Skeleton />;
                  return data?.employee?.employee_profile?.employeeFullName;
                }}
              />
              <Column
                field="department"
                header="Department"
                body={(data) => {
                  if (isRefetching || isFetching || isLoading)
                    return <Skeleton />;
                  return data?.department?.departmentName;
                }}
              />
              <Column
                field="grossPay"
                header="Pay Amount"
                body={(data) => {
                  if (isRefetching || isFetching || isLoading)
                    return <Skeleton />;
                  return 'Php ' + amountFormatter(data.grossPay);
                }}
              />
              <Column
                field="totalDeduction"
                header="Deductions"
                body={(data) => {
                  if (isRefetching || isFetching || isLoading)
                    return <Skeleton />;
                  return 'Php ' + amountFormatter(data.totalDeduction);
                }}
                hidden={rowData.isDirect}
              />
              <Column
                field="adjustments"
                header="Adjustments"
                body={(data) => {
                  if (isRefetching || isFetching || isLoading)
                    return <Skeleton />;
                  let adjustmentSum = 0;

                  if (data && data.payroll_adjustments) {
                    // iterate over each item in the array
                    for (let i = 0; i < data.payroll_adjustments.length; i++) {
                      adjustmentSum +=
                        (Number(data.payroll_adjustments[i].addAdjustment) ??
                          0) -
                        (Number(data.payroll_adjustments[i].deductAdjustment) ??
                          0);
                    }
                  }
                  return 'Php ' + amountFormatter(adjustmentSum);
                }}
                hidden={rowData.isDirect}
              />
              <Column
                field="netPay"
                header="Final Net Pay"
                body={(data) => {
                  if (isRefetching || isFetching || isLoading)
                    return <Skeleton />;
                  return 'Php ' + amountFormatter(data.netPay);
                }}
              />
              <Column
                field="modeOfPayroll"
                header="Mode of Payroll"
                body={(data) => {
                  if (isRefetching || isFetching || isLoading)
                    return <Skeleton />;
                  return data.modeOfPayroll;
                }}
              />
              <Column
                field="disbursementCode"
                header="Disbursement Code"
                body={(data) => {
                  if (isRefetching || isFetching || isLoading)
                    return <Skeleton />;
                  const disbursementCode = data.disbursementCode
                    ? data.disbursementCode
                        .split(',')
                        .map((code: any) => code.trim())
                        .reverse()
                    : [];
                  if (
                    disbursementCode.length === 1 &&
                    data.disbursementStatus === 3
                  ) {
                    return (
                      <div>
                        <div className={`${'text-red-500'}`}>
                          {data.disbursementCode}
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div>
                      {disbursementCode.map((code: any, index: number) => (
                        <div
                          key={index}
                          className={`${
                            index === 0 ? 'text-green-500' : 'text-red-500'
                          }`}
                        >
                          {code}
                        </div>
                      ))}
                    </div>
                  );
                }}
              />
              <Column
                field="status"
                header="Disbursement Status"
                body={(data) => {
                  if (isRefetching || isFetching || isLoading)
                    return <Skeleton />;
                  if (data.isPosted == 1) {
                    if (data.disbursementStatus == 0) {
                      if (data.netPay > 0) {
                        return (
                          <span className="block text-center max-w-[160px] py-2 px-5 rounded-full bg-orange-200 text-orange-700">
                            ON GOING
                          </span>
                        );
                      } else if (data.netPay <= 0) {
                        return (
                          <span className="block text-center max-w-[160px] py-2 px-5 rounded-full bg-cyan-200 text-cyan-700">
                            POSTED
                          </span>
                        );
                      }
                    } else if (data.disbursementStatus == 1) {
                      return (
                        <span className="block text-center max-w-[160px] py-2 px-5 rounded-full bg-green-200 text-green-700">
                          DISBURSED
                        </span>
                      );
                    } else if (data.disbursementStatus == 2) {
                      return (
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            setFailedRemarks({
                              isShow: true,
                              remarks: data.failedRemarks,
                            });
                          }}
                          className="block text-center max-w-[160px] py-2 px-5 rounded-full bg-red-200 text-red-700"
                        >
                          FAILED
                        </span>
                      );
                    } else if (data.disbursementStatus == 3) {
                      return (
                        <span className="block text-center max-w-[160px] py-2 px-5 rounded-full bg-red-200 text-red-700">
                          CANCELLED
                        </span>
                      );
                    }
                  } else if (data.isPosted == 0) {
                    return (
                      <span className="block text-center max-w-[160px] py-2 px-5 rounded-full bg-orange-200 text-orange-700">
                        PENDING
                      </span>
                    );
                  }
                }}
              />
              <Column
                field="transferCode"
                header="Transfer Code"
                body={(row) => {
                  if (isRefetching || isFetching || isLoading)
                    return <Skeleton />;
                  return row.transaction && row.transaction.transactionCode
                    ? row.transaction.transactionCode
                    : '';
                }}
                style={{
                  maxWidth: '400px',
                  minWidth: '200px',
                  // wordBreak: 'break-word',
                }}
              />
              <Column
                field="batchNumbers"
                header="Batch Number"
                style={{
                  maxWidth: '400px',
                  minWidth: '280px',
                  // wordBreak: 'break-word',
                }}
                body={(row) => {
                  if (isRefetching || isFetching || isLoading)
                    return <Skeleton />;

                  return row.batch_upload && row.batch_upload.batchNumber
                    ? row.batch_upload.batchNumber
                    : '';
                  // const batchNumbers = row.batchNumbers;
                  // let str = '';

                  // str +=
                  //   row.batch_upload && row.batch_upload.batchNumber
                  //     ? `<p><strong>${
                  //         row.modeOfPayroll == 'ML WALLET' ? 'MW' : 'KP'
                  //       }</strong>: ${row.batch_upload.batchNumber}</p>`
                  //     : ``;

                  // return ReactHtmlParser(str);
                }}
              />

              <Column
                field="datePosted"
                header="Date Disbursed"
                body={(data) => {
                  if (isRefetching || isFetching || isLoading)
                    return <Skeleton />;
                  return !data.isPosted ||
                    (data.isPosted && data.disbursementStatus != 1)
                    ? ''
                    : moment(data.datePosted).format('LL - LT');
                }}
                hidden={tableFor == 'PENDING'}
              />
            </DataTable>
          </div>
        )}
        <Paginator
          first={first}
          rows={limit}
          totalRecords={
            isRefetching || isLoading || isFetching ? [] : data && data?.count
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
      <EditPayrollSidebar
        configuration={editPayrollSideBarConfig}
        setSideBarConfig={setEditPayrollSideBarConfig}
        refetchDataFromParent={refetch}
        pendingTotalsQuery={pendingTotalsQuery}
        setSelectedRows={setSelectedRows}
        pageActions={pageActions}
        toast={toast}
      />

      <Dialog
        header={'Failed Remarks'}
        visible={failedRemarks.isShow}
        modal={true}
        style={{
          width: '30%',
          height: 'auto',
        }}
        onHide={() => setFailedRemarks({ isShow: false, remarks: '' })}
      >
        <div className="py-5">{failedRemarks.remarks}</div>
      </Dialog>
    </>
  );
};

export default EmployeePayroll;
