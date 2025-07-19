import { deleteCookie } from 'app/actions';
import axios from 'axios';
import { JWTPayload, SignJWT, decodeJwt, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export async function signJWTAccessToken(payload: JWTPayload) {
  const jwt_secret = process.env.JWT_SECRET_KEY || '';

  const secret = new TextEncoder().encode(jwt_secret);
  const alg = 'HS256';

  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setIssuer('urn:example:issuer')
    .setAudience('urn:example:audience')
    .setExpirationTime('12h')
    .sign(secret);

  // const token = sign(payload, jwt_secret, options)
  return jwt;
}
// export async function signJWTRefreshToken(payload: JWTPayload) {
//   const jwt_secret = process.env.JWT_SECRET_KEY || '';

//   const secret = new TextEncoder().encode(jwt_secret);
//   const alg = 'HS256';

//   const jwt = await new SignJWT(payload)
//     .setProtectedHeader({ alg })
//     .setIssuedAt()
//     .setIssuer('urn:example:issuer')
//     .setAudience('urn:example:audience')
//     .setExpirationTime('12h')
//     .sign(secret);

//   // const token = sign(payload, jwt_secret, options)
//   return jwt;
// }

export async function verifyJWT(token: string) {
  try {
    if (!token) return null;
    const verified = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET_KEY)
    );

    return verified.payload as JWTPayload;
  } catch (error) {
    deleteCookie('selected-company');
    deleteCookie('user-token');
    // deleteCookie('manual-login-token')
    console.error({ error, message: 'JWT is invalid' });
    return null;
  }
}

export async function verifyManualJWT(token: string) {
  try {
    const verified = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET_KEY)
    );
    return verified.payload as JWTPayload;
  } catch (error) {
    deleteCookie('manual-login-token');
    console.error({ error, message: 'JWT is invalid' });
  }
}

export function decodeJWT(token: string) {
  return decodeJwt(token);
}

export async function isValidToken(userToken: string) {
  if (userToken) {
    try {
      const cookieStore = await cookies();
      const JWT = userToken.split(' ')[1];

      const userSessionToken: any = cookieStore.get('user-token')?.value;
      if (JWT !== process.env.NEXT_PUBLIC_JWT) {
        // deleteCookie('selected-company');
        // deleteCookie('user-token');

        return false;
      }
      // verify user token from cookie
      if (!verifyJWT(userSessionToken)) {
        return false;
      }

      const { uniString } = decodeJWT(JWT) as {
        uniString: string;
      };

      // const envUniString = process.env.UNI_STRING as string;

      // if (uniString === envUniString) {
      //   return true;
      // } else {
      //   deleteCookie('selected-company');
      //   deleteCookie('user-token');
      //   console.log({ message: 'JWT is invalid' });
      // }
      // console.log(JWT);
      // console.log(process.env.NEXT_PUBLIC_JWT);
      // // verify bearer token
      // console.log({ message: 'JWT is invalid3' });

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}

export async function isValidTokenForAttendancePortal(userToken: string) {
  if (userToken) {
    try {
      const cookieStore = await cookies();
      const JWT = userToken.split(' ')[1];

      const userSessionToken: any =
        cookieStore.get('manual-login-token')?.value;
      if (JWT !== process.env.NEXT_PUBLIC_JWT) {
        return false;
      }
      // verify user token from cookie
      if (!verifyManualJWT(userSessionToken)) {
        return false;
      }

      const { uniString } = decodeJWT(JWT) as {
        uniString: string;
      };

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}

export async function sessionData() {
  const cookieStore = cookies();
  const userToken: any = cookieStore.get('user-token')?.value;
  return verifyJWT(userToken);
}

export async function sessionDataForManualLogin() {
  const cookieStore = cookies();
  const userToken: any = cookieStore.get('manual-login-token')?.value;
  return verifyJWT(userToken);
}

export async function selectedCompanyData() {
  const cookieStore = cookies();
  const selectedCompanyToken: any = cookieStore.get('selected-company')?.value;
  if (selectedCompanyToken == undefined) return null;
  return verifyJWT(selectedCompanyToken);
}
export function convertJwtExpToDateTime(token: string) {
  // extract exp from token
  const payload: JWTPayload = decodeJWT(token);
  // console.log('payload');

  const exp = payload.exp ? payload.exp : 0;
  // JWT exp is in seconds since Unix epoch
  const expInSeconds = exp * 1000; // Convert to milliseconds
  const expInDate = new Date(expInSeconds);
  return expInDate.toISOString().replace('T', ' ').slice(0, -5);
}
