export declare namespace Backtest {
    export type TradeType = 'BUY' | 'SELL';
    export interface Position {
        tradeType: TradeType;
        entryTime: Date;
        entryPrice: number;
        profit: number;
        profitAmount: number;
        profitPct: number;
    }

    export interface BarData {
        date: Date;
        close: number;
        volume?: number;
    }

    export interface AnalysePosition {
        bar: BarData;
        position: Position;
        exitPosition: () => Promise<any>;
    }

    export interface MarketTick {
        bar: BarData;
        enterPosition: (tradeType?: TradeType) => Promise<any>;
    }

    export interface Strategy {
        analysePosition: (analyseArgs: AnalysePosition) => Promise<any>,
        onMarketTick: (marketTickArgs: MarketTick) => Promise<any>
    }

    export interface Context {
        trades: Position[];
        capital: number;
        profit?: number;
        totalTrades?: number;
    }

}

export default Backtest;
