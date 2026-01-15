// API for fetching and processing MOEX stocks data (TQBR board)

export interface StockSpecification {
  secId: string;
  shortName: string;
  lotSize: number;
  minStep: number;
  last: number;
  prevPrice: number;
  valToday: number; // Оборот сегодня (для MVP, в будущем нужна история 20 дней)
}

export interface ProcessedStockSpec {
  secId: string;
  shortName: string;
  lotSize: number;
  minStep: number;
  last: number;
  costOfStep: number; // MINSTEP * LOTSIZE
  commission: number; // LAST * LOTSIZE * COMMISSION_RATE
  valToday: number; // Оборот сегодня
  largeLot1Pct: number; // (VALTODAY * 0.01) / (LAST * LOTSIZE) - округлено до целого
}

export const COMMISSION_RATE = 0.0004; // 0.04% - усредненная комиссия пропов

export async function fetchStocksSpecifications(): Promise<ProcessedStockSpec[]> {
  try {
    const response = await fetch(
      'https://iss.moex.com/iss/engines/stock/markets/shares/boards/TQBR/securities.json?iss.meta=off&iss.only=securities,marketdata&securities.columns=SECID,SHORTNAME,LOTSIZE,MINSTEP,PREVPRICE&marketdata.columns=SECID,LAST,VALTODAY'
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const securities = data.securities.data || [];
    const marketdata = data.marketdata?.data || [];

    // Create a map for quick lookup of market data
    const marketdataMap = new Map<string, { last: number; valToday: number }>();
    const secColumns: string[] = data.securities.columns || [];
    const mdColumns: string[] = data.marketdata?.columns || [];

    marketdata.forEach((row: any[]) => {
      const md: any = {};
      mdColumns.forEach((col, idx) => {
        md[col] = row[idx];
      });
      const secId = md.SECID as string;
      if (secId) {
        marketdataMap.set(secId, {
          last: md.LAST || 0,
          valToday: md.VALTODAY || 0
        });
      }
    });

    // Parse securities
    const stocks: StockSpecification[] = securities.map((row: any[]) => {
      const sec: any = {};
      secColumns.forEach((col, idx) => {
        sec[col] = row[idx];
      });

      const secId = sec.SECID as string;
      const market = marketdataMap.get(secId) || { last: 0, valToday: 0 };

      return {
        secId: secId || '',
        shortName: sec.SHORTNAME || '',
        lotSize: sec.LOTSIZE || 1,
        minStep: sec.MINSTEP || 0,
        last: market.last || sec.PREVPRICE || 0,
        prevPrice: sec.PREVPRICE || 0,
        valToday: market.valToday || 0
      };
    }).filter((stock: StockSpecification) => {
      // Фильтруем только те акции, у которых есть базовая информация
      return stock.secId && stock.lotSize > 0 && stock.minStep > 0 && stock.last > 0;
    });

    // Process stocks with calculations
    const processed: ProcessedStockSpec[] = stocks.map((stock) => {
      const costOfStep = stock.minStep * stock.lotSize;
      const commission = stock.last * stock.lotSize * COMMISSION_RATE;
      
      // LargeLot1Pct: (VALTODAY * 0.01) / (LAST * LOTSIZE)
      const largeLot1Pct = stock.last > 0 && stock.lotSize > 0
        ? Math.round((stock.valToday * 0.01) / (stock.last * stock.lotSize))
        : 0;

      return {
        secId: stock.secId,
        shortName: stock.shortName,
        lotSize: stock.lotSize,
        minStep: stock.minStep,
        last: stock.last,
        costOfStep,
        commission,
        valToday: stock.valToday,
        largeLot1Pct
      };
    });

    // Сортируем по обороту (от большего к меньшему)
    return processed.sort((a, b) => b.valToday - a.valToday);
  } catch (error) {
    console.error('Failed to fetch stocks specifications:', error);
    throw error;
  }
}
