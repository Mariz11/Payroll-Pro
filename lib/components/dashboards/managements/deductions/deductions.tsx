'use client';
import React, { useContext, useEffect, useRef, useState } from 'react';

import { Button } from 'primereact/button';
import 'primereact/resources/primereact.min.css';
import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';
import { Divider } from 'primereact/divider';

import DashboardNav from 'lib/components/blocks/dashboardNav';
import { ButtonType } from '@enums/button';
import { formatAmount } from '@utils/dashboardFunction';
import DeductionSidebar from './deductionSidebar';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { DeductionsFormValidator } from 'lib/validation/deductionsFormValidator';
import { useQuery } from '@tanstack/react-query';
import { GlobalContainer } from 'lib/context/globalContext';
import { DataTable } from 'primereact/datatable';
import ConfirmationSidebar from './confimationSidebar';
import { Toast } from 'primereact/toast';
import axios from 'axios';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Paginator } from 'primereact/paginator';
import { Skeleton } from 'primereact/skeleton';
import { properCasing } from '@utils/helper';
import { ColumnGroup } from 'primereact/columngroup';
import { Row } from 'primereact/row';
import { Dropdown } from 'primereact/dropdown';
import { FilterMatchMode } from 'primereact/api';
import ErrorDialog from 'lib/components/blocks/errorDialog';
import { classNames } from 'primereact/utils';

function Deductions() {
  const [deductionsFilters, setDeductionFilters] = useState({
    status: {
      value: null,
      matchMode: FilterMatchMode.EQUALS,
    },
  });
  const context = useContext(GlobalContainer);
  const toast = useRef<Toast>(null);
  const [postedDisable, setPostedDisable] = useState(false);
  const [addDeductions, setAddDeductions] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);
  const [buttonText, setButtonText] = useState('');
  const [sidebarTitle, setSidebarTitle] = useState('');
  const [deductionBreakdownArr, setDeductionBreakdownArr] = useState<any[]>([
    // { amount: 0, desc: 'hello test ' },
  ]);
  const [pagination, setPagination] = useState({
    offset: 0,
    limit: 5,
    first: 0,
  });
  const [filterListString, setFilterLustString] = useState('');

  const [actions, setActions] = useState({
    deductionId: -1,
    isActive: false,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    setValue,
    setError,
    watch,
    reset,
    clearErrors,
  } = useForm({
    mode: 'onSubmit',
    resolver: yupResolver(DeductionsFormValidator),
  });

  const deductionList = useQuery({
    queryKey: ['deductionList', pagination, filterListString],
    queryFn: () =>
      fetch(
        `/api/deductions?offset=${pagination.offset}&limit=${pagination.limit}&search=${filterListString}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
          },
        }
      )
        .then((res) => res.json())
        .then((data) => {
          const formattedData = data.rows.map((item: any) => {
            const isPosted = item.isPosted;
            // console.log(item);
            let status = '';

            if (isPosted) {
              if (!item.transfer_to_employee_acct_transaction) {
                if (item.amountPaid <= 0) {
                  status = 'UNPAID';
                } else if (
                  item.amountPaid > 0 &&
                  item.amountPaid < item.totalAmount
                ) {
                  status = 'IN PROGRESS';
                } else if (item.amountPaid >= item.totalAmount) {
                  status = 'PAID';
                }
              } else {
                const isDisbursed =
                  item.transfer_to_employee_acct_transaction.disbursementStatus;
                if (isDisbursed == 1) {
                  if (item.amountPaid <= 0) {
                    status = 'UNPAID';
                  } else if (
                    item.amountPaid > 0 &&
                    item.amountPaid < item.totalAmount
                  ) {
                    status = 'IN PROGRESS';
                  } else if (item.amountPaid >= item.totalAmount) {
                    status = 'PAID';
                  }
                } else if (isDisbursed == 0) {
                  status = 'PENDING';
                } else if (isDisbursed == 2) {
                  status = 'FAILED';
                }
              }
            } else {
              status = 'PENDING';
            }
            return {
              ...item,
              status: status,
            };
          });
          data.rows = formattedData;

          return data;
        })
        .catch((err) => console.error(err)),
  });

  return (
    <div className="w-screen h-screen overflow-auto p-5">
      {/* DASHBOARD NAV */}
      <DashboardNav
        navTitle="Payroll > Deductions"
        valueSearchText={filterListString}
        buttons={[
          {
            label: 'Add Deductions',
            type: ButtonType.Red,
            isDropdown: false,
            isIcon: false,
            handler: () => handleSidebar('Save', 'Add New Deductions'),
          },
        ]}
        isShowSearch={true}
        searchPlaceholder=""
        setValueSearchText={setFilterLustString}
      />

      {/* MAIN CONTENT */}
      <div className="line-container rounded-lg p-5">
        {deductionList.error ? (
          <ErrorDialog />
        ) : (
          <DataTable
            value={
              deductionList.isLoading || deductionList.isRefetching
                ? [{ dummy: '' }]
                : deductionList.data.rows
            }
            tableStyle={{ minWidth: '90rem' }}
            filters={deductionsFilters}
            selectionMode={'single'}
            onSelectionChange={(e: any) => {
              if (deductionList.isLoading || deductionList.isRefetching) {
                return null;
              }
              handleSidebar('View', 'View Deductions');
              // console.log(e.value);
              const rowData = e.value;
              setValue('deductionType.name', rowData.deductionType);
              setValue('deductionId', rowData.deductionId);
              setValue('deductionData', rowData);
              setValue('totalAmmount', rowData.totalAmount);
              setValue('timePeriodDeduction.name', rowData.deductionPeriod);
              setValue('accountNumberEmployee', rowData.acctNoEmployee);
              setValue('accountNumberEmployer', rowData.acctNoEmployer);
              setValue('remarks', rowData.remarks);
              setValue('totalAmountPaid', rowData.amountPaid);
              setValue('paymentCycles', rowData.noOfCycles);
              setValue('assignEmployee', {
                name: rowData.employee?.employee_profile.employeeFullName,
                id: rowData.employee.employeeId,
                companyId: rowData.companyId,
                userId: rowData.employee?.employee_profile.employeeProfileId,
              });
              rowData.deductionPeriod == 'Specific Cycle'
                ? setValue('cycleChosen', rowData.cycleChosen.split(', '))
                : setValue('cycleChosen', rowData.cycleChosen);
              setActions((prev) => ({
                ...prev,
                deductionId: rowData.deductionId,
              }));
            }}
            filterDisplay="row"
          >
            <Column
              field="employeeName"
              header="Employee Name"
              body={(data) => {
                if (deductionList.isLoading || deductionList.isRefetching) return <Skeleton />;
                return (
                  <span>
                    {data.employee?.employee_profile.employeeFullName}
                  </span>
                );
              }}
            />
            <Column
              field="deductionType"
              header="Deduction Type"
              body={(data) => {
                if (deductionList.isLoading || deductionList.isRefetching) return <Skeleton />;
                return <span>{data.deductionType}</span>;
              }}
            />
            <Column
              field="timePeriod"
              header="Term Type"
              body={(data) => {
                if (deductionList.isLoading || deductionList.isRefetching) return <Skeleton />;
                return <span>{data.deductionPeriod}</span>;
              }}
            />
            {/* <Column
              field="businessMonth"
              header="Business Month"
              body={(data) => {
                if (deductionList.isLoading || deductionList.isRefetching) return <Skeleton />;
                return (
                  <span>{data.businessMonth ? data.businessMonth : 'N/A'}</span>
                );
              }}
            /> */}
            <Column
              field="cycleChosen"
              header="Chosen Cycle"
              body={(data) => {
                if (deductionList.isLoading || deductionList.isRefetching) return <Skeleton />;
                if (data.deductionPeriod === 'Specific Cycle') {
                  return (
                    <span>
                      {data.cycleChosen ? `[${data.cycleChosen}]` : 'N/A'}
                    </span>
                  );
                }
                return (
                  <span>{data.cycleChosen ? data.cycleChosen : 'N/A'}</span>
                );
              }}
            />
            <Column
              field="totalAmount"
              header="Principal Amount"
              body={(data) => {
                if (deductionList.isLoading || deductionList.isRefetching) return <Skeleton />;
                return <span>{formatAmount(data.totalAmount)}</span>;
              }}
            />
            <Column
              field="perCycleDeduction"
              header="Payment per Cycle"
              body={(data) => {
                if (deductionList.isLoading || deductionList.isRefetching) return <Skeleton />;
                return <span>{formatAmount(data.perCycleDeduction)}</span>;
              }}
            />
            <Column
              field="amountPaid"
              header="Total Amount Paid"
              body={(data) => {
                if (deductionList.isLoading || deductionList.isRefetching) return <Skeleton />;
                return <span>{formatAmount(data.amountPaid)}</span>;
              }}
            />
            <Column
              field="status"
              header="Status"
              filterField="status"
              showFilterMenu={false}
              filterMenuStyle={{ width: '14rem' }}
              filter
              filterElement={(options: any) => (
                <Dropdown
                  showFilterClear
                  value={options.value}
                  options={[
                    { name: 'IN PROGRESS' },
                    { name: 'UNPAID' },
                    { name: 'PAID' },
                    { name: 'PENDING' },
                    { name: 'FAILED' },
                  ]}
                  onChange={(e) => {
                    let value = e.target.value;
                    let _filters: any = { ...deductionsFilters };
                    _filters.status.value = value;
                    if (value === undefined || value === null) {
                      value = null;
                      _filters.status.value = value;

                      setPagination((prev: any) => ({
                        ...prev,
                        offset: 0,
                        limit: deductionList?.data?.count,
                      }));
                      options.filterApplyCallback(e.value);
                      setDeductionFilters(_filters);
                      return;
                    }

                    setPagination((prev: any) => ({
                      ...prev,
                      offset: 0,
                      limit: deductionList?.data?.count,
                    }));

                    options.filterApplyCallback(e.value.name);
                    setDeductionFilters(_filters);
                    // let value = e.target.value;
                    // let _filters: any = { ...filters };
                    // if (value === undefined || value === null || !value) {
                    //   setMonthSelected('');
                    //   value = null;
                    //   _filters.businessMonth.value = value;
                    //   if (_filters.departmentName.value) {
                    //     setPagination((prev: any) => ({
                    //       ...prev,
                    //       offset: 0,
                    //       limit: payrollQuery?.data?.count?.length,
                    //     }));
                    //   } else {
                    //     setPagination((prev: any) => ({
                    //       ...prev,
                    //       limit: 5,
                    //       offset: pagination.first,
                    //     }));
                    //   }
                    // } else {
                    //   setPagination((prev: any) => ({
                    //     ...prev,
                    //     offset: 0,
                    //     limit: payrollQuery?.data?.count?.length,
                    //   }));
                    //   setMonthSelected(value);
                    // }
                    // _filters.businessMonth.value = value;
                    // options.filterApplyCallback(e.value);
                    // setFilters(_filters);
                  }}
                  optionLabel="name"
                  placeholder="All Status"
                  className="p-column-filter"
                  showClear
                  // maxSelectedLabels={1}
                  style={{ minWidth: '14rem' }}
                />
              )}
              body={(data) => {
                if (deductionList.isLoading || deductionList.isRefetching) return <Skeleton />;
                const isPosted = data.isPosted;
                if (isPosted) {
                  if (data.status === 'UNPAID') {
                    return (
                      <span className="py-2 px-5 rounded-full bg-gray-500 text-white">
                        UNPAID
                      </span>
                    );
                  } else if (data.status === 'IN PROGRESS') {
                    return (
                      <span className="py-2 px-5 rounded-full bg-cyan-200 text-cyan-700">
                        IN PROGRESS
                      </span>
                    );
                  } else if (data.status === 'PAID') {
                    return (
                      <span className="py-2 px-5 rounded-full bg-green-200 text-green-700">
                        PAID
                      </span>
                    );
                  } else if (data.status === 'FAILED') {
                    return (
                      <span className="py-2 px-5 rounded-full bg-red-200 text-red-700">
                        FAILED
                      </span>
                    );
                  } else if (data.status === 'PENDING') {
                    return (
                      <span className="py-2 px-5 rounded-full bg-orange-200 text-orange-700">
                        PENDING
                      </span>
                    );
                  }
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
              field="actions"
              header="Actions"
              body={renderActions}
              headerClassName="w-10rem"
            />
          </DataTable>
        )}
        <Button
          className="w-full hover:!bg-[#dfffdf]"
          text
          onClick={() => {
            deductionList.refetch();
          }}
          style={{
            display: 'block',
            background: '#edffed',
            color: '#4CAF50',
            textAlign: 'center',
          }}
          disabled={deductionList.isRefetching}
        >
          <i
            className={classNames('pi pi-sync text-[12px]', {
              'pi pi-spin pi-spinner': deductionList.isRefetching,
            })}
          ></i>{' '}
          {deductionList.isRefetching ? 'Refreshing...' : 'Refresh'}
        </Button>
        <Paginator
          first={pagination.first}
          rows={pagination.limit}
          totalRecords={
            deductionList && deductionList.data && deductionList.data.count
          }
          rowsPerPageOptions={[5, 15, 25, 50, 100]}
          onPageChange={(event) => {
            const { page, rows, first }: any = event;
            setPagination({
              offset: rows * page,
              limit: rows,
              first: first,
            });
          }}
        />
      </div>

      {/* SIDEBAR */}
      <DeductionSidebar
        configuration={{
          isOpen: addDeductions,
          setIsOpen: setAddDeductions,
        }}
        label={{
          title: sidebarTitle,
          buttonText: buttonText,
        }}
        register={register}
        handleSubmit={handleSubmit}
        errors={errors}
        setValue={setValue}
        setError={setError}
        watch={watch}
        reset={reset}
        isDirty={isDirty}
        isValid={isValid}
        refetch={deductionList.refetch}
        deductionId={actions.deductionId}
        toast={toast}
        deductionBreakdownArr={deductionBreakdownArr}
        setDeductionBreakdownArr={setDeductionBreakdownArr}
        clearErrors={clearErrors}
      />

      <ConfirmationSidebar
        configuration={{
          isOpen: isOpen2,
          setIsOpen: setIsOpen2,
        }}
        label={{
          title: sidebarTitle,
          buttonText: buttonText,
        }}
        actionButton={() => {
          if (sidebarTitle === 'Delete Deduction') {
            axios
              .delete('/api/deductions/', {
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
                },
                data: JSON.stringify({
                  companyId: context?.userData.companyId,
                  deductionId: actions.deductionId,
                  userId: context?.userData.userId,
                }),
              })
              .then(() => {
                (function () {
                  toast.current?.show({
                    severity: 'success',
                    summary: 'Successfully Deleted',
                    // detail: 'Deduction Deleted Successfully',
                    life: 3000,
                  });
                })();

                deductionList.refetch();
                setIsOpen2(false);
              })
              .catch((err) => {
                console.error(err);

                (function () {
                  toast.current?.show({
                    severity: 'error',
                    summary: 'Error Occured',
                    // detail: 'Error Occured',
                    life: 3000,
                  });
                })();
              });
          } else {
            toast.current?.show({
              severity: 'info',
              summary: 'Submitting request',
              detail: 'Please wait...',
              closable: false,
              sticky: true,
            });

            const config = {
              url: '/api/deductions/',
              method: 'patch',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
              },
              data: JSON.stringify({
                companyId: context?.userData.companyId,
                deductionId: actions.deductionId,
                userId: context?.userData.userId,
                postAction: sidebarTitle === 'Post Deduction' ? true : false,
              }),
            };
            setPostedDisable(true);
            axios
              .request(config)
              .then(async (res: any) => {
                (function () {
                  if (
                    res &&
                    res?.data &&
                    res?.data?.hasOwnProperty('insufficient') &&
                    res?.data?.insufficient
                  ) {
                    toast.current?.replace({
                      severity: res.data.severity,
                      summary: res.data.message,
                      life: 5000,
                    });
                    return false;
                  }

                  toast.current?.replace({
                    severity: 'success',
                    summary:
                      sidebarTitle === 'Post Deduction'
                        ? 'Deduction Posted Succesfully'
                        : 'Deduction Unposted Succesfully',
                    // detail:
                    //   sidebarTitle === 'Post Deduction'
                    //     ? 'Deduction has posted succesfully'
                    //     : 'Deduction has unposted succesfully',
                    life: 3000,
                  });
                })();

                await deductionList.refetch();
                setPostedDisable(false);
                setIsOpen2(false);
              })
              .catch((err) => {
                console.error(err);

                (function () {
                  toast.current?.replace({
                    severity: 'error',
                    summary: 'Error Occured',
                    // detail: 'Error Occured',
                    life: 3000,
                  });
                })();
              });
          }

          setIsOpen2(false);
        }}
      />

      {/* TOAST */}
      <Toast ref={toast} position="bottom-left" />
    </div>
  );

  function renderActions(rowData: any) {
    if (deductionList.isLoading || deductionList.isRefetching) return <Skeleton />;
    return (
      <div className="flex flex-row">
        {rowData.amountPaid <= 0 && !rowData.isPosted && (
          <>
            <Button
              type="button"
              text
              severity="secondary"
              icon="pi pi-file-edit"
              tooltip="Edit"
              tooltipOptions={{ position: 'top' }}
              onClick={() => {
                handleSidebar('Update', 'Update Deductions');
                setValue('deductionId', rowData.deductionId);
                setValue('deductionType.name', rowData.deductionType);
                setValue('totalAmmount', rowData.totalAmount);
                setValue('timePeriodDeduction.name', rowData.deductionPeriod);
                setValue('remarks', rowData.remarks);
                setValue('paymentCycles', rowData.noOfCycles);
                setValue('accountNumberEmployee', rowData.acctNoEmployee);
                setValue('accountNumberEmployer', rowData.acctNoEmployer);
                setValue('assignEmployee', {
                  name: rowData.employee?.employee_profile.employeeFullName,
                  id: rowData.employee.employeeId,
                  companyId: rowData.companyId,
                  userId: rowData.employee?.employee_profile.employeeProfileId,
                  departmentId: rowData.employee?.departmentId,
                  payrollType: rowData.employee?.department?.payrollTypeId,
                });
                rowData.deductionPeriod == 'Specific Cycle'
                  ? setValue('cycleChosen', rowData.cycleChosen.split(', '))
                  : setValue('cycleChosen', rowData.cycleChosen);
                // console.log('chosen!', rowData.cycleChosen);
                setActions((prev) => ({
                  ...prev,
                  deductionId: rowData.deductionId,
                }));
              }}
            />
            <Divider layout="vertical" />
          </>
        )}

        {!rowData.isPosted && (
          <Button
            type="button"
            text
            severity="secondary"
            icon="pi pi-check"
            tooltip="Post"
            tooltipOptions={{ position: 'top' }}
            onClick={(e: any) => {
              if (postedDisable) {
                return;
              }
              setIsOpen2(true);
              setButtonText(
                `Are you sure you want to post deduction from ${rowData.employee?.employee_profile.employeeFullName}?`
              );
              setSidebarTitle('Post Deduction');
              setActions((prev) => ({
                ...prev,
                deductionId: rowData.deductionId,
              }));
            }}
          />
        )}

        {rowData.isPosted &&
          rowData.amountPaid == 0 &&
          rowData.deductionType.toUpperCase() != 'CASH ADVANCE' &&
          rowData.deductionType.toUpperCase() != 'SALARY LOAN' && (
            <Button
              type="button"
              text
              severity="secondary"
              icon="pi pi-times"
              tooltip="Unpost"
              tooltipOptions={{ position: 'top' }}
              onClick={() => {
                if (postedDisable) {
                  return;
                }
                setIsOpen2(true);
                setButtonText(
                  `Are you sure you want to unpost deduction from ${rowData.employee?.employee_profile.employeeFullName}?`
                );
                setSidebarTitle('Unpost Deduction');
                setActions((prev) => ({
                  ...prev,
                  deductionId: rowData.deductionId,
                }));
              }}
            />
          )}

        {rowData.amountPaid <= 0 && !rowData.isPosted && (
          <>
            <Divider layout="vertical" />
            <Button
              type="button"
              text
              icon="pi pi-trash"
              tooltip="Delete"
              tooltipOptions={{ position: 'top' }}
              onClick={() => {
                setIsOpen2(true);
                setButtonText(
                  `Are you sure you want to delete deduction of ${rowData.employee?.employee_profile.employeeFullName}?`
                );
                setSidebarTitle('Delete Deduction');
                setActions((prev) => ({
                  ...prev,
                  deductionId: rowData.deductionId,
                }));
              }}
            />
          </>
        )}
      </div>
    );
  }

  function handleSidebar(button: string, title: string) {
    setButtonText(button);
    setSidebarTitle(title);
    setAddDeductions(true);
  }
}

export default Deductions;
