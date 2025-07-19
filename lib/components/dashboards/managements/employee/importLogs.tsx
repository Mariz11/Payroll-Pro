'use client';

import axios from 'axios';
import { FirestoreService } from 'lib/classes/gcp/FirestoreService';
import { useEffect, useState } from 'react';

type CsvDownloadStatus = 0 | 1 | 2; // 0 = Empty, 1 = Generating, 2 = Available
interface LogEntry {
  row: number;
  employeeId: string;
  errorMessage: string;
  raw: string;
}
interface ImportLogsProps {
  docId: string;
  csvDownloadStatus: CsvDownloadStatus;
  csvDownloadFile: string;
  csvSignedURL: string;
  csvSignedExpiry: number; // timestamp in milliseconds
  liveData: LogEntry[];
}
interface DownloadCSVProps {
  docId: string;
  csvDownloadStatus: CsvDownloadStatus;
  csvDownloadFile: string;
  csvSignedURL: string;
  csvSignedExpiry: number;
}

const collectionName = 'bulk_employee_responses';
const firestoreService = new FirestoreService();
firestoreService.setCollectionName(collectionName);

const handleCsvAction = async (
  docId: string,
  file: string | null,
  endpoint: 'signed-url' | 'generate-csv'
): Promise<void> => {
  try {
    firestoreService.updateDocument(docId, { csv_download_status: 1 });

    axios.get(`/api/employees/failed/registration/${endpoint}`, {
      params: file ? { docId, file } : { docId },
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
      },
    });
  } catch (error) {
    console.error(`Error during ${endpoint} request:`, error);
    firestoreService.updateDocument(docId, { csv_download_status: 0 });
  }
};

const onClickUpdateSignedURL = (docId: string, file: string): void => {
  handleCsvAction(docId, file, 'signed-url');
};

const onClickGenerateCSV = (docId: string): void => {
  handleCsvAction(docId, null, 'generate-csv');
};

const DownloadURLEmpty: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <span
    className="font-bold flex items-center cursor-pointer mr-1"
    onClick={onClick}
  >
    <i className="pi pi-file mr-1 text-black -scale-y-100" />
    Generate CSV
  </span>
);

const DownloadURLGenerating = () => (
  <span className="flex items-center cursor-pointer text-orange-500 mr-1">
    <i className="pi pi-spin pi-spinner mr-1" />
    Generating CSV...
  </span>
);

const DownloadURLReady: React.FC<{ url: string }> = ({ url }) => (
  <a
    href={url}
    className="font-bold flex items-center cursor-pointer text-blue-500 mr-1"
  >
    <i className="pi pi-download mr-1" />
    Download CSV
  </a>
);

const DownloadURLExpired: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <span className="flex items-center cursor-pointer mr-1" onClick={onClick}>
    <i className="pi pi-file mr-1" />
    Regenerate CSV
  </span>
);

const DownloadCSV: React.FC<DownloadCSVProps> = ({
  docId,
  csvDownloadStatus,
  csvDownloadFile,
  csvSignedURL,
  csvSignedExpiry,
}) => {
  const isDownloadURLEmpty = csvDownloadStatus === 0;
  const isDownloadURLGenerating = csvDownloadStatus === 1;
  const isDownloadURLReady = csvDownloadStatus === 2;

  // Check if the signed URL has expired by comparing the current time with the expiry time minus 12 hours
  const isExpired = Date.now() > csvSignedExpiry - 12 * 60 * 60 * 1000;

  return (
    <div className="ml-auto gap-2 w-auto text-right">
      {(isDownloadURLEmpty && (
        <DownloadURLEmpty onClick={() => onClickGenerateCSV(docId)} />
      )) ||
        (isDownloadURLGenerating && <DownloadURLGenerating />) ||
        (isDownloadURLReady && !isExpired && (
          <DownloadURLReady url={csvSignedURL} />
        )) ||
        (isExpired && (
          <DownloadURLExpired
            onClick={() => onClickUpdateSignedURL(docId, csvDownloadFile)}
          />
        ))}
    </div>
  );
};

const ImportLogs: React.FC<ImportLogsProps> = ({
  docId,
  csvDownloadStatus,
  csvDownloadFile,
  csvSignedURL,
  csvSignedExpiry,
  liveData,
}) => {
  const [data, setData] = useState<LogEntry[]>(liveData);

  useEffect(() => {
    setData((prevData) => {
      const newEntries = liveData.filter(
        ({ row }) => !prevData.some((entry) => entry.row === row)
      );
      return newEntries.length > 0 ? [...prevData, ...newEntries] : prevData;
    });
  }, [liveData]);

  return (
    <div className="border p-2 rounded-md bg-white shadow-sm">
      <div className="rounded-md shadow-sm">
        <div className="bg-gray-200 text-gray-700 rounded px-4 py-3 font-semibold text-lg flex sticky top-0 mb-2">
          <div className="w-[200px]">Row</div>
          <div className="w-[280px]">Employee ID</div>
          <div>Error Message</div>
          {data.length > 0 && (
            <DownloadCSV
              docId={docId}
              csvDownloadStatus={csvDownloadStatus}
              csvDownloadFile={csvDownloadFile}
              csvSignedURL={csvSignedURL}
              csvSignedExpiry={csvSignedExpiry}
            />
          )}
        </div>

        <div className="overflow-auto max-h-[30rem]">
          {data.length > 0 ? (
            data.map(({ row, employeeId, errorMessage }) => (
              <div
                key={row}
                className="border-b-2 hover:bg-gray-50 font-normal flex text-md px-2 py-2 pt-4 leading-relaxed"
              >
                <div className="w-[208px] text-gray-700">{row}</div>
                <div className="w-[280px] text-gray-700">{employeeId}</div>
                <div className="text-gray-700">{errorMessage}</div>
              </div>
            ))
          ) : (
            <div className="border-t hover:bg-gray-50 flex text-xs px-2 py-1">
              <div className="w-[208px] text-gray-700">-</div>
              <div className="w-[280px] text-gray-700">-</div>
              <div className="text-gray-700">-</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportLogs;
