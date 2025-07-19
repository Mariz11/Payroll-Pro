'use client';
import React, { useContext, useEffect, useRef, useState } from 'react';
import ReactHtmlParser from 'react-html-parser';
import { Button } from 'primereact/button';

import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';

import { useQuery } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';

import { ButtonType } from '@enums/button';
import { yupResolver } from '@hookform/resolvers/yup';

import DashboardNav from 'lib/components/blocks/dashboardNav';
import { VDivider } from 'lib/components/blocks/divider';
import { GlobalContainer } from 'lib/context/globalContext';
import { AnnouncementFormValidator } from 'lib/validation/announcementFormValidator';
import UserSidebar from './announcementSidebar';
import { ParseDate, ParseDateStringtoFormatted } from '@utils/parseDate';
import { DataTable } from 'primereact/datatable';

import classNames from 'classnames';
import ConfirmationSidebar from './confirmationSidebar';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Paginator } from 'primereact/paginator';
import AnnouncementSidebar from './announcementSidebar';
import announcement from 'db/models/announcement';
import { stringCut } from '@utils/stringHelper';
import { Skeleton } from 'primereact/skeleton';
import ErrorDialog from 'lib/components/blocks/errorDialog';

function Announcements() {
  const [selectedLogo, setSelectedLogo] = useState<{
    text: string;
    name: any;
    url: string;
  }>({
    text: 'Choose Image',
    name: null,
    url: '/images/noimage.jpg',
  });
  const context = useContext(GlobalContainer);
  const userData = context?.userData;
  const toast = useRef<Toast>(null);
  let rowCount = useRef(0);
  const [pagination, setPagination] = useState({
    offset: 0,
    limit: 5,
    first: 0,
  });
  const [valueSearchText, setValueSearchText] = useState('');

  const [state, setState] = useState({
    dashboardNavButtons: [],
    offsit: 0,
    limit: 5,
    userId: -1,
    companyId: -1,
  });

  const [actions, setActions] = useState({
    announcementId: -1,
  });
  const [openSidebar, setOpenSidebar] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);
  // use Ref to not cause rerender(optimization)
  const buttonText = useRef('');
  const [sidebarTitle, setSidebarTitle] = useState('');

  useEffect(() => {
    setState((prev: any) => {
      return {
        ...prev,
        dashboardNavButtons: [
          {
            label: 'Add New',
            type: ButtonType.Red,
            isDropdown: false,
            isIcon: false,
            handler: () => {
              setValue('departments', []);
              setValue('content', '');
              setValue('order', -1);
              // if (context.authRole === 'SUPER_ADMIN') {
              //   setValue('departments', [
              //     { departmentName: '', departmentId: null },
              //   ]);
              // }

              handleSidebar('Create', 'Create Announcement');
            },
          },
        ],
      };
    });

    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [, context?.authRole]);

  const [selectedAnnouncement, setSelectedAnnouncement] = useState({});

  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ['announcements', pagination, valueSearchText],
    queryFn: () =>
      fetch(
        `/api/announcements?offset=${pagination.offset}&limit=${pagination.limit}&search=${valueSearchText}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
          },
        }
      )
        .then((res) => res.json())
        .catch((err) => []),
  });
  useEffect(() => {
    if (data) {
      rowCount.current = data?.count;
    }
  }, [data]);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid, isSubmitting },
    setValue,
    watch,
    reset,
    control,
  } = useForm({
    mode: 'onSubmit',
    resolver: yupResolver(AnnouncementFormValidator),
  });

  //   const countOnlyAdmin = data?.data?.filter((userData: any) => {
  //     return userData.role === 'ADMIN';
  //   });
  useEffect(() => {
    if (localStorage.getItem('submittingAnnouncement') == 'true') {
      localStorage.removeItem('submittingAnnouncement');
    }
  }, []);

  return (
    <div className="w-screen h-screen overflow-auto p-5">
      {/* DASHBOARD NAV */}
      <DashboardNav
        navTitle="Announcements"
        buttons={[...state.dashboardNavButtons]}
        searchPlaceholder=""
        isShowSearch={true}
        valueSearchText={valueSearchText}
        setValueSearchText={setValueSearchText}
      />

      {/* MAIN CONTENT */}
      <div className="line-container rounded-lg p-5">
        <React.Fragment>
          {error ? (
            <ErrorDialog />
          ) : isLoading ? (
            <span>Fetching Data</span>
          ) : (
            <DataTable
              value={
                isLoading
                  ? [
                      {
                        dummy: '',
                      },
                      {
                        dummy: '',
                      },
                      {
                        dummy: '',
                      },
                    ]
                  : data.rows
              }
              tableStyle={{ minWidth: '50rem' }}
              selectionMode={'single'}
              onSelectionChange={(e) => {
                if (isLoading) return null;
                setSelectedLogo(() => {
                  if (
                    !e.value.image ||
                    e.value.image == '' ||
                    e.value.image == ' '
                  )
                    return {
                      text: 'Update Image',
                      name: e.value?.image,
                      url: '/images/noimage.jpg',
                    };
                  return {
                    text: 'Update Image',
                    name: e.value?.image,
                    url: `${
                      process.env.NEXT_PUBLIC_ML_FILE_UPLOAD_URL
                    }/${encodeURIComponent(e.value?.image)}`,
                  };
                });
                handleSidebar('Close', 'View Announcement');

                setSelectedAnnouncement(e.value);
              }}
            >
              <Column
                field="title"
                header="Title"
                body={(data) => {
                  if (isLoading) return <Skeleton />;
                  return data.title;
                }}
              />
              <Column
                field="content"
                header="Content"
                body={(data) => {
                  if (isLoading) return <Skeleton />;
                  return (
                    <div className=" overflow-hidden max-h-[50px]">
                      <span>{stringCut(data.content, 80, 2)}</span>
                    </div>
                  );
                }}
              />
              <Column
                field="departments"
                header={
                  context && context.authRole !== 'SUPER_ADMIN'
                    ? 'Departments'
                    : 'Companies'
                }
                body={(data) => {
                  if (isLoading) return <Skeleton />;
                  return data.department_announcements.map(
                    (
                      item: any,
                      i: number,
                      row: { departmentName: string; departmentId: number }[]
                    ) => {
                      if (context?.authRole === 'SUPER_ADMIN') {
                        if (!item.company || !item.company.companyName)
                          return null;
                        return i + 1 === row.length
                          ? item.company.companyName
                          : item.company.companyName + ',';
                      } else {
                        if (
                          !item.department ||
                          !item.department?.departmentName
                        )
                          return null;
                        return i + 1 === row.length
                          ? item.department?.departmentName
                          : item.department?.departmentName + ',';
                      }
                    }
                  );
                }}
              />

              <Column
                field="actions"
                header="Actions"
                body={(rowData) => {
                  if (isLoading) return <Skeleton />;
                  return (
                    <div
                      className={classNames(
                        'flex-row gap-1 flex'
                        // rowData.role === 'EMPLOYEE' ? 'hidden' : 'flex'
                      )}
                    >
                      {userData.role !== 'USER' && (
                        <>
                          <Button
                            type="button"
                            text
                            severity="secondary"
                            icon="pi pi-file-edit"
                            tooltip="Edit"
                            tooltipOptions={{ position: 'top' }}
                            onClick={() => {
                              if (
                                localStorage.getItem('submittingAnnouncement')
                              ) {
                                toast.current?.replace({
                                  severity: 'error',
                                  summary:
                                    'Please wait until the previous operation is completed',
                                  life: 3000,
                                });

                                return;
                              }
                              handleSidebar('Update', 'Edit Announcement');
                              setValue('title', rowData.title);
                              setValue('content', rowData.content);

                              setSelectedLogo(() => {
                                if (
                                  !rowData.image ||
                                  rowData.image == '' ||
                                  rowData.image == ' '
                                )
                                  return {
                                    text: 'Update Image',
                                    name: rowData?.image,
                                    url: '/images/noimage.jpg',
                                  };
                                return {
                                  text: 'Update Image',
                                  name: rowData?.image,
                                  url: `${
                                    process.env.NEXT_PUBLIC_ML_FILE_UPLOAD_URL
                                  }/${encodeURIComponent(rowData?.image)}`,
                                };
                              });
                              if (context?.authRole === 'SUPER_ADMIN') {
                                // console.log('hi');
                                // console.log(
                                //   rowData.department_announcements.map(
                                //     (department: any) => {
                                //       return {
                                //         departmentId: department.companyId,
                                //         departmentName:
                                //           department.company &&
                                //           department.company.companyName
                                //             ? department.company.companyName
                                //             : null,
                                //       };
                                //     }
                                //   )
                                // );
                                // console.log(rowData);
                                setValue(
                                  'departments',
                                  rowData.department_announcements
                                    .map((department: any) => {
                                      return {
                                        departmentId: department.companyId,
                                        departmentName:
                                          department.company &&
                                          department.company.companyName
                                            ? department.company.companyName
                                            : null,
                                      };
                                    })
                                    .filter(
                                      (i: any) =>
                                        i != null && i.departmentId != 1
                                    )
                                );
                              } else {
                                setValue(
                                  'departments',
                                  rowData.department_announcements
                                    .filter((department: any) => {
                                      return department.department != null;
                                    })
                                    .map((department: any) => {
                                      return {
                                        departmentId: department.departmentId,
                                        departmentName:
                                          department.department.departmentName,
                                      };
                                    })
                                );
                              }
                              setValue('order', rowData.order);

                              setActions({
                                announcementId: rowData.announcementId,
                              });
                            }}
                          />
                          <VDivider />
                          <Button
                            type="button"
                            text
                            icon="pi pi-trash"
                            tooltip="Delete"
                            tooltipOptions={{ position: 'top' }}
                            onClick={() => {
                              if (
                                localStorage.getItem('submittingAnnouncement')
                              ) {
                                toast.current?.replace({
                                  severity: 'error',
                                  summary:
                                    'Please wait until the previous operation is completed',
                                  life: 3000,
                                });

                                return;
                              }
                              setIsOpen2(true);

                              buttonText.current = `Do you really want to remove ${rowData.title}?`;

                              setSidebarTitle('Delete Announcement');
                              setActions((prev) => ({
                                ...prev,
                                announcementId: rowData.announcementId,
                              }));
                            }}
                          />
                          <VDivider />
                        </>
                      )}

                      {rowData.isPosted ? (
                        <Button
                          type="button"
                          text
                          severity="secondary"
                          icon="pi pi-times"
                          tooltip="Unpost"
                          tooltipOptions={{ position: 'top' }}
                          style={{ color: 'black' }}
                          onClick={() => {
                            if (
                              localStorage.getItem('submittingAnnouncement')
                            ) {
                              toast.current?.replace({
                                severity: 'error',
                                summary:
                                  'Please wait until the previous operation is completed',
                                life: 3000,
                              });

                              return;
                            }

                            setIsOpen2(true);

                            buttonText.current = `Do you really want to unpost ${rowData.title}?`;

                            setSidebarTitle('Unpost Announcement');
                            setActions({
                              announcementId: rowData.announcementId,
                            });
                          }}
                        />
                      ) : (
                        rowData.role !== 'ADMIN' && (
                          <Button
                            type="button"
                            text
                            severity="secondary"
                            icon="pi pi-check"
                            tooltip="Post"
                            tooltipOptions={{ position: 'top' }}
                            className="text-"
                            onClick={() => {
                              if (
                                localStorage.getItem('submittingAnnouncement')
                              ) {
                                toast.current?.replace({
                                  severity: 'error',
                                  summary:
                                    'Please wait until the previous operation is completed',
                                  life: 3000,
                                });

                                return;
                              }

                              setIsOpen2(true);
                              buttonText.current = `Do you really want to post ${rowData.title}?`;
                              setSidebarTitle('Post Announcement');
                              setActions({
                                announcementId: rowData.announcementId,
                              });
                            }}
                          />
                        )
                      )}
                    </div>
                  );
                }}
                headerClassName="w-10rem"
              />
            </DataTable>
          )}
          <Paginator
            first={pagination.first}
            rows={pagination.limit}
            totalRecords={data && data.count}
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
        </React.Fragment>
      </div>

      {/* SIDEBAR */}
      <AnnouncementSidebar
        control={control}
        selectedLogo={selectedLogo}
        setSelectedLogo={setSelectedLogo}
        configuration={{
          isOpen: openSidebar,
          setIsOpen: setOpenSidebar,
        }}
        label={{
          title: sidebarTitle,
          buttonText: buttonText.current,
        }}
        count={rowCount.current}
        register={register}
        selectedAnnouncement={selectedAnnouncement}
        handleSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        errors={errors}
        setValue={setValue}
        watch={watch}
        reset={reset}
        refetch={refetch}
        userId={state.userId}
        companyId={state.companyId}
        context={context}
        isDirty={isDirty}
        isValid={isValid}
        toast={toast}
        id={actions.announcementId}
      />

      <ConfirmationSidebar
        configuration={{
          isOpen: isOpen2,
          setIsOpen: setIsOpen2,
        }}
        label={{
          title: sidebarTitle,
          buttonText: buttonText.current,
        }}
        actionButton={() => {
          if (sidebarTitle === 'Delete Announcement') {
            let config = {
              method: 'delete',
              maxBodyLength: Infinity,
              url: `/api/announcements/${actions.announcementId}`,
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
              },
            };

            axios
              .request(config)
              .then(() => {
                (function () {
                  toast.current?.replace({
                    severity: 'success',
                    summary: 'Successfully Deleted',
                    life: 3000,
                  });
                })();

                refetch();
              })
              .catch((error) => {
                (function () {
                  toast.current?.replace({
                    severity: 'error',
                    summary: 'Error Occured',
                    life: 3000,
                  });
                })();

                refetch();
              });
          } else {
            let config = {
              method: 'patch',
              maxBodyLength: Infinity,
              url: `/api/announcements/${actions.announcementId}/post`,
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
              },
            };
            if (localStorage.getItem('submittingAnnouncement')) {
              toast.current?.replace({
                severity: 'error',
                summary:
                  'Please wait until the previous operation is completed',
                life: 3000,
              });

              return;
            }
            localStorage.setItem('submittingAnnouncement', 'true');
            if (sidebarTitle === 'Post Announcement') {
              axios
                .request(config)
                .then(() => {
                  (function () {
                    toast.current?.replace({
                      severity: 'success',
                      summary: 'Successfully Posted',
                      life: 3000,
                    });
                  })();
                  localStorage.removeItem('submittingAnnouncement');
                  refetch();
                })
                .catch((error) => {
                  (function () {
                    toast.current?.replace({
                      severity: 'error',
                      summary: 'Error Occured',
                      life: 3000,
                    });
                  })();
                  localStorage.removeItem('submittingAnnouncement');
                  refetch();
                });
            } else if (sidebarTitle === 'Unpost Announcement') {
              config.url = `/api/announcements/${actions.announcementId}/unpost`;
              axios
                .request(config)
                .then(() => {
                  (function () {
                    toast.current?.replace({
                      severity: 'success',
                      summary: 'Successfully Unposted',
                      life: 3000,
                    });
                  })();
                  localStorage.removeItem('submittingAnnouncement');
                  refetch();
                })
                .catch((error) => {
                  (function () {
                    toast.current?.replace({
                      severity: 'error',
                      summary: 'Error Occured',
                      life: 3000,
                    });
                  })();
                  localStorage.removeItem('submittingAnnouncement');
                  refetch();
                });
            }
          }

          setIsOpen2(false);
        }}
      />

      {/* TOAST */}
      <Toast ref={toast} position="bottom-left" />
    </div>
  );
  // HELPERS

  // HANDLERS
  // function deactivateActivate(userId: number, isActive: boolean) {
  //   let config = {
  //     method: 'patch',
  //     maxBodyLength: Infinity,
  //     url: `/api/user/${userId}`,
  //     headers: {
  //       'Content-Type': 'application/json',
  //       Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
  //     },
  //     data: JSON.stringify({ isActive: isActive ? 0 : 1 }),
  //   };

  //   axios
  //     .request(config)
  //     .then(() => {
  //       (function () {
  //         refetch();
  //         toast.current?.replace({
  //           severity: 'success',
  //           summary: isActive
  //             ? 'Successfully Deactivated'
  //             : 'Successfully Activated',
  //           // detail: 'User Status successfully updated',
  //           life: 3000,
  //         });
  //       })();
  //     })
  //     .catch((error) => {
  //       (function () {
  //         toast.current?.replace({
  //           severity: 'error',
  //           summary: 'Error Occured',
  //           // detail: `${error.response.data.message}`,
  //           life: 3000,
  //         });
  //       })();

  //       refetch();
  //     });
  // }

  function handleSidebar(button: string, title: string) {
    // setButtonText(button);
    buttonText.current = button;
    setSidebarTitle(title);
    setOpenSidebar(true);
  }
}

export default Announcements;
