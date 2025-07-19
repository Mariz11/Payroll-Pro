import { LocationInstance } from '../constant/service';
import { PagingAssetProps } from '../types/component';
import {
  EmployeeManagementProps,
  LocationActivationProps,
  LocationProps,
  RequestEmployeeParams,
} from '../types/location';

type RequestLocationParams = {
  companyId: string | number;
  role: string;
};
export const API = {
  getLocations: async (props: PagingAssetProps & RequestLocationParams) => {
    const response = await LocationInstance().get(`/api/location/view`, {
      params: { ...props },
    });
    return response?.data;
  },
  getLocationById: async (id: string) => {
    const response = await LocationInstance().get(`/api/location/view`, {
      params: { id },
    });
    return response?.data;
  },
  addLocation: async (data: LocationProps) => {
    const response = await LocationInstance().post(`/api/location/add`, data);
    return response?.data;
  },
  editLocation: async (data: LocationProps) => {
    const response = await LocationInstance().put(`/api/location/edit`, data);
    return response?.data;
  },
  deleteLocation: async (data: any) => {
    const response = await LocationInstance().delete(`/api/location/remove`, {
      params: data,
    });
    return response?.data;
  },
  getDepartmentByCompanyId: async (companyId: string) => {
    const response = await LocationInstance().get(`/api/location/departments`, {
      params: { companyId },
    });
    return response?.data;
  },
  getEmployeesByCompanyId: async (params: RequestEmployeeParams) => {
    const response = await LocationInstance().get(`/api/location/employees`, {
      params,
    });
    return response?.data;
  },
  getEmployeesbyDepartment: async (departmentId: string) => {
    const response = await LocationInstance().get(`/api/location/employees`, {
      params: { departmentId },
    });
    return response?.data;
  },
  getEmployeesByLocation: async (
    locationId?: number,
    props?: PagingAssetProps
  ) => {
    if (!locationId?.toString()) return;
    const response = await LocationInstance().get(`/api/location/assign`, {
      params: { locationId, ...props },
    });
    return response?.data;
  },
  addEmployeeToLocation: async (data: EmployeeManagementProps) => {
    const { locationId } = data;
    if (!locationId?.toString()) return;
    const response = await LocationInstance().post(
      `/api/location/employees`,
      data
    );
    return response?.data;
  },
  removeEmployeeFromLocation: async (data: EmployeeManagementProps) => {
    const { locationId } = data;
    if (!locationId?.toString()) return;
    const response = await LocationInstance().delete(
      `/api/location/employees`,
      {
        data,
      }
    );
    return response?.data;
  },
  updateLocationStatus: async (data: LocationActivationProps) => {
    const { locationId } = data;
    if (!locationId?.toString()) return;
    const response = await LocationInstance().put(
      `/api/location/activate`,
      data
    );
    return response?.data;
  },
};
