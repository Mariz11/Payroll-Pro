'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('countries', [
      {
        countryId: 2,
        name: "AFGHANISTAN",
        label: "COUNTRY"
      },
      {
          countryId: 3,
          name: "ALBANIA",
          label: "COUNTRY"
      },
      {
          countryId: 4,
          name: "ALGERIA",
          label: "COUNTRY"
      },
      {
          countryId: 5,
          name: "ANDORRA",
          label: "COUNTRY"
      },
      {
          countryId: 6,
          name: "ANGOLA",
          label: "COUNTRY"
      },
      {
          countryId: 7,
          name: "ANTIGUA AND BARBUDA",
          label: "COUNTRY"
      },
      {
          countryId: 8,
          name: "ARGENTINA",
          label: "COUNTRY"
      },
      {
          countryId: 9,
          name: "ARMENIA",
          label: "COUNTRY"
      },
      {
          countryId: 10,
          name: "AUSTRALIA",
          label: "COUNTRY"
      },
      {
          countryId: 11,
          name: "AUSTRIA",
          label: "COUNTRY"
      },
      {
          countryId: 12,
          name: "AZERBAIJAN",
          label: "COUNTRY"
      },
      {
          countryId: 13,
          name: "BAHAMAS",
          label: "COUNTRY"
      },
      {
          countryId: 14,
          name: "BAHRAIN",
          label: "COUNTRY"
      },
      {
          countryId: 15,
          name: "BANGLADESH",
          label: "COUNTRY"
      },
      {
          countryId: 16,
          name: "BARBADOS",
          label: "COUNTRY"
      },
      {
          countryId: 17,
          name: "BELARUS",
          label: "COUNTRY"
      },
      {
          countryId: 18,
          name: "BELGIUM",
          label: "COUNTRY"
      },
      {
          countryId: 19,
          name: "BELIZE",
          label: "COUNTRY"
      },
      {
          countryId: 20,
          name: "BENIN",
          label: "COUNTRY"
      },
      {
          countryId: 21,
          name: "BHUTAN",
          label: "COUNTRY"
      },
      {
          countryId: 22,
          name: "BOLIVIA",
          label: "COUNTRY"
      },
      {
          countryId: 23,
          name: "BOSNIA AND HERZEGOVINA",
          label: "COUNTRY"
      },
      {
          countryId: 24,
          name: "BOTSWANA",
          label: "COUNTRY"
      },
      {
          countryId: 25,
          name: "BRAZIL",
          label: "COUNTRY"
      },
      {
          countryId: 26,
          name: "BRUNEI",
          label: "COUNTRY"
      },
      {
          countryId: 27,
          name: "BULGARIA",
          label: "COUNTRY"
      },
      {
          countryId: 28,
          name: "BURKINA FASO",
          label: "COUNTRY"
      },
      {
          countryId: 29,
          name: "BURUNDI",
          label: "COUNTRY"
      },
      {
          countryId: 30,
          name: "CABO VERDE",
          label: "COUNTRY"
      },
      {
          countryId: 31,
          name: "CAMBODIA",
          label: "COUNTRY"
      },
      {
          countryId: 32,
          name: "CAMEROON",
          label: "COUNTRY"
      },
      {
          countryId: 33,
          name: "CANADA",
          label: "COUNTRY"
      },
      {
          countryId: 34,
          name: "CENTRAL AFRICAN REPUBLIC",
          label: "COUNTRY"
      },
      {
          countryId: 35,
          name: "CHAD",
          label: "COUNTRY"
      },
      {
          countryId: 36,
          name: "CHILE",
          label: "COUNTRY"
      },
      {
          countryId: 37,
          name: "CHINA",
          label: "COUNTRY"
      },
      {
          countryId: 38,
          name: "COLOMBIA",
          label: "COUNTRY"
      },
      {
          countryId: 39,
          name: "COMOROS",
          label: "COUNTRY"
      },
      {
          countryId: 41,
          name: "COSTA RICA",
          label: "COUNTRY"
      },
      {
          countryId: 42,
          name: "COTE D IVOIRE",
          label: "COUNTRY"
      },
      {
          countryId: 43,
          name: "CROATIA",
          label: "COUNTRY"
      },
      {
          countryId: 44,
          name: "CUBA",
          label: "COUNTRY"
      },
      {
          countryId: 45,
          name: "CYPRUS",
          label: "COUNTRY"
      },
      {
          countryId: 46,
          name: "CZECH REPUBLIC",
          label: "COUNTRY"
      },
      {
          countryId: 47,
          name: "DENMARK",
          label: "COUNTRY"
      },
      {
          countryId: 48,
          name: "DJIBOUTI",
          label: "COUNTRY"
      },
      {
          countryId: 49,
          name: "DOMINICA",
          label: "COUNTRY"
      },
      {
          countryId: 50,
          name: "DOMINICAN REPUBLIC",
          label: "COUNTRY"
      },
      {
          countryId: 51,
          name: "EAST TIMOR (TIMOR-LESTE)",
          label: "COUNTRY"
      },
      {
          countryId: 52,
          name: "ECUADOR",
          label: "COUNTRY"
      },
      {
          countryId: 53,
          name: "EGYPT",
          label: "COUNTRY"
      },
      {
          countryId: 54,
          name: "EL SALVADOR",
          label: "COUNTRY"
      },
      {
          countryId: 55,
          name: "EQUATORIAL GUINEA",
          label: "COUNTRY"
      },
      {
          countryId: 56,
          name: "ERITREA",
          label: "COUNTRY"
      },
      {
          countryId: 57,
          name: "ESTONIA",
          label: "COUNTRY"
      },
      {
          countryId: 58,
          name: "ESWATINI",
          label: "COUNTRY"
      },
      {
          countryId: 59,
          name: "ETHIOPIA",
          label: "COUNTRY"
      },
      {
          countryId: 115,
          name: "FEDERATED STATES OF MICRONESIA",
          label: "COUNTRY"
      },
      {
          countryId: 60,
          name: "FIJI",
          label: "COUNTRY"
      },
      {
          countryId: 61,
          name: "FINLAND",
          label: "COUNTRY"
      },
      {
          countryId: 62,
          name: "FRANCE",
          label: "COUNTRY"
      },
      {
          countryId: 63,
          name: "GABON",
          label: "COUNTRY"
      },
      {
          countryId: 65,
          name: "GEORGIA",
          label: "COUNTRY"
      },
      {
          countryId: 66,
          name: "GERMANY",
          label: "COUNTRY"
      },
      {
          countryId: 67,
          name: "GHANA",
          label: "COUNTRY"
      },
      {
          countryId: 68,
          name: "GREECE",
          label: "COUNTRY"
      },
      {
          countryId: 69,
          name: "GRENADA",
          label: "COUNTRY"
      },
      {
          countryId: 70,
          name: "GUATEMALA",
          label: "COUNTRY"
      },
      {
          countryId: 71,
          name: "GUINEA",
          label: "COUNTRY"
      },
      {
          countryId: 72,
          name: "GUINEA-BISSAU",
          label: "COUNTRY"
      },
      {
          countryId: 73,
          name: "GUYANA",
          label: "COUNTRY"
      },
      {
          countryId: 74,
          name: "HAITI",
          label: "COUNTRY"
      },
      {
          countryId: 75,
          name: "HONDURAS",
          label: "COUNTRY"
      },
      {
          countryId: 76,
          name: "HUNGARY",
          label: "COUNTRY"
      },
      {
          countryId: 77,
          name: "ICELAND",
          label: "COUNTRY"
      },
      {
          countryId: 78,
          name: "INDIA",
          label: "COUNTRY"
      },
      {
          countryId: 79,
          name: "INDONESIA",
          label: "COUNTRY"
      },
      {
          countryId: 80,
          name: "IRAN",
          label: "COUNTRY"
      },
      {
          countryId: 81,
          name: "IRAQ",
          label: "COUNTRY"
      },
      {
          countryId: 82,
          name: "IRELAND",
          label: "COUNTRY"
      },
      {
          countryId: 83,
          name: "ISRAEL",
          label: "COUNTRY"
      },
      {
          countryId: 84,
          name: "ITALY",
          label: "COUNTRY"
      },
      {
          countryId: 85,
          name: "JAMAICA",
          label: "COUNTRY"
      },
      {
          countryId: 86,
          name: "JAPAN",
          label: "COUNTRY"
      },
      {
          countryId: 87,
          name: "JORDAN",
          label: "COUNTRY"
      },
      {
          countryId: 88,
          name: "KAZAKHSTAN",
          label: "COUNTRY"
      },
      {
          countryId: 89,
          name: "KENYA",
          label: "COUNTRY"
      },
      {
          countryId: 90,
          name: "KIRIBATI",
          label: "COUNTRY"
      },
      {
          countryId: 93,
          name: "KOSOVO",
          label: "COUNTRY"
      },
      {
          countryId: 94,
          name: "KUWAIT",
          label: "COUNTRY"
      },
      {
          countryId: 95,
          name: "KYRGYZSTAN",
          label: "COUNTRY"
      },
      {
          countryId: 96,
          name: "LAOS",
          label: "COUNTRY"
      },
      {
          countryId: 97,
          name: "LATVIA",
          label: "COUNTRY"
      },
      {
          countryId: 98,
          name: "LEBANON",
          label: "COUNTRY"
      },
      {
          countryId: 99,
          name: "LESOTHO",
          label: "COUNTRY"
      },
      {
          countryId: 100,
          name: "LIBERIA",
          label: "COUNTRY"
      },
      {
          countryId: 101,
          name: "LIBYA",
          label: "COUNTRY"
      },
      {
          countryId: 102,
          name: "LIECHTENSTEIN",
          label: "COUNTRY"
      },
      {
          countryId: 103,
          name: "LITHUANIA",
          label: "COUNTRY"
      },
      {
          countryId: 104,
          name: "LUXEMBOURG",
          label: "COUNTRY"
      },
      {
          countryId: 105,
          name: "MADAGASCAR",
          label: "COUNTRY"
      },
      {
          countryId: 106,
          name: "MALAWI",
          label: "COUNTRY"
      },
      {
          countryId: 107,
          name: "MALAYSIA",
          label: "COUNTRY"
      },
      {
          countryId: 108,
          name: "MALDIVES",
          label: "COUNTRY"
      },
      {
          countryId: 109,
          name: "MALI",
          label: "COUNTRY"
      },
      {
          countryId: 110,
          name: "MALTA",
          label: "COUNTRY"
      },
      {
          countryId: 111,
          name: "MARSHALL ISLANDS",
          label: "COUNTRY"
      },
      {
          countryId: 112,
          name: "MAURITANIA",
          label: "COUNTRY"
      },
      {
          countryId: 113,
          name: "MAURITIUS",
          label: "COUNTRY"
      },
      {
          countryId: 114,
          name: "MEXICO",
          label: "COUNTRY"
      },
      {
          countryId: 116,
          name: "MOLDOVA",
          label: "COUNTRY"
      },
      {
          countryId: 117,
          name: "MONACO",
          label: "COUNTRY"
      },
      {
          countryId: 118,
          name: "MONGOLIA",
          label: "COUNTRY"
      },
      {
          countryId: 119,
          name: "MONTENEGRO",
          label: "COUNTRY"
      },
      {
          countryId: 120,
          name: "MOROCCO",
          label: "COUNTRY"
      },
      {
          countryId: 121,
          name: "MOZAMBIQUE",
          label: "COUNTRY"
      },
      {
          countryId: 122,
          name: "MYANMAR",
          label: "COUNTRY"
      },
      {
          countryId: 123,
          name: "NAMIBIA",
          label: "COUNTRY"
      },
      {
          countryId: 124,
          name: "NAURU",
          label: "COUNTRY"
      },
      {
          countryId: 125,
          name: "NEPAL",
          label: "COUNTRY"
      },
      {
          countryId: 126,
          name: "NETHERLANDS",
          label: "COUNTRY"
      },
      {
          countryId: 127,
          name: "NEW ZEALAND",
          label: "COUNTRY"
      },
      {
          countryId: 128,
          name: "NICARAGUA",
          label: "COUNTRY"
      },
      {
          countryId: 129,
          name: "NIGER",
          label: "COUNTRY"
      },
      {
          countryId: 130,
          name: "NIGERIA",
          label: "COUNTRY"
      },
      {
          countryId: 91,
          name: "NORTH KOREA",
          label: "COUNTRY"
      },
      {
          countryId: 131,
          name: "NORTH MACEDONIA",
          label: "COUNTRY"
      },
      {
          countryId: 132,
          name: "NORWAY",
          label: "COUNTRY"
      },
      {
          countryId: 133,
          name: "OMAN",
          label: "COUNTRY"
      },
      {
          countryId: 134,
          name: "PAKISTAN",
          label: "COUNTRY"
      },
      {
          countryId: 135,
          name: "PALAU",
          label: "COUNTRY"
      },
      {
          countryId: 136,
          name: "PANAMA",
          label: "COUNTRY"
      },
      {
          countryId: 137,
          name: "PAPUA NEW GUINEA",
          label: "COUNTRY"
      },
      {
          countryId: 138,
          name: "PARAGUAY",
          label: "COUNTRY"
      },
      {
          countryId: 139,
          name: "PERU",
          label: "COUNTRY"
      },
      {
          countryId: 1,
          name: "PHILIPPINES",
          label: "COUNTRY"
      },
      {
          countryId: 141,
          name: "POLAND",
          label: "COUNTRY"
      },
      {
          countryId: 142,
          name: "PORTUGAL",
          label: "COUNTRY"
      },
      {
          countryId: 143,
          name: "QATAR",
          label: "COUNTRY"
      },
      {
          countryId: 40,
          name: "REPUBLIC OF THE CONGO",
          label: "COUNTRY"
      },
      {
          countryId: 144,
          name: "ROMANIA",
          label: "COUNTRY"
      },
      {
          countryId: 145,
          name: "RUSSIA",
          label: "COUNTRY"
      },
      {
          countryId: 146,
          name: "RWANDA",
          label: "COUNTRY"
      },
      {
          countryId: 147,
          name: "SAINT KITTS AND NEVIS",
          label: "COUNTRY"
      },
      {
          countryId: 148,
          name: "SAINT LUCIA",
          label: "COUNTRY"
      },
      {
          countryId: 149,
          name: "SAINT VINCENT AND THE GRENADINES",
          label: "COUNTRY"
      },
      {
          countryId: 150,
          name: "SAMOA",
          label: "COUNTRY"
      },
      {
          countryId: 151,
          name: "SAN MARINO",
          label: "COUNTRY"
      },
      {
          countryId: 152,
          name: "SAO TOME AND PRINCIPE",
          label: "COUNTRY"
      },
      {
          countryId: 153,
          name: "SAUDI ARABIA",
          label: "COUNTRY"
      },
      {
          countryId: 154,
          name: "SENEGAL",
          label: "COUNTRY"
      },
      {
          countryId: 155,
          name: "SERBIA",
          label: "COUNTRY"
      },
      {
          countryId: 156,
          name: "SEYCHELLES",
          label: "COUNTRY"
      },
      {
          countryId: 157,
          name: "SIERRA LEONE",
          label: "COUNTRY"
      },
      {
          countryId: 158,
          name: "SINGAPORE",
          label: "COUNTRY"
      },
      {
          countryId: 159,
          name: "SLOVAKIA",
          label: "COUNTRY"
      },
      {
          countryId: 160,
          name: "SLOVENIA",
          label: "COUNTRY"
      },
      {
          countryId: 161,
          name: "SOLOMON ISLANDS",
          label: "COUNTRY"
      },
      {
          countryId: 162,
          name: "SOMALIA",
          label: "COUNTRY"
      },
      {
          countryId: 163,
          name: "SOUTH AFRICA",
          label: "COUNTRY"
      },
      {
          countryId: 92,
          name: "SOUTH KOREA",
          label: "COUNTRY"
      },
      {
          countryId: 167,
          name: "SOUTH SUDAN",
          label: "COUNTRY"
      },
      {
          countryId: 164,
          name: "SPAIN",
          label: "COUNTRY"
      },
      {
          countryId: 165,
          name: "SRI LANKA",
          label: "COUNTRY"
      },
      {
          countryId: 166,
          name: "SUDAN",
          label: "COUNTRY"
      },
      {
          countryId: 168,
          name: "SURINAME",
          label: "COUNTRY"
      },
      {
          countryId: 169,
          name: "SWEDEN",
          label: "COUNTRY"
      },
      {
          countryId: 170,
          name: "SWITZERLAND",
          label: "COUNTRY"
      },
      {
          countryId: 171,
          name: "SYRIA",
          label: "COUNTRY"
      },
      {
          countryId: 172,
          name: "TAIWAN",
          label: "COUNTRY"
      },
      {
          countryId: 173,
          name: "TAJIKISTAN",
          label: "COUNTRY"
      },
      {
          countryId: 174,
          name: "TANZANIA",
          label: "COUNTRY"
      },
      {
          countryId: 175,
          name: "THAILAND",
          label: "COUNTRY"
      },
      {
          countryId: 64,
          name: "THE GAMBIA",
          label: "COUNTRY"
      },
      {
          countryId: 176,
          name: "TOGO",
          label: "COUNTRY"
      },
      {
          countryId: 177,
          name: "TONGA",
          label: "COUNTRY"
      },
      {
          countryId: 178,
          name: "TRINIDAD AND TOBAGO",
          label: "COUNTRY"
      },
      {
          countryId: 179,
          name: "TUNISIA",
          label: "COUNTRY"
      },
      {
          countryId: 180,
          name: "TURKEY",
          label: "COUNTRY"
      },
      {
          countryId: 181,
          name: "TURKMENISTAN",
          label: "COUNTRY"
      },
      {
          countryId: 182,
          name: "TUVALU",
          label: "COUNTRY"
      },
      {
          countryId: 183,
          name: "UGANDA",
          label: "COUNTRY"
      },
      {
          countryId: 184,
          name: "UKRAINE",
          label: "COUNTRY"
      },
      {
          countryId: 185,
          name: "UNITED ARAB EMIRATES",
          label: "COUNTRY"
      },
      {
          countryId: 186,
          name: "UNITED KINGDOM",
          label: "COUNTRY"
      },
      {
          countryId: 187,
          name: "UNITED STATES OF AMERICA",
          label: "COUNTRY"
      },
      {
          countryId: 188,
          name: "URUGUAY",
          label: "COUNTRY"
      },
      {
          countryId: 189,
          name: "UZBEKISTAN",
          label: "COUNTRY"
      },
      {
          countryId: 190,
          name: "VANUATU",
          label: "COUNTRY"
      },
      {
          countryId: 191,
          name: "VATICAN CITY",
          label: "COUNTRY"
      },
      {
          countryId: 192,
          name: "VENEZUELA",
          label: "COUNTRY"
      },
      {
          countryId: 193,
          name: "VIETNAM",
          label: "COUNTRY"
      },
      {
          countryId: 194,
          name: "YEMEN",
          label: "COUNTRY"
      },
      {
          countryId: 195,
          name: "ZAMBIA",
          label: "COUNTRY"
      },
      {
          countryId: 196,
          name: "ZIMBABWE",
          label: "COUNTRY"
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('countries', null, {});
  }
};
