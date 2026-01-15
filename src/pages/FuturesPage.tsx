import React, { useEffect, useState, useMemo } from 'react';
import { LineChart, Loader2, AlertCircle, RefreshCcw, Search, TrendingUp, TrendingDown, Calendar, DollarSign, ArrowDown, Users } from 'lucide-react';
import { fetchFuturesData, fetchAllFuturesContracts, ProcessedAsset, FuturesTableRow, CATEGORY_NAMES } from '../api/futures';
import FutureAssetCard from '../components/FutureAssetCard';

type CategoryFilter = 'all' | 'energy' | 'currency' | 'metals' | 'stocks' | 'indices';
type SortField = 'volume' | 'change' | 'expiry';

export const FuturesPage: React.FC = () => {
  const [highlightAssets, setHighlightAssets] = useState<ProcessedAsset[]>([]);
  const [allContracts, setAllContracts] = useState<FuturesTableRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [sortField, setSortField] = useState<SortField>('volume');
  const [sortAsc, setSortAsc] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [highlights, contracts] = await Promise.all([
        fetchFuturesData(),
        fetchAllFuturesContracts()
      ]);
      setHighlightAssets(highlights.slice(0, 4)); // Top 4 by liquidity
      setAllContracts(contracts);
    } catch (err) {
      console.error('Failed to load futures data:', err);
      setError('Не удалось загрузить данные. Попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 120000); // Refresh every 2 minutes
    return () => clearInterval(interval);
  }, []);

  // Filter and sort contracts
  const filteredContracts = useMemo(() => {
    let filtered = allContracts;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c =>
        c.secId.toLowerCase().includes(query) ||
        c.shortName.toLowerCase().includes(query) ||
        c.assetName.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(c => c.category === categoryFilter);
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'volume':
          comparison = b.volume - a.volume;
          break;
        case 'change':
          comparison = b.changePercent - a.changePercent;
          break;
        case 'expiry':
          comparison = a.daysToExpiry - b.daysToExpiry;
          break;
      }
      return sortAsc ? -comparison : comparison;
    });

    return filtered;
  }, [allContracts, searchQuery, categoryFilter, sortField, sortAsc]);

  const formatPrice = (price: number) => price.toFixed(2);
  const formatVolume = (volume: number) => {
    if (volume >= 1_000_000_000) return `${(volume / 1_000_000_000).toFixed(1)}B ₽`;
    if (volume >= 1_000_000) return `${(volume / 1_000_000).toFixed(0)}M ₽`;
    return `${volume.toLocaleString()} ₽`;
  };
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getTermStructureDisplay = (row: FuturesTableRow) => {
    if (!row.termStructure || row.spread === null) {
      return <span className="text-xs text-slate-500">—</span>;
    }

    const isContango = row.termStructure === 'CONTANGO';
    const isBackwardation = row.termStructure === 'BACKWARDATION';
    const color = isContango ? 'text-emerald-400' : isBackwardation ? 'text-red-400' : 'text-slate-400';

    return (
      <div className="flex items-center gap-2">
        <ArrowDown className={`w-3 h-3 ${color} ${isBackwardation ? 'rotate-180' : ''}`} />
        <span className={`text-xs font-mono font-semibold ${color}`}>
          {row.spread > 0 ? '+' : ''}{row.spread.toFixed(2)}%
        </span>
      </div>
    );
  };

  return (
    <div className="max-w-[1800px] mx-auto px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <LineChart className="w-10 h-10 text-blue-400" />
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Срочный Рынок FORTS
            </h1>
            <p className="text-slate-400">Фьючерсный терминал • Полный обзор рынка</p>
          </div>
        </div>
        <button
          onClick={loadData}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg text-sm font-semibold hover:bg-blue-600/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
          Обновить
        </button>
      </div>

      {isLoading && (
        <div className="h-[400px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
            <p className="text-sm font-mono text-slate-400">Загрузка данных...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="h-[400px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-red-400">
            <AlertCircle className="w-10 h-10" />
            <p className="text-sm font-mono">{error}</p>
          </div>
        </div>
      )}

      {!isLoading && !error && (
        <>
          {/* Market Highlights */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-white mb-4">Основные активы</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {highlightAssets.map((asset) => (
                <FutureAssetCard key={asset.assetCode} asset={asset} />
              ))}
            </div>
          </div>

          {/* All Futures Screener */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
            {/* Control Bar */}
            <div className="p-4 border-b border-slate-800">
              <div className="flex flex-col gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Поиск актива..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                {/* Filters */}
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    {(['all', 'energy', 'currency', 'metals', 'stocks', 'indices'] as CategoryFilter[]).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          categoryFilter === cat
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                        }`}
                      >
                        {cat === 'all' ? 'Все' : CATEGORY_NAMES[cat] || cat}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>Сортировка:</span>
                    {(['volume', 'change', 'expiry'] as SortField[]).map((field) => (
                      <button
                        key={field}
                        onClick={() => {
                          if (sortField === field) {
                            setSortAsc(!sortAsc);
                          } else {
                            setSortField(field);
                            setSortAsc(false);
                          }
                        }}
                        className={`px-2 py-1 rounded ${
                          sortField === field
                            ? 'bg-blue-600/20 text-blue-400'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {field === 'volume' ? 'Объем' : field === 'change' ? 'Изменение' : 'Экспирация'}
                        {sortField === field && (
                          <span className="ml-1">{sortAsc ? '↑' : '↓'}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800/50 text-xs text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Инструмент</th>
                    <th className="px-4 py-3 text-right font-semibold">Цена</th>
                    <th className="px-4 py-3 text-right font-semibold">Изм. %</th>
                    <th className="px-4 py-3 text-center font-semibold">Структура</th>
                    <th className="px-4 py-3 text-left font-semibold">Экспирация</th>
                    <th className="px-4 py-3 text-right font-semibold">Объем</th>
                    <th className="px-4 py-3 text-right font-semibold">ОИ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredContracts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-500 text-sm">
                        Нет данных для отображения
                      </td>
                    </tr>
                  ) : (
                    filteredContracts.map((row) => (
                      <tr
                        key={row.secId}
                        className="hover:bg-slate-800/30 transition-colors"
                      >
                        {/* Instrument */}
                        <td className="px-4 py-3">
                          <div>
                            <div className="text-sm font-semibold text-white">{row.assetName}</div>
                            <div className="text-xs font-mono text-slate-400">{row.secId}</div>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm font-mono font-semibold text-white">
                            {formatPrice(row.price)}
                          </span>
                        </td>

                        {/* Change % */}
                        <td className="px-4 py-3 text-right">
                          <div className={`flex items-center justify-end gap-1 text-sm font-semibold ${
                            row.changePercent > 0 ? 'text-emerald-400' : row.changePercent < 0 ? 'text-red-400' : 'text-slate-400'
                          }`}>
                            {row.changePercent > 0 ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : row.changePercent < 0 ? (
                              <TrendingDown className="w-3 h-3" />
                            ) : null}
                            <span className="font-mono">
                              {row.changePercent > 0 ? '+' : ''}{row.changePercent.toFixed(2)}%
                            </span>
                          </div>
                        </td>

                        {/* Term Structure */}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center">
                            {getTermStructureDisplay(row)}
                          </div>
                        </td>

                        {/* Expiry */}
                        <td className="px-4 py-3">
                          <div className="flex items-start gap-2">
                            <Calendar className="w-3 h-3 text-slate-500 mt-0.5" />
                            <div>
                              <div className="text-xs font-mono text-white">{formatDate(row.expiryDate)}</div>
                              <div className="text-[10px] text-slate-500">
                                {row.daysToExpiry} {row.daysToExpiry === 1 ? 'день' : row.daysToExpiry < 5 ? 'дня' : 'дней'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Volume */}
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <DollarSign className="w-3 h-3 text-slate-500" />
                            <span className="text-xs font-mono text-slate-300">{formatVolume(row.volume)}</span>
                          </div>
                        </td>

                        {/* Open Interest */}
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Users className="w-3 h-3 text-slate-500" />
                            <span className="text-xs font-mono text-slate-300">
                              {row.openInterest.toLocaleString()}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            {filteredContracts.length > 0 && (
              <div className="px-4 py-3 border-t border-slate-800 text-xs text-slate-500 text-center">
                Показано {filteredContracts.length} контракт{filteredContracts.length === 1 ? '' : filteredContracts.length < 5 ? 'а' : 'ов'} из {allContracts.length}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default FuturesPage;
