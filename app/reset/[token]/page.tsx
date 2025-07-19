// 'use client';
import Login from 'lib/components/blocks/login';
import ResetPassword from 'lib/components/blocks/reset';
import { verifyJWT } from 'lib/utils/jwt';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default async function Page({ params }: { params: { token: string } }) {
  const { token } = params;
  return (
    <>
      <ResetPassword token={token} />
    </>
  );
}
