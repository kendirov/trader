import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info } from 'lucide-react';

interface Trade {
  id: string;
  price: number;
  volume: number;
  type: 'buy' | 'sell';
  timestamp: number;
}

interface OrderBookLevel {
  price: number;
  volume: number;
  isHighVolume?: boolean;
  intensity: number; // 0-100
}

interface ClusterCell {
  price: number;
  buyVolume: number;
  sellVolume: number;
  delta: number;
  isImportant?: boolean;
}

interface TooltipContent {
  title: string;
  description: string;
  highlightTarget?: 'ask' | 'bid' | 'spread' | 'liquidity' | 'clusters' | 'tape';
}

const CScalpTerminal: React.FC = () => {
  const [currentPrice, setCurrentPrice] = useState(0.5818);
  const [spread, setSpread] = useState(0.0001);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [simulationActive, setSimulationActive] = useState(true);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [highlightedArea, setHighlightedArea] = useState<string | null>(null);

  // Генерация стакана с реалистичными объемами
  const generateOrderBook = (): { asks: OrderBookLevel[], bids: OrderBookLevel[] } => {
    const asks: OrderBookLevel[] = [];
    const bids: OrderBookLevel[] = [];
    
    const baseVolume = 1000;
    const maxVolume = 10000;
    
    for (let i = 0; i < 20; i++) {
      const askVolume = Math.floor(Math.random() * maxVolume) + baseVolume;
      const bidVolume = Math.floor(Math.random() * maxVolume) + baseVolume;
      
      asks.push({
        price: currentPrice + spread + (i * 0.0001),
        volume: askVolume,
        isHighVolume: askVolume > 5000,
        intensity: (askVolume / maxVolume) * 100,
      });
      
      bids.push({
        price: currentPrice - (i * 0.0001),
        volume: bidVolume,
        isHighVolume: bidVolume > 5000,
        intensity: (bidVolume / maxVolume) * 100,
      });
    }
    
    return { asks, bids };
  };

  const [orderBook, setOrderBook] = useState(generateOrderBook());

  // Генерация кластеров
  const generateClusters = (): ClusterCell[] => {
    const clusters: ClusterCell[] = [];
    for (let i = -10; i <= 10; i++) {
      const buyVol = Math.floor(Math.random() * 500) + 50;
      const sellVol = Math.floor(Math.random() * 500) + 50;
      const delta = Math.abs(buyVol - sellVol);
      
      clusters.push({
        price: currentPrice + (i * 0.0001),
        buyVolume: buyVol,
        sellVolume: sellVol,
        delta: buyVol - sellVol,
        isImportant: delta > 300,
      });
    }
    return clusters;
  };

  const [clusters, setClusters] = useState(generateClusters());

  // Симуляция рынка
  useEffect(() => {
    if (!simulationActive) return;

    const interval = setInterval(() => {
      // Плавное изменение цены
      setCurrentPrice(prev => {
        const change = (Math.random() - 0.5) * 0.0005;
        return parseFloat((prev + change).toFixed(4));
      });

      // Обновление данных
      setOrderBook(generateOrderBook());
      setClusters(generateClusters());

      // Добавление новой сделки
      const newTrade: Trade = {
        id: Date.now().toString(),
        price: currentPrice + (Math.random() - 0.5) * 0.0002,
        volume: Math.floor(Math.random() * 150) + 20,
        type: Math.random() > 0.5 ? 'buy' : 'sell',
        timestamp: Date.now(),
      };

      setTrades(prev => [newTrade, ...prev].slice(0, 8));
    }, 1500);

    return () => clearInterval(interval);
  }, [simulationActive, currentPrice]);

  // Tooltips
  const tooltips: Record<string, TooltipContent> = {
    ask: {
      title: 'Ask (Продавцы)',
      description: 'Заявки на продажу. Чем выше цена - тем дороже хотят продать.',
      highlightTarget: 'ask'
    },
    bid: {
      title: 'Bid (Покупатели)',
      description: 'Заявки на покупку. Чем ниже цена - тем дешевле хотят купить.',
      highlightTarget: 'bid'
    },
    spread: {
      title: 'Спред',
      description: 'Разница между лучшей ценой покупки и продажи. Показывает ликвидность инструмента.',
      highlightTarget: 'spread'
    },
    liquidity: {
      title: 'Плотность (Крупные объемы)',
      description: 'Ярко-желтые и оранжевые ячейки показывают уровни с большим объемом заявок - "стены".',
      highlightTarget: 'liquidity'
    },
    clusters: {
      title: 'Кластеры (Footprint)',
      description: 'История проторгованных объемов. Зеленая рамка = преобладают покупки, красная = продажи.',
      highlightTarget: 'clusters'
    },
    tape: {
      title: 'Лента сделок (Тики)',
      description: 'Реальные сделки. Размер пузырька = объем. Зеленый = агрессивная покупка, красный = продажа.',
      highlightTarget: 'tape'
    }
  };

  const handleTooltipClick = (key: string) => {
    setActiveTooltip(activeTooltip === key ? null : key);
    if (tooltips[key]?.highlightTarget) {
      setHighlightedArea(tooltips[key].highlightTarget!);
      setTimeout(() => setHighlightedArea(null), 3000);
    }
  };

  // Цвет ячейки стакана в зависимости от объема
  const getCellColor = (intensity: number, type: 'ask' | 'bid', isHighVolume: boolean) => {
    if (isHighVolume) {
      return type === 'ask' ? 'bg-yellow-300' : 'bg-yellow-200';
    }
    
    if (intensity > 70) {
      return type === 'ask' ? 'bg-red-200' : 'bg-green-200';
    } else if (intensity > 40) {
      return type === 'ask' ? 'bg-red-100' : 'bg-green-100';
    } else {
      return type === 'ask' ? 'bg-red-50' : 'bg-green-50';
    }
  };

  const bestAsk = orderBook.asks[0];
  const bestBid = orderBook.bids[0];

  return (
    <div className="min-h-screen bg-[#e3e3e3]" style={{ fontFamily: "'Consolas', 'Courier New', monospace" }}>
      <div className="max-w-[1800px] mx-auto">
        {/* Compact Header - Windows Native Style */}
        <div className="bg-[#f0f0f0] border-b border-[#c0c0c0] px-2 py-1 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-semibold text-gray-700">
              CScalp Terminal Education Simulator
            </span>
            <button
              onClick={() => setSimulationActive(!simulationActive)}
              className={`px-2 py-0.5 rounded-none text-[10px] font-semibold border transition-all ${
                simulationActive 
                  ? 'bg-green-100 border-green-400 text-green-800' 
                  : 'bg-gray-200 border-gray-400 text-gray-600'
              }`}
            >
              {simulationActive ? '■ SIM' : '▶ PAUSE'}
            </button>
          </div>
          
          {/* Compact Info Buttons */}
          <div className="flex gap-1">
            {Object.keys(tooltips).map(key => (
              <button
                key={key}
                onClick={() => handleTooltipClick(key)}
                className={`px-1.5 py-0.5 rounded-none text-[9px] font-semibold border transition-all ${
                  activeTooltip === key
                    ? 'bg-blue-100 border-blue-400 text-blue-800'
                    : 'bg-white border-[#c0c0c0] text-gray-600 hover:bg-gray-50'
                }`}
                title={tooltips[key].description}
              >
                {tooltips[key].title.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Active Tooltip - Compact */}
        <AnimatePresence>
          {activeTooltip && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-[#fffacd] border-b border-[#d4a574] px-2 py-1"
            >
              <p className="text-[10px] text-gray-800">
                <span className="font-bold">{tooltips[activeTooltip].title}:</span> {tooltips[activeTooltip].description}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Terminal Grid - Ultra Compact */}
        <div className="grid grid-cols-12 gap-0 bg-[#d1d1d1]" style={{ borderTop: '1px solid #b0b0b0' }}>
          {/* Clusters (Left) - 3 columns */}
          <div className={`col-span-3 bg-white transition-all ${
            highlightedArea === 'clusters' ? 'outline outline-2 outline-purple-500' : ''
          }`}>
            <div className="bg-[#c8c8c8] text-gray-800 text-center text-[10px] py-[2px] font-bold border-b border-[#a0a0a0]">
              КЛАСТЕРЫ
            </div>
            
            <div className="overflow-hidden">
              {clusters.map((cluster, idx) => {
                const isNearPrice = Math.abs(cluster.price - currentPrice) < 0.0003;
                const isDeltaPositive = cluster.delta > 0;
                
                return (
                  <div
                    key={idx}
                    className={`flex items-center border-b border-[#d1d1d1] ${
                      isNearPrice ? 'bg-[#e8f4f8]' : 'bg-white'
                    }`}
                    style={{ minHeight: '16px' }}
                  >
                    {/* Price */}
                    <div className="w-14 text-right pr-0.5 text-[10px] text-gray-700 font-mono">
                      {cluster.price.toFixed(4)}
                    </div>
                    
                    {/* Buy Volume - with green border if important */}
                    <div className={`w-11 text-center text-[10px] border-l border-[#d1d1d1] text-gray-800 font-semibold py-[1px] ${
                      cluster.isImportant && isDeltaPositive ? 'border-2 border-green-600' : ''
                    }`}>
                      {cluster.buyVolume}
                    </div>
                    
                    {/* Sell Volume - with red border if important */}
                    <div className={`w-11 text-center text-[10px] border-l border-[#d1d1d1] text-gray-800 font-semibold py-[1px] ${
                      cluster.isImportant && !isDeltaPositive ? 'border-2 border-red-600' : ''
                    }`}>
                      {cluster.sellVolume}
                    </div>
                    
                    {/* Delta */}
                    <div className={`flex-1 text-center text-[10px] font-bold border-l border-[#d1d1d1] py-[1px] ${
                      isDeltaPositive ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {isDeltaPositive ? '+' : ''}{cluster.delta}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trade Tape (Center) - 3 columns */}
          <div className={`col-span-3 bg-white relative transition-all border-l border-r border-[#d1d1d1] ${
            highlightedArea === 'tape' ? 'outline outline-2 outline-pink-500' : ''
          }`}>
            <div className="bg-[#c8c8c8] text-gray-800 text-center text-[10px] py-[2px] font-bold border-b border-[#a0a0a0]">
              ЛЕНТА СДЕЛОК
            </div>
            
            <div className="relative h-full min-h-[600px] bg-gradient-to-b from-[#fff5f5] via-white to-[#f5fff5]">
              {/* Current Price Line */}
              <div 
                className="absolute left-0 right-0 border-t border-dashed border-[#808080] z-10"
                style={{ top: '50%' }}
              >
                <div className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-white border border-[#808080] px-1 py-0 text-[10px] font-bold text-gray-800">
                  {currentPrice.toFixed(4)}
                </div>
              </div>
              
              {/* Trade Bubbles - Matte with black border */}
              <AnimatePresence>
                {trades.map((trade, idx) => {
                  const size = Math.min(Math.max(trade.volume / 3, 28), 70);
                  const position = 50 + ((trade.price - currentPrice) / 0.001) * 100;
                  const clampedPosition = Math.max(10, Math.min(90, position));
                  
                  return (
                    <motion.div
                      key={trade.id}
                      initial={{ opacity: 0, scale: 0, x: '-50%' }}
                      animate={{ opacity: 1, scale: 1, x: '-50%' }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ 
                        type: 'spring',
                        stiffness: 300,
                        damping: 20
                      }}
                      className="absolute left-1/2 flex items-center justify-center rounded-full font-bold text-white border-2 cursor-pointer hover:scale-110 transition-transform"
                      style={{
                        top: `${clampedPosition}%`,
                        width: `${size}px`,
                        height: `${size}px`,
                        backgroundColor: trade.type === 'buy' ? '#51cf66' : '#ff6b6b',
                        borderColor: 'rgba(0, 0, 0, 0.2)',
                        fontSize: `${Math.max(size / 5, 8)}px`,
                        zIndex: 20 - idx,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                      }}
                      title={`${trade.type === 'buy' ? 'BUY' : 'SELL'} ${trade.volume} @ ${trade.price.toFixed(4)}`}
                    >
                      {trade.volume}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Order Book / DOM (Right) - 6 columns */}
          <div className={`col-span-6 bg-white transition-all ${
            highlightedArea === 'ask' || highlightedArea === 'bid' || highlightedArea === 'spread' || highlightedArea === 'liquidity'
              ? 'outline outline-2 outline-cyan-500' : ''
          }`}>
            <div className="bg-[#c8c8c8] text-gray-800 text-[10px] py-[2px] font-bold grid grid-cols-3 text-center border-b border-[#a0a0a0]">
              <div>ЦЕНА</div>
              <div>ОБЪЕМ</div>
              <div>СУММА</div>
            </div>

            {/* Asks - with Volume Profile bars */}
            <div className={`transition-all ${highlightedArea === 'ask' ? 'animate-pulse' : ''}`}>
              {[...orderBook.asks].reverse().map((ask, idx) => {
                const shouldBlink = highlightedArea === 'liquidity' && ask.isHighVolume;
                const volumePercentage = ask.intensity;
                
                return (
                  <div
                    key={`ask-${idx}`}
                    className={`relative grid grid-cols-3 border-b border-[#d1d1d1] ${
                      shouldBlink ? 'animate-pulse' : ''
                    }`}
                    style={{ minHeight: '15px' }}
                  >
                    {/* Volume Profile Bar - Histogram */}
                    <div
                      className={`absolute top-0 right-0 h-full ${
                        ask.isHighVolume ? 'bg-[#EBCB4B]' : 'bg-red-300/40'
                      }`}
                      style={{ width: `${volumePercentage}%` }}
                    />
                    
                    {/* Content on top of histogram */}
                    <div className="relative z-10 text-[10px] text-gray-900 font-bold text-right pr-1 py-[1px]">
                      {ask.price.toFixed(4)}
                    </div>
                    <div className={`relative z-10 text-[10px] text-center py-[1px] font-semibold ${
                      ask.isHighVolume ? 'text-black font-bold' : 'text-gray-800'
                    }`}>
                      {ask.volume.toLocaleString()}
                    </div>
                    <div className="relative z-10 text-[10px] text-gray-700 text-right pr-1 py-[1px]">
                      {(ask.volume * ask.price).toFixed(0)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Spread - Compact */}
            <div className={`grid grid-cols-2 border-y-2 border-[#808080] ${
              highlightedArea === 'spread' ? 'outline outline-2 outline-yellow-500 animate-pulse' : ''
            }`}>
              <div className="bg-[#ffcccc] text-center py-0.5 border-r border-[#808080]">
                <div className="text-[9px] text-red-900 font-bold">ASK</div>
                <div className="text-[11px] text-red-900 font-bold">{bestAsk.price.toFixed(4)}</div>
              </div>
              <div className="bg-[#ccffcc] text-center py-0.5">
                <div className="text-[9px] text-green-900 font-bold">BID</div>
                <div className="text-[11px] text-green-900 font-bold">{bestBid.price.toFixed(4)}</div>
              </div>
            </div>

            {/* Bids - with Volume Profile bars */}
            <div className={`transition-all ${highlightedArea === 'bid' ? 'animate-pulse' : ''}`}>
              {orderBook.bids.map((bid, idx) => {
                const shouldBlink = highlightedArea === 'liquidity' && bid.isHighVolume;
                const volumePercentage = bid.intensity;
                
                return (
                  <div
                    key={`bid-${idx}`}
                    className={`relative grid grid-cols-3 border-b border-[#d1d1d1] ${
                      shouldBlink ? 'animate-pulse' : ''
                    }`}
                    style={{ minHeight: '15px' }}
                  >
                    {/* Volume Profile Bar - Histogram */}
                    <div
                      className={`absolute top-0 right-0 h-full ${
                        bid.isHighVolume ? 'bg-[#EBCB4B]' : 'bg-green-300/40'
                      }`}
                      style={{ width: `${volumePercentage}%` }}
                    />
                    
                    {/* Content on top of histogram */}
                    <div className="relative z-10 text-[10px] text-gray-900 font-bold text-right pr-1 py-[1px]">
                      {bid.price.toFixed(4)}
                    </div>
                    <div className={`relative z-10 text-[10px] text-center py-[1px] font-semibold ${
                      bid.isHighVolume ? 'text-black font-bold' : 'text-gray-800'
                    }`}>
                      {bid.volume.toLocaleString()}
                    </div>
                    <div className="relative z-10 text-[10px] text-gray-700 text-right pr-1 py-[1px]">
                      {(bid.volume * bid.price).toFixed(0)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Legend - Windows Native Style Footer */}
        <div className="bg-[#f0f0f0] border-t border-[#c0c0c0] px-2 py-1">
          <div className="flex items-center gap-4 text-[9px] text-gray-700">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-300/40 border border-[#d1d1d1]"></div>
              <span>Ask</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-300/40 border border-[#d1d1d1]"></div>
              <span>Bid</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-[#EBCB4B] border border-[#d1d1d1]"></div>
              <span>High Vol</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-[#51cf66] border border-black/20"></div>
              <span>Buy</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-[#ff6b6b] border border-black/20"></div>
              <span>Sell</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CScalpTerminal;
