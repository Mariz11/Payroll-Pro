import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Papa from 'papaparse';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Sidebar } from 'primereact/sidebar';
import { Toast } from 'primereact/toast';
import { useCSVReader } from 'react-papaparse';
import { CSVUploadProps, UploadFileProps } from 'lib/interfaces';

function CSVUpload({
  configuration: {
    headers,
    startIndex,
    apiUrl,
    isOpen,
    setIsOpen,
    shiftsQuery,
    departmentsQuery,
  },
  label: { mainHeader, header, subHeader },
  refetchEmployees,
  refetchFailedRegistrations,
}: CSVUploadProps) {
  const toast = useRef<Toast>(null);
  const { CSVReader } = useCSVReader();

  const [isDisabled, setIsDisabled] = useState(false);
  const [selectedShift, setSelectedShift] = useState(-1);
  const [selectedDepartment, setSelectedDepartment] = useState(-1);
  const [uploadedFile, setUploadedFile] = useState<UploadFileProps>({
    file: null,
    data: [],
  });

  const showToast = (severity: 'success' | 'error' | 'info', summary: string, detail: string) => {
    toast.current?.clear();
    toast.current?.replace({
      severity,
      summary,
      detail,
      sticky: true,
      closable: true,
    });
  };

  const handleFileUploadValidation = () => {
    const { file, data } = uploadedFile;
    const rows = data.length;

    if (rows === 0 || !file) return false;
    if (rows === 1) {
      showToast('error', 'Something went wrong', 'Uploaded file is not in the correct format or outdated. Please check and try again.');
      return false;
    }

    const checkHeaders = data[0].filter((d: any) =>
      headers.some((h: any) => h.label.toLowerCase() === d.toLowerCase())
    );

    if (checkHeaders.length !== headers.length) {
      showToast('error', 'Something went wrong', 'Uploaded file is not in the correct format or outdated. Please check and try again.');
      return false;
    }

    return true;
  };

  const validatePhoneNumbers = (data: any[]) => {
    const phonePattern = /^09\d{9}$/;
    const [contactNumber, emergencyContact1, emergencyContact2] = data.slice(8, 11);

    if (![contactNumber, emergencyContact1, emergencyContact2].filter(Boolean).every(num => phonePattern.test(num))) {
      showToast('error', 'Something went wrong', "All contact numbers must start with '09' and be exactly 11 digits.");
      return false;
    }

    return true;
  };

  const handleImport = async () => {
    const { file, data } = uploadedFile;
    const rows = data.length;

    if (!handleFileUploadValidation()) return;

    if (rows > 1 && !validatePhoneNumbers(data[1])) return;

    setIsDisabled(true);
    showToast('info', 'Importing Employees', 'Please wait...');
    
    try {
      // Upload directly from the client to Google Cloud Storage without 
      // routing through your API (to bypass the 32MB upload limit 
      // of App Engine or Cloud Functions).

      const fileName = file.name;
      const fileType = file.type;

      // Step 1. Get signed URL
      const res = await axios.post(apiUrl, {
        fileName,
        fileType,
        rows: rows.toString(),
        shiftId: selectedShift.toString(),
        departmentId: selectedDepartment.toString()
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
        },
      });

      if (res.status === 200) {
        // Step 2: Upload directly to GCS
        const uploadRes = await axios.put(
          res.data.signedURL, 
          file, 
          /*
          Do not force the content type to prevent intermittent problems with signed URL generation
          {
            headers: { 
              'Content-Type': fileType 
            }
          }*/
        );

        if (uploadRes.status === 200) {
          window.open('/page/employeeManagement/importHistory', '_self');
        } else {
          showToast('error', 'Something went wrong', 'Error getting signed url');
        }      
      } else {
        showToast('error', 'Something went wrong', 'Error during import');
      }
    } catch (error: any) {
      showToast('error', 'Something went wrong', 'Error during import');
    } finally {
      setIsDisabled(false);
    }
  };

  useEffect(() => {
    setUploadedFile({
      file: null,
      data: [],
    });
    setSelectedDepartment(-1);
    setSelectedShift(-1);
  }, [isOpen]);

  return (
    <>
      <Toast ref={toast} position="bottom-left" />
      <Sidebar
        position="right"
        className="p-sidebar-md"
        visible={isOpen}
        onHide={() => setIsOpen(false)}
      >
        <React.Fragment>
          <h1 className="text-black font-medium text-3xl">{mainHeader}</h1>
          <p className="my-1 font-light">{header}</p>
          <h3 className="font-medium mt-5">{subHeader}</h3>
        </React.Fragment>

        <CSVReader
          onUploadAccepted={(results: any, file: File) => {
            Papa.parse(file, {
              header: false,
              encoding: 'ISO-8859-1',
              download: true,
              skipEmptyLines: 'greedy',
              complete: async function (results: any) {
                setUploadedFile({
                  file: file,
                  data: results.data,
                });

                setIsDisabled(false);
              },
            });
          }}
          required
        >
          {({
            getRootProps,
            acceptedFile,
            ProgressBar,
            getRemoveFileProps,
            Remove,
          }: any) => (
            <>
              <label
                {...getRootProps()}
                className="p-5 border-2 border-gray-300 rounded  min-h-[200px] w-full flex flex-col justify-center items-center hover:cursor-pointer text-gray-600"
              >
                <i className="pi pi-upload text-4xl mb-5" />
                {uploadedFile.file ? (
                  <div className="flex gap-1  w-[95%]">
                    <span className="text-green-600 font-bold text-center break-words w-[99%]">
                      {uploadedFile.file.name}
                    </span>
                    <div
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setUploadedFile({
                          file: null,
                          data: [],
                        });
                      }}
                      style={{ zIndex: 99999 }}
                    >
                      <Remove color="#A01919" />
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="text-red-600 font-bold">
                      No File Selected
                    </span>
                  </>
                )}
                <span className="my-2">Browse or Drag File Here</span>
                <span className="text-sm">{'( csv )'}</span>
              </label>
              <ProgressBar style={{ backgroundColor: 'red' }} />
              <div className="my-5">
                <label className="my-1">
                  <span className="text-red-500">*</span>
                  <span>Shift</span>
                </label>
                <div className="card flex justify-content-center">
                  <Dropdown
                    filter
                    value={selectedShift}
                    onChange={(e) => setSelectedShift(e.value)}
                    options={
                      shiftsQuery.isLoading
                        ? [{ name: 'Loading...' }]
                        : shiftsQuery.data?.message?.map((dept: any) => {
                          const obj: any = {};
                          obj.name = dept.shiftName;
                          obj.value = dept.shiftId;
                          return obj;
                        })
                    }
                    optionLabel="name"
                    placeholder="Select a Shift"
                    className="w-full md:w-14rem "
                  />
                </div>
              </div>

              <div className="my-5">
                <label className="my-1">
                  <span className="text-red-500">*</span>
                  <span>Department</span>
                </label>
                <div className="card flex justify-content-center">
                  <Dropdown
                    filter
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.value)}
                    options={
                      departmentsQuery.isLoading
                        ? [{ name: 'Loading...' }]
                        : departmentsQuery.data?.message?.map((i: any) => {
                          const obj: any = {};
                          obj.name = i.departmentName;
                          obj.value = i.departmentId;
                          return obj;
                        })
                    }
                    optionLabel="name"
                    placeholder="Select Department"
                    className="w-full md:w-14rem "
                  />
                </div>
              </div>

              <div className="mt-2 w-full flex flex-nowrap justify-center items-center gap-2">
                <Button
                  rounded
                  className="w-full"
                  severity="secondary"
                  text
                  label={'Cancel'}
                  onClick={() => {
                    setIsOpen(false);
                  }}
                />
                <Button
                  rounded
                  className="w-full"
                  label={'Import Sheet'}
                  onClick={handleImport}
                  disabled={
                    selectedShift < 0 ||
                    selectedDepartment < 0 ||
                    uploadedFile.data.length == 0 ||
                    isDisabled
                  }
                />
              </div>
            </>
          )}
        </CSVReader>
      </Sidebar>
    </>
  );
}

export default CSVUpload;
