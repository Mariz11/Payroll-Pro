
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import moment from '@constant/momentTZ';
import { sendEmail } from '@utils/partnerAPIs';
import { generateRandomAlphanumeric } from '@utils/stringHelper';
import {
  resetPasswordEmailContent,
} from '@utils/notificationContentFormatter';
import { Op, QueryTypes } from 'sequelize';
import { isPasswordCommon } from '@utils/helper';
import { executeQuery } from 'db/connection';
const TOKEN_AGE = process.env.TOKEN_AGE
  ? parseInt(process.env.TOKEN_AGE)
  : 86400000;
const emailRe = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const upperCaseAndSpecialCharactersRE =
  /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/;
export async function GET(req: Request, res: Response, next: NextRequest) {
  try {
    const url = new URL(req.url);
    const token = String(url.searchParams.get('token'));
    const [resetLink]: any = await executeQuery(`resetLinks_get_token`, { token });
    const resetLinkDetails = resetLink?.details;
    if (!resetLinkDetails) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid Token',
        },
        {
          status: 200,
        }
      );
    }
    const date = new Date();
    const timeDiff = moment(date).diff(moment(resetLinkDetails.createdAt), 'minutes');
    if (timeDiff > 60) {
      return NextResponse.json(
        {
          success: false,
          message: 'Link Expired',
        },
        {
          status: 200,
        }
      );
    }
    if (resetLinkDetails.usedAt !== null) {
      return NextResponse.json(
        {
          success: false,
          message: 'Link Already Used',
        },
        {
          status: 200,
        }
      );
    }
    return NextResponse.json(
      {
        success: true,
        message: 'Forgot Password Page',
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Something went wrong',
      },
      {
        status: 500,
      }
    );
  }
}
export async function PUT(req: Request, res: Response, next: NextRequest) {
  const body = await req.json();
  const { token, password } = body;

  try {
    if (password.length < 8) {
      return NextResponse.json({
        status: 409,
        success: false,
        message: 'Password must be at least 8 characters long',
      });
    }

    if (isPasswordCommon(password)) {
      return NextResponse.json({
        status: 409,
        success: false,
        message: 'Password you entered is common, please create a stronger one',
      });
    }

    if (password.length > 30) {
      return NextResponse.json({
        status: 409,
        success: false,
        message: 'Password must not exceed 30 characters',
      });
    }
    if (
      !upperCaseAndSpecialCharactersRE.test(password) ||
      password == password.toLowerCase()
    ) {
      return NextResponse.json({
        status: 409,
        success: false,
        message:
          'Please create a stronger password using a mix of uppercase and lowercase letters, numbers, and special characters.',
      });
    }

    const [resetLink]: any = await executeQuery(`resetLinks_get_token_with_users`, {
      token,
    });

    if (!resetLink) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid Token',
        },
        {
          status: 200,
        }
      );
    }
    const date = new Date();
    const timeDiff = moment(date)
      .clone()
      .diff(moment(resetLink.createdAt), 'minutes');
    if (timeDiff > 60) {
      return NextResponse.json(
        {
          success: false,
          message: 'Link Expired',
        },
        {
          status: 200,
        }
      );
    }
    if (resetLink.usedAt !== null) {
      return NextResponse.json(
        {
          success: false,
          message: 'Link Already Used',
        },
        {
          status: 200,
        }
      );
    }

    await executeQuery(
      `resetLinks_update`,
      { resetLinkId: resetLink.resetLinkId },
      [],
      QueryTypes.UPDATE
    );

    await executeQuery(
      `users_update_password`,
      {
        userId: resetLink.userId,
        password: bcrypt.hashSync(password, 10),
      },
      [],
      QueryTypes.UPDATE
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Password has been updated',
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Something went wrong',
      },
      {
        status: 500,
      }
    );
  }
}
export async function POST(req: Request, res: Response, next: NextRequest) {
  const body = await req.json();
  const { email } = body;
  if (!email) {
    return NextResponse.json(
      {
        success: false,
        message: 'Email is required.',
      },
      {
        status: 400,
      }
    );
  }
  if (!emailRe.test(email)) {
    return NextResponse.json(
      {
        success: false,
        message: 'Invalid Email Address format.',
      },
      {
        status: 400,
      }
    );
  }
  try {
    const [user]: any = await executeQuery(`users_get_by_email_address`, { email });
    const userDetails = user?.user;

    if (!userDetails) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email not found.',
        },
        {
          status: 404,
        }
      );
    }
    // check for recent reset links let's say 10 minutes
    const recentResetLink = await executeQuery(`resetLinks_get_recent_reset`, {
      userId: userDetails.userId,
    });

    if (recentResetLink.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            'You have recently requested a password reset. Please wait for a few minutes and try again.',
        },
        {
          status: 400,
        }
      );
    }
    // to avoid collisions
    let isFound = true;
    let token = generateRandomAlphanumeric(20);
    while (isFound) {
      const [resetLinkFound] = await executeQuery(`resetLinks_get_token`, {
        token,
      });

      if (resetLinkFound) {
        // gemerate new token
        token = generateRandomAlphanumeric(20);
      } else {
        isFound = false;
      }
    }

    await executeQuery(
      `resetLinks_insert`,
      {
        userId: userDetails.userId,
        token: token,
      },
      [],
      QueryTypes.INSERT
    );

    sendEmail({
      to: email,
      subject: `Reset Password`,
      content: resetPasswordEmailContent({
        token: token,
      }),
    });
    return NextResponse.json(
      {
        success: true,
        message: 'Reset link has been sent to your email address.',
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error,
      },
      {
        status: 500,
      }
    );
  }
}
