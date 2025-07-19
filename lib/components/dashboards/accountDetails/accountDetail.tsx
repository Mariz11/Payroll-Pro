'use client';

import { ML_FILE_UPLOAD_URL } from '@constant/partnerAPIDetails';
import { MCASH_MLWALLET } from '@constant/variables';
import { useQuery } from '@tanstack/react-query';
import { isPasswordCommonString } from '@utils/helper';
import { fileUploadToCloud } from '@utils/imageUpload';
import axios from 'axios';
import classNames from 'classnames';
import DashboardNav from 'lib/components/blocks/dashboardNav';
import ErrorDialog from 'lib/components/blocks/errorDialog';
import { GlobalContainer } from 'lib/context/globalContext';
import { set } from 'lodash';
import moment from '@constant/momentTZ';
import Image from 'next/image';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Checkbox } from 'primereact/checkbox';
import { Divider } from 'primereact/divider';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Skeleton } from 'primereact/skeleton';
import { TabPanel, TabView } from 'primereact/tabview';
import { Toast } from 'primereact/toast';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
let today = new Date();
let yearMinus18 = today.getFullYear() - 18;
let todayMinus18years = new Date();
todayMinus18years.setFullYear(yearMinus18);

const AccountDetail = () => {
  const toast = useRef<Toast>(null);
  const context = useContext(GlobalContainer);
  const currentlyLoggedInUserId = context?.userData.userId;

  const [isResetPass, setIsResetPass] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [selectedLogo, setSelectedLogo] = useState<any>({
    text: 'Choose Logo',
    name: null,
    url: '/images/noimage.jpg',
  });
  const [userData, setUserData] = useState<any>(null);

  const {
    control,
    formState: { errors, isDirty, isValid, isSubmitting, isSubmitted },
    handleSubmit,
    setValue,
    register,
    watch,
    reset,
    setError,
    clearErrors,
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      middleName: '',
      suffix: '',
      emailAddress: '',
      birthDate: '',
      contactNumber: '',
      role: '',
      oldPassword: '',
      password: '',
      logo: null,
      companyEmailAddress: '',
      companyAddress: '',
      companyContactNumber: '',
    },
  });

  const hasError = () => {
    return Object.keys(errors).length != 0;
  };

  const { isLoading, error, data, refetch } = useQuery({
    refetchOnWindowFocus: false,
    queryKey: ['userDataAccountDetails'],
    queryFn: async () => {
      const getData = await axios.get(`/api/user/${currentlyLoggedInUserId}`, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
        },
      });
      setUserData(getData.data);
      return getData.data;
    },
  });

  const isDefaultCompanyAcct = userData && userData.isDefault;

  useEffect(() => {
    if (data) {
      const {
        firstName,
        lastName,
        middleName,
        suffix,
        emailAddress,
        birthDate,
        contactNumber,
        role,
        company: { urlLogo },
      } = data;
      const companyDetails = data.company;
      setValue('firstName', firstName);
      setValue('lastName', lastName);
      setValue('middleName', middleName);
      setValue('suffix', suffix);
      setValue('emailAddress', emailAddress);
      setValue('birthDate', birthDate ? (new Date(birthDate) as any) : null);
      setValue('contactNumber', contactNumber);
      setValue('role', role);

      setValue('companyEmailAddress', companyDetails.emailAddress);
      setValue('companyAddress', companyDetails.companyAddress);
      setValue('companyContactNumber', companyDetails.contactNumber);
      setSelectedLogo({
        text: 'Update Logo',
        name: null,
        url: urlLogo
          ? `${ML_FILE_UPLOAD_URL}/${encodeURIComponent(urlLogo)}`
          : `${ML_FILE_UPLOAD_URL}/${urlLogo}`,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, setValue]);

  const onSubmit = async (data: AdminObjectForm) => {
    setIsDisabled(true);
    toast.current?.replace({
      severity: 'info',
      summary: 'Submitting request',
      detail: 'Please wait...',
      sticky: true,
      closable: false,
    });

    // Validate Old Password
    if (isResetPass) {
      const checkOldPass = await axios.post(
        `/api/user/${currentlyLoggedInUserId}/verifypassword`,
        {
          oldPassword: data.oldPassword,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
          },
        }
      );
      if (!checkOldPass?.data?.success) {
        setIsDisabled(false);
        toast.current?.replace({
          severity: 'error',
          summary: 'Old Password is incorrect.',
          life: 5000,
          closable: true,
        });
        setError('oldPassword', { message: 'Old Password is incorrect.' });
        return false;
      }
    }

    let userDetails: any = {
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
      suffix: data.suffix,
      birthDate: moment(data.birthDate).isValid()
        ? moment(data.birthDate).format('YYYY-MM-DD')
        : null,
      contactNumber: data.contactNumber,
      emailAddress: data.emailAddress,
      password: isResetPass ? data.password : null,
    };

    let companyDetails: any = null;

    if (isDefaultCompanyAcct) {
      companyDetails = {
        companyId: userData.companyId,
        companyName: userData.company.companyName,
        emailAddress: data.companyEmailAddress,
        contactNumber: data.companyContactNumber,
        companyAddress: data.companyAddress,
        urlLogo: selectedLogo.name,
      };
    }

    if (userData && userData.employeeId) {
      delete userDetails.firstName;
      delete userDetails.middleName;
      delete userDetails.lastName;
      delete userDetails.suffix;
      delete userDetails.birthDate;
      delete userDetails.contactNumber;
      delete userDetails.emailAddress;
    }

    if (!watch('birthDate')) {
      toast.current?.replace({
        severity: 'error',
        summary: 'Birthdate is required.',
        life: 3000,
      });
      setIsDisabled(false);
      return false;
    }

    let config = {
      method: 'PUT',
      maxBodyLength: Infinity,
      url: `/api/user/${currentlyLoggedInUserId}/accountDetails`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
      },
      data: JSON.stringify({
        companyId: userData.companyId,
        companyName: userData.company.companyName,
        companyDetails: companyDetails,
        userDetails: userDetails,
      }),
    };

    axios
      .request(config)
      .then((res) => {
        setIsDisabled(false);
        toast.current?.replace({
          severity: res.data?.success ? 'success' : 'error',
          summary: res.data?.message,
          life: 3000,
        });

        if (res.data.success) {
          refetch();
          if (isResetPass) {
            setValue('oldPassword', '');
            setValue('password', '');
            setIsResetPass(false);
          }
        }
      })
      .catch((err) => {
        toast.current?.replace({
          severity: 'error',
          detail: `${err.response?.data?.message}`,
          life: 3000,
        });

        return false;
      });
  };

  return (
    <div className="w-screen h-screen p-5">
      <div className="line-container rounded-lg p-5">
        {error ? (
          <ErrorDialog />
        ) : (
          <>
            <TabView>
              <TabPanel header="Account Details">
                <>
                  <Divider align="left" className="mt-[30px]">
                    <div className="inline-flex items-center">
                      <i className="pi pi-user mr-2"></i>
                      <b>Basic Info</b>
                    </div>
                  </Divider>
                  <div className="flex items-start justify-between">
                    <div className="w-full">
                      <div className="gap-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto">
                          <label className="my-1">
                            <span className="text-red-500">*</span>
                            <span>First Name</span>
                          </label>
                          {isLoading ? (
                            <Skeleton
                              height="2.5rem"
                              className="mb-2"
                            ></Skeleton>
                          ) : (
                            <InputText
                              className={classNames('w-full md:w-14rem')}
                              placeholder="First Name"
                              {...register('firstName', {
                                required: 'First Name is required.',
                                pattern: {
                                  value: /^[a-zA-Z0-9Ññ ]*$/, // Regular expression to allow only alphanumeric characters and spaces
                                  message:
                                    'First Name cannot contain special characters.',
                                },
                              })}
                              disabled={userData && userData.employeeId}
                            />
                          )}
                          {errors.firstName && (
                            <span className="text-red-600">
                              {errors.firstName.message}
                            </span>
                          )}
                        </div>
                        <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto">
                          <label className="my-1">
                            <span>Middle Name</span>
                          </label>
                          {isLoading ? (
                            <Skeleton
                              height="2.5rem"
                              className="mb-2"
                            ></Skeleton>
                          ) : (
                            <InputText
                              className={classNames('w-full md:w-14rem')}
                              placeholder="Middle Name"
                              {...register('middleName', {
                                pattern: {
                                  value: /^[a-zA-Z0-9Ññ ]*$/, // Regular expression to allow only alphanumeric characters and spaces
                                  message:
                                    'Middle Name cannot contain special characters.',
                                },
                              })}
                              disabled={userData && userData.employeeId}
                            />
                          )}
                          {errors.middleName && (
                            <span className="text-red-600">
                              {errors.middleName.message}
                            </span>
                          )}
                        </div>
                        <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto">
                          <label className="my-1">
                            <span className="text-red-500">*</span>
                            <span>Last Name</span>
                          </label>
                          {isLoading ? (
                            <Skeleton
                              height="2.5rem"
                              className="mb-2"
                            ></Skeleton>
                          ) : (
                            <InputText
                              className={classNames('w-full md:w-14rem')}
                              placeholder="Last Name"
                              {...register('lastName', {
                                required: 'Last Name is required.',
                                pattern: {
                                  value: /^[a-zA-Z0-9Ññ ]*$/, // Regular expression to allow only alphanumeric characters and spaces
                                  message:
                                    'Last Name cannot contain special characters.',
                                },
                              })}
                              disabled={userData && userData.employeeId}
                            />
                          )}

                          {errors.lastName && (
                            <span className="text-red-600">
                              {errors.lastName.message}
                            </span>
                          )}
                        </div>
                        <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto">
                          <label className="my-1">
                            <span>Suffix</span>
                          </label>
                          {isLoading ? (
                            <Skeleton
                              height="2.5rem"
                              className="mb-2"
                            ></Skeleton>
                          ) : (
                            <InputText
                              className={classNames('w-full md:w-14rem')}
                              placeholder="Suffix"
                              {...register('suffix', {
                                pattern: {
                                  value: /^[a-zA-Z0-9Ññ ]*$/, // Regular expression to allow only alphanumeric characters and spaces
                                  message:
                                    'Suffix cannot contain special characters.',
                                },
                              })}
                              disabled={userData && userData.employeeId}
                            />
                          )}
                          {errors.suffix && (
                            <span className="text-red-600">
                              {errors.suffix.message}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="gap-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                          <label className="my-1">
                            <span className="text-red-500">*</span>
                            <span>Contact No.</span>
                          </label>
                          {isLoading ? (
                            <Skeleton
                              height="2.5rem"
                              className="mb-2"
                            ></Skeleton>
                          ) : (
                            <>
                              <input
                                type="text"
                                autoComplete="off"
                                maxLength={11}
                                disabled={userData && userData.employeeId}
                                className={classNames(
                                  'w-full p-inputtext p-component p-filled',
                                  {
                                    'p-invalid': errors.contactNumber,
                                  }
                                )}
                                {...register('contactNumber', {
                                  required: 'Contact No. is required.',
                                  maxLength: 11,
                                  pattern: {
                                    value: /^[0-9\b]+$/,
                                    message: 'Invalid Mobile number format.',
                                  },
                                  validate: {
                                    getLength: (v: any) => {
                                      if (v && v != '')
                                        return (
                                          v.length == 11 ||
                                          'Invalid Mobile number format.'
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
                                    const value = e.target.value.replace(
                                      /\D/g,
                                      ''
                                    );
                                    setValue('contactNumber', value);
                                  },
                                })}
                              />
                              {errors.contactNumber && (
                                <span className="text-red-600">
                                  {errors.contactNumber.message}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                        <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                          <label className="my-1">
                            <span className="text-red-500">*</span>
                            <span>Birthdate</span>
                          </label>
                          {isLoading ? (
                            <Skeleton
                              height="2.5rem"
                              className="mb-2"
                            ></Skeleton>
                          ) : (
                            <Controller
                              name="birthDate"
                              control={control}
                              rules={{
                                required: 'Birthdate is required.',
                              }}
                              render={({ field, fieldState }) => (
                                <Calendar
                                  maxDate={
                                    data.employee &&
                                    MCASH_MLWALLET.includes(
                                      data.employee.modeOfPayroll
                                    ) &&
                                    !data.employee
                                      ? todayMinus18years
                                      : today
                                  }
                                  disabled={userData && userData.employeeId}
                                  inputId={field.name}
                                  id={field.name}
                                  ref={field.ref}
                                  value={field.value}
                                  onBlur={field.onBlur}
                                  onChange={(e) => field.onChange(e)}
                                  className={classNames({
                                    'p-invalid': fieldState.invalid,
                                  })}
                                  dateFormat="mm/dd/yy"
                                  showIcon
                                />
                              )}
                            />
                          )}

                          {errors.birthDate && (
                            <span className="text-red-600">
                              {errors.birthDate.message}
                            </span>
                          )}
                        </div>
                        <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto">
                          <label className="my-1">
                            <span>Role</span>
                          </label>
                          {isLoading ? (
                            <Skeleton
                              height="2.5rem"
                              className="mb-2"
                            ></Skeleton>
                          ) : (
                            <InputText
                              className={classNames('w-full md:w-14rem')}
                              placeholder="Role"
                              disabled
                              value={watch('role')}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Divider align="left" className="mt-[30px]">
                    <div className="inline-flex items-center">
                      <i className="pi pi-lock mr-2"></i>
                      <b>Account Credentials</b>
                    </div>
                  </Divider>
                  <div className="gap-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
                    <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto">
                      <label className="my-1">
                        <span>Username</span>
                      </label>
                      {isLoading ? (
                        <Skeleton height="2.5rem" className="mb-2"></Skeleton>
                      ) : (
                        <InputText
                          placeholder="Username"
                          className={classNames(
                            'w-full p-inputtext p-component p-filled',
                            {
                              'p-invalid': errors.emailAddress,
                            }
                          )}
                          disabled={userData && userData.employeeId}
                          {...register('emailAddress', {
                            required: 'Username is required.',
                            pattern: {
                              value: /\S+@\S+\.\S+/,
                              message: 'Invalid Email Address format.',
                            },
                          })}
                        />
                      )}

                      {errors.emailAddress && (
                        <span className="text-red-600">
                          {errors.emailAddress.message}
                        </span>
                      )}
                    </div>
                    <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto">
                      <label className="my-1">
                        <span>Password</span>
                      </label>
                      {isLoading ? (
                        <Skeleton height="2.5rem" className="mb-2"></Skeleton>
                      ) : (
                        <InputText
                          className={classNames('w-full md:w-14rem')}
                          value={'*********'}
                          disabled
                        />
                      )}
                    </div>
                  </div>
                  <div className="w-full card text-[14px] flex items-center mt-4">
                    <Checkbox
                      inputId="resetPass"
                      name="resetPass"
                      value="resetPass"
                      onChange={(e: any) => {
                        if (!e.checked) {
                          clearErrors(['oldPassword', 'password']);
                        } else {
                          setError('oldPassword', {
                            type: 'required',
                            message: 'Old Password is required.',
                          });
                          setError('password', {
                            type: 'required',
                            message: 'New Password is required.',
                          });
                        }
                        setValue('oldPassword', '');
                        setValue('password', '');
                        setIsResetPass(e.checked);
                      }}
                      checked={isResetPass}
                    />
                    <label htmlFor="resetPass" className="ml-2">
                      Reset Password?
                    </label>
                  </div>
                  {isResetPass && (
                    <>
                      <div className="gap-3 grid lg:grid-cols-2 mt-2">
                        <div className="w-full card flex flex-col text-[12px] flex-auto">
                          <label className="my-1">
                            <span>Old Password</span>
                          </label>
                          <div>
                            <Controller
                              name="oldPassword"
                              control={control}
                              rules={{
                                required: 'Old Password is required.',
                              }}
                              render={({ field, fieldState }) => (
                                <>
                                  <Password
                                    placeholder="Old Password"
                                    id={field.name}
                                    {...field}
                                    inputRef={field.ref}
                                    className={classNames({
                                      'p-invalid': fieldState.error,
                                    })}
                                    feedback={false}
                                    toggleMask
                                    showIcon={
                                      <i className="pi pi-eye-slash"></i>
                                    }
                                    hideIcon={<i className="pi pi-eye"></i>}
                                  />
                                </>
                              )}
                            />
                          </div>
                          {errors.oldPassword && (
                            <span className="text-red-600">
                              {errors.oldPassword.message}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="gap-3 grid lg:grid-cols-2 mt-2">
                        <div className="w-full card flex flex-col text-[12px] flex-auto">
                          <label className="my-1">
                            <span>New Password</span>
                          </label>
                          <div>
                            <Controller
                              name="password"
                              control={control}
                              rules={{
                                required: 'New Password is required.',
                                validate: {
                                  getLength: (v) =>
                                    v.length >= 8 ||
                                    'Password must be at least 8 characters long.',
                                  hasSpecialUpperCaseAndNumber: (v) =>
                                    /^(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*[A-Z])(?=.*\d).+$/.test(
                                      v
                                    ) ||
                                    'Please create a stronger password using a mix of uppercase and lowercase letters, numbers, and special characters.',
                                  isCommon: isPasswordCommonString,
                                },
                              }}
                              render={({ field, fieldState }) => (
                                <>
                                  <Password
                                    maxLength={30}
                                    placeholder="New Password"
                                    id={field.name}
                                    {...field}
                                    inputRef={field.ref}
                                    className={classNames({
                                      'p-invalid': fieldState.error,
                                    })}
                                    feedback={false}
                                    toggleMask
                                    showIcon={
                                      <i className="pi pi-eye-slash"></i>
                                    }
                                    hideIcon={<i className="pi pi-eye"></i>}
                                  />
                                </>
                              )}
                            />
                          </div>
                          {errors.password && (
                            <span className="text-red-600">
                              {errors.password.message}
                            </span>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </>
              </TabPanel>
              {isDefaultCompanyAcct && (
                <TabPanel header="Company Details">
                  <Divider align="left" className="mt-[30px]">
                    <div className="inline-flex items-center">
                      <i className="pi pi-briefcase mr-2"></i>
                      <b>Company Info</b>
                    </div>
                  </Divider>
                  <div className="flex items-start justify-between">
                    <div className="w-full">
                      <div className="flex justify-between gap-3">
                        <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto">
                          <label className="my-1">
                            <span className="text-red-500">*</span>
                            <span>Company Name</span>
                          </label>
                          {isLoading ? (
                            <Skeleton
                              height="2.5rem"
                              className="mb-2"
                            ></Skeleton>
                          ) : (
                            <InputText
                              className={classNames('w-full md:w-14rem')}
                              value={data.company.companyName}
                              disabled
                            />
                          )}
                        </div>
                        <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto">
                          <label className="my-1">
                            <span className="text-red-500">*</span>
                            <span>Company Email Address</span>
                          </label>
                          {isLoading ? (
                            <Skeleton
                              height="2.5rem"
                              className="mb-2"
                            ></Skeleton>
                          ) : (
                            <InputText
                              placeholder="Email Address"
                              className={classNames(
                                'w-full p-inputtext p-component p-filled',
                                {
                                  'p-invalid': errors.companyEmailAddress,
                                }
                              )}
                              {...register('companyEmailAddress', {
                                required: 'Company Email Address is required.',
                                pattern: {
                                  value: /\S+@\S+\.\S+/,
                                  message: 'Invalid Email Address format.',
                                },
                                validate: {
                                  isDefaultAdmin: (v: any) => {
                                    if (v && v != '')
                                      return (
                                        isDefaultCompanyAcct ||
                                        'Only default admin can update the company contact number.'
                                      );
                                  },
                                },
                              })}
                              disabled={!isDefaultCompanyAcct}
                            />
                          )}
                        </div>
                        <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5">
                          <label className="my-1">
                            <span className="text-red-500">*</span>
                            <span>Company Contact No.</span>
                          </label>
                          {isLoading ? (
                            <Skeleton
                              height="2.5rem"
                              className="mb-2"
                            ></Skeleton>
                          ) : (
                            <input
                              type="text"
                              autoComplete="off"
                              maxLength={11}
                              disabled={!isDefaultCompanyAcct}
                              className={classNames(
                                'w-full p-inputtext p-component p-filled',
                                {
                                  'p-invalid': errors.companyContactNumber,
                                }
                              )}
                              {...register('companyContactNumber', {
                                maxLength: 11,
                                pattern: {
                                  value: /^[0-9\b]+$/,
                                  message: 'Invalid Mobile number format.',
                                },
                                required: 'Company Contact No. is required.',
                                validate: {
                                  getLength: (v: any) => {
                                    if (v && v != '')
                                      return (
                                        v.length == 11 ||
                                        'Invalid Mobile number format.'
                                      );
                                  },
                                  checkFormat: (v: any) => {
                                    if (v && v != '')
                                      return (
                                        v.startsWith('09') ||
                                        'Invalid Mobile number format.'
                                      );
                                  },
                                  isDefaultAdmin: (v: any) => {
                                    if (v && v != '')
                                      return (
                                        isDefaultCompanyAcct ||
                                        'Only default admin can update the company contact number.'
                                      );
                                  },
                                },
                                onChange: (e) => {
                                  const value = e.target.value.replace(
                                    /\D/g,
                                    ''
                                  );
                                  setValue('companyContactNumber', value);
                                },
                              })}
                            />
                          )}
                          {errors.companyContactNumber && (
                            <span className="text-red-600">
                              {errors.companyContactNumber.message}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="col-span-2 w-full card flex justify-content-center flex-col text-[12px] flex-auto">
                        <label className="my-1">
                          <span className="text-red-500">*</span>
                          <span>Company Address</span>
                        </label>
                        {isLoading ? (
                          <Skeleton height="2.5rem" className="mb-2"></Skeleton>
                        ) : (
                          <InputText
                            className={classNames(
                              'w-full h-[150px] md:w-14rem'
                            )}
                            {...register('companyAddress', {
                              required: 'Company Address is required.',
                            })}
                          />
                        )}

                        {errors.companyAddress && (
                          <span className="text-red-600">
                            {errors.companyAddress.message}
                          </span>
                        )}
                      </div>
                    </div>

                    {userData && userData?.role == 'ADMIN' && (
                      <div>
                        {isLoading ? (
                          <Skeleton height="2.5rem" className="mb-2"></Skeleton>
                        ) : (
                          <Controller
                            name="logo"
                            control={control}
                            render={({ field, fieldState }) => (
                              <div className="flex flex-col ml-4 w-[127px] ">
                                <label>
                                  <div
                                    className={classNames(
                                      'relative w-[127px] h-[127px] border-2 border-gray-300 rounded flex flex-col justify-center items-center hover:cursor-pointer text-gray-600',
                                      {
                                        'border-red-300 text-red-600':
                                          errors.logo,
                                      }
                                    )}
                                  >
                                    <Image
                                      fill
                                      style={{
                                        objectFit: 'scale-down',
                                        background: '#E9E9E9',
                                      }}
                                      src={selectedLogo.url}
                                      alt="Logo"
                                    />
                                  </div>
                                  <input
                                    type="file"
                                    className={classNames('hidden', {
                                      'p-invalid': errors.logo,
                                    })}
                                    {...register('logo', {
                                      required: false,
                                    })}
                                    accept="image/*"
                                    onChange={async (event: any) => {
                                      const file = event.target.files?.[0];
                                      if (file) {
                                        if (file.size > 52428800) {
                                          toast.current?.replace({
                                            severity: 'error',
                                            detail:
                                              'File size should be less than 50MB.',
                                            sticky: true,
                                            closable: true,
                                          });
                                          return;
                                        }
                                        const timeUploaded =
                                          new Date().getTime();
                                        const uploadPPurl =
                                          await fileUploadToCloud({
                                            timeUploaded: timeUploaded,
                                            file: file,
                                          });

                                        if (uploadPPurl) {
                                          setSelectedLogo({
                                            text: 'Update Logo',
                                            name:
                                              timeUploaded +
                                              '-' +
                                              file.name.replace(/ /g, '_'),
                                            url: uploadPPurl,
                                          });
                                        } else {
                                          toast.current?.replace({
                                            severity: 'error',
                                            detail:
                                              'Failed to upload Logo. Please contact your system administrator.',
                                            sticky: true,
                                            closable: true,
                                          });
                                        }
                                      }
                                    }}
                                  />
                                </label>
                                <span className="text-sm flex items-center justify-center">
                                  {selectedLogo.text}
                                </span>
                              </div>
                            )}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </TabPanel>
              )}
            </TabView>

            {isDefaultCompanyAcct && (
              <div className="my-5">
                <i className="text-red-500">
                  <strong>Note:</strong>{' '}
                  {`This is the default account of the company. Any changes will also be reflected in the corporate information.`}
                </i>
              </div>
            )}

            <div className="col-span-3 flex justify-end">
              <Button
                disabled={
                  (isResetPass &&
                    watch('password') == '' &&
                    watch('oldPassword') == '') ||
                  hasError() ||
                  isSubmitting
                }
                rounded
                className="w-[300px]"
                label={'Save'}
                onClick={handleSubmit(onSubmit)}
                // disabled={
                //   (isResetPass && !isDirty) ||
                //   !isValid ||
                //   isSubmitting ||
                //   Object.keys(errors).length > 0 ||
                //   !isDirty ||
                //   !isValid ||
                //   isDisabled ||
                //   Object.keys(errors).length > 0
                // }
              />
            </div>
          </>
        )}
      </div>
      {/* TOAST */}
      <Toast ref={toast} position="bottom-left" />
    </div>
  );
};

export default AccountDetail;
