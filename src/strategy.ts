import backtest from '.';
import { Backtest } from './interfaces.backtest';

type BarData = Backtest.BarData;

const capital = 1000; // or any amount you want

export interface BackTestParams {
    symbol: string;
    marketData: BarData[],
    // you own custom props here
}

const bitcoinPrice = 8000;

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
                // SELL
                // if(bar.close > position.entryPrice){
                //     exitPosition();
                // }

                // BUY
                // if (bar.close < position.entryPrice) {
                //     console.log('exit-----------> ', bar.close)
                //     exitPosition();
                // }

            },
            onMarketTick: async ({ bar, enterPosition }) => {
                //   SELL
                // if (bar.close < bitcoinPrice) {
                //     console.log('start-----------> ', bar.close)
                //     enterPosition('SELL')
                // }

                // BUY
                if (bar.close > bitcoinPrice) {
                    console.log('start-----------> ', bar.close)
                    enterPosition('BUY')
                }
            }
        }

    });

    return backTest;

}