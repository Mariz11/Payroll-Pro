import moment from '@constant/momentTZ';
import { createActivityLog } from '@utils/activityLogs';
import { getRequestLogger, logger } from '@utils/logger';
import { verifyReCaptcha } from '@utils/partnerAPIs';
import bcrypt from 'bcrypt';
import { executeQuery } from 'db/connection';
import admin from 'firebase-admin';
import { signJWTAccessToken } from 'lib/utils/jwt';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { QueryTypes } from 'sequelize';

const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || '';
const SERVICE_ACCOUNT_CLIENT_EMAIL =
  process.env.GCP_CLOUD_SERVICE_ACCOUNT_CLIENT_EMAIL || '';
const SERVICE_ACCOUNT_PRIVATE_KEY =
  process.env.GCP_CLOUD_SERVICE_ACCOUNT_PRIVATE_KEY || '';

const TOKEN_AGE = process.env.TOKEN_AGE
  ? parseInt(process.env.TOKEN_AGE)
  : 86400000;

const firebaseSignInToken = async (userId: string, requestLogger = logger) => {
  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: FIREBASE_PROJECT_ID,
          clientEmail: SERVICE_ACCOUNT_CLIENT_EMAIL,
          privateKey: SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
    }

    return await admin.auth().createCustomToken(String(userId));
  } catch (error) {
    requestLogger.warn({ firebaseSignInTokenError: JSON.stringify(error) });
    return null;
  }
};

export async function POST(req: NextRequest, res: Response, next: NextRequest) {
  const requestLogger = getRequestLogger(req);
  const body = await req.json();
  const { username, password, reCaptchaToken } = body;

  requestLogger.info({ message: 'Login attempt', username });

  try {
    const verify = await verifyReCaptcha({
      reCaptchaToken: reCaptchaToken,
    });

    if (!verify.success) {
      requestLogger.warn({
        message: 'ReCaptcha verification failed',
        username,
        verify,
      });
      return NextResponse.json(
        {
          success: false,
          message: `ReCaptcha Error: ${JSON.stringify({ ...verify })}`,
        },
        {
          status: 401,
        }
      );
    }

    requestLogger.debug({
      message: 'ReCaptcha verification successful',
      username,
    });
    const [userDetails]: any = await executeQuery(`users_get_login`, {
      username: username.trim(),
    });

    console.log('userDetailsxxx ', userDetails);

    const user = userDetails?.userData;

    if (user) {
      const [userRole]: any = await executeQuery(`user_roles_get_one`, {
        userRoleId: user.roleId,
      });

      const access = await JSON.parse(userRole.moduleAccess);

      let hasEmployeeAccess = false;
      for (let i = 0; i < access.length; i++) {
        if (access[i].moduleId >= 16 && access[i].moduleId <= 19) {
          hasEmployeeAccess = true;
        }
      }

      if (!user.employeeId && hasEmployeeAccess) {
        requestLogger.warn({
          message: 'User has employee access but not registered as employee',
          userId: user.userId,
          username,
        });
        return NextResponse.json(
          {
            success: false,
            message:
              'User has employee level access to a module but is not registered as an employee. Please contact any company admin.',
          },
          {
            status: 401,
          }
        );
      }
    }
    if (!user) {
      requestLogger.warn({ message: 'User not found', username });
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid Credentials',
        },
        {
          status: 401,
        }
      );
    }

    const verifyPass = await bcrypt.compare(password.trim(), user.password);
    if (!verifyPass) {
      requestLogger.warn({
        message: 'Invalid password',
        userId: user.userId,
        username,
      });
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid Credentials',
        },
        {
          status: 401,
        }
      );
    }

    if (user.isActive != 1) {
      requestLogger.warn({
        message: 'Inactive account login attempt',
        userId: user.userId,
        username,
      });
      return NextResponse.json(
        {
          success: false,
          message: 'Account not yet activated.',
        },
        {
          status: 404,
        }
      );
    }

    // Delete old cookies
    cookies().delete('manual-login-token');
    cookies().delete('user-token');
    cookies().delete('selected-company');

    if (user.roleId == null) {
      requestLogger.warn({
        message: 'User without role attempted login',
        userId: user.userId,
        username,
      });
      return NextResponse.json(
        {
          success: false,
          message:
            'User does not have a role. Please contact any company admin.',
        },
        {
          status: 401,
        }
      );
    }

    const userData = user;
    delete userData.password;
    if (user.role !== 'ADMIN') {
      const token = await signJWTAccessToken(userData);
      cookies().set('user-token', token, {
        expires: Date.now() + TOKEN_AGE,
        httpOnly: true,
        secure: true,
      });
    } else {
      if (user.company.tcAccepted === 1) {
        const token = await signJWTAccessToken(userData);

        cookies().set('user-token', token, {
          expires: Date.now() + TOKEN_AGE,
          httpOnly: true,
          secure: true,
        });
      }
    }

    await executeQuery(
      `users_update_islocked`,
      {
        p_userId: user.userId,
        p_isLocked: false,
      },
      [],
      QueryTypes.UPDATE
    );

    const firebaseToken = await firebaseSignInToken(user.userId);

    requestLogger.info({
      message: 'User successfully authenticated',
      userId: user.userId,
      username,
      companyId: user.companyId,
    });

    const response = {
      success: true,
      userData: user,
      termsConditionsAccepted: user.company.tcAccepted,
      message: 'Authenticated',
      token: firebaseToken,
    };

    return NextResponse.json(response, {
      status: 200,
    });
  } catch (error: any) {
    requestLogger.error({
      message: 'Login error',
      username,
      error,
    });
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      {
        status: 404,
      }
    );
  }
}

export async function PUT(req: NextRequest, res: Response, next: NextRequest) {
  const requestLogger = getRequestLogger(req);
  const body = await req.json();
  const { companyId, checked, userId } = body;

  requestLogger.info({
    message: 'Terms and conditions update request',
    userId,
    companyId,
    accepted: checked,
  });

  if (checked === true) {
    await executeQuery(
      `companies_update_tcAccepted_status`,
      {
        p_companyId: companyId,
        p_tcAccepted: true,
      },
      [],
      QueryTypes.UPDATE
    );

    const [userDetails]: any = await executeQuery(`users_get_by_id`, {
      userId,
    });

    const user = userDetails?.userData;

    const dateToday = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

    await createActivityLog(
      user.companyId,
      user.userId,
      `${user.emailAddress} of ${user.company.companyName} has accepted the terms and conditions`,
      'Terms and Conditions Accepted'
    );

    requestLogger.info({
      message: 'Terms and conditions accepted',
      userId,
      companyId,
      companyName: user.company.companyName,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Terms And Conditions Accepted',
      },
      {
        status: 200,
      }
    );
  }

  requestLogger.info({
    message: 'User logging out',
    userId,
    companyId,
  });
}
