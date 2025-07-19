/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';

// Components
import Doughnut from './charts/doughnut';

// Sample Data  - to be deleted after syncing with backend
import { adminData, adminSubData } from 'lib/constant/walletAssetData';
import WalletAsset from './wallets/walletAsset';

// import 'primereact/resources/primereact.min.css';
import LineChart from './charts/lineChart';
import RecentLogs from './containers/recentLogs';
import { useQueries, useQuery } from '@tanstack/react-query';
import TopLogs from './containers/topLogs';
import { ProgressSpinner } from 'primereact/progressspinner';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { ScrollPanel } from 'primereact/scrollpanel';
import { Fieldset } from 'primereact/fieldset';
import ReactHtmlParser from 'react-html-parser';
// updated Dwine 2/23/2024: added import START
import Announcements from './announcements/announcement';
import moment from '@constant/momentTZ';
import { Badge } from 'primereact/badge';
import { Button } from 'primereact/button';
import { Menu } from 'primereact/menu';
import { MenuItem } from 'primereact/menuitem';
import { stringCut } from '@utils/stringHelper';
import { Skeleton } from 'primereact/skeleton';
import announcement from 'db/models/announcement';
import { Avatar } from 'primereact/avatar';
import { GlobalContainer } from 'lib/context/globalContext';
import { properCasing } from '@utils/helper';
// updated Dwine 2/23/2024: added import END
function Admin() {
  // added Dwine 2/23/2024: added for side bar states START
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>({});
  // added Dwine 2/23/2024: added for side bar states END
  const context: any = useContext(GlobalContainer);
  const sessionData = context.userData;
  const params: any = useParams();
  const [companyName, setCompanyName] = useState('');
  const [walletData, setWalletData] = useState<WalletAsset>({
    title: '',
    company: '',
    amount: '',
    number: '',
    bgColor: '',
  });

  const [attendancePagination, setAttendancePagination] = useState({
    offset: 0,
    limit: 5,
  });
  const [activityPagination, setActivityPagination] = useState({
    offset: 0,
    limit: 5,
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
  const menuLeft = useRef<any>(null);

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

  const attendanceData = useQuery({
    refetchOnWindowFocus: false,
    queryKey: ['attendanceData', attendancePagination],
    queryFn: async () => {
      try {
        // console.log(attendancePagination);
        const response: any = await axios(
          `/api/adminDashboard/attendance?limit=${attendancePagination.limit}&offset=${attendancePagination.offset}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
            },
          }
        );
        response.data.message['formattedData'] = response.data.message.rows.map(
          (item: any) => ({
            name: `${
              item.employee &&
              item.employee.employee_profile &&
              item.employee.employee_profile.employeeFullName
                ? item.employee.employee_profile.employeeFullName
                : item.user.username
            }`,
            action:
              item.isDayOff > 0 ? (
                'Day off'
              ) : item.isLeave > 0 ? (
                'Leave'
              ) : item.isPresent > 0 && item.lateHours <= 0 ? (
                'Present'
              ) : item.isPresent > 0 && item.lateHours >= 0 ? (
                <span className="text-red-600">Late</span>
              ) : (
                <span className="text-red-600">Absent</span>
              ),
            timeDate: formatDateTime(item.createdAt),
          })
        );

        return response.data.message;
      } catch (error) {
        return [];
      }
    },
  });

  const activityLogData = useQuery({
    refetchOnWindowFocus: false,
    queryKey: ['activityLogs', activityPagination],
    queryFn: async () =>
      await axios(
        `/api/adminDashboard/activityLogs?limit=${activityPagination.limit}&offset=${activityPagination.offset}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
          },
        }
      )
        .then((response) => {
          response.data.message['formattedData'] =
            response.data.message.rows.map((item: any) => ({
              name: `${
                item.user.firstName || item.user.lastName
                  ? `${item.user.userFullName}`
                  : item.user.username
              }`,
              action: item.message,
              timeDate: formatDateTime(item.createdAt),
            }));
          return response.data.message;
        })
        .catch((error) => {
          return [];
        }),
  });
  const [
    // activityLogData,
    // attendanceData,
    employeesCount,
    companyDetails,
    topEmployees,
    lineChartQuery,
    // updated Dwine 2/23/2024: added query for getting departmentAnnouncements START
    announcementData,
    // updated Dwine 2/23/2024: added query for getting departmentAnnouncements END
  ] = useQueries({
    queries: [
      {
        refetchOnWindowFocus: false,
        queryKey: ['employeesCount'],
        queryFn: async () => {
          try {
            const response: any = await axios(`/api/adminDashboard/employees`, {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
              },
            });

            setDoughnutData({
              labels: [
                'ACTIVE',
                'PENDING',
                'FAILED REGISTRATION',
                'DEACTIVATED',
              ],
              datasets: [
                {
                  data: [
                    response.data.message.employeeStatus1Count,
                    response.data.message.employeeStatus0OrNullCount,
                    response.data.message.employeeStatus3Count,
                    response.data.message.employeeStatus2Count,
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
            return response;
          } catch (error) {
            return [];
          }
        },
      },
      {
        refetchOnWindowFocus: false,
        queryKey: ['companyDetails'],
        queryFn: async () => {
          try {
            const response: any = await axios(`/api/adminDashboard`, {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
              },
            });
            setWalletData({
              ...walletData,
              title: 'MCash Account',
              company: response.data.message.companyName,
              number: response.data.message.contactNumber,
              bgColor: '#d80404',
            });
            setCompanyName(response.data.message.companyName);
            return response;
          } catch (error) {
            return {};
          }
        },
      },
      {
        refetchOnWindowFocus: false,
        queryKey: ['topEmployees'],
        queryFn: async () => {
          try {
            const response = await axios(`/api/adminDashboard/topEmployees`, {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
              },
            });
            return response.data.message.map((item: any) => ({
              name: item.employee_profile.employeeFullName,
              col2: item.basicPay,
            }));
          } catch (error) {
            return [];
          }
        },
      },
      {
        refetchOnWindowFocus: false,
        queryKey: ['lineChartMLDepositedQuery'],
        queryFn: async () => {
          try {
            const response = await axios(`/api/adminDashboard/lineChartQuery`, {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
              },
            });

            return response.data.message.payrolls.sort((a: any, b: any) => {
              const dateA = new Date(a.businessMonth);
              const dateB = new Date(b.businessMonth);
              return dateA.getTime() - dateB.getTime();
            });
          } catch (error) {
            return [];
          }
        },
      },
      // updated Dwine 2/23/2024: added query for getting departmentAnnouncements
      {
        refetchOnWindowFocus: false,
        queryKey: ['announcementData'],
        queryFn: async () => {
          try {
            const response: any = await axios(`/api/departmentAnnouncements`, {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
              },
            });

            const formattedData = response.data.map((item: any) => {
              return {
                ...item,
                isViewed: item.usersSeen
                  ? item.usersSeen.split(',').includes(sessionData.userId + '')
                  : false,
              };
            });

            return formattedData;
          } catch (error) {
            console.log('error');
            return [];
          }
        },
      },
      // updated Dwine 2/23/2024: added query for getting departmentAnnouncements
    ],
  });
  const [announcementUnviewed, setAnnouncementUnviewed] = useState(0);
  const [announcementDataRefresher, setAnnouncementDataRefresher] =
    useState(false);
  useEffect(() => {
    let count = 0;
    if (announcementData.data) {
      const arr = announcementData.data;

      for (let i = 0; i < arr?.length; i++) {
        if (arr[i] && !arr[i].isViewed) {
          count++;
        }
      }
    }
    setAnnouncementUnviewed(count);
  }, [announcementData.data, announcementDataRefresher]);
  const [walletBalance, setWalletBalance] = useState<any>(null);

  useEffect(() => {
    setTimeout(() => {
      activityLogData.refetch();
      attendanceData.refetch();
      topEmployees.refetch();
      employeesCount.refetch();
      companyDetails.refetch();
      lineChartQuery.refetch();
      announcementData.refetch();
      axios
        .get(`/api/wallet/company`, {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
          },
        })
        .then((response) => {
          return setWalletBalance(response.data.responseData);
        })
        .catch(() => {
          return setWalletBalance(0);
        });
    }, 3000);
  }, [params.companyId, companyName]);

  // updated Dwine 2/23/2024: added modified dashboard display START
  const notifRef = useRef<any>(null);

  const [show, setShow] = useState<boolean>(false);
  // const legendTemplate = (item: any) => (
  //   <div className="flex justify-between gap-2 px-2">
  //     <p>{item.title}</p>
  //     {!item.view_details[0].isViewed && (
  //       <Badge className="p-1" severity="success"></Badge>
  //     )}
  //   </div>
  // );

  return (
    <div className="w-screen h-full p-5 overflow-x-hidden">
      <div className="flex justify-between mb-5 mt-[23px] mr-5 relative items-center">
        <h1 className="font-extrabold w-full">Dashboard</h1>
        <div className="relative w-full">
          <Button
            className="rounded-full p-4 !fixed top-[21px] right-[41px] z-[40]"
            onClick={(e) => {
              e.preventDefault();

              setShow(!show);
            }}
            tooltipOptions={{ position: 'left' }}
            tooltip="Announcements"
          >
            <i
              className="pi pi-envelope p-overlay-badge"
              style={{ fontSize: '1rem' }}
            >
              <Badge
                severity="danger"
                value={announcementData.data ? announcementUnviewed : 0}
              ></Badge>
            </i>
          </Button>
          {/* announcement div */}
          <div
            ref={notifRef}
            style={{ visibility: show ? 'visible' : 'hidden' }}
            className="pb-5 z-[39] mt-4 overflow-hidden w-3/4 md:w-3/12 line-container rounded-lg  h-[80vh] !fixed top-[62px] justify-self-end right-[50px]"
          >
            <div>
              <h1
                className="
                p-3
                text-lg
                font-bold
                leading-none
                tracking-tight
                text-gray-900"
              >
                Announcements
              </h1>
              <ScrollPanel
                className="announcementbar1"
                style={{
                  height: '70vh',
                  marginTop: 10,
                  paddingLeft: 15,
                  paddingBottom: 5,
                  paddingRight: 10,
                }}
              >
                {!announcementData.data ||
                  (announcementData.data?.count < 0 &&
                    announcementData?.isFetching === false && (
                      <>No Announcements</>
                    ))}
                {announcementData.data &&
                  announcementData?.isFetching === false && (
                    <div className="flex flex-col gap-4 w-full">
                      {Array.isArray(announcementData?.data)
                        ? announcementData?.data.map(
                            (item: any, index: number) => (
                              <Fieldset
                                toggleable
                                className="announcement-fieldset"
                                legend={
                                  <>
                                    {item && !item.isViewed && (
                                      <i
                                        className="pi pi-circle-fill mr-[5px]"
                                        style={{ color: '#7bf72f' }}
                                      ></i>
                                    )}
                                    {item.title}
                                  </>
                                }
                                key={item.announcementId}
                                color="primary"
                                style={{
                                  width: '100%',
                                  backgroundColor: '#fcf3f4',
                                }}
                              >
                                <button
                                  className="w-full flex flex-col "
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setSelectedAnnouncement(item);
                                    // if (context?.authRole !== 'SUPER_ADMIN') {
                                    if (
                                      announcementData.data[index] &&
                                      announcementData.data[index].isViewed ===
                                        false
                                    ) {
                                      announcementData.data[index].isViewed =
                                        true;

                                      const response: any = axios(
                                        // `/api/viewDetails/${announcementData.data[index].view_details[0].viewDetailsId}`,
                                        `/api/viewDetails/${announcementData.data[index].announcementId}`,
                                        {
                                          method: 'PATCH',
                                          headers: {
                                            Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
                                          },
                                        }
                                      );
                                      // refresh this to trigger the counting of unviewed announcmenet
                                      setAnnouncementDataRefresher(
                                        !announcementDataRefresher
                                      );
                                    }

                                    setIsOpen(true);
                                  }}
                                >
                                  <div className="flex flex-row justify-between w-full">
                                    <p className=" break-words text-left overflow-hidden max-h-[120px] w-full">
                                      {stringCut(item.content, 175, 5)}
                                    </p>
                                  </div>

                                  <p className=" text-right text-sm mt-2 text-gray-400 self-end">
                                    {' ' +
                                      moment(
                                        item.updatedAt,
                                        'YYYY-MM-DD HH:mm:ss'
                                      ).format('LLLL')}
                                  </p>
                                </button>
                              </Fieldset>
                            )
                          )
                        : []}
                    </div>
                  )}
                {announcementData.isLoading === true && (
                  <div className="flex-col mt-5">
                    <Skeleton height="10rem" className="mb-3"></Skeleton>
                    <Skeleton height="10rem" className="mb-3"></Skeleton>
                    <Skeleton height="10rem" className="mb-3"></Skeleton>
                  </div>
                )}
              </ScrollPanel>
            </div>
          </div>
        </div>
      </div>
      {/* <div>
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
          <div className="flex gap-6">
            <Skeleton height="15rem" className="mb-2"></Skeleton>
            <Skeleton height="15rem" className="mb-2"></Skeleton>
          </div>
        </div> */}
      {
        // updated by Dwine :2/23/24 redesign dashboard START
        <div className="flex flex-col lg:flex-row gap-5 md:gap-3">
          <div className="w-full  ">
            <div className="flex flex-col">
              {companyDetails.isLoading && (
                <div className="flex gap-6">
                  <Skeleton height="15rem" className="mb-2"></Skeleton>
                  <Skeleton height="15rem" className="mb-2"></Skeleton>
                  <Skeleton height="15rem" className="mb-2"></Skeleton>
                </div>
              )}
              {!companyDetails.isLoading && (
                <div className="flex flex-col lg:flex-row items-stretch gap-6">
                  {doughnutData && employeesCount.isFetched && (
                    <Doughnut data={doughnutData} />
                  )}
                  <>
                    <WalletAsset
                      title={'MCash Account'}
                      company={
                        companyDetails.isFetching ? '' : walletData.company
                      }
                      amount={walletBalance && walletBalance.balance}
                      number={
                        companyDetails.isFetching ? '-' : walletData.number
                      }
                      bgColor={'#d80404'}
                    />
                    <WalletAsset
                      title="ML Service Fee"
                      company={
                        companyDetails.isFetching ? '' : walletData.company
                      }
                      amount={walletBalance && walletBalance.subAccountBalance}
                      number={
                        companyDetails.isFetching ? '-' : walletData.number
                      }
                      bgColor={'#d80404'}
                    />
                  </>
                </div>
              )}
            </div>
            <div className="flex gap-5 flex-col w-full overflow-yauto">
              {topEmployees.isLoading && (
                <div className="flex-col mt-5">
                  {' '}
                  <Skeleton height="25rem" className="mb-2"></Skeleton>
                </div>
              )}
              {!topEmployees.isLoading && (
                <>
                  <div className="line-container rounded-lg p-5 overflow-auto">
                    <TopLogs
                      logsData={{
                        logsData: topEmployees.isFetching
                          ? []
                          : topEmployees.data,
                      }}
                      tableHeaders={{
                        title: 'Top 10 Employees',
                        header1: 'Name',
                        header2: 'Basic Pay',
                      }}
                    />
                  </div>
                </>
              )}
              {employeesCount.isLoading && (
                <>
                  <div className="flex-col mt-5">
                    <Skeleton height="25rem" className="mb-2"></Skeleton>
                  </div>
                </>
              )}
              {!employeesCount.isLoading && (
                <>
                  {' '}
                  <div className="line-container rounded-lg p-5 flex flex-col lg:flex-col">
                    <LineChart
                      isAdmin={true}
                      MLDepositedLine={
                        lineChartQuery.isFetching ? [] : lineChartQuery?.data
                      }
                    />
                  </div>
                </>
              )}
            </div>

            <div className="w-full flex items-stretch flex-col lg:flex-row gap-5 mt-5">
              {/* TOP EMPLOYEES */}
              <div className="line-container rounded-lg p-5 flex-1 overflow-auto">
                <RecentLogs
                  logsData={{
                    logsData: attendanceData.isFetching
                      ? []
                      : attendanceData.data?.formattedData,
                  }}
                  tableHeaders={{
                    title: 'Latest Attendance',
                    header1: 'Name',
                    header2: 'Date & Time',
                  }}
                  data={attendanceData.data}
                  pagination={attendancePagination}
                  setPagination={setAttendancePagination}
                  loading={attendanceData.isLoading}
                />
              </div>
              <div className="line-container rounded-lg p-5 flex-1 overflow-auto">
                {/* LATEST ACTIVITY LOG */}
                <RecentLogs
                  logsData={{
                    logsData: activityLogData.isFetching
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
            </div>
          </div>
        </div>
      }
      <Announcements
        announcement={selectedAnnouncement}
        configuration={{ isOpen, setIsOpen }}
      ></Announcements>
    </div>
    // updated Dwine 2/23/2024: added modified dashboard display END
  );
}

export default Admin;
