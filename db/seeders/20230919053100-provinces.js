'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('provinces', [
      {
        countryId: 1,
        provinceId: 1,
        name: "ABRA",
        label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 2,
          name: "AGUSAN DEL NORTE",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 3,
          name: "AGUSAN DEL SUR",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 4,
          name: "AKLAN",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 5,
          name: "ALBAY",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 6,
          name: "ANTIQUE",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 7,
          name: "APAYAO",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 8,
          name: "AURORA",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 9,
          name: "BASILAN",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 10,
          name: "BATAAN",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 11,
          name: "BATANES",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 12,
          name: "BATANGAS",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 13,
          name: "BENGUET",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 14,
          name: "BILIRAN",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 15,
          name: "BOHOL",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 16,
          name: "BUKIDNON",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 17,
          name: "BULACAN",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 18,
          name: "CAGAYAN",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 19,
          name: "CAMARINES NORTE",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 20,
          name: "CAMARINES SUR",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 21,
          name: "CAMIGUIN",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 22,
          name: "CAPIZ",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 23,
          name: "CATANDUANES",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 24,
          name: "CAVITE",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 25,
          name: "CEBU",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 27,
          name: "COTABATO",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 26,
          name: "DAVAO DE ORO",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 28,
          name: "DAVAO DEL NORTE",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 29,
          name: "DAVAO DEL SUR",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 30,
          name: "DAVAO OCCIDENTAL",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 31,
          name: "DAVAO ORIENTAL",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 32,
          name: "DINAGAT ISLANDS",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 33,
          name: "EASTERN SAMAR",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 34,
          name: "GUIMARAS",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 35,
          name: "IFUGAO",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 36,
          name: "ILOCOS NORTE",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 37,
          name: "ILOCOS SUR",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 38,
          name: "ILOILO",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 39,
          name: "ISABELA",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 40,
          name: "KALINGA",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 41,
          name: "LA UNION",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 42,
          name: "LAGUNA",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 43,
          name: "LANAO DEL NORTE",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 44,
          name: "LANAO DEL SUR",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 45,
          name: "LEYTE",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 46,
          name: "MAGUINDANAO",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 49,
          name: "MANILA",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 47,
          name: "MARINDUQUE",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 48,
          name: "MASBATE",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 58,
          name: "MINDORO OCCIDENTAL",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 59,
          name: "MINDORO ORIENTAL",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 50,
          name: "MISAMIS OCCIDENTAL",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 51,
          name: "MISAMIS ORIENTAL",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 52,
          name: "MOUNTAIN PROVINCE",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 53,
          name: "NEGROS OCCIDENTAL",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 54,
          name: "NEGROS ORIENTAL",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 55,
          name: "NORTHERN SAMAR",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 56,
          name: "NUEVA ECIJA",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 57,
          name: "NUEVA VIZCAYA",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 60,
          name: "PALAWAN",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 61,
          name: "PAMPANGA",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 62,
          name: "PANGASINAN",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 63,
          name: "QUEZON",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 64,
          name: "QUIRINO",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 65,
          name: "RIZAL",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 66,
          name: "ROMBLON",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 67,
          name: "SAMAR",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 68,
          name: "SARANGANI",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 69,
          name: "SIQUIJOR",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 70,
          name: "SORSOGON",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 71,
          name: "SOUTH COTABATO",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 72,
          name: "SOUTHERN LEYTE",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 73,
          name: "SULTAN KUDARAT",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 74,
          name: "SULU",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 75,
          name: "SURIGAO DEL NORTE",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 76,
          name: "SURIGAO DEL SUR",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 77,
          name: "TARLAC",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 78,
          name: "TAWI-TAWI",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 79,
          name: "ZAMBALES",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 80,
          name: "ZAMBOANGA DEL NORTE",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 81,
          name: "ZAMBOANGA DEL SUR",
          label: "PROVINCE"
      },
      {
          countryId: 1,
          provinceId: 82,
          name: "ZAMBOANGA SIBUGAY",
          label: "PROVINCE"
      }
    ])
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('provinces', null, {});
  }
};
