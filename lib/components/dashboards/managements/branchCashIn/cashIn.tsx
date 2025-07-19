'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import axios from 'axios';
import { Steps } from 'primereact/steps';
import { InputNumber } from 'primereact/inputnumber';
import { amountFormatter, uuidv4 } from '@utils/helper';
import classNames from 'classnames';
import moment from '@constant/momentTZ';
import { ProgressSpinner } from 'primereact/progressspinner';
import { TabPanel, TabView } from 'primereact/tabview';
import { Paginator } from 'primereact/paginator';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { formatAmount } from '@utils/dashboardFunction';
import { useQuery } from '@tanstack/react-query';
import DashboardNav from 'lib/components/blocks/dashboardNav';
import CashinTransctionLogs from './transactionLogs';
import { Timeline } from 'primereact/timeline';
import { Skeleton } from 'primereact/skeleton';
import { Dropdown } from 'primereact/dropdown';
import CancelTransactionSidebar from './cancelTransactionSideBar';
import ErrorDialog from 'lib/components/blocks/errorDialog';

const BranchCashIn = () => {
  const toast = useRef<Toast>(null);
  const [currentStep, setCurrentStep] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [isSending, setIsSending] = useState(false);
  const [nonce, setNonce] = useState(uuidv4());
  const [cashInDetails, setCashInDetails] = useState<any>({
    type: null,
    amountToSend: 0,
    paymentMethod: null,
    transactionCode: null,
    quickResponseCode: null,
    status: null,
    dateCreated: null,
  });
  const [pagination, setPagination] = useState({
    offset: 0,
    limit: 5,
    first: 0,
  });
  const [valueSearchText, setValueSearchText] = useState('');
  const [sideBarConfig, setSideBarConfig] = useState<any>({
    rowData: null,
    isOpen: false,
  });
const [activeIndex, setActiveIndex] = useState(0);
const [cancelTransactionSidebarConfig, setCancelTransactionSidebarConfig] =
  useState({
    rowData: null,
    isOpen: false,
  });

const createNewTransaction = async () => {
  await axios.put(
    '/api/companies/cashin',
    {
      status: 'CONFIRMED',
      transactionCode: cashInDetails.transactionCode,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
      },
    }
  );

  setCashInDetails({
    amountToSend: 0,
    type: null,
    quickResponseCode: null,
    transactionCode: null,
    status: null,
    dateCreated: null,
  });
  setCurrentStep(0);
};

useEffect(() => {
  axios
    .get('/api/companies/cashin?get=FROM_DB', {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
      },
    })
    .then((res: any) => {
      const DBresponse = res.data;
      if (DBresponse.success) {
        const DBdata = DBresponse.data;
        if (DBdata) {
          const type = DBdata.via;
          const transactionCode = DBdata.transactionCode;
          const principalAmount = DBdata.principalAmount;
          const quickResponseCode = DBdata.quickResponseCode;

          if (DBdata.status == 'PENDING') {
            setCashInDetails((prev: any) => ({
              ...prev,
              type: type,
              transactionCode: transactionCode,
              amountToSend: principalAmount,
              companyAccountId: DBdata.companyAccountId,
              companyName: DBdata.companyName,
              companyContactNumber: DBdata.companyContactNumber,
              companyAddress: DBdata.companyAddress,
              quickResponseCode: quickResponseCode,
              status: 'PENDING',
            }));
            setCurrentStep(2);
          } else {
            createNewTransaction();
          }
        } else {
          setCashInDetails({
            amountToSend: 0,
            type: null,
            quickResponseCode: null,
            transactionCode: null,
            status: null,
            dateCreated: null,
          });
          setCurrentStep(0);
        }
      }
    })
    .catch((error: any) => {
      console.log(error);
    });

  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [sideBarConfig]);

const handleSubmit = async () => {
  setError(null);
  setIsSending(true);
  // Cash In
  if (currentStep == 0) {
    setIsSending(false);
    if (!cashInDetails.amountToSend || cashInDetails.amountToSend == 0) {
      setError({ amountToSend: { message: 'Please enter amount.' } });
      return;
    }
    setCurrentStep(1);
    setCashInDetails((prev: any) => ({ ...prev, paymentMethod: null }));
  }
  // Selecting Payment Method
  else if (currentStep == 1) {
    if (!cashInDetails.paymentMethod) {
      setError({
        paymentMethod: { message: 'Please select Payment Method.' },
      });
      setIsSending(false);
      return;
    }

    toast.current?.replace({
      severity: 'info',
      summary: 'Submitting request',
      detail: 'Please wait...',
      closable: false,
      sticky: true,
    });

    const cashIn: any = await axios.post(
      `/api/companies/cashin?paymentMethod=${cashInDetails.paymentMethod}`,
      {
        amount: cashInDetails.amountToSend,
        nonce: nonce,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
        },
      }
    );

    const response = cashIn?.data;
    if (!response.success) {
      toast.current?.replace({
        severity: 'error',
        summary: response.message,
        sticky: true,
        closable: true,
      });
      return false;
    }
    setCurrentStep(2);
    setCashInDetails((prev: any) => ({
      ...prev,
      transactionCode: response.transactionCode,
      type: response.type,
      companyAccountId: response.companyAccountId,
      companyName: response.companyName,
      companyContactNumber: response.companyContactNumber,
      companyAddress: response.companyAddress,
      status: 'PENDING',
    }));
    setIsSending(false);

    toast.current?.replace({
      severity: 'success',
      summary: 'Transaction has been created.',
      life: 3000,
    });
    transactionsQuery.refetch();
  }

  // Confirm Transaction
  else if (currentStep == 2) {
    const cancelCashIn: any = await axios.put(
      '/api/companies/cashin',
      {
        status: 'CONFIRMED',
        transactionCode: cashInDetails.transactionCode,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
        },
      }
    );

    const response = cancelCashIn?.data;
    if (!response.success) {
      toast.current?.replace({
        severity: 'error',
        summary: response.message,
        sticky: true,
        closable: true,
      });
      return false;
    }

    setCashInDetails({
      amountToSend: 0,
      type: null,
      quickResponseCode: null,
      transactionCode: null,
      status: null,
      dateCreated: null,
    });
    setCurrentStep(0);
    setIsSending(false);
    setNonce(uuidv4());
  }
};

const items = [
  {
    label: 'Cash In',
  },
  {
    label: 'Choose Payment Method',
  },
  // {
  //   label: 'Payment',
  // },
  {
    label: 'Summary',
  },
];

const transactionsQuery: any = useQuery({
  // refetchOnMount: false,
  refetchOnWindowFocus: true,
  queryKey: ['transactionsQuery', pagination, valueSearchText],
  queryFn: () =>
    fetch(
      `/api/companies/cashin/transactions?limit=${pagination.limit}&offset=${pagination.offset}&search=${valueSearchText}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
        },
      }
    )
      .then((res) => res.json())
      .catch((err) => console.error(err)),
});

const customizedContent = (item: any) => {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: item.content,
      }}
    />
  );
};

const changeTabHandler = async (e: any) => {
  setActiveIndex(e.index);
  if (e.index == 1) {
    transactionsQuery.refetch();
  }
};
return (
  <div className="w-screen h-screen overflow-auto p-5">
    <Toast ref={toast} position="bottom-left" />
    {/* DASHBOARD NAV */}
    <DashboardNav
      navTitle="Transactions > Cash In"
      buttons={[]}
      searchPlaceholder=""
      isShowSearch={false}
    />

    {/* MAIN CONTENT */}
    <div className="line-container rounded-lg p-5">
      <TabView
        activeIndex={activeIndex}
        onTabChange={(e: any) => changeTabHandler(e)}
      >
        <TabPanel header="Process Cash In">
          {currentStep == null ? (
            <div className="my-[50px] max-w-[700px] m-auto">
              <div className="my-5">
                <Steps model={items} activeIndex={currentStep} />
              </div>
              <div className="w-full flex justify-center">
                <ProgressSpinner />
              </div>
            </div>
          ) : (
            <div className="my-[50px] max-w-[700px] m-auto">
              <div className="my-5">
                <Steps model={items} activeIndex={currentStep} />
              </div>
              {currentStep == 0 && (
                <div className="my-10">
                  <label className="font-bold">
                    <span className="text-red-500">*</span> Enter Amount to Send
                  </label>
                  <div className="p-inputgroup flex-1">
                    <span className="p-inputgroup-addon">&#8369;</span>
                    <InputNumber
                      placeholder="Enter Cash In amount"
                      min={0}
                      minFractionDigits={2}
                      onChange={(e: any) => {
                        setCashInDetails((prev: any) => ({
                          ...prev,
                          amountToSend: e.value,
                        }));
                        const err = { ...error };
                        delete err.amountToSend;
                        setError(err);
                        setIsSending(false);
                      }}
                      disabled={isSending}
                      value={cashInDetails.amountToSend}
                    />
                  </div>
                  {error && error.amountToSend && (
                    <span className="text-red-500 text-xs">
                      {error.amountToSend.message}
                    </span>
                  )}
                </div>
              )}
              {currentStep == 1 && (
                <div className="my-10">
                  <label className="font-bold">
                    <span className="text-red-500">*</span> Please select
                    Payment Method
                  </label>
                  <Dropdown
                    value={cashInDetails.paymentMethod}
                    onChange={(e) => {
                      setCashInDetails((prev: any) => ({
                        ...prev,
                        paymentMethod: e.value,
                      }));
                      const err = { ...error };
                      delete err.paymentMethod;
                      setError(err);
                      setIsSending(false);
                    }}
                    options={[
                      { name: 'QR Ph', value: 'QRPH' },
                      { name: 'via Branch', value: 'BRANCH' },
                    ]}
                    optionLabel="name"
                    showClear
                    placeholder="Select Payment Method"
                    className="w-full md:w-14rem"
                    disabled={isSending}
                  />
                  {error && error.paymentMethod && (
                    <span className="text-red-500 text-xs">
                      {error.paymentMethod.message}
                    </span>
                  )}
                </div>
              )}

              {currentStep == 2 && (
                <div className="text-center p-5">
                  <div className="mb-5">
                    <Timeline
                      value={[
                        {
                          content: `
                                <div className="mb-2">
                                  <h2 style="font-weight: bold; font-size: 20px; color: #d61117b0">Cash In:</h2>
                                  <p><span style="font-weight: bold">Amount:</span> PHP ${amountFormatter(
                                    cashInDetails.amountToSend
                                  )}</p>
                                </div>
                              `,
                        },
                        {
                          content: `
                              <div className="mb-2">
                                <h2 style="font-weight: bold; font-size: 20px; color: #d61117b0">Payment Method:</h2>
                                <p><span style="font-weight: bold">Selected:</span> ${cashInDetails.type}</p>
                              </div>
                            `,
                        },
                        {
                          content: `
                              <div className="mb-2">
                                <h2 style="font-weight: bold; font-size: 20px; color: #d61117b0">Transaction Details:</h2>
                                <p><span style="font-weight: bold;">Transaction Code:</span> ${cashInDetails.transactionCode}</p>
                                <p><span style="font-weight: bold">Account:</span> ${cashInDetails.companyAccountId}</p>
                                <p><span style="font-weight: bold">Company Name:</span> ${cashInDetails.companyName}</p>
                                <p><span style="font-weight: bold">Mobile Number:</span> ${cashInDetails.companyContactNumber}</p>
                                <p><span style="font-weight: bold">Address:</span> ${cashInDetails.companyAddress}</p>
                              </div>
                            `,
                        },
                      ]}
                      content={customizedContent}
                      className="w-full ml-[-130px]"
                    />
                  </div>
                </div>
              )}
              <div className="flex gap-2 justify-between">
                {currentStep == 1 && (
                  <Button
                    onClick={() => {
                      setCurrentStep(0);
                      setIsSending(false);
                    }}
                    label={'Back'}
                    className={classNames(
                      'rounded w-full px-10 bg-transparent text-red-500'
                    )}
                    disabled={isSending}
                  />
                )}

                <Button
                  onClick={handleSubmit}
                  label={currentStep == 2 ? 'Create New Transaction' : 'Next'}
                  className={classNames('rounded w-full px-10')}
                  disabled={isSending}
                />
              </div>
            </div>
          )}
        </TabPanel>
        <TabPanel header="Cashin Transactions">
          <DashboardNav
            navTitle={''}
            buttons={[]}
            isShowSearch={true}
            valueSearchText={valueSearchText}
            setValueSearchText={setValueSearchText}
            searchPlaceholder=""
          />
          {transactionsQuery.error ? (
            <ErrorDialog />
          ) : (
            <>
              <DataTable
                selectionMode={'single'}
                value={
                  transactionsQuery.isLoading || transactionsQuery.isRefetching
                    ? [
                        {
                          dummy: '',
                        },
                      ]
                    : transactionsQuery?.data?.rows
                }
                frozenWidth="95rem"
                scrollable={true}
                tableStyle={{ minWidth: '95rem' }}
                onSelectionChange={async (e) => {
                  if (
                    transactionsQuery.isLoading ||
                    transactionsQuery.isRefetching
                  )
                    return null;
                  const rowData = e.value;

                  setSideBarConfig({
                    rowData: rowData,
                    isOpen: true,
                  });
                }}
              >
                <Column
                  field="transactionCode"
                  header="Reference Number"
                  body={(row) => {
                    if (
                      transactionsQuery.isLoading ||
                      transactionsQuery.isRefetching
                    )
                      return <Skeleton />;
                    return row.transactionCode;
                  }}
                />
                <Column
                  field="principalAmount"
                  header="Transaction Amount"
                  body={(row) => {
                    if (
                      transactionsQuery.isLoading ||
                      transactionsQuery.isRefetching
                    )
                      return <Skeleton />;
                    return <span>PHP {formatAmount(row.principalAmount)}</span>;
                  }}
                />
                <Column
                  field="via"
                  header="Transaction Type"
                  body={(row) => {
                    if (
                      transactionsQuery.isLoading ||
                      transactionsQuery.isRefetching
                    )
                      return <Skeleton />;
                    return row.via;
                  }}
                />
                <Column
                  field="createdAt"
                  header="Date Created"
                  body={(row) => {
                    if (
                      transactionsQuery.isLoading ||
                      transactionsQuery.isRefetching
                    )
                      return <Skeleton />;
                    return (
                      <span>
                        {moment(row.createdAt).format('MM/DD/YYYY - LT')}
                      </span>
                    );
                  }}
                />
                <Column
                  field="status"
                  header="Status"
                  body={(row) => {
                    if (
                      transactionsQuery.isLoading ||
                      transactionsQuery.isRefetching
                    )
                      return <Skeleton />;
                    return (
                      <span
                        className={classNames(
                          'py-2 px-5 rounded-full text-white',
                          {
                            'bg-orange-500': row.status == 'PENDING',
                            'bg-cyan-500': row.status == 'PROCESSING',
                            'bg-green-700':
                              row.status == 'SUCCESS' ||
                              row.status == 'SUCCESSFUL' ||
                              row.status == 'PAID',
                            'bg-red-700':
                              row.status == 'CANCELLED' ||
                              row.status == 'EXPIRED',
                          }
                        )}
                      >
                        {row.status}
                      </span>
                    );
                  }}
                />
                <Column
                  field="actions"
                  header="Actions"
                  body={(row: any) => {
                    if (
                      transactionsQuery.isLoading ||
                      transactionsQuery.isRefetching
                    )
                      return <Skeleton />;
                    if (row.status == 'PENDING') {
                      return (
                        <div className="flex flex-nowrap gap-2">
                          <Button
                            type="button"
                            text
                            severity="secondary"
                            icon="pi pi-times"
                            tooltip="Cancel Transaction"
                            className="text-red-500"
                            tooltipOptions={{ position: 'top' }}
                            onClick={async (e) => {
                              e.stopPropagation();
                              setCancelTransactionSidebarConfig({
                                rowData: row,
                                isOpen: true,
                              });
                            }}
                          />
                        </div>
                      );
                    }
                  }}
                />
              </DataTable>
            </>
          )}
          <Paginator
            first={pagination.first}
            rows={pagination.limit}
            totalRecords={transactionsQuery && transactionsQuery?.data?.count}
            rowsPerPageOptions={[5, 15, 25, 50, 100]}
            onPageChange={(event) => {
              const { page, rows, first }: any = event;
              setPagination({
                offset: rows * page,
                limit: rows,
                first: first,
              });
            }}
          />
        </TabPanel>
      </TabView>
    </div>

    {sideBarConfig.isOpen && (
      <CashinTransctionLogs
        sideBarConfig={sideBarConfig}
        setSideBarConfig={setSideBarConfig}
        refetchParent={() => transactionsQuery.refetch()}
      />
    )}
    {cancelTransactionSidebarConfig.isOpen && (
      <CancelTransactionSidebar
        sideBarConfig={cancelTransactionSidebarConfig}
        setSideBarConfig={setCancelTransactionSidebarConfig}
        refetchParent={() => transactionsQuery.refetch()}
        createNewTransaction={createNewTransaction}
      />
    )}
  </div>
);
};

export default BranchCashIn;
