import Index from 'lib/components/dashboards/payroll';
import CustomSidebar from 'lib/components/layout/customSidebar';
async function Page() {
  return (
    <div className="h-screen flex">
      {/* AUTO LOCK */}

      {/* SIDE BAR */}
      <CustomSidebar />

      {/* MAIN COMPONENT */}
      <Index actions={[]} />
    </div>
  );
}

export default Page;
