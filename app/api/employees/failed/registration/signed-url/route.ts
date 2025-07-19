import { isValidToken } from '@utils/jwt';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@utils/logger';
import { StorageService } from 'lib/classes/gcp/StorageService';
import { Firestore } from "@google-cloud/firestore";

const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || '';
const FIREBASE_DATABASE_ID = process.env.FIREBASE_DATABASE_ID || '';
const FIRESTORE_COLLECTION_NAME = process.env.FIREBASE_COLLECTION_BULK_EMPLOYEE_RESPONSES || '';
const STORAGE_BUCKET_NAME = process.env.GCP_CLOUD_STORAGE_BUCKET_NAME || '';

const config = {
  projectId: FIREBASE_PROJECT_ID
};

if (FIREBASE_DATABASE_ID.indexOf('default') === -1) {
  // Must specify the database ID if not set to "(default)"; 
  // otherwise, it will result in a "5 NOT_FOUND" error.
  config.databaseId = FIREBASE_DATABASE_ID;
}
const firestore = new Firestore(config);

export async function GET(req: Request, res: Response, next: NextRequest): Promise<Response> {
  const userToken: any = req.headers.get('Authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const url = new URL(req.url);
    const params = url.searchParams;
    const docId = params.get('docId');
    const file = params.get('file');

    if (!docId) return NextResponse.json({ message: 'docId parameter is required' }, { status: 400 });
    if (!file) return NextResponse.json({ message: 'File parameter is required' }, { status: 400 });
    
    const storageService = new StorageService()
      .setBucket(STORAGE_BUCKET_NAME!)
      .setPath(file);
    
    const expiry = Date.now() + 24 * 60 * 60 * 1000; // 1 day
    const docRef = firestore.collection(FIRESTORE_COLLECTION_NAME).doc(docId);
    await docRef.update({
      csv_download_status: 2,
      csv_signed_url: await storageService.signedUrl('read', expiry, 'text/csv'),
      csv_signed_expiry: expiry
    })

    return NextResponse.json({message: 'CSV download link generated successfully'});
  } catch (error) {
    logger.error({
      message: 'Failed to download CSV',
      error
    });

    return NextResponse.json({message: `${error instanceof Error ? error.message : error}`}, { status: 500 });
  }
}
