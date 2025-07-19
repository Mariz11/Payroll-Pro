import CustomSidebar from '@layout/customSidebar';
import Holidays from 'lib/components/dashboards/managements/holidays/holidays';
import React from 'react';

function Page() {
  return (
    <div className="h-screen flex">
      {/* AUTO LOCK */}
        {/* SIDE BAR */}
        <CustomSidebar />

        {/* MAIN COMPONENT */}
        <Holidays />
    </div>
  );
}

export default Page;
