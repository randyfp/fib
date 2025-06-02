import 'antd/dist/reset.css';
import './globals.css';
import { Providers } from './providers';
import React from "react";
import { ConfigProvider } from 'antd';
import { AntdRegistry } from '@ant-design/nextjs-registry';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
    <body>
    <AntdRegistry>
      <ConfigProvider
        theme={{
          token: {
            colorText: '#fff',
          },
          components: {
            Input: {
              colorBgContainer: 'transparent',
              colorText: '#fff',
              colorBorder: '#888',
              colorTextPlaceholder: '#bbb',
            },
          },
        }}
      >
        <Providers>{children}</Providers>
      </ConfigProvider>
    </AntdRegistry>
    </body>
    </html>
  );
}