'use client';

import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Sidebar } from 'primereact/sidebar';
import React, { useEffect, useState } from 'react';
import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';
import { InputSwitch } from 'primereact/inputswitch';

import { InputNumber } from 'primereact/inputnumber';
import { VDivider } from 'lib/components/blocks/divider';
import Image from 'next/image';
import { Rowdies } from 'next/font/google';
import { Dropdown } from 'primereact/dropdown';
import {
  formatDate,
  customTimeFormatter,
  formatAmount,
} from '@utils/dashboardFunction';
import CompanyWalletAcctMiniCards from 'lib/components/blocks/companyWalletAcctMiniCards';
import { useQueries, useQuery } from '@tanstack/react-query';
import DashboardNav from 'lib/components/blocks/dashboardNav';
import { Paginator } from 'primereact/paginator';
import { DataTable } from 'primereact/datatable';
import { ProgressSpinner } from 'primereact/progressspinner';
import moment from '@constant/momentTZ';
import { amountFormatter } from '@utils/helper';
import { TabPanel, TabView } from 'primereact/tabview';
import axios from 'axios';
import ErrorDialog from 'lib/components/blocks/errorDialog';

type InputSwitchStates = {
  [key: number]: boolean;
};

const CompanyLogTrail = ({
  configuration: { title, submitBtnText, action, rowData, isOpen },
  setSideBarConfig,
}: {
  configuration: SideBarConfig;
  setSideBarConfig: any;
}) => {
  const [salaryDisbursementsSearch, setSalaryDisbursementsSearch] =
    useState('');
  const [govtBenefitsPaymentsSearch, setGovtBenefitsPaymentsSearch] =
    useState('');
  const [caDisbursementsSearch, setCADisbursementsSearch] = useState('');
  const [paginationSD, setPaginationSD] = useState({
    offset: 0,
    limit: 5,
    first: 0,
  });
  const [paginationGBP, setPaginationGBP] = useState({
    offset: 0,
    limit: 5,
    first: 0,
  });
  const [paginationCAD, setPaginationCAD] = useState({
    offset: 0,
    limit: 5,
    first: 0,
  });

  const [salaryDisbursements, govtBenefitsPayments, caDisbursements] =
    useQueries({
      queries: [
        {
          refetchOnWindowFocus: false,
          queryKey: [
            'salaryDisbursements',
            paginationSD,
            salaryDisbursementsSearch,
            rowData,
          ],
          queryFn: async () => {
            const response: any = await axios.get(
              `/api/companies/log_trail/salary_disbursements?limit=${paginationSD.limit}&offset=${paginationSD.offset}&search=${salaryDisbursementsSearch}&companyId=${rowData.companyId}`,
              {
                headers: {
                  Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
                },
              }
            );
            return response.data;
          },
        },
        {
          refetchOnWindowFocus: false,
          queryKey: [
            'govtBenefitsPayments',
            paginationGBP,
            govtBenefitsPaymentsSearch,
            rowData,
          ],
          queryFn: async () =>
            await axios
              .get(
                `/api/companies/log_trail/govt_benefits_payments?limit=${paginationGBP.limit}&offset=${paginationGBP.offset}&search=${govtBenefitsPaymentsSearch}&companyId=${rowData.companyId}`,
                {
                  headers: {
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
                  },
                }
              )
              .then((res) => res.data),
        },
        {
          refetchOnWindowFocus: false,
          queryKey: [
            'caDisbursements',
            paginationCAD,
            caDisbursementsSearch,
            rowData,
          ],
          queryFn: async () =>
            await axios
              .get(
                `/api/companies/log_trail/ca_disbursements?limit=${paginationCAD.limit}&offset=${paginationCAD.offset}&search=${caDisbursementsSearch}&companyId=${rowData.companyId}`,
                {
                  headers: {
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
                  },
                }
              )
              .then((res) => res.data),
        },
      ],
    });

  return (
    <Sidebar
      position="right"
      style={{
        width: '84%',
      }}
      visible={isOpen}
      onHide={() =>
        setSideBarConfig((prev: any) => ({ ...prev, isOpen: false }))
      }
    >
      <React.Fragment>
        <h1 className="text-black font-medium text-3xl">Log Trail</h1>
      </React.Fragment>
      <form className="w-full overflow-auto">
        <div className="flex gap-3 mb-5">
          <div className="flex flex-col w-[85%] gap-3">
            <div className="w-full flex sm:items-end flex-col gap-2">
              {/* <div className="w-full justify-end flex">
                <div className="w-[380px] my-2">
                  <span className="py-2 px-8 rounded-full bg-green-200 text-green-700">
                    Active
                  </span>
                </div>
              </div> */}
              <CompanyWalletAcctMiniCards
                companyAccountId={rowData.accountId}
              />
            </div>
          </div>
          <div className="flex flex-col ml-4 justify-end">
            <label className="border-2 border-gray-300 rounded h-[100px] w-[100px] flex flex-col justify-center items-center hover:cursor-pointer text-gray-600">
              <Image
                src={'/images/Logo Main.png'}
                alt="Logo"
                width={40}
                height={40}
              />
            </label>
          </div>
        </div>

        <TabView>
          <TabPanel header="Salary Disbursements">
            <React.Fragment>
              {salaryDisbursements.isLoading ? (
                <div className="w-full flex justify-center">
                  <ProgressSpinner />
                </div>
              ) : salaryDisbursements.error ? (
                <ErrorDialog />
              ) : (
                <>
                  {/* DASHBOARD NAV */}
                  <DashboardNav
                    navTitle=""
                    setValueSearchText={setSalaryDisbursementsSearch}
                    valueSearchText={salaryDisbursementsSearch}
                    searchPlaceholder=""
                    buttons={[]}
                    isShowSearch={true}
                  />
                  <DataTable
                    value={salaryDisbursements.data.rows}
                    tableStyle={{ minWidth: '95rem' }}
                  >
                    <Column
                      field="transactionDateTime"
                      header="Transaction Date/Time"
                      body={(data) =>
                        moment(data.transactionDateTime).format(
                          'MM/DD/YYYY, h:mm:ss a'
                        )
                      }
                    />
                    <Column field="batchNumber" header="Batch #" />
                    <Column
                      field="transactionAmount"
                      header="Disbursed Amount"
                      body={(data) =>
                        'PHP ' + amountFormatter(data.transactionAmount)
                      }
                    />
                    <Column
                      field="transferDestination"
                      header="Destination"
                      body={(data) =>
                        data.transferDestination.toUpperCase() == 'ML WALLET'
                          ? 'MCASH'
                          : data.transferDestination
                      }
                    />
                    <Column
                      field="disbursementStatus"
                      header="Status"
                      body={(data) => {
                        if (data.isPosted == 1 && data.transactionAmount == 0) {
                          return (
                            <span className="block text-center max-w-[160px] py-2 px-5 rounded-full bg-cyan-200 text-cyan-700">
                              POSTED
                            </span>
                          );
                        }
                        if (
                          data.disbursementStatus == 0 ||
                          data.disbursementStatus == false
                        ) {
                          return (
                            <span className="block text-center max-w-[160px] py-2 px-5 rounded-full bg-orange-200 text-orange-700">
                              ON GOING
                            </span>
                          );
                        } else if (data.disbursementStatus == 1) {
                          return (
                            <span className="block text-center max-w-[160px] py-2 px-5 rounded-full bg-green-200 text-green-700">
                              DISBURSED
                            </span>
                          );
                        } else if (data.disbursementStatus == 2) {
                          return (
                            <span className="block text-center max-w-[160px] py-2 px-5 rounded-full bg-red-200 text-red-700">
                              FAILED
                            </span>
                          );
                        }
                      }}
                    />
                  </DataTable>
                </>
              )}
              <Paginator
                first={paginationSD.first}
                rows={paginationSD.limit}
                totalRecords={
                  salaryDisbursements.data &&
                  salaryDisbursements.data.count
                }
                rowsPerPageOptions={[5, 15, 25, 50, 100]}
                onPageChange={(event) => {
                  const { page, rows, first }: any = event;
                  setPaginationSD((prev: any) => ({
                    ...prev,
                    first: first,
                    offset: rows * page,
                    limit: rows,
                  }));
                }}
              />
            </React.Fragment>
          </TabPanel>
          {/* <TabPanel header="Government Benefits Payments">
            <React.Fragment>
              {govtBenefitsPayments.isLoading ? (
                <div className="w-full flex justify-center">
                  <ProgressSpinner />
                </div>
              ) : govtBenefitsPayments.error ? (
                <ErrorDialog />
              ) : (
                <>
                  <DashboardNav
                    navTitle=""
                    setValueSearchText={setGovtBenefitsPaymentsSearch}
                    valueSearchText={govtBenefitsPaymentsSearch}
                    searchPlaceholder=""
                    buttons={[]}
                    isShowSearch={true}
                  />
                  <DataTable
                    value={govtBenefitsPayments.data.rows}
                    tableStyle={{ minWidth: '95rem' }}
                  >
                    <Column
                      field="updatedAt"
                      header="Transaction Date/Time"
                      body={(data) =>
                        moment(data.updatedAt).format('MM/DD/YYYY, h:mm:ss a')
                      }
                    />
                    <Column field="transferCode" header="Transfer Code" />
                    <Column
                      field="transferAmount"
                      header="Transferred Amount"
                      body={(data) =>
                        'PHP ' + amountFormatter(data.transferAmount)
                      }
                    />
                    <Column
                      field="transferDestination"
                      header="Destination"
                      body={(data) => 'SUB ACCOUNT'}
                    />
                  </DataTable>
                </>
              )}
              <Paginator
                first={paginationGBP.first}
                rows={paginationGBP.limit}
                totalRecords={
                  govtBenefitsPayments.data &&
                  govtBenefitsPayments.data.count.length
                }
                rowsPerPageOptions={[5, 15, 25, 50, 100]}
                onPageChange={(event) => {
                  const { page, rows, first }: any = event;
                  setPaginationGBP({
                    offset: rows * page,
                    limit: rows,
                    first: first,
                  });
                }}
              />
            </React.Fragment>
          </TabPanel> */}
          <TabPanel header="Cash Advance Disbursements">
            <React.Fragment>
              {caDisbursements.isLoading ? (
                <div className="w-full flex justify-center">
                  <ProgressSpinner />
                </div>
              ) : caDisbursements.error ? (
                <ErrorDialog />
              ) : (
                <>
                  {/* DASHBOARD NAV */}
                  <DashboardNav
                    navTitle=""
                    setValueSearchText={setCADisbursementsSearch}
                    valueSearchText={caDisbursementsSearch}
                    searchPlaceholder=""
                    buttons={[]}
                    isShowSearch={true}
                  />
                  <DataTable
                    value={caDisbursements.data.rows}
                    tableStyle={{ minWidth: '95rem' }}
                  >
                    <Column
                      field="createdAt"
                      header="Transaction Date/Time"
                      body={(data) =>
                        moment(data.createdAt).format('MM/DD/YYYY, h:mm:ss a')
                      }
                    />
                    <Column field="batchNumber" header="Batch #" />
                    <Column
                      field="disbursedAmount"
                      header="Disbursed Amount"
                      body={(data) =>
                        'PHP ' + amountFormatter(data.disbursedAmount)
                      }
                    />
                    <Column
                      field="type"
                      header="Destination"
                      body={(data) =>
                        data.type.toUpperCase() == 'ML WALLET'
                          ? 'MCASH'
                          : data.type
                      }
                    />
                    <Column
                      field="disbursementStatus"
                      header="Status"
                      body={(data) => {
                        if (
                          data.disbursementStatus == 0 ||
                          data.disbursementStatus == false
                        ) {
                          return (
                            <span className="block text-center max-w-[160px] py-2 px-5 rounded-full bg-orange-200 text-orange-700">
                              ON GOING
                            </span>
                          );
                        } else if (data.disbursementStatus == 1) {
                          return (
                            <span className="block text-center max-w-[160px] py-2 px-5 rounded-full bg-green-200 text-green-700">
                              DISBURSED
                            </span>
                          );
                        } else if (data.disbursementStatus == 2) {
                          return (
                            <span className="block text-center max-w-[160px] py-2 px-5 rounded-full bg-red-200 text-red-700">
                              FAILED
                            </span>
                          );
                        }
                      }}
                    />
                  </DataTable>
                </>
              )}
              <Paginator
                first={paginationCAD.first}
                rows={paginationCAD.limit}
                totalRecords={
                  caDisbursements.data && caDisbursements.data.count
                }
                rowsPerPageOptions={[5, 15, 25, 50, 100]}
                onPageChange={(event) => {
                  const { page, rows, first }: any = event;
                  setPaginationCAD({
                    offset: rows * page,
                    limit: rows,
                    first: first,
                  });
                }}
              />
            </React.Fragment>
          </TabPanel>
        </TabView>
      </form>
    </Sidebar>
  );
};

export default CompanyLogTrail;
