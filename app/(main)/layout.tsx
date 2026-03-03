import { AppShellLayout } from '@/components/AppShellLayout/AppShellLayout';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShellLayout>
      {children}
    </AppShellLayout>
  );
}