import axios from 'axios';
import classNames from 'classnames';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Sidebar } from 'primereact/sidebar';
import { Toast } from 'primereact/toast';
import React, { useEffect, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';

interface ModeOfSeparation {
  modeOfSeparation: string;
  ckycId: string;
  employeeId: number | null;
  tierLabel: string;
  contactNumber: string;
  emailAddress: string;
  employeeCode: string;
  modeOfPayroll: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  suffix?: string;
  countryId?: number;
  provinceId?: number;
  cityId?: number;
  streetAddress?: string;
  zipCode?: string;
  birthDate?: string;
  placeOfBirth?: string;
  nationality?: string;
  gender?: string;
  civilStatus?: string;
}

const ReactivateEmployeeSideBar = ({
  configuration: { title, subTitle, submitBtnText, action, rowData, isOpen },
  setSideBarConfig,
  refetch,
}: {
  configuration: SideBarConfig;
  setSideBarConfig: any;
  refetch: () => void;
}) => {
  const toast = useRef<Toast>(null);

  const {
    control,
    formState: { errors, isDirty, isValid, isSubmitting },
    handleSubmit,
    reset,
    setValue,
    register,
    setError,
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      modeOfSeparation: '',
      ckycId: '',
      employeeId: null,
      tierLabel: '',
      contactNumber: '',
      emailAddress: '',
      employeeCode: '',
      modeOfPayroll: '',
    },
  });

  useEffect(() => {
    reset();
  }, [isOpen, reset]);

  const onSubmit = async (data: ModeOfSeparation) => {
    toast.current?.replace({
      severity: 'info',
      summary:
        rowData.employeeStatus == 1
          ? 'Submitting deactivation request'
          : 'Submitting reactivation request',
      detail: 'Please wait...',
      sticky: true,
      closable: false,
    });

    data.ckycId = rowData.ckycId;
    data.employeeId = rowData.employeeId;
    data.tierLabel = rowData.tierLabel;
    data.contactNumber = rowData.employee_profile.contactNumber;
    data.emailAddress = rowData.employee_profile.emailAddress;
    data.employeeCode = rowData.employeeCode;
    data.modeOfPayroll = rowData.modeOfPayroll;
    data.firstName = rowData.employee_profile.firstName;
    data.lastName = rowData.employee_profile.lastName;
    data.middleName = rowData.employee_profile.middleName;
    data.suffix = rowData.employee_profile.suffix;
    data.countryId = rowData.employee_profile.countryId;
    data.provinceId = rowData.employee_profile.provinceId;
    data.cityId = rowData.employee_profile.cityId;
    data.streetAddress = rowData.employee_profile.streetAddress;
    data.zipCode = rowData.employee_profile.zipCode;
    data.birthDate = rowData.employee_profile.birthDate;
    data.placeOfBirth = rowData.employee_profile.placeOfBirth;
    data.nationality = rowData.employee_profile.nationality;
    data.gender = rowData.employee_profile.gender;
    data.civilStatus = rowData.employee_profile.civilStatus;

    try {
      const url =
        rowData.employeeStatus == 1
          ? '/api/employees/deactivate'
          : '/api/employees/activate';
      const update = await axios.patch(url, data, {
        
        headers: {
          'Content-Type': 'application/json',
           Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}` },
      });

      if (update) {
        setSideBarConfig((prev: any) => ({ ...prev, isOpen: false }));
        refetch();
        toast.current?.replace({
          severity: 'success',
          summary: update.data.message,
          life: 5000,
        });
      }
    } catch (error: any) {
      const response = error?.response?.data;
      toast.current?.replace({
        severity: 'error',
        detail: response.message,
        life: 5000,
      });
    }
  };

  return (
    <>
      <Toast ref={toast} position="bottom-left" />

      <Sidebar
        closeOnEscape={false}
        dismissable={false}
        position="right"
        style={{
          width: '50%',
        }}
        visible={isOpen}
        onHide={() =>
          setSideBarConfig((prev: any) => ({ ...prev, isOpen: false }))
        }
      >
        <div className="h-full flex flex-col justify-center items-start mx-10">
          <React.Fragment>
            <h1 className="text-black font-medium text-3xl">{title}</h1>
            <h3 className="font-medium mt-5">{subTitle}</h3>
          </React.Fragment>

          <form className="w-full overflow-auto mt-5">
            <div className="flex gap-3">
              <div className="flex flex-col w-full">
                {rowData.employeeStatus == 1 && (
                  <div className="flex md:flex-row flex-col gap-5">
                    <div className="w-full card flex justify-content-center flex-col flex-auto mb-5">
                      <label className="my-1">
                        <h4 className="font-bold">
                          <span className="text-red-500">*</span>Reason of
                          Deactivation
                        </h4>
                      </label>
                      <Controller
                        name="modeOfSeparation"
                        control={control}
                        rules={{
                          required: 'Reason of Deactivation is required.',
                        }}
                        render={({ field, fieldState }) => (
                          <Dropdown
                            value={field.value}
                            options={[
                              {
                                name: 'Voluntary Resignation',
                                value: 'Voluntary Resignation',
                              },
                              { name: 'AWOL', value: 'AWOL' },
                              { name: 'Dismissal', value: 'Dismissal' },
                              { name: 'Retirement', value: 'Retirement' },
                              { name: 'Disability', value: 'Disability' },
                              { name: 'Death', value: 'Death' },
                              {
                                name: 'Temporary Deactivation',
                                value: 'Temporary Deactivation',
                              },
                            ]}
                            optionLabel={'name'}
                            onChange={(e) => {
                              field.onChange(e.value);
                            }}
                            required
                            className="w-full md:w-14rem"
                            disabled={isSubmitting || action == 'view'}
                          />
                        )}
                      />
                      {errors.modeOfSeparation && (
                        <span className="text-red-600">
                          {errors.modeOfSeparation.message}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="my-5 w-full flex justify-end items-center gap-3">
                  <Button
                    text
                    rounded
                    severity="secondary"
                    label="Cancel"
                    onClick={(e) => {
                      e.preventDefault();
                      setSideBarConfig((prev: any) => ({
                        ...prev,
                        isOpen: false,
                      }));
                    }}
                  />
                  <Button
                    rounded
                    label={submitBtnText}
                    onClick={handleSubmit(onSubmit)}
                    disabled={
                      (rowData.employeeStatus == 1 && !isDirty) ||
                      !isValid ||
                      isSubmitting ||
                      Object.keys(errors).length > 0
                    }
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
      </Sidebar>
    </>
  );
};

export default ReactivateEmployeeSideBar;
