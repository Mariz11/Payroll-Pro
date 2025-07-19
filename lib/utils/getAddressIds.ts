'use server';

import { City, Country, Province } from "db/models";
import { Op } from "sequelize";


export async function getCity({
    cityName,
}: {
    cityName: string;
}) {
    try {
        const city = await City.findOne({
            where: {
                name: {
                    [Op.startsWith]: `%${cityName}%`
                }
            }
        })

        return city;
    } catch (error) {
        console.log(error);
        return null;
    }
}

export async function getProvince({
    provinceName,
}: {
    provinceName: string;
}) {
    try {
        const province = await Province.findOne({
            where: {
                name: {
                    [Op.startsWith]: `%${provinceName}%`
                }
            }
        })

        return province;
    } catch (error) {
        console.log(error);
        return null;
    }
}


export async function getCountry({
    countryName,
}: {
    countryName: string;
}) {
    try {
        const country = await Country.findOne({
            where: {
                name: {
                    [Op.startsWith]: `%${countryName}%`
                }
            }
        })

        return country;
    } catch (error) {
        console.log(error);
        return null;
    }
}