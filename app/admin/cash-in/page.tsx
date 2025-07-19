import CustomSidebar from 'lib/components/layout/customSidebar';
import React from 'react';
import BranchCashIn from 'lib/components/dashboards/managements/branchCashIn/cashIn';


function Page() {
  return (
    <div className="h-screen flex">

        {/* SIDE BAR */}
        <CustomSidebar />

        {/* MAIN COMPONENT */}
        <BranchCashIn />

    </div>
  );
}

export default Page;
