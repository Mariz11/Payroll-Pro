'use client';

import { employeeImportHeaders } from '@constant/csvData';
import { MCASH_MLWALLET } from '@constant/variables';
import { ButtonType } from '@enums/button';
import { useQueries } from '@tanstack/react-query';
import { getCKYCInfo } from '@utils/partnerApiServerUtils';
import axios from 'axios';
import classNames from 'classnames';
import DashboardNav from 'lib/components/blocks/dashboardNav';
import { VDivider } from 'lib/components/blocks/divider';
import ErrorDialog from 'lib/components/blocks/errorDialog';
import EmployeeSideBarForm from 'lib/components/dashboards/managements/employee/employeeSideBarForm';
import { GlobalContainer } from 'lib/context/globalContext';
import moment from '@constant/momentTZ';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputSwitch } from 'primereact/inputswitch';
import { Paginator } from 'primereact/paginator';
import { Skeleton } from 'primereact/skeleton';
import { Toast } from 'primereact/toast';
import { useContext, useEffect, useRef, useState } from 'react';
import { CSVLink } from 'react-csv';
import CSVUpload from './csvUpload';
import DeleteSidebar from './deleteSidebar';
import FailedRegistrationGrid from './failedRegistrationGrid';
import IdGenerationSidebar from './idGenerationSidebar';
import ReactivateEmployeeSideBar from './reactivateEmployeeSideBar';
import { MODES_OF_PAYROL } from '@constant/variables';
import { set } from 'lodash';
import DropDownFilter from 'lib/components/blocks/dropdownFilter';

const EmployeeManagement = () => {
  const context = useContext(GlobalContainer);
  const downloadCSVTemplateRef: any = useRef<any>(null);
  const [sideBarConfig, setSideBarConfig] = useState<SideBarConfig>({
    title: '',
    submitBtnText: '',
    action: '',
    rowData: {},
    isOpen: false,
  });
  const [deactReactivateSideBarConfig, setDeactReactivateSideBarConfig] =
    useState<SideBarConfig>({
      title: '',
      submitBtnText: '',
      action: '',
      rowData: {},
      isOpen: false,
    });
  const [selectedRows, setSelectedRows] = useState<any>([]);
  const [idGenerationSideBarConfig, setidGenerationSideBarConfig] =
    useState<SideBarConfig>({
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
    });
  const [valueSearchText, setValueSearchText] = useState('');
  const [isOpenGrid, setIsOpenGrid] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [downloadAttendance, setDownloadAttendance] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [importEmployees, setImportEmployees] = useState(false);
  const [searchFilter, setSearchFilter] = useState({
    department: '',
    modeOfPayroll: '',
  });
  const [filter, setFilter] = useState({
    departmentId: '',
    modeOfPayroll: ''
  });
  
  const [pagination, setPagination] = useState({
    offset: 0,
    limit: 5,
  });
  const [first, setFirst] = useState(0);

  const departmentDropdownRef = useRef<HTMLDivElement>(null);
  const payrollDropdownRef = useRef<HTMLDivElement>(null);
  const [departmentDropdownVisible, setDepartmentDropdownVisible] = useState(false);

  const [paginationFailedRegs, setPaginationFailedRegs] = useState({
    offset: 0,
    limit: 5,
  });
  const [firstFailedRegs, setFirstFailedRegs] = useState(0);
  const [companyDetails, setCompanyDetails] = useState<any>(null);
  const fetchEmployees = ({
    limit,
    offset,
  }: {
    limit: number;
    offset: number;
  }) =>
    fetch(
      `/api/employees?limit=${limit}&offset=${offset}&search=${valueSearchText}&departmentId=${filter.departmentId}&modeOfPayroll=${filter.modeOfPayroll}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
        },
      }
    )
      .then((res) => res.json())
      .catch((err) => console.error(err));

  const fetchFailedregistration = () =>
    fetch(`/api/employees/failed/registration`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
      },
    })
      .then((res) => res.json())
      .catch((err) => console.error(err));

  const fetchEmployeeInfo = (employeeId: number) =>
    fetch(`/api/employees/${employeeId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
      },
    })
      .then((res) => res.json())
      .catch((err) => console.error(err));

  const [
    shiftsQuery,
    departmentsQuery,
    employeesQuery,
    failedRegistirationQuery,
  ] = useQueries({
    queries: [
      {
        refetchOnWindowFocus: false,
        queryKey: ['shifts'],
        queryFn: async () =>
          await axios
            .get(`/api/shifts/shifts`, {
              headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
              },
            })
            .then((res) => res.data),
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
        queryKey: ['employees', pagination, valueSearchText, filter],
        queryFn: async () => fetchEmployees(pagination),
      },
      {
        refetchOnWindowFocus: false,
        queryKey: ['failedRegistrations'],
        queryFn: async () => fetchFailedregistration(),
      },
    ],
  });

  useEffect(() => {
    axios
      .get(
        `/api/companies/employees?companyId=${context?.userData.companyId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
          },
        }
      )
      .then((res) => {
        setCompanyDetails(res.data.companyData);
      });
  }, [context]);

  const [headerButtons, setHeaderButtons] = useState<any>([]);
  useEffect(() => {
    if (shiftsQuery.data || shiftsQuery.data?.message != undefined) {
    }
  }, [shiftsQuery.data]);

  useEffect(() => {
    // clear selectedrows state when changing pagination
    setSelectedRows([]);
  }, [pagination]);
  useEffect(() => {
    if (failedRegistirationQuery?.data?.length > 0) {
      setHeaderButtons([
        {
          label: 'Failed Registrations',
          type: ButtonType.Red,
          isDropdown: false,
          isIcon: false,
          handler: () => {
            setIsOpenGrid(true);
          },
        },
        {
          label: 'Add New',
          type: ButtonType.Red,
          isDropdown: false,
          isIcon: false,
          handler: () =>
            setSideBarConfig({
              title: 'Create Employee',
              submitBtnText: 'Create',
              action: 'add',
              isOpen: true,
            }),
        },
        {
          label: 'Download/Import',
          type: ButtonType.Black,
          isDropdown: true,
          dropDownButtons: [
            {
              label: 'Download',
              tooltip:
                'Edit and save the file in Excel to prevent import errors.\nFor employeee code with leading zeroes, please use this format: ="0XXXX" instead of 0XXX',
              dropDownHandler: () => {
                if (downloadCSVTemplateRef?.current) {
                  downloadCSVTemplateRef.current.link.click();
                }
              },
            },
            {
              label: 'Import',
              dropDownHandler: () => {
                setImportEmployees(true);
              },
            },
          ],
          isIcon: true,
          icon: 'pi pi-calendar',
        },
      ]);
    } else {
      setHeaderButtons([
        {
          label: 'Add New',
          type: ButtonType.Red,
          isDropdown: false,
          isIcon: false,
          handler: () =>
            setSideBarConfig({
              title: 'Create Employee',
              submitBtnText: 'Create',
              action: 'add',
              isOpen: true,
            }),
        },
        {
          label: 'Download/Import',
          type: ButtonType.Black,
          isDropdown: true,
          dropDownButtons: [
            {
              label: 'Download',
              tooltip:
                'Edit and save the file in Excel to prevent import errors.\nFor employeee code with leading zeroes, please use this format: ="0XXXX" instead of 0XXX',
              dropDownHandler: () => {
                if (downloadCSVTemplateRef?.current) {
                  downloadCSVTemplateRef.current.link.click();
                }
              },
            },
            {
              label: 'Import',
              dropDownHandler: () => setImportEmployees(true),
            },
            {
              label: 'History',
              dropDownHandler: () => window.open(`${window.location.href}/importHistory`, '_self'),
            }
          ],
          isIcon: true,
          icon: 'pi pi-calendar',
        },
      ]);
    }
  }, [
    failedRegistirationQuery.isLoading,
    failedRegistirationQuery?.data?.length,
  ]);

  const toast = useRef<Toast>(null);

  const [sendVerificationCode, setSendVerificationCode] = useState<any>({
    isShow: false,
    data: null,
  });

  return (
    <div className="w-screen h-screen overflow-auto p-5">
      <Toast ref={toast} position="bottom-left" />

      {/* DASHBOARD NAV */}
      <DashboardNav
        navTitle={'Company > Employees'}
        buttons={headerButtons}
        isShowSearch={true}
        valueSearchText={valueSearchText}
        setValueSearchText={setValueSearchText}
        searchPlaceholder=""
      />
      {/* MAIN CONTENT */}
      <div id="employees-list" className="line-container rounded-lg p-5">
        {
          <div className="flex gap-2 flex-row-reverse mb-2">
            <Button
              className="rounded-full"
              onClick={async () => {
                if (selectedRows.length == 0) {
                  return;
                }
                toast.current?.replace({
                  severity: 'info',
                  summary: 'Formatting IDs',
                  detail: 'Please wait...',
                  closable: false,
                  sticky: true,
                });
                for (let i = 0; i < selectedRows.length; i++) {
                  const ckycData: any = await getCKYCInfo({
                    ckycId: selectedRows[i].ckycId,
                  });
                  selectedRows[i].profPic =
                    ckycData?.responseData?.data?.pictures?.customerPhoto;
                }
                setidGenerationSideBarConfig((prev: any) => ({
                  title: 'Generate IDs',
                  submitBtnText: 'Generate',
                  action: 'add',
                  rowData: {},
                  isOpen: true,
                  bulk: true,
                }));
                toast.current?.clear();
              }}
              disabled={isGenerating || selectedRows.length == 0}
            >
              <p>{`Generate IDs`}</p>
            </Button>
          </div>
        }
        {employeesQuery.error ? (
          <ErrorDialog />
        ) : (
          <DataTable
            value={
              employeesQuery.isLoading || employeesQuery.isRefetching
                ? [
                  {
                    dummy: '',
                  },
                ]
                : employeesQuery.data.rows
            }
            selectionMode={'multiple'}
            selection={selectedRows}
            onSelectionChange={(e) =>
              // employeesQuery.isLoading
              //   ? null
              //   : setSideBarConfig({
              //       title: e.value.employee_profile?.employeeFullName,
              //       action: 'view',
              //       rowData: e.value,
              //       isOpen: true,
              //     })
              setSelectedRows(e.value)
            }
            frozenWidth="95rem"
            scrollable={true}
            tableStyle={{ minWidth: '95rem' }}
          >
            <Column
              selectionMode="multiple"
              headerStyle={{ width: '3rem' }}
            ></Column>
            <Column
              field="employeeStatus"
              header="Status"
              body={(row) => {
                if (employeesQuery.isLoading || employeesQuery.isRefetching)
                  return <Skeleton />;
                if (row.employeeStatus == 1) {
                  return (
                    <span className="py-2 px-5 rounded-full bg-green-200 text-green-700">
                      ACTIVATED
                    </span>
                  );
                } else if (row.employeeStatus == 0) {
                  return (
                    <span className="py-2 px-5 rounded-full bg-orange-200 text-orange-500">
                      PENDING
                    </span>
                  );
                } else if (row.employeeStatus == 2) {
                  return (
                    <span className="py-2 px-5 rounded-full bg-red-200 text-red-700">
                      INACTIVE
                    </span>
                  );
                } else if (row.employeeStatus == 3) {
                  return (
                    <span className="py-2 px-5 rounded-full bg-red-200 text-red-700">
                      FAILED
                    </span>
                  );
                }
              }}
            />
            <Column
              field="employeeCode"
              header="ID"
              body={(row) => {
                if (employeesQuery.isLoading || employeesQuery.isRefetching)
                  return <Skeleton />;
                return row.employeeCode;
              }}
            />
            <Column
              field="fullname"
              header="Full Name"
              body={(row) => {
                if (employeesQuery.isLoading || employeesQuery.isRefetching)
                  return <Skeleton />;
                return row?.employeeFullName;
              }}
            />
            <Column
              field="department"
              header={() => {
                const dropdownOptions = [
                  { label: 'All', value: '' },
                  ...(departmentsQuery.data?.message || []).map((department: any) => ({
                    label: department.departmentName,
                    value: department.departmentId
                  })),
                ];

                return (
                  <DropDownFilter
                    label="Department"
                    options={dropdownOptions}
                    searchValue={searchFilter.department} 
                    onSearchChange={(value) =>
                      setSearchFilter((prev) => ({ ...prev, department: value })) 
                    }
                    onSelect={(value) => {
                      setFilter((prev) => ({ ...prev, departmentId: value }));
                      employeesQuery.refetch({
                        queryKey: ['employees', pagination, valueSearchText, filter],
                      });
                    }}
                  />
                );
              }}
              body={(row) => {
                if (employeesQuery.isLoading || employeesQuery.isRefetching)
                  return <Skeleton />;

                if (departmentsQuery.isLoading || departmentsQuery.isRefetching)
                  return <Skeleton />;

                const department = departmentsQuery.data.message.find(
                  (department: any) => department.departmentId == row.departmentId
                );

                return department?.departmentName || row.departmentId;
              }}
            />
            <Column
              field="positionTitle"
              header="Position"
              body={(row) => {
                if (employeesQuery.isLoading || employeesQuery.isRefetching)
                  return <Skeleton />;
                return row.positionTitle;
              }}
            />
            {/* <Column
              field="role"
              header="Role"
              body={(row) => {
                if (employeesQuery.isLoading || employeesQuery.isRefetching) return <Skeleton />;
                return row.user.role;
              }}
            /> */}
            <Column
              field="modeOfSeparation"
              header="Mode of Separation"
              body={(row) => {
                if (employeesQuery.isLoading || employeesQuery.isRefetching)
                  return <Skeleton />;
                return row.modeOfSeparation || '';
              }}
            />
            <Column
              field="modeOfPayroll"
              header={() => {
                const dropdownOptions = [
                  { label: 'All', value: '' },
                  ...MODES_OF_PAYROL.map((mode) => ({
                    label: mode,
                    value: mode,
                  })),
                ];

                return (
                  <DropDownFilter
                    label="Mode of Payroll"
                    options={dropdownOptions}
                    searchValue={searchFilter.modeOfPayroll} 
                    onSearchChange={(value) =>
                      setSearchFilter((prev) => ({ ...prev, modeOfPayroll: value })) 
                    }
                    onSelect={(value) => {
                      setFilter((prev) => ({ ...prev, modeOfPayroll: value }));
                      employeesQuery.refetch({
                        queryKey: ['employees', pagination, valueSearchText, filter],
                      });
                    }}
                  />
                );
              }}
              body={(row) => {
                if (employeesQuery.isLoading || employeesQuery.isRefetching) return <Skeleton />;
                return row.modeOfPayroll || '';
              }}
            />
            <Column field="actions" header="Actions" body={actionTemplate} />
          </DataTable>
        )}
        <Button
          className="w-full hover:!bg-[#dfffdf]"
          text
          onClick={() => {
            employeesQuery.refetch();
            failedRegistirationQuery.refetch();
          }}
          style={{
            display: 'block',
            background: '#edffed',
            color: '#4CAF50',
            textAlign: 'center',
          }}
          disabled={employeesQuery.isLoading || employeesQuery.isRefetching}
        >
          <i
            className={classNames('pi pi-sync text-[12px]', {
              'pi pi-spin pi-spinner':
                employeesQuery.isLoading || employeesQuery.isRefetching,
            })}
          ></i>{' '}
          {employeesQuery.isLoading || employeesQuery.isRefetching
            ? 'Refreshing...'
            : 'Refresh'}
        </Button>

        <Paginator
          first={first}
          rows={pagination.limit}
          totalRecords={employeesQuery.data && employeesQuery.data.count}
          rowsPerPageOptions={[5, 15, 25, 50, 100]}
          onPageChange={(event) => {
            const { page, rows, first }: any = event;
            setFirst(first);
            setPagination({
              offset: rows * page,
              limit: rows,
            });
          }}
        />
      </div>
      {/* SIDEBAR */}
      <EmployeeSideBarForm
        configuration={sideBarConfig}
        setSideBarConfig={setSideBarConfig}
        shiftsQuery={shiftsQuery}
        refetchDataFromParent={employeesQuery.refetch}
        setSelectedRows={setSelectedRows}
      />
      {!failedRegistirationQuery.isLoading &&
        failedRegistirationQuery?.data?.length > 0 && (
          <FailedRegistrationGrid
            action={'edit'}
            isOpenGrid={isOpenGrid}
            setIsOpenGrid={setIsOpenGrid}
            gridData={failedRegistirationQuery.data}
            refetchEmployees={employeesQuery.refetch}
            refetchFailedRegistrations={failedRegistirationQuery.refetch}
          />
        )}
      <ReactivateEmployeeSideBar
        configuration={deactReactivateSideBarConfig}
        setSideBarConfig={setDeactReactivateSideBarConfig}
        refetch={employeesQuery.refetch}
      />
      {/* DELETE SIDEBAR */}
      <DeleteSidebar
        deleteSidebarConfig={deleteSidebarConfig}
        setDeleteSidebarConfig={setDeleteSidebarConfig}
        refetch={employeesQuery.refetch}
      />
      {/* ID GENERATION SIDEBAR */}
      <IdGenerationSidebar
        configuration={idGenerationSideBarConfig}
        setSideBarConfig={setidGenerationSideBarConfig}
        companyDetails={companyDetails}
        setCompanyDetails={setCompanyDetails}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        isGenerating={isGenerating}
        setIsGenerating={setIsGenerating}
      />
      <Dialog
        header="Resend Verification Code"
        visible={sendVerificationCode.isShow}
        style={{ width: '50vw' }}
        onHide={() =>
          setSendVerificationCode((prev: any) => ({
            ...prev,
            isShow: false,
          }))
        }
        footer={
          <div>
            <Button
              label="No"
              icon="pi pi-times"
              onClick={() =>
                setSendVerificationCode((prev: any) => ({
                  ...prev,
                  isShow: false,
                }))
              }
              className="p-button-text"
            />
            <Button
              label="Yes"
              icon="pi pi-check"
              onClick={async () => {
                setSendVerificationCode((prev: any) => ({
                  ...prev,
                  isShow: false,
                }));
                toast.current?.replace({
                  severity: 'info',
                  summary: 'Submitting request',
                  detail: 'Please wait...',
                  closable: false,
                  sticky: true,
                });

                const rowData = sendVerificationCode.data;

                try {
                  const response: any = await axios.patch(
                    '/api/employees/activate',
                    {
                      ckycId: rowData.ckycId,
                      employeeId: rowData.employeeId,
                      tierLabel: rowData.tierLabel,
                      contactNumber: rowData.employee_profile.contactNumber,
                      emailAddress: rowData.employee_profile.emailAddress,
                      employeeCode: rowData.employeeCode,
                      modeOfPayroll: rowData.modeOfPayroll,
                      firstName: rowData.employee_profile.firstName,
                      lastName: rowData.employee_profile.lastName,
                      middleName: rowData.employee_profile.middleName,
                      suffix: rowData.employee_profile.suffix,
                      countryId: rowData.employee_profile.countryId,
                      provinceId: rowData.employee_profile.provinceId,
                      cityId: rowData.employee_profile.cityId,
                      streetAddress: rowData.employee_profile.streetAddress,
                      zipCode: rowData.employee_profile.zipCode,
                      birthDate: rowData.employee_profile.birthDate,
                      placeOfBirth: rowData.employee_profile.placeOfBirth,
                      nationality: rowData.employee_profile.nationality,
                      gender: rowData.employee_profile.gender,
                      civilStatus: rowData.employee_profile.civilStatus,
                    },
                    {
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
                      },
                    }
                  );

                  toast.current?.replace({
                    severity: 'success',
                    summary: response.data.message,
                    life: 5000,
                  });
                } catch (error: any) {
                  const response = error?.response?.data;

                  toast.current?.replace({
                    severity: 'error',
                    summary: response.message,
                    sticky: true,
                    closable: true,
                  });
                }
              }}
              autoFocus
            />
          </div>
        }
      >
        <p className="my-5">Resend verification code now?</p>
      </Dialog>

      <CSVLink
        separator=","
        className="hidden"
        ref={downloadCSVTemplateRef}
        filename={`Employee Import Template-${new Date().getTime()}.csv`}
        headers={employeeImportHeaders}
        data={[
          {
            employeeCode: '=""ID-EXAMPLE-01""',
            roleId: 'EMPLOYEE',
            lastName: 'Example Last Name',
            firstName: 'Example First Name',
            middleName: '',
            suffix: '',
            hiringDate: moment().format('MM/DD/YYYY'),
            startDate: moment().format('MM/DD/YYYY'),
            contactNumber: '09xxxxxxxxxxx',
            emergencyContactNumber1: '09xxxxxxxxxxx',
            emergencyContactNumber2: '09xxxxxxxxxxx',
            emailAddress: 'example@gmail.com',
            streetAddress: 'Example Street Address',
            cityId: 'Cebu',
            provinceId: 'Cebu',
            countryId: 'Philippines',
            placeOfBirth: 'Cebu City',
            birthDate: moment().format('MM/DD/YYYY'),
            gender: 'Male',
            civilStatus: 'Single',
            nationality: 'Filipino',
            educationalAttainment: 'College Graduate',
            schoolGraduated: 'Example School',
            degree: 'BSIT',
            positionTitle: 'Software Engineer',
            dayOff: 'Saturday, Sunday',
            employmentStatus: 'Regular',
            modeOfPayroll: 'KWARTA PADALA',
            basicPay: '15000',
            // dailyRate: '743.80',
            // overtimeRateRegDays: '743.80',
            // overtimeRateHolidays: '743.80',
            // overtimeRateRestDays: '743.80',
            tinNumber: '',
            allowance: '100',
            vacationLeaveCredits: '5',
            sickLeaveCredits: '5',
            serviceIncentiveLeaveCredits: '5',
            soloParentLeaveCredits: '5',
            paternityLeaveCredits: '5',
            maternityLeaveCredits: '5',
            otherLeaveCredits: '5',
            sssId: '',
            sssContributionRate: '',
            sssERShareRate: '',
            sssECShareRate: '',
            philHealthId: '',
            philHealthContributionRate: '',
            philHealthERShareRate: '',
            pagIbigId: '',
            pagIbigContributionRate: '',
            pagIbigERShareRate: '',
          },
        ]}
      />
      <CSVUpload
        configuration={{
          headers: employeeImportHeaders,
          startIndex: 1,
          apiUrl: '/api/employees/bulkimport',
          isOpen: importEmployees,
          setIsOpen: setImportEmployees,
          shiftsQuery: shiftsQuery,
          departmentsQuery: departmentsQuery,
        }}
        label={{
          mainHeader: 'Import Employees',
        }}
        refetchEmployees={employeesQuery.refetch}
        refetchFailedRegistrations={failedRegistirationQuery.refetch}
      />
    </div>
  );

  function actionTemplate(rowData: any) {
    if (employeesQuery.isLoading || employeesQuery.isRefetching)
      return <Skeleton />;
    return (
      <div className="flex flex-nowrap gap-2">
        <Button
          id="view-employee-button"
          type="button"
          text
          severity="secondary"
          icon="pi pi-eye"
          tooltip="View"
          disabled={employeesQuery.isLoading || employeesQuery.isRefetching}
          tooltipOptions={{ position: 'top' }}
          onClick={async (e) => {
            e.stopPropagation();

            const { details } = await fetchEmployeeInfo(rowData.employeeId);
            const ckycData: any = await getCKYCInfo({
              ckycId: details.ckycId,
            });

            employeesQuery.isLoading
              ? null
              : setSideBarConfig({
                title: details.employee_profile?.employeeFullName,
                action: 'view',
                rowData: {
                  ...details,
                  profPic:
                    ckycData?.responseData?.data?.pictures?.customerPhoto,
                },
                isOpen: true,
              });
          }}
        ></Button>
        <VDivider />
        <Button
          type="button"
          text
          severity="secondary"
          icon="pi pi-file-edit"
          tooltip="Edit"
          disabled={employeesQuery.isLoading || employeesQuery.isRefetching}
          tooltipOptions={{ position: 'top' }}
          onClick={async (e) => {
            const { details } = await fetchEmployeeInfo(rowData.employeeId);
            const ckycData: any = await getCKYCInfo({
              ckycId: details.ckycId,
            });
            e.stopPropagation();
            setSideBarConfig({
              title: details.employee_profile?.employeeFullName,
              submitBtnText: 'Update',
              action: 'edit',
              rowData: {
                ...details,
                profPic: ckycData?.responseData?.data?.pictures?.customerPhoto,
              },
              isOpen: true,
            });
          }}
        />
        <VDivider />
        {rowData.employeeStatus == 0 &&
          rowData.mlWalletStatus == 0 &&
          MCASH_MLWALLET.includes(rowData.modeOfPayroll) && (
            <>
              <Button
                type="button"
                text
                severity="secondary"
                icon="pi pi-send"
                tooltip="Resend Verification Code"
                tooltipOptions={{ position: 'top' }}
                onClick={async (e) => {
                  e.stopPropagation();

                  const { details } = await fetchEmployeeInfo(rowData.employeeId);
                  setSendVerificationCode({
                    isShow: true,
                    data: details,
                  });
                }}
              />
              <VDivider />
            </>
          )}
        <Button
          type="button"
          text
          icon="pi pi-id-card"
          tooltip="Generate ID"
          tooltipOptions={{ position: 'top' }}
          onClick={async () => {
            const { details } = await fetchEmployeeInfo(rowData.employeeId);
            const ckycData: any = await getCKYCInfo({
              ckycId: details.ckycId,
            });
            setidGenerationSideBarConfig((prev: any) => ({
              title: details.employee_profile?.employeeFullName,
              submitBtnText: 'Download',
              action: 'edit',
              rowData: {
                ...details,
                profPic: ckycData?.responseData?.data?.pictures?.customerPhoto,
              },
              isOpen: true,
              bulk: false,
            }));
          }}
        />
        <VDivider />
        <Button
          type="button"
          text
          icon="pi pi-trash"
          tooltip="Delete"
          tooltipOptions={{ position: 'top' }}
          onClick={async () => {
            const { details } = await fetchEmployeeInfo(rowData.employeeId);

            setDeleteSidebarConfig({
              header: `Delete ${details.employee_profile?.employeeFullName}`,
              subHeader:
                'Removing this employee cannot be undone. Are you sure you want to continue?',
              submitText: 'Delete',
              cancelText: 'Cancel',
              rowData: details,
              isOpen: true,
            })
          }}
        />
        {rowData.employeeStatus != 0 && rowData.employeeStatus != 3 && (
          <>
            <VDivider />
            <InputSwitch
              checked={rowData.employeeStatus == 1}
              size={10}
              className="mt-2"
              tooltip={rowData.employeeStatus == 1 ? 'Deactivate' : 'Activate'}
              tooltipOptions={{ position: 'top' }}
              onChange={async (e) => {
                e.stopPropagation();

                const { details } = await fetchEmployeeInfo(rowData.employeeId);

                setDeactReactivateSideBarConfig({
                  title:
                    details.employeeStatus == 1
                      ? 'Employee Deactivation'
                      : 'Employee Reactivation',
                  subTitle:
                    details.employeeStatus == 1
                      ? 'Deactivating this employee will also restrict them from logging in to their payroll account. If you wish to continue, please fill the reason below:'
                      : 'Are you sure you want to reactivate this employee?',
                  rowData: details,
                  submitBtnText: details.employeeStatus == 1 ? 'Deactivate' : 'Reactivate',
                  action: details.employeeStatus == 1 ? 'deactivate' : 'reactivate',
                  isOpen: true,
                });
              }}
            />
          </>
        )}
      </div>
    );
  }
};

export default EmployeeManagement;
