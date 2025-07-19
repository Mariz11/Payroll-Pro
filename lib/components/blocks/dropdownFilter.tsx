import React, { useState, useRef, useEffect } from 'react';

interface DropDownFilterProps {
  label: string;
  options: { label: string; value: string }[];
  searchValue: string; // New prop for search input value
  onSearchChange: (value: string) => void; // New prop for handling search input changes
  onSelect: (value: string) => void;
}

const DropDownFilter: React.FC<DropDownFilterProps> = ({
  label,
  options,
  searchValue,
  onSearchChange,
  onSelect,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchValue.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        className="flex items-center gap-2 p-2"
        onClick={() => setIsVisible(!isVisible)}
      >
        <span>{label}</span>
        <i className={`pi ${isVisible ? 'pi-chevron-up' : 'pi-chevron-down'}`} />
      </button>
      {isVisible && (
        <div className="absolute bg-white border rounded shadow-md mt-2 z-10 w-64">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-full p-2 pr-10 border-b focus:outline-none"
              value={searchValue} 
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {searchValue ? (
              <i
                className="pi pi-times absolute right-3 top-3 text-gray-400 cursor-pointer"
                onClick={() => onSearchChange('')} 
              ></i>
            ) : (
              <i className="pi pi-search absolute right-3 top-3 text-gray-400"></i>
            )}
          </div>
          <ul className="p-2 max-h-96 overflow-y-auto">
            {filteredOptions.map((option) => (
              <li
                key={option.value}
                className="cursor-pointer hover:bg-gray-200 p-2 text-sm text-gray-700"
                onClick={() => {
                  onSelect(option.value);
                  setIsVisible(false);
                }}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DropDownFilter;