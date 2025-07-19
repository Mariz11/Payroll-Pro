import CustomSidebar from 'lib/components/layout/customSidebar';
import SuperAdmin from 'lib/components/dashboards/superAdmin';
import React from 'react';
import Company from 'lib/components/dashboards/companies/company';
import AutoLock from 'lib/components/timeout/autoLock';
function Page() {
  return (
    <div className="h-screen flex">
      {/* AUTO LOCK */}
        {/* SIDE BAR */}
        <CustomSidebar />

        {/* MAIN COMPONENT */}
        <Company />

    </div>
  );
}

export default Page;
