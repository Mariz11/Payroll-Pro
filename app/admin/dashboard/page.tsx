import CustomSidebar from 'lib/components/layout/customSidebar';
import Admin from 'lib/components/dashboards/admin';
import React from 'react';

const Page = () => {
  return (
    <div className="h-screen flex">

        {/* SIDE BAR */}
        <CustomSidebar />

        {/* MAIN COMPONENT */}
        <Admin />
    </div>
  );
};

export default Page;
