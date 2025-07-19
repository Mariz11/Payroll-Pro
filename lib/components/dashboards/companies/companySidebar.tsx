'use client';

import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { InputSwitch } from 'primereact/inputswitch';
import { InputText } from 'primereact/inputtext';
import { Sidebar } from 'primereact/sidebar';
import { TreeTable } from 'primereact/treetable';
import React, { useEffect, useRef, useState } from 'react';

import Image from 'next/image';
import { InputNumber } from 'primereact/inputnumber';
import { Controller, useForm } from 'react-hook-form';
import { Calendar } from 'primereact/calendar';
import classNames from 'classnames';
import axios from 'axios';
import { Toast } from 'primereact/toast';
import {
  checkDuplicateCompanyName,
  checkDuplicateContactNum,
  checkDuplicateEmail,
} from '@utils/checkDuplicates';
import { properCasing, removeExtraSpaces } from '@utils/helper';
import { ML_FILE_UPLOAD_URL } from '@constant/partnerAPIDetails';
import { fileUploadToCloud } from '@utils/imageUpload';
import CompanyWalletAcctMiniCards from 'lib/components/blocks/companyWalletAcctMiniCards';
import { Divider } from 'primereact/divider';
import moment from '@constant/momentTZ';
import { Checkbox } from 'primereact/checkbox';
import { DataTable } from 'primereact/datatable';
import { set } from 'lodash';
import companyCharge from 'db/models/companyCharge';
import { Skeleton } from 'primereact/skeleton';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
const CompanySidebar = ({
  configuration: { title, submitBtnText, action, rowData, isOpen },
  setSideBarConfig,
  refetchDataFromParent,
}: {
  configuration: SideBarConfig;
  setSideBarConfig: any;
  refetchDataFromParent: () => void;
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
  } = useForm<CompanyForm>({
    mode: 'onChange',
    defaultValues: {
      companyId: null,
      companyName: '',
      emailAddress: '',
      companyAddress: '',
      contactNumber: '',
      urlLogo: null,
      chargePerEmployee: 0,
      maxEmployee: 0,
      applyWithHoldingTax: false,
      companyStatus: undefined,
      userId: null,
      // firstName: '',
      // middleName: null,
      // lastName: '',
      // suffix: null,
      // adminEmailAddress: '',
      // adminContactNumber: '',
      // birthDate: '',
    },
  });
  const initialChargeValues = [
    {
      companyChargeId: null,
      tierStart: 0.01,
      tierEnd: 25000.0,
      charge: 0,
      disabled: true,
      tier: 1,
    },
    {
      companyChargeId: null,
      tierStart: 25000.01,
      tierEnd: 50000.0,
      charge: 0,
      disabled: true,
      tier: 2,
    },
    {
      companyChargeId: null,
      tierStart: 50000.01,
      tierEnd: 100000.0,
      charge: 0,
      disabled: true,
      tier: 3,
    },
    {
      companyChargeId: null,
      tierStart: 100000.01,
      tierEnd: 250000.0,
      charge: 0,
      disabled: true,
      tier: 4,
    },
  ];
  const [isCopyCompEmail, setIsCopyCompEmail] = useState(false);
  const [isCopyCompContactNo, setIsCopyCompContactNo] = useState(false);
  const [selectedLogo, setSelectedLogo] = useState<any>({
    text: 'Choose Logo',
    name: null,
    url: '/images/noimage.jpg',
  });

  const toast = useRef<Toast>(null);
  const [tierCharges, setTierCharges] = useState<any>(initialChargeValues);
  const [newTierCharges, setNewTierCharges] = useState<any>([]);
  const [tableKey, setTableKey] = useState(0);
  const [tierData, setTierData] = useState<any>([]);
  const [isRetrievingCharges, setIsRetrievingCharges] = useState(false);
  useEffect(() => {
    if (action == 'add') {
      setTierCharges(initialChargeValues);
      setIsRetrievingCharges(() => false);
    }
    if (action == 'edit' || action == 'view') {
      const {
        companyId,
        companyName,
        emailAddress,
        companyAddress,
        contactNumber,
        urlLogo,
        chargePerEmployee,
        maxEmployee,
        isActive,
        applyWithHoldingTax,
        userDetails,
      }: any = rowData;

      setValue('companyId', companyId);
      setValue('companyName', companyName);
      setValue('emailAddress', emailAddress);
      setValue('companyAddress', companyAddress);
      setValue('contactNumber', contactNumber);
      setValue('chargePerEmployee', chargePerEmployee);
      setValue('maxEmployee', maxEmployee);
      setValue('isActive', isActive);
      setValue('companyStatus', isActive);
      setValue('applyWithHoldingTax', applyWithHoldingTax);

      setValue('userId', userDetails?.userId);
      // setValue('firstName', userDetails.firstName);
      // setValue('middleName', userDetails.middleName);
      // setValue('lastName', userDetails.lastName);
      // setValue('suffix', userDetails.suffix);
      // setValue('adminEmailAddress', userDetails.emailAddress);
      // setValue('adminContactNumber', userDetails.contactNumber);
      // setValue(
      //   'birthDate',
      //   userDetails.birthDate ? (new Date(userDetails.birthDate) as any) : null
      // );
      // console.log(rowData);

      setSelectedLogo({
        text: '',
        name: urlLogo,
        url: urlLogo
          ? `${ML_FILE_UPLOAD_URL}/${encodeURIComponent(urlLogo)}`
          : '/images/noimage.jpg',
      });
      if (action == 'edit' || action == 'view') {
        setIsRetrievingCharges(() => true);
      }
      if (isOpen) {
        axios
          .get(`/api/companyCharges/${rowData.companyId}`)
          .then((res) => {
            let tierArr: any = [];
            let sortedTierArr = res.data.message.sort((a: any, b: any) => {
              return a.tierNumber - b.tierNumber;
            });
            // console.log(sortedTierArr);
            tierArr = sortedTierArr.map((item: any, index: number) => {
              return {
                companyChargeId: item.companyChargeId,
                tierStart: item.tierStart,
                tierEnd: item.tierEnd,
                charge: item.charge,
                disabled: true,
                tier: index + 1,
              };
            });
            setTierCharges(() => tierArr);
            setIsRetrievingCharges(() => false);
          })
          .catch((err) => {
            console.log(err);
            setTierCharges(initialChargeValues);
            setIsRetrievingCharges(() => false);
          });
      }
    } else {
      reset();
      // setPayrollTypeOpt('');
      setSelectedLogo({
        text: 'Choose Logo',
        name: null,
        url: '/images/noimage.jpg',
      });
    }
  }, [isOpen, action, reset, rowData, setValue, refetchDataFromParent]);

  // Submit form
  const onSubmit = async (data: CompanyForm) => {
    data.companyName = removeExtraSpaces(data.companyName);
    data.emailAddress = removeExtraSpaces(data.emailAddress);
    data.companyAddress = removeExtraSpaces(data.companyAddress);
    data.urlLogo = selectedLogo.name;
    // data.birthDate = moment(data.birthDate).format('YYYY-MM-DD');

    const companyDetails = {
      companyId: data.companyId,
      userId: data.userId,
      companyName: data.companyName,
      emailAddress: data.emailAddress,
      companyAddress: data.companyAddress,
      contactNumber: data.contactNumber,
      chargePerEmployee: data.chargePerEmployee,
      maxEmployee: data.maxEmployee,
      isActive: data.isActive,
      companyStatus: data.companyStatus,
      applyWithHoldingTax: data.applyWithHoldingTax,
      urlLogo: data.urlLogo,
      companyCharges:
        action == 'add'
          ? tierCharges
          : tierCharges.filter((item: any) => item.companyChargeId != null),
      newTierCharges: newTierCharges,
    };

    if (!data.companyStatus && data.isActive) {
      const confirm = await confirmDeactivation();
      if (!confirm) {
        toast.current?.replace({
          summary: 'Update Cancelled',
          // detail: 'Updating of changes cancelled',
          severity: 'info',
          life: 5000,
          closable: true,
        });
        setValue('companyStatus', data.isActive);
        return;
      }
    }

    toast.current?.replace({
      severity: 'info',
      summary: 'Submitting request',
      detail: 'Please wait...',
      sticky: true,
      closable: false,
    });

    if (action == 'add') {
      // check for duplicate Company Name, Contact Number and Email address
      const isValidCompanyDetails = await checkDuplicateCompanyDetails({
        companyName: companyDetails.companyName,
        companyId: companyDetails.companyId,
      });

      // check for duplicate Admin Contact number and Email address
      const isValidAdminDetails = await checkDuplicateAdminDetails({
        emailAddress: companyDetails.emailAddress,
        contactNumber: companyDetails.contactNumber,
        userId: companyDetails.userId,
      });
      if (!isValidCompanyDetails || !isValidAdminDetails) return false;
    }

    if (tierCharges[0].tierStart != 0.01) {
      toast.current?.replace({
        severity: 'error',
        summary: 'Invalid Tier Value',
        detail: 'Starting Salary of First Tier must be 0.01',
        sticky: true,
        life: 5000,
      });
      return;
    }
    // validate tier values
    let hasError = false;
    let errorMessage = '';
    for (let i = 0; i < tierCharges.length; i++) {
      // if tier values are null or not provided
      if (
        tierCharges[i].tierStart === null ||
        tierCharges[i].tierEnd === null ||
        tierCharges[i].chargeLessThreshold === null ||
        tierCharges[i].chargeMoreThreshold === null
      ) {
        errorMessage = 'Missing Tier Values';
        hasError = true;
        break;
      }
      // check on previous tiers
      for (let j = 0; j < i; j++) {
        if (tierCharges[i].tierStart <= tierCharges[j].tierEnd) {
          errorMessage = `Tier ${
            i + 1
          } Start Salary must be greater than Tier ${j + 1} End Salary`;
          hasError = true;
          break;
        }
      }
      // start salary must be less than end salary
      if (tierCharges[i].tierStart >= tierCharges[i].tierEnd) {
        errorMessage = `Tier ${i + 1} Start Salary must be less than Tier ${
          i + 1
        } End Salary`;
        hasError = true;
        break;
      }
    }
    if (hasError) {
      toast.current?.replace({
        severity: 'error',
        summary: 'Invalid Tier Value',
        detail: errorMessage,
        sticky: true,
        life: 5000,
      });
      return;
    }

    try {
      let response = null;
      if (action == 'add') {
        response = await axios.post(
          '/api/companies',
          JSON.stringify({
            companyDetails: companyDetails,
            // userAcctDetails: userAcctDetails,
          }),
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
            },
          }
        );
      } else if (action == 'edit') {
        response = await axios.put(
          '/api/companies',
          JSON.stringify({
            companyDetails: companyDetails,
            // userAcctDetails: userAcctDetails,
          }),
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
            },
          }
        );
      }

      if (response) {
        // Closes form
        setNewTierCharges([]);
        setSideBarConfig((prev: any) => ({ ...prev, isOpen: false }));
        refetchDataFromParent();
        toast.current?.replace({
          severity: 'success',
          summary: response.data.message,
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

  // useEffect(() => {
  //   if (isValid && isSubmitting) {
  //     toast.current?.replace({
  //       severity: 'info',
  //       summary: 'Submitting request',
  //       detail: 'Please wait...',
  //       sticky: true,
  //       closable: false,
  //     });
  //   }
  // }, [isValid, isSubmitting]);

  const confirmDeactivation = () => {
    return new Promise((resolve) => {
      confirmDialog({
        header: `Deactivate ${properCasing(rowData?.companyName)}`,
        message: (
          <div className="flex items-center space-x-4">
            <i className="pi pi-info-circle text-2xl text-gray-500"></i>
            <span className="text-lg">
              Are you sure you want to deactivate this company?
            </span>
          </div>
        ),
        acceptClassName: 'p-button-deactivate',
        rejectClassName: 'p-custom-button-no-deactivate',
        accept: () => resolve(true),
        reject: () => resolve(false),
        onHide: () => resolve(false),
        draggable: false,
        resizable: false,
      });
    });
  };

  return (
    <>
      <ConfirmDialog />
      <Toast ref={toast} position="bottom-left" />
      <Sidebar
        closeOnEscape={action == 'view'}
        dismissable={action == 'view'}
        position="right"
        style={{
          width: '84%',
        }}
        visible={isOpen}
        onHide={() => {
          setSideBarConfig((prev: any) => ({ ...prev, isOpen: false }));
          setNewTierCharges([]);
        }}
      >
        <React.Fragment>
          <form
            className="w-full overflow-auto"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="">
              {action == 'add' && (
                <h1 className="text-black font-medium w-full text-3xl">
                  {title}
                </h1>
              )}
              {action != 'add' && (
                <div className="flex justify-between items-center">
                  <div className="w-full flex gap-2 justify-start">
                    <h1 className="text-black font-medium text-3xl">{title}</h1>
                    <div className="w-[380px] my-2">
                      {rowData && rowData.isActive ? (
                        <span className="py-2 px-8 rounded-full bg-green-200 text-green-700">
                          Active
                        </span>
                      ) : (
                        <span className="py-2 px-8 rounded-full bg-red-200 text-red-700">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>
                  <CompanyWalletAcctMiniCards
                    companyAccountId={rowData.accountId}
                  />
                </div>
              )}
            </div>
            <div className="mt-[30px] mb-[50px]">
              <Divider align="left">
                <div className="inline-flex items-center">
                  <i className="pi pi-briefcase mr-2"></i>
                  <b>Company Details</b>
                </div>
              </Divider>
              <div className="flex gap-3">
                <div className="flex flex-col w-[85%] gap-3">
                  <div className="flex md:flex-row flex-col gap-5">
                    <div className="col-span-2 w-full card flex justify-content-center flex-col text-[12px] flex-auto">
                      <label className="my-1">
                        <span className="text-red-500">*</span>
                        <span>Company Name</span>
                      </label>
                      <InputText
                        data-testid="companyName"
                        disabled={
                          isSubmitting || action == 'edit' || action == 'view'
                        }
                        autoComplete="off"
                        className={classNames('w-full', {
                          'p-invalid': errors.companyName,
                        })}
                        {...register('companyName', {
                          required: 'Company Name is required.',
                          validate: {
                            getLength: (v) =>
                              v.length <= 60 ||
                              'Only a maximum of 60 characters are allowed.',
                          },
                        })}
                      />
                      {errors.companyName && (
                        <span className="text-red-600">
                          {errors.companyName.message}
                        </span>
                      )}
                    </div>
                    <div className="col-span-2 w-full card flex justify-content-center flex-col text-[12px] flex-auto">
                      <label className="my-1">
                        <span className="text-red-500">*</span>
                        <span>Company Email Address</span>
                      </label>
                      <input
                        data-testid="emailAddress"
                        autoComplete="off"
                        type="email"
                        disabled={isSubmitting || action == 'view'}
                        className={classNames(
                          'w-full p-inputtext p-component p-filled',
                          {
                            'p-invalid': errors.emailAddress,
                          }
                        )}
                        {...register('emailAddress', {
                          required: 'Company Email Address is required.',
                          pattern: {
                            value: /\S+@\S+\.\S+/,
                            message: 'Invalid Email Address format.',
                          },
                        })}
                      />
                      {errors.emailAddress && (
                        <span className="text-red-600">
                          {errors.emailAddress.message}
                        </span>
                      )}
                    </div>

                    <div className="col-span-2 w-full card flex justify-content-center flex-col text-[12px] flex-auto">
                      <label className="my-1">
                        <span className="text-red-500">*</span>
                        <span>Company Contact No.</span>
                      </label>
                      <input
                        data-testid="contactNumber"
                        disabled={isSubmitting || action == 'view'}
                        type="text"
                        autoComplete="off"
                        maxLength={11}
                        className={classNames(
                          'w-full p-inputtext p-component p-filled',
                          {
                            'p-invalid': errors.contactNumber,
                          }
                        )}
                        {...register('contactNumber', {
                          required: 'Company Contact No. is required.',
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
                            const value = e.target.value.replace(/\D/g, '');
                            setValue('contactNumber', value);
                          },
                        })}
                      />
                      {errors.contactNumber && (
                        <span className="text-red-600">
                          {errors.contactNumber.message}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-span-2 w-full card flex justify-content-center flex-col text-[12px] flex-auto">
                    <label className="my-1">
                      <span className="text-red-500">*</span>
                      <span>Company Address</span>
                    </label>
                    <InputText
                      data-testid="companyAddress"
                      disabled={isSubmitting || action == 'view'}
                      className={classNames('w-full h-[150px] md:w-14rem', {
                        'p-invalid': errors.companyAddress,
                      })}
                      {...register('companyAddress', {
                        required: 'Company Address is required.',
                      })}
                    />
                    {errors.companyAddress && (
                      <span className="text-red-600">
                        {errors.companyAddress.message}
                      </span>
                    )}
                  </div>
                </div>
                <Controller
                  name="urlLogo"
                  control={control}
                  render={({ field, fieldState }) => (
                    <div className="flex flex-col ml-4 w-[127px] ">
                      <label>
                        <div
                          className={classNames(
                            'relative w-[127px] h-[127px] border-2 border-gray-300 rounded flex flex-col justify-center items-center hover:cursor-pointer text-gray-600',
                            {
                              'border-red-300 text-red-600': errors.urlLogo,
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
                          disabled={isSubmitting || action == 'view'}
                          type="file"
                          className={classNames('hidden', {
                            'p-invalid': errors.urlLogo,
                          })}
                          {...register('urlLogo', {
                            required: false,
                          })}
                          accept="image/*"
                          onChange={async (event: any) => {
                            const file = event.target.files?.[0];
                            if (file) {
                              if (file.size > 52428800) {
                                toast.current?.replace({
                                  severity: 'error',
                                  detail: 'File size should be less than 50MB.',
                                  sticky: true,
                                  closable: true,
                                });
                                return;
                              }
                              const timeUploaded = new Date().getTime();
                              const uploadPPurl = await fileUploadToCloud({
                                timeUploaded: timeUploaded,
                                file: file,
                              });

                              if (uploadPPurl) {
                                setSelectedLogo({
                                  text: '',
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
                      <span className="my-2 text-sm flex items-center justify-center">
                        {selectedLogo.text}
                      </span>
                    </div>
                  )}
                />
              </div>

              <div className="flex md:flex-row flex-col gap-5 mt-5">
                <Controller
                  name="chargePerEmployee"
                  control={control}
                  rules={{
                    required: 'Charge per Employee is required.',
                  }}
                  render={({ field, fieldState }) => (
                    <div className="col-span-2 w-full card max-w-[27%] flex justify-content-center flex-col text-[12px] flex-auto">
                      <label className="my-1">
                        <span className="text-red-500">*</span>
                        <span>Charge per Employee</span>
                      </label>
                      <InputNumber
                        data-testid="charge-per-employee"
                        min={0}
                        disabled={isSubmitting || action == 'view'}
                        id={field.name}
                        ref={field.ref}
                        value={field.value}
                        onBlur={field.onBlur}
                        onChange={(e) => {
                          let amount = 0;
                          if (e.value != null) {
                            amount = e.value;
                          }
                          const charges = [...tierCharges];
                          // charges[0].charge = amount;
                          // charges[1].charge = amount * 2;
                          // charges[2].charge = amount * 3;
                          // charges[3].charge = amount * 4;
                          for (let i = 0; i < charges.length; i++) {
                            charges[i].charge = amount * (i + 1);
                          }

                          field.onChange(e.value);
                          setTierCharges(() => charges);
                        }}
                        className={classNames({
                          'p-invalid': fieldState.error,
                        })}
                      />
                      {errors.chargePerEmployee && (
                        <span className="text-red-600">
                          Charge per Employee is required.
                        </span>
                      )}
                    </div>
                  )}
                />
                <Controller
                  name="maxEmployee"
                  control={control}
                  rules={{
                    required: 'Max No. of Employee is required.',
                    min: 1,
                    validate: {
                      minVal: (v) => v > 0 || 'Max No. of Employee is required',
                    },
                  }}
                  render={({ field, fieldState }) => (
                    <div className="col-span-2 w-full card flex max-w-[27%] justify-content-center flex-col text-[12px] flex-auto">
                      <label className="my-1">
                        <span className="text-red-500">*</span>
                        <span>Max No. of Employee</span>
                      </label>
                      <InputNumber
                        data-testid="maxEmployee"
                        disabled={isSubmitting || action == 'view'}
                        min={1}
                        id={field.name}
                        ref={field.ref}
                        value={field.value}
                        onBlur={field.onBlur}
                        onChange={(e) => field.onChange(e.value)}
                        className={classNames({
                          'p-invalid': fieldState.error,
                        })}
                      />
                      {errors.maxEmployee && (
                        <span className="text-red-600">
                          Max No. of Employee is required.
                        </span>
                      )}
                    </div>
                  )}
                />

                <Controller
                  name="applyWithHoldingTax"
                  control={control}
                  render={({ field, fieldState }) => (
                    <div className="w-full card flex max-w-[27%] justify-content-center gap-1 flex-col text-[12px] flex-auto">
                      <label className="my-1">
                        <span>Apply Withholding Tax?</span>
                      </label>
                      <>
                        <label htmlFor={field.name}></label>
                        <InputSwitch
                          disabled={isSubmitting || action == 'view'}
                          inputId={field.name}
                          checked={field.value}
                          inputRef={field.ref}
                          className={classNames({
                            'p-invalid': fieldState.error,
                          })}
                          onChange={(e) => field.onChange(e.value)}
                        />
                      </>
                    </div>
                  )}
                />
                {errors.applyWithHoldingTax && (
                  <span className="text-red-600 text-[11px]">
                    {errors.applyWithHoldingTax.message}
                  </span>
                )}
              </div>
              <div className="pt-5">
                <b>Tier Charges</b>
                <DataTable key={tableKey} value={tierCharges}>
                  <Column
                    header="Range of Salary Disbursement"
                    // style={{ minWidth: '250px' }}

                    body={(tierData: any) => {
                      if (isRetrievingCharges) return <Skeleton />;
                      return (
                        <div className="">
                          {`Tier ${tierData.tier}:`}
                          <div className="gap-5 px-5">
                            <InputNumber
                              data-testid="tierStart"
                              min={0.01}
                              value={tierData.tierStart}
                              disabled={tierData.disabled || action == 'view'}
                              defaultValue={0.01}
                              mode="currency"
                              currency="PHP"
                              placeholder="₱0.01"
                              className="charge-input min-w-[40%] mr-5"
                              onValueChange={(e: any) => {
                                let value =
                                  !e.value || e.value === 0
                                    ? 0.01
                                    : parseFloat(e.value);
                                // if (value <= 0) {
                                //   value = parseFloat('0');
                                // }

                                setTierCharges((prevState: any) => {
                                  const newState = [...prevState];
                                  newState[tierData.tier - 1].tierStart = value;
                                  return newState;
                                });
                              }}
                            ></InputNumber>
                            {`   to   `}
                            <InputNumber
                              data-testid="tierEnd"
                              value={tierData.tierEnd}
                              disabled={tierData.disabled}
                              min={0.01}
                              defaultValue={0.01}
                              mode="currency"
                              currency="PHP"
                              placeholder="₱0.01"
                              className="charge-input min-w-[40%] ml-5"
                              onChange={(e: any) => {
                                let value =
                                  !e.value || e.value === 0 ? 0.01 : e.value;
                                setTierCharges((prevState: any) => {
                                  const newState = [...prevState];
                                  newState[tierData.tier - 1].tierEnd = value;
                                  return newState;
                                });
                              }}
                            ></InputNumber>
                          </div>
                        </div>
                      );
                    }}
                  ></Column>
                  <Column
                    field="actions"
                    header={`Charge`}
                    body={(tierData: any) => {
                      if (isRetrievingCharges) return <Skeleton />;

                      return (
                        <div className="flex flex-row gap-5">
                          <InputNumber
                            placeholder="₱0.00"
                            value={tierData.charge}
                            disabled={tierData.disabled || action == 'view'}
                            mode="currency"
                            currency="PHP"
                            className="charge-input min-w-[40%]"
                            onChange={(e: any) => {
                              setTierCharges((prevState: any) => {
                                let value = !e.value ? 0 : e.value;
                                const newState = [...prevState];
                                newState[tierData.tier - 1].charge = value;
                                return newState;
                              });
                            }}
                          ></InputNumber>
                        </div>
                      );
                    }}
                  ></Column>

                  <Column
                    field="Edit"
                    header="Edit"
                    bodyClassName="mx-2 px-2"
                    className="min-w-[150px]"
                    body={(tierData: any) => (
                      <>
                        <div className="flex gap-2">
                          {tierData.disabled ? (
                            <Button
                              data-testid={tierData.tier}
                              disabled={action == 'view' || isRetrievingCharges}
                              type="button"
                              icon="pi pi-pencil"
                              rounded
                              outlined
                              className="mr-2"
                              tooltip="Enable Edit"
                              tooltipOptions={{ position: 'top' }}
                              onClick={(e: any) => {
                                const tier = tierData.tier;
                                setTierCharges((prevState: any) => {
                                  const newState = [...prevState];
                                  newState[tier - 1].disabled = false;
                                  return newState;
                                });
                              }}
                            />
                          ) : (
                            <Button
                              disabled={action == 'view' || isRetrievingCharges}
                              type="button"
                              icon="pi pi-pencil"
                              rounded
                              outlined
                              className="mr-2"
                              tooltip="Disable Edit"
                              tooltipOptions={{ position: 'top' }}
                              onClick={(e: any) => {
                                const tier = tierData.tier;
                                setTierCharges((prevState: any) => {
                                  const newState = [...prevState];
                                  // newState[tier - 1].tierStart =
                                  //   tierData.tierStart;
                                  // newState[tier - 1].tierEnd = tierData.tierEnd;
                                  // newState[tier - 1].charge = tierData.charge;
                                  // newState[tier - 1].chargeMoreThreshold =
                                  //   tierData.chargeMoreThreshold;
                                  newState[tier - 1].disabled = true;
                                  return newState;
                                });
                              }}
                            />
                          )}
                          {tierCharges.length > 4 &&
                            tierData.tier == tierCharges.length && (
                              <>
                                <Button
                                  disabled={
                                    action == 'view' || isRetrievingCharges
                                  }
                                  type="button"
                                  icon="pi pi-trash"
                                  tooltip="Delete"
                                  rounded
                                  outlined
                                  className="ml-2"
                                  tooltipOptions={{ position: 'top' }}
                                  onClick={(e: any) => {
                                    setTierCharges((prevState: any) => {
                                      const newState = [...prevState];
                                      newState.pop();
                                      return newState;
                                    });
                                  }}
                                />
                              </>
                            )}
                        </div>
                      </>
                    )}
                  ></Column>
                </DataTable>
                <Button
                  type="button"
                  text
                  icon="pi pi-plus text-[30px] font-bold text-[#009F10]"
                  tooltip="Add Tier Charge"
                  tooltipOptions={{ position: 'bottom' }}
                  onClick={(e) => {
                    // console.log('rowData', rowData);
                    // console.log('tierCharges', tierCharges);
                    let tempTierCharges = {
                      companyChargeId: null,
                      charge:
                        action == 'edit'
                          ? tierCharges[tierCharges.length - 1]?.charge +
                            rowData.chargePerEmployee
                          : 0,
                      disabled: false,
                      tier: tierCharges?.length + 1 || 1,
                      tierEnd:
                        tierCharges[tierCharges.length - 1]?.tierEnd +
                          (tierCharges[tierCharges.length - 1]?.tierEnd -
                            tierCharges[tierCharges.length - 1]?.tierStart) +
                          0.01 || 0.02,
                      tierStart:
                        tierCharges[tierCharges.length - 1]?.tierEnd + +0.01 ||
                        0.01,
                    };
                    // add
                    setNewTierCharges((prev: any) => [
                      ...prev,
                      tempTierCharges,
                    ]);
                    setTierCharges((prev: any) => [...prev, tempTierCharges]);
                  }}
                  style={{
                    background: '#F2F3FE',
                    borderColor: '#E5E7EB',
                    display: 'block',
                    width: '100%',
                    padding: '20px',
                    marginTop: '20px',
                  }}
                  disabled={action === 'view'}
                />
              </div>
            </div>

            {/* <div>
              <Divider align="left">
                <div className="inline-flex items-center">
                  <i className="pi pi-user mr-2"></i>
                  <b>Admin Details</b>
                </div>
              </Divider>
              <div className="flex flex-col w-[85%] gap-3">
                <div className="flex md:flex-row flex-col gap-5">
                  <div className="col-span-2 w-full card flex justify-content-center flex-col text-[12px] flex-auto">
                    <label className="my-1">
                      <span className="text-red-500">*</span>
                      <span>First Name</span>
                    </label>
                    <InputText
                      disabled={isSubmitting || action == 'view'}
                      autoComplete="off"
                      className={classNames('w-full', {
                        'p-invalid': errors.firstName,
                      })}
                      {...register('firstName', {
                        required: 'First Name is required.',
                      })}
                    />
                    {errors.firstName && (
                      <span className="text-red-600">
                        {errors.firstName.message}
                      </span>
                    )}
                  </div>
                  <div className="col-span-2 w-full card flex justify-content-center flex-col text-[12px] flex-auto">
                    <label className="my-1">
                      <span>Middle Name</span>
                    </label>
                    <InputText
                      disabled={isSubmitting || action == 'view'}
                      autoComplete="off"
                      className={classNames('w-full', {
                        'p-invalid': errors.middleName,
                      })}
                      {...register('middleName', {
                        required: false,
                      })}
                    />
                    {errors.middleName && (
                      <span className="text-red-600">
                        {errors.middleName.message}
                      </span>
                    )}
                  </div>
                  <div className="col-span-2 w-full card flex justify-content-center flex-col text-[12px] flex-auto">
                    <label className="my-1">
                      <span className="text-red-500">*</span>
                      <span>Last Name</span>
                    </label>
                    <InputText
                      disabled={isSubmitting || action == 'view'}
                      autoComplete="off"
                      className={classNames('w-full', {
                        'p-invalid': errors.lastName,
                      })}
                      {...register('lastName', {
                        required: 'Last Name is required.',
                      })}
                    />
                    {errors.lastName && (
                      <span className="text-red-600">
                        {errors.lastName.message}
                      </span>
                    )}
                  </div>

                  <div className="col-span-2 w-full card flex justify-content-center flex-col text-[12px] flex-auto">
                    <label className="my-1">
                      <span>Suffix</span>
                    </label>
                    <InputText
                      disabled={isSubmitting || action == 'view'}
                      autoComplete="off"
                      className={classNames('w-full', {
                        'p-invalid': errors.suffix,
                      })}
                      {...register('suffix', {
                        required: false,
                      })}
                    />
                    {errors.suffix && (
                      <span className="text-red-600">
                        {errors.suffix.message}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex md:flex-row flex-col gap-5">
                  <div className="col-span-2 w-full card flex justify-content-center flex-col text-[12px] flex-auto">
                    <label className="my-1">
                      <span className="text-red-500">*</span>
                      <span>Email Address</span>
                    </label>
                    <input
                      autoComplete="off"
                      type="email"
                      disabled={
                        isSubmitting || action == 'view' || isCopyCompEmail
                      }
                      className={classNames(
                        'w-full p-inputtext p-component p-filled',
                        {
                          'p-invalid': errors.adminEmailAddress,
                        }
                      )}
                      {...register('adminEmailAddress', {
                        required: 'Admin Email Address is required.',
                        pattern: {
                          value: /\S+@\S+\.\S+/,
                          message: 'Invalid Email Address format.',
                        },
                      })}
                    />
                    {errors.adminEmailAddress && (
                      <span className="text-red-600">
                        {errors.adminEmailAddress.message}
                      </span>
                    )}
                    <div className="mt-2 flex align-items-center">
                      <Checkbox
                        inputId="copyCompanyEmail"
                        name="category"
                        value={isCopyCompEmail}
                        onChange={(e: any) => {
                          setIsCopyCompEmail(e.checked);
                          setValue(
                            'adminEmailAddress',
                            e.checked ? getValues('emailAddress') : ''
                          );
                        }}
                        checked={isCopyCompEmail}
                      />
                      <label htmlFor="copyCompanyEmail" className="ml-2">
                        Copy Company Email Address
                      </label>
                    </div>
                  </div>

                  <div className="col-span-2 w-full card flex justify-content-center flex-col text-[12px] flex-auto">
                    <label className="my-1">
                      <span className="text-red-500">*</span>
                      <span>Contact Number</span>
                    </label>
                    <input
                      disabled={
                        isSubmitting || isCopyCompContactNo || action == 'view'
                      }
                      type="text"
                      autoComplete="off"
                      maxLength={11}
                      className={classNames(
                        'w-full p-inputtext p-component p-filled',
                        {
                          'p-invalid': errors.adminContactNumber,
                        }
                      )}
                      {...register('adminContactNumber', {
                        required: 'Contact Number is required.',
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
                          const value = e.target.value.replace(/\D/g, '');
                          setValue('adminContactNumber', value);
                        },
                      })}
                    />
                    <div className="mt-2 flex align-items-center">
                      <Checkbox
                        inputId="copyCompanyContactNo"
                        name="category"
                        value={isCopyCompContactNo}
                        onChange={(e: any) => {
                          setIsCopyCompContactNo(e.checked);
                          setValue(
                            'adminContactNumber',
                            e.checked ? getValues('contactNumber') : ''
                          );
                        }}
                        checked={isCopyCompContactNo}
                      />
                      <label htmlFor="copyCompanyContactNo" className="ml-2">
                        Copy Company Contact No.
                      </label>
                    </div>
                    {errors.adminContactNumber && (
                      <span className="text-red-600">
                        {errors.adminContactNumber.message}
                      </span>
                    )}
                  </div>
                  <div className="col-span-2 w-full card flex justify-content-center flex-col text-[12px] flex-auto">
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
                          disabled={isSubmitting || action == 'view'}
                          inputId={field.name}
                          id={field.name}
                          ref={field.ref}
                          value={field.value}
                          onBlur={field.onBlur}
                          onChange={(e) => field.onChange(e.value)}
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
                </div>
              </div>
            </div> */}
            <div className="flex flex-col sm:flex-row gap-3 my-[50px]">
              {action == 'edit' && (
                <div className="w-full flex justify-start">
                  <div className="card flex justify-content-center">
                    <Controller
                      name="companyStatus"
                      control={control}
                      render={({ field, fieldState }) => (
                        <>
                          <label htmlFor={field.name}></label>
                          <InputSwitch
                            disabled={isSubmitting}
                            inputId={field.name}
                            checked={field.value}
                            inputRef={field.ref}
                            className={classNames({
                              'p-invalid': fieldState.error,
                            })}
                            onChange={(e) => field.onChange(e.value)}
                          />
                        </>
                      )}
                    />
                  </div>
                  <span className="ml-5">
                    {rowData && rowData.isActive
                      ? 'Deactivate Company'
                      : 'Activate Company'}
                  </span>
                </div>
              )}
              <div className="w-full flex justify-end">
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
                      action == 'add' &&
                      (!isDirty ||
                        !isValid ||
                        isSubmitting ||
                        Object.keys(errors).length > 0)
                    }
                  />
                )}
              </div>
            </div>
          </form>
        </React.Fragment>
      </Sidebar>
    </>
  );

  async function checkDuplicateCompanyDetails({
    companyName,
    companyId,
  }: {
    companyName: string;
    companyId: string | null;
  }) {
    let countError = 0;
    const duplicateCN = await checkDuplicateCompanyName({
      companyId: companyId,
      companyName: companyName,
    });

    if (duplicateCN) {
      // toast.current?.replace({
      //   severity: 'error',
      //   detail: 'Company Name already taken.',
      //   life: 5000,
      // });
      setError('companyName', {
        type: 'Duplicate',
        message: 'Company Name already exists.',
      });
      countError++;
    }
    return countError > 0 ? false : true;
  }

  async function checkDuplicateAdminDetails({
    emailAddress,
    contactNumber,
    userId,
  }: {
    emailAddress: string;
    contactNumber: string;
    userId: string | null;
  }) {
    let countError = 0;
    const duplicateEM = await checkDuplicateEmail({
      userId: userId,
      emailAddress: emailAddress,
    });
    const duplicateContact = await checkDuplicateContactNum({
      userId: userId,
      contactNumber: contactNumber,
    });
    if (duplicateEM) {
      // toast.current?.replace({
      //   severity: 'error',
      //   detail: 'Email Address already exists.',
      //   life: 5000,
      // });
      setError('emailAddress', {
        type: 'Duplicate',
        message: 'Email Address already exists.',
      });
      countError++;
    }

    if (duplicateContact) {
      // toast.current?.replace({
      //   severity: 'error',
      //   detail: 'Contact number already exists.',
      //   life: 5000,
      // });
      setError('contactNumber', {
        type: 'Duplicate',
        message: 'Contact number already exists.',
      });
      countError++;
    }

    return countError > 0 ? false : true;
  }
};

export default CompanySidebar;
