import isEmpty from 'lodash/isEmpty';
import { Backtest } from './interfaces.backtest';
import { getPercentageGain, getTotalProfitAmount } from './utils';

export * from './interfaces.backtest';

interface Options {
    capital?: number;
    debug?: boolean;
};

interface BackTestArgs {
    marketData: Backtest.BarData[],
    strategy: Backtest.Strategy,
    options: Options
}

const backtest = async (backtestArgs: BackTestArgs): Promise<Backtest.Context> => {
    const { strategy, marketData: prices, options } = backtestArgs;
    const { onMarketTick, analysePosition } = strategy;

    const { debug } = options;

    /**
     * Log function
     * @param itemTolog 
     */
    const log = (itemTolog: any) => {
        if (debug && itemTolog) {
            console.log(itemTolog)
        };
        return;
    }

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


        const tradeType = position && position.tradeType;
        const entryPrice = position && position.entryPrice;
        const profitMade = (position && position.profit) || 0;
        const closePrice = currentBar && currentBar.close || (entryPrice + profitMade);


        const profitToSave = (() => {
            // calculate profit Sell types
            if (tradeType === 'SELL') {
                return entryPrice - closePrice;
            };
            // default for is BUY
            return closePrice - entryPrice;
        })();

        const { startPrice, endPrice } = ((): any => {
            if (tradeType === 'SELL') {
                return {
                    startPrice: closePrice,
                    endPrice: entryPrice
                }
            }
            // Default for BUY
            return {
                startPrice: entryPrice,
                endPrice: closePrice
            }
        })();

        const profitPercentage = getPercentageGain(startPrice, endPrice);

        log(`profit amount     ------------> ${profitToSave}`)
        log(`profit percentage ------------> ${profitPercentage}`)


        position.profit = profitToSave;
        position.profitPct = profitPercentage;

    }

    // exit a position
    const exitPosition = (): void => {

        recordPosition();

        const tradeType = position && position.tradeType;
        
        const profit: any = position.profit.toFixed(2);

        const profitOfCapitalAmount = (() => {
            if (tradeType === 'SELL') {
                return getTotalProfitAmount(currentBar.close, position.entryPrice, initCapital)
            }
            // Normal for BUY
            return getTotalProfitAmount(position.entryPrice, currentBar.close, initCapital)
        })();

        position.profitAmount = profitOfCapitalAmount;

        log(`CLOSE ---> ${profit}`);

        // Record position
        context.trades.push(position);

        // finally close position
        return refreshVariables();
    }

    // Code to enterPosition
    const enterPosition = (tradeType?: Backtest.TradeType): void => {
        // Create position, 
        position = {
            tradeType: tradeType || 'BUY', // default is buy by default
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
            profit: !isEmpty(context.trades) && context.trades.map(t => t.profitAmount).reduce((acc, curVar) => acc + curVar, 0) || 0,
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

    log(`Finished processing all ${totalPrices} items`)

    return finishTrading();
};

export default backtest;