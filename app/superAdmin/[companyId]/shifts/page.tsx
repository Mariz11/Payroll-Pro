import CustomSidebar from '@layout/customSidebar';
import Shifts from 'lib/components/dashboards/managements/shifts/shifts';
import React from 'react';
import AutoLock from 'lib/components/timeout/autoLock';
function Page() {
  return (
    <div className="h-screen flex">
      {/* AUTO LOCK */}
        {/* SIDE BAR */}
        <CustomSidebar />
        {/* MAIN COMPONENT */}
        <Shifts />

    </div>
  );
}

export default Page;
