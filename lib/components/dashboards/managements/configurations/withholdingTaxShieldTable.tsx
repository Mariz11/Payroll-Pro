import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Skeleton } from 'primereact/skeleton';
import WithholdingTaxShieldSidebar from './withholdingTaxSidebar';
import { useState } from 'react';

const WithholdingTaxTable = ({ withholdingTax }: { withholdingTax: any }) => {
  const [sidebarConfiguration, setSidebarConfiguration] = useState<any>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [action, setAction] = useState<'view' | 'edit'>('view');
  const [selectedRowIndex, setSelectedRowIndex] = useState<any>(null)
  return (
    <>
      <DataTable
        value={true ? withholdingTax : []}
        selectionMode={'single'}
        onSelectionChange={(e) => {}}
      >
        <Column
          field="name"
          header="Bracket"
          className="w-[10%]"
          align={'center'}
          body={(data: any) => {
            return false ? (
              <Skeleton />
            ) : (
              <span className="text-center">{data.bracket}</span>
            );
          }}
        />
        <Column
          field="name"
          header="From"
          className="w-[18%]"
          align={'center'}
          body={(data: any) => {
            return false ? (
              <Skeleton />
            ) : (
              <span className="text-center">₱{data.from.toFixed(2)}</span>
            );
          }}
        />
        <Column
          field="name"
          header="To"
          className="w-[18%]"
          align={'center'}
          body={(data: any) => {
            return false ? (
              <Skeleton />
            ) : (
              <span className="text-center">
                {data.to === null ? `Above ₱${data.from}` : `₱${data.to.toFixed(2)}`}
              </span>
            );
          }}
        />
        <Column
          field="name"
          header="Fix Tax Amount"
          className="w-[18%]"
          align={'center'}
          body={(data: any) => {
            return false ? (
              <Skeleton />
            ) : (
              <span className="text-center">
                ₱{data.fixTaxAmount.toFixed(2)}
              </span>
            );
          }}
        />
        <Column
          field="name"
          header="Tax Rate on Excess"
          className="w-[18%]"
          align={'center'}
          body={(data: any) => {
            return false ? (
              <Skeleton />
            ) : (
              <span className="text-center">
                {data.taxRateExcess.toFixed(2)}%
              </span>
            );
          }}
        />
        <Column
          field="name"
          header="Actions"
          align={'center'}
          className="w-[18%]"
          body={(data: any, index: any) => {
            return false ? (
              <Skeleton />
            ) : (
              <div className="flex-row flex justify-center">
                <Button
                  type="button"
                  text
                  severity="secondary"
                  style={{ color: 'black' }}
                  icon="pi pi-file-edit"
                  tooltip="Edit"
                  tooltipOptions={{ position: 'top' }}
                  // disabled={action == 'view'}
                  onClick={() => {
                    // setSelectedAllowanceRow(index.rowIndex);
                    // setIsSidebarOpen(true);
                    // setAllowanceSidebarAction('edit');
                    setIsSidebarOpen(true);
                    setAction('edit');
                    setSelectedRowIndex(index.rowIndex)
                  }}
                />
              </div>
            );
          }}
        />
      </DataTable>
      {
        selectedRowIndex !== null &&
        <WithholdingTaxShieldSidebar 
        configuration={{
          action: action,
          isOpen: isSidebarOpen,
          setIsOpen: setIsSidebarOpen,
        }}
        selectedRowIndex={selectedRowIndex}
        withholdingTax={withholdingTax}
      />
      }
    </>
  );
};

export default WithholdingTaxTable;
