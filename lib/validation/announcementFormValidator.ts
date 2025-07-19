import * as yup from 'yup';

type department = {
  departmentName: string;
  departmentId: number;
};
const AnnouncementFormValidator = yup.object().shape({
  title: yup.string().required('Title is required'),
  // content: yup.string().required('Content is required'),
  content: yup
    .string()
    .required('Content is required')
    .min(2, 'Content is required'),
  order: yup
    .number()
    .positive('Order is required')
    .integer('Order is required')
    .required('Order is required'),
  departments: yup
    .array()
    .of(yup.mixed().nullable())
    .required()
    .min(1, 'Recipient is required'),
});

export { AnnouncementFormValidator };
