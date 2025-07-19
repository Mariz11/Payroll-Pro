'use client';

require('dotenv').config();

import React, { useState, useContext } from 'react';
import { ButtonType } from '@enums/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Skeleton } from 'primereact/skeleton';
import { Paginator } from 'primereact/paginator';
import DashboardNav from 'lib/components/blocks/dashboardNav';
import { VDivider } from 'lib/components/blocks/divider';
import ImportDetails from './importDetails';
import useImportHistoryHook from 'lib/hooks/useImportHistoryHook';
import { formatAmount } from '@utils/helper';
import { EmployeeImportHistoryListProps } from 'lib/interfaces';
import ProgressBar from 'lib/components/blocks/ProgressBar';
import { GlobalContainer } from 'lib/context/globalContext';

const navTitle = 'Company > Employees > Import History';

const ImportHistory: React.FC = () => {
  const context = useContext(GlobalContainer);
  const [pageSize, setPageSize] = useState(5);
  const {
    list,
    total,
    page,
    fetching,
    setPageIndex,
  } = useImportHistoryHook({ 
    userType: context?.authRole || '',
    id: context?.authRole === 'SUPER_ADMIN' ? context?.selectedCompany.companyId : context?.userData.userId,
    pageSize 
  });

  const [headerButtons] = useState<any[]>([{
    label: 'Back to Employees List',
    type: ButtonType.Black,
    isDropdown: false,
    isIcon: true,
    handler: () => window.open(`${window.location.href.replace('/importHistory', '')}`, '_self'),
  }]);
  const [sideBarConfig, setSideBarConfig] = useState<SideBarConfig>({
    title: 'Import Details',
    submitBtnText: '',
    action: '',
    rowData: null,
    isOpen: false,
  });
  
  
  const handleActionClick = (action: string, rowData: EmployeeImportHistoryListProps) => {
    setSideBarConfig({
      title: 'Bulk Import',
      action,
      rowData,
      isOpen: true,
    });
  };

  const actionTemplate = (rowData: EmployeeImportHistoryListProps) => {
    if (fetching) return <Skeleton />;
  
    const isCompleted = rowData?.progress === 100;
    const actions = [
      { icon: 'pi-eye', tooltip: 'View', severity: 'secondary' },
      // { icon: 'pi-download', tooltip: 'Download', severity: 'secondary' },
      // { icon: 'pi-trash', tooltip: 'Delete', severity: 'danger' },
    ];
  
    return (
      <div className="flex flex-nowrap gap-2">
        {actions.map(({ icon, tooltip, severity }, index) => (
          <React.Fragment key={icon}>
            {index > 0 && <VDivider />}
            <Button
              type="button"
              text
              severity={severity}
              icon={`pi ${icon}`}
              tooltip={tooltip}
              tooltipOptions={{ position: 'top' }}
              disabled={fetching || (icon !== 'pi-eye' && !isCompleted)}
              onClick={(e) => {
                e.stopPropagation();
                if (icon === 'pi-eye' && rowData) handleActionClick('view', rowData);
                else console.log(icon.replace('pi-', ''));
              }}
            />
          </React.Fragment>
        ))}
      </div>
    );
  };
  

  const renderColumnBody = (
    field: keyof EmployeeImportHistoryListProps, 
    fn?: (value: any, row?: EmployeeImportHistoryListProps
  ) => JSX.Element | string) => 
    (row: EmployeeImportHistoryListProps) => {
      if (fetching) return <Skeleton />;
      
      // Pass full row only for actionTemplate
      if (field === 'actions') return fn?.(row, row);
  
      // Pass row[field] for everything else
      return fn ? fn(row[field], row) : row[field];
    };

  return (
    <div className="w-screen h-screen overflow-auto p-5">
      <DashboardNav navTitle={navTitle} buttons={headerButtons} />

      <div className="line-container rounded-lg p-5">
        <DataTable value={list} frozenWidth="95rem" scrollable tableStyle={{ minWidth: '95rem' }}>
          {[
            { field: 'documentId', header: 'Document ID' },
            { field: 'uploadDate', header: 'Upload Date' },
            { field: 'fileName', header: 'File Name', className: 'max-w-xs', fn: (text: string) => <p className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{text}</p> },
            { field: 'totalRows', header: 'Total Rows', fn: formatAmount },
            { field: 'progress', header: 'Progress', style: { width: '20%' }, fn: (value: number) => <ProgressBar percentage={value} /> },
            { field: 'actions', header: 'Actions', fn: actionTemplate },
          ].map(({ field, header, ...props }) => (
            <Column key={field} field={field} header={header} body={renderColumnBody(field as keyof EmployeeImportHistoryListProps, props.fn)} {...props} />
          ))}
        </DataTable>
        
        <Paginator
          first={page * pageSize}
          rows={pageSize}
          totalRecords={total}
          rowsPerPageOptions={[5, 15, 25, 50, 100]}
          onPageChange={(event) => {
            const { first, rows }: any = event;
            const targetPage = Math.floor(first / rows);
            setPageIndex(targetPage);
            setPageSize(rows);
          }}
        />
      </div>

      <ImportDetails configuration={sideBarConfig} setSideBarConfig={setSideBarConfig} />
    </div>
  );
};

export default ImportHistory;