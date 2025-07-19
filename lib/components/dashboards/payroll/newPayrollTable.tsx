'use client';

import React, {
  Dispatch,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import axios from 'axios';
import { Button } from 'primereact/button';
import { Column, ColumnFilterClearTemplateOptions } from 'primereact/column';
import ReactHtmlParser from 'react-html-parser';
import { DataTable } from 'primereact/datatable';
import { addS, amountFormatter, properCasing, uuidv4 } from '@utils/helper';
import DeleteSidebar from './deleteSidebar';
import { Dropdown } from 'primereact/dropdown';
import { Skeleton } from 'primereact/skeleton';
import { TabPanel, TabView } from 'primereact/tabview';
import moment from '@constant/momentTZ';
import classNames from 'classnames';
import { Tag } from 'primereact/tag';
import BulkPostSidebar from './bulkPostSidebar';
import RepostSidebar from './repostSidebar';
import { Dialog } from 'primereact/dialog';
import { isCompanyProcessing } from '@utils/companyDetailsGetter';
import { Toast } from 'primereact/toast';
import { table } from 'console';

import { useQuery } from '@tanstack/react-query';
import { MCASH_MLWALLET } from '@constant/variables';
import ProgressBar from './progressBar';
const NewPayrollTable = ({
  totals,
  payrollQuery,
  departmentsQuery,
  setSideBarConfig,
  filters,
  setFilters,
  pagination,
  setPagination,
  deptName,
  setDeptName,
  businessMonthOpts,
  monthSelected,
  setMonthSelected,
  tableFor,
  postedPayrollQuery,
  pendingPayrollQuery,
  selectedRows,
  setSelectedRows,
  pendingTotalsQuery,
  postedTotalsQuery,
  totalsQuery,
  optionsQuery,
  pendingOptsQuery,
  postedOptsQuery,
  pageActions,
  failedPayrollQuery,
  activeTabIndex,
  processingPayroll,
  setProcessingPayroll,
  toast,
}: {
  totals: {
    totalNetPay: number;
    totalAdditionalCharge: number;
    disbursedTotalNetPay: number;
  };
  payrollQuery: any;
  departmentsQuery: any;
  businessMonthOpts: string[];
  setSideBarConfig: (p: any) => void;
  filters: any;
  setFilters: (p: any) => void;
  pagination: any;
  setPagination: (p: any) => void;
  deptName: string | null;
  setDeptName: Dispatch<React.SetStateAction<string | null>>;
  monthSelected: string;
  setMonthSelected: Dispatch<React.SetStateAction<string>>;
  tableFor?: string;
  postedPayrollQuery?: any;
  pendingPayrollQuery?: any;
  selectedRows: any;
  setSelectedRows: Dispatch<React.SetStateAction<any>>;
  pendingTotalsQuery: any;
  postedTotalsQuery: any;
  totalsQuery?: any;
  optionsQuery?: any;
  pendingOptsQuery?: any;
  postedOptsQuery?: any;
  pageActions: {
    downloadAndImportPayroll: boolean;
    generateReport: boolean;
    editPayroll: boolean;
    deletePayroll: boolean;
    postPayroll: boolean;
  };
  failedPayrollQuery?: any;
  activeTabIndex: number;
  processingPayroll: ProcessingPayroll[];
  setProcessingPayroll: (p: ProcessingPayroll[]) => void;
  toast: any;
}) => {
  const [bulkError, setBulkError] = useState<any>([]);
  const [bulkErrorHeader, setBulkErrorHeader] = useState<string>('');
  const [visible, setVisible] = useState(false);
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
  const [repostSidebarConfig, setRepostSidebarConfig] = useState<any>({
    header: '',
    subHeader: '',
    submitText: '',
    cancelText: '',
    rowData: {},
    isOpen: false,
    bulk: false,
  });

  const bulkDelete = () => {
    setDeleteSidebarConfig({
      header: `Delete Selected Payroll/s`,
      subHeader:
        'Removing these payroll entries cannot be undone. Are you sure you want to continue?',
      submitText: 'Delete',
      cancelText: 'Cancel',
      rowData: {},
      isOpen: true,
      bulk: true,
    });
  };
  const bulkPost = () => {
    setPostSidebarConfig({
      header: `Post Selected Payroll/s`,
      subHeader: 'Are you sure you want to post the selected payroll/s?',
      submitText: 'Post',
      cancelText: 'Cancel',
      rowData: {},
      isOpen: true,
      bulk: true,
    });
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    if (pendingTotalsQuery.isLoading || pendingTotalsQuery.isRefetching) {
      setPostSidebarConfig((prev: any) => ({ ...prev, isOpen: false }));
      setDeleteSidebarConfig((prev: any) => ({ ...prev, isOpen: false }));
      setRepostSidebarConfig((prev: any) => ({ ...prev, isOpen: false }));
    }
  }, [pendingTotalsQuery.isLoading, pendingTotalsQuery.isRefetching]);

  const rows = payrollQuery?.data?.rows?.length ? payrollQuery?.data?.rows : []
  return (
    <>
      {
        <div className="flex gap-2 flex-row-reverse mb-2">
          {pageActions.deletePayroll && (
            <Button
              className="p-button-secondary rounded-full"
              onClick={() => {
                if (
                  selectedRows.length == 0 ||
                  payrollQuery.isLoading ||
                  payrollQuery.isRefetching
                ) {
                  return;
                }
                bulkDelete();
              }}
              disabled={
                payrollQuery.isLoading ||
                payrollQuery.isRefetching ||
                isSubmitting ||
                selectedRows.length == 0 ||
                tableFor != 'PENDING' ||
                activeTabIndex != 0
              }
            >
              {/* <i className="pi pi-trash"></i> */}
              <p>Delete All</p>
            </Button>
          )}
          {pageActions.postPayroll && (
            <Button
              className="rounded-full"
              onClick={() => {
                if (selectedRows.length == 0) {
                  return;
                }
                bulkPost();
              }}
              disabled={
                payrollQuery.isLoading ||
                payrollQuery.isRefetching ||
                isSubmitting ||
                selectedRows.length == 0 ||
                tableFor != 'PENDING' ||
                activeTabIndex != 0
              }
            >
              <p>Post All</p>
            </Button>
          )}
        </div>
      }

      <DataTable
        value={
          payrollQuery.isLoading || payrollQuery.isRefetching
            ? [{ dummy: '' }]
            : rows
        }
        disabled={isSubmitting}
        selectionMode={'multiple'}
        selection={selectedRows}
        onSelectionChange={async (e) => {
          if (payrollQuery.isRefetching || payrollQuery.isLoading) {
            return null;
          } else if (isSubmitting) {
            toast.current?.replace({
              severity: 'warn',
              summary: 'This action is prohibited',
              detail: 'Currently Submitting Payrolls.',
              life: 5000,
              closable: true,
            });
            return null;
          }
          if (activeTabIndex == 0 && e.value.length > 0) {
            let isProcessing = false;
            for (let i = 0; i < e.value.length; i++) {
              if (
                await isCompanyProcessing({
                  taskName: 'Post Payroll',
                  departmentName: e.value[i].departmentName,
                  businessMonth: e.value[i].businessMonth,
                  cycle: e.value[i].cycle,
                })
              ) {
                isProcessing = true;
              }
            }
            toast.current?.clear();
            if (isProcessing) {
              toast.current?.replace({
                severity: 'warn',
                summary: 'This action is prohibited',
                detail: 'The system is currently processing this entry.',
                life: 5000,
                closable: true,
              });
              return null;
            }
          }

          if (activeTabIndex != 0) {
            setSideBarConfig({
              title: `${e.value[0].businessMonthCycle}`,
              action: 'view',
              rowData: e.value[0],
              isOpen: true,
              tableFor: tableFor,
            });
          } else {
            setSelectedRows(e.value);
          }
        }}
        // onSelect={}
        frozenWidth="350px"
        scrollable={true}
        // rowClassName={rowClass}
        tableStyle={{ minWidth: '130rem' }}
        filters={filters}
        filterDisplay="row"
      >
        {tableFor == 'POSTED' || tableFor == 'FAILED' ? null : (
          <Column
            selectionMode="multiple"
            headerStyle={{ width: '3rem' }}
          ></Column>
        )}
        <Column
          field="departmentName"
          header="Department"
          className="max-w-[250px]"
          filterField="departmentId"
          showFilterMenu={false}
          filterMenuStyle={{ width: '14rem' }}
          style={{ minWidth: '14rem' }}
          filter={tableFor != 'FAILED'}
          filterElement={(options: any) => (
            <Dropdown
              filter
              value={options.value}
              options={
                !payrollQuery.isLoading &&
                // !departmentsQuery.isLoading &&
                !optionsQuery.isLoading &&
                optionsQuery.data?.departmentOpts?.length > 0
                  ? optionsQuery.data?.departmentOpts.map((i: any) => ({
                      name: !i.deletedAt
                        ? i.departmentName
                        : i.departmentName + ' - DELETED',
                      value: i.departmentId,
                    }))
                  : []
              }
              onChange={(e) => {
                let value = e.target.value;
                let _filters: any = { ...filters };
                if (value === undefined || value === null) {
                  setDeptName(null);
                  value = null;
                  _filters.departmentId.value = value;

                  if (_filters.businessMonth.value) {
                    setPagination((prev: any) => ({
                      ...prev,
                      offset: 0,
                      // limit: payrollQuery?.data?.count?.length,
                      limit: 5,
                      first: 0,
                    }));
                  } else {
                    setPagination((prev: any) => ({
                      ...prev,
                      limit: 5,
                      offset: 0,
                      first: 0,
                    }));
                  }
                } else {
                  setPagination((prev: any) => ({
                    ...prev,
                    offset: 0,
                    // limit: payrollQuery?.data?.count?.length,
                    limit: 5,
                    first: 0,
                  }));
                  setDeptName(value);
                }

                _filters.departmentId.value = value;
                options.filterApplyCallback(e.value);
                setFilters(_filters);
              }}
              optionLabel="name"
              placeholder="All Departments"
              className="p-column-filter"
              showClear
              // maxSelectedLabels={1}
              style={{ minWidth: '14rem' }}
              hidden={tableFor == 'FAILED'}
            />
          )}
          body={(data) => {
            if (payrollQuery.isLoading || payrollQuery.isRefetching) {
              return <Skeleton />;
            }
            return (
              <div className="flex items-center gap-2">
                {data.isDirect === 1 && (
                  <i className="pi pi-clock font-bold text-[15px] text-green-500"></i>
                )}{' '}
                {data.departmentName}
              </div>
            );
          }}
        />
        <Column
          field="businessMonth"
          className="max-w-[200px]"
          header="Business Month"
          filterField="businessMonth"
          showFilterMenu={false}
          // onFilterClear={() => {
          //   let _filters: any = { ...filters };
          //   _filters.businessMonth.value = null;
          //   setFilters(_filters);
          //   setMonthSelected('');
          // }}
          filterMenuStyle={{ width: '14rem' }}
          style={{ minWidth: '14rem' }}
          filter={tableFor != 'FAILED'}
          filterElement={(options: any) => (
            <Dropdown
              filter
              value={options.value}
              options={
                !payrollQuery.isLoading || !optionsQuery.isLoading
                  ? optionsQuery.data?.businessmonthOpts?.map((i: any) => ({
                      name: i.businessMonth,
                      value: i.businessMonth,
                    }))
                  : []
              }
              hidden={tableFor == 'FAILED'}
              onChange={async (e) => {
                let value = e.target.value;

                let _filters: any = { ...filters };
                if (value === undefined || value === null || !value) {
                  setMonthSelected('');
                  value = null;
                  _filters.businessMonth.value = value;

                  if (_filters.departmentId.value) {
                    setPagination((prev: any) => ({
                      ...prev,
                      offset: 0,
                      limit: 5,
                      first: 0,
                    }));
                  } else {
                    setPagination((prev: any) => ({
                      ...prev,
                      limit: 5,
                      offset: 0,
                      first: 0,
                    }));
                  }
                } else {
                  setPagination((prev: any) => ({
                    ...prev,
                    offset: 0,
                    // limit: payrollQuery?.data?.row?.length,
                    limit: 5,
                    first: 0,
                  }));
                  setMonthSelected(value);
                }

                _filters.businessMonth.value = value;

                options.filterApplyCallback(e.value);
                setFilters(_filters);
              }}
              optionLabel="name"
              placeholder="All Business Months"
              className="p-column-filter"
              showClear
              // maxSelectedLabels={1}
              style={{ minWidth: '14rem' }}
            />
          )}
          body={(data) => {
            if (payrollQuery.isLoading || payrollQuery.isRefetching) {
              return <Skeleton />;
            }
            return data.businessMonth;
          }}
        />
        <Column
          field="cycle"
          header="Pay Cycle"
          body={(data) => {
            if (payrollQuery.isLoading || payrollQuery.isRefetching) {
              return <Skeleton />;
            }
            return properCasing(data.cycle);
          }}
        />
        <Column
          field="totalNetPay"
          header="Total Net Pay"
          body={(row) => {
            if (payrollQuery.isLoading || payrollQuery.isRefetching) {
              return <Skeleton />;
            }
            return 'Php ' + amountFormatter(row.totalNetPay);
          }}
          footer={
            tableFor == 'FAILED' ? null : (
              <div>
                {totalsQuery.isLoading || totalsQuery.isRefetching ? (
                  <div className="flex flex-row items-center gap-2">
                    <p className=" ">Total: Php</p>
                    <i
                      className="pi pi-spin pi-spinner "
                      style={{ fontSize: '15px', marginRight: '20px' }}
                    ></i>
                  </div>
                ) : (
                  <p className="">{`Total: Php ${amountFormatter(
                    totals.totalNetPay
                  )}`}</p>
                )}
              </div>
            )
          }
        />
        <Column
          field="disbursedTotalNetPay"
          header="Total Disbursed Net Pay"
          hidden={tableFor == 'PENDING' || tableFor == 'FAILED'}
          className="text-green-500"
          body={(row) => {
            if (payrollQuery.isLoading || payrollQuery.isRefetching) {
              return <Skeleton />;
            }
            return 'Php ' + amountFormatter(row.disbursedTotalNetPay);
          }}
          footer={
            tableFor == 'FAILED' ? null : (
              <div className="text-green-500">
                {totalsQuery.isLoading || totalsQuery.isRefetching ? (
                  <div className="flex flex-row items-center gap-2">
                    <p className=" ">Total: Php</p>
                    <i
                      className="pi pi-spin pi-spinner"
                      style={{ fontSize: '15px', marginRight: '20px' }}
                    ></i>
                  </div>
                ) : (
                  <p className="">{`Total: Php ${amountFormatter(
                    totals.disbursedTotalNetPay
                  )}`}</p>
                )}
              </div>
            )
          }
        />
        <Column
          field="totalAdditionalCharge"
          header="Additional Charge"
          body={(row) => {
            if (payrollQuery.isLoading || payrollQuery.isRefetching) {
              return <Skeleton />;
            }
            return 'Php ' + amountFormatter(row.totalChargePerEmployee);
          }}
          footer={
            tableFor == 'FAILED' ? null : (
              <div>
                {totalsQuery.isLoading || totalsQuery.isRefetching ? (
                  <div className="flex flex-row items-center gap-2">
                    <p className=" ">Total: Php</p>
                    <i
                      className="pi pi-spin pi-spinner"
                      style={{ fontSize: '15px', marginRight: '20px' }}
                    ></i>
                  </div>
                ) : (
                  <p className=" ">
                    {`Total: Php ${amountFormatter(
                      totals.totalAdditionalCharge
                    )}`}
                  </p>
                )}
              </div>
            )
          }
        />
        <Column
          field="createdAt"
          header="Date Created"
          body={(data) => {
            if (payrollQuery.isLoading || payrollQuery.isRefetching) {
              return <Skeleton />;
            }
            return moment(data.createdAt).format('LL');
          }}
          hidden={tableFor == 'POSTED'}
        />
        <Column
          field="datePosted"
          header="Date Posted"
          body={(data) => {
            if (payrollQuery.isLoading || payrollQuery.isRefetching)
              return <Skeleton />;
            return data.isPosted && data.datePosted
              ? moment(data.datePosted).format('LL')
              : '';
          }}
          hidden={tableFor == 'PENDING'}
        />
        <Column
          field="actions"
          header="Actions"
          body={(rowData) => {
            if (payrollQuery.isLoading || payrollQuery.isRefetching) {
              return <Skeleton />;
            }
            if (!rowData.isPosted) {
              return (
                <div className="flex flex-nowrap gap-2">
                  <Button
                    type="button"
                    text
                    icon="pi pi-eye"
                    tooltip="View"
                    tooltipOptions={{ position: 'top' }}
                    onClick={async () => {
                      if (payrollQuery.isRefetching || payrollQuery.isLoading) {
                        return null;
                      }
                      if (
                        await isCompanyProcessing({
                          taskName: 'Post Payroll',
                          departmentName: rowData.departmentName,
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
                        tableFor: tableFor,
                      });
                    }}
                  />
                  {pageActions.deletePayroll && (
                    <Button
                      type="button"
                      text
                      icon="pi pi-trash"
                      tooltip="Delete"
                      tooltipOptions={{ position: 'top' }}
                      onClick={async () => {
                        if (
                          payrollQuery.isRefetching ||
                          payrollQuery.isLoading
                        ) {
                          return null;
                        }
                        if (
                          await isCompanyProcessing({
                            taskName: 'Post Payroll',
                            departmentName: rowData.departmentName,
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
                            'Removing this payroll entry cannot be undone. Are you sure you want to continue?',
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
              );
            } else {
              return (
                <div className="flex flex-nowrap gap-2">
                  {pageActions.postPayroll && (
                    <Button
                      type="button"
                      label="Repost"
                      className="primary-button"
                      tooltip="Repost Failed Payrolls"
                      tooltipOptions={{ position: 'top' }}
                      onClick={async () => {
                        if (
                          payrollQuery.isRefetching ||
                          payrollQuery.isLoading
                        ) {
                          return null;
                        }
                        if (
                          await isCompanyProcessing({
                            taskName: 'Post Payroll',
                            departmentName: rowData.departmentName,
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
                        setRepostSidebarConfig(() => {
                          setSelectedRows([]);
                          return {
                            header: `Repost Failed Payroll: ${rowData.departmentName} - [${rowData.businessMonthCycle}]`,
                            subHeader:
                              'Are you sure you want to repost the selected payroll/s that have failed?',
                            submitText: 'Repost',
                            cancelText: 'Cancel',
                            rowData: rowData,
                            isOpen: true,
                            bulk: false,
                          };
                        });
                      }}
                    />
                  )}
                </div>
              );
            }
          }}
          hidden={tableFor == 'POSTED'}
        />
      </DataTable>
      <Button
        className="w-full hover:!bg-[#dfffdf]"
        text
        onClick={() => {
          payrollQuery.refetch();
          totalsQuery.refetch();
          optionsQuery.refetch();
          failedPayrollQuery?.refetch();
          if (tableFor == 'POSTED') {
            pendingPayrollQuery?.refetch();
            pendingTotalsQuery.refetch();
            pendingOptsQuery.refetch();
          } else {
            postedPayrollQuery?.refetch();
            postedTotalsQuery.refetch();
            postedOptsQuery.refetch();
          }
        }}
        style={{
          display: 'block',
          background: '#edffed',
          color: '#4CAF50',
          textAlign: 'center',
        }}
        disabled={payrollQuery.isRefetching}
      >
        <i
          className={classNames('pi pi-sync text-[12px]', {
            'pi pi-spin pi-spinner': payrollQuery.isRefetching,
          })}
        ></i>{' '}
        {payrollQuery.isRefetching ? 'Refreshing...' : 'Refresh'}
      </Button>

      {/* DELETE SIDEBAR */}
      {tableFor == 'PENDING' && !pendingTotalsQuery.isRefetching && (
        <>
          <DeleteSidebar
            deleteSidebarConfig={deleteSidebarConfig}
            setDeleteSidebarConfig={setDeleteSidebarConfig}
            refetch={payrollQuery.refetch}
            selectedRows={selectedRows}
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
            setSelectedRows={setSelectedRows}
            pendingTotalsQuery={pendingTotalsQuery}
            pendingOptsQuery={pendingOptsQuery}
            toast={toast}
          />
          <BulkPostSidebar
            isSubmitting={isSubmitting}
            postSidebarConfig={postSidebarConfig}
            setPostSidebarConfig={setPostSidebarConfig}
            refetch={payrollQuery.refetch}
            selectedRows={selectedRows}
            postedPayrollQuery={postedPayrollQuery}
            pendingTotalsQuery={pendingTotalsQuery}
            postedTotalsQuery={postedTotalsQuery}
            setIsSubmitting={setIsSubmitting}
            setSelectedRows={setSelectedRows}
            setBulkError={setBulkError}
            setBulkErrorHeader={setBulkErrorHeader}
            setVisible={setVisible}
            postedOptsQuery={postedOptsQuery}
            pendingOptsQuery={pendingOptsQuery}
            failedPayrollQuery={failedPayrollQuery}
            processingPayroll={processingPayroll}
            setProcessingPayroll={setProcessingPayroll}
            toast={toast}
          />

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
        </>
      )}

      {tableFor == 'FAILED' && !pendingTotalsQuery.isRefetching && (
        <RepostSidebar
          repostSidebarConfig={repostSidebarConfig}
          setRepostSidebarConfig={setRepostSidebarConfig}
          refetch={failedPayrollQuery?.refetch}
          setIsSubmitting={setIsSubmitting}
          postedPayrollQuery={postedPayrollQuery}
          isSubmitting={isSubmitting}
          setVisible={setVisible}
          postedTotalsQuery={postedTotalsQuery}
          pendingTotalsQuery={pendingTotalsQuery}
          postedOptsQuery={postedOptsQuery}
          pendingOptsQuery={pendingOptsQuery}
          processingPayroll={processingPayroll}
          setProcessingPayroll={setProcessingPayroll}
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
        />
      )}
    </>
  );
};

export default NewPayrollTable;
