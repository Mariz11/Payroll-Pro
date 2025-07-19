import CustomSidebar from 'lib/components/layout/customSidebar';
import SuperAdmin from 'lib/components/dashboards/superAdmin';
import React from 'react';
import Index from 'lib/components/dashboards/attendance/index';
function Page() {
  return (
    <div className="h-screen flex">
      {/* AUTO LOCK */}

      {/* SIDE BAR */}
      <CustomSidebar />

      {/* MAIN COMPONENT */}
      <Index actions={[]} />
    </div>
  );
}

export default Page;
