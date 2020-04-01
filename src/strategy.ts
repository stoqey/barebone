import backtest from '.';
import { Backtest } from './interfaces.backtest';

type BarData = Backtest.BarData;

const capital = 8000; // or any amount you want

export interface BackTestParams {
    symbol: string;
    marketData: BarData[],
    // you own custom props here
}

const bitcoinPrice = capital;

export async function runStrategy(args: BackTestParams): Promise<Backtest.Context> {

    const { marketData: demoData, symbol } = args;

    let marketData: BarData[] = demoData;


    const historyData = [...marketData];

    const backTest = await backtest({
        marketData,
        options: {
            capital,
            debug: true,
        },

        strategy: {
            analysePosition: async ({ bar, position, exitPosition }) => {
            },
            onMarketTick: async ({ bar, enterPosition }) => {
                //   SELL
                // if (bar.close < bitcoinPrice) {
                //     console.log('start-----------> ', bar.close)
                //     enterPosition('SELL')
                // }

                // BUY
                if (bar.close > bitcoinPrice) {
                    console.log(`start-----------> ${bar && bar.close}`, )
                    enterPosition('BUY')
                }
            }
        }

    });

    return backTest;

}