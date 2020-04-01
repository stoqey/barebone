import isEmpty from 'lodash/isEmpty';
import { Backtest } from './interfaces.backtest';
import { getPercentageGain, getTotalProfitAmount } from './utils';
import { Position } from './position';

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
    const { strategy, marketData, options } = backtestArgs;
    const { onMarketTick, analysePosition } = strategy;

    const { debug } = options;

    const prices = [...marketData]; // new array

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

    let position: Position = Position.Instance;
    let currentBar = null as any;

    const refreshVariables = () => {
        position.setState({
            tradeType: 'BUY',
            profitAmount: 0,
            profitPct: 0,
            entryPrice: 0,
            profit: 0,
            entryTime: new Date(),
            isOpen: false,
        });

        currentBar = null;
    }

    const totalPrices = prices.length;

    // record positions
    const recordPosition = async (): Promise<any> => {
        // Get position 
        // Add calculate profile

        const { tradeType, entryPrice, profit: profitMade } = position.getState();

        // const tradeType = position && position.tradeType;
        // const entryPrice = position && position.entryPrice;
        // const profitMade = (position && position.profit) || 0;
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



        // mutate the position
        position.setState({
            ...(position.getState()),
            profit: profitToSave,
            profitPct: profitPercentage
        });

        log(`profit amount     ------------> ${position.getState().profitAmount}`)
        log(`profit percentage ------------> ${profitPercentage}`)

        return Promise.resolve({});
    }

    // exit a position
    const exitPosition = async (): Promise<any> => {

        const { tradeType, entryPrice, profit: profitMade, isOpen } = position.getState();
        
        if (!isOpen) {
            return console.log('Position is not open', position.getState());
        }

        await recordPosition();


        // const tradeType = position && position.tradeType;
        // const entryPrice = position && position.entryPrice;
        // const profitMade = (position && position.profit) || 0;
        const closePrice = currentBar && currentBar.close || (entryPrice + profitMade);
        const profit: any = profitMade.toFixed(2);


        let profitOfCapitalAmount = 0;
        if (tradeType === 'SELL') {
            profitOfCapitalAmount = getTotalProfitAmount(closePrice, entryPrice, initCapital)
        }
        else {
            // Normal for BUY
            profitOfCapitalAmount = getTotalProfitAmount(entryPrice, closePrice, initCapital)
        }

        if (isNaN(profitOfCapitalAmount)) {
            console.log('profitOfCapitalAmount', { position, currentBar })
            profitOfCapitalAmount = 0;
        };

        position.setState({
            ...(position.getState()),
            profitAmount: profitOfCapitalAmount,
            isOpen: false
        });

        log(`CLOSE ---> ${profit}`);

        // Record position
        context.trades.push({ ...position });

        // finally close position
        refreshVariables();
        return Promise.resolve({})
    }

    // Code to enterPosition
    const enterPosition = (tradeType?: Backtest.TradeType): Promise<any> => {
        // Create position, 
        position.setState({
            tradeType: tradeType || 'BUY', // default is buy by default
            entryPrice: currentBar.close,
            entryTime: currentBar.date,
            profit: 0,
            profitAmount: 0,
            profitPct: 0,
            isOpen: true,
        });

        return Promise.resolve({});
    }

    // Finish trading
    const finishTrading = async (): Promise<Backtest.Context> => {

        const { isOpen: isPositionOpen } = position.getState();
        // Open position close it
        if (isPositionOpen) {
            await exitPosition();
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

    for (const price of prices) {
        // the current bar
        currentBar = price;

        const { isOpen: isPositionOpen } = position.getState();

        // console.log('isPosition open', isPositionOpen);
        // If we are in a position
        if (isPositionOpen) {
            await recordPosition();
            // analyse profit and changes before calling analysePosition
            await analysePosition({ position: position.getState(), exitPosition, bar: currentBar })
        }
        else {
            // On marketTick
            await onMarketTick({ bar: currentBar, enterPosition });
        }
    }

    log(`Finished processing all ${totalPrices} items`)

    return await finishTrading();
};

export default backtest;