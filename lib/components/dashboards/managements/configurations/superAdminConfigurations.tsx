'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import PayCycleForms from './payCycleForms';
import axios from 'axios';
import { InputText } from 'primereact/inputtext';
import {
  InputNumber,
  InputNumberValueChangeEvent,
} from 'primereact/inputnumber';
import { GlobalContainer } from 'lib/context/globalContext';
import { Divider } from 'primereact/divider';
import { InputSwitch } from 'primereact/inputswitch';
import { Tooltip } from 'primereact/tooltip';
import { Input } from 'postcss';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Skeleton } from 'primereact/skeleton';
import { isNumber } from '@utils/helper';
import { amountFormatter } from '@utils/helper';
import charge from 'db/models/charge';
import { MultiSelect } from 'primereact/multiselect';
const emailRe = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const SuperAdminConfigurations = () => {
  const context = React.useContext(GlobalContainer);
  const sessionData = context?.userData;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const company = useRef<any>(null);

  const [emailError, setEmailError] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [emailContacts, setEmailContacts] = useState<any>([]);
  // const [allCompanies, setAllCompanies] = useState<any>([]);
  const [phoneContacts, setPhoneContacts] = useState<any>([]);
  // const [chargedCompanies, setChargedCompanies] = useState<any>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<any>([]);
  const [emailInput, setEmailInput] = useState<any>('');
  const [phoneInput, setPhoneInput] = useState<any>('');
  const [threshold, setThreshold] = useState<any>(100);
  const [tierCharges, setTierCharges] = useState<any>([]);
  const [refresh, setRefresh] = useState(false);
  const toast = useRef<Toast>(null);
  const [tableKey, setTableKey] = useState(0);
  useEffect(() => {
    setIsLoading(true);
    axios
      .get(`/api/configurations`, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
        },
      })
      .then((res) => {
        setIsLoading(false);

        setEmailContacts(() => res.data.message.emailContacts);
        setPhoneContacts(() => res.data.message.phoneContacts);
        // setThreshold(() => res.data.message.threshold);
        // setSelectedCompanies(() => res.data.message.chargedCompanies);
        // setAllCompanies(() => res.data.message.allCompanies);
        // console.log(res.data.message);
        // console.log(res.data.message.allCompanies);
        // let tierArr: any = [];
        // const sortedTierArr = res.data.message.charges.sort(
        //   (a: any, b: any) => {
        //     return a.tierNumber - b.tierNumber;
        //   }
        // );
        // tierArr = sortedTierArr.map((item: any, index: number) => {
        //   return {
        //     chargeId: item.chargeId,
        //     tierStart: item.tierStart,
        //     tierEnd: item.tierEnd,
        //     chargeLessThreshold: item.chargeLessThreshold,
        //     chargeMoreThreshold: item.chargeMoreThreshold,
        //     disabled: true,
        //     tier: index + 1,
        //   };
        // });

        // setTierCharges(() => tierArr);
      })
      .catch((error) => {
        setIsLoading(false);
        console.error('Error fetching configurations:', error);
        // Handle error state or display a message to the user
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  const handleSubmit = async () => {
    // check if working days is not empty
    if (isLoading) return;
    setIsSubmitting(true);
    toast.current?.replace({
      severity: 'info',
      summary: 'Submitting Request',
      // detail: 'Please wait...',
      sticky: true,
    });
    // check if starting salary of first tier is not 0
    // if (tierCharges[0].tierStart != 0.01) {
    //   setIsSubmitting(false);
    //   toast.current?.replace({
    //     severity: 'error',
    //     summary: 'Invalid Tier Value',
    //     detail: 'Starting Salary of First Tier must be 0.01',
    //     sticky: true,
    //   });
    //   return;
    // }
    // validate tier values
    let hasError = false;
    let errorMessage = '';
    // for (let i = 0; i < tierCharges.length; i++) {
    //   // if tier values are null or not provided
    //   if (
    //     tierCharges[i].tierStart === null ||
    //     tierCharges[i].tierEnd === null ||
    //     tierCharges[i].chargeLessThreshold === null ||
    //     tierCharges[i].chargeMoreThreshold === null
    //   ) {
    //     errorMessage = 'Missing Tier Values';
    //     hasError = true;
    //     break;
    //   }
    //   // check on previous tiers
    //   for (let j = 0; j < i; j++) {
    //     if (tierCharges[i].tierStart <= tierCharges[j].tierEnd) {
    //       errorMessage = `Tier ${
    //         i + 1
    //       } Start Salary must be greater than Tier ${j + 1} End Salary`;
    //       hasError = true;
    //       break;
    //     }
    //   }
    //   // start salary must be less than end salary
    //   if (tierCharges[i].tierStart >= tierCharges[i].tierEnd) {
    //     errorMessage = `Tier ${i + 1} Start Salary must be less than Tier ${
    //       i + 1
    //     } End Salary`;
    //     hasError = true;
    //     break;
    //   }
    // }
    // if (hasError) {
    //   setIsSubmitting(false);
    //   toast.current?.replace({
    //     severity: 'error',
    //     summary: 'Invalid Tier Value',
    //     detail: errorMessage,
    //     sticky: true,
    //   });
    //   return;
    // }
    axios
      .post(
        `/api/configurations`,
        {
          emailContacts,
          phoneContacts,
          threshold,
          tierCharges,
          selectedCompanies,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
          },
        }
      )
      .then((res: any) => {
        // if (res.data.success) {
        //     setIsSubmitted(true);
        //     setIsSubmitting(false);
        // }
        setIsSubmitting(false);
        setIsSubmitting(false);
        toast.current?.replace({
          severity: res.data.success ? 'success' : 'error',
          summary: res.data.message,
          life: 3000,
        });
      });
    setTableKey(tableKey === 0 ? 1 : 0);
    setRefresh(() => !refresh);
  };

  return (
    <div className="w-screen h-screen overflow-auto p-5">
      <Toast ref={toast} position="bottom-left" />
      {/* DASHBOARD NAV */}

      {/* MAIN CONTENT */}
      <div className="line-container rounded-lg p-5 flex flex-col gap-5">
        <div
          className="flex flex-col md:flex-col mt-6 px-10 gap-5 rounded-lg py-[20px] align-middle overflow-x-scroll md:overflow-x-hidden"
          style={{
            background: '#F2F3FE',
          }}
        >
          <div className="inline-flex items-center">
            <i className="pi pi-user mr-2"></i>
            <p className="font-bold text-[18px]">
              Failed Disbursement Contacts
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-5 mt-6">
            {!isLoading ? (
              <div className=" line-container w-full md:w-[50%] flex flex-col gap-5 p-5 rounded-lg">
                <label>Email</label>
                <div className="flex flex-row gap-5">
                  <div className="flex flex-col w-full">
                    <InputText
                      disabled={isLoading}
                      className="w-full"
                      placeholder="Enter Email"
                      value={emailInput}
                      onChange={(e: any) => {
                        if (emailRe.test(e.target.value)) {
                          setEmailError('');
                        }

                        setEmailInput(e.target.value);
                      }}
                    />
                    {emailError && (
                      <span className="text-red-500">{emailError}</span>
                    )}
                  </div>

                  <Button
                    disabled={isLoading}
                    className=" h-[40px]"
                    onClick={() => {
                      if (!emailRe.test(emailInput)) {
                        setEmailError('Please enter a valid email address.');
                        return;
                      }
                      if (emailContacts.includes(emailInput)) {
                        setEmailError('Duplicate email address.');
                        return;
                      }
                      setEmailContacts(() => [...emailContacts, emailInput]);

                      setEmailInput('');
                    }}
                  >
                    Add
                  </Button>
                </div>

                <DataTable
                  paginator
                  rowsPerPageOptions={[5, 10, 15]}
                  rows={5}
                  value={emailContacts}
                >
                  <Column
                    field="email"
                    header="Email"
                    body={(data: any) => data}
                    style={{ minWidth: '250px' }}
                  ></Column>
                  <Column
                    field="actions"
                    header="Actions"
                    body={(data: any) => (
                      <div className="flex flex-row gap-5">
                        <Button
                          className=" h-[40px]"
                          onClick={() => {
                            setEmailContacts(
                              emailContacts.filter((item: any) => item !== data)
                            );
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  ></Column>
                </DataTable>
              </div>
            ) : (
              <Skeleton height="20rem" />
            )}

            {!isLoading ? (
              <div className=" line-container  w-full md:w-[50%] flex flex-col gap-5 p-5  rounded-lg">
                <label>Contact No.</label>
                <div className="flex flex-row gap-5">
                  <div className="flex flex-col w-full">
                    <InputText
                      disabled={isLoading}
                      className="w-full"
                      placeholder="Enter Phone Number"
                      value={phoneInput}
                      onChange={(e: any) => {
                        setPhoneError('');

                        setPhoneInput(e.target.value);
                      }}
                      maxLength={11}
                    />
                    {phoneError && (
                      <span className="text-red-500">{phoneError}</span>
                    )}
                  </div>

                  <Button
                    disabled={isLoading}
                    onClick={() => {
                      let hasError = false;
                      if (
                        !phoneInput ||
                        !phoneInput.startsWith('0') ||
                        !isNumber(phoneInput)
                      ) {
                        hasError = true;
                      } else if (phoneInput.startsWith('0')) {
                        if (!phoneInput.startsWith('09')) hasError = true;
                        else if (phoneInput.length != 11) hasError = true;
                      }
                      if (phoneContacts.includes(phoneInput)) {
                        setPhoneError('Duplicate phone number.');
                        return;
                      }
                      if (hasError) {
                        setPhoneError('Please enter a valid phone number.');
                        return;
                      }
                      setPhoneInput('');
                      setPhoneContacts([...phoneContacts, phoneInput]);
                    }}
                    className="h-[40px]"
                  >
                    Add
                  </Button>
                </div>
                <DataTable
                  className="p-datatable-space-between-columns"
                  paginator
                  rowsPerPageOptions={[5, 10, 15]}
                  rows={5}
                  value={phoneContacts}
                >
                  <Column
                    header="Number"
                    body={(data: any) => data}
                    style={{ minWidth: '250px' }}
                  ></Column>
                  <Column
                    header="Actions"
                    field="actions"
                    body={(data: any) => (
                      <div className="flex flex-row gap-5">
                        <Button
                          className=" h-[40px]"
                          onClick={() => {
                            setPhoneContacts(
                              phoneContacts.filter((item: any) => item !== data)
                            );
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  ></Column>
                </DataTable>
              </div>
            ) : (
              <Skeleton height="20rem" />
            )}
          </div>
          <div className="flex justify-end mt-2"></div>
        </div>
        {/* <div
          className="flex flex-col md:flex-col mt-6 px-10 gap-5 rounded-lg py-[20px] align-middle overflow-x-scroll md:overflow-x-hidden"
          style={{
            background: '#F2F3FE',
          }}
        >
          <div className="inline-flex items-center">
            <i className="pi pi-money-bill mr-2"></i>
            <p className="font-bold text-[18px]">Charges</p>
          </div>
          <div>
            <div className="flex flex-row gap-2  rounded-lg">
              <div className="flex flex-col gap-2 py-5  rounded-lg w-[50%]">
                <label>Charged Companies (Tiered)</label>
                <MultiSelect
                  filter
                  options={allCompanies}
                  value={selectedCompanies}
                  disabled={isLoading}
                  optionLabel="companyName"
                  placeholder="Select Companies"
                  onChange={(e: any) => {
                    setSelectedCompanies(e.value);
                    console.log(e.value);
                  }}
                  width={'50%'}
                />
              </div>
              <div className="flex flex-col gap-2 p-5  rounded-lg">
                <label>Threshold</label>
                <InputNumber
                  inputId="integeronly"
                  className="max-w-[40px] md:max-w-[400px]  w-[10px] "
                  disabled={isLoading ? true : false}
                  min={1}
                  maxLength={10}
                  name="threshold"
                  value={threshold}
                  placeholder="1"
                  onValueChange={(e: InputNumberValueChangeEvent) => {
                    let value = !e.value ? 1 : e.value;
                    setThreshold(value);
                  }}
                  // placeholder="Enter Threshold"
                  required
                />
              </div>
            </div>
            tier table
            <DataTable key={tableKey} value={tierCharges}>
              <Column
                header="Range of Salary Disbursement"
                style={{ minWidth: '250px' }}
                body={(data: any) => (
                  <>
                    {`Tier ${data.tier}:`}
                    <div>
                      <InputNumber
                        min={0.01}
                        value={data.tierStart}
                        disabled={data.disabled || isLoading}
                        defaultValue={0.01}
                        mode="currency"
                        currency="PHP"
                        placeholder="₱0.01"
                        className="charge-input"
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
                            newState[data.tier - 1].tierStart = value;
                            return newState;
                          });
                        }}
                      ></InputNumber>
                      {`   to   `}
                      <InputNumber
                        value={data.tierEnd}
                        disabled={data.disabled || isLoading}
                        min={0.01}
                        defaultValue={0.01}
                        mode="currency"
                        currency="PHP"
                        placeholder="₱0.01"
                        className="charge-input"
                        onChange={(e: any) => {
                          let value =
                            !e.value || e.value === 0 ? 0.01 : e.value;
                          setTierCharges((prevState: any) => {
                            const newState = [...prevState];
                            newState[data.tier - 1].tierEnd = value;
                            return newState;
                          });
                        }}
                      ></InputNumber>
                    </div>
                  </>
                )}
              ></Column>
              <Column
                field="actions"
                header={`Fees less than or equal to ${threshold} Employees`}
                body={(data: any) => (
                  <div className="flex flex-row gap-5">
                    <InputNumber
                      placeholder="₱0.00"
                      value={data.chargeLessThreshold || isLoading}
                      disabled={data.disabled || isLoading}
                      mode="currency"
                      currency="PHP"
                      className="charge-input"
                      onChange={(e: any) => {
                        setTierCharges((prevState: any) => {
                          let value = !e.value ? 0 : e.value;
                          const newState = [...prevState];
                          newState[data.tier - 1].chargeLessThreshold = value;
                          return newState;
                        });
                      }}
                    ></InputNumber>
                  </div>
                )}
              ></Column>
              <Column
                field="actions"
                header={`Fees more than ${threshold} Employees`}
                body={(data: any) => (
                  <div className="flex flex-row gap-5">
                    <InputNumber
                      placeholder="₱0.00"
                      value={data.chargeMoreThreshold || isLoading}
                      disabled={data.disabled || isLoading}
                      mode="currency"
                      currency="PHP"
                      className="charge-input"
                      onChange={(e: any) => {
                        let value = !e.value ? 0 : e.value;

                        setTierCharges((prevState: any) => {
                          const newState = [...prevState];
                          newState[data.tier - 1].chargeMoreThreshold = value;
                          return newState;
                        });
                      }}
                    ></InputNumber>
                  </div>
                )}
              ></Column>
              <Column
                field="Edit"
                header="Edit"
                body={(data: any) => (
                  <>
                    {data.disabled ? (
                      <Button
                        icon="pi pi-pencil"
                        rounded
                        disabled={isLoading}
                        outlined
                        className="mr-2"
                        tooltip="Enable Edit"
                        tooltipOptions={{ position: 'top' }}
                        onClick={(e: any) => {
                          const tier = data.tier;
                          setTierCharges((prevState: any) => {
                            const newState = [...prevState];
                            newState[tier - 1].disabled = false;
                            return newState;
                          });
                        }}
                      />
                    ) : (
                      <Button
                        icon="pi pi-pencil"
                        rounded
                        disabled={isLoading}
                        outlined
                        className="mr-2"
                        tooltip="Disable Edit"
                        tooltipOptions={{ position: 'top' }}
                        onClick={(e: any) => {
                          const tier = data.tier;
                          setTierCharges((prevState: any) => {
                            const newState = [...prevState];
                            newState[tier - 1].tierStart = data.tierStart;
                            newState[tier - 1].tierEnd = data.tierEnd;
                            newState[tier - 1].chargeLessThreshold =
                              data.chargeLessThreshold;
                            newState[tier - 1].chargeMoreThreshold =
                              data.chargeMoreThreshold;
                            newState[tier - 1].disabled = true;
                            return newState;
                          });
                        }}
                      />
                    )}
                  </>
                )}
              ></Column>
            </DataTable>
          </div>
        </div> */}
        <Button
          label={'Save'}
          className="rounded-full w-[200px] px-10 p-button self-end"
          onClick={handleSubmit}
          disabled={isSubmitting || isLoading}
        />
      </div>
    </div>
  );
};

export default SuperAdminConfigurations;
