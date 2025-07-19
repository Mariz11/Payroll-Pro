import * as yup from 'yup';

const DeductionsFormValidator = yup.object({
  deductionData: yup.object().optional(),
  totalAmountPaid: yup.number(),
  deductionType: yup.object({
    name: yup.string().required('Deduction type is required'),
  }),
  deductionId: yup.number().nullable().default(null),
  assignEmployee: yup.object({
    name: yup.string().required('Employee is required'),
    id: yup.number().required('Employee is required'),
    companyId: yup.number().required('Employee is required'),
    userId: yup.number().required('Employee is required'),
    departmentId: yup.number(),
    payrollType: yup.string(),
  }),
  accountNumberEmployee: yup.string().optional().nullable(),
  accountNumberEmployer: yup.string().optional().nullable(),
  totalAmmount: yup.number().required('Total ammount is required'),
  timePeriodDeduction: yup.object({
    name: yup.string().required('Time period is required'),
  }),
  paymentCycles: yup.number().optional().nullable(),
  remarks: yup.string().optional().nullable(),
  cycleChosen: yup.string(),
});

export { DeductionsFormValidator };
