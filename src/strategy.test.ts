import test from 'ava';
import { runStrategy, BackTestParams } from './strategy'
import demoData from './KRTX.json';
import chalk from 'chalk';
import { isNumber } from 'util';

const demoBacktest: BackTestParams = {
    symbol: 'KRTX',
    marketData: demoData,
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