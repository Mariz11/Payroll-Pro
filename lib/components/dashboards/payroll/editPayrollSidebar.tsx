import React, { Dispatch, useEffect, useRef, useState } from 'react';
import { Sidebar } from 'primereact/sidebar';
import { TreeTable } from 'primereact/treetable';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { amountFormatter, convertMinsToHours } from '@utils/helper';
import DeductionsGrid from './deductionsGrid';
import { InputNumber } from 'primereact/inputnumber';
import { Controller, useForm } from 'react-hook-form';
import classNames from 'classnames';
import axios from 'axios';
import { Toast } from 'primereact/toast';
import moment from '@constant/momentTZ';
import { Divider } from 'primereact/divider';
import { Badge } from 'primereact/badge';
import { Tooltip } from 'primereact/tooltip';
// import { reduce, set } from 'lodash';
import { getPremiumAttendanceBreakdown } from '@utils/companyDetailsGetter';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import EditAdjustmentDialog from './editAdjustmentDialog';
import { add, get, set } from 'lodash';
interface PayrollAdjustment {
  payrollAdjustmentsId: number | null;
  addAdjustment: number;
  deductAdjustment: number;
  desc: string;
  isEdited: boolean;
}

const EditPayrollSidebar = ({
  configuration: { title, submitBtnText, action, rowData, isOpen },
  setSideBarConfig,
  refetchDataFromParent,
  setSelectedRows,
  pendingTotalsQuery,
  pageActions,
  toast,
}: {
  configuration: SideBarConfig;
  setSideBarConfig: any;
  refetchDataFromParent: () => void;
  setSelectedRows: Dispatch<React.SetStateAction<any>>;
  pendingTotalsQuery: any;
  pageActions: any;
  toast: any;
}) => {
  // const toast = useRef<Toast>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [deductionsData, setDeductionsData] = useState([]);
  const [newTotalDeduction, setNewTotalDeduction] = useState(0);
  const [forceRefresher, setForceRefresher] = useState(true);
  const [newNetPay, setNewNetPay] = useState(0);
  const [adjustments, setAdjustments] = useState(0);

  const [workedOnRD, setWorkedOnRD] = useState(0);
  const [workedOnSPHD, setWorkedOnSPHD] = useState(0);
  const [workedOnSPHDWhileRD, setWorkedOnSPHDWhileRD] = useState(0);
  const [halfdayPresentonSPHD, setHalfdayPresentonSPHD] = useState(0);
  const [workedOnRHD, setWorkedOnRHD] = useState(0);
  const [workedOnRHDWhileRD, setWorkedOnRHDWhileRD] = useState(0);
  const [halfdayPresentonRHD, setHalfdayPresentonRHD] = useState(0);
  const [OTonRegDays, setOTonRegDays] = useState(0);
  const [OTonHolidays, setOTonHolidays] = useState(0);
  const [OTonRestDays, setOTonRestDays] = useState(0);
  const [isEditable, setIsEditable] = useState(false);
  useEffect(() => {
    // check if rowdata is posted and pageactions contains edit payroll

    if (!rowData.isPosted && pageActions.editPayroll) {
      setIsEditable(true);
    } else {
      setIsEditable(false);
    }
    if (isOpen) {
      setPremiumPays();
    }
    async function setPremiumPays() {
      const premiumAttendanceData: any = await getPremiumAttendanceBreakdown({
        employeeDetails: {
          employeeId: rowData?.employeeId,
          departmentId: rowData?.departmentId,
          daysOff: rowData?.daysOff,
        },
        attendanceDetails: {
          businessMonth: rowData?.businessMonth,
          cycle: rowData?.cycle,
        },
      });

      if (premiumAttendanceData.success) {
        const {
          workedOnRestDays,
          workedOnRegularHoliday,
          workedOnRegularHolidayWhileRestDay,
          halfDayPresentOnRegularHoliday,
          workedOnSpecialHoliday,
          workedOnSpecialHolidayWhileRestDay,
          halfDayPresentOnSpecialHoliday,
          overtimeOnRegularDays,
          overtimeOnHolidays,
          overtimeOnRestDays,
        } = premiumAttendanceData.data;
        setWorkedOnRD(workedOnRestDays);
        setWorkedOnSPHD(workedOnSpecialHoliday);
        setWorkedOnSPHDWhileRD(workedOnSpecialHolidayWhileRestDay);
        setHalfdayPresentonSPHD(halfDayPresentOnSpecialHoliday);
        setWorkedOnRHD(workedOnRegularHoliday);
        setWorkedOnRHDWhileRD(workedOnRegularHolidayWhileRestDay);
        setHalfdayPresentonRHD(halfDayPresentOnRegularHoliday);
        setOTonRegDays(overtimeOnRegularDays);
        setOTonHolidays(overtimeOnHolidays);
        setOTonRestDays(overtimeOnRestDays);
      }
    }
  }, [isOpen, rowData]);

  const [isAdd, setIsAdd] = useState(false);
  const [isDeduct, setIsDeduct] = useState(false);
  const [editDialog, setEditDialog] = useState<boolean>(false);
  const [adjustmentData, setAdjustmentData] = useState<PayrollAdjustment[]>([]);
  const totalLoanDeductions = deductionsData
    .filter((i: any) => !i.isDeferred)
    .reduce((acc: any, curr: any) => acc + curr.amountPaid, 0);

  // const workedOnRD = rowData?.employee?.attendances
  //   ?.filter((i: any) => {
  //     if ((i.isPresent || (i.isHalfDay && i.isLeave)) && !i.holiday) {
  //       return rowData?.daysOff?.includes(moment(i.date).format('dddd'));
  //     }
  //   })
  //   .reduce((tot: any, item: any) => tot + (item.isHalfDay ? 0.5 : 1), 0);

  // const workedOnSPHD = rowData?.employee?.attendances
  //   ?.filter((i: any) => {
  //     if (
  //       (i.isPresent || (i.isHalfDay && i.isLeave)) &&
  //       i.holiday &&
  //       i.holiday.holidayType == 'Special'
  //     ) {
  //       return !rowData?.daysOff?.includes(moment(i.date).format('dddd'));
  //     }
  //   })
  //   .reduce((tot: any, item: any) => tot + (item.isHalfDay ? 0.5 : 1), 0);

  // const workedOnSPHDWhileRD = rowData?.employee?.attendances
  //   ?.filter((i: any) => {
  //     if (
  //       (i.isPresent || (i.isHalfDay && i.isLeave)) &&
  //       i.holiday &&
  //       i.holiday.holidayType == 'Special'
  //     ) {
  //       return rowData?.daysOff?.includes(moment(i.date).format('dddd'));
  //     }
  //   })
  //   .reduce((tot: any, item: any) => tot + (item.isHalfDay ? 0.5 : 1), 0);

  // const workedOnRHD = rowData?.employee?.attendances
  //   ?.filter((i: any) => {
  //     if (
  //       (i.isPresent || (i.isHalfDay && i.isLeave)) &&
  //       i.holiday &&
  //       i.holiday.holidayType == 'Regular'
  //     ) {
  //       return !rowData?.daysOff?.includes(moment(i.date).format('dddd'));
  //     }
  //   })
  //   .reduce((tot: any, item: any) => tot + (item.isHalfDay ? 0.5 : 1), 0);

  // const workedOnRHDWhileRD = rowData?.employee?.attendances
  //   ?.filter((i: any) => {
  //     if (
  //       (i.isPresent || (i.isHalfDay && i.isLeave)) &&
  //       i.holiday &&
  //       i.holiday.holidayType == 'Regular'
  //     ) {
  //       return rowData?.daysOff?.includes(moment(i.date).format('dddd'));
  //     }
  //   })
  //   .reduce((tot: any, item: any) => tot + (item.isHalfDay ? 0.5 : 1), 0);
  // const halfdayPresentonRHD = rowData?.employee?.attendances?.filter(
  //   (i: any) => {
  //     if (
  //       i.isPresent &&
  //       i.isHalfDay &&
  //       i.holiday &&
  //       i.holiday.holidayType == 'Regular'
  //     ) {
  //       return true;
  //     }
  //   }
  // ).length;
  // const halfdayPresentonSPHD = rowData?.employee?.attendances?.filter(
  //   (i: any) => {
  //     if (
  //       i.isPresent &&
  //       i.isHalfDay &&
  //       i.holiday &&
  //       i.holiday.holidayType == 'Special'
  //     ) {
  //       return true;
  //     }
  //   }
  // ).length;
  // reduce((tot: any, item: any) => tot + (rowData.dailyRate * 0.5), 0);

  // const OTonRegDays = rowData?.employee?.attendances
  //   ?.filter((i: any) => {
  //     if (i.isPresent && !i.holiday) {
  //       return !rowData?.daysOff?.includes(moment(i.date).format('dddd'));
  //     }
  //   })
  //   .reduce((tot: any, att: any) => tot + parseFloat(att.overtimeHours), 0);

  // const OTonHolidays = rowData?.employee?.attendances
  //   ?.filter((i: any) => i.isPresent && i.holiday)
  //   .reduce((tot: any, att: any) => tot + parseFloat(att.overtimeHours), 0);

  // const OTonRestDays = rowData?.employee?.attendances
  //   ?.filter((i: any) => {
  //     if (i.isPresent && !i.holiday) {
  //       return rowData?.daysOff?.includes(moment(i.date).format('dddd'));
  //     }
  //   })
  //   .reduce((tot: any, att: any) => tot + parseFloat(att.overtimeHours), 0);

  const workedOnRegularDays =
    rowData.daysWorked -
    (workedOnRD +
      workedOnRHD +
      workedOnRHDWhileRD +
      workedOnSPHD +
      workedOnSPHDWhileRD);

  const workedOnRegularDaysPay = workedOnRegularDays * rowData.dailyRate;

  const totalApprovedLeaves =
    rowData.sickLeaveDays +
      rowData.vacationLeaveDays +
      rowData.soloParentLeaveDays +
      rowData.paternityLeaveDays +
      rowData.maternityLeaveDays +
      rowData.serviceIncentiveLeaveDays +
      rowData.otherLeaveDays || 0;

  const approvedLeavesPay = totalApprovedLeaves * rowData.dailyRate;

  let sssLoan: any = deductionsData.filter(
    (i: any) => !i.isDeferred && i.deduction.deductionType == 'SSS Loan'
  );
  sssLoan = sssLoan.length > 0 ? sssLoan[0].amountPaid : 0;

  let sssCalamityLoan: any = deductionsData.filter(
    (i: any) =>
      !i.isDeferred && i.deduction.deductionType == 'SSS Calamity Loan'
  );
  sssCalamityLoan =
    sssCalamityLoan.length > 0 ? sssCalamityLoan[0].amountPaid : 0;

  let pagIbigLoan: any = deductionsData.filter(
    (i: any) => !i.isDeferred && i.deduction.deductionType == 'HDMF Loan'
  );
  pagIbigLoan = pagIbigLoan.length > 0 ? pagIbigLoan[0].amountPaid : 0;

  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setValue,
    watch,
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      payroll_id: rowData.payroll_id,
      newTotalDeduction: rowData.totalDeduction,
      newNetPay: rowData.netPay,
      addAdjustment: '0.00',
      deductAdjustment: '0.00',
      remarks: rowData.remarks,
      shortDescription: '',
    },
  });
  // separate use effect so that these fields wont be erased when deductions are edited
  useEffect(() => {
    setAdjustmentData(
      rowData.payroll_adjustments
        ? rowData.payroll_adjustments.sort((a: any, b: any) => {
            if (a.payrollAdjustmentsId == null) return 0;
            if (a.payrollAdjustmentsId < b.payrollAdjustmentsId) return -1;
            if (a.payrollAdjustmentsId > b.payrollAdjustmentsId) return 1;
            return 0;
          })
        : []
    );
    setValue('addAdjustment', '0.00');
    setValue('deductAdjustment', '0.00');
    setValue('shortDescription', '');
    setValue('remarks', rowData.remarks);
  }, [rowData, setValue]);

  useEffect(() => {
    let addAdjustment = parseFloat(watch('addAdjustment'));
    let deductAdjustment = parseFloat(watch('deductAdjustment'));

    setIsAdd(addAdjustment > 0);
    setIsDeduct(deductAdjustment > 0);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch('addAdjustment'), watch('deductAdjustment')]);

  useEffect(() => {
    const newTotDeductionAmt =
      rowData.sssContribution +
      rowData.pagIbigContribution +
      rowData.philhealthContribution +
      rowData.withholdingTax +
      totalLoanDeductions;

    const newNetPayAmt = parseFloat(
      (rowData.grossPay - newTotDeductionAmt + adjustments).toFixed(2)
    );
    setNewTotalDeduction(newTotDeductionAmt);
    setNewNetPay(newNetPayAmt);

    setValue('payroll_id', rowData.payroll_id);
    setValue('newTotalDeduction', newTotDeductionAmt);
    setValue('newNetPay', newNetPayAmt);
    // setValue('remarks', rowData.remarks);
  }, [rowData, totalLoanDeductions, adjustments, setValue]);

  useEffect(() => {
    // watch((value, { name, type }) =>
    //   setAdjustments(
    //     (Number(value.addAdjustment) ?? 0) -
    //       (Number(value.deductAdjustment) ?? 0)
    //   )
    // );
    let adjustmentSum = 0;

    // iterate over each item in the array
    for (let i = 0; i < adjustmentData.length; i++) {
      adjustmentSum +=
        (Number(adjustmentData[i].addAdjustment) ?? 0) -
        (Number(adjustmentData[i].deductAdjustment) ?? 0);
    }
    setAdjustments(adjustmentSum);
  }, [adjustmentData, forceRefresher]);

  const handleUpdate = async (data: any) => {
    data.addAdjustment = data.addAdjustment ?? 0;
    data.deductAdjustment = data.deductAdjustment ?? 0;

    data.shortDescription = watch('shortDescription');

    toast.current?.show({
      severity: 'info',
      summary: 'Submitting Request',
      detail: 'Please wait...',
      sticky: true,
      closable: false,
    });
    data.addAdjustment = data.addAdjustment === '' ? 0 : data.addAdjustment;
    data.deductAdjustment =
      data.deductAdjustment === '' ? 0 : data.deductAdjustment;

    const response = await axios.put(
      '/api/payrolls/employees',
      JSON.stringify({
        ...data,
        deductionsData: deductionsData,
        adjustmentData: adjustmentData,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
        },
      }
    );
    setSelectedRows([]);

    setSideBarConfig((prev: any) => ({ ...prev, isOpen: false }));
    toast.current?.replace({
      severity: response.data.severity,
      summary: response.data.message,
      life: 5000,
      closable: true,
    });
    refetchDataFromParent();
    pendingTotalsQuery.refetch();
  };

  useEffect(() => {
    if (isOpen) {
      refetchDataFromParent();
      pendingTotalsQuery.refetch();
    }
  }, [isOpen, refetchDataFromParent]);

  return (
    <>
      <Toast ref={toast} position="bottom-left" />
      <Sidebar
        position="right"
        style={{
          width: '87%',
        }}
        visible={isOpen}
        onHide={() => {
          setSideBarConfig((prev: any) => ({ ...prev, isOpen: false }));
        }}
      >
        <form className="w-full overflow-auto">
          <div className="bg-gray-100 rounded p-3 flex flex-col items-end">
            <p className=" text-sm uppercase">Final Net Pay</p>
            <p className="font-bold text-2xl">
              PHP {amountFormatter(newNetPay)}
            </p>
          </div>

          <div>
            <h2 className="font-medium my-4 text-xl">
              Employee Details | Type - {rowData?.employmentStatus}
            </h2>
            <h3 className="font-medium mb-2 text-base">
              ({rowData.isMonthlyRated ? 'Monthly Rated' : 'Daily Rated'})
            </h3>
            <div className="border-t-2 pt-3 mb-5 grid grid-cols-2 gap-5">
              <div>
                <span className="font-medium">Name: </span>
                <span className="text-blue-500">
                  {rowData.employee?.employee_profile?.employeeFullName}
                </span>
              </div>
              <div>
                <span className="font-medium">Pay Cycle: </span>
                <span className="text-blue-500">{rowData.fullCycleName}</span>
              </div>
              <div>
                <span className="font-medium">Hourly Rate: </span>
                <span className="text-blue-500">
                  Php {amountFormatter(rowData.hourlyRate)}
                </span>
              </div>
              <div>
                <span className="font-medium">Daily Rate: </span>
                <span className="text-blue-500">
                  Php {amountFormatter(rowData.dailyRate)}
                </span>
              </div>
              <div>
                <span className="font-medium">Withholding Tax: </span>
                <span className="text-blue-500">
                  Php {amountFormatter(rowData.withholdingTax)}
                </span>
              </div>
            </div>
          </div>
          <div>
            <div className="flex mr-3 justify-between my-3 items-end">
              <h2 className="font-medium text-xl">Government Remittances</h2>
              <p className="text-blue-500 text-right">
                GOVT REMITTANCES
                <br />
                <span className="font-bold" style={{ fontSize: '20px' }}>
                  PHP{' '}
                  {amountFormatter(
                    rowData.philhealthContribution +
                      rowData.sssContribution +
                      rowData.pagIbigContribution +
                      rowData.sssECShare +
                      rowData.sssERShare +
                      rowData.pagIbigERShare +
                      rowData.philHealthERShare +
                      sssLoan +
                      sssCalamityLoan +
                      pagIbigLoan
                  )}
                </span>
              </p>
            </div>
            <div className="border-t-2 pt-3 grid grid-cols-4 mb-5 gap-5">
              <div>
                <span className="font-medium">PhilHealth Contribution: </span>
                <span className="text-blue-500">
                  Php {amountFormatter(rowData.philhealthContribution)}
                </span>
              </div>
              <div>
                <span className="font-medium">SSS Contribution: </span>
                <span className="text-blue-500">
                  Php {amountFormatter(rowData.sssContribution)}
                </span>
              </div>
              <div>
                <span className="font-medium">Pag-ibig Contribution: </span>
                <span className="text-blue-500">
                  Php {amountFormatter(rowData.pagIbigContribution)}
                </span>
              </div>
              <div>
                <span className="font-medium">SSS EC Share: </span>
                <span className="text-blue-500">
                  Php {amountFormatter(rowData.sssECShare)}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-4 mb-5 gap-5">
              <div>
                <span className="font-medium">SSS ER Share: </span>
                <span className="text-blue-500">
                  Php {amountFormatter(rowData.sssERShare)}
                </span>
              </div>
              <div>
                <span className="font-medium">Pag-ibig ER Share: </span>
                <span className="text-blue-500">
                  Php {amountFormatter(rowData.pagIbigERShare)}
                </span>
              </div>
              <div>
                <span className="font-medium">PhilHealth ER Share: </span>
                <span className="text-blue-500">
                  Php {amountFormatter(rowData.philHealthERShare)}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-4 mb-8 gap-5">
              <div>
                <span className="font-medium">SSS Loan: </span>
                <span className="text-blue-500">
                  Php {amountFormatter(sssLoan)}
                </span>
              </div>
              <div>
                <span className="font-medium">SSS Calamity Loan: </span>
                <span className="text-blue-500">
                  Php {amountFormatter(sssCalamityLoan)}
                </span>
              </div>
              <div>
                <span className="font-medium">HDMF Loan: </span>
                <span className="text-blue-500">
                  Php {amountFormatter(pagIbigLoan)}
                </span>
              </div>
            </div>
          </div>
          <div>
            <div className="flex mr-3 justify-between my-3 items-end">
              <h2 className="font-medium text-xl">Gross Pay Breakdown</h2>
              <p className="text-blue-500 text-right">
                GROSS PAY
                <br />
                <span className="font-bold" style={{ fontSize: '20px' }}>
                  PHP {amountFormatter(rowData.grossPay)}
                </span>
              </p>
            </div>
            <div className="border-t-2 pt-3 mb-8 gap-3">
              <div className="grid grid-cols-4 mb-4 gap-4">
                <div>
                  <span className="font-medium">Total Days Worked: </span>
                  <span className="text-blue-500 block">
                    {rowData.daysWorked}
                  </span>
                </div>

                <div>
                  <span className="font-medium">
                    Worked on Regular Days:{' '}
                    <Tooltip target=".computation-info" />
                    <i
                      className="computation-info pi pi-info-circle p-text-secondary p-overlay-badge text-[17px]"
                      data-pr-tooltip="No. of Days x Daily Rate"
                      data-pr-position="right"
                      data-pr-at="right+5 top"
                      data-pr-my="left center-2"
                      style={{ cursor: 'pointer' }}
                    ></i>
                  </span>
                  <span className="text-blue-500 block">
                    {workedOnRegularDays} days - PHP{' '}
                    {amountFormatter(workedOnRegularDaysPay)}
                  </span>
                </div>
                <div>
                  <span className="font-medium">
                    Worked on Rest Days: <Tooltip target=".computation-info" />
                    <i
                      className="computation-info pi pi-info-circle p-text-secondary p-overlay-badge text-[17px]"
                      data-pr-tooltip={`No. of Days x Daily Rate x ${
                        rowData.restDayRate ? rowData.restDayRate / 100 : 1.3
                      }`}
                      data-pr-position="right"
                      data-pr-at="right+5 top"
                      data-pr-my="left center-2"
                      style={{ cursor: 'pointer' }}
                    ></i>
                  </span>
                  <span className="text-blue-500 block">
                    {workedOnRD} days - PHP{' '}
                    {amountFormatter(
                      workedOnRD *
                        rowData.dailyRate *
                        +(rowData.restDayRate / 100).toFixed(2)
                    )}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-4 mb-4 gap-4">
                <div>
                  <span className="font-medium">Total Regular Holidays: </span>
                  <span className="text-blue-500 block">
                    {rowData.regularHolidays}
                  </span>
                </div>
                <div>
                  <span className="font-medium">
                    Worked on Regular Holiday:{' '}
                    <Tooltip target=".computation-info" />
                    <i
                      className="computation-info pi pi-info-circle p-text-secondary p-overlay-badge text-[17px]"
                      data-pr-tooltip={`No. of Days x Daily Rate x ${
                        rowData.regularHolidayRate
                          ? rowData.regularHolidayRate / 100
                          : 2.0
                      }`}
                      data-pr-position="right"
                      data-pr-at="right+5 top"
                      data-pr-my="left center-2"
                      style={{ cursor: 'pointer' }}
                    ></i>
                  </span>
                  <span className="text-blue-500 block">
                    {workedOnRHD} days - PHP{' '}
                    {amountFormatter(
                      workedOnRHD *
                        rowData.dailyRate *
                        +(rowData.regularHolidayRate / 100).toFixed(2)
                    )}
                  </span>
                </div>
                <div>
                  <span className="font-medium">
                    Worked on Regular Holiday while Rest day:{' '}
                    <Tooltip target=".computation-info" />
                    <i
                      className="computation-info pi pi-info-circle p-text-secondary p-overlay-badge text-[17px]"
                      data-pr-tooltip={`No. of Days x Daily Rate x ${
                        rowData.regularHolidayRestDayRate
                          ? rowData.regularHolidayRestDayRate / 100
                          : 2.6
                      }`}
                      data-pr-position="right"
                      data-pr-at="right+5 top"
                      data-pr-my="left center-2"
                      style={{ cursor: 'pointer' }}
                    ></i>
                  </span>
                  <span className="text-blue-500 block">
                    {workedOnRHDWhileRD} days - PHP{' '}
                    {amountFormatter(
                      workedOnRHDWhileRD *
                        rowData.dailyRate *
                        +(rowData.regularHolidayRestDayRate / 100).toFixed(2)
                    )}
                  </span>
                </div>

                <div>
                  <span className="font-medium">
                    Absent on Regular Holiday:{' '}
                    <Tooltip target=".computation-info" />
                    <i
                      className="computation-info pi pi-info-circle p-text-secondary p-overlay-badge text-[17px]"
                      data-pr-tooltip="No. of Days x Daily Rate x 1"
                      data-pr-position="right"
                      data-pr-at="right+5 top"
                      data-pr-my="left center-2"
                      style={{ cursor: 'pointer' }}
                    ></i>
                  </span>
                  <span className="text-blue-500 block">
                    {rowData.regularHolidaysAbsent + halfdayPresentonRHD * 0.5}{' '}
                    days - PHP{' '}
                    {amountFormatter(
                      (rowData.regularHolidaysAbsent +
                        halfdayPresentonRHD * 0.5) *
                        rowData.dailyRate *
                        1
                    )}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-4 mb-4 gap-4 items-end">
                <div className="w-full">
                  <span className="font-medium">Total Special Holidays: </span>
                  <span className="text-blue-500 block">
                    {rowData.specialHolidays}
                  </span>
                </div>
                <div>
                  <span className="font-medium">
                    Worked on Special Holiday:{' '}
                    <Tooltip target=".computation-info" />
                    <i
                      className="computation-info pi pi-info-circle p-text-secondary p-overlay-badge text-[17px]"
                      data-pr-tooltip={`No. of Days x Daily Rate x ${
                        rowData.specialHolidayRate
                          ? rowData.specialHolidayRate / 100
                          : 1.3
                      }`}
                      data-pr-position="right"
                      data-pr-at="right+5 top"
                      data-pr-my="left center-2"
                      style={{ cursor: 'pointer' }}
                    ></i>
                  </span>
                  <span className="text-blue-500 block">
                    {workedOnSPHD} days - PHP{' '}
                    {amountFormatter(
                      workedOnSPHD *
                        rowData.dailyRate *
                        +(rowData.specialHolidayRate / 100).toFixed(2)
                    )}
                  </span>
                </div>
                <div className="w-full">
                  <span className="font-medium">
                    Worked on Special Holiday while Rest day:{' '}
                    <Tooltip target=".computation-info" />
                    <i
                      className="computation-info pi pi-info-circle p-text-secondary p-overlay-badge text-[17px]"
                      data-pr-tooltip={`No. of Days x Daily Rate x ${
                        rowData.specialHolidayRestDayRate
                          ? rowData.specialHolidayRestDayRate / 100
                          : 1.5
                      }`}
                      data-pr-position="right"
                      data-pr-at="right+5 top"
                      data-pr-my="left center-2"
                      style={{ cursor: 'pointer' }}
                    ></i>
                  </span>
                  <span className="text-blue-500 block">
                    {workedOnSPHDWhileRD} days - PHP{' '}
                    {amountFormatter(
                      +(
                        workedOnSPHDWhileRD *
                        rowData.dailyRate *
                        +(rowData.specialHolidayRestDayRate / 100).toFixed(2)
                      ).toFixed(2)
                    )}
                  </span>
                </div>
                <div>
                  <span className="font-medium">
                    Absent on Special Holiday:
                    <Tooltip target=".computation-info ml-1" />
                    <i
                      className="computation-info pi pi-info-circle p-text-secondary p-overlay-badge text-[17px] ml-1"
                      data-pr-tooltip={
                        rowData.isMonthlyRated &&
                        rowData.employmentStatus == 'Regular'
                          ? `No. of Days x Daily Rate`
                          : rowData.isMonthlyRated &&
                            rowData.employmentStatus != 'Regular'
                          ? `No Pay for Non-Regular Employees`
                          : `No Pay for Daily Rated Employees`
                      }
                      data-pr-position="right"
                      data-pr-at="right+5 top"
                      data-pr-my="left center-2"
                      style={{ cursor: 'pointer' }}
                    ></i>
                  </span>
                  <span className="text-blue-500 block">
                    {rowData.specialHolidaysAbsent + halfdayPresentonSPHD * 0.5}{' '}
                    days - PHP{' '}
                    {rowData.isMonthlyRated &&
                    rowData.employmentStatus == 'Regular'
                      ? amountFormatter(
                          +(
                            (rowData.specialHolidaysAbsent +
                              halfdayPresentonRHD * 0.5) *
                            rowData.dailyRate *
                            1
                          ).toFixed(2)
                        )
                      : amountFormatter(0)}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-4 mb-4 gap-4">
                <div>
                  <span className="font-medium">Total Overtime Hours: </span>
                  <span className="text-blue-500 block">
                    {rowData.overtimeHrs}
                  </span>
                </div>
                <div>
                  <span className="font-medium">
                    Overtime on Regular Days:{' '}
                    <Tooltip target=".computation-info" />
                    <i
                      className="computation-info pi pi-info-circle p-text-secondary p-overlay-badge text-[17px]"
                      data-pr-tooltip="No. of Hours x Overtime on Regular Days Rate"
                      data-pr-position="right"
                      data-pr-at="right+5 top"
                      data-pr-my="left center-2"
                      style={{ cursor: 'pointer' }}
                    ></i>
                  </span>
                  <span className="text-blue-500 block">
                    {OTonRegDays} hours - PHP{' '}
                    {amountFormatter(OTonRegDays * rowData.overtimeRateRegDays)}
                  </span>
                </div>
                <div>
                  <span className="font-medium">
                    Overtime on Holidays:{' '}
                    <i
                      className="computation-info pi pi-info-circle p-text-secondary p-overlay-badge text-[17px]"
                      data-pr-tooltip="No. of Hours x Overtime on Holidays Rate"
                      data-pr-position="right"
                      data-pr-at="right+5 top"
                      data-pr-my="left center-2"
                      style={{ cursor: 'pointer' }}
                    ></i>
                  </span>
                  <span className="text-blue-500 block">
                    {OTonHolidays} hours - PHP{' '}
                    {amountFormatter(
                      OTonHolidays * rowData.overtimeRateHolidays
                    )}
                  </span>
                </div>
                <div>
                  <span className="font-medium">
                    Overtime on Rest Days:{' '}
                    <i
                      className="computation-info pi pi-info-circle p-text-secondary p-overlay-badge text-[17px]"
                      data-pr-tooltip="No. of Hours x Overtime on Rest Days Rate"
                      data-pr-position="right"
                      data-pr-at="right+5 top"
                      data-pr-my="left center-2"
                      style={{ cursor: 'pointer' }}
                    ></i>
                  </span>
                  <span className="text-blue-500 block">
                    {OTonRestDays} hours - PHP{' '}
                    {amountFormatter(
                      OTonRestDays * rowData.overtimeRateRestDays
                    )}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-4 mb-4 gap-4">
                <div>
                  <span className="font-medium">
                    Total Night Differential Hours:{' '}
                  </span>
                  <span className="text-blue-500 block">
                    {rowData.nightDiffHrs}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Night Differential Pay:</span>
                  <span className="text-blue-500 block">
                    PHP {amountFormatter(rowData.nightDiffPay)}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-4 mb-4 gap-4">
                <div>
                  <span className="font-medium">Total Approved Leaves: </span>
                  <span className="text-blue-500 block">
                    {totalApprovedLeaves}
                  </span>
                </div>

                <div>
                  <span className="font-medium">Approved Leaves Pay: </span>
                  <span className="text-blue-500 block">
                    PHP {amountFormatter(approvedLeavesPay)}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-4 mb-4 gap-4">
                <div>
                  <span className="font-medium">Total Undertime Hours: </span>
                  <span className="text-blue-500 block">
                    {convertMinsToHours({
                      minutes: rowData.undertimeHrs * 60,
                      withUnit: true,
                    })}
                  </span>
                </div>

                <div>
                  <span className="font-medium">Undertime Deduction: </span>
                  <span className="text-blue-500 block">
                    PHP {amountFormatter(rowData.undertimePay)}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-4 mb-4 gap-4">
                <div>
                  <span className="font-medium">Total Late Hours: </span>
                  <span className="text-blue-500 block">
                    {convertMinsToHours({
                      minutes: rowData.lateHrs * 60,
                      withUnit: true,
                    })}
                  </span>
                </div>

                <div>
                  <span className="font-medium">Late Deduction: </span>
                  <span className="text-blue-500 block">
                    PHP {amountFormatter(rowData.latePay)}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-4 mb-4 gap-4">
                <div>
                  <span className="font-medium">Allowance: </span>
                  <span className="text-blue-500 block">
                    PHP {amountFormatter(rowData.allowance)}
                  </span>
                </div>
              </div>
            </div>
            <div className="mb-5">
              <p className="font-medium">
                Gross Pay:{' '}
                <span className="text-blue-500">
                  PHP {amountFormatter(rowData.grossPay)}
                </span>
              </p>
              <p className="text-blue-500">
                (Worked on Regular Days + Worked on Rest Days + Worked on
                Regular Holiday + Worked on Regular Holiday while Rest day +
                Absent on Regular Holiday + Worked on Special Holiday + Worked
                on Special Holiday while Rest day + Overtime on Regular Days +
                Overtime on Holidays + Overtime on Rest Days + Approved Leaves
                Pay + Allowance + Night Differential) - (Undertime Deduction +
                Late Deduction)
              </p>
            </div>
          </div>

          <div>
            <div className="flex mr-3 justify-between my-3 items-end">
              <h2 className="font-medium text-xl">
                Loan Deductions Management
              </h2>
              <p className="text-blue-500 text-right">
                LOAN DEDUCTIONS
                <br />
                <span className="font-bold" style={{ fontSize: '20px' }}>
                  PHP {amountFormatter(totalLoanDeductions)}
                </span>
              </p>
            </div>
            <div className="border-t-2 pt-3 mb-8">
              <DeductionsGrid
                rowData={rowData}
                refetchDataFromParent={() => null}
                setDeductionsData={setDeductionsData}
                isEditable={isEditable}
              />
            </div>
          </div>
          <div className="mb-5">
            <div className="flex mr-3 justify-between my-3 items-end">
              <h2 className="font-medium text-xl">Adjustments</h2>
              <p className="text-blue-500 text-right">
                ADJUSTMENTS
                <br />
                <span className="font-bold" style={{ fontSize: '20px' }}>
                  PHP {amountFormatter(adjustments)}
                </span>
              </p>
            </div>
            <div className="border-t-2 pt-3 grid grid-cols-8 gap-5">
              <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto">
                <label className="my-1">
                  <span>Add Adjustments</span>
                </label>
                <input
                  // type="number"
                  min={0}
                  defaultValue={0}
                  className="p-inputtext p-component w-full md:w-14rem md:w-14rem"
                  // onFocus={() => setIsDisabled(true)}
                  onInput={(e) => {
                    // Remove any non-numeric characters except the dot
                    let value = e.currentTarget.value;
                    value = value.replace(/[^\d.]/g, '');
                    // Ensure only one dot exists
                    value = value.replace(/(\..*)\./g, '$1');
                    // Ensure only up to two decimal places
                    const parts = value.split('.');
                    if (parts[1] && parts[1].length > 2) {
                      value = `${parts[0]}.${parts[1].slice(0, 2)}`;
                    }
                    // Update the state or context value
                    setValue('addAdjustment', value);
                  }}
                  {...register('addAdjustment')}
                  // onBlur={() => setIsDisabled(false)}
                  disabled={!isEditable || isDeduct}
                />
                {/* <Controller
                  name="addAdjustment"
                  control={control}
                  render={({ field, fieldState }) => (
                    <div>
                      <InputNumber
                        disabled={rowData.isPosted}
                        min={0}
                        id={field.name}
                        ref={field.ref}
                        value={field.value}
                        onBlur={field.onBlur}
                        onChange={(e) => field.onChange(e.value)}
                        className={classNames({
                          'p-invalid': fieldState.error,
                        })}
                        maxFractionDigits={2}
                      />
                      {errors.addAdjustment && (
                        <span className="text-red-600 text-sm">
                          {errors.addAdjustment.message}
                        </span>
                      )}
                    </div>
                  )}
                /> */}
              </div>
              <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto">
                <label className="my-1">
                  <span>Deduct Adjustments</span>
                </label>
                <input
                  // type="number"
                  min={0}
                  defaultValue={0}
                  className="p-inputtext p-component w-full md:w-14rem md:w-14rem"
                  onInput={(e) => {
                    // Remove any non-numeric characters except the dot
                    let value = e.currentTarget.value;
                    value = value.replace(/[^\d.]/g, '');
                    // Ensure only one dot exists
                    value = value.replace(/(\..*)\./g, '$1');
                    // Ensure only up to two decimal places
                    const parts = value.split('.');

                    if (parts[1] && parts[1].length > 2) {
                      value = `${parts[0]}.${parts[1].slice(0, 2)}`;
                    }

                    // Update the state or context value
                    setValue('deductAdjustment', value);
                  }}
                  {...register('deductAdjustment')}
                  disabled={!isEditable || isAdd}
                />
                {/* <Controller
                  name="deductAdjustment"
                  control={control}
                  render={({ field, fieldState }) => (
                    <div>
                      <InputNumber
                        disabled={rowData.isPosted}
                        min={0}
                        id={field.name}
                        ref={field.ref}
                        value={field.value}
                        onBlur={field.onBlur}
                        onChange={(e) => field.onChange(e.value)}
                        className={classNames({
                          'p-invalid': fieldState.error,
                        })}
                      />
                      {errors.deductAdjustment && (
                        <span className="text-red-600 text-sm">
                          {errors.deductAdjustment.message}
                        </span>
                      )}
                    </div>
                  )}
                /> */}
              </div>
              <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto col-span-3 ml-[25px]">
                <label className="my-1">
                  <span className="text-red-500">*</span>
                  <span>Short Description (Maximum of 20 Characters)</span>
                </label>
                <InputText
                  maxLength={20}
                  {...register('shortDescription')}
                  name="shortDescription"
                  placeholder="Enter short description"
                  disabled={!isEditable}
                ></InputText>
              </div>
              <div className="adjustment-add col-span-3 ml-[25px] flex-auto self-end rounded-xl">
                <Button
                  onClick={(e) => {
                    if (adjustmentData.length < 4) {
                      setAdjustmentData([
                        ...adjustmentData,
                        {
                          payrollAdjustmentsId: null,
                          addAdjustment: +watch('addAdjustment'),
                          deductAdjustment: +watch('deductAdjustment'),
                          desc: watch('shortDescription'),
                          isEdited: false,
                        },
                      ]);
                      setValue('addAdjustment', '0.00');
                      setValue('deductAdjustment', '0.00');
                      setValue('shortDescription', '');
                    } else {
                      toast.current?.replace({
                        severity: 'error',
                        summary: 'Limit Reached',
                        detail: 'A maximum of 4 adjustments can only be added',
                        sticky: true,
                        closable: true,
                      });
                    }
                  }}
                  className="add-adjustment-button"
                  type="button"
                  color="#000000"
                  disabled={
                    watch('shortDescription') === '' ||
                    (parseFloat(watch('addAdjustment')) <= 0 &&
                      parseFloat(watch('deductAdjustment')) <= 0) ||
                    (watch('deductAdjustment') == '' &&
                      watch('addAdjustment') == '')
                  }
                >
                  Add
                </Button>
              </div>

              {/* <Button
                className="w-[70px]"
                title="Clear"
                onClick={(e) => {
                  e.preventDefault();

                  setValue('deductAdjustment', 0);
                  setValue('addAdjustment', 0);
                }}
              >
                Clear
              </Button> */}
            </div>
            <div className="pt-3">
              <DataTable
                value={adjustmentData.sort((a: any, b: any) => {
                  if (a.payrollAdjustmentsId == null) return 0;
                  if (a.payrollAdjustmentsId < b.payrollAdjustmentsId)
                    return -1;
                  if (a.payrollAdjustmentsId > b.payrollAdjustmentsId) return 1;
                  return 0;
                })}
                frozenWidth="95rem"
                scrollable={true}
                // tableStyle={{ minWidth: '90rem' }}
                size="small"
                scrollHeight="650px"
                selectionMode={isEditable ? undefined : 'single'}
                // onSelectionChange={(e: any) => editItem(e.value)}
              >
                <Column
                  header="Add Adjustment"
                  body={(row) => {
                    return 'PHP ' + amountFormatter(row.addAdjustment);
                  }}
                  style={{ width: '250px' }}
                />
                <Column
                  header="Deduct Adjustment"
                  body={(row) => {
                    return 'PHP ' + amountFormatter(row.deductAdjustment);
                  }}
                  style={{ width: '250px' }}
                />
                <Column
                  header="Short Description"
                  body={(row) => {
                    return row.desc;
                  }}
                />
                <Column
                  field="status"
                  header="Status"
                  hidden={rowData.isPosted}
                  body={(row, { rowIndex }) => (
                    <>
                      <div className="flex flex-nowrap gap-2">
                        <Tag
                          value={
                            row.isEdited
                              ? 'EDITED'
                              : row.payrollAdjustmentsId === null
                              ? 'UNSAVED'
                              : 'SAVED'
                          }
                          severity={
                            row.isEdited
                              ? 'danger'
                              : row.payrollAdjustmentsId === null
                              ? 'danger'
                              : 'success'
                          }
                        ></Tag>
                      </div>
                    </>
                  )}
                />
                <Column
                  field="actions"
                  header="Actions"
                  hidden={!isEditable}
                  body={(row, { rowIndex }) => (
                    <>
                      <div className="flex flex-nowrap gap-2">
                        <Button
                          type="button"
                          text
                          severity="secondary"
                          icon="pi pi-file-edit"
                          tooltip="Edit"
                          tooltipOptions={{ position: 'top' }}
                          onClick={() => {
                            setSelectedIndex(rowIndex);
                            setEditDialog(true);
                          }}
                        />
                        <Button
                          type="button"
                          text
                          severity="secondary"
                          icon="pi pi-trash"
                          tooltip="Remove"
                          tooltipOptions={{ position: 'top' }}
                          onClick={() => {
                            setAdjustmentData((previous: any) => {
                              return previous.filter(
                                (item: any, i: number) => i !== rowIndex
                              );
                            });
                          }}
                        />
                      </div>
                    </>
                  )}
                />
              </DataTable>
            </div>
          </div>
          <div></div>

          <div className="my-5">
            <div className="flex mr-3 justify-between my-3 items-end">
              <h2 className="font-medium text-xl">Wage Summary</h2>
            </div>
            <div className="border-t-2 pt-3 mb-8 gap-3">
              <div className="flex flex-col mb-4 gap-5">
                <div>
                  <p className="font-medium">
                    Employee Govt Contribution:
                    <span className="text-blue-500">
                      {' '}
                      PHP{' '}
                      {amountFormatter(
                        rowData.sssContribution +
                          rowData.pagIbigContribution +
                          rowData.philhealthContribution
                      )}
                    </span>
                  </p>
                  <span className="text-blue-500">
                    PhilHealth Contribution + SSS Contribution + Pag-ibig
                    Contribution
                  </span>
                </div>
              </div>
              <div>
                <div>
                  <p className="font-medium">
                    Net Pay:{' '}
                    <span className="text-blue-500">
                      {' '}
                      PHP {amountFormatter(newNetPay)}
                    </span>
                  </p>
                  <span className="text-blue-500">
                    Gross Pay - (Employee Govt Contribution + Loan Deductions +
                    Withholding Tax) + Adjustments
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-2 w-full mb-5">
            <h2 className="font-medium my-3 text-xl">Remarks</h2>
            <InputTextarea
              className="w-full md:w-14rem"
              placeholder="Place your remarks here"
              {...register('remarks')}
              name="remarks"
              disabled={!isEditable}
            />
          </div>

          <div className="w-full flex justify-end">
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
            {isEditable && (
              <Button
                label={'Update'}
                className="rounded-full px-10 p-button"
                onClick={handleSubmit(handleUpdate)}
                disabled={isSubmitting}
              />
            )}
          </div>
        </form>
        <EditAdjustmentDialog
          setForceRefresher={setForceRefresher}
          editDialog={editDialog}
          setEditDialog={setEditDialog}
          rowIndex={selectedIndex}
          adjustmentData={adjustmentData}
          setAdjustmentData={setAdjustmentData}
          forceRefresher={forceRefresher}
        ></EditAdjustmentDialog>
      </Sidebar>
    </>
  );

  function actionTemplate() {
    return (
      <div className="flex flex-nowrap gap-2">
        <Button
          type="button"
          text
          severity="secondary"
          icon="pi pi-file-edit"
          tooltip="Edit"
          tooltipOptions={{ position: 'top' }}
        />
      </div>
    );
  }
};

export default EditPayrollSidebar;
