import React from 'react';
import { Button, Typography, Select, Row, Col, Space } from 'antd';
import Image from 'next/image';
import { ImageUpload } from '@/components/ImageUpload';
import styles from './petitionImageCategories.module.css';

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
  const handleDescriptionChange = (value: string) => {
    onUpdate({ ...category, description: value });
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
    <div className={styles.categoryContainer}>
      <Row justify="space-between" align="middle">
        <Col>
          <Typography.Title level={5}>Категория {index + 1}</Typography.Title>
        </Col>
        <Col>
          <Button danger onClick={onRemove}>Удалить категорию</Button>
        </Col>
      </Row>
      <div className={styles.categoryDescriptionBlock}>
        <Typography.Text>Описание категории</Typography.Text>
        <Select
          value={category.description}
          onChange={handleDescriptionChange}
          className={styles.categorySelect}
          placeholder="Выберите описание"
        >
          <Select.Option value="Кадровый аудит">Кадровый аудит</Select.Option>
          <Select.Option value="Уведомление сотрудника">Уведомление сотрудника</Select.Option>
          <Select.Option value="Подтверждение должности сотрудника">Подтверждение должности сотрудника</Select.Option>
        </Select>
      </div>
      <Space direction="vertical" className={styles.imagesBlock}>
        {category.images.map((url, i) => (
          <Row key={i} align="middle" className={styles.imageRow} gutter={8}>
            <Col>
              <Image
                src={url}
                alt={`img-${i}`}
                width={120}
                height={80}
                className={styles.categoryImage}
                unoptimized
              />
            </Col>
            <Col>
              <Button danger onClick={() => handleRemoveImage(i)}>
                Удалить
              </Button>
            </Col>
          </Row>
        ))}
      </Space>
      <div className={styles.uploadBlock}>
        <ImageUpload onUpload={handleImageUpload} />
      </div>
    </div>
  );
};
