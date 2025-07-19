'use client';
import React, { useState, useEffect } from 'react';
import { Chart } from 'primereact/chart';

const truncateLabel = (label: string) => {
  const maxStringLength = 20;
  return label.length > maxStringLength
    ? label.substring(0, maxStringLength) + '...'
    : label;
};

function TopLogs({
  logsData,
  tableHeaders,
}: {
  logsData: TopLogs;
  tableHeaders: TableHeaders;
}) {
  const documentStyle = getComputedStyle(document.documentElement);
  const textColor = documentStyle.getPropertyValue('--text-color');
  const textColorSecondary = documentStyle.getPropertyValue(
    '--text-color-secondary'
  );
  const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

  return (
    <div className="overflow-auto sm:ml-[20px] md:pr-5 lg:py-4 w-full h-[200px] sm:h-[300px] lg:h-auto lg:mt-0 mt-5">
      <div className="flex flex-row justify-between w-full items-center mb-4">
        <span className="text-[20px] font-bold">{tableHeaders.title}</span>
      </div>
      <div className="overflow-auto h-[300px] w-full">
        <div className="card flex overflow-auto w-full">
          {logsData && logsData.logsData && (
            <Chart
              type="bar"
              data={{
                labels: logsData.logsData.map((item, index) =>
                  // index === 0 ? truncateLabel(item.name) : item.name
                  truncateLabel(item.name)
                ),
                datasets: [
                  {
                    label: tableHeaders.header2,
                    backgroundColor:
                      documentStyle.getPropertyValue('--red-500'),
                    borderColor: documentStyle.getPropertyValue('--red-500'),
                    data: logsData.logsData.map((item) => item.col2),
                  },
                ],
              }}
              options={{
                maintainAspectRatio: false,
                aspectRatio: 0.8,
                plugins: {
                  legend: {
                    labels: {
                      fontColor: textColor,
                    },
                  },
                  tooltip: {
                    callbacks: {
                      title: function (tooltipItems: any) {
                        const fullLabel =
                          logsData.logsData[tooltipItems[0].dataIndex].name;
                        return fullLabel;
                      },
                    },
                  },
                },
                scales: {
                  x: {
                    ticks: {
                      color: textColorSecondary,
                      font: {
                        weight: 500,
                      },
                    },
                    grid: {
                      display: false,
                      drawBorder: false,
                    },
                  },
                  y: {
                    ticks: {
                      color: textColorSecondary,
                    },
                    grid: {
                      color: surfaceBorder,
                      drawBorder: false,
                    },
                  },
                },
              }}
              height="300px"
              className="w-full"
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default TopLogs;
