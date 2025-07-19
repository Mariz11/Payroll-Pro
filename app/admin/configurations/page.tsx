import CustomSidebar from 'lib/components/layout/customSidebar';
import React from 'react';
import Configurations from 'lib/components/dashboards/managements/configurations/configurations';


function Page() {
  return (
    <div className="h-screen flex">
      {/* AUTO LOCK */}

        {/* SIDE BAR */}
        <CustomSidebar />

        {/* MAIN COMPONENT */}
        <Configurations />

    </div >
  );
}

export default Page;
