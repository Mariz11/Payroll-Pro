'use client';
import React, { useState, useEffect } from 'react';
import { Chart } from 'primereact/chart';
import { Calendar } from 'primereact/calendar';

import 'primereact/resources/primereact.min.css';
import { Dropdown } from 'primereact/dropdown';
import { formatAmount } from '@utils/dashboardFunction';
import { useQueries } from '@tanstack/react-query';

interface BusinessMonth {
  name: string;
}

function LineChart({
  isAdmin,
  MLDepositedLine,
}: {
  isAdmin: boolean;
  MLDepositedLine: MLDeposited[];
}) {
  const [chartData, setChartData] = useState({});
  const [chartOptions, setChartOptions] = useState({});
  const [selectedCompany, setSelectedCompany] = useState<
    { name: string; id: string } | undefined
  >();
  const [dateFrom, setDateFrom] = useState<{ name: string } | undefined>();
  const [dateTo, setDateTo] = useState<{ name: string } | undefined>();
  const [dropDownMonths, setDropDownMonths] = useState<BusinessMonth[]>([]);
  const [businessMonths, setBusinessMonths] = useState<string[]>([]);
  const [depositedValues, setDepositedValues] = useState<string[]>([]);
  var _ = require('lodash');
  const [governmentPaidValues, setGovernmentPaidValues] = useState<string[]>(
    []
  );
  const uniq = require('lodash.uniq');
  const [values, setValues] = useState({
    MLDeposited: 0,
    GovernmentPaid: 0,
  });

  const fetchCompanyLists = async () => {
    try {
      const response = await fetch(`/api/dashboard/companyLists`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.message) {
          const formattedData = data.message.map((company: any) => ({
            name: company.companyName,
            id: company.companyId,
          }));

          return formattedData;
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const [companyList] = useQueries({
    queries: [
      {
        queryKey: ['companyLists'],
        queryFn: () => fetchCompanyLists(),
      },
    ],
  });

  useEffect(() => {
    setBusinessMonths([]);
    setDepositedValues([]);
    const sortedMLDepositedLine = MLDepositedLine.map((item) => ({
      ...item,
      itemDate: new Date(item.businessMonth),
    })).sort((a: any, b: any) => b.itemDate - a.itemDate);

    const filteringMLDepositedLine =
      dateFrom === undefined && dateTo === undefined
        ? sortedMLDepositedLine
            .filter(
              (item: any) =>
                !selectedCompany || selectedCompany.id === item.companyId
            )
            .slice(0, 12)
        : sortedMLDepositedLine
            .filter(
              (item: any) =>
                !selectedCompany || selectedCompany.id === item.companyId
            )
            .filter((item: any) => {
              const itemDate = item.itemDate;
              const fromDate = dateFrom ? new Date(dateFrom.name) : null;
              const toDate = dateTo ? new Date(dateTo.name) : null;

              if (fromDate && toDate) {
                return itemDate >= fromDate && itemDate <= toDate;
              } else if (fromDate) {
                return itemDate >= fromDate;
              } else if (toDate) {
                return itemDate <= toDate;
              }
              return true;
            });

    const filteredMLDepositedLine = filteringMLDepositedLine
      .map((item) => ({
        ...item,
        itemDate: new Date(item.businessMonth),
      }))
      .sort((a: any, b: any) => a.itemDate - b.itemDate);

    // SET BUSINESS MONTHS
    const businessMonths = (filteredMLDepositedLine || [])
      .map((payroll: any) => payroll.businessMonth)
      .filter(
        (businessMonth: any) =>
          businessMonth !== undefined && businessMonth !== null
      );
    setBusinessMonths(businessMonths);

    // SET DROPDOWN VALUES
    const dropdownMonths = _.uniqBy(
      MLDepositedLine.filter(
        (item: any) => !selectedCompany || selectedCompany.id === item.companyId
      ).map((month: any) => ({
        name: month.businessMonth,
      })),
      'name'
    );

    // SET DEPOSITED VALUES
    const depositedValues = (filteredMLDepositedLine || [])
      .map((payroll: any) => payroll.totalNetPay)
      .filter(
        (totalNetPay: any) => totalNetPay !== undefined && totalNetPay !== null
      );

    setDepositedValues(depositedValues);

    // SET GOVERNMENT PAID VALUES
    const governmentPaidValues = (filteredMLDepositedLine || [])
      .map((payroll: any) => payroll.totalTransferAmount)
      .filter(
        (totalTransferAmount: any) =>
          totalTransferAmount !== undefined && totalTransferAmount !== null
      );

    setGovernmentPaidValues(governmentPaidValues);
    setDropDownMonths(dropdownMonths);

    setValues((prevData) => ({
      ...prevData,
      MLDeposited: depositedValues.reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        0
      ),
      GovernmentPaid: governmentPaidValues.reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        0
      ),
    }));
  }, [dateFrom, dateTo, selectedCompany, MLDepositedLine, isAdmin]);

  useEffect(() => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColorSecondary = documentStyle.getPropertyValue(
      '--text-color-secondary'
    );

    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
    const data = {
      labels: businessMonths,
      datasets: [
        {
          label: 'ML Deposited',
          fill: false,
          borderColor: '#B40224',
          yAxisID: 'y',
          tension: 0.4,
          data: depositedValues,
        },
        {
          label: 'Government Paid',
          fill: false,
          borderColor: 'black',
          yAxisID: 'y',
          tension: 0.4,
          data: governmentPaidValues,
        },
      ],
    };
    const options = {
      stacked: false,
      maintainAspectRatio: false,
      aspectRatio: 0.6,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
          },
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
          },
        },
      },
    };

    setChartData(data);
    setChartOptions(options);
  }, [
    businessMonths,
    selectedCompany,
    dateFrom,
    dateTo,
    depositedValues,
    governmentPaidValues,
  ]);

  return (
    <>
      <div className="card p-3 flex flex-col overflow-auto">
        <div className="flex flex-row justify-between w-full items-center mb-4">
          <span className="text-[20px] font-bold mt-1 ">Amount Disbursed</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-4  w-full mb-[40px]">
          {!isAdmin && (
            <div className="card flex justify-content-center flex-col text-[12px]">
              Choose a Company
              <Dropdown
                filter
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.value)}
                options={companyList.data}
                optionLabel="name"
                placeholder="Select a Company"
                className="w-full min-w-[170px]"
                showClear={true}
              />
            </div>
          )}

          <div className="card flex justify-content-center flex-col text-[12px]">
            Date From
            <Dropdown
              value={dateFrom}
              onChange={(e) => setDateFrom(e.value)}
              options={dropDownMonths}
              optionLabel="name"
              placeholder="Business Month"
              className="w-full min-w-[170px]"
              showClear={true}
            />
          </div>
          <div className="card flex justify-content-center flex-col text-[12px]">
            Date To
            <Dropdown
              value={dateTo}
              onChange={(e) => setDateTo(e.value)}
              options={dropDownMonths}
              optionLabel="name"
              placeholder="Business Month"
              className="w-full min-w-[170px]"
              showClear={true}
            />
          </div>
        </div>
        <Chart
          type="line"
          data={chartData}
          options={chartOptions}
          height="280px"
          className="flex w-auto min-w-[500px]"
        />
      </div>
      <div className="flex flex-row justify-center gap-10">
        <div className="flex flex-col mt-[15px]">
          <span className="text-[13px] md:text-[18px] font-bold w-full flex justify-center ">
            PHP {formatAmount(values.MLDeposited)}
          </span>
          <span className="text-[#585858] font-bold text-[8px] md:text-[10px]  w-full flex justify-center">
            Total Amount ML Disbursed
          </span>
        </div>
        {/* <div className="flex flex-col">
          <span className="text-[13px] md:text-[18px] font-bold w-full flex justify-center ">
            PHP {formatAmount(values.GovernmentPaid)}
          </span>
          <span className="text-[#585858] font-bold text-[8px] md:text-[10px] w-full flex justify-center">
            Total Government Paid
          </span>
        </div> */}
      </div>
    </>
  );
}

export default LineChart;
