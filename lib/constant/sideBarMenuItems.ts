export const sideBarMenuItems = {
  // SUPERADMIN
  superAdmin: {
    // NONE SELECTED
    noneSelected: [
      {
        name: 'Dashboard',
        type: 'Button',
        url: '/dashboard',
      },
      {
        name: 'Companies',
        type: 'DropDown',
        items: [
          {
            name: 'Company Lists',
            type: 'Button',
            isDisabled: false,
            url: '/companies',
          },
          {
            name: 'Reports',
            type: 'Button',
            isDisabled: false,
            url: '/reports',
          },
          {
            name: 'Configurations',
            type: 'Button',
            isDisabled: false,
            url: '/configurations',
          },
        ],
      },
      {
        name: 'Announcements',
        type: 'Button',
        isDisabled: false,
        url: '/announcements',
      },
      {
        name: 'Account',
        type: 'Button',
        isDisabled: false,
        url: '/account',
      },
      {
        name: 'Users',
        type: 'Button',
        isDisabled: false,
        url: '/user',
      },
    ],

    // COMPANY SELECTED
    selected: [
      {
        name: 'Dashboard',
        type: 'Button',
        url: '/dashboard',
      },
      {
        name: 'Attendance',
        type: 'DropDown',
        items: [
          {
            name: 'Attendances',
            type: 'Button',
            isDisabled: false,
            url: '/attendance',
          },
          {
            name: 'Applications',
            type: 'Button',
            isDisabled: false,
            url: '/application',
          },
        ],
      },
      {
        name: 'Payroll',
        type: 'DropDown',
        items: [
          {
            name: 'Deductions',
            type: 'Button',
            isDisabled: false,
            url: '/deductions',
          },
          {
            name: 'Payrolls',
            type: 'Button',
            isDisabled: false,
            url: '/payroll',
          },
        ],
      },
      {
        name: 'Company',
        type: 'DropDown',
        items: [
          {
            name: 'Configurations',
            type: 'Button',
            isDisabled: false,
            url: '/configurations',
          },
          {
            name: 'Location',
            type: 'Button',
            isDisabled: false,
            url: '/location',
          },
          {
            name: 'Employees',
            type: 'Button',
            isDisabled: false,
            url: '/employeeManagement',
          },
          // {
          //   name: 'Announcements',
          //   type: 'Button',
          //   isDisabled: false,
          //   url: '/announcements',
          // },
          {
            name: 'Shifts',
            type: 'Button',
            isDisabled: false,
            url: '/shifts',
          },
          {
            name: 'Departments',
            type: 'Button',
            isDisabled: false,
            url: '/department',
          },
          {
            name: 'Holidays',
            type: 'Button',
            isDisabled: false,
            url: '/holidays',
          },
          {
            name: 'Reports',
            type: 'Button',
            isDisabled: false,
            url: '/reports',
          },
        ],
      },
      {
        name: 'Users',
        type: 'Button',
        isDisabled: false,
        url: '/user',
      },
    ],
  },

  // ADMIN
  admin: [
    {
      name: 'Dashboard',
      type: 'Button',
      isDisabled: false,
      url: '/dashboard',
    },
    {
      name: 'Attendance',
      type: 'DropDown',
      items: [
        {
          name: 'Attendances',
          type: 'Button',
          isDisabled: false,
          url: '/attendance',
        },
        {
          name: 'Applications',
          type: 'Button',
          isDisabled: false,
          url: '/application',
        },
        // {
        //   name: 'Submit Application',
        //   type: 'Button',
        //   isDisabled: false,
        //   url: '/applyLeaves',
        // },
      ],
    },
    {
      name: 'Payroll',
      type: 'DropDown',
      items: [
        {
          name: 'Payrolls',
          type: 'Button',
          isDisabled: false,
          url: '/payroll',
        },
        {
          name: 'Deductions',
          type: 'Button',
          isDisabled: false,
          url: '/deductions',
        },
      ],
    },
    {
      name: 'Company',
      type: 'DropDown',
      items: [
        {
          name: 'Configurations',
          type: 'Button',
          isDisabled: false,
          url: '/configurations',
        },
        {
          name: 'Location',
          type: 'Button',
          isDisabled: false,
          url: '/location',
        },
        {
          name: 'Announcements',
          type: 'Button',
          isDisabled: false,
          url: '/announcements',
        },
        {
          name: 'Employees',
          type: 'Button',
          isDisabled: false,
          url: '/employeeManagement',
        },
        {
          name: 'Shifts',
          type: 'Button',
          isDisabled: false,
          url: '/shifts',
        },
        {
          name: 'Departments',
          type: 'Button',
          isDisabled: false,
          url: '/department',
        },
        {
          name: 'Holidays',
          type: 'Button',
          isDisabled: false,
          url: '/holidays',
        },
        {
          name: 'Reports',
          type: 'Button',
          isDisabled: false,
          url: '/reports',
        },
      ],
    },
    {
      name: 'Transactions',
      type: 'DropDown',
      items: [
        {
          name: 'Cash In',
          type: 'Button',
          isDisabled: false,
          url: '/cash-in',
        },
        // {
        //   name: 'Loan Payments',
        //   type: 'Button',
        //   isDisabled: false,
        //   url: '/loan-payments',
        // },
      ],
    },
    {
      name: 'Users',
      type: 'Button',
      isDisabled: false,
      url: '/user',
    },
    {
      name: 'Account',
      type: 'Button',
      isDisabled: false,
      url: '/account',
    },
  ],

  // EMPLOYEE
  employee: [
    {
      name: 'Dashboard',
      type: 'Button',
      url: '/dashboard',
      isDisabled: false,
    },
    {
      name: 'Attendance',
      type: 'DropDown',
      items: [
        {
          name: 'Attendance',
          type: 'Button',
          isDisabled: false,
          url: '/attendance',
        },
        {
          name: 'Applications',
          type: 'Button',
          isDisabled: false,
          url: '/application',
        },
      ],
    },
    {
      name: 'Payroll',
      type: 'Button',
      isDisabled: false,
      url: '/payroll',
    },
    {
      name: 'Account',
      type: 'Button',
      isDisabled: false,
      url: '/account',
    },
  ],
};
