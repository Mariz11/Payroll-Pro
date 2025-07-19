'use client';

import React, { useState } from 'react';
import WalletAsset from './wallets/walletAsset';
import Pie from './charts/pie';
import LineGraphAndLogs from './containers/lineGraphAndLogs';
import { superAdminData } from '@constant/walletAssetData';
import { useQueries } from '@tanstack/react-query';
import TopLogs from './containers/topLogs';
import Doughnut from './charts/doughnut';
import { ProgressSpinner } from 'primereact/progressspinner';
import axios from 'axios';
import { Skeleton } from 'primereact/skeleton';

function SuperAdmin() {
  const [topCompaniesLog, setTopCompaniesLog] = useState([]);
  const [loadedDoughnut, setLoadedDoughnut] = useState(false);
  const [loadedPie, setLoadedPie] = useState(false);
  const [walletData, setWalletData] = useState<WalletAsset>({
    title: '',
    company: '',
    amount: '',
    number: '',
    bgColor: '',
  });
  const [doughnutData, setDoughnutData] = useState({
    labels: ['ACTIVE', 'PENDING', 'FAILED REGISTRATION', 'DEACTIVATED'],
    datasets: [
      {
        data: ['0', '0', '0', '0'],
        backgroundColor: ['#15803D', '#FE7821', '#FFFFFF', '#B40224'],
        hoverBackgroundColor: ['#14532D', '#8B4104', '#888888', '#9B0000'],
      },
    ],
  });

  const [pieData, setPieData] = useState({
    labels: ['', '', ''],
    datasets: [
      {
        data: ['0', '0', '0'],
        backgroundColor: ['#15803D', '#FE7821', '#B40224'],
        hoverBackgroundColor: ['#14532D', '#8B4104', '#9B0000'],
      },
    ],
  });

  const fetchTopCompanies = async () => {
    try {
      const response = await fetch(`/api/dashboard/topCompanies/`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.message) {
          const fetchedTopCompanies = data.message.map((item: any) => ({
            name: item?.companyName || '',
            col2: Number(item?.sum) || '',
          }));

          let bgColorArray;
          let hoverColorArray;
          if (data.message.length === 1) {
            bgColorArray = ['#15803D'];
            hoverColorArray = ['#14532D'];
          } else if (data.message.length === 2) {
            bgColorArray = ['#15803D', '#FE7821'];
            hoverColorArray = ['#14532D', '#8B4104'];
          } else {
            bgColorArray = ['#15803D', '#FE7821', '#B40224'];
            hoverColorArray = ['#14532D', '#8B4104', '#9B0000'];
          }
          setPieData({
            labels: [
              (data.message[0]?.companyName || '') as string,
              (data.message[1]?.companyName || '') as string,
              (data.message[2]?.companyName || '') as string,
            ],
            datasets: [
              {
                data: [
                  data.message[0]?.sum.toFixed(2),
                  // .replace(/(\d)(?=(\d{3})+\.\d\d$)/g, '$1,'),
                  data.message[1]?.sum.toFixed(2),
                  // .replace(/(\d)(?=(\d{3})+\.\d\d$)/g, '$1,'),
                  data.message[2]?.sum.toFixed(2),
                  // .replace(/(\d)(?=(\d{3})+\.\d\d$)/g, '$1,'),
                ],
                backgroundColor: bgColorArray,
                hoverBackgroundColor: hoverColorArray,
              },
            ],
          });

          setLoadedPie(true);
          setTopCompaniesLog(fetchedTopCompanies);

          return data;
        }
      }
    } catch (error) {
      setTopCompaniesLog([]);
      console.error(error);
      return null;
    }
  };

  const fetchAllWallet = async () => {
    try {
      const response = await axios.get(`/api/wallet/companies`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
        },
      });
      const { data } = response;

      setWalletData({
        ...walletData,
        title: 'All MCash Asset',
        company: 'All Companies',
        amount: data.totalBalance,
        number: '',
        bgColor: '#d80404',
      });

      return data;
    } catch (error) {
      setWalletData({
        ...walletData,
        title: 'All MCash Asset',
        company: 'All Companies',
        amount: '',
        number: '',
        bgColor: '#d80404',
      });

      console.error(error);
      return null;
    }
  };

  const fetchEmployeesCount = async () => {
    try {
      const response = await fetch(`/api/dashboard/employees`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.message) {
          setDoughnutData({
            labels: ['ACTIVE', 'PENDING', 'FAILED REGISTRATION', 'DEACTIVATED'],
            datasets: [
              {
                data: [
                  data.message.employeeStatus1Count,
                  data.message.employeeStatus0OrNullCount,
                  data.message.employeeStatus3Count,
                  data.message.employeeStatus2Count,
                ],
                backgroundColor: ['#15803D', '#FE7821', '#FFFFFF', '#B40224'],
                hoverBackgroundColor: [
                  '#14532D',
                  '#8B4104',
                  '#888888',
                  '#9B0000',
                ],
              },
            ],
          });
          setLoadedDoughnut(true);
          return data;
        }
      }
    } catch (error) {
      setDoughnutData({
        labels: ['ACTIVE', 'PENDING', 'FAILED REGISTRATION', 'DEACTIVATED'],
        datasets: [
          {
            data: ['0', '0', '0', '0'],
            backgroundColor: ['#15803D', '#FE7821', '#FFFFFF', '#B40224'],
            hoverBackgroundColor: ['#14532D', '#8B4104', '#888888', '#9B0000'],
          },
        ],
      });
      console.error(error);
      return null;
    }
  };

  const fetchAllCompanies = async () => {
    try {
      const response = await fetch(`/api/dashboard/companies`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.message) {
          return data;
        }
      }
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const [topCompanies, allWallet, employeesCount, allCompanies] = useQueries({
    queries: [
      {
        queryKey: ['topCompanies'],
        queryFn: () => fetchTopCompanies(),
      },
      {
        queryKey: ['allCompanies'],
        queryFn: () => fetchAllWallet(),
      },
      {
        queryKey: ['allWallet'],
        queryFn: () => fetchEmployeesCount(),
      },
      {
        queryKey: ['allCompanies'],
        queryFn: () => fetchAllCompanies(),
      },
    ],
  });

  return (
    <div className="w-screen h-screen overflow-auto p-5">
      <h1 className="font-extrabold mb-5">Dashboard</h1>
      {topCompanies.isLoading &&
      allCompanies.isLoading &&
      allWallet.isLoading &&
      employeesCount.isLoading ? (
        <div>
          <div className="flex gap-6">
            <Skeleton height="15rem" className="mb-2"></Skeleton>
            <Skeleton height="15rem" className="mb-2"></Skeleton>
            <Skeleton height="15rem" className="mb-2"></Skeleton>
          </div>
          <div className="flex-col mt-5">
            <Skeleton height="25rem" className="mb-2"></Skeleton>
          </div>
          <div className="flex-col mt-5">
            <Skeleton height="25rem" className="mb-2"></Skeleton>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* <Doughnut /> */}
              {doughnutData && loadedDoughnut && (
                <Doughnut data={doughnutData} />
              )}
              {pieData && loadedPie && <Pie data={pieData} />}
              <WalletAsset
                title={walletData.title}
                company={walletData.company}
                amount={walletData.amount}
                number={walletData.number}
                bgColor={walletData.bgColor}
              />
            </div>
          </div>
          <LineGraphAndLogs />
          {topCompaniesLog && topCompaniesLog.length > 0 && (
            <div className="line-container w-full rounded-lg flex flex-row h-fit mt-[10px] p-5">
              <TopLogs
                logsData={{ logsData: topCompaniesLog }}
                tableHeaders={{
                  title: 'Top 10 Companies',
                  header1: 'Company Name',
                  header2: 'Total Payroll',
                }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default SuperAdmin;
function addCommas(arg0: any): string {
  throw new Error('Function not implemented.');
}
