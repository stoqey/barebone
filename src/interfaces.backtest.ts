export declare namespace Backtest {
    export interface Position {
        entryTime: Date;
        entryPrice: number;
        profit: number;
        profitAmount: number;
        profitPct: number;
        growth: number;
    }

    export interface BarData {
        reqId: number,
        date: string; // "20190308  11:59:56"
        open: number;
        high: number;
        low: number;
        close: number;
        volume?: number;
        barCount?: number;
        WAP?: number;
        hasGaps?: boolean;
    }

    export interface AnalysePosition {
        bar?: BarData;
        position: Position;
        exitPosition: () => void;
    }

    export interface MarketTick {
        bar?: BarData;
        enterPosition: () => void;
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
