import test from 'ava';
import { runStrategy, BackTestParams } from './strategy'
import demoData from './BTCUSDT.json';
import chalk from 'chalk';
import { isNumber } from 'util';
import { Backtest } from './interfaces.backtest';

const marketData: Backtest.BarData[] = demoData.marketData.map((i) => ({ date: new Date(+i.time), close: +i.price }));

const demoBacktest: BackTestParams = {
    symbol: 'BTCUSDT',
    marketData
};

test.serial('Backtesting strategy', async (t: { is: (arg0: boolean, arg1: boolean) => void; }) => {

    const backTesting = await runStrategy(demoBacktest);
    console.log(chalk.black(`---------------------------------------------------------------------`))
    console.log(chalk.black(`---------------------------------------------------------------------`))
    console.log(chalk.magentaBright(`${JSON.stringify({ capital: backTesting.capital, profit: backTesting.profit, trades: backTesting.totalTrades })}`))
    console.log(chalk.black(`---------------------------------------------------------------------`))
    console.log(chalk.black(`---------------------------------------------------------------------`))
    t.is(isNumber(backTesting.capital), true);

});