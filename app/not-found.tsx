import React from 'react';
import Image from 'next/image';

import LoginBG from 'public/images/login-bg.png';
import MLLogo from 'public/images/MLLogo.png';

export default function NotFound() {
  return (
    <main className="flex flex-col sm:flex-row login">
      <div className="card flex justify-center items-center flex-col sm:w-[600px] login gap-5 h-[100vh]">
        <Image
          src={MLLogo}
          alt="Logo"
          width={1000}
          height={1000}
          className="w-fit h-[100px]"
        />
        <div className="w-full">
          <h1 className="text-center text-xl font-bold">Not Found</h1>
        </div>
      </div>

      {/* ASK FOR DEMO */}
      <div
        className="w-full sm:h-[100vh] py-20 sm:py-0 flex justify-center items-start flex-col px-[20px] md:px-[50px] lg:px-[100px]"
        style={{
          backgroundImage: `url(${LoginBG.src})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <span className="font-bold text-white text-[30px] md:text-[40px] lg:text-[55px]">
          <p>Your one stop, </p>
          <p className="sm:-mt-5">payroll management system</p>
        </span>
        <p className="text-white text-[15px] sm:text-xl md:w-[400px] lg:w-[700px] my-5">
          Achieve seamless government compliance and effortless accessibility
          with just one click. Simplify your company&apos;s payroll process and
          start generating pay slips instantly!
        </p>
      </div>
    </main>
  );
}
