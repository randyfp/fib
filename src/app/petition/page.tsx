'use client';

import { Controller, useForm } from 'react-hook-form';
import { Box, Button, TextField, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ImageUpload } from '@/components/ImageUpload';

type FormData = {
  petitionNumber: string;
  firstName: string;
  lastName: string;
  position: string;
  employeeFirstName: string;
  employeeLastName: string;
  leaderFullName: string;
};

export default function PetitionFormPage() {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<FormData>({ mode: 'onBlur' });

  const { enqueueSnackbar } = useSnackbar();
  const [imageUrls, setImageUrls] = useState<(string | null)[]>([null, null, null]);
  const [imageError, setImageError] = useState(false);
  const [generatedText, setGeneratedText] = useState('');


  const handleImageUpload = (index: number, url: string) => {
    const newUrls = [...imageUrls];
    newUrls[index] = url;
    setImageUrls(newUrls);
  };

  const generatePetitionText = (data: FormData, imageUrls?: string[]) => {
    const {
      petitionNumber,
      firstName,
      lastName,
      position,
      employeeFirstName,
      employeeLastName,
      leaderFullName,
    } = data;

    const imageSection =
      imageUrls && imageUrls.filter(Boolean).length > 0
        ? `\n\nПриложенные изображения:\n${imageUrls.map((url) => `• ${url}`).join('\n')}`
        : '';

    return `Ходатайство №${petitionNumber}

Я, ${lastName} ${firstName}, занимающий(ая) должность ${position}, настоящим ходатайствую о предоставлении привилегий (или поощрения) сотруднику ${employeeLastName} ${employeeFirstName} за отличные показатели в работе и вклад в развитие компании.${imageSection}

Дата: _____________
Подпись: _____________`;
  };

  const onSubmit = async (data: FormData) => {
    if (imageUrls.some((url) => !url)) {
      setImageError(true);
      return;
    } else {
      setImageError(false);
    }

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    imageUrls.forEach((url, i) => {
      if (url) {
        formData.append(`imageUrl${i}`, url);
      }
    });

    try {
      const res = await fetch('/api/petition', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      if (result.success) {
        enqueueSnackbar('Форма успешно отправлена!', { variant: 'success' });

        const imageUrls: string[] = result.data.imageUrls;
        const text = generatePetitionText(data, imageUrls);
        setGeneratedText(text);

        reset();
        setImageUrls([null, null, null]);
      } else {
        enqueueSnackbar('Ошибка при отправке формы', { variant: 'error' });
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Ошибка подключения к серверу', { variant: 'error' });
    }
  };

  const handleGenerate = handleSubmit((data) => {
    localStorage.setItem('petition_firstName', data.firstName);
    localStorage.setItem('petition_lastName', data.lastName);
    setGeneratedText(generatePetitionText(data, imageUrls as string[]));
  });

  return (
    <Box maxWidth="600px" mx="auto" mt={4}>
      <Typography variant="h4" gutterBottom>
        Форма ходатайства
      </Typography>

      <form >
        <Controller
          name="leaderFullName"
          control={control}
          rules={{ required: 'Обязательно' }}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              placeholder="Aidew moor"
              error={!!errors.leaderFullName}
              helperText={errors.leaderFullName?.message}
              margin="normal"
            />
          )}
       />

        <TextField
          fullWidth
          label="Имя заявителя"
          {...register('firstName', { required: 'Обязательно' })}
          error={!!errors.firstName}
          defaultValue={typeof window !== 'undefined' ? localStorage.getItem('petition_firstName') ?? '' : ''}
          helperText={errors.firstName?.message}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Фамилия заявителя"
          {...register('lastName', { required: 'Обязательно' })}
          error={!!errors.lastName}
          helperText={errors.lastName?.message}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Должность заявителя"
          {...register('position', { required: 'Обязательно' })}
          error={!!errors.position}
          helperText={errors.position?.message}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Имя сотрудника"
          {...register('employeeFirstName', { required: 'Обязательно' })}
          error={!!errors.employeeFirstName}
          helperText={errors.employeeFirstName?.message}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Фамилия сотрудника"
          {...register('employeeLastName', { required: 'Обязательно' })}
          error={!!errors.employeeLastName}
          helperText={errors.employeeLastName?.message}
          margin="normal"
        />

        <Box mt={2}>
          <Typography>Загрузите 3 изображения (с Imgur):</Typography>
          {[0, 1, 2].map((i) => (
            <Box key={i} mt={2}>
              <ImageUpload onUpload={(url) => handleImageUpload(i, url)} />
              {imageUrls[i] && (
                <Box mt={1}>
                  <Image
                    src={imageUrls[i]!}
                    alt={`Превью ${i + 1}`}
                    style={{ width: '100%', maxWidth: '300px', borderRadius: 8 }}
                    unoptimized
                    width={500}
                    height={300}
                  />
                </Box>
              )}
            </Box>
          ))}
          {imageError && (
            <Typography color="error" variant="body2" mt={1}>
              Загрузите все 3 изображения
            </Typography>
          )}
        </Box>

        <Box mt={3}>
          <Button type="submit" variant="contained" color="primary">
            Отправить
          </Button>
          <Button variant="outlined" sx={{ ml: 2 }} onClick={handleGenerate}>
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
            InputProps={{ readOnly: true }}
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
