'use client';

import React from "react";
import { formatAmount, calcProgressPercentage } from "@utils/helper";

type ProgressItem = {
  percentage: number;
  value: number;
  label: string;
  color: string;
  icon: JSX.Element;
};

type ImportProgressOverviewProps = {
  data: {
    read: number;
    success: number;
    failed: number;
    total: number;
  };
};

const computeProgressValues = (total: number, read: number, success: number, failed: number) => {
  total = Number(total) || 1; // Avoid division by zero
  read = Number(read);
  success = Number(success);
  failed = Number(failed);

  const processed = success + failed;
  const processing = Math.max(read - processed, 0);
  const remaining = Math.max(total - (processing + processed), 0);

  return { total, success, failed, processed, processing, remaining };
};

const computeProgressData = (data: ImportProgressOverviewProps["data"]): ProgressItem[] => {
  const { total, success, failed, processed, processing, remaining } = computeProgressValues(data.total, data.read, data.success, data.failed);
  
  return [
    {
      percentage: (success / total) * 100,
      value: success,
      label: "Success",
      color: "bg-green-500",
      icon: <i className="pi pi-check-circle text-green-500" />,
    },
    {
      percentage: (failed / total) * 100,
      value: failed,
      label: "Failed",
      color: "bg-red-500",
      icon: <i className="pi pi-exclamation-circle text-red-500" />,
    },
    {
      percentage: (processing / total) * 100,
      value: processed,
      label: "Processed",
      color: "bg-yellow-500",
      icon: <i className="pi pi-spinner text-yellow-500" />,
    },
    {
      percentage: (remaining / total) * 100,
      value: remaining,
      label: "Remaining",
      color: "bg-gray-100",
      icon: <i className="pi pi-clock text-gray-400" />,
    }
  ];
};

const ImportProgressOverview: React.FC<ImportProgressOverviewProps> = ({ data }) => {
  const progressData = computeProgressData(data);
  const percentage = calcProgressPercentage(Number(data.total), Number(data.success), Number(data.failed))

  return (
    <div className="flex flex-col gap-3 mt-2">
      <div className="mt-4 mb-4 bg-gray-50x borderx border-gray-200x rounded-lgx shadow-smx p-4x">
        <p className="text-sm font-semibold text-gray-700 mb-2">Progress Overview</p>
        <div className="relative w-full h-3 bg-gray-200 rounded overflow-hidden flex">
          {progressData.map(({ percentage, color }, index) => (
            <div
              key={index}
              className={`h-full ${color}`}
              style={{ width: `${percentage}%` }}
            />
          ))}
        </div>

        <div className="mt-3 flex items-center gap-6">
          {progressData.map(({ label, value, icon }, index) => (
            <div key={index} className="flex items-center gap-2">
              {icon}
              <p className="text-sm text-gray-800">{label}: {formatAmount(value)}</p>
            </div>
          ))}
          <p className="text-sm text-gray-800 ml-auto">{percentage}%</p>
        </div>
      </div>
    </div>
  );
};

export default ImportProgressOverview;
