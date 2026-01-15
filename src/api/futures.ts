// API for fetching and processing FORTS futures data

export interface FuturesContract {
  secId: string;
  shortName: string;
  last: number;
  volume: number;
  assetCode: string;
  expiryDate: string;
  prevPrice: number;
}

export interface ProcessedAsset {
  assetCode: string;
  assetName: string;
  frontMonth: {
    secId: string;
    price: number;
    change: number;
    changePercent: number;
    expiryDate: string;
  };
  nextMonth: {
    secId: string;
    price: number;
    expiryDate: string;
  } | null;
  spread: number; // in %
  spreadAbsolute: number;
  termStructure: 'CONTANGO' | 'BACKWARDATION' | 'FLAT';
  totalVolume: number;
}

export interface FuturesTableRow {
  secId: string;
  shortName: string;
  assetCode: string;
  assetName: string;
  category: 'energy' | 'currency' | 'metals' | 'stocks' | 'indices' | 'other';
  price: number;
  changePercent: number;
  expiryDate: string;
  daysToExpiry: number;
  volume: number;
  openInterest: number;
  termStructure: 'CONTANGO' | 'BACKWARDATION' | 'FLAT' | null;
  spread: number | null;
}

const ASSET_NAMES: { [key: string]: string } = {
  'BR': 'Нефть Brent',
  'Si': 'Доллар США',
  'GOLD': 'Золото',
  'NG': 'Природный газ',
  'GZ': 'Газпром',
  'SBRF': 'Сбербанк',
  'LKOH': 'Лукойл',
  'ROSN': 'Роснефть',
  'GMKR': 'Норникель',
  'VTBR': 'ВТБ',
  'SBER': 'Сбербанк',
  'GAZR': 'Газпром',
  'Eu': 'Евро',
  'AFLT': 'Аэрофлот',
  'MGNT': 'Магнит',
  'YNDX': 'Яндекс',
  'MIX': 'Индекс МосБиржи',
  'RTS': 'Индекс РТС'
};

const ASSET_CATEGORIES: { [key: string]: 'energy' | 'currency' | 'metals' | 'stocks' | 'indices' | 'other' } = {
  'BR': 'energy',
  'NG': 'energy',
  'Si': 'currency',
  'Eu': 'currency',
  'GOLD': 'metals',
  'SILV': 'metals',
  'PALL': 'metals',
  'PLAT': 'metals',
  'GMKR': 'stocks',
  'LKOH': 'stocks',
  'ROSN': 'stocks',
  'GAZR': 'stocks',
  'SBER': 'stocks',
  'SBRF': 'stocks',
  'VTBR': 'stocks',
  'GZ': 'stocks',
  'AFLT': 'stocks',
  'MGNT': 'stocks',
  'YNDX': 'stocks',
  'MIX': 'indices',
  'RTS': 'indices'
};

const CATEGORY_NAMES: { [key: string]: string } = {
  'energy': 'Энергетика',
  'currency': 'Валюта',
  'metals': 'Металлы',
  'stocks': 'Акции',
  'indices': 'Индексы',
  'other': 'Прочее'
};

const LIQUIDITY_THRESHOLD = 1_000_000; // 1M RUB (lowered for better visibility)

export async function fetchFuturesData(): Promise<ProcessedAsset[]> {
  try {
    const response = await fetch(
      'https://iss.moex.com/iss/engines/futures/markets/forts/securities.json?iss.meta=off&iss.only=securities&securities.columns=SECID,SHORTNAME,LAST,VOLTODAY,ASSETCODE,LASTDELDATE,PREVPRICE'
    );

    if (!response.ok) {
      console.log('MOEX API response not OK:', response.status);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const securities = data.securities.data;
    
    console.log('Total securities from MOEX:', securities.length);

    // Parse raw data
    const contracts: FuturesContract[] = securities
      .map((row: any[]) => {
        const [secId, shortName, last, volume, assetCode, expiryDate, prevPrice] = row;
        
        // Use LAST if available, otherwise PREVPRICE
        const price = (last && last > 0) ? last : (prevPrice || 0);
        
        return {
          secId: secId || '',
          shortName: shortName || '',
          last: price,
          volume: volume || 0,
          assetCode: assetCode || '',
          expiryDate: expiryDate || '',
          prevPrice: prevPrice || 0
        };
      })
      .filter((c: FuturesContract) => {
        // Filter criteria:
        // 1. Must have asset code
        // 2. Must have some price (LAST or PREVPRICE)
        // 3. Must have expiry date
        // 4. Must not be expired yet
        const hasAssetCode = c.assetCode && c.assetCode.length > 0;
        const hasPrice = c.last > 0;
        const hasExpiryDate = c.expiryDate && c.expiryDate.length > 0;
        const notExpired = hasExpiryDate && new Date(c.expiryDate) > new Date();
        
        return hasAssetCode && hasPrice && hasExpiryDate && notExpired;
      });
      
    console.log('Filtered contracts:', contracts.length);

    // Group by asset code
    const grouped = groupByAsset(contracts);
    console.log('Asset groups:', grouped.size);
    
    // Process each group
    const processed = processGroups(grouped);
    console.log('Processed assets:', processed.length);
    
    // Sort by liquidity (descending)
    processed.sort((a, b) => b.totalVolume - a.totalVolume);
    
    // If no data, return mock
    if (processed.length === 0) {
      console.log('No processed data, returning mock');
      return getMockFuturesData();
    }
    
    return processed;
  } catch (error) {
    console.error('Failed to fetch futures data:', error);
    return getMockFuturesData();
  }
}

function groupByAsset(contracts: FuturesContract[]): Map<string, FuturesContract[]> {
  const groups = new Map<string, FuturesContract[]>();
  
  contracts.forEach(contract => {
    if (!groups.has(contract.assetCode)) {
      groups.set(contract.assetCode, []);
    }
    groups.get(contract.assetCode)!.push(contract);
  });
  
  return groups;
}

function processGroups(groups: Map<string, FuturesContract[]>): ProcessedAsset[] {
  const result: ProcessedAsset[] = [];
  
  groups.forEach((contracts, assetCode) => {
    // Calculate total volume
    const totalVolume = contracts.reduce((sum, c) => sum + c.volume, 0);
    
    // Filter out low liquidity assets
    if (totalVolume < LIQUIDITY_THRESHOLD) {
      return;
    }
    
    // Sort by expiry date
    const sorted = contracts.sort((a, b) => 
      new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
    );
    
    if (sorted.length === 0) return;
    
    // Find Front Month (nearest expiry with highest volume)
    const frontMonth = sorted[0];
    
    // Find Next Month (next expiry)
    const nextMonth = sorted.length > 1 ? sorted[1] : null;
    
    // Calculate spread
    let spread = 0;
    let spreadAbsolute = 0;
    let termStructure: 'CONTANGO' | 'BACKWARDATION' | 'FLAT' = 'FLAT';
    
    if (nextMonth) {
      spreadAbsolute = nextMonth.last - frontMonth.last;
      spread = (spreadAbsolute / frontMonth.last) * 100;
      
      if (spread > 0.5) {
        termStructure = 'CONTANGO';
      } else if (spread < -0.5) {
        termStructure = 'BACKWARDATION';
      }
    }
    
    // Calculate change
    const change = frontMonth.last - frontMonth.prevPrice;
    const changePercent = frontMonth.prevPrice > 0 
      ? (change / frontMonth.prevPrice) * 100 
      : 0;
    
    result.push({
      assetCode,
      assetName: ASSET_NAMES[assetCode] || assetCode,
      frontMonth: {
        secId: frontMonth.secId,
        price: frontMonth.last,
        change,
        changePercent,
        expiryDate: frontMonth.expiryDate
      },
      nextMonth: nextMonth ? {
        secId: nextMonth.secId,
        price: nextMonth.last,
        expiryDate: nextMonth.expiryDate
      } : null,
      spread,
      spreadAbsolute,
      termStructure,
      totalVolume
    });
  });
  
  return result;
}

function getMockFuturesData(): ProcessedAsset[] {
  return [
    {
      assetCode: 'BR',
      assetName: 'Нефть Brent',
      frontMonth: {
        secId: 'BRF6',
        price: 85.40,
        change: 1.20,
        changePercent: 1.43,
        expiryDate: '2026-02-15'
      },
      nextMonth: {
        secId: 'BRG6',
        price: 84.20,
        expiryDate: '2026-03-15'
      },
      spread: -1.41,
      spreadAbsolute: -1.20,
      termStructure: 'BACKWARDATION',
      totalVolume: 450_000_000
    },
    {
      assetCode: 'Si',
      assetName: 'Доллар США',
      frontMonth: {
        secId: 'SiF6',
        price: 92.50,
        change: -0.30,
        changePercent: -0.32,
        expiryDate: '2026-02-20'
      },
      nextMonth: {
        secId: 'SiG6',
        price: 93.20,
        expiryDate: '2026-03-20'
      },
      spread: 0.76,
      spreadAbsolute: 0.70,
      termStructure: 'CONTANGO',
      totalVolume: 380_000_000
    },
    {
      assetCode: 'GOLD',
      assetName: 'Золото',
      frontMonth: {
        secId: 'GOLDF6',
        price: 2050.00,
        change: 15.50,
        changePercent: 0.76,
        expiryDate: '2026-02-18'
      },
      nextMonth: {
        secId: 'GOLDG6',
        price: 2055.00,
        expiryDate: '2026-03-18'
      },
      spread: 0.24,
      spreadAbsolute: 5.00,
      termStructure: 'FLAT',
      totalVolume: 120_000_000
    },
    {
      assetCode: 'GZ',
      assetName: 'Газпром',
      frontMonth: {
        secId: 'GZF6',
        price: 180.50,
        change: -2.30,
        changePercent: -1.26,
        expiryDate: '2026-02-15'
      },
      nextMonth: {
        secId: 'GZG6',
        price: 181.80,
        expiryDate: '2026-03-15'
      },
      spread: 0.72,
      spreadAbsolute: 1.30,
      termStructure: 'CONTANGO',
      totalVolume: 95_000_000
    }
  ];
}

// New function to fetch ALL futures contracts for the table
export async function fetchAllFuturesContracts(): Promise<FuturesTableRow[]> {
  try {
    const response = await fetch(
      'https://iss.moex.com/iss/engines/futures/markets/forts/securities.json?iss.meta=off&iss.only=securities,marketdata&securities.columns=SECID,SHORTNAME,ASSETCODE,LASTDELDATE,PREVPRICE&marketdata.columns=SECID,LAST,VOLTODAY,OPENPOSITION,CHANGE'
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const securities = data.securities.data;
    const marketdata = data.marketdata?.data || [];
    
    // Create a map for quick lookup of market data
    const marketdataMap = new Map<string, any>();
    marketdata.forEach((row: any[]) => {
      const [secId, last, volume, openPosition, change] = row;
      marketdataMap.set(secId, { last, volume, openPosition, change });
    });
    
    const today = new Date();
    
    const allContracts: FuturesTableRow[] = securities
      .map((row: any[]) => {
        const [secId, shortName, assetCode, expiryDate, prevPrice] = row;
        const market = marketdataMap.get(secId) || {};
        
        const price = (market.last && market.last > 0) ? market.last : (prevPrice || 0);
        const change = market.change || (price - prevPrice);
        const changePercent = prevPrice > 0 ? (change / prevPrice) * 100 : 0;
        
        const expiry = new Date(expiryDate);
        const daysToExpiry = Math.max(0, Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
        
        return {
          secId: secId || '',
          shortName: shortName || '',
          assetCode: assetCode || '',
          assetName: ASSET_NAMES[assetCode] || assetCode,
          category: ASSET_CATEGORIES[assetCode] || 'other',
          price,
          changePercent,
          expiryDate: expiryDate || '',
          daysToExpiry,
          volume: market.volume || 0,
          openInterest: market.openPosition || 0,
          termStructure: null,
          spread: null
        };
      })
      .filter((row: FuturesTableRow) => {
        return row.assetCode && row.price > 0 && row.daysToExpiry > 0;
      });
    
    // Calculate term structure for each contract by comparing with next contract
    const grouped = new Map<string, FuturesTableRow[]>();
    allContracts.forEach(contract => {
      if (!grouped.has(contract.assetCode)) {
        grouped.set(contract.assetCode, []);
      }
      grouped.get(contract.assetCode)!.push(contract);
    });
    
    grouped.forEach(contracts => {
      contracts.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
      
      for (let i = 0; i < contracts.length; i++) {
        if (i < contracts.length - 1) {
          const current = contracts[i];
          const next = contracts[i + 1];
          const spread = ((next.price - current.price) / current.price) * 100;
          
          current.spread = spread;
          if (spread > 0.5) {
            current.termStructure = 'CONTANGO';
          } else if (spread < -0.5) {
            current.termStructure = 'BACKWARDATION';
          } else {
            current.termStructure = 'FLAT';
          }
        }
      }
    });
    
    // Sort by expiry date (nearest first)
    allContracts.sort((a, b) => a.daysToExpiry - b.daysToExpiry);
    
    return allContracts;
  } catch (error) {
    console.error('Failed to fetch all futures contracts:', error);
    return getMockTableData();
  }
}

function getMockTableData(): FuturesTableRow[] {
  return [
    {
      secId: 'BRF6',
      shortName: 'BR-2.26',
      assetCode: 'BR',
      assetName: 'Нефть Brent',
      category: 'energy',
      price: 85.40,
      changePercent: 1.43,
      expiryDate: '2026-02-15',
      daysToExpiry: 35,
      volume: 450_000_000,
      openInterest: 12500,
      termStructure: 'BACKWARDATION',
      spread: -1.41
    },
    {
      secId: 'BRG6',
      shortName: 'BR-3.26',
      assetCode: 'BR',
      assetName: 'Нефть Brent',
      category: 'energy',
      price: 84.20,
      changePercent: 0.84,
      expiryDate: '2026-03-15',
      daysToExpiry: 63,
      volume: 300_000_000,
      openInterest: 8200,
      termStructure: 'FLAT',
      spread: 0.12
    },
    {
      secId: 'SiF6',
      shortName: 'Si-2.26',
      assetCode: 'Si',
      assetName: 'Доллар США',
      category: 'currency',
      price: 92.50,
      changePercent: -0.32,
      expiryDate: '2026-02-20',
      daysToExpiry: 40,
      volume: 380_000_000,
      openInterest: 95000,
      termStructure: 'CONTANGO',
      spread: 0.76
    },
    {
      secId: 'SiG6',
      shortName: 'Si-3.26',
      assetCode: 'Si',
      assetName: 'Доллар США',
      category: 'currency',
      price: 93.20,
      changePercent: 0.32,
      expiryDate: '2026-03-20',
      daysToExpiry: 68,
      volume: 250_000_000,
      openInterest: 72000,
      termStructure: 'FLAT',
      spread: 0.32
    },
    {
      secId: 'GOLDF6',
      shortName: 'GOLD-2.26',
      assetCode: 'GOLD',
      assetName: 'Золото',
      category: 'metals',
      price: 2050.00,
      changePercent: 0.76,
      expiryDate: '2026-02-18',
      daysToExpiry: 38,
      volume: 120_000_000,
      openInterest: 3200,
      termStructure: 'FLAT',
      spread: 0.24
    },
    {
      secId: 'GOLDG6',
      shortName: 'GOLD-3.26',
      assetCode: 'GOLD',
      assetName: 'Золото',
      category: 'metals',
      price: 2055.00,
      changePercent: 0.73,
      expiryDate: '2026-03-18',
      daysToExpiry: 66,
      volume: 80_000_000,
      openInterest: 2100,
      termStructure: 'CONTANGO',
      spread: 0.49
    }
  ];
}

export { CATEGORY_NAMES };
