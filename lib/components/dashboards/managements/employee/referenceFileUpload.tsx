import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { ML_FILE_UPLOAD_URL } from '@constant/partnerAPIDetails';
import { saveAs } from 'file-saver';
import { fileUploadToCloud } from '@utils/imageUpload';
import { Toast } from 'primereact/toast';

interface UploadFile {
  url: string;
  type: string;
  name: string | null;
  timeUploaded: number | null;
  isUploaded: boolean;
}

export default function ReferenceFileUpload({
  action,
  data,
  getFileDetails,
}: {
  action: string;
  data: UploadFile[];
  getFileDetails: (p: any) => void;
}) {
  const toast = useRef<Toast>(null);
  const [uploadedFileDetails, setUploadedFileDetails] = useState<UploadFile[]>(
    data || []
  );

  const onUploadFile = async (event: any, index: number) => {
    const file = event.target.files?.[0];

    if (file) {
      // console.log(file.size);
      if (file.size > 52428800) {
        toast.current?.replace({
          severity: 'error',
          detail: 'File size should be less than 50MB.',
          sticky: true,
          closable: true,
        });
        return;
      }

      let url = '/images/noimage.jpg';
      let type = 'noicon';
      if (file.type == 'text/csv') {
        url = '/images/csv_logo.png';
        type = 'csv';
      } else if (
        file.type ==
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      ) {
        url = '/images/ppt_logo.png';
        type = 'ppt';
      } else if (
        file.type ==
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        url = '/images/ms_word_logo.png';
        type = 'msword';
      } else if (
        file.type ==
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ) {
        url = '/images/excel_logo.png';
        type = 'excel';
      } else if (file.type == 'image/jpeg' || file.type == 'image/png') {
        url = URL.createObjectURL(file);
        type = 'image';
      }

      const items = [...uploadedFileDetails];
      const timeUploaded = new Date().getTime();
      items[index] = {
        name: timeUploaded + '-' + file.name.replace(/ /g, '_'),
        url: url,
        type: type,
        timeUploaded: timeUploaded,
        isUploaded: false,
      };

      const fileUpload = await fileUploadToCloud({
        timeUploaded: timeUploaded,
        file: file,
      });

      if (fileUpload) {
        if (!fileUpload.success) {
          toast.current?.replace({
            severity: 'error',
            detail: fileUpload.message,
            sticky: true,
            closable: true,
          });
          return null;
        }
        setUploadedFileDetails(items);
      } else {
        toast.current?.replace({
          severity: 'error',
          detail:
            'Failed to upload Reference File(s). Please contact your system administrator.',
          sticky: true,
          closable: true,
        });
      }
    }
  };

  const onDownloadFile = (item: any, index: number) => {
    saveAs(
      item.isUploaded
        ? `${ML_FILE_UPLOAD_URL}/${encodeURIComponent(item.name)}`
        : item.url,
      item.name
    );
  };

  const onClearFile = (event: any, index: number) => {
    const items = [...uploadedFileDetails];
    items[index] = {
      name: null,
      url: '',
      type: '',
      timeUploaded: null,
      isUploaded: false,
    };
    setUploadedFileDetails(items);
  };

  const onRemoveFileUploader = (event: any, index: number) => {
    const items = [...uploadedFileDetails];
    setUploadedFileDetails(items.filter((item: any, ndx) => ndx != index));
  };

  useEffect(() => {
    const items = [...uploadedFileDetails];
    getFileDetails(items.filter((item: any, ndx) => item.name != null));
  }, [uploadedFileDetails, getFileDetails]);

  return (
    <>
      <Toast ref={toast} position="bottom-left" />
      <div className="grid grid-cols-5 gap-3 items-start text-center">
        {uploadedFileDetails.map((item: any, index: number) => (
          <div key={index}>
            {item.name ? (
              <div>
                <div
                  className="relative h-[125px] w-full"
                  style={{
                    backgroundImage: `url(${
                      item.isUploaded && item.type == 'image'
                        ? `${ML_FILE_UPLOAD_URL}/${encodeURIComponent(
                            item.name
                          )}`
                        : item.url
                    })`,
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    wordBreak: 'break-word',
                  }}
                >
                  <p
                    className="font-bold absolute top-[50%] text-white w-full text-center py-2"
                    style={{
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      transform: 'translate(-50%, -50%)',
                      left: '50%',
                      padding: '5px 10px',
                    }}
                  >
                    {item.name}
                  </p>
                </div>
                <div className="flex justify-center text-center">
                  <Button
                    label={'Download'}
                    className="p-button rounded-none w-full height-[27px] p-0 m-0 text-[14px]"
                    onClick={(e) => {
                      e.preventDefault();
                      onDownloadFile(item, index);
                    }}
                  />
                  {action != 'view' && (
                    <Button
                      label={'Clear'}
                      className="p-button rounded-none w-full height-[27px] p-0 m-0 text-[14px]"
                      onClick={(e) => onClearFile(e, index)}
                    />
                  )}
                </div>
              </div>
            ) : (
              <div>
                <label className="border-2 border-gray-300 rounded h-[125px] w-full flex flex-col justify-center items-center hover:cursor-pointer text-gray-600">
                  <i className="pi pi-upload text-4xl mb-4" />
                  <p className="text-red-600 font-bold">No File Selected</p>
                  <p className="my-2">Choose File</p>
                  <input
                    type="file"
                    className="hidden"
                    name="reference1"
                    onChange={(e) => onUploadFile(e, index)}
                  />
                </label>
              </div>
            )}
            {action != 'view' && (
              <div>
                <button onClick={(e) => onRemoveFileUploader(e, index)}>
                  Remove
                </button>
              </div>
            )}
          </div>
        ))}
        {action != 'view' && (
          <div className="border-2 border-gray-300 rounded h-[125px] w-full flex flex-col justify-center items-center ">
            <button
              type="button"
              onClick={() => {
                const obj = {
                  url: '',
                  type: '',
                  name: null,
                  timeUploaded: null,
                  isUploaded: false,
                };
                setUploadedFileDetails((prev) => [...prev, obj]);
              }}
            >
              <i className="pi pi-plus-circle text-green-500 text-4xl"></i>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
