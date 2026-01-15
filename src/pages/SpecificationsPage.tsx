import React, { useEffect, useState } from 'react';
import { Loader2, AlertCircle, RefreshCcw, FileText } from 'lucide-react';
import { fetchStocksSpecifications, ProcessedStockSpec, COMMISSION_RATE } from '../api/stocks';

export const SpecificationsPage: React.FC = () => {
  const [stocks, setStocks] = useState<ProcessedStockSpec[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchStocksSpecifications();
      setStocks(data);
    } catch (err) {
      console.error('Failed to load stocks specifications:', err);
      setError('Не удалось загрузить данные. Попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Автообновление каждые 5 минут
    const interval = setInterval(loadData, 300000);
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number, decimals: number = 2): string => {
    if (num === 0) return '0';
    return num.toLocaleString('ru-RU', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  const formatVolume = (volume: number): string => {
    if (volume >= 1_000_000_000) return `${(volume / 1_000_000_000).toFixed(1)}B ₽`;
    if (volume >= 1_000_000) return `${(volume / 1_000_000).toFixed(0)}M ₽`;
    if (volume >= 1_000) return `${(volume / 1_000).toFixed(0)}K ₽`;
    return `${formatNumber(volume, 0)} ₽`;
  };

  // Определяем высокую комиссию (например, больше 100 рублей)
  const isHighCommission = (commission: number): boolean => {
    return commission > 100;
  };

  return (
    <div className="max-w-[1800px] mx-auto px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <FileText className="w-10 h-10 text-blue-400" />
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              ХАРАКТЕРИСТИКИ АКЦИЙ МОСКОВСКОЙ БИРЖИ
            </h1>
            <p className="text-slate-400">Технические характеристики инструментов TQBR</p>
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
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-lg">
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              {/* Header Groups */}
              <thead className="bg-slate-50 dark:bg-slate-800 border-b-2 border-slate-200 dark:border-slate-700">
                {/* Main Header Row */}
                <tr>
                  <th 
                    colSpan={4} 
                    className="px-3 py-2 text-left font-bold text-slate-700 dark:text-slate-300 border-r border-slate-300 dark:border-slate-600"
                  >
                    ТОРГОВЫЕ ХАРАКТЕРИСТИКИ
                  </th>
                  <th 
                    colSpan={1} 
                    className="px-3 py-2 text-center font-bold text-slate-700 dark:text-slate-300 border-r border-slate-300 dark:border-slate-600"
                  >
                    КОМИССИЯ НА ЛОТ
                  </th>
                  <th 
                    colSpan={2} 
                    className="px-3 py-2 text-center font-bold text-slate-700 dark:text-slate-300"
                  >
                    ЛИКВИДНОСТЬ (База: Сегодня)
                  </th>
                </tr>
                {/* Column Header Row */}
                <tr className="bg-slate-100 dark:bg-slate-800/50">
                  <th className="px-3 py-2 text-left font-semibold text-slate-600 dark:text-slate-400 border-r border-slate-300 dark:border-slate-600">
                    Тикер
                  </th>
                  <th className="px-3 py-2 text-right font-semibold text-slate-600 dark:text-slate-400 border-r border-slate-300 dark:border-slate-600">
                    Шаг (п)
                  </th>
                  <th className="px-3 py-2 text-right font-semibold text-slate-600 dark:text-slate-400 border-r border-slate-300 dark:border-slate-600">
                    Цена шага (₽)
                  </th>
                  <th className="px-3 py-2 text-right font-semibold text-slate-600 dark:text-slate-400 border-r border-slate-300 dark:border-slate-600">
                    Акций в лоте
                  </th>
                  <th className="px-3 py-2 text-right font-semibold text-slate-600 dark:text-slate-400 border-r border-slate-300 dark:border-slate-600">
                    Рубли
                  </th>
                  <th className="px-3 py-2 text-right font-semibold text-slate-600 dark:text-slate-400 border-r border-slate-300 dark:border-slate-600">
                    Оборот ₽
                  </th>
                  <th className="px-3 py-2 text-right font-semibold text-slate-600 dark:text-slate-400">
                    Крупный лот 1% (шт)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {stocks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-8 text-center text-slate-500 text-sm">
                      Нет данных для отображения
                    </td>
                  </tr>
                ) : (
                  stocks.map((stock, index) => (
                    <tr
                      key={stock.secId}
                      className={`transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                        index % 2 === 0 
                          ? 'bg-white dark:bg-slate-900' 
                          : 'bg-slate-50/50 dark:bg-slate-800/30'
                      }`}
                    >
                      {/* Тикер */}
                      <td className="px-3 py-2 text-left font-mono font-semibold text-slate-900 dark:text-slate-100 border-r border-slate-200 dark:border-slate-700">
                        {stock.secId}
                      </td>
                      {/* Шаг (п) */}
                      <td className="px-3 py-2 text-right font-mono text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">
                        {formatNumber(stock.minStep, 2)}
                      </td>
                      {/* Цена шага (₽) */}
                      <td className="px-3 py-2 text-right font-mono text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">
                        {formatNumber(stock.costOfStep, 2)}
                      </td>
                      {/* Акций в лоте */}
                      <td className="px-3 py-2 text-right font-mono text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">
                        {stock.lotSize}
                      </td>
                      {/* Комиссия на лот (Рубли) */}
                      <td 
                        className={`px-3 py-2 text-right font-mono font-semibold border-r border-slate-200 dark:border-slate-700 ${
                          isHighCommission(stock.commission)
                            ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {formatNumber(stock.commission, 2)}
                      </td>
                      {/* Оборот ₽ */}
                      <td className="px-3 py-2 text-right font-mono text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">
                        {formatVolume(stock.valToday)}
                      </td>
                      {/* Крупный лот 1% (шт) */}
                      <td className="px-3 py-2 text-right font-mono font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20">
                        {stock.largeLot1Pct.toLocaleString('ru-RU')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Legend Footer */}
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
            <div className="flex flex-col gap-1 text-xs text-slate-600 dark:text-slate-400">
              <p>
                <span className="font-semibold">Рубли</span> — расчетная комиссия {(COMMISSION_RATE * 100).toFixed(2)}% на открытие позиции 1 лотом.
              </p>
              <p>
                <span className="font-semibold">Крупный лот</span> — расчетное кол-во лотов, составляющее 1% от оборота.
              </p>
            </div>
          </div>

          {/* Footer with count */}
          {stocks.length > 0 && (
            <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 text-center bg-slate-50 dark:bg-slate-800">
              Показано {stocks.length} инструмент{stocks.length === 1 ? '' : stocks.length < 5 ? 'а' : 'ов'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SpecificationsPage;
