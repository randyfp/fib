'use client';

import { Controller, useForm } from 'react-hook-form';
import { Box, Button, TextField, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { CategoryBlock, ImageCategory } from './PetitionImageCategories';

type FormData = {
  petitionNumber: number;
  jobTitle: string;
  employeeName: string;
  leaderName: string;
};

export default function PetitionFormPage() {
  const {
    handleSubmit,
    control,
    reset,
  } = useForm<FormData>({ mode: 'onBlur' });

  const { enqueueSnackbar } = useSnackbar();
  const [categories, setCategories] = useState<ImageCategory[]>([]);
  const [generatedText, setGeneratedText] = useState('');

  const generatePetitionText = (data: FormData, categories: ImageCategory[]) => {
    const { petitionNumber, jobTitle, employeeName, leaderName } = data;
    const today = new Date().toLocaleDateString('ru-RU');

    const imagesSection = categories
      .map(
        (cat) =>
          cat.images.length > 0
            ? `${cat.description} ${employeeName}\n` + cat.images.map((url) => `• ${url}`).join('\n')
            : ''
      )
      .filter(Boolean)
      .join('\n');

    return `[RIGHT]В Окружной/Верховный суд Штата Сан-Андреас
От гражданина США ${leaderName}[/RIGHT]


[CENTER]Ходатайство № ${petitionNumber} [/CENTER]

Я, ${leaderName}, занимающий должность ${jobTitle} направляю суду и сторонам следующие материалы:

${imagesSection || '[Описание документа] [Имя Фамилия сотрудника]  - *ссылка*;'}

[RIGHT]
Дата:${today}
Подпись: ________[/RIGHT]`;
  };

  const onSubmit = async (data: FormData) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value as string);
    });

    categories.forEach((cat, i) => {
      formData.append(`category${i}_description`, cat.description);
      cat.images.forEach((url, j) => {
        formData.append(`category${i}_image${j}`, url);
      });
    });

    try {
      const res = await fetch('/api/petition', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      if (result.success) {
        enqueueSnackbar('Форма успешно отправлена!', { variant: 'success' });
        setGeneratedText(generatePetitionText(data, categories));
        reset();
        setCategories([]);
      } else {
        enqueueSnackbar('Ошибка при отправке формы', { variant: 'error' });
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Ошибка подключения к серверу', { variant: 'error' });
    }
  };

  const handleGenerate = handleSubmit((data) => {
    localStorage.setItem('petition_leaderName', data.leaderName);
    localStorage.setItem('petition_jobTitle', data.jobTitle);
    setGeneratedText(generatePetitionText(data, categories));
  });

  return (
    <Box maxWidth="600px" mx="auto" mt={4}>
      <Typography variant="h4" gutterBottom>
        Форма ходатайства
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Typography variant="body1">Имя и фамилия руководства</Typography>
        <Controller
          name="leaderName"
          control={control}
          render={({ field }) => (
            <TextField
              sx={{ mt: 0.5 }}
              {...field}
              fullWidth
              placeholder="Aidew moor"
              defaultValue={typeof window !== 'undefined' ? localStorage.getItem('petition_leaderName') ?? '' : ''}
            />
          )}
        />

        <Typography variant="body1">Должность</Typography>
        <Controller
          name="jobTitle"
          control={control}
          render={({ field }) => (
            <TextField
              sx={{ mt: 0.5 }}
              {...field}
              fullWidth
              placeholder="Заместитель главы отдела FNA"
              defaultValue={typeof window !== 'undefined' ? localStorage.getItem('petition_jobTitle') ?? '' : ''}
            />
          )}
        />
        <Typography variant="body1">Номер ходатайства</Typography>
        <Controller
          name="petitionNumber"
          control={control}
          render={({ field }) => (
            <TextField
              sx={{ mt: 0.5 }}
              {...field}
              fullWidth
              type="number"
            />
          )}
        />
        <Typography variant="body1">Имя Фамилия сотрудника</Typography>
        <Controller
          name="employeeName"
          control={control}
          render={({ field }) => (
            <TextField
              sx={{ mt: 0.5 }}
              {...field}
              fullWidth
              placeholder="Randy Walkers"
            />
          )}
        />

        <Box mt={3}>
          <Typography variant="h6">Изображения:</Typography>
          {categories.map((cat, i) => (
            <CategoryBlock
              key={i}
              index={i}
              category={cat}
              onUpdate={(updated) => {
                const newCats = [...categories];
                newCats[i] = updated;
                setCategories(newCats);
              }}
              onRemove={() => {
                const newCats = [...categories];
                newCats.splice(i, 1);
                setCategories(newCats);
              }}
            />
          ))}
          <Button
            variant="outlined"
            sx={{ mt: 2 }}
            onClick={() =>
              setCategories([...categories, { description: '', images: [] }])
            }
          >
            + Добавить категорию
          </Button>
        </Box>

        <Box mt={3}>
          <Button variant="outlined" onClick={handleGenerate}>
            Сформировать текст
          </Button>
        </Box>
      </form>

      {generatedText && (
        <Box mt={3}>
          <Typography variant="h6">Сформированный текст:</Typography>
          <TextField
            fullWidth
            multiline
            value={generatedText}
            minRows={8}
            sx={{ mt: 1 }}
            slotProps={{
              input: { readOnly: true }
            }}
          />
          <Button
            variant="contained"
            onClick={() => {
              navigator.clipboard.writeText(generatedText);
              enqueueSnackbar('Текст скопирован', { variant: 'info' });
            }}
            sx={{ mt: 1 }}
          >
            Скопировать
          </Button>
        </Box>
      )}
    </Box>
  );
}
