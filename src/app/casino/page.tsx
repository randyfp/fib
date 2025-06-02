'use client';

import { useEffect, useState } from 'react';
import { Box, Button, Grid, TextField, Typography, Tooltip } from '@mui/material';

const RED_NUMBERS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
const BLACK_NUMBERS = new Set([2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35]);

const COLUMNS = [
  Array.from({ length: 12 }, (_, i) => 3 + i * 3),
  Array.from({ length: 12 }, (_, i) => 2 + i * 3),
  Array.from({ length: 12 }, (_, i) => 1 + i * 3)
];

const LOCAL_KEY = 'roulette-history';

const GROUPS: Record<string, number[]> = {
  '1st 12': Array.from({ length: 12 }, (_, i) => i + 1),
  '2nd 12': Array.from({ length: 12 }, (_, i) => i + 13),
  '3rd 12': Array.from({ length: 12 }, (_, i) => i + 25),
  '1-18': Array.from({ length: 18 }, (_, i) => i + 1),
  '19-36': Array.from({ length: 18 }, (_, i) => i + 19),
  'EVEN': Array.from({ length: 18 }, (_, i) => (i + 1) * 2),
  'ODD': Array.from({ length: 18 }, (_, i) => i * 2 + 1),
  'RED': [...RED_NUMBERS],
  'BLACK': [...BLACK_NUMBERS],
};

function getContrastText(bgColor: string): string {
  // Удаляем # если есть
  if (bgColor.startsWith('#')) bgColor = bgColor.slice(1);
  // Преобразуем в rgb
  let r = 0, g = 0, b = 0;
  if (bgColor.length === 3) {
    r = parseInt(bgColor[0] + bgColor[0], 16);
    g = parseInt(bgColor[1] + bgColor[1], 16);
    b = parseInt(bgColor[2] + bgColor[2], 16);
  } else if (bgColor.length === 6) {
    r = parseInt(bgColor.slice(0, 2), 16);
    g = parseInt(bgColor.slice(2, 4), 16);
    b = parseInt(bgColor.slice(4, 6), 16);
  }
  // Яркость по формуле WCAG
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 140 ? '#222' : '#fff';
}

export default function RouletteTrackerPage() {

  const toggleGroup = (label: string) => {
    if (activeLabel === label) {
      setActiveLabel('');
      setActiveGroup([]);
    } else {
      setActiveLabel(label);
      setActiveGroup(GROUPS[label]);
    }
  };
  const [activeLabel, setActiveLabel] = useState('');
  const [activeGroup, setActiveGroup] = useState<number[]>([]);
  const [history, setHistory] = useState<(number | "00")[]>([]);
  const [input, setInput] = useState('');
  const [ageMap, setAgeMap] = useState<Record<string, number>>({});

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
          updateAgeMap(parsed);
        }
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(history));
    updateAgeMap(history);
  }, [history]);

  const updateAgeMap = (hist: (number | "00")[]) => {
    const newAgeMap: Record<string, number> = {};
    for (let i = 0; i <= 36; i++) {
      const index = [...hist].reverse().findIndex((v) => v === i);
      newAgeMap[String(i)] = index === -1 ? hist.length : index;
    }
    newAgeMap['00'] = [...hist].reverse().findIndex((v) => v === '00');
    if (newAgeMap['00'] === -1) newAgeMap['00'] = hist.length;
    setAgeMap(newAgeMap);
  };

  const handleAddNumber = () => {
    let parsedInput: number | "00";
    if (input === '00') {
      parsedInput = '00';
    } else {
      const num = parseInt(input, 10);
      if (!isNaN(num) && num >= 0 && num <= 36) {
        parsedInput = num;
      } else {
        alert('Неправильный ввод');
        return;
      }
    }
    setHistory((prev) => [...prev, parsedInput]);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAddNumber();
  };

  const resetAll = () => {
    setHistory([]);
    setAgeMap({});
    localStorage.removeItem(LOCAL_KEY);
  };

  const getColor = (num: number | '00') => {
    if (num === 0 || num === '00') return '#2c3e50';
    if (RED_NUMBERS.has(num as number)) return '#e74c3c';
    if (BLACK_NUMBERS.has(num as number)) return '#2c3e50';
    return '#bdc3c7';
  };

  const renderCell = (num: number | '00') => {
    const count = ageMap[String(num)] ?? '-';
    const isRecent = count === 0;
    const isHighlighted = activeGroup.length > 0 && activeGroup.includes(num as number);
    const isActive = activeLabel === num;
    const ballColor = num === 0 || num === '00' ? '#2ecc71' : RED_NUMBERS.has(num as number) ? '#e74c3c' : BLACK_NUMBERS.has(num as number) ? '#2c3e50' : '#bdc3c7';
    getColor(num);
    let color = '';
    let boxShadow = 'none';


    if (typeof count === 'number' && count >= 12) {
      const clamped = Math.min(count, 30);
      const intensity = clamped - 12;

      // Начинаем от оранжевого hue=40, до красного hue=0
      const hue = Math.max(0, 40 - intensity * 2);
      // Светимость от 60% к 35% (становится темнее)
      const lightness = Math.max(35, 60 - intensity * 1.5);

      color = `hsl(${hue}, 100%, ${lightness}%)`;
      boxShadow = `0 0 30px 50px ${color} inset`;
    }
    return (
      <Tooltip key={String(num)} title={`Ставок назад: ${count}`} arrow>
        <Box
          sx={{
            backgroundColor: isActive ? '#2222dd' : (isHighlighted ? '#ffecb3' : '#14532d'),
            color: getContrastText(getColor(num)),
            borderRadius: 2,
            padding: 1,
            textAlign: 'center',
            fontWeight: isRecent ? 'bold' : 'normal',
            border: '1.5px solid #e2e8f0',
            minWidth: '2.5rem',
            minHeight: '2.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow,
            transition: 'background 0.3s, box-shadow 0.3s',
            cursor: 'pointer',
            userSelect: 'none',
          }}
          onClick={() => {
            setHistory((prev) => [...prev, num]);
            setActiveLabel(String(num));
          }}
        >
          <Box sx={{ width: 18, height: 18, borderRadius: '50%', background: ballColor, mb: 0.5, border: '1.5px solid #fff', display: 'inline-block' }} />
          <div style={{ fontWeight: 700, fontSize: 16 }}>{num}</div>
          <small style={{ fontSize: 12 }}>{count}</small>
        </Box>
      </Tooltip>
    );
  };

  function renderHistoryWithRepeats() {
    // Собираем индексы повторов
    const repeatIndexes = new Set<number>();
    let i = 0;
    while (i < history.length - 1) {
      let j = i;
      while (j + 1 < history.length && history[j] === history[j + 1]) {
        j++;
      }
      if (j > i) {
        for (let k = i; k <= j; k++) repeatIndexes.add(k);
        i = j + 1;
      } else {
        i++;
      }
    }
    return (
      <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
        {history.map((num, idx) => (
          <Box key={idx} sx={{
            width: 32, height: 32, borderRadius: 1,
            background: getColor(num), color: getContrastText(getColor(num)), fontWeight: 'bold', fontSize: 15,
            border: repeatIndexes.has(idx) ? '2px solid #0000ff' : '1.5px solid #e2e8f0',
            position: 'relative',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            transition: 'width 0.22s cubic-bezier(.4,2,.6,1)',
            '&:hover': {
              width: 52,
            },
            '&:hover .delete-icon': { display: 'flex' },
          }}>
            {num}
            <Tooltip title="Удалить из истории" arrow>
              <Box
                component="span"
                className="delete-icon"
                sx={{
                  cursor: 'pointer',
                  color: '#ff5858',
                  fontSize: 16,
                  fontWeight: 700,
                  userSelect: 'none',
                  display: 'none',
                  alignItems: 'center',
                  transition: 'display 0.2s',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setHistory((prev) => prev.filter((_, i) => i !== idx));
                }}
              >
                ❌
              </Box>
            </Tooltip>
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Box display="flex" gap={2} mb={2}>
        <TextField
          label="Введите число (0–36 или 00)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button variant="contained" onClick={handleAddNumber}>
          Добавить
        </Button>
        <Button variant="outlined" color="error" onClick={resetAll}>
          Сбросить всё
        </Button>
      </Box>
      <Typography variant="h6" mt={2} mb={1}>История выпадений:</Typography>
      {renderHistoryWithRepeats()}
      <Typography variant="h6" mt={4} mb={2}>Статистика по ставкам (визуальное расположение):</Typography>
      <Box display="flex" justifyContent="center" alignItems="flex-start">
        {/* Вертикальный столбик 0 и 00 */}
        <Box display="flex" flexDirection="column" alignItems="center">
          {renderCell(0)}
          {renderCell('00')}
        </Box>
        {/* Основное поле 3x12 + 2 to 1 */}
        <Box display="flex" flexDirection="row">
          <Box>
            {[0, 1, 2].map((rowIdx) => (
              <Box key={rowIdx} display="flex" flexDirection="row" >
                {Array.from({ length: 12 }, (_, i) => {
                  const num = 3 * (i + 1) - rowIdx;
                  return renderCell(num);
                })}
              </Box>
            ))}
          </Box>
          {/* Кнопки 2 to 1 */}
          <Box display="flex" flexDirection="column" justifyContent="space-between" ml={1} gap={1}>
            {[0, 1, 2].map((rowIdx) => {
              // Числа ряда для подсветки
              const rowNums = Array.from({ length: 12 }, (_, i) => 3 * (i + 1) - rowIdx);
              // Считаем возраст группы (последнее выпадение любого числа из ряда)
              let groupAge = history.length;
              for (let i = history.length - 1; i >= 0; i--) {
                if (rowNums.includes(history[i] as number)) {
                  groupAge = history.length - 1 - i;
                  break;
                }
              }
              const lightness = Math.max(30, 90 - groupAge * 3);
              const bg = `hsl(40, 100%, ${lightness}%)`;
              return (
                <Tooltip key={rowIdx} title={`2 to 1 — не выпадало: ${groupAge} ставок`} arrow>
                  <Button
                    sx={{
                      background: bg,
                      color: getContrastText(bg),
                      writingMode: 'vertical-rl',
                      border: activeLabel === `2to1-${rowIdx}` ? '2px solid #f1c40f' : undefined,
                      transition: 'background 0.3s',
                      minHeight: '80px',
                      minWidth: '32px',
                      fontWeight: 'bold',
                    }}
                    variant={activeLabel === `2to1-${rowIdx}` ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => {
                      if (activeLabel === `2to1-${rowIdx}`) {
                        setActiveLabel('');
                        setActiveGroup([]);
                      } else {
                        setActiveLabel(`2to1-${rowIdx}`);
                        setActiveGroup(rowNums);
                      }
                    }}
                  >
                    2 to 1
                  </Button>
                </Tooltip>
              );
            })}
          </Box>
        </Box>
      </Box>
      {/* Секции ставок под полем */}
      <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
        <Box display="flex" gap={1}>
          {[
            { label: '1-18', group: GROUPS['1-18'] },
            { label: 'EVEN', group: GROUPS['EVEN'] },
            { label: 'RED', group: GROUPS['RED'] },
            { label: 'BLACK', group: GROUPS['BLACK'] },
            { label: 'ODD', group: GROUPS['ODD'] },
            { label: '19-36', group: GROUPS['19-36'] },
          ].map(({ label, group }) => {
            let groupAge = history.length;
            for (let i = history.length - 1; i >= 0; i--) {
              if (group.includes(history[i] as number)) {
                groupAge = history.length - 1 - i;
                break;
              }
            }
            const lightness = Math.max(30, 90 - groupAge * 3);
            const bg = `hsl(40, 100%, ${lightness}%)`;
            return (
              <Tooltip key={label} title={`${label} — не выпадало: ${groupAge} ставок`} arrow>
                <Button
                  size="small"
                  variant={activeLabel === label ? 'contained' : 'outlined'}
                  onClick={() => {
                    if (activeLabel === label) {
                      setActiveLabel('');
                      setActiveGroup([]);
                    } else {
                      setActiveLabel(label);
                      setActiveGroup(group);
                    }
                  }}
                  sx={{
                    background: bg,
                    color: getContrastText(bg),
                    border: activeLabel === label ? '2px solid #f1c40f' : undefined,
                    transition: 'background 0.3s',
                  }}
                >
                  {label}
                </Button>
              </Tooltip>
            );
          })}
        </Box>
        <Box display="flex" gap={1} mt={1}>
          {[
            { label: '1st 12', group: GROUPS['1st 12'] },
            { label: '2nd 12', group: GROUPS['2nd 12'] },
            { label: '3rd 12', group: GROUPS['3rd 12'] },
          ].map(({ label, group }) => {
            let groupAge = history.length;
            for (let i = history.length - 1; i >= 0; i--) {
              if (group.includes(history[i] as number)) {
                groupAge = history.length - 1 - i;
                break;
              }
            }
            const lightness = Math.max(30, 90 - groupAge * 3);
            const bg = `hsl(40, 100%, ${lightness}%)`;
            return (
              <Tooltip key={label} title={`${label} — не выпадало: ${groupAge} ставок`} arrow>
                <Button
                  size="small"
                  variant={activeLabel === label ? 'contained' : 'outlined'}
                  onClick={() => {
                    if (activeLabel === label) {
                      setActiveLabel('');
                      setActiveGroup([]);
                    } else {
                      setActiveLabel(label);
                      setActiveGroup(group);
                    }
                  }}
                  sx={{
                    background: bg,
                    color: getContrastText(bg),
                    border: activeLabel === label ? '2px solid #f1c40f' : undefined,
                    transition: 'background 0.3s',
                  }}
                >
                  {label}
                </Button>
              </Tooltip>
            );
          })}
        </Box>
        {/* Самые старые числа */}
        <Box mt={2} mb={2}>
          {(() => {
            const nums: number[] = Array.from({ length: 37 }, (_, i) => i);
            const allNums: (number | '00')[] = [...nums, '00'];
            const ages = allNums.map((n) => ({ n, age: ageMap[String(n)] ?? 0 }));
            ages.sort((a, b) => b.age - a.age);
            const top = ages.slice(0, 3);
            return (
              <Box>
                <Typography variant="subtitle1" mb={1} fontWeight={700} color="#fff">Самые старые числа:</Typography>
                <Box display="flex" gap={1} alignItems="center">
                  {top.map(({ n, age }) => (
                    <Box key={n} sx={{
                      px: 1.5, py: 0.5, borderRadius: 1, background: '#14532d', color: '#fff', fontWeight: 'bold', fontSize: 18, border: '2px dashed #ff5858'
                    }}>{n}
                      <Typography variant="caption" color="#fff" ml={1}>({age})</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            );
          })()}
        </Box>
        {/* Повторяющееся число */}
        {history.length >= 2 && history[history.length - 1] === history[history.length - 2] && (
          <Box mt={2} mb={2}>
            <Typography variant="subtitle1" fontWeight={700} color="#fff">Повтор подряд:</Typography>
            <Box sx={{ px: 2, py: 1, borderRadius: 1, background: '#14532d', color: '#fff', fontWeight: 'bold', fontSize: 20, border: '2px solid #ffe066', display: 'inline-block' }}>
              {history[history.length - 1]}
            </Box>
          </Box>
        )}
        {/* История повторов */}
        {(() => {
          const repeats: { value: number | '00'; start: number; length: number }[] = [];
          let i = 0;
          while (i < history.length - 1) {
            let j = i;
            while (j + 1 < history.length && history[j] === history[j + 1]) {
              j++;
            }
            if (j > i) {
              repeats.push({ value: history[i], start: i + 1, length: j - i + 1 });
              i = j + 1;
            } else {
              i++;
            }
          }
          if (repeats.length === 0) return null;
          return (
            <Box mt={2} mb={2}>
              <Typography variant="subtitle1" fontWeight={700} color="#fff">История повторов:</Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                {repeats.slice().reverse().map((r, idx) => (
                  <Box key={idx} sx={{ px: 2, py: 1, borderRadius: 1, background: '#14532d', color: '#fff', fontWeight: 'bold', fontSize: 16, border: '2px solid #ffe066', display: 'inline-block' }}>
                    {r.value} — {r.length} раза подряд (начиная с {r.start}-й ставки)
                  </Box>
                ))}
              </Box>
            </Box>
          );
        })()}
      </Box>
    </Box>
  );
}
