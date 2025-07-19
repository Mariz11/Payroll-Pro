'use client';

// LOCAL MODULES
import { GlobalContainer } from 'lib/context/globalContext';
import React from 'react';

// PRIME REACT
import { PrimeReactProvider } from 'primereact/api';

// THEME STYLES
import '@assets/themes/mytheme/theme.scss';
import 'primeicons/primeicons.css';
import 'primereact/resources/primereact.min.css';
import AutoLock from '../timeout/autoLock';
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query';

const queryClient = new QueryClient();

const CustomLayout = ({
  children,
  authRole,
  userData,
  selectedCompany,
  userToken,
}: {
  children: React.ReactNode;
  authRole: string;
  userData: any;
  selectedCompany: any;
  userToken: string;
}) => {
  return (
    <GlobalContainer.Provider
      value={{
        authRole: authRole,
        userData: userData,
        userToken: userToken,
        selectedCompany: selectedCompany,
      }}
    >
      <QueryClientProvider client={queryClient}>
        <PrimeReactProvider>
          <AutoLock>{children}</AutoLock>
        </PrimeReactProvider>
      </QueryClientProvider>
    </GlobalContainer.Provider>
  );
};

export default CustomLayout;
