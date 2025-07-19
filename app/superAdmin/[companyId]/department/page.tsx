import CustomSidebar from 'lib/components/layout/customSidebar';
import SuperAdmin from 'lib/components/dashboards/superAdmin';
import React from 'react';
import Index from 'lib/components/dashboards/department';

function Page() {
  return (
    <div className="h-screen flex">

        {/* SIDE BAR */}
        <CustomSidebar />

        {/* MAIN COMPONENT */}
        <Index />

    </div>
  );
}

export default Page;
