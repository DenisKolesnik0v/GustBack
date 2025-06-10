import fs from 'fs/promises'; // Используем промисную версию
import mongoose from 'mongoose';
import path from 'path';
import dotenv from 'dotenv';
import RegionModel from './models/region.model.js';
import CountryModel from './models/country.model.js';
dotenv.config();

const REGION_TRANSLATIONS = {
  Africa: 'Африка',
  Americas: 'Америка',
  Asia: 'Азия',
  Europe: 'Европа',
  Oceania: 'Океания',
  Antarctica: 'Антарктида',
};

const FLAG_URL = (code) => `https://flagcdn.com/w320/${code.toLowerCase()}.png`;

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  console.log('Connected to MongoDB');

  await RegionModel.deleteMany({});
  await CountryModel.deleteMany({});
  console.log('Cleared existing regions and countries');

  const filePath = path.resolve('maps.geojson');
  const data = await fs.readFile(filePath, { encoding: 'utf-8' });

  const geojson = JSON.parse(data);

  const regionMap = new Map();
  let createdRegions = 0;
  let createdCountries = 0;

  for (const feature of geojson.features) {
    const props = feature.properties;

    const regionEn = props.region_un || props.region_wb || props.continent || 'Unknown';
    const regionRu = REGION_TRANSLATIONS[regionEn] || regionEn;

    let regionId = regionMap.get(regionEn);
    if (!regionId) {
      const existingRegion = await RegionModel.findOne({ 'name.en': regionEn });
      if (!existingRegion) {
        const regionDoc = await RegionModel.create({
          name: {
            en: regionEn,
            ru: regionRu,
          },
          description: {
            en: '',
            ru: '',
          },
        });
        regionMap.set(regionEn, regionDoc._id);
        regionId = regionDoc._id;
        createdRegions++;
      } else {
        regionMap.set(regionEn, existingRegion._id);
        regionId = existingRegion._id;
      }
    }

    const nameEn = props.name_en || props.name || props.name_sort;
    const nameRu = props.name_ru || props.name || nameEn;
    const countryCode = props.iso_a2;

    if (!nameEn || !countryCode) continue;

    const existingCountry = await CountryModel.findOne({ code: countryCode });
    if (!existingCountry) {
      await CountryModel.create({
        name: {
          en: nameEn,
          ru: nameRu,
        },
        code: countryCode,
        flagUrl: FLAG_URL(countryCode),
        region: regionId,
      });
      createdCountries++;
    }
  }

  console.log(`Created ${createdRegions} regions`);
  console.log(`Created ${createdCountries} countries`);

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

main().catch((err) => {
  console.error('Error:', err);
  mongoose.disconnect();
});
