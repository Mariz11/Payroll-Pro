import CustomSidebar from '@layout/customSidebar';
import Index from 'lib/components/dashboards/reports';
import React from 'react';
const Page = () => {
  return (
    <div className="h-screen flex">
  
        {/* SIDE BAR */}
        <CustomSidebar />

        {/* MAIN COMPONENT */}
        <Index />
  
    </div>
  );
};

export default Page;
