import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';       
import 'mantine-react-table/styles.css';  
import '@mantine/notifications/styles.css';

import React from 'react';
import { ColorSchemeScript, mantineHtmlProps, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { theme } from '../theme';
import QueryProvider from '@/components/QueryProvider';

export const metadata = {
  title: 'Convention CMS',
  description: 'CMS app for Puregold Aling Puring convention!',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // 1. Add suppressHydrationWarning here to the html tag
    <html lang="en" {...mantineHtmlProps} suppressHydrationWarning>
      <head>
        <ColorSchemeScript />
      </head>
      {/* 2. Add suppressHydrationWarning here to the body tag */}
      <body suppressHydrationWarning>
        <QueryProvider>
          <MantineProvider theme={theme}>
            <Notifications />
            {children}
          </MantineProvider>
        </QueryProvider>
      </body>
    </html>
  );
}