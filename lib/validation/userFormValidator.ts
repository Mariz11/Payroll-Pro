import * as yup from 'yup';

const UserFormValidator = yup.object({
  firstName: yup
    .string()
    .required('First name is required')
    .matches(
      /^[a-zA-Z0-9Ññ ]*$/,
      'First name cannot contain special characters.'
    ),
  middleName: yup
    .string()
    .optional()
    .matches(
      /^[a-zA-Z0-9Ññ ]*$/,
      'Middle name cannot contain special characters.'
    ),
  lastName: yup
    .string()
    .required('Last name is required')
    .matches(
      /^[a-zA-Z0-9Ññ ]*$/,
      'Last name cannot contain special characters.'
    ),
  suffix: yup
    .string()
    .optional()
    .matches(/^[a-zA-Z0-9Ññ ]*$/, 'Suffix cannot contain special characters.'),
  birthDate: yup.string().required('Birth date is required'),
  contactNumber: yup.string().required('Contact number is required'),
  emailAddress: yup
    .string()
    .email('Enter a valid email')
    .required('Email address is required'),
  password: yup.string(),
  role: yup.number().required('Role is required'),
});

export { UserFormValidator };
