import JSZip from 'jszip';
import { StockTableRow } from '../api/stocks';

/**
 * Генерирует настройки CScalp для списка акций
 * @param stocks Массив акций для генерации настроек
 * @returns Promise<Blob> ZIP-архив с настройками
 */
export async function generateCScalpSettings(stocks: StockTableRow[]): Promise<Blob> {
  const zip = new JSZip();
  
  // Создаем строгую структуру папок: Data -> MVS
  const dataFolder = zip.folder('Data');
  const mvsFolder = dataFolder?.folder('MVS');
  
  if (!mvsFolder) {
    throw new Error('Не удалось создать структуру папок');
  }
  
  // Фильтруем только акции (не индексы) с валидными данными
  const validStocks = stocks.filter(stock => 
    !stock.isIndex && 
    stock.price > 0 && 
    stock.lotSize > 0 &&
    stock.secId
  );

  // Генерируем XML файл для каждой акции
  for (const stock of validStocks) {
    const xmlContent = generateStockXML(stock);
    const fileName = `XDSD.TQBR.${stock.secId}_Settings.xml`;
    mvsFolder.file(fileName, xmlContent);
  }

  // Генерируем ZIP-архив
  const blob = await zip.generateAsync({ 
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 }
  });
  
  return blob;
}

/**
 * Генерирует XML настройки для одной акции
 */
function generateStockXML(stock: StockTableRow): string {
  // Базовые параметры
  const lotSize = stock.lotSize || 1;
  const price = stock.price;
  
  // Рабочие объемы (Working Volumes) - 5 кнопок
  // Рассчитываем лоты для сумм: 10 000₽, 20 000₽, 50 000₽, 100 000₽, 200 000₽
  const workAmounts = [10000, 20000, 50000, 100000, 200000];
  const workVols = workAmounts.map(amount => {
    if (price > 0 && lotSize > 0) {
      return Math.max(1, Math.round(amount / (price * lotSize)));
    }
    return 1;
  });

  // Крупные объемы (Big Volumes) - в лотах
  // BigVol1 = stock.volume / 2000 (примерно 0.05% от дневного), но не меньше 100 лотов
  // Если volume в рублях, переводим в лоты
  const volumeInLots = stock.volume > 0 && price > 0 && lotSize > 0
    ? Math.round(stock.volume / (price * lotSize))
    : 10000; // Fallback значение
  
  const bigVol1 = Math.max(100, Math.round(volumeInLots / 2000));
  const bigVol2 = bigVol1 * 2;
  
  // DomFill (Заполнение строки) = BigVol1
  const domFill = bigVol1;
  
  // ClusterFill (Заполнение кластера) = BigVol1
  const clusterFill = bigVol1;

  // Генерация XML с правильной структурой
  const xml = `<?xml version="1.0" encoding="utf-8"?>
<Settings>
  <Shared>
    <WorkingAmounts>
      <Item Value="${workVols[0]}" />
      <Item Value="${workVols[1]}" />
      <Item Value="${workVols[2]}" />
      <Item Value="${workVols[3]}" />
      <Item Value="${workVols[4]}" />
    </WorkingAmounts>
    <DomParams>
      <FillAmount Value="${domFill}" />
      <BigAmount1 Value="${bigVol1}" />
      <BigAmount2 Value="${bigVol2}" />
    </DomParams>
    <ClusterParams>
      <FillAmount Value="${clusterFill}" />
      <TimeFrame Value="3600" />
    </ClusterParams>
  </Shared>
</Settings>`;

  return xml;
}

/**
 * Скачивает файл настроек CScalp с расширением .scs
 */
export async function downloadCScalpSettings(stocks: StockTableRow[]): Promise<void> {
  try {
    const blob = await generateCScalpSettings(stocks);
    
    // Формируем имя файла
    const fileName = 'CScalp_Screener_Settings.scs';
    
    // Создаем ссылку для скачивания
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Освобождаем память
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Ошибка при генерации настроек CScalp:', error);
    throw error;
  }
}
