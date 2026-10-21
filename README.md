# Personal Portfolio Optimizer

A Vercel-ready Next.js dashboard for analyzing an existing Indian MF + US equity portfolio.

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Deploy to Vercel

Upload this folder/repository to GitHub and import it into Vercel, or run:

```bash
vercel
```

## Important

The seeded portfolio values are approximate snapshot values from the user's prior portfolio discussion. Replace them with the latest statement values before making investment decisions.

The forecast uses a simple Monte Carlo-style model with editable expected return and volatility. It is intentionally an analytical planning tool, not a guarantee of returns or financial advice.

## Next build
- Add live NAV/market-price adapters.
- Add fund look-through by asset class, geography and sector.
- Add covariance matrix and mean-variance / risk-parity optimizer.
- Add tax-aware rebalancing and SIP-only rebalance suggestions.
- Add import/export for CSV and broker statements.
