'use client';
import React, { useState, useEffect } from 'react';
import { Chart } from 'primereact/chart';

function Doughnut({ data }: { data: DoughnutData }) {
  const [chartData, setChartData] = useState({});
  const [chartOptions, setChartOptions] = useState({});

  useEffect(() => {
    const options = {
      cutout: '60%',
      plugins: {
        legend: {
          display: false,
        },
      },
      tooltips: {
        enabled: false,
      },
      elements: {
        arc: {
          borderWidth: 0,
        },
      },
    };

    setChartData(data);
    setChartOptions(options);
  }, []);

  const renderDataLabels = () => {
    const dataLabels = [];
    for (let i = 0; i < data.labels.length; i++) {
      dataLabels.push(
        <div key={i} className="flex flex-col my-1">
          <div className="flex flex-row items-center">
            <div
              className="mr-2"
              style={{
                backgroundColor: data.datasets[0].backgroundColor[i],
                width: '12px',
                height: '12px',
                borderRadius: '50%',
              }}
            ></div>
            <div className="text-[10px]">{data.labels[i]}</div>
          </div>
          <div className="ml-5 text-[15px]">{data.datasets[0].data[i]}</div>
        </div>
      );
    }
    return dataLabels;
  };

  return (
    <div className="rounded-lg doughnut px-7 flex-auto">
      <h1 className="text-[20px] px-4 pt-4">Employee Status</h1>
      <div className="flex flex-row justify-between p-4 items-center">
        <div className="flex flex-col">{renderDataLabels()}</div>
        <div className="h-[100px] md:h-[140px] w-auto flex">
          <Chart type="doughnut" data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}

export default Doughnut;
