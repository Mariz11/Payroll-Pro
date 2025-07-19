import SuperAdmin from 'lib/components/dashboards/superAdmin';
import CustomSidebar from 'lib/components/layout/customSidebar';
import AutoLock from 'lib/components/timeout/autoLock';

async function Page() {
  return (
    <div className="h-screen flex">
      {/* AUTO LOCK */}
        {/* SIDE BAR */}
        <CustomSidebar />

        {/* MAIN COMPONENT */}
        <SuperAdmin />

    </div>
  );
}

export default Page;
