'use client';

import { MCASH_MLWALLET } from '@constant/variables';
import { useQueries, useQuery } from '@tanstack/react-query';
import {
  checkDuplicateContactNumEmployee,
  checkDuplicateEmailEmployee,
  checkDuplicateEmployeeCode,
} from '@utils/checkDuplicates';
import { hasHtmlTags, hasSQLKeywords, properCasing } from '@utils/helper';
import { fileUploadToCKYC } from '@utils/imageUpload';
import axios from 'axios';
import classNames from 'classnames';
import { VDivider } from 'lib/components/blocks/divider';
import { GlobalContainer } from 'lib/context/globalContext';
import moment from '@constant/momentTZ';
import Image from 'next/image';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Checkbox } from 'primereact/checkbox';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputSwitch } from 'primereact/inputswitch';
import { InputText } from 'primereact/inputtext';
import { MultiSelect } from 'primereact/multiselect';
import { Sidebar } from 'primereact/sidebar';
import { Skeleton } from 'primereact/skeleton';
import { TabPanel, TabView } from 'primereact/tabview';
import { Toast } from 'primereact/toast';
import { Tooltip } from 'primereact/tooltip';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import AllowanceBreakdownSidebar from './allowanceBreakdownSidebar';
import AllowanceRowDeleteSidebar from './allowanceRowDeleteSidebar';
import ReferenceFileUpload from './referenceFileUpload';

const emailRe = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const nameRE = /^[A-Za-zñÑ0-9 '-]+$/;
//calculate max dates
let today = new Date();
let yearMinus18 = today.getFullYear() - 18;
let todayMinus18years = new Date();
todayMinus18years.setFullYear(yearMinus18);
const InitialFormState = {
  employeeId: null,
  role: null,
  employeeCode: '',
  mlWalletStatus: null,
  employeeStatus: null,
  companyId: null,
  tierLabel: '',
  ckycId: null,
  mlWalletId: null,
  departmentId: null,
  shiftId: null,
  hiringDate: new Date(),
  startDate: new Date(),
  employmentStatus: '',
  referenceFiles: null,
  dayOff: '',
  basicPay: 0,
  dailyRate: 0,
  monthlyAllowance: 0,
  allowance: 0,
  tinNumber: null,
  overtimeRateRegDays: 0,
  overtimeRateHolidays: 0,
  overtimeRateRestDays: 0,
  positionTitle: '',
  dateOfSeparation: '',
  modeOfSeparation: '',
  modeOfPayroll: '',
  applyWithholdingTax: true,
  sssId: null,
  sssContributionRate: 0,
  sssERShareRate: 0,
  sssECShareRate: 0,
  philHealthId: null,
  philHealthContributionRate: 0,
  philHealthERShareRate: 0,
  pagIbigId: null,
  pagIbigContributionRate: 0,
  pagIbigERShareRate: 0,
  vacationLeaveCredits: 0,
  vacationLeaveUsed: 0,
  sickLeaveCredits: 0,
  sickLeaveUsed: 0,
  soloParentLeaveCredits: 0,
  soloParentLeavesUsed: 0,
  paternityLeaveCredits: 0,
  paternityLeavesUsed: 0,
  maternityLeaveCredits: 0,
  maternityLeavesUsed: 0,
  serviceIncentiveLeaveCredits: 0,
  serviceIncentiveLeaveUsed: 0,
  otherLeaveCredits: 0,
  otherLeavesUsed: 0,
  emergencyLeaveCredits: 0,
  emergencyLeavesUsed: 0,
  birthdayLeaveCredits: 0,
  birthdayLeavesUsed: 0,
  firstName: '',
  middleName: '',
  lastName: '',
  suffix: '',
  contactNumber: '',
  profilePicture: null,
  emergencyContactNumber1: null,
  emergencyContactNumber2: null,
  birthDate: '',
  emailAddress: '',
  streetAddress: '',
  zipCode: null,
  cityId: null,
  provinceId: null,
  countryId: null,
  educationalAttainment: '',
  schoolGraduated: '',
  degree: '',
  gender: '',
  placeOfBirth: '',
  nationality: '',
  civilStatus: '',
  address: '',
  allowanceBreakdown: false,
  allowanceType: '',
  monthlyAmounts: '',
  dailyAmounts: '',
  isMonthlyRated: false,
};

const EmployeeSideBarForm = ({
  configuration: { title, submitBtnText, action, rowData, isOpen },
  setSideBarConfig,
  refetchDataFromParent,
  shiftsQuery,
  setSelectedRows,
}: {
  configuration: SideBarConfig;
  setSideBarConfig: any;
  refetchDataFromParent: () => void;
  shiftsQuery: any;
  setSelectedRows: any;
}) => {
  const {
    control,
    formState: { errors, isDirty, isValid, isSubmitting },
    handleSubmit,
    reset,
    setValue,
    register,
    setError,
    getValues,
    clearErrors,
    watch,
  } = useForm({
    mode: 'onSubmit',
    defaultValues: { ...InitialFormState },
  });

  const toast = useRef<Toast>(null);
  const [changeContactDialogVisible, setChangeContactDialogVisible] =
    useState(false);
  const [referenceFiles, setReferenceFiles] = useState<any>([]);
  const [lazyRefresher, setLazyRefresher] = useState(false);
  const [editMobileNumber, setEditMobileNumber] = useState(false);
  const [editDailyRate, setEditDailyRate] = useState(true);
  const [editDailyAllowanceRate, setEditDailyAllowanceRate] = useState(true);
  const [sssEditable, setSSSEditable] = useState(false);
  const [philHealthEditable, setPhilHealthEditable] = useState(false);
  const [pagIbigEditable, setPagIbigEditable] = useState(false);
  const [disabledGovtFields, setDisabledGovtFields] = useState({
    sssContributionRate: true,
    sssERShareRate: true,
    sssECShareRate: true,
    philHealthContributionRate: true,
    philHealthERShareRate: true,
    pagIbigContributionRate: true,
    pagIbigERShareRate: true,
  });

  const [editOTRate, setEditOTRate] = useState({
    regDays: false,
    holidays: false,
    restDays: false,
  });

  const [resettableGovtBenefitFields, setResettableGovtBenefitFields] =
    useState({
      sssContributionRate: false,
      sssERShareRate: false,
      sssECShareRate: false,
      philHealthContributionRate: false,
      philHealthERShareRate: false,
      pagIbigContributionRate: false,
      pagIbigERShareRate: false,
    });

  const [profilePicFile, setProfilePicFile] = useState<File>();
  const [profilePicURL, setProfilePicURL] = useState<any>(
    '/images/noimage.jpg'
  );

  const [allowanceBreakdown, setAllowanceBreakdown] = useState<boolean>(false);
  const [allowanceBreakdownItems, setAllowanceBreakdownItems] = useState<any[]>(
    []
  );
  const [newAllowanceBreakdownType, setNewAllowanceBreakdownType] =
    useState<string>('');
  const [
    newAllowanceBreakdownMonthlyRate,
    setNewAllowanceBreakdownMonthlyRate,
  ] = useState<number>(0);
  const [selectedAllowanceRow, setSelectedAllowanceRow] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDeleteSidebarOpen, setIsDeleteSidebarOpen] = useState(false);
  const [allowanceSidebarAction, setAllowanceSidebarAction] =
    useState<string>('view');
  const [isTypeValidated, setIsTypeValidated] = useState<boolean>(false);
  const [isRateValidated, setIsRateValidated] = useState<boolean>(false);
  // Query
  const [departmentsQuery, addressQuery] = useQueries({
    queries: [
      {
        refetchOnWindowFocus: false,
        queryKey: ['departments'],
        queryFn: async () =>
          await axios
            .get(`/api/departments/departments`, {
              headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
              },
            })
            .then((res) => res.data),
      },
      // {
      //   refetchOnWindowFocus: false,
      //   queryKey: ['shifts'],
      //   queryFn: async () =>
      //     await axios
      //       .get(`/api/shifts/shifts`, {
      //         headers: {
      //           Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
      //         },
      //       })
      //       .then((res) => res.data),
      // },
      {
        refetchOnWindowFocus: false,
        queryKey: ['address'],
        queryFn: async () =>
          await axios
            .get(`/api/address`, {
              headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
              },
            })
            .then((res) => res.data),
      },
    ],
  });

  const [nationalities, setNationalities] = useState<any[]>([]);
  
  useEffect(() => {
    if (action != 'view') {
      const getNationality = async () => {
        let nationality: any[] = [];

        const response = await fetch(`/api/nationality`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
          },
        });

        if (response.status == 200) {
          const res = await response.json();
          nationality = res.data.map((item: string) => ({
            name: item,
            value: item,
          }));
        }

        setNationalities(nationality);
      };

      getNationality();
    }
  }, [action]);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setEditOTRate({
      regDays: false,
      holidays: false,
      restDays: false,
    });
    setEditMobileNumber(false);
    setEditDailyRate(true);
    setEditDailyAllowanceRate(true);
    reset();
    setActiveIndex(0);
    setSSSEditable(false);
    setPhilHealthEditable(false);
    setPagIbigEditable(false);
    setDisabledGovtFields({
      sssContributionRate: true,
      sssERShareRate: true,
      sssECShareRate: true,
      philHealthContributionRate: true,
      philHealthERShareRate: true,
      pagIbigContributionRate: true,
      pagIbigERShareRate: true,
    });

    setResettableGovtBenefitFields({
      sssContributionRate: false,
      sssERShareRate: false,
      sssECShareRate: false,
      philHealthContributionRate: false,
      philHealthERShareRate: false,
      pagIbigContributionRate: false,
      pagIbigERShareRate: false,
    });

    if (action == 'edit' || action == 'view') {
      // General Information
      setValue('employeeId', rowData.employeeId);
      setValue('role', rowData.user ? rowData.user.roleId : undefined);
      setValue('employeeCode', rowData.employeeCode);
      setValue('mlWalletStatus', rowData.mlWalletStatus);
      setValue('employeeStatus', rowData.employeeStatus);
      setValue('companyId', rowData.companyId);
      setValue('tierLabel', rowData.tierLabel);
      setValue('ckycId', rowData.ckycId);
      setValue('mlWalletId', rowData.mlWalletId);
      setValue('departmentId', rowData.department?.departmentId);
      setValue('shiftId', rowData.shift?.shiftId);
      setValue('hiringDate', new Date(rowData.hiringDate) as any);
      setValue('startDate', new Date(rowData.startDate) as any);
      setValue('employmentStatus', rowData.employmentStatus);
      setReferenceFiles(
        rowData.referenceFiles ? JSON.parse(rowData.referenceFiles) : []
      );
      if (!rowData.dayOff || rowData.dayOff === '') {
        setValue(
          'dayOff',
          // rowData.dayOff.split(',').map((i: any) => {
          //   return {
          //     code: properCasing(i),
          //     name: properCasing(i),
          //   };
          // })
          ''
        );
      } else {
        setValue(
          'dayOff',
          rowData.dayOff.split(',').map((i: any) => {
            return {
              code: properCasing(i),
              name: properCasing(i),
            };
          })
        );
      }
      setValue('basicPay', rowData.basicPay);
      setValue('monthlyAllowance', rowData.monthlyAllowance);
      setValue('dailyRate', rowData.dailyRate);
      setValue('allowance', rowData.allowance);
      setValue('tinNumber', rowData.tinNumber);
      setValue('overtimeRateRegDays', rowData.overtimeRateRegDays);
      setValue('overtimeRateHolidays', rowData.overtimeRateHolidays);
      setValue('overtimeRateRestDays', rowData.overtimeRateRestDays);
      setValue('positionTitle', rowData.positionTitle);
      setValue('dateOfSeparation', rowData.dateOfSeparation);
      setValue('modeOfSeparation', rowData.modeOfSeparation);
      setValue('modeOfPayroll', rowData.modeOfPayroll);
      setValue('applyWithholdingTax', rowData.applyWithholdingTax);
      setValue('isMonthlyRated', rowData.isMonthlyRated);
      // Government Benefits
      setValue('sssId', rowData?.employee_benefit?.sssId);
      setValue(
        'sssContributionRate',
        rowData?.employee_benefit?.sssContributionRate
      );
      setValue('sssERShareRate', rowData?.employee_benefit?.sssERShareRate);
      setValue('sssECShareRate', rowData?.employee_benefit?.sssECShareRate);
      setValue('philHealthId', rowData?.employee_benefit?.philHealthId);
      setValue(
        'philHealthContributionRate',
        rowData?.employee_benefit?.philHealthContributionRate
      );
      setValue(
        'philHealthERShareRate',
        rowData?.employee_benefit?.philHealthERShareRate
      );
      setValue('pagIbigId', rowData?.employee_benefit?.pagIbigId);
      setValue(
        'pagIbigContributionRate',
        rowData?.employee_benefit?.pagIbigContributionRate
      );
      setValue(
        'pagIbigERShareRate',
        rowData?.employee_benefit?.pagIbigERShareRate
      );

      const monthly = rowData.basicPay;
      setDisabledGovtFields({
        sssContributionRate: true,
        sssERShareRate: true,
        sssECShareRate: true,
        philHealthContributionRate: true,
        philHealthERShareRate: true,
        pagIbigContributionRate: true,
        pagIbigERShareRate: true,
      });

      const sssID = rowData?.employee_benefit?.sssId;
      const sssContributionRate =
        rowData?.employee_benefit?.sssContributionRate;
      const sssERShareRate = rowData?.employee_benefit?.sssERShareRate;
      const sssECShareRate = rowData?.employee_benefit?.sssECShareRate;

      const philHealthId = rowData?.employee_benefit?.philHealthId;
      const philHealthContributionRate =
        rowData?.employee_benefit?.philHealthContributionRate;
      const philHealthERShareRate =
        rowData?.employee_benefit?.philHealthERShareRate;

      const pagIbigId = rowData?.employee_benefit?.pagIbigId;
      const pagIbigERShareRate = rowData?.employee_benefit?.pagIbigERShareRate;
      const pagIbigContributionRate =
        rowData?.employee_benefit?.pagIbigContributionRate;

      // SSS
      if (sssID) {
        const fixedSSSContributionRate =
          0.045 * monthly > 900 ? 900 : 0.045 * monthly;
        setResettableGovtBenefitFields((prev) => ({
          ...prev,
          sssContributionRate:
            fixedSSSContributionRate == sssContributionRate ? false : true,
        }));

        const fixedSSSERShareRate =
          0.095 * monthly > 1900 ? 1900 : 0.095 * monthly;
        setResettableGovtBenefitFields((prev) => ({
          ...prev,
          sssERShareRate: fixedSSSERShareRate == sssERShareRate ? false : true,
        }));

        const fixedSSSECShareRate =
          0.045 * monthly > 900 ? 900 : 0.045 * monthly;
        setResettableGovtBenefitFields((prev) => ({
          ...prev,
          sssECShareRate: fixedSSSECShareRate == sssECShareRate ? false : true,
        }));

        setSSSEditable(true);
      } else {
        setValue('sssContributionRate', 0);
        setValue('sssERShareRate', 0);
        setValue('sssECShareRate', 0);
        setSSSEditable(false);
      }

      // PHIL HEALTH
      if (philHealthId) {
        const fixedPhilHealthContributionRate = 0.02 * monthly;
        setResettableGovtBenefitFields((prev) => ({
          ...prev,
          philHealthContributionRate:
            fixedPhilHealthContributionRate == philHealthContributionRate
              ? false
              : true,
        }));

        const fixedPhilHealthERShareRate = 0.02 * monthly;
        setResettableGovtBenefitFields((prev) => ({
          ...prev,
          philHealthERShareRate:
            fixedPhilHealthERShareRate == philHealthERShareRate ? false : true,
        }));

        setPhilHealthEditable(true);
      } else {
        setValue('philHealthContributionRate', 0);
        setValue('philHealthERShareRate', 0);
        setPhilHealthEditable(false);
      }

      // PAG IBIG
      if (pagIbigId) {
        const fixedPagIbigERShareRate = 0.02 * monthly;
        setResettableGovtBenefitFields((prev) => ({
          ...prev,
          pagIbigERShareRate:
            fixedPagIbigERShareRate == pagIbigERShareRate ? false : true,
        }));

        const fixedPagIbigContributionRate =
          monthly <= 1500 ? 0.01 * monthly : 0.02 * monthly;
        setResettableGovtBenefitFields((prev) => ({
          ...prev,
          pagIbigContributionRate:
            fixedPagIbigContributionRate == pagIbigContributionRate
              ? false
              : true,
        }));

        setPagIbigEditable(true);
      } else {
        setValue('pagIbigERShareRate', 0);
        setValue('pagIbigContributionRate', 0);
        setPagIbigEditable(false);
      }

      // Employee Leaves
      setValue(
        'vacationLeaveCredits',
        rowData.employee_leave.vacationLeaveCredits
      );
      setValue('vacationLeaveUsed', rowData.employee_leave.vacationLeaveUsed);
      setValue('sickLeaveCredits', rowData.employee_leave.sickLeaveCredits);
      setValue('sickLeaveUsed', rowData.employee_leave.sickLeaveUsed);
      setValue(
        'soloParentLeaveCredits',
        rowData.employee_leave.soloParentLeaveCredits
      );
      setValue(
        'soloParentLeavesUsed',
        rowData.employee_leave.soloParentLeavesUsed
      );
      setValue(
        'paternityLeaveCredits',
        rowData.employee_leave.paternityLeaveCredits
      );
      setValue(
        'paternityLeavesUsed',
        rowData.employee_leave.paternityLeavesUsed
      );
      setValue(
        'maternityLeaveCredits',
        rowData.employee_leave.maternityLeaveCredits
      );
      setValue(
        'maternityLeavesUsed',
        rowData.employee_leave.maternityLeavesUsed
      );
      setValue(
        'serviceIncentiveLeaveCredits',
        rowData.employee_leave.serviceIncentiveLeaveCredits
      );
      setValue(
        'serviceIncentiveLeaveUsed',
        rowData.employee_leave.serviceIncentiveLeaveUsed
      );
      setValue('otherLeaveCredits', rowData.employee_leave.otherLeaveCredits);
      setValue('otherLeavesUsed', rowData.employee_leave.otherLeavesUsed);
      setValue(
        'emergencyLeaveCredits',
        rowData.employee_leave.emergencyLeaveCredits
      );
      setValue(
        'emergencyLeavesUsed',
        rowData.employee_leave.emergencyLeavesUsed
      );
      setValue(
        'birthdayLeaveCredits',
        rowData.employee_leave.birthdayLeaveCredits
      );
      setValue('birthdayLeavesUsed', rowData.employee_leave.birthdayLeavesUsed);

      // Personal Information
      setValue('firstName', rowData.employee_profile.firstName);
      setValue('middleName', rowData.employee_profile.middleName);
      setValue('lastName', rowData.employee_profile.lastName);
      setValue('suffix', rowData.employee_profile.suffix);
      setProfilePicURL(
        // rowData.employee_profile.profilePicture ?? '/images/noimage.jpg'
        rowData.profPic ?? '/images/noimage.jpg'
      );
      setValue('contactNumber', rowData.employee_profile.contactNumber);
      setValue(
        'emergencyContactNumber1',
        rowData.employee_profile.emergencyContactNumber1
      );
      setValue(
        'emergencyContactNumber2',
        rowData.employee_profile.emergencyContactNumber2
      );
      setValue(
        'birthDate',
        new Date(rowData.employee_profile.birthDate) as any
      );
      setValue('emailAddress', rowData.employee_profile.emailAddress);
      setValue('streetAddress', rowData.employee_profile.streetAddress);
      setValue('zipCode', rowData.employee_profile.zipCode);
      setValue('cityId', rowData.employee_profile.cityId);
      setValue('provinceId', rowData.employee_profile.provinceId);
      setValue('countryId', rowData.employee_profile.countryId);
      setValue(
        'educationalAttainment',
        rowData.employee_profile.educationalAttainment
      );
      setValue('schoolGraduated', rowData.employee_profile.schoolGraduated);
      setValue('degree', rowData.employee_profile.degree);
      setValue('gender', rowData.employee_profile.gender);
      setValue('placeOfBirth', rowData.employee_profile.placeOfBirth);
      setValue(
        'nationality',
        rowData.employee_profile.nationality.toUpperCase()
      );
      setValue('civilStatus', rowData.employee_profile.civilStatus);
      setValue(
        'address',
        `${rowData.employee_profile.cityId}-${rowData.employee_profile.provinceId}-${rowData.employee_profile.countryId}`
      );
      // console.log('allowanceBreakdown!', rowData.allowance_breakdown);
      setAllowanceBreakdown(rowData.allowanceBreakdown);

      if (rowData.allowance_breakdown !== null) {
        if (
          rowData.allowance_breakdown.allowanceType == '' &&
          rowData.allowance_breakdown.monthlyAmounts === '' &&
          rowData.allowance_breakdown.dailyAmounts === ''
        ) {
          setAllowanceBreakdownItems([]);
        } else {
          const type = rowData.allowance_breakdown.allowanceType.split(',');
          const monthly = rowData.allowance_breakdown.monthlyAmounts
            .split(',')
            .map(Number);
          const daily = rowData.allowance_breakdown.dailyAmounts
            .split(',')
            .map(Number);
          const items = [];
          for (let i = 0; i < type.length; i++) {
            items.push({
              type: type[i],
              monthlyRate: monthly[i],
              dailyRate: daily[i],
            });
          }

          setAllowanceBreakdownItems(items);
        }
      } else {
        setAllowanceBreakdownItems([]);
      }
    }
  }, [isOpen, action, reset, rowData, setValue, refetchDataFromParent]);
  const submitButtonRef = useRef<any>(null);
  const context = useContext(GlobalContainer);
  const sessionData = context?.userData;
  const [workingDays, setWorkingDays] = useState<any>(242);
  const company = useRef<any>(null);
  const companyRoles = useQuery({
    refetchOnWindowFocus: false,
    queryKey: ['userRolesData'],
    queryFn: async () => {
      const response: any = await axios(`/api/user_roles/all`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
        },
      });

      const roles = response.data.map((role: any) => ({
        name: role.roleName,
        value: role.userRoleId,
      }));

      return roles;
    },
  });

  useEffect(() => {
    axios
      .get(`/api/companies/${sessionData.companyId}`, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
        },
      })
      .then((res: any) => {
        company.current = res.data;
        // console.log(company.current);
        setWorkingDays(company.current.workingDays);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Submit form
  const changeTabHandler = async (e: any) => {
    const prevIndex = activeIndex;
    await setActiveIndex(e.index);

    if (e.index === 0) {
      // console.log(getValues('employeeCode'));
      if (getValues('basicPay') <= 0 || !getValues('basicPay')) {
        setError('basicPay', {
          type: 'required',
          message: 'Monthly Basic Pay is required.',
        });
      }
      if (getValues('dailyRate') <= 0 || !getValues('dailyRate')) {
        setError('dailyRate', {
          type: 'required',
          message: 'Daily Rate is required.',
        });
      }
      if (!getValues('role')) {
        setError('role', {
          type: 'required',
          message: 'Role is required.',
        });
      }
      if (
        getValues('overtimeRateRegDays') == undefined ||
        getValues('overtimeRateRegDays') == null
      ) {
        // setError('overtimeRateRegDays', {
        //   type: 'required',
        //   message: 'Overtime Rate for Regular Days is required.',
        // });
        setValue('overtimeRateRegDays', 0);
      }
      if (
        getValues('overtimeRateHolidays') == undefined ||
        getValues('overtimeRateHolidays') == null
      ) {
        // setError('overtimeRateHolidays', {
        //   type: 'required',
        //   message: 'Overtime Rate for Holidays is required.',
        // });
        setValue('overtimeRateHolidays', 0);
      }
      if (
        getValues('overtimeRateRestDays') == undefined ||
        getValues('overtimeRateRestDays') == null
      ) {
        // setError('overtimeRateRestDays', {
        //   type: 'required',
        //   message: 'Overtime Rate for Working on Rest Days is required.',
        // });
        setValue('overtimeRateRestDays', 0);
      }

      const fields = [];
      if (!getValues('employeeCode')) {
        setError('employeeCode', {
          type: 'required',
          message: 'Employee ID is required.',
        });
        // fields.push('Date Hired');
        // foundError++;
      }
      // if (!getValues('role')) {
      //   setError('role', {
      //     type: 'required',
      //     message: 'Role is required.',
      //   });
      // }
      if (
        !getValues('employmentStatus') ||
        getValues('employmentStatus') == ''
      ) {
        setError('employmentStatus', {
          type: 'required',
          message: 'Employee Status is required.',
        });
        // fields.push('Date Hired');
        // foundError++;
      }
      if (!getValues('positionTitle') || getValues('positionTitle') == '') {
        setError('positionTitle', {
          type: 'required',
          message: 'Position Title is required.',
        });
      }
      if (!getValues('departmentId') || getValues('departmentId') == '') {
        setError('departmentId', {
          type: 'required',
          message: 'Department is required.',
        });
      }
      if (!getValues('shiftId') || getValues('shiftId') == '') {
        setError('shiftId', {
          type: 'required',
          message: 'Shift is required.',
        });
      }
      // if (
      //   !getValues('dayOff') ||
      //   getValues('dayOff') == '' ||
      //   getValues('dayOff') == undefined
      // ) {
      //   setError('dayOff', {
      //     type: 'required',
      //     message: 'Day Off is required.',
      //   });
      // }
      if (!getValues('modeOfPayroll') || getValues('modeOfPayroll') == '') {
        setError('modeOfPayroll', {
          type: 'required',
          message: 'Mode of Payroll is required.',
        });
      }
    }

    if (e.index === 3) {
      setLazyRefresher(!lazyRefresher);
      if (!getValues('lastName')) {
        setError('lastName', {
          type: 'required',
          message: 'Last Name is required.',
        });
        // fields.push('Date Hired');
        // foundError++;
      }
      if (getValues('lastName') !== '' && !nameRE.test(getValues('lastName'))) {
        setError('lastName', {
          type: 'required',
          message: 'Last Name cannot contain special characters.',
        });
      }

      if (!getValues('firstName')) {
        setError('firstName', {
          type: 'required',
          message: 'First Name is required.',
        });
        // fields.push('Date Hired');
        // foundError++;
      }
      if (
        getValues('firstName') !== '' &&
        !nameRE.test(getValues('firstName'))
      ) {
        setError('firstName', {
          type: 'required',
          message: 'First Name cannot contain special characters.',
        });
      }
      if (
        getValues('middleName') !== '' &&
        !nameRE.test(getValues('middleName'))
      ) {
        setError('middleName', {
          type: 'required',
          message: 'Middle Name cannot contain special characters.',
        });
      }
      if (!getValues('emailAddress')) {
        setError('emailAddress', {
          type: 'required',
          message: 'Email Address is required.',
        });
        // fields.push('Date Hired');
        // foundError++;
      }
      if (!getValues('contactNumber')) {
        setError('contactNumber', {
          type: 'required',
          message: 'MCash Mobile Number is required.',
        });
      }

      if (!getValues('streetAddress')) {
        setError('streetAddress', {
          type: 'required',
          message: 'Street Address is required.',
        });
      }

      if (
        !getValues('address') ||
        getValues('address') == '' ||
        getValues('address') === undefined
      ) {
        setError('address', {
          type: 'required',
          message: 'City, Province, Country is required.',
        });
      }
      if (!getValues('placeOfBirth') || getValues('placeOfBirth') == '') {
        setError('placeOfBirth', {
          type: 'required',
          message: 'Place of Birth is required.',
        });
      }
      if (!getValues('birthDate') || getValues('birthDate') == '') {
        setError('birthDate', {
          type: 'required',
          message: 'Birthdate is required.',
        });
      } else if (
        MCASH_MLWALLET.includes(getValues('modeOfPayroll')) &&
        moment(watch('birthDate')) > moment(todayMinus18years)
      ) {
        setError('birthDate', {
          type: 'required',
          message: 'MCash users cannot be under 18 years old.',
        });
      }
      if (!getValues('gender') || getValues('gender') == '') {
        setError('gender', {
          type: 'required',
          message: 'Gender is required.',
        });
      }
      if (!getValues('civilStatus') || getValues('civilStatus') == '') {
        setError('civilStatus', {
          type: 'required',
          message: 'Civil Status is required.',
        });
      }
      if (!getValues('nationality') || getValues('nationality') == '') {
        setError('nationality', {
          type: 'required',
          message: 'Nationality is required.',
        });
      }
    }
  };
  const onSubmit = async (data: EmployeeMgmtForm) => {
    if (Object.keys(errors).length > 0) return false;

    if (checkRequiredFields()) {
      return false;
    }

    // check for duplicate Company Name and Email address
    // const valid = await checkDuplicates({
    //   emailAddress: data.emailAddress,
    //   contactNumber: data.contactNumber,
    //   employeeCode: data.employeeCode,
    //   employeeId: data.employeeId,
    // });
    // if (!valid) return false;

    const address: any = data.address && data.address.split('-');

    data.dayOff =
      data.dayOff === null || data.dayOff === undefined || data.dayOff === ''
        ? []
        : data.dayOff.map((i: any) => i.code);
    data.cityId = Number(address[0]);
    data.provinceId = Number(address[1]);
    data.countryId = Number(address[2]);
    data.monthlyAllowance = Number(watch('monthlyAllowance'));
    // data.profilePicture = profilePic.name;

    data.birthDate = moment(data.birthDate).format('YYYY-MM-DD');
    data.hiringDate = moment(data.hiringDate).format('YYYY-MM-DD');
    data.dateOfSeparation = data.dateOfSeparation
      ? moment(data.dateOfSeparation).format('YYYY-MM-DD')
      : data.dateOfSeparation;
    data.startDate = moment(data.startDate).format('YYYY-MM-DD');
    data.allowanceBreakdown = allowanceBreakdown;

    if (referenceFiles.length > 0) {
      const files = referenceFiles.map((i: any) => {
        i.isUploaded = true;
        return i;
      });
      data.referenceFiles = JSON.stringify(files);
    }

    try {
      let response = null;
      setSelectedRows([]);
      if (action == 'add') {
        response = await axios.post('/api/employees', data, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
          },
        });
      } else if (action == 'edit') {
        // process profile pic upload
        if (profilePicFile) {
          // console.log(profilePicFile?.size);
          if (profilePicFile?.size > 52428800) {
            toast.current?.replace({
              severity: 'error',
              detail: 'File size should be less than 50MB.',
              sticky: true,
              closable: true,
            });
            return;
          }
          const fd = new FormData();
          fd.append('file', profilePicFile);
          const requestPresignedURL: any = await axios.post(
            `/api/employees/ckyc/request-presigned-url?ckycId=${data.ckycId}`,
            fd,
            {
              headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
                'Content-Type': 'multipart/form-data',
              },
            }
          );
          if (requestPresignedURL.status == 200) {
            const { preSignedUrl } = requestPresignedURL.data;
            const uploadPPurl = await fileUploadToCKYC({
              fileURL: preSignedUrl,
              file: profilePicFile,
            });
            data.profilePicture = uploadPPurl ? preSignedUrl : null;
          }
        }

        // if (rowData.employee_profile.contactNumber != data.contactNumber) {
        //   data.requestChangeContactNum = true;
        // } else {
        //   data.requestChangeContactNum = false;
        // }
        response = await axios.put('/api/employees', data, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
          },
        });

        // setChangeContactDialogVisible(data.requestChangeContactNum);
      }

      if (response) {
        if (response.status === 200) {
          setSideBarConfig((prev: any) => ({ ...prev, isOpen: false }));
          refetchDataFromParent();
        }
        toast.current?.replace({
          severity: response.data.severity || 'success',
          summary: response.data.message,
          life: 5000,
        });
      }
    } catch (error: any) {
      const response = error?.response?.data;

      if (response.hasOwnProperty('mismatchedInfos')) {
        const { mismatchedInfos } = response;
        // console.log(mismatchedInfos);
        if (mismatchedInfos) {
          mismatchedInfos.forEach((fieldErr: any) =>
            setError(fieldErr, {
              type: 'Mismatched',
              message: 'Mismatched information.',
            })
          );

          if (
            response.responseData &&
            response.responseData.code ==
            'CANNOT_LINK_ACCOUNT_TO_EMPLOYEE_ERROR'
          ) {
            const mismatchedInfos = response.message
              .split(':')[1]
              .replace(/,(?=[^\s])/g, ', ')
              .trim()
              .replace(/([a-z](?=[A-Z]))/g, '$1 ');

            return toast.current?.replace({
              severity: 'error',
              detail: `Cannot link the existing wallet to the employee due to mismatched information. Mismatched information: ${properCasing(
                mismatchedInfos
              )}`,
              sticky: true,
              closable: true,
            });
          }
        }
      }

      toast.current?.replace({
        severity: 'error',
        detail: response.message,
        sticky: true,
        closable: true,
      });
    }
  };

  useEffect(() => {
    if (isValid && isSubmitting) {
      toast.current?.replace({
        severity: 'info',
        summary: 'Submitting request',
        detail: 'Please wait...',
        sticky: true,
        closable: false,
      });
    }
  }, [isValid, isSubmitting]);

  function checkRequiredFields() {
    let foundError = 0;
    const fields = [];
    let birthDateError = false;
    // console.log(watch('gender'));
    // console.log(watch('shiftId'));
    if (!getValues('hiringDate')) {
      setError('hiringDate', {
        type: 'required',
        message: 'Date Hired is required.',
      });

      fields.push('Date Hired');
      foundError++;
    }
    if (!getValues('role')) {
      setError('role', {
        type: 'required',
        message: 'Role is required.',
      });
      fields.push('Role');
      foundError++;
    }
    if (!getValues('startDate')) {
      setError('startDate', {
        type: 'required',
        message: 'Date Started is required.',
      });

      fields.push('Date Started');
      foundError++;
    }

    if (!getValues('employmentStatus')) {
      setError('employmentStatus', {
        type: 'required',
        message: 'EmploymentStatus is required.',
      });

      fields.push('Employment Status');
      foundError++;
    }

    if (getValues('departmentId') == null) {
      setError('departmentId', {
        type: 'required',
        message: 'Department is required.',
      });

      fields.push('Department');
      foundError++;
    }

    if (getValues('shiftId') == null) {
      setError('shiftId', {
        type: 'required',
        message: 'Shift is required.',
      });

      fields.push('Shifts');
      foundError++;
    }

    if (!emailRe.test(getValues('emailAddress'))) {
      setError('emailAddress', {
        type: 'required',
        message: 'Invalid Email Address format.',
      });

      fields.push('emailAddress');
      foundError++;
    }
    if (getValues('basicPay') == null) {
      setError('basicPay', {
        type: 'required',
        message: 'Monthly Basic Pay is required.',
      });

      fields.push('basicPay');
      foundError++;
    } else if (getValues('basicPay') <= 0) {
      setError('basicPay', {
        type: 'min',
        message: 'Monthly Basic Pay is required.',
      });

      fields.push('basicPay');
      foundError++;
    }
    if (
      getValues('overtimeRateRegDays') == undefined ||
      getValues('overtimeRateRegDays') == null
    ) {
      // setError('overtimeRateRegDays', {
      //   type: 'required',
      //   message: 'Overtime Rate for Regular Days is required.',
      // });
      // fields.push('overtimeRateRegDays');
      // foundError++;
      setValue('overtimeRateRegDays', 0);
    }
    if (
      getValues('overtimeRateHolidays') == undefined ||
      getValues('overtimeRateHolidays') == null
    ) {
      // setError('overtimeRateHolidays', {
      //   type: 'required',
      //   message: 'Overtime Rate for Holidays is required.',
      // });
      // fields.push('overtimeRateHolidays');
      // foundError++;
      setValue('overtimeRateHolidays', 0);
    }
    if (
      getValues('overtimeRateRestDays') == undefined ||
      getValues('overtimeRateRestDays') == null
    ) {
      // setError('overtimeRateRestDays', {
      //   type: 'required',
      //   message: 'Overtime Rate for Working on Rest Days is required.',
      // });
      // fields.push('overtimeRateRestDays');
      // foundError++;
      setValue('overtimeRateRestDays', 0);
    }

    // if (!getValues('dayOff') || getValues('dayOff').length == 0) {
    //   setError('dayOff', {
    //     type: 'required',
    //     message: 'Day Off is required.',
    //   });

    //   fields.push('Day Off');
    //   foundError++;
    // }

    if (getValues('modeOfPayroll') == '') {
      setError('modeOfPayroll', {
        type: 'required',
        message: 'Mode of Payroll is required.',
      });
      fields.push('Mode of Payroll');
      foundError++;
    }
    if (!getValues('birthDate')) {
      setError('birthDate', {
        type: 'required',
        message: 'Birthdate is required.',
      });

      fields.push('Birthdate');
      foundError++;
    } else if (
      MCASH_MLWALLET.includes(getValues('modeOfPayroll')) &&
      moment(watch('birthDate')) > moment(todayMinus18years)
    ) {
      setError('birthDate', {
        type: 'required',
        message: 'MCash users cannot be under 18 years old.',
      });
      birthDateError = true;
    }
    if (!getValues('gender')) {
      setError('gender', {
        type: 'required',
        message: 'Gender is required.',
      });

      fields.push('Gender');
      foundError++;
    }

    if (!getValues('civilStatus')) {
      setError('civilStatus', {
        type: 'required',
        message: 'Civil Status is required.',
      });

      fields.push('Civil Status');
      foundError++;
    }

    if (fields.length > 0 || birthDateError) {
      toast.current?.replace({
        severity: 'error',
        summary:
          (fields.length > 0
            ? `Found empty required field(s): ${fields.join(', ')}.`
            : '') +
          (birthDateError ? `\nMCash users cannot be under 18 years old.` : ''),
        life: 5000,
      });
    }
    return foundError || birthDateError;
  }

  useEffect(() => {
    if (action == 'add') {
      setAllowanceBreakdown(false);
      setAllowanceBreakdownItems([]);
      setNewAllowanceBreakdownType('');
      setNewAllowanceBreakdownMonthlyRate(0);
      setSelectedAllowanceRow(null);
    }
  }, [action, isOpen]);

  const addNewAllowanceBreakdownItem = () => {
    if (
      newAllowanceBreakdownType != '' &&
      newAllowanceBreakdownMonthlyRate > 0 &&
      allowanceBreakdownItems.length < 5 &&
      !hasHtmlTags(newAllowanceBreakdownType) &&
      !hasSQLKeywords(newAllowanceBreakdownType) &&
      !hasHtmlTags(newAllowanceBreakdownMonthlyRate.toString()) &&
      !hasSQLKeywords(newAllowanceBreakdownMonthlyRate.toString())
    ) {
      const updatedAllowanceBreakdownItems = [
        ...allowanceBreakdownItems,
        {
          type: newAllowanceBreakdownType.trim(),
          monthlyRate: parseFloat(newAllowanceBreakdownMonthlyRate.toFixed(2)),
          dailyRate: parseFloat(
            ((newAllowanceBreakdownMonthlyRate * 12) / workingDays).toFixed(2)
          ),
        },
      ];
      setAllowanceBreakdownItems(updatedAllowanceBreakdownItems);
      setNewAllowanceBreakdownMonthlyRate(0);
      setNewAllowanceBreakdownType('');
    }

    if (allowanceBreakdownItems.length > 4) {
      toast.current?.replace({
        severity: 'error',
        detail: 'Maximum Allowance Breakdown items reached.',
        life: 5000,
      });
    }
  };

  const deleteAllowanceBreakdownItem = () => {
    const updatedAllowanceBreakdownItems = [...allowanceBreakdownItems];
    updatedAllowanceBreakdownItems.splice(selectedAllowanceRow, 1);
    setAllowanceBreakdownItems(updatedAllowanceBreakdownItems);
    setSelectedAllowanceRow(null);
    setIsDeleteSidebarOpen(false);
  };

  useEffect(() => {
    if (Boolean(allowanceBreakdown)) {
      const type: string[] = [];
      const monthly: number[] = [];
      const daily: number[] = [];

      allowanceBreakdownItems.forEach((item) => {
        type.push(item.type);
        monthly.push(item.monthlyRate);
        daily.push(item.dailyRate);
      });

      setValue('allowanceType', type.toString());
      setValue('monthlyAmounts', monthly.toString());
      setValue('dailyAmounts', daily.toString());

      setValue(
        'monthlyAllowance',
        parseFloat(monthly.reduce((a, b) => a + b, 0).toFixed(2))
      );
      setValue(
        'allowance',
        parseFloat(daily.reduce((a, b) => a + b, 0).toFixed(2))
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowanceBreakdownItems, allowanceBreakdown]);

  return (
    <>
      <Toast ref={toast} position="bottom-left" />
      <Dialog
        header="Request change submitted"
        visible={changeContactDialogVisible}
        style={{ width: '50vw' }}
        onHide={() => {
          setChangeContactDialogVisible(false);
        }}
      >
        <p className="my-10">
          Please email ML helpdesk at{' '}
          <strong>ntg.helpdesk@mlhuillier.com</strong>
          <br />
          with a subject{' '}
          <strong>[Company name - Requested employee mobile number]</strong>.
        </p>
      </Dialog>
      <Sidebar
        onShow={() => {
          if (getValues('basicPay') <= 0 || !getValues('basicPay')) {
            setError('basicPay', {
              type: 'required',
              message: 'Monthly Basic Pay is required.',
            });
          }
          if (getValues('dailyRate') <= 0 || !getValues('dailyRate')) {
            setError('dailyRate', {
              type: 'required',
              message: 'Daily Rate is required.',
            });
          }

          if (!getValues('employeeCode')) {
            setError('employeeCode', {
              type: 'required',
              message: 'Employee ID is required.',
            });
            // fields.push('Date Hired');
            // foundError++;
          }
          if (!getValues('role')) {
            setError('role', {
              type: 'required',
              message: 'Role is required.',
            });
          }
          if (
            !getValues('employmentStatus') ||
            getValues('employmentStatus') == ''
          ) {
            setError('employmentStatus', {
              type: 'required',
              message: 'Employee Status is required.',
            });
            // fields.push('Date Hired');
            // foundError++;
          }
          if (!getValues('positionTitle') || getValues('positionTitle') == '') {
            setError('positionTitle', {
              type: 'required',
              message: 'Position Title is required.',
            });
          }
          if (!getValues('departmentId') || getValues('departmentId') == '') {
            setError('departmentId', {
              type: 'required',
              message: 'Department is required.',
            });
          }
          if (!getValues('shiftId') || getValues('shiftId') == '') {
            setError('shiftId', {
              type: 'required',
              message: 'Shift is required.',
            });
          }
          // if (
          //   !getValues('dayOff') ||
          //   getValues('dayOff') == '' ||
          //   getValues('dayOff') == undefined
          // ) {
          //   setError('dayOff', {
          //     type: 'required',
          //     message: 'Day Off is required.',
          //   });
          // }
          if (!getValues('modeOfPayroll') || getValues('modeOfPayroll') == '') {
            setError('modeOfPayroll', {
              type: 'required',
              message: 'Mode of Payroll is required.',
            });
          }
          const nameRE = /^[A-Za-zñÑ0-9 '-]+$/;
          if (!getValues('lastName')) {
            setError('lastName', {
              type: 'required',
              message: 'Last Name is required.',
            });
          }
          if (
            getValues('lastName') !== '' &&
            !nameRE.test(getValues('lastName'))
          ) {
            setError('lastName', {
              type: 'required',
              message: 'Last Name cannot contain special characters.',
            });
          }
          if (
            getValues('firstName') !== '' &&
            !nameRE.test(getValues('firstName'))
          ) {
            setError('firstName', {
              type: 'required',
              message: 'First Name cannot contain special characters.',
            });
          }
          if (
            getValues('middleName') !== '' &&
            !nameRE.test(getValues('middleName'))
          ) {
            setError('middleName', {
              type: 'required',
              message: 'Middle Name cannot contain special characters.',
            });
          }
          if (!getValues('firstName')) {
            setError('firstName', {
              type: 'required',
              message: 'First Name is required.',
            });
          }
          if (!getValues('emailAddress')) {
            setError('emailAddress', {
              type: 'required',
              message: 'Email Address is required.',
            });
            // fields.push('Date Hired');
            // foundError++;
          }
          if (!getValues('contactNumber')) {
            setError('contactNumber', {
              type: 'required',
              message: 'MCash Mobile Number is required.',
            });
          }

          if (!getValues('streetAddress')) {
            setError('streetAddress', {
              type: 'required',
              message: 'Street Address is required.',
            });
          }

          if (
            !getValues('address') ||
            getValues('address') == '' ||
            getValues('address') === undefined
          ) {
            setError('address', {
              type: 'required',
              message: 'City, Province, Country is required.',
            });
          }
          if (!getValues('placeOfBirth') || getValues('placeOfBirth') == '') {
            setError('placeOfBirth', {
              type: 'required',
              message: 'Place of Birth is required.',
            });
          }
          if (!getValues('birthDate') || getValues('birthDate') == '') {
            setError('birthDate', {
              type: 'required',
              message: 'Birthdate is required.',
            });
          } else if (
            MCASH_MLWALLET.includes(watch('modeOfPayroll')) &&
            moment(watch('birthDate')) > moment(todayMinus18years)
          ) {
            setError('birthDate', {
              type: 'required',
              message: 'MCash users cannot be under 18 years old.',
            });
          }
          if (!getValues('gender') || getValues('gender') == '') {
            setError('gender', {
              type: 'required',
              message: 'Gender is required.',
            });
          }
          if (!getValues('civilStatus') || getValues('civilStatus') == '') {
            setError('civilStatus', {
              type: 'required',
              message: 'Civil Status is required.',
            });
          }
          if (!getValues('nationality') || getValues('nationality') == '') {
            setError('nationality', {
              type: 'required',
              message: 'Nationality is required.',
            });
          }
        }}
        closeOnEscape={action == 'view'}
        dismissable={action == 'view'}
        position="right"
        style={{
          width: '87%',
        }}
        visible={isOpen}
        onHide={() => {
          setSideBarConfig((prev: any) => ({ ...prev, isOpen: false }));
        }}
      >
        <React.Fragment>
          <div className="flex items-center justify-between">
            <h1
              className={classNames('text-black font-medium text-3xl mr-3', {
                'mb-5': action == 'add',
              })}
            >
              {title}{' '}
            </h1>
            {action != 'add' && (
              <>
                <Controller
                  name="profilePicture"
                  control={control}
                  render={({ field, fieldState }) => (
                    <>
                      <div className="flex flex-row w-[127px] justify-end">
                        <Tooltip target=".image-icon" />

                        <i
                          className="image-icon pi pi-info-circle p-text-secondary text-[17px] m-2"
                          data-pr-tooltip="It is recommended to upload a 1x1 picture."
                          data-pr-position="left"
                          data-pr-at="left center"
                          data-pr-my="right-10"
                          style={{ cursor: 'pointer' }}
                        ></i>
                        <label>
                          <div
                            className={classNames(
                              'relative w-[127px] h-[127px] border-2 border-gray-300 rounded flex flex-col justify-center items-center  text-gray-600',
                              {
                                'border-red-300 text-red-600':
                                  errors.profilePicture,
                                'hover:cursor-pointer': action != 'view',
                              }
                            )}
                          >
                            <Image
                              fill
                              style={{
                                objectFit: 'scale-down',
                                background: '#E9E9E9',
                              }}
                              src={profilePicURL}
                              alt="ProfilePic"
                            />
                          </div>
                          <input
                            disabled={isSubmitting || action == 'view'}
                            type="file"
                            className={classNames('hidden', {
                              'p-invalid': errors.profilePicture,
                            })}
                            accept="image/*"
                            onChange={async (event: any) => {
                              const file = event.target.files?.[0];
                              if (file) {
                                let reader = new FileReader();
                                reader.readAsDataURL(file);
                                reader.onloadend = function (e) {
                                  setProfilePicURL(reader.result);
                                };
                                setProfilePicFile(file);
                                // const timeUploaded = new Date().getTime();
                                // if (uploadPPurl) {
                                //   setProfilePic({
                                //     name:
                                //       timeUploaded +
                                //       '-' +
                                //       file.name.replace(/ /g, '_'),
                                //     url: uploadPPurl,
                                //     file: file,
                                //   });
                                // } else {
                                //   toast.current?.replace({
                                //     severity: 'error',
                                //     detail:
                                //       'Failed to upload Profile Picture. Please contact your system administrator.',
                                //     sticky: true,
                                //     closable: true,
                                //   });
                                // }
                              }
                            }}
                          />
                        </label>
                      </div>
                    </>
                  )}
                />
              </>
            )}
          </div>
        </React.Fragment>

        <form className="w-full overflow-auto">
          <TabView
            activeIndex={activeIndex}
            onTabChange={(e: any) => changeTabHandler(e)}
          >
            <TabPanel header="General Information">
              <div className="grid grid-cols-3 gap-3">
                <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                  <label className="my-1">
                    <span className="text-red-500">*</span>
                    <span>Employee ID</span>
                  </label>
                  <InputText
                    className="w-full md:w-14rem"
                    disabled={isSubmitting || action == 'view'}
                    {...register('employeeCode', {
                      required: 'Employee ID is required.',
                    })}
                    onChange={() => {
                      if (
                        errors.employeeCode &&
                        watch('employeeCode') !== null
                      ) {
                        clearErrors('employeeCode');
                      }
                    }}
                  />
                  {errors.employeeCode && (
                    <span className="text-red-600">
                      {errors.employeeCode.message}
                    </span>
                  )}
                </div>
                {/* {sessionData.emailAddress != watch('emailAddress') && ( */}
                <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                  <label className="my-1">
                    <span className="text-red-500">*</span>
                    <span>Role</span>
                  </label>
                  <Controller
                    name="role"
                    control={control}
                    rules={{
                      required:
                        sessionData.emailAddress == watch('emailAddress')
                          ? false
                          : 'Role is required.',
                    }}
                    render={({ field, fieldState }) => (
                      <Dropdown
                        filter
                        value={field.value}
                        options={companyRoles.data}
                        optionLabel={'name'}
                        onChange={(e) => {
                          field.onChange(e.value);
                          if (errors.role && getValues('role')) {
                            clearErrors('role');
                          }
                        }}
                        required
                        className="w-full md:w-14rem"
                        disabled={isSubmitting || action == 'view'}
                      />
                    )}
                  />
                  {sessionData.emailAddress != watch('emailAddress') &&
                    errors.role && (
                      <span className="text-red-600">
                        {errors.role.message}
                      </span>
                    )}
                </div>
                {/* )} */}
                {/* <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                  <label className="my-1">
                    <span className="text-red-500">*</span>
                    <span>Role</span>
                  </label>
                  <Controller
                    name="role"
                    control={control}
                    rules={{ required: 'Role is required.' }}
                    render={({ field, fieldState }) => (
                      <Dropdown
                        ref={field.ref}
                        value={field.value}
                        onBlur={field.onBlur}
                        onChange={(e) => {
                          field.onChange(e.value);

                          if (errors.role && watch('role') !== null) {
                            clearErrors('role');
                          }
                        }}
                        options={[
                          {
                            name: 'EMPLOYEE',
                            value: 'EMPLOYEE',
                          },
                          {
                            name: 'ADMIN',
                            value: 'ADMIN',
                          },
                        ]}
                        optionLabel={'name'}
                        className="w-full md:w-14rem"
                        disabled={isSubmitting || action == 'view'}
                      />
                    )}
                  />
                  {errors.role && (
                    <span className="text-red-600">{errors.role.message}</span>
                  )}
                </div> */}
              </div>

              {action != 'add' && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                    <label className="my-1">
                      <span className="text-red-500">*</span>
                      <span>ML CKYC ID</span>
                    </label>
                    <InputText
                      className="w-full md:w-14rem"
                      disabled={isSubmitting || action != 'add'}
                      {...register('ckycId')}
                    />
                  </div>
                  <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                    <label className="my-1">
                      <span className="text-red-500">*</span>
                      <span>MCash ID</span>
                    </label>
                    <InputText
                      className="w-full md:w-14rem"
                      disabled={isSubmitting || action != 'add'}
                      {...register('mlWalletId')}
                    />
                  </div>
                </div>
              )}
              <div className="grid grid-cols-3 gap-3">
                <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                  <label className="my-1">
                    <span className="text-red-500">*</span>
                    <span>Date Hired</span>
                  </label>
                  <Controller
                    name="hiringDate"
                    control={control}
                    rules={{ required: 'Date Hired is required.' }}
                    render={({ field, fieldState }) => (
                      <Calendar
                        disabled={isSubmitting || action == 'view'}
                        ref={field.ref}
                        value={field.value}
                        onBlur={field.onBlur}
                        onChange={(e) => {
                          if (e.value && e.value > watch('startDate')) {
                            let tempDate: any = e.value;

                            // tempDate.setDate(tempDate.getDate() - 1);
                            const myDate = new Date();
                            myDate.setTime(
                              tempDate.getTime() + 24 * 60 * 60 * 1000 * 1
                            );
                            setValue('startDate', myDate);
                          }
                          field.onChange(e.value);
                        }}
                        className={classNames({
                          'p-invalid': fieldState.invalid,
                        })}
                        dateFormat="mm/dd/yy"
                        showIcon
                      />
                    )}
                  />
                  {errors.hiringDate && (
                    <span className="text-red-600">
                      {errors.hiringDate.message}
                    </span>
                  )}
                </div>
                <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                  <label className="my-1">
                    <span className="text-red-500">*</span>
                    <span>Date Started</span>
                  </label>
                  <Controller
                    name="startDate"
                    control={control}
                    rules={{
                      required: 'Date Started is required.',
                    }}
                    render={({ field, fieldState }) => (
                      <Calendar
                        minDate={watch('hiringDate')}
                        disabled={isSubmitting || action == 'view'}
                        ref={field.ref}
                        value={field.value}
                        onBlur={field.onBlur}
                        onChange={(e) => {
                          if (e.value && e.value < watch('hiringDate')) {
                            setValue('startDate', watch('hiringDate'));
                          } else {
                            field.onChange(e.value);
                          }
                        }}
                        className={classNames({
                          'p-invalid': fieldState.invalid,
                        })}
                        dateFormat="mm/dd/yy"
                        showIcon
                      />
                    )}
                  />
                  {errors.startDate && (
                    <span className="text-red-600">
                      {errors.startDate.message}
                    </span>
                  )}
                </div>

                <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                  <label className="my-1">
                    <span className="text-red-500">*</span>
                    <span>Employment Status</span>
                  </label>
                  <Controller
                    name="employmentStatus"
                    control={control}
                    rules={{ required: 'Employment Status is required.' }}
                    render={({ field, fieldState }) => (
                      <Dropdown
                        value={field.value}
                        options={[
                          { name: 'Regular', value: 'Regular' },
                          { name: 'Probationary', value: 'Probationary' },
                          // { name: 'Casual', value: 'Casual' },
                          // { name: 'Project', value: 'Project' },
                          // { name: 'Seasonal', value: 'Seasonalf' },
                        ]}
                        optionLabel={'name'}
                        onChange={(e) => {
                          field.onChange(e.value);
                          if (
                            errors.employmentStatus &&
                            getValues('employmentStatus')
                          ) {
                            clearErrors('employmentStatus');
                          }
                        }}
                        required
                        className="w-full md:w-14rem"
                        disabled={isSubmitting || action == 'view'}
                      />
                    )}
                  />
                  {errors.employmentStatus && (
                    <span className="text-red-600">
                      {errors.employmentStatus.message}
                    </span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                  <label className="my-1">
                    <span className="text-red-500">*</span>
                    <span>Position Title</span>
                  </label>
                  <InputText
                    className="w-full md:w-14rem"
                    disabled={isSubmitting || action == 'view'}
                    {...register('positionTitle', {
                      required: 'Position Title is required.',
                    })}
                    onChange={() => {
                      if (
                        errors.positionTitle &&
                        watch('positionTitle') !== null
                      ) {
                        clearErrors('positionTitle');
                      }
                    }}
                  />
                  {errors.positionTitle && (
                    <span className="text-red-600">
                      {errors.positionTitle.message}
                    </span>
                  )}
                </div>
                <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                  <label className="my-1">
                    <span className="text-red-500">*</span>
                    <span>Department</span>
                  </label>
                  <Controller
                    name="departmentId"
                    control={control}
                    rules={{ required: 'Department is required.' }}
                    render={({ field, fieldState }) => (
                      <Dropdown
                        filter
                        ref={field.ref}
                        value={field.value}
                        onBlur={field.onBlur}
                        onChange={(e) => {
                          field.onChange(e.value);

                          if (
                            errors.departmentId &&
                            watch('departmentId') !== null
                          ) {
                            clearErrors('departmentId');
                          }
                        }}
                        options={
                          departmentsQuery.isLoading
                            ? [{ name: 'Loading...' }]
                            : departmentsQuery.data?.message?.map(
                              (dept: any) => {
                                const obj: any = {};
                                obj.name = dept.departmentName;
                                obj.value = dept.departmentId;
                                return obj;
                              }
                            )
                        }
                        optionLabel={'name'}
                        className="w-full md:w-14rem"
                        disabled={isSubmitting || action == 'view'}
                      />
                    )}
                  />
                  {errors.departmentId && (
                    <span className="text-red-600">
                      {errors.departmentId.message}
                    </span>
                  )}
                </div>
                <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                  <label className="my-1">
                    <span className="text-red-500">*</span>
                    <span>Shifts</span>
                  </label>
                  <Controller
                    name="shiftId"
                    control={control}
                    rules={{ required: 'Shift is required.' }}
                    render={({ field, fieldState }) => (
                      <Dropdown
                        filter
                        ref={field.ref}
                        value={field.value}
                        onBlur={field.onBlur}
                        onChange={(e) => {
                          field.onChange(e.value);

                          if (errors.shiftId && watch('shiftId') !== null) {
                            clearErrors('shiftId');
                          }

                          const selectedShift = e.value;
                          const monthly = getValues().basicPay;
                          const dailyRate = getValues().dailyRate;
                          if (monthly && dailyRate) {
                            const workingHours = shiftsQuery.data?.message.find(
                              (i: any) => selectedShift == i.shiftId
                            ).workingHours;
                            const hourlyRate = parseFloat(
                              (dailyRate / workingHours).toFixed(2)
                            );
                            setValue('overtimeRateRegDays', hourlyRate * 1.25);
                            setValue('overtimeRateHolidays', hourlyRate * 1.69);
                            setValue('overtimeRateRestDays', hourlyRate * 1.69);

                            if (errors.dailyRate && watch('dailyRate') > 1) {
                              clearErrors('dailyRate');
                            }
                            if (
                              errors.overtimeRateRegDays &&
                              watch('overtimeRateRegDays') > 0
                            ) {
                              clearErrors('overtimeRateRegDays');
                            }
                            if (
                              errors.overtimeRateHolidays &&
                              watch('overtimeRateHolidays') > 0
                            ) {
                              clearErrors('overtimeRateHolidays');
                            }
                            if (
                              errors.overtimeRateRestDays &&
                              watch('overtimeRateRestDays') > 0
                            ) {
                              clearErrors('overtimeRateRestDays');
                            }
                          }
                        }}
                        options={
                          shiftsQuery.isLoading
                            ? [{ name: 'Loading...' }]
                            : shiftsQuery.data?.message?.map((dept: any) => {
                              const obj: any = {};
                              obj.name = dept.shiftName;
                              obj.value = dept.shiftId;
                              return obj;
                            })
                        }
                        optionLabel={'name'}
                        className="w-full md:w-14rem"
                        disabled={isSubmitting || action == 'view'}
                      />
                    )}
                  />
                  {errors.shiftId && (
                    <span className="text-red-600">
                      {errors.shiftId.message}
                    </span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                  <label className="my-1">
                    <span>Day Off</span>
                  </label>
                  <Controller
                    name="dayOff"
                    control={control}
                    // rules={{ required: 'Day Off is required.' }}
                    render={({ field }) => (
                      <MultiSelect
                        display={'chip'}
                        disabled={isSubmitting || action == 'view'}
                        name="dayOff"
                        value={field.value}
                        options={[
                          { code: 'Monday', name: 'Monday' },
                          { code: 'Tuesday', name: 'Tuesday' },
                          { code: 'Wednesday', name: 'Wednesday' },
                          { code: 'Thursday', name: 'Thursday' },
                          { code: 'Friday', name: 'Friday' },
                          { code: 'Saturday', name: 'Saturday' },
                          { code: 'Sunday', name: 'Sunday' },
                        ]}
                        onChange={(e) => {
                          field.onChange(e.value);
                          if (
                            errors.dayOff &&
                            (watch('dayOff') !== null ||
                              watch('dayOff') !== undefined)
                          ) {
                            clearErrors('dayOff');
                          }
                        }}
                        optionLabel="name"
                        className="w-full md:w-20rem"
                      />
                    )}
                  />
                  {errors.dayOff && (
                    <span className="text-red-600">
                      {errors.dayOff.message}
                    </span>
                  )}
                </div>
                <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                  <label className="my-1">
                    <span className="text-red-500">*</span>
                    <span>Mode of Payroll</span>
                  </label>
                  <Controller
                    name="modeOfPayroll"
                    control={control}
                    rules={{ required: 'Mode of Payroll is required.' }}
                    render={({ field, fieldState }) => (
                      <Dropdown
                        ref={field.ref}
                        value={field.value}
                        onBlur={field.onBlur}
                        onChange={(e) => {
                          if (
                            errors.modeOfPayroll &&
                            watch('modeOfPayroll') !== null
                          ) {
                            clearErrors('modeOfPayroll');
                          }
                          field.onChange(e.value);
                        }}
                        options={[
                          { name: 'KWARTA PADALA', value: 'KWARTA PADALA' },
                          { name: 'MCASH', value: 'MCASH' },
                        ]}
                        optionLabel={'name'}
                        className="w-full md:w-14rem"
                        disabled={isSubmitting || action == 'view'}
                        required
                      />
                    )}
                  />
                  {errors.modeOfPayroll && (
                    <span className="text-red-600">
                      {errors.modeOfPayroll.message}
                    </span>
                  )}
                </div>
                <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto">
                  <label className="my-1">
                    <span>TIN Number</span>
                  </label>
                  <InputText
                    className="w-full md:w-14rem"
                    disabled={isSubmitting || action == 'view'}
                    {...register('tinNumber')}
                  />
                </div>
              </div>
              <div className="text-red-600 text-xs">
                Note: Total Working Days of the Year can be configured in
                Configurations page
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto">
                  <label className="my-1">
                    <span className="text-red-500">*</span>
                    <span>Monthly Basic Pay (in PHP)</span>
                  </label>
                  <Controller
                    name="basicPay"
                    control={control}
                    rules={{
                      required: 'Monthly Basic Pay is required.',
                      min: {
                        value: 0.01,
                        message: 'Monthly Basic Pay is required.',
                      },
                    }}
                    render={({ field, fieldState }) => (
                      <InputNumber
                        min={0}
                        disabled={isSubmitting || action == 'view'}
                        ref={field.ref}
                        value={field.value}
                        onBlur={field.onBlur}
                        onChange={(e: any) => {
                          let value = e.value;

                          // if (e.value <= 0) {
                          //   value = 1.0;
                          // }
                          // if (e.value === null) {
                          //   value = 1.0;
                          // }
                          let monthly = value;

                          field.onChange(monthly);
                          // } else if (monthly === '') {
                          //   field.onChange(1);
                          // } else {
                          //   field.onChange(monthly);
                          // }
                          if (getValues('basicPay') <= 0) {
                            setError('basicPay', {
                              type: 'min',
                              message: 'Monthly Basic Pay is required.',
                            });
                          } else {
                            clearErrors('basicPay');
                          }

                          const selectedShift = getValues().shiftId;
                          const dailyRate = parseFloat(
                            ((monthly * 12) / workingDays).toFixed(2)
                          );

                          setValue('dailyRate', dailyRate);

                          if (selectedShift) {
                            const workingHours = shiftsQuery.data?.message.find(
                              (i: any) => selectedShift == i.shiftId
                            ).workingHours;
                            const hourlyRate = parseFloat(
                              (dailyRate / workingHours).toFixed(2)
                            );
                            setValue('overtimeRateRegDays', hourlyRate * 1.25);
                            setValue('overtimeRateHolidays', hourlyRate * 1.69);
                            setValue('overtimeRateRestDays', hourlyRate * 1.69);
                          }
                          if (errors.dailyRate && watch('dailyRate') > 0) {
                            clearErrors('dailyRate');
                          }

                          if (
                            errors.overtimeRateRegDays &&
                            watch('overtimeRateRegDays') > 0
                          ) {
                            clearErrors('overtimeRateRegDays');
                          }
                          if (
                            errors.overtimeRateHolidays &&
                            watch('overtimeRateHolidays') > 0
                          ) {
                            clearErrors('overtimeRateHolidays');
                          }
                          if (
                            errors.overtimeRateRestDays &&
                            watch('overtimeRateRestDays') > 0
                          ) {
                            clearErrors('overtimeRateRestDays');
                          }

                          setResettableGovtBenefitFields({
                            sssContributionRate: false,
                            sssERShareRate: false,
                            sssECShareRate: false,
                            philHealthContributionRate: false,
                            philHealthERShareRate: false,
                            pagIbigContributionRate: false,
                            pagIbigERShareRate: false,
                          });

                          const sssID = getValues().sssId;
                          const philHealthId = getValues().philHealthId;
                          const pagIbigId = getValues().pagIbigId;

                          // SSS
                          if (sssID) {
                            const sssContribRatePhp = 0.045 * monthly;
                            setValue(
                              'sssContributionRate',
                              sssContribRatePhp > 900 ? 900 : sssContribRatePhp
                            );

                            const sssERShareRatePhp = 0.095 * monthly;
                            setValue(
                              'sssERShareRate',
                              sssERShareRatePhp > 1900
                                ? 1900
                                : sssERShareRatePhp
                            );

                            const sssECShareRatePhp = 0.045 * monthly;
                            setValue(
                              'sssECShareRate',
                              sssECShareRatePhp > 900 ? 900 : sssECShareRatePhp
                            );

                            setSSSEditable(true);
                          } else {
                            setValue('sssContributionRate', 0);
                            setValue('sssERShareRate', 0);
                            setValue('sssECShareRate', 0);
                            setSSSEditable(false);
                          }

                          // PHIL HEALTH
                          if (philHealthId) {
                            setValue(
                              'philHealthContributionRate',
                              0.02 * monthly
                            );
                            setValue('philHealthERShareRate', 0.02 * monthly);
                            setPhilHealthEditable(true);
                          } else {
                            setValue('philHealthContributionRate', 0);
                            setValue('philHealthERShareRate', 0);
                            setPhilHealthEditable(false);
                          }

                          // PAG IBIG
                          if (pagIbigId) {
                            setValue('pagIbigERShareRate', 0.02 * monthly);
                            if (monthly <= 1500) {
                              setValue(
                                'pagIbigContributionRate',
                                0.01 * monthly
                              );
                            } else if (monthly > 1500) {
                              setValue(
                                'pagIbigContributionRate',
                                0.02 * monthly
                              );
                            }
                            setPagIbigEditable(true);
                          } else {
                            setValue('pagIbigERShareRate', 0);
                            setValue('pagIbigContributionRate', 0);
                            setPagIbigEditable(false);
                          }
                        }}
                        className={classNames({
                          'p-invalid': fieldState.error,
                        })}
                        minFractionDigits={2}
                      />
                    )}
                  />
                  {errors.basicPay && (
                    <span className="text-red-600">
                      {errors.basicPay.message}
                    </span>
                  )}
                </div>

                <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto">
                  <label className="my-1">
                    <span className="text-red-500">*</span>
                    <span>
                      Daily Rate (in PHP){' '}
                      <span className="mx-1">
                        <Tooltip target=".computation-info" position="left" />
                        <i
                          className="computation-info pi pi-info-circle p-text-secondary p-overlay-badge text-[17px]"
                          data-pr-tooltip="(Monthly Basic Pay x Total No. of Months) / Total Working Days of the Year"
                          data-pr-position="right"
                          data-pr-at="right+5 top"
                          data-pr-my="left center-2"
                          style={{ cursor: 'pointer' }}
                        ></i>
                      </span>
                      {action != 'view' && (
                        <i
                          className={classNames({
                            'pi pi-file-edit text-yellow-500 pl-1 cursor-pointer':
                              editDailyRate,
                            'pi pi-save text-green-500 pl-1 cursor-pointer':
                              !editDailyRate,
                          })}
                          onClick={() => setEditDailyRate((prev) => !prev)}
                        />
                      )}
                    </span>
                  </label>
                  <Controller
                    name="dailyRate"
                    control={control}
                    rules={{
                      required: 'Daily Rate is required.',
                      min: { value: 0.01, message: 'Daily Rate is required.' },
                    }}
                    render={({ field, fieldState }) => (
                      <InputNumber
                        min={0}
                        disabled={
                          editDailyRate || isSubmitting || action == 'view'
                        }
                        ref={field.ref}
                        value={field.value}
                        onBlur={field.onBlur}
                        onChange={(e) => {
                          field.onChange(e.value);

                          if (!e.value) {
                            return;
                          }
                          if (getValues('dailyRate') < 1) {
                            setError('dailyRate', {
                              type: 'required',
                              message: 'DailyRate is required.',
                            });
                          } else {
                            clearErrors('dailyRate');
                          }
                          const dailyRate: number = e.value;
                          const selectedShift = getValues().shiftId;
                          const monthlyRate = parseFloat(
                            ((dailyRate * workingDays) / 12).toFixed(2)
                          );
                          setValue('basicPay', monthlyRate);

                          if (selectedShift) {
                            const workingHours = shiftsQuery.data?.message.find(
                              (i: any) => selectedShift == i.shiftId
                            ).workingHours;
                            const hourlyRate = parseFloat(
                              (dailyRate / workingHours).toFixed(2)
                            );
                            setValue('overtimeRateRegDays', hourlyRate * 1.25);
                            setValue('overtimeRateHolidays', hourlyRate * 1.69);
                            setValue('overtimeRateRestDays', hourlyRate * 1.69);
                          }

                          if (errors.basicPay && watch('basicPay') > 0) {
                            clearErrors('basicPay');
                          }
                          if (
                            errors.overtimeRateRegDays &&
                            watch('overtimeRateRegDays') > 0
                          ) {
                            clearErrors('overtimeRateRegDays');
                          }
                          if (
                            errors.overtimeRateHolidays &&
                            watch('overtimeRateHolidays') > 0
                          ) {
                            clearErrors('overtimeRateHolidays');
                          }
                          if (
                            errors.overtimeRateRestDays &&
                            watch('overtimeRateRestDays') > 0
                          ) {
                            clearErrors('overtimeRateRestDays');
                          }
                          setResettableGovtBenefitFields({
                            sssContributionRate: false,
                            sssERShareRate: false,
                            sssECShareRate: false,
                            philHealthContributionRate: false,
                            philHealthERShareRate: false,
                            pagIbigContributionRate: false,
                            pagIbigERShareRate: false,
                          });

                          const sssID = getValues().sssId;
                          const philHealthId = getValues().philHealthId;
                          const pagIbigId = getValues().pagIbigId;

                          // SSS
                          if (sssID) {
                            const sssContribRatePhp = 0.045 * monthlyRate;
                            setValue(
                              'sssContributionRate',
                              sssContribRatePhp > 900 ? 900 : sssContribRatePhp
                            );

                            const sssERShareRatePhp = 0.095 * monthlyRate;
                            setValue(
                              'sssERShareRate',
                              sssERShareRatePhp > 1900
                                ? 1900
                                : sssERShareRatePhp
                            );

                            const sssECShareRatePhp = 0.045 * monthlyRate;
                            setValue(
                              'sssECShareRate',
                              sssECShareRatePhp > 900 ? 900 : sssECShareRatePhp
                            );

                            setSSSEditable(true);
                          } else {
                            setValue('sssContributionRate', 0);
                            setValue('sssERShareRate', 0);
                            setValue('sssECShareRate', 0);
                            setSSSEditable(false);
                          }

                          // PHIL HEALTH
                          if (philHealthId) {
                            setValue(
                              'philHealthContributionRate',
                              0.02 * monthlyRate
                            );
                            setValue(
                              'philHealthERShareRate',
                              0.02 * monthlyRate
                            );
                            setPhilHealthEditable(true);
                          } else {
                            setValue('philHealthContributionRate', 0);
                            setValue('philHealthERShareRate', 0);
                            setPhilHealthEditable(false);
                          }

                          // PAG IBIG
                          if (pagIbigId) {
                            setValue('pagIbigERShareRate', 0.02 * monthlyRate);
                            if (monthlyRate < 1500) {
                              setValue(
                                'pagIbigContributionRate',
                                0.01 * monthlyRate
                              );
                            } else if (monthlyRate > 1500) {
                              setValue(
                                'pagIbigContributionRate',
                                0.02 * monthlyRate
                              );
                            }
                            setPagIbigEditable(true);
                          } else {
                            setValue('pagIbigERShareRate', 0);
                            setValue('pagIbigContributionRate', 0);
                            setPagIbigEditable(false);
                          }
                        }}
                        className={classNames({
                          'p-invalid': fieldState.error,
                        })}
                        minFractionDigits={2}
                      />
                    )}
                  />
                  {errors.dailyRate && (
                    <span className="text-red-600">
                      {errors.dailyRate.message}
                    </span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 my-5">
                <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto">
                  <label className="my-1">
                    {/* <span className="text-red-500">*</span> */}
                    <span>Overtime Rate for Regular Days (in PHP)</span>
                    <span className="mx-1">
                      <Tooltip target=".computation-info" />
                      <i
                        className="computation-info pi pi-info-circle p-text-secondary p-overlay-badge text-[17px]"
                        data-pr-tooltip="Hourly Rate x 1.25"
                        data-pr-position="right"
                        data-pr-at="right+5 top"
                        data-pr-my="left center-2"
                        style={{ cursor: 'pointer' }}
                      ></i>
                    </span>
                    {action != 'view' && (
                      <i
                        className={classNames({
                          'pi pi-file-edit text-yellow-500 pl-1 cursor-pointer':
                            !editOTRate.regDays,
                          'pi pi-save text-green-500 pl-1 cursor-pointer':
                            editOTRate.regDays,
                        })}
                        onClick={() =>
                          setEditOTRate((prev) => ({
                            ...prev,
                            regDays: !prev.regDays,
                          }))
                        }
                      />
                    )}
                  </label>
                  <Controller
                    name="overtimeRateRegDays"
                    control={control}
                    rules={{
                      // required: 'Overtime Rate for Regular Days is required.',
                      min: {
                        value: 0.0,
                        message: 'Overtime Rate for Regular Days is required.',
                      },
                    }}
                    render={({ field, fieldState }) => (
                      <InputNumber
                        min={0}
                        disabled={
                          isSubmitting ||
                          action == 'view' ||
                          (action != 'view' && editOTRate.regDays
                            ? false
                            : true)
                        }
                        maxFractionDigits={2}
                        ref={field.ref}
                        value={field.value}
                        onBlur={field.onBlur}
                        onChange={(e) => {
                          field.onChange(e.value);
                          if (getValues('overtimeRateRegDays') < 0) {
                            setError('overtimeRateRegDays', {
                              type: 'required',
                              message:
                                'Overtime Rate for Regular Days is required.',
                            });
                          } else {
                            clearErrors('overtimeRateRegDays');
                          }
                        }}
                        className={classNames({
                          'p-invalid': fieldState.error,
                        })}
                        minFractionDigits={2}
                      />
                    )}
                  />
                  {errors.overtimeRateRegDays && (
                    <span className="text-red-600">
                      {errors.overtimeRateRegDays.message}
                    </span>
                  )}
                </div>
                <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto">
                  <label className="my-1">
                    {/* <span className="text-red-500">*</span> */}
                    <span>Overtime Rate for Holidays (in PHP)</span>
                    <span className="mx-1">
                      <Tooltip target=".computation-info" />
                      <i
                        className="computation-info pi pi-info-circle p-text-secondary p-overlay-badge text-[17px]"
                        data-pr-tooltip="Hourly Rate x 1.69"
                        data-pr-position="right"
                        data-pr-at="right+5 top"
                        data-pr-my="left center-2"
                        style={{ cursor: 'pointer' }}
                      ></i>
                    </span>
                    {action != 'view' && (
                      <i
                        className={classNames({
                          'pi pi-file-edit text-yellow-500 pl-1 cursor-pointer':
                            !editOTRate.holidays,
                          'pi pi-save text-green-500 pl-1 cursor-pointer':
                            editOTRate.holidays,
                        })}
                        onClick={() =>
                          setEditOTRate((prev) => ({
                            ...prev,
                            holidays: !prev.holidays,
                          }))
                        }
                      />
                    )}
                  </label>
                  <Controller
                    name="overtimeRateHolidays"
                    control={control}
                    rules={{
                      // required: 'Overtime Rate for Holidays is required.',
                      min: {
                        value: 0.0,
                        message: 'Overtime Rate for Holidays is required.',
                      },
                    }}
                    render={({ field, fieldState }) => (
                      <InputNumber
                        min={0}
                        disabled={
                          isSubmitting ||
                          action == 'view' ||
                          (action != 'view' && editOTRate.holidays
                            ? false
                            : true)
                        }
                        ref={field.ref}
                        value={field.value}
                        onBlur={field.onBlur}
                        maxFractionDigits={2}
                        onChange={(e) => {
                          field.onChange(e.value);
                          if (getValues('overtimeRateHolidays') < 0) {
                            setError('overtimeRateHolidays', {
                              type: 'required',
                              message:
                                'Overtime Rate for Holidays is required.',
                            });
                          } else {
                            clearErrors('overtimeRateHolidays');
                          }
                        }}
                        className={classNames({
                          'p-invalid': fieldState.error,
                        })}
                        minFractionDigits={2}
                      />
                    )}
                  />
                  {errors.overtimeRateHolidays && (
                    <span className="text-red-600">
                      {errors.overtimeRateHolidays.message}
                    </span>
                  )}
                </div>
                <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto">
                  <label className="my-1">
                    {/* <span className="text-red-500">*</span> */}
                    <span>Overtime Rate for Working on Rest Days (in PHP)</span>
                    <span className="mx-1">
                      <Tooltip target=".computation-info" />
                      <i
                        className="computation-info pi pi-info-circle p-text-secondary p-overlay-badge text-[17px]"
                        data-pr-tooltip="Hourly Rate x 1.69"
                        data-pr-position="right"
                        data-pr-at="right+5 top"
                        data-pr-my="left center-2"
                        style={{ cursor: 'pointer' }}
                      ></i>
                    </span>
                    {action != 'view' && (
                      <i
                        className={classNames({
                          'pi pi-file-edit text-yellow-500 pl-1 cursor-pointer':
                            !editOTRate.restDays,
                          'pi pi-save text-green-500 pl-1 cursor-pointer':
                            editOTRate.restDays,
                        })}
                        onClick={() =>
                          setEditOTRate((prev) => ({
                            ...prev,
                            restDays: !prev.restDays,
                          }))
                        }
                      />
                    )}
                  </label>
                  <Controller
                    name="overtimeRateRestDays"
                    control={control}
                    rules={{
                      // required:
                      //   'Overtime Rate for Working on Rest Days is required.',
                      min: {
                        value: 0.0,
                        message:
                          'Overtime Rate for Working on Rest Days is required.',
                      },
                    }}
                    render={({ field, fieldState }) => (
                      <InputNumber
                        maxFractionDigits={2}
                        min={0}
                        disabled={
                          isSubmitting ||
                          action == 'view' ||
                          (action != 'view' && editOTRate.restDays
                            ? false
                            : true)
                        }
                        ref={field.ref}
                        value={field.value}
                        onBlur={field.onBlur}
                        onChange={(e) => {
                          field.onChange(e.value);
                          if (getValues('overtimeRateRestDays') < 0) {
                            setError('overtimeRateRestDays', {
                              type: 'required',
                              message:
                                'Overtime Rate for Working on Rest Days is required.',
                            });
                          } else {
                            clearErrors('overtimeRateRestDays');
                          }
                        }}
                        className={classNames({
                          'p-invalid': fieldState.error,
                        })}
                        minFractionDigits={2}
                      />
                    )}
                  />
                  {errors.overtimeRateRestDays && (
                    <span className="text-red-600">
                      {errors.overtimeRateRestDays.message}
                    </span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto">
                  <label className="my-1">
                    <span>Monthly Allowance Rate (in PHP)</span>
                  </label>
                  <Controller
                    name="monthlyAllowance"
                    control={control}
                    render={({ field, fieldState }) => (
                      <InputNumber
                        min={0}
                        disabled={
                          isSubmitting || action == 'view' || Boolean(allowanceBreakdown)
                        }
                        ref={field.ref}
                        value={field.value}
                        onBlur={field.onBlur}
                        onChange={(e) => {
                          if (e.value != null) {
                            let val: number = (e.value * 12) / workingDays;
                            setValue(
                              'allowance',
                              e.value <= 0 ? 0 : parseFloat(val.toFixed(2))
                            );
                          } else {
                            setValue('allowance', 0);
                          }

                          field.onChange(e.value);
                        }}
                        className={classNames({
                          'p-invalid': fieldState.error,
                        })}
                        minFractionDigits={2}
                        maxFractionDigits={2}
                      />
                    )}
                  />
                </div>
                <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto">
                  <label className="my-1">
                    <span>Daily Allowance Rate (in PHP) </span>
                    <span>
                      <span className="mx-1">
                        <Tooltip target=".allowance-info" position="left" />
                        <i
                          className="allowance-info pi pi-info-circle p-text-secondary p-overlay-badge text-[17px]"
                          data-pr-tooltip="(Monthly Allowance Rate x Total No. of Months) / Total Working Days of the Year"
                          data-pr-position="left"
                          data-pr-at="left-5 top"
                          // data-pr-my="left center-2"
                          style={{ cursor: 'pointer' }}
                        ></i>
                      </span>
                      {action != 'view' && !Boolean(allowanceBreakdown) && (
                        <i
                          className={classNames({
                            'pi pi-file-edit text-yellow-500 pl-1 cursor-pointer':
                              editDailyAllowanceRate,
                            'pi pi-save text-green-500 pl-1 cursor-pointer':
                              !editDailyAllowanceRate,
                          })}
                          onClick={() =>
                            setEditDailyAllowanceRate((prev) => !prev)
                          }
                        />
                      )}
                    </span>
                  </label>

                  <Controller
                    name="allowance"
                    control={control}
                    render={({ field, fieldState }) => (
                      <InputNumber
                        min={0}
                        disabled={
                          editDailyAllowanceRate ||
                          isSubmitting ||
                          action == 'view'
                        }
                        ref={field.ref}
                        value={field.value}
                        onBlur={field.onBlur}
                        onChange={(e) => {
                          if (e.value != null) {
                            let val = (e.value * workingDays) / 12;
                            setValue(
                              'monthlyAllowance',
                              e.value <= 0 ? 0 : parseFloat(val.toFixed(2))
                            );
                          } else {
                            setValue('monthlyAllowance', 0);
                          }
                          field.onChange(e.value);
                        }}
                        className={classNames({
                          'p-invalid': fieldState.error,
                        })}
                        minFractionDigits={2}
                      />
                    )}
                  />
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-center">
                  <Checkbox
                    disabled={action == 'view'}
                    inputId="ingredient1"
                    name="pizza"
                    value="allowanceBreakdown"
                    checked={Boolean(allowanceBreakdown)}
                    onChange={(e) => setAllowanceBreakdown(!Boolean(allowanceBreakdown))}
                  />
                  <label htmlFor="ingredient1" className="ml-2">
                    Allowance Breakdown
                  </label>
                </div>
              </div>
              {Boolean(allowanceBreakdown) === true && (
                <>
                  {action != 'view' && (
                    <>
                      <p className="text-[12px]">
                        (Please input allowance type and rate to add new item)
                      </p>
                      <div className="flex gap-3">
                        <div className="w-[300px] card flex justify-content-center flex-col text-[12px] mb-5">
                          <label className="my-1">
                            <span className="text-red-500">*</span>
                            <span>Allowance Type</span>
                          </label>
                          <InputText
                            value={newAllowanceBreakdownType}
                            className="w-full md:w-14rem"
                            disabled={isSubmitting || action == 'view'}
                            onChange={(e) =>
                              setNewAllowanceBreakdownType(e.target.value)
                            }
                          />
                          {/* {isTypeValidated &&
                          isStringEmpty(newAllowanceBreakdownType) && (
                            <span className="text-red-600">
                              Allowance Type is required.
                            </span>
                          )} */}
                          {newAllowanceBreakdownType.length >= 0 &&
                            checkDuplicateAllowanceType(
                              newAllowanceBreakdownType
                            ) && (
                              <span className="text-red-600">
                                Allowance Type already exists.
                              </span>
                            )}
                          {hasHtmlTags(newAllowanceBreakdownType) && (
                            <span className="text-red-600">
                              Allowance Type should not contain script tag/s.
                            </span>
                          )}
                          {hasSQLKeywords(newAllowanceBreakdownType) && (
                            <span className="text-red-600">
                              Allowance Type should not contain SQL keyword/s.
                            </span>
                          )}
                        </div>
                        <div className="w-[300px] card flex justify-content-center flex-col text-[12px] mb-5">
                          <label className="my-1">
                            <span className="text-red-500">*</span>
                            <span>Monthly Allowance Rate</span>
                          </label>
                          {/* <InputNumber
                      min={0}
                      disabled={
                        editDailyAllowanceRate ||
                        isSubmitting ||
                        action == 'view'
                      }
                      ref={field.ref}
                      value={field.value}
                      onBlur={field.onBlur}
                      onChange={(e) => {
                        if (e.value != null) {
                          let val = (e.value * workingDays) / 12;
                          setValue(
                            'monthlyAllowance',
                            e.value <= 0 ? 0 : parseFloat(val.toFixed(2))
                          );
                        }
                        field.onChange(e.value);
                      }}
                      className={classNames({
                        'p-invalid': fieldState.error,
                      })}
                      minFractionDigits={2}
                    /> */}
                          <InputNumber
                            className="w-full md:w-14rem"
                            disabled={isSubmitting || action == 'view'}
                            min={0}
                            max={9999}
                            value={newAllowanceBreakdownMonthlyRate}
                            onChange={(e) => {
                              if (e.value != null) {
                                setNewAllowanceBreakdownMonthlyRate(e.value);
                              } else {
                                setNewAllowanceBreakdownMonthlyRate(0);
                              }
                            }}
                            maxFractionDigits={2}
                            minFractionDigits={2}
                          />
                          {/* {isRateValidated &&
                          newAllowanceBreakdownMonthlyRate <= 0 && (
                            <span className="text-red-600">
                              Monthly Allowance Rate is required.
                            </span>
                          )} */}
                        </div>
                        <div className="w-auto card flex justify-content-center flex-col text-[12px] mb-5">
                          <label className="my-1">
                            <span className="text-red-500 opacity-0">*</span>
                          </label>
                          <Button
                            className="h-[42px] rounded-full"
                            type="button"
                            severity="secondary"
                            disabled={
                              newAllowanceBreakdownType.length <= 0 ||
                              checkDuplicateAllowanceType(
                                newAllowanceBreakdownType
                              ) ||
                              newAllowanceBreakdownMonthlyRate.toString() ==
                              '' ||
                              newAllowanceBreakdownMonthlyRate <= 0 ||
                              hasHtmlTags(newAllowanceBreakdownType) ||
                              hasSQLKeywords(newAllowanceBreakdownType) ||
                              hasHtmlTags(
                                newAllowanceBreakdownMonthlyRate.toString()
                              ) ||
                              hasSQLKeywords(
                                newAllowanceBreakdownMonthlyRate.toString()
                              )
                            }
                            onClick={(e) => {
                              e.preventDefault();
                              addNewAllowanceBreakdownItem();
                            }}
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                  <DataTable
                    id="employee-allowance-table"
                    className={`mb-5 ${action == 'view' && 'mt-5'}`}
                    value={allowanceBreakdownItems}
                    frozenWidth="95rem"
                    scrollable={true}
                    tableStyle={{ minWidth: '90rem' }}
                    size="small"
                    scrollHeight="650px"
                    selectionMode={'single'}
                    onSelectionChange={(e: any) => {
                      const index = allowanceBreakdownItems.indexOf(e.value);
                      // console.log(index);
                      setSelectedAllowanceRow(index);
                      // console.log(selectedAllowanceRow);
                      setIsSidebarOpen(true);
                      setAllowanceSidebarAction('view');
                    }}
                  >
                    <Column
                      field="allowanceType"
                      header="Allowance Type"
                      style={{ width: '40%', height: '59px' }}
                      body={(data) => {
                        return allowanceBreakdownItems.length == 0 ? (
                          <Skeleton />
                        ) : (
                          <>{data.type}</>
                        );
                      }}
                    />
                    <Column
                      field="amount"
                      header="Monthly Allowance Rate"
                      style={{ width: '25%' }}
                      body={(data) => {
                        return allowanceBreakdownItems.length == 0 ? (
                          <Skeleton />
                        ) : (
                          <>{data.monthlyRate.toFixed(2)}</>
                        );
                      }}
                    />
                    <Column
                      field="amount"
                      header="Daily Allowance Rate"
                      style={{ width: '25%' }}
                      body={(data) => {
                        return allowanceBreakdownItems.length == 0 ? (
                          <Skeleton />
                        ) : (
                          <>{data.dailyRate.toFixed(2)}</>
                        );
                      }}
                    />
                    {action != 'view' && (
                      <Column
                        field="amount"
                        header="Actions"
                        body={(data, index) => {
                          return allowanceBreakdownItems.length == 0 ? (
                            <Skeleton />
                          ) : (
                            <div className="flex-row flex">
                              <Button
                                type="button"
                                text
                                severity="secondary"
                                style={{ color: 'black' }}
                                icon="pi pi-file-edit"
                                tooltip="Edit"
                                tooltipOptions={{ position: 'top' }}
                                disabled={action == 'view'}
                                onClick={() => {
                                  setSelectedAllowanceRow(index.rowIndex);
                                  setIsSidebarOpen(true);
                                  setAllowanceSidebarAction('edit');
                                }}
                              />
                              <VDivider />
                              <Button
                                type="button"
                                text
                                severity="danger"
                                icon="pi pi-trash"
                                tooltip="Delete"
                                tooltipOptions={{ position: 'top' }}
                                disabled={action == 'view'}
                                onClick={() => {
                                  setSelectedAllowanceRow(index.rowIndex);
                                  setIsDeleteSidebarOpen(true);
                                }}
                              />
                            </div>
                          );
                        }}
                      />
                    )}
                  </DataTable>
                </>
              )}
              {selectedAllowanceRow != null && (
                <>
                  <AllowanceRowDeleteSidebar
                    configuration={{
                      isOpen: isDeleteSidebarOpen,
                      setIsOpen: setIsDeleteSidebarOpen,
                    }}
                    label={{
                      title: `Delete ${allowanceBreakdownItems[selectedAllowanceRow]?.type} allowance`,
                      buttonText: 'Are you sure you want to delete?',
                    }}
                    handleDelete={deleteAllowanceBreakdownItem}
                  />
                  <AllowanceBreakdownSidebar
                    configuration={{
                      action: allowanceSidebarAction,
                      isOpen: isSidebarOpen,
                      setIsOpen: setIsSidebarOpen,
                    }}
                    selectedRowIndex={selectedAllowanceRow}
                    setAllowanceBreakdownItems={setAllowanceBreakdownItems}
                    allowanceBreakdownItems={allowanceBreakdownItems}
                    checkDuplicateAllowanceType={checkDuplicateAllowanceType}
                    workingDays={workingDays}
                    checkDuplicateAllowanceTypeForEdit={
                      checkDuplicateAllowanceTypeForEdit
                    }
                  />
                </>
              )}
              <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                <label className="my-1">
                  <span>{`Reference files(any file type is accepted)`}:</span>
                </label>
                <ReferenceFileUpload
                  action={action}
                  data={referenceFiles}
                  getFileDetails={setReferenceFiles}
                />
              </div>
            </TabPanel>
            <TabPanel header="Government Information">
              <div className="grid grid-cols-2 gap-3 mt-5">
                <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                  <label className="my-1">
                    <span>SSS ID</span>
                  </label>
                  <InputText
                    className="w-full md:w-14rem"
                    disabled={isSubmitting || action == 'view'}
                    {...register('sssId', {
                      onChange: (e) => {
                        const value = e.target.value;
                        const monthly = getValues().basicPay;

                        if (value != '') {
                          if (getValues().sssContributionRate == 0) {
                            const sssContribRatePhp = 0.045 * monthly;
                            setValue(
                              'sssContributionRate',
                              sssContribRatePhp > 900 ? 900 : sssContribRatePhp
                            );
                          }

                          if (getValues().sssERShareRate == 0) {
                            const sssERShareRatePhp = 0.095 * monthly;
                            setValue(
                              'sssERShareRate',
                              sssERShareRatePhp > 1900
                                ? 1900
                                : sssERShareRatePhp
                            );
                          }

                          if (getValues().sssECShareRate == 0) {
                            const sssECShareRatePhp = 0.045 * monthly;
                            setValue(
                              'sssECShareRate',
                              sssECShareRatePhp > 900 ? 900 : sssECShareRatePhp
                            );
                          }
                          setSSSEditable(true);
                        } else {
                          setValue('sssContributionRate', 0);
                          setValue('sssERShareRate', 0);
                          setValue('sssECShareRate', 0);
                          setSSSEditable(false);

                          setDisabledGovtFields((prev: any) => ({
                            ...prev,
                            sssContributionRate: true,
                            sssERShareRate: true,
                            sssECShareRate: true,
                          }));

                          setResettableGovtBenefitFields((prev: any) => ({
                            ...prev,
                            sssContributionRate: false,
                            sssERShareRate: false,
                            sssECShareRate: false,
                          }));
                        }
                      },
                    })}
                  />
                </div>
              </div>
              <div className="grid items-center grid-cols-2 gap-3">
                <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                  <label className="my-1 flex gap-2">
                    <span>SSS EE Contribution Rate (in PHP)</span>
                    {sssEditable && action != 'view' && (
                      <i
                        className={classNames({
                          'pi pi-file-edit text-yellow-500 pl-1 cursor-pointer':
                            disabledGovtFields.sssContributionRate,
                          'pi pi-save text-green-500 pl-1 cursor-pointer':
                            !disabledGovtFields.sssContributionRate,
                        })}
                        onClick={() => {
                          setDisabledGovtFields((prev: any) => ({
                            ...prev,
                            sssContributionRate: !prev.sssContributionRate,
                          }));
                          if (getValues().sssContributionRate == null)
                            setValue('sssContributionRate', 0);
                        }}
                      />
                    )}
                  </label>
                  <Controller
                    name="sssContributionRate"
                    control={control}
                    render={({ field, fieldState }) => (
                      <InputNumber
                        min={0}
                        disabled={disabledGovtFields.sssContributionRate}
                        ref={field.ref}
                        value={field.value}
                        onBlur={field.onBlur}
                        onChange={(e) => {
                          field.onChange(e.value);
                          setResettableGovtBenefitFields((prev: any) => ({
                            ...prev,
                            sssContributionRate: true,
                          }));
                        }}
                        className={classNames({
                          'p-invalid': fieldState.error,
                        })}
                        minFractionDigits={2}
                      />
                    )}
                  />
                  {sssEditable &&
                    !resettableGovtBenefitFields.sssContributionRate && (
                      <span className="text-red-500">
                        Note: Capped at PHP 900.00
                      </span>
                    )}
                </div>
                {sssEditable && resettableGovtBenefitFields.sssContributionRate
                  ? action != 'view' && (
                    <div className="w-full text-[12px]">
                      <Button
                        label="RESET"
                        className="primary"
                        onClick={(e) => {
                          e.preventDefault();
                          const monthly = getValues().basicPay;
                          const sssContribRatePhp = 0.045 * monthly;
                          setValue(
                            'sssContributionRate',
                            sssContribRatePhp > 900 ? 900 : sssContribRatePhp
                          );
                          setResettableGovtBenefitFields((prev: any) => ({
                            ...prev,
                            sssContributionRate: false,
                          }));
                          setDisabledGovtFields((prev: any) => ({
                            ...prev,
                            sssContributionRate: true,
                          }));
                        }}
                      />
                    </div>
                  )
                  : sssEditable && (
                    <div className="w-full items-center gap-4 card flex justify-content-center text-[12px] flex-auto mb-4">
                      <strong>Computation: </strong> Fixed Rate (0.045) x
                      Basic Pay
                    </div>
                  )}
              </div>
              <div className="grid items-center grid-cols-2 gap-3">
                <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                  <label className="my-1 flex gap-2">
                    <span>SSS ER Share Rate (in PHP)</span>
                    {sssEditable && action != 'view' && (
                      <i
                        className={classNames({
                          'pi pi-file-edit text-yellow-500 pl-1 cursor-pointer':
                            disabledGovtFields.sssERShareRate,
                          'pi pi-save text-green-500 pl-1 cursor-pointer':
                            !disabledGovtFields.sssERShareRate,
                        })}
                        onClick={() => {
                          setDisabledGovtFields((prev: any) => ({
                            ...prev,
                            sssERShareRate: !prev.sssERShareRate,
                          }));
                          if (getValues().sssERShareRate == null)
                            setValue('sssERShareRate', 0);
                        }}
                      />
                    )}
                  </label>
                  <Controller
                    name="sssERShareRate"
                    control={control}
                    render={({ field, fieldState }) => (
                      <InputNumber
                        min={0}
                        disabled={disabledGovtFields.sssERShareRate}
                        ref={field.ref}
                        value={field.value}
                        onBlur={field.onBlur}
                        onChange={(e) => {
                          field.onChange(e.value);
                          setResettableGovtBenefitFields((prev: any) => ({
                            ...prev,
                            sssERShareRate: true,
                          }));
                        }}
                        className={classNames({
                          'p-invalid': fieldState.error,
                        })}
                        minFractionDigits={2}
                      />
                    )}
                  />
                  {sssEditable &&
                    !resettableGovtBenefitFields.sssERShareRate && (
                      <span className="text-red-500">
                        Note: Capped at PHP 1,900.00
                      </span>
                    )}
                </div>
                {sssEditable &&
                  action != 'view' &&
                  resettableGovtBenefitFields.sssERShareRate
                  ? action != 'view' && (
                    <div className="w-full text-[12px]">
                      <Button
                        label="RESET"
                        className="primary"
                        onClick={(e) => {
                          e.preventDefault();
                          const monthly = getValues().basicPay;
                          const sssERShareRatePhp = 0.095 * monthly;
                          setValue(
                            'sssERShareRate',
                            sssERShareRatePhp > 1900
                              ? 1900
                              : sssERShareRatePhp
                          );
                          setResettableGovtBenefitFields((prev: any) => ({
                            ...prev,
                            sssERShareRate: false,
                          }));
                          setDisabledGovtFields((prev: any) => ({
                            ...prev,
                            sssERShareRate: true,
                          }));
                        }}
                      />
                    </div>
                  )
                  : sssEditable && (
                    <div className="w-full items-center gap-4 card flex justify-content-center text-[12px] flex-auto mb-4">
                      <strong>Computation: </strong> Fixed Rate (0.095) x
                      Basic Pay
                    </div>
                  )}
              </div>
              <div className="grid items-center grid-cols-2 gap-3">
                <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                  <label className="my-1 flex gap-2">
                    SSS EC Share Rate (in PHP)
                    {sssEditable && action != 'view' && (
                      <i
                        className={classNames({
                          'pi pi-file-edit text-yellow-500 pl-1 cursor-pointer':
                            disabledGovtFields.sssECShareRate,
                          'pi pi-save text-green-500 pl-1 cursor-pointer':
                            !disabledGovtFields.sssECShareRate,
                        })}
                        onClick={() => {
                          setDisabledGovtFields((prev: any) => ({
                            ...prev,
                            sssECShareRate: !prev.sssECShareRate,
                          }));
                          if (getValues().sssECShareRate == null)
                            setValue('sssECShareRate', 0);
                        }}
                      />
                    )}
                  </label>
                  <Controller
                    name="sssECShareRate"
                    control={control}
                    render={({ field, fieldState }) => (
                      <InputNumber
                        min={0}
                        disabled={disabledGovtFields.sssECShareRate}
                        ref={field.ref}
                        value={field.value}
                        onBlur={field.onBlur}
                        onChange={(e) => {
                          field.onChange(e.value);
                          setResettableGovtBenefitFields((prev: any) => ({
                            ...prev,
                            sssECShareRate: true,
                          }));
                        }}
                        className={classNames({
                          'p-invalid': fieldState.error,
                        })}
                        minFractionDigits={2}
                      />
                    )}
                  />
                  {sssEditable &&
                    !resettableGovtBenefitFields.sssECShareRate && (
                      <span className="text-red-500">
                        Note: Capped at PHP 900.00
                      </span>
                    )}
                </div>
                {sssEditable && resettableGovtBenefitFields.sssECShareRate
                  ? action != 'view' && (
                    <div className="w-full text-[12px]">
                      <Button
                        label="RESET"
                        className="primary"
                        onClick={(e) => {
                          e.preventDefault();
                          const monthly = getValues().basicPay;
                          const sssECShareRatePhp = 0.045 * monthly;
                          setValue(
                            'sssECShareRate',
                            sssECShareRatePhp > 900 ? 900 : sssECShareRatePhp
                          );
                          setResettableGovtBenefitFields((prev: any) => ({
                            ...prev,
                            sssECShareRate: false,
                          }));
                          setDisabledGovtFields((prev: any) => ({
                            ...prev,
                            sssECShareRate: true,
                          }));
                        }}
                      />
                    </div>
                  )
                  : sssEditable && (
                    <div className="w-full items-center gap-4 card flex justify-content-center text-[12px] flex-auto mb-4">
                      <strong>Computation: </strong> Fixed Rate (0.045) x
                      Basic Pay
                    </div>
                  )}
              </div>
              <hr className="my-5" />
              <div className="grid grid-cols-2 gap-3 mt-5">
                <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                  <label className="my-1">
                    <span>Phil-Health ID</span>
                  </label>
                  <InputText
                    className="w-full md:w-14rem"
                    disabled={isSubmitting || action == 'view'}
                    {...register('philHealthId', {
                      onChange: (e) => {
                        const value = e.target.value;
                        const monthly = getValues().basicPay;

                        if (value != '') {
                          if (getValues().philHealthContributionRate == 0) {
                            setValue(
                              'philHealthContributionRate',
                              0.02 * monthly
                            );
                          }

                          if (getValues().philHealthERShareRate == 0) {
                            setValue('philHealthERShareRate', 0.02 * monthly);
                          }
                          setPhilHealthEditable(true);
                        } else {
                          setValue('philHealthContributionRate', 0);
                          setValue('philHealthERShareRate', 0);
                          setPhilHealthEditable(false);

                          setDisabledGovtFields((prev: any) => ({
                            ...prev,
                            philHealthContributionRate: true,
                            philHealthERShareRate: true,
                          }));

                          setResettableGovtBenefitFields((prev: any) => ({
                            ...prev,
                            philHealthContributionRate: false,
                            philHealthERShareRate: false,
                          }));
                        }
                      },
                    })}
                  />
                </div>
              </div>
              <div className="grid items-center grid-cols-2 gap-3">
                <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                  <label className="my-1 flex gap-2">
                    <span>Phil-health EE Contribution Rate (in PHP)</span>
                    {philHealthEditable && action != 'view' && (
                      <i
                        className={classNames({
                          'pi pi-file-edit text-yellow-500 pl-1 cursor-pointer':
                            disabledGovtFields.philHealthContributionRate,
                          'pi pi-save text-green-500 pl-1 cursor-pointer':
                            !disabledGovtFields.philHealthContributionRate,
                        })}
                        onClick={() => {
                          setDisabledGovtFields((prev: any) => ({
                            ...prev,
                            philHealthContributionRate:
                              !prev.philHealthContributionRate,
                          }));
                          if (getValues().philHealthContributionRate == null)
                            setValue('philHealthContributionRate', 0);
                        }}
                      />
                    )}
                  </label>
                  <Controller
                    name="philHealthContributionRate"
                    control={control}
                    render={({ field, fieldState }) => (
                      <InputNumber
                        min={0}
                        disabled={disabledGovtFields.philHealthContributionRate}
                        ref={field.ref}
                        value={field.value}
                        onBlur={field.onBlur}
                        onChange={(e) => {
                          field.onChange(e.value);
                          setResettableGovtBenefitFields((prev: any) => ({
                            ...prev,
                            philHealthContributionRate: true,
                          }));
                        }}
                        className={classNames({
                          'p-invalid': fieldState.error,
                        })}
                        minFractionDigits={2}
                      />
                    )}
                  />
                </div>
                {philHealthEditable &&
                  resettableGovtBenefitFields.philHealthContributionRate
                  ? action != 'view' && (
                    <div className="w-full">
                      <Button
                        label="RESET"
                        className="primary"
                        onClick={(e) => {
                          e.preventDefault();
                          const monthly = getValues().basicPay;
                          setValue(
                            'philHealthContributionRate',
                            0.02 * monthly
                          );
                          setResettableGovtBenefitFields((prev: any) => ({
                            ...prev,
                            philHealthContributionRate: false,
                          }));
                          setDisabledGovtFields((prev: any) => ({
                            ...prev,
                            philHealthContributionRate: true,
                          }));
                        }}
                      />
                    </div>
                  )
                  : philHealthEditable && (
                    <div className="w-full items-center gap-4 card flex justify-content-center text-[12px] flex-auto mb-4">
                      <strong>Computation: </strong> Fixed Rate (0.02) x Basic
                      Pay
                    </div>
                  )}
              </div>
              <div className="grid items-center grid-cols-2 gap-3">
                <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                  <label className="my-1 flex gap-2">
                    <span>Phil-health ER Share Rate (in PHP)</span>
                    {philHealthEditable && action != 'view' && (
                      <i
                        className={classNames({
                          'pi pi-file-edit text-yellow-500 pl-1 cursor-pointer':
                            disabledGovtFields.philHealthERShareRate,
                          'pi pi-save text-green-500 pl-1 cursor-pointer':
                            !disabledGovtFields.philHealthERShareRate,
                        })}
                        onClick={() => {
                          setDisabledGovtFields((prev: any) => ({
                            ...prev,
                            philHealthERShareRate: !prev.philHealthERShareRate,
                          }));
                          if (getValues().philHealthERShareRate == null)
                            setValue('philHealthERShareRate', 0);
                        }}
                      />
                    )}
                  </label>
                  <Controller
                    name="philHealthERShareRate"
                    control={control}
                    render={({ field, fieldState }) => (
                      <InputNumber
                        min={0}
                        disabled={disabledGovtFields.philHealthERShareRate}
                        ref={field.ref}
                        value={field.value}
                        onBlur={field.onBlur}
                        onChange={(e) => {
                          field.onChange(e.value);
                          setResettableGovtBenefitFields((prev: any) => ({
                            ...prev,
                            philHealthERShareRate: true,
                          }));
                        }}
                        className={classNames({
                          'p-invalid': fieldState.error,
                        })}
                        minFractionDigits={2}
                      />
                    )}
                  />
                </div>
                {philHealthEditable &&
                  resettableGovtBenefitFields.philHealthERShareRate
                  ? action != 'view' && (
                    <div className="w-full">
                      <Button
                        label="RESET"
                        className="primary"
                        onClick={(e) => {
                          e.preventDefault();
                          const monthly = getValues().basicPay;
                          setValue('philHealthERShareRate', 0.02 * monthly);
                          setResettableGovtBenefitFields((prev: any) => ({
                            ...prev,
                            philHealthERShareRate: false,
                          }));
                          setDisabledGovtFields((prev: any) => ({
                            ...prev,
                            philHealthERShareRate: true,
                          }));
                        }}
                      />
                    </div>
                  )
                  : philHealthEditable && (
                    <div className="w-full items-center gap-4 card flex justify-content-center text-[12px] flex-auto mb-4">
                      <strong>Computation: </strong> Fixed Rate (0.02) x Basic
                      Pay
                    </div>
                  )}
              </div>
              <hr className="my-5" />
              <div className="grid grid-cols-2 gap-3 mt-5">
                <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                  <label className="my-1">
                    <span>Pag-Ibig ID</span>
                  </label>
                  <InputText
                    className="w-full md:w-14rem"
                    disabled={isSubmitting || action == 'view'}
                    {...register('pagIbigId', {
                      onChange: (e) => {
                        const value = e.target.value;
                        const monthly = getValues().basicPay;

                        if (value != '') {
                          if (getValues().pagIbigERShareRate == 0) {
                            setValue('pagIbigERShareRate', 0.02 * monthly);
                          }

                          if (getValues().pagIbigContributionRate == 0) {
                            if (monthly <= 1500) {
                              setValue(
                                'pagIbigContributionRate',
                                0.01 * monthly
                              );
                            } else if (monthly > 1500) {
                              setValue(
                                'pagIbigContributionRate',
                                0.02 * monthly
                              );
                            }
                          }
                          setPagIbigEditable(true);
                        } else {
                          setValue('pagIbigERShareRate', 0);
                          setValue('pagIbigContributionRate', 0);
                          setPagIbigEditable(false);

                          setDisabledGovtFields((prev: any) => ({
                            ...prev,
                            pagIbigERShareRate: true,
                            pagIbigContributionRate: true,
                          }));

                          setResettableGovtBenefitFields((prev: any) => ({
                            ...prev,
                            pagIbigERShareRate: false,
                            pagIbigContributionRate: false,
                          }));
                        }
                      },
                    })}
                  />
                </div>
              </div>
              <div className="grid items-center grid-cols-2 gap-3">
                <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                  <label className="my-1 flex gap-2">
                    <span>Pag-ibig EE Contribution Rate (in PHP)</span>
                    {pagIbigEditable && action != 'view' && (
                      <i
                        className={classNames({
                          'pi pi-file-edit text-yellow-500 pl-1 cursor-pointer':
                            disabledGovtFields.pagIbigContributionRate,
                          'pi pi-save text-green-500 pl-1 cursor-pointer':
                            !disabledGovtFields.pagIbigContributionRate,
                        })}
                        onClick={() => {
                          setDisabledGovtFields((prev: any) => ({
                            ...prev,
                            pagIbigContributionRate:
                              !prev.pagIbigContributionRate,
                          }));
                          if (getValues().pagIbigContributionRate == null)
                            setValue('pagIbigContributionRate', 0);
                        }}
                      />
                    )}
                  </label>
                  <Controller
                    name="pagIbigContributionRate"
                    control={control}
                    render={({ field, fieldState }) => (
                      <InputNumber
                        min={0}
                        disabled={disabledGovtFields.pagIbigContributionRate}
                        ref={field.ref}
                        value={field.value}
                        onBlur={field.onBlur}
                        onChange={(e) => {
                          field.onChange(e.value);
                          setResettableGovtBenefitFields((prev: any) => ({
                            ...prev,
                            pagIbigContributionRate: true,
                          }));
                        }}
                        className={classNames({
                          'p-invalid': fieldState.error,
                        })}
                        minFractionDigits={2}
                      />
                    )}
                  />
                </div>
                {pagIbigEditable &&
                  resettableGovtBenefitFields.pagIbigContributionRate
                  ? action != 'view' && (
                    <div className="w-full">
                      <Button
                        label="RESET"
                        className="primary"
                        onClick={(e) => {
                          e.preventDefault();
                          const monthly = getValues().basicPay;
                          if (monthly <= 1500) {
                            setValue(
                              'pagIbigContributionRate',
                              0.01 * monthly
                            );
                          } else if (monthly > 1500) {
                            setValue(
                              'pagIbigContributionRate',
                              0.02 * monthly
                            );
                          }
                          setResettableGovtBenefitFields((prev: any) => ({
                            ...prev,
                            pagIbigContributionRate: false,
                          }));
                          setDisabledGovtFields((prev: any) => ({
                            ...prev,
                            pagIbigContributionRate: true,
                          }));
                        }}
                      />
                    </div>
                  )
                  : pagIbigEditable && (
                    <div className="w-full items-center gap-4 card flex justify-content-center text-[12px] flex-auto mb-4">
                      <strong>Computation: </strong> Fixed Rate (
                      {getValues().basicPay <= 1500 ? '0.01' : '0.02'}) x
                      Basic Pay
                    </div>
                  )}
              </div>
              <div className="grid items-center grid-cols-2 gap-3">
                <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                  <label className="my-1 flex gap-2">
                    <span>Pag-ibig ER Share Rate (in PHP)</span>
                    {pagIbigEditable && action != 'view' && (
                      <i
                        className={classNames({
                          'pi pi-file-edit text-yellow-500 pl-1 cursor-pointer':
                            disabledGovtFields.pagIbigERShareRate,
                          'pi pi-save text-green-500 pl-1 cursor-pointer':
                            !disabledGovtFields.pagIbigERShareRate,
                        })}
                        onClick={() => {
                          setDisabledGovtFields((prev: any) => ({
                            ...prev,
                            pagIbigERShareRate: !prev.pagIbigERShareRate,
                          }));
                          if (getValues().pagIbigERShareRate == null)
                            setValue('pagIbigERShareRate', 0);
                        }}
                      />
                    )}
                  </label>
                  <Controller
                    name="pagIbigERShareRate"
                    control={control}
                    render={({ field, fieldState }) => (
                      <InputNumber
                        min={0}
                        disabled={disabledGovtFields.pagIbigERShareRate}
                        ref={field.ref}
                        value={field.value}
                        onBlur={field.onBlur}
                        onChange={(e) => {
                          field.onChange(e.value);
                          setResettableGovtBenefitFields((prev: any) => ({
                            ...prev,
                            pagIbigERShareRate: true,
                          }));
                        }}
                        className={classNames({
                          'p-invalid': fieldState.error,
                        })}
                        minFractionDigits={2}
                      />
                    )}
                  />
                </div>
                {pagIbigEditable &&
                  resettableGovtBenefitFields.pagIbigERShareRate
                  ? action != 'view' && (
                    <div className="w-full">
                      <Button
                        label="RESET"
                        className="primary"
                        onClick={(e) => {
                          e.preventDefault();
                          const monthly = getValues().basicPay;
                          setValue('pagIbigERShareRate', 0.02 * monthly);
                          setResettableGovtBenefitFields((prev: any) => ({
                            ...prev,
                            pagIbigERShareRate: false,
                          }));
                          setDisabledGovtFields((prev: any) => ({
                            ...prev,
                            pagIbigERShareRate: true,
                          }));
                        }}
                      />
                    </div>
                  )
                  : pagIbigEditable && (
                    <div className="w-full items-center gap-4 card flex justify-content-center text-[12px] flex-auto mb-4">
                      <strong>Computation: </strong> Fixed Rate (0.02) x Basic
                      Pay
                    </div>
                  )}
              </div>
            </TabPanel>
            <TabPanel header="Leaves Details">
              <div className="grid lg:grid-cols-2 md:grid-cols-1 sm:grid-cols-1 gap-8">
                <div className="flex justify-between gap-2">
                  <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                    <label className="my-1">
                      <span>Vacation Leave Credits</span>
                    </label>
                    <Controller
                      name="vacationLeaveCredits"
                      control={control}
                      render={({ field, fieldState }) => (
                        <InputNumber
                          min={0}
                          disabled={isSubmitting || action == 'view'}
                          ref={field.ref}
                          value={field.value}
                          onBlur={field.onBlur}
                          onChange={(e) => field.onChange(e.value)}
                          className={classNames({
                            'p-invalid': fieldState.error,
                          })}
                        />
                      )}
                    />
                    {errors.vacationLeaveCredits && (
                      <span className="text-red-600">
                        {errors.vacationLeaveCredits.message}
                      </span>
                    )}
                  </div>
                  <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                    <label className="my-1">
                      <span>Vacation Leave Used</span>
                    </label>
                    <Controller
                      name="vacationLeaveUsed"
                      control={control}
                      render={({ field, fieldState }) => (
                        <InputNumber
                          min={0}
                          disabled
                          ref={field.ref}
                          value={field.value}
                          onBlur={field.onBlur}
                          onChange={(e) => field.onChange(e.value)}
                          className={classNames({
                            'p-invalid': fieldState.error,
                          })}
                        />
                      )}
                    />
                  </div>
                </div>
                <div className="flex justify-between gap-2">
                  <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                    <label className="my-1">
                      <span>Sick Leave Credits</span>
                    </label>
                    <Controller
                      name="sickLeaveCredits"
                      control={control}
                      render={({ field, fieldState }) => (
                        <InputNumber
                          min={0}
                          disabled={isSubmitting || action == 'view'}
                          ref={field.ref}
                          value={field.value}
                          onBlur={field.onBlur}
                          onChange={(e) => field.onChange(e.value)}
                          className={classNames({
                            'p-invalid': fieldState.error,
                          })}
                        />
                      )}
                    />
                    {errors.sickLeaveCredits && (
                      <span className="text-red-600">
                        {errors.sickLeaveCredits.message}
                      </span>
                    )}
                  </div>
                  <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                    <label className="my-1">
                      <span>Sick Leave Used</span>
                    </label>
                    <Controller
                      name="sickLeaveUsed"
                      control={control}
                      render={({ field, fieldState }) => (
                        <InputNumber
                          min={0}
                          disabled
                          ref={field.ref}
                          value={field.value}
                          onBlur={field.onBlur}
                          onChange={(e) => field.onChange(e.value)}
                          className={classNames({
                            'p-invalid': fieldState.error,
                          })}
                        />
                      )}
                    />
                  </div>
                </div>
                <div className="flex justify-between gap-2">
                  <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                    <label className="my-1">
                      <span>Service Incentive Leave Credits</span>
                    </label>
                    <Controller
                      name="serviceIncentiveLeaveCredits"
                      control={control}
                      render={({ field, fieldState }) => (
                        <InputNumber
                          min={0}
                          disabled={isSubmitting || action == 'view'}
                          ref={field.ref}
                          value={field.value}
                          onBlur={field.onBlur}
                          onChange={(e) => field.onChange(e.value)}
                          className={classNames({
                            'p-invalid': fieldState.error,
                          })}
                        />
                      )}
                    />
                    {errors.serviceIncentiveLeaveCredits && (
                      <span className="text-red-600">
                        {errors.serviceIncentiveLeaveCredits.message}
                      </span>
                    )}
                  </div>
                  <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                    <label className="my-1">
                      <span>Service Incentive Leave Used</span>
                    </label>
                    <Controller
                      name="serviceIncentiveLeaveUsed"
                      control={control}
                      render={({ field, fieldState }) => (
                        <InputNumber
                          min={0}
                          disabled
                          ref={field.ref}
                          value={field.value}
                          onBlur={field.onBlur}
                          onChange={(e) => field.onChange(e.value)}
                          className={classNames({
                            'p-invalid': fieldState.error,
                          })}
                        />
                      )}
                    />
                  </div>
                </div>
                <div className="flex justify-between gap-2">
                  <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                    <label className="my-1">
                      <span>Solo Parent Leave Credits</span>
                    </label>
                    <Controller
                      name="soloParentLeaveCredits"
                      control={control}
                      render={({ field, fieldState }) => (
                        <InputNumber
                          min={0}
                          disabled={isSubmitting || action == 'view'}
                          ref={field.ref}
                          value={field.value}
                          onBlur={field.onBlur}
                          onChange={(e) => field.onChange(e.value)}
                          className={classNames({
                            'p-invalid': fieldState.error,
                          })}
                        />
                      )}
                    />
                    {errors.soloParentLeaveCredits && (
                      <span className="text-red-600">
                        {errors.soloParentLeaveCredits.message}
                      </span>
                    )}
                  </div>
                  <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                    <label className="my-1">
                      <span>Solo Parent Leave Used</span>
                    </label>
                    <Controller
                      name="soloParentLeavesUsed"
                      control={control}
                      render={({ field, fieldState }) => (
                        <InputNumber
                          min={0}
                          disabled
                          ref={field.ref}
                          value={field.value}
                          onBlur={field.onBlur}
                          onChange={(e) => field.onChange(e.value)}
                          className={classNames({
                            'p-invalid': fieldState.error,
                          })}
                        />
                      )}
                    />
                  </div>
                </div>
                <div className="flex justify-between gap-2">
                  <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                    <label className="my-1">
                      <span>Paternity Leave Credits</span>
                    </label>
                    <Controller
                      name="paternityLeaveCredits"
                      control={control}
                      render={({ field, fieldState }) => (
                        <InputNumber
                          min={0}
                          disabled={isSubmitting || action == 'view'}
                          ref={field.ref}
                          value={field.value}
                          onBlur={field.onBlur}
                          onChange={(e) => field.onChange(e.value)}
                          className={classNames({
                            'p-invalid': fieldState.error,
                          })}
                        />
                      )}
                    />
                    {errors.paternityLeaveCredits && (
                      <span className="text-red-600">
                        {errors.paternityLeaveCredits.message}
                      </span>
                    )}
                  </div>
                  <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                    <label className="my-1">
                      <span>Paternity Leave Used</span>
                    </label>
                    <Controller
                      name="paternityLeavesUsed"
                      control={control}
                      render={({ field, fieldState }) => (
                        <InputNumber
                          min={0}
                          disabled
                          ref={field.ref}
                          value={field.value}
                          onBlur={field.onBlur}
                          onChange={(e) => field.onChange(e.value)}
                          className={classNames({
                            'p-invalid': fieldState.error,
                          })}
                        />
                      )}
                    />
                  </div>
                </div>
                <div className="flex justify-between gap-2">
                  <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                    <label className="my-1">
                      <span>Maternity Leave Credits</span>
                    </label>
                    <Controller
                      name="maternityLeaveCredits"
                      control={control}
                      render={({ field, fieldState }) => (
                        <InputNumber
                          min={0}
                          disabled={isSubmitting || action == 'view'}
                          ref={field.ref}
                          value={field.value}
                          onBlur={field.onBlur}
                          onChange={(e) => field.onChange(e.value)}
                          className={classNames({
                            'p-invalid': fieldState.error,
                          })}
                        />
                      )}
                    />
                    {errors.maternityLeaveCredits && (
                      <span className="text-red-600">
                        {errors.maternityLeaveCredits.message}
                      </span>
                    )}
                  </div>
                  <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                    <label className="my-1">
                      <span>Maternity Leave Used</span>
                    </label>
                    <Controller
                      name="maternityLeavesUsed"
                      control={control}
                      render={({ field, fieldState }) => (
                        <InputNumber
                          min={0}
                          disabled
                          ref={field.ref}
                          value={field.value}
                          onBlur={field.onBlur}
                          onChange={(e) => field.onChange(e.value)}
                          className={classNames({
                            'p-invalid': fieldState.error,
                          })}
                        />
                      )}
                    />
                  </div>
                </div>
                <div className="flex justify-between gap-2">
                  <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                    <label className="my-1">
                      <span>Emergency Leave Credits</span>
                    </label>
                    <Controller
                      name="emergencyLeaveCredits"
                      control={control}
                      render={({ field, fieldState }) => (
                        <InputNumber
                          min={0}
                          disabled={isSubmitting || action == 'view'}
                          ref={field.ref}
                          value={field.value}
                          onBlur={field.onBlur}
                          onChange={(e) => field.onChange(e.value)}
                          className={classNames({
                            'p-invalid': fieldState.error,
                          })}
                        />
                      )}
                    />
                    {errors.emergencyLeaveCredits && (
                      <span className="text-red-600">
                        {errors.emergencyLeaveCredits.message}
                      </span>
                    )}
                  </div>
                  <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                    <label className="my-1">
                      <span>Emergency Leave Used</span>
                    </label>
                    <Controller
                      name="emergencyLeavesUsed"
                      control={control}
                      render={({ field, fieldState }) => (
                        <InputNumber
                          min={0}
                          disabled
                          ref={field.ref}
                          value={field.value}
                          onBlur={field.onBlur}
                          onChange={(e) => field.onChange(e.value)}
                          className={classNames({
                            'p-invalid': fieldState.error,
                          })}
                        />
                      )}
                    />
                  </div>
                </div>
                <div className="flex justify-between gap-2">
                  <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                    <label className="my-1">
                      <span>Birthday Leave Credits</span>
                    </label>
                    <Controller
                      name="birthdayLeaveCredits"
                      control={control}
                      render={({ field, fieldState }) => (
                        <InputNumber
                          min={0}
                          disabled={isSubmitting || action == 'view'}
                          ref={field.ref}
                          value={field.value}
                          onBlur={field.onBlur}
                          onChange={(e) => field.onChange(e.value)}
                          className={classNames({
                            'p-invalid': fieldState.error,
                          })}
                        />
                      )}
                    />
                    {errors.birthdayLeaveCredits && (
                      <span className="text-red-600">
                        {errors.birthdayLeaveCredits.message}
                      </span>
                    )}
                  </div>
                  <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                    <label className="my-1">
                      <span>Birthday Leave Used</span>
                    </label>
                    <Controller
                      name="birthdayLeavesUsed"
                      control={control}
                      render={({ field, fieldState }) => (
                        <InputNumber
                          min={0}
                          disabled
                          ref={field.ref}
                          value={field.value}
                          onBlur={field.onBlur}
                          onChange={(e) => field.onChange(e.value)}
                          className={classNames({
                            'p-invalid': fieldState.error,
                          })}
                        />
                      )}
                    />
                  </div>
                </div>
                <div className="flex justify-between gap-2">
                  <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                    <label className="my-1">
                      <span>Other Leave Credits</span>
                    </label>
                    <Controller
                      name="otherLeaveCredits"
                      control={control}
                      render={({ field, fieldState }) => (
                        <InputNumber
                          min={0}
                          disabled={isSubmitting || action == 'view'}
                          ref={field.ref}
                          value={field.value}
                          onBlur={field.onBlur}
                          onChange={(e) => field.onChange(e.value)}
                          className={classNames({
                            'p-invalid': fieldState.error,
                          })}
                        />
                      )}
                    />
                    {errors.otherLeaveCredits && (
                      <span className="text-red-600">
                        {errors.otherLeaveCredits.message}
                      </span>
                    )}
                  </div>
                  <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                    <label className="my-1">
                      <span>Other Leave Used</span>
                    </label>
                    <Controller
                      name="otherLeavesUsed"
                      control={control}
                      render={({ field, fieldState }) => (
                        <InputNumber
                          min={0}
                          disabled
                          ref={field.ref}
                          value={field.value}
                          onBlur={field.onBlur}
                          onChange={(e) => field.onChange(e.value)}
                          className={classNames({
                            'p-invalid': fieldState.error,
                          })}
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            </TabPanel>
            <TabPanel header="Personal Information">
              <div className="grid grid-cols-4 gap-3">
                <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                  <label className="my-1">
                    <span className="text-red-500">*</span>
                    <span>Last Name</span>
                  </label>
                  <InputText
                    className="w-full md:w-14rem"
                    disabled={isSubmitting || action == 'view'}
                    {...register('lastName', {
                      required: 'Last Name is required.',
                      pattern: {
                        value: nameRE, // Regular expression to allow only alphanumeric characters and spaces
                        message: 'Last Name cannot contain special characters.',
                      },
                    })}
                    onChange={() => {
                      if (
                        errors.lastName &&
                        (watch('lastName') !== null ||
                          watch('lastName') !== undefined)
                      ) {
                        clearErrors('lastName');
                      }
                    }}
                  />
                  {errors.lastName && (
                    <span className="text-red-600">
                      {errors.lastName.message}
                    </span>
                  )}
                </div>
                <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                  <label className="my-1">
                    <span className="text-red-500">*</span>
                    <span>First Name</span>
                  </label>
                  <InputText
                    className="w-full md:w-14rem"
                    disabled={isSubmitting || action == 'view'}
                    {...register('firstName', {
                      required: 'First Name is required.',
                      pattern: {
                        value: nameRE, // Regular expression to allow only alphanumeric characters and spaces
                        message:
                          'First Name cannot contain special characters.',
                      },
                    })}
                    onChange={() => {
                      if (
                        errors.firstName &&
                        (watch('firstName') !== null ||
                          watch('firstName') !== undefined)
                      ) {
                        clearErrors('firstName');
                      }
                    }}
                  />
                  {errors.firstName && (
                    <span className="text-red-600">
                      {errors.firstName.message}
                    </span>
                  )}
                </div>
                <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                  <label className="my-1">
                    <span>Middle Name</span>
                  </label>
                  <InputText
                    className="w-full md:w-14rem"
                    disabled={isSubmitting || action == 'view'}
                    {...register('middleName', {
                      pattern: {
                        value: nameRE, // Regular expression to allow only alphanumeric characters and spaces
                        message:
                          'Middle Name cannot contain special characters.',
                      },
                    })}
                    onChange={() => {
                      if (
                        errors.middleName &&
                        (watch('middleName') !== null ||
                          watch('middleName') !== undefined)
                      ) {
                        clearErrors('middleName');
                      }
                    }}
                  />
                  {errors.middleName && (
                    <span className="text-red-600">
                      {errors.middleName.message}
                    </span>
                  )}
                </div>
                <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                  <span className="my-1">Suffix</span>
                  {/* <InputText
                    className="w-full md:w-14rem"
                    disabled={isSubmitting || action == 'view'}
                    {...register('suffix')}
                  /> */}
                  <Controller
                    name="suffix"
                    control={control}
                    render={({ field, fieldState }) => {
                      const val = field.value || '';
                      return (
                        <Dropdown
                          //
                          showClear={true}
                          ref={field.ref}
                          value={
                            val.includes('.')
                              ? val.replaceAll('.', '').toUpperCase()
                              : val.toLocaleUpperCase()
                          }
                          onBlur={field.onBlur}
                          onChange={(e) => {
                            field.onChange(e.value);
                            if (!e.value) {
                              setValue('suffix', '');
                            }
                          }}
                          options={[
                            { name: 'JR', value: 'JR' },
                            { name: 'JRA', value: 'JRA' },
                            { name: 'SR', value: 'SR' },
                            { name: 'I', value: 'I' },
                            { name: 'II', value: 'II' },
                            { name: 'III', value: 'III' },
                            { name: 'IV', value: 'IV' },
                            { name: 'V', value: 'V' },
                          ]}
                          optionLabel={'name'}
                          className="w-full md:w-14rem"
                          disabled={isSubmitting || action == 'view'}
                        />
                      )
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                  <label className="my-1">
                    <span className="text-red-500">*</span>
                    <span>Email Address</span>
                  </label>
                  <InputText
                    className="w-full md:w-14rem"
                    disabled={isSubmitting || action == 'view'}
                    {...register('emailAddress', {
                      required: 'Email Address is required.',
                      pattern: {
                        value:
                          /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                        message: 'Invalid Email Address format.',
                      },
                    })}
                    onChange={() => {
                      if (
                        errors.emailAddress &&
                        !emailRe.test(watch('emailAddress')) &&
                        (watch('emailAddress') !== null ||
                          watch('emailAddress') !== undefined)
                      ) {
                        clearErrors('emailAddress');
                      }
                    }}
                  />
                  {errors.emailAddress && (
                    <span className="text-red-600">
                      {errors.emailAddress.message}
                    </span>
                  )}
                </div>
                <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                  <label className="my-1">
                    <span className="text-red-500">*</span>
                    <Tooltip target=".change-mobile-no-info-icon" />
                    <span>
                      MCASH Mobile Number{' '}
                      {/* {action == 'edit' && (
                        <>
                          <i
                            className={
                              'change-mobile-no-info-icon pi pi-info-circle text-black pl-1'
                            }
                            data-pr-tooltip={`Changing phone number will reset employee's MCASH status to Pending`}
                            data-pr-position="bottom"
                          />
                          <i
                            className={classNames({
                              'pi pi-file-edit text-yellow-500 pl-1 cursor-pointer':
                                !editMobileNumber,
                              'pi pi-save text-green-500 pl-1 cursor-pointer':
                                editMobileNumber,
                            })}
                            onClick={() => {
                              setEditMobileNumber((prev) => !prev);
                            }}
                          />
                        </>
                      )}
                      {editMobileNumber && (
                        <i
                          className={classNames({
                            'pi pi-file-edit text-yellow-500 pl-1 cursor-pointer':
                              !editMobileNumber,
                            'pi pi-times text-red-500 pl-1 cursor-pointer':
                              editMobileNumber,
                          })}
                          onClick={() => {
                            setEditMobileNumber((prev) => !prev);
                            setValue(
                              'contactNumber',
                              rowData.employee_profile.contactNumber
                            );
                            clearErrors('contactNumber');
                          }}
                        />
                      )} */}
                    </span>
                  </label>
                  <InputText
                    className="w-full md:w-14rem"
                    disabled={isSubmitting || action == 'view'}
                    autoComplete="off"
                    maxLength={11}
                    {...register('contactNumber', {
                      required: 'MCASH Mobile Number is required.',
                      maxLength: 11,
                      pattern: {
                        value: /^[0-9\b]+$/,
                        message: 'Invalid Mobile number format.',
                      },
                      validate: {
                        getLength: (v) =>
                          v.length == 11 || 'Invalid Mobile number format.',
                        checkFormat: (v) =>
                          v.startsWith('09') || 'Invalid Mobile number format.',
                      },
                      onChange: (e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        setValue('contactNumber', value);
                        if (
                          errors.contactNumber &&
                          (watch('contactNumber') !== null ||
                            watch('contactNumber') !== undefined ||
                            watch('contactNumber') == '')
                        ) {
                          clearErrors('contactNumber');
                        }
                      },
                    })}
                  />
                  {errors.contactNumber && (
                    <span className="text-red-600">
                      {errors.contactNumber.message}
                    </span>
                  )}
                </div>
                <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                  <label className="my-1">
                    <span>Emergency Number #1</span>
                  </label>
                  <InputText
                    className="w-full md:w-14rem"
                    disabled={isSubmitting || action == 'view'}
                    autoComplete="off"
                    maxLength={11}
                    {...register('emergencyContactNumber1', {
                      maxLength: 11,
                      pattern: {
                        value: /^[0-9\b]+$/,
                        message: 'Invalid Mobile number format.',
                      },
                      validate: {
                        getLength: (v: any) => {
                          if (v && v != '')
                            return (
                              v.length == 11 || 'Invalid Mobile number format.'
                            );
                        },
                        checkFormat: (v: any) => {
                          if (v && v != '')
                            return (
                              v.startsWith('09') ||
                              'Invalid Mobile number format.'
                            );
                        },
                      },
                      onChange: (e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        setValue('emergencyContactNumber1', value);
                      },
                    })}
                  />
                  {errors.emergencyContactNumber1 && (
                    <span className="text-red-600">
                      {errors.emergencyContactNumber1.message}
                    </span>
                  )}
                </div>
                <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                  <label className="my-1">
                    <span>Emergency Number #2</span>
                  </label>
                  <InputText
                    className="w-full md:w-14rem"
                    disabled={isSubmitting || action == 'view'}
                    autoComplete="off"
                    maxLength={11}
                    {...register('emergencyContactNumber2', {
                      maxLength: 11,
                      pattern: {
                        value: /^[0-9\b]+$/,
                        message: 'Invalid Mobile number format.',
                      },
                      validate: {
                        getLength: (v: any) => {
                          if (v && v != '')
                            return (
                              v.length == 11 || 'Invalid Mobile number format.'
                            );
                        },
                        checkFormat: (v: any) => {
                          if (v && v != '')
                            return (
                              v.startsWith('09') ||
                              'Invalid Mobile number format.'
                            );
                        },
                      },
                      onChange: (e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        setValue('emergencyContactNumber2', value);
                      },
                    })}
                  />
                  {errors.emergencyContactNumber2 && (
                    <span className="text-red-600">
                      {errors.emergencyContactNumber2.message}
                    </span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                  <label className="my-1">
                    <span className="text-red-500">*</span>
                    <span>Street Address (Street Name, Barangay)</span>
                  </label>
                  <InputText
                    className="w-full md:w-14rem"
                    disabled={isSubmitting || action == 'view'}
                    {...register('streetAddress', {
                      required: 'Street Address is required.',
                    })}
                    onChange={() => {
                      if (
                        errors.streetAddress &&
                        (watch('streetAddress') !== null ||
                          watch('streetAddress') !== undefined ||
                          watch('streetAddress') == '')
                      ) {
                        clearErrors('streetAddress');
                      }
                    }}
                  />
                  {errors.streetAddress && (
                    <span className="text-red-600">
                      {errors.streetAddress.message}
                    </span>
                  )}
                </div>
                <div className="w-full col-span-2 card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                  <label className="my-1">
                    <span className="text-red-500">*</span>
                    <span>City, Province, Country</span>
                  </label>
                  <Controller
                    name="address"
                    control={control}
                    rules={{ required: 'City, Province, Country is required.' }}
                    render={({ field, fieldState }) => (
                      <Dropdown
                        filter
                        ref={field.ref}
                        value={field.value}
                        onBlur={field.onBlur}
                        onChange={(e) => {
                          field.onChange(e.value);
                          if (
                            errors.address &&
                            (watch('address') !== null ||
                              watch('address') !== undefined ||
                              watch('address') == '')
                          ) {
                            clearErrors('address');
                          }
                        }}
                        options={
                          addressQuery.isLoading
                            ? [{ name: 'Loading...' }]
                            : addressQuery.data?.data?.map((addr: any) => {
                              const obj: any = {};
                              obj.name = `${addr.name}, ${addr.province.name}, ${addr.province.country.name}`;
                              obj.value = `${addr.cityId}-${addr.province.provinceId}-${addr.province.country.countryId}`;
                              return obj;
                            })
                        }
                        optionLabel={'name'}
                        className="w-full md:w-14rem"
                        disabled={isSubmitting || action == 'view'}
                      />
                    )}
                  />
                  {errors.address && (
                    <span className="text-red-600">
                      {errors.address.message}
                    </span>
                  )}
                </div>
                <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                  <label className="my-1">
                    <span>Zip Code</span>
                  </label>
                  <Controller
                    name="zipCode"
                    control={control}
                    rules={{ maxLength: 4 }}
                    render={({ field, fieldState }) => (
                      <InputNumber
                        min={0}
                        useGrouping={false}
                        maxLength={4}
                        disabled={isSubmitting || action == 'view'}
                        ref={field.ref}
                        value={field.value}
                        onBlur={field.onBlur}
                        onChange={(e) => field.onChange(e.value)}
                        className={classNames({
                          'p-invalid': fieldState.error,
                        })}
                      />
                    )}
                  />
                  {errors.zipCode && (
                    <span className="text-red-600">
                      {errors.zipCode.message}
                    </span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <div className="w-full col-span-2 card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                  <label className="my-1">
                    <span className="text-red-500">*</span>
                    <span>Place of Birth</span>
                  </label>
                  <InputText
                    className="w-full md:w-14rem"
                    disabled={isSubmitting || action == 'view'}
                    {...register('placeOfBirth', {
                      required: 'Place of Birth is required.',
                    })}
                    onChange={(e) => {
                      if (
                        errors.placeOfBirth &&
                        (watch('placeOfBirth') !== null ||
                          watch('placeOfBirth') !== undefined ||
                          watch('placeOfBirth') == '')
                      ) {
                        clearErrors('placeOfBirth');
                      }
                    }}
                  />
                  {errors.placeOfBirth && (
                    <span className="text-red-600">
                      {errors.placeOfBirth.message}
                    </span>
                  )}
                </div>
                <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                  <label className="my-1">
                    <span className="text-red-500">*</span>
                    <span>Birthdate</span>
                  </label>
                  <Controller
                    name="birthDate"
                    control={control}
                    rules={{ required: 'Birthdate is required.' }}
                    render={({ field, fieldState }) => (
                      <Calendar
                        maxDate={
                          watch('modeOfPayroll') === 'MCASH'
                            ? todayMinus18years
                            : today
                        }
                        disabled={isSubmitting || action == 'view'}
                        ref={field.ref}
                        value={field.value}
                        onBlur={field.onBlur}
                        onChange={(e) => {
                          field.onChange(e.value);

                          if (
                            errors.birthDate &&
                            (watch('birthDate') !== null ||
                              watch('birthDate') !== undefined ||
                              watch('birthDate') == '')
                          ) {
                            clearErrors('birthDate');
                          }
                        }}
                        className={classNames({
                          'p-invalid': fieldState.invalid,
                        })}
                        dateFormat="mm/dd/yy"
                        showIcon
                      />
                    )}
                  />
                  {errors.birthDate && (
                    <span className="text-red-600">
                      {errors.birthDate.message}
                    </span>
                  )}
                </div>
                <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                  <label className="my-1">
                    <span className="text-red-500">*</span>
                    <span>Gender</span>
                  </label>
                  <Controller
                    name="gender"
                    control={control}
                    rules={{ required: 'Gender is required.' }}
                    render={({ field, fieldState }) => (
                      <Dropdown
                        value={field.value}
                        options={[
                          { name: 'Male', value: 'Male' },
                          { name: 'Female', value: 'Female' },
                        ]}
                        optionLabel={'name'}
                        onChange={(e) => {
                          field.onChange(e.value);

                          if (
                            errors.gender &&
                            (watch('gender') !== null ||
                              watch('gender') !== undefined ||
                              watch('gender') == '')
                          ) {
                            clearErrors('gender');
                          }
                        }}
                        required
                        className="w-full md:w-14rem"
                        disabled={isSubmitting || action == 'view'}
                      />
                    )}
                  />
                  {errors.gender && (
                    <span className="text-red-600">
                      {errors.gender.message}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                  <label className="my-1">
                    <span className="text-red-500">*</span>
                    <span>Civil Status</span>
                  </label>
                  <Controller
                    name="civilStatus"
                    control={control}
                    rules={{ required: 'Civil Status is required.' }}
                    render={({ field, fieldState }) => (
                      <Dropdown
                        value={field.value}
                        options={[
                          { name: 'Married', value: 'Married' },
                          { name: 'Single', value: 'Single' },
                          { name: 'Living Together', value: 'Living Together' },
                          { name: 'Separated', value: 'Separated' },
                          { name: 'Widowed', value: 'Widowed' },
                        ]}
                        optionLabel={'name'}
                        onChange={(e) => {
                          field.onChange(e.value);
                          if (
                            errors.civilStatus &&
                            (watch('civilStatus') !== null ||
                              watch('civilStatus') !== undefined ||
                              watch('civilStatus') == '')
                          ) {
                            clearErrors('civilStatus');
                          }
                        }}
                        required
                        className="w-full md:w-14rem"
                        disabled={isSubmitting || action == 'view'}
                      />
                    )}
                  />
                  {errors.civilStatus && (
                    <span className="text-red-600">
                      {errors.civilStatus.message}
                    </span>
                  )}
                </div>
                <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                  <label className="my-1">
                    <span className="text-red-500">*</span>
                    <span>Nationality</span>
                  </label>
                  <Controller
                    name="nationality"
                    control={control}
                    rules={{ required: 'Nationality is required.' }}
                    render={({ field, fieldState }) => (
                      <Dropdown
                        filter
                        value={field.value}
                        options={nationalities ? nationalities : []}
                        optionLabel={'name'}
                        onChange={(e) => {
                          field.onChange(e.value);
                          if (
                            errors.nationality &&
                            (watch('nationality') !== null ||
                              watch('nationality') !== undefined ||
                              watch('nationality') == '')
                          ) {
                            clearErrors('nationality');
                          }
                        }}
                        required
                        className="w-full md:w-14rem"
                        disabled={isSubmitting || action == 'view'}
                      />
                    )}
                  />
                  {errors.nationality && (
                    <span className="text-red-600">
                      {errors.nationality.message}
                    </span>
                  )}
                </div>
                <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                  <label className="my-1">
                    <span>Highest Educational Attainment</span>
                  </label>
                  <InputText
                    className="w-full md:w-14rem"
                    disabled={isSubmitting || action == 'view'}
                    {...register('educationalAttainment')}
                  />
                  {errors.educationalAttainment && (
                    <span className="text-red-600">
                      {errors.educationalAttainment.message}
                    </span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                  <label className="my-1">
                    <span>School Graduated</span>
                  </label>
                  <InputText
                    className="w-full md:w-14rem"
                    disabled={isSubmitting || action == 'view'}
                    {...register('schoolGraduated')}
                  />
                  {errors.schoolGraduated && (
                    <span className="text-red-600">
                      {errors.schoolGraduated.message}
                    </span>
                  )}
                </div>
                <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                  <label className="my-1">
                    <span>Course/Degree</span>
                  </label>
                  <InputText
                    className="w-full md:w-14rem"
                    disabled={isSubmitting || action == 'view'}
                    {...register('degree')}
                  />
                  {errors.degree && (
                    <span className="text-red-600">
                      {errors.degree.message}
                    </span>
                  )}
                </div>
              </div>
            </TabPanel>
          </TabView>
          <div className="relative h-[150px]">
            <div className="w-full flex justify-end px-4 my-[50px]">
              <div className="w-full flex justify-start">
                <div className="card flex justify-content-center flex-col md:flex-row gap-3">
                  <div className="card flex justify-content-center">
                    <Controller
                      name="isMonthlyRated"
                      control={control}
                      render={({ field, fieldState }) => (
                        <>
                          <label htmlFor={field.name}></label>
                          <InputSwitch
                            disabled={isSubmitting || action == 'view'}
                            checked={Boolean(field.value)}
                            ref={field.ref}
                            className={classNames('monthly-rated-switch', {
                              'p-invalid': fieldState.error,
                            })}
                            onChange={(e) => field.onChange(e.value)}
                          />
                        </>
                      )}
                    />
                    <span className="ml-5 mr-4 md:min-w-[150px]">
                      <div className="flex flex-row">
                        <div className=" min-w-[20px]">
                          {watch('isMonthlyRated')
                            ? 'Monthly Rated'
                            : 'Daily Rated'}
                          <Tooltip
                            target=".is-monthly-rated-switch"
                            position="left"
                          />
                        </div>
                        <i
                          className="is-monthly-rated-switch pi pi-info-circle p-text-secondary p-overlay-badge text-[17px] ml-1 mt-1"
                          data-pr-tooltip={`${watch('isMonthlyRated')
                              ? 'Toggle to switch to Daily Rated'
                              : 'Toggle to switch to Monthly Rated'
                            }`}
                          data-pr-position="right"
                          data-pr-at="right+5 top"
                          data-pr-my="left center-2"
                          style={{ cursor: 'pointer' }}
                        ></i>
                      </div>
                    </span>
                  </div>
                  <div className="card flex justify-content-center">
                    <Controller
                      name="applyWithholdingTax"
                      control={control}
                      render={({ field, fieldState }) => (
                        <>
                          <label htmlFor={field.name}></label>
                          <InputSwitch
                            disabled={isSubmitting || action == 'view'}
                            checked={Boolean(field.value)}
                            ref={field.ref}
                            className={classNames({
                              'p-invalid': fieldState.error,
                            })}
                            onChange={(e) => field.onChange(e.value)}
                          />
                        </>
                      )}
                    />{' '}
                    <span className="ml-5 mr-4 md:min-w-[150px]">
                      Apply Withholding Tax
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-full flex justify-start"></div>
              <div className="w-full flex justify-end">
                <Button
                  type="button"
                  severity="secondary"
                  text
                  label="Cancel"
                  className="rounded-full px-10 max-h-14"
                  onClick={() =>
                    setSideBarConfig((prev: any) => ({
                      ...prev,
                      isOpen: false,
                    }))
                  }
                />
                {submitBtnText && (
                  <Button
                    label={submitBtnText}
                    className="rounded-full px-10 p-button max-h-14"
                    ref={submitButtonRef}
                    // disabled={
                    //   (action == 'edit' && Object.keys(errors).length > 0) ||
                    //   isSubmitting ||
                    //   (action == 'add' &&
                    //     (!isDirty ||
                    //       !isValid ||
                    //       isSubmitting ||
                    //       Object.keys(errors).length > 0))
                    // }
                    onClick={handleSubmit(onSubmit)}
                  />
                )}
              </div>
            </div>
          </div>
        </form>
      </Sidebar>
    </>
  );

  function checkDuplicateAllowanceType(type: string) {
    for (const item of allowanceBreakdownItems) {
      if (item.type.toLowerCase() === type.toLowerCase()) {
        return true;
      }
    }

    return false;
  }
  function checkDuplicateAllowanceTypeForEdit(
    type: string,
    selectedRowIndex: any
  ) {
    // for (const item of allowanceBreakdownItems) {
    //   if (item.type.toLowerCase() === type.toLowerCase()) {
    //     return true;
    //   }
    // }
    let index = -1;
    let i = 0;
    for (i = 0; i < allowanceBreakdownItems.length; i++) {
      if (
        allowanceBreakdownItems[i].type.toLowerCase() === type.toLowerCase()
      ) {
        index = i;
        break;
      }
    }
    // console.log(selectedRowIndex);
    // console.log(index);
    if (index > -1 && index !== selectedRowIndex) {
      return true;
    }
    return false;
  }

  async function checkDuplicates({
    emailAddress,
    employeeCode,
    contactNumber,
    employeeId,
  }: {
    emailAddress: string;
    employeeCode: string;
    contactNumber: string;
    employeeId: string | null;
  }) {
    let countError = 0;

    const duplicateEM = await checkDuplicateEmailEmployee({
      emailAddress: emailAddress,
      employeeId: employeeId,
    });

    const duplicatePN = await checkDuplicateContactNumEmployee({
      contactNumber: contactNumber,
      employeeId: employeeId,
    });

    const duplicateEC = await checkDuplicateEmployeeCode({
      employeeCode: employeeCode,
      employeeId: employeeId,
    });

    if (duplicateEM) {
      toast.current?.replace({
        severity: 'error',
        detail: 'Email Address already taken.',
        life: 5000,
      });
      countError++;
      setError('emailAddress', {
        type: 'Duplicate',
        message: 'Email Address already exists.',
      });
    }
    if (duplicatePN) {
      toast.current?.replace({
        severity: 'error',
        detail: 'Contact Number already taken.',
        life: 5000,
      });
      countError++;
      setError('contactNumber', {
        type: 'Duplicate',
        message: 'Contact Number already exists.',
      });
    }
    if (duplicateEC) {
      toast.current?.replace({
        severity: 'error',
        detail: 'Employee Code already taken.',
        life: 5000,
      });
      countError++;
      setError('employeeCode', {
        type: 'Duplicate',
        message: 'Employee Code already exists.',
      });
    }
    return countError > 0 ? false : true;
  }
};

export default EmployeeSideBarForm;
