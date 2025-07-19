import React, { useEffect, useState } from 'react';

import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Password } from 'primereact/password';
import { Sidebar } from 'primereact/sidebar';
import { parseTimeStringToDate } from '@utils/dashboardFunction';
import moment from '@constant/momentTZ';
import classNames from 'classnames';
import { MultiSelect } from 'primereact/multiselect';

function SideBar({
  configuration: { isOpen, setIsOpen, isBulk },
  label: { mainHeader, header, subHeader },
  form: { forms, buttons },
  onInputChange,
  setSemiWeeklyDates,
  formDataDownload,
  setFormDataDownload,
}: {
  configuration: Configuration;
  label: Label;
  form: Forms;
  onInputChange?: any;
  setSemiWeeklyDates?: (semiWeeklyDates: any) => void;
  formDataDownload?: any;
  setFormDataDownload?: any;
}) {
  // useEffect(() => {

  // }, [forms]);

  return (
    <Sidebar
      position="right"
      className="p-sidebar-md"
      visible={isOpen}
      onHide={() => setIsOpen(false)}
    >
      <React.Fragment>
        <h1 className="text-black font-medium text-3xl">{mainHeader}</h1>
        <p className="my-1 font-light">{header}</p>
        <h3 className="font-medium mt-5">{subHeader}</h3>
      </React.Fragment>

      <div className="flex flex-col items-start gap-3 mt-4">
        {/* FORMS */}
        {forms.map((formData, index) => {
          switch (formData.type) {
            case 'Calendar':
              return (
                <div
                  key={index}
                  className="w-full card flex justify-content-center flex-col text-[12px] flex-auto"
                >
                  <span className="my-1">{formData.label}</span>
                  <Calendar
                    value={formData.value}
                    onChange={(e) => {
                      onInputChange(formData.name, e.value);
                    }}
                    placeholder={formData.placeholder}
                    // view="month"
                    // dateFormat="MM yy"
                    showIcon
                  />
                </div>
              );

            case 'StartCalendar':
              return (
                <div
                  key={index}
                  className="w-full card flex justify-content-center flex-col text-[12px] flex-auto"
                >
                  <span className="my-1">{formData.label}</span>
                  <Calendar
                    value={formData.value}
                    onChange={(e) => {
                      const endDateForm = forms[index + 1];
                      const formattedValue = moment(e.value as Date);
                      if (e.value && endDateForm.value < e.value) {
                        setFormDataDownload((prev: any) => ({
                          ...prev,
                          endDate: formattedValue
                            .clone()
                            .add(1, 'day')
                            .toDate(),
                        }));
                      }
                      const startDatePlusThreeDays = formattedValue
                        .clone()
                        .add(3, 'day');
                      if (endDateForm.value > startDatePlusThreeDays.toDate()) {
                        setFormDataDownload((prev: any) => ({
                          ...prev,
                          endDate: startDatePlusThreeDays.toDate(),
                        }));
                      }
                      if (setSemiWeeklyDates) {
                        setSemiWeeklyDates((prev: any) => ({
                          ...prev,
                          endDateMin: formattedValue
                            .clone()
                            .add(1, 'day')
                            .toDate(),
                          endDateMax: formattedValue
                            .clone()
                            .add(3, 'day')
                            .toDate(),
                        }));
                      }
                      onInputChange(formData.name, e.value);
                    }}
                    placeholder={formData.placeholder}
                    // view="month"
                    // dateFormat="MM yy"
                    showIcon
                    minDate={formData.startDate}
                    maxDate={formData.endDate}
                    disabled={formData.isDisabled}
                  />
                </div>
              );
            case 'EndCalendar':
              return (
                <div
                  key={index}
                  className="w-full card flex justify-content-center flex-col text-[12px] flex-auto"
                >
                  <span className="my-1">{formData.label}</span>
                  <Calendar
                    value={formData.value}
                    onChange={(e) => {
                      const startDateForm = forms[index - 1];

                      if (e.value && startDateForm.value > e.value) {
                        onInputChange(formData.name, startDateForm.value);
                        return;
                      }
                      onInputChange(formData.name, e.value);
                    }}
                    placeholder={formData.placeholder}
                    // view="month"
                    // dateFormat="MM yy"
                    showIcon
                    minDate={formData.startDate}
                    maxDate={formData.endDate}
                    disabled={formData.isDisabled}
                  />
                </div>
              );
            case 'MonthYearPicker':
              return (
                <div
                  key={index}
                  className="w-full card flex justify-content-center flex-col text-[12px] flex-auto"
                >
                  <span className="my-1">{formData.label}</span>
                  <Calendar
                    value={formData.value}
                    onChange={(e) => {
                      onInputChange(formData.name, e.value);
                    }}
                    placeholder={formData.placeholder}
                    view="month"
                    dateFormat="MM yy"
                    showIcon
                  />
                </div>
              );
            case 'MonthPicker':
              return (
                <div
                  key={index}
                  className="w-full card flex justify-content-center flex-col text-[12px] flex-auto"
                >
                  <span className="my-1">{formData.label}</span>
                  <Calendar
                    value={formData.value}
                    onChange={(e) => {
                      onInputChange(formData.name, e.value);
                    }}
                    placeholder={formData.placeholder}
                    view="month"
                    dateFormat="MM"
                    showIcon
                  />
                </div>
              );
            case 'Dropdown':
              return (
                <div
                  key={index}
                  className="w-full card flex justify-content-center flex-col text-[12px] flex-auto"
                >
                  <span className="my-1">{formData.label}</span>
                  <Dropdown
                    value={formData.options?.find(
                      (option) => option.code === formData.value
                    )}
                    options={formData.options}
                    optionLabel={'name'}
                    placeholder={formData.placeholder}
                    className="w-full md:w-14rem"
                    onChange={(e) => {
                      onInputChange(formData.name, e.value.code, e.value.name);
                      if (formData.dropDownValues) {
                        formData.dropDownValues(formData.name, e.value);
                      }
                    }}
                    filter
                  />
                </div>
              );

            case 'DateTime':
              return (
                <div
                  key={index}
                  className={classNames({
                    hidden: !formData.isVisible,
                    'w-full card flex justify-content-center flex-col text-[12px] flex-auto':
                      formData.isVisible,
                  })}
                >
                  <span className="my-1">{formData.label}</span>

                  <Calendar
                    value={formData.value}
                    onChange={(e) => {
                      onInputChange(formData.name, e.value);
                    }}
                    showTime
                    hourFormat="12"
                    className="w-full"
                    placeholder="Choose Disbursement Schedule"
                    minDate={new Date(moment().add(5, 'minutes').format())}
                  />
                </div>
              );

            case 'File Upload':
              return (
                <label
                  key={index}
                  className="border-2 border-gray-300 rounded h-[200px] w-full flex flex-col justify-center items-center hover:cursor-pointer text-gray-600"
                >
                  <i className="pi pi-upload text-4xl mb-5" />
                  <span className="my-2">Drag or Drag File Here</span>
                  <span className="text-sm">{'( xlsx, csv )'}</span>
                  <input type="file" className="hidden" />
                </label>
              );
            case 'InputText':
              return (
                <div
                  key={index}
                  className="w-full card flex justify-content-center flex-col text-[12px] flex-auto"
                >
                  <span className="my-1">{formData.label}</span>
                  <InputText
                    value={formData.value}
                    placeholder={formData.placeholder}
                    className="w-full md:w-14rem"
                    onChange={(e) => {
                      onInputChange(formData.name, e.target.value);
                    }}
                  />
                </div>
              );
            case 'Password':
              return (
                <div
                  key={index}
                  className="password w-full card flex justify-content-center flex-col text-[12px] flex-auto"
                >
                  <span className="my-1">{formData.label}</span>
                  <Password
                    feedback={false}
                    className="w-full md:w-14rem"
                    onChange={(e) => {
                      onInputChange(formData.name, e.target.value);
                    }}
                  />
                </div>
              );
            case 'InputNumber':
              return (
                <div
                  key={index}
                  className="w-full card flex justify-content-center flex-col text-[12px] flex-auto"
                >
                  <span className="my-1">{formData.label}</span>
                  <InputNumber
                    min={0}
                    value={0}
                    placeholder={formData.placeholder}
                    minFractionDigits={2}
                    maxFractionDigits={5}
                    className="w-full md:w-14rem"
                    onChange={(e) => {
                      onInputChange(formData.name, e.value);
                    }}
                  />
                </div>
              );
            case 'Count':
              return (
                <div
                  key={index}
                  className="w-full card flex justify-content-center flex-col text-[12px] flex-auto"
                >
                  <span className="my-1">{formData.label}</span>
                  <InputNumber
                    min={0}
                    value={0}
                    placeholder={formData.placeholder}
                    className="w-full md:w-14rem"
                    onChange={(e) => {
                      onInputChange(formData.name, e.value);
                    }}
                  />
                </div>
              );
            case 'Time':
              return (
                <div
                  key={index}
                  className="w-full card flex justify-content-center flex-col text-[12px] flex-auto"
                >
                  <span className="my-1">{formData.label}</span>
                  <Calendar
                    value={formData.value}
                    showTime
                    hourFormat="12"
                    timeOnly
                    className="w-full md:w-14rem"
                    onChange={(e) => {
                      onInputChange(formData.name, e.target.value);
                    }}
                  />
                </div>
              );
            case 'Textarea':
              return (
                <div
                  key={index}
                  className="w-full card flex justify-content-center flex-col text-[12px] flex-auto"
                >
                  <span className="my-1">{formData.label}</span>
                  <InputTextarea
                    value={formData.value}
                    placeholder={formData.placeholder}
                    className="w-full md:w-14rem"
                    onChange={(e) => {
                      onInputChange(formData.name, e.target.value);
                    }}
                  />
                </div>
              );
            case 'Date':
              return (
                <div
                  key={index}
                  className="w-full card flex justify-content-center flex-col text-[12px] flex-auto"
                >
                  <span className="my-1">{formData.label}</span>
                  <Calendar
                    value={formData.value}
                    className="w-full md:w-14rem"
                    onChange={(e) => {
                      onInputChange(formData.name, e.target.value);
                    }}
                  />
                </div>
              );
            case 'Prompt':
              return (
                <div
                  key={index}
                  className="h-[300px] flex justify-end flex-col"
                >
                  <h1 className="text-[25px] font-bold mb-3">
                    {formData.label}
                  </h1>
                  <span className="ml-5">{formData.placeholder}</span>
                </div>
              );
            case 'Button':
              return (
                <div
                  key={index}
                  className="w-full card flex justify-content-center items-center flex-col text-[12px] flex-auto"
                >
                  <Button
                    key={index}
                    rounded
                    className="w-fit px-10"
                    label={formData.label}
                  />
                </div>
              );
            case 'MultiSelect':
              return (
                <div
                  key={index}
                  className="w-full card flex justify-content-center flex-col text-[12px] flex-auto"
                >
                  <span className="my-1">{formData.label}</span>
                  <MultiSelect
                    filter
                    display={'chip'}
                    value={formData.value}
                    options={formData.options}
                    showSelectAll={
                      isBulk
                        ? formData?.options &&
                          formData?.value?.length > 0 &&
                          formData?.options?.length > 2
                        : true
                    }
                    optionLabel={'name'}
                    placeholder={formData.placeholder}
                    name={formData.name}
                    className="w-full md:w-14rem"
                    onChange={(e) => {
                      // console.log(e);
                      onInputChange(formData.name, e.value);
                      // onInputChange(formData.name, e.value.code, e.value.name);
                      // if (formData.dropDownValues) {
                      //   formData.dropDownValues(formData.name, e.value);
                      // }
                    }}
                  />
                  {formData.name == 'departmentId' && (
                    <span className="text-red-600">
                      Note: Only departments with the same payroll types are
                      allowed when downloading in bulk.
                    </span>
                  )}
                  {formData.name == 'businessMonthCycle' && (
                    <span className="text-red-600">
                      Note: Only payroll reports with the same business month
                      and cycle can be downloaded in bulk.
                    </span>
                  )}
                </div>
              );
            default:
              return null;
          }
        })}

        {/* BUTTONS */}
        <div className="mt-2 w-full flex flex-nowrap justify-center items-center gap-2">
          {buttons.map((button, index) => {
            switch (button.type) {
              case 'Transparent':
                return (
                  <Button
                    key={index}
                    rounded
                    className="w-full"
                    severity="secondary"
                    text
                    label={button.label}
                    onClick={button?.handler}
                  />
                );
              case 'Black':
                return (
                  <Button
                    key={index}
                    rounded
                    className="w-full"
                    severity="secondary"
                    label={button.label}
                    onClick={button?.handler}
                    disabled={button?.isDisabled}
                  />
                );
              case 'Red':
                return (
                  <Button
                    key={index}
                    rounded
                    className="w-full"
                    label={button.label}
                    onClick={button?.handler}
                    disabled={button?.isDisabled}
                  />
                );
              default:
                return button.child;
            }
          })}
        </div>
      </div>
    </Sidebar>
  );
}

export default SideBar;
