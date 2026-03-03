import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';       // 1. Add this for date filtering features
import 'mantine-react-table/styles.css';  // 2. Add this for the table styles

import React from 'react';
import { ColorSchemeScript, mantineHtmlProps, MantineProvider } from '@mantine/core';
import { theme } from '../theme';
import QueryProvider from '@/components/QueryProvider';
import { AppShellLayout } from '@/components/AppShellLayout/AppShellLayout';

export const metadata = {
  title: 'Mantine Next.js template',
  description: 'I am using Mantine with Next.js!',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <QueryProvider>
          <MantineProvider theme={theme}>
            {/* Wrap your children in the new Shell */}
            {children}
          </MantineProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
