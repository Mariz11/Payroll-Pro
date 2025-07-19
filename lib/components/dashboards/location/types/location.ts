import { PagingAssetProps } from './component';

export type DataRowProps = {
  company_id: number;
  location_id: number;
  address: string;
  end_date: string;
  name: string;
  radius: number;
  start_date: string;
  time_from: string;
  time_to: string;
  validity: string;
  status?: string;
  is_active?: number;
  longitude?: number;
  latitude?: number;
};

export type RequestEmployeeParams = PagingAssetProps & {
  companyId: string;
  startDate?: string;
  endDate?: string;
};

export type EmployeeManagementProps = {
  locationId?: number;
  employeeIds: number[];
};

export type LocationActivationProps = {
  locationId: number;
  company_id: number;
  start_date: string;
  end_date: string;
  is_active: number;
};

export type LocationProps = Partial<DataRowProps> & {
  employee_ids?: number[];
  signature?: string;
};
