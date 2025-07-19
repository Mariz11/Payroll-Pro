import '@styles/globals.css';
import '@styles/styles.css';

import { cookies } from 'next/headers';
import type { Metadata } from 'next';

import { decodeJwt } from 'jose';
import { Inter } from 'next/font/google';
import GlobalContainerLayout from '@layout/globalContainerLayout';
import AutoLock from 'lib/components/timeout/autoLock';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: 'ML Payroll Pro',
  description: 'Powered by Hatchit Solutions | ML Payroll Pro',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const selectedCompany: any = cookieStore.get('selected-company')?.value;
  let selectedCompanyData: any = null;
  let userToken: any = cookieStore.get('user-token')?.value;
  let userData: any;

  if (userToken) {
    if (selectedCompany) {
      userData = {
        ...decodeJwt(userToken),
        company: decodeJwt(selectedCompany),
      };
      selectedCompanyData = decodeJwt(selectedCompany);
    } else {
      userData = userToken && decodeJwt(userToken);
    }
  }

  return (
    <html lang="en" suppressHydrationWarning={true}>
      <GlobalContainerLayout
        authRole={userData !== undefined ? (userData.role as string) : ''}
        userData={userData}
        selectedCompany={selectedCompanyData}
        userToken={userToken}
      >
        <body suppressHydrationWarning={true} className={inter.className}>
          <AutoLock>{children}</AutoLock>
        </body>
      </GlobalContainerLayout>
    </html>
  );
}
