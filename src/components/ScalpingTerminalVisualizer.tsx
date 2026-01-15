import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  Info, 
  Zap,
  Eye,
  Activity,
  BarChart3,
  ChevronRight
} from 'lucide-react';

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
  total?: number;
}

interface ClusterData {
  price: number;
  buyVolume: number;
  sellVolume: number;
  delta: number;
}

interface TooltipData {
  title: string;
  description: string;
  tip?: string;
}

const ScalpingTerminalVisualizer: React.FC = () => {
  const [currentPrice, setCurrentPrice] = useState(107.50);
  const [spread, setSpread] = useState(0.01);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [simulationActive, setSimulationActive] = useState(true);
  const [hoveredPrice, setHoveredPrice] = useState<number | null>(null);

  // Генерация стакана
  const generateOrderBook = (): { asks: OrderBookLevel[], bids: OrderBookLevel[] } => {
    const asks: OrderBookLevel[] = [];
    const bids: OrderBookLevel[] = [];
    
    for (let i = 0; i < 8; i++) {
      asks.push({
        price: currentPrice + spread + (i * 0.01),
        volume: Math.floor(Math.random() * 500) + 100,
      });
      bids.push({
        price: currentPrice - (i * 0.01),
        volume: Math.floor(Math.random() * 500) + 100,
      });
    }
    
    return { asks, bids };
  };

  const [orderBook, setOrderBook] = useState(generateOrderBook());

  // Генерация кластеров
  const generateClusters = (): ClusterData[] => {
    const clusters: ClusterData[] = [];
    for (let i = -4; i <= 4; i++) {
      const buyVol = Math.floor(Math.random() * 300) + 50;
      const sellVol = Math.floor(Math.random() * 300) + 50;
      clusters.push({
        price: currentPrice + (i * 0.01),
        buyVolume: buyVol,
        sellVolume: sellVol,
        delta: buyVol - sellVol,
      });
    }
    return clusters;
  };

  const [clusters, setClusters] = useState(generateClusters());

  // Симуляция рынка
  useEffect(() => {
    if (!simulationActive) return;

    const interval = setInterval(() => {
      // Обновление цены
      setCurrentPrice(prev => {
        const change = (Math.random() - 0.48) * 0.05;
        return parseFloat((prev + change).toFixed(2));
      });

      // Обновление стакана
      setOrderBook(generateOrderBook());

      // Обновление кластеров
      setClusters(generateClusters());

      // Добавление новой сделки
      const newTrade: Trade = {
        id: Date.now().toString(),
        price: currentPrice + (Math.random() - 0.5) * 0.05,
        volume: Math.floor(Math.random() * 150) + 10,
        type: Math.random() > 0.5 ? 'buy' : 'sell',
        timestamp: Date.now(),
      };

      setTrades(prev => [newTrade, ...prev].slice(0, 15));
    }, 2000);

    return () => clearInterval(interval);
  }, [simulationActive, currentPrice]);

  // Tooltips контент
  const tooltips: Record<string, TooltipData> = {
    bestAsk: {
      title: 'Best Ask (Лучшая цена продажи)',
      description: 'Самая низкая цена, по которой кто-то готов продать прямо сейчас. Если вы хотите купить "по рынку", вы получите эту цену.',
      tip: '💡 Отслеживайте скорость изменения Best Ask — если он быстро растет, это сигнал сильного спроса.'
    },
    bestBid: {
      title: 'Best Bid (Лучшая цена покупки)',
      description: 'Самая высокая цена, по которой кто-то готов купить прямо сейчас. Если вы хотите продать "по рынку", вы получите эту цену.',
      tip: '💡 Если Best Bid быстро снижается — это признак слабости рынка.'
    },
    spread: {
      title: 'Спред (Разница между Ask и Bid)',
      description: 'Разрыв между лучшей ценой покупки и продажи. Чем меньше спред — тем более ликвиден инструмент и дешевле входить/выходить из позиций.',
      tip: '💡 В моменты новостей спред может расшириться в 10 раз — это опасно для скальперов!'
    },
    liquidity: {
      title: 'Плотность (Liquidity Wall)',
      description: 'Крупная заявка на определенном уровне цены. "Стена" может остановить движение цены или, наоборот, разрушиться при агрессивной покупке.',
      tip: '💡 Если крупная заявка начинает "таять" (уменьшаться), кто-то снимает ордера — возможен пробой уровня.'
    },
    tape: {
      title: 'Лента сделок (Time & Sales)',
      description: 'Поток реальных исполненных сделок. Зеленые кружки — агрессивная покупка (кто-то купил "по рынку"). Красные — агрессивная продажа.',
      tip: '💡 Если подряд идет серия крупных зеленых сделок — это признак сильных покупателей (агрессоров).'
    },
    clusters: {
      title: 'Кластеры (Footprint)',
      description: 'История проторгованных объемов на каждом уровне цены. Показывает, где были крупные игроки и какие уровни важны.',
      tip: '💡 Ищите уровни с аномально большим объемом — там "следы китов".'
    }
  };

  const bestAsk = orderBook.asks[0];
  const bestBid = orderBook.bids[0];
  const currentSpread = bestAsk.price - bestBid.price;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D1117] via-[#161B22] to-[#0D1117] py-12 px-4">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Zap className="w-10 h-10 text-emerald-400" />
                Scalping Terminal Visualizer
              </h1>
              <p className="text-gray-400 text-lg">
                Интерактивная анатомия профессионального торгового терминала
              </p>
            </div>
            
            <button
              onClick={() => setSimulationActive(!simulationActive)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                simulationActive 
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              <Activity className={`w-5 h-5 inline mr-2 ${simulationActive ? 'animate-pulse' : ''}`} />
              {simulationActive ? 'Симуляция активна' : 'Симуляция остановлена'}
            </button>
          </div>

          {/* Current Price Display */}
          <motion.div 
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            animate={{ 
              boxShadow: simulationActive 
                ? '0 0 30px rgba(16, 185, 129, 0.3)' 
                : '0 0 0px rgba(16, 185, 129, 0)'
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400 mb-1">Текущая цена</div>
                <div className="text-5xl font-mono font-bold text-white">
                  {currentPrice.toFixed(2)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400 mb-1">Спред</div>
                <div className="text-3xl font-mono font-bold text-amber-400">
                  {currentSpread.toFixed(2)}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Main Terminal Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Clusters (Left) */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="col-span-3"
          >
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-purple-400" />
                  Кластеры
                </h3>
                <button
                  onClick={() => setActiveTooltip(activeTooltip === 'clusters' ? null : 'clusters')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Info className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                {clusters.map((cluster, idx) => {
                  const maxVol = Math.max(...clusters.map(c => c.buyVolume + c.sellVolume));
                  const totalVol = cluster.buyVolume + cluster.sellVolume;
                  const buyPercent = (cluster.buyVolume / totalVol) * 100;
                  
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className={`relative group ${
                        Math.abs(cluster.price - currentPrice) < 0.02 
                          ? 'ring-2 ring-cyan-400/50' 
                          : ''
                      }`}
                    >
                      <div className="bg-white/5 hover:bg-white/10 transition-all rounded-lg p-3 cursor-pointer">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono text-gray-400">
                            {cluster.price.toFixed(2)}
                          </span>
                          <span className={`text-xs font-mono font-bold ${
                            cluster.delta > 0 ? 'text-emerald-400' : 'text-red-400'
                          }`}>
                            {cluster.delta > 0 ? '+' : ''}{cluster.delta}
                          </span>
                        </div>
                        
                        {/* Volume Bar */}
                        <div className="h-6 bg-black/30 rounded overflow-hidden flex">
                          <div 
                            className="bg-emerald-500/60 transition-all"
                            style={{ width: `${buyPercent}%` }}
                          />
                          <div 
                            className="bg-red-500/60 transition-all"
                            style={{ width: `${100 - buyPercent}%` }}
                          />
                        </div>
                        
                        <div className="flex justify-between mt-1 text-xs">
                          <span className="text-emerald-400 font-mono">{cluster.buyVolume}</span>
                          <span className="text-red-400 font-mono">{cluster.sellVolume}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Order Book (Center Left) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="col-span-3"
          >
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Eye className="w-6 h-6 text-cyan-400" />
                  Стакан (DOM)
                </h3>
                <button
                  onClick={() => setActiveTooltip(activeTooltip === 'liquidity' ? null : 'liquidity')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Info className="w-5 h-5" />
                </button>
              </div>

              {/* Asks */}
              <div className="space-y-1 mb-4">
                {[...orderBook.asks].reverse().map((ask, idx) => {
                  const maxVol = Math.max(...orderBook.asks.map(a => a.volume));
                  const intensity = (ask.volume / maxVol) * 100;
                  
                  return (
                    <motion.div
                      key={`ask-${idx}`}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      onMouseEnter={() => setHoveredPrice(ask.price)}
                      onMouseLeave={() => setHoveredPrice(null)}
                      className={`relative group cursor-pointer ${
                        idx === 0 ? 'ring-2 ring-red-400/50' : ''
                      }`}
                    >
                      <div className="bg-red-500/5 hover:bg-red-500/20 transition-all rounded-lg p-3 relative overflow-hidden">
                        {/* Liquidity Bar Background */}
                        <div 
                          className="absolute inset-0 bg-red-500/20 transition-all"
                          style={{ width: `${intensity}%` }}
                        />
                        
                        <div className="relative flex items-center justify-between">
                          <span className="text-red-400 font-mono font-bold">
                            {ask.price.toFixed(2)}
                          </span>
                          <span className="text-gray-300 font-mono text-sm">
                            {ask.volume}
                          </span>
                        </div>
                      </div>
                      
                      {idx === 0 && (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="absolute -right-24 top-1/2 -translate-y-1/2 bg-red-500/20 backdrop-blur-xl border border-red-500/30 rounded-lg px-3 py-1 text-xs text-red-300 font-semibold whitespace-nowrap"
                        >
                          Best Ask
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Spread */}
              <motion.div 
                className="my-4 relative"
                onClick={() => setActiveTooltip(activeTooltip === 'spread' ? null : 'spread')}
              >
                <div className="bg-amber-500/10 border-2 border-dashed border-amber-500/50 rounded-lg p-3 text-center cursor-pointer hover:bg-amber-500/20 transition-all">
                  <div className="text-xs text-amber-400 mb-1">Спред</div>
                  <div className="text-2xl font-mono font-bold text-amber-300">
                    {currentSpread.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {((currentSpread / currentPrice) * 100).toFixed(3)}%
                  </div>
                </div>
              </motion.div>

              {/* Bids */}
              <div className="space-y-1">
                {orderBook.bids.map((bid, idx) => {
                  const maxVol = Math.max(...orderBook.bids.map(b => b.volume));
                  const intensity = (bid.volume / maxVol) * 100;
                  
                  return (
                    <motion.div
                      key={`bid-${idx}`}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      onMouseEnter={() => setHoveredPrice(bid.price)}
                      onMouseLeave={() => setHoveredPrice(null)}
                      className={`relative group cursor-pointer ${
                        idx === 0 ? 'ring-2 ring-emerald-400/50' : ''
                      }`}
                    >
                      <div className="bg-emerald-500/5 hover:bg-emerald-500/20 transition-all rounded-lg p-3 relative overflow-hidden">
                        {/* Liquidity Bar Background */}
                        <div 
                          className="absolute inset-0 bg-emerald-500/20 transition-all"
                          style={{ width: `${intensity}%` }}
                        />
                        
                        <div className="relative flex items-center justify-between">
                          <span className="text-emerald-400 font-mono font-bold">
                            {bid.price.toFixed(2)}
                          </span>
                          <span className="text-gray-300 font-mono text-sm">
                            {bid.volume}
                          </span>
                        </div>
                      </div>
                      
                      {idx === 0 && (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="absolute -right-24 top-1/2 -translate-y-1/2 bg-emerald-500/20 backdrop-blur-xl border border-emerald-500/30 rounded-lg px-3 py-1 text-xs text-emerald-300 font-semibold whitespace-nowrap"
                        >
                          Best Bid
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Time & Sales Tape (Center Right) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="col-span-3"
          >
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-full relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Activity className="w-6 h-6 text-pink-400" />
                  Лента сделок
                </h3>
                <button
                  onClick={() => setActiveTooltip(activeTooltip === 'tape' ? null : 'tape')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Info className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 relative z-10">
                <AnimatePresence mode="popLayout">
                  {trades.map((trade, idx) => {
                    const size = Math.min(trade.volume / 10, 8);
                    
                    return (
                      <motion.div
                        key={trade.id}
                        initial={{ opacity: 0, scale: 0, x: 50 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0, x: -50 }}
                        transition={{ 
                          type: 'spring',
                          stiffness: 500,
                          damping: 30,
                          delay: idx * 0.05
                        }}
                        className="flex items-center gap-4 bg-white/5 hover:bg-white/10 rounded-lg p-3 transition-all group"
                      >
                        <motion.div
                          className={`rounded-full flex-shrink-0 ${
                            trade.type === 'buy' 
                              ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' 
                              : 'bg-red-500 shadow-lg shadow-red-500/50'
                          }`}
                          style={{ 
                            width: `${size + 20}px`, 
                            height: `${size + 20}px` 
                          }}
                          animate={{ 
                            scale: [1, 1.2, 1],
                          }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut'
                          }}
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className={`font-mono font-bold ${
                              trade.type === 'buy' ? 'text-emerald-400' : 'text-red-400'
                            }`}>
                              {trade.price.toFixed(2)}
                            </span>
                            <span className="text-xs text-gray-400 font-mono">
                              {new Date(trade.timestamp).toLocaleTimeString('ru-RU')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {trade.type === 'buy' ? (
                              <TrendingUp className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-400" />
                            )}
                            <span className="text-gray-300 font-mono text-sm">
                              {trade.volume} шт
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Background Effect */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-pink-500/5 via-transparent to-transparent" />
              </div>
            </div>
          </motion.div>

          {/* Info Panel (Right) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="col-span-3"
          >
            <div className="space-y-4">
              {/* Legend */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Легенда</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded bg-red-500" />
                    <span className="text-sm text-gray-300">Ask (Продавцы)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded bg-emerald-500" />
                    <span className="text-sm text-gray-300">Bid (Покупатели)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded bg-amber-500" />
                    <span className="text-sm text-gray-300">Спред</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded bg-purple-500" />
                    <span className="text-sm text-gray-300">Дельта кластеров</span>
                  </div>
                </div>
              </div>

              {/* Pro Tips */}
              <AnimatePresence>
                {simulationActive && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6"
                  >
                    <div className="flex items-start gap-3">
                      <Zap className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="text-lg font-bold text-white mb-2">Pro Tip</h4>
                        <p className="text-sm text-gray-300 leading-relaxed">
                          Следите за "разъеданием плотности" — когда крупная заявка в стакане 
                          начинает уменьшаться, это сигнал о возможном движении цены в противоположную сторону.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Quick Stats */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Статистика</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Всего сделок</span>
                    <span className="text-lg font-mono font-bold text-white">{trades.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Покупок</span>
                    <span className="text-lg font-mono font-bold text-emerald-400">
                      {trades.filter(t => t.type === 'buy').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Продаж</span>
                    <span className="text-lg font-mono font-bold text-red-400">
                      {trades.filter(t => t.type === 'sell').length}
                    </span>
                  </div>
                  <div className="border-t border-white/10 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Баланс (Delta)</span>
                      <span className={`text-lg font-mono font-bold ${
                        trades.filter(t => t.type === 'buy').length > trades.filter(t => t.type === 'sell').length
                          ? 'text-emerald-400'
                          : 'text-red-400'
                      }`}>
                        {trades.filter(t => t.type === 'buy').length - trades.filter(t => t.type === 'sell').length > 0 ? '+' : ''}
                        {trades.filter(t => t.type === 'buy').length - trades.filter(t => t.type === 'sell').length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tooltips */}
        <AnimatePresence>
          {activeTooltip && tooltips[activeTooltip] && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 max-w-2xl w-full mx-4 z-50"
            >
              <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 backdrop-blur-xl border-2 border-cyan-500/50 rounded-2xl p-8 shadow-2xl shadow-cyan-500/20">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-8 h-8 text-cyan-400" />
                    <h3 className="text-2xl font-bold text-white">
                      {tooltips[activeTooltip].title}
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveTooltip(null)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <ChevronRight className="w-6 h-6 rotate-45" />
                  </button>
                </div>
                
                <p className="text-gray-300 text-lg leading-relaxed mb-4">
                  {tooltips[activeTooltip].description}
                </p>
                
                {tooltips[activeTooltip].tip && (
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                    <p className="text-purple-300 text-sm leading-relaxed">
                      {tooltips[activeTooltip].tip}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ScalpingTerminalVisualizer;
