import { employeeImportHeaders } from '@constant/csvData';

export function checkNullRequiredProperties(payload: EmployeeImportDetails) {
  employeeImportHeaders.unshift({
    label: '*Task Code',
    key: 'taskCode',
    required: true,
  });
  const checkData = employeeImportHeaders.filter((header) => {
    if (header.required) {
      let { key } = header;
      if (key === 'roleId') {
        key = 'role';
      }
      if (key === 'cityId') {
        key = 'city';
      }
      if (key === 'provinceId') {
        key = 'province';
      }
      if (key === 'countryId') {
        key = 'country';
      }
      return payload[key as keyof EmployeeImportDetails] == null;
    }
    return false;
  });

  if (checkData.length > 0) {
    return {
      success: false,
      message: `The ff properties cannot be null [${checkData
        .map((header) => {
          if (header.key === 'cityId') {
            header.key = 'city';
          }
          if (header.key === 'provinceId') {
            header.key = 'province';
          }
          if (header.key === 'countryId') {
            header.key = 'country';
          }
          return header.key;
        })
        .join(', ')}]`,
    };
  }
  return {
    success: true,
  };
}
