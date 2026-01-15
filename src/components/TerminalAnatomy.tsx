import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, TrendingUp, TrendingDown, Activity, BarChart3, Zap } from 'lucide-react';

interface EducationalPoint {
  id: string;
  targetElement: string;
  title: string;
  description: string;
  position: { x: number; y: number };
  icon: React.ReactNode;
}

interface OrderBookLevel {
  price: number;
  volume: number;
  depth: number; // 0-100 for histogram
}

const TerminalAnatomy: React.FC = () => {
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  // Educational points with hotspots
  const educationalPoints: EducationalPoint[] = [
    {
      id: 'best-ask',
      targetElement: 'ask-top',
      title: 'Best Ask (Лучшая цена продажи)',
      description: 'Самая низкая цена, по которой кто-то готов продать актив прямо сейчас. Если вы хотите купить "по рынку", вы получите эту цену.',
      position: { x: 65, y: 35 },
      icon: <TrendingDown className="w-4 h-4" />
    },
    {
      id: 'best-bid',
      targetElement: 'bid-top',
      title: 'Best Bid (Лучшая цена покупки)',
      description: 'Самая высокая цена, по которой кто-то готов купить актив. Если вы продаете "по рынку", получите эту цену.',
      position: { x: 65, y: 65 },
      icon: <TrendingUp className="w-4 h-4" />
    },
    {
      id: 'spread',
      targetElement: 'spread-line',
      title: 'Спред (Spread)',
      description: 'Разница между лучшей ценой на покупку (Bid) и продажу (Ask). Чем меньше спред — тем более ликвиден инструмент.',
      position: { x: 65, y: 50 },
      icon: <Activity className="w-4 h-4" />
    },
    {
      id: 'tape-ball',
      targetElement: 'tape-center',
      title: 'Лента сделок (Time & Sales)',
      description: 'Реальные исполненные сделки. Размер круга = объем сделки. Зеленый = агрессивная покупка, Красный = агрессивная продажа.',
      position: { x: 50, y: 45 },
      icon: <Zap className="w-4 h-4" />
    },
    {
      id: 'cluster',
      targetElement: 'cluster-cell',
      title: 'Кластеры (Footprint)',
      description: 'История проторгованных объемов на каждом уровне цены. Помогает найти "следы крупных игроков" и важные уровни поддержки.',
      position: { x: 20, y: 40 },
      icon: <BarChart3 className="w-4 h-4" />
    },
  ];

  // Static market data for visualization
  const asks: OrderBookLevel[] = [
    { price: 107.58, volume: 890, depth: 85 },
    { price: 107.57, volume: 456, depth: 45 },
    { price: 107.56, volume: 234, depth: 25 },
    { price: 107.55, volume: 567, depth: 55 },
    { price: 107.54, volume: 123, depth: 15 },
    { price: 107.53, volume: 789, depth: 75 },
    { price: 107.52, volume: 345, depth: 35 },
    { price: 107.51, volume: 678, depth: 65 },
  ];

  const bids: OrderBookLevel[] = [
    { price: 107.50, volume: 491, depth: 50 },
    { price: 107.49, volume: 756, depth: 70 },
    { price: 107.48, volume: 312, depth: 30 },
    { price: 107.47, volume: 845, depth: 80 },
    { price: 107.46, volume: 234, depth: 25 },
    { price: 107.45, volume: 567, depth: 55 },
    { price: 107.44, volume: 901, depth: 90 },
    { price: 107.43, volume: 423, depth: 40 },
  ];

  const clusters = [
    { price: 107.54, buy: 57, sell: 45, delta: 12 },
    { price: 107.53, buy: 41, sell: 78, delta: -37 },
    { price: 107.52, buy: 156, sell: 156, delta: 0 },
    { price: 107.51, buy: 165, sell: 890, delta: -725 },
    { price: 107.50, buy: 390, sell: 0, delta: 390 },
    { price: 107.49, buy: 212, sell: 234, delta: -22 },
    { price: 107.48, buy: 134, sell: 123, delta: 11 },
    { price: 107.47, buy: 57, sell: 89, delta: -32 },
  ];

  const tapeCircles = [
    { size: 60, type: 'buy', volume: 120, top: 25 },
    { size: 45, type: 'sell', volume: 78, top: 40 },
    { size: 70, type: 'buy', volume: 156, top: 55 },
    { size: 35, type: 'sell', volume: 45, top: 70 },
  ];

  return (
    <div className="min-h-screen bg-[#E5E7EB] relative overflow-hidden">
      <div className="relative z-10 max-w-[1800px] mx-auto px-6 py-8">
        {/* Header - Professional & Compact */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 text-center"
        >
          <h1 className="text-3xl font-bold mb-2 text-gray-800">
            Terminal Anatomy
          </h1>
          <p className="text-gray-600 text-sm">
            Интерактивная анатомия профессионального торгового терминала
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Наведите на оранжевые маяки, чтобы узнать больше
          </p>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-12 gap-4 mb-6">
          {/* Clusters Column */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={`col-span-3 relative transition-all duration-500 ${
              activeHotspot && activeHotspot !== 'cluster' ? 'opacity-30' : ''
            }`}
          >
            <div className="bg-[#F3F4F6] border border-[#D1D5DB] rounded-none p-3 h-full">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#D1D5DB]">
                <BarChart3 className="w-4 h-4 text-gray-600" />
                <h3 className="text-sm font-bold text-gray-800">Кластеры</h3>
              </div>

              <div className="space-y-0" id="cluster-cell">
                {clusters.map((cluster, idx) => {
                  const isDeltaPositive = cluster.delta > 0;
                  return (
                    <div
                      key={idx}
                      className={`flex items-center justify-between bg-white border-b border-[#E5E7EB] px-2 py-0.5 ${
                        Math.abs(cluster.delta) > 300 
                          ? isDeltaPositive 
                            ? 'border-l-2 border-l-green-600' 
                            : 'border-l-2 border-l-red-600'
                          : ''
                      }`}
                      style={{ minHeight: '18px' }}
                    >
                      <span className="text-[11px] text-gray-700 font-mono">{cluster.price}</span>
                      <div className="flex gap-2 text-[10px] font-mono">
                        <span className="text-gray-600">{cluster.buy}</span>
                        <span className="text-gray-600">{cluster.sell}</span>
                      </div>
                      <span className={`text-[11px] font-bold font-mono ${
                        isDeltaPositive ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {isDeltaPositive ? '+' : ''}{cluster.delta}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Hotspot Beacon */}
              {educationalPoints.find(p => p.id === 'cluster') && (
                <HotspotBeacon
                  point={educationalPoints.find(p => p.id === 'cluster')!}
                  isActive={activeHotspot === 'cluster'}
                  onHover={() => setActiveHotspot('cluster')}
                  onLeave={() => setActiveHotspot(null)}
                  style={{ top: '40%', right: '-12px' }}
                />
              )}
            </div>
          </motion.div>

          {/* Tape Column */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`col-span-3 relative transition-all duration-500 ${
              activeHotspot && activeHotspot !== 'tape-ball' ? 'opacity-30' : ''
            }`}
          >
            <div className="bg-[#F3F4F6] border border-[#D1D5DB] rounded-none p-3 h-full">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#D1D5DB]">
                <Activity className="w-4 h-4 text-gray-600" />
                <h3 className="text-sm font-bold text-gray-800">Лента сделок</h3>
              </div>

              <div className="relative h-[500px] bg-white" id="tape-center">
                {/* Center price line */}
                <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-[#9CA3AF]" />
                
                {/* Trade circles */}
                {tapeCircles.map((circle, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 + idx * 0.1, type: 'spring' }}
                    className={`absolute left-1/2 -translate-x-1/2 rounded-full flex items-center justify-center font-bold text-white border-2 ${
                      circle.type === 'buy' 
                        ? 'bg-[#51cf66] border-gray-700' 
                        : 'bg-[#ff6b6b] border-gray-700'
                    }`}
                    style={{
                      width: `${circle.size}px`,
                      height: `${circle.size}px`,
                      top: `${circle.top}%`,
                      fontSize: `${circle.size / 4}px`,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                  >
                    {circle.volume}
                  </motion.div>
                ))}
              </div>

              {/* Hotspot Beacon */}
              {educationalPoints.find(p => p.id === 'tape-ball') && (
                <HotspotBeacon
                  point={educationalPoints.find(p => p.id === 'tape-ball')!}
                  isActive={activeHotspot === 'tape-ball'}
                  onHover={() => setActiveHotspot('tape-ball')}
                  onLeave={() => setActiveHotspot(null)}
                  style={{ top: '45%', left: '50%', transform: 'translateX(-50%)' }}
                />
              )}
            </div>
          </motion.div>

          {/* Order Book Column */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className={`col-span-6 relative transition-all duration-500 ${
              activeHotspot && !['best-ask', 'best-bid', 'spread'].includes(activeHotspot || '') ? 'opacity-30' : ''
            }`}
          >
            <div className="bg-[#F3F4F6] border border-[#D1D5DB] rounded-none p-3 h-full">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#D1D5DB]">
                <TrendingUp className="w-4 h-4 text-gray-600" />
                <h3 className="text-sm font-bold text-gray-800">Стакан (DOM)</h3>
              </div>

              {/* Asks */}
              <div className="space-y-0 mb-2" id="ask-top">
                {[...asks].reverse().map((ask, idx) => {
                  const isHighVolume = ask.volume > 700; // Top volumes
                  return (
                    <div
                      key={idx}
                      className="relative flex items-center px-2"
                      style={{ height: '20px' }}
                    >
                      {/* Depth histogram - Pastel Pink or Bright Yellow */}
                      <div
                        className={`absolute inset-0 ${
                          isHighVolume ? 'bg-[#F4D03F]' : 'bg-[#FFD1D1]'
                        }`}
                        style={{ width: `${ask.depth}%` }}
                      />
                      
                      {/* Content */}
                      <div className="relative z-10 flex items-center justify-between w-full">
                        <span className={`font-mono text-[11px] ${
                          isHighVolume ? 'font-bold text-black' : 'font-semibold text-gray-800'
                        }`}>
                          {ask.price.toFixed(2)}
                        </span>
                        <span className={`font-mono text-[11px] ${
                          isHighVolume ? 'font-bold text-black' : 'text-gray-700'
                        }`}>
                          {ask.volume}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Spread */}
              <div 
                id="spread-line"
                className="relative my-2 py-2 border-y-2 border-[#9CA3AF] bg-white"
              >
                <div className="flex items-center justify-between px-2">
                  <div className="text-center">
                    <div className="text-[9px] text-red-600 mb-0.5 font-semibold">ASK</div>
                    <div className="text-sm font-bold text-red-700 font-mono">{asks[0].price}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[9px] text-gray-600 mb-0.5 font-semibold">SPREAD</div>
                    <div className="text-sm font-bold text-orange-600 font-mono">
                      {(asks[0].price - bids[0].price).toFixed(2)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-[9px] text-green-600 mb-0.5 font-semibold">BID</div>
                    <div className="text-sm font-bold text-green-700 font-mono">{bids[0].price}</div>
                  </div>
                </div>

                {/* Hotspot Beacon for Spread */}
                {educationalPoints.find(p => p.id === 'spread') && (
                  <HotspotBeacon
                    point={educationalPoints.find(p => p.id === 'spread')!}
                    isActive={activeHotspot === 'spread'}
                    onHover={() => setActiveHotspot('spread')}
                    onLeave={() => setActiveHotspot(null)}
                    style={{ top: '50%', right: '-12px', transform: 'translateY(-50%)' }}
                  />
                )}
              </div>

              {/* Bids */}
              <div className="space-y-0" id="bid-top">
                {bids.map((bid, idx) => {
                  const isHighVolume = bid.volume > 700; // Top volumes
                  return (
                    <div
                      key={idx}
                      className="relative flex items-center px-2"
                      style={{ height: '20px' }}
                    >
                      {/* Depth histogram - Pastel Green or Bright Yellow */}
                      <div
                        className={`absolute inset-0 ${
                          isHighVolume ? 'bg-[#F4D03F]' : 'bg-[#D1FFD1]'
                        }`}
                        style={{ width: `${bid.depth}%` }}
                      />
                      
                      {/* Content */}
                      <div className="relative z-10 flex items-center justify-between w-full">
                        <span className={`font-mono text-[11px] ${
                          isHighVolume ? 'font-bold text-black' : 'font-semibold text-gray-800'
                        }`}>
                          {bid.price.toFixed(2)}
                        </span>
                        <span className={`font-mono text-[11px] ${
                          isHighVolume ? 'font-bold text-black' : 'text-gray-700'
                        }`}>
                          {bid.volume}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Hotspot Beacons */}
              {educationalPoints.find(p => p.id === 'best-ask') && (
                <HotspotBeacon
                  point={educationalPoints.find(p => p.id === 'best-ask')!}
                  isActive={activeHotspot === 'best-ask'}
                  onHover={() => setActiveHotspot('best-ask')}
                  onLeave={() => setActiveHotspot(null)}
                  style={{ top: '15%', right: '-12px' }}
                />
              )}
              
              {educationalPoints.find(p => p.id === 'best-bid') && (
                <HotspotBeacon
                  point={educationalPoints.find(p => p.id === 'best-bid')!}
                  isActive={activeHotspot === 'best-bid'}
                  onHover={() => setActiveHotspot('best-bid')}
                  onLeave={() => setActiveHotspot(null)}
                  style={{ top: '85%', right: '-12px' }}
                />
              )}
            </div>
          </motion.div>
        </div>

        {/* Floating Tooltips */}
        <AnimatePresence>
          {activeHotspot && educationalPoints.find(p => p.id === activeHotspot) && (
            <FloatingTooltip
              point={educationalPoints.find(p => p.id === activeHotspot)!}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Hotspot Beacon Component
interface HotspotBeaconProps {
  point: EducationalPoint;
  isActive: boolean;
  onHover: () => void;
  onLeave: () => void;
  style?: React.CSSProperties;
}

const HotspotBeacon: React.FC<HotspotBeaconProps> = ({ point, isActive, onHover, onLeave, style }) => {
  return (
    <div
      className="absolute z-20 cursor-pointer"
      style={style}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      {/* Pulsing rings - Orange Industrial */}
      <motion.div
        className="relative w-7 h-7"
        animate={{ scale: isActive ? 1.2 : 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Inner dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2.5 h-2.5 bg-orange-600 rounded-full shadow-md" />
        </div>
        
        {/* Pulsing ring 1 */}
        <motion.div
          className="absolute inset-0 border-2 border-orange-500 rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.7, 0, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        {/* Pulsing ring 2 */}
        <motion.div
          className="absolute inset-0 border-2 border-orange-400 rounded-full"
          animate={{
            scale: [1, 1.8, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.3,
          }}
        />
      </motion.div>
    </div>
  );
};

// Floating Tooltip Component
interface FloatingTooltipProps {
  point: EducationalPoint;
}

const FloatingTooltip: React.FC<FloatingTooltipProps> = ({ point }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 max-w-2xl"
    >
      {/* Professional white tooltip card */}
      <div className="bg-white border-2 border-[#D1D5DB] rounded-lg p-5 shadow-xl">
        {/* Connector line */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-[#9CA3AF]" />
        
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center shadow-md text-white">
            {point.icon}
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-800 mb-1.5">
              {point.title}
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {point.description}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TerminalAnatomy;
