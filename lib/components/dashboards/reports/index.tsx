'use client';

import { ButtonType } from '@enums/button';
import { FormType } from '@enums/sidebar';
import DashboardNav from 'lib/components/blocks/dashboardNav';
import ReportsDasboardMenus from 'lib/components/blocks/reportsDasboardMenus';
import { InputText } from 'primereact/inputtext';
import React, { useContext, useEffect, useRef, useState } from 'react';
import CompanyLedgerReportSidebar from './companyLedgerReportSidebar';
import axios from 'axios';
import moment from '@constant/momentTZ';
import ExcelJS from 'exceljs';
import SidebarReportsView from 'lib/components/blocks/sidebarReportsView';
import { useParams } from 'next/navigation';
import { GlobalContainer } from 'lib/context/globalContext';
import { Toast } from 'primereact/toast';
import { amountFormatter, properCasing } from '@utils/helper';
import {
  Document,
  PDFDownloadLink,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';
import TimeKeepingReportTable from './timeKeepingReportTable';
import { useQueries } from '@tanstack/react-query';
import { number } from 'yup';

const Index = () => {
  const params = useParams();
  const context: any = useContext(GlobalContainer);
  const seshData = context.userData;
  const companyId = params?.companyId as string;
  const hasSelectedCompany = companyId;

  const [
    isCompanyLedgerReportSidebarOpen,
    setIsCompanyLedgerReportSidebarOpen,
  ] = useState(false);

  const [formDate, setFormDate] = useState({
    fromDate: '',
    toDate: '',
  });
  const [timeKeepingDataReport, setTimeKeepingDataReport] = useState<any>({
    departmentId: null,
    businessMonth: null,
  });
  var _ = require('lodash');
  const [deductionDataReport, setDeductionDataReport] = useState({
    departmentIds: [],
    startMonth: null,
    endMonth: null,
    deductionType: [],
  });
  const [sidebarState, setSidebarState] = useState({
    title: '',
    state: false,
    items: [],
  });
  const toast = useRef<Toast>(null);
  const downloadDTR: any = useRef<any>(null);
  const downloadTKR: any = useRef<any>(null);
  const arr: any = [];

  const deductionTypeOptions = [
    {
      code: 'sssContribution',
      name: 'SSS Contribution',
    },
    {
      code: 'philhealthContribution',
      name: 'PhilHealth Contribution',
    },
    {
      code: 'pagIbigContribution',
      name: 'Pag-Ibig Contribution',
    },
    {
      code: 'WithHolding Tax',
      name: 'WithHolding Tax',
    },
    {
      code: 'Late and UT Deductions',
      name: 'Late and UT Deductions',
    },
    {
      code: 'Cash Advance',
      name: 'Cash Advance',
    },
    {
      code: 'SSS Loan',
      name: 'SSS Loan',
    },
    {
      code: 'Pag-Ibig Loan',
      name: 'Pag-Ibig Loan',
    },
    {
      code: 'Deduction Adjustment',
      name: 'Deduction Adjustment',
    },
    {
      code: 'Others',
      name: 'Others',
    },
  ];
  const [timeKeepingReportBusinessMonths, setTimeKeepingReportBusinessMonths] =
    useState<any>([]);
  const [deductionReportBusinessMonths, setDeductionReportBusinessMonths] =
    useState<any>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [timeKeepingReports, setTimeKeepingReports] = useState([]);
  const [deductionReports, setDeductionReports] = useState([]);

  
  const onInputChangeReports = (e: any, fieldName: string, value: any) => {
    setTimeKeepingDataReport((prev: any) => ({
      ...prev,
      [fieldName]: value.code,
    }));
    if (fieldName == 'departmentId') {
      setTimeKeepingDataReport((prev: any) => ({
        ...prev,
        businessMonth: null,
      }));
      if (!timeKeepingReportBusinessMonthsQuery.isFetched) {
        setTimeKeepingReportBusinessMonths({
          code: 'Loading. Please wait...',
          name: 'Loading. Please wait...',
        });
      } else if(timeKeepingReportBusinessMonthsQuery.data.length > 0) {
        setTimeKeepingReportBusinessMonths(
          timeKeepingReportBusinessMonthsQuery?.data?.filter((d: any) => d.departmentId == value.code)
            ?.map((d: any) => ({ code: d.businessMonth, name: d.businessMonth }))
            ?.sort((a: any, b: any) => {
              let [monthA, yearA] = a.name.split(' ');
              let [monthB, yearB] = b.name.split(' ');
              let dateA: any = new Date(`${monthA} 1, ${yearA}`);
              let dateB: any = new Date(`${monthB} 1, ${yearB}`);
              return dateA - dateB;
            })
        );
      }
    } else if (fieldName == 'businessMonth') {
      setTimeKeepingDataReport((prev: any) => ({
        ...prev,
        businessMonth: value.name,
      }));
    }
  };

  const handleDeductionReportDepartmentChange = (
    event: any,
    fieldName: string,
    value: any
  ) => {
    // checks if event is from deduction type multiselect
    const isDeduction = event.target.name == 'deductionType';

    if (fieldName && value) {
      setDeductionDataReport((prev: any) => ({
        ...prev,
        [fieldName]: value.name,
      }));
    } else if (isDeduction) {
      setDeductionDataReport((prev: any) => ({
        ...prev,
        deductionType: event.value,
      }));
    } else if (!isDeduction) {
      if (event.target.name == 'departments') {
        setDeductionDataReport((prev: any) => ({
          ...prev,
          departmentIds: event.value,
        }));
        const businessMonthsData = deductionReportBusinessMonthsQuery.data;
        const selectedDepartments = event.value.map(
          (department: any) => department.code
        );
        const businessMonths: any = [];
        for (let i = 0; i < businessMonthsData.length; i++) {
          if (
            selectedDepartments.includes(businessMonthsData[i].departmentId)
          ) {
            if (!businessMonths.includes(businessMonthsData[i].businessMonth)) {
              businessMonths.push(businessMonthsData[i].businessMonth);
            }
          }
        }
        setDeductionReportBusinessMonths(
          businessMonths
            .map((data: any) => ({ code: data, name: data }))
            .sort((a: any, b: any) => {
              let [monthA, yearA] = a.name.split(' ');
              let [monthB, yearB] = b.name.split(' ');
              let dateA: any = new Date(`${monthA} 1, ${yearA}`);
              let dateB: any = new Date(`${monthB} 1, ${yearB}`);
              return dateA - dateB;
            })
        );
      }
    }
  };

  const [
    timeKeepingReportDepartmentsQuery,
    timeKeepingReportBusinessMonthsQuery,
  ] = useQueries({
    queries: [
      {
        refetchOnWindowFocus: false,
        queryKey: ['deparments'],
        queryFn: async () => {
          const response: any = await axios.get(`/api/companies/departments`, {
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
            },
          });
          const formatted = response.data
            .map((r: any) => ({
              code: r.departmentId,
              name: `${r.departmentName}${
                r.deletedAt == null ? '' : ' - Deleted'
              }`,
              deletedAt: r.deletedAt,
            }))
            .sort((a: any, b: any) => {
              if (a.deletedAt == null && b.deletedAt != null) {
                return -1;
              }
              if (a.deletedAt != null && b.deletedAt == null) {
                return 1;
              }
              return 0;
            });

          return formatted;
        },
      },
      {
        refetchOnWindowFocus: false,
        queryKey: ['businessMonths'],
        queryFn: async () => {
          const response: any = await axios.get(
            `/api/companies/businessmonths`,
            {
              headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
              },
            }
          );

          const uniqueBusinessMonths = _.uniqBy(
            response.data,
            function (item: any) {
              return [item.departmentId, item.businessMonth];
            }
            // 'businessMonth'
          );
          return uniqueBusinessMonths;
        },
      },
    ],
  });

  const [deductionReportDepartmentsQuery, deductionReportBusinessMonthsQuery] =
    useQueries({
      queries: [
        {
          refetchOnWindowFocus: false,
          queryKey: ['deductionDepartments'],
          queryFn: async () => {
            const response: any = await axios.get(
              `/api/companies/departments`,
              {
                headers: {
                  Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
                },
              }
            );

            const formatted = response.data
              .map((r: any) => ({
                code: r.departmentId,
                name: `${r.departmentName}${
                  r.deletedAt == null ? '' : ' - Deleted'
                }`,
                deletedAt: r.deletedAt,
              }))
              .sort((a: any, b: any) => {
                if (a.deletedAt == null && b.deletedAt != null) {
                  return -1;
                }
                if (a.deletedAt != null && b.deletedAt == null) {
                  return 1;
                }
                return 0;
              });
            return formatted;
          },
        },
        {
          refetchOnWindowFocus: false,
          queryKey: ['deductionBusinessMonths'],
          queryFn: async () => {
            const response: any = await axios.get(
              `/api/payrolls/businessmonths`,
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

  const generateTimekeepingReport = async () => {
    toast.current?.replace({
      severity: 'info',
      summary: 'Generating Time Keeping Report',
      detail: 'Please wait...',
      sticky: true,
      closable: false,
    });

    setIsGenerating(true);

    try {
      const attendanceData = await axios.get(
        `/api/attendances/generateReport?departmentId=${timeKeepingDataReport.departmentId}&businessMonth=${timeKeepingDataReport.businessMonth}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
          },
        }
      );
      if (
        attendanceData.data &&
        attendanceData?.data?.attendanceReport &&
        attendanceData?.data?.attendanceReport?.length > 0
      ) {
        setTimeKeepingReports(attendanceData.data.attendanceReport);
        setTimeout(() => {
          downloadTKR.current.click();
        }, 2000);
      } else {
        toast.current?.replace({
          severity: 'error',
          summary: 'Error occured.',
          sticky: true,
          closable: true,
        });
      }
    } catch (error: any) {
      console.log('error');
      toast.current?.replace({
        severity: 'error',
        summary: error.message,
        sticky: true,
        closable: true,
      });
    }
  };

  const generateDeductionReport = async () => {
    if (deductionDataReport.startMonth && deductionDataReport.endMonth) {
      let [monthA, yearA] = (deductionDataReport.startMonth as string).split(
        ' '
      );
      let [monthB, yearB] = (deductionDataReport.endMonth as string).split(' ');
      let dateA: any = new Date(`${monthA} 1, ${yearA}`);
      let dateB: any = new Date(`${monthB} 1, ${yearB}`);

      if (dateA > dateB) {
        toast.current?.replace({
          severity: 'error',
          summary: 'Starting month should be before than ending month',
          sticky: true,
          closable: true,
        });
      } else {
        toast.current?.replace({
          severity: 'info',
          summary: 'Generating Deduction Report',
          detail: 'Please wait...',
          sticky: true,
          closable: false,
        });

        try {
          const deductionData = await axios.get(
            `/api/deductions/generateReport?departmentIds=${deductionDataReport.departmentIds
              .map((department: any) => department.code)
              .toString()}&startMonth=${
              deductionDataReport.startMonth
            }&endMonth=${deductionDataReport.endMonth}`,
            {
              headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
              },
            }
          );
          if (
            deductionData.data &&
            deductionData?.data?.deductionReport &&
            deductionData?.data?.deductionReport?.length > 0
          ) {
            deductionData.data.deductionReport.map((department: any) => {
              const x = department.months.filter((month: any) => {
                if (!month) return false;
                return month.formattedData.length > 0;
              });

              if (x.length > 0) {
                const workbook = new ExcelJS.Workbook();
                department.months.map((month: any) => {
                  if (month != null) {
                    if (month.formattedData.length > 0) {
                      const worksheet = workbook.addWorksheet(
                        `${month.month}`,
                        {}
                      );
                      worksheet.views = [
                        {
                          showGridLines: false,
                        },
                      ];
                      worksheet.getColumn(1).width = 3;

                      new Array(14).fill('').forEach((item, index) => {
                        if (index + 2 > 1 && index + 2 <= 3) {
                          worksheet.getColumn(index + 2).width = 20;
                        } else {
                          worksheet.getColumn(index + 2).width = 18;
                        }
                      });

                      [1, 2, 3, 4].forEach((rowNumber: any) => {
                        if (rowNumber == 1) {
                          worksheet.getRow(rowNumber).height = 45;
                        } else {
                          worksheet.getRow(rowNumber).height = 20;
                        }
                      });

                      worksheet.mergeCells('B1:E1');
                      worksheet.mergeCells('B2:E2');
                      worksheet.mergeCells('B3:E3');

                      worksheet.getCell('B1').value = `${properCasing(
                        deductionData.data.companyDetails.companyName
                      )}`;
                      worksheet.getCell('B1').font = { bold: true, size: 22 };
                      worksheet.getCell('B1').alignment = {
                        vertical: 'middle',
                        horizontal: 'left',
                        wrapText: true,
                      };
                      worksheet.getCell(
                        'B2'
                      ).value = `${department.departmentName.toUpperCase()} DEPARTMENT`;
                      worksheet.getCell('B2').font = { bold: true, size: 14 };
                      worksheet.getCell('B2').alignment = {
                        vertical: 'middle',
                        horizontal: 'left',
                        wrapText: true,
                      };
                      worksheet.getCell('B3').value = `${month.month}`;
                      worksheet.getCell('B3').font = { bold: true, size: 14 };
                      worksheet.getCell('B3').alignment = {
                        vertical: 'middle',
                        horizontal: 'left',
                        wrapText: true,
                      };

                      const headerOpt = deductionDataReport.deductionType.map(
                        (item: any) => item.name
                      );

                      headerOpt.unshift(
                        '',
                        'Employee ID',
                        'Employee Name',
                        'Status'
                      );
                      headerOpt.push(...['Total']);

                      const headerRow = worksheet.addRow(headerOpt);
                      worksheet.getRow(5).height = 35;

                      headerRow.eachCell((cell, colNumber) => {
                        if (colNumber > 1) {
                          cell.font = {
                            bold: true,
                            color: { argb: 'FFFFFF' },
                            size: 12,
                          };
                          cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: '222B35' }, // blue background
                          };
                          cell.alignment = {
                            vertical: 'middle',
                            horizontal: 'center',
                            wrapText: true,
                          };
                          cell.border = {
                            top: { style: 'thin' },
                            left: { style: 'thin' },
                            bottom: { style: 'thin' },
                            right: { style: 'thin' },
                          };
                        }
                      });

                      // logic for total sum of deductions
                      month.formattedData.map((data: any) => {
                        let total = 0;
                        deductionDataReport.deductionType.map((item: any) => {
                          switch (item.code) {
                            case 'philhealthContribution':
                              total += parseFloat(data.philhealthContribution);
                              break;
                            case 'sssContribution':
                              total += parseFloat(data.sssContribution);
                              break;
                            case 'pagIbigContribution':
                              total += parseFloat(data.pagIbigContribution);
                              break;
                            case 'Late and UT Deductions':
                              total += parseFloat(data.lateAndUTDeductions);
                              break;
                            case 'Cash Advance':
                              total += parseFloat(data.cashAdvance);
                              break;
                            case 'SSS Loan':
                              total += parseFloat(data.sssLoan);
                              break;
                            case 'Pag-Ibig Loan':
                              total += parseFloat(data.pagIbigLoan);
                              break;
                            case 'Others':
                              total += parseFloat(data.others);
                              break;
                            case 'WithHolding Tax':
                              total += parseFloat(data.withholdingTax);
                              break;
                            case 'Deduction Adjustment':
                              total += parseFloat(data.deductAdjustment);
                              break;
                            default:
                              break;
                          }
                        });
                        //  old code
                        // const total =
                        //   parseFloat(data.philhealthContribution) +
                        //   parseFloat(data.sssContribution) +
                        //   parseFloat(data.pagIbigContribution) +
                        //   parseFloat(data.lateAndUTDeductions) +
                        //   parseFloat(data.cashAdvance) +
                        //   parseFloat(data.sssLoan) +
                        //   parseFloat(data.pagIbigLoan) +
                        //   parseFloat(data.others) +
                        //   parseFloat(data.withholdingTax) +
                        //   parseFloat(data.deductAdjustments);

                        // template for worksheet data
                        const tempArr = [
                          '',
                          data.employeeCode,
                          `${data.firstName} ${data.lastName}`,
                          data.employeeStatus === 1 ? 'Inactive' : 'Active',
                        ];

                        // deductions
                        deductionDataReport.deductionType.map((item: any) => {
                          switch (item.code) {
                            case 'philhealthContribution':
                              tempArr.push(data.philhealthContribution || 0);
                              break;
                            case 'sssContribution':
                              tempArr.push(data.sssContribution || 0);
                              break;
                            case 'pagIbigContribution':
                              tempArr.push(data.pagIbigContribution || 0);
                              break;
                            case 'Late and UT Deductions':
                              tempArr.push(data.lateAndUTDeductions || 0);
                              break;
                            case 'Cash Advance':
                              tempArr.push(data.cashAdvance || 0);
                              break;
                            case 'SSS Loan':
                              tempArr.push(data.sssLoan || 0);
                              break;
                            case 'Pag-Ibig Loan':
                              tempArr.push(data.pagIbigLoan || 0);
                              break;
                            case 'Others':
                              tempArr.push(data.others || 0);
                              break;
                            case 'WithHolding Tax':
                              tempArr.push(data.withholdingTax || 0);
                              break;
                            case 'Deduction Adjustment':
                              tempArr.push(data.deductAdjustment || 0);
                              break;
                            default:
                              break;
                          }
                        });

                        // the rest of the data added to the template
                        tempArr.push(total || 0);

                        const d = worksheet.addRow(
                          tempArr
                          //  old code
                          //   [
                          //   '',
                          //   data.employeeCode,
                          //   `${data.firstName} ${data.lastName}`,
                          //   data.employeeStatus === 1 ? 'Inactive' : 'Active',
                          //   data.philhealthContribution,
                          //   data.sssContribution,
                          //   data.pagIbigContribution,
                          //   data.lateAndUTDeductions,
                          //   data.cashAdvance,
                          //   data.sssLoan,
                          //   data.pagIbigLoan,
                          //   data.others,
                          //   data.withholdingTax,
                          //   data.deductAdjustments,
                          //   total,
                          // ]
                        );
                        d.height = 25.25;
                        d.eachCell((cell, colNumber) => {
                          if (colNumber > 1) {
                            cell.alignment = {
                              vertical: 'middle',
                              horizontal: 'left',
                            };
                            cell.border = {
                              top: { style: 'thin' },
                              left: { style: 'thin' },
                              bottom: { style: 'thin' },
                              right: { style: 'thin' },
                            };
                          }
                        });
                      });
                    }
                  }
                });

                const workbookBuffer = workbook.xlsx.writeBuffer();
                workbookBuffer.then((buffer) => {
                  const blob = new Blob([buffer], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Deduction Report - ${
                    department.departmentName
                  } - ${moment().format('MM/DD/YYYY')}.xlsx`;
                  a.click();
                });
                toast.current?.replace({
                  severity: 'success',
                  summary: 'Deduction Report generated successfully.',
                  closable: true,
                  life: 5000,
                });
              }
            });
          } else {
            toast.current?.replace({
              severity: 'error',
              summary: 'Deduction Report generated successfully.',
              sticky: true,
              closable: true,
            });
          }
        } catch (error: any) {
          console.log('error');
          toast.current?.replace({
            severity: 'error',
            summary: error.message,
            sticky: true,
            closable: true,
          });
        }
      }
    }
  };

  const isLoadingDropDown = !timeKeepingReportDepartmentsQuery.isFetched || !timeKeepingReportBusinessMonthsQuery.isFetched

  return (
    <div className="w-screen h-screen overflow-auto p-5">
      <Toast ref={toast} position="bottom-left" />
      {/* DASHBOARD NAV */}
      <DashboardNav
        navTitle="Companies > Reports"
        buttons={[]}
        isShowSearch={false}
      />

      {/* MAIN CONTENT */}
      <React.Fragment>
        {/* <div className="p-input-icon-left w-full">
          <i className="pi pi-search" />
          <InputText placeholder="Search" className="w-full" />
        </div> */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ReportsDasboardMenus
            title="Company Ledger Report"
            description="View report for government remittances for employees or company admins."
            form={{
              forms: [],
              buttons: [
                {
                  label: 'View Report',
                  type: ButtonType.Red,
                  handler: () => setIsCompanyLedgerReportSidebarOpen(true),
                },
              ],
            }}
          />

          <ReportsDasboardMenus
            title="Activity Logs"
            description="Choose your date range to generate date logs."
            form={{
              forms: [
                {
                  label: 'From',
                  type: FormType.Date,
                  name: 'cycle',
                  placeholder: 'Placeholder',
                  isVisible: true,
                  isRequired: false,
                  isDisabled: false,
                  value: formDate.fromDate,
                  setValue: (value: string) => {
                    setFormDate({ 
                      ...formDate, 
                      fromDate: value,
                      toDate: value && formDate.toDate && 
                        moment(formDate.toDate).isAfter(moment(value).add(3, 'months')) 
                        ? '' 
                        : formDate.toDate
                    });
                  },
                },
                {
                  label: 'To',
                  type: FormType.Date,
                  name: 'cycle',
                  placeholder: 'Placeholder',
                  isVisible: true,
                  isRequired: false,
                  isDisabled: false,
                  value: formDate.toDate,
                  minDate: formDate.fromDate ? moment(formDate.fromDate).toDate() : undefined,
                  maxDate: formDate.fromDate ? moment(formDate.fromDate).add(3, 'months').toDate() : undefined,
                  setValue: (value: string) =>
                    setFormDate({ ...formDate, toDate: value }),
                },
              ],
              buttons: [
                {
                  label: 'Download XLS',
                  type: ButtonType.Black,
                  isDisabled:
                    formDate.fromDate === '' || formDate.toDate === '',
                  handler: () => {
                    axios
                      .get(
                        `/api/reports/activityLogs?fromDate=${
                          moment(formDate.fromDate).format('YYYY-MM-DD') +
                          ' 00:00:00'
                        }&toDate=${
                          moment(formDate.toDate).format('YYYY-MM-DD') +
                          ' 23:59:59'
                        }`,
                        {
                          headers: {
                            Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
                          },
                        }
                      )
                      .then((res) => {
                        const workbook = new ExcelJS.Workbook();
                        const worksheet =
                          workbook.addWorksheet('Activity Logs');

                        new Array(3).fill('').forEach((item, index) => {
                          if (index + 1 === 2) {
                            worksheet.getColumn(index + 1).width = 80;
                          } else {
                            worksheet.getColumn(index + 1).width = 30;
                          }
                        });

                        const dataItems = res.data.activityLogs.map(
                          (item: any) => {
                            return [
                              item.user?.firstName && item.user?.lastName
                                ? `${item.user?.userFullName || ''} `
                                : item.user?.emailAddress,
                              item.message,
                              moment(item.createdAt).format('MM/DD/YYYY'),
                            ];
                          }
                        );

                        const earningsData = [
                          ['User', 'Action', 'Date'],
                          ...dataItems.map((data: any, index: number) => {
                            return [...data.map((item: any) => item)];
                          }),
                        ];

                        earningsData.forEach((row, rowIndex) => {
                          const newRow = worksheet.addRow(row);

                          if (rowIndex === 0) newRow.font = { bold: true };

                          newRow.eachCell({ includeEmpty: true }, (cell) => {
                            cell.alignment = { horizontal: 'center' };
                          });

                          const cellValue = row[1];
                          if (!isNaN(parseFloat(cellValue))) {
                            newRow.getCell(2).value = parseFloat(cellValue);
                          }
                        });

                        const workbookBuffer = workbook.xlsx.writeBuffer();
                        workbookBuffer.then((buffer) => {
                          const blob = new Blob([buffer], {
                            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                          });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `Activity Logs Report - ${moment().format(
                            'MM/DD/YYYY'
                          )}.xlsx`;
                          a.click();
                        });
                      })
                      .then((err) => {
                        console.log(err);
                      });
                  },
                },
                {
                  label: 'View Report',
                  type: ButtonType.Red,
                  isDisabled:
                    formDate.fromDate === '' || formDate.toDate === '',
                  handler: () => {
                    setSidebarState((prev) => ({
                      ...prev,
                      title: 'Activity Logs',
                      state: true,
                    }));

                    axios
                      .get(
                        `/api/reports/activityLogs?fromDate=${
                          moment(formDate.fromDate).format('YYYY-MM-DD') +
                          ' 00:00:00'
                        }&toDate=${
                          moment(formDate.toDate).format('YYYY-MM-DD') +
                          ' 23:59:59'
                        }`,
                        {
                          headers: {
                            Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
                          },
                        }
                      )
                      .then((res) => {
                        setSidebarState((prev) => ({
                          ...prev,
                          items: res.data.activityLogs,
                        }));
                      })
                      .then((err) => {
                        console.log(err);
                      });
                  },
                },
              ],
            }}
          />

          <ReportsDasboardMenus
            title="Employees"
            description="Download or view employee information data."
            form={{
              forms: [],
              buttons: [
                {
                  label: 'Download XLS',
                  type: ButtonType.Black,
                  handler: () => {
                    axios
                      .get(`/api/reports/employees`, {
                        headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
                        },
                      })
                      .then((res) => {
                        const results = res?.data?.employeeLogs?.results ?? []
                        const workbook = new ExcelJS.Workbook();
                        const worksheet =
                          workbook.addWorksheet('Employee Logs');
                        if (results.length == 0) {
                          toast.current?.replace({
                            severity: 'warn',
                            detail: 'No Employee Records found.',
                            life: 5000,
                          });
                          return;
                        }
                        const groupedByCompanyId = results.reduce(
                          (result: any, employee: any) => {
                            const companyId = employee.companyId;
                            if (!result[companyId]) {
                              result[companyId] = [];
                            }
                            result[companyId].push(employee);

                            return result;
                          },
                          {}
                        );

                        new Array(5).fill('').forEach((item, index) => {
                          worksheet.getColumn(index + 1).width = 40;
                        });

                        Object.keys(groupedByCompanyId).forEach((companyId) => {
                          const headerRow = worksheet.addRow([
                            `${groupedByCompanyId[companyId][0].companyName}`,
                          ]);
                          headerRow.font = {
                            bold: true,
                            color: { argb: 'D61117' },
                          };
                          worksheet.mergeCells(
                            `A${headerRow.number}:D${headerRow.number}`
                          );
                          headerRow.eachCell({ includeEmpty: true }, (cell) => {
                            cell.alignment = {
                              horizontal: 'center',
                            };
                          });

                          const subHeaderRow = worksheet.addRow([
                            'Employee Name',
                            'Employee ID',
                            'Contact No.',
                            'Email Address',
                            'Department',
                          ]);

                          subHeaderRow.font = {
                            bold: true,
                            color: { argb: 'D61117' }, // Red color
                          };

                          subHeaderRow.eachCell(
                            { includeEmpty: true },
                            (cell) => {
                              cell.alignment = {
                                horizontal: 'center',
                              };
                            }
                          );

                          // Add data items for each employee in the company
                          groupedByCompanyId[companyId].forEach((item: any) => {
                            const data = [
                              `${item?.employeeName}`,
                              item.employeeCode || '',
                              item?.contactNumber || '',
                              item?.emailAddress || '',
                              item?.departmentName || '',
                            ];
                            worksheet.addRow(data);
                          });

                          // Add an empty row between companies
                          worksheet.addRow([]);
                        });

                        const workbookBuffer = workbook.xlsx.writeBuffer();
                        workbookBuffer.then((buffer) => {
                          const blob = new Blob([buffer], {
                            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                          });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `Employee Report - ${moment().format(
                            'MM/DD/YYYY'
                          )}.xlsx`;
                          a.click();
                        });
                      })
                      .catch((err) => {
                        console.log(err);
                      });
                  },
                },
              ],
            }}
          />
          {seshData && seshData.role == 'SUPER_ADMIN' && !hasSelectedCompany ? (
            ''
          ) : (
              <>
              <ReportsDasboardMenus
                title="Time Keeping Report"
                description="Choose department and business month to generate time keeping report."
                onInputChange={onInputChangeReports}
                form={{
                  forms: [
                    {
                      label: 'Choose Department',
                      type: FormType.Dropdown,
                      name: 'departmentId',
                      options: !timeKeepingReportDepartmentsQuery.isLoading
                        ? timeKeepingReportDepartmentsQuery.data
                        : [],
                      value:
                        timeKeepingDataReport &&
                        timeKeepingDataReport.departmentId,
                      placeholder: !isLoadingDropDown
                        ? 'Choose Department'
                        : 'Loading. Please wait...',
                      isVisible: true,
                      isRequired: true,
                      isDisabled: isLoadingDropDown,
                    },
                    {
                      label: 'Choose Business Month',
                      type: FormType.Dropdown,
                      name: 'businessMonth',
                      options: timeKeepingReportBusinessMonths,
                      value:
                        timeKeepingDataReport &&
                        timeKeepingDataReport.businessMonth,
                      placeholder: !isLoadingDropDown
                        ? 'Choose Business Month'
                        : 'Loading. Please wait...',
                      isVisible: true,
                      isRequired: true,
                      isDisabled: isLoadingDropDown,
                    },
                  ],
                  buttons: [
                    {
                      label: 'Download PDF',
                      type: ButtonType.Black,
                      isDisabled:
                        timeKeepingDataReport.departmentId === null ||
                        timeKeepingDataReport.businessMonth === null,
                      handler: async () => {
                        toast.current?.replace({
                          severity: 'warn',
                          summary: 'This feature is underconstruction',
                          closable: true,
                          life: 5000,
                        });
                        generateTimekeepingReport();
                        // downloadTKR.current.click();
                        // const attendanceData = await axios.get(`/api/reports/employees`, {
                        //     headers: {
                        //       Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
                        //     },
                        //   })
                      },
                    },
                  ],
                }}
              />
              <ReportsDasboardMenus
                title="Deduction Report"
                description="View report for government remittances for employees or company admins."
                onInputChange={handleDeductionReportDepartmentChange}
                form={{
                  forms: [
                    {
                      label: 'Choose Department/s',
                      type: FormType.MultiSelect,
                      name: 'cycle',
                      placeholder: 'Choose Department/s',
                      options: deductionReportDepartmentsQuery.data,
                      isVisible: true,
                      isRequired: false,
                      isDisabled: false,
                      value: deductionDataReport.departmentIds,
                    },
                    {
                      label: 'Choose Deduction Type ',
                      type: FormType.MultiSelectForDeduction,
                      name: 'deductionType',
                      placeholder: 'Choose Deduction Type',
                      options: deductionTypeOptions,
                      isVisible: true,
                      isRequired: false,
                      isDisabled: false,
                      value: deductionDataReport.deductionType,
                    },
                    // {
                    //   label: 'Placeholder',
                    //   type: FormType.Button,
                    //   name: 'placeholder',
                    //   placeholder: 'Placeholder',
                    //   isVisible: false,
                    //   isRequired: false,
                    //   isDisabled: false,
                    // },
                    {
                      label: 'Choose Starting Business Month',
                      type: FormType.Dropdown,
                      name: 'startMonth',
                      options: deductionReportBusinessMonths,
                      value:
                        deductionDataReport && deductionDataReport.startMonth,
                      placeholder: !deductionReportBusinessMonthsQuery.isLoading
                        ? 'Choose Business Month'
                        : 'Loading. Please wait...',
                      isVisible: true,
                      isRequired: true,
                      isDisabled: false,
                    },
                    {
                      label: 'Choose Ending Business Month',
                      type: FormType.Dropdown,
                      name: 'endMonth',
                      options: deductionReportBusinessMonths,
                      value:
                        deductionDataReport && deductionDataReport.endMonth,
                      placeholder: !deductionReportBusinessMonthsQuery.isLoading
                        ? 'Choose Business Month'
                        : 'Loading. Please wait...',
                      isVisible: true,
                      isRequired: true,
                      isDisabled: deductionDataReport.startMonth === null,
                    },
                  ],
                  buttons: [
                    {
                      label: 'Download XLS',
                      isDisabled:
                        deductionDataReport.departmentIds.length <= 0 ||
                        deductionDataReport.endMonth === null ||
                        deductionDataReport.startMonth === null,
                      type: ButtonType.Black,
                      handler: async () => {
                        generateDeductionReport();
                      },
                    },
                  ],
                }}
              />
            </>
          )}
        </div>
      </React.Fragment>

      {/* COMPANY LEDGER REPORT SIDEBAR */}
      <CompanyLedgerReportSidebar
        configuration={{
          isOpen: isCompanyLedgerReportSidebarOpen,
          setIsOpen: setIsCompanyLedgerReportSidebarOpen,
        }}
        label={{
          mainHeader: `${
            companyId || context?.userData.company.companyName
          } | Company Ledger Report`,
        }}
        companyId={companyId}
      />

      <SidebarReportsView
        configuration={{
          isOpen: sidebarState.state,
          setIsOpen: (value: boolean) =>
            setSidebarState((prev) => ({ ...prev, state: value })),
        }}
        label={{ mainHeader: sidebarState.title, header: '', subHeader: '' }}
        items={sidebarState.items}
      />

      <PDFDownloadLink
        className="w-full"
        document={
          <Document>
            {timeKeepingReports.length > 0
              ? timeKeepingReports.map((data: any, index: number) => {
                  if (index == 0) {
                    if (data.employee.attendances.length > 25) {
                      return (
                        <>
                          <Page
                            key={`${number}`}
                            size="LETTER"
                            style={{
                              fontSize: 9,
                            }}
                          >
                            <View
                              style={{
                                color: 'black',
                                margin: 30,
                                display: 'flex',
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: '15px',
                                  fontWeight: 'bold',
                                  textAlign: 'center',
                                  marginVertical: '6px',
                                  fontFamily: 'Helvetica-Bold',
                                }}
                              >
                                {data.company.companyName
                                  .replaceAll('Ã±', 'ñ')
                                  .replaceAll('Ã‘', 'Ñ')}
                              </Text>
                              <Text
                                style={{
                                  fontSize: '10.5px',
                                  textAlign: 'center',
                                  marginVertical: '3px',
                                }}
                              >
                                {data.company.companyAddress
                                  .replaceAll('Ã±', 'ñ')
                                  .replaceAll('Ã‘', 'Ñ')}
                              </Text>
                              <Text
                                style={{
                                  fontSize: '10.5px',
                                  textAlign: 'center',
                                  marginVertical: '3px',
                                }}
                              >
                                {data.company.emailAddress
                                  .replaceAll('Ã±', 'ñ')
                                  .replaceAll('Ã‘', 'Ñ')}
                              </Text>
                              <Text
                                style={{
                                  fontSize: '11px',
                                  textAlign: 'center',
                                  marginTop: '9px',
                                  marginBottom: '4px',
                                  fontWeight: 'bold',
                                  fontFamily: 'Helvetica-Bold',
                                }}
                              >
                                TIME KEEPING REPORT
                              </Text>
                              <Text
                                style={{
                                  fontSize: '11px',
                                  textAlign: 'center',
                                  marginVertical: '4px',
                                  fontWeight: 'bold',
                                  fontFamily: 'Helvetica-Bold',
                                }}
                              >
                                Month of {timeKeepingDataReport.businessMonth}
                              </Text>
                            </View>
                            <View>
                              {index === 0 && (
                                <View
                                  style={{ width: '85%', alignSelf: 'center' }}
                                >
                                  <Text
                                    style={{
                                      fontSize: '11px',
                                      marginVertical: '6px',
                                      fontWeight: 'bold',
                                      fontFamily: 'Helvetica-Bold',
                                    }}
                                  >
                                    Total Active -{' '}
                                    {
                                      timeKeepingReports.filter(
                                        (data: any) =>
                                          data.employee.employeeStatus == 1
                                      ).length
                                    }{' '}
                                    &nbsp; &nbsp; Total Inactive -{' '}
                                    {
                                      timeKeepingReports.filter(
                                        (data: any) =>
                                          data.employee.employeeStatus == 2
                                      ).length
                                    }
                                  </Text>
                                </View>
                              )}
                              <View
                                style={{ width: '85%', alignSelf: 'center' }}
                              >
                                <Text
                                  style={{
                                    fontSize: '11px',
                                    marginVertical: '6px',
                                    fontWeight: 'bold',
                                    fontFamily: 'Helvetica-Bold',
                                  }}
                                >
                                  {data.employee.employeeCode} -{' '}
                                  {data.lastName
                                    .replaceAll('Ã±', 'ñ')
                                    .replaceAll('Ã‘', 'Ñ')
                                    .toUpperCase()}
                                  ,{' '}
                                  {data.firstName
                                    .replaceAll('Ã±', 'ñ')
                                    .replaceAll('Ã‘', 'Ñ')
                                    .toUpperCase()}{' '}
                                  -{' '}
                                  {data.employee.employeeStatus === 2
                                    ? 'INACTIVE'
                                    : 'ACTIVE'}
                                </Text>
                              </View>
                              <TimeKeepingReportTable
                                data={data.employee.attendances.slice(0, 25)}
                              />
                            </View>
                          </Page>
                          <Page
                            key={`${number}`}
                            size="LETTER"
                            style={{
                              fontSize: 9,
                            }}
                          >
                            <View>
                              <Text
                                style={{
                                  fontSize: '11px',
                                  marginVertical: '14px',
                                  fontWeight: 'bold',
                                  fontFamily: 'Helvetica-Bold',
                                  color: 'transparent',
                                }}
                              >
                                empty space
                              </Text>
                              <TimeKeepingReportTable
                                data={data.employee.attendances.slice(25)}
                              />
                            </View>
                          </Page>
                        </>
                      );
                    } else {
                      return (
                        <Page
                          key={`${number}`}
                          size="LETTER"
                          style={{
                            fontSize: 9,
                          }}
                        >
                          <View
                            style={{
                              color: 'black',
                              margin: 30,
                              display: 'flex',
                            }}
                          >
                            <Text
                              style={{
                                fontSize: '15px',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                marginVertical: '6px',
                                fontFamily: 'Helvetica-Bold',
                              }}
                            >
                              {data.company.companyName
                                .replaceAll('Ã±', 'ñ')
                                .replaceAll('Ã‘', 'Ñ')}
                            </Text>
                            <Text
                              style={{
                                fontSize: '10.5px',
                                textAlign: 'center',
                                marginVertical: '3px',
                              }}
                            >
                              {data.company.companyAddress
                                .replaceAll('Ã±', 'ñ')
                                .replaceAll('Ã‘', 'Ñ')}
                            </Text>
                            <Text
                              style={{
                                fontSize: '10.5px',
                                textAlign: 'center',
                                marginVertical: '3px',
                              }}
                            >
                              {data.company.emailAddress}
                            </Text>
                            <Text
                              style={{
                                fontSize: '11px',
                                textAlign: 'center',
                                marginTop: '9px',
                                marginBottom: '4px',
                                fontWeight: 'bold',
                                fontFamily: 'Helvetica-Bold',
                              }}
                            >
                              TIME KEEPING REPORT
                            </Text>
                            <Text
                              style={{
                                fontSize: '11px',
                                textAlign: 'center',
                                marginVertical: '4px',
                                fontWeight: 'bold',
                                fontFamily: 'Helvetica-Bold',
                              }}
                            >
                              Month of {timeKeepingDataReport.businessMonth}
                            </Text>
                          </View>
                          <View>
                            {index === 0 && (
                              <View
                                style={{ width: '85%', alignSelf: 'center' }}
                              >
                                <Text
                                  style={{
                                    fontSize: '11px',
                                    marginVertical: '6px',
                                    fontWeight: 'bold',
                                    fontFamily: 'Helvetica-Bold',
                                  }}
                                >
                                  Total Active -{' '}
                                  {
                                    timeKeepingReports.filter(
                                      (data: any) =>
                                        data.employee.employeeStatus == 1
                                    ).length
                                  }{' '}
                                  &nbsp; &nbsp; Total Inactive -{' '}
                                  {
                                    timeKeepingReports.filter(
                                      (data: any) =>
                                        data.employee.employeeStatus == 2
                                    ).length
                                  }
                                </Text>
                              </View>
                            )}
                            <View style={{ width: '85%', alignSelf: 'center' }}>
                              <Text
                                style={{
                                  fontSize: '11px',
                                  marginVertical: '6px',
                                  fontWeight: 'bold',
                                  fontFamily: 'Helvetica-Bold',
                                }}
                              >
                                {data.employee.employeeCode} -{' '}
                                {data.lastName
                                  .replaceAll('Ã±', 'ñ')
                                  .replaceAll('Ã‘', 'Ñ')
                                  .toUpperCase()}
                                ,{' '}
                                {data.firstName
                                  .replaceAll('Ã±', 'ñ')
                                  .replaceAll('Ã‘', 'Ñ')
                                  .toUpperCase()}{' '}
                                -{' '}
                                {data.employee.employeeStatus === 2
                                  ? 'INACTIVE'
                                  : 'ACTIVE'}
                              </Text>
                            </View>
                            <TimeKeepingReportTable
                              data={data.employee.attendances}
                            />
                          </View>
                        </Page>
                      );
                    }
                  } else {
                    if (data.employee.attendances.length > 26) {
                      return (
                        <>
                          <Page
                            key={`${number}`}
                            size="LETTER"
                            style={{
                              fontSize: 9,
                            }}
                          >
                            <View
                              style={{
                                color: 'black',
                                margin: 30,
                                display: 'flex',
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: '15px',
                                  fontWeight: 'bold',
                                  textAlign: 'center',
                                  marginVertical: '6px',
                                  fontFamily: 'Helvetica-Bold',
                                }}
                              >
                                {data.company.companyName
                                  .replaceAll('Ã±', 'ñ')
                                  .replaceAll('Ã‘', 'Ñ')}
                              </Text>
                              <Text
                                style={{
                                  fontSize: '10.5px',
                                  textAlign: 'center',
                                  marginVertical: '3px',
                                }}
                              >
                                {data.company.companyAddress
                                  .replaceAll('Ã±', 'ñ')
                                  .replaceAll('Ã‘', 'Ñ')}
                              </Text>
                              <Text
                                style={{
                                  fontSize: '10.5px',
                                  textAlign: 'center',
                                  marginVertical: '3px',
                                }}
                              >
                                {data.company.emailAddress
                                  .replaceAll('Ã±', 'ñ')
                                  .replaceAll('Ã‘', 'Ñ')}
                              </Text>
                              <Text
                                style={{
                                  fontSize: '11px',
                                  textAlign: 'center',
                                  marginTop: '9px',
                                  marginBottom: '4px',
                                  fontWeight: 'bold',
                                  fontFamily: 'Helvetica-Bold',
                                }}
                              >
                                TIME KEEPING REPORT
                              </Text>
                              <Text
                                style={{
                                  fontSize: '11px',
                                  textAlign: 'center',
                                  marginVertical: '4px',
                                  fontWeight: 'bold',
                                  fontFamily: 'Helvetica-Bold',
                                }}
                              >
                                Month of {timeKeepingDataReport.businessMonth}
                              </Text>
                            </View>
                            <View>
                              <View
                                style={{ width: '85%', alignSelf: 'center' }}
                              >
                                <Text
                                  style={{
                                    fontSize: '11px',
                                    marginVertical: '6px',
                                    fontWeight: 'bold',
                                    fontFamily: 'Helvetica-Bold',
                                  }}
                                >
                                  {data.employee.employeeCode} -{' '}
                                  {data.lastName
                                    .replaceAll('Ã±', 'ñ')
                                    .replaceAll('Ã‘', 'Ñ')
                                    .toUpperCase()}
                                  ,{' '}
                                  {data.firstName
                                    .replaceAll('Ã±', 'ñ')
                                    .replaceAll('Ã‘', 'Ñ')
                                    .toUpperCase()}{' '}
                                  -{' '}
                                  {data.employee.employeeStatus === 2
                                    ? 'INACTIVE'
                                    : 'ACTIVE'}
                                </Text>
                              </View>
                              <TimeKeepingReportTable
                                data={data.employee.attendances.slice(0, 26)}
                              />
                            </View>
                          </Page>
                          <Page
                            key={`${number}`}
                            size="LETTER"
                            style={{
                              fontSize: 9,
                            }}
                          >
                            <View>
                              <Text
                                style={{
                                  fontSize: '11px',
                                  marginVertical: '14px',
                                  fontWeight: 'bold',
                                  fontFamily: 'Helvetica-Bold',
                                  color: 'transparent',
                                }}
                              >
                                empty space
                              </Text>
                              <TimeKeepingReportTable
                                data={data.employee.attendances.slice(26)}
                              />
                            </View>
                          </Page>
                        </>
                      );
                    } else {
                      return (
                        <Page
                          key={`${number}`}
                          size="LETTER"
                          style={{
                            fontSize: 9,
                          }}
                        >
                          <View
                            style={{
                              color: 'black',
                              margin: 30,
                              display: 'flex',
                            }}
                          >
                            <Text
                              style={{
                                fontSize: '15px',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                marginVertical: '6px',
                                fontFamily: 'Helvetica-Bold',
                              }}
                            >
                              {data.company.companyName
                                .replaceAll('Ã±', 'ñ')
                                .replaceAll('Ã‘', 'Ñ')}
                            </Text>
                            <Text
                              style={{
                                fontSize: '10.5px',
                                textAlign: 'center',
                                marginVertical: '3px',
                              }}
                            >
                              {data.company.companyAddress
                                .replaceAll('Ã±', 'ñ')
                                .replaceAll('Ã‘', 'Ñ')}
                            </Text>
                            <Text
                              style={{
                                fontSize: '10.5px',
                                textAlign: 'center',
                                marginVertical: '3px',
                              }}
                            >
                              {data.company.emailAddress
                                .replaceAll('Ã±', 'ñ')
                                .replaceAll('Ã‘', 'Ñ')}
                            </Text>
                            <Text
                              style={{
                                fontSize: '11px',
                                textAlign: 'center',
                                marginTop: '9px',
                                marginBottom: '4px',
                                fontWeight: 'bold',
                                fontFamily: 'Helvetica-Bold',
                              }}
                            >
                              TIME KEEPING REPORT
                            </Text>
                            <Text
                              style={{
                                fontSize: '11px',
                                textAlign: 'center',
                                marginVertical: '4px',
                                fontWeight: 'bold',
                                fontFamily: 'Helvetica-Bold',
                              }}
                            >
                              Month of {timeKeepingDataReport.businessMonth}
                            </Text>
                          </View>
                          <View>
                            <View style={{ width: '85%', alignSelf: 'center' }}>
                              <Text
                                style={{
                                  fontSize: '11px',
                                  marginVertical: '6px',
                                  fontWeight: 'bold',
                                  fontFamily: 'Helvetica-Bold',
                                }}
                              >
                                {data.employee.employeeCode} -{' '}
                                {data.lastName
                                  .replaceAll('Ã±', 'ñ')
                                  .replaceAll('Ã‘', 'Ñ')
                                  .toUpperCase()}
                                ,{' '}
                                {data.firstName
                                  .replaceAll('Ã±', 'ñ')
                                  .replaceAll('Ã‘', 'Ñ')
                                  .toUpperCase()}{' '}
                                -{' '}
                                {data.employee.employeeStatus === 2
                                  ? 'INACTIVE'
                                  : 'ACTIVE'}
                              </Text>
                            </View>
                            <TimeKeepingReportTable
                              data={data.employee.attendances}
                            />
                          </View>
                        </Page>
                      );
                    }
                  }
                })
              : ''}
          </Document>
        }
        fileName={`${timeKeepingDataReport.businessMonth} - ${moment().format(
          'MM/DD/YYYY hh:mm:ss'
        )}.pdf`}
      >
        <p
          ref={downloadTKR}
          className={'hidden'}
          onClick={() => {
            toast.current?.replace({
              severity: 'success',
              summary: 'Time Keeping Report generated successfully',
              closable: true,
              life: 5000,
            });
          }}
        >
          Download buttton
        </p>
      </PDFDownloadLink>

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
                {arr.map((data: any, index: number) => {
                  const workedOnRD = data?.workedOnRestDays;
                  const workedOnSPHD = data?.workedOnSpecialHoliday;
                  const workedOnSPHDWhileRD =
                    data?.workedOnSpecialHolidayWhileRestDay;
                  const workedOnRHD = data?.workedOnRegularHoliday;
                  const workedOnRHDWhileRD =
                    data?.workedOnRegularHolidayWhileRestDay;
                  const halfdayPresentonRHD =
                    data?.halfDayPresentOnRegularHoliday;
                  const OTonRegDays = data?.overtimeOnRegularDays;
                  const OTonHolidays = data?.overtimeOnHolidays;
                  const OTonRestDays = data?.overtimeOnRestDays;
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

                          <Text>
                            {data.employee?.employee_profile
                              ?.employeeFullName || ''}
                          </Text>
                        </View>
                        <View style={styles.row}>
                          <View style={{ ...styles.headers, width: '50%' }}>
                            <Text style={styles.boldText}>Payroll Month: </Text>
                            <Text>{data.businessMonth}</Text>
                          </View>
                          <View style={{ ...styles.headers, width: '50%' }}>
                            <Text style={styles.boldText}>Cycle: </Text>
                            <Text>{properCasing(data.cycle)}</Text>
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
                            <View style={styles.paragrahWithPaddingBottom}>
                              <Text style={{ fontWeight: 'bold' }}>
                                PAY DESCRIPTION
                              </Text>
                              <Text style={{ fontWeight: 'bold' }}>TOTAL</Text>
                            </View>

                            <View style={styles.paragrah}>
                              <Text>PHP 0.00</Text>
                            </View>
                            <View style={styles.paragrah}>
                              <Text>Rest Days</Text>
                              <Text>PHP 0.00</Text>
                            </View>

                            <View style={styles.paragrah}>
                              <Text>OT</Text>
                              <Text>
                                PHP {amountFormatter(data.overtimePay) || 0.0}
                              </Text>
                            </View>
                            <View style={styles.paragrah}>
                              <Text>Night Differential</Text>
                              <Text>
                                PHP {amountFormatter(data.nightDiffPay) || 0.0}
                              </Text>
                            </View>
                            <View style={styles.paragrah}>
                              <Text>Reg. Holidays</Text>
                              <Text>PHP 0.0</Text>
                            </View>
                            <View style={styles.paragrah}>
                              <Text>Spec. Holidays</Text>
                              <Text>PHP 0.0</Text>
                            </View>
                            <View style={styles.paragrah}>
                              <Text>Leaves</Text>
                              <Text>PHP 0.0</Text>
                            </View>

                            <View style={styles.paragrah}>
                              <Text>Adjustments</Text>
                              <Text>PHP 0.0</Text>
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
                              <Text>PHP {amountFormatter(data.grossPay)}</Text>
                            </View>
                          </View>
                          <View
                            style={{
                              ...styles.paragraphBottomSpace,
                              width: '50%',
                            }}
                          >
                            <View style={styles.paragrahWithPaddingBottom}>
                              <Text style={{ fontWeight: 'bold' }}>
                                DEDUCTION DESCRIPTION
                              </Text>
                              <Text style={{ fontWeight: 'bold' }}>TOTAL</Text>
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
                            <Text>PHP {amountFormatter(data.netPay)}</Text>
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
        fileName={`test - ${moment().format('MM/DD/YYYY hh:mm:ss')}.pdf`}
      >
        <p
          ref={downloadDTR}
          className={'hidden'}
          onClick={() => {
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
    </div>
  );
};

export default Index;
