'use client';

import { useState } from 'react';
import { Button, Input, Typography, Row, Col, message, Form, Space, Upload, Select, Image } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { CategoryBlock, ImageCategory } from './PetitionImageCategories';
import styles from './petitionPage.module.css';

interface FormData {
  petitionNumber: number;
  jobTitle: string;
  employeeName: string;
  leaderName: string;
}

export default function PetitionFormPage() {
  const [form] = Form.useForm<FormData>();
  const [categories, setCategories] = useState<ImageCategory[]>([]);
  const [generatedText, setGeneratedText] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([]);
  const [imageCategories, setImageCategories] = useState<Record<string, string>>({});

  function generatePetitionText(data: FormData, categories: ImageCategory[]) {
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
    return `[RIGHT]В Окружной/Верховный суд Штата Сан-Андреас\nОт гражданина США ${leaderName}[/RIGHT]\n\n\n[CENTER]Ходатайство № ${petitionNumber} [/CENTER]\n\nЯ, ${leaderName}, занимающий должность ${jobTitle} направляю суду и сторонам следующие материалы:\n\n${imagesSection || '[Описание документа] [Имя Фамилия сотрудника]  - *ссылка*;'}\n\n[RIGHT]\nДата:${today}\nПодпись: ________[/RIGHT]`;
  }

  async function onFinish(data: FormData) {
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
        message.success('Форма успешно отправлена!');
        setGeneratedText(generatePetitionText(data, categories));
        form.resetFields();
        setCategories([]);
      } else {
        message.error('Ошибка при отправке формы');
      }
    } catch (error) {
      console.error(error);
      message.error('Ошибка подключения к серверу');
    }
  }

  function handleGenerate() {
    const data = form.getFieldsValue();
    localStorage.setItem('petition_leaderName', data.leaderName);
    localStorage.setItem('petition_jobTitle', data.jobTitle);
    setGeneratedText(generatePetitionText(data, categories));
  }

  function handleUploadChange(info: any) {
    setUploadedFiles(info.fileList);
  }

  function handleCategoryChange(fileUid: string, value: string) {
    setImageCategories((prev) => ({ ...prev, [fileUid]: value }));
  }

  return (
    <Row justify="center" className={styles.centerRow}>
      <Col span={24}>
        <Typography.Title level={2} className={styles.title}>
          Сформировать ходатайство
        </Typography.Title>
        <Form
          form={form}
          layout="horizontal"
          labelCol={{ flex: '200px' }}
          wrapperCol={{ flex: 'auto' }}
          onFinish={onFinish}
          initialValues={{
            leaderName: typeof window !== 'undefined' ? localStorage.getItem('petition_leaderName') ?? '' : '',
            jobTitle: typeof window !== 'undefined' ? localStorage.getItem('petition_jobTitle') ?? '' : '',
          }}
        >
          <Form.Item
            label="Имя и фамилия руководства"
            name="leaderName"
          >
            <Input placeholder="Aidew moor" />
          </Form.Item>
          <Form.Item
            label="Должность"
            name="jobTitle"
          >
            <Input placeholder="Заместитель главы отдела FNA" />
          </Form.Item>
          <Form.Item
            label="Номер ходатайства"
            name="petitionNumber"
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            label="Имя Фамилия сотрудника"
            name="employeeName"
          >
            <Input placeholder="Randy Walkers" />
          </Form.Item>
          <Form.Item label="Загрузить изображения">
            <Upload.Dragger
              multiple
              onChange={handleUploadChange}
              beforeUpload={() => false}
              accept="image/*"
              showUploadList={false} 
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Перетащите или кликните для загрузки</p>
            </Upload.Dragger>
          </Form.Item>
          {uploadedFiles.length > 0 && (
            <div className={styles.uploadedFilesBlock} style={{ marginTop: 16 }}>
              {uploadedFiles.map((file) => (
                <div key={file.uid} className={styles.uploadedFileItem}>
                  <Image
                    src={`/image/${file.name}`}
                    alt={file.name}
                    width={180}
                    height={180}
                    className={styles.uploadedImage}
                    preview={false}
                  />
                  <Select
                    className={styles.uploadedSelect}
                    placeholder="Выберите категорию"
                    value={imageCategories[file.uid]}
                    onChange={(value) => handleCategoryChange(file.uid, value)}
                    options={[
                      { value: 'Кадровый аудит' },
                      { value: 'Уведомление сотрудника' },
                      { value: 'Подтверждение должности сотрудника' },
                    ]}
                  />
                </div>
              ))}
            </div>
          )}
          <Form.Item wrapperCol={{ offset: 0, span: 24 }}>
            <Space>
              <Button type="primary" onClick={handleGenerate}>
                Сформировать текст
              </Button>
            </Space>
          </Form.Item>
        </Form>
        {generatedText && (
          <div>
            <Typography.Title level={4}>Сформированный текст:</Typography.Title>
            <Input.TextArea
              value={generatedText}
              autoSize={{ minRows: 8 }}
              className={styles.generatedTextArea}
            />
            <Button
              type="primary"
              onClick={() => {
                navigator.clipboard.writeText(generatedText);
                message.info('Текст скопирован');
              }}
              className={styles.copyButton}
            >
              Скопировать
            </Button>
          </div>
        )}
      </Col>
    </Row>
  );
}
