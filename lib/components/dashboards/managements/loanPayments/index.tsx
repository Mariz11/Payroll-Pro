'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import axios from 'axios';
import { Steps } from 'primereact/steps';
import { InputNumber } from 'primereact/inputnumber';
import { amountFormatter, uuidv4 } from '@utils/helper';
import classNames from 'classnames';
import moment from '@constant/momentTZ';
import { ProgressSpinner } from 'primereact/progressspinner';
import { TabPanel, TabView } from 'primereact/tabview';
import { Paginator } from 'primereact/paginator';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { formatAmount } from '@utils/dashboardFunction';
import { useQuery } from '@tanstack/react-query';
import DashboardNav from 'lib/components/blocks/dashboardNav';
import { Timeline } from 'primereact/timeline';
import { Skeleton } from 'primereact/skeleton';
import { Dropdown } from 'primereact/dropdown';

const Index = () => {
  const toast = useRef<Toast>(null);
  const [currentStep, setCurrentStep] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [isSending, setIsSending] = useState(false);
  const [nonce, setNonce] = useState(uuidv4());

  return (
    <div className="w-screen h-screen overflow-auto p-5">
      <Toast ref={toast} position="bottom-left" />
      {/* DASHBOARD NAV */}
      <DashboardNav
        navTitle="Transactions > Loan Payments"
        buttons={[]}
        searchPlaceholder=""
        isShowSearch={false}
      />

      {/* MAIN CONTENT */}
      <div className="line-container rounded-lg p-5"></div>
    </div>
  );
};

export default Index;
