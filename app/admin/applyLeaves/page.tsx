'use client';

import CustomSidebar from '@layout/customSidebar';
import NotFound from 'app/not-found';

import React from 'react';

function Page({ params }: { params: { companyName: string } }) {
  return (
    <div className="h-screen flex">
      <NotFound />
      {/* SIDE BAR */}
      <CustomSidebar />

      {/* MAIN COMPONENT */}
    </div>
  );
}

export default Page;
