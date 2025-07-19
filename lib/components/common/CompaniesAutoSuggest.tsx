import axios from 'axios';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { AutoComplete } from 'primereact/autocomplete';
import { ProgressSpinner } from 'primereact/progressspinner';

interface CompaniesAutoSuggestProps {
  value: any;
  onChange: (value: any) => void;
  onBlur?: () => void;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  error?: boolean;
  excludeCurrentCompany?: boolean;
}

const CompaniesAutoSuggest: React.FC<CompaniesAutoSuggestProps> = ({
  value,
  onChange,
  onBlur,
  className,
  disabled = false,
  placeholder = 'Search company...',
  error = false,
  excludeCurrentCompany = false,
}) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleQuery = async (query?: string, companyId?: string | number) => {
    setIsLoading(true);
    let url = `/api/dropdown-options/companies?search=${query || ''}&limit=10`;

    if (excludeCurrentCompany) {
      url += '&excludeCurrentCompany=true';
    }

    if (companyId) {
      url += `&companyId=${companyId}`;
    }

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
      },
    });

    setSuggestions(response.data.options);
    return response.data.options;
  };

  useEffect(() => {
    const fetchData = async () => {
      if (value) {
        const res = await handleQuery(undefined, value);
        const selectedCompany = res.find(
          (company: any) => company.value === value
        );
        if (selectedCompany) {
          setInputValue(selectedCompany.name);
        }
      } else {
        setInputValue('');
      }
    };
    fetchData();
  }, [value]);

  const search = useCallback(
    debounce(async (event: { query: string }) => {
      const { query } = event;
      if (!query.trim()) {
        setSuggestions([]);
        return;
      }

      try {
        await handleQuery(query);
      } catch (error) {
        console.error('Error fetching companies:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [excludeCurrentCompany]
  );

  const handleChange = (e: any) => {
    const selectedValue = e.value;
    if (typeof selectedValue === 'string') {
      // This is an input change
      setInputValue(selectedValue);
    } else {
      // This is a selection
      setInputValue(selectedValue?.name || '');
      onChange(selectedValue?.value);
    }
  };

  const itemTemplate = (item: any) => {
    return (
      <div className="flex items-center gap-3">
        <span>{item.name}</span>
      </div>
    );
  };

  return (
    <div className="relative w-full">
      <AutoComplete
        value={inputValue}
        suggestions={suggestions}
        completeMethod={search}
        field="name"
        onChange={handleChange}
        onBlur={onBlur}
        itemTemplate={itemTemplate}
        className={`w-full ${className} ${error ? 'p-invalid' : ''}`}
        inputClassName="w-full"
        disabled={disabled}
        placeholder={placeholder}
        loadingIcon={
          isLoading ? (
            <ProgressSpinner style={{ width: '20px', height: '20px' }} />
          ) : null
        }
        delay={300}
        minLength={1}
        scrollHeight="300px"
      />
    </div>
  );
};

export default CompaniesAutoSuggest;
