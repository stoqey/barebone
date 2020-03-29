/**
 * Get Profit percentage gained
 * // https://www.investopedia.com/ask/answers/how-do-you-calculate-percentage-gain-or-loss-investment/
 * @param startPrice 
 * @param endPrice 
 */
export const getPercentageGain = (startPrice: number, endPrice: number) => {
    return (endPrice - startPrice) / startPrice * 100;
}

/**
 * GetTotalProfitAmount, from start and end
 * @param start 
 * @param end 
 * @param capital 
 */
export const getTotalProfitAmount = (start: number, end: number, capital: number): number => {
    const profit = end - start;
    return (profit / start) * capital;
}