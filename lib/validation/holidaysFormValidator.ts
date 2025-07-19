import * as yup from 'yup';

const HolidaysFormValidator = yup.object({
  holidayName: yup.string().required('Holiday name is required'),
  holidayDate: yup.string().required('Holiday date is required'),
  holidayType: yup.string().required('Holiday Type is required'),
});

export { HolidaysFormValidator };
