'use client';
import React, { useContext, useEffect, useRef, useState } from 'react';

// Sample Data  - to be deleted after syncing with backend
import WalletAsset from './wallets/walletAsset';
import { employeeAttendance, latestAttendanceData } from 'lib/constant/logData';

import RecentLogs from './containers/recentLogs';
import LatestPayroll from './containers/latestPayroll';
import { useQueries, useQuery } from '@tanstack/react-query';
import moment from '@constant/momentTZ';
import { ProgressSpinner } from 'primereact/progressspinner';
import axios from 'axios';
import { GlobalContainer } from 'lib/context/globalContext';
import { ScrollPanel } from 'primereact/scrollpanel';
import { Fieldset } from 'primereact/fieldset';
import ReactHtmlParser from 'react-html-parser';
import Announcements from './announcements/announcement';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import { stringCut } from '@utils/stringHelper';
import { Skeleton } from 'primereact/skeleton';
import { TabPanel, TabView } from 'primereact/tabview';
import { Toast } from 'primereact/toast';
import DeleteConfirmationSidebar from './announcements/deleteConfirmationSidebar';
function Employee() {
  const context: any = useContext(GlobalContainer);
  const sessionData = context.userData;
  // added Dwine 2/23/2024: added for side bar states START
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Object>({});
  // added Dwine 2/23/2024: added for side bar states END
  //added Dwine 2/23/2024: added query for getting departmentAnnouncements START
  const [announcementData, userMessageData] = useQueries({
    queries: [
      {
        refetchOnWindowFocus: false,
        queryKey: ['announcementData'],
        queryFn: async () => {
          try {
            let response: any = await axios(`/api/departmentAnnouncements`, {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
              },
            });
            // console.log(response.data);
            const formattedData = response.data.map((item: any) => {
              let announcement = item.announcement;
              if (
                announcement.usersSeen &&
                announcement.usersSeen
                  .split(',')
                  .includes(sessionData.userId + '')
              ) {
                announcement.isViewed = true;
              } else {
                announcement.isViewed = false;
              }

              return {
                ...item,
                announcement: announcement,
              };
            });

            return formattedData;
          } catch (error) {
            console.log(error);
            return [];
          }
        },
      },
      {
        refetchOnWindowFocus: false,
        queryKey: ['userMessageData'],
        queryFn: async () => {
          try {
            let response: any = await axios(
              `/api/announcements/users/${sessionData.userId}`,
              {
                method: 'GET',
                headers: {
                  Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
                },
              }
            );
            let formattedData =
              response.data.message.length <= 0
                ? []
                : response.data.message.map((item: any) => {
                    return {
                      ...item,
                      isViewed: item.usersSeen
                        .split(',')
                        .includes(sessionData.userId + ''),
                    };
                  });
            response.data.message = formattedData;
            return response;
            // console.log(response.data);
            return response.data;
          } catch (error) {
            console.log(error);
            return [];
          }
        },
      },
    ],
  });
  //added Dwine 2/23/2024: added query for getting departmentAnnouncements END
  const [employeeData, setEmployeeData] = useState<WalletAsset>({
    title: 'Current Balance',
    company: '',
    amount: '',
    number: sessionData.contactNumber,
    bgColor: '#d80404',
  });
  const selectedMessage = useRef(-1);
  const [announcementUnviewed, setAnnouncementUnviewed] = useState(0);
  const [userMessagesUnviewed, setUserMessagesUnviewed] = useState(0);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [attendanceApplicationLogs, setAttendanceApplicationLogs] = useState(
    []
  );
  const [attendancePagination, setAttendancePagination] = useState({
    offset: 0,
    limit: 5,
  });
  const [applicationPagination, setApplicationPagination] = useState({
    offset: 0,
    limit: 5,
  });
  const toast = useRef<Toast>(null);
  const deleteMessage = () => {
    let config = {
      method: 'delete',
      maxBodyLength: Infinity,
      url: `/api/announcements/${selectedMessage.current}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
      },
    };

    axios
      .request(config)
      .then(() => {
        (function () {
          toast.current?.show({
            severity: 'success',
            summary: 'Successfully Deleted',
            life: 3000,
          });
        })();

        userMessageData.refetch();
      })
      .catch((error) => {
        (function () {
          toast.current?.show({
            severity: 'error',
            summary: 'Error Occured',
            life: 3000,
          });
        })();

        userMessageData.refetch();
      });
    setIsConfirmationOpen(false);
  };
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  // const fetchAttendanceLog = async ({
  //   limit,
  //   offset,
  // }: {
  //   limit: number;
  //   offset: number;
  // }) => {
  //   try {
  //     const response = await fetch(
  //       `/api/employeeDashboard/attendance?limit=${limit}&offset=${offset}`,
  //       {
  //         method: 'GET',
  //         headers: {
  //           Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
  //         },
  //       }
  //     );

  //     if (response.ok) {
  //       const data = await response.json();
  //       if (data.message) {
  //         const fetchedAttendanceLogs = data.message.rows.map((item: any) => ({
  //           name:
  //             item.isDayOff > 0 ? (
  //               <span className="text-blue-600">Day Off</span>
  //             ) : item.isLeave > 0 ? (
  //               'Leave'
  //             ) : item.isPresent > 0 && item.lateHours >= 0 ? (
  //               'Present'
  //             ) : (
  //               <span className="text-red-600">Late</span>
  //             ),
  //           timeDate: moment(
  //             `${item.date} ${item.timeIn}`,
  //             'YYYY-MM-DD HH:mm:ss'
  //           ).toDate(),
  //         }));
  //         setAttendanceLogs(fetchedAttendanceLogs);

  //         return data;
  //       }
  //     }
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };
  // const fetchAttendanceApplicationLog = async ({
  //   limit,
  //   offset,
  // }: {
  //   limit: number;
  //   offset: number;
  // }) => {
  //   try {
  //     const response = await fetch(
  //       `/api/employeeDashboard/attendanceApplication?limit=${limit}&offset=${offset}`,
  //       {
  //         method: 'GET',
  //         headers: {
  //           Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
  //         },
  //       }
  //     );

  //     if (response.ok) {
  //       const data = await response.json();
  //       console.log(data);
  //       if (data.message) {
  //         const fetchedAttendanceApplicationLogs = data.message.rows.map(
  //           (item: any) => ({
  //             name: item.type,
  //             action:
  //               item.isApproved === 1 ? (
  //                 <div className=" text-green-500">Approved</div>
  //               ) : item.isApproved === 2 ? (
  //                 <div className="text-red-500">Cancelled</div>
  //               ) : item.isApproved === 3 ? (
  //                 <div className="text-red-500">Disapproved</div>
  //               ) : item.isApproved === 0 ? (
  //                 <div className="text-yellow-600">Pending</div>
  //               ) : (
  //                 <div className=" text-gray-600">Undefined</div>
  //               ),
  //             timeDate: new Date(item.createdAt),
  //           })
  //         );
  //         setAttendanceApplicationLogs(fetchedAttendanceApplicationLogs);

  //         return data;
  //       }
  //     }
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };
  // const [attendanceQuery, attendanceApplicationQuery] = useQueries({
  //   queries: [
  //     {
  //       queryKey: ['attendanceLogs', attendancePagination],
  //       queryFn: () => fetchAttendanceLog(attendancePagination),
  //     },
  //     {
  //       queryKey: ['attendanceApplicationLogs', applicationPagination],
  //       queryFn: () => fetchAttendanceApplicationLog(applicationPagination),
  //     },
  //   ],
  // });

  // date time format function
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

  const attendanceQuery = useQuery({
    refetchOnWindowFocus: false,
    queryKey: ['attendanceLogs', attendancePagination],
    queryFn: async () =>
      await axios(
        `/api/employeeDashboard/attendance?limit=${attendancePagination.limit}&offset=${attendancePagination.offset}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
          },
        }
      )
        .then((response: any) => {
          if (response) {
            response.data.message['formattedData'] =
              response.data.message.rows.map((item: any) => ({
                name:
                  item.isDayOff > 0 ? (
                    <span className="text-blue-600">Day Off</span>
                  ) : item.isLeave > 0 ? (
                    'Leave'
                  ) : item.isPresent > 0 && item.lateHours >= 0 ? (
                    'Present'
                  ) : (
                    <span className="text-red-600">Late</span>
                  ),
                timeDate: formatDateTime(`${item.date} ${item.timeIn}`),
              }));
            // setAttendanceLogs(fetchedAttendanceLogs);

            return response.data.message;
          }
        })
        .catch((error) => {
          return [];
        }),
  });

  const attendanceApplicationQuery = useQuery({
    refetchOnWindowFocus: false,
    queryKey: ['applicationLogs', applicationPagination],
    queryFn: async () =>
      await axios(
        `/api/employeeDashboard/attendanceApplication?limit=${applicationPagination.limit}&offset=${applicationPagination.offset}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
          },
        }
      )
        .then((response: any) => {
          // const data: any = response.data;
          // console.log(data);

          response.data.message['formattedData'] =
            response.data.message.rows.map((item: any) => ({
              name: item.type,
              action:
                item.isApproved === 1 ? (
                  <div className=" text-green-500">Approved</div>
                ) : item.isApproved === 2 ? (
                  <div className="text-red-500">Cancelled</div>
                ) : item.isApproved === 3 ? (
                  <div className="text-red-500">Disapproved</div>
                ) : item.isApproved === 0 ? (
                  <div className="text-yellow-600">Pending</div>
                ) : (
                  <div className=" text-gray-600">Undefined</div>
                ),
              timeDate: formatDateTime(item.createdAt),
            }));
          // setAttendanceApplicationLogs(fetchedAttendanceApplicationLogs);

          return response.data.message;
        })
        .catch((error) => {
          return [];
        }),
  });
  const [announcementDataRefresher, setAnnouncementDataRefresher] =
    useState(false);
  useEffect(() => {
    let count = 0;
    if (announcementData && announcementData.data) {
      const arr = announcementData.data;
      // console.log(announcementData.data);
      for (let i = 0; i < arr?.length; i++) {
        if (arr[i].announcement && arr[i].announcement.isViewed == false) {
          count++;
        }
      }
    }

    setAnnouncementUnviewed(count);
  }, [announcementData.data, announcementDataRefresher]);

  const [userMessageDataRefresher, setUserMessageDataRefresher] =
    useState(false);
  useEffect(() => {
    let count = 0;

    if (userMessageData.data && userMessageData.data.message) {
      const arr = userMessageData?.data?.message;
      for (let i = 0; i < arr?.length; i++) {
        if (
          // arr[i].view_details.length > 0 &&
          !arr[i]?.isViewed
        ) {
          count++;
        }
      }
    }
    setUserMessagesUnviewed(count);
  }, [userMessageData.data, userMessageDataRefresher]);

  useEffect(() => {
    axios
      .get(`/api/wallet/employee`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
        },
      })
      .then((response: any) => {
        const { data } = response;
        setEmployeeData((prev: any) => ({
          ...prev,
          amount: data.balance,
        }));
      });
  }, []);
  const notifRef = useRef<any>(null);
  const [show, setShow] = useState<boolean>(false);

  return (
    <div className="w-screen h-full p-5 ">
      <div className="flex justify-between mb-5 mt-[23px] mr-5 relative items-center">
        <h1 className="font-extrabold w-full">Dashboard</h1>
        <div className="relative w-full">
          <Button
            className="rounded-full p-4 top-[21px] right-[41px] z-[40] !fixed"
            onClick={() => {
              setShow(!show);
            }}
            tooltipOptions={{ position: 'left' }}
            tooltip="Notifications"
          >
            <i
              className="pi pi-envelope p-overlay-badge"
              style={{ fontSize: '1rem' }}
            >
              <Badge
                severity="danger"
                value={
                  announcementData.data && userMessageData.data
                    ? announcementUnviewed + userMessagesUnviewed
                    : 0
                }
              ></Badge>
            </i>
          </Button>
          {/* announcement div */}
          <div
            ref={notifRef}
            style={{ visibility: show ? 'visible' : 'hidden' }}
            className="pb-5 z-[39] mt-4 overflow-hidden w-3/4 md:w-3/12 line-container rounded-lg  h-[80vh] !fixed top-[62px] justify-self-end right-[50px]"
          >
            {/* initial announcement view */}
            {/* <div>
              <h1
                className="
                p-3
                text-lg
                font-bold
                leading-none
                tracking-tight
                text-gray-900 pb-5"
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
                      {userMessageData?.data?.message.map(
                        (item: any, index: number) => (
                          <Fieldset
                            toggleable
                            legend={
                              <>
                                {item?.view_details.length > 0 &&
                                  !item?.view_details[0].isViewed && (
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
                              className="w-full flex flex-col"
                              onClick={(e) => {
                                e.preventDefault();
                                // console.log(announcementData.data);

                                if (
                                  userMessageData?.data?.message[index]
                                    .view_details[0]?.isViewed === false
                                ) {
                                  const response: any = axios(
                                    `/api/viewDetails/${userMessageData?.data?.message[index].view_details[0].viewDetailsId}`,
                                    {
                                      method: 'PATCH',
                                      headers: {
                                        Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
                                      },
                                    }
                                  );

                                  userMessageData.data.message[
                                    index
                                  ].view_details[0].isViewed = true;
                                  setAnnouncementDataRefresher(
                                    !announcementDataRefresher
                                  );
                                }

                                setSelectedAnnouncement(item);
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
                      )}
                      {announcementData?.data.map(
                        (item: any, index: number) => (
                          <Fieldset
                            toggleable
                            legend={
                              <>
                                {!item?.announcement.view_details[0]
                                  ?.isViewed && (
                                  <i
                                    className="pi pi-circle-fill mr-[5px]"
                                    style={{ color: '#7bf72f' }}
                                  ></i>
                                )}
                                {item.announcement.title}
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
                              className="w-full flex flex-col"
                              onClick={(e) => {
                                e.preventDefault();
                                // console.log(announcementData.data);

                                if (
                                  announcementData.data[index].announcement
                                    .view_details[0]?.isViewed === false
                                ) {
                                  const response: any = axios(
                                    `/api/viewDetails/${announcementData.data[index].announcement.view_details[0].viewDetailsId}`,
                                    {
                                      method: 'PATCH',
                                      headers: {
                                        Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
                                      },
                                    }
                                  );
                                  announcementData.data[
                                    index
                                  ].announcement.view_details[0].isViewed =
                                    true;
                                  setAnnouncementDataRefresher(
                                    !announcementDataRefresher
                                  );
                                }

                                setSelectedAnnouncement(item.announcement);
                                setIsOpen(true);
                              }}
                            >
                              <div className="flex flex-row justify-between w-full">
                                <p className=" break-words text-left overflow-hidden max-h-[120px] w-full">
                                  {stringCut(item.announcement.content, 175, 5)}
                                </p>
                              </div>
                              <p className=" text-right text-sm mt-2 text-gray-400 self-end">
                                {' ' +
                                  moment(
                                    item.announcement.updatedAt,
                                    'YYYY-MM-DD HH:mm:ss'
                                  ).format('LLLL')}
                              </p>
                            </button>
                          </Fieldset>
                        )
                      )}
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
            </div> */}
            {/* initial announcement view end */}
            <TabView>
              <TabPanel
                className="mb-[2px]"
                header={
                  <>
                    Announcements{' '}
                    {announcementUnviewed > 0 && (
                      <>
                        <div className=" w-[10px] h-[10px] rounded-full bg-[#d80404] float-right mt-[5px] ml-[5px]"></div>
                      </>
                    )}
                  </>
                }
              >
                <ScrollPanel
                  className="announcementbar1"
                  style={{
                    height: '70vh',

                    paddingBottom: 5,
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
                        {announcementData?.data.map(
                          (item: any, index: number) => (
                            <Fieldset
                              toggleable
                              legend={
                                <>
                                  {item?.announcement &&
                                    !item?.announcement?.isViewed && (
                                      <i
                                        className="pi pi-circle-fill mr-[5px]"
                                        style={{ color: '#7bf72f' }}
                                      ></i>
                                    )}
                                  {item?.announcement.title}
                                </>
                              }
                              key={item.announcement.announcementId}
                              color="primary"
                              style={{
                                width: '100%',
                                backgroundColor: '#fcf3f4',
                              }}
                            >
                              <button
                                className="w-full flex flex-col"
                                onClick={(e) => {
                                  e.preventDefault();
                                  // console.log(announcementData.data);
                                  // console.log('helloworld');
                                  if (
                                    announcementData.data[index].announcement
                                      ?.isViewed === false
                                  ) {
                                    const response: any = axios(
                                      // `/api/viewDetails/${announcementData.data[index]?.announcement.view_details[0]?.viewDetailsId}`,
                                      `/api/viewDetails/${announcementData.data[index]?.announcementId}`,
                                      {
                                        method: 'PATCH',
                                        headers: {
                                          Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
                                        },
                                      }
                                    );
                                    announcementData.data[
                                      index
                                    ].announcement.isViewed = true;
                                    setAnnouncementDataRefresher(
                                      !announcementDataRefresher
                                    );
                                  }

                                  setSelectedAnnouncement(item.announcement);
                                  setIsOpen(true);
                                }}
                              >
                                <div className="flex flex-row justify-between w-full">
                                  <p className=" break-words text-left overflow-hidden max-h-[120px] w-full">
                                    {stringCut(
                                      item.announcement.content
                                        ? item.announcement.content
                                        : '',
                                      175,
                                      5
                                    )}
                                  </p>
                                </div>
                                <p className=" text-right text-sm mt-2 text-gray-400 self-end">
                                  {' ' +
                                    moment(
                                      item.announcement.updatedAt,
                                      'YYYY-MM-DD HH:mm:ss'
                                    ).format('LLLL')}
                                </p>
                              </button>
                            </Fieldset>
                          )
                        )}
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
              </TabPanel>
              <TabPanel
                header={
                  <>
                    Messages{' '}
                    {userMessagesUnviewed > 0 && (
                      <>
                        <div className=" w-[10px] h-[10px] rounded-full bg-[#d80404] float-right mt-[5px] ml-[5px]"></div>
                      </>
                    )}
                  </>
                }
              >
                <ScrollPanel
                  className="announcementbar1"
                  style={{
                    height: '70vh',

                    paddingBottom: 5,
                  }}
                >
                  {!userMessageData.data ||
                    (userMessageData.data?.message &&
                      userMessageData.data?.message.count < 0 &&
                      userMessageData?.isFetching === false && (
                        <>No Announcements</>
                      ))}
                  {userMessageData.data?.message &&
                    userMessageData?.isFetching === false && (
                      <div className="flex flex-col gap-4 w-full">
                        {userMessageData?.data?.message.map(
                          (item: any, index: number) => (
                            <Fieldset
                              toggleable
                              legend={
                                <>
                                  {item?.announcement > 0 &&
                                    !item?.announcement.isViewed && (
                                      <i
                                        className="pi pi-circle-fill mr-[5px]"
                                        style={{ color: '#7bf72f' }}
                                      ></i>
                                    )}
                                  {item.announcement.title}
                                  <i
                                    className="pi pi-times float-right"
                                    onClick={() => {
                                      selectedMessage.current =
                                        item.announcement.announcementId;
                                      setIsConfirmationOpen(true);
                                    }}
                                  ></i>
                                </>
                              }
                              key={item.announcement.announcementId}
                              color="primary"
                              style={{
                                width: '100%',
                                backgroundColor: '#fcf3f4',
                              }}
                            >
                              <button
                                className="w-full flex flex-col"
                                onClick={(e) => {
                                  e.preventDefault();
                                  // console.log(announcementData.data);

                                  if (
                                    userMessageData?.data?.message[index]
                                      .isViewed === false
                                  ) {
                                    const response: any = axios(
                                      // `/api/viewDetails/${userMessageData?.data?.message[index]?.view_details[0]?.viewDetailsId}`,
                                      `/api/viewDetails/${userMessageData?.data?.message[index]?.announcementId}`,
                                      {
                                        method: 'PATCH',
                                        headers: {
                                          Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
                                        },
                                      }
                                    );

                                    userMessageData.data.message[
                                      index
                                    ].isViewed = true;
                                    setUserMessageDataRefresher(
                                      !userMessageDataRefresher
                                    );
                                  }

                                  setSelectedAnnouncement(item.announcement);
                                  setIsOpen(true);
                                }}
                              >
                                <div className="flex flex-row justify-between w-full">
                                  <p className=" break-words text-left overflow-hidden max-h-[120px] w-full">
                                    {stringCut(
                                      item.announcement.content,
                                      175,
                                      5
                                    )}
                                  </p>
                                </div>
                                <p className=" text-right text-sm mt-2 text-gray-400 self-end">
                                  {' ' +
                                    moment(
                                      item.announcement.updatedAt,
                                      'YYYY-MM-DD HH:mm:ss'
                                    ).format('LLLL')}
                                </p>
                              </button>
                            </Fieldset>
                          )
                        )}
                      </div>
                    )}
                  {userMessageData.isLoading === true && (
                    <div className="flex-col mt-5">
                      <Skeleton height="10rem" className="mb-3"></Skeleton>
                      <Skeleton height="10rem" className="mb-3"></Skeleton>
                      <Skeleton height="10rem" className="mb-3"></Skeleton>
                    </div>
                  )}
                </ScrollPanel>
              </TabPanel>
            </TabView>
          </div>
        </div>
      </div>
      <Toast ref={toast} position="bottom-left" />
      <DeleteConfirmationSidebar
        configuration={{
          isOpen: isConfirmationOpen,
          setIsOpen: setIsConfirmationOpen,
        }}
        label={{
          buttonText: 'Are you sure you want to delete this message?',
          title: 'Delete Message',
        }}
        actionButton={deleteMessage}
      ></DeleteConfirmationSidebar>
      {attendanceQuery.isLoading && attendanceApplicationQuery.isLoading ? (
        <div>
          <div className="flex gap-6">
            <Skeleton height="15rem" className="mb-2"></Skeleton>
            <Skeleton height="15rem" className="mb-2"></Skeleton>
          </div>
          <div className="flex gap-6">
            <Skeleton height="15rem" className="mb-2"></Skeleton>
            <Skeleton height="15rem" className="mb-2"></Skeleton>
          </div>
        </div>
      ) : (
        //  updated Dwine 2/23/2024: modified width start
        <div className="flex flex-col lg:flex-row gap-1 md:gap-1 w-full md:w-full">
          <div className="w-full md:w-full">
            {/* updated Dwine 2/23/2024: modified width end   */}
            <div className="flex gap-5 w-full flex-col lg:flex-row">
              <LatestPayroll />

              <WalletAsset
                title={employeeData.title}
                company={employeeData.company}
                amount={employeeData.amount}
                number={employeeData.number}
                bgColor={employeeData.bgColor}
              />
            </div>
            <div className="flex gap-5 flex-col lg:flex-row">
              <div className="line-container rounded-lg p-5 flex flex-row  overflow-auto">
                <RecentLogs
                  logsData={{
                    logsData: attendanceQuery.isFetching
                      ? []
                      : attendanceQuery.data?.formattedData,
                  }}
                  tableHeaders={{
                    title: 'Latest Attendance',
                    header1: 'Status',
                    header2: 'Date & Time',
                  }}
                  loading={false}
                  data={attendanceQuery.data}
                  pagination={attendancePagination}
                  setPagination={setAttendancePagination}
                />
              </div>
              <div className="line-container rounded-lg p-5 flex flex-row  overflow-auto">
                <RecentLogs
                  // loading={false}
                  logsData={{
                    logsData: attendanceApplicationQuery.isFetching
                      ? []
                      : attendanceApplicationQuery.data?.formattedData,
                  }}
                  tableHeaders={{
                    title: 'Attendance Applications',
                    header1: 'Application Type',
                    header2: 'Date & Time',
                  }}
                  data={attendanceApplicationQuery.data}
                  pagination={applicationPagination}
                  setPagination={setApplicationPagination}
                  loading={false}
                />
              </div>
            </div>
          </div>
          {/*   added Dwine 2/23/2024: added div for announcements start */}
          {/*   added Dwine 2/23/2024: added div for announcements end*/}
        </div>
      )}
      <Announcements
        configuration={{ isOpen, setIsOpen }}
        announcement={selectedAnnouncement}
      ></Announcements>
    </div>
  );
}

export default Employee;
