import { isValidToken } from '@utils/jwt';
import { sessionData, selectedCompanyData } from '@utils/jwt';
import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

const logsDirectory = path.join(process.cwd(), 'logs');

export async function GET(req: Request, res: Response) {
  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  const url = new URL(req.url);
  const date = url.searchParams.get('date') || '';

  //   try {
  //     const files = fs.readdirSync(logsDirectory);
  //     const logFiles = files.filter((file) => file.endsWith('.log'));

  //     if (logFiles.length === 0) {
  //       return NextResponse.json({
  //         success: false,
  //         message: 'No log files found',
  //       });
  //     }

  //     let logs;
  //     if (date !== '') {
  //       const filteredLogFiles = logFiles.filter((file) => file.includes(date));
  //       if (filteredLogFiles.length === 0) {
  //         return NextResponse.json({
  //           success: false,
  //           message: `No log files found for date: ${date}...`,
  //         });
  //       }
  //       logs = filteredLogFiles.map((file) => {
  //         const filePath = path.join(logsDirectory, file);
  //         const content = fs.readFileSync(filePath, 'utf-8');
  //         return { file, content };
  //       });
  //     } else {
  //       logs = logFiles.map((file) => {
  //         const filePath = path.join(logsDirectory, file);
  //         const content = fs.readFileSync(filePath, 'utf-8');
  //         return { file, content };
  //       });
  //     }

  //     return NextResponse.json({
  //       success: true,
  //       message: logs,
  //     });
  //   } catch (error) {
  //     return NextResponse.json({
  //       success: false,
  //       message: { error: 'Failed to read log files' },
  //     });
  //   }

  return NextResponse.json({ message: 'Not Available' }, { status: 404 });
}
