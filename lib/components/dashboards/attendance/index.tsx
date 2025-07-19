'use client';

import React, { useContext, useEffect, useRef, useState } from 'react';

import { ButtonType } from '@enums/button';
import { FormType } from '@enums/sidebar';

import { attendanceImportHeaders } from '@constant/csvData';
import { useQueries } from '@tanstack/react-query';
import {
  getEmployeesWithCreditableOT,
  getWeeklyCycles,
} from '@utils/companyDetailsGetter';
import axios from 'axios';
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
import { Toast } from 'primereact/toast';
import { CSVLink } from 'react-csv';
import AttendanceTable from './attendanceTable';
import CSVUpload from './csvUpload';
import DeleteSidebar from './deleteSidebar';
import EmployeeAttendanceSidebar from './employeeAttendanceSidebar';

const Index = ({ actions }: { actions: [] }) => {
  const toast = useRef<Toast>(null);
  const [pedningAttendanceFilters, setPedningAttendanceFilters] = useState({
    departmentId: {
      value: null,
      matchMode: FilterMatchMode.EQUALS,
    },
  });
  const [postedAttendanceFilters, setPostedAttendanceFilters] = useState({
    departmentId: {
      value: null,
      matchMode: FilterMatchMode.EQUALS,
    },
  });
  const downloadCSVTemplateRef: any = useRef<any>(null);
  const [postAttendance, setPostAttendance] = useState(false);
  const [downloadAttendance, setDownloadAttendance] = useState(false);
  const [downloadSidebar, setDownloadSidebar] = useState(false);
  const [importAttendance, setImportAttendance] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sideBarConfig, setSideBarConfig] = useState<SideBarConfig>({
    title: '',
    submitBtnText: '',
    action: '',
    rowData: {},
    isOpen: false,
  });
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
  const context = useContext(GlobalContainer);
  const userData = context?.userData;
  const [pageActions, setPageAction] = useState<any>({
    postAttendance: false,
    downloadAndImport: false,
    deleteAttendance: false,
  });
  const [backendError, setBackendError] = useState<any>([]);
  const [isDisabled, setIsDisabled] = useState(false);
  const [formDataDownload, setFormDataDownload] = useState<any>('');
  const [formDataPost, setFormDataPost] = useState<any>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [hasCreditableOT, setHasCreditableOT] = useState(false);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [employeesWithCreditableOT, setEmployeesWithCreditableOT] =
    useState<any>(null);
  const [forceResetSelectedRows, setForceResetSelectedRows] = useState(false);
  const [pendingAttendancePagination, setPendingAttendancePagination] =
    useState({
      offset: 0,
      limit: 5,
      first: 0,
    });

  const [postedAttendancePagination, setPostedAttendancePagination] = useState({
    offset: 0,
    limit: 5,
    first: 0,
  });
  const [attendanceTemplateData, setAttendanceTemplateData] = useState<any>([]);
  const [cycleOpts, setCycleOpts] = useState<any>(null);
  const [semiWeeklyDates, setSemiWeeklyDates] = useState<any>({
    startDate: new Date(),
    endDate: new Date(),
  });
  const [payrollType, setPayrollType] = useState<any>(null);
  const [businessMonthCycleOpts, setBusinessbusinessMonthCycleOpts] =
    useState<any>([]);
  const [departmentOpts, setDepartmentOpts] = useState<any>(null);
  useEffect(() => {
    if (userData.role == 'ADMIN' || userData.role == 'SUPER_ADMIN') {
      setPageAction({
        postAttendance: true,
        downloadAndImport: true,
        deleteAttendance: true,
      });
      return;
    }
    let tempPageActions = { ...pageActions };
    for (let i = 0; i < actions?.length; i++) {
      switch (actions[i]) {
        case 'POST ATTENDANCE':
          tempPageActions.postAttendance = true;
          break;
        case 'DOWNLOAD AND IMPORT ATTENDANCE':
          tempPageActions.downloadAndImport = true;
          break;
        case 'DELETE ATTENDANCE':
          tempPageActions.deleteAttendance = true;
          break;
        default:
          break;
      }
    }
    setPageAction(tempPageActions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actions]);
  const [departmentsQuery, pendingAttendanceQuery, postedAttendanceQuery] =
    useQueries({
      queries: [
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
          queryKey: [
            'pendingAttendances',
            pendingAttendancePagination,
            searchQuery,
            pedningAttendanceFilters,
          ],
          queryFn: async () => {
            const response = await axios.get(
              `/api/attendances?status=PENDING&limit=${pendingAttendancePagination.limit}&offset=${pendingAttendancePagination.offset}&search=${searchQuery}&departmentId=${pedningAttendanceFilters.departmentId.value}`,
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
            'postedAttendances',
            postedAttendancePagination,
            searchQuery,
            postedAttendanceFilters,
          ],
          queryFn: async () => {
            const response = await axios.get(
              `/api/attendances?status=POSTED&limit=${postedAttendancePagination.limit}&offset=${postedAttendancePagination.offset}&search=${searchQuery}&departmentId=${postedAttendanceFilters.departmentId.value}`,
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
  // functions to check if user can see these buttons

  // On change Download input fields
  const onInputChangeDownload = async (fieldName: string, value: string) => {
    setIsDisabled(false);
    if (fieldName == 'departmentId') {
      setCycleOpts(null);
      const departmentDetails = departmentsQuery.data.find(
        (i: any) => i.departmentId == value
      );

      const { payroll_type } = departmentDetails;
      if (payroll_type) {
        const { type } = payroll_type;
        setPayrollType(type);
      }
      return setFormDataDownload({ [fieldName]: value });
    }

    setFormDataDownload((prev: any) => ({ ...prev, [fieldName]: value }));
    let startOfMonth: any = null;
    let endOfMonth: any = null;
    if (fieldName == 'businessMonth' && formDataDownload.departmentId) {
      const departmentDetails = departmentsQuery.data.find(
        (i: any) => i.departmentId == formDataDownload.departmentId
      );

      const { payroll_type, departmentName } = departmentDetails;
      if (payroll_type) {
        const { company_pay_cycles, type } = payroll_type;

        startOfMonth = moment(value).startOf('month');
        endOfMonth = startOfMonth.clone().endOf('month');
        // console.log(
        //   startOfMonth.format('YYYY-MM-DD'),
        //   endOfMonth.format('YYYY-MM-DD')
        // );

        setSemiWeeklyDates((prev: any) => ({
          ...prev,
          startDateMin: startOfMonth.toDate(),
          startDateMax: endOfMonth.toDate(),
        }));
        if (type == 'WEEKLY') {
          setCycleOpts(
            await getWeeklyCycles({
              selectedMonth: moment(value).format('MMMM YYYY'),
              payDay: company_pay_cycles[0].payDate,
            })
          );
        } else {
          setCycleOpts(
            company_pay_cycles?.map((item: any) => ({
              name: item.cycle,
              code: item.cycle,
            }))
          );
        }

        let chosenStartDate = startOfMonth.toDate();
        let chosenEndDate = startOfMonth.clone().add(3, 'day').toDate();
        // console.log(chosenStartDate, chosenEndDate);
        // console.log('myDates!');
        // console.log(startOfMonth.toDate(), chosenStartDate);
        if (
          formDataDownload.startDate < startOfMonth.toDate() ||
          formDataDownload.startDate > endOfMonth.toDate()
        ) {
          chosenStartDate = startOfMonth.toDate();
        }
        if (
          formDataDownload.endDate < startOfMonth.toDate() ||
          formDataDownload.endDate > endOfMonth.toDate()
        ) {
          chosenEndDate = startOfMonth.clone().add(3, 'day').toDate();
        }
        if (chosenStartDate > chosenEndDate) {
          toast.current?.replace({
            severity: 'error',
            summary: 'Chosen dates are invalid.',
            detail: 'Start date should be less than end date.',
            sticky: true,
            closable: true,
          });
          return false;
        }

        setSemiWeeklyDates((prev: any) => ({
          ...prev,
          endDateMin: startOfMonth.clone().add(1, 'day').toDate(),
          endDateMax: chosenEndDate,
        }));
        setFormDataDownload((prev: any) => ({
          ...prev,
          payrollType: type,
          departmentName: departmentName,
          startDate: chosenStartDate,
          endDate: chosenEndDate,
        }));
      }
    }
  };

  // On click download attendance template button
  const downloadTemplateHandler = async () => {
    toast.current?.replace({
      severity: 'info',
      summary: 'Downloading Attendance',
      detail: 'Please wait...',
      sticky: true,
      closable: false,
    });
    setIsDisabled(true);

    formDataDownload.businessMonth = moment(
      formDataDownload.businessMonth
    ).format('MMMM YYYY');
    if (formDataDownload.payrollType == 'SEMI-WEEKLY') {
      formDataDownload.cycle = `[${moment(formDataDownload.startDate).format(
        'MM/DD/YYYY'
      )}-${moment(formDataDownload.endDate).format('MM/DD/YYYY')}]`;
      // formDataDownload.endDate = moment(formDataDownload.endDate).format('MMMM YYYY');
    }
    const response = await axios
      .post('/api/attendances/employees', formDataDownload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
        },
      })
      .then((res: any) => {
        toast.current?.clear();
        toast.current?.replace({
          summary: res.data.summary,
          detail: res.data.detail,
          severity: res.data.severity,
          life: 10000,
          closable: true,
        });

        if (!res.data.success) {
          return false;
        }

        setAttendanceTemplateData(res.data.data);
      })
      .catch((err: any) => {
        toast.current?.clear();
        toast.current?.replace({
          summary: 'Error',
          detail: err.message,
          severity: 'error',
          life: 10000,
          closable: true,
        });
      });
  };

  // Set Department filter options
  useEffect(() => {
    setPedningAttendanceFilters((prev: any) => ({
      departmentId: {
        value: null,
        matchMode: FilterMatchMode.EQUALS,
      },
    }));
    setPostedAttendanceFilters((prev: any) => ({
      departmentId: {
        value: null,
        matchMode: FilterMatchMode.EQUALS,
      },
    }));
  }, [searchQuery]);
  useEffect(() => {
    if (departmentsQuery?.data && departmentsQuery?.data.length > 0) {
      setDepartmentOpts(
        departmentsQuery?.data
          .filter((i: any) => i.payroll_type && !i.deletedAt)
          .map((item: any) => ({
            name: item.departmentName,
            code: item.departmentId,
            others: item,
          }))
      );
    }
  }, [departmentsQuery.data]);

  // Trigger Download CSV and resetting states
  useEffect(() => {
    if (attendanceTemplateData.length > 0) {
      setDownloadAttendance(true);
      // let timeout = setTimeout(() => {
      downloadCSVTemplateRef.current.link.click();
      setAttendanceTemplateData([]);
      setDownloadAttendance(false);
      setDownloadSidebar(false);
      emptyFormaData();
      // }, 5000);
      // return () => clearTimeout(timeout);
    }
  }, [attendanceTemplateData]);

  useEffect(() => {
    if (!downloadAttendance) {
      setFormDataPost('');
      setFormDataDownload('');
      setBusinessbusinessMonthCycleOpts([]);
    }
  }, [postAttendance, downloadAttendance]);

  const emptyFormaData = () => {
    setFormDataPost('');
    setFormDataDownload('');
    setBusinessbusinessMonthCycleOpts([]);
  };
  return (
    <div className="w-screen h-screen overflow-auto p-5">
      <Toast ref={toast} position="bottom-left" />
      {/* DASHBOARD NAV */}
      <DashboardNav
        navTitle="Attendance"
        buttons={[
          pageActions.downloadAndImport && {
            label: 'Download/Import',
            type: ButtonType.Black,
            isDropdown: true,
            dropDownButtons: [
              {
                label: 'Download Attendance Format Sheet',
                dropDownHandler: () => setDownloadSidebar(true),
                tooltip:
                  'It is not advisable to use text editors to update the file',
              },
              {
                label: 'Import Attendance',
                dropDownHandler: () => setImportAttendance(true),
              },
            ],
            isIcon: true,
            icon: 'pi pi-calendar',
          },
        ]}
        isShowSearch={true}
        searchPlaceholder=""
        setValueSearchText={setSearchQuery}
        valueSearchText={searchQuery}
      />

      {/* MAIN CONTENT */}
      <div className="line-container rounded-lg p-5">
        <React.Fragment>
          {pendingAttendanceQuery.error ? (
            <ErrorDialog />
          ) : (
            <>
              <TabView>
                <TabPanel
                  className=" mb-[2px]"
                  header={
                    <div className="table-header overflow-hidden bg-transparent">
                      Pending{' '}
                      <Badge
                        className="table-badge"
                        value={
                          pendingAttendanceQuery.data
                            ? pendingAttendanceQuery?.data.count
                            : 0
                        }
                      ></Badge>
                    </div>
                  }
                >
                  <AttendanceTable
                    attendanceQuery={pendingAttendanceQuery}
                    departmentsQuery={departmentsQuery}
                    setSideBarConfig={setSideBarConfig}
                    filters={pedningAttendanceFilters}
                    setFilters={setPedningAttendanceFilters}
                    pagination={pendingAttendancePagination}
                    setPagination={setPendingAttendancePagination}
                    tableFor={'PENDING'}
                    isSubmitting={isSubmitting}
                    setIsSubmitting={setIsSubmitting}
                    pendingAttendanceQuery={pendingAttendanceQuery}
                    postedAttendanceQuery={postedAttendanceQuery}
                    toast={toast}
                    pageActions={pageActions}
                    // setHasCreditableOT={setHasCreditableOT}
                    // hasCreditableOT={hasCreditableOT}
                    // employeesWithCreditableOT={employeesWithCreditableOT}
                    forceResetSelectedRows={forceResetSelectedRows}
                  />

                  <Paginator
                    first={pendingAttendancePagination.first}
                    rows={pendingAttendancePagination.limit}
                    totalRecords={
                      pendingAttendanceQuery &&
                      pendingAttendanceQuery?.data?.count
                    }
                    rowsPerPageOptions={[5, 15, 25, 50]}
                    onPageChange={(event) => {
                      const { page, rows, first }: any = event;
                      setPendingAttendancePagination((prev: any) => ({
                        ...prev,
                        first: first,
                        offset: rows * page,
                        limit: rows,
                      }));
                    }}
                  />
                </TabPanel>
                <TabPanel
                  className=" mb-[2px]"
                  header={
                    <div className="table-header overflow-hidden bg-transparent">
                      Posted{' '}
                      <Badge
                        className="table-badge"
                        value={
                          postedAttendanceQuery.data
                            ? postedAttendanceQuery.data.count
                            : 0
                        }
                      ></Badge>
                    </div>
                  }
                >
                  <AttendanceTable
                    attendanceQuery={postedAttendanceQuery}
                    departmentsQuery={departmentsQuery}
                    setSideBarConfig={setSideBarConfig}
                    filters={postedAttendanceFilters}
                    setFilters={setPostedAttendanceFilters}
                    pagination={postedAttendancePagination}
                    pendingAttendanceQuery={pendingAttendanceQuery}
                    setPagination={setPostedAttendancePagination}
                    tableFor={'POSTED'}
                    isSubmitting={isSubmitting}
                    setIsSubmitting={setIsSubmitting}
                    // setHasCreditableOT={setHasCreditableOT}
                    // hasCreditableOT={false}
                    // employeesWithCreditableOT={employeesWithCreditableOT}
                    postedAttendanceQuery={postedAttendanceQuery}
                    toast={toast}
                    pageActions={pageActions}
                    forceResetSelectedRows={forceResetSelectedRows}
                  />

                  <Paginator
                    first={postedAttendancePagination.first}
                    rows={postedAttendancePagination.limit}
                    totalRecords={
                      postedAttendanceQuery &&
                      postedAttendanceQuery?.data?.count
                    }
                    rowsPerPageOptions={[5, 15, 25, 50]}
                    onPageChange={(event) => {
                      const { page, rows, first }: any = event;
                      setPostedAttendancePagination((prev: any) => ({
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
      <EmployeeAttendanceSidebar
        configuration={sideBarConfig}
        setSideBarConfig={setSideBarConfig}
        refetchDataFromParent={() => null}
        forceResetSelectedRows={forceResetSelectedRows}
        setForceResetSelectedRows={setForceResetSelectedRows}
      />

      <SideBar
        configuration={{
          isOpen: downloadSidebar,
          setIsOpen: setDownloadSidebar,
        }}
        label={{
          mainHeader: 'Download Attendance Format Sheet',
        }}
        onInputChange={onInputChangeDownload}
        formDataDownload={formDataDownload}
        setFormDataDownload={setFormDataDownload}
        setSemiWeeklyDates={setSemiWeeklyDates}
        form={{
          forms: [
            {
              label: 'Choose Department',
              type: FormType.Dropdown,
              name: 'departmentId',
              options: departmentOpts?.sort((a: any, b: any) =>
                a.name.localeCompare(b.name)
              ),
              value: formDataDownload && formDataDownload.departmentId,
              placeholder: !departmentsQuery.isLoading
                ? 'Choose Department'
                : 'Loading. Please wait...',
              isVisible: true,
              isRequired: false,
              isDisabled: false,
            },
            {
              label: 'Choose Business Month',
              type:
                formDataDownload && formDataDownload.departmentId
                  ? FormType.MonthYearPicker
                  : FormType.Dropdown,
              name: 'businessMonth',
              value:
                formDataDownload &&
                formDataDownload.businessMonth &&
                new Date(formDataDownload.businessMonth),
              placeholder: 'Choose Business Month',
              isVisible: true,
              isRequired: false,
              isDisabled: false,
            },

            ...(payrollType == null || payrollType !== 'SEMI-WEEKLY'
              ? [
                  {
                    label: 'Cycle',
                    type: FormType.Dropdown,
                    name: 'cycle',
                    value: formDataDownload && formDataDownload.cycle,
                    options: cycleOpts,
                    placeholder:
                      formDataDownload.businessMonth && cycleOpts == null
                        ? 'Loading. Please wait...'
                        : 'Choose Cycle',
                    isVisible: true,
                    isRequired: false,
                    isDisabled: false,
                  },
                ]
              : [
                  {
                    label: 'Start Date',
                    type: FormType.StartCalendar,
                    name: 'startDate',
                    value: formDataDownload && formDataDownload.startDate,
                    placeholder:
                      formDataDownload.businessMonth && cycleOpts == null
                        ? 'Loading. Please wait...'
                        : 'Choose Start Date',
                    isVisible: true,
                    isRequired: false,
                    startDate: semiWeeklyDates.startDateMin,
                    endDate: semiWeeklyDates.startDateMax,
                    isDisabled: !formDataDownload.businessMonth,
                  },
                  {
                    label: 'End Date',
                    type: FormType.EndCalendar,
                    name: 'endDate',
                    value: formDataDownload && formDataDownload.endDate,
                    placeholder:
                      formDataDownload.businessMonth && cycleOpts == null
                        ? 'Loading. Please wait...'
                        : 'Choose Start Date',
                    isVisible: true,
                    startDate: semiWeeklyDates.endDateMin,
                    endDate: semiWeeklyDates.endDateMax,
                    isRequired: false,
                    isDisabled: !formDataDownload.startDate,
                  },
                ]),
          ],
          buttons: [
            {
              label: 'Cancel',
              type: ButtonType.Transparent,
              handler: () => {
                setDownloadSidebar(false);
                emptyFormaData();
              },
            },
            {
              label: 'Download Template',
              type: ButtonType.Black,
              handler: () => downloadTemplateHandler(),
              isDisabled:
                !formDataDownload?.businessMonth ||
                (payrollType != 'SEMI-WEEKLY' && !formDataDownload?.cycle) ||
                (payrollType == 'SEMI-WEEKLY' &&
                  !formDataDownload?.startDate) ||
                (payrollType == 'SEMI-WEEKLY' && !formDataDownload?.endDate) ||
                isDisabled,
            },
          ],
        }}
      />

      <SideBar
        configuration={{
          isOpen: importAttendance,
          setIsOpen: setImportAttendance,
        }}
        label={{
          mainHeader: 'Import Attendance',
        }}
        form={{
          forms: [
            {
              label: 'Choose Month',
              type: FormType['File Upload'],
              name: 'chooseMonth',
              options: [{ name: 'Company 1', code: 'ABC' }],
              placeholder: 'Placeholder',
              isVisible: true,
              isRequired: false,
              isDisabled: false,
            },
          ],
          buttons: [
            { label: 'Cancel', type: ButtonType.Transparent },
            { label: 'Import Sheet', type: ButtonType.Red },
          ],
        }}
      />

      <CSVLink
        separator=","
        className="hidden"
        ref={downloadCSVTemplateRef}
        filename={`${formDataDownload.departmentName}-${moment(
          formDataDownload.businessMonth
        ).format('MMMM YYYY')}-${
          formDataDownload?.cycle?.toLowerCase().includes('cycle')
            ? formDataDownload.cycle
            : formDataDownload.cycle + ' Cycle'
        }-${new Date().getTime()}.csv`}
        data={attendanceTemplateData}
      />

      {/* DELETE SIDEBAR */}
      <DeleteSidebar
        deleteSidebarConfig={deleteSidebarConfig}
        setDeleteSidebarConfig={setDeleteSidebarConfig}
        refetch={pendingAttendanceQuery.refetch}
        selectedRows={[]}
        isSubmitting={isSubmitting}
        setIsSubmitting={setIsSubmitting}
        setSelectedRows={() => {}}
        departmentsAdded={{}}
        toast={toast}
      />

      <CSVUpload
        toast={toast}
        configuration={{
          headers: attendanceImportHeaders,
          apiUrl: '/api/attendances/bulkimport',
          isOpen: importAttendance,
          setIsOpen: setImportAttendance,
        }}
        label={{
          mainHeader: 'Import Attendance',
        }}
        refetchParent={pendingAttendanceQuery.refetch}
      />

      <Dialog
        onHide={() => {
          setBackendError([]);
          setEmployeesWithCreditableOT(null);
          setIsVisible(false);
        }}
        visible={isVisible}
        position="top"
        draggable={false}
        resizable={false}
        maximizable
        style={{ width: '50vw', minHeight: '30vh', maxHeight: '80vh' }}
        modal={true}
      >
        <TabView
          activeIndex={activeTabIndex}
          onTabChange={(e) => setActiveTabIndex(e.index)}
        >
          {employeesWithCreditableOT?.length > 0 && (
            <TabPanel
              header={
                <span
                  style={{
                    backgroundColor: activeTabIndex === 0 ? '#d61117' : '',
                    color: activeTabIndex === 0 ? 'white' : '',
                    padding: '10px 20px',
                    textAlign: 'center',
                  }}
                >
                  Employees with Uncredited Overtime
                </span>
              }
            >
              <div className="mb-5 gap-2 p-2 break-normal md:break-all">
                {employeesWithCreditableOT?.length > 0 &&
                  employeesWithCreditableOT?.map((item: any, index: number) => {
                    const departmentInfo = `Department: ${item?.departmentName}`;
                    const employeeInfo = item?.employeesWithCreditableOT
                      ?.map((employee: any) => {
                        return `[${employee.employeeFullName}]:  ${employee.totalCreditableOvertime}hrs`;
                      })
                      .join(', ');
                    return (
                      <div key={index}>
                        <strong className="block mb-2">{departmentInfo}</strong>
                        <ul className="list-disc list-inside space-y-1">
                          {item.employeesWithCreditableOT.map(
                            (employee: any) => (
                              <li key={employee.employeeId}>
                                {employee.employeeFullName}:{' '}
                                {employee.totalCreditableOvertime}hrs
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    );
                  })}
              </div>
            </TabPanel>
          )}
          {backendError.length > 0 && (
            <TabPanel
              header={
                <span
                  style={{
                    backgroundColor: activeTabIndex === 1 ? '#d61117' : '',
                    color: activeTabIndex === 1 ? 'white' : '',
                    padding: '10px 20px',
                    textAlign: 'center',
                  }}
                >
                  Error
                </span>
              }
            >
              <span className="text-red-600">
                Some attendances are not posted successfully:
              </span>
              <div className="my-5">
                {backendError.length > 0 &&
                  backendError.map((item: any, index: number) => (
                    <div className="my-5" key={index}>
                      {backendError.length > 0 &&
                        backendError.map((item: any, index: number) => (
                          <div className="my-4" key={index}>
                            <h4 className="font-bold">{item.headerTitle}</h4>
                            <>
                              {Array.isArray(item.error) ? (
                                <ul
                                  style={{
                                    listStyleType: 'disc',
                                    paddingLeft: '20px',
                                  }}
                                >
                                  {item.error.map(
                                    (message: any, msgIndex: number) => (
                                      <li key={msgIndex}>{message}</li>
                                    )
                                  )}
                                </ul>
                              ) : (
                                <p>{item.error}</p>
                              )}
                            </>
                            <br />
                          </div>
                        ))}
                    </div>
                  ))}
              </div>
            </TabPanel>
          )}
        </TabView>
      </Dialog>
    </div>
  );
};

export default Index;
