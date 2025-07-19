import CustomSidebar from 'lib/components/layout/customSidebar';
import React from 'react';
import Users from 'lib/components/dashboards/managements/users/users';
import AutoLock from 'lib/components/timeout/autoLock';
function Page() {
  return (
    <div className="h-screen flex">
        {/* SIDE BAR */}
        <CustomSidebar />

        {/* MAIN COMPONENT */}
        <Users />
    </div>
  );
}

export default Page;
