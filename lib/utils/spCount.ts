import { executeQuery } from "db/connection";

interface CountParamsProps {
  companyId?: number;
  employeeCode?: string;
  emailAddress?: string;
  contactNumber?: string;
}

interface CountDataItemProps {
  storedProcName: string;
  params: CountParamsProps;
}

export interface CountDataProps {
  employeeCode: CountDataItemProps;
  emailAddress: CountDataItemProps;
  contactNumber: CountDataItemProps;
}

const spCount = async (storedProcName: string, params: CountParamsProps): Promise<number> => {
  const [result] = (await executeQuery(storedProcName, params)) as { count: number }[];
  return result?.count > 0 ? result.count : 0;
};

export default spCount;