import { hasHtmlTags, hasSQLKeywords } from '@utils/helper';
import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import {
  QRPHcashInTransaction,
  branchCashInTransaction,
  cancelBranchCashIn,
  getBranchCashInTransaction,
} from '@utils/partnerAPIs';
import { ActivityLog, CashInTransactions, Company } from 'db/models';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  try {
    const url = new URL(req.url);
    const get = url.searchParams.get('get');
    const transactionCode: any = url.searchParams.get('transactionCode');
    const transactionType: any = url.searchParams.get('transactionType');

    let pendingCashInTransAction: any;
    if (get == 'FROM_DB') {
      pendingCashInTransAction = await CashInTransactions.findOne({
        where: {
          companyId: companyId,
          isNotified: false,
        },
      });
    } else if (get == 'FROM_API') {
      pendingCashInTransAction = await getBranchCashInTransaction({
        transactionCode: transactionCode,
        transactionType: transactionType,
      });
    }

    return NextResponse.json(
      { success: true, data: pendingCashInTransAction },
      { status: 200 }
    );
  } catch (error: any) {
    console.log(error);
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.error('Error getting cashin transactions:', error.message);
    } else
      return NextResponse.json({
        severity: 'error',
        success: false,
        error: error.message,
        message: 'Something went wrong...',
      });
  }
}

export async function POST(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  try {
    const payload = await req.json();
    const companyDetails: any = await Company.findByPk(companyId);
    const url = new URL(req.url);
    const paymentMethod = url.searchParams.get('paymentMethod');

    const nonce = payload.nonce;
    const principalAmount = payload.amount;
    if (hasHtmlTags(paymentMethod) || hasHtmlTags(nonce)) {
      return NextResponse.json(
        { success: false, message: 'Input/s contain/s possible script tags' },
        { status: 400 }
      );
    }

    if (hasSQLKeywords(paymentMethod) || hasSQLKeywords(nonce)) {
      return NextResponse.json(
        { success: false, message: 'Input/s contain/s possible SQL keywords' },
        { status: 400 }
      );
    }
    if (!companyDetails.contactNumber || !companyDetails.companyAddress) {
      return NextResponse.json({
        success: false,
        message: 'Company Contact Number and Address are required.',
      });
    }

    if (paymentMethod == 'BRANCH') {
      const cashIn: any = await branchCashInTransaction({
        principalAmount: principalAmount,
        sender: {
          accountId: companyDetails.accountId,
          name: companyDetails.companyName,
          mobileNumber: companyDetails.contactNumber,
          address: companyDetails.companyAddress,
        },
        clientName: 'ML PAYROLL',
      });

      console.log('cashInnnBranchh ', cashIn);

      if (cashIn.success) {
        const responseData = cashIn.responseData.data;
        const senderData = responseData.sender;
        await CashInTransactions.create({
          companyId: companyId,
          cashTransferId: responseData.cashTransferId,
          transactionCode: responseData.transactionCode,
          transactionType: responseData.transactionType,
          via: 'BRANCH',
          principalAmount: responseData.principalAmount,
          companyAccountId: senderData.companyId,
          companyName: senderData.name,
          companyContactNumber: senderData.mobileNumber,
          companyAddress: senderData.address,
          status: responseData.status,
        });

        await ActivityLog.create({
          companyId: seshData.companyId,
          userId: seshData.userId,
          message: `Created Cash In transaction [RefNo: ${responseData.transactionCode}]`,
        });
        return NextResponse.json({
          success: true,
          type: 'BRANCH',
          amountToSend: principalAmount,
          transactionCode: responseData.transactionCode,
          quickResponseCode: null,
          companyAccountId: companyDetails.accountId,
          companyName: companyDetails.companyName,
          companyContactNumber: companyDetails.contactNumber,
          companyAddress: companyDetails.companyAddress,
        });
      } else {
        return NextResponse.json(cashIn);
      }
    } else if (paymentMethod == 'QRPH') {
      const cashIn: any = await QRPHcashInTransaction({
        nonce: nonce,
        timestamp: new Date().getTime(),
        principalAmount: principalAmount,
        companyAccountId: companyDetails.accountId,
        mobileNumber: companyDetails.contactNumber,
        address: companyDetails.companyAddress,
      });

      console.log('cashInnn ', cashIn);

      if (cashIn.success) {
        const responseData = cashIn.responseData;
        await CashInTransactions.create({
          companyId: companyId,
          cashTransferId: nonce,
          transactionCode: responseData.transactionCode,
          quickResponseCode: responseData.quickResponseCode,
          transactionType: 'QR-PH RECEIVE COMPANY',
          via: 'QRPH',
          principalAmount: responseData.amount,
          companyAccountId: companyDetails.accountId,
          companyName: companyDetails.companyName,
          companyContactNumber: companyDetails.contactNumber,
          companyAddress: companyDetails.companyAddress,
          status: 'PENDING',
        });

        await ActivityLog.create({
          companyId: seshData.companyId,
          userId: seshData.userId,
          message: `Created Cash In transaction [RefNo: ${responseData.transactionCode}]`,
        });
        return NextResponse.json({
          success: true,
          type: 'QRPH',
          amountToSend: principalAmount,
          transactionCode: responseData.transactionCode,
          quickResponseCode: responseData.quickResponseCode,
          companyAccountId: companyDetails.accountId,
          companyName: companyDetails.companyName,
          companyContactNumber: companyDetails.contactNumber,
          companyAddress: companyDetails.companyAddress,
        });
      } else {
        return NextResponse.json(cashIn);
      }
    }
  } catch (error: any) {
    console.log(error);
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.error('Error getting cashin transactions:', error.message);
    } else
      return NextResponse.json({
        severity: 'error',
        success: false,
        error: error,
        message: error.message,
      });
  }
}

export async function PUT(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('authorization');
  const seshData: any = await sessionData();

  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const { type, status, transactionCode } = await req.json();
    const companyAccountId = seshData.company.accountId;
    if (
      hasHtmlTags(type) ||
      hasHtmlTags(status) ||
      hasHtmlTags(transactionCode)
    ) {
      return NextResponse.json(
        { success: false, message: 'Input/s contain/s possible script tags' },
        { status: 400 }
      );
    }
    if (
      hasSQLKeywords(type) ||
      hasSQLKeywords(status) ||
      hasSQLKeywords(transactionCode)
    ) {
      return NextResponse.json(
        { success: false, message: 'Input/s contain/s possible SQL keywords' },
        { status: 400 }
      );
    }

    const checkCurrentStatus: any = await CashInTransactions.findOne({
      attributes: ['status'],
      where: {
        transactionCode: transactionCode,
      },
    });

    if (status == 'CANCELLED') {
      if (checkCurrentStatus.status != status) {
        if (type == 'BRANCH') {
          const cancelCashIn: any = await cancelBranchCashIn({
            transactionCode: transactionCode,
            companyAccountId: companyAccountId,
          });

          if (!cancelCashIn.success) {
            return NextResponse.json(cancelCashIn);
          }
        }

        await CashInTransactions.update(
          {
            status: status,
          },
          {
            where: {
              transactionCode: transactionCode,
            },
          }
        );

        await ActivityLog.create({
          companyId: seshData.companyId,
          userId: seshData.userId,
          message: `Cancelled Cash In transaction [RefNo: ${transactionCode}]`,
        });
      }
    } else if (status == 'CONFIRMED') {
      await CashInTransactions.update(
        {
          isNotified: 1,
        },
        {
          where: {
            transactionCode: transactionCode,
          },
        }
      );
    }
    // else {
    //   if (checkCurrentStatus.status != status) {
    //     await CashInTransactions.update(
    //       {
    //         status: status,
    //       },
    //       {
    //         where: {
    //           transactionCode: transactionCode,
    //         },
    //       }
    //     );
    //     await ActivityLog.create({
    //       companyId: seshData.companyId,
    //       userId: seshData.userId,
    //       message: `[SYSTEM] Cash In transaction [RefNo: ${transactionCode}] ${
    //         status == 'PROCESSING'
    //           ? 'has been PROCESSED'
    //           : status == 'SUCCESS'
    //           ? 'was SUCCESSFUL'
    //           : 'has been ' + status
    //       }`,
    //     });
    //   }
    // }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.error('Error updating cashin transactions:', error.message);
    } else
      return NextResponse.json({
        severity: 'error',
        success: false,
        error: error.message,
        message: 'Something went wrong...',
      });
  }
}
