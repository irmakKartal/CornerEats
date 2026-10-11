import express from 'express';
import { getRates, getRate, getLastUpdated, refreshRates } from '../services/currencyService.js';

const currencyRouter = express.Router();

currencyRouter.get('/rates', async (_req, res) => {
  try {
    let rates = getRates();
    if (!getLastUpdated()) {
      rates = await refreshRates();
    }
    res.json({
      success: true,
      base: 'USD',
      rates,
      updatedAt: getLastUpdated(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Unable to retrieve exchange rates',
      error: error.message,
    });
  }
});

currencyRouter.get('/rate/:code', (req, res) => {
  const code = req.params.code?.toUpperCase();
  const rate = getRate(code);
  res.json({
    success: true,
    code,
    rate,
  });
});

export default currencyRouter;
