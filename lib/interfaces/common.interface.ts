export interface HeadersProps {
  label: string;
  key: string;
  required: boolean;
}

export interface CSVUploadProps {
  configuration: {
    startIndex: number;
    headers: HeadersProps[];
    apiUrl: string;
    isOpen: boolean;
    setIsOpen: (v: boolean) => void;
    shiftsQuery: any;
    departmentsQuery: any;
  };
  label: Label;
  refetchEmployees: () => void;
  refetchFailedRegistrations: () => void;
}

export interface UploadFileProps {
  file: File | null;
  data: any[];
}