import CustomSidebar from 'lib/components/layout/customSidebar';
import React from 'react';
import Index from 'lib/components/dashboards/managements/loanPayments';

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
