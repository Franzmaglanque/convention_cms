'use client';

import { 
  AppShell, 
  Burger, 
  Group, 
  ThemeIcon, 
  Text, 
  Menu, 
  Avatar, 
  UnstyledButton 
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconBrandMantine, IconLogout, IconChevronDown } from '@tabler/icons-react';
import { NavbarNested } from '../NavbarNested/NavbarNested';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { clearSession } from '@/app/actions/auth'; // Ensure this path matches your auth action

export function AppShellLayout({ children }: { children: React.ReactNode }) {
  const [opened, { toggle }] = useDisclosure();
  const router = useRouter();
  
  // Get user data and logout function from Zustand
  const user = useAuthStore((state) => state.user);
  const logoutState = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    // 1. Clear the HttpOnly cookie via server action
    await clearSession(); 
    // 2. Clear the Zustand user state
    logoutState(); 
    // 3. Redirect back to login
    router.push('/login'); 
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        {/* Added justify="space-between" to separate left and right content */}
        <Group h="100%" px="md" justify="space-between">
          
          {/* LEFT SIDE: Burger and Logo */}
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Group gap="xs">
              <ThemeIcon size="lg" radius="md" color="blue">
                <IconBrandMantine size={20} />
              </ThemeIcon>
              <Text fw={700} size="lg">CMS Dashboard</Text>
            </Group>
          </Group>

          {/* RIGHT SIDE: User Menu (Hover Trigger) */}
          <Menu 
            trigger="hover" 
            openDelay={100} 
            closeDelay={400} 
            shadow="md" 
            width={200} 
            position="bottom-end"
          >
            <Menu.Target>
              <UnstyledButton p="xs" style={{ borderRadius: '8px' }}>
                <Group gap={8}>
                  <Avatar radius="xl" size="sm" color="blue">
                    {/* Shows first letter of fullname, or 'U' as fallback */}
                    {user?.fullname?.charAt(0) || 'U'}
                  </Avatar>
                  <Text fw={500} size="sm" lh={1} mr={3}>
                    Hello, {user?.fullname || 'User'}
                  </Text>
                  <IconChevronDown size={14} stroke={1.5} />
                </Group>
              </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>Application</Menu.Label>
              <Menu.Item 
                color="red" 
                leftSection={<IconLogout size={14} />}
                onClick={handleLogout}
              >
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>

        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <NavbarNested />
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}