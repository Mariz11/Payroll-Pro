import { useState, useEffect, useCallback } from "react";
import { InputText } from "primereact/inputtext";
import { debounce } from "lodash";

interface DebouncedInputProps {
  placeholder: string;
  value?: string;
  onChange?: (value: string) => void;
  debounceTime?: number;
}

const DebouncedInput: React.FC<DebouncedInputProps> = ({ placeholder, value = "", onChange, debounceTime = 300 }) => {
  const [localValue, setLocalValue] = useState<string>(value);

  const debouncedOnChange = useCallback(
    debounce((newValue: string) => {
      if (onChange) {
        onChange(newValue);
      }
    }, debounceTime),
    [onChange, debounceTime]
  );

  useEffect(() => {
    debouncedOnChange(localValue);
    return () => debouncedOnChange.cancel(); 
  }, [localValue, debouncedOnChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value); 
  };

  return <InputText placeholder={placeholder} value={localValue} onChange={handleChange} />;
};

export default DebouncedInput;
