import React, { useEffect, useRef, useState } from 'react';

import axios from 'axios';
import Papa from 'papaparse';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
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
  pendingTotalsQuery: any;
  pendingOptsQuery: any;
}

interface UploadFile {
  file: File | null;
  data: any[];
}

function CSVUpload({
  configuration: { headers, apiUrl, isOpen, setIsOpen },
  label: { mainHeader, header, subHeader },
  refetchParent,
  pendingTotalsQuery,
  pendingOptsQuery,
}: CSVUpload) {
  const toast = useRef<Toast>(null);
  const [backendError, setBackendError] = useState<any>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [filesError, setFilesError] = useState<any[]>([]);
  const [isDisabled, setIsDisabled] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadFile | any>({
    file: null,
    data: [],
  });
  const { CSVReader } = useCSVReader();

  useEffect(() => {
    setUploadedFile({
      file: null,
      data: [],
    });
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

    axios
      .post(
        apiUrl,
        JSON.stringify({
          data: uploadedFile.data,
          fileName: uploadedFile.file.name,
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
          pendingOptsQuery.refetch();
          pendingTotalsQuery.refetch();
          toast.current?.replace({
            severity: 'success',
            life: 10000,
            closable: true,
            summary: result.data.message,
          });
          // tasksProgress?.setStartTime(new Date().getTime());
        } else {
          toast.current?.clear();
          setBackendError(result.data.message);
        }

        //  old code
        // toast.current?.replace({
        //   severity: result.data.severity,
        //   summary: result.data.summary,
        //   detail: result.data.detail,
        //   sticky: result.data.sticky ?? undefined,
        //   closable: true,
        //   life: result.data.sticky ? undefined : 5000,
        // });
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
      </Sidebar>

      {/* Updated Clyde (9/24/24): Replaced toast with modal to store error messages when importing payroll */}
      <Dialog
        header={
          <span className="text-red-600 font-bold">
            {filesError.length > 0 ? 'Error(s) Found' : ''}
          </span>
        }
        footer={
          <p className="text-red-600 text-sm text-start">
            <em>
              Note: Please review all error messages above to correct your data
              as these fields are unique
            </em>
          </p>
        }
        draggable={false}
        resizable={false}
        position="top"
        visible={isVisible}
        style={{ width: '50vw', minHeight: '40vh', maxHeight: '70vh' }}
        onHide={() => {
          if (!isVisible) return;
          setFilesError([]);
          setIsVisible(false);
        }}
      >
        <ul className="m-0 mb-2 p-2">
          {filesError.map((error: any, index: number) => (
            <li key={index} className="mb-2">
              <span className="font-bold">{error.summary}:</span>
              <br />
              <span className="text-red-600">{error.detail}</span>
            </li>
          ))}
        </ul>
      </Dialog>

      <Dialog
        maximizable
        header="Errors on the following:"
        visible={backendError.length > 0}
        style={{ width: '50vw' }}
        onHide={() => setBackendError([])}
      >
        <div className="my-5">
          {backendError.length > 0 &&
            backendError.map((item: any, index: number) => (
              <div className="my-4" key={index}>
                <h4 className="font-bold">{item.headerTitle}</h4>
                <>
                  {Array.isArray(item.error) ? (
                    <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
                      {item.error.map((message: any, msgIndex: number) => (
                        <li key={msgIndex}>{message}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>{item.error}</p>
                  )}
                </>
                <br />
              </div>
            ))}
        </div>
      </Dialog>
    </>
  );
}

export default CSVUpload;
