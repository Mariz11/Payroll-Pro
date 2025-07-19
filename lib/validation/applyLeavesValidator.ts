import * as yup from 'yup';

const ApplyLeavesValidator = yup.object({
  requestedDate: yup.date().required('Requested date is required'),
  fromDate: yup.string(),
  toDate: yup.string(),
  type: yup.object({
    name: yup.string().required('Type is required'),
  }),
  reason: yup.string().required('Reason is required'),
  assignEmployee: yup.object({
    name: yup.string(),
    id: yup.number(),
    companyId: yup.number(),
    userId: yup.number(),
  }),
});

const ApplicationLeaveSecondaryValidator = yup.object({
  ApplyLeavesValidator,
  employeeName: yup.string(),
});

export { ApplyLeavesValidator, ApplicationLeaveSecondaryValidator };
