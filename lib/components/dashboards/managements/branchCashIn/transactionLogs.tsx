'use client';

import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { Sidebar } from 'primereact/sidebar';
import React, { useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';
import { amountFormatter } from '@utils/helper';
import classNames from 'classnames';
import downloadjs from 'downloadjs';
import html2canvas from 'html2canvas';
import ErrorDialog from 'lib/components/blocks/errorDialog';
import moment from '@constant/momentTZ';
import { DataTable } from 'primereact/datatable';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Timeline } from 'primereact/timeline';
import { QRCodeCanvas } from 'qrcode.react';
import { Skeleton } from 'primereact/skeleton';

const CashinTransctionLogs = ({
  sideBarConfig: { rowData, isOpen },
  setSideBarConfig,
  refetchParent,
}: {
  sideBarConfig: any;
  setSideBarConfig: any;
  refetchParent: () => void;
}) => {
  const transactionLogsQuery: any = useQuery({
    // refetchOnMount: false,
    queryKey: ['transactionLogsQuery', isOpen, rowData],
    queryFn: () =>
      fetch(
        `/api/companies/cashin/transactions/${rowData.transactionCode}/logs`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
          },
        }
      )
        .then((res) => res.json())
        .catch((err) => console.error(err)),
  });

  const downloadQR = async () => {
    const transSecElem: any =
      document.querySelector<HTMLElement>('.transactionElem');
    if (!transSecElem) return;

    const canvas = await html2canvas(transSecElem, {
      onclone: function (document) {
        const hiddenDiv: any = document.querySelector<HTMLElement>('.stats');
        hiddenDiv.style.display = 'block';
        hiddenDiv.style.maxWidth = '200px';
        hiddenDiv.style.margin = 'auto';
      },
    });
    const dataURL = canvas.toDataURL('image/png');
    downloadjs(
      dataURL,
      `Cash In [Ref#${rowData.transactionCode}]`,
      'image/png'
    );
  };

  return (
    <Sidebar
      position="right"
      style={{
        width: '44%',
      }}
      visible={isOpen}
      onHide={() =>
        setSideBarConfig((prev: any) => ({ ...prev, isOpen: false }))
      }
    >
      <React.Fragment>
        <h1 className="text-black font-medium text-3xl">
          Cash in Transaction [{rowData.transactionCode}]
        </h1>
      </React.Fragment>
      {!rowData ? (
        <div className="w-full flex justify-center">
          <ProgressSpinner />
        </div>
      ) : (
        <div className="my-5">
          <div className="p-5 relative">
            {rowData.via == 'BRANCH' &&
              (rowData.status == 'PENDING' ||
                rowData.status == 'PROCESSING') && (
                <Timeline
                  className="w-full ml-[-141px] mb-5"
                  value={[
                    {
                      desc: 'Go to any ML Branch',
                    },
                    {
                      desc: `Show your QR Code or give the Reference Number and claim PHP ${amountFormatter(
                        rowData.principalAmount
                      )}`,
                    },
                  ]}
                  content={(item) => (
                    <h2 className="font-bold m-0 p-0">{item.desc}</h2>
                  )}
                />
              )}

            {rowData.via == 'QRPH' && (
              <p className="text-center text-[50px] font-bold">
                <span className="text-[#F72219]">QR</span>
                <span className="text-[#043D9E]">Ph</span>
              </p>
            )}
            <section className="p-5 text-center transactionElem">
              <div>
                <p
                  className={classNames(
                    'rounded-full relative px-5 py-2 text-white max-w-[200px] m-auto',
                    {
                      'bg-orange-500': rowData.status == 'PENDING',
                      'bg-red-700':
                        rowData.status == 'CANCELLED' ||
                        rowData.status == 'EXPIRED' ||
                        rowData.status == 'ERROR OCCURED',
                      'bg-cyan-500':
                        rowData.status == 'PROCESSING' ||
                        rowData.status == 'TO_VERIFY',
                      'bg-green-700':
                        rowData.status == 'SUCCESS' ||
                        rowData.status == 'SUCCESSFUL' ||
                        rowData.status == 'PAID',
                    }
                  )}
                  data-html2canvas-ignore="true"
                >
                  {rowData.status.replace(/_/g, ' ')}
                </p>
                <p
                  className={classNames(
                    'stats rounded-full text-white relative px-3 py-2 pb-5 hidden',
                    {
                      'bg-orange-500': rowData.status == 'PENDING',
                      'bg-red-700':
                        rowData.status == 'CANCELLED' ||
                        rowData.status == 'EXPIRED' ||
                        rowData.status == 'ERROR OCCURED',
                      'bg-cyan-500':
                        rowData.status == 'PROCESSING' ||
                        rowData.status == 'TO_VERIFY',
                      'bg-green-700':
                        rowData.status == 'SUCCESS' ||
                        rowData.status == 'SUCCESSFUL' ||
                        rowData.status == 'PAID',
                    }
                  )}
                >
                  {rowData.status.replace(/_/g, ' ')}
                </p>
                <p className="mb-3 font-bold text-[20px] mt-2">
                  PHP {amountFormatter(rowData.principalAmount)}
                </p>
                <p className="mb-3 text-gray-500 text-[15px]">
                  Created: {moment(rowData.createdAt).format('LLLL')}
                </p>

                {rowData.via == 'BRANCH' &&
                  (rowData.status == 'PENDING' ||
                    rowData.status == 'PROCESSING') && (
                    <p className="text-red-500 font-bold text-[12px] flex items-center justify-center">
                      <i className="font-extrabold pi pi-exclamation-triangle mr-2"></i>{' '}
                      Your cash in transaction is valid within 24 hours
                    </p>
                  )}
              </div>
              <div className="my-5">
                <QRCodeCanvas
                  size={290}
                  style={{
                    margin: 'auto',
                    height: 'auto',
                  }}
                  imageSettings={{
                    src:
                      rowData.via == 'QRPH'
                        ? '/images/qrph_logo.png'
                        : '/images/MLLogo.png',
                    excavate: true,
                    height: 50,
                    width: 50,
                  }}
                  level={'H'}
                  value={
                    rowData.via == 'BRANCH'
                      ? rowData.transactionCode
                      : rowData.quickResponseCode
                  }
                />
                <p>Scan the QR Code above to process payment</p>
                <Button
                  onClick={downloadQR}
                  label={'Download'}
                  className="rounded p-2 mt-2 p-button text-[10px]"
                  icon={'pi pi-download'}
                  data-html2canvas-ignore="true"
                />
              </div>
              <p className="text-[30px] font-bold">
                <span className="text-red-500">KPTN: </span>{' '}
                {rowData.transactionCode}
              </p>
            </section>
          </div>
        </div>
      )}

      <DataTable
        value={
          transactionLogsQuery.isLoading
            ? [
                {
                  dummy: '',
                },
              ]
            : transactionLogsQuery.data
        }
        tableStyle={{ minWidth: '34rem' }}
      >
        <Column
          field="user.userFullName"
          header="User"
          body={(data) => {
            return transactionLogsQuery.isLoading ||
              transactionLogsQuery.isRefetching ? (
              <Skeleton />
            ) : (
              data.user.userFullName
            );
          }}
        />
        <Column
          field="message"
          header="Action"
          body={(data) => {
            return transactionLogsQuery.isLoading ||
              transactionLogsQuery.isRefetching ? (
              <Skeleton />
            ) : (
              data.message
            );
          }}
        />
        <Column
          field="createdAt"
          header="Log Date"
          body={(data) => {
            return transactionLogsQuery.isLoading ||
              transactionLogsQuery.isRefetching ? (
              <Skeleton />
            ) : (
              <span>{moment(data.createdAt).format('MM/DD/YYYY - LT')}</span>
            );
          }}
        />
      </DataTable>
    </Sidebar>
  );
};

export default CashinTransctionLogs;
