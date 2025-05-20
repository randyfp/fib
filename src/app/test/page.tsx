'use client';

import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import Image from 'next/image';

type ImgurImage = {
  id: string;
  link: string;
  title?: string;
  description?: string;
  width?: number;
  height?: number;
  type?: string;
  size?: number;
  animated?: boolean;
  // можно добавить другие поля, если нужно
};

export default function TestUploadPage() {
  const [result, setResult] = useState<ImgurImage | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleUpload = async (file: File) => {
    setLoading(true);
    setResult(null);
    setError('');
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/imgur-upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.data?.error || 'Ошибка загрузки');
      setResult(data.data);
    }  catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth={600} mx="auto" mt={4}>
      <Typography variant="h5" gutterBottom>
        Тест загрузки изображения на Imgur через API роут
      </Typography>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files?.[0]) handleUpload(e.target.files[0]);
        }}
      />

      {loading && <Typography mt={2}>Загрузка...</Typography>}

      {error && (
        <Typography mt={2} color="error">
          {error}
        </Typography>
      )}

      {result && (
        <Box mt={2}>
          <Typography>Ссылка: <a href={result.link} target="_blank" rel="noreferrer">{result.link}</a></Typography>
          <Box mt={1}>
            <Image
              src={result.link}
              alt="Uploaded"
              width={500}
              height={300}
              style={{ maxWidth: '100%', height: 'auto' }}
              unoptimized // обязательно, т.к. Imgur — внешний источник
            />
          </Box>
        </Box>
      )}
    </Box>
  );
}
