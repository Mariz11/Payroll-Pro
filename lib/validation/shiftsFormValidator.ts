import * as yup from 'yup';

const ShiftsFormValidator = yup.object({
  shiftName: yup.string().required('Shift name is required'),
  timeIn: yup.string().required('Time In is required'),
  timeOut: yup.string().required('Time Out is required'),
  lunchStart: yup.string().required('Lunch Start is required'),
  lunchEnd: yup.string().required('Lunch Out is required'),
  selectedDepartment: yup.string().nullable(),
  selectedEmployees: yup.array().nullable(),
});

export { ShiftsFormValidator };
