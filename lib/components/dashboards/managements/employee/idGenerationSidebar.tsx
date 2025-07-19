import { Sidebar } from 'primereact/sidebar';
import { useEffect, useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
import axios from 'axios';
import React from 'react';
import { Button } from 'primereact/button';
import { Textfit } from 'react-textfit';
import { properCasing } from '@utils/helper';
import Image from 'next/image';
import moment from '@constant/momentTZ';
import { ML_FILE_UPLOAD_URL } from '@constant/partnerAPIDetails';
import {
  exportComponentAsJPEG,
  exportComponentAsPDF,
  exportComponentAsPNG,
} from 'react-component-export-image';
import { toPng, toJpeg } from 'html-to-image';
import html2canvas from 'html2canvas';
import { ColorPicker } from 'antd';
import company from 'db/models/company';
// const defaultColors = [
//   '#d61117',
//   '#ffa500',
//   '#487de7',
//   '#70369d',
//   '#79c314',
//   '#000',
//   '#808080',
// ];
const IdGenerationSidebar = ({
  configuration: { title, submitBtnText, action, rowData, isOpen, bulk },
  companyDetails,
  setSideBarConfig,
  setCompanyDetails,
  selectedRows,
  setSelectedRows,
  isGenerating,
  setIsGenerating,
}: {
  configuration: SideBarConfig;
  setSideBarConfig: any;
  companyDetails: any;
  setCompanyDetails: any;
  selectedRows: any[];
  setSelectedRows: any;
  isGenerating: boolean;
  setIsGenerating: any;
}) => {
  const [defaultColors, setDefaultColors] = useState([
    // first index is default company color
    '#d61117',
    '#ff0000',
    '#ffa500',
    '#487de7',
    '#70369d',
    '#79c314',
    '#000',
    '#808080',
  ]);
  const toast = useRef<Toast>(null);
  const [id, setId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [forceRefresher, setForceRefresher] = useState(false);
  const [mode, setMode] = useState<'single' | 'multi'>('single');
  const [color, setColor] = useState('#d61117');
  const idRef = useRef(null);
  const refs = useRef([]);
  useEffect(() => {
    if (!isOpen) return;

    // change default color
    // console.log(selectedRows);
    let tempDefaultColors = defaultColors;
    const defaultColor =
      companyDetails && companyDetails.defaultColor
        ? // company default color
          companyDetails.defaultColor
        : // app default color
          '#d61117';
    // console.log(defaultColor);
    // console.log('helloWorld');
    tempDefaultColors[0] = defaultColor;
    setColor(defaultColor);
    setDefaultColors(tempDefaultColors);

    if (bulk) {
      refs.current = selectedRows.map(
        (_, i) => refs.current[i] ?? React.createRef()
      );
    }

    const catchTimeOut = setTimeout(() => {
      setMode('multi');
    }, 1);

    return () => {
      clearTimeout(catchTimeOut);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);
  return (
    <>
      <Toast ref={toast} position="bottom-left" />
      <Sidebar
        position="right"
        style={{
          width: '50%',
        }}
        visible={isOpen}
        onHide={() => {
          setSideBarConfig((prev: any) => ({ ...prev, isOpen: false }));
          setMode('single');
        }}
      >
        <div className="h-full flex flex-col justify-center items-start mx-20">
          <React.Fragment>
            <h1 className="text-black font-medium text-3xl">{`Generate ID`}</h1>
            <h3 className="font-medium mt-5">
              {bulk
                ? `Generate IDs for employees`
                : `Generate ID for ${rowData?.employee_profile?.employeeFullName}`}
            </h3>
          </React.Fragment>
          {/* color picker */}
          <div className="mt-5">
            <p>Choose Main Color:</p>

            <div className="flex flex-row gap-2 items-center my-3">
              {defaultColors.map((color, index) => (
                <div key={index}>
                  <button
                    className={`p-3 rounded-full text-white border`}
                    style={{ backgroundColor: color }}
                    type="button"
                    onClick={async (e) => {
                      setColor(color);
                    }}
                  ></button>
                </div>
              ))}
            </div>
            <div className="flex flex-row items-center justify-center gap-2">
              <ColorPicker
                value={color}
                onChangeComplete={(e: any) => {
                  setColor(e.toHexString());
                }}
                showText={true}
                className="z-9999999999999"
              />
              <Button
                className=" text-xs rounded-full"
                severity="secondary"
                onClick={async () => {
                  toast.current?.replace({
                    severity: 'info',
                    summary: 'Submitting request',
                    detail: 'Please wait...',
                    closable: false,
                    sticky: true,
                  });
                  await axios
                    .put(
                      '/api/color',
                      {
                        color: color,
                      },
                      {
                        headers: {
                          Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
                        },
                      }
                    )
                    .then((res) => {
                      toast.current?.replace({
                        severity: 'success',
                        summary: res.data.message,
                        life: 5000,
                      });
                      let tempDefaultColors = defaultColors;
                      tempDefaultColors[0] = color;
                      setDefaultColors(() => tempDefaultColors);
                      setCompanyDetails({
                        ...companyDetails,
                        defaultColor: color,
                      });
                      // setForceRefresher(!forceRefresher);
                    })
                    .catch((err) => {
                      toast.current?.replace({
                        severity: 'error',
                        summary: 'Something went wrong...',
                        sticky: true,
                        closable: true,
                      });
                    });
                }}
              >
                Set as default color
              </Button>
            </div>
          </div>
          <div className="  flex flex-col items-center w-full bg-gray-200 py-5 mt-5 overflow-y-auto">
            {/* bulk id component starts here */}
            {bulk && (
              <div className="flex flex-col gap-2">
                {selectedRows.map((rowData: any, index: number) => {
                  return (
                    <div className="flex flex-row gap-1" key={index}>
                      <div
                        // key={index}
                        className=" gap-3 h-[85.7mm] w-[53.9mm] bg-white border-2 border-gray-500"
                        id="print"
                        ref={refs.current[index]}
                      >
                        {/* image and logo possible classname w-full h-[35%] justify-center items-center */}
                        <div className="w-full h-[35%]">
                          {/* logo and company name section */}
                          <div
                            className="  h-[75%] w-full"
                            style={{ backgroundColor: color }}
                          >
                            <div className="flex flex-row justify-center items-center gap-1 pt-3 px-10 ">
                              {/* <p>Logo</p> */}
                              {/* `${ML_FILE_UPLOAD_URL}/${encodeURIComponent(urlLogo)}` */}
                              {companyDetails?.urlLogo && (
                                <Image
                                  src={`${ML_FILE_UPLOAD_URL}/${encodeURIComponent(
                                    companyDetails?.urlLogo
                                  )}`}
                                  // src={`/images/wolf.png`}
                                  alt="logo"
                                  width={50}
                                  height={50}
                                  className="position-relative min-h-[35px] max-w-[35px] "
                                />
                              )}

                              <div className="min-w-[100px] max-w-[150px] h-[35px] items-center">
                                <Textfit
                                  mode={mode ? mode : 'single'}
                                  max={15}
                                  // min={10}
                                  // className="w-[90%] h-[100%] text-white text-center  font-bold leading-none align-middle "
                                  className="w-[90%] h-[100%] text-white text-center  font-bold leading-none flex items-center justify-center font-['Helvetica']"
                                >
                                  {`${companyDetails?.companyName?.toUpperCase()}`}{' '}
                                </Textfit>
                              </div>
                            </div>
                            {/* <div className="position-relative h-[120%] w-[55%] ml-[25%] mt-4 bg-black rounded-full border-4 border-white"> */}
                            {/* image section  */}

                            <div className="w-full justify-center items-center flex mt-1">
                              {/* <div className="flex items-center justify-center flex bg-[#E9E9E9] h-[80px] w-[80px] m-0 overflow-hidden rounded-md border-white border-4"> */}
                              <div className="w-[80px] h-[80px] flex items-center justify-center bg-gray-100 rounded-md overflow-hidden border-2 border-white">
                                {/* <div
                        className={
                          'relative w-[80px] h-[80px] border-4 border-white bg-white overflow-hidden flex flex-col justify-center items-center rounded-lg text-gray-600'
                        }
                      > */}
                                <Image
                                  // src={
                                  //   rowData.employee_profile &&
                                  //   rowData.employee_profile.profilePicture
                                  //     ? rowData.employee_profile.profilePicture
                                  //     : '/images/noimage.jpg'
                                  // }
                                  src={
                                    rowData.profPic
                                      ? rowData.profPic
                                      : '/images/noimage.jpg'
                                  }
                                  alt="IdProfilePic"
                                  width={80}
                                  height={80}
                                  className="object-contain max-h-full max-w-full w-auto"
                                  // style={{
                                  //   objectFit: 'scale-down',
                                  //   background: '#E9E9E9',
                                  // }}
                                  // className="rounded-md"
                                />
                              </div>
                            </div>

                            {/* </div> */}
                          </div>
                        </div>
                        {/* full name */}
                        <div className="w-full flex items-center justify-center align-middle mt-9  h-[35px] rounded-lg ">
                          {/* <div className="w-[90%] min-h[50%] text-center ">
                  <p className="text-[1em] leading-[1]">
                    Francis Dwine H Bendulo dadad{' '}
                  </p>
                </div> */}
                          <Textfit
                            mode={mode ? mode : 'single'}
                            max={15}
                            // min={10}
                            className="w-[90%] h-[100%] text-center  leading-none font-['Helvetica']"
                          >
                            {rowData?.employee_profile?.firstName}{' '}
                            {rowData?.employee_profile?.middleName
                              ? `${rowData.employee_profile.middleName[0]}.`
                              : ''}{' '}
                            {rowData?.employee_profile?.lastName}{' '}
                            {rowData?.employee_profile?.suffix}
                          </Textfit>
                        </div>
                        {/* role or position */}
                        <div className="w-full flex items-center justify-center align-middle  h-[10%] rounded-lg ">
                          <div
                            style={{ backgroundColor: color }}
                            className="w-[80%] h-[60%] text-center text-xs font-bold rounded-lg py-[3px]  leading-none flex items-center justify-center align-middle"
                          >
                            {/* <p className=" text-white align-middle"></p> */}
                            <Textfit
                              mode={mode ? mode : 'single'}
                              max={16}
                              // min={10}
                              // className="w-[90%] h-[100%] text-white text-center  font-bold leading-none align-middle "
                              className="w-[90%] h-[100%] text-white text-center  font-bold leading-none flex items-center justify-center align-middle"
                            >
                              {rowData !== null || rowData !== ''
                                ? rowData?.positionTitle
                                : 'N/A'}
                            </Textfit>
                          </div>
                        </div>
                        <div className="items-center flex flex-col h-[25px] w-full rounded-lg mt-1 ">
                          <p className="text-[9px] font-bold ">
                            Employee ID Number:
                          </p>
                          <p className="text-[11px]  ">
                            {rowData.employeeCode}
                          </p>
                        </div>
                        <div className="items-center flex flex-col h-[25px] w-full rounded-lg m-0 p-0 mt-2 ">
                          <p className="text-[9px] font-bold">Date Hired:</p>
                          <p className="text-[11px] ">
                            {rowData.hiringDate !== '' ||
                            rowData.hiringDate !== null
                              ? moment(rowData.hiringDate).format('MM/DD/YYYY')
                              : 'N/A'}
                          </p>
                        </div>
                        <div className="flex flex-row gap-5 justify-between px-5 mt-3">
                          <div className="flex flex-col items-center">
                            <div className="border-b-[1px] border-black text-white text-[7px] w-full">
                              please sign
                            </div>
                            <p className="text-[7px]">Employee Signature</p>
                          </div>
                          <div className="flex flex-col items-center ">
                            <div className="border-b-[1px] border-black text-white text-[7px] w-full">
                              {' '}
                              please sign
                            </div>
                            <p className="text-[7px]">HR Admin Signature</p>
                          </div>
                        </div>
                      </div>
                      {selectedRows.length > 1 && (
                        <div className="flex flex-row gap-1 items-center justify-center align-middle">
                          <Button
                            className="rounded-full ml-6 align-middle justify-center"
                            type="button"
                            onClick={(e: any) => {
                              setSelectedRows(
                                selectedRows.filter(
                                  (row) => row.employeeId !== rowData.employeeId
                                )
                              );
                            }}
                            rounded
                            outlined
                            icon="pi pi-times"
                            tooltip="Remove"
                            // severity="secondary"
                            tooltipOptions={{ position: 'top' }}
                          ></Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {/*single id component starts here */}
            {!bulk && (
              <div
                className=" gap-3 h-[85.7mm] w-[53.9mm] bg-white border-2 border-gray-500"
                ref={idRef}
                id="print"
              >
                {/* image and logo possible classname w-full h-[35%] justify-center items-center */}
                <div className="w-full h-[35%]">
                  {/* logo and company name section */}
                  <div
                    className="  h-[75%] w-full"
                    style={{ backgroundColor: color }}
                  >
                    <div className="flex flex-row justify-center items-center gap-1 pt-3 px-10 ">
                      {/* <p>Logo</p> */}
                      {/* `${ML_FILE_UPLOAD_URL}/${encodeURIComponent(urlLogo)}` */}
                      {companyDetails?.urlLogo && (
                        <Image
                          src={`${ML_FILE_UPLOAD_URL}/${encodeURIComponent(
                            companyDetails?.urlLogo
                          )}`}
                          // src={`/images/wolf.png`}
                          alt="logo"
                          width={50}
                          height={50}
                          className="position-relative min-h-[35px] max-w-[35px] "
                        />
                      )}

                      <div className="min-w-[100px] max-w-[150px] h-[35px] items-center">
                        <Textfit
                          mode={mode ? mode : 'single'}
                          max={15}
                          // min={10}
                          // className="w-[90%] h-[100%] text-white text-center  font-bold leading-none align-middle "
                          className="w-[90%] h-[100%] text-white text-center  font-bold leading-none flex items-center justify-center font-['Helvetica']"
                        >
                          {`${companyDetails?.companyName?.toUpperCase()}`}{' '}
                        </Textfit>
                      </div>
                    </div>
                    {/* <div className="position-relative h-[120%] w-[55%] ml-[25%] mt-4 bg-black rounded-full border-4 border-white"> */}
                    {/* image section  */}
                    <div className="w-full justify-center items-center flex mt-1">
                      {/* <div className="flex items-center justify-center flex bg-[#E9E9E9] h-[80px] w-[80px] m-0 overflow-hidden rounded-md border-white border-4"> */}
                      <div className="w-[80px] h-[80px] flex items-center justify-center bg-gray-100 rounded-md overflow-hidden border-2 border-white">
                        {/* <div
                        className={
                          'relative w-[80px] h-[80px] border-4 border-white bg-white overflow-hidden flex flex-col justify-center items-center rounded-lg text-gray-600'
                        }
                      > */}
                        <Image
                          // src={
                          //   rowData.employee_profile &&
                          //   rowData.employee_profile.profilePicture
                          //     ? rowData.employee_profile.profilePicture
                          //     : '/images/noimage.jpg'
                          // }
                          src={
                            rowData.profPic
                              ? rowData.profPic
                              : '/images/noimage.jpg'
                          }
                          alt="IdProfilePic"
                          width={80}
                          height={80}
                          className="object-contain max-h-full max-w-full w-auto"
                          // style={{
                          //   objectFit: 'scale-down',
                          //   background: '#E9E9E9',
                          // }}
                          // className="rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                {/* full name */}
                <div className="w-full flex items-center justify-center align-middle mt-9  h-[35px] rounded-lg ">
                  {/* <div className="w-[90%] min-h[50%] text-center ">
                  <p className="text-[1em] leading-[1]">
                    Francis Dwine H Bendulo dadad{' '}
                  </p>
                </div> */}
                  <Textfit
                    mode={mode ? mode : 'single'}
                    max={15}
                    // min={10}
                    className="w-[90%] h-[100%] text-center  leading-none font-['Helvetica']"
                  >
                    {rowData?.employee_profile?.firstName}{' '}
                    {rowData?.employee_profile?.middleName
                      ? `${rowData.employee_profile.middleName[0]}.`
                      : ''}{' '}
                    {rowData?.employee_profile?.lastName}
                    {''}
                    {rowData?.employee_profile?.suffix}
                  </Textfit>
                </div>
                {/* role or position */}
                <div className="w-full flex items-center justify-center align-middle  h-[10%] rounded-lg ">
                  <div
                    style={{ backgroundColor: color }}
                    className="w-[80%] h-[60%] text-center text-xs font-bold rounded-lg py-[3px]  leading-none flex items-center justify-center align-middle"
                  >
                    {/* <p className=" text-white align-middle"></p> */}
                    <Textfit
                      mode={mode ? mode : 'single'}
                      max={16}
                      // min={10}
                      // className="w-[90%] h-[100%] text-white text-center  font-bold leading-none align-middle "
                      className="w-[90%] h-[100%] text-white text-center  font-bold leading-none flex items-center justify-center align-middle"
                    >
                      {rowData !== null || rowData !== ''
                        ? rowData?.positionTitle
                        : 'N/A'}
                    </Textfit>
                  </div>
                </div>
                <div className="items-center flex flex-col h-[25px] w-full rounded-lg mt-1 ">
                  <p className="text-[9px] font-bold ">Employee ID Number:</p>
                  <p className="text-[11px]  ">{rowData.employeeCode}</p>
                </div>
                <div className="items-center flex flex-col h-[25px] w-full rounded-lg m-0 p-0 mt-2 ">
                  <p className="text-[9px] font-bold">Date Hired:</p>
                  <p className="text-[11px] ">
                    {rowData.hiringDate !== '' || rowData.hiringDate !== null
                      ? moment(rowData.hiringDate).format('MM/DD/YYYY')
                      : 'N/A'}
                  </p>
                </div>
                <div className="flex flex-row gap-5 justify-between px-5 mt-3">
                  <div className="flex flex-col items-center">
                    <div className="border-b-[1px] border-black text-white text-[7px] w-full">
                      please sign
                    </div>
                    <p className="text-[7px]">Employee Signature</p>
                  </div>
                  <div className="flex flex-col items-center ">
                    <div className="border-b-[1px] border-black text-white text-[7px] w-full">
                      {' '}
                      please sign
                    </div>
                    <p className="text-[7px]">HR Admin Signature</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="my-5 w-full flex justify-end items-center gap-3">
            <Button
              rounded
              className="w-full"
              severity="secondary"
              text
              label={'Cancel'}
              onClick={() => {
                setMode('single');
                setSideBarConfig((prev: any) => ({ ...prev, isOpen: false }));
              }}
            />
            <Button
              disabled={isLoading || !companyDetails}
              onClick={async () => {
                toast.current?.replace({
                  severity: 'info',
                  summary: 'Downloading Ids',
                  detail: 'Please wait...',
                  closable: false,
                  sticky: true,
                });
                setIsLoading(true);
                if (!bulk) {
                  exportComponentAsJPEG(idRef, {
                    fileName: `employee-${rowData.employeeCode}-id-card`,
                    html2CanvasOptions: {
                      scale: 1,
                    },
                  });
                } else {
                  for (let i = 0; i < selectedRows.length; i++) {
                    const ref = refs.current[i];
                    await exportComponentAsJPEG(ref, {
                      fileName: `employee-${selectedRows[i].employeeCode}-id-card`,
                      html2CanvasOptions: {
                        scale: 1,
                      },
                    });
                  }
                }
                setIsLoading(false);
                setSideBarConfig((prev: any) => ({ ...prev, isOpen: false }));
                setSelectedRows([]);
                toast.current?.replace({
                  severity: 'success',
                  summary: 'Ids Downloaded',
                  life: 5000,
                });
              }}
              rounded
              className="w-full"
              label={submitBtnText}
            />
          </div>
        </div>
      </Sidebar>
    </>
  );
};

export default IdGenerationSidebar;
