import { useQuery } from '@tanstack/react-query';
import { amountFormatter } from '@utils/helper';
import axios from 'axios';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { Paginator } from 'primereact/paginator';
import { Sidebar } from 'primereact/sidebar';
import { TabPanel, TabView } from 'primereact/tabview';
import { Toast } from 'primereact/toast';
import { TreeTable } from 'primereact/treetable';
import React, { useContext, useRef, useState } from 'react';
import ExcelJS from 'exceljs';
import moment from '@constant/momentTZ';
import { GlobalContainer } from 'lib/context/globalContext';

// Import our auto-suggest components
import CompaniesAutoSuggest from 'lib/components/common/CompaniesAutoSuggest';
import DepartmentsAutoSuggest from 'lib/components/common/DepartmentsAutoSuggest';
import EmployeeAutoSuggest from 'lib/components/common/EmployeeAutoSuggest';

const CompanyLedgerReportSidebar = ({
  configuration: { isOpen, setIsOpen },
  label: { mainHeader },
  companyId,
}: {
  configuration: Configuration;
  label: Label;
  companyId: string;
}) => {
  const context = useContext(GlobalContainer);

  const employeeDepartment = useQuery({
    queryKey: ['userList'],
    queryFn: () =>
      fetch(`/api/reports/companies`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
        },
      })
        .then((res) => res.json())
        .catch((err) => console.error(err)),
  });

  // const companyOnly = useQuery({
  //   queryKey: ['companyList'],
  //   queryFn: () =>
  //     fetch(`/api/reports/companies/companyOnly`, {
  //       method: 'GET',
  //       headers: {
  //         Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
  //       },
  //     })
  //       .then((res) => res.json())
  //       .catch((err) => console.error(err)),
  // });

  const toast = useRef<Toast>(null);
  const [formState, setFormState] = React.useState<{
    department: number | string | null;
    employee: number | string | null;
  }>({
    department: null,
    employee: null,
  });
  const [formState2, setFormState2] = React.useState<any>(null);

  const [payrollData, setPayrollData] = useState([]);
  const [pagination, setPagination] = useState({
    first: 0,
    rows: 20,
    hasMore: true,
    currentPage: 0,
  });

  // Function to fetch data with pagination
  const fetchPageData = (offset: number, limit: number) => {
    if (context?.authRole === 'SUPER_ADMIN' && companyId == undefined) {
      axios
        .request({
          url: `/api/reports/companies/companyOnly`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
          },
          data: JSON.stringify({
            companyId: formState2?.code || 'No Company',
            departmentId: formState.department || 'No Department',
            limit,
            offset,
          }),
        })
        .then((res: any) => {
          const newData = res.data.payrollData || [];
          setPayrollData(newData);
          setPagination((prev) => ({
            ...prev,
            hasMore: newData.length >= limit,
          }));
        })
        .catch(() => {
          toast.current?.show({
            severity: 'error',
            summary: 'Error loading data',
            life: 3000,
          });
        });
    } else {
      axios
        .request({
          url: `/api/reports/companies/contributions`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
          },
          data: JSON.stringify({
            employeeId: formState.employee || 'No Employee',
            departmentId: formState.department || 'No Department',
            companyId: context?.userData?.companyId,
            limit,
            offset,
          }),
        })
        .then((res: any) => {
          const newData = res.data.payrollData || [];
          setPayrollData(newData);
          setPagination((prev) => ({
            ...prev,
            hasMore: newData.length >= limit,
          }));
        })
        .catch(() => {
          toast.current?.show({
            severity: 'error',
            summary: 'Error loading data',
            life: 3000,
          });
        });
    }
  };

  return (
    <Sidebar
      position="right"
      style={{
        width: '84%',
      }}
      visible={isOpen}
      onHide={() => {
        setIsOpen(false);

        setFormState({
          department: null,
          employee: null,
        });

        setFormState2(null);

        setPayrollData([]);
      }}
    >
      <React.Fragment>
        <h1 className="text-black font-medium text-3xl mb-4">
          {formState2 == null
            ? mainHeader?.replaceAll('_', ' ')
            : formState2?.name + ' | Company Ledger Report'}
        </h1>
      </React.Fragment>
      <div className="grid grid-cols-5 gap-5">
        <React.Fragment>
          {context?.authRole === 'SUPER_ADMIN' && companyId == undefined ? (
            <>
              <div className="card flex justify-content-center flex-col text-[12px] flex-auto">
                <label className="mb-1 font-medium">Company</label>
                <CompaniesAutoSuggest
                  value={formState2?.code || null}
                  onChange={(selectedCompanyId) => {
                    if (selectedCompanyId) {
                      const selectedCompany =
                        employeeDepartment.data?.companyData?.find(
                          (company: any) =>
                            company.companyId === selectedCompanyId
                        );
                      setFormState2({
                        name:
                          selectedCompany?.companyName || 'Selected Company',
                        code: selectedCompanyId,
                      });
                    } else {
                      setFormState2(null);
                    }
                  }}
                  placeholder="Company Name"
                  className="w-full"
                />
              </div>
              <div className="card flex justify-content-center flex-col text-[12px] flex-auto">
                <label className="mb-1 font-medium">Department</label>
                <DepartmentsAutoSuggest
                  value={formState.department}
                  onChange={(selectedDepartmentId) => {
                    setFormState({
                      ...formState,
                      department: selectedDepartmentId,
                    });
                  }}
                  disabled={!formState2?.name}
                  placeholder="Department Name"
                  className="w-full"
                />
              </div>
            </>
          ) : (
            <>
              <div className="card flex justify-content-center flex-col text-[12px] flex-auto">
                <label className="mb-1 font-medium">Employee</label>
                <EmployeeAutoSuggest
                  value={formState.employee}
                  onChange={(selectedEmployee) => {
                    setFormState({
                      ...formState,
                      employee: selectedEmployee?.employeeId,
                    });
                  }}
                  disabled={!!formState.department}
                  placeholder="Employee Name"
                  className="w-full"
                  companyId={context?.userData?.companyId}
                />
              </div>
              <div className="card flex justify-content-center flex-col text-[12px] flex-auto">
                <label className="mb-1 font-medium">Department</label>
                <DepartmentsAutoSuggest
                  value={formState.department}
                  onChange={(selectedDepartmentId) => {
                    setFormState({
                      ...formState,
                      department: selectedDepartmentId,
                    });
                  }}
                  disabled={!!formState.employee}
                  placeholder="Department Name"
                  className="w-full"
                  companyId={context?.userData?.companyId}
                />
              </div>
            </>
          )}
        </React.Fragment>

        <div className="card flex flex-col justify-end text-[12px] flex-auto">
          <span className="my-1" />
          <Button
            rounded
            icon="pi pi-times"
            outlined
            onClick={(e) => {
              setFormState({
                department: null,
                employee: null,
              });

              setFormState2(null);

              setPayrollData([]);
            }}
          />
        </div>

        <div className="card flex flex-col justify-end text-[12px] flex-auto">
          <span className="my-1" />
          <Button
            rounded
            label="Apply Filter"
            onClick={() => {
              // Reset pagination when applying a new filter
              setPagination({
                first: 0,
                rows: pagination.rows,
                hasMore: true,
                currentPage: 0,
              });

              // Fetch data with the new filter
              fetchPageData(0, pagination.rows);

              // Show success message
              toast.current?.show({
                severity: 'success',
                summary: 'Filter Applied',
                life: 3000,
              });
            }}
            disabled={
              companyId == undefined
                ? formState2?.name || formState.employee || formState.department
                  ? false
                  : true
                : formState.department || formState.employee
                ? false
                : true
            }
          />
        </div>

        <div className="card flex flex-col justify-end text-[12px] flex-auto">
          <span className="my-1" />
          <Button
            rounded
            severity="secondary"
            label="Download CSV"
            disabled={payrollData.length === 0 ? true : false}
            onClick={() => {
              const workbook = new ExcelJS.Workbook();
              const worksheet = workbook.addWorksheet('Company Ledger');

              new Array(21).fill('').forEach((item, index) => {
                worksheet.getColumn(index + 1).width = 30;
              });

              const SSS = payrollData.map((payroll: any, index) => {
                const SSS = payroll.payrolls.reduce(
                  (sum: any, payroll: any) => sum + payroll.sssContribution,
                  0
                );

                return [
                  payroll.employeeId,
                  `${payroll.employee_profile.employeeFullName} `,
                  `PHP ${amountFormatter(
                    payroll.employee_benefit.sssECShareRate || 0
                  )}`,
                  `PHP ${amountFormatter(
                    payroll.employee_benefit.sssERShareRate || 0
                  )}`,
                  `PHP ${amountFormatter(
                    payroll.employee_benefit.sssContributionRate || 0
                  )}`,
                  `PHP ${amountFormatter(SSS)}`,
                ];
              });

              const PAGIBIG = payrollData.map((payroll: any, index) => {
                const PAG_BIG = payroll.payrolls.reduce(
                  (sum: any, payroll: any) => sum + payroll.pagibigContribution,
                  0
                );

                return [
                  payroll.employeeId,
                  `${payroll.employee_profile.employeeFullName}`,
                  `PHP 0.00`,
                  `PHP ${amountFormatter(
                    payroll.employee_benefit.pagIbigERShareRate || 0
                  )}`,
                  `PHP ${amountFormatter(
                    payroll.employee_benefit.pagIbigContributionRate || 0
                  )}`,
                  `PHP ${amountFormatter(PAG_BIG)}`,
                ];
              });

              const PHILHEALTH = payrollData.map((payroll: any, index) => {
                const PHILHEALTHREDUCE = payroll.payrolls.reduce(
                  (sum: any, payroll: any) =>
                    sum + payroll.philhealthContribution,
                  0
                );
                return [
                  payroll.employeeId,
                  `${payroll.employee_profile.employeeFullName} `,
                  `PHP 0.00`,
                  `PHP ${amountFormatter(
                    payroll.employee_benefit.philHealthERShareRate || 0
                  )}`,
                  `PHP ${amountFormatter(
                    payroll.employee_benefit.philHealthContributionRate || 0
                  )}`,
                  `PHP ${amountFormatter(PHILHEALTHREDUCE)}`,
                ];
              });

              const earningsData = [
                ['SSS'],
                [
                  'ID',
                  'Employee Name',
                  'EE Contributions',
                  'EE Share',
                  'Monthly Contribution',
                  'YTD Contribution',
                ],
                ...SSS.map((data: any, index: number) => {
                  return [...data.map((item: any) => item)];
                }),
                [],
                ['PAG-IBIG'],
                [
                  'ID',
                  'Employee Name',
                  'EE Contributions',
                  'EE Share',
                  'Monthly Contribution',
                  'YTD Contribution',
                ],
                ...PAGIBIG.map((data: any, index: number) => {
                  return [...data.map((item: any) => item)];
                }),
                [],
                ['PHILHEALTH'],
                [
                  'ID',
                  'Employee Name',
                  'EE Contributions',
                  'EE Share',
                  'Monthly Contribution',
                  'YTD Contribution',
                ],
                ...PHILHEALTH.map((data: any, index: number) => {
                  return [...data.map((item: any) => item)];
                }),
              ];

              earningsData.forEach((row, rowIndex) => {
                const newRow = worksheet.addRow(row);

                // if (rowIndex === 0 || rowIndex === 1 || rowIndex === 2) {
                //   newRow.font = { bold: true };
                // }

                newRow.eachCell({ includeEmpty: true }, (cell) => {
                  cell.alignment = { horizontal: 'center' };
                });

                const cellValue = row[1];
                // if (!isNaN(parseFloat(cellValue))) {
                //   newRow.getCell(2).value = parseFloat(cellValue);
                // }
              });

              // worksheet.mergeCells('L2:R2');

              const workbookBuffer = workbook.xlsx.writeBuffer();
              workbookBuffer.then((buffer) => {
                const blob = new Blob([buffer], {
                  type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Company Ledger - ${moment().format(
                  'MM/DD/YYYY'
                )}.xlsx`;
                a.click();
              });
            }}
          />
        </div>
      </div>
      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Showing {payrollData.length} items
        </div>
        <div className="flex gap-2">
          <Button
            label="Previous"
            disabled={pagination.first === 0}
            onClick={() => {
              const newFirst = Math.max(0, pagination.first - pagination.rows);
              setPagination((prev) => ({
                ...prev,
                first: newFirst,
                currentPage: Math.max(0, prev.currentPage - 1),
              }));

              // Fetch previous page
              fetchPageData(newFirst, pagination.rows);
            }}
          />
          <span className="flex items-center px-4">
            Page {pagination.currentPage + 1}
          </span>
          <Button
            label="Next"
            disabled={!pagination.hasMore}
            onClick={() => {
              const newFirst = pagination.first + pagination.rows;
              setPagination((prev) => ({
                ...prev,
                first: newFirst,
                currentPage: prev.currentPage + 1,
              }));

              // Fetch next page
              fetchPageData(newFirst, pagination.rows);
            }}
          />
          <select
            className="ml-4 p-2 border rounded"
            value={pagination.rows}
            onChange={(e) => {
              const newRows = Number(e.target.value);
              setPagination((prev) => ({
                ...prev,
                rows: newRows,
                first: 0,
                currentPage: 0,
              }));

              // Fetch with new page size
              fetchPageData(0, newRows);
            }}
          >
            <option value="10">10 per page</option>
            <option value="20">20 per page</option>
            <option value="50">50 per page</option>
          </select>
        </div>
      </div>
      <TabView className="mt-5">
        <TabPanel header="SSS">
          <TreeTable
            value={payrollData.map((payroll: any, index) => {
              const SSS = payroll.payrolls.reduce(
                (sum: any, payroll: any) => sum + payroll.sssContribution,
                0
              );

              return {
                key: index,
                data: {
                  employeeId: payroll.employeeId,
                  employeeName: `${payroll.employee_profile.employeeFullName} `,
                  eeControbution: `PHP ${amountFormatter(
                    payroll.employee_benefit.sssECShareRate || 0
                  )}`,
                  eeShare: `PHP ${amountFormatter(
                    payroll.employee_benefit.sssERShareRate || 0
                  )}`,
                  monthlyContribution: `PHP ${amountFormatter(
                    payroll.employee_benefit.sssContributionRate || 0
                  )}`,
                  ytdContribution: `PHP ${amountFormatter(SSS)}`,
                },
              };
            })}
            tableStyle={{ minWidth: '100rem', textAlign: 'left' }}
          >
            <Column field="employeeId" header="ID" />
            <Column field="employeeName" header="Employee Name" />
            <Column field="eeControbution" header="EE Contribution" />
            <Column field="eeShare" header="EE Share" />
            <Column field="monthlyContribution" header="Monthly Contribution" />
            <Column field="ytdContribution" header="YTD Contribution" />
          </TreeTable>
        </TabPanel>
        <TabPanel header="PAG-IBIG">
          <TreeTable
            value={payrollData.map((payroll: any, index) => {
              const PAG_BIG = payroll.payrolls.reduce(
                (sum: any, payroll: any) => sum + payroll.pagibigContribution,
                0
              );
              return {
                key: index,
                data: {
                  employeeId: payroll.employeeId,
                  employeeName: `${payroll.employee_profile.employeeFullName} `,
                  eeControbution: `PHP 0.00`,
                  eeShare: `PHP ${amountFormatter(
                    payroll.employee_benefit.pagIbigERShareRate || 0
                  )}`,
                  monthlyContribution: `PHP ${amountFormatter(
                    payroll.employee_benefit.pagIbigContributionRate || 0
                  )}`,
                  ytdContribution: `PHP ${amountFormatter(PAG_BIG)}`,
                },
              };
            })}
            tableStyle={{ minWidth: '100rem', textAlign: 'left' }}
          >
            <Column field="employeeId" header="ID" />
            <Column field="employeeName" header="Employee Name" />
            <Column field="eeControbution" header="EE Contribution" />
            <Column field="eeShare" header="EE Share" />
            <Column field="monthlyContribution" header="Monthly Contribution" />
            <Column field="ytdContribution" header="YTD Contribution" />
          </TreeTable>
        </TabPanel>
        <TabPanel header="PHILHEALTH">
          <TreeTable
            value={payrollData.map((payroll: any, index) => {
              const PHILHEALTH = payroll.payrolls.reduce(
                (sum: any, payroll: any) =>
                  sum + payroll.philhealthContribution,
                0
              );
              return {
                key: index,
                data: {
                  employeeId: payroll.employeeId,
                  employeeName: `${payroll.employee_profile.employeeFullName}`,
                  eeControbution: `PHP 0.00`,
                  eeShare: `PHP ${amountFormatter(
                    payroll.employee_benefit.philHealthERShareRate || 0
                  )}`,
                  monthlyContribution: `PHP ${amountFormatter(
                    payroll.employee_benefit.philHealthContributionRate || 0
                  )}`,
                  ytdContribution: `PHP ${amountFormatter(PHILHEALTH)}`,
                },
              };
            })}
            tableStyle={{ minWidth: '100rem', textAlign: 'left' }}
          >
            <Column field="employeeId" header="ID" />
            <Column field="employeeName" header="Employee Name" />
            <Column field="eeControbution" header="EE Contribution" />
            <Column field="eeShare" header="EE Share" />
            <Column field="monthlyContribution" header="Monthly Contribution" />
            <Column field="ytdContribution" header="YTD Contribution" />
          </TreeTable>
        </TabPanel>
      </TabView>
      <Toast ref={toast} position="bottom-left" />
    </Sidebar>
  );
};

export default CompanyLedgerReportSidebar;
