import React, { useEffect, useRef, useState } from 'react';

import axios from 'axios';
import classNames from 'classnames';
import Papa from 'papaparse';
import { Button } from 'primereact/button';
import { Sidebar } from 'primereact/sidebar';
import { Toast } from 'primereact/toast';
import { useCSVReader } from 'react-papaparse';

interface Headers {
  label: string;
  key: string;
  required: boolean;
}
interface CSVUpload {
  configuration: {
    headers: Headers[];
    apiUrl: string;
    isOpen: boolean;
    setIsOpen: (v: boolean) => void;
  };
  label: Label;
  refetchParent: () => void;
}

interface UploadFile {
  type: null | 'CSV FILE' | 'DAT FILE';
  file: File | null;
  data: any[];
}

function CSVUpload({
  configuration: { headers, apiUrl, isOpen, setIsOpen },
  label: { mainHeader, header, subHeader },
  refetchParent,
}: CSVUpload) {
  const toast = useRef<Toast>(null);
  const datFileInputRef = useRef<any>(null);

  const [fileType, setFileType] = useState<string | null>(null);
  const [isDisabled, setIsDisabled] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadFile>({
    type: null,
    file: null,
    data: [],
  });
  const { CSVReader } = useCSVReader();

  useEffect(() => {
    setUploadedFile({
      type: null,
      file: null,
      data: [],
    });
    setFileType(null);
  }, [isOpen]);

  useEffect(() => {
    setIsDisabled(uploadedFile.file ? false : true);
  }, [uploadedFile]);

  const handleImport = async () => {
    if (uploadedFile.data.length == 0 && !uploadedFile.file) {
      setIsDisabled(true);
      toast.current?.replace({
        severity: 'error',
        summary: 'No file selected',
        detail: 'Please select a file in CSV format.',
        life: 5000,
      });
      return false;
    }

    setIsDisabled(true);
    toast.current?.replace({
      severity: 'info',
      summary: 'Submitting request',
      detail: 'Please wait...',
      sticky: true,
    });

    const data = uploadedFile.data;

    axios
      .post(
        apiUrl,
        JSON.stringify({
          fileType: fileType,
          data: data,
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
          },
        }
      )
      .then((result) => {
        if (result.data.success) {
          setUploadedFile({
            type: null,
            file: null,
            data: [],
          });
          setIsOpen(false);
          refetchParent();
        }
        toast.current?.replace({
          severity: result.data.severity,
          summary: result.data.summary,
          detail: result.data.detail,
          sticky: result.data.sticky ?? undefined,
          closable: true,
          life: result.data.sticky ? undefined : 5000,
        });
      });
  };

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

        {!fileType && (
          <>
            <h4 className="text-red-500 text-[15px] mb-2">
              Please select a file type
            </h4>
            <div className="flex justify-between gap-2">
              <button
                type="button"
                className={classNames(
                  'rounded-[6px] p-[42px] bg-[#dddddd] text-[30px] text-black w-full h-[200px]'
                )}
                value="CSV FILE"
                name="payDate"
                onClick={(e: any) => setFileType(e.target.value)}
              >
                CSV FILE
              </button>
              <button
                type="button"
                className={classNames(
                  'rounded-[6px] p-[42px] bg-[#dddddd] text-[30px] text-black w-full h-[200px]'
                )}
                value="DAT FILE"
                name="payDate"
                onClick={(e: any) => setFileType(e.target.value)}
              >
                DAT FILE
              </button>
            </div>
          </>
        )}

        {fileType == 'CSV FILE' && (
          <CSVReader
            onUploadAccepted={(results: any, file: File) => {
              Papa.parse(file, {
                header: false,
                encoding: 'ISO-8859-1',
                download: true,
                skipEmptyLines: true,
                complete: async function (results: any) {
                  setUploadedFile({
                    type: 'CSV FILE',
                    file: file,
                    data: results.data,
                  });
                },
              });
            }}
            onUploadRejected={(file?: File, event?: DragEvent | Event) => {
              // console.log(event);
            }}
            onRem
            required
          >
            {({
              getRootProps,
              acceptedFile,
              ProgressBar,
              getRemoveFileProps,
              Remove,
            }: any) => (
              <div>
                <label
                  {...getRootProps()}
                  className="p-5 border-2 border-gray-300 rounded min-h-[200px] w-full flex flex-col justify-center items-center hover:cursor-pointer text-gray-600"
                >
                  <i className="pi pi-upload text-4xl mb-5" />
                  {uploadedFile.file ? (
                    <div className="flex gap-1 w-[95%]">
                      <span className="text-green-600 font-bold text-center break-words w-[99%]">
                        {uploadedFile.file.name}
                      </span>
                      <div
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setUploadedFile({ type: null, file: null, data: [] });
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
                  <span className="text-sm">{'( CSV FILE )'}</span>
                </label>
                <ProgressBar style={{ backgroundColor: 'red' }} />
                <div className="mt-2 w-full flex flex-nowrap justify-center items-center gap-2">
                  <Button
                    rounded
                    className="w-full"
                    severity="secondary"
                    text
                    label={'Cancel'}
                    onClick={() => setIsOpen(false)}
                  />
                  <Button
                    rounded
                    className="w-full"
                    label={'Import Sheet'}
                    onClick={handleImport}
                    disabled={isDisabled}
                  />
                </div>
              </div>
            )}
          </CSVReader>
        )}
        {fileType == 'DAT FILE' && (
          <div>
            <label className="p-5 border-2 border-gray-300 rounded min-h-[200px] w-full flex flex-col justify-center items-center hover:cursor-pointer text-gray-600">
              <input
                type="file"
                accept=".dat"
                style={{ visibility: 'hidden', height: 1 }}
                ref={datFileInputRef}
                onChange={(e: any) => {
                  const files = Array.from(e.target.files);
                  if (files.length == 0) return null;

                  const file: any = files[0];
                  const reader = new FileReader();
                  reader.readAsText(file);

                  reader.onloadend = function () {
                    const text: any = reader.result;

                    if (text) {
                      const data = text
                        .split(/\r?\n/)
                        .map((i: any) => i.replace(/\t/g, ',').slice(1))
                        .filter((row: any) => row.replace(/\s/g, '').length)
                        // Format into array
                        .map((row: any, index: number) => {
                          const item = row.split(',');
                          let obj: any = {};
                          item.map((subItem: any, subIndex: number) => {
                            const trimmed = subItem.replace(/\s+/g, '').trim();
                            if (subIndex == 0) {
                              obj.employeeCode = trimmed;
                            } else if (subIndex == 1) {
                              const dateTime = subItem.split(' ');
                              obj.date = dateTime[0];
                              obj.time = dateTime[1];
                            } else {
                              return;
                            }
                          });
                          return obj;
                        })
                        // Group by dates
                        .map((item: any, index: number, arr: any) => {
                          const newItem = {
                            employeeCode: item.employeeCode,
                            date: null,
                            timeIn: null,
                            lunchTimeOut: null,
                            lunchTimeIn: null,
                            timeOut: null,
                          };
                          let counter = 0;
                          for (let i = 0; i < arr.length; i++) {
                            const subItem = arr[i];
                            if (subItem.employeeCode == item.employeeCode) {
                              if (subItem.date == item.date) {
                                newItem.date = subItem.date;
                                counter++;
                                if (counter == 1) {
                                  newItem.timeIn = subItem.time;
                                } else if (counter == 2) {
                                  newItem.lunchTimeOut = subItem.time;
                                } else if (counter == 3) {
                                  newItem.lunchTimeIn = subItem.time;
                                } else if (counter == 4) {
                                  newItem.timeOut = subItem.time;
                                }
                              } else {
                                counter = 0;
                              }
                            }
                          }
                          return newItem;
                        })
                        .filter(
                          (item: any, index: number, arr: any) =>
                            arr.findIndex(
                              (t: any) =>
                                t.employeeCode == item.employeeCode &&
                                t.date == item.date
                            ) == index
                        )
                        .sort((a: any, b: any) => {
                          return a.employeeCode - b.employeeCode;
                        });

                      // console.log(data)
                      setUploadedFile({
                        type: 'DAT FILE',
                        file: file,
                        data: data,
                      });
                      return data;
                    }
                  };
                }}
              />
              <i className="pi pi-upload text-4xl mb-5" />
              {uploadedFile.file ? (
                <div className="flex gap-1 w-[95%] items-center">
                  <span className="text-green-600 font-bold text-center break-words w-[99%]">
                    {uploadedFile.file.name}
                  </span>
                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setUploadedFile({ type: null, file: null, data: [] });
                      datFileInputRef.current.value = null;
                    }}
                    style={{ zIndex: 99999 }}
                  >
                    <i className="pi pi-times-circle text-4xl text-red-600 text-[24px] mb-5" />
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
              <span className="text-sm">{'( DAT FILE )'}</span>
            </label>
            <div className="mt-2 w-full flex flex-nowrap justify-center items-center gap-2">
              <Button
                rounded
                className="w-full"
                severity="secondary"
                text
                label={'Cancel'}
                onClick={() => setIsOpen(false)}
              />
              <Button
                rounded
                className="w-full"
                label={'Import Sheet'}
                onClick={handleImport}
                disabled={isDisabled}
              />
            </div>
          </div>
        )}
      </Sidebar>
    </>
  );
}

export default CSVUpload;
