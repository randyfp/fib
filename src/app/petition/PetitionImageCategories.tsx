import React from 'react';
import { Box, Button, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material';
import Image from 'next/image';
import { ImageUpload } from '@/components/ImageUpload';

// Тип категории
export type ImageCategory = {
  description: string;
  images: string[];
};

// Компонент блока одной категории
export const CategoryBlock = ({
                                index,
                                category,
                                onUpdate,
                                onRemove,
                              }: {
  index: number;
  category: ImageCategory;
  onUpdate: (updated: ImageCategory) => void;
  onRemove: () => void;
}) => {
  const handleDescriptionChange = (e: SelectChangeEvent<string>) => {
    onUpdate({ ...category, description: e.target.value });
  };

  const handleImageUpload = (url: string) => {
    onUpdate({ ...category, images: [...category.images, url] });
  };

  const handleRemoveImage = (i: number) => {
    const newImages = [...category.images];
    newImages.splice(i, 1);
    onUpdate({ ...category, images: newImages });
  };

  return (
    <Box mt={3} p={2} border="1px solid #ccc" borderRadius={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">Категория {index + 1}</Typography>
        <Button color="error" onClick={onRemove}>Удалить категорию</Button>
      </Box>

      {/* Dropdown for category description */}
      <FormControl fullWidth sx={{ mt: 1 }}>
        <InputLabel>Описание категории</InputLabel>
        <Select
          value={category.description}
          onChange={handleDescriptionChange}
          label="Описание категории"
        >
          <MenuItem value="Кадровый аудит">Кадровый аудит</MenuItem>
          <MenuItem value="Уведомление сотрудника">Уведомление сотрудника</MenuItem>
          <MenuItem value="Подтверждение должности сотрудника">Подтверждение должности сотрудника</MenuItem>
        </Select>
      </FormControl>

      <Box mt={2}>
        {category.images.map((url, i) => (
          <Box key={i} mt={1} display="flex" gap={1} alignItems="center">
            <Image
              src={url}
              alt={`img-${i}`}
              width={120}
              height={80}
              style={{ borderRadius: 8 }}
              unoptimized
            />
            <Button onClick={() => handleRemoveImage(i)} color="error">
              Удалить
            </Button>
          </Box>
        ))}
      </Box>

      <Box mt={2}>
        <ImageUpload onUpload={handleImageUpload} />
      </Box>
    </Box>
  );
};
