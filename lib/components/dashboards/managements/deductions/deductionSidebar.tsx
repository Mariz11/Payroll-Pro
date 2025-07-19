import {
  QueryObserverResult,
  RefetchOptions,
  RefetchQueryFilters,
  useQuery,
} from '@tanstack/react-query';
import { getCompanyDetails } from '@utils/companyDetailsGetter';
import { amountFormatter } from '@utils/helper';
import axios from 'axios';
import classNames from 'classnames';
import deduction from 'db/models/deduction';
import { get } from 'http';
import { GlobalContainer } from 'lib/context/globalContext';
import moment from '@constant/momentTZ';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Paginator } from 'primereact/paginator';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Sidebar } from 'primereact/sidebar';
import { Toast } from 'primereact/toast';
import { Calendar } from 'primereact/calendar';
import React, { use, useContext, useEffect, useRef, useState } from 'react';
import {
  FieldErrors,
  UseFormClearErrors,
  UseFormHandleSubmit,
  UseFormRegister,
  UseFormReset,
  UseFormSetError,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import EditBreakdownDialog from './editBreakdownDialog';
import { isArray, set } from 'lodash';
import { Skeleton } from 'antd';
import { getCycleDates, getWeeklyCycles } from '@utils/companyDetailsGetter';
import AuthenticationDialog from 'lib/components/blocks/authenticationDialog';
import { MultiSelect } from 'primereact/multiselect';
import EmployeeAutoSuggest from 'lib/components/common/EmployeeAutoSuggest';
const customSkeletonStyle =
  'h-4 bg-gray-200 rounded-md dark:bg-gray-500 w-full animate-pulse';
const DeductionSidebar = ({
  configuration: { isOpen, setIsOpen },
  label: { buttonText, title },
  register,
  handleSubmit,
  errors,
  setValue,
  watch,
  reset,
  isDirty,
  isValid,
  refetch,
  deductionId,
  toast,
  setError,
  deductionBreakdownArr,
  setDeductionBreakdownArr,
  clearErrors,
}: {
  configuration: Configuration;
  label: Label;
  register: UseFormRegister<DeductionForms>;
  handleSubmit: UseFormHandleSubmit<DeductionForms>;
  errors: FieldErrors<DeductionForms>;
  setValue: UseFormSetValue<DeductionForms>;
  setError: UseFormSetError<DeductionForms>;
  watch: UseFormWatch<DeductionForms>;
  reset: UseFormReset<DeductionForms>;
  isDirty: boolean;
  isValid: boolean;
  refetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<any, unknown>>;
  deductionId: number;
  toast: React.RefObject<Toast>;
  deductionBreakdownArr: any[];
  setDeductionBreakdownArr: any;
  clearErrors: UseFormClearErrors<DeductionForms>;
}) => {
  const [isAuthenticationDialogVisible, setIsAuthenticationDialogVisible] =
    useState(false);
  const [password, setPassword] = useState('');
  const [defaultcycleOpts, setDefaultcycleOpts] = useState<any>([]);
  const [cycleOpts, setCycleOpts] = useState<any>([]);
  const context = useContext(GlobalContainer);
  const [isButtonLabelChange, setIsButtonLabelChange] = useState(false);
  const [amount, setAmount] = useState(0);
  const [desc, setDesc] = useState('');
  const [visible, setVisible] = useState(false);
  const [cycleChosen, setCycleChosen] = useState<any>([]);
  const defaultDeductionBreakdownArr = useRef<any>([]);
  const submitFormRef = useRef<any>(null);
  const [selectedBreakdown, setSelectedBreakdown] = useState({
    data: null,
    rowIndex: -1,
  });
  const [isRetrieveDeductionBreakdown, setIsRetrieveDeductionBreakdown] =
    useState(false);
  const [pagination, setPagination] = useState({
    offset: 0,
    limit: 5,
    first: 0,
  });

  const payCycles = useQuery({
    queryKey: ['payCycles'],
    queryFn: async () => {
      const response = await axios.get(`/api/companies/paycycles/departments`, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
        },
      });
      // console.log('payCycles', response.data);
      return response.data;
    },
  });

  const deductionPayments = useQuery({
    refetchOnWindowFocus: false,
    queryKey: ['deductionPayments', watch().deductionId, pagination],
    queryFn: () =>
      fetch(
        `/api/deductions/payments?offset=${pagination.offset}&limit=${
          pagination.limit
        }&deductionId=${watch().deductionId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
          },
        }
      )
        .then((res) => res.json())
        .catch((err) => console.error(err)),
  });

  const CADisbursementData =
    watch().deductionData &&
    watch().deductionData.transfer_to_employee_acct_transaction;
  const deductionData = watch().deductionData;
  // console.log(...cycleOpts);
  //  logic to handle cycle options according to payrolltype
  useEffect(() => {
    const handleCycle = async () => {
      // setCycleOpts([]);
      setCycleChosen([]);

      // trap assignEmployee when changing deduction type
      if (
        watch('deductionType.name') === 'Other' &&
        watch('assignEmployee.payrollType') === 'SEMI-WEEKLY'
      ) {
        setCycleOpts(null);

        setValue('assignEmployee', {
          name: '',
          id: -1,
          companyId: -1,
          departmentId: -1,
          userId: -1,
          payrollType: '',
        });
        // setValue('cycleChosen', 'N/A');
      }
      if (
        watch('assignEmployee.payrollType') === 'SEMI-WEEKLY' &&
        watch('timePeriodDeduction.name') === 'Specific Cycle'
      ) {
        setValue('timePeriodDeduction.name', '');
        setValue('cycleChosen', '');
      }

      let departmentDetails = payCycles?.data?.filter(
        (item: any) => item.departmentId == watch('assignEmployee.departmentId')
      );
      if (departmentDetails?.length > 0) {
        const { payroll_type } = departmentDetails[0];
        if (payroll_type) {
          const { company_pay_cycles } = payroll_type;
          if (payroll_type?.type == 'WEEKLY') {
            // let monthSelected = moment(new Date()).format('MMMM YYYY');

            // setCycleOpts(
            //   await getWeeklyCycles({
            //     selectedMonth: monthSelected,
            //     payDay: company_pay_cycles[0].payDate,
            //   })
            // );
            const options = [
              { name: 'FIRST CYCLE', code: 'FIRST CYCLE' },
              { name: 'SECOND CYCLE', code: 'SECOND CYCLE' },
              { name: 'THIRD CYCLE', code: 'THIRD CYCLE' },
              { name: 'FOURTH CYCLE', code: 'FOURTH CYCLE' },
              { name: 'FIFTH CYCLE', code: 'FIFTH CYCLE' },
            ];
            setCycleOpts(options);
            setDefaultcycleOpts(options);
          } else {
            const options = company_pay_cycles.map((item: any) => ({
              name: item.cycle,
              code: item.cycle,
            }));
            setCycleOpts(options);
            setDefaultcycleOpts(options);
          }
        }
      }
    };
    // const handleDates = () => {
    //   const selectedMonth = watch('businessMonth');
    //   if (selectedMonth) {
    //     if (watch('assignEmployee').payrollType == 'SEMI-WEEKLY') {
    //       const startDate = moment(selectedMonth, 'MMMM YYYY')
    //         .startOf('month')
    //         .toDate();
    //       const endDate = moment(startDate).add(3, 'days').toDate();
    //       setValue(
    //         'cycleChosen',
    //         `[${moment(startDate).format('MM/DD/YYYY')}-${moment(
    //           endDate
    //         ).format('MM/DD/YYYY')}]`
    //       );
    //     }
    //     if (watch('assignEmployee').payrollType == 'MONTHLY') {
    //       setValue('cycleChosen', '');
    //     }
    //   }
    // };
    // handleDates();
    handleCycle();
  }, [watch('assignEmployee'), watch('timePeriodDeduction')]);

  const forceReload = useRef(false);
  useEffect(() => {
    if (watch('deductionType.name') === 'Other') {
      setValue(
        'totalAmmount',
        deductionBreakdownArr.reduce((acc, cur) => {
          return acc + cur.amount;
        }, 0)
      );
    }
  }, [deductionBreakdownArr, setValue, watch]);
  useEffect(() => {
    // empty deductionBreakdownArr on Add New Deductions

    if (title === 'Add New Deductions') {
      setDeductionBreakdownArr(() => []);
      return;
    }
    if (isOpen === false) return;
    setIsRetrieveDeductionBreakdown(true);
    setDeductionBreakdownArr([]);
    axios
      .get(`/api/deductions/${deductionId}/ledger`, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
        },
      })
      .then((res) => {
        setDeductionBreakdownArr(res.data);
        setIsRetrieveDeductionBreakdown(false);
      })
      .catch((err) => {
        console.error(err);
        // setIsRetrieveDeductionBreakdown(false);
      });
    setCycleChosen(watch('cycleChosen'));
  }, [isOpen, deductionId, setDeductionBreakdownArr, title]);

  return (
    <Sidebar
      position="right"
      className="p-sidebar-md"
      visible={isOpen}
      onHide={() => {
        setAmount(0);
        setDesc('');
        setIsOpen(false);
        setCycleOpts(null);
        setCycleChosen([]);
        reset();
      }}
      style={{
        width: '87%',
      }}
    >
      <React.Fragment>
        <h1 className="text-black font-medium text-3xl">{title}</h1>

        {deductionData &&
          deductionData.deductionType == 'Cash Advance' &&
          deductionData.isPosted && (
            <div className="my-5 flex gap-5">
              <div className="flex items-center gap-2">
                <h2 className="font-bold">Batch#:</h2>
                <span>
                  {CADisbursementData ? CADisbursementData.batchNumber : ''}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold">Disbursement Status:</h2>
                <span
                  className={classNames('py-1 px-5 rounded-full', {
                    'bg-green-200 text-green-700':
                      CADisbursementData &&
                      CADisbursementData.disbursementStatus == 1,
                    'bg-orange-200 text-orange-700':
                      CADisbursementData &&
                      CADisbursementData.disbursementStatus == 0,
                    'bg-red-200 text-red-700':
                      CADisbursementData &&
                      CADisbursementData.disbursementStatus == 2,
                  })}
                >
                  {CADisbursementData &&
                  CADisbursementData.disbursementStatus == 1
                    ? 'SUCCESS'
                    : CADisbursementData &&
                      CADisbursementData.disbursementStatus == 2
                    ? 'FAILED'
                    : 'PENDING'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold">Disbursement Code:</h2>
                <span>
                  {CADisbursementData &&
                  CADisbursementData.disbursementStatus == 1
                    ? CADisbursementData.disbursementCode
                    : '--'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold">Disbursement Date:</h2>
                <span>
                  {CADisbursementData &&
                  CADisbursementData.disbursementStatus == 1
                    ? moment(CADisbursementData.updatedAt).format('LL - LT')
                    : '--'}
                </span>
              </div>
            </div>
          )}

        {watch().deductionType?.name == 'Salary Loan' && (
          <div className="my-5 flex gap-5">
            <div className="flex items-center gap-2">
              <h2 className="font-bold">Reference#:</h2>
              <span>{deductionData && deductionData.referenceNumber} </span>
            </div>
          </div>
        )}

        <h3 className="font-bold mt-5 mb-2 text-[20px]">Basic Details</h3>
      </React.Fragment>

      <form
        className="w-full overflow-auto gap-3 flex flex-col"
        onSubmit={(e) => {
          Dropdown;
          e.preventDefault();

          createUpdateDeduction(title as string);
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="card flex justify-content-center flex-col text-[12px] flex-auto">
            <label className="mb-1">
              <span className="text-red-500">*</span>Deduction Type
            </label>
            <Dropdown
              filter
              value={watch().deductionType}
              options={
                title === 'View Deductions'
                  ? [
                      { name: 'Cash Advance' },
                      { name: 'SSS Loan' },
                      { name: 'SSS Calamity Loan' },
                      { name: 'HDMF Loan' },
                      { name: 'Salary Loan' },
                      { name: 'Other' },
                    ]
                  : [
                      { name: 'Cash Advance' },
                      { name: 'SSS Loan' },
                      { name: 'SSS Calamity Loan' },
                      { name: 'HDMF Loan' },
                      // { name: 'Ledger' },
                      { name: 'Other' },
                    ]
              }
              optionLabel={'name'}
              placeholder={'Select Deduction Type'}
              className="w-full"
              onChange={(e) => {
                setValue('deductionType', e.value);
                if (watch('deductionType.name') === 'Other') {
                  forceReload.current = !forceReload.current;
                  setValue('remarks', watch('remarks')?.substring(0, 100));
                  setValue('timePeriodDeduction.name', 'One Time');
                  setValue('paymentCycles', 1);
                } else if (watch('deductionType.name') === 'Ledger') {
                  setValue('timePeriodDeduction.name', 'One Time');
                  setValue('paymentCycles', 1);
                }
              }}
              disabled={title === 'Add New Deductions' ? false : true}
            />
            {errors.deductionType && (
              <span className="text-red-500">
                {errors.deductionType.name?.message}
              </span>
            )}
          </div>

          {title !== 'Add New Deductions' ? (
            <div className="card flex justify-content-center flex-col text-[12px] flex-auto">
              <label className="mb-1">
                <span className="text-red-500">*</span>Assigned Employee
              </label>
              <InputText
                className={classNames('w-full md:w-14rem')}
                disabled={title !== 'Add New Deductions' ? true : false}
                value={
                  (deductionData &&
                    deductionData.employee.employee_profile.employeeFullName) ||
                  watch('assignEmployee.name')
                }
              />
            </div>
          ) : (
            <div className="card flex justify-content-center flex-col text-[12px] flex-auto">
              <label className="mb-1">
                <span className="text-red-500">*</span>Assigned Employee
              </label>

              <EmployeeAutoSuggest
                  key={watch('deductionType.name') === 'Other' ? 'SEMI-WEEKLY' : "Other"}
                  value={watch().assignEmployee}
                  onChange={(value) => {
                    setValue('assignEmployee', {
                      name: value?.employee_profile?.employeeFullName || '',
                      id: value?.employeeId || '',
                      companyId: value?.companyId || '',
                      departmentId: value?.departmentId || '',
                      userId: value?.employee_profile?.employeeProfileId || '',
                      payrollType: value?.department?.payroll_type?.type || ''
                    });
                  }}
                  disabled={title !== 'Add New Deductions'}
                  className={errors.assignEmployee ? 'p-invalid' : ''}
                  error={!!errors.assignEmployee}
                  placeholder="Search employee..."
                  payrollType={watch('deductionType.name') === 'Other' ? 'SEMI-WEEKLY' : undefined}
                />
              {errors.assignEmployee && (
                <span className="text-red-500">
                  {errors.assignEmployee.name?.message}
                </span>
              )}
            </div>
          )}
        </div>
        {/* <div className="grid grid-cols-2 gap-3">
          <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto">
            <label className="my-1">
              <span>Account Number Employee</span>
            </label>
            <InputText
              {...register('accountNumberEmployee')}
              className={classNames('w-full md:w-14rem')}
              placeholder="Account Number Employee"
              disabled={title === 'View Deductions' ? true : false}
            />
          </div>
          <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto">
            <label className="my-1">
              <span>Account Number Employer</span>
            </label>
            <InputText
              {...register('accountNumberEmployer')}
              className="w-full md:w-14rem"
              placeholder="Account Number Employer"
              disabled={title === 'View Deductions' ? true : false}
            />
          </div>
        </div> */}

        <div className="grid grid-cols-2 gap-3">
          <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto">
            <label className="my-1">
              <span className="text-red-500">*</span>Principal Amount{' '}
            </label>
            <InputNumber
              onChange={(e) => setValue('totalAmmount', e.value as number)}
              value={watch('totalAmmount')}
              className={classNames('w-full md:w-14rem')}
              placeholder="0.00"
              disabled={
                title === 'View Deductions' ||
                watch('deductionType.name') === 'Other'
                  ? true
                  : false
              }
              maxFractionDigits={2}
              minFractionDigits={2}
              min={0}
            />
            {errors.totalAmmount && (
              <span className="text-red-500">Enter valid amount</span>
            )}
          </div>
          <div className="card flex justify-content-center flex-col text-[12px] flex-auto">
            <label className="my-1">
              <span className="text-red-500">*</span>Term Type
            </label>
            <Dropdown
              filter
              value={watch('timePeriodDeduction')}
              options={
                watch('assignEmployee.payrollType') === 'SEMI-WEEKLY' ||
                watch('assignEmployee.payrollType') === 'MONTHLY' ||
                watch().assignEmployee?.payrollType == '4' ||
                (watch().deductionType &&
                  watch().deductionType.name != 'Other') ||
                !watch().deductionType
                  ? [{ name: 'One Time' }, { name: 'Per Cycle' }]
                  : [
                      { name: 'One Time' },
                      { name: 'Per Cycle' },
                      { name: 'Specific Cycle' },
                    ]
              }
              optionLabel={'name'}
              placeholder={'Select Time Period Deduction'}
              className="w-full"
              onChange={(e) => {
                setValue('timePeriodDeduction', e.value);

                if (e.value.name === 'One Time') {
                  setValue('paymentCycles', 1);
                } else {
                  setValue('paymentCycles', 2);
                }
              }}
              disabled={
                title === 'View Deductions'
                // watch('deductionType.name') === 'Other' ||

                // (watch('deductionType.name') === 'Other' && cycleOpts === null)
              }
            />
            {errors.timePeriodDeduction && (
              <span className="text-red-500">
                {errors.timePeriodDeduction?.name?.message}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto">
            <label className="my-1">
              <span className="text-red-500">*</span>No. of Cycles
            </label>
            <InputText
              {...register('paymentCycles', {
                onChange: (e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setValue('paymentCycles', value);
                  // if (Array.isArray(cycleChosen)) {
                  //   if (cycleChosen.length == value) {
                  //     setCycleOpts(
                  //       defaultcycleOpts.filter((i: any) =>
                  //         cycleChosen.includes(i.name)
                  //       )
                  //     );
                  //   } else {
                  //     setCycleOpts(defaultcycleOpts);
                  //   }
                  // }
                },
                onBlur: (e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value && value < 2) {
                    setValue('paymentCycles', 2);
                  } else if (value && value > 12) {
                    setValue('paymentCycles', 12);
                  } else {
                    setValue('paymentCycles', value);
                  }
                  if (watch('timePeriodDeduction.name') === 'Specific Cycle') {
                    if (value < cycleChosen.length) setCycleChosen([]);
                  }
                },
              })}
              className={classNames('w-full md:w-14rem')}
              placeholder="No. of Cycles"
              disabled={
                title === 'View Deductions'
                  ? true
                  : false || watch('timePeriodDeduction.name') === 'One Time'
              }
              // type="number"
            />
            {errors.paymentCycles && (
              <span className="text-red-500">Enter only from 2 to 12</span>
            )}
          </div>

          {/* updated by Clyde on 10/16/2022 - modified 'other' deduction type to accept 'per cycle' deductionss */}
          {/* {watch('assignEmployee.payrollType') !== 'SEMI-WEEKLY' &&
            watch('timePeriodDeduction.name') !== 'One Time' &&
            title === 'View Deductions' && (
              <>
                <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto">
                  <label className="my-1">
                    <span className="text-red-500">*</span>Chosen Cycle
                  </label>
                  <InputText
                    className={classNames('w-full md:w-14rem')}
                    disabled={title === 'View Deductions' ? true : false}
                    value={watch('cycleChosen') || deductionData?.cycleChosen}
                  />
                </div>
              </>
            )} */}

          {watch('assignEmployee') &&
            watch('assignEmployee.payrollType') !== 'SEMI-WEEKLY' &&
            // title !== 'View Deductions' &&
            watch('timePeriodDeduction.name') !== 'Specific Cycle' && (
              <>
                <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto">
                  <label className="my-1">
                    <span className="text-red-500">*</span>Choose Cycle{' '}
                  </label>
                  <Dropdown
                    value={watch('cycleChosen')}
                    onChange={(e) => {
                      clearErrors('cycleChosen');
                      setValue('cycleChosen', e.value);
                    }}
                    options={
                      title !== 'View Deductions'
                        ? watch('timePeriodDeduction.name') != 'Per Cycle'
                          ? cycleOpts?.map((item: any) => item.code)
                          : cycleOpts && Array.isArray(cycleOpts)
                          ? [
                              'Every Cycle',
                              ...cycleOpts?.map((item: any) => item.code),
                            ]
                          : ['Every Cycle']
                        : watch('timePeriodDeduction.name') != 'Per Cycle' &&
                          watch('cycleChosen')
                        ? [watch('cycleChosen')]
                        : !watch('cycleChosen')
                        ? []
                        : watch('cycleChosen')?.split(', ')
                    }
                    // optionLabel="name"
                    placeholder="Choose Cycle"
                    disabled={
                      !watch('assignEmployee') ||
                      title === 'View Deductions' ||
                      watch('assignEmployee.payrollType') === 'SEMI-WEEKLY' ||
                      watch().assignEmployee?.payrollType == '4' ||
                      cycleOpts === null
                    }
                    className="deduction-choose-cycle w-full"
                  />
                  {errors.cycleChosen && (
                    <span className="text-red-500">
                      {errors.cycleChosen?.message}
                    </span>
                  )}
                </div>
              </>
            )}

          {watch('timePeriodDeduction.name') === 'Specific Cycle' &&
            watch('assignEmployee.payrollType') !== 'SEMI-WEEKLY' &&
            title !== 'View Deductions' && (
              <>
                <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto">
                  <label className="my-1">
                    <span className="text-red-500">*</span>Choose Cycle{' '}
                  </label>
                  <MultiSelect
                    value={
                      typeof cycleChosen === 'string'
                        ? cycleChosen.split(', ')
                        : cycleChosen
                    }
                    onChange={(e) => {
                      clearErrors('cycleChosen');
                      const paymentCycles = watch('paymentCycles') ?? 0;
                      const selectedValues = e.value;

                      if (selectedValues.length <= paymentCycles) {
                        setCycleChosen(selectedValues);
                      } else {
                        if (selectedValues.length < cycleChosen.length) {
                          setCycleChosen(selectedValues);
                        }
                      }
                      if (
                        watch('timePeriodDeduction.name') == 'Specific Cycle' &&
                        selectedValues.length > paymentCycles
                      ) {
                        toast.current?.replace({
                          severity: 'error',
                          summary: 'Cycle Selection Error',
                          detail:
                            'Cannot choose cycles more than the no. of cycles',
                          sticky: true,
                          closable: true,
                        });
                      }
                      // if (selectedValues.length == paymentCycles) {
                      //   setCycleOpts(
                      //     defaultcycleOpts.filter((i: any) =>
                      //       selectedValues.includes(i.name)
                      //     )
                      //   );
                      // } else {
                      //   setCycleOpts(defaultcycleOpts);
                      // }
                    }}
                    showSelectAll={false}
                    options={cycleOpts?.map((item: any) => item.name)}
                    placeholder="Choose Cycle(s)"
                    disabled={
                      !watch('assignEmployee') || title === 'View Deductions'
                    }
                    className="w-full"
                  />
                  {errors.cycleChosen && (
                    <span className="text-red-500">
                      {errors.cycleChosen?.message}
                    </span>
                  )}
                </div>
              </>
            )}
        </div>

        <div className="mb-5">
          <div className=" card flex justify-content-center flex-col text-[12px] flex-auto">
            {watch('deductionType.name') === 'Other' ? (
              <>
                {title !== 'View Deductions' && (
                  <div className="grid grid-cols-4 gap-3 item-start">
                    <div className="col-span-2 flex flex-col">
                      <label className="my-1">
                        <span className="text-red-500">*</span>
                        <span>Amount</span>
                      </label>
                      <InputNumber
                        onChange={(e) => setAmount(e.value as number)}
                        // value={watch('totalAmmount')}
                        className={classNames()}
                        placeholder="0.00"
                        disabled={
                          title === 'View Deductions'
                            ? true
                            : false || deductionBreakdownArr.length > 2
                        }
                        value={amount}
                        maxFractionDigits={2}
                        minFractionDigits={2}
                        min={0}
                      />
                    </div>
                    <div className="col-span-2  flex flex-row">
                      <div className="w-4/5 flex flex-col">
                        <label className="my-1">
                          <label className="">
                            <span className="text-red-500">*</span>
                          </label>
                          <span>Description </span>
                          <span>{` (20 Characters Max)`}</span>
                        </label>
                        <InputText
                          // autoResize={false}
                          // rows={1}
                          // cols={30}
                          // {...register('remarks', {
                          // required: 'remarks is required',
                          // })}
                          value={desc}
                          onChange={(e) => setDesc(e.target.value)}
                          maxLength={20}
                          disabled={
                            title === 'View Deductions'
                              ? true
                              : false || deductionBreakdownArr.length > 2
                          }
                          placeholder="Description of the deduction"
                        />
                      </div>

                      <div className="items-end ml-8 flex">
                        <Button
                          hidden={title === 'View Deductions' ? true : false}
                          className=" rounded-full bg-primaryDefault  border-none text-white  lg:w-[150px] md:w-[100px] justify-center text-center"
                          color="primaryDefault"
                          type="button"
                          onClick={() => {
                            if (amount <= 0) {
                              toast.current?.replace({
                                severity: 'error',
                                summary: 'Amount must be greater than 0',
                                life: 3000,
                              });
                              return;
                            }
                            if (desc === '') {
                              toast.current?.replace({
                                severity: 'error',
                                summary: 'Description is required',
                                life: 3000,
                              });
                              return;
                            }
                            if (deductionBreakdownArr.length >= 3) {
                              toast.current?.replace({
                                severity: 'error',
                                summary:
                                  'A maximum of 3 items can only be added',
                                life: 3000,
                              });
                              return;
                            }
                            let temp = [
                              ...deductionBreakdownArr,
                              { amount, desc },
                            ];

                            setDeductionBreakdownArr(temp);
                            setDesc('');
                            setAmount(0.0);
                          }}
                          disabled={
                            isRetrieveDeductionBreakdown ||
                            deductionBreakdownArr.length > 2
                          }
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                <div>
                  <p className="font-bold mt-1 mb-2 text-[20px]">
                    Deduction Breakdown
                  </p>
                  <DataTable
                    value={
                      isRetrieveDeductionBreakdown
                        ? [{ dummy: '' }, { dummy: '' }, { dummy: '' }]
                        : deductionBreakdownArr
                    }
                    size="small"
                    // emptyMessage={'No deduction breakdown'}
                    scrollable={true}
                    tableStyle={{ minWidth: '95rem' }}
                  >
                    <Column
                      field="amount"
                      header="Amount"
                      body={(data) => {
                        return isRetrieveDeductionBreakdown ? (
                          <div className={customSkeletonStyle}></div>
                        ) : (
                          amountFormatter(data.amount)
                        );
                      }}
                    />
                    <Column
                      field="desc"
                      header="Description"
                      body={(data) => {
                        return isRetrieveDeductionBreakdown ? (
                          <div className={customSkeletonStyle}></div>
                        ) : (
                          data.desc
                        );
                      }}
                    />
                    <Column
                      field="actions"
                      hidden={title === 'View Deductions' ? true : false}
                      header="Action"
                      body={(data, rowValues) => {
                        if (isRetrieveDeductionBreakdown) {
                          return <div className={customSkeletonStyle}></div>;
                        }
                        return (
                          <div className="flex items-center gap-2">
                            <Button
                              icon="pi pi-pencil"
                              rounded
                              outlined
                              className="mr-2"
                              tooltip="Edit"
                              tooltipOptions={{ position: 'top' }}
                              type="button"
                              onClick={() => {
                                setSelectedBreakdown({
                                  data: data,
                                  rowIndex: rowValues.rowIndex,
                                });
                                setVisible(true);
                              }}
                            ></Button>
                            <Button
                              icon="pi pi-trash"
                              rounded
                              outlined
                              className="mr-2"
                              tooltip="Delete"
                              tooltipOptions={{ position: 'top' }}
                              onClick={() => {
                                let index = rowValues.rowIndex;
                                setDeductionBreakdownArr(
                                  deductionBreakdownArr.filter((item, i) => {
                                    return i !== index;
                                  })
                                );
                              }}
                              type="button"
                            ></Button>
                          </div>
                        );
                      }}
                    ></Column>
                  </DataTable>
                </div>
              </>
            ) : (
              <>
                <label>
                  <span>Remarks </span>
                </label>
                <InputTextarea
                  autoResize
                  rows={watch('deductionType.name') === 'Other' ? 1 : 5}
                  cols={30}
                  {...register('remarks', {
                    required: 'remarks is required',
                  })}
                  disabled={title === 'View Deductions' ? true : false}
                />
              </>
            )}

            {errors.remarks && (
              <span className="text-red-500">{errors.remarks.message}</span>
            )}
          </div>
        </div>

        {title === 'View Deductions' && (
          <div className="my-5">
            <DataTable
              value={
                deductionPayments &&
                deductionPayments.data &&
                deductionPayments.data.rows
              }
              tableStyle={{ minWidth: '34rem' }}
              header={(data: any) => {
                const principalAmount = watch().totalAmmount;
                const totalAmountPaid: any = watch().totalAmountPaid;
                const perCycleDeduction: any = deductionData
                  ? deductionData.perCycleDeduction
                  : 0;
                return (
                  <div className="flex items-center justify-between">
                    <h2 className="w-[200px] font-bold text-[20px] w-">
                      Payment History
                    </h2>
                    <div className="w-full flex items-center justify-end gap-4">
                      <div>
                        Due Amount:{' '}
                        <span className="text-xl text-[20px] font-bold">
                          PHP {amountFormatter(perCycleDeduction)}
                        </span>
                      </div>
                      <div>
                        Balance:{' '}
                        <span className="text-xl text-[20px] font-bold">
                          PHP{' '}
                          {amountFormatter(principalAmount - totalAmountPaid)}
                        </span>
                      </div>
                      <div>
                        Total Amount Paid:{' '}
                        <span className="text-xl text-[20px] font-bold">
                          PHP {amountFormatter(totalAmountPaid)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }}
            >
              <Column
                field="transactionCode"
                header="Transaction Code"
                body={(data) =>
                  data.transaction ? data.transaction.transactionCode : null
                }
                hidden={watch().deductionType?.name != 'Salary Loan'}
              />
              <Column
                field="businessMonthCycle"
                header="Business Month - Cycle"
                body={(data) =>
                  data.payroll ? data.payroll.businessMonthCycle : null
                }
              />
              <Column
                field="amountPaid"
                header="Amount Paid"
                body={(data) => `PHP ${amountFormatter(data.amountPaid)}`}
              />
              <Column
                field="paidDate"
                header="Paid Date"
                body={(data) => moment(data.updatedAt).format('LL - LT')}
              />
            </DataTable>
            <Paginator
              first={pagination.first}
              rows={pagination.limit}
              totalRecords={
                deductionPayments &&
                deductionPayments.data &&
                deductionPayments.data.count
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
        )}

        {(title === 'Update Deductions' || title === 'Add New Deductions') && (
          <div className="flex justify-end gap-3">
            <Button
              label="Cancel"
              rounded
              text
              severity="secondary"
              className="w-[150px]"
              onClick={(e) => {
                e.preventDefault();

                setIsOpen(false);
                setAmount(0);
                setDesc('');
                // setDeductionBreakdownArr([]);

                reset();
              }}
            />
            <Button
              ref={submitFormRef}
              tooltip={
                isRetrieveDeductionBreakdown ? 'Retrieving Data' : 'Save'
              }
              tooltipOptions={{ position: 'top' }}
              label={isButtonLabelChange ? 'Saving...' : 'Save'}
              className="bg-primaryDefault w-[150px]"
              disabled={
                isButtonLabelChange ||
                (title === 'Update Deductions' && isRetrieveDeductionBreakdown)
              }
              rounded
              type="submit"
            />
          </div>
        )}
      </form>
      <EditBreakdownDialog
        visible={visible}
        setVisible={setVisible}
        selectedBreakdown={selectedBreakdown}
        setDeductionBreakdownArr={setDeductionBreakdownArr}
        deductionBreakdownArr={deductionBreakdownArr}
      ></EditBreakdownDialog>
      <AuthenticationDialog
        header="User Verification"
        message="Please enter your password to create Cash Advance Deduction."
        isVisible={isAuthenticationDialogVisible}
        setIsVisible={setIsAuthenticationDialogVisible}
        password={password}
        setPassword={setPassword}
        action={() => {
          submitFormRef.current?.click();
        }}
      ></AuthenticationDialog>
    </Sidebar>
  );

  function createUpdateDeduction(title: string) {
    if (watch('timePeriodDeduction.name') === 'Specific Cycle') {
      setValue('cycleChosen', cycleChosen.join(', '));
    }
    // console.log('valid!', isValid);
    // console.log('errors', errors);
    if (
      watch('assignEmployee.payrollType') !== 'SEMI-WEEKLY' &&
      (!watch('cycleChosen') ||
        watch('cycleChosen') == 'N/A' ||
        (watch('timePeriodDeduction.name') !== 'Per Cycle' &&
          watch('cycleChosen') == 'Every Cycle'))
    ) {
      setError('cycleChosen', {
        message: 'Cycle is required',
        type: 'required',
      });
      // toast.current?.replace({
      //   severity: 'error',
      //   summary: 'Choose Cycle is required',
      //   life: 5000,
      // });
      return;
    }
    handleSubmit(async (data: DeductionForms) => {
      if (watch('assignEmployee.id') === -1) {
        setError('assignEmployee', {
          message: 'Employee is required',
          type: 'required',
        });
        toast.current?.replace({
          severity: 'error',
          summary: 'Employee is required',
          life: 5000,
        });
        return;
      }
      if (
        watch('deductionType.name') === 'Other' &&
        deductionBreakdownArr.length === 0
      ) {
        setError('totalAmmount', {
          message: 'total amount is required',
          type: 'required',
        });
        toast.current?.replace({
          severity: 'error',
          summary: 'Breakdown is required for "Other Deduction"',
          life: 5000,
        });
        return;
      }
      if (
        watch('timePeriodDeduction.name') != 'One Time' &&
        watch('assignEmployee.payrollType') !== 'SEMI-WEEKLY' &&
        (watch('cycleChosen') === '' || !watch('cycleChosen'))
      ) {
        // setError('totalAmmount', {
        //   message: 'cycle is required',
        //   type: 'required',
        // });
        toast.current?.replace({
          severity: 'error',
          summary: 'Cycle is required',
          life: 5000,
        });
        return;
      }

      setIsButtonLabelChange(true);

      const config = {
        method: title === 'Add New Deductions' ? 'POST' : 'PUT',
        url: `/api/deductions?deductionId=${deductionId}`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
        },
        data: JSON.stringify({
          ids: {
            companyId: data.assignEmployee.companyId,
            employeeId: data.assignEmployee.id,
            userId: context?.userData.userId,
          },
          deductionType: data.deductionType.name,
          accountEmployeerNumber: null,
          accountEmployeeNumber: null,
          totalAmount: data.totalAmmount,
          timePeriodPerDeduction: data.timePeriodDeduction.name,
          remarks: data.remarks,
          paymentCycle: data.paymentCycles,
          deductionBreakdown: deductionBreakdownArr,
          cycleChosen:
            data.assignEmployee.payrollType === 'SEMI-WEEKLY'
              ? 'N/A'
              : data.cycleChosen,
        }),
      };

      axios
        .request(config)
        .then((res) => {
          (function () {
            if (res.data && res.data.success === false) {
              toast.current?.show({
                severity: 'error',
                summary:
                  title === 'Add New Deductions'
                    ? 'Unpaid Deductions'
                    : 'Update Error',
                detail:
                  title === 'Add New Deductions'
                    ? res.data.message
                    : 'Error Updating Deduction',
                life: 10000,
              });
            } else {
              toast.current?.show({
                severity: 'success',
                summary:
                  title === 'Add New Deductions'
                    ? 'Successfully Created'
                    : 'Successfully Updated',
                // detail:
                //   title === 'Add New Deductions'
                //     ? 'Successfully created a deduction'
                //     : 'Successfully updated a deduction',
                life: 3000,
              });
            }
          })();
          reset();
          setAmount(0);
          setDesc('');
          if (title === 'Add New Deductions') {
            setDeductionBreakdownArr([]);
          }
          refetch();

          setIsButtonLabelChange(false);
          setIsOpen(false);
        })
        .catch((err) => {
          (function () {
            toast.current?.show({
              severity: 'error',
              summary: `${err.response?.data?.message}`,
              // detail: 'Error in creating a deduction',
              life: 3000,
            });
          })();

          setIsButtonLabelChange(false);
          console.error(err);
        });
    })();
  }
};

export default DeductionSidebar;
