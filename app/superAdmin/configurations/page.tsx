import CustomSidebar from 'lib/components/layout/customSidebar';

import React from 'react';
import SuperAdminConfigurations from 'lib/components/dashboards/managements/configurations/superAdminConfigurations';
import AutoLock from 'lib/components/timeout/autoLock';
function Page() {
    return (
        <div className="h-screen flex">
            {/* AUTO LOCK */}
                {/* SIDE BAR */}
                <CustomSidebar />

                {/* MAIN COMPONENT */}
                <SuperAdminConfigurations />

        </div>
    );
}

export default Page;
