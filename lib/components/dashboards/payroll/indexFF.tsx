/* eslint-disable react/no-unescaped-entities */
'use client';

import React, { useContext, useEffect, useRef, useState } from 'react';

import { Toast } from 'primereact/toast';

import { directPayrollImportHeaders } from '@constant/csvData';
import { ButtonType } from '@enums/button';
import { FormType } from '@enums/sidebar';
import {
  Document,
  Page,
  PDFDownloadLink,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';
import { useQueries, useQuery } from '@tanstack/react-query';
import { addS, amountFormatter, properCasing, uuidv4 } from '@utils/helper';
import { ellipsisize } from '@utils/stringHelper';
import axios from 'axios';
import ExcelJS from 'exceljs';
import CompanyWalletAcctMiniCards from 'lib/components/blocks/companyWalletAcctMiniCards';
import DashboardNav from 'lib/components/blocks/dashboardNav';
import ErrorDialog from 'lib/components/blocks/errorDialog';
import SideBar from 'lib/components/blocks/sideBar';
import { GlobalContainer } from 'lib/context/globalContext';
import moment from '@constant/momentTZ';
import { FilterMatchMode } from 'primereact/api';
import { Badge } from 'primereact/badge';
import { Dialog } from 'primereact/dialog';
import { Paginator } from 'primereact/paginator';
import { TabPanel, TabView } from 'primereact/tabview';
import { CSVLink } from 'react-csv';
import CSVUpload from './csvUpload';
import DirectPayrollDownloadSidebar from './directPayrollDownloadSidebar';
import EmployeePayroll from './employeePayroll';
import NewPayrollTable from './newPayrollTable';
import ProgressBar from './progressBar';

const Index = ({ actions }: { actions: [] }) => {
  const context = useContext(GlobalContainer);
  const userData = context?.userData;
  const toast = useRef<Toast>(null);
  const [backendError, setBackendError] = useState<any>([]);
  const downloadDirectPayrollTemplate: any = useRef<any>(null);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [pageActions, setPageActions] = useState<any>({
    downloadAndImportPayroll: false,
    generateReport: false,
    editPayroll: false,
    deletePayroll: false,
    postPayroll: false,
  });
  const [pendingPayrollfilters, setPendingPayrollFilters] = useState({
    departmentId: {
      value: null,
      matchMode: FilterMatchMode.EQUALS,
    },
    businessMonth: {
      value: null,
      matchMode: FilterMatchMode.CONTAINS,
    },
  });

  const [postedPayrollfilters, setPostedPayrollFilters] = useState({
    departmentId: {
      value: null,
      matchMode: FilterMatchMode.EQUALS,
    },
    businessMonth: {
      value: null,
      matchMode: FilterMatchMode.CONTAINS,
    },
  });
  const [failedPayrollfilters, setFailedPayrollFilters] = useState({
    departmentName: {
      value: null,
      matchMode: FilterMatchMode.EQUALS,
    },
    businessMonth: {
      value: null,
      matchMode: FilterMatchMode.CONTAINS,
    },
  });
  const [selectedRows, setSelectedRows] = useState<any>([]);
  // const [showDisbursementSchedule, setShowDisbursementSchedule] =
  //   useState(false);
  const [importDirectPayroll, setimportDirectPayroll] = useState(false);
  const [uuid, setUUID] = useState(uuidv4());
  const downloadPayslipRef: any = useRef<any>(null);
  const [isDisabled, setIsDisabled] = useState<any>(false);
  const [payrollReports, setPayrollReports] = useState<any>([]);
  const [departmentOpts, setDepartmentOpts] = useState<any>(null);
  const [pendingBusinessMonthOpts, setPendingBusinessMonthOpts] = useState<any>(
    []
  );
  const [postedBusinessMonthOpts, setPostedBusinessMonthOpts] = useState<any>(
    []
  );
  const [pendingOptions, setPendingOptions] = useState<any>([]);
  const [postedOptions, setPostedOptions] = useState<any>([]);
  const [businessMonthCycleOpts, setBusinessMonthCycleOpts] = useState<any>([]);
  const [postPayroll, setPostPayroll] = useState(false);
  const [directPayroll, setDirectPayroll] = useState(false);
  const [selectedDepartmentName, setSelectedDepartmentName] =
    useState<string>('');
  const [payslip, setPayslip] = useState(false);
  const [payslipReport, setPayslipReport] = useState(false);
  const [formDataPost, setFormDataPost] = useState<any>('');
  const [departmentNameForPayrollReport, setDepartmentNameForPayrollReport] =
    useState<string>('');
  const [pendingMonthSelected, setPendingMonthSelected] = useState<string>('');
  const [postedMonthSelected, setPostedMonthSelected] = useState<string>('');
  const [sideBarConfig, setSideBarConfig] = useState<SideBarConfig>({
    title: '',
    submitBtnText: '',
    action: '',
    rowData: {},
    isOpen: false,
    tableFor: '',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [pendingPayrollPagination, setPendingPayrollPagination] = useState({
    offset: 0,
    limit: 5,
    first: 0,
  });
  const [postedPayrollPagination, setPostedPayrollPagination] = useState({
    offset: 0,
    limit: 5,
    first: 0,
  });
  const [failedPayrollPagination, setFailedPayrollPagination] = useState({
    offset: 0,
    limit: 5,
    first: 0,
  });
  useEffect(() => {
    if (userData.role == 'ADMIN' || userData.role == 'SUPER_ADMIN') {
      setPageActions({
        downloadAndImportPayroll: true,
        generateReport: true,
        editPayroll: true,
        deletePayroll: true,
        postPayroll: true,
      });
      return;
    }
    let tempActions = { ...pageActions };

    for (let i = 0; i < actions?.length; i++) {
      switch (actions[i]) {
        case 'DOWNLOAD AND IMPORT DIRECT PAYROLL':
          tempActions.downloadAndImportPayroll = true;
          break;
        case 'GENERATE REPORT':
          tempActions.generateReport = true;
          break;
        case 'EDIT PAYROLL':
          tempActions.editPayroll = true;
          break;
        case 'DELETE PAYROLL':
          tempActions.deletePayroll = true;
          break;
        case 'POST PAYROLL':
          tempActions.postPayroll = true;
          break;
      }
    }
    setPageActions(tempActions);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [directPayrollData, setDirectPayrollData] = useState<any[]>([]);
  const [pendingDeptName, setPendingDeptName] = useState<string | null>(null);
  const [postedDeptName, setPostedDeptName] = useState<string | null>(null);
  // const [forceRefresher, setForceRefresher] = useState(false);
  const [pendingTotals, setPendingTotals] = useState({
    totalNetPay: 0,
    totalAdditionalCharge: 0,
    disbursedTotalNetPay: 0,
  });
  const [postedTotals, setPostedTotals] = useState({
    totalNetPay: 0,
    totalAdditionalCharge: 0,
    disbursedTotalNetPay: 0,
  });

  const pendingOptsQuery = useQuery({
    refetchOnWindowFocus: true,
    queryKey: [
      'pendingOptions',
      pendingPayrollfilters.departmentId.value,
      pendingPayrollfilters.businessMonth.value,
      searchQuery,
    ],
    queryFn: async () => {
      const response = await axios.post(
        `/api/payrolls/options`,
        // ?status=PENDING&departmentName=${
        //   pendingPayrollfilters.departmentName.value == null
        //     ? ''
        //     : pendingPayrollfilters.departmentName.value
        // }&businessMonth=${
        //   pendingPayrollfilters.businessMonth.value == null
        //     ? ''
        //     : pendingPayrollfilters.businessMonth.value
        // }`
        {
          status: 'PENDING',
          departmentId:
            pendingPayrollfilters.departmentId.value == null
              ? ''
              : pendingPayrollfilters.departmentId.value,
          businessMonth:
            pendingPayrollfilters.businessMonth.value == null
              ? ''
              : pendingPayrollfilters.businessMonth.value,
          search: searchQuery,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
          },
        }
      );

      setPendingOptions(response.data);
      return response.data;
    },
  });
  const postedOptsQuery = useQuery({
    refetchOnWindowFocus: false,
    queryKey: [
      'postedOptions',
      postedPayrollfilters.departmentId.value,
      postedPayrollfilters.businessMonth.value,
      searchQuery,
    ],
    queryFn: async () => {
      const response = await axios.post(
        `/api/payrolls/options`,
        {
          status: 'POSTED',
          departmentId:
            postedPayrollfilters.departmentId.value == null
              ? ''
              : postedPayrollfilters.departmentId.value,
          businessMonth:
            postedPayrollfilters.businessMonth.value == null
              ? ''
              : postedPayrollfilters.businessMonth.value,
          search: searchQuery,
        },

        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
          },
        }
      );
      // console.log(response.data);
      setPostedOptions(response.data);
      // console.log(postedPayrollPagination);
      return response.data;
    },
  });
  const [
    pendingPayrollQuery,
    postedPayrollQuery,
    failedPayrollQuery,
    departmentsQuery,
    pendingTotalsQuery,
    postedTotalsQuery,
  ] = useQueries({
    queries: [
      {
        refetchOnWindowFocus: true,
        queryKey: [
          'pendingPayrolls',
          pendingPayrollPagination,
          searchQuery,
          pendingPayrollfilters,
        ],
        queryFn: async () => {
          const response: any = await axios.get(
            `/api/payrolls?status=PENDING&limit=${
              pendingPayrollPagination.limit
            }&offset=${
              pendingPayrollPagination.offset
            }&search=${searchQuery}&departmentId=${
              pendingPayrollfilters.departmentId.value == null
                ? ''
                : pendingPayrollfilters.departmentId.value
            }&businessMonth=${
              pendingPayrollfilters.businessMonth.value == null
                ? ''
                : pendingPayrollfilters.businessMonth.value
            }`,
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
        refetchOnWindowFocus: true,
        queryKey: [
          'postedPayrolls',
          postedPayrollPagination,
          searchQuery,
          postedPayrollfilters,
        ],
        queryFn: async () => {
          const response = await axios.get(
            `/api/payrolls?status=POSTED&limit=${
              postedPayrollPagination.limit
            }&offset=${
              postedPayrollPagination.offset
            }&search=${searchQuery}&departmentId=${
              postedPayrollfilters.departmentId.value == null
                ? ''
                : postedPayrollfilters.departmentId.value
            }&businessMonth=${
              postedPayrollfilters.businessMonth.value == null
                ? ''
                : postedPayrollfilters.businessMonth.value
            }`,
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
        refetchOnWindowFocus: true,
        queryKey: ['failedPayrolls', failedPayrollPagination, searchQuery],
        queryFn: async () => {
          const response = await axios.get(
            `/api/payrolls?status=FAILED&limit=${failedPayrollPagination.limit}&offset=${failedPayrollPagination.offset}&search=${searchQuery}&departmentName=&businessMonth=`,
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
        queryKey: ['departments'],
        queryFn: async () => {
          const response = await axios.get(
            `/api/companies/paycycles/departments`,
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
        refetchOnWindowFocus: true,
        queryKey: ['pendingTotals', searchQuery, pendingPayrollfilters],
        queryFn: async () => {
          const response = await axios.get(
            `/api/payrolls/total?status=PENDING&search=${searchQuery}&departmentId=${
              pendingPayrollfilters.departmentId.value == null
                ? ''
                : pendingPayrollfilters.departmentId.value
            }&businessMonth=${
              pendingPayrollfilters.businessMonth.value == null
                ? ''
                : pendingPayrollfilters.businessMonth.value
            }`,
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
        refetchOnWindowFocus: true,
        queryKey: ['postedTotals', searchQuery, postedPayrollfilters],
        queryFn: async () => {
          const response = await axios.get(
            `/api/payrolls/total?status=POSTED&search=${searchQuery}&departmentId=${
              postedPayrollfilters.departmentId.value == null
                ? ''
                : postedPayrollfilters.departmentId.value
            }&businessMonth=${
              postedPayrollfilters.businessMonth.value == null
                ? ''
                : postedPayrollfilters.businessMonth.value
            }`,
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

  const onInputChangePost = (fieldName: string, value: string) => {
    setFormDataPost((prev: any) => ({ ...prev, [fieldName]: value }));
    setIsDisabled(false);

    if (fieldName == 'departmentId') {
      setFormDataPost((prev: any) => ({ ...prev, businessMonthCycle: null }));
      // setFormDataPost((prev: any) => ({ ...prev, disbursementSchedule: null }));
      // setShowDisbursementSchedule(false);
      if (pendingPayrollQuery.isLoading) {
        setBusinessMonthCycleOpts({
          name: 'Loading. Please wait...',
          code: 'Loading. Please wait...',
        });
      } else {
        const unpostedPayrolls = pendingPayrollQuery?.data.count.filter(
          (item: any) => !item.isPosted && item.departmentId == value
        );
        setBusinessMonthCycleOpts(
          unpostedPayrolls.map((item: any) => ({
            name: `${item.businessMonth} - ${item.cycle}${
              item.isDirect ? ' - Direct Upload' : ''
            }`,
            code: `${item.businessMonth} - ${item.cycle}${
              item.isDirect ? ' - Direct Upload' : ''
            }`,
          }))
        );
      }
    } else if (fieldName == 'businessMonthCycle') {
      const businessMonthCycle = value.split(' - ');
      const businessMonth = businessMonthCycle[0];
      const cycle = businessMonthCycle[1];
      const unpostedPayrolls = pendingPayrollQuery?.data.count.filter(
        (item: any) =>
          !item.isPosted &&
          item.businessMonth == businessMonth &&
          item.cycle == cycle
      );
      // setShowDisbursementSchedule(unpostedPayrolls[0].isDirect ? true : false);
      // if (unpostedPayrolls[0].isDirect) {
      //   setFormDataPost((prev: any) => ({
      //     ...prev,
      //     disbursementSchedule: new Date(moment().add(5, 'minutes').format()),
      //   }));
      // }
    }
  };

  const onInputChangeReports = (fieldName: string, value: any) => {
    // setFormDataPost((prev: any) => ({ ...prev, businessMonthCycle: null }));
    setFormDataPost((prev: any) => ({ ...prev, [fieldName]: value }));
    setIsDisabled(false);

    if (fieldName == 'departmentId') {
      if (!postedPayrollQuery.isLoading && departmentOpts) {
        // const dept = departmentOpts.find((dpt: any) => {
        //   return dpt.code == value;
        // });
        // setDepartmentNameForPayrollReport(() => dept.name);
      }
      if (postedPayrollQuery.isLoading) {
        setBusinessMonthCycleOpts({
          name: 'Loading. Please wait...',
          code: 'Loading. Please wait...',
        });
      } else {
        setFormDataPost((prev: any) => ({
          ...prev,
          businessMonthCycle: null,
        }));
        const postedPayrolls = postedPayrollQuery?.data.count
          .filter((item: any) =>
            value.some(
              (dpt: any) => item.isPosted && item.departmentId == dpt.code
            )
          )
          .map((item: any) => ({
            name: `${item.businessMonth} - ${item.cycle}  (${item.departmentName})`,
            code: `${item.businessMonth} - ${item.cycle}`,
            departmentId: item.departmentId,
          }));
        setBusinessMonthCycleOpts([...postedPayrolls]);
        // setFormDataPost((prev: any) => ({
        //   ...prev,
        //   businessMonthCycle:
        //     currentBusinessMonthCycle?.filter((item: any) =>
        //       value.some((dpt: any) => item.departmentId == dpt.code)
        //     ) || null,
        // }));
      }
    }
  };

  // payroll report filter logic
  useEffect(() => {
    if (formDataPost?.businessMonthCycle?.length >= 1) {
      setBusinessMonthCycleOpts((prev: any) =>
        prev.filter((prev: any) => {
          return (
            prev.code?.trim().toLowerCase() ===
            formDataPost.businessMonthCycle[0].code?.trim().toLowerCase()
          );
        })
      );
    } else if (formDataPost?.businessMonthCycle?.length < 1) {
      const postedPayrolls = postedPayrollQuery?.data.count
        .filter((item: any) =>
          formDataPost?.departmentId?.map(
            (dpt: any) => item.isPosted && item.departmentId == dpt.code
          )
        )
        .map((item: any) => ({
          name: `${item.businessMonth} - ${item.cycle}  (${item.departmentName})`,
          code: `${item.businessMonth} - ${item.cycle}`,
          departmentId: item.departmentId,
        }));
      const uniquePayrolls = Array.from(
        new Map(postedPayrolls.map((item: any) => [item.code, item])).values()
      );
      setBusinessMonthCycleOpts(uniquePayrolls);
    }
  }, [JSON.stringify(formDataPost.businessMonthCycle)]);

  const [processingPayroll, setProcessingPayroll] = useState<
    ProcessingPayroll[]
  >([]);
  // const postPayrollHandler = async () => {
  //   toast.current?.replace({
  //     severity: 'info',
  //     summary: 'Posting Payroll',
  //     detail: 'Please wait...',
  //     sticky: true,
  //     closable: false,
  //   });

  //   setIsDisabled(true);
  //   const departmentId = formDataPost.departmentId;
  //   const businessMonthCycle = formDataPost.businessMonthCycle.split(' - ');
  //   const businessMonth = businessMonthCycle[0];
  //   const cycle = businessMonthCycle[1];
  //   const isDirect = businessMonthCycle[2] ? true : false;

  //   const count: any = await countPayrolls({
  //     businessMonth: businessMonth,
  //     cycle: cycle,
  //     departmentId: departmentId,
  //     isDirect: isDirect,
  //     isReposting: false,
  //   });
  //   if (!count.success) {
  //     setBackendError(count.message);
  //     setIsDisabled(false);
  //     return;
  //   }

  //   const { totalPayroll, departmentName } = count.data;

  //   const checkInProgress = await isCompanyProcessing({
  //     taskName: 'Post Payroll',
  //     departmentName: departmentName,
  //     businessMonth: businessMonth,
  //     cycle: cycle,
  //   });

  //   if (checkInProgress) {
  //     toast.current?.replace({
  //       severity: 'warn',
  //       summary: 'This action is prohibited',
  //       detail: 'The system is currently processing this entry.',
  //       life: 5000,
  //       closable: true,
  //     });
  //     setIsDisabled(false);
  //     return;
  //   }

  //   const taskId = uuidv4();
  //   const taskName = `Post Payroll`;
  //   setProcessingPayroll((prev: ProcessingPayroll[]) => [
  //     ...prev,
  //     {
  //       taskId: taskId,
  //       totalProcess: totalPayroll,
  //       percentage: 0,
  //       taskName: taskName,
  //       departmentName: departmentName,
  //       businessMonth: businessMonth,
  //       cycle: cycle,
  //       createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
  //       successCount: 0,
  //       status: 0,
  //       failedRemarks: [],
  //     },
  //   ]);

  //   logTaskProcess({
  //     taskCode: taskId,
  //     taskName: taskName,
  //     departmentName: departmentName,
  //     businessMonth: businessMonth,
  //     cycle: cycle,
  //     status: 0,
  //   });

  //   setIsDisabled(false);
  //   setFormDataPost('');
  //   setPostPayroll(false);
  //   toast.current?.clear();

  //   let isProcessing: boolean = true;
  //   const limit: number = 100;
  //   const isReposting = false;
  //   while (isProcessing) {
  //     let payrolls: any = await getPayrolls({
  //       businessMonth: businessMonth,
  //       cycle: cycle,
  //       departmentId: departmentId,
  //       isDirect: isDirect,
  //       isReposting: isReposting,
  //       limit: limit,
  //     });
  //     payrolls = JSON.parse(payrolls);
  //     if (!payrolls.success) {
  //       setProcessingPayroll(
  //         processingPayroll.map((item: ProcessingPayroll) => {
  //           if (item.taskId == taskId) {
  //             item.status = 1;
  //             item.failedRemarks = payrolls.message;
  //           }
  //           return item;
  //         })
  //       );
  //       break;
  //     }
  //     const { payrollData } = payrolls;
  //     if (payrollData.length > 0) {
  //       let checkBalance: any = await computeAndCheckBalances({
  //         isReposting: isReposting,
  //         payrollData: payrollData,
  //       });
  //       checkBalance = JSON.parse(checkBalance);
  //       if (!checkBalance.success) {
  //         setProcessingPayroll(
  //           processingPayroll.map((item: ProcessingPayroll) => {
  //             if (item.taskId == taskId) {
  //               item.status = 1;
  //               item.failedRemarks = checkBalance.message;
  //             }
  //             return item;
  //           })
  //         );
  //         break;
  //       }

  //       const { companyDetails, batchPayrollDetails } = checkBalance.data;
  //       let successCounter: number = 0;
  //       let processedCount = 1;
  //       for (let i = 0; i < batchPayrollDetails.length; i++) {
  //         const payollDetail = batchPayrollDetails[i];
  //         const process = await processDisbursement({
  //           taskDetails: {
  //             taskCode: taskId,
  //             taskName: taskName,
  //             departmentName: departmentName,
  //             businessMonth: businessMonth,
  //             cycle: cycle,
  //           },
  //           payrollDetail: payollDetail,
  //           companyDetails: companyDetails,
  //         });
  //         if (process.success) {
  //           successCounter++;
  //         } else {
  //           if (process.abort) {
  //             isProcessing = false;
  //             setProcessingPayroll((prev: ProcessingPayroll[]) =>
  //               prev.map((item: ProcessingPayroll) => {
  //                 if (item.taskId == taskId) {
  //                   item.totalProcess = totalPayroll;
  //                   item.percentage = 100;
  //                   item.successCount = 0;
  //                   item.status = 1;
  //                   item.failedRemarks = [
  //                     {
  //                       headerTitle: item.departmentName,
  //                       error: duplicateInstanceMsg,
  //                     },
  //                   ];
  //                 }
  //                 return item;
  //               })
  //             );
  //             break;
  //           }
  //         }
  //         setProcessingPayroll((prev: ProcessingPayroll[]) =>
  //           prev.map((item: any) => {
  //             if (item.taskId == taskId) {
  //               item.percentage = Math.round(
  //                 (processedCount / totalPayroll) * 100
  //               );
  //               item.successCount = successCounter;
  //               item.status = processedCount == totalPayroll ? 1 : 0;
  //               item.failedRemarks = process.message
  //                 ? [...item.failedRemarks, ...process.message]
  //                 : JSON.stringify(process);
  //             }
  //             return item;
  //           })
  //         );
  //         processedCount++;
  //       }
  //     } else {
  //       isProcessing = false;
  //     }
  //   }

  //   pendingPayrollQuery.refetch();
  //   postedPayrollQuery.refetch();
  //   postedTotalsQuery.refetch();
  //   pendingTotalsQuery.refetch();
  //   pendingOptsQuery.refetch();
  //   postedOptsQuery.refetch();
  //   failedPayrollQuery?.refetch();
  // };

  const generatePayslipHandler = async () => {
    // console.log('clicked');
    toast.current?.replace({
      severity: 'info',
      summary: 'Generating Payslip!',
      detail: 'Please wait...',
      sticky: true,
      closable: false,
    });

    setIsDisabled(false);

    try {
      const payslipData = await axios.post(
        `/api/payrolls/generateReport`,
        {
          businessMonthCycle: formDataPost.businessMonthCycle,
          departmentId: formDataPost.departmentId,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
          },
        }
      );
      if (
        payslipData.data &&
        payslipData?.data?.payrollReport &&
        payslipData?.data?.payrollReport?.length > 0
      ) {
        setPayrollReports(payslipData.data.payrollReport);
        setTimeout(() => {
          downloadPayslipRef.current.click();
        }, 3000);
      }
    } catch (error: any) {
      toast.current?.replace({
        severity: 'error',
        summary: error.message,
        sticky: true,
        closable: true,
      });
    }
  };
  useEffect(() => {
    setPendingPayrollFilters((prev: any) => ({
      departmentId: {
        value: null,
        matchMode: FilterMatchMode.EQUALS,
      },
      businessMonth: {
        value: null,
        matchMode: FilterMatchMode.CONTAINS,
      },
    }));
    setPostedPayrollFilters((prev: any) => ({
      departmentId: {
        value: null,
        matchMode: FilterMatchMode.EQUALS,
      },
      businessMonth: {
        value: null,
        matchMode: FilterMatchMode.CONTAINS,
      },
    }));
  }, [searchQuery]);
  useEffect(() => {
    if (departmentsQuery?.data && departmentsQuery?.data.length > 0) {
      setDepartmentOpts(
        departmentsQuery?.data.map((item: any) => ({
          name: !item.deletedAt
            ? item.departmentName
            : item.departmentName + ' - DELETED',
          code: item.departmentId,
          others: item,
        }))
      );
    }
  }, [departmentsQuery.data]);

  // filter for pending table
  // useEffect(() => {
  //   const data = pendingPayrollQuery.data?.count;
  //   // console.log(pendingDeptName);
  //   let uniqueCycles = [];
  //   let seen: { [key: string]: boolean } = {};
  //   // console.log(pendingPayrollQuery);
  //   if (data) {
  //     for (let i = 0; i < data.length; i++) {
  //       var item: any = data[i];
  //       let bM = item.businessMonth;
  //       if (
  //         (pendingDeptName === null || pendingDeptName === undefined) &&
  //         !seen[bM]
  //       ) {
  //         uniqueCycles.push(bM);
  //         seen[bM] = true;
  //       } else {
  //         if (item.departmentName === pendingDeptName && !seen[bM]) {
  //           uniqueCycles.push(bM);
  //           seen[bM] = true;
  //         }
  //       }
  //     }
  //   }

  //   setPendingBusinessMonthOpts(uniqueCycles);
  //   // setForceRefresher(!forceRefresher);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [pendingDeptName, pendingPayrollQuery.data?.count]);
  // useEffect(() => {
  //   const data = postedPayrollQuery.data?.count;

  //   let uniqueCycles = [];
  //   let seen: { [key: string]: boolean } = {};
  //   if (data) {
  //     for (let i = 0; i < data.length; i++) {
  //       var item: any = data[i];
  //       let bM = item.businessMonth;
  //       if (
  //         (postedDeptName === null || postedDeptName === undefined) &&
  //         !seen[bM]
  //       ) {
  //         uniqueCycles.push(bM);
  //         seen[bM] = true;
  //       } else {
  //         if (item.departmentName === postedDeptName && !seen[bM]) {
  //           uniqueCycles.push(bM);
  //           seen[bM] = true;
  //         }
  //       }
  //     }
  //   }
  //   setPostedBusinessMonthOpts(uniqueCycles);
  //   // setForceRefresher(!forceRefresher);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [postedDeptName, postedPayrollQuery.data?.count]);

  useEffect(() => {
    let totalNetPay = 0;
    let totalCharge = 0;
    let disbursedTotalNetPay = 0;

    for (let i = 0; i < pendingTotalsQuery.data?.payrollData?.length; i++) {
      const item = pendingTotalsQuery.data.payrollData[i];
      // if (pendingDeptName != null) {
      //   if (
      //     item.department.departmentName === pendingDeptName &&
      //     item.businessMonth.includes(pendingMonthSelected)
      //   ) {
      //     totalNetPay += item.totalNetPay;
      //     totalCharge += item.totalChargePerEmployee;
      //     disbursedTotalNetPay += item.disbursedTotalNetPay;
      //   }
      // } else {
      // if (item.businessMonth.includes(pendingMonthSelected)) {
      totalNetPay += item.totalNetPay;
      totalCharge += item.totalChargePerEmployee;
      disbursedTotalNetPay += item.disbursedTotalNetPay;
      // }
      // }
    }
    setPendingTotals({
      totalAdditionalCharge: +totalCharge.toFixed(2),
      totalNetPay: +totalNetPay.toFixed(2),
      disbursedTotalNetPay: 0,
      // +disbursedTotalNetPay.toFixed(2),
    });
    // setForceRefresher(!forceRefresher);
  }, [
    pendingTotalsQuery.data,
    pendingPayrollQuery.data,
    // pendingDeptName,
    // pendingMonthSelected,
  ]);

  // filter for posted table
  useEffect(() => {
    let totalNetPay = 0;
    let totalCharge = 0;
    let disbursedTotalNetPay = 0;

    for (let i = 0; i < postedTotalsQuery.data?.payrollData?.length; i++) {
      const item = postedTotalsQuery.data?.payrollData[i];
      // if (postedDeptName != null) {
      //   if (
      //     item.department.departmentName === postedDeptName &&
      //     item.businessMonth.includes(postedMonthSelected)
      //   ) {
      //     totalNetPay += item.totalNetPay;
      //     totalCharge += item.totalChargePerEmployee;
      //     disbursedTotalNetPay += item.disbursedTotalNetPay;
      //   }
      // } else {
      // if (item.businessMonth.includes(postedMonthSelected)) {
      totalNetPay += item.totalNetPay;
      totalCharge += item.totalChargePerEmployee;
      disbursedTotalNetPay += item.disbursedTotalNetPay;
      //   }
      // }
    }
    setPostedTotals({
      totalAdditionalCharge: +totalCharge.toFixed(2),
      totalNetPay: +totalNetPay.toFixed(2),
      disbursedTotalNetPay: +disbursedTotalNetPay.toFixed(2),
    });
    // setForceRefresher(!forceRefresher);
  }, [postedTotalsQuery.data, postedPayrollQuery.data]);

  useEffect(() => {
    setFormDataPost('');
    setBusinessMonthCycleOpts([]);
  }, [postPayroll, payslip, payslipReport]);

  useEffect(() => {
    if (directPayrollData.length > 0) {
      downloadDirectPayrollTemplate.current.link.click();
      setDirectPayrollData([]);
      setDirectPayroll(false);
    }
  }, [directPayrollData]);

  return (
    <div className="w-screen h-screen overflow-auto p-5">
      <Toast ref={toast} position="bottom-left" />
      {/* DASHBOARD NAV */}
      <DashboardNav
        navTitle="Payroll"
        buttons={[
          // pageActions.postPayroll && {
          //   label: 'Post Payroll',
          //   type: ButtonType.Red,
          //   isDropdown: false,
          //   isIcon: false,
          //   handler: () => {
          //     setPostPayroll(true);
          //   },
          // },
          pageActions.downloadAndImportPayroll && {
            label: 'Direct Payroll',
            type: ButtonType.Black,
            isDropdown: true,
            dropDownButtons: [
              {
                label: 'Download Template',
                tooltip:
                  'Edit and save the file in Excel to prevent import errors.',
                dropDownHandler: async () => {
                  setDirectPayroll(true);
                  //  old code
                  //  toast.current?.replace({
                  //   severity: 'info',
                  //   summary: 'Submitting request',
                  //   detail: 'Please wait...',
                  //   closable: false,
                  //   sticky: true,
                  // });

                  // const response = await axios.get(
                  //   '/api/payrolls/directupload?departmentId=1',
                  //   {
                  //     headers: {
                  //       Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
                  //     },
                  //   }
                  // );

                  // if (response.data.length == 0) {
                  //   return toast.current?.replace({
                  //     severity: 'error',
                  //     summary: 'No active employees found.',
                  //     closable: true,
                  //     life: 5000,
                  //   });
                  // }
                  // setDirectPayrollData(
                  //   response.data.map((i: any) => {
                  //     return {
                  //       employeeCode: `=""${i.employeeCode}""`,
                  //       // employeeCode: i.employeeCode,
                  //       employeeFullName: i.employee_profile.employeeFullName,
                  //       businessMonth: '',
                  //       businessYear: '',
                  //       cycle: '',
                  //       daysWorked: 0,
                  //       workingDays: 0,
                  //       netPay: '0.00',
                  //     };
                  //   })
                  // );
                  // toast.current?.replace({
                  //   severity: 'success',
                  //   summary: 'Template has been downloaded.',
                  //   closable: true,
                  //   life: 5000,
                  // });
                  // setDirectPayroll(false);
                  // setDirectPayrollData([]);
                },
              },
              {
                label: 'Import Payroll',
                dropDownHandler: () => setimportDirectPayroll(true),
              },
            ],
            isIcon: true,
            icon: 'pi pi-file-import',
          },
          pageActions.generateReport && {
            label: 'Generate Reports',
            type: ButtonType.Black,
            isDropdown: true,
            dropDownButtons: [
              {
                label: 'Payslip',
                dropDownHandler: () => setPayslip(true),
              },
              {
                label: 'Payroll Report',
                dropDownHandler: () => setPayslipReport(true),
              },
            ],
            isIcon: true,
            icon: 'pi pi-calendar',
          },
        ]}
        isShowSearch={true}
        setValueSearchText={setSearchQuery}
        valueSearchText={searchQuery}
        searchPlaceholder=""
      />

      <DirectPayrollDownloadSidebar
        directPayroll={directPayroll}
        setDirectPayroll={setDirectPayroll}
        departmentsQuery={departmentsQuery}
        setDirectPayrollData={setDirectPayrollData}
        setSelectedDepartmentName={setSelectedDepartmentName} // for filename
      />

      {/* MAIN CONTENT */}
      <div className="line-container rounded-lg p-5">
        <React.Fragment>
          {pendingPayrollQuery.error ? (
            <ErrorDialog />
          ) : (
            <>
              <div className="flex gap-5 items-start justify-between">
                <CompanyWalletAcctMiniCards />
                {/* <Button rounded label="Pending Tranfers" severity="secondary" /> */}
              </div>
              <TabView
                activeIndex={activeTabIndex}
                onTabChange={(e) => {
                  setActiveTabIndex(e.index);
                }}
              >
                <TabPanel
                  className=" mb-[2px]"
                  header={
                    <div className="table-header overflow-hidden bg-transparent">
                      Pending{' '}
                      <Badge
                        className="table-badge"
                        value={
                          pendingPayrollQuery.data
                            ? pendingPayrollQuery?.data.count?.length > 0
                              ? pendingPayrollQuery?.data.count?.length
                              : 0
                            : 0
                        }
                      ></Badge>
                    </div>
                  }
                >
                  <NewPayrollTable
                    totals={pendingTotals}
                    processingPayroll={processingPayroll}
                    setProcessingPayroll={setProcessingPayroll}
                    payrollQuery={pendingPayrollQuery}
                    departmentsQuery={departmentsQuery}
                    setSideBarConfig={setSideBarConfig}
                    filters={pendingPayrollfilters}
                    setFilters={setPendingPayrollFilters}
                    pagination={pendingPayrollPagination}
                    setPagination={setPendingPayrollPagination}
                    businessMonthOpts={pendingBusinessMonthOpts}
                    deptName={pendingDeptName}
                    setDeptName={setPendingDeptName}
                    monthSelected={pendingMonthSelected}
                    setMonthSelected={setPendingMonthSelected}
                    tableFor={'PENDING'}
                    postedPayrollQuery={postedPayrollQuery}
                    selectedRows={selectedRows}
                    setSelectedRows={setSelectedRows}
                    totalsQuery={pendingTotalsQuery}
                    pendingTotalsQuery={pendingTotalsQuery}
                    postedTotalsQuery={postedTotalsQuery}
                    optionsQuery={pendingOptsQuery}
                    pendingOptsQuery={pendingOptsQuery}
                    postedOptsQuery={postedOptsQuery}
                    pageActions={pageActions}
                    failedPayrollQuery={failedPayrollQuery}
                    activeTabIndex={activeTabIndex}
                    toast={toast}
                  />

                  <Paginator
                    first={pendingPayrollPagination.first}
                    rows={pendingPayrollPagination.limit}
                    totalRecords={
                      pendingPayrollQuery &&
                      pendingPayrollQuery?.data?.count?.length
                    }
                    rowsPerPageOptions={[5, 15, 25, 50, 100]}
                    onPageChange={(event) => {
                      const { page, rows, first }: any = event;
                      setPendingPayrollPagination((prev: any) => ({
                        ...prev,
                        first: first,
                        offset: rows * page,
                        limit: rows,
                      }));
                    }}
                  />
                </TabPanel>
                <TabPanel
                  header={
                    <div className="table-header overflow-hidden bg-transparent">
                      Posted{' '}
                      <Badge
                        className="table-badge"
                        value={
                          postedPayrollQuery.data
                            ? postedPayrollQuery?.data.count?.length > 0
                              ? postedPayrollQuery?.data.count?.length
                              : 0
                            : 0
                        }
                      ></Badge>
                    </div>
                  }
                >
                  <NewPayrollTable
                    businessMonthOpts={postedBusinessMonthOpts}
                    totals={postedTotals}
                    processingPayroll={processingPayroll}
                    setProcessingPayroll={setProcessingPayroll}
                    payrollQuery={postedPayrollQuery}
                    departmentsQuery={departmentsQuery}
                    setSideBarConfig={setSideBarConfig}
                    filters={postedPayrollfilters}
                    setFilters={setPostedPayrollFilters}
                    pagination={postedPayrollPagination}
                    setPagination={setPostedPayrollPagination}
                    deptName={postedDeptName}
                    setDeptName={setPostedDeptName}
                    monthSelected={postedMonthSelected}
                    setMonthSelected={setPostedMonthSelected}
                    pendingPayrollQuery={pendingPayrollQuery}
                    tableFor={'POSTED'}
                    selectedRows={selectedRows}
                    setSelectedRows={setSelectedRows}
                    totalsQuery={postedTotalsQuery}
                    pendingTotalsQuery={pendingTotalsQuery}
                    postedTotalsQuery={postedTotalsQuery}
                    optionsQuery={postedOptsQuery}
                    pendingOptsQuery={pendingOptsQuery}
                    postedOptsQuery={postedOptsQuery}
                    pageActions={pageActions}
                    postedPayrollQuery={postedPayrollQuery}
                    failedPayrollQuery={failedPayrollQuery}
                    activeTabIndex={activeTabIndex}
                    toast={toast}
                  />
                  <Paginator
                    first={postedPayrollPagination.first}
                    rows={postedPayrollPagination.limit}
                    totalRecords={
                      postedPayrollQuery &&
                      postedPayrollQuery?.data?.count?.length
                    }
                    rowsPerPageOptions={[5, 15, 25, 50, 100]}
                    onPageChange={(event) => {
                      const { page, rows, first }: any = event;
                      setPostedPayrollPagination((prev: any) => ({
                        ...prev,
                        first: first,
                        offset: rows * page,
                        limit: rows,
                      }));
                    }}
                  />
                </TabPanel>
                <TabPanel
                  header={
                    <div className="table-header overflow-hidden bg-transparent">
                      For Reposting{' '}
                      <Badge
                        className="table-badge"
                        value={
                          failedPayrollQuery.data
                            ? failedPayrollQuery?.data.count?.length > 0
                              ? failedPayrollQuery?.data.count?.length
                              : 0
                            : 0
                        }
                      ></Badge>
                    </div>
                  }
                >
                  {/* failed table */}
                  <NewPayrollTable
                    businessMonthOpts={postedBusinessMonthOpts}
                    processingPayroll={processingPayroll}
                    setProcessingPayroll={setProcessingPayroll}
                    totals={postedTotals}
                    payrollQuery={failedPayrollQuery}
                    departmentsQuery={departmentsQuery}
                    setSideBarConfig={setSideBarConfig}
                    filters={failedPayrollfilters}
                    setFilters={setFailedPayrollFilters}
                    pagination={failedPayrollPagination}
                    setPagination={setFailedPayrollPagination}
                    deptName={postedDeptName}
                    setDeptName={setPostedDeptName}
                    monthSelected={postedMonthSelected}
                    setMonthSelected={setPostedMonthSelected}
                    pendingPayrollQuery={pendingPayrollQuery}
                    tableFor={'FAILED'}
                    selectedRows={selectedRows}
                    setSelectedRows={setSelectedRows}
                    totalsQuery={postedTotalsQuery}
                    pendingTotalsQuery={pendingTotalsQuery}
                    postedTotalsQuery={postedTotalsQuery}
                    optionsQuery={postedOptsQuery}
                    pendingOptsQuery={pendingOptsQuery}
                    postedOptsQuery={postedOptsQuery}
                    pageActions={pageActions}
                    postedPayrollQuery={postedPayrollQuery}
                    failedPayrollQuery={failedPayrollQuery}
                    activeTabIndex={activeTabIndex}
                    toast={toast}
                  ></NewPayrollTable>
                  <Paginator
                    first={failedPayrollPagination.first}
                    rows={failedPayrollPagination.limit}
                    totalRecords={
                      failedPayrollQuery &&
                      failedPayrollQuery?.data?.count?.length
                    }
                    rowsPerPageOptions={[5, 15, 25, 50, 100]}
                    onPageChange={(event) => {
                      const { page, rows, first }: any = event;
                      setFailedPayrollPagination((prev: any) => ({
                        ...prev,
                        first: first,
                        offset: rows * page,
                        limit: rows,
                      }));
                    }}
                  />
                </TabPanel>
              </TabView>
            </>
          )}
        </React.Fragment>
      </div>

      {/* <Dialog
        visible={true}
        position={'center'}
        header={'Canlled Disbursements'}
        style={{ minWidth: '20vw', maxHeight: '385px' }}
        onHide={() => null}
        draggable={false}
        resizable={false}
        closeOnEscape={false}
        closable={
          processingPayroll.filter((i: any) => i.status == 0).length == 0
        }
        breakpoints={{ '960px': '75vw', '641px': '100vw' }}
      >
        <div className="my-2 mx-0 relative">
          {processingPayroll &&
            processingPayroll.length > 0 &&
            processingPayroll.map((task: any, index: number) => (
              <div key={index}>
                <div className="flex items-center justify-between m-0 gap-5">
                  <div className="flex items-start justify-start gap-5">
                    <label>
                      {task.taskName}: {task.departmentName} - [
                      {task.businessMonth} - {task.cycle}]
                      <span style={{ fontSize: '12px', display: 'block' }}>
                        {moment(task.createdAt).format('LL LT')}
                      </span>
                    </label>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Badge value="CANCELLED" severity="danger"></Badge>
                  </div>
                </div>
                <Divider className="my-1" />
              </div>
            ))}

          <p
            style={{
              position: 'sticky',
              bottom: '0px',
              background: '#fff',
              textAlign: 'right',
              padding: '10px 0',
              fontSize: '15px',
              display: 'block',
            }}
            className="text-red-500 text-[14px]"
          >
            <strong>Note:</strong> The following list above are the cancelled
            disbursements. 
          </p>
        </div>
      </Dialog> */}

      {/* SIDEBAR */}
      <EmployeePayroll
        configuration={sideBarConfig}
        setSideBarConfig={setSideBarConfig}
        refetchDataFromParent={pendingPayrollQuery.refetch}
        pendingTotalsQuery={pendingTotalsQuery}
        pendingOptsQuery={pendingOptsQuery}
        setSelectedRows={setSelectedRows}
        pageActions={pageActions}
        activeTabIndex={activeTabIndex}
        toast={toast}
      />

      <ProgressBar
        processingPayroll={processingPayroll}
        setProcessingPayroll={setProcessingPayroll}
      />

      {/* <SideBar
        configuration={{
          isOpen: postPayroll,
          setIsOpen: setPostPayroll,
        }}
        label={{
          mainHeader: 'Post Options',
        }}
        onInputChange={onInputChangePost}
        form={{
          forms: [
            {
              label: 'Choose Department',
              type: FormType.Dropdown,
              name: 'departmentId',
              options:
                !pendingPayrollQuery.isLoading && departmentOpts
                  ? departmentOpts
                      .filter((dpt: any) =>
                        pendingPayrollQuery.data?.count.some(
                          (pr: any) =>
                            dpt.code == pr.departmentId && !pr.isPosted
                        )
                      )
                      ?.sort((a: any, b: any) => a.name.localeCompare(b.name))
                  : [],
              value: formDataPost && formDataPost.departmentId,
              placeholder: !departmentsQuery.isLoading
                ? 'Choose Department'
                : 'Loading. Please wait...',
              isVisible: true,
              isRequired: false,
              isDisabled: false,
            },
            {
              label: 'Choose Business Month - Cycle',
              type: FormType.Dropdown,
              name: 'businessMonthCycle',
              value: formDataPost && formDataPost.businessMonthCycle,
              options: businessMonthCycleOpts,
              placeholder: !pendingPayrollQuery.isLoading
                ? 'Choose Business Month - Cycle'
                : 'Loading. Please wait...',
              isVisible: true,
              isRequired: false,
              isDisabled: isDisabled,
            },
          ],
          buttons: [
            {
              label: 'Cancel',
              type: ButtonType.Transparent,
              handler: () => setPostPayroll(false),
            },
            {
              label: 'Post',
              type: ButtonType.Black,
              handler: () => postPayrollHandler(),
              isDisabled: !formDataPost?.businessMonthCycle || isDisabled,
            },
          ],
        }}
      /> */}
      {/* GENERATE PAYSLIP */}
      <SideBar
        configuration={{
          isOpen: payslip,
          setIsOpen: setPayslip,
        }}
        label={{
          mainHeader: 'Generate Payslip',
        }}
        onInputChange={onInputChangeReports}
        form={{
          forms: [
            {
              label: 'Choose Department',
              type: FormType.Dropdown,
              name: 'departmentId',
              options:
                !postedPayrollQuery.isLoading && departmentOpts
                  ? departmentOpts
                      .filter((dpt: any) =>
                        postedPayrollQuery.data?.count.some(
                          (pr: any) =>
                            dpt.code == pr.departmentId && pr.isPosted
                        )
                      )
                      ?.sort((a: any, b: any) => a.name.localeCompare(b.name))
                  : [],
              value: formDataPost && formDataPost.departmentId,
              placeholder: !departmentsQuery.isLoading
                ? 'Choose Department'
                : 'Loading. Please wait...',
              isVisible: true,
              isRequired: false,
              isDisabled: false,
            },
            {
              label: 'Choose Business Month - Cycle',
              type: FormType.Dropdown,
              name: 'businessMonthCycle',
              value: formDataPost && formDataPost.businessMonthCycle,
              options: businessMonthCycleOpts,
              placeholder: postedPayrollQuery.isLoading
                ? 'Loading. Please wait...'
                : 'Choose Business Month - Cycle',
              isVisible: true,
              isRequired: false,
              isDisabled: false,
            },
          ],
          buttons: [
            {
              label: 'Cancel',
              type: ButtonType.Transparent,
              handler: () => setPayslip(false),
            },
            {
              label: 'Download',
              type: ButtonType.Black,
              isDisabled:
                !formDataPost?.departmentId ||
                !formDataPost?.businessMonthCycle ||
                isDisabled,
              handler: () => generatePayslipHandler(),
            },
          ],
        }}
      />

      <SideBar
        configuration={{
          isOpen: payslipReport,
          setIsOpen: setPayslipReport,
          isBulk: true,
        }}
        label={{
          mainHeader: 'Generate Payroll Report',
        }}
        onInputChange={onInputChangeReports}
        form={{
          forms: [
            {
              label: 'Choose Department',
              type: FormType.MultiSelect,
              name: 'departmentId',
              options:
                !postedPayrollQuery.isLoading && departmentOpts
                  ? departmentOpts
                      .filter((dpt: any) => {
                        if (formDataPost?.departmentId?.length > 0) {
                          return (
                            formDataPost?.departmentId[0].others
                              .payrollTypeId === dpt.others.payrollTypeId
                          );
                        }
                        return postedPayrollQuery.data?.count.some(
                          (pr: any) =>
                            dpt.code == pr.departmentId && pr.isPosted
                        );
                      })
                      ?.sort((a: any, b: any) => a.name.localeCompare(b.name))
                  : [],
              value: formDataPost.departmentId || [],
              placeholder: !departmentsQuery.isLoading
                ? 'Choose Department'
                : 'Loading. Please wait...',
              isVisible: true,
              isRequired: false,
              isDisabled: false,
            },
            {
              label: 'Choose Business Month - Cycle',
              type: FormType.MultiSelect,
              name: 'businessMonthCycle',
              value: formDataPost.businessMonthCycle,
              options: businessMonthCycleOpts,
              placeholder: postedPayrollQuery.isLoading
                ? 'Loading. Please wait...'
                : 'Choose Business Month - Cycle',
              isVisible: true,
              isRequired: false,
              isDisabled: false,
            },
          ],
          buttons: [
            {
              label: 'Cancel',
              type: ButtonType.Transparent,
              handler: () => setPayslipReport(false),
            },
            {
              label: 'Download',
              type: ButtonType.Black,
              isDisabled:
                !formDataPost?.departmentId ||
                !formDataPost?.businessMonthCycle ||
                isDisabled,
              handler: () => getReports('Payroll Report'),
            },
          ],
        }}
      />

      <CSVLink
        separator=","
        className="hidden"
        ref={downloadDirectPayrollTemplate}
        filename={`Direct Payroll_${selectedDepartmentName}-${new Date().getTime()}.csv`}
        headers={directPayrollImportHeaders}
        data={directPayrollData}
      />

      <CSVUpload
        configuration={{
          headers: directPayrollImportHeaders,
          apiUrl: '/api/payrolls/directupload',
          isOpen: importDirectPayroll,
          setIsOpen: setimportDirectPayroll,
        }}
        label={{
          mainHeader: 'Import Payroll',
        }}
        refetchParent={pendingPayrollQuery.refetch}
        pendingTotalsQuery={pendingTotalsQuery}
        pendingOptsQuery={pendingOptsQuery}
      />

      <Dialog
        maximizable
        header="Errors on the following:"
        visible={backendError.length > 0}
        style={{ width: '50vw' }}
        onHide={() => setBackendError([])}
      >
        <div className="my-5">
          {backendError.length > 0 &&
            backendError.map((item: any, index: number) => (
              <div className="my-4" key={index}>
                <h4 className="font-bold">{item.headerTitle}</h4>
                <>
                  {Array.isArray(item.error) ? (
                    <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
                      {item.error.map((message: any, msgIndex: number) => (
                        <li key={msgIndex}>{message}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>{item.error}</p>
                  )}
                </>
                <br />
              </div>
            ))}
        </div>
      </Dialog>

      {payrollReports && payrollReports?.length > 0 && (
        <PDFDownloadLink
          className="w-full"
          document={
            <Document>
              <Page
                size="LETTER"
                style={{
                  fontSize: 7,
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
                  {/* {payrollReports.map((data: any, index: number) => {
                    const workedOnRD = data?.employee?.attendances
                      ?.filter((i: any) => {
                        if (
                          (i.isPresent || (i.isHalfDay && i.isLeave)) &&
                          !i.holiday
                        ) {
                          return data?.daysOff?.includes(
                            moment(i.date).format('dddd')
                          );
                        }
                      })
                      .reduce(
                        (tot: any, item: any) =>
                          tot + (item.isHalfDay ? 0.5 : 1),
                        0
                      );

                    const workedOnSPHD = data?.employee?.attendances
                      ?.filter((i: any) => {
                        if (
                          (i.isPresent || (i.isHalfDay && i.isLeave)) &&
                          i.holiday &&
                          i.holiday.holidayType == 'Special'
                        ) {
                          return !data?.daysOff?.includes(
                            moment(i.date).format('dddd')
                          );
                        }
                      })
                      .reduce(
                        (tot: any, item: any) =>
                          tot + (item.isHalfDay ? 0.5 : 1),
                        0
                      );

                    const workedOnSPHDWhileRD = data?.employee?.attendances
                      ?.filter((i: any) => {
                        if (
                          (i.isPresent || (i.isHalfDay && i.isLeave)) &&
                          i.holiday &&
                          i.holiday.holidayType == 'Special'
                        ) {
                          return data?.daysOff?.includes(
                            moment(i.date).format('dddd')
                          );
                        }
                      })
                      .reduce(
                        (tot: any, item: any) =>
                          tot + (item.isHalfDay ? 0.5 : 1),
                        0
                      );

                    const workedOnRHD = data?.employee?.attendances
                      ?.filter((i: any) => {
                        if (
                          (i.isPresent || (i.isHalfDay && i.isLeave)) &&
                          i.holiday &&
                          i.holiday.holidayType == 'Regular'
                        ) {
                          return !data?.daysOff?.includes(
                            moment(i.date).format('dddd')
                          );
                        }
                      })
                      .reduce(
                        (tot: any, item: any) =>
                          tot + (item.isHalfDay ? 0.5 : 1),
                        0
                      );

                    const workedOnRHDWhileRD = data?.employee?.attendances
                      ?.filter((i: any) => {
                        if (
                          (i.isPresent || (i.isHalfDay && i.isLeave)) &&
                          i.holiday &&
                          i.holiday.holidayType == 'Regular'
                        ) {
                          return data?.daysOff?.includes(
                            moment(i.date).format('dddd')
                          );
                        }
                      })
                      .reduce(
                        (tot: any, item: any) =>
                          tot + (item.isHalfDay ? 0.5 : 1),
                        0
                      );
                    const halfdayPresentonRHDSum = data?.employee?.attendances
                      ?.filter((i: any) => {
                        if (
                          i.isPresent &&
                          i.isHalfDay &&
                          i.holiday &&
                          i.holiday.holidayType == 'Regular'
                        ) {
                          return !data?.daysOff?.includes(
                            moment(i.date).format('dddd')
                          );
                        }
                      })
                      .reduce(
                        (tot: any, item: any) => tot + data.dailyRate * 0.5,
                        0
                      );
                    const halfdayPresentonRHDwhileRDSum =
                      data?.employee?.attendances
                        ?.filter((i: any) => {
                          if (
                            i.isPresent &&
                            i.isHalfDay &&
                            i.holiday &&
                            i.holiday.holidayType == 'Regular'
                          ) {
                            return data?.daysOff?.includes(
                              moment(i.date).format('dddd')
                            );
                          }
                        })
                        .reduce(
                          (tot: any, item: any) => tot + data.dailyRate * 0.5,
                          0
                        );

                    const cashAdvanceSum = data.payroll_deductions
                      .filter((deduc: any) => {
                        // Add conditions for filtering
                        return (
                          deduc.deduction.deductionType === 'Cash Advance' &&
                          !deduc.isDeferred &&
                          deduc.deduction.isPosted === true &&
                          deduc.deduction.transfer_to_employee_acct_transaction
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
                    // sum up all adjustments total
                    const adjustmentSum = data.payroll_adjustments
                      ? data?.payroll_adjustments.reduce(
                          (sum: number, adjustment: any) => {
                            return (
                              sum +
                                adjustment.addAdjustment -
                                adjustment.deductAdjustment ?? 0
                            );
                          },
                          0
                        )
                      : 0;
                    // const salaryLoanSum = data.payroll_deductions // Disabled Salary Loans
                    //   .filter((deduc: any) => {
                    //     // Add conditions for filtering
                    //     return (
                    //       deduc.deduction.deductionType === 'Salary Loan' &&
                    //       !deduc.isDeferred &&
                    //       deduc.deduction.isPosted === true
                    //     );
                    //   })
                    //   .reduce((sum: number, deduc: any) => {
                    //     // Accumulate the sum of amountPaid
                    //     return sum + deduc.amountPaid;
                    //   }, 0);
                   
                  {/* horizontal */}
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
                    // getPremiumAttendanceBreakdown({
                    //   employeeDetails: {
                    //     employeeId: data?.employeeId,
                    //     departmentId: data?.departmentId,
                    //     daysOff: data?.daysOff,
                    //   },
                    //   attendanceDetails: {
                    //     businessMonth: data?.businessMonth,
                    //     cycle: data?.cycle,
                    //   },
                    // }).then((res: any) => {
                    //   const response = res;

                    //   if (response.success) {
                    //     const {
                    //       workedOnRestDays,
                    //       workedOnRegularHoliday,
                    //       workedOnRegularHolidayWhileRestDay,
                    //       halfDayPresentOnRegularHoliday,
                    //       workedOnSpecialHoliday,
                    //       workedOnSpecialHolidayWhileRestDay,
                    //       overtimeOnRegularDays,
                    //       overtimeOnHolidays,
                    //       overtimeOnRestDays,
                    //     } = response.data;

                    //     workedOnRD = workedOnRestDays;
                    //     workedOnSPHD = workedOnSpecialHoliday;
                    //     workedOnSPHDWhileRD =
                    //       workedOnSpecialHolidayWhileRestDay;
                    //     workedOnRHD = workedOnRegularHoliday;
                    //     workedOnRHDWhileRD = workedOnRegularHolidayWhileRestDay;
                    //     halfdayPresentonRHD = 5;
                    //   }
                    // });

                    // workedOnRD = data?.employee?.attendances
                    //   ?.filter((i: any) => {
                    //     if (
                    //       (i.isPresent || (i.isHalfDay && i.isLeave)) &&
                    //       !i.holiday
                    //     ) {
                    //       return data?.daysOff?.includes(
                    //         moment(i.date).format('dddd')
                    //       );
                    //     }
                    //   })
                    //   .reduce(
                    //     (tot: any, item: any) =>
                    //       tot + (item.isHalfDay ? 0.5 : 1),
                    //     0
                    //   );

                    // workedOnSPHD = data?.employee?.attendances
                    //   ?.filter((i: any) => {
                    //     if (
                    //       (i.isPresent || (i.isHalfDay && i.isLeave)) &&
                    //       i.holiday &&
                    //       i.holiday.holidayType == 'Special'
                    //     ) {
                    //       return !data?.daysOff?.includes(
                    //         moment(i.date).format('dddd')
                    //       );
                    //     }
                    //   })
                    //   .reduce(
                    //     (tot: any, item: any) =>
                    //       tot + (item.isHalfDay ? 0.5 : 1),
                    //     0
                    //   );

                    // workedOnSPHDWhileRD = data?.employee?.attendances
                    //   ?.filter((i: any) => {
                    //     if (
                    //       (i.isPresent || (i.isHalfDay && i.isLeave)) &&
                    //       i.holiday &&
                    //       i.holiday.holidayType == 'Special'
                    //     ) {
                    //       return data?.daysOff?.includes(
                    //         moment(i.date).format('dddd')
                    //       );
                    //     }
                    //   })
                    //   .reduce(
                    //     (tot: any, item: any) =>
                    //       tot + (item.isHalfDay ? 0.5 : 1),
                    //     0
                    //   );

                    // workedOnRHD = data?.employee?.attendances
                    //   ?.filter((i: any) => {
                    //     if (
                    //       (i.isPresent || (i.isHalfDay && i.isLeave)) &&
                    //       i.holiday &&
                    //       i.holiday.holidayType == 'Regular'
                    //     ) {
                    //       return !data?.daysOff?.includes(
                    //         moment(i.date).format('dddd')
                    //       );
                    //     }
                    //   })
                    //   .reduce(
                    //     (tot: any, item: any) =>
                    //       tot + (item.isHalfDay ? 0.5 : 1),
                    //     0
                    //   );

                    // workedOnRHDWhileRD = data?.employee?.attendances
                    //   ?.filter((i: any) => {
                    //     if (
                    //       (i.isPresent || (i.isHalfDay && i.isLeave)) &&
                    //       i.holiday &&
                    //       i.holiday.holidayType == 'Regular'
                    //     ) {
                    //       return data?.daysOff?.includes(
                    //         moment(i.date).format('dddd')
                    //       );
                    //     }
                    //   })
                    //   .reduce(
                    //     (tot: any, item: any) =>
                    //       tot + (item.isHalfDay ? 0.5 : 1),
                    //     0
                    //   );

                    const halfdayPresentonRHDSum =
                      halfdayPresentonRHD * 0.5 * data.dailyRate;
                    // const halfdayPresentonRHDSum = data?.employee?.attendances
                    //   ?.filter((i: any) => {
                    //     if (
                    //       i.isPresent &&
                    //       i.isHalfDay &&
                    //       i.holiday &&
                    //       i.holiday.holidayType == 'Regular'
                    //     ) {
                    //       return !data?.daysOff?.includes(
                    //         moment(i.date).format('dddd')
                    //       );
                    //     }
                    //   })
                    //   .reduce(
                    //     (tot: any, item: any) => tot + data.dailyRate * 0.5,
                    //     0
                    //   );
                    // const halfdayPresentonRHDwhileRDSum =
                    //   data?.employee?.attendances
                    //     ?.filter((i: any) => {
                    //       if (
                    //         i.isPresent &&
                    //         i.isHalfDay &&
                    //         i.holiday &&
                    //         i.holiday.holidayType == 'Regular'
                    //       ) {
                    //         return data?.daysOff?.includes(
                    //           moment(i.date).format('dddd')
                    //         );
                    //       }
                    //     })
                    //     .reduce(
                    //       (tot: any, item: any) => tot + data.dailyRate * 0.5,
                    //       0
                    //     );

                    const cashAdvanceSum = data.payroll_deductions
                      .filter((deduc: any) => {
                        // Add conditions for filtering
                        return (
                          deduc.deduction.deductionType === 'Cash Advance' &&
                          !deduc.isDeferred &&
                          deduc.deduction.isPosted === 1 &&
                          deduc.deduction.transfer_to_employee_acct_transactions
                            ?.disbursementStatus === 1
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
                          deduc.deduction.isPosted === 1
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
                          deduc.deduction.isPosted === 1
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
                          deduc.deduction.isPosted === 1
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
                          deduc.deduction.isPosted === 1
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
                          deduc.deduction.isPosted === 1
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
                      let temp = {
                        amount: 0,
                        desc: '',
                      };
                      let tempDesc = [];
                      if (otherDeductions[i].deduction.ledgers) {
                        for (
                          let j = 0;
                          j < otherDeductions[i].deduction.ledgers.length;
                          j++
                        ) {
                          // store the whole string of description if there is only one
                          if (
                            otherDeductions[i].deduction.ledgers.length === 1
                          ) {
                            tempDesc.push(
                              otherDeductions[i].deduction.ledgers[j].desc
                            );
                          } else {
                            // store all description in one array, truncate and then join them after looping
                            tempDesc.push(
                              otherDeductions[i].deduction.ledgers[j].desc
                                .length > 12
                                ? otherDeductions[i].deduction.ledgers[
                                    j
                                  ].desc.slice(0, 12) + '...'
                                : otherDeductions[i].deduction.ledgers[j].desc
                            );
                          }
                        }
                        temp.amount += parseFloat(
                          otherDeductions[i].amountPaid
                        );
                        temp.desc = tempDesc.join(', ');
                        otherBreakdownArr.push(temp);
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
                            <View style={{ ...styles.headers, width: '50%' }}>
                              <Text style={styles.boldText}>
                                Payroll Month:{' '}
                              </Text>
                              <Text>{data.businessMonth}</Text>
                            </View>
                            <View style={{ ...styles.headers, width: '50%' }}>
                              <Text style={styles.boldText}>Cycle: </Text>
                              <Text>{properCasing(data.cycle)}</Text>
                            </View>
                          </View>
                          <View style={styles.row}>
                            {' '}
                            <View style={{ ...styles.headers, width: '50%' }}>
                              <Text style={styles.boldText}>Absence:</Text>
                              <Text>
                                {` ${data.daysAbsent} day${addS(
                                  data.daysAbsent
                                )}`}
                              </Text>
                            </View>
                            <View style={{ ...styles.headers, width: '50%' }}>
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
                              <View style={styles.paragrahWithPaddingBottom}>
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
                                  {` (${workedOnRD} day${addS(workedOnRD)}):`}
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
                                  PHP {amountFormatter(data.overtimePay) || 0.0}
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
                                  {amountFormatter(data.nightDiffPay) || 0.0}
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
                                        (data.regularHolidayRestDayRate / 100) +
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
                                        (data.specialHolidayRestDayRate / 100) +
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
                                      data.otherLeaveDays || 0) * data.dailyRate
                                  ) || 0.0}
                                </Text>
                              </View>
                              {hasAllowanceBreakdown ? (
                                <>
                                  {allowanceBreakdownsData.map(
                                    (item: any, index: number) => (
                                      <View style={styles.paragrah} key={index}>
                                        <Text>{item.type} Allowance:</Text>
                                        <Text>
                                          PHP{' '}
                                          {amountFormatter(
                                            item.dailyAmount * data.daysWorked
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
                                    PHP {amountFormatter(data.allowance) || 0.0}
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
                                  PHP {amountFormatter(adjustmentSum) || 0.0}
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
                              <View style={styles.paragrahWithPaddingBottom}>
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
                                <Text>PHP {amountFormatter(data.latePay)}</Text>
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
                                  PHP {amountFormatter(data.sssContribution)}
                                </Text>
                              </View>
                              <View style={styles.paragrah}>
                                <Text>PhilHealth Contributions:</Text>
                                <Text>
                                  PHP{' '}
                                  {amountFormatter(data.philhealthContribution)}
                                </Text>
                              </View>
                              <View style={styles.paragrah}>
                                <Text>Pag-Ibig Contributions:</Text>
                                <Text>
                                  PHP{' '}
                                  {amountFormatter(data.pagIbigContribution)}
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
                                <Text>PHP {amountFormatter(sssLoanSum)}</Text>
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
                                <Text style={{ maxWidth: '80%' }}>Ledger:</Text>

                                <Text>PHP {amountFormatter(ledgerSum)}</Text>
                              </View> */}
                              {/* <View style={styles.paragrah}> */}
                              {/* <Text
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
                                  <Text>PHP {amountFormatter(otherSum)}</Text>
                                </View> */}

                              {/* </View> */}
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
                                    <View style={styles.paragrah} key={index}>
                                      <Text style={{ paddingLeft: '3px' }}>
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
                                    data.netPay == 0 ? 0 : data.totalDeduction
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
          fileName={`${formDataPost.businessMonthCycle} - ${moment().format(
            'MM/DD/YYYY hh:mm:ss'
          )}.pdf`}
        >
          <p
            ref={downloadPayslipRef}
            className={'hidden'}
            onClick={() => {
              setActivityLog();
              setPayslip(false);
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
    </div>
  );

  function reportsSumSummary(
    title: string,
    index: number,
    report: any,
    reportSummary: any
  ) {
    if (title === 'payrollReportsSummary') {
      const returnedValue = reportSummary
        .reduce((acc: any, value: any) => {
          const number = parseFloat(value[index]);

          if (!isNaN(number)) {
            return acc + number;
          } else {
            return acc;
          }
        }, 0)
        .toFixed(2);

      return amountFormatter(returnedValue);
    }

    const returnedValue = report
      .reduce((acc: any, value: any) => {
        const number = parseFloat(value[index]);

        if (!isNaN(number)) {
          return acc + number;
        } else {
          return acc;
        }
      }, 0)
      .toFixed(2);

    return amountFormatter(returnedValue);
  }

  async function getReports(action: string) {
    toast.current?.replace({
      severity: 'info',
      summary: 'Generating Payroll report',
      detail: 'Please wait...',
      sticky: true,
      closable: false,
    });
    // console.log(formDataPost);
    setIsDisabled(true);

    // for (const departmentId of formDataPost.departmentId) {
    //   for (const businessMonthCycle of formDataPost.businessMonthCycle) {
    //     if (businessMonthCycle.departmentId == departmentId.code) {
    await new Promise(async (resolve) => {
      axios
        .post(
          `/api/payrolls/generateReport`,
          {
            businessMonthCycle: formDataPost.businessMonthCycle,
            departmentId: formDataPost.departmentId,
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
            },
          }
        )
        .then((response) => {
          const payrollFormat = response.data.payrollReport.map(
            (payroll: any) => {
              const employeeName =
                payroll?.employee?.employee_profile?.employeeFullName;

              let workedOnRD = payroll.workedOnRestDays;
              let workedOnSPHD = payroll.workedOnSpecialHoliday;
              let workedOnSPHDWhileRD =
                payroll.workedOnSpecialHolidayWhileRestDay;
              let workedOnRHD = payroll.workedOnRegularHoliday;
              let workedOnRHDWhileRD =
                payroll.workedOnRegularHolidayWhileRestDay;
              let halfdayPresentonRHD = payroll.halfDayPresentOnRegularHoliday;
              let halfdayPresentonSPHD = payroll.halfDayPresentOnSpecialHoliday;
              let OTonRegDays = payroll.overtimeOnRegularDays;
              let OTonHolidays = payroll.overtimeOnHolidays;
              let OTonRestDays = payroll.overtimeOnRestDays;
              let halfDayAbsent = payroll.halfDayAbsent;

              const cashAdvanceSum = payroll?.payroll_deductions
                .filter((deduc: any) => {
                  // Add conditions for filtering
                  return (
                    deduc.deduction.deductionType === 'Cash Advance' &&
                    !deduc.isDeferred &&
                    deduc.deduction.isPosted === 1 &&
                    deduc.deduction.transfer_to_employee_acct_transactions
                      ?.disbursementStatus === 1
                  );
                })
                .reduce((sum: number, deduc: any) => {
                  // Accumulate the sum of amountPaid
                  return sum + deduc.amountPaid;
                }, 0);

              const sssLoanSum = payroll?.payroll_deductions
                .filter((deduc: any) => {
                  // Add conditions for filtering
                  return (
                    deduc.deduction.deductionType === 'SSS Loan' &&
                    !deduc.isDeferred &&
                    deduc.deduction.isPosted === 1
                  );
                })
                .reduce((sum: number, deduc: any) => {
                  // Accumulate the sum of amountPaid
                  return sum + deduc.amountPaid;
                }, 0);

              const sssCalamityLoanSum = payroll?.payroll_deductions
                .filter((deduc: any) => {
                  // Add conditions for filtering
                  return (
                    deduc.deduction.deductionType === 'SSS Calamity Loan' &&
                    !deduc.isDeferred &&
                    deduc.deduction.isPosted === 1
                  );
                })
                .reduce((sum: number, deduc: any) => {
                  // Accumulate the sum of amountPaid
                  return sum + deduc.amountPaid;
                }, 0);

              const pagIbigLoanSum = payroll?.payroll_deductions
                .filter((deduc: any) => {
                  // Add conditions for filtering
                  return (
                    deduc.deduction.deductionType === 'HDMF Loan' &&
                    !deduc.isDeferred &&
                    deduc.deduction.isPosted === 1
                  );
                })
                .reduce((sum: number, deduc: any) => {
                  // Accumulate the sum of amountPaid
                  return sum + deduc.amountPaid;
                }, 0);

              // const ledgerSum = payroll?.payroll_deductions
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

              const otherSum = payroll?.payroll_deductions
                .filter((deduc: any) => {
                  // Add conditions for filtering
                  return (
                    deduc.deduction.deductionType === 'Other' &&
                    !deduc.isDeferred &&
                    deduc.deduction.isPosted === 1
                  );
                })
                .reduce((sum: number, deduc: any) => {
                  // Accumulate the sum of amountPaid
                  return sum + deduc.amountPaid;
                }, 0);

              // const hasAllowanceBreakdown = payroll?.employee?.hasAllowanceBreakdown

              // let allowanceBreakdownsData = []

              // if(hasAllowanceBreakdown && payroll?.employee?.allowance_breakdown != null){
              //   const types = payroll?.employee?.allowance_breakdown?.allowanceType
              //   const monthlyAmounts = payroll?.employee?.allowance_breakdown?.monthlyAmounts
              //   const dailyAmounts = payroll?.employee?.allowance_breakdown?.dailyAmounts

              //   for(let i = 0; i < types.length; i++){
              //     allowanceBreakdownsData.push({
              //       type: types[i],
              //       monthlyAmount: monthlyAmounts[i],
              //       dailyAmount: dailyAmounts[i],
              //     })
              //   }
              // }
              return [
                '',
                payroll?.isPosted
                  ? payroll?.disbursementStatus == 0
                    ? 'On Going'
                    : payroll?.disbursementStatus == 1
                    ? 'Disbursed'
                    : 'Failed'
                  : '',
                payroll?.disbursementCode,
                //employee code
                payroll.employee.employeeCode,
                //employee name
                employeeName,
                //department name
                payroll.employee.department.departmentName,
                //employee wallet id
                payroll?.employee?.mlWalletId,
                //employee daily rate
                payroll?.dailyRate,
                //employee days worked
                payroll.daysWorked -
                  (workedOnRD +
                    workedOnRHD +
                    workedOnRHDWhileRD +
                    workedOnSPHD +
                    workedOnSPHDWhileRD),
                //employee days worked pay
                (payroll.daysWorked -
                  (workedOnRD +
                    workedOnRHD +
                    workedOnRHDWhileRD +
                    workedOnSPHD +
                    workedOnSPHDWhileRD)) *
                  payroll.dailyRate,
                //rest day present
                workedOnRD,
                //rest day pay
                workedOnRD * payroll.dailyRate * (payroll.restDayRate / 100),
                payroll.daysAbsent +
                  halfDayAbsent * 0.5 -
                  payroll.specialHolidaysAbsent,
                (payroll.daysAbsent +
                  halfDayAbsent * 0.5 -
                  payroll.specialHolidaysAbsent) *
                  payroll.dailyRate,
                //special holiday absent
                // payroll.specialHolidaysAbsent + halfdayPresentonSPHD * 0.5,
                //special holiday absent pay
                // (payroll.specialHolidaysAbsent + halfdayPresentonSPHD * 0.5) *
                // payroll.dailyRate * 1,
                payroll.lateHrs,
                payroll.latePay,
                payroll.undertimeHrs,
                payroll.undertimePay,
                //overtime on regular days
                OTonRegDays,
                //overtime on regular days pay
                OTonRegDays * payroll?.overtimeRateRegDays,
                //overtime on holidays
                OTonHolidays,
                //overtime on holidays pay
                OTonHolidays * payroll?.overtimeRateHolidays,
                //overtime on rest days
                OTonRestDays,
                //overtime on rest days pay
                OTonRestDays * payroll?.overtimeRateRestDays,
                payroll?.nightDiffHrs,
                payroll?.nightDiffPay,
                //regular holiday present
                workedOnRHD,
                //regular holiday pay
                workedOnRHD *
                  payroll.dailyRate *
                  (payroll.regularHolidayRate / 100),
                //regular holiday and rest day present
                workedOnRHDWhileRD,
                //regular holiday and rest day pay
                workedOnRHDWhileRD *
                  payroll.dailyRate *
                  (payroll.regularHolidayRestDayRate / 100),
                //regular holiday absent
                payroll.regularHolidaysAbsent + halfdayPresentonRHD * 0.5,
                //regular holiday absent pay
                (payroll.regularHolidaysAbsent + halfdayPresentonRHD * 0.5) *
                  payroll.dailyRate *
                  1,
                //special holiday present
                workedOnSPHD,
                //special holiday pay
                workedOnSPHD *
                  payroll.dailyRate *
                  (payroll.specialHolidayRate / 100),
                //special holiday and rest day present
                workedOnSPHDWhileRD,
                //special holiday and rest day pay
                workedOnSPHDWhileRD *
                  payroll.dailyRate *
                  (payroll.specialHolidayRestDayRate / 100),
                payroll?.allowance,
                payroll?.addAdjustment,
                payroll?.deductAdjustment,
                payroll?.grossPay,
                payroll?.philhealthContribution,
                payroll?.sssContribution,
                payroll?.pagIbigContribution,
                cashAdvanceSum,
                sssLoanSum + sssCalamityLoanSum,
                pagIbigLoanSum,
                // ledgerSum,
                otherSum,
                payroll?.withholdingTax,
                payroll?.totalDeduction,
                payroll?.netPay,

                payroll?.remarks,
              ];
            }
          );

          axios
            .put(
              `/api/adminDashboard/activityLogs?message=Generated-a-Payroll-Report`,
              { data: '' },
              {
                headers: {
                  Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
                },
              }
            )
            .then((response) => {});

          const payrollFormatSummary = response.data.payrollReport.map(
            (payroll: any) => {
              const employeeName =
                payroll?.employee?.employee_profile.employeeFullName;
              const cashAdvanceSum = payroll?.payroll_deductions
                .filter((deduc: any) => {
                  // Add conditions for filtering
                  return (
                    deduc.deduction.deductionType === 'Cash Advance' &&
                    !deduc.isDeferred &&
                    deduc.deduction.isPosted === 1 &&
                    deduc.deduction.transfer_to_employee_acct_transactions
                      ?.disbursementStatus === 1
                  );
                })
                .reduce((sum: number, deduc: any) => {
                  // Accumulate the sum of amountPaid
                  return sum + deduc.amountPaid;
                }, 0);

              const sssLoanSum = payroll?.payroll_deductions
                .filter((deduc: any) => {
                  // Add conditions for filtering
                  return (
                    deduc.deduction.deductionType === 'SSS Loan' &&
                    !deduc.isDeferred &&
                    deduc.deduction.isPosted === 1
                  );
                })
                .reduce((sum: number, deduc: any) => {
                  // Accumulate the sum of amountPaid
                  return sum + deduc.amountPaid;
                }, 0);

              const sssCalamityLoanSum = payroll?.payroll_deductions
                .filter((deduc: any) => {
                  // Add conditions for filtering
                  return (
                    deduc.deduction.deductionType === 'SSS Calamity Loan' &&
                    !deduc.isDeferred &&
                    deduc.deduction.isPosted === 1
                  );
                })
                .reduce((sum: number, deduc: any) => {
                  // Accumulate the sum of amountPaid
                  return sum + deduc.amountPaid;
                }, 0);

              const pagIbigLoanSum = payroll?.payroll_deductions
                .filter((deduc: any) => {
                  // Add conditions for filtering
                  return (
                    deduc.deduction.deductionType === 'HDMF Loan' &&
                    !deduc.isDeferred &&
                    deduc.deduction.isPosted === 1
                  );
                })
                .reduce((sum: number, deduc: any) => {
                  // Accumulate the sum of amountPaid
                  return sum + deduc.amountPaid;
                }, 0);
              return [
                employeeName,
                payroll?.employee?.employeeCode,
                payroll?.employee?.mlWalletId,

                payroll?.grossPay,
                payroll?.philhealthContribution,
                payroll?.sssContribution,
                payroll?.pagIbigContribution,
                cashAdvanceSum,
                sssLoanSum + sssCalamityLoanSum,
                pagIbigLoanSum,
                payroll?.withholdingTax,
                payroll?.netPay,
              ];
            }
          );
          generateReport(
            formDataPost.businessMonthCycle,
            payrollFormat,
            payrollFormatSummary,
            action,
            response.data.companyRate,
            formDataPost.businessMonthCycle[0].code
            // response.data.departmentName
          );
        })
        .catch((error) => {
          console.log(error);
        });
      //         setTimeout(() => {
      resolve(true);
      //         }, 2000);
    });
    //     }
    //   }
    // }
    toast.current?.replace({
      severity: 'success',
      summary: 'Payroll report generated successfully',
      closable: true,
      life: 5000,
    });
    setPayslipReport(false);
  }

  function generateReport(
    businessMonthCycle: any,
    report: any,
    reportSummary: any,
    action: string,
    companyRate: any,
    departmentName?: string
  ) {
    // console.log('hello world!');
    // console.log(departmentName);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Monthly Payroll');
    worksheet.views = [
      {
        showGridLines: false,
      },
    ];

    new Array(55).fill('').forEach((item, index) => {
      if (index === 0) {
        worksheet.getColumn(index + 1).width = 30;
      } else {
        worksheet.getColumn(index + 1).width = 20;
      }
    });

    const earningsData = [
      ['', context?.userData?.company?.companyName || ''],
      ['', `${departmentName} ${businessMonthCycle[0].code}`],
      [...new Array(29).fill(''), ''],
      [...new Array(29).fill(''), ''],
      [
        '',
        'Pay Status',
        'Disbursement Code',
        'Employee ID',
        'Employee Name',
        'Department Name',
        'Wallet #',
        'Daily',
        'Reg Days Present',
        'Pay',
        'RD Present',
        `Pay (${companyRate.restDayRate}%)`,
        'Reg Days Absent',
        'Pay',
        'Late Hrs',
        'Late Pay',
        'Undertime Hrs',
        'Undertime Pay',
        'OT on Reg Days',
        'Pay',
        'OT on HD',
        'Pay',
        'OT on RD',
        'Pay',
        'Night Diff Hrs',
        `Pay (${companyRate.nightDifferentialRate}%)`,
        'Reg HD Present',
        `Pay (${companyRate.regularHolidayRate}%)`,
        'Reg HD while RD',
        `Pay (${companyRate.regularHolidayRestDayRate}%)`,
        'Absent on Reg HD',
        `Pay`,
        'SP HD Present',
        `Pay (${companyRate.specialHolidayRate}%)`,
        'SP HD while RD',
        `Pay (${companyRate.specialHolidayRestDayRate}%)`,
        // 'Absent on SP HD',
        // 'Pay',
        'Allowance',
        'Add Adjustment',
        'Deduct Adjustment',
        'Gross Pay',
        'Phil Health Cont',
        'SSS Cont',
        'Pag-ibig Cont',
        'Cash Advance',
        'SSS Loan',
        'PAG-IBG Loan',
        // 'Ledger',
        'Others',
        'Withholding Tax',
        'Total Deductions',
        'Net Pay',
        'Remarks',
      ],
      ...report.map((data: any, index: number) => {
        return [...data.map((item: any) => item)];
      }),
      // [''],
      // [''],
      // ['PAYROLL SUMMARY'],
      // [''],
      // [
      //   'Employee Name',
      //   'Employee Code',
      //   'Wallet #',
      //   'GROSS PAY',
      //   'PhilHealth Cont',
      //   'SSS Cont',
      //   'Pag-ibig Cont',
      //   'Cash Advance Loan',
      //   'SSS Loan',
      //   'Pag-ibig Loan',
      //   'Withholding TAX',
      //   'Final Net Pay',
      // ],
      // ...reportSummary.map((data: any, index: number) => {
      //   return [...data.map((item: any) => item)];
      // }),
      // [
      //   'Grand Total',
      //   '',
      //   '',
      //   reportsSumSummary('payrollReportsSummary', 3, report, reportSummary),
      //   reportsSumSummary('payrollReportsSummary', 4, report, reportSummary),
      //   reportsSumSummary('payrollReportsSummary', 5, report, reportSummary),
      //   reportsSumSummary('payrollReportsSummary', 6, report, reportSummary),
      //   reportsSumSummary('payrollReportsSummary', 7, report, reportSummary),
      //   reportsSumSummary('payrollReportsSummary', 8, report, reportSummary),
      //   reportsSumSummary('payrollReportsSummary', 9, report, reportSummary),
      //   reportsSumSummary('payrollReportsSummary', 10, report, reportSummary),
      //   reportsSumSummary('payrollReportsSummary', 11, report, reportSummary),
      // ],
    ];

    earningsData.forEach((row, rowIndex) => {
      const newRow = worksheet.addRow(row);
      newRow.height = 25.25;
      if (rowIndex === 0 || rowIndex === 1 || rowIndex === 2) {
        newRow.font = { bold: true };
      }
      if (rowIndex === 4) {
        newRow.eachCell((cell, colNumber) => {
          cell.font = { size: 12 };
          cell.alignment = {
            vertical: 'middle',
            horizontal: 'center',
            wrapText: true,
          };

          if (colNumber >= 8 && colNumber <= 12) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: '92D050' },
            };
          } else if (colNumber >= 13 && colNumber <= 14) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'DA9694' },
            };
          } else if (colNumber >= 15 && colNumber <= 18) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'C4D79B' },
            };
          } else if (colNumber >= 19 && colNumber <= 24) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: '538DD5' },
            };
          } else if (colNumber >= 25 && colNumber <= 26) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'B1A0C7' },
            };
          } else if (colNumber >= 27 && colNumber <= 36) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FABF8F' },
            };
          } else if (colNumber >= 37 && colNumber <= 39) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: '92CDDC' },
            };
          } else if (colNumber >= 40 && colNumber <= 48) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'A6A6A6' },
            };
          }
        });
      }
      newRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        if (colNumber > 1) {
          cell.alignment = { horizontal: 'center' };
          if (rowIndex > 2) {
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
        }
      });

      const cellValue = row[1];
      if (!isNaN(parseFloat(cellValue))) {
        newRow.getCell(2).value = parseFloat(cellValue);
      }
    });

    worksheet.mergeCells('B4:B5');
    worksheet.getCell('B4').value = 'Pay Status';
    worksheet.getCell('B4').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '222B35' }, // blue background
    };
    worksheet.getCell('B4').font = {
      bold: true,
      size: 12,
      color: { argb: 'FFFFFF' },
    };
    worksheet.getCell('B4').alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    };
    worksheet.getCell('B4').border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
    worksheet.mergeCells('C4:C5');
    worksheet.getCell('C4').value = 'Disbursement Code';
    worksheet.getCell('C4').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '222B35' }, // blue background
    };
    worksheet.getCell('C4').font = {
      bold: true,
      size: 12,
      color: { argb: 'FFFFFF' },
    };
    worksheet.getCell('C4').alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    };
    worksheet.getCell('C4').border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    worksheet.getColumn(1).width = 3;
    worksheet.getColumn(6).width = 30;
    // worksheet.getColumn(50).width = 20;
    // worksheet.getColumn(57).width = 30;
    worksheet.getRow(1).height = 45;
    worksheet.mergeCells('B1:F1');
    worksheet.getCell('B1').value = `${
      context?.userData?.company?.companyName || ''
    } (${departmentName})`;
    worksheet.getCell('B1').font = { bold: true, size: 22 };
    worksheet.getCell('B1').alignment = {
      vertical: 'middle',
      wrapText: true,
    };

    worksheet.mergeCells('B2:D2');
    worksheet.getCell('B2').value = `${businessMonthCycle[0]?.code}`;
    worksheet.getCell('B2').font = { bold: true, size: 14 };
    worksheet.getCell('B2').alignment = {
      vertical: 'middle',
      wrapText: true,
    };

    worksheet.getRow(2).height = 20;
    worksheet.getRow(3).height = 20;
    worksheet.getRow(4).height = 17.5;
    worksheet.getRow(5).height = 17.5;

    // Regular
    worksheet.mergeCells('I4:L4');
    worksheet.getCell('I4').value = 'REGULAR';
    worksheet.getCell('I4').font = { bold: true, size: 12 };
    worksheet.getCell('I4').alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    };
    worksheet.getCell('I4').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'AFDC7E' },
    };
    worksheet.getCell('I4').border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    //Absent
    worksheet.mergeCells('M4:N4');
    worksheet.getCell('M4').value = 'ABSENT';
    worksheet.getCell('M4').font = { bold: true, size: 12 };
    worksheet.getCell('M4').alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    };
    worksheet.getCell('M4').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'E6B8B7' },
    };
    worksheet.getCell('M4').border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    //Tardiness
    worksheet.mergeCells('O4:R4');
    worksheet.getCell('O4').value = 'TARDINESS';
    worksheet.getCell('O4').font = { bold: true, size: 12 };
    worksheet.getCell('O4').alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    };
    worksheet.getCell('O4').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'D8E4BC' },
    };
    worksheet.getCell('O4').border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    //Overtime
    worksheet.mergeCells('S4:X4');
    worksheet.getCell('S4').value = 'OVERTIME';
    worksheet.getCell('S4').font = { bold: true, size: 12 };
    worksheet.getCell('S4').alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    };
    worksheet.getCell('S4').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '8DB4E2' },
    };
    worksheet.getCell('S4').border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    //Night Diff
    worksheet.mergeCells('Y4:Z4');
    worksheet.getCell('Y4').value = 'NIGHT DIFFERENTIAL';
    worksheet.getCell('Y4').font = { bold: true, size: 12 };
    worksheet.getCell('Y4').alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    };
    worksheet.getCell('Y4').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'CCC0DA' },
    };
    worksheet.getCell('Y4').border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    //Holidays
    worksheet.mergeCells('AA4:AJ4');
    worksheet.getCell('AA4').value = 'HOLIDAYS';
    worksheet.getCell('AA4').font = { bold: true, size: 12 };
    worksheet.getCell('AA4').alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    };
    worksheet.getCell('AA4').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FCD5B4' },
    };
    worksheet.getCell('AA4').border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    //Adjustments
    worksheet.mergeCells('AL4:AM4');
    worksheet.getCell('AL4').value = 'ADJUSTMENTS';
    worksheet.getCell('AL4').font = { bold: true, size: 12 };
    worksheet.getCell('AL4').alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    };
    worksheet.getCell('AL4').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'B7DEE8' },
    };
    worksheet.getCell('AL4').border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    // Deductions
    worksheet.mergeCells('AO4:AV4');
    worksheet.getCell('AO4').value = 'DEDUCTIONS';
    worksheet.getCell('AO4').font = { bold: true, size: 12 };
    worksheet.getCell('AO4').alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    };
    worksheet.getCell('AO4').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'D9D9D9' },
    };
    worksheet.getCell('AO4').border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    worksheet.mergeCells('D4:D5');
    worksheet.getCell('D4').value = 'Employee ID';
    worksheet.getCell('D4').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '222B35' },
    };
    worksheet.getCell('D4').font = {
      bold: true,
      size: 12,
      color: { argb: 'FFFFFF' },
    };
    worksheet.getCell('D4').alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    };
    worksheet.getCell('D4').border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    worksheet.mergeCells('E4:E5');
    worksheet.getCell('E4').value = 'Employee Name';
    worksheet.getCell('E4').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '222B35' },
    };
    worksheet.getCell('E4').font = {
      bold: true,
      size: 12,
      color: { argb: 'FFFFFF' },
    };
    worksheet.getCell('E4').alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    };
    worksheet.getCell('E4').border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    worksheet.mergeCells('F4:F5');
    worksheet.getCell('F4').value = 'Department Name';
    worksheet.getCell('F4').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '222B35' },
    };
    worksheet.getCell('F4').font = {
      bold: true,
      size: 12,
      color: { argb: 'FFFFFF' },
    };
    worksheet.getCell('F4').alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    };
    worksheet.getCell('F4').border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    worksheet.mergeCells('G4:G5');
    worksheet.getCell('G4').value = 'Wallet Number';
    worksheet.getCell('G4').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '222B35' },
    };
    worksheet.getCell('G4').font = {
      bold: true,
      size: 12,
      color: { argb: 'FFFFFF' },
    };
    worksheet.getCell('G4').alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    };
    worksheet.getCell('G4').border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    worksheet.mergeCells('H4:H5');
    worksheet.getCell('H4').value = 'Daily Rate';
    worksheet.getCell('H4').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '222B35' },
    };
    worksheet.getCell('H4').font = {
      bold: true,
      size: 12,
      color: { argb: 'FFFFFF' },
    };
    worksheet.getCell('H4').alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    };
    worksheet.getCell('H4').border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    worksheet.mergeCells('AK4:AK5');
    worksheet.getCell('AK4').value = 'Allowance';
    worksheet.getCell('AK4').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '222B35' },
    };
    worksheet.getCell('AK4').font = {
      bold: true,
      size: 12,
      color: { argb: 'FFFFFF' },
    };
    worksheet.getCell('AK4').alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    };
    worksheet.getCell('AK4').border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    worksheet.mergeCells('AN4:AN5');
    worksheet.getCell('AN4').value = 'Gross Pay';
    worksheet.getCell('AN4').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '222B35' },
    };
    worksheet.getCell('AN4').font = {
      bold: true,
      size: 12,
      color: { argb: 'FFFFFF' },
    };
    worksheet.getCell('AN4').alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    };
    worksheet.getCell('AN4').border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    worksheet.mergeCells('AW4:AW5');
    worksheet.getCell('AW4').value = 'Total Deductions';
    worksheet.getCell('AW4').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '222B35' },
    };
    worksheet.getCell('AW4').font = {
      bold: true,
      size: 12,
      color: { argb: 'FFFFFF' },
    };
    worksheet.getCell('AW4').alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    };
    worksheet.getCell('AW4').border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    worksheet.mergeCells('AX4:AX5');
    worksheet.getCell('AX4').value = 'Net Pay';
    worksheet.getCell('AX4').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '222B35' },
    };
    worksheet.getCell('AX4').font = {
      bold: true,
      size: 12,
      color: { argb: 'FFFFFF' },
    };
    worksheet.getCell('AX4').alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    };
    worksheet.getCell('AX4').border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    worksheet.mergeCells('AY4:AY5');
    worksheet.getCell('AY4').value = 'Remarks';
    worksheet.getCell('AY4').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '222B35' }, // blue background
    };
    worksheet.getCell('AY4').font = {
      bold: true,
      size: 12,
      color: { argb: 'FFFFFF' },
    };
    worksheet.getCell('AY4').alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    };
    worksheet.getCell('AY4').border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    const workbookBuffer = workbook.xlsx.writeBuffer();
    workbookBuffer.then((buffer) => {
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${action} | ${
        businessMonthCycle[0].code
      } - ${moment().format('MM/DD/YYYY hh:mm:ss')}.xlsx`;
      a.click();
    });
  }

  function setActivityLog() {
    axios
      .put(
        `/api/adminDashboard/activityLogs?message=Generated-Payslip`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
          },
        }
      )
      .then((response) => {});
  }
};

export default Index;
