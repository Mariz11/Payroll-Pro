import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { OverlayPanel } from 'primereact/overlaypanel';
import { title } from 'process';
import React, { useRef } from 'react';

const ReportsDasboardMenus = ({
  title,
  description,
  form: { forms, buttons },
  onInputChange,
}: {
  title: string;
  description: string;
  form: Forms;
  onInputChange?: any;
}) => {
  const op = useRef(null) as any;

  return (
    <div className="line-container rounded-lg p-5 flex flex-col gap-5">
      <h1 className="text-xl font-bold">{title}</h1>
      <p className="font-light text-gray-700">{description}</p>

      <form className="grid grid-cols-2 min-h-[100px] gap-3">
        {forms?.map((formData, index) => {
          switch (formData.type) {
            case 'Date':
              return (
                <div
                  className="card flex justify-content-center flex-col text-[12px] flex-auto"
                  key={index}
                >
                  {formData.label}
                  <Calendar
                    value={formData.value}
                    onChange={(e: any) =>
                      formData.setValue && formData.setValue(e.value)
                    }
                    minDate={formData.minDate}
                    maxDate={formData.maxDate}
                    showIcon
                    className="custom-calendar-input"
                    inputClassName="custom-input"
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
                    filter
                    value={formData?.options?.find(
                      (option: any) => option.code === formData.value
                    )}
                    options={formData.options}
                    optionLabel={'name'}
                    placeholder={formData.placeholder}
                    className="w-full md:w-14rem"
                    onChange={(e) => {
                      onInputChange(e, formData.name, e.value);
                      if (formData.dropDownValues) {
                        formData.dropDownValues(formData.name, e.value);
                      }
                    }}
                    disabled={formData.isDisabled}
                    scrollHeight={
                      title === 'Deduction Report' ? '90px' : '200px'
                    }
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
                    optionLabel={'name'}
                    placeholder={formData.placeholder}
                    name="departments"
                    className="w-full md:w-14rem"
                    onChange={(e) => {
                      onInputChange(e);
                    }}
                    scrollHeight={
                      title === 'Deduction Report' ? '100px' : '200px'
                    }
                  />
                </div>
              );
            case 'MultiSelectForDeduction':
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
                    optionLabel={'name'}
                    placeholder={formData.placeholder}
                    name="deductionType"
                    className="w-full md:w-14rem"
                    onChange={(e) => {
                      onInputChange(e);
                    }}
                    scrollHeight={
                      title === 'Deduction Report' ? '100px' : '200px'
                    }
                  />
                </div>
              );
            default:
              return (
                <div
                  key={index}
                  className="w-full card flex justify-content-center flex-col text-[12px] flex-auto"
                ></div>
              );
          }
        })}
      </form>

      <div className="flex justify-end items-center gap-3">
        {buttons.map((button, index) => {
          switch (button.type) {
            case 'Transparent':
              return (
                <Button
                  key={index}
                  rounded
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
                  severity="secondary"
                  label={button.label}
                  onClick={button?.handler}
                  disabled={button.isDisabled}
                />
              );
            case 'Red':
              return (
                <Button
                  key={index}
                  rounded
                  label={button.label}
                  onClick={button?.handler}
                  disabled={button.isDisabled}
                />
              );
            default:
              return null;
          }
        })}
      </div>
    </div>
  );
};

export default ReportsDasboardMenus;
