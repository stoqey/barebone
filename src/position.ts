import { Backtest } from "./interfaces.backtest";

interface PositionHolder extends Backtest.Position {
  isOpen: boolean;
  virtualEntryPrice?: number;
  virtualEntryTime?: Date;
  virtualProfit?: number;
}
export class Position implements Backtest.Position {
  public entryPrice: number = 0;
  public profit: number = 0;
  public entryTime: Date = new Date();
  public exitTime?: Date = new Date();

  public virtualEntryPrice?: number;
  public virtualEntryTime?: Date;
  public virtualProfit?: number;

  public tradeType: Backtest.TradeType = "BUY";
  public profitAmount: number = 0;
  public profitPct: number = 0;

  public isOpen: boolean = false;
  private static _instance: Position;

  public static get Instance() {
    return this._instance || (this._instance = new this());
  }

  /**
   * setState virtual state
   */
  public setState(state: PositionHolder): void {
    this.tradeType = state.tradeType;
    this.profitAmount = state.profitAmount;
    this.profitPct = state.profitPct;
    this.entryPrice = state.entryPrice;
    this.profit = state.profit;
    this.entryTime = state.entryTime;
    this.exitTime = state.exitTime;
    this.isOpen = state.isOpen;
    this.virtualEntryPrice = state.virtualEntryPrice;
    this.virtualEntryTime = state.virtualEntryTime;
    this.virtualProfit = state.virtualProfit;
  }

  /**
   * getState
   */
  public getState(): PositionHolder {
    const {
      tradeType,
      profitAmount,
      profitPct,
      entryTime,
      entryPrice,
      profit,
      isOpen,
      exitTime,
      virtualEntryPrice, 
      virtualEntryTime,
      virtualProfit
    } = this;
    return {
      tradeType,
      profitAmount,
      profitPct,
      entryTime,
      entryPrice,
      profit,
      isOpen,
      exitTime,
      virtualEntryPrice,
      virtualEntryTime,
      virtualProfit
    };
  }

  /**
   * updateProfit
   */
  public updateProfit(profit: number) {
    this.profit = profit;
  }
}
