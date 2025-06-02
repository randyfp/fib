'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import { ImageUpload } from '@/components/ImageUpload';

interface FormData {
  petitionNumber: number;
  jobTitle: string;
  employeeName: string;
  leaderName: string;
}

interface UploadedFile {
  file: File;
  url: string;
  uid: string;
}

export default function PetitionFormPage() {
  const [formData, setFormData] = useState<FormData>({
    petitionNumber: 0,
    jobTitle: '',
    employeeName: '',
    leaderName: '',
  });
  const [generatedText, setGeneratedText] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [imageCategories, setImageCategories] = useState<Record<string, string>>({});
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      leaderName: localStorage.getItem('petition_leaderName') || '',
      jobTitle: localStorage.getItem('petition_jobTitle') || '',
    }));
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function generatePetitionText(data: FormData, uploadedFiles: UploadedFile[], imageCategories: Record<string, string>) {
    const { petitionNumber, jobTitle, employeeName, leaderName } = data;
    const today = new Date().toLocaleDateString('ru-RU');
    // Группируем изображения по категориям
    const categoryMap: Record<string, string[]> = {};
    uploadedFiles.forEach((file) => {
      const cat = imageCategories[file.uid];
      if (!cat) return;
      if (!categoryMap[cat]) categoryMap[cat] = [];
      categoryMap[cat].push(file.file.name);
    });
    const imagesSection = Object.entries(categoryMap)
      .map(
        ([cat, files]) =>
          files.length > 0
            ? `${cat} ${employeeName}\n` + files.map((name) => `• /image/${name}`).join('\n')
            : ''
      )
      .filter(Boolean)
      .join('\n');
    return `[RIGHT]В Окружной/Верховный суд Штата Сан-Андреас\nОт гражданина США ${leaderName}[/RIGHT]\n\n\n[CENTER]Ходатайство № ${petitionNumber} [/CENTER]\n\nЯ, ${leaderName}, занимающий должность ${jobTitle} направляю суду и сторонам следующие материалы:\n\n${imagesSection || '-'}\n\n[RIGHT]\nДата:${today}\nПодпись: ________[/RIGHT]`;
  }

  function handleGenerate() {
    localStorage.setItem('petition_leaderName', formData.leaderName);
    localStorage.setItem('petition_jobTitle', formData.jobTitle);
    const text = generatePetitionText(formData, uploadedFiles, imageCategories);
    setGeneratedText(text);
    navigator.clipboard.writeText(text);
    setSnackbar({ open: true, message: 'Текст скопирован' });
  }

  function handleCategoryChange(uid: string, value: string) {
    setImageCategories((prev) => ({ ...prev, [uid]: value }));
  }

  function handleCopy() {
    navigator.clipboard.writeText(generatedText);
    setSnackbar({ open: true, message: 'Текст скопирован' });
  }

  function handleRemoveFile(uid: string) {
    setUploadedFiles((prev) => prev.filter((f) => f.uid !== uid));
    setImageCategories((prev) => {
      const copy = { ...prev };
      delete copy[uid];
      return copy;
    });
  }

  return (
    <Box
      sx={{
        color: '#fff',
        p: 4,
        borderRadius: 2,
        maxWidth: 1200,
        mx: 'auto',
      }}
    >
      <Typography variant="h4" mb={4} sx={{ color: '#fff' }}>
        Сформировать ходатайство
      </Typography>
      <Stack spacing={3} component="form">
        <FormControl fullWidth>
          <TextField
            label="Имя и фамилия руководства"
            variant="outlined"
            name="leaderName"
            value={formData.leaderName}
            onChange={handleChange}
            placeholder="Aidew moor"
            fullWidth
            slotProps={{
              root: { sx: { color: '#fff' } },
              input: {
                sx: {
                  color: '#fff',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#666' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#888' },
                  bgcolor: 'transparent',
                },
              },
              inputLabel: { sx: { color: '#fff' } },
            }}
          />
        </FormControl>
        <FormControl fullWidth>
          <TextField
            label="Должность"
            variant="outlined"
            name="jobTitle"
            value={formData.jobTitle}
            onChange={handleChange}
            placeholder="Заместитель главы отдела FNA"
            fullWidth
            slotProps={{
              root: { sx: { color: '#fff' } },
              input: {
                sx: {
                  color: '#fff',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#666' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#888' },
                  bgcolor: 'transparent',
                },
              },
              inputLabel: { sx: { color: '#fff' } },
            }}
          />
        </FormControl>
        <FormControl fullWidth>
          <TextField
            label="Номер ходатайства"
            variant="outlined"
            name="petitionNumber"
            type="number"
            value={formData.petitionNumber}
            onChange={handleChange}
            fullWidth
            slotProps={{
              root: { sx: { color: '#fff' } },
              input: {
                sx: {
                  color: '#fff',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#666' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#888' },
                  bgcolor: 'transparent',
                },
              },
              inputLabel: { sx: { color: '#fff' } },
            }}
          />
        </FormControl>
        <FormControl fullWidth>
          <TextField
            label="Имя Фамилия сотрудника"
            variant="outlined"
            name="employeeName"
            value={formData.employeeName}
            onChange={handleChange}
            placeholder="Randy Walkers"
            fullWidth
            slotProps={{
              root: { sx: { color: '#fff' } },
              input: {
                sx: {
                  color: '#fff',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#666' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#888' },
                  bgcolor: 'transparent',
                },
              },
              inputLabel: {
                sx: {
                  color: '#fff',
                  '&.Mui-focused': { color: '#fff' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#fff' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#fff' },
                },
              },
            }}
          />
        </FormControl>
        <ImageUpload
          onUpload={(url) => {
            setUploadedFiles((prev) => [
              ...prev,
              {
                file: { name: url, size: 0, type: '', lastModified: Date.now() } as File,
                url,
                uid: Math.random().toString(36).slice(2),
              },
            ]);
          }}
        />
        {uploadedFiles.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              mt: 2,
              width: '100%',
            }}
          >
            {uploadedFiles.map((file) => (
              <Box
                key={file.uid}
                sx={{
                  position: 'relative',
                  width: { xs: '50%', sm: '25%' },
                  height: 'content',
                  p: 2,
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  '&:hover .delete-btn': {
                    opacity: 1,
                    pointerEvents: 'auto',
                  },
                }}
              >
                <Box
                  component="img"
                  src={file.url}
                  alt={file.file.name}
                  sx={{
                    bgcolor: '#222',
                    aspectRatio: '1',
                    maxWidth: '100%',
                    maxHeight: 'calc(100% - 72px)',
                    objectFit: 'contain',
                    borderRadius: 2,
                    border: '1px solid #444',
                    margin: 'auto',
                  }}
                />
                <IconButton
                  className="delete-btn"
                  size="small"
                  onClick={() => handleRemoveFile(file.uid)}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: '#222',
                    color: '#ff4d4f',
                    zIndex: 2,
                    opacity: 0,
                    pointerEvents: 'none',
                    transition: 'opacity 0.2s',
                    '&:hover': { bgcolor: '#333', color: '#fff' },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
                <FormControl fullWidth sx={{ mb: 1, mt: 2 }}>
                  <InputLabel sx={{ color: '#fff', '&.Mui-focused': { color: '#fff' } }}>Категория</InputLabel>
                  <Select
                    value={imageCategories[file.uid] || ''}
                    label="Категория"
                    onChange={(e) => handleCategoryChange(file.uid, e.target.value)}
                    sx={{
                      width: '100%',
                      color: '#fff',
                      bgcolor: 'transparent',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#666' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#888' },
                    }}
                    slotProps={{
                      root: { sx: { color: '#fff', width: '100%' } },
                      input: {
                        sx: { color: '#fff', width: '100%' },
                      },
                    }}
                  >
                    <MenuItem value="Кадровый аудит">Кадровый аудит</MenuItem>
                    <MenuItem value="Уведомление сотрудника">Уведомление сотрудника</MenuItem>
                    <MenuItem value="Подтверждение должности сотрудника">Подтверждение должности сотрудника</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            ))}
          </Box>
        )}
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button
            variant="contained"
            sx={{
              bgcolor: '#1677ff',
              color: '#fff',
              '&:hover': { bgcolor: '#4096ff' },
              textTransform: 'none',
              fontWeight: 500,
              borderRadius: 1.5,
              px: 3,
            }}
            onClick={handleGenerate}
          >
            Сформировать текст
          </Button>
          <Button
            variant="outlined"
            sx={{
              color: '#fff',
              borderColor: '#444',
              bgcolor: 'transparent',
              '&:hover': { borderColor: '#1677ff', bgcolor: '#222' },
              textTransform: 'none',
              fontWeight: 500,
              borderRadius: 1.5,
              px: 3,
            }}
            onClick={() => {
              setFormData({ petitionNumber: 0, jobTitle: '', employeeName: '', leaderName: '' });
              setUploadedFiles([]);
              setImageCategories({});
              setGeneratedText('');
            }}
          >
            Сбросить
          </Button>
        </Box>
      </Stack>
      {generatedText && (
        <Box mt={4}>
          <Typography variant="h6" sx={{ color: '#fff' }}>Сформированный текст:</Typography>
          <TextField
            value={generatedText}
            multiline
            minRows={8}
            fullWidth
            sx={{
              mt: 2,
              color: '#fff',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#1677ff' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1677ff' },
              bgcolor: 'transparent',
            }}
            slotProps={{
              input:{
                sx:{ color: '#fff' }
              },
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleCopy}
            sx={{ mt: 2, bgcolor: '#1677ff', color: '#fff', '&:hover': { bgcolor: '#4096ff' } }}
          >
            Скопировать
          </Button>
        </Box>
      )}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar({ open: false, message: '' })}
        message={snackbar.message}
      />
    </Box>
  );
}
