'use client';

import React, { useEffect, useState } from 'react';

import {
  QueryObserverResult,
  RefetchOptions,
  RefetchQueryFilters,
} from '@tanstack/react-query';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Sidebar } from 'primereact/sidebar';
import { Toast } from 'primereact/toast';

import {
  Control,
  Controller,
  FieldErrors,
  UseFormClearErrors,
  UseFormHandleSubmit,
  UseFormRegister,
  UseFormReset,
  UseFormSetError,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';

import { MCASH_MLWALLET } from '@constant/variables';
import { isPasswordCommon } from '@utils/helper';
import axios from 'axios';
import classNames from 'classnames';
import moment from '@constant/momentTZ';
import { Checkbox } from 'primereact/checkbox';

const UserSidebar = ({
  configuration: { isOpen, setIsOpen },
  label: { buttonText, title },
  register,
  handleSubmit,
  errors,
  setValue,
  setError,
  watch,
  reset,
  refetch,
  userId,
  companyId,
  context,
  isDirty,
  isValid,
  paramsCompanyName,
  clearErrors,
  toast,
  employeeData,
  control,
  allRolesQuery,
  isUserDefaultAdmin,
  userRefetch,
}: {
  configuration: Configuration;
  label: Label;
  register: UseFormRegister<UserObjectForm>;
  handleSubmit: UseFormHandleSubmit<UserObjectForm>;
  errors: FieldErrors<UserObjectForm>;
  setError: UseFormSetError<UserObjectForm>;
  setValue: UseFormSetValue<UserObjectForm>;
  clearErrors: UseFormClearErrors<UserObjectForm>;
  watch: UseFormWatch<UserObjectForm>;
  reset: UseFormReset<UserObjectForm>;
  refetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<any, unknown>>;
  userId: number;
  companyId: number;
  context: GlobalContext | null;
  isDirty: boolean;
  isValid: boolean;
  paramsCompanyName?: any;
  toast: React.RefObject<Toast>;
  employeeData: any;
  control: Control<UserObjectForm>;
  allRolesQuery: any;
  isUserDefaultAdmin: boolean;
  userRefetch: () => void;
}) => {
  // useData below is session data
  const userData = context?.userData;
  const [isButtonLabelChange, setIsButtonLabelChange] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [companyRoles, setCompanyRoles] = useState<any>([]);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [employeeRoleId, setEmployeeRoleId] = useState<number>(-1);
  // const companyRoles = useQuery({
  //   refetchOnWindowFocus: false,
  //   queryKey: ['userRolesData'],
  //   queryFn: async () => {
  //     const response: any = await axios(`/api/user_roles/all`, {
  //       method: 'GET',
  //       headers: {
  //         Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
  //       },
  //     });

  //     const roles = response.data.message.map((role: any) => ({
  //       name: role.roleName,
  //       value: role.userRoleId,
  //     }));

  //     return roles;
  //   },
  // });

  const firstDigit = watch('contactNumber')?.toString().slice(0, 1);
  const restDigits = watch('contactNumber')?.toString().slice(1);
  let today = new Date();
  let yearMinus18 = today.getFullYear() - 18;
  let todayMinus18years = new Date();
  todayMinus18years.setFullYear(yearMinus18);
  function hasUpperCase(str: string) {
    return str != str.toLowerCase();
  }
  useEffect(() => {
    if (allRolesQuery.data) {
      const employeeRole = allRolesQuery.data.find(
        (r: any) => r.name == 'EMPLOYEE'
      );
      if (employeeRole) {
        setEmployeeRoleId(employeeRole.value);
      }
    }
  }, [allRolesQuery]);
  return (
    <Sidebar
      position="right"
      className="p-sidebar-md"
      visible={isOpen}
      onHide={() => {
        setIsOpen(false);

        reset();
      }}
    >
      <React.Fragment>
        <h1 className="text-black font-medium text-3xl">{title}</h1>
        <h3 className="font-medium mt-5 mb-2">Basic Details</h3>
      </React.Fragment>

      <form
        className="w-full overflow-auto gap-3 flex flex-col"
        onSubmit={(e) => {
          e.preventDefault();

          if (title === 'Add User') {
            createUser();
          }
        }}
      >
        {userData.role !== 'SUPER ADMIN' && userData.role !== 'SUPER_ADMIN' && (
          <div className="col-span-2 w-full card flex justify-content-center flex-col text-[12px] flex-auto">
            <label className="my-1">
              <span className="text-red-500">*</span>
              <span>Role</span>
            </label>
            <Controller
              name="role"
              control={control}
              // rules={{
              //   required:
              //     sessionData.emailAddress == watch('emailAddress')
              //       ? false
              //       : 'Role is required.',
              // }}
              rules={{
                required: 'Role is required.',
              }}
              render={({ field, fieldState }) => (
                <Dropdown
                  filter
                  value={field.value}
                  options={
                    allRolesQuery.data
                      ? title == 'Add User' ||
                        (title == 'Update User' &&
                          employeeRoleId != watch('role'))
                        ? allRolesQuery.data.filter(
                            (r: any) => r.name !== 'EMPLOYEE'
                          )
                        : allRolesQuery.data
                      : []
                  }
                  optionLabel={'name'}
                  onChange={(e) => {
                    field.onChange(e.value);
                    if (errors.role && watch('role')) {
                      clearErrors('role');
                    }
                  }}
                  required
                  className="w-full md:w-14rem"
                  disabled={
                    watch('role') == employeeRoleId ||
                    isSubmitting ||
                    (title !== 'Update User' && title !== 'Add User') ||
                    isUserDefaultAdmin
                  }
                />
              )}
            />
            {
              // sessionData.emailAddress != watch('emailAddress')
              //  &&
              errors.role && (
                <span className="text-red-600">{errors.role.message}</span>
              )
            }
          </div>
        )}
        <div className="flex gap-3">
          <div className="col-span-2 w-full card flex justify-content-center flex-col text-[12px] flex-auto">
            <label className="my-1">
              <span className="text-red-500">*</span>First Name
            </label>
            <InputText
              {...register('firstName', {
                required: 'First Name is required.',
                pattern: {
                  value: /^[a-zA-Z0-9Ññ ]*$/, // Regular expression to allow only alphanumeric characters and spaces
                  message: 'First Name cannot contain special characters.',
                },
              })}
              className={classNames('w-full md:w-14rem')}
              placeholder="First Name"
              disabled={
                title === 'View User' || title === 'Update User' ? true : false
              }
            />
            {errors.firstName && (
              <span className="text-red-500">{errors.firstName.message}</span>
            )}
          </div>
          <div className="col-span-2 w-full card flex justify-content-center flex-col text-[12px] flex-auto">
            <label className="my-1">
              <span>Middle Name</span>
            </label>
            <InputText
              {...register('middleName')}
              className="w-full md:w-14rem"
              placeholder="Middle Name"
              disabled={
                title === 'View User' || title === 'Update User' ? true : false
              }
            />
            {errors.middleName && (
              <span className="text-red-500">{errors.middleName.message}</span>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <div className="col-span-2 w-full card flex justify-content-center flex-col text-[12px] flex-auto">
            <label className="my-1">
              <span className="text-red-500">*</span>Last Name
            </label>
            <InputText
              {...register('lastName')}
              className={classNames('w-full md:w-14rem')}
              placeholder="Last Name"
              disabled={
                title === 'View User' || title === 'Update User' ? true : false
              }
            />
            {errors.lastName && (
              <span className="text-red-500">{errors.lastName.message}</span>
            )}
          </div>
          <div className="col-span-2 w-full card flex justify-content-center flex-col text-[12px] flex-auto">
            <label className="my-1">
              <span>Suffix</span>
            </label>
            <InputText
              {...register('suffix')}
              className="w-full md:w-14rem"
              placeholder="Suffix"
              disabled={
                title === 'View User' || title === 'Update User' ? true : false
              }
            />
            {errors.suffix && (
              <span className="text-red-500">{errors.suffix.message}</span>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <div className="col-span-2 w-full card flex justify-content-center flex-col text-[12px] flex-auto">
            <label className="my-1">
              <span className="text-red-500">*</span>Birth Date
            </label>
            <Calendar
              showIcon
              maxDate={
                (employeeData &&
                  MCASH_MLWALLET.includes(employeeData.modeOfPayroll)) ||
                title === 'Add Admin' ||
                title == 'Add User'
                  ? todayMinus18years
                  : today
              }
              className={classNames('w-full md:w-14rem')}
              value={watch().birthDate}
              onChange={(e) => {
                setValue('birthDate', e.target.value as any);
              }}
              disabled={
                title === 'View User' || title === 'Update User' ? true : false
              }
            />
            {errors.birthDate && (
              <span className="text-red-500">{errors.birthDate.message}</span>
            )}
          </div>
          <div className="col-span-2 w-full card flex justify-content-center flex-col text-[12px] flex-auto">
            <label className="my-1">
              <span className="text-red-500">*</span>Contact Number
            </label>
            <InputText
              className={classNames('w-full md:w-14rem')}
              placeholder="09..."
              maxLength={11}
              {...register('contactNumber', {
                maxLength: 11,
                pattern: {
                  value: /^[0-9\b]+$/,
                  message: 'Invalid Mobile number format.',
                },
                validate: {
                  getLength: (v: any) => {
                    if (v && v != '')
                      return v.length == 11 || 'Invalid Mobile number format.';
                  },
                  checkFormat: (v: any) => {
                    if (v && v != '')
                      return (
                        v.startsWith('09') || 'Invalid Mobile number format.'
                      );
                  },
                },
                onChange: (e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setValue('contactNumber', value);
                },
              })}
              disabled={
                title === 'View User' || title === 'Update User' ? true : false
              }
            />
            {errors.contactNumber && (
              <span className="text-red-500">Contact Number is required</span>
            )}
          </div>
        </div>
        <div className="col-span-2 w-full card flex justify-content-center flex-col text-[12px] flex-auto">
          <label className="my-1">
            <span className="text-red-500">*</span>Email Address
          </label>
          <InputText
            {...register('emailAddress')}
            className={classNames('w-full md:w-14rem')}
            placeholder="Email Address"
            disabled={
              title === 'View User' || title === 'Update User' ? true : false
            }
          />
          {errors.emailAddress && (
            <span className="text-red-500">{errors.emailAddress.message}</span>
          )}
        </div>

        {title == 'Add User' && (
          <div className="mt-2 w-full flex flex-nowrap justify-center items-center gap-2">
            <Button
              rounded
              className="w-full"
              severity="secondary"
              text
              label="Cancel"
              onClick={(e) => {
                e.preventDefault();
                setIsOpen(false);
                reset();
              }}
            />
            <Button
              rounded
              className="w-full bg-primaryDefault"
              disabled={isButtonLabelChange || (!isDirty && !isValid)}
              label={isButtonLabelChange ? 'Saving...' : buttonText}
              type="submit"
              onClick={(e) => {
                createUser();
              }}
            />
          </div>
        )}

        {title === 'Update User' && userData.role != 'EMPLOYEE' && (
          <div className="flex flex-col gap-3 mt-0">
            <div className="w-full card text-[14px] flex items-center mt-4">
              <Checkbox
                inputId="resetPass"
                name="resetPass"
                value="resetPass"
                checked={isResetPassword}
                onChange={(e: any) => setIsResetPassword(e.checked)}
              ></Checkbox>
              <label htmlFor="resetPass" className="ml-2">
                Reset Password?
              </label>
            </div>
            {isResetPassword && (
              <div className="col-span-2 w-full card flex justify-content-center flex-col text-[12px] flex-auto">
                <label className="my-1">
                  <span className="text-red-500">*</span>Reset Password
                </label>
                <InputText
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters long',
                    },
                    maxLength: {
                      value: 30,
                      message: 'Password must not exceed 30 characters',
                    },
                  })}
                  className={classNames('w-full md:w-14rem')}
                  onChange={(e) => {
                    clearErrors('password');
                    // console.log();
                    setValue('password', e.target.value);
                  }}
                  placeholder="New Password"
                  maxLength={30}
                />
                {errors.password && (
                  <span className="text-red-500">
                    {errors.password.message}
                  </span>
                )}
              </div>
            )}
            <Button
              rounded
              className="w-full bg-primaryDefault"
              disabled={isSubmitting}
              label={isSubmitting ? 'Updating...' : 'Update User'}
              onClick={(e) => {
                e.preventDefault();
                const upperCaseAndSpecialCharactersRE =
                  /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/;

                let hasError = false;
                if (!watch('role')) {
                  setError('role', {
                    type: 'required',
                    message: 'Role is required.',
                  });
                  hasError = true;
                }
                const password = watch('password') as string;
                if (isResetPassword) {
                  if (password && password != '' && password.length < 8) {
                    setError('password', {
                      message: 'Password must be at least 8 characters long',
                    });
                    hasError = true;
                  }
                  if (
                    !upperCaseAndSpecialCharactersRE.test(
                      watch('password') as string
                    ) ||
                    !hasUpperCase(watch('password') as string)
                  ) {
                    setError('password', {
                      message:
                        'Please create a stronger password using a mix of uppercase and lowercase letters, numbers, and special characters.',
                    });
                    hasError = true;
                  }
                  if (isPasswordCommon(password)) {
                    setError('password', {
                      message:
                        'The password you entered is frequently used. Please create a stronger one.',
                    });
                    hasError = true;
                  }
                }
                if (hasError) {
                  return null;
                }
                clearErrors('password');
                // console.log(userId);
                setSubmitting(true);
                let config = {
                  method: 'PUT',
                  maxBodyLength: Infinity,
                  url: `/api/user/updateDetails`,
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
                  },
                  data: JSON.stringify({
                    userId: userId,
                    companyId: companyId,
                    isResetPassword: isResetPassword,
                    password: watch('password'),
                    emailAddress: watch('emailAddress'),
                    chosenRole: watch('role'),
                  }),
                };
                axios
                  .request(config)
                  .then((res) => {
                    (function () {
                      toast.current?.show({
                        severity: 'success',
                        summary: 'User Successfully Updated',
                        life: 3000,
                      });
                    })();
                    refetch();
                    setSubmitting(false);
                    setValue('password', '');
                    setIsOpen(false);
                    reset();
                  })
                  .catch((err) => {
                    (function () {
                      toast.current?.show({
                        severity: 'error',
                        summary: `${err.response?.data?.message}`,
                        life: 3000,
                      });
                    })();

                    setSubmitting(false);
                  });
              }}
            />
          </div>
        )}
      </form>
    </Sidebar>
  );

  function createUser() {
    if (paramsCompanyName === undefined) {
      handleSubmit((data) => {
        // CHECK IF CONTACT NUMBER IS VALID

        if (firstDigit !== '0') {
          (function () {
            toast.current?.replace({
              severity: 'error',
              summary: 'Number must start with 0',
              life: 3000,
            });
          })();
        } else if (!watch('contactNumber').startsWith('09')) {
          toast.current?.replace({
            severity: 'error',
            summary: 'Invalid Mobile number format.',
            life: 3000,
          });
        } else if ((firstDigit + restDigits).length !== 11) {
          (function () {
            toast.current?.replace({
              severity: 'error',
              summary: 'Number must be 11 digits',
              life: 3000,
            });
          })();
        } else {
          setIsButtonLabelChange(true);
          let config = {
            method: 'POST',
            maxBodyLength: Infinity,
            url: '/api/user',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
            },
            data: JSON.stringify({
              role: context?.userData.role,
              firstName: data.firstName,
              middleName: data.middleName,
              lastName: data.lastName,
              suffix: data.suffix,
              birthDate: moment(data.birthDate).format('YYYY-MM-DD'),
              contactNumber: data.contactNumber,
              emailAddress: data.emailAddress,
              chosenRole: data.role,
            }),
          };
          axios
            .request(config)
            .then(() => {
              (function () {
                toast.current?.replace({
                  severity: 'success',
                  summary: 'Successfully Created',
                  life: 3000,
                });
              })();
              setValue('role', -1);
              reset();
              refetch();
              setIsButtonLabelChange(false);
            })
            .catch((error) => {
              (function () {
                toast.current?.replace({
                  severity: 'error',
                  detail: `${error.response?.data?.message}`,
                  life: 3000,
                });
              })();
              setIsButtonLabelChange(false);
            });
        }
      })();
    } else {
      // CHECK IF CONTACT NUMBER IS VALID
      if (firstDigit !== '0') {
        (function () {
          toast.current?.replace({
            severity: 'error',
            summary: 'Number must start with 0',
            life: 3000,
          });
        })();
      } else if (!watch('contactNumber').startsWith('09')) {
        toast.current?.replace({
          severity: 'error',
          summary: 'Invalid Mobile number format.',
          life: 3000,
        });
      } else if ((firstDigit + restDigits).length !== 11) {
        (function () {
          toast.current?.replace({
            severity: 'error',
            summary: 'Number must be 11 digits',
            life: 3000,
          });
        })();
      } else {
        handleSubmit((data) => {
          setIsButtonLabelChange(true);
          let config = {
            method: 'POST',
            maxBodyLength: Infinity,
            url: '/api/user',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
            },
            data: JSON.stringify({
              role: context?.userData.role,
              firstName: data.firstName,
              middleName: data.middleName,
              lastName: data.lastName,
              suffix: data.suffix,
              birthDate: moment(data.birthDate).format('YYYY-MM-DD'),
              contactNumber: data.contactNumber,
              emailAddress: data.emailAddress,
              chosenRole: data.role,
            }),
          };
          axios
            .request(config)
            .then(() => {
              (function () {
                toast.current?.replace({
                  severity: 'success',
                  detail: 'User successfully created',
                  life: 3000,
                });
              })();
              reset();
              refetch();
              setIsButtonLabelChange(false);
            })
            .catch((error) => {
              (function () {
                toast.current?.replace({
                  severity: 'error',
                  detail: `${error.response?.data?.message}`,
                  life: 3000,
                });
              })();

              setIsButtonLabelChange(false);
            });
        })();
      }
    }
  }
};

export default UserSidebar;
