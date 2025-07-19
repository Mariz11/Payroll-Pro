import CustomSidebar from 'lib/components/layout/customSidebar';
import React from 'react';
import Users from 'lib/components/dashboards/managements/users/users';

function Page() {
  return (
    <div className="h-screen flex">
      {/* AUTO LOCK */}
        {/* SIDE BAR */}
        <CustomSidebar />

        {/* MAIN COMPONENT */}
        <Users />
    </div>
  );
}

export default Page;
