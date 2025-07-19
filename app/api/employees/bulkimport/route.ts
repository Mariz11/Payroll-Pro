import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { NextResponse } from 'next/server';
import { Firestore, Timestamp } from '@google-cloud/firestore';
import { StorageService } from 'lib/classes/gcp/StorageService';
import { Shift } from 'db/models';
import { executeQuery } from 'db/connection';
import { COMPANIES_GET_ONE } from '@constant/storedProcedures';
import { OTRatesProps, ShiftProps } from 'lib/interfaces';
import { logger } from '@utils/logger';

const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || '';
const FIREBASE_DATABASE_ID = process.env.FIREBASE_DATABASE_ID || '';
const FIRESTORE_COLLECTION_NAME =
  process.env.FIREBASE_COLLECTION_BULK_EMPLOYEE_RESPONSES || '';
const STORAGE_BUCKET_NAME = process.env.GCP_CLOUD_STORAGE_BUCKET_NAME || '';
const STORAGE_BUCKET_DIRECTORY =
  process.env.GCP_CLOUD_STORAGE_BUCKET_DIRECTORY || '';

const config = {
  projectId: FIREBASE_PROJECT_ID,
};

if (FIREBASE_DATABASE_ID.indexOf('default') === -1) {
  // Must specify the database ID if not set to "(default)";
  // otherwise, it will result in a "5 NOT_FOUND" error.
  config.databaseId = FIREBASE_DATABASE_ID;
}
const firestore = new Firestore(config);

export async function POST(req: Request, res: Response) {
  const userToken: any = req.headers.get('authorization');
  if (!(await isValidToken(userToken))) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const getCompanyData = async () => {
    const seshData: any = await sessionData();
    const selectedCompData: any = await selectedCompanyData();

    return {
      companyId: selectedCompData
        ? selectedCompData.companyId
        : seshData.companyId,
      companyName: selectedCompData
        ? selectedCompData.companyName
        : seshData.company.companyName,
      companyTierLabel: selectedCompData
        ? selectedCompData.tierLabel
        : seshData.company.tierLabel,
      userId: seshData.userId,
    };
  };

  const getWorkingHours = async (shiftId: string): Promise<number> => {
    const shift = await Shift.findOne<ShiftProps>({
      where: { shiftId },
      attributes: ['workingHours'],
    });

    return shift?.workingHours ?? 0;
  };

  const getOTRates = async (companyId: string): Promise<OTRatesProps> => {
    const [company]: OTRatesProps[] = await executeQuery(COMPANIES_GET_ONE, {
      companyId,
    });

    return {
      applyWithHoldingTax: company?.applyWithHoldingTax ?? 0,
      workingDays: company?.workingDays ?? 0,
      overtimeRegRate: company?.overtimeRegRate ?? 0,
      overtimeRestDayRate: company?.overtimeRestDayRate ?? 0,
      overtimeSHRate: company?.overtimeSHRate ?? 0,
    };
  };

  const uploadFileToStorage = async (file: File, docSnapshotId: string) => {
    const path = `${STORAGE_BUCKET_DIRECTORY}/${docSnapshotId} - ${file.name}`;
    const storageService = new StorageService()
      .setBucket(STORAGE_BUCKET_NAME!)
      .setPath(path);

    await storageService.setBuffer(file);
    await storageService.uploadFile();
  };

  const getSignedUrl = async (fileName: string, fileType: string, docSnapshotId: string): Promise<string> => {
    const path = `${STORAGE_BUCKET_DIRECTORY}/${docSnapshotId} - ${fileName}`;
    const storageService = new StorageService()
      .setBucket(STORAGE_BUCKET_NAME!)
      .setPath(path);

    // Set the signed URL expiry time to 15 minutes from now
    const expiry = Date.now() + 15 * 60 * 1000;
    return await storageService.signedUrl('write', expiry, fileType);
  }

  try {
    const { companyId, companyTierLabel, userId } = await getCompanyData();
    const {
      fileName,
      fileType,
      rows,
      shiftId,
      departmentId
    } = await req.json();

    const parsedRows = rows ? parseInt(rows.toString()) : NaN;
    if (isNaN(parsedRows)) {
      return NextResponse.json(
        { error: 'Invalid rows value' },
        { status: 400 }
      );
    }

    const { 
      applyWithHoldingTax, 
      workingDays,
      overtimeRegRate,
      overtimeRestDayRate,
      overtimeSHRate
    } =
      await getOTRates(companyId);
    const workingHours = await getWorkingHours(shiftId);
    const docRef = firestore.collection(FIRESTORE_COLLECTION_NAME).doc();

    await docRef.set({
      file_name: fileName,
      total: parsedRows - 1, // exculude header
      read: 0,
      success: 0,
      failed: 0,
      status: 'ongoing',
      timestamp: Timestamp.now(),

      // For cloud logic
      data: {
        shiftId,
        departmentId,
        userId,
        companyId,
        companyTierLabel,
        applyWithHoldingTax,
        workingDays,
        workingHours,
        overtimeRegRate,
        overtimeRestDayRate,
        overtimeSHRate
      },
    });

    const docSnapshot = await docRef.get();
    if (!docSnapshot.exists) {
      return NextResponse.json(
        { error: 'Something went wrong...' },
        { status: 500 }
      );
    }

    try {
      const signedURL = await getSignedUrl(fileName, fileType, docSnapshot.id);
      // await uploadFileToStorage(file, docSnapshot.id);
      return NextResponse.json({ signedURL });
    } catch (error) {
      await docRef.delete();
      
      logger.error({
        message: 'Failed generating signed url for importing bulk employees',
        error
      });

      return NextResponse.json({message: `${error instanceof Error ? error.message : error}`}, { status: 500 });
    }
  } catch (error) {
    logger.error({
      message: 'Failed importing bulk employees',
      error
    });

    return NextResponse.json({message: `${error instanceof Error ? error.message : error}`}, { status: 500 });
  }
}
