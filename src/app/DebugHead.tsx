'use client';

import React, { useEffect } from 'react';

export function DebugHead() {
  useEffect(() => {
    // Логируем все <link> и <style> в <head>
    const links = Array.from(document.head.querySelectorAll('link, style'));
    // eslint-disable-next-line no-console
    console.log('HEAD CONTENT:', links.map(el => el.outerHTML));

    // Проверяем появление кнопки AntD
    const interval = setInterval(() => {
      const antBtn = document.querySelector('.ant-btn');
      if (antBtn) {
        // eslint-disable-next-line no-console
        console.log('Ant Design button detected:', antBtn);
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);
  return null;
} 