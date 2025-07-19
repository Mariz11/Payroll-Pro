import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { NextRequest, NextResponse } from 'next/server';

import { MCASH_MLWALLET } from '@constant/variables';
import { hasHtmlTags, hasSQLKeywords } from '@utils/helper';
import {
  ActivityLog,
  Attendance,
  Batch_uploads,
  Deduction,
  Department,
  Employee,
  EmployeeProfile,
  Holiday,
  Payroll,
  PayrollDeductions,
  Transactions,
  PayrollAdjustments,
} from 'db/models';
import payrollAdjustments from 'db/models/payrollAdjustments';
import moment from '@constant/momentTZ';
import { Op, QueryTypes } from 'sequelize';
import connection, { executeQuery } from 'db/connection';
import { createActivityLog } from '@utils/activityLogs';

export async function POST(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('Authorization');

  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const {
      offset,
      limit,
      businessMonth,
      cycle,
      companyId,
      departmentId,
      isDirect,
      disbursementSchedule,
      isPosted,
      search,
      disbursementStatus,
      tableFor,
    } = await req.json();
    let matchingBatchUploads: any = null;
    let matchingTransactions: any = null;
    const findMatchingBatchUploads = async () => {
      matchingBatchUploads = await Batch_uploads.findAll({
        where: {
          batchNumber: {
            [Op.startsWith]: `%${search}%`,
          },
          businessMonth: businessMonth,
          cycle: cycle,
          companyId: companyId,
        },
        attributes: ['batchNumber'],
        include: [
          {
            limit: 1,
            model: Payroll,
            attributes: ['payroll_id'],
            where: {
              departmentId: departmentId,
            },
            required: true,
          },
        ],
      });
    };
    const findMatchingTransactions = async () => {
      matchingTransactions = await Transactions.findAll({
        where: {
          transactionCode: {
            [Op.startsWith]: `%${search}%`,
          },
          businessMonth: businessMonth,
          cycle: cycle,
          companyId: companyId,
        },
        attributes: ['transactionCode'],
        include: [
          {
            limit: 1,
            model: Payroll,
            attributes: ['payroll_id'],
            where: {
              departmentId: departmentId,
            },
            required: true,
          },
        ],
      });
    };
    await Promise.allSettled([
      findMatchingBatchUploads(),
      findMatchingTransactions(),
    ]);

    let matchingBatchUploadIds = matchingBatchUploads
      ? matchingBatchUploads.map((i: any) => i.batchUploadId)
      : [];
    // clean memory for matchingBatchUploads to save on ram
    matchingBatchUploads = null;
    let matchingTransactionIds = matchingTransactions
      ? matchingTransactions.map((i: any) => i.transferId)
      : [];
    // clean memory for matchingBatchUploads to save on ram
    matchingTransactions = null;
    let dynamicWhere: any = {
      companyId: companyId,
      businessMonth: businessMonth,
      departmentId: departmentId,
      cycle: cycle,
      [Op.or]: {
        '$employee.employee_profile.firstName$': {
          [Op.startsWith]: `%${search}%`,
        },
        '$employee.employee_profile.lastName$': {
          [Op.startsWith]: `%${search}%`,
        },
        batchUploadId: {
          [Op.in]: matchingBatchUploadIds,
        },
        transferTransactionId: {
          [Op.in]: matchingTransactionIds,
        },
        disbursementCode: {
          [Op.startsWith]: `%${search}%`,
        },
        modeOfPayroll:
          search &&
            MCASH_MLWALLET.filter((i) => i.includes(search.toUpperCase())).length
            ? {
              [Op.in]: MCASH_MLWALLET,
            }
            : {
              [Op.startsWith]: `%${search}%`,
            },
      },
      isDirect: isDirect,
      isPosted: isPosted,
      // disbursementSchedule:
      //   disbursementSchedule == null ? null : disbursementSchedule,
    };
    // add condition for posted and not failed
    if (tableFor == 'POSTED') {
      dynamicWhere[Op.and] = {};
      dynamicWhere[Op.and][Op.or] = {
        disbursementStatus: {
          [Op.not]: 2,
        },
      };
      dynamicWhere[Op.and][Op.or][Op.and] = {};
      dynamicWhere[Op.and][Op.or][Op.and] = {
        disbursementStatus: 2,
        // statusCode: 'CUSTOMER_NOT_EMPLOYEE_ERROR',
        createdAt: {
          [Op.lt]: moment('January 21, 2025').format('YYYY-MM-DD HH:mm:ss'),
        },
      };
    }
    // add condition for fail
    else if (tableFor == 'FAILED') {
      dynamicWhere.disbursementStatus = 2;
      // dynamicWhere.statusCode = {
      //   [Op.or]: { [Op.ne]: 'CUSTOMER_NOT_EMPLOYEE_ERROR', [Op.eq]: null },
      // };
      dynamicWhere.createdAt = {
        [Op.gte]: moment('January 21, 2025').format('YYYY-MM-DD HH:mm:ss'),
      };
    }

    const data = await Payroll.findAndCountAll({
      where: dynamicWhere,
      include: [
        {
          model: PayrollAdjustments,
          attributes: {
            exclude: ['createdAt', 'deletedAt', 'updatedAt', 'payroll_id'],
          },
        },
        {
          attributes: ['employeeId', 'employmentStatus', 'employmentStatus'],
          model: Employee,
          required: true,
          include: [
            {
              attributes: [
                'employeeProfileId',
                'firstName',
                'lastName',
                'middleName',
                'suffix',
                'employeeFullName',
              ],
              model: EmployeeProfile,
              required: true,
              paranoid: false,
            },
            {
              attributes: [
                'date',
                'isPresent',
                'isDayOff',
                'isLeave',
                'isHalfDay',
                'overtimeHours',
              ],
              model: Attendance,
              where: {
                businessMonth: businessMonth,
                cycle: cycle,
                companyId: companyId,
                departmentId: departmentId,
              },
              include: [
                {
                  attributes: ['holidayType'],
                  model: Holiday,
                },
              ],

              required: isDirect ? false : true,
            },
          ],
          paranoid: false,
        },
        {
          model: Department,
          paranoid: false,
        },
        {
          model: Batch_uploads,
          required: false,
        },
        {
          attributes: ['transactionCode'],
          model: Transactions,
          required: false,
        },
      ],
      offset: offset,
      limit: limit,
      distinct: true,
      order: [['payroll_id', 'ASC']],
    });

    if (data.rows.length > 0) {
      for (let i = 0; i < data.rows.length; i++) {
        const payroll: any = data.rows[i];

        const payroll_deductions: any = await PayrollDeductions.findAll({
          where: {
            payroll_id: payroll.payroll_id,
          },
          include: [
            {
              model: Deduction,
            },
          ],
        });

        data.rows[i].dataValues.payroll_deductions = payroll_deductions;
      }
    }
    return NextResponse.json(data);
  } catch (error) {
    console.log(error);
    return NextResponse.json('Something went wrong...');
  }
}

export async function PUT(req: Request, res: Response) {
  const userToken: any = req.headers.get('authorization');

  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const transaction = await connection.transaction();
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  try {
    const payload = await req.json();
    const {
      payroll_id,
      newTotalDeduction,
      newNetPay,
      addAdjustment,
      deductAdjustment,
      remarks,
      deductionsData,
      shortDescription,
      adjustmentData,
    } = payload;
    let updatedPayrollAdjustmentsIds: number[] = [];
    if (hasHtmlTags(shortDescription) || hasHtmlTags(remarks)) {
      await transaction.rollback();
      return NextResponse.json(
        { success: false, message: 'Input/s contain/s possible script tags' },
        { status: 400 }
      );
    }
    if (hasSQLKeywords(shortDescription) || hasSQLKeywords(remarks)) {
      await transaction.rollback();
      return NextResponse.json(
        { success: false, message: 'Input/s contain/s possible SQL keywords' },
        { status: 400 }
      );
    }
    // traverse through adjustment Data
    for (const item of adjustmentData) {
      if (item.payrollAdjustmentsId !== null) {

        await executeQuery(`payroll_adjustments_update`, {
          p_payrollAdjustmentsId: item.payrollAdjustmentsId,
          p_addAdjustment: item.addAdjustment == null ? 0 : item.addAdjustment,
          p_deductAdjustment: item.deductAdjustment == null ? 0 : item.deductAdjustment,
          p_desc: item.desc
        }, [], QueryTypes.UPDATE, transaction as any);
        // List all payrolls that were not deleted or that are remaining
        updatedPayrollAdjustmentsIds.push(item.payrollAdjustmentsId);
      }
    }
    // console.log(updatedPayrollAdjustmentsIds);
    const excludedIdsJson = updatedPayrollAdjustmentsIds.join(',');
    await executeQuery(`payroll_adjustments_soft_delete`, {
      p_payrollId: payroll_id,
      p_excludedIds: excludedIdsJson
    }, [], QueryTypes.UPDATE, transaction as any);

    adjustmentData.forEach(async (item: any) => {
      if (item.payrollAdjustmentsId === null) {

        await executeQuery(`payroll_adjustments_insert`, {
          p_payrollId: payroll_id,
          p_addAdjustment: item.addAdjustment == null ? 0 : item.addAdjustment,
          p_deductAdjustment: item.deductAdjustment == null ? 0 : item.deductAdjustment,
          p_desc: item.desc
        }, [], QueryTypes.INSERT, transaction as any);
      }
    });

    let addAdjustmentFormatted: number =
      !addAdjustment || addAdjustment === '' ? 0 : addAdjustment;
    let deductAdjustmentFormatted: number =
      !deductAdjustment || deductAdjustment === '' ? 0 : deductAdjustment;

    await executeQuery(`payroll_update_adjustments`, {
      p_payroll_id: payroll_id,
      p_total_deduction: newTotalDeduction,
      p_net_pay: newNetPay,
      p_add_adjustment: addAdjustmentFormatted,
      p_deduct_adjustment: deductAdjustmentFormatted,
      p_remarks: remarks
    }, [], QueryTypes.UPDATE, transaction as any);

    if (deductionsData.length > 0) {
      for (let i = 0; i < deductionsData.length; i++) {

        await executeQuery(`payroll_deductions_update`,
          {
            p_payrollDeductionId: deductionsData[i].payrollDeductionId,
            p_amountPaid: deductionsData[i].amountPaid,
            p_isDeferred: deductionsData[i].isDeferred,
            p_isCollected: null,
            p_employeeId: null,
            p_excludePayrollId: null
          }, [], QueryTypes.UPDATE, transaction as any);
      }
    }

    await createActivityLog(companyId, seshData.userId, `Updated Payroll`, transaction);

    await transaction.commit();

    return NextResponse.json({
      severity: 'success',
      success: true,
      message: 'Successfully Updated',
    });
  } catch (error: any) {
    await transaction.rollback();
    if (error.name && error.name === 'SequelizeDatabaseError')
      console.log(error);
    else
      return NextResponse.json({
        severity: 'error',
        success: false,
        error: error,
        message: 'Something went wrong...',
      });
  }
}
