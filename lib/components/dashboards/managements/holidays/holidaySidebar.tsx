/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Sidebar } from 'primereact/sidebar';
import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dropdown } from 'primereact/dropdown';
import { useForm } from 'react-hook-form';
import { Calendar } from 'primereact/calendar';
import classNames from 'classnames';
import { Toast } from 'primereact/toast';
import { yupResolver } from '@hookform/resolvers/yup';
import { ShiftsFormValidator } from 'lib/validation/shiftsFormValidator';
import { GlobalContainer } from 'lib/context/globalContext';
import { Controller } from 'react-hook-form';
import {
  checkDuplicateHolidayDate,
  checkDuplicateHolidayName,
} from '@utils/checkDuplicates';
import { error } from 'console';
import moment from '@constant/momentTZ';

const IntialFormState = {
  holidayId: null,
  holidayName: '',
  holidayDate: '',
  holidayType: '',
};

const HolidaySidebar = ({
  configuration: { title, submitBtnText, action, rowData, isOpen, holidayId },
  setSideBarConfig,
  refetchDataFromParent,
  companyId,
}: {
  configuration: HolidaysSideBarConfig;
  setSideBarConfig: any;
  refetchDataFromParent: () => void;
  companyId: string;
}) => {
  const {
    control,
    formState: { errors, isDirty, isValid, isSubmitting },
    handleSubmit,
    reset,
    setValue,
    watch,
    getValues,
    setError,
    register,
  } = useForm({
    mode: 'onChange',
    defaultValues: { ...IntialFormState },
  });

  const context = React.useContext(GlobalContainer);
  const userId = context?.userData.userId;

  const options = [
    { name: 'REGULAR', value: 'Regular' },
    { name: 'SPECIAL', value: 'Special' },
  ];

  const toast = useRef<Toast>(null);
  const toastInfo = useRef<Toast>(null);

  const onSubmit = async (data: HolidaysForm) => {
    if (Object.keys(errors).length > 0) return false;
    let apiUrl = '/api/holidays/';

    data.holidayDate = moment(data.holidayDate).format('YYYY-MM-DD');
    const valid = await checkDuplicates({
      companyId: companyId,
      holidayDate: data.holidayDate,
      holidayName: data.holidayName,
      holidayId: data.holidayId,
    });
    if (!valid) return false;

    setSideBarConfig((prev: any) => ({ ...prev, isOpen: false }));

    const requestBody = {
      companyId: companyId,
      userId: userId,
      holidayName: data.holidayName,
      holidayDate: data.holidayDate,
      holidayType: data.holidayType,
    };

    try {
      let response = null;
      if (action === 'add') {
        response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
          },
          body: JSON.stringify(requestBody),
        });
      } else if (action === 'edit') {
        apiUrl = apiUrl + `${holidayId}`;
        response = await fetch(apiUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
          },
          body: JSON.stringify(requestBody),
        });
      }

      if (response) {
        const holiday = await response.json();

        toastInfo.current?.clear();
        if (holiday.success === false) {
          toast.current?.replace({
            severity: 'error',
            summary: holiday.message,
            life: 10000,
          });
          return;
        }
        refetchDataFromParent();

        holidayId = holiday.message.holidayId;

        if (action === 'add') {
          toast.current?.show({
            severity: 'success',
            summary: 'Successfully Created',
            life: 5000,
          });
        } else if (action === 'edit') {
          toast.current?.show({
            severity: 'success',
            summary: 'Successfully Updated',
            life: 5000,
          });
        }
      }
    } catch (error: any) {
      const response = error?.response?.data;
      toastInfo.current?.clear();
      toast.current?.show({
        severity: 'error',
        detail: response.message,
        life: 5000,
      });
    }
  };

  useEffect(() => {
    if (action == 'edit' || action == 'view') {
      const { holidayId, holidayName, holidayDate, holidayType }: any = rowData;

      setValue('holidayName', holidayName);
      setValue('holidayDate', new Date(holidayDate) as any);
      setValue('holidayType', holidayType);
      setValue('holidayId', holidayId);
    } else {
      reset();
    }
  }, [isOpen, action, reset, rowData, setValue, refetchDataFromParent]);

  useEffect(() => {
    if (isValid && isSubmitting) {
      toastInfo.current?.show({
        severity: 'info',
        summary: 'Submitting request',
        detail: 'Please wait...',
        sticky: true,
        closable: false,
      });
    }
  }, [isValid, isSubmitting]);

  return (
    <>
      <Toast ref={toast} position="bottom-left" />
      <Toast ref={toastInfo} position="bottom-left" />
      <Sidebar
        position="right"
        className="p-sidebar-md"
        visible={isOpen}
        onHide={() =>
          setSideBarConfig((prev: any) => ({ ...prev, isOpen: false }))
        }
      >
        <React.Fragment>
          <form
            className="flex flex-col items-start gap-3 mt-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            <h1 className="text-black font-medium text-3xl mb-3">{title}</h1>
            <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto">
              <label className="my-1">
                <span className="text-red-500">*</span>
                <span>Holiday Date</span>
              </label>
              <Controller
                name="holidayDate"
                control={control}
                rules={{ required: 'Holiday Started is required.' }}
                render={({ field, fieldState }) => (
                  <Calendar
                    disabled={isSubmitting || action != 'add'}
                    inputId={field.name}
                    id={field.name}
                    ref={field.ref}
                    value={field.value}
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                    className={classNames({
                      'p-invalid': fieldState.invalid,
                    })}
                    dateFormat="mm/dd/yy"
                    showIcon
                  />
                )}
              />
              {errors.holidayDate && (
                <span className="text-red-600">
                  {errors.holidayDate.message}
                </span>
              )}
            </div>
            <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto">
              <label className="my-1">
                <span className="text-red-500">*</span>
                <span>Holiday Name</span>
              </label>
              <InputText
                className="w-full md:w-14rem"
                disabled={isSubmitting || action === 'view'}
                {...register('holidayName', {
                  required: 'Holiday name is required.',
                })}
              />
              {errors.holidayName && (
                <span className="text-red-600">
                  {errors.holidayName.message}
                </span>
              )}
            </div>

            <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto">
              <span className="my-1">
                <span className="text-red-500">*</span>Holiday Type
              </span>
              <Controller
                name="holidayType"
                control={control}
                rules={{ required: 'Employment Status is required.' }}
                render={({ field, fieldState }) => (
                  <Dropdown
                    disabled={isSubmitting || action === 'view'}
                    options={options}
                    optionLabel={'name'}
                    value={field.value}
                    placeholder="Select Holiday Type"
                    onChange={(e) => {
                      field.onChange(e.value);
                    }}
                    className="w-full md:w-14rem"
                  />
                )}
              />
              {errors.holidayType && (
                <span className="text-red-600">
                  {errors.holidayType.message}
                </span>
              )}
            </div>
            <div className="w-full flex justify-end mt-[70px]">
              <Button
                type="button"
                severity="secondary"
                text
                label="Cancel"
                className="rounded-full px-10"
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
                  className="rounded-full px-10 p-button"
                  disabled={
                    (!isDirty || !isValid || isSubmitting) && action == 'add'
                  }
                />
              )}
            </div>
          </form>
        </React.Fragment>
      </Sidebar>
    </>
  );

  async function checkDuplicates({
    companyId,
    holidayName,
    holidayId,
    holidayDate,
  }: {
    companyId: any;
    holidayName: string;
    holidayId: string | null;
    holidayDate: any;
  }) {
    let errorCount = 0;

    const duplicateName = await checkDuplicateHolidayName({
      companyId: companyId,
      holidayName: holidayName,
      holidayId: holidayId,
    });

    const duplicateDate = await checkDuplicateHolidayDate({
      companyId: companyId,
      holidayDate: holidayDate,
      holidayId: holidayId,
    });

    if (duplicateName) {
      toastInfo.current?.clear();
      toast.current?.show({
        severity: 'error',
        detail: 'Holiday Name already exists.',
        life: 5000,
      });
      errorCount++;
      setError('holidayName', {
        type: 'Duplicate',
        message: 'Holiday Name already exists.',
      });
    }

    if (duplicateDate) {
      toastInfo.current?.clear();
      toast.current?.show({
        severity: 'error',
        detail: 'Holiday Date is already taken.',
        life: 5000,
      });
      errorCount++;
      setError('holidayDate', {
        type: 'Duplicate',
        message: 'Holiday Date is already taken.',
      });
    }

    return errorCount > 0 ? false : true;
  }
};

export default HolidaySidebar;
