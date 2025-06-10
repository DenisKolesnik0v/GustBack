import express from 'express';
import ExtrasController from '../controllers/extras.controller';

const extrasRouter = express.Router();

extrasRouter.get('/countries', ExtrasController.getAllCountries);
extrasRouter.get('/country/:name', ExtrasController.getCountryByName);
extrasRouter.get('/regions', ExtrasController.getAllRegions);
extrasRouter.get('/region/:name', ExtrasController.getRegionByName);
extrasRouter.get('/countries/region/:regionName', ExtrasController.getCountriesByRegion);

export default extrasRouter;
