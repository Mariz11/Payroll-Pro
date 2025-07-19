'use client';

import React, { useState, useRef, useEffect } from 'react';

import ReactHtmlParser from 'react-html-parser';
import { Button } from 'primereact/button';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Sidebar } from 'primereact/sidebar';
import { Toast } from 'primereact/toast';
import { ScrollPanel } from 'primereact/scrollpanel';
import Image from 'next/image';

import {
  Control,
  Controller,
  FieldErrors,
  UseFormHandleSubmit,
  UseFormRegister,
  UseFormReset,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';

import classNames from 'classnames';
import axios from 'axios';
import moment from '@constant/momentTZ';
import { Editor, EditorTextChangeEvent } from 'primereact/editor';
import { MultiSelect } from 'primereact/multiselect';
import { fileUploadToCloud } from '@utils/imageUpload';
import { Galleria, GalleriaResponsiveOptions } from 'primereact/galleria';
import { renderHeader } from './editorHeader';
// text header editor

const AnnouncementSidebar = ({
  configuration: { isOpen, setIsOpen },
  label: { buttonText, title },
  id,
  register,
  handleSubmit,
  errors,
  setValue,
  count,
  isSubmitting,
  watch,
  reset,
  refetch,
  context,
  isDirty,
  isValid,
  selectedAnnouncement,
  toast,
  selectedLogo,
  setSelectedLogo,
  control,
}: {
  id: number;
  configuration: Configuration;
  label: Label;
  register: UseFormRegister<AnnouncementForm>;
  handleSubmit: UseFormHandleSubmit<AnnouncementForm>;
  errors: FieldErrors<AnnouncementForm>;
  setValue: UseFormSetValue<AnnouncementForm>;
  selectedAnnouncement: any;
  isSubmitting: boolean;
  count: number;
  watch: UseFormWatch<AnnouncementForm>;
  reset: UseFormReset<AnnouncementForm>;
  refetch: any;
  userId: number;
  companyId: number;
  context: GlobalContext | null;
  isDirty: boolean;
  isValid: boolean;
  toast: React.RefObject<Toast>;
  selectedLogo: {
    text: string;
    name: any;
    url: string;
  };
  setSelectedLogo: React.Dispatch<
    React.SetStateAction<{
      text: string;
      name: string | null;
      url: string;
    }>
  >;
  control: Control<AnnouncementForm>;
}) => {
  const userData = context?.userData;
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [isButtonLabelChange, setIsButtonLabelChange] = useState(false);
  const [isRetrievingDept, setisRetrievingDept] = useState(true);

  const [fileName, setFileName] = useState<any>(null);

  const header = renderHeader();
  // retrieve departments
  useEffect(() => {
    setisRetrievingDept(true);
    if (context?.authRole !== 'SUPER_ADMIN') {
      axios
        .get('/api/announcements/departments?offset=0&limit=99999&search=', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
          },
        })
        .then((res) => {
          //get only department id and name
          const deptIdsNamesOnly = res.data?.message?.rows.map(
            (department: any) => {
              return {
                departmentName: department.departmentName,
                departmentId: department.departmentId,
              };
            }
          );
          setDepartmentOptions(deptIdsNamesOnly);
          setisRetrievingDept(false);
        })
        .catch((err) => {
          toast.current?.replace({
            severity: 'error',
            detail: `${err}`,
            life: 3000,
          });
          setDepartmentOptions([]);
          setisRetrievingDept(false);
        });
    } else {
      axios
        .get(
          '/api/announcements/companies?offset=0&limit=99999&search=&mode=dropDown',
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
            },
          }
        )
        .then((res) => {
          //get only department id and name

          const compIdsNamesOnly = res.data?.rows.map((company: any) => {
            return {
              departmentName: company.companyName,
              departmentId: company.companyId,
            };
          });
          setDepartmentOptions(compIdsNamesOnly);
          setisRetrievingDept(false);
        })
        .catch((err) => {
          setDepartmentOptions([]);
          setisRetrievingDept(false);
          toast.current?.replace({
            severity: 'error',
            detail: `${err}`,
            life: 3000,
          });
        });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const image =
      selectedAnnouncement.image === ''
        ? '/images/noimage.jpg'
        : `${process.env.NEXT_PUBLIC_ML_FILE_UPLOAD_URL}/${encodeURIComponent(
            selectedAnnouncement.image
          )}`;
    setImages(() => [
      {
        src: image,
        alt: 'zoom',
      },
    ]);
  }, [selectedAnnouncement]);
  const [images, setImages] = useState<any>([]);
  const galleria = useRef<any>(null);

  const responsiveOptions: GalleriaResponsiveOptions[] = [
    {
      breakpoint: '1500px',
      numVisible: 5,
    },
    {
      breakpoint: '1024px',
      numVisible: 3,
    },
    {
      breakpoint: '768px',
      numVisible: 2,
    },
    {
      breakpoint: '560px',
      numVisible: 1,
    },
  ];

  const itemTemplate = (item: any) => {
    return (
      <Image
        src={item.src}
        alt={item.alt}
        className=" max-h-[90vh]"
        width={1280}
        height={720}
        sizes="100vw"
      />
    );
  };

  const thumbnailTemplate = (item: any) => {
    return <></>;
  };

  return (
    <div className="announcement-sidebar  ">
      <Sidebar
        position="right"
        className="announcement-p-sidebar-md "
        visible={isOpen}
        style={{
          width: title === 'View Announcement' ? '87%' : '100%',
        }}
        onHide={() => {
          setSelectedLogo({
            text: 'Choose Image',
            name: null,
            url: '/images/noimage.jpg',
          });
          setIsOpen(false);
          reset();
        }}
      >
        <Galleria
          className="announcementgallery"
          ref={galleria}
          value={images}
          responsiveOptions={responsiveOptions}
          // numVisible={9}
          style={{ maxWidth: '50%' }}
          // circular
          fullScreen
          // showItemNavigators
          item={itemTemplate}
          thumbnail={thumbnailTemplate}
        />
        <React.Fragment>
          {title !== 'View Announcement' ? (
            <h1 className="text-black font-medium text-3xl px-[7%]">{title}</h1>
          ) : (
            <></>
          )}
        </React.Fragment>
        {title === 'View Announcement' && (
          <div className=" h-full flex flex-col w-full">
            <div className=" h-full mx-10 mt-[50px] flex flex-col justify-start ">
              <div className="mb-[40px]">
                <h1 className="text-black font-medium text-4xl break-words">
                  {selectedAnnouncement?.title}
                </h1>
                <p className=" text-sm">
                  {moment(
                    selectedAnnouncement?.updatedAt,
                    'YYYY-MM-DD HH:mm:ss'
                  ).format('MMMM D, YYYY')}
                </p>
              </div>

              <div className="flex gap-5  flex-col md:flex-row lg:flex-row">
                <div className="w-max-[360px] ">
                  <Image
                    onClick={() => {
                      const image =
                        selectedAnnouncement.image === ''
                          ? '/images/noimage.jpg'
                          : `${
                              process.env.NEXT_PUBLIC_ML_FILE_UPLOAD_URL
                            }/${encodeURIComponent(
                              selectedAnnouncement.image
                            )}`;
                      setImages([
                        {
                          src: image,
                          alt: 'zoom',
                        },
                      ]);
                      // console.log(images);
                      galleria.current.show();
                    }}
                    src={selectedLogo.url}
                    width={360}
                    height={200}
                    alt={selectedLogo.name}
                  ></Image>
                </div>
                <div className="w-full md:w-8/12 h-[50vh] overflow-auto">
                  {/* <ScrollPanel
                  style={{ width: '100%', height: '100%' }}
                  color="success"
                  className="announcementbar1"
                >
                  <div className=" break-words w-full">
                    {ReactHtmlParser(selectedAnnouncement?.content)}
                  </div>
                </ScrollPanel> */}
                  <Editor
                    className="read-only-editor"
                    style={{ width: '100%', height: '100%' }}
                    value={selectedAnnouncement?.content}
                    readOnly
                    headerTemplate={<></>}
                  ></Editor>
                </div>
              </div>
              <div className="mt-10 w-full flex justify-end align-bottom">
                <Button
                  rounded
                  className="rounded-full px-20 justify-center"
                  severity="secondary"
                  text
                  label="Cancel"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsOpen(false);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {title !== 'View Announcement' && (
          <form
            className="w-full  gap-3 flex flex-col px-[110px] "
            onSubmit={handleSubmit((data) => onSubmit(data))}
          >
            {/* title */}
            <div className="flex-col flex"></div>
            <div className="col-span-2 w-full card flex justify-content-center flex-col text-[12px] flex-auto ">
              <label className="my-1">
                <span className="text-red-500">*</span>Title
              </label>
              <InputText
                {...register('title', {
                  required: 'title is required',
                })}
                className={classNames('w-full')}
                placeholder="Enter title"
                disabled={title === 'View Announcement' ? true : false}
              />
              {errors.title && (
                <span className="text-red-500">{errors.title.message}</span>
              )}
            </div>

            {/* content */}
            <div className="col-span-2 w-full card flex justify-content-center flex-col text-[12px] flex-auto">
              <label className="my-1">
                <span className="text-red-500">*</span>Content
              </label>
              <Controller
                name="content"
                control={control}
                rules={{ required: 'Content is required.' }}
                render={({ field }) => (
                  <Editor
                    id={field.name}
                    name="content"
                    value={field.value}
                    headerTemplate={header}
                    onTextChange={(e) => {
                      field.onChange(e.htmlValue);
                    }}
                    style={{ height: '200px' }}
                  />
                )}
              />
              {errors.content && (
                <span className="text-red-500">{errors.content.message}</span>
              )}
              <div className="flex flex-wrap justify-content-between align-items-center gap-3 mt-3"></div>
            </div>

            {/* image order and departments */}
            <div
              className={
                // context?.authRole === 'SUPER_ADMIN'
                //   ? 'w-full sm:w-1/2 md:w-4/12 h-full'
                //   :
                'w-full h-full'
              }
            >
              <div className="flex flex-col sm:flex-row md:w-3/4 sm:w-full  gap-4">
                {/* order and department drop downs */}
                <div className="flex gap-3 w-full justify-content-start justify-start ">
                  <div className="col-span-2 min-w-[100] w-1/6 card flex justify-content-start flex-col text-[12px] flex-auto">
                    <label className="my-1">
                      <span className="text-red-500">*</span>Order
                    </label>
                    <Controller
                      name="order"
                      control={control}
                      rules={{
                        required: 'Please Select order',
                        min: {
                          value: 1,
                          message: 'Please Select order',
                        },
                      }}
                      render={({ field, fieldState }) => (
                        <Dropdown
                          id={field.name}
                          value={field.value}
                          optionLabel=""
                          placeholder="Select Order"
                          options={
                            title === 'Create Announcement'
                              ? count <= 0 || !count
                                ? [1]
                                : // (n)=>n+1 so that it doesnt start with 0 and count + 1 for number of entries plus new entry
                                  Array.from(
                                    Array(count + 1).keys(),
                                    (n) => n + 1
                                  )
                              : Array.from(Array(count).keys(), (n) => n + 1)
                          }
                          width="20px"
                          focusInputRef={field.ref}
                          onChange={(e) => field.onChange(e.value)}
                          className={classNames({
                            'p-invalid': fieldState.error,
                          })}
                        />
                      )}
                    />
                    {errors.order && (
                      <span className="text-red-500">
                        {errors.order.message}
                      </span>
                    )}
                  </div>
                  {context?.authRole !== 'SUPER_ADMIN' && (
                    <div className="col-span-2 w-3/4 card flex justify-content-center flex-col text-[12px] flex-auto">
                      <label className="my-1">
                        <span className="text-red-500">*</span>Department
                      </label>
                      <Controller
                        name="departments"
                        control={control}
                        render={({ field }) => (
                          <MultiSelect
                            filter
                            display={'chip'}
                            id={field.name}
                            value={
                              context?.authRole === 'SUPER_ADMIN'
                                ? [{ departmentName: '', departmentId: null }]
                                : field.value
                            }
                            onChange={(e) => {
                              field.onChange(e.value);
                            }}
                            options={departmentOptions}
                            placeholder="Select Departments"
                            // defaultValue={rows <= 0 ? 1 : 0}
                            optionLabel="departmentName"
                            className="w-full md:max-w-14rem"
                            disabled={isRetrievingDept ? true : false}
                          />
                        )}
                      />

                      {errors.departments && (
                        <span className="text-red-500">
                          {errors.departments.message}
                        </span>
                      )}
                    </div>
                  )}
                  {context?.authRole === 'SUPER_ADMIN' && (
                    <div className="col-span-2 w-3/4  card flex justify-content-center flex-col text-[12px] flex-auto">
                      <label className="my-1">
                        <span className="text-red-500">*</span>Recipients
                      </label>
                      <Controller
                        name="departments"
                        control={control}
                        render={({ field }) => (
                          <MultiSelect
                            filter
                            display={'chip'}
                            id={field.name}
                            value={field.value}
                            onChange={(e) => {
                              field.onChange(e.value);
                            }}
                            options={departmentOptions}
                            placeholder="Select Company"
                            // defaultValue={rows <= 0 ? 1 : 0}
                            optionLabel="departmentName"
                            className="w-full md:w-14rem"
                            disabled={isRetrievingDept ? true : false}
                          />
                        )}
                      />

                      {errors.departments && (
                        <span className="text-red-500">
                          {errors.departments.message}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {title !== 'View Announcement' && userData.role != 'EMPLOYEE' && (
              <div className="flex flex-col md:flex-row gap-3">
                {/* file upload div*/}
                <div className="card flex justify-content-center flex-col text-[12px] flex-auto w-[266px]">
                  <label className="my-1">Image</label>
                  <div className="flex flex-col ml-4 w-266 ">
                    <label>
                      <div
                        className={classNames(
                          'relative w-[266px] h-[150px] border-2 border-gray-300 rounded flex flex-col justify-center items-center cursor-pointer text-gray-600'
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
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={async (event: any) => {
                          const toUpload = event.target.files?.[0];
                          if (toUpload) {
                            if (toUpload.size > 52428800) {
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
                              file: toUpload,
                            });

                            if (uploadPPurl) {
                              setSelectedLogo({
                                text: 'Update Image',
                                name:
                                  timeUploaded +
                                  '-' +
                                  toUpload.name.replace(/ /g, '_'),
                                url: uploadPPurl,
                              });
                              setFileName(
                                timeUploaded +
                                  '-' +
                                  toUpload.name.replace(/ /g, '_')
                              );
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
                    <span className="text-sm flex items-center justify-center">
                      {selectedLogo.text}
                    </span>
                  </div>
                  <div className="w-1/2"></div>
                </div>
                <div className="w-full flex justify-end self-end gap-2 mb-1">
                  <Button
                    rounded
                    className="rounded-full px-10 justify-center"
                    severity="secondary"
                    text
                    label="Cancel"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsOpen(false);
                    }}
                  />
                  <Button
                    rounded
                    className="px-10 bg-primaryDefault justify-center "
                    disabled={isButtonLabelChange || isSubmitting}
                    label={isButtonLabelChange ? 'Saving...' : buttonText}
                    type="submit"
                  />
                </div>
              </div>
            )}
          </form>
        )}
      </Sidebar>
    </div>
  );

  // form submission handler for both update and create
  function onSubmit(data: any) {
    if (!watch('departments')) {
      toast.current?.replace({
        severity: 'error',
        summary: 'Please Choose a Department',
        life: 3000,
      });
      return;
    }
    //extract department ids from department values pra ids lng ig pasa padung server
    var deptIds = watch('departments').map((item) => {
      return item['departmentId'];
    });
    if (title === 'Edit Announcement') {
      let config = {
        method: 'PUT',
        maxBodyLength: Infinity,
        url: `/api/announcements/${id}`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
        },
        data:
          context?.authRole === 'ADMIN'
            ? JSON.stringify({
                title: data.title,
                content: data.content,
                order: data.order,
                departments: deptIds,
                image: fileName,
              })
            : JSON.stringify({
                title: data.title,
                content: data.content,
                order: data.order,
                departments: deptIds,
                image: fileName,
              }),
      };

      setIsButtonLabelChange(true);
      axios
        .request(config)
        .then(() => {
          (function () {
            toast.current?.replace({
              severity: 'success',
              summary: 'Successfully Updated',
              life: 3000,
            });
          })();
          setIsOpen(false);
          setSelectedLogo({
            text: 'Choose Image',
            name: null,
            url: '/images/noimage.jpg',
          });
          reset();
          refetch();
          setIsButtonLabelChange(false);
        })
        .catch((error) => {
          (function () {
            toast.current?.replace({
              severity: 'error',
              detail: `${error.response?.data?.message}`,
              life: 3000,
            });
          })();
          setIsButtonLabelChange(false);
        });
    }

    if (title === 'Create Announcement') {
      let config = {
        method: 'POST',
        maxBodyLength: Infinity,
        url: '/api/announcements',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
        },
        data: JSON.stringify({
          title: data.title,
          content: data.content,
          order: data.order,
          // departments: data.departments,
          departments: deptIds,
          image: fileName,
        }),
      };

      setIsButtonLabelChange(true);
      axios
        .request(config)
        .then(() => {
          (function () {
            toast.current?.replace({
              severity: 'success',
              summary: 'Successfully Created',
              life: 3000,
            });
          })();
          setIsOpen(false);
          setSelectedLogo({
            text: 'Choose Image',
            name: null,
            url: '/images/noimage.jpg',
          });
          reset();
          refetch();
          setIsButtonLabelChange(false);
        })
        .catch((error) => {
          (function () {
            toast.current?.replace({
              severity: 'error',
              detail: `${error.response?.data?.message}`,
              life: 3000,
            });
          })();
          setIsButtonLabelChange(false);
        });
    }
  }
};
export default AnnouncementSidebar;
