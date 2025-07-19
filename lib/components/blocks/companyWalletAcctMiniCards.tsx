import { amountFormatter } from '@utils/helper';
import axios from 'axios';
import Image from 'next/image';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import React, { useEffect, useState } from 'react';

const CompanyWalletAcctMiniCards = ({
  companyAccountId,
}: {
  companyAccountId?: number;
}) => {
  const [walletBalance, setWalletBalance] = useState<any>(null);

  useEffect(() => {
    const url = companyAccountId
      ? `/api/wallet/company?companyAccountId=${companyAccountId}`
      : `/api/wallet/company`;
    axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
        },
      })
      .then((response) => {
        setWalletBalance(response.data.responseData);
      });
  }, [companyAccountId]);

  return (
    <div className="flex justify-between items-start mb-5">
      <div className="flex gap-5 flex-col sm:flex-row">
        <div className="bg-[#d61117] rounded-lg w-[180px] h-[80px] text-white p-2 flex flex-col text-[12px]">
          <span>MAIN ACCOUNT</span>
          <span className="w-full flex justify-end">
            {!walletBalance ? (
              <i
                className="pi pi-spin pi-spinner"
                style={{ fontSize: '15px', marginRight: '20px' }}
              ></i>
            ) : (
              <>PHP {amountFormatter(walletBalance.balance)}</>
            )}
          </span>
          <div className="w-full flex justify-end">
            <Image
              src={'/images/Logo ML.png'}
              alt="Logo"
              className="w-[40px]"
              width={40}
              height={40}
            />
          </div>
        </div>
        <div className="bg-black rounded-lg w-[180px] h-[80px] text-white p-2 flex flex-col text-[12px]">
          <span>ML SERVICE FEE</span>
          <span className="w-full flex justify-end">
            {!walletBalance ? (
              <i
                className="pi pi-spin pi-spinner"
                style={{ fontSize: '15px', marginRight: '20px' }}
              ></i>
            ) : (
              <>PHP {amountFormatter(walletBalance.subAccountBalance)} </>
            )}
          </span>
          <div className="w-full flex justify-end">
            <Image
              src={'/images/Logo ML.png'}
              alt="Logo"
              className="w-[40px]"
              width={40}
              height={40}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyWalletAcctMiniCards;
