'use client';

import { useState } from "react";

export function ImageUpload({ onUpload }: { onUpload: (url: string) => void }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    });

    const result = await res.json();
    setIsLoading(false);

    if (result.link) {
      onUpload(result.link);
    } else {
      alert('Ошибка загрузки изображения');
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {isLoading && <p>Загрузка...</p>}
    </div>
  );
}
