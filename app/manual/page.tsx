import React from 'react';

import EmployeeManualAttendance from 'lib/components/blocks/employeeManualAttendance';
import { verifyManualJWT } from 'lib/utils/jwt';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
const Page = async () => {
  const cookieStore = cookies();
  const token: any = cookieStore.get('manual-login-token')?.value;
  if (token) {
    const decodedToken = await verifyManualJWT(token);
    if (decodedToken) {
      return <EmployeeManualAttendance isAuthenticated={true} companyData={decodedToken.company} />;
    }
  }
  return <EmployeeManualAttendance isAuthenticated={false} companyData={null} />;
};

export default Page;
