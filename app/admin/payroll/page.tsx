import CustomSidebar from 'lib/components/layout/customSidebar';
import Index from 'lib/components/dashboards/payroll';
import SuperAdmin from 'lib/components/dashboards/superAdmin';
import React from 'react';
function Page() {
  return (
    <div className="h-screen flex">
      {/* AUTO LOCK */}
      {/* SIDE BAR */}
      <CustomSidebar />

      {/* MAIN COMPONENT */}
      {/* <Index /> */}
    </div>
  );
}

export default Page;
