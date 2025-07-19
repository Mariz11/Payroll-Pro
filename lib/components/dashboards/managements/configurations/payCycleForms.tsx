'use client';

import { ButtonType } from '@enums/button';
import { FormType } from '@enums/sidebar';
import DashboardNav from 'lib/components/blocks/dashboardNav';
import ReportsDasboardMenus from 'lib/components/blocks/reportsDasboardMenus';
import { InputText } from 'primereact/inputtext';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
import { Controller, useForm } from 'react-hook-form';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { useQueries } from '@tanstack/react-query';
import axios from 'axios';
import { MultiSelect } from 'primereact/multiselect';
import classNames from 'classnames';
import { InputNumber } from 'primereact/inputnumber';
import { RadioButton } from 'primereact/radiobutton';
import { Dialog } from 'primereact/dialog';
import { ProgressSpinner } from 'primereact/progressspinner';
import moment from '@constant/momentTZ';
import { Fieldset } from 'primereact/fieldset';
import { Divider } from 'primereact/divider';
import { Skeleton } from 'primereact/skeleton';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { VDivider } from 'lib/components/blocks/divider';
import WithholdingTaxTable from './withholdingTaxShieldTable';

const PayCycleForms = ({
  errors,
  setErrors,
  payCycleFormsData,
  setPayCycleFormsData,
  isSubmitted,
  setIsSubmitted,
}: {
  errors: any;
  setErrors: (v: any) => void;
  payCycleFormsData: any;
  setPayCycleFormsData: (v: any) => void;
  isSubmitted: any;
  setIsSubmitted: (v: any) => void;
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [payrollTypes, setPayrollTypes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [rowData, setRowData] = useState<any>([]);
  const [cycleToBeDeleted, setCycleToBeDeleted] = useState<any>(null);
  const [isShowDeleteDialog, setIsShowDeleteDialog] = useState(false);
  const toast = useRef<Toast>(null);

  const createId = (): string => {
    let id = '';
    let chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 5; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  };

  useEffect(() => {
    axios
      .get(`/api/departments/departments`, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
        },
      })
      .then((res: any) => {
        setDepartments(res.data && res.data.message);
      });

    axios
      .get(`/api/companies/payroll_types`, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
        },
      })
      .then((res: any) => {
        setPayrollTypes(res.data);
      });
  }, []);

  useEffect(() => {
    axios
      .get(`/api/companies/configurations`, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
        },
      })
      .then((res: any) => {
        const data = res.data;
        if (data.length > 0) {
          const DB_DATA = data.map((i: any) => {
            i.formId = i.payrollTypeId;
            i.departments = i.departments.map((j: any) => j.departmentId);
            return i;
          });
          setRowData(DB_DATA);

          setPayCycleFormsData(DB_DATA);
        } else {
          setRowData(data);

          setPayCycleFormsData(data);
        }
        setIsLoading(false);
      });

    if (isSubmitted) {
      setIsSubmitted(false);
    }
  }, [isSubmitted, setIsSubmitted, setPayCycleFormsData]);

  const handlePayCycleInputChange = (
    event: any,
    formIndex: number,
    cycleDetailsIndex?: number
  ) => {
    const forms = [...payCycleFormsData];
    const fieldName = event?.originalEvent?.target?.name || event?.target?.name;
    const fieldValue =
      event?.originalEvent?.target?.value || event?.target?.value;

    let form: any = { ...payCycleFormsData[formIndex] };

    if (cycleDetailsIndex != undefined) {
      if (
        fieldName == 'firstCycle' ||
        fieldName == 'secondCycle' ||
        fieldName == 'thirdCycle' ||
        fieldName == 'fourthCycle' ||
        fieldName == 'fifthCycle'
      ) {
        if (
          form.company_pay_cycles[cycleDetailsIndex][
            'deductibleContributions'
          ] == null
        ) {
          const obj: any = {};
          obj[fieldName] = fieldValue;
          form.company_pay_cycles[cycleDetailsIndex][
            'deductibleContributions'
          ] = obj;
        } else {
          form.company_pay_cycles[cycleDetailsIndex]['deductibleContributions'][
            fieldName
          ] = fieldValue;
        }
      } else {
        form.company_pay_cycles[cycleDetailsIndex][fieldName] = fieldValue;
      }
    } else if (fieldName == 'payrollTypeId') {
      form.type = event.originalEvent.target.textContent;
      form.payrollTypeId = fieldValue;

      const payCycleData = rowData.find(
        (o: any) => o.payrollTypeId == fieldValue
      );

      if (payCycleData) {
        form = { ...payCycleData };
      } else {
        form.departments = [];
        form.formId = createId();
        if (form.type == 'SEMI-MONTHLY') {
          form.company_pay_cycles = [
            {
              payCycleId: null,
              payrollTypeId: form.payrollTypeId,
              cycle: 'FIRST CYCLE',
              payDate: 0,
              cutOffStartDate: 0,
              cutOffEndDate: 0,
              preferredMonth: '',
              isApplyGovtBenefits: null,
              deductibleContributions: [],
            },
            {
              payCycleId: null,
              payrollTypeId: form.payrollTypeId,
              cycle: 'SECOND CYCLE',
              payDate: '',
              cutOffStartDate: 0,
              cutOffEndDate: 0,
              preferredMonth: '',
              isApplyGovtBenefits: null,
              deductibleContributions: [],
            },
          ];
          form.company_withholding_tax_shields = [
            {
              withholdingTaxShieldId: null,
              payrollTypeId: form.payrollTypeId,
              bracket: 1,
              from: 0,
              to: 10417,
              fixTaxAmount: 0,
              taxRateExcess: 0,
            },
            {
              withholdingTaxShieldId: null,
              payrollTypeId: form.payrollTypeId,
              bracket: 2,
              from: 10417,
              to: 16666,
              fixTaxAmount: 0,
              taxRateExcess: 15,
            },
            {
              withholdingTaxShieldId: null,
              payrollTypeId: form.payrollTypeId,
              bracket: 3,
              from: 16667,
              to: 33332,
              fixTaxAmount: 937.5,
              taxRateExcess: 20,
            },
            {
              withholdingTaxShieldId: null,
              payrollTypeId: form.payrollTypeId,
              bracket: 4,
              from: 33333,
              to: 83332,
              fixTaxAmount: 4270.7,
              taxRateExcess: 25,
            },
            {
              withholdingTaxShieldId: null,
              payrollTypeId: form.payrollTypeId,
              bracket: 5,
              from: 83333,
              to: 333332,
              fixTaxAmount: 16770.7,
              taxRateExcess: 30,
            },
            {
              withholdingTaxShieldId: null,
              payrollTypeId: form.payrollTypeId,
              bracket: 6,
              from: 333333,
              to: null,
              fixTaxAmount: 91770.7,
              taxRateExcess: 35,
            },
          ];
        } else if (form.type === 'SEMI-WEEKLY') {
          // say hi
          form.company_pay_cycles = [
            {
              payCycleId: null,
              payrollTypeId: form.payrollTypeId,
              cycle: form.type,
              payDate: 0,
              cutOffStartDate: 0,
              cutOffEndDate: 0,
              preferredMonth: '',
              isApplyGovtBenefits: false,
              deductibleContributions: null,
            },
          ];
          form.company_withholding_tax_shields = [];
        } else {
          form.company_pay_cycles = [
            {
              payCycleId: null,
              payrollTypeId: form.payrollTypeId,
              cycle: form.type,
              payDate: form.type == 'WEEKLY' ? '' : 0,
              cutOffStartDate: 0,
              cutOffEndDate: 0,
              preferredMonth: '',
              isApplyGovtBenefits: null,
              deductibleContributions: form.type == 'WEEKLY' ? {} : null,
            },
          ];
          form.company_withholding_tax_shields =
            form.type === 'WEEKLY'
              ? [
                  {
                    withholdingTaxShieldId: null,
                    payrollTypeId: form.payrollTypeId,
                    bracket: 1,
                    from: 0,
                    to: 4808,
                    fixTaxAmount: 0,
                    taxRateExcess: 0,
                  },
                  {
                    withholdingTaxShieldId: null,
                    payrollTypeId: form.payrollTypeId,
                    bracket: 2,
                    from: 4808,
                    to: 7691,
                    fixTaxAmount: 0,
                    taxRateExcess: 15,
                  },
                  {
                    withholdingTaxShieldId: null,
                    payrollTypeId: form.payrollTypeId,
                    bracket: 3,
                    from: 7692,
                    to: 15384,
                    fixTaxAmount: 432.6,
                    taxRateExcess: 20,
                  },
                  {
                    withholdingTaxShieldId: null,
                    payrollTypeId: form.payrollTypeId,
                    bracket: 4,
                    from: 15385,
                    to: 38461,
                    fixTaxAmount: 1971.2,
                    taxRateExcess: 25,
                  },
                  {
                    withholdingTaxShieldId: null,
                    payrollTypeId: form.payrollTypeId,
                    bracket: 5,
                    from: 38462,
                    to: 153845,
                    fixTaxAmount: 7740.45,
                    taxRateExcess: 30,
                  },
                  {
                    withholdingTaxShieldId: null,
                    payrollTypeId: form.payrollTypeId,
                    bracket: 6,
                    from: 153846,
                    to: null,
                    fixTaxAmount: 42355.65,
                    taxRateExcess: 35,
                  },
                ]
              : [
                  {
                    withholdingTaxShieldId: null,
                    payrollTypeId: form.payrollTypeId,
                    bracket: 1,
                    from: 0,
                    to: 20833,
                    fixTaxAmount: 0,
                    taxRateExcess: 0,
                  },
                  {
                    withholdingTaxShieldId: null,
                    payrollTypeId: form.payrollTypeId,
                    bracket: 2,
                    from: 20833,
                    to: 33332,
                    fixTaxAmount: 0,
                    taxRateExcess: 15,
                  },
                  {
                    withholdingTaxShieldId: null,
                    payrollTypeId: form.payrollTypeId,
                    bracket: 3,
                    from: 33333,
                    to: 66666,
                    fixTaxAmount: 1875.0,
                    taxRateExcess: 20,
                  },
                  {
                    withholdingTaxShieldId: null,
                    payrollTypeId: form.payrollTypeId,
                    bracket: 4,
                    from: 66667,
                    to: 166666,
                    fixTaxAmount: 8541.8,
                    taxRateExcess: 25,
                  },
                  {
                    withholdingTaxShieldId: null,
                    payrollTypeId: form.payrollTypeId,
                    bracket: 5,
                    from: 166667,
                    to: 666666,
                    fixTaxAmount: 33541.8,
                    taxRateExcess: 30,
                  },
                  {
                    withholdingTaxShieldId: null,
                    payrollTypeId: form.payrollTypeId,
                    bracket: 6,
                    from: 666667,
                    to: null,
                    fixTaxAmount: 183541.8,
                    taxRateExcess: 35,
                  },
                ];
        }
      }
    } else {
      form[fieldName] = fieldValue;
    }

    if (
      form.payrollTypeId != null &&
      form.departments.length > 0 &&
      errors &&
      errors.payCycleForms.data.length > 0
    ) {
      const filterErrors = errors.payCycleForms.data.filter(
        (i: any, index: number) => form.formIndex != index
      );
      setErrors((prev: any) => ({
        ...prev,
        payCycleForms: {
          data: filterErrors,
        },
      }));
    }

    forms[formIndex] = form;
    setPayCycleFormsData(forms);
  };

  return (
    <>
      <Toast ref={toast} position="bottom-left" />

      <div className="inline-flex items-center">
        <i className="pi pi-money-bill mr-2"></i>
        <p className="font-bold text-[18px]">Payroll Cycles Management</p>
      </div>

      {isLoading ? (
        <>
          <Skeleton height="2rem" width="10rem" />
          <Skeleton height="5rem" />
        </>
      ) : (
        payCycleFormsData &&
        payCycleFormsData.length > 0 &&
        payCycleFormsData.map((form: any, index: number) => (
          <Fieldset
            key={form.formId}
            legend={form.type}
            toggleable
            collapsed={form.type ? true : false}
          >
            <div className="bg-[#F2F3FE] border-[#E5E7EB] rounded-lg p-5 flex flex-col gap-5">
              <div className="flex justify-end">
                <button
                  className="text-gray-400"
                  title="Remove Pay Cycle"
                  onClick={() => {
                    const itemToBeDeleted = payCycleFormsData.find(
                      (i: any, pcIndex: number) => pcIndex == index
                    );
                    setCycleToBeDeleted(itemToBeDeleted);
                    setIsShowDeleteDialog(true);
                  }}
                >
                  <span className="pi pi-times" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-7 justify-between text-[12px]">
                <div>
                  <label className="font-bold">
                    <span className="text-red-500">*</span> Payroll Type
                  </label>
                  <Dropdown
                    value={form.payrollTypeId}
                    options={payrollTypes
                      .map((pt: any) => ({
                        name: pt.type,
                        value: pt.payrollTypeId,
                      }))
                      .filter((pt: any) => {
                        const otherForms = payCycleFormsData.filter(
                          (pf: any) => pf.formId != form.formId
                        );

                        const checkDuplicates = otherForms.filter(
                          (of: any) => of.payrollTypeId == pt.value
                        );

                        if (checkDuplicates.length > 0) {
                          return false;
                        } else {
                          return true;
                        }
                      })}
                    placeholder="- SELECT -"
                    optionLabel={'name'}
                    onChange={(e) => handlePayCycleInputChange(e, index)}
                    name="payrollTypeId"
                    required
                    className="w-full md:w-14rem"
                  />
                </div>
                <div>
                  <label className="font-bold">
                    <span className="text-red-500">*</span> Department
                  </label>
                  <MultiSelect
                    filter
                    display={'chip'}
                    value={form.departments}
                    options={departments
                      .filter((d: any) => {
                        const otherForms = payCycleFormsData.filter(
                          (pf: any) => pf.formId != form.formId
                        );

                        const checkDuplicates = otherForms.filter((of: any) =>
                          of.departments.includes(d.departmentId)
                        );

                        if (checkDuplicates.length > 0) {
                          return false;
                        } else {
                          return true;
                        }
                      })
                      .map((i: any) => ({
                        name: i.departmentName,
                        value: i.departmentId,
                      }))}
                    optionLabel={'name'}
                    placeholder="- SELECT -"
                    name="departments"
                    className="w-full md:w-14rem"
                    onChange={(e) => handlePayCycleInputChange(e, index)}
                  />
                </div>
              </div>
              <>
                {form.type == 'WEEKLY' ? (
                  <>
                    <React.Fragment>
                      {form.company_pay_cycles &&
                        form.company_pay_cycles.length > 0 &&
                        form.company_pay_cycles.map(
                          (cd: any, cdIndex: number) => (
                            <div key={cdIndex}>
                              <label className="text-[12px] font-bold">
                                <span className="text-red-500">*</span> Pay Day
                                (<span className="font-bold">Coverage:</span>{' '}
                                {moment(cd.payDate, 'dd')
                                  .subtract(6, 'days')
                                  .format('dddd')}{' '}
                                -{' '}
                                {moment(cd.payDate, 'dd')
                                  .subtract(1, 'days')
                                  .format('dddd')}
                                )
                              </label>
                              <div className="weekDays flex gap-2 flex-wrap">
                                <button
                                  type="button"
                                  className={classNames(
                                    'rounded-[6px] p-[42px] w-[140px]',
                                    {
                                      'bg-[#D61117] text-white':
                                        cd.payDate == 'SUNDAY',
                                      'bg-[#dddddd] text-black':
                                        cd.payDate != 'SUNDAY',
                                    }
                                  )}
                                  value="SUNDAY"
                                  name="payDate"
                                  onClick={(e) =>
                                    handlePayCycleInputChange(e, index, cdIndex)
                                  }
                                >
                                  SUN
                                </button>
                                <button
                                  type="button"
                                  className={classNames(
                                    'rounded-[6px] p-[42px] w-[140px]',
                                    {
                                      'bg-[#D61117] text-white':
                                        cd.payDate == 'MONDAY',
                                      'bg-[#dddddd] text-black':
                                        cd.payDate != 'MONDAY',
                                    }
                                  )}
                                  value="MONDAY"
                                  name="payDate"
                                  onClick={(e) =>
                                    handlePayCycleInputChange(e, index, cdIndex)
                                  }
                                >
                                  MON
                                </button>
                                <button
                                  type="button"
                                  className={classNames(
                                    'rounded-[6px] p-[42px] w-[140px]',
                                    {
                                      'bg-[#D61117] text-white':
                                        cd.payDate == 'TUESDAY',
                                      'bg-[#dddddd] text-black':
                                        cd.payDate != 'TUESDAY',
                                    }
                                  )}
                                  value="TUESDAY"
                                  name="payDate"
                                  onClick={(e) =>
                                    handlePayCycleInputChange(e, index, cdIndex)
                                  }
                                >
                                  TUE
                                </button>
                                <button
                                  type="button"
                                  className={classNames(
                                    'rounded-[6px] p-[42px] w-[140px]',
                                    {
                                      'bg-[#D61117] text-white':
                                        cd.payDate == 'WEDNESDAY',
                                      'bg-[#dddddd] text-black':
                                        cd.payDate != 'WEDNESDAY',
                                    }
                                  )}
                                  value="WEDNESDAY"
                                  name="payDate"
                                  onClick={(e) =>
                                    handlePayCycleInputChange(e, index, cdIndex)
                                  }
                                >
                                  WED
                                </button>
                                <button
                                  type="button"
                                  className={classNames(
                                    'rounded-[6px] p-[42px] w-[140px]',
                                    {
                                      'bg-[#D61117] text-white':
                                        cd.payDate == 'THURSDAY',
                                      'bg-[#dddddd] text-black':
                                        cd.payDate != 'THURSDAY',
                                    }
                                  )}
                                  value="THURSDAY"
                                  name="payDate"
                                  onClick={(e) =>
                                    handlePayCycleInputChange(e, index, cdIndex)
                                  }
                                >
                                  THU
                                </button>
                                <button
                                  type="button"
                                  className={classNames(
                                    'rounded-[6px] p-[42px] w-[140px]',
                                    {
                                      'bg-[#D61117] text-white':
                                        cd.payDate == 'FRIDAY',
                                      'bg-[#dddddd] text-black':
                                        cd.payDate != 'FRIDAY',
                                    }
                                  )}
                                  value="FRIDAY"
                                  name="payDate"
                                  onClick={(e) =>
                                    handlePayCycleInputChange(e, index, cdIndex)
                                  }
                                >
                                  FRI
                                </button>
                                <button
                                  type="button"
                                  className={classNames(
                                    'rounded-[6px] p-[42px] w-[140px]',
                                    {
                                      'bg-[#D61117] text-white':
                                        cd.payDate == 'SATURDAY',
                                      'bg-[#dddddd] text-black':
                                        cd.payDate != 'SATURDAY',
                                    }
                                  )}
                                  value="SATURDAY"
                                  name="payDate"
                                  onClick={(e) =>
                                    handlePayCycleInputChange(e, index, cdIndex)
                                  }
                                >
                                  SAT
                                </button>
                              </div>
                              <div className="flex flex-col text-[12px] mt-5">
                                <label className="font-bold">
                                  <span className="text-red-500">*</span> Apply
                                  Govt Benefits?
                                </label>
                                <Dropdown
                                  value={cd.isApplyGovtBenefits}
                                  name="isApplyGovtBenefits"
                                  options={[
                                    { name: 'YES', value: true },
                                    { name: 'NO', value: false },
                                  ]}
                                  placeholder="- SELECT -"
                                  optionLabel={'name'}
                                  onChange={(e) =>
                                    handlePayCycleInputChange(e, index, cdIndex)
                                  }
                                  required
                                  className="w-full max-w-[500px] md:w-14rem"
                                />
                              </div>
                              {cd.isApplyGovtBenefits && (
                                <>
                                  <div className="flex flex-col mt-5">
                                    <h2 className="font-bold">
                                      Deductible Contributions
                                    </h2>
                                  </div>
                                  <div className="flex flex-col text-[12px] mt-5">
                                    <label className="font-bold">
                                      First Cycle
                                    </label>
                                    <MultiSelect
                                      display={'chip'}
                                      name="firstCycle"
                                      value={
                                        cd.deductibleContributions &&
                                        cd.deductibleContributions.firstCycle
                                      }
                                      options={[
                                        {
                                          code: 'sssContributionRate',
                                          name: 'SSS Contribution',
                                        },
                                        {
                                          code: 'philHealthContributionRate',
                                          name: 'PhilHealth Contribution',
                                        },
                                        {
                                          code: 'pagIbigContributionRate',
                                          name: 'Pag-Ibig Contribution',
                                        },
                                      ]}
                                      onChange={(e) =>
                                        handlePayCycleInputChange(
                                          e,
                                          index,
                                          cdIndex
                                        )
                                      }
                                      optionLabel="name"
                                      className="w-full md:w-20rem"
                                    />
                                  </div>
                                  <div className="flex flex-col text-[12px] mt-5">
                                    <label className="font-bold">
                                      Second Cycle
                                    </label>
                                    <MultiSelect
                                      display={'chip'}
                                      name="secondCycle"
                                      value={
                                        cd.deductibleContributions &&
                                        cd.deductibleContributions.secondCycle
                                      }
                                      options={[
                                        {
                                          code: 'sssContributionRate',
                                          name: 'SSS Contribution',
                                        },
                                        {
                                          code: 'philHealthContributionRate',
                                          name: 'PhilHealth Contribution',
                                        },
                                        {
                                          code: 'pagIbigContributionRate',
                                          name: 'Pag-Ibig Contribution',
                                        },
                                      ]}
                                      onChange={(e) =>
                                        handlePayCycleInputChange(
                                          e,
                                          index,
                                          cdIndex
                                        )
                                      }
                                      optionLabel="name"
                                      className="w-full md:w-20rem"
                                    />
                                  </div>
                                  <div className="flex flex-col text-[12px] mt-5">
                                    <label className="font-bold">
                                      Third Cycle
                                    </label>
                                    <MultiSelect
                                      display={'chip'}
                                      name="thirdCycle"
                                      value={
                                        cd.deductibleContributions &&
                                        cd.deductibleContributions.thirdCycle
                                      }
                                      options={[
                                        {
                                          code: 'sssContributionRate',
                                          name: 'SSS Contribution',
                                        },
                                        {
                                          code: 'philHealthContributionRate',
                                          name: 'PhilHealth Contribution',
                                        },
                                        {
                                          code: 'pagIbigContributionRate',
                                          name: 'Pag-Ibig Contribution',
                                        },
                                      ]}
                                      onChange={(e) =>
                                        handlePayCycleInputChange(
                                          e,
                                          index,
                                          cdIndex
                                        )
                                      }
                                      optionLabel="name"
                                      className="w-full md:w-20rem"
                                    />
                                  </div>
                                  <div className="flex flex-col text-[12px] mt-5">
                                    <label className="font-bold">
                                      Fourth Cycle
                                    </label>
                                    <MultiSelect
                                      display={'chip'}
                                      name="fourthCycle"
                                      value={
                                        cd.deductibleContributions &&
                                        cd.deductibleContributions.fourthCycle
                                      }
                                      options={[
                                        {
                                          code: 'sssContributionRate',
                                          name: 'SSS Contribution',
                                        },
                                        {
                                          code: 'philHealthContributionRate',
                                          name: 'PhilHealth Contribution',
                                        },
                                        {
                                          code: 'pagIbigContributionRate',
                                          name: 'Pag-Ibig Contribution',
                                        },
                                      ]}
                                      onChange={(e) =>
                                        handlePayCycleInputChange(
                                          e,
                                          index,
                                          cdIndex
                                        )
                                      }
                                      optionLabel="name"
                                      className="w-full md:w-20rem"
                                    />
                                  </div>
                                  <div className="flex flex-col text-[12px] mt-5">
                                    <label className="font-bold">
                                      Fifth Cycle
                                    </label>
                                    <MultiSelect
                                      display={'chip'}
                                      name="fifthCycle"
                                      value={
                                        cd.deductibleContributions &&
                                        cd.deductibleContributions.fifthCycle
                                      }
                                      options={[
                                        {
                                          code: 'sssContributionRate',
                                          name: 'SSS Contribution',
                                        },
                                        {
                                          code: 'philHealthContributionRate',
                                          name: 'PhilHealth Contribution',
                                        },
                                        {
                                          code: 'pagIbigContributionRate',
                                          name: 'Pag-Ibig Contribution',
                                        },
                                      ]}
                                      onChange={(e) =>
                                        handlePayCycleInputChange(
                                          e,
                                          index,
                                          cdIndex
                                        )
                                      }
                                      optionLabel="name"
                                      className="w-full md:w-20rem"
                                    />
                                  </div>
                                </>
                              )}
                            </div>
                          )
                        )}
                    </React.Fragment>

                    <div className="bg-[#fff] border-[#dddddd] border-2 rounded-lg p-5 overflow-auto flex-1">
                      <div className="flex flex-col w-full gap-3">
                        <h5 className="font-bold">Withholding Tax Shield</h5>
                        <span className="text-sm">
                          BIR Tax Information reference:{' '}
                          <a
                            href="https://www.bir.gov.ph/index.php/tax-information/withholding-tax.html"
                            target="_blank"
                            className="text-blue-600 underline"
                          >
                            https://www.bir.gov.ph/index.php/tax-information/withholding-tax.html
                          </a>
                        </span>
                        <div>
                          <WithholdingTaxTable
                            withholdingTax={
                              form.company_withholding_tax_shields
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </>
                ) : form.type && form.type == 'SEMI-MONTHLY' ? (
                  <>
                    <div className="flex justify-between gap-10 flex-col 1.5xl:flex-row">
                      {form.company_pay_cycles &&
                        form.company_pay_cycles.length > 0 &&
                        form.company_pay_cycles
                          .sort((a: any, b: any) => a.payCycleId - b.payCycleId)
                          .map((cd: any, cdIndex: number) => (
                            <div
                              key={cdIndex}
                              className="bg-[#fff] border-[#dddddd] border-2 rounded-lg p-5 overflow-auto flex-1"
                            >
                              <div className="flex flex-col w-full">
                                <h5 className="font-bold">{cd.cycle}</h5>
                                <div className="flex flex-row gap-2">
                                  <div className="text-[12px] mt-5">
                                    <label className="font-bold">
                                      <span className="text-red-500">*</span>{' '}
                                      Pay Date
                                    </label>
                                    <InputNumber
                                      min={0}
                                      value={cd.payDate}
                                      name="payDate"
                                      max={31}
                                      placeholder="- SELECT -"
                                      onChange={(e: any) => {
                                        if (e.value > 31) return;
                                        handlePayCycleInputChange(
                                          e,
                                          index,
                                          cdIndex
                                        );
                                      }}
                                      required
                                      className="w-full md:w-14rem"
                                    />
                                  </div>
                                  <div className="text-[12px] mt-5">
                                    <label className="font-bold">
                                      <span className="text-red-500">*</span>{' '}
                                      Cut-off Start Date
                                    </label>
                                    <InputNumber
                                      min={0}
                                      value={cd.cutOffStartDate}
                                      name="cutOffStartDate"
                                      max={31}
                                      placeholder="- SELECT -"
                                      onChange={(e: any) => {
                                        if (e.value > 31) return;
                                        handlePayCycleInputChange(
                                          e,
                                          index,
                                          cdIndex
                                        );
                                      }}
                                      required
                                      className="w-full md:w-14rem"
                                    />
                                  </div>
                                  <div className="text-[12px] mt-5">
                                    <label className="font-bold">
                                      <span className="text-red-500">*</span>{' '}
                                      Cut-off End Date
                                    </label>
                                    <InputNumber
                                      min={0}
                                      value={cd.cutOffEndDate}
                                      name="cutOffEndDate"
                                      max={31}
                                      placeholder="- SELECT -"
                                      onChange={(e: any) => {
                                        if (e.value > 31) return;
                                        handlePayCycleInputChange(
                                          e,
                                          index,
                                          cdIndex
                                        );
                                      }}
                                      required
                                      className="w-full md:w-14rem"
                                    />
                                  </div>
                                </div>
                                <div className="flex justify-between gap-5">
                                  <div className="w-full text-[12px] mt-5">
                                    <label className="font-bold">
                                      <span className="text-red-500">*</span>{' '}
                                      Month of Cut-off Start Date
                                    </label>
                                    <Dropdown
                                      value={cd.preferredMonth}
                                      name="preferredMonth"
                                      options={[
                                        { name: 'PREVIOUS', value: 'PREVIOUS' },
                                        { name: 'CURRENT', value: 'CURRENT' },
                                      ]}
                                      placeholder="- SELECT -"
                                      optionLabel={'name'}
                                      onChange={(e) =>
                                        handlePayCycleInputChange(
                                          e,
                                          index,
                                          cdIndex
                                        )
                                      }
                                      required
                                      className="w-full md:w-14rem"
                                    />
                                  </div>
                                  <div className="w-full text-[12px] mt-5">
                                    <label className="font-bold">
                                      <span className="text-red-500">*</span>{' '}
                                      Apply Govt Benefits?
                                    </label>
                                    <Dropdown
                                      value={cd.isApplyGovtBenefits}
                                      name="isApplyGovtBenefits"
                                      options={[
                                        { name: 'YES', value: true },
                                        { name: 'NO', value: false },
                                      ]}
                                      placeholder="- SELECT -"
                                      optionLabel={'name'}
                                      onChange={(e) =>
                                        handlePayCycleInputChange(
                                          e,
                                          index,
                                          cdIndex
                                        )
                                      }
                                      required
                                      className="w-full md:w-14rem"
                                    />
                                  </div>
                                </div>
                                {cd.isApplyGovtBenefits && (
                                  <div className="w-full flex flex-col text-[12px] mt-5">
                                    <label className="font-bold">
                                      Deductible Contributions
                                    </label>
                                    <MultiSelect
                                      display={'chip'}
                                      name="deductibleContributions"
                                      value={cd.deductibleContributions}
                                      options={[
                                        {
                                          code: 'sssContributionRate',
                                          name: 'SSS Contribution',
                                        },
                                        {
                                          code: 'philHealthContributionRate',
                                          name: 'PhilHealth Contribution',
                                        },
                                        {
                                          code: 'pagIbigContributionRate',
                                          name: 'Pag-Ibig Contribution',
                                        },
                                      ]}
                                      onChange={(e) =>
                                        handlePayCycleInputChange(
                                          e,
                                          index,
                                          cdIndex
                                        )
                                      }
                                      optionLabel="name"
                                      className="w-full md:w-20rem"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                    </div>
                    <div className="bg-[#fff] border-[#dddddd] border-2 rounded-lg p-5 overflow-auto flex-1">
                      <div className="flex flex-col w-full gap-3">
                        <h5 className="font-bold">Withholding Tax Shield</h5>
                        <span className="text-sm">
                          BIR Tax Information reference:{' '}
                          <a
                            href="https://www.bir.gov.ph/index.php/tax-information/withholding-tax.html"
                            target="_blank"
                            className="text-blue-600 underline"
                          >
                            https://www.bir.gov.ph/index.php/tax-information/withholding-tax.html
                          </a>
                        </span>
                        <div>
                          <WithholdingTaxTable
                            withholdingTax={
                              form.company_withholding_tax_shields
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </>
                ) : form.type && form.type === 'MONTHLY' ? (
                  form.company_pay_cycles &&
                  form.company_pay_cycles.length > 0 &&
                  form.company_pay_cycles.map((cd: any, cdIndex: number) => (
                    <div key={cdIndex} className="flex flex-col gap-5">
                      <div className="bg-[#fff] border-[#dddddd] border-2 rounded-lg p-5 flex flex-col">
                        {/* <h5 className="font-bold">{cd.cycle}</h5> */}
                        <div className="flex flex-row gap-2">
                          <div className="text-[12px] mt-5">
                            <label className="font-bold">
                              <span className="text-red-500">*</span> Pay Date
                            </label>
                            <InputNumber
                              min={0}
                              value={cd.payDate}
                              name="payDate"
                              max={31}
                              placeholder="- SELECT -"
                              onChange={(e: any) => {
                                if (e.value > 31) return;
                                handlePayCycleInputChange(e, index, cdIndex);
                              }}
                              required
                              className="w-full md:w-14rem"
                            />
                          </div>
                          <div className="text-[12px] mt-5">
                            <label className="font-bold">
                              <span className="text-red-500">*</span> Cut-off
                              Start Date
                            </label>
                            <InputNumber
                              min={0}
                              value={cd.cutOffStartDate}
                              name="cutOffStartDate"
                              max={31}
                              placeholder="- SELECT -"
                              onChange={(e: any) => {
                                if (e.value > 31) return;
                                handlePayCycleInputChange(e, index, cdIndex);
                              }}
                              required
                              className="w-full md:w-14rem"
                            />
                          </div>
                          <div className="text-[12px] mt-5">
                            <label className="font-bold">
                              <span className="text-red-500">*</span> Cut-off
                              End Date
                            </label>
                            <InputNumber
                              min={0}
                              value={cd.cutOffEndDate}
                              name="cutOffEndDate"
                              max={31}
                              placeholder="- SELECT -"
                              onChange={(e: any) => {
                                if (e.value > 31) return;
                                handlePayCycleInputChange(e, index, cdIndex);
                              }}
                              required
                              className="w-full md:w-14rem"
                            />
                          </div>
                        </div>
                        <div className="flex gap-5">
                          <div className="text-[12px] mt-5">
                            <label className="font-bold">
                              <span className="text-red-500">*</span> Month of
                              Cut-off Start Date
                            </label>
                            <Dropdown
                              value={cd.preferredMonth}
                              name="preferredMonth"
                              options={[
                                { name: 'PREVIOUS', value: 'PREVIOUS' },
                                { name: 'CURRENT', value: 'CURRENT' },
                              ]}
                              placeholder="- SELECT -"
                              optionLabel={'name'}
                              onChange={(e) =>
                                handlePayCycleInputChange(e, index, cdIndex)
                              }
                              required
                              className="w-full md:w-14rem"
                            />
                          </div>
                          <div className="text-[12px] mt-5">
                            <label className="font-bold">
                              <span className="text-red-500">*</span> Apply Govt
                              Benefits?
                            </label>
                            <Dropdown
                              value={cd.isApplyGovtBenefits}
                              name="isApplyGovtBenefits"
                              options={[
                                { name: 'YES', value: true },
                                { name: 'NO', value: false },
                              ]}
                              placeholder="- SELECT -"
                              optionLabel={'name'}
                              onChange={(e) =>
                                handlePayCycleInputChange(e, index, cdIndex)
                              }
                              required
                              className="w-full md:w-14rem"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="bg-[#fff] border-[#dddddd] border-2 rounded-lg p-5 overflow-auto flex-1">
                        <div className="flex flex-col w-full gap-3">
                          <h5 className="font-bold">Withholding Tax Shield</h5>
                          <span className="text-sm">
                            BIR Tax Information reference:{' '}
                            <a
                              href="https://www.bir.gov.ph/index.php/tax-information/withholding-tax.html"
                              target="_blank"
                              className="text-blue-600 underline"
                            >
                              https://www.bir.gov.ph/index.php/tax-information/withholding-tax.html
                            </a>
                          </span>
                          <div>
                            <WithholdingTaxTable
                              withholdingTax={
                                form.company_withholding_tax_shields
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  // semi-weekly
                  <></>
                )}
              </>
              {errors &&
                errors.payCycleForms.data.some(
                  (i: any) => i.formId == form.formId
                ) && (
                  <span className="text-red-500 text-xs">
                    {errors.payCycleForms.message}
                  </span>
                )}
            </div>
          </Fieldset>
        ))
      )}

      <Button
        type="button"
        text
        icon="pi pi-plus text-[30px] font-bold text-[#009F10]"
        tooltip="Add Pay Cycle"
        tooltipOptions={{ position: 'bottom' }}
        onClick={(e) => {
          const initialData = {
            formId: createId(),
            type: '',
            payrollTypeId: null,
            departments: [],
            company_pay_cycles: [],
            withholdingTaxShield: [],
          };
          const items = [...payCycleFormsData];
          items.push(initialData);
          setPayCycleFormsData(items);
        }}
        style={{
          background: '#F2F3FE',
          borderColor: '#E5E7EB',
          display: 'block',
          width: '100%',
          padding: '20px',
        }}
      />

      <Dialog
        visible={isShowDeleteDialog}
        style={{ width: '32rem' }}
        breakpoints={{ '960px': '75vw', '641px': '90vw' }}
        header="Delete Confirmation"
        modal
        footer={
          <React.Fragment>
            <Button
              label="No"
              icon="pi pi-times"
              outlined
              className="rounded-full px-10 p-button"
              onClick={() => setIsShowDeleteDialog(false)}
            />
            <Button
              label="Yes"
              icon="pi pi-check"
              className="rounded-full px-10 p-button"
              onClick={() => {
                axios
                  .delete(`/api/companies/configurations`, {
                    data: cycleToBeDeleted,
                    headers: {
                      Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
                    },
                  })
                  .then((res: any) => {
                    toast.current?.replace({
                      severity: res.data.success ? 'success' : 'error',
                      summary: res.data.message,
                      life: 3000,
                    });
                    setIsShowDeleteDialog(false);

                    const newPayCycleFormsData = payCycleFormsData.filter(
                      (i: any, index: number) =>
                        i.formId != cycleToBeDeleted.formId
                    );
                    setPayCycleFormsData(newPayCycleFormsData);
                  });
              }}
            />
          </React.Fragment>
        }
        onHide={() => setIsShowDeleteDialog(false)}
      >
        <div className="flex confirmation-content items-center my-5">
          <i
            className="pi pi-exclamation-triangle mr-3"
            style={{ fontSize: '2rem' }}
          />
          <span>Are you sure you want to delete?</span>
        </div>
      </Dialog>
    </>
  );
};

export default PayCycleForms;
