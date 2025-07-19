import CustomSidebar from 'lib/components/layout/customSidebar';
import React from 'react';
import Users from 'lib/components/dashboards/managements/users/users';
import AccountDetail from 'lib/components/dashboards/accountDetails/accountDetail';
import AutoLock from 'lib/components/timeout/autoLock';
function Page() {
  return (
    <div className="h-screen flex">
        {/* SIDE BAR */}
        <CustomSidebar />

        {/* MAIN COMPONENT */}
        <AccountDetail />

    </div>
  );
}

export default Page;
