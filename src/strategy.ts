import backtest from '.';
import { Backtest } from './interfaces.backtest';

const dateFormat = "YYYYMMDD hh:mm:ss";

type BarData = Backtest.BarData;

const capital = 1000; // or any amount you want

export interface BackTestParams {
    symbol: string;
    marketData: BarData[],
    // you own custom props here
}


export async function runStrategy(args: BackTestParams): Promise<Backtest.Context> {

    const { marketData: demoData, symbol } = args;

    let marketData: BarData[] = demoData;


    const historyData = [...marketData];

    const backTest = await backtest({
        marketData,
        options: {
            capital,
        },

        strategy: {
            analysePosition: async ({ bar, position, exitPosition }) => {
                // Analyse you position here
                // you exit out of this position if you want
                // And results with P&L(Profit and Loss are) included
            },
            onMarketTick: async ({ bar, enterPosition }) => {
                // Do some code here
                // 
            }
        }

    });

    return backTest;

}