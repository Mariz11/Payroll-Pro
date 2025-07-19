import React, { useState, useEffect, useRef } from 'react';
import SideBar from 'lib/components/blocks/sideBar';
import { FormType } from '@enums/sidebar';
import { useQueries } from '@tanstack/react-query';
import { ButtonType } from '@enums/button';
import { Toast } from 'primereact/toast';
import axios from 'axios';
import { CSVLink } from 'react-csv';
import { directPayrollImportHeaders } from '@constant/csvData';
import { start } from 'repl';
import moment from '@constant/momentTZ';
import { set } from 'lodash';
import { getCycleDates, getWeeklyCycles } from '@utils/companyDetailsGetter';
import download from 'downloadjs';
import department from 'db/models/department';
import { Button } from 'primereact/button';
import { Chip } from 'primereact/chip';

const DirectPayrollDownloadSidebar = ({
  directPayroll,
  setDirectPayroll,
  departmentsQuery,
  setDirectPayrollData,
  setSelectedDepartmentName,
}: {
  directPayroll: boolean;
  setDirectPayroll: (v: boolean) => void;
  departmentsQuery: any;
  setDirectPayrollData: (v: any[]) => void;
  setSelectedDepartmentName: (v: string) => void;
}) => {
  const toast = useRef<Toast>(null);

  const [departmentOpts, setDepartmentOpts] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>([]);
  const [formDataDownload, setFormDataDownload] = useState<any>(null);
  const [departmentQueue, setDepartmentQueue] = useState<any>([]);
  const [cycleOpts, setCycleOpts] = useState<any>(null);
  const [downloadAttendance, setDownloadAttendance] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [payrollType, setPayrollType] = useState<any>(null);
  const [semiWeeklyDates, setSemiWeeklyDates] = useState<any>({
    startDate: new Date(),
    endDate: new Date(),
  });

  useEffect(() => {
    setSelectedDepartment(null);
    setFormDataDownload(null);
    setCycleOpts(null);
    setSemiWeeklyDates({
      startDate: new Date(),
      endDate: new Date(),
    });
  }, [directPayroll]);

  //  function to handle download payroll template with a department filter
  const handleDownloadTemplate = async () => {
    // console.log('formDataDownload', formDataDownload);
    setSelectedDepartmentName(
      `${moment(formDataDownload.businessMonth).format('MMMM')} ${moment(
        formDataDownload.businessMonth
      ).format('YYYY')}`
    );
    toast.current?.replace({
      severity: 'info',
      summary: 'Submitting request',
      detail: 'Please wait...',
      closable: false,
      sticky: true,
    });
    let cycle =
      formDataDownload.payrollType === 'SEMI-WEEKLY'
        ? '[' +
          (formDataDownload.startDate
            ? moment(formDataDownload.startDate).format('MM/DD/YYYY')
            : '') +
          '-' +
          (formDataDownload.endDate
            ? moment(formDataDownload.endDate).format('MM/DD/YYYY')
            : '') +
          ']'
        : formDataDownload.cycle;
    const departmentIds = selectedDepartment.map((i: any) => i.code);

    let done: any = [];
    let failed: any = [];
    let excluded: any = [];
    let noEmployees: any = [];
    // for (const formData of selectedDepartment) {
    //   await new Promise(async (resolve) => {

    try {
      const response = await axios.post(
        `/api/payrolls/directupload/download`,
        {
          selectedDepartmentIds: departmentIds,
          businessMonth: `${moment(formDataDownload.businessMonth).format(
            'MMMM'
          )} ${moment(formDataDownload.businessMonth).format('YYYY')}`,
          cycle: cycle,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
          },
        }
      );

      if (
        response.data.employees.length === 0 &&
        response.data.excludedEmployees.length === 0
      ) {
        noEmployees.push(response.data);
        // toast.current?.replace({
        //   severity: 'error',
        //   summary: `No active employees found for department ${formData.name}.`,
        //   closable: true,
        //   life: 5000,
        // });
      } else {
        setDirectPayrollData(
          response.data.employees.map((i: any) => {
            return {
              employeeCode: `=""${i.employeeCode}""`,
              // employeeCode: i.employeeCode,
              employeeFullName: i.employee_profile.employeeFullName,
              businessMonth: moment(formDataDownload.businessMonth).format(
                'MMMM'
              ),
              businessYear: moment(formDataDownload.businessMonth).format(
                'YYYY'
              ),
              cycle: cycle,
              daysWorked: 0,
              workingDays: 0,
              netPay: '0.00',
            };
          })
        );

        if (response.data.excludedEmployees.length > 0) {
          excluded.push(response.data.excludedEmployees);
          response.data.employees.length < 1
            ? noEmployees.push(response.data.employees)
            : '';
          // toast.current?.replace({
          //   severity: 'warn',
          //   summary:
          //     response.data.employees.length > 0
          //       ? 'Direct Payroll template downloaded successfully'
          //       : 'Download aborted. No employees found.',
          //   detail:
          //     response.data.employees.length > 0
          //       ? 'Employees that already have payroll are excluded.'
          //       : 'Employees have existing payrolls already.',
          //   life: 10000,
          //   closable: true,
          // });
        } else {
          done.push(response.data.employees);
          // toast.current?.replace({
          //   severity: 'success',
          //   summary: 'Direct Payroll template has been downloaded',
          //   closable: true,
          //   life: 5000,
          // });
        }
      }

      // Reset states as required after each department
      setFormDataDownload([]);
      setCycleOpts([]);
      setSemiWeeklyDates({
        startDate: new Date(),
        endDate: new Date(),
      });
    } catch (error) {
      console.error(`Error processing direct payroll:`, error);
      // failed.push(formData);
      toast.current?.replace({
        severity: 'error',
        summary: `Failed to process direct payroll.`,
        closable: true,
        life: 5000,
      });
    }

    //     setTimeout(() => {
    //       resolve(true);
    //     }, 2000);
    //   });
    // }
    if (excluded.length > 0) {
      toast.current?.replace({
        severity: 'warn',
        summary:
          noEmployees.length > 0
            ? `${noEmployees.length} downloads aborted. No employees found.`
            : 'Direct Payroll template downloaded successfully',
        detail: 'Employees that already have payroll are excluded.',
        // : 'Employees have existing payrolls already.',
        life: 10000,
        closable: true,
      });
    } else if (noEmployees.length > 0) {
      toast.current?.replace({
        severity: 'error',
        summary: `No active employees found.`,
        closable: true,
        life: 5000,
      });
    } else if (done.length > 0) {
      toast.current?.replace({
        severity: 'success',
        summary: 'Direct Payroll template has been downloaded',
        closable: true,
        life: 5000,
      });
    }
    setDirectPayroll(false);
  };

  // setting up department field options
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
  }, [departmentsQuery]);

  // function to handle download payroll template
  const onInputChangeDownload = async (fieldName: string, value: any) => {
    setIsDisabled(false);
    if (fieldName == 'departmentId') {
      setCycleOpts(null);

      // const departmentDetails = departmentOpts.find(
      //   (i: any) => i.code == value[value.length - 1].code
      // );
      if (value.length > 0) {
        setSelectedDepartment(value);
        setPayrollType(value[0].others.payroll_type);
      } else {
        setSelectedDepartment(null);
        setPayrollType(null);
      }

      // const departmentDetails = departmentOpts.find(
      //   (i: any) => i.code == value
      // );

      // setDepartmentQueue((prev: any) => [
      //   ...prev,
      //   {
      //     selectedDepartment: departmentDetails,
      //     selectedDepartmentName: departmentDetails.name,
      //     formDataDownload: { [fieldName]: value },
      //   },
      // ]);
      // console.log(departmentQueue);

      return setFormDataDownload({ [fieldName]: value });
    }

    setFormDataDownload((prev: any) => ({ ...prev, [fieldName]: value }));
    let startOfMonth: any = null;
    let endOfMonth: any = null;

    if (
      fieldName == 'businessMonth' &&
      formDataDownload &&
      formDataDownload.departmentId
    ) {
      if (payrollType && payrollType.type) {
        const { company_pay_cycles, type } =
          selectedDepartment[0].others.payroll_type;

        startOfMonth = moment(value).startOf('month');
        endOfMonth = startOfMonth.clone().endOf('month');

        setSemiWeeklyDates((prev: any) => ({
          ...prev,
          startDateMin: startOfMonth.toDate(),
          startDateMax: endOfMonth.toDate(),
        }));

        if (payrollType.type == 'WEEKLY') {
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
        // console.log(selectedDepartment);
        setSemiWeeklyDates((prev: any) => ({
          ...prev,
          endDateMin: startOfMonth.clone().add(1, 'day').toDate(),
          endDateMax: chosenEndDate,
        }));
        setFormDataDownload((prev: any) => ({
          ...prev,
          payrollType: type,
          // departmentName: selectedDepartment[value.length - 1].name,
          startDate: chosenStartDate,
          endDate: chosenEndDate,
          cycle: payrollType.company_pay_cycle,
        }));
      }
    }
  };

  return (
    <>
      <Toast ref={toast} position="bottom-left" />
      <SideBar
        configuration={{
          isOpen: directPayroll,
          setIsOpen: () => setDirectPayroll(false),
          isBulk: true,
        }}
        label={{ mainHeader: 'Direct Payroll' }}
        formDataDownload={formDataDownload}
        setFormDataDownload={setFormDataDownload}
        setSemiWeeklyDates={setSemiWeeklyDates}
        onInputChange={onInputChangeDownload}
        form={{
          forms: [
            {
              label: 'Choose Department',
              type: FormType.MultiSelect,
              name: 'departmentId',
              options:
                departmentOpts?.filter((dpt: any) => {
                  // catch the payroll type and compare
                  if (selectedDepartment && payrollType) {
                    return (
                      dpt.others.payroll_type.payrollTypeId ==
                      payrollType.payrollTypeId
                    );
                  }
                  return dpt;
                }) || [],
              value: selectedDepartment,
              placeholder: 'Choose Department',
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
            ...(payrollType != null && payrollType?.type == 'SEMI-WEEKLY'
              ? [
                  {
                    label: 'Start Date',
                    type: FormType.StartCalendar,
                    name: 'startDate',
                    value:
                      (formDataDownload && formDataDownload?.startDate) || '',
                    placeholder:
                      formDataDownload?.businessMonth && cycleOpts == null
                        ? 'Loading. Please wait...'
                        : 'Choose Start Date',
                    isVisible: true,
                    isRequired: false,
                    startDate: semiWeeklyDates.startDateMin,
                    endDate: semiWeeklyDates.startDateMax,
                    isDisabled: !formDataDownload?.businessMonth,
                  },
                  {
                    label: 'End Date',
                    type: FormType.EndCalendar,
                    name: 'endDate',
                    value:
                      (formDataDownload && formDataDownload?.endDate) || '',
                    placeholder:
                      formDataDownload?.businessMonth && cycleOpts == null
                        ? 'Loading. Please wait...'
                        : 'Choose Start Date',
                    isVisible: true,
                    startDate: semiWeeklyDates.endDateMin,
                    endDate: semiWeeklyDates.endDateMax,
                    isRequired: false,
                    isDisabled: !formDataDownload?.startDate,
                  },
                ]
              : [
                  {
                    label: 'Cycle',
                    type: FormType.Dropdown,
                    name: 'cycle',
                    value: formDataDownload && formDataDownload?.cycle,
                    options: cycleOpts,
                    placeholder:
                      formDataDownload?.businessMonth && cycleOpts == null
                        ? 'Loading. Please wait...'
                        : 'Choose Cycle',
                    isVisible: true,
                    isRequired: false,
                    isDisabled: false,
                  },
                ]),
          ],
          buttons: [
            {
              label: 'Cancel',
              type: ButtonType.Transparent,
              handler: () => setDirectPayroll(false),
            },
            {
              label: 'Download Template',
              type: ButtonType.Black,
              handler: () => handleDownloadTemplate(),
              isDisabled:
                !formDataDownload?.businessMonth ||
                (payrollType &&
                  ((payrollType.type != 'SEMI-WEEKLY' &&
                    !formDataDownload?.cycle) ||
                    (payrollType.type == 'SEMI-WEEKLY' &&
                      !formDataDownload?.startDate) ||
                    (payrollType.type == 'SEMI-WEEKLY' &&
                      !formDataDownload?.endDate))) ||
                isDisabled,
            },
          ],
        }}
      />

      {/* <CSVLink
        separator=","
        className="hidden"
        ref={downloadDirectPayrollTemplate}
        filename={`Direct Payroll Template-${new Date().getTime()}.csv`}
        headers={directPayrollImportHeaders}
        data={directPayrollData}
      /> */}
    </>
  );
};

export default DirectPayrollDownloadSidebar;
