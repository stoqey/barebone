import isEmpty from 'lodash/isEmpty';
import { Backtest } from './interfaces.backtest';

export * from './interfaces.backtest';

interface Options {
    capital?: number;
};

interface BackTestArgs {
    marketData: Backtest.BarData[],
    strategy: Backtest.Strategy,
    options: Options
}

const backtest = async (backtestArgs: BackTestArgs): Promise<Backtest.Context> => {
    const { strategy, marketData: prices, options } = backtestArgs;
    const { onMarketTick, analysePosition } = strategy;

    const initCapital = options && options.capital || 1000

    // Context of this trader
    let context: Backtest.Context = {
        trades: [],
        capital: initCapital,
    }

    let position: Backtest.Position = null as any;
    let currentBar = null as any;

    const refreshVariables = () => {
        position = null as any;
        currentBar = null;
    }

    const totalPrices = prices.length;

    // record positions
    const recordPosition = (): void => {
        // Get position 
        // Add calculate profile
        const profit = currentBar.close - position.entryPrice;
        // const profitOfCapitalAmount = (profit / position.entryPrice) * context.capital;

        position = {
            ...position,
            profit,
            // profit: profitOfCapitalAmount,
        }
    }

    // exit a position
    const exitPosition = (): void => {

        recordPosition();

        const profit: any = position.profit.toFixed(2);

        const profitOfCapitalAmount = (profit / position.entryPrice) * context.capital;

        position.profitAmount = profitOfCapitalAmount;

        if (profit > 0.01) {
            console.log(`CLOSE ---> ${profit}`)
        }
        else {
            console.log(`CLOSE ---> ${profit}`)
        }

        // Record position
        context.trades.push(position);

        // finally close position
        return refreshVariables();
    }

    // Code to enterPosition
    const enterPosition = (): void => {
        // Create position, 
        position = {
            entryPrice: currentBar.close,
            entryTime: currentBar.date,
            profit: 0,
            profitAmount: 0,
            profitPct: 0,
            growth: 0
        };
    }

    // Finish trading
    const finishTrading = (): Backtest.Context => {

        // Open position close it
        if (position) {
            exitPosition();
        }

        // return finished trades
        return {
            ...context,
            profit: !isEmpty(context.trades) && context.trades.map(t => t.profitAmount).reduce((acc, curVar) => acc + curVar, 0)  || 0,
            totalTrades: context.trades && context.trades.length | 0
        };
    }

    /***
     * Loopback function 
     * While when have market data keep running, else finish and close any open trade
     * 
     */
    while (prices.length) {

        // the current bar
        currentBar = prices.shift();


        // If we are in a position
        if (position) {
            recordPosition();
            // analyse profit and changes before calling analysePosition
            await analysePosition({ position, exitPosition, bar: currentBar })
        }
        else {
            // On marketTick
            await onMarketTick({ bar: currentBar, enterPosition });
        }
        continue;
    }

    console.log(`Finished processing all ${totalPrices} items`)

    return finishTrading();
};

export default backtest;