import CustomSidebar from '@layout/customSidebar';
import Index from 'lib/components/dashboards/reports';
import React from 'react';
import AutoLock from 'lib/components/timeout/autoLock';
const Page = () => {
  return (
    <div className="h-screen flex">
      {/* AUTO LOCK */}

        {/* SIDE BAR */}
        <CustomSidebar />

        {/* MAIN COMPONENT */}
        <Index />
    </div>
  );
};

export default Page;
