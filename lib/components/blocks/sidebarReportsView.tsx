import { properCasing } from '@utils/helper';
import moment from '@constant/momentTZ';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Sidebar } from 'primereact/sidebar';
import React from 'react';

const SidebarReportsView = ({
  configuration: { isOpen, setIsOpen },
  label: { mainHeader, header, subHeader },
  items,
}: {
  configuration: {
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
  };
  label: Label;
  items: any[];
}) => {
  return (
    <Sidebar
      position="right"
      className="p-sidebar-md"
      visible={isOpen}
      onHide={() => setIsOpen(false)}
    >
      <React.Fragment>
        <h1 className="text-black font-medium text-3xl">{mainHeader}</h1>
        <p className="my-1 font-light">{header}</p>
        <h3 className="font-medium mt-5">{subHeader}</h3>
      </React.Fragment>

      <div className="mt-4">
        <DataTable
          paginator
          rowsPerPageOptions={[5, 15, 25, 50, 100]}
          rows={10}
          value={[...items]}
        >
          <Column
            field="employeeName"
            header="User"
            body={(data: any) => {
              const fullName =
                data.user?.firstName && data.user?.lastName
                  ? data.user?.userFullName
                  : data.user?.emailAddress;
              return <span>{fullName}</span>;
            }}
          />
          <Column
            field="employeeName"
            header="Action"
            style={{
              width: '50%',
            }}
            body={(data: any) => {
              return <span>{data.message}</span>;
            }}
          />
          <Column
            field="employeeName"
            header="Date"
            body={(data: any) => {
              return <span>{moment(data.createdAt).format('MM/DD/YYYY')}</span>;
            }}
          />
        </DataTable>
      </div>
    </Sidebar>
  );
};

export default SidebarReportsView;
