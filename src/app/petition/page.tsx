'use client';

import { useForm } from 'react-hook-form';
import { Box, Button, TextField, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useState } from 'react';

type FormData = {
  petitionNumber: string;
  firstName: string;
  lastName: string;
  position: string;
  employeeFirstName: string;
  employeeLastName: string;
};

export default function PetitionFormPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ mode: 'onBlur' });

  const { enqueueSnackbar } = useSnackbar();
  const [images, setImages] = useState<(File | null)[]>([null, null, null]);
  const [imagePreviews, setImagePreviews] = useState<(string | null)[]>([null, null, null]);
  const [imageError, setImageError] = useState(false);
  const [generatedText, setGeneratedText] = useState('');

  const handleImageChange = (index: number, file: File | null) => {
    const newImages = [...images];
    const newPreviews = [...imagePreviews];
    newImages[index] = file;
    newPreviews[index] = file ? URL.createObjectURL(file) : null;
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const generatePetitionText = (data: FormData, imageUrls?: string[]) => {
    const {
      petitionNumber,
      firstName,
      lastName,
      position,
      employeeFirstName,
      employeeLastName,
    } = data;

    const imageSection =
      imageUrls && imageUrls.filter(Boolean).length > 0
        ? `\n\nПриложенные изображения:\n${imageUrls
          .map((url, i) => `• ${url}`)
          .join('\n')}`
        : '';

    return `Ходатайство №${petitionNumber}

Я, ${lastName} ${firstName}, занимающий(ая) должность ${position}, настоящим ходатайствую о предоставлении привилегий (или поощрения) сотруднику ${employeeLastName} ${employeeFirstName} за отличные показатели в работе и вклад в развитие компании.${imageSection}

Дата: _____________
Подпись: _____________`;
  };

  const onSubmit = async (data: FormData) => {
    if (images.some((file) => file === null)) {
      setImageError(true);
      return;
    } else {
      setImageError(false);
    }

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    images.forEach((file, i) => {
      if (file) {
        formData.append(`image${i}`, file);
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
        setImages([null, null, null]);
        setImagePreviews([null, null, null]);
      } else {
        enqueueSnackbar('Ошибка при отправке формы', { variant: 'error' });
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Ошибка подключения к серверу', { variant: 'error' });
    }
  };

  return (
    <Box maxWidth="600px" mx="auto" mt={4}>
      <Typography variant="h4" gutterBottom>
        Форма ходатайства
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          fullWidth
          label="Номер ходатайства"
          {...register('petitionNumber', { required: 'Обязательно' })}
          error={!!errors.petitionNumber}
          helperText={errors.petitionNumber?.message}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Имя заявителя"
          {...register('firstName', { required: 'Обязательно' })}
          error={!!errors.firstName}
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
          <Typography>Загрузите 3 изображения:</Typography>
          {images.map((_, i) => (
            <Box key={i} mt={2}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(i, e.target.files?.[0] || null)}
              />
              {imagePreviews[i] && (
                <Box mt={1}>
                  <img
                    src={imagePreviews[i]!}
                    alt={`Превью ${i + 1}`}
                    style={{ width: '100%', maxWidth: '300px', borderRadius: 8 }}
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
          <Button
            variant="outlined"
            sx={{ ml: 2 }}
            onClick={handleSubmit((data) =>
              setGeneratedText(generatePetitionText(data, []))
            )}
          >
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
