# Crypto Intelligence Assistant

An intelligent cryptocurrency analysis platform that combines real-time market data with AI-powered insights. Built with React, Node.js, and TypeScript.

## Features

- Real-time cryptocurrency market data analysis
- AI-powered market insights using OpenAI GPT-4
- Interactive chat interface
- Dynamic price charts and visualizations
- Memphis-style design with interactive UI elements

## Tech Stack

- Frontend: React with TypeScript
- Backend: Node.js/Express
- Database: PostgreSQL with Drizzle ORM
- APIs: CoinGecko and OpenAI
- Styling: Tailwind CSS with shadcn/ui

## Prerequisites

- Node.js 20.x or higher
- PostgreSQL database
- OpenAI API key
- CryptoCompare API key

## Environment Variables

Create a `.env` file with the following variables:

```env
DATABASE_URL=your_postgresql_database_url
OPENAI_API_KEY=your_openai_api_key
CRYPTOCOMPARE_API_KEY=your_cryptocompare_api_key
```

## Installation

1. Clone the repository:
```bash
git clone [your-repo-url]
cd crypto-intelligence-assistant
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`.

## Deployment

This project is configured for deployment on Render. See `render.yaml` for deployment configuration.

## License

MIT
