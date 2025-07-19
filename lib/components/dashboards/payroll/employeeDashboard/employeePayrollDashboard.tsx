'use client';

import React, { useEffect, useRef, useState, useContext } from 'react';
import ExcelJS from 'exceljs';

import { Button } from 'primereact/button';
import { Column } from 'primereact/column';

import DashboardNav from 'lib/components/blocks/dashboardNav';
import { Paginator } from 'primereact/paginator';
import { DataTable } from 'primereact/datatable';
import { useQueries } from '@tanstack/react-query';
import axios from 'axios';
import { Toast } from 'primereact/toast';
import { GlobalContainer } from 'lib/context/globalContext';
import { ProgressSpinner } from 'primereact/progressspinner';
import { addS, amountFormatter, properCasing } from '@utils/helper';
import moment from '@constant/momentTZ';
import {
  View,
  Text,
  PDFDownloadLink,
  Page,
  StyleSheet,
  Document,
} from '@react-pdf/renderer';
import ErrorDialog from 'lib/components/blocks/errorDialog';
import { ellipsisize } from '@utils/stringHelper';

const EmployeePayrollDashboard = () => {
  const toast = useRef<Toast>(null);
  const downloadPayslipRef: any = useRef<any>(null);
  const context = useContext(GlobalContainer);
  const [payrollId, setPayrollId] = useState('');
  const [payrollReports, setPayrollReports] = useState<any>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const Filename = useRef('');
  const [pagination, setPagination] = useState({
    offset: 0,
    limit: 5,
    first: 0,
  });

  const { limit, offset, first } = pagination;

  const [payrollQuery, employeeQuery] = useQueries({
    queries: [
      {
        refetchOnWindowFocus: false,
        queryKey: ['payrolls', pagination, searchQuery],
        queryFn: async () => {
          const response = await axios.get(
            `/api/employeePayroll?limit=${limit}&offset=${offset}&search=${searchQuery}`,
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
        queryKey: ['employeeData'],
        queryFn: async () => {
          const response = await axios.get(
            `/api/employeePayroll/employee/${context?.userData.employeeId}`,
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

  // async function downloadPayroll(rowData: any) {
  //   setPayrollId(rowData.payroll_id);

  //   let employee: any = null;
  //   try {
  //     let res = await axios.get(
  //       `/api/attendances/employees/report?businessMonth=${rowData.businessMonth}&cycle=${rowData.cycle}&employeeId=${rowData.employeeId}&companyId=${rowData.companyId}`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
  //         },
  //       }
  //     );
  //     employee = res.data;
  //   } catch (err) {
  //     console.log('error retrieving data:' + err);
  //   }

  //   rowData.employee = employee;
  //   console.log(employee);
  //   const adjustment = rowData.addAdjustment - rowData.deductAdjustment;
  //   // const totalPay = rowData.grossPay + adjustment;
  //   const workbook = new ExcelJS.Workbook();
  //   // const philhealth = rowData.philhealthContribution;
  //   const workedOnRD = employee?.attendances?.filter((i: any) => {
  //     if (i.isPresent && !i.holiday) {
  //       return employee?.daysOff?.includes(moment(i.date).format('dddd'));
  //     }
  //   }).length;

  //   const workedOnSPHD = employee?.attendances?.filter((i: any) => {
  //     if (i.isPresent && i.holiday && i.holiday.holidayType == 'Special') {
  //       return !employee?.daysOff?.includes(moment(i.date).format('dddd'));
  //     }
  //   }).length;

  //   const workedOnSPHDWhileRD = employee?.attendances?.filter((i: any) => {
  //     if (i.isPresent && i.holiday && i.holiday.holidayType == 'Special') {
  //       return employee?.daysOff?.includes(moment(i.date).format('dddd'));
  //     }
  //   }).length;

  //   const workedOnRHD = employee?.attendances?.filter((i: any) => {
  //     if (i.isPresent && i.holiday && i.holiday.holidayType == 'Regular') {
  //       return !employee?.daysOff?.includes(moment(i.date).format('dddd'));
  //     }
  //   }).length;

  //   const workedOnRHDWhileRD = employee?.attendances?.filter((i: any) => {
  //     if (i.isPresent && i.holiday && i.holiday.holidayType == 'Regular') {
  //       return employee?.daysOff?.includes(moment(i.date).format('dddd'));
  //     }
  //   }).length;

  //   // GET SSS LOANS
  //   // const sssLoans = rowData.payroll_deductions.map((payrollDeduction: any) => {
  //   //   if (
  //   //     payrollDeduction.deduction.deductionType === 'SSS Loan' &&
  //   //     payrollDeduction.deduction.isPosted === true
  //   //   ) {
  //   //     return payrollDeduction.amountPaid;
  //   //   }
  //   //   return 0;
  //   // });
  //   // const sssLoan = sssLoans.reduce(
  //   //   (total: number, amount: number) => total + amount,
  //   //   0
  //   // );

  //   // GET CASH ADVANCE
  //   // const cashAdvances = rowData.payroll_deductions.map(
  //   //   (payrollDeduction: any) => {
  //   //     if (
  //   //       payrollDeduction.deduction.deductionType === 'Cash Advance' &&
  //   //       payrollDeduction.deduction.isPosted === true &&
  //   //       payrollDeduction.deduction.transfer_to_employee_acct_transaction
  //   //         .disbursementStatus === true
  //   //     ) {
  //   //       return payrollDeduction.deduction.amountPaid;
  //   //     }
  //   //     return 0;
  //   //   }
  //   // );
  //   // const cashAdvance = cashAdvances.reduce(
  //   //   (total: number, amount: number) => total + amount,
  //   //   0
  //   // );
  //   const cashAdvanceSum = rowData.payroll_deductions
  //     .filter((deduc: any) => {
  //       // Add conditions for filtering
  //       return (
  //         deduc.deduction.deductionType === 'Cash Advance' &&
  //         deduc.deduction.isPosted === true &&
  //         deduc.deduction.transfer_to_employee_acct_transaction
  //           ?.disbursementStatus === true
  //       );
  //     })
  //     .reduce((sum: number, deduc: any) => {
  //       // Accumulate the sum of amountPaid
  //       return sum + deduc.deduction.amountPaid;
  //     }, 0);

  //   // GET HDMF LOANS
  //   // const HDMFLoans = rowData.payroll_deductions.map(
  //   //   (payrollDeduction: any) => {
  //   //     if (
  //   //       payrollDeduction.deduction.deductionType === 'HDMF Loan' &&
  //   //       payrollDeduction.deduction.isPosted === true
  //   //     ) {
  //   //       return payrollDeduction.amountPaid;
  //   //     }
  //   //     return 0;
  //   //   }
  //   // );

  //   // const HDMFLoan = HDMFLoans.reduce(
  //   //   (total: number, amount: number) => total + amount,
  //   //   0
  //   // );
  //   // const earnings = totalPay - rowData.totalDeduction;
  //   const worksheet = workbook.addWorksheet('Monthly Payroll');

  //   // CELL FORMAT
  //   worksheet.getColumn(1).width = 30;
  //   worksheet.getColumn(2).width = 30;

  //   const earningsData = [
  //     ['PAYSLIP', ''],
  //     [
  //       'Employee Name',
  //       `${employeeQuery.data.message?.employee_profile?.employeeFullName}`,
  //     ],
  //     ['Payroll Month', `${rowData.businessMonth}`],
  //     ['Cycle', `${rowData.cycle}`],
  //     ['Total Days Worked', `${rowData.daysWorked.toString()} days`],
  //     ['', ''],
  //     ['PAY DESCRIPTION', 'TOTAL'],
  //     [
  //       `Reg. Days (${
  //         rowData.daysWorked -
  //         (workedOnRD + workedOnRHDWhileRD + workedOnSPHD + workedOnSPHDWhileRD)
  //       } day${addS(
  //         rowData.daysWorked -
  //           (workedOnRD +
  //             workedOnRHDWhileRD +
  //             workedOnSPHD +
  //             workedOnSPHDWhileRD)
  //       )})`,
  //       `${
  //         rowData.daysWorked -
  //         (workedOnRD +
  //           workedOnRHDWhileRD +
  //           workedOnSPHD +
  //           workedOnSPHDWhileRD) *
  //           rowData.dailyRate
  //       }`,
  //     ],
  //     [
  //       `Rest Days (${workedOnRD} day${addS(workedOnRD)}):`,
  //       `${workedOnRD * rowData.dailyRate * 1.3}`,
  //     ],
  //     [
  //       `OT (${rowData.overtimeHrs} hr${addS(rowData.overtimeHrs)})`,
  //       `${rowData.overtimePay}`,
  //     ],
  //     [
  //       `Reg. Holidays (${rowData.regularHolidays} day${addS(
  //         rowData.regularHolidays
  //       )})`,
  //       `${rowData.regularHolidaysPay}`,
  //     ],
  //     [
  //       `Spec. Holidays (${rowData.specialHolidays} day${addS(
  //         rowData.specialHolidays
  //       )})`,
  //       `${rowData.specialHolidaysPay}`,
  //     ],
  //     [
  //       `Leaves (${
  //         rowData.sickLeaveDays +
  //         rowData.vacationLeaveDays +
  //         rowData.soloParentLeaveDays +
  //         rowData.paternityLeaveDays +
  //         rowData.maternityLeaveDays +
  //         rowData.serviceIncentiveLeaveDays
  //       } day${addS(
  //         rowData.sickLeaveDays +
  //           rowData.vacationLeaveDays +
  //           rowData.soloParentLeaveDays +
  //           rowData.paternityLeaveDays +
  //           rowData.maternityLeaveDays +
  //           rowData.serviceIncentiveLeaveDays
  //       )})`,
  //       `${
  //         (rowData.sickLeaveDays +
  //           rowData.vacationLeaveDays +
  //           rowData.soloParentLeaveDays +
  //           rowData.paternityLeaveDays +
  //           rowData.maternityLeaveDays +
  //           rowData.serviceIncentiveLeaveDays) *
  //         rowData.dailyRate
  //       }`,
  //     ],
  //     // [
  //     //   `Rest Days (${workedOnRD} day${addS(workedOnRD)}):`,
  //     //   `${workedOnRD * rowData.dailyRate * 1.3}`,
  //     // ],
  //     ['Daily Allowance', `${rowData.allowance}`],
  //     ['Adjustments', `${adjustment}`],
  //     // ['TOTAL PAY', `${totalPay}`],
  //     ['Gross Pay', `${rowData.grossPay}`],
  //     ['', ''],
  //     // ['DEDUCTIONS', ``],
  //     ['DEDUCTION DESCRIPTION', `TOTAL`],
  //     [
  //       `Absence (${rowData.daysAbsent} day${addS(rowData.daysAbsent)})`,
  //       `${rowData.daysAbsent * rowData.dailyRate}`,
  //     ],
  //     [
  //       `Late (${rowData.lateHrs} hr${addS(rowData.lateHrs)})`,
  //       `${rowData.latePay}`,
  //     ],
  //     [
  //       `Undertime (${rowData.undertimeHrs} hrs${addS(rowData.undertimeHrs)})`,
  //       `${rowData.undertimePay}`,
  //     ],
  //     ['SSS', `${rowData.sssContribution}`],
  //     // ['Cash Advance', '0'],
  //     ['Philhealth', `${rowData.philhealthContribution}`],
  //     ['Pag-ibig', `${rowData.pagIbigContribution}`],
  //     // ['HDMF', `${rowData.pagIbigContribution}`],
  //     ['Cash Advance', `${cashAdvanceSum}`],
  //     // ['SSS LOANS', `${sssLoan}`],
  //     // ['HDMF LOANS', `${HDMFLoan}`],
  //     ['Withholding Tax', `${rowData.withholdingTax}`],
  //     ['TOTAL DEDUCTION', `${rowData.totalDeduction}`],
  //     ['', ''],
  //     ['EARNINGS', `${rowData.netPay}`],
  //   ];

  //   // CELL COLORS
  //   const customFillColors = [
  //     { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFA9A9A9' } },
  //     null,
  //     null,
  //     null,
  //     null,
  //     null,
  //     { type: 'pattern', pattern: 'solid', fgColor: { argb: 'B2BEB5' } },
  //     null,
  //     null,
  //     null,
  //     null,
  //     null,
  //     null,
  //     null,
  //     null,
  //     null,
  //     null,
  //     { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFA9A9A9' } },
  //     null,
  //     null,
  //     null,
  //     null,
  //     null,
  //     null,
  //     null,
  //     null,
  //     null,
  //     null,
  //     { type: 'pattern', pattern: 'solid', fgColor: { argb: '9ACD32' } },
  //   ] as Array<{
  //     type: 'pattern';
  //     pattern: 'solid';
  //     fgColor: { argb: string };
  //   } | null>;

  //   earningsData.forEach((row, rowIndex) => {
  //     const newRow = worksheet.addRow(row);
  //     const customFillColor = customFillColors[rowIndex];

  //     if (customFillColor) {
  //       newRow.eachCell({ includeEmpty: true }, (cell) => {
  //         cell.fill = customFillColor;
  //         cell.alignment = { horizontal: 'center' };
  //       });
  //     } else {
  //       newRow.eachCell({ includeEmpty: true }, (cell) => {
  //         cell.alignment = { horizontal: 'center' };
  //       });
  //     }

  //     /// CHANGE VALUE TO PHP FORMAT
  //     const cellValue = row[1];
  //     if (!isNaN(parseFloat(cellValue)) && !cellValue.includes('day')) {
  //       newRow.getCell(2).value = parseFloat(cellValue);
  //       newRow.getCell(2).numFmt = '#,##0.00 [$PHP-410]';
  //     }
  //   });

  //   // CELL MERGE
  //   worksheet.mergeCells('A1:B1');
  //   worksheet.mergeCells('A18:A18');

  //   const workbookBuffer = workbook.xlsx.writeBuffer();
  //   workbookBuffer.then((buffer) => {
  //     const blob = new Blob([buffer], {
  //       type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  //     });
  //     const url = URL.createObjectURL(blob);
  //     const a = document.createElement('a');
  //     a.href = url;
  //     a.download = `${rowData.businessMonth}_Payroll.xlsx`;
  //     a.click();
  //   });
  // }
  return (
    <div className="w-screen h-screen overflow-auto p-5">
      <Toast ref={toast} position="bottom-left" />
      {/* DASHBOARD NAV */}
      <DashboardNav
        navTitle="Payroll"
        buttons={[]}
        isShowSearch={true}
        setValueSearchText={setSearchQuery}
        valueSearchText={searchQuery}
        searchPlaceholder=""
      />

      {/* MAIN CONTENT */}
      <div className="line-container rounded-lg p-5">
        <React.Fragment>
          {payrollQuery.isLoading ? (
            <div className="w-full flex justify-center">
              <ProgressSpinner />
            </div>
          ) : payrollQuery.error ? (
            <ErrorDialog />
          ) : (
            <DataTable
              value={payrollQuery?.data?.message?.rows}
              scrollable={true}
              tableStyle={{ minWidth: '40rem' }}
            >
              <Column field="businessMonth" header="Business Month" />
              <Column field="cycle" header="Pay Cycle" />
              <Column
                field="status"
                header="Status"
                body={(data) => {
                  if (data.isPosted) {
                    return (
                      <span className="block text-center max-w-[160px] py-2 px-5 rounded-full bg-green-200 text-green-700">
                        POSTED
                      </span>
                    );
                  } else {
                    return (
                      <span className="block text-center max-w-[160px] py-2 px-5 rounded-full bg-orange-200 text-orange-700">
                        PENDING
                      </span>
                    );
                  }
                }}
              />
              <Column
                field="actions"
                header="Actions"
                body={(data) => {
                  return (
                    <div className="flex flex-nowrap gap-2">
                      {data.isPosted && (
                        <Button
                          type="button"
                          text
                          icon="pi pi-download"
                          tooltip="Download"
                          tooltipOptions={{ position: 'top' }}
                          // disabled={!data.isPosted}
                          onClick={async () => {
                            Filename.current = data.businessMonthCycle;
                            try {
                              if (!data.isPosted) {
                                toast.current?.replace({
                                  severity: 'error',
                                  summary: 'Payroll is not yet posted',
                                  sticky: true,
                                  closable: true,
                                });
                                return;
                              }
                              toast.current?.replace({
                                severity: 'info',
                                summary: 'Generating Payslip',
                                sticky: true,
                                closable: false,
                              });
                              const payslipData = await axios.get(
                                `/api/employeePayroll/report?businessMonthCycle=${data.businessMonthCycle}&employeeId=${data.employeeId}&isDirect=${data.isDirect}`,
                                {
                                  headers: {
                                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
                                  },
                                }
                              );
                              if (
                                payslipData.data &&
                                payslipData?.data?.payrollReport &&
                                payslipData?.data?.payrollReport?.length > 0
                              ) {
                                setPayrollReports(
                                  payslipData.data.payrollReport
                                );
                                setTimeout(() => {
                                  downloadPayslipRef.current.click();
                                }, 2000);
                              }
                            } catch (error: any) {
                              toast.current?.replace({
                                severity: 'error',
                                summary: error.message,
                                sticky: true,
                                closable: true,
                              });
                            }

                            // downloadPayroll(data);
                          }}
                        />
                      )}
                    </div>
                  );
                }}
              />
            </DataTable>
          )}
          <Paginator
            first={first}
            rows={limit}
            totalRecords={payrollQuery && payrollQuery.data?.message?.count}
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

          {payrollReports && payrollReports.length > 0 && (
            <PDFDownloadLink
              className="w-full"
              document={
                <Document>
                  <Page
                    size="LETTER"
                    style={{
                      fontSize: 9,
                      paddingLeft: 5,
                      paddingRight: 0,
                      paddingVertical: 10,
                    }}
                  >
                    <View
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        justifyContent: 'flex-start',
                      }}
                    >
                      {payrollReports.map((data: any, index: number) => {
                        let workedOnRD = data?.workedOnRestDays;
                        let workedOnSPHD = data?.workedOnSpecialHoliday;
                        let workedOnSPHDWhileRD =
                          data?.workedOnSpecialHolidayWhileRestDay;
                        let workedOnRHD = data?.workedOnRegularHoliday;
                        let workedOnRHDWhileRD =
                          data?.workedOnRegularHolidayWhileRestDay;
                        let halfdayPresentonRHD =
                          data?.halfDayPresentOnRegularHoliday;
                        let halfdayPresentonSPHD =
                          data?.halfDayPresentOnSpecialHoliday;
                        let OTonRegDays = data?.overtimeOnRegularDays;
                        let OTonHolidays = data?.overtimeOnHolidays;
                        let OTonRestDays = data?.overtimeOnRestDays;

                        const hasAllowanceBreakdown =
                          !!data.employee?.allowance_breakdown?.allowanceBreakdownId;

                        let allowanceBreakdownsData = [];

                        if (
                          hasAllowanceBreakdown &&
                          data.employee?.allowance_breakdown != null
                        ) {
                          const types =
                            data.employee?.allowance_breakdown?.allowanceType.split(
                              ','
                            );
                          const monthlyAmounts =
                            data.employee?.allowance_breakdown?.monthlyAmounts.split(
                              ','
                            );
                          const dailyAmounts =
                            data.employee?.allowance_breakdown?.dailyAmounts.split(
                              ','
                            );

                          for (let i = 0; i < types.length; i++) {
                            allowanceBreakdownsData.push({
                              type: types[i],
                              monthlyAmount: monthlyAmounts[i],
                              dailyAmount: dailyAmounts[i],
                            });
                          }
                        }

                        const cashAdvanceSum = data.payroll_deductions
                          .filter((deduc: any) => {
                            // Add conditions for filtering
                            return (
                              deduc.deduction.deductionType ===
                                'Cash Advance' &&
                              deduc.deduction.isPosted === true &&
                              deduc.deduction
                                .transfer_to_employee_acct_transaction
                                ?.disbursementStatus === true
                            );
                          })
                          .reduce((sum: number, deduc: any) => {
                            // Accumulate the sum of amountPaid
                            return sum + deduc.amountPaid;
                          }, 0);
                        const sssLoanSum = data.payroll_deductions
                          .filter((deduc: any) => {
                            // Add conditions for filtering
                            return (
                              deduc.deduction.deductionType === 'SSS Loan' &&
                              !deduc.isDeferred &&
                              deduc.deduction.isPosted === true
                            );
                          })
                          .reduce((sum: number, deduc: any) => {
                            // Accumulate the sum of amountPaid
                            return sum + deduc.amountPaid;
                          }, 0);

                        const sssCalamityLoanSum = data.payroll_deductions
                          .filter((deduc: any) => {
                            // Add conditions for filtering
                            return (
                              deduc.deduction.deductionType ===
                                'SSS Calamity Loan' &&
                              !deduc.isDeferred &&
                              deduc.deduction.isPosted === true
                            );
                          })
                          .reduce((sum: number, deduc: any) => {
                            // Accumulate the sum of amountPaid
                            return sum + deduc.amountPaid;
                          }, 0);

                        const pagIbigLoanSum = data.payroll_deductions
                          .filter((deduc: any) => {
                            // Add conditions for filtering
                            return (
                              deduc.deduction.deductionType === 'HDMF Loan' &&
                              !deduc.isDeferred &&
                              deduc.deduction.isPosted === true
                            );
                          })
                          .reduce((sum: number, deduc: any) => {
                            // Accumulate the sum of amountPaid
                            return sum + deduc.amountPaid;
                          }, 0);
                        const salaryLoanSum = data.payroll_deductions // Disabled Salary Loans
                          .filter((deduc: any) => {
                            // Add conditions for filtering
                            return (
                              deduc.deduction.deductionType === 'Salary Loan' &&
                              !deduc.isDeferred &&
                              deduc.deduction.isPosted === true
                            );
                          })
                          .reduce((sum: number, deduc: any) => {
                            // Accumulate the sum of amountPaid
                            return sum + deduc.amountPaid;
                          }, 0);

                        // const ledgerSum = data.payroll_deductions // Disabled Salary Loans
                        //   .filter((deduc: any) => {
                        //     // Add conditions for filtering
                        //     return (
                        //       deduc.deduction.deductionType === 'Ledger' &&
                        //       !deduc.isDeferred &&
                        //       deduc.deduction.isPosted === true
                        //     );
                        //   })
                        //   .reduce((sum: number, deduc: any) => {
                        //     // Accumulate the sum of amountPaid
                        //     return sum + deduc.amountPaid;
                        //   }, 0);

                        const otherDeductions = data.payroll_deductions.filter(
                          (deduc: any) => {
                            // Add conditions for filtering
                            return (
                              deduc.deduction.deductionType === 'Other' &&
                              !deduc.isDeferred &&
                              deduc.deduction.isPosted === true
                            );
                          }
                        );
                        const otherSum = otherDeductions.reduce(
                          (sum: number, deduc: any) => {
                            // Accumulate the sum of amountPaid
                            return sum + deduc.amountPaid;
                          },
                          0
                        );
                        let otherBreakdownArr = [];
                        for (let i = 0; i < otherDeductions.length; i++) {
                          if (otherDeductions[i].deduction.ledgers) {
                            for (
                              let j = 0;
                              j < otherDeductions[i].deduction.ledgers.length;
                              j++
                            ) {
                              otherBreakdownArr.push(
                                otherDeductions[i].deduction.ledgers[j]
                              );
                            }
                          }
                        }
                        // sum up all adjustments total
                        const adjustmentSum = data.payroll_adjustments
                          ? data?.payroll_adjustments.reduce(
                              (sum: number, adjustment: any) => {
                                return (
                                  sum +
                                    adjustment.addAdjustment -
                                    adjustment.deductAdjustment || 0
                                );
                              },
                              0
                            )
                          : 0;
                        const styles = StyleSheet.create({
                          paragrah: {
                            gap: 3,
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                          },
                          headers: {
                            gap: 3,
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'flex-start',
                          },
                          paragrahFinal: {
                            gap: 5,
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'flex-end',
                            backgroundColor: '#e0e0e0',
                            padding: 2,
                          },
                          paragrahWithPaddingBottom: {
                            gap: 5,
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            marginBottom: 5,
                            backgroundColor: '#f5f5f5',
                            padding: 1,
                          },
                          paragraphBottomSpace: {
                            paddingBottom: 2,
                          },
                          paragraphBottomSpaceSmall: {
                            paddingBottom: 2,
                          },
                          boldText: {
                            fontFamily: 'Helvetica-Bold',
                          },
                          row: {
                            display: 'flex',
                            alignContent: 'stretch',
                            flexDirection: 'row',
                          },
                        });
                        return (
                          <View
                            key={index}
                            style={{
                              padding: 5,
                              // paddingBottom: 1,
                              marginHorizontal: 5,
                              minWidth: '96%',
                              display: 'flex',
                              alignItems: 'stretch',
                              borderColor: 'black',
                              borderWidth: 1,
                              height: 256,
                              width: '48%',
                            }}
                          >
                            <View style={styles.paragraphBottomSpace}>
                              <View style={styles.paragraphBottomSpaceSmall}>
                                <Text style={styles.boldText}>
                                  {properCasing(
                                    data.employee?.company?.companyName
                                  ) || 'No Company'}{' '}
                                  Payslip
                                </Text>
                              </View>
                              <View style={styles.headers}>
                                <Text style={styles.boldText}>Name: </Text>

                                <Text
                                // style={{ width: '90%', textAlign: 'right' }}
                                >
                                  {data.employee?.employee_profile
                                    ?.employeeFullName || ''}
                                </Text>
                              </View>
                              <View style={styles.row}>
                                <View
                                  style={{ ...styles.headers, width: '50%' }}
                                >
                                  <Text style={styles.boldText}>
                                    Payroll Month:{' '}
                                  </Text>
                                  <Text>{data.businessMonth}</Text>
                                </View>
                                <View
                                  style={{ ...styles.headers, width: '50%' }}
                                >
                                  <Text style={styles.boldText}>Cycle: </Text>
                                  <Text>{properCasing(data.cycle)}</Text>
                                </View>
                              </View>
                              <View style={styles.row}>
                                {' '}
                                <View
                                  style={{ ...styles.headers, width: '50%' }}
                                >
                                  <Text style={styles.boldText}>Absence:</Text>
                                  <Text>
                                    {` ${data.daysAbsent} day${addS(
                                      data.daysAbsent
                                    )}`}
                                  </Text>
                                </View>
                                <View
                                  style={{ ...styles.headers, width: '50%' }}
                                >
                                  <Text style={styles.boldText}>
                                    Total Days Worked:{' '}
                                  </Text>
                                  <Text>{`${data.daysWorked} day${addS(
                                    data.daysWorked
                                  )}`}</Text>
                                </View>
                              </View>
                            </View>
                            <View
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                height: '100%',
                              }}
                            >
                              <View style={{ ...styles.row, gap: 4 }}>
                                <View
                                  style={{
                                    ...styles.paragraphBottomSpace,
                                    width: '50%',
                                  }}
                                >
                                  <View
                                    style={styles.paragrahWithPaddingBottom}
                                  >
                                    <Text style={{ fontWeight: 'bold' }}>
                                      PAY DESCRIPTION
                                    </Text>
                                    <Text style={{ fontWeight: 'bold' }}>
                                      TOTAL
                                    </Text>
                                  </View>

                                  <View style={styles.paragrah}>
                                    <Text>
                                      {data.isDirect ? (
                                        <>Reg Days: (0 day)</>
                                      ) : (
                                        <>
                                          Reg. Days
                                          {` (${
                                            data.daysWorked -
                                            (workedOnRD +
                                              workedOnRHD +
                                              workedOnRHDWhileRD +
                                              workedOnSPHD +
                                              workedOnSPHDWhileRD)
                                          } day${addS(
                                            data.daysWorked -
                                              (workedOnRD +
                                                workedOnRHD +
                                                workedOnRHDWhileRD +
                                                workedOnSPHD +
                                                workedOnSPHDWhileRD)
                                          )}):`}
                                        </>
                                      )}
                                    </Text>
                                    <Text>
                                      PHP{' '}
                                      {data.isDirect ? (
                                        <>0.00</>
                                      ) : (
                                        <>
                                          {amountFormatter(
                                            (data.daysWorked -
                                              (workedOnRD +
                                                workedOnRHD +
                                                workedOnRHDWhileRD +
                                                workedOnSPHD +
                                                workedOnSPHDWhileRD)) *
                                              data.dailyRate
                                          ) || 0.0}
                                        </>
                                      )}
                                    </Text>
                                  </View>
                                  <View style={styles.paragrah}>
                                    <Text>
                                      Rest Days
                                      {` (${workedOnRD} day${addS(
                                        workedOnRD
                                      )}):`}
                                    </Text>
                                    <Text>
                                      PHP{' '}
                                      {amountFormatter(
                                        workedOnRD *
                                          data.dailyRate *
                                          (data.restDayRate / 100)
                                      ) || 0.0}
                                    </Text>
                                  </View>

                                  <View style={styles.paragrah}>
                                    <Text>
                                      OT
                                      {` (${data.overtimeHrs} hr${addS(
                                        data.overtimeHrs
                                      )}):`}
                                    </Text>
                                    <Text>
                                      PHP{' '}
                                      {amountFormatter(data.overtimePay) || 0.0}
                                    </Text>
                                  </View>
                                  <View style={styles.paragrah}>
                                    <Text>
                                      Night Differential
                                      {` (${data.nightDiffHrs} hr${addS(
                                        data.nightDiffHrs
                                      )}):`}
                                    </Text>
                                    <Text>
                                      PHP{' '}
                                      {amountFormatter(data.nightDiffPay) ||
                                        0.0}
                                    </Text>
                                  </View>
                                  <View style={styles.paragrah}>
                                    <Text>
                                      Reg. Holidays
                                      {` (${data.regularHolidays} day${addS(
                                        data.regularHolidays
                                      )}):`}
                                    </Text>
                                    <Text>
                                      PHP{' '}
                                      {/* {amountFormatter(
                                          workedOnRHD * data.dailyRate * 2 +
                                            halfdayPresentonRHDSum +
                                            workedOnRHDWhileRD *
                                              data.dailyRate *
                                              2.6 +
                                            halfdayPresentonRHDwhileRDSum +
                                            data.regularHolidaysAbsent *
                                              data.dailyRate
                                        ) || 0.0} */}
                                      {amountFormatter(
                                        workedOnRHD *
                                          data.dailyRate *
                                          (data.regularHolidayRate / 100) +
                                          workedOnRHDWhileRD *
                                            data.dailyRate *
                                            (data.regularHolidayRestDayRate /
                                              100) +
                                          (data.regularHolidaysAbsent +
                                            halfdayPresentonRHD * 0.5) *
                                            data.dailyRate
                                      ) || 0.0}
                                    </Text>
                                  </View>
                                  <View style={styles.paragrah}>
                                    <Text>
                                      Spec. Holidays
                                      {` (${data.specialHolidays} day${addS(
                                        data.specialHolidays
                                      )}):`}
                                    </Text>
                                    <Text>
                                      PHP{' '}
                                      {amountFormatter(
                                        workedOnSPHD *
                                          data.dailyRate *
                                          (data.specialHolidayRate / 100) +
                                          workedOnSPHDWhileRD *
                                            data.dailyRate *
                                            (data.specialHolidayRestDayRate /
                                              100) +
                                          (data.isMonthlyRated &&
                                          data.employmentStatus == 'Regular'
                                            ? (data.specialHolidaysAbsent +
                                                halfdayPresentonSPHD * 0.5) *
                                              data.dailyRate
                                            : 0.0)
                                      ) || 0.0}
                                    </Text>
                                  </View>
                                  <View style={styles.paragrah}>
                                    <Text>
                                      Leaves
                                      {` (${
                                        data.sickLeaveDays +
                                          data.vacationLeaveDays +
                                          data.soloParentLeaveDays +
                                          data.paternityLeaveDays +
                                          data.maternityLeaveDays +
                                          data.serviceIncentiveLeaveDays +
                                          data.otherLeaveDays || 0
                                      } day${addS(
                                        data.sickLeaveDays +
                                          data.vacationLeaveDays +
                                          data.soloParentLeaveDays +
                                          data.paternityLeaveDays +
                                          data.maternityLeaveDays +
                                          data.serviceIncentiveLeaveDays +
                                          data.otherLeaveDays || 0
                                      )}):`}
                                    </Text>
                                    <Text>
                                      PHP{' '}
                                      {amountFormatter(
                                        (data.sickLeaveDays +
                                          data.vacationLeaveDays +
                                          data.soloParentLeaveDays +
                                          data.paternityLeaveDays +
                                          data.maternityLeaveDays +
                                          data.serviceIncentiveLeaveDays +
                                          data.otherLeaveDays || 0) *
                                          data.dailyRate
                                      ) || 0.0}
                                    </Text>
                                  </View>
                                  {hasAllowanceBreakdown ? (
                                    <>
                                      {allowanceBreakdownsData.map(
                                        (item: any, index: number) => (
                                          <View
                                            style={styles.paragrah}
                                            key={index}
                                          >
                                            <Text>{item.type} Allowance:</Text>
                                            <Text>
                                              PHP{' '}
                                              {amountFormatter(
                                                item.dailyAmount *
                                                  data.daysWorked
                                              ) || 0.0}
                                            </Text>
                                          </View>
                                        )
                                      )}
                                    </>
                                  ) : (
                                    <View style={styles.paragrah}>
                                      <Text>Allowance:</Text>
                                      <Text>
                                        PHP{' '}
                                        {amountFormatter(data.allowance) || 0.0}
                                      </Text>
                                    </View>
                                  )}

                                  <View style={styles.paragrah}>
                                    <Text>
                                      Adjustments {'('}
                                      {data.payroll_adjustments.length} item
                                      {addS(data.payroll_adjustments.length)}
                                      {'):'}
                                    </Text>
                                    <Text>
                                      PHP{' '}
                                      {amountFormatter(adjustmentSum) || 0.0}
                                    </Text>
                                  </View>
                                  {data.payroll_adjustments.map(
                                    (adjustment: any, index: number) => (
                                      <div key={adjustment.id}>
                                        <View style={styles.paragrah}>
                                          <Text style={{ paddingLeft: '10px' }}>
                                            {adjustment.desc !== '' &&
                                              `-${adjustment.desc}`}
                                            :
                                          </Text>
                                          <Text>
                                            PHP{' '}
                                            {amountFormatter(
                                              adjustment.addAdjustment -
                                                adjustment.deductAdjustment
                                            ) || 0.0}
                                          </Text>
                                        </View>
                                      </div>
                                    )
                                  )}
                                  <View style={styles.paragrah}>
                                    <Text>Gross Pay:</Text>
                                    <Text>
                                      PHP {amountFormatter(data.grossPay)}
                                    </Text>
                                  </View>
                                </View>
                                <View
                                  style={{
                                    ...styles.paragraphBottomSpace,
                                    width: '50%',
                                  }}
                                >
                                  <View
                                    style={styles.paragrahWithPaddingBottom}
                                  >
                                    <Text style={{ fontWeight: 'bold' }}>
                                      DEDUCTION DESCRIPTION
                                    </Text>
                                    <Text style={{ fontWeight: 'bold' }}>
                                      TOTAL
                                    </Text>
                                  </View>

                                  <View style={styles.paragrah}>
                                    <Text>
                                      Late
                                      {` (${data.lateHrs} hr${addS(
                                        data.lateHrs
                                      )}):`}
                                    </Text>
                                    <Text>
                                      PHP {amountFormatter(data.latePay)}
                                    </Text>
                                  </View>
                                  <View style={styles.paragrah}>
                                    <Text>
                                      Undertime
                                      {` (${data.undertimeHrs} hr${addS(
                                        data.undertimeHrs
                                      )}):`}
                                    </Text>
                                    <Text>
                                      PHP {amountFormatter(data.undertimePay)}
                                    </Text>
                                  </View>
                                  <View style={styles.paragrah}>
                                    <Text>SSS Contributions:</Text>
                                    <Text>
                                      PHP{' '}
                                      {amountFormatter(data.sssContribution)}
                                    </Text>
                                  </View>
                                  <View style={styles.paragrah}>
                                    <Text>PhilHealth Contributions:</Text>
                                    <Text>
                                      PHP{' '}
                                      {amountFormatter(
                                        data.philhealthContribution
                                      )}
                                    </Text>
                                  </View>
                                  <View style={styles.paragrah}>
                                    <Text>Pag-Ibig Contributions:</Text>
                                    <Text>
                                      PHP{' '}
                                      {amountFormatter(
                                        data.pagIbigContribution
                                      )}
                                    </Text>
                                  </View>
                                  <View style={styles.paragrah}>
                                    <Text>CA Loans:</Text>
                                    <Text>
                                      PHP {amountFormatter(cashAdvanceSum)}
                                    </Text>
                                  </View>
                                  <View style={styles.paragrah}>
                                    <Text>SSS Loans:</Text>
                                    <Text>
                                      PHP {amountFormatter(sssLoanSum)}
                                    </Text>
                                  </View>
                                  <View style={styles.paragrah}>
                                    <Text>SSS Calamity Loans:</Text>
                                    <Text>
                                      PHP {amountFormatter(sssCalamityLoanSum)}
                                    </Text>
                                  </View>
                                  <View style={styles.paragrah}>
                                    <Text>Pag-Ibig Loans:</Text>
                                    <Text>
                                      PHP {amountFormatter(pagIbigLoanSum)}
                                    </Text>
                                  </View>
                                  {/* <View style={styles.paragrah}>
                                    <Text>Salary Loans:</Text>
                                    <Text>
                                      PHP {amountFormatter(salaryLoanSum)}
                                    </Text>
                                  </View> */}
                                  {/* <View style={styles.paragrah}>
                                    <Text
                                      style={{ maxWidth: '80%', lineHeight: 1 }}
                                    >
                                      Others{' '}
                                      {otherDeductions.length > 0 &&
                                        otherDeductions[0].deduction.remarks &&
                                        otherDeductions[0].deduction.remarks !==
                                          '' &&
                                        `(${otherDeductions[0].deduction.remarks})`}
                                      :
                                    </Text>
                                    <View
                                      style={{
                                        display: 'flex',
                                        flexDirection: 'column-reverse',
                                      }}
                                    >
                                      <Text>
                                        PHP {amountFormatter(otherSum)}
                                      </Text>
                                    </View>
                                  </View> */}
                                  {/* <View style={styles.paragrah}>
                                <Text style={{ maxWidth: '80%' }}>Ledger:</Text>

                                <Text>PHP {amountFormatter(ledgerSum)}</Text>
                              </View> */}
                                  <View style={styles.paragrah}>
                                    <Text>Withholding Tax:</Text>
                                    <Text>
                                      PHP {amountFormatter(data.withholdingTax)}
                                    </Text>
                                  </View>
                                  <View style={styles.paragrah}>
                                    <Text>
                                      Other {'('}
                                      {otherBreakdownArr.length} item
                                      {addS(otherBreakdownArr.length)}
                                      {'):'}
                                    </Text>
                                    <Text>
                                      PHP {amountFormatter(otherSum) || 0.0}
                                    </Text>
                                  </View>
                                  {otherBreakdownArr.map(
                                    (item: any, index: number) => {
                                      return (
                                        <View
                                          style={styles.paragrah}
                                          key={index}
                                        >
                                          <Text style={{ paddingLeft: '10px' }}>
                                            -{ellipsisize(item.desc, 50)}:
                                          </Text>
                                          <Text>
                                            PHP {amountFormatter(item.amount)}
                                          </Text>
                                        </View>
                                      );
                                    }
                                  )}
                                  <View style={styles.paragrah}>
                                    <Text>TOTAL DEDUCTION:</Text>
                                    <Text>
                                      PHP{' '}
                                      {amountFormatter(
                                        data.netPay == 0
                                          ? 0
                                          : data.totalDeduction
                                      )}
                                    </Text>
                                  </View>
                                </View>
                              </View>
                              <View
                                style={{
                                  ...styles.paragraphBottomSpace,
                                }}
                              >
                                <View style={styles.paragrahFinal}>
                                  <Text>EARNINGS:</Text>
                                  <Text>
                                    PHP {amountFormatter(data.netPay)}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  </Page>
                </Document>
              }
              // fileName={`${formDataPost.businessMonthCycle} - ${moment().format(
              //   'MM/DD/YYYY hh:mm:ss'
              // )}.pdf`}
              fileName={`${Filename.current} - ${moment().format(
                'MM/DD/YYYY hh:mm:ss'
              )}.pdf`}
            >
              <p
                ref={downloadPayslipRef}
                className={'hidden'}
                onClick={() => {
                  // setActivityLog();
                  // setPayslip(false);
                  toast.current?.replace({
                    severity: 'success',
                    summary: 'Payslip generated successfully',
                    closable: true,
                    life: 5000,
                  });
                }}
              >
                Download buttton
              </p>
            </PDFDownloadLink>
          )}
        </React.Fragment>
      </div>
    </div>
  );
};

export default EmployeePayrollDashboard;
