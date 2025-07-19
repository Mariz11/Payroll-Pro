'use client';

import React from 'react';
import { Sidebar } from 'primereact/sidebar';
import useImportHistoryDetailsHook from 'lib/hooks/useImportHistoryDetailsHook';
import ImportProgressOverview from './importProgressOverview';
import ImportLogs from './importLogs';

const ImportDetails = ({
  configuration: { title, submitBtnText, action, rowData, isOpen },
  setSideBarConfig
}: {
  configuration: SideBarConfig;
  setSideBarConfig: any;
}) => {
  const docId = rowData?.documentId;
  const {summary, logs} = useImportHistoryDetailsHook(docId, isOpen);
  
  return (
    <Sidebar
      closeOnEscape={action == 'view'}
      dismissable={action == 'view'}
      position="right"
      style={{width: '87%'}}
      visible={isOpen}
      onHide={() => setSideBarConfig((prev: any) => ({ ...prev, isOpen: false }))}
    >
      <h1 className="text-black font-medium text-3xl">{title}</h1>

      <ImportProgressOverview data={summary} />
      <ImportLogs 
        docId={docId} 
        csvDownloadStatus={summary.csv_download_status}
        csvDownloadFile={summary.csv_download_file} 
        csvSignedURL={summary.csv_signed_url} 
        csvSignedExpiry={summary.csv_signed_expiry} 
        liveData={logs} 
      />
    </Sidebar>
  );
}

export default ImportDetails;