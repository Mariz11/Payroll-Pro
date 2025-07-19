import { NextRequest, NextResponse } from 'next/server';

import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { PayrollDeductions, TransferToEmployee } from 'db/models';
import activityLog from 'db/models/activityLog';
import {
  Company,
  Deduction,
  Department,
  Employee,
  EmployeeProfile,
  Ledger,
} from 'db/models/index';

import {
  deductionTypeOptions,
  hasHtmlTags,
  hasSQLKeywords,
  isNumber,
  uuidv4,
} from '@utils/helper';
import { checkCompanyWalletBalance, disburseSalary } from '@utils/partnerAPIs';
import { Op } from 'sequelize';

import { batchNumberGenerator } from '@utils/mainFunctions';
import { DISBURSEMENT_SUB_TYPES } from '@constant/variables';

export async function GET(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  else {
    try {
      const seshData: any = await sessionData();
      const selectedCompData: any = await selectedCompanyData();
      const companyId = selectedCompData
        ? selectedCompData.companyId
        : seshData.companyId;

      const url = new URL(req.url);
      const offset = Number(url.searchParams.get('offset'));
      const limit = Number(url.searchParams.get('limit'));
      const search = url.searchParams.get('search');

      const deductionList = await Deduction.findAndCountAll({
        where: {
          companyId: companyId,
          [Op.or]: {
            deductionType: {
              [Op.startsWith]: `%${search}%`,
            },
            deductionPeriod: {
              [Op.startsWith]: `%${search}%`,
            },
            totalAmount: {
              [Op.startsWith]: `%${
                !search ? search : search.replaceAll(',', '')
              }%`,
            },
            perCycleDeduction: {
              [Op.startsWith]: `%${
                !search ? search : search.replaceAll(',', '')
              }%`,
            },
            amountPaid: {
              [Op.startsWith]: `%${
                !search ? search : search.replaceAll(',', '')
              }%`,
            },
            referenceNumber: {
              [Op.startsWith]: `%${search}%`,
            },
            cycleChosen: {
              [Op.startsWith]: `%${search}%`,
            },
            '$employee.employee_profile.lastName$': {
              [Op.startsWith]: `%${search}%`,
            },
            '$employee.employee_profile.firstName$': {
              [Op.startsWith]: `%${search}%`,
            },
            '$employee.employee_profile.middleName$': {
              [Op.startsWith]: `%${search}%`,
            },
            '$employee.employee_profile.suffix$': {
              [Op.startsWith]: `%${search}%`,
            },
            '$transfer_to_employee_acct_transaction.disbursementCode$': {
              [Op.startsWith]: `%${search}%`,
            },
            '$transfer_to_employee_acct_transaction.batchNumber$': {
              [Op.startsWith]: `%${search}%`,
            },
          },
        },
        include: [
          {
            model: Employee,
            include: [
              {
                model: EmployeeProfile,
              },
              {
                model: Department,
                attributes: ['payrollTypeId'],
              },
            ],
            paranoid: false,
          },
          {
            model: TransferToEmployee,
          },
          // {
          //   model: TransferToEmployee,
          // },
        ],
        offset: offset,
        limit: limit,
        distinct: true,
        order: [['createdAt', 'DESC']],
      });
      return NextResponse.json(deductionList);
    } catch (error: any) {
      if (error.name && error.name === 'SequelizeDatabaseError')
        console.log(error);
      else return NextResponse.json(error, { status: 500 });
    }
  }
}

export async function PATCH(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;
  const companyDetails: any = await Company.findByPk(companyId);
  const companyAccountId = companyDetails.accountId;
  const companyName = companyDetails.companyName;

  const { deductionId, userId, postAction } = await req.json();

  if (!isNumber(userId) || !isNumber(deductionId)) {
    return NextResponse.json({
      success: false,
      message: `Invalid values for Id's`,
      status: 400,
    });
  }
  if (postAction) {
    try {
      // Get deduction details by deductionId from front-end
      const getDeduction: any = await Deduction.findOne({
        include: [
          {
            attributes: [
              'ckycId',
              'mlWalletStatus',
              'employeeStatus',
              'modeOfPayroll',
            ],
            model: Employee,
            include: [
              {
                attributes: [
                  'firstName',
                  'middleName',
                  'lastName',
                  'emailAddress',
                ],
                model: EmployeeProfile,
              },
            ],
          },
        ],
        where: {
          deductionId: deductionId,
        },
      });

      // If deduction type is CASH ADVANCE, disburse the money to either MCASH or KWARTA PADALA
      const { employeeId, deductionType, totalAmount, employee } = getDeduction;
      const {
        ckycId,
        mlWalletStatus,
        employeeStatus,
        modeOfPayroll,
        employee_profile,
      } = employee;
      const {
        firstName,
        middleName,
        lastName,
        emailAddress,
        contactNumber,
        employeeFullName,
      } = employee_profile;
      if (deductionType.toUpperCase() == 'CASH ADVANCE') {
        // Check Company Main Account Balance
        const checkBalance = await checkCompanyWalletBalance({
          companyAccountId: companyAccountId,
          balanceToCheck: totalAmount,
        });
        // Abort if INSUFFICIENT BALANCE
        if (!checkBalance.success) {
          return NextResponse.json({
            severity: 'error',
            insufficient: true,
            message: checkBalance.message,
          });
        }

        const batchNumber = await batchNumberGenerator({
          companyName: companyName,
        });

        const disbursement = await disburseSalary({
          nonce: uuidv4(),
          transactionSubtype: DISBURSEMENT_SUB_TYPES.CASH_ADVANCE,
          timestamp: new Date().getTime(),
          companyAccountId: companyAccountId,
          ckycId: ckycId,
          batchNumber: batchNumber,
          netSalary: totalAmount,
          operator: {
            id: seshData.emailAddress,
            name: seshData.emailAddress,
          },
          modeOfPayroll: modeOfPayroll.toUpperCase(),
        });

        let disbursementCode = null;
        let disbursementStatus = 0;
        if (disbursement.success) {
          disbursementStatus = 1;
          disbursementCode = disbursement.responseData.transactionCode;
          // // Send Verification code via Email
          // sendEmail({
          //   to: emailAddress,
          //   subject: `Cash Advance [${disbursementCode}]`,
          //   content: `Hello ${employeeFullName}, your Cash Advance request with transaction code [${disbursementCode}] amounting PHP ${amountFormatter(
          //     totalAmount
          //   )} has been approved. You can now claim it at any MLhuillier branch that is closest to you. For more information, you may contact: ${
          //     companyDetails.emailAddress
          //   }/${companyDetails.contactNumber}. Thank you!`,
          // });
          // // Send Verification code via SMS
          // sendSMS({
          //   recepientNo: contactNumber,
          //   content: `Hello ${employeeFullName}, your Cash Advance request with transaction code [${disbursementCode}] amounting PHP ${amountFormatter(
          //     totalAmount
          //   )} has been approved. You can now claim it at any MLhuillier branch that is closest to you. For more information, you may contact: ${
          //     companyDetails.emailAddress
          //   }/${companyDetails.contactNumber}. Thank you!`,
          //   sender: 'MLHUILLIER',
          // });
        } else {
          disbursementStatus = 2;
        }

        await TransferToEmployee.create({
          employeeId: employeeId,
          companyId: companyId,
          deductionId: deductionId,
          transactionName: deductionType,
          batchNumber: batchNumber,
          disbursedAmount: totalAmount,
          type: modeOfPayroll.toUpperCase(),
          disbursementCode: disbursementCode,
          disbursementStatus: disbursementStatus,
        });
      }

      await Deduction.update(
        { isPosted: true },
        {
          where: {
            deductionId: deductionId,
          },
        }
      );

      await activityLog.create({
        companyId: companyId,
        userId: userId,
        message: 'Posted a deduction',
      });

      return NextResponse.json({
        message: 'Deduction Posted successfully',
        status: 200,
      });
    } catch (error: any) {
      if (error.name && error.name === 'SequelizeDatabaseError')
        console.log(error);
      else return NextResponse.json(error, { status: 500 });
    }
  } else {
    try {
      await Deduction.update(
        { isPosted: false },
        {
          where: {
            deductionId: deductionId,
          },
        }
      );

      await activityLog.create({
        companyId: companyId,
        userId: userId,
        message: 'Unposted a deduction',
      });

      return NextResponse.json({
        message: 'Deduction unposted successfully',
        status: 200,
      });
    } catch (error: any) {
      if (error.name && error.name === 'SequelizeDatabaseError')
        console.log(error);
      else return NextResponse.json({ message: 'Error' }, { status: 500 });
    }
  }
}

export async function DELETE(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { deductionId, userId } = await req.json();
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  if (!isNumber(companyId) || !isNumber(deductionId) || !isNumber(userId)) {
    return NextResponse.json({
      success: false,
      message: `Invalid values for Id's`,
      status: 400,
    });
  }
  try {
    await Deduction.update(
      {
        deletedAt: new Date(),
      },
      {
        where: {
          deductionId: deductionId,
        },
      }
    );

    await PayrollDeductions.destroy({
      where: {
        deductionId: deductionId,
      },
    });

    await activityLog.create({
      companyId: companyId,
      userId: userId,
      message: 'Deleted a deduction',
    });

    return NextResponse.json({
      message: 'Deduction deleted successfully',
      status: 200,
    });
  } catch (error) {
    return NextResponse.json({ message: 'Error' }, { status: 500 });
  }
}

export async function POST(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('authorization');

  const {
    ids: { employeeId, userId },
    deductionType,
    accountEmployeerNumber,
    accountEmployeeNumber,
    totalAmount,
    timePeriodPerDeduction,
    remarks,
    paymentCycle,
    deductionBreakdown,
    cycleChosen,
  } = await req.json();
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  try {
    if (
      hasHtmlTags(paymentCycle) ||
      hasHtmlTags(remarks) ||
      hasHtmlTags(deductionType) ||
      hasHtmlTags(accountEmployeeNumber) ||
      hasHtmlTags(accountEmployeerNumber)
    ) {
      return NextResponse.json(
        { success: false, message: 'Input/s contain/s possible script tags' },
        { status: 400 }
      );
    }

    if (
      hasSQLKeywords(paymentCycle) ||
      hasSQLKeywords(remarks) ||
      hasSQLKeywords(deductionType) ||
      hasSQLKeywords(accountEmployeeNumber) ||
      hasSQLKeywords(accountEmployeerNumber)
    ) {
      return NextResponse.json(
        { success: false, message: 'Input/s contain/s possible SQL keywords' },
        { status: 400 }
      );
    }

    if (deductionTypeOptions.indexOf(deductionType) === -1) {
      return NextResponse.json({
        success: false,
        message: `Invalid deduction type`,
        status: 400,
      });
    }
    if (!isNumber(companyId) || !isNumber(employeeId) || !isNumber(userId)) {
      return NextResponse.json({
        success: false,
        message: `Invalid values for Id's`,
        status: 400,
      });
    }
    let totalUnpaidCount = 0;
    const deductionsList: any = await Deduction.findAll({
      where: {
        deductionType: deductionType,
        companyId: companyId,
        employeeId: employeeId,
      },
      include: [
        {
          model: TransferToEmployee,
          attributes: ['disbursementStatus'],
          required: false,
        },
      ],
    });
    for (let i = 0; i < deductionsList.length; i++) {
      if (deductionsList[i].transfer_to_employee_acct_transaction) {
        if (
          deductionsList[i].transfer_to_employee_acct_transaction
            .disbursementStatus == 1 &&
          deductionsList[i].amountPaid < deductionsList[i].totalAmount
        ) {
          totalUnpaidCount++;
        }
      } else {
        if (deductionsList[i].amountPaid < deductionsList[i].totalAmount) {
          totalUnpaidCount++;
        }
      }
    }

    if (deductionType == 'Other' && totalUnpaidCount > 4) {
      return NextResponse.json({
        success: false,
        message: `Cannot create deduction. Employee has 5 unpaid ${deductionType}/s`,
        status: 200,
      });
    } else if (deductionType != 'Other' && totalUnpaidCount > 0) {
      return NextResponse.json({
        success: false,
        message: `Cannot create deduction. Employee has unpaid ${deductionType}`,
        status: 200,
      });
    }
    
    const newDeduction: any = await Deduction.create({
      employeeId,
      companyId,
      acctNoEmployee: accountEmployeeNumber,
      acctNoEmployer: accountEmployeerNumber,
      deductionType: deductionType,
      deductionPeriod: timePeriodPerDeduction,
      totalAmount: totalAmount,
      amountPaid: 0,
      remarks: remarks,
      noOfCycles: timePeriodPerDeduction === 'One Time' ? 1 : paymentCycle,
      cycleChosen: cycleChosen,
      perCycleDeduction:
        timePeriodPerDeduction === 'One Time'
          ? totalAmount
          : totalAmount / paymentCycle,
    });
    const deductionBreakdownArr = deductionBreakdown.map((item: any) => {
      return {
        amount: item.amount,
        desc: item.desc,
        deductionId: newDeduction.deductionId,
      };
    });
    await Ledger.bulkCreate(deductionBreakdownArr);
    await activityLog.create({
      companyId: companyId,
      userId: userId,
      message: 'Created a new deduction',
    });

    return NextResponse.json({
      success: true,
      message: 'Deduction created successfully',
      status: 200,
    });
  } catch (error: any) {
    console.log(error);
    if (error.name && error.name === 'SequelizeDatabaseError')
      console.error('Error creating deduction:', error.message);
    else return NextResponse.json(error);
  }
}

export async function PUT(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('authorization');

  const params = req.url.split('?')[1];
  const deductionId = Number(params.split('&')[0].split('=')[1]);

  const {
    ids: { companyId, employeeId, userId },
    deductionType,
    accountEmployeerNumber,
    accountEmployeeNumber,
    totalAmount,
    timePeriodPerDeduction,
    remarks,
    paymentCycle,
    cycleChosen,
    deductionBreakdown,
  } = await req.json();
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    if (
      hasHtmlTags(paymentCycle) ||
      hasHtmlTags(remarks) ||
      hasHtmlTags(deductionType) ||
      hasHtmlTags(accountEmployeeNumber) ||
      hasHtmlTags(accountEmployeerNumber)
    ) {
      return NextResponse.json(
        { success: false, message: 'Input/s contain/s possible script tags' },
        { status: 400 }
      );
    }

    if (
      hasSQLKeywords(paymentCycle) ||
      hasSQLKeywords(remarks) ||
      hasSQLKeywords(deductionType) ||
      hasSQLKeywords(accountEmployeeNumber) ||
      hasSQLKeywords(accountEmployeerNumber)
    ) {
      return NextResponse.json(
        { success: false, message: 'Input/s contain/s possible SQL keywords' },
        { status: 400 }
      );
    }

    if (deductionTypeOptions.indexOf(deductionType) === -1) {
      return NextResponse.json({
        success: false,
        message: `Invalid deduction type`,
        status: 400,
      });
    }
    if (
      !isNumber(companyId) ||
      !isNumber(employeeId) ||
      !isNumber(userId) ||
      !isNumber(deductionId)
    ) {
      return NextResponse.json({
        success: false,
        message: `Invalid values for Id's`,
        status: 400,
      });
    }

    // delete ledger not found in deductionBreakdown
    const currentLedgers = deductionBreakdown
      .filter(
        (item: any) => item.ledgerId !== undefined && item.ledgerId !== null
      )
      .map((item: any) => item.ledgerId);
    // console.log(
    //   '///////////////////////////////currentLedgers',
    //   currentLedgers
    // );
    const ledgers = await Ledger.destroy({
      where: {
        deductionId: deductionId,
        ledgerId: {
          [Op.notIn]: currentLedgers,
        },
      },
    });
    for (let i = 0; i < deductionBreakdown.length; i++) {
      const item = deductionBreakdown[i];
      // create for new entries
      if (!item.ledgerId) {
        await Ledger.create({
          deductionId: deductionId,
          desc: item.desc,
          amount: item.amount,
        });
      }
      // update for existing entries
      else {
        await Ledger.update(
          {
            deductionId: deductionId,
            desc: item.desc,
            amount: item.amount,
          },
          {
            where: {
              ledgerId: item.ledgerId,
            },
          }
        );
      }
    }
    await Deduction.update(
      {
        acctNoEmployee: accountEmployeeNumber,
        acctNoEmployer: accountEmployeerNumber,
        deductionType: deductionType,
        employeeId: employeeId,
        deductionPeriod: timePeriodPerDeduction,
        totalAmount: totalAmount,
        remarks: remarks,
        cycleChosen: cycleChosen,
        noOfCycles: timePeriodPerDeduction === 'One Time' ? 1 : paymentCycle,
        perCycleDeduction:
          timePeriodPerDeduction === 'One Time'
            ? totalAmount
            : totalAmount / paymentCycle,
      },
      {
        where: {
          deductionId: deductionId,
        },
      }
    );

    await activityLog.create({
      companyId: companyId,
      userId: userId,
      message: 'Updated a deduction',
    });

    return NextResponse.json({
      message: 'Deduction updated successfully',
      status: 200,
    });
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError')
      console.log(error);
    else return NextResponse.json({ message: error }, { status: 500 });
  }
}
