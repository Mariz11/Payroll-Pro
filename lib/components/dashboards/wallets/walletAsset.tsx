import React from 'react';
import Image from 'next/image';

// Images
import Logo from 'public/images/Logo ML.png';
import { amountFormatter } from '@utils/helper';

function WalletAsset(props: any) {
  return (
    <div
      className="rounded-lg wallet-asset px-7 flex-auto"
      style={{ backgroundColor: `${props.bgColor}` }}
    >
      <h1 className="text-2xl pt-4">{props.title}</h1>
      <div className="flex flex-col pt-4 gap-7">
        <div className="flex w-full text-[18px]">{props.company}</div>
        <div className="flex w-full justify-end text-[18px]">
          {props.amount != null ? (
            amountFormatter(props.amount)
          ) : (
            <i
              className="pi pi-spin pi-spinner"
              style={{ fontSize: '2rem', marginRight: '20px' }}
            ></i>
          )}{' '}
          PHP
        </div>
        <div className="flex w-full flex-row justify-between items-center text-[18px]">
          <span>{props.number}</span>
          <Image src={Logo} alt="Logo" className="w-fit h-[50px]" />
        </div>
      </div>
    </div>
  );
}

export default WalletAsset;
