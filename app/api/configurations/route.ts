import { NextRequest, NextResponse } from 'next/server';
import { isValidToken, sessionData, signJWTAccessToken } from '@utils/jwt';
import company from 'db/models/company';
import Configuration from 'db/models/configuration';
import { cookies } from 'next/headers';
import { hasHtmlTags } from '@utils/helper';
import axios from 'axios';
import { Charge, Company } from 'db/models';
import { config } from 'dotenv';
import { forEach } from 'lodash';
import { Op, QueryTypes } from 'sequelize';
import { executeQuery } from 'db/connection';
import { logger } from '@utils/logger';

export async function GET(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('authorization');
  const log = (message: string, data?: any) => {
    logger.info(`[Get Configurations] ${message}`, data || '');
  };
  const url = new URL(req.url);
  const seshData: any = await sessionData();
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const res: any = await executeQuery(`configurations_get`, {
      shouldFetchCharges: true,
    });

    log("configurations res", { res });

    const appConfigData: any = res?.[0] || {
      emailContacts: [],
      phoneContacts: [],
    };

    if (res?.[0]) {
      const emailContacts = appConfigData.emailContacts
        ? appConfigData.emailContacts.split(',')
        : [];
      const phoneContacts = appConfigData.phoneContacts
        ? appConfigData.phoneContacts.split(',')
        : [];

      appConfigData.emailContacts = emailContacts;
      appConfigData.phoneContacts = phoneContacts;
    }
    // const chargedCompanies = await Company.findAll({
    //   where: {
    //     applyCharge: true,
    //   },
    // });
    // const allCompanies = await Company.findAll({
    //   where: {
    //     companyId: {
    //       [Op.not]: seshData.companyId,
    //     },
    //   },
    // });
    // appConfigData.dataValues.chargedCompanies = chargedCompanies.map(
    //   (item: any) => {
    //     return { companyId: item.companyId, companyName: item.companyName };
    //   }
    // );
    // appConfigData.dataValues.allCompanies = allCompanies.map((item: any) => {
    //   return { companyId: item.companyId, companyName: item.companyName };
    // });
    return NextResponse.json(
      { message: appConfigData, success: true },
      { status: 200 }
    );
  } catch (err: any) {
    log("Error getting configurations", { error: err });
    if (err.name === 'SequelizeDatabaseError') return console.log(err.message);
    console.log(err.message);
    return NextResponse.json(
      { message: err.message, success: false },
      { status: 500 }
    );
  }
}
export async function POST(req: Request, res: Response, nex: NextRequest) {
  const userToken: any = req.headers.get('authorization');

  const url = new URL(req.url);
  const {
    emailContacts,
    phoneContacts,
    // threshold,
    // tierCharges,
    // selectedCompanies,
  } = await req.json();
  const companyId = Number(url.searchParams.get('companyId'));
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    forEach(emailContacts, (emailContact: any) => {
      if (hasHtmlTags(emailContact))
        return NextResponse.json(
          { message: 'Invalid email contact' },
          { status: 400 }
        );
    });
    forEach(phoneContacts, (phoneContact: any) => {
      if (hasHtmlTags(phoneContact))
        return NextResponse.json(
          { message: 'Invalid phone contact' },
          { status: 400 }
        );
    });
    const [appConfigData]: any = await executeQuery(`configurations_get`, {
      shouldFetchCharges: false,
    });

    const objToSave = {
      emailContacts: emailContacts.toString(),
      phoneContacts: phoneContacts.toString(),
      // threshold: Number(threshold),
    };

    // const chargesToSave: any = tierCharges.map((item: any, index: number) => {
    //   return {
    //     chargeId: item.chargeId,
    //     configurationId: appConfigData.configurationId,
    //     tierStart: item.tierStart,
    //     tierEnd: item.tierEnd,
    //     chargeLessThreshold: item.chargeLessThreshold,
    //     chargeMoreThreshold: item.chargeMoreThreshold,
    //     tierNumber: index + 1,
    //   };
    // });
    // console.log(chargesToSave);
    // first time saving configurations
    if (!appConfigData) {
      await executeQuery(
        `configurations_insert`,
        objToSave,
        [],
        QueryTypes.INSERT
      );
      const newAppConfigData = new Configuration({ objToSave });

      await newAppConfigData.save();
      // forEach(chargesToSave, (charge: any) => {
      //   Charge.upsert(charge);
      // });
      // return NextResponse.json(
      //   { message: 'Configuration created', success: true },
      //   { status: 201 }
      // );
    } else {
      // appConfigData.threshold = threshold;
      await executeQuery(
        `configurations_update`,
        {
          configurationId: appConfigData.configurationId,
          ...objToSave,
        },
        [],
        QueryTypes.UPDATE
      );

      // const chargedCompanies = await Company.update(
      //   { applyCharge: true },
      //   {
      //     where: {
      //       companyId: selectedCompanies.map((item: any) => item.companyId),
      //     },
      //   }
      // );
      // const unChargedCompanies = await Company.update(
      //   { applyCharge: false },
      //   {
      //     where: {
      //       companyId: {
      //         [Op.notIn]: selectedCompanies.map((item: any) => item.companyId),
      //       },
      //     },
      //   }
      // );
      // forEach(chargesToSave, (charge: any) => {
      //   console.log(charge);
      //   Charge.upsert(charge);
      // });
      return NextResponse.json(
        { message: 'Configuration updated', success: true },
        { status: 200 }
      );
    }
  } catch (err: any) {
    if (err.name === 'SequelizeDatabaseError') return console.log(err.message);

    console.log(err.message);
    return NextResponse.json(
      { message: err.message, success: false },
      { status: 500 }
    );
  }
}
