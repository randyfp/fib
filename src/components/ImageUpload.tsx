'use client';

import { useState } from "react";
import { useDropzone } from 'react-dropzone';
import { Box, Snackbar, Typography } from '@mui/material';

export function ImageUpload({ onUpload }: { onUpload: (url: string) => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

  const onDrop = async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return;
    setIsLoading(true);

    // Множественная загрузка файлов
    for (const file of acceptedFiles) {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      if (result.link) {
        onUpload('result.link');
      } else {
        setSnackbar({ open: true, message: 'Ошибка загрузки изображения' });
      }
    }
    setIsLoading(false);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: true, // разрешаем множественный выбор
  });

  return (
    <>
      <Box
        {...getRootProps()}
        sx={{
          border: isDragActive ? '2px solid #ffffff' : '2px dashed #ffffff',
          borderRadius: 2,
          p: 4,
          textAlign: 'center',
          color: '#fff',
          bgcolor: '#222',
          cursor: 'pointer',
          mb: 2,
          transition: 'border-color 0.2s',
          '&:hover': { borderColor: '#ffffff' },
        }}
      >
        <input {...getInputProps()} />
        <Typography sx={{ color: '#ffffff', mb: 1 }}>
          {isDragActive
            ? 'Отпустите файлы для загрузки'
            : 'Перетащите изображение сюда или кликните для выбора'}
        </Typography>
        {isLoading && <Typography sx={{ color: '#fff' }}>Загрузка...</Typography>}
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar({ open: false, message: '' })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  );
}