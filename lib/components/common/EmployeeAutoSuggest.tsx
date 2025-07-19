import axios from 'axios';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { AutoComplete } from 'primereact/autocomplete';
import { ProgressSpinner } from 'primereact/progressspinner';

interface EmployeeAutoSuggestProps {
  value: any;
  onChange: (value: any) => void;
  onBlur?: () => void;
  className?: string;
  disabled?: boolean;
  companyId?: number;
  employeeStatus?: number;
  placeholder?: string;
  error?: boolean;
  payrollType?: string;
}

const EmployeeAutoSuggest: React.FC<EmployeeAutoSuggestProps> = ({
  value,
  onChange,
  onBlur,
  className,
  disabled = false,
  companyId,
  employeeStatus = 1,
  placeholder = 'Search employee...',
  error = false,
  payrollType
}) => {

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleQuery = async (query?: string, employeeId?: string) => {
    setIsLoading(true);
    const response = await axios.get('/api/employee', {
      params: {
        companyId,
        search: query,
        employeeStatus,
        payrollType,
        employeeId
      },
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
      },
    });
    setSuggestions(response.data);
    return response.data;
  }

  useEffect(()=>{
    if(value === '' || value === null || !value){
      setInputValue('');
    }
  }, [value])

  useEffect(() => {
    const fetchData = async () => {
      if(value) {
        const res = await handleQuery(undefined, value)
        setInputValue(res[0]);
      }
    }
    fetchData()
  },[])

  const search = useCallback(
    debounce(async (event: { query: string }) => {
      const { query } = event;
      if (!query.trim()) {
        setSuggestions([]);
        return;
      }

      try {
        await handleQuery(query)
      } catch (error) {
        console.error('Error fetching employees:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [companyId, employeeStatus]
  );

  const handleChange = (e: any) => {
    const selectedValue = e.value;
    if (typeof selectedValue === 'string') {
      // This is an input change
      setInputValue(selectedValue);
    } else {
      // This is a selection
      setInputValue(selectedValue?.employee_profile?.employeeFullName || '');
      onChange(selectedValue);
    }
  };

  const itemTemplate = (item: any) => {
    return (
      <div className="flex items-center gap-3">
        <span>{item.employee_profile?.employeeFullName}</span>
      </div>
    );
  };

  return (
    <div className="relative w-full">
      <AutoComplete
        value={inputValue}
        suggestions={suggestions}
        completeMethod={search}
        field="employee_profile.employeeFullName"
        onChange={handleChange}
        onBlur={onBlur}
        itemTemplate={itemTemplate}
        className={`w-full ${className} ${error ? 'p-invalid' : ''}`}
        inputClassName="w-full"
        disabled={disabled}
        placeholder={placeholder}
        loadingIcon={isLoading ? <ProgressSpinner style={{ width: '20px', height: '20px' }} /> : null}
        delay={300}
        minLength={1}
        scrollHeight="300px"
      />
    </div>
  );
};

export default EmployeeAutoSuggest; 