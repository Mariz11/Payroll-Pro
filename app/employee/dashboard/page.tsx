import CustomSidebar from '@layout/customSidebar';
import Employee from 'lib/components/dashboards/employee';
import React from 'react';
function Page() {
  return (
    <div className="h-screen flex">
      {/* AUTO LOCK */}
        {/* SIDE BAR */}
        <CustomSidebar />

        {/* MAIN COMPONENT */}
        <Employee />
    </div>
  );
}

export default Page;
