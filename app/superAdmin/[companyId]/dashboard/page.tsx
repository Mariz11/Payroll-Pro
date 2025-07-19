'use client';

import CustomSidebar from 'lib/components/layout/customSidebar';
import SuperAdmin from 'lib/components/dashboards/superAdmin';
import React, { useContext, useEffect } from 'react';
import { GlobalContainer } from 'lib/context/globalContext';
import Admin from 'lib/components/dashboards/admin';

function Page() {
  const context = useContext(GlobalContainer);

  return (
    <div className="h-screen flex">

        {/* SIDE BAR */}
        <CustomSidebar />

        {/* MAIN COMPONENT */}
        <Admin />

    </div>
  );
}

export default Page;
