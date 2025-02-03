import OpenAI from "openai";
import type { CryptoPrice, NewsArticle, TradingSignal, DailyAnalysis } from "../../client/src/lib/types";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is required");
}

const openai = new OpenAI();

export async function processMessage(
  message: string,
  cryptoData: CryptoPrice[],
  newsData: NewsArticle[]
): Promise<{ message: string; cryptoData: CryptoPrice[]; newsData: NewsArticle[] }> {
  try {
    const systemMessage = `You are an expert cryptocurrency analyst with deep knowledge of technical analysis, market psychology, and blockchain technology. Your role is to:

1. Provide detailed market analysis considering:
   - Price movements and technical indicators (RSI, MACD, Moving Averages)
   - Market sentiment and news impact
   - Historical patterns and correlations between assets
   - On-chain metrics and network activity
   - Market dominance and volume analysis
   - Support and resistance levels based on ATH/ATL data

2. When analyzing potential price movements:
   - Consider the asset's historical performance (ATH/ATL)
   - Evaluate current market conditions and liquidity
   - Analyze trading volume and market depth
   - Compare with broader market trends
   - Factor in market capitalization and supply metrics
   - Target 1% daily gains with appropriate risk management
   - Provide specific entry/exit points and stop-loss levels

3. For specific coin analysis:
   - Compare with relevant competitors
   - Evaluate on-chain metrics and network health
   - Assess market positioning and adoption metrics
   - Analyze volume-to-market-cap ratios
   - Consider circulating supply impact
   - Provide clear buy/sell/hold signals with confidence scores
   - Include risk assessment and potential downsides

Keep responses comprehensive yet accessible, focusing on actionable insights.
When making predictions, explain your reasoning clearly and include supporting data points.

If giving trading signals, structure them clearly in your response like this:
---SIGNALS START---
BTC: [ACTION] at $[PRICE] (Confidence: [SCORE])
Stop Loss: $[PRICE] | Take Profit: $[PRICE]
Reasoning: [Brief explanation]
---SIGNALS END---`;

    const prompt = `Analyze this user message and provide insights using the current market data and news:

User message: ${message}

Current market metrics for tracked cryptocurrencies:
${cryptoData.map(crypto => 
  `${crypto.name} (${crypto.symbol}):
  - Price: $${crypto.current_price}
  - 24h Change: ${crypto.price_change_percentage_24h.toFixed(2)}%
  - Market Cap: $${crypto.market_cap.toLocaleString()}
  - 24h Volume: $${crypto.total_volume.toLocaleString()}
  - Supply: ${crypto.circulating_supply.toLocaleString()}
  - ATH: $${crypto.ath} (${crypto.ath_change_percentage.toFixed(2)}% from ATH)
  - ATL: $${crypto.atl} (${crypto.atl_change_percentage.toFixed(2)}% from ATL)
  - Last Updated: ${new Date(crypto.last_updated).toLocaleString()}`
).join('\n\n')}

Latest news:
${newsData.map(article => 
  `- ${article.title} (${article.source})`
).join('\n')}

Technical Analysis Focus:
1. Identify key support/resistance levels based on ATH/ATL data
2. Analyze volume trends and market depth
3. Consider market dominance and sector rotation
4. Factor in news sentiment impact
5. Target 1% daily gains with appropriate risk management
6. Provide specific trading signals with confidence scores

Provide a detailed analysis that:
1. Directly answers the user's query
2. Includes relevant technical indicators and market metrics
3. Identifies potential opportunities and risks
4. Explains the reasoning behind predictions using data points
5. Considers broader market context and correlations`;

    console.log("Sending request to OpenAI...");
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    if (!response.choices[0].message.content) {
      throw new Error("No response content from OpenAI");
    }

    console.log("Received response from OpenAI");
    const content = response.choices[0].message.content;

    // Parse trading signals if they exist
    const signals: TradingSignal[] = [];
    if (content.includes('---SIGNALS START---') && content.includes('---SIGNALS END---')) {
      const signalsText = content.split('---SIGNALS START---')[1].split('---SIGNALS END---')[0];
      const signalLines = signalsText.split('\n').filter(line => line.trim());

      for (let i = 0; i < signalLines.length; i += 3) {
        const actionLine = signalLines[i];
        const levelsLine = signalLines[i + 1];
        const reasoningLine = signalLines[i + 2];

        if (actionLine && levelsLine && reasoningLine) {
          const [symbol, rest] = actionLine.split(':');
          const action = rest.includes('BUY') ? 'buy' : rest.includes('SELL') ? 'sell' : 'hold';
          const price = parseFloat(rest.match(/\$(\d+(\.\d+)?)/)?.[1] || '0');
          const confidence = parseFloat(rest.match(/Confidence: (0\.\d+)/)?.[1] || '0.5');

          const stopLoss = parseFloat(levelsLine.match(/Stop Loss: \$(\d+(\.\d+)?)/)?.[1] || '0');
          const takeProfit = parseFloat(levelsLine.match(/Take Profit: \$(\d+(\.\d+)?)/)?.[1] || '0');

          const reasoning = reasoningLine.replace('Reasoning:', '').trim();

          signals.push({
            coin_symbol: symbol.trim(),
            action,
            target_price: price,
            stop_loss: stopLoss,
            take_profit: takeProfit,
            confidence_score: confidence,
            reasoning,
            timestamp: new Date().toISOString()
          });
        }
      }
    }

    // Update crypto data with signals
    const updatedCryptoData = cryptoData.map(crypto => {
      const signal = signals.find(s => s.coin_symbol === crypto.symbol);
      return {
        ...crypto,
        trade_signal: signal?.action || 'hold',
        confidence_score: signal?.confidence_score || 0.5
      };
    });

    return {
      message: content,
      cryptoData: updatedCryptoData,
      newsData
    };
  } catch (error) {
    console.error("Error processing message with OpenAI:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to process message: ${error.message}`);
    }
    throw new Error("Failed to process message with AI");
  }
}