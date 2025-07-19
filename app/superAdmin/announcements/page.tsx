// ADD ANNOUNCEMENTS PAGE START
import CustomSidebar from 'lib/components/layout/customSidebar';
import React from 'react';
import Announcements from 'lib/components/dashboards/managements/announcements/announcements';
import AutoLock from 'lib/components/timeout/autoLock';
function Page() {
  return (
    <div className="h-screen flex">
      {/* AUTO LOCK */}
        {/* SIDE BAR */}
        <CustomSidebar />

        {/* MAIN COMPONENT */}
        <Announcements />
    </div>
  );
}

export default Page;
// ADD ANNOUNCEMENTS PAGE END
