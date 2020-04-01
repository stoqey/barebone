import { Backtest } from './interfaces.backtest';

export class Position implements Backtest.Position {
    
    public entryPrice: number = 0;
    public profit: number = 0;
    public entryTime: Date = new Date();

    public tradeType: Backtest.TradeType = 'BUY';
    public profitAmount: number = 0;
    public profitPct: number = 0;

    private static _instance: Position;

    public static get Instance() {
        return this._instance || (this._instance = new this());
    }

    /**
     * setState virtual state
     */
    public setState(state: Backtest.Position) {
        this.tradeType = state.tradeType;
        this.profitAmount = state.profitAmount;
        this.profitPct = state.profitPct;
        this.entryPrice = state.entryPrice;
        this.profit = state.profit;
        this.entryTime = state.entryTime;
    };

    /**
     * getState
     */
    public getState(): Backtest.Position {
        const { tradeType, profitAmount, profitPct, entryTime, entryPrice, profit } = this;
        return { tradeType, profitAmount, profitPct, entryTime, entryPrice, profit }
    }

    /**
     * updateProfit
     */
    public updateProfit(profit: number) {
        this.profit = profit;
    }

}