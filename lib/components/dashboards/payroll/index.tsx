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
    refetchOnWindowFocus: false,
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
      setPostedOptions(response.data);
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
        refetchOnWindowFocus: false,
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
        refetchOnWindowFocus: false,
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
        refetchOnWindowFocus: false,
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
        refetchOnWindowFocus: false,
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
        refetchOnWindowFocus: false,
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
          unpostedPayrolls?.map((item: any) => ({
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

  const onInputChangeReports = (fieldName: string, value: string) => {
    setFormDataPost((prev: any) => ({ ...prev, businessMonthCycle: null }));
    setFormDataPost((prev: any) => ({ ...prev, [fieldName]: value }));
    setIsDisabled(false);

    if (fieldName == 'departmentId') {
      if (!postedPayrollQuery.isLoading && departmentOpts) {
        const dept = departmentOpts.find((dpt: any) => {
          return dpt.code == value;
        });
        setDepartmentNameForPayrollReport(() => dept.name);
      }
      if (postedPayrollQuery.isLoading) {
        setBusinessMonthCycleOpts({
          name: 'Loading. Please wait...',
          code: 'Loading. Please wait...',
        });
      } else {
        const postedPayrolls = postedPayrollQuery?.data.count
          .filter((item: any) => item.isPosted && item.departmentId == value)
          ?.map((item: any) => ({
            name: `${item.businessMonth} - ${item.cycle}`,
            code: `${item.businessMonth} - ${item.cycle}`,
          }));
        const ids = postedPayrolls?.map(({ code }: any) => code);
        setBusinessMonthCycleOpts(
          postedPayrolls.filter(
            ({ code }: any, index: number) => !ids.includes(code, index + 1)
          )
        );
      }
    }
  };

  const [processingPayroll, setProcessingPayroll] = useState<
    ProcessingPayroll[]
  >([]);
  

  const generatePayslipHandler = async () => {
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
        const baseDuration = 2000;
        await setPayrollReports(() => payslipData.data.payrollReport);
        const waitingTimeMultiplier =
          payslipData.data.payrollReport.length / 50;
        setTimeout(() => {
          downloadPayslipRef.current.click();
          setPayrollReports([]);
        }, baseDuration + 5000 * waitingTimeMultiplier);
        // clear out in memory to not render the payslip behind the scenes
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
        departmentsQuery?.data?.map((item: any) => ({
          name: !item.deletedAt
            ? item.departmentName
            : item.departmentName + ' - DELETED',
          code: item.departmentId,
          others: item,
        }))
      );
    }
  }, [departmentsQuery.data]);

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

  // useEffect(() => {
  //   if ( &&pendingPayrollQuery.isLoading|| pendingPayrollQuery.isRefetching|| postedPayrollQuery.isLoading|| postedPayrollQuery.isRefetching||failedPayrollQuery.isLoading|| failedPayrollQuery.isRefetching) {

  //   }
  // }, [pendingPayrollQuery.isLoading, pendingPayrollQuery.isRefetching, postedPayrollQuery.isLoading, postedPayrollQuery.isRefetching,failedPayrollQuery.isLoading, failedPayrollQuery.isRefetching]);
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
        }}
        label={{
          mainHeader: 'Generate Payroll Report',
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
        filename={`${selectedDepartmentName}-${new Date().getTime()}.csv`}
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
            backendError?.map((item: any, index: number) => (
              <div className="my-4" key={index}>
                <h4 className="font-bold">{item.headerTitle}</h4>
                <>
                  {Array.isArray(item.error) ? (
                    <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
                      {item.error?.map((message: any, msgIndex: number) => (
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
                  {/* horizontal */}
                  {payrollReports?.map((data: any, index: number) => {
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

                    const halfdayPresentonRHDSum =
                      halfdayPresentonRHD * 0.5 * data.dailyRate;
                    
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
                                  {allowanceBreakdownsData?.map(
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
                              {data.payroll_adjustments?.map(
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
                              {otherBreakdownArr?.map(
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

  function getReports(action: string) {
    toast.current?.replace({
      severity: 'info',
      summary: 'Generating Payroll report',
      detail: 'Please wait...',
      sticky: true,
      closable: false,
    });

    setIsDisabled(true);
    axios
      .post(
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
      )
      .then((response) => {
        const payrollFormat = response.data.payrollReport?.map(
          (payroll: any) => {
            const employeeName =
              payroll?.employee?.employee_profile?.employeeFullName;

            let workedOnRD = payroll.workedOnRestDays;
            let workedOnSPHD = payroll.workedOnSpecialHoliday;
            let workedOnSPHDWhileRD =
              payroll.workedOnSpecialHolidayWhileRestDay;
            let workedOnRHD = payroll.workedOnRegularHoliday;
            let workedOnRHDWhileRD = payroll.workedOnRegularHolidayWhileRestDay;
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

            
            return [
              '',
              payroll?.isPosted
                ? payroll?.disbursementStatus == 0
                  ? payroll.netPay <= 0
                    ? 'Posted'
                    : 'On Going'
                  : payroll?.disbursementStatus == 1
                  ? 'Disbursed'
                  : 'Failed'
                : '',
              payroll?.disbursementCode,
              //employee code
              payroll.employee.employeeCode,
              //employee name
              employeeName,
              //employee wallet id
              payroll?.employee?.mlWalletId,
              //employee daily rate
              amountFormatter(payroll?.dailyRate),
              //employee days worked
              payroll.daysWorked -
                (workedOnRD +
                  workedOnRHD +
                  workedOnRHDWhileRD +
                  workedOnSPHD +
                  workedOnSPHDWhileRD),
              //employee days worked pay
              amountFormatter((payroll.daysWorked -
                (workedOnRD +
                  workedOnRHD +
                  workedOnRHDWhileRD +
                  workedOnSPHD +
                  workedOnSPHDWhileRD)) *
                payroll.dailyRate),
              //rest day present
              workedOnRD,
              //rest day pay
              amountFormatter(workedOnRD * payroll.dailyRate * (payroll.restDayRate / 100)),
              //reg days absent
              payroll.daysAbsent +
                halfDayAbsent * 0.5 -
                payroll.specialHolidaysAbsent,
              //reg days absent pay
              amountFormatter((payroll.daysAbsent +
                halfDayAbsent * 0.5 -
                payroll.specialHolidaysAbsent) *
                payroll.dailyRate),
              //special holiday absent
              // payroll.specialHolidaysAbsent + halfdayPresentonSPHD * 0.5,
              //special holiday absent pay
              // (payroll.specialHolidaysAbsent + halfdayPresentonSPHD * 0.5) *
              // payroll.dailyRate * 1,
              payroll.lateHrs,
              amountFormatter(payroll.latePay),
              payroll.undertimeHrs,
              amountFormatter(payroll.undertimePay),
              //overtime on regular days
              OTonRegDays,
              //overtime on regular days pay
              amountFormatter(OTonRegDays * payroll?.overtimeRateRegDays),
              //overtime on holidays
              OTonHolidays,
              //overtime on holidays pay
              amountFormatter(OTonHolidays * payroll?.overtimeRateHolidays),
              //overtime on rest days
              OTonRestDays,
              //overtime on rest days pay
              amountFormatter(OTonRestDays * payroll?.overtimeRateRestDays),
              payroll?.nightDiffHrs,
              amountFormatter(payroll?.nightDiffPay),
              //regular holiday present
              workedOnRHD,
              //regular holiday pay
              amountFormatter(workedOnRHD *
                payroll.dailyRate *
                (payroll.regularHolidayRate / 100)),
              //regular holiday and rest day present
              workedOnRHDWhileRD,
              //regular holiday and rest day pay
              amountFormatter(workedOnRHDWhileRD *
                payroll.dailyRate *
                (payroll.regularHolidayRestDayRate / 100)),
              //regular holiday absent
              payroll.regularHolidaysAbsent + halfdayPresentonRHD * 0.5,
              //regular holiday absent pay
              amountFormatter((payroll.regularHolidaysAbsent + halfdayPresentonRHD * 0.5) *
                payroll.dailyRate *
                1),
              //special holiday present
              workedOnSPHD,
              //special holiday pay
              amountFormatter(workedOnSPHD *
                payroll.dailyRate *
                (payroll.specialHolidayRate / 100)),
              //special holiday and rest day present
              workedOnSPHDWhileRD,
              //special holiday and rest day pay
              amountFormatter(workedOnSPHDWhileRD *
                payroll.dailyRate *
                (payroll.specialHolidayRestDayRate / 100)),
              amountFormatter(payroll?.allowance),
              amountFormatter(payroll?.addAdjustment),
              amountFormatter(payroll?.deductAdjustment),
              amountFormatter(payroll?.grossPay),
              amountFormatter(payroll?.philhealthContribution),
              amountFormatter(payroll?.sssContribution),
              amountFormatter(payroll?.pagIbigContribution),
              amountFormatter(cashAdvanceSum),
              amountFormatter(sssLoanSum + sssCalamityLoanSum),
              amountFormatter(pagIbigLoanSum),
              // ledgerSum,
              amountFormatter(otherSum),
              amountFormatter(payroll?.withholdingTax),
              amountFormatter(payroll?.totalDeduction),
              amountFormatter(payroll?.netPay),
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

        const payrollFormatSummary = response.data.payrollReport?.map(
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
        // console.log(response.data.departmentName);
        generateReport(
          payrollFormat,
          payrollFormatSummary,
          action,
          response.data.companyRate,
          response.data.departmentName
        );

        toast.current?.replace({
          severity: 'success',
          summary: 'Payroll report generated successfully',
          closable: true,
          life: 5000,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function generateReport(
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
      ['', `${departmentName} ${formDataPost.businessMonthCycle}`],
      [...new Array(29).fill(''), ''],
      [...new Array(29).fill(''), ''],
      [
        '',
        'Pay Status',
        'Disbursement Code',
        'Employee ID',
        'Employee Name',
        'Wallet #',
        'Daily',
        'Reg Days Present',
        'Pay',
        'RD Present',
        `Pay`,
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
        `Pay`,
        'Reg HD Present',
        `Pay`,
        'Reg HD while RD',
        `Pay`,
        'Absent on Reg HD',
        `Pay`,
        'SP HD Present',
        `Pay`,
        'SP HD while RD',
        `Pay`,
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
        'PAG-IBIG Loan',
        // 'Ledger',
        'Others',
        'Withholding Tax',
        'Total Deductions',
        'Net Pay',
        'Remarks',
      ],
      ...report?.map((data: any, index: number) => {
        return [...data?.map((item: any) => item)];
      }),
      
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

          if (colNumber >= 7 && colNumber <= 11) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: '92D050' },
            };
          } else if (colNumber >= 12 && colNumber <= 13) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'DA9694' },
            };
          } else if (colNumber >= 14 && colNumber <= 17) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'C4D79B' },
            };
          } else if (colNumber >= 18 && colNumber <= 23) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: '538DD5' },
            };
          } else if (colNumber >= 24 && colNumber <= 25) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'B1A0C7' },
            };
          } else if (colNumber >= 26 && colNumber <= 35) {
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
          } else if (colNumber >= 40 && colNumber <= 47) {
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
    worksheet.getCell('B2').value = `${formDataPost.businessMonthCycle}`;
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
    worksheet.mergeCells('H4:K4');
    worksheet.getCell('H4').value = 'REGULAR';
    worksheet.getCell('H4').font = { bold: true, size: 12 };
    worksheet.getCell('H4').alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    };
    worksheet.getCell('H4').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'AFDC7E' },
    };
    worksheet.getCell('H4').border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    //Absent
    worksheet.mergeCells('L4:M4');
    worksheet.getCell('L4').value = 'ABSENT';
    worksheet.getCell('L4').font = { bold: true, size: 12 };
    worksheet.getCell('L4').alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    };
    worksheet.getCell('L4').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'E6B8B7' },
    };
    worksheet.getCell('L4').border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    //Tardiness
    worksheet.mergeCells('N4:Q4');
    worksheet.getCell('N4').value = 'TARDINESS';
    worksheet.getCell('N4').font = { bold: true, size: 12 };
    worksheet.getCell('N4').alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    };
    worksheet.getCell('N4').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'D8E4BC' },
    };
    worksheet.getCell('N4').border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    //Overtime
    worksheet.mergeCells('R4:W4');
    worksheet.getCell('R4').value = 'OVERTIME';
    worksheet.getCell('R4').font = { bold: true, size: 12 };
    worksheet.getCell('R4').alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    };
    worksheet.getCell('R4').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '8DB4E2' },
    };
    worksheet.getCell('R4').border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    //Night Diff
    worksheet.mergeCells('X4:Y4');
    worksheet.getCell('X4').value = 'NIGHT DIFFERENTIAL';
    worksheet.getCell('X4').font = { bold: true, size: 12 };
    worksheet.getCell('X4').alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    };
    worksheet.getCell('X4').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'CCC0DA' },
    };
    worksheet.getCell('X4').border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    //Holidays
    worksheet.mergeCells('Z4:AI4');
    worksheet.getCell('Z4').value = 'HOLIDAYS';
    worksheet.getCell('Z4').font = { bold: true, size: 12 };
    worksheet.getCell('Z4').alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    };
    worksheet.getCell('Z4').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FCD5B4' },
    };
    worksheet.getCell('Z4').border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    //Adjustments
    worksheet.mergeCells('AK4:AL4');
    worksheet.getCell('AK4').value = 'ADJUSTMENTS';
    worksheet.getCell('AK4').font = { bold: true, size: 12 };
    worksheet.getCell('AK4').alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    };
    worksheet.getCell('AK4').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'B7DEE8' },
    };
    worksheet.getCell('AK4').border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    // Deductions
    worksheet.mergeCells('AN4:AU4');
    worksheet.getCell('AN4').value = 'DEDUCTIONS';
    worksheet.getCell('AN4').font = { bold: true, size: 12 };
    worksheet.getCell('AN4').alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    };
    worksheet.getCell('AN4').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'D9D9D9' },
    };
    worksheet.getCell('AN4').border = {
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
    worksheet.getCell('F4').value = 'Wallet Number';
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
    worksheet.getCell('G4').value = 'Daily Rate';
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

    worksheet.mergeCells('AJ4:AJ5');
    worksheet.getCell('AJ4').value = 'Allowance';
    worksheet.getCell('AJ4').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '222B35' },
    };
    worksheet.getCell('AJ4').font = {
      bold: true,
      size: 12,
      color: { argb: 'FFFFFF' },
    };
    worksheet.getCell('AJ4').alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    };
    worksheet.getCell('AJ4').border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    worksheet.mergeCells('AM4:AM5');
    worksheet.getCell('AM4').value = 'Gross Pay';
    worksheet.getCell('AM4').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '222B35' },
    };
    worksheet.getCell('AM4').font = {
      bold: true,
      size: 12,
      color: { argb: 'FFFFFF' },
    };
    worksheet.getCell('AM4').alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    };
    worksheet.getCell('AM4').border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    worksheet.mergeCells('AV4:AV5');
    worksheet.getCell('AV4').value = 'Total Deductions';
    worksheet.getCell('AV4').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '222B35' },
    };
    worksheet.getCell('AV4').font = {
      bold: true,
      size: 12,
      color: { argb: 'FFFFFF' },
    };
    worksheet.getCell('AV4').alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    };
    worksheet.getCell('AV4').border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    worksheet.mergeCells('AW4:AW5');
    worksheet.getCell('AW4').value = 'Net Pay';
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
    worksheet.getCell('AX4').value = 'Remarks';
    worksheet.getCell('AX4').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '222B35' }, // blue background
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

    const workbookBuffer = workbook.xlsx.writeBuffer();
    workbookBuffer.then((buffer) => {
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${action} | ${
        formDataPost.businessMonthCycle
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
