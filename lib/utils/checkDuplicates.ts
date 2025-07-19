'use server';

import {
  Company,
  Department,
  Employee,
  EmployeeProfile,
  Holiday,
  Shift,
  User,
  UserRole,
} from 'db/models';
import { Op, Sequelize } from 'sequelize';
import { selectedCompanyData, sessionData } from './jwt';

export async function checkDuplicateEmail({
  emailAddress,
  userId,
}: {
  emailAddress: string;
  userId: string | null;
}) {
  try {
    const where: any = {
      emailAddress: emailAddress.trim().toLowerCase(),
    };

    if (userId) {
      where.userId = {
        [Op.not]: userId,
      };
    }

    const duplicateEntry = await User.findOne({
      where: where,
    });

    return duplicateEntry ? 1 : 0;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function checkDuplicateContactNum({
  contactNumber,
  userId,
}: {
  contactNumber: string;
  userId: string | null;
}) {
  try {
    const where: any = {
      contactNumber: contactNumber.trim(),
    };

    if (userId) {
      where.userId = {
        [Op.not]: userId,
      };
    }

    const duplicateEntry = await User.findOne({
      where: where,
    });

    return duplicateEntry ? 1 : 0;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function checkDuplicateCompanyName({
  companyName,
  companyId,
}: {
  companyName: string;
  companyId: string | null;
}) {
  try {
    const where: any = {
      companyName: companyName.trim(),
    };

    if (companyId) {
      where.companyId = {
        [Op.not]: companyId,
      };
    }

    const duplicateEntry = await Company.findOne({
      where: where,
    });

    return duplicateEntry ? 1 : 0;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function checkDuplicateEmailEmployee({
  emailAddress,
  employeeId,
}: {
  emailAddress: string;
  employeeId: string | null;
}) {
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  try {
    const where: any = {
      emailAddress: emailAddress.trim().toLowerCase(),
    };

    if (employeeId) {
      where.employeeId = {
        [Op.not]: employeeId,
      };
    }

    let duplicateEntry: any = await EmployeeProfile.findOne({
      where: where,
      include: [
        {
          model: Employee,
          where: {
            deletedAt: null,
          },
        },
      ],
    });

    if (!duplicateEntry) {
      const user: any = await User.findOne({
        where: where,
      });

      if (user) {
        if (user.companyId == companyId) {
          if (user.employeeId) {
            duplicateEntry = true;
          }
        } else {
          duplicateEntry = true;
        }
      }
    }

    return duplicateEntry ? 1 : 0;
  } catch (error) {
    console.log(error);
    return null;
  }
}
export async function checkDuplicateContactNumEmployee({
  contactNumber,
  employeeId,
}: {
  contactNumber: string;
  employeeId: string | null;
}) {
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  try {
    contactNumber = contactNumber.trim();
    if (contactNumber.charAt(0) != '0') contactNumber = `0${contactNumber}`;

    const where: any = {
      contactNumber: contactNumber,
    };

    if (employeeId) {
      where.employeeId = {
        [Op.not]: employeeId,
      };
    }

    let duplicateEntry: any = await EmployeeProfile.findOne({
      where: where,
      include: [
        {
          model: Employee,
          where: {
            deletedAt: null,
          },
        },
      ],
    });

    if (!duplicateEntry) {
      const user: any = await User.findOne({
        where: where,
      });

      if (user) {
        if (user.companyId == companyId) {
          if (user.employeeId) {
            duplicateEntry = true;
          }
        } else {
          duplicateEntry = true;
        }
      }
    }

    return duplicateEntry ? 1 : 0;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function checkDuplicateEmployeeCode({
  employeeCode,
  employeeId,
}: {
  employeeCode: string;
  employeeId: string | null;
}) {
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  try {
    const where: any = {
      employeeCode: employeeCode.toUpperCase().trim(),
      companyId: companyId,
    };

    if (employeeId) {
      where.employeeId = {
        [Op.not]: employeeId,
      };
    }

    const duplicateEntry = await Employee.findOne({
      where: where,
    });

    return duplicateEntry ? 1 : 0;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function checkDuplicateHolidayName({
  companyId,
  holidayId,
  holidayName,
}: {
  companyId: number;
  holidayId: string | null;
  holidayName: string;
}) {
  try {
    const formattedHolidayName = holidayName.trim().toLowerCase();

    const duplicateEntry = await Holiday.findOne({
      where: {
        companyId: companyId,
        holidayId: {
          [Op.not]: holidayId,
        },
        [Op.and]: [
          Sequelize.where(
            Sequelize.fn('lower', Sequelize.col('holidayName')),
            '=',
            formattedHolidayName
          ),
        ],
      },
    });

    return duplicateEntry ? 1 : 0;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function checkDuplicateHolidayDate({
  companyId,
  holidayId,
  holidayDate,
}: {
  companyId: number;
  holidayId: string | null;
  holidayDate: any;
}) {
  try {
    const duplicateEntry = await Holiday.findOne({
      where: {
        companyId: companyId,
        holidayId: {
          [Op.not]: holidayId,
        },
        holidayDate: holidayDate,
      },
    });

    return duplicateEntry ? 1 : 0;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function checkDuplicateDepartmentName({
  companyId,
  departmentId,
  departmentName,
}: {
  companyId: number;
  departmentId: string | null;
  departmentName: string;
}) {
  try {
    const formattedDepartmentName = departmentName.trim().toLowerCase();

    const duplicateEntry = await Department.findOne({
      where: {
        companyId: companyId,
        departmentId: {
          [Op.not]: departmentId,
        },
        [Op.and]: [
          Sequelize.where(
            Sequelize.fn(
              'lower',
              Sequelize.fn('trim', Sequelize.col('departmentName'))
            ),
            '=',
            formattedDepartmentName
          ),
        ],
      },
    });

    return duplicateEntry ? 1 : 0;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function checkDuplicateShiftName({
  companyId,
  shiftId,
  shiftName,
}: {
  companyId: number;
  shiftId: string | null;
  shiftName: string;
}) {
  try {
    const formattedShiftName = shiftName.trim().toLowerCase();

    const duplicateEntry = await Shift.findOne({
      where: {
        companyId: companyId,
        shiftId: {
          [Op.not]: shiftId,
        },
        [Op.and]: [
          Sequelize.where(
            Sequelize.fn(
              'lower',
              Sequelize.fn('trim', Sequelize.col('shiftName'))
            ),
            '=',
            formattedShiftName
          ),
        ],
      },
    });

    return duplicateEntry ? 1 : 0;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function checkDuplicateRoleName({
  companyId,
  roleName,
}: {
  companyId: number;
  roleName: string;
}) {
  try {
    const formattedRoleName = roleName.trim().toLowerCase();

    const duplicateEntry = await UserRole.findOne({
      where: {
        companyId: companyId,
        roleName: formattedRoleName,
      },
    });

    return duplicateEntry ? 1 : 0;
  } catch (error) {
    console.log(error);
    return null;
  }
}
