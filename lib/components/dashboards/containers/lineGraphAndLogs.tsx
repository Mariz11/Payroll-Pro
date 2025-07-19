'use client';
import React, { useState, useEffect } from 'react';
import LineChart from '../charts/lineChart';

import 'primereact/resources/primereact.min.css';
import RecentLogs from './recentLogs';
import { useQueries, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { properCasing } from '@utils/helper';
function LineGraphAndLogs() {
  const [loadedDeposited, setLoadedDeposited] = useState(false);
  const [activityPagination, setActivityPagination] = useState({
    offset: 0,
    limit: 5,
  });
  const [activityLogs, setActivityLogs] = useState([]);
  // useEffect(() => {
  //   console.log(activityPagination);
  // }, [activityPagination]);

  const formatDateTime = (date: any): any => {
    // console.log(date);

    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const [yyyy, mm, others] = date.split('-');
    if (!yyyy || !mm || !others) return 'Invalid Date';

    const [dd, time] = others.split(' ') || [];
    const monthName = monthNames[parseInt(mm, 10) - 1];
    const day = parseInt(dd, 10) || 1;
    let [hour, minute] = (time && time !== 'null' ? time : '00:00')
      .split(':')
      .map(Number);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;

    return `${monthName} ${day}, ${yyyy} - ${formattedHour}:${minute
      .toString()
      .padStart(2, '0')} ${ampm}`;
  };

  const activityLogData = useQuery({
    refetchOnWindowFocus: false,
    queryKey: ['activityLogs', activityPagination],
    queryFn: async () =>
      await axios(
        `/api/dashboard/activityLogs?limit=${activityPagination.limit}&offset=${activityPagination.offset}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
          },
        }
      )
        .then((response: any) => {
          response.data.message['formattedData'] =
            response.data.message.rows.map((item: any) => ({
              name: `${item.user.firstName || item.user.lastName
                  ? `${item.user.userFullName}`
                  : item.user.username
                }`,
              action: item.message,
              timeDate: formatDateTime(item.createdAt),
            }));
          return response.data.message;
        })
        .catch((error) => {
          return null;
        }),
  });

  const fetchActivityLogs = async ({
    limit,
    offset,
  }: {
    limit: number;
    offset: number;
  }) => {
    try {
      const response = await fetch(
        `/api/dashboard/activityLogs?limit=${limit}&offset=${offset}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.message) {
          const fetchedActivityLogs = data.message.rows.map((item: any) => ({
            name: `${item.user.firstName || item.user.lastName
                ? `${item.user.userFullName}`
                : item.user.username
              }`,
            action: item.message,
            timeDate: new Date(item.createdAt),
          }));
          // console.log(data);
          setActivityLogs(fetchedActivityLogs);
          return data;
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchLineNetPay = async () => {
    try {
      const response = await fetch(`/api/dashboard/lineChartQuery/`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.message) {
          const sortedPayrolls = data.message.payrolls.sort(
            (a: any, b: any) => {
              const dateA = new Date(a.businessMonth);
              const dateB = new Date(b.businessMonth);
              return dateA.getTime() - dateB.getTime();
            }
          );
          setLoadedDeposited(true);
          return sortedPayrolls;
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const [
    // activityLogData,
    lineChartQuery,
  ] = useQueries({
    queries: [
      // {
      //   refetchOnWindowFocus: false,
      //   queryKey: ['activityLogs', activityPagination],
      //   queryFn: () => fetchActivityLogs(activityPagination),
      // },
      {
        queryKey: ['lineChartMLDepositedQuery'],
        queryFn: () => fetchLineNetPay(),
      },
    ],
  });
  return (
    <div className="line-container rounded-lg p-5 grid grid-cols-1 lg:grid-cols-2">
      <div className="flex flex-col">
        {loadedDeposited && (
          <LineChart isAdmin={false} MLDepositedLine={lineChartQuery?.data} />
        )}
      </div>
      {/* <RecentLogs
        loading={activityLogData.isLoading}
        logsData={{ logsData: activityLogData.isFetching ? [] : activityLogs }}
        tableHeaders={{
          title: 'Activity Logs',
          header1: 'Name',
          header2: 'Time & Date',
        }}
        data={activityLogData.data}
        pagination={activityPagination}
        setPagination={setActivityPagination}
      /> */}
      <RecentLogs
        logsData={{
          logsData:
            activityLogData.isFetching || activityLogData.isLoading
              ? []
              : activityLogData.data?.formattedData,
        }}
        tableHeaders={{
          title: 'Latest Activity Log',
          header1: 'Name',
          header2: 'Date & Time',
        }}
        data={activityLogData.data}
        pagination={activityPagination}
        setPagination={setActivityPagination}
        loading={activityLogData.isLoading}
      />
    </div>
  );
}

export default LineGraphAndLogs;
