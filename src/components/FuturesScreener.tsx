import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, TrendingUp, TrendingDown, X, Calendar, Activity, BarChart3 } from 'lucide-react';

interface FuturesContract {
  contractCode: string; // e.g., "NG-9.25"
  expirationDate: string; // "дд.мм.гггг"
  lastPrice: number;
  volume: number;
  openInterest: number;
  daysToExpiration: number;
}

interface BaseAsset {
  ticker: string; // "NG"
  name: string; // "Natural Gas"
  frontContract: string; // "NG-9.25"
  currentPrice: number;
  priceChange: number; // percentage
  totalVolume: number;
  sparklineData: number[]; // 24h mini chart data
  contracts: FuturesContract[];
}

const FuturesScreener: React.FC = () => {
  const [selectedAsset, setSelectedAsset] = useState<BaseAsset | null>(null);

  // Mock Data - Realistic Futures Data
  const assets: BaseAsset[] = [
    {
      ticker: 'NG',
      name: 'Natural Gas',
      frontContract: 'NG-09.25',
      currentPrice: 2.847,
      priceChange: 3.24,
      totalVolume: 458623,
      sparklineData: [2.75, 2.78, 2.76, 2.82, 2.85, 2.89, 2.87, 2.85, 2.84, 2.83, 2.85, 2.87],
      contracts: [
        { contractCode: 'NG-09.25', expirationDate: '26.09.2025', lastPrice: 2.847, volume: 184532, openInterest: 523841, daysToExpiration: 15 },
        { contractCode: 'NG-10.25', expirationDate: '28.10.2025', lastPrice: 2.912, volume: 89234, openInterest: 412563, daysToExpiration: 47 },
        { contractCode: 'NG-11.25', expirationDate: '26.11.2025', lastPrice: 2.985, volume: 67823, openInterest: 389421, daysToExpiration: 76 },
        { contractCode: 'NG-12.25', expirationDate: '29.12.2025', lastPrice: 3.067, volume: 52341, openInterest: 295634, daysToExpiration: 109 },
        { contractCode: 'NG-01.26', expirationDate: '28.01.2026', lastPrice: 3.124, volume: 34523, openInterest: 178923, daysToExpiration: 139 },
        { contractCode: 'NG-02.26', expirationDate: '25.02.2026', lastPrice: 3.089, volume: 18934, openInterest: 123456, daysToExpiration: 167 },
        { contractCode: 'NG-03.26', expirationDate: '30.03.2026', lastPrice: 2.956, volume: 12456, openInterest: 89342, daysToExpiration: 200 },
      ]
    },
    {
      ticker: 'BR',
      name: 'Brent Oil',
      frontContract: 'BR-10.25',
      currentPrice: 74.82,
      priceChange: -1.87,
      totalVolume: 723489,
      sparklineData: [76.2, 76.5, 75.8, 75.3, 75.1, 74.9, 74.7, 75.0, 74.8, 74.6, 74.7, 74.82],
      contracts: [
        { contractCode: 'BR-10.25', expirationDate: '30.10.2025', lastPrice: 74.82, volume: 289345, openInterest: 687234, daysToExpiration: 49 },
        { contractCode: 'BR-11.25', expirationDate: '28.11.2025', lastPrice: 74.56, volume: 156782, openInterest: 523891, daysToExpiration: 78 },
        { contractCode: 'BR-12.25', expirationDate: '31.12.2025', lastPrice: 74.28, volume: 112456, openInterest: 456123, daysToExpiration: 111 },
        { contractCode: 'BR-01.26', expirationDate: '30.01.2026', lastPrice: 73.95, volume: 78234, openInterest: 378945, daysToExpiration: 141 },
        { contractCode: 'BR-02.26', expirationDate: '27.02.2026', lastPrice: 73.64, volume: 48923, openInterest: 267834, daysToExpiration: 169 },
        { contractCode: 'BR-03.26', expirationDate: '31.03.2026', lastPrice: 73.38, volume: 23456, openInterest: 145678, daysToExpiration: 201 },
      ]
    },
    {
      ticker: 'GC',
      name: 'Gold',
      frontContract: 'GC-12.25',
      currentPrice: 2634.50,
      priceChange: 0.78,
      totalVolume: 312456,
      sparklineData: [2610, 2615, 2620, 2625, 2628, 2632, 2630, 2631, 2633, 2635, 2634, 2634.5],
      contracts: [
        { contractCode: 'GC-12.25', expirationDate: '29.12.2025', lastPrice: 2634.50, volume: 145678, openInterest: 892345, daysToExpiration: 109 },
        { contractCode: 'GC-02.26', expirationDate: '26.02.2026', lastPrice: 2638.20, volume: 78923, openInterest: 567234, daysToExpiration: 168 },
        { contractCode: 'GC-04.26', expirationDate: '29.04.2026', lastPrice: 2642.80, volume: 45612, openInterest: 423891, daysToExpiration: 230 },
        { contractCode: 'GC-06.26', expirationDate: '26.06.2026', lastPrice: 2647.30, volume: 28934, openInterest: 312456, daysToExpiration: 288 },
        { contractCode: 'GC-08.26', expirationDate: '27.08.2026', lastPrice: 2651.90, volume: 13309, openInterest: 189234, daysToExpiration: 350 },
      ]
    },
    {
      ticker: 'ES',
      name: 'S&P 500 E-mini',
      frontContract: 'ES-12.25',
      currentPrice: 5847.25,
      priceChange: 1.45,
      totalVolume: 1823456,
      sparklineData: [5760, 5780, 5795, 5810, 5820, 5825, 5830, 5835, 5840, 5843, 5845, 5847.25],
      contracts: [
        { contractCode: 'ES-12.25', expirationDate: '19.12.2025', lastPrice: 5847.25, volume: 923456, openInterest: 2345678, daysToExpiration: 99 },
        { contractCode: 'ES-03.26', expirationDate: '20.03.2026', lastPrice: 5852.75, volume: 512389, openInterest: 1567234, daysToExpiration: 190 },
        { contractCode: 'ES-06.26', expirationDate: '19.06.2026', lastPrice: 5858.50, volume: 278945, openInterest: 892345, daysToExpiration: 281 },
        { contractCode: 'ES-09.26', expirationDate: '18.09.2026', lastPrice: 5864.00, volume: 108666, openInterest: 456789, daysToExpiration: 372 },
      ]
    },
    {
      ticker: 'SI',
      name: 'RUB/USD (Si)',
      frontContract: 'SI-12.25',
      currentPrice: 92.845,
      priceChange: -0.34,
      totalVolume: 567234,
      sparklineData: [93.2, 93.1, 93.0, 92.95, 92.9, 92.88, 92.87, 92.85, 92.84, 92.83, 92.84, 92.845],
      contracts: [
        { contractCode: 'SI-12.25', expirationDate: '15.12.2025', lastPrice: 92.845, volume: 234567, openInterest: 678345, daysToExpiration: 95 },
        { contractCode: 'SI-03.26', expirationDate: '16.03.2026', lastPrice: 93.125, volume: 156234, openInterest: 456782, daysToExpiration: 186 },
        { contractCode: 'SI-06.26', expirationDate: '15.06.2026', lastPrice: 93.420, volume: 98234, openInterest: 312456, daysToExpiration: 277 },
        { contractCode: 'SI-09.26', expirationDate: '15.09.2026', lastPrice: 93.715, volume: 78199, openInterest: 198234, daysToExpiration: 369 },
      ]
    }
  ];

  const maxVolume = Math.max(...assets.flatMap(a => a.contracts.map(c => c.volume)));
  const maxOI = Math.max(...assets.flatMap(a => a.contracts.map(c => c.openInterest)));

  const renderSparkline = (data: number[]) => {
    const width = 80;
    const height = 30;
    const padding = 2;
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * (width - 2 * padding) + padding;
      const y = height - padding - ((value - min) / range) * (height - 2 * padding);
      return `${x},${y}`;
    }).join(' ');
    
    const isPositive = data[data.length - 1] > data[0];
    
    return (
      <svg width={width} height={height} className="inline-block">
        <polyline
          points={points}
          fill="none"
          stroke={isPositive ? '#10b981' : '#ef4444'}
          strokeWidth="2"
        />
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-[#E5E7EB] p-6">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Futures Screener - Срочный Рынок
          </h1>
          <p className="text-sm text-gray-600">
            Анализ фьючерсных контрактов • Front Month & Term Structure
          </p>
        </div>

        {/* Main Screener Table */}
        <div className="bg-[#F3F4F6] border border-[#D1D5DB] rounded-none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#E5E7EB] border-b-2 border-[#D1D5DB]">
                <tr>
                  <th className="text-left px-3 py-2 text-[11px] font-bold text-gray-800 uppercase">Тикер</th>
                  <th className="text-left px-3 py-2 text-[11px] font-bold text-gray-800 uppercase">Название</th>
                  <th className="text-left px-3 py-2 text-[11px] font-bold text-gray-800 uppercase">Front Contract</th>
                  <th className="text-right px-3 py-2 text-[11px] font-bold text-gray-800 uppercase">Цена</th>
                  <th className="text-center px-3 py-2 text-[11px] font-bold text-gray-800 uppercase">Изменение</th>
                  <th className="text-right px-3 py-2 text-[11px] font-bold text-gray-800 uppercase">Объем</th>
                  <th className="text-center px-3 py-2 text-[11px] font-bold text-gray-800 uppercase">24h</th>
                  <th className="text-center px-3 py-2 text-[11px] font-bold text-gray-800 uppercase"></th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-[#E5E7EB] hover:bg-white cursor-pointer transition-colors"
                    onClick={() => setSelectedAsset(asset)}
                  >
                    <td className="px-3 py-2">
                      <span className="text-sm font-bold text-gray-800 font-mono">{asset.ticker}</span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-sm text-gray-700">{asset.name}</span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-[11px] text-gray-600 font-mono">{asset.frontContract}</span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span className="text-sm font-bold text-gray-800 font-mono">
                        {asset.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                        asset.priceChange >= 0 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {asset.priceChange >= 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {asset.priceChange >= 0 ? '+' : ''}{asset.priceChange.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span className="text-[11px] text-gray-700 font-mono">
                        {asset.totalVolume.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      {renderSparkline(asset.sparklineData)}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side Drawer - Term Structure Details */}
        <AnimatePresence>
          {selectedAsset && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/30 z-40"
                onClick={() => setSelectedAsset(null)}
              />
              
              {/* Drawer */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed right-0 top-0 bottom-0 w-[900px] bg-white shadow-2xl z-50 overflow-y-auto"
              >
                {/* Drawer Header */}
                <div className="sticky top-0 bg-[#F3F4F6] border-b-2 border-[#D1D5DB] p-4 z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-800">
                          {selectedAsset.name} ({selectedAsset.ticker})
                        </h2>
                        <p className="text-xs text-gray-600">
                          Term Structure • Все контракты
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedAsset(null)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>

                  {/* Summary Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white border border-[#D1D5DB] rounded-none p-2">
                      <div className="text-[10px] text-gray-600 mb-1">Текущая цена</div>
                      <div className="text-lg font-bold text-gray-800 font-mono">
                        {selectedAsset.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="bg-white border border-[#D1D5DB] rounded-none p-2">
                      <div className="text-[10px] text-gray-600 mb-1">Общий объем</div>
                      <div className="text-lg font-bold text-gray-800 font-mono">
                        {selectedAsset.totalVolume.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-white border border-[#D1D5DB] rounded-none p-2">
                      <div className="text-[10px] text-gray-600 mb-1">Total Open Interest</div>
                      <div className="text-lg font-bold text-blue-700 font-mono">
                        {selectedAsset.contracts.reduce((sum, c) => sum + c.openInterest, 0).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Term Structure Table */}
                <div className="p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <h3 className="text-sm font-bold text-gray-800">
                      Срочная структура ({selectedAsset.contracts.length} контрактов)
                    </h3>
                  </div>

                  <div className="bg-[#F3F4F6] border border-[#D1D5DB] rounded-none overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-[#E5E7EB] border-b border-[#D1D5DB]">
                        <tr>
                          <th className="text-left px-3 py-2 text-[10px] font-bold text-gray-800 uppercase">Контракт</th>
                          <th className="text-left px-3 py-2 text-[10px] font-bold text-gray-800 uppercase">Экспирация</th>
                          <th className="text-right px-3 py-2 text-[10px] font-bold text-gray-800 uppercase">Цена</th>
                          <th className="text-left px-3 py-2 text-[10px] font-bold text-gray-800 uppercase">Volume</th>
                          <th className="text-left px-3 py-2 text-[10px] font-bold text-gray-800 uppercase">Open Interest</th>
                          <th className="text-center px-3 py-2 text-[10px] font-bold text-gray-800 uppercase">Days to Exp</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedAsset.contracts.map((contract, idx) => {
                          const isFrontMonth = idx === 0;
                          const volumePercent = (contract.volume / maxVolume) * 100;
                          const oiPercent = (contract.openInterest / maxOI) * 100;
                          
                          return (
                            <tr
                              key={idx}
                              className={`border-b border-[#E5E7EB] ${
                                isFrontMonth ? 'bg-yellow-50' : 'bg-white'
                              }`}
                            >
                              <td className="px-3 py-2">
                                <div className="flex items-center gap-2">
                                  {isFrontMonth && (
                                    <span className="px-1.5 py-0.5 bg-orange-500 text-white text-[9px] font-bold rounded">
                                      FRONT
                                    </span>
                                  )}
                                  <span className="text-[11px] font-bold text-gray-800 font-mono">
                                    {contract.contractCode}
                                  </span>
                                </div>
                              </td>
                              <td className="px-3 py-2">
                                <span className="text-[11px] text-gray-700 font-mono">
                                  {contract.expirationDate}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-right">
                                <span className="text-[11px] font-bold text-gray-800 font-mono">
                                  {contract.lastPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </span>
                              </td>
                              <td className="px-3 py-2">
                                <div className="flex items-center gap-2">
                                  <div className="relative flex-1 h-5 bg-gray-200">
                                    <div
                                      className="absolute inset-y-0 left-0 bg-green-400"
                                      style={{ width: `${volumePercent}%` }}
                                    />
                                  </div>
                                  <span className="text-[10px] text-gray-700 font-mono w-16 text-right">
                                    {contract.volume.toLocaleString()}
                                  </span>
                                </div>
                              </td>
                              <td className="px-3 py-2">
                                <div className="flex items-center gap-2">
                                  <div className="relative flex-1 h-5 bg-gray-200">
                                    <div
                                      className="absolute inset-y-0 left-0 bg-blue-500"
                                      style={{ width: `${oiPercent}%` }}
                                    />
                                  </div>
                                  <span className="text-[10px] text-blue-700 font-mono font-bold w-16 text-right">
                                    {contract.openInterest.toLocaleString()}
                                  </span>
                                </div>
                              </td>
                              <td className="px-3 py-2 text-center">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  contract.daysToExpiration < 30 
                                    ? 'bg-red-100 text-red-700'
                                    : contract.daysToExpiration < 90
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {contract.daysToExpiration}d
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Educational Info */}
                  <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 p-3">
                    <div className="flex items-start gap-2">
                      <Activity className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-xs font-bold text-blue-900 mb-1">
                          💡 Open Interest (Открытый Интерес)
                        </h4>
                        <p className="text-xs text-blue-800 leading-relaxed">
                          Показывает количество открытых позиций в контракте. Высокий OI = высокая ликвидность и активность крупных игроков. 
                          <span className="font-bold"> Front Month</span> обычно имеет максимальный объем торгов, 
                          но следующий контракт может иметь больший OI, если деньги уже "перекатываются".
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FuturesScreener;
