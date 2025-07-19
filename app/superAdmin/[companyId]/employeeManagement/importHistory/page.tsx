'use client';

import { useEffect, useState } from 'react';
import CustomSidebar from 'lib/components/layout/customSidebar';
import React from 'react';
import ImportHistory from 'lib/components/dashboards/managements/employee/importHistory';
import NotFound from 'app/not-found';
import axios from 'axios';
import LoadingScreen from 'lib/components/loading/loading';

function Page() {
  const [moduleAccess, setModuleAccess] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roleName, setRoleName] = useState<any>('');

  useEffect(() => {
    setIsLoading(true);
    axios
      .get(`/api/user/role`, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
        },
      })
      .then((res: any) => {
        setIsLoading(false);
        setModuleAccess(JSON.parse(res.data.message.moduleAccess));
        setRoleName(res.data.message.roleName);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  
  let accessType = moduleAccess.find((item: any) => item.moduleId === 8)
    ? true
    : false;

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!accessType) {
    return <NotFound />;
  }

  return (
    <div className="h-screen flex">
      {/* SIDE BAR */}

      <CustomSidebar moduleAccess={moduleAccess} roleName={roleName} />

      {/* MAIN COMPONENT */}
      <ImportHistory />
    </div>
  );
}

export default Page;
