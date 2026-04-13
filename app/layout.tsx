import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';       // 1. Add this for date filtering features
import 'mantine-react-table/styles.css';  // 2. Add this for the table styles
import '@mantine/notifications/styles.css';

import React from 'react';
import { ColorSchemeScript, mantineHtmlProps, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { theme } from '../theme';
import QueryProvider from '@/components/QueryProvider';
import { AppShellLayout } from '@/components/AppShellLayout/AppShellLayout';
import { ModalsProvider } from '@mantine/modals';

export const metadata = {
  title: 'Convention CMS',
  description: 'CMS app for Puregold Aling Puring convention!',
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
            <Notifications />
            {/* Wrap your children in the new Shell */}
            <ModalsProvider>
               {children}
            </ModalsProvider>
          </MantineProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
