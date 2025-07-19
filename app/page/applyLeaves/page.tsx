'use client';

import CustomSidebar from '@layout/customSidebar';
import NotFound from 'app/not-found';
import AutoLock from 'lib/components/timeout/autoLock';
import React from 'react';

function Page({ params }: { params: { companyName: string } }) {
  return (
    <div className="h-screen flex">
      <NotFound />
      {/* AUTO LOCK */}
      {/* <AutoLock> */}
      {/* SIDE BAR */}
      {/* <CustomSidebar /> */}

      {/* MAIN COMPONENT */}
      {/* </AutoLock> */}
    </div>
  );
}

export default Page;
