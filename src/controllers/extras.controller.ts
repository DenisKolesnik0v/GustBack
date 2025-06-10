import { Request, Response } from 'express';
import CountryModel from '../models/country.model';
import RegionModel from '../models/region.model';

class ExtrasController {
  async getAllCountries(req: Request, res: Response): Promise<void> {
    try {
      const countries = await CountryModel.find().populate('region', 'name').exec();
      res.status(200).json(countries);
    } catch (error) {
      console.error('Error fetching countries:', error);
      res.status(500).json({ message: 'Error fetching countries' });
    }
  }

  async getCountryByName(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.params;
      const country = await CountryModel.findOne({ 'name.en': name }).populate('region', 'name').exec();

      if (!country) {
        res.status(404).json({ message: 'Country not found' });
        return;
      }

      res.status(200).json(country);
    } catch (error) {
      console.error('Error fetching country by name:', error);
      res.status(500).json({ message: 'Error fetching country by name' });
    }
  }

  async getAllRegions(req: Request, res: Response): Promise<void> {
    try {
      const regions = await RegionModel.find().exec();
      res.status(200).json(regions);
    } catch (error) {
      console.error('Error fetching regions:', error);
      res.status(500).json({ message: 'Error fetching regions' });
    }
  }

  async getRegionByName(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.params;
      const region = await RegionModel.findOne({ 'name.en': name }).exec();

      if (!region) {
        res.status(404).json({ message: 'Region not found' });
        return;
      }

      res.status(200).json(region);
    } catch (error) {
      console.error('Error fetching region by name:', error);
      res.status(500).json({ message: 'Error fetching region by name' });
    }
  }

  async getCountriesByRegion(req: Request, res: Response): Promise<void> {
    try {
      const { regionName } = req.params;
      const region = await RegionModel.findOne({ 'name.en': regionName }).exec();

      if (!region) {
        res.status(404).json({ message: 'Region not found' });
        return;
      }

      const countries = await CountryModel.find({ region: region._id }).populate('region', 'name').exec();
      res.status(200).json(countries);
    } catch (error) {
      console.error('Error fetching countries by region:', error);
      res.status(500).json({ message: 'Error fetching countries by region' });
    }
  }
}

export default new ExtrasController();
