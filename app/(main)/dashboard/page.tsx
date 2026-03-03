'use client';

import { Title, Button, Text, Group, Badge, SimpleGrid, Paper } from '@mantine/core';
import { IconPlus, IconReceipt2, IconUsers, IconTicket } from '@tabler/icons-react';
import { Suspense } from 'react';
import { useQuery, useMutation } from "@tanstack/react-query";

function Dashboard() {
    // You can use React Query here later to fetch real dashboard statistics
    // const { data, isLoading } = useQuery({ queryKey: ['dashboardStats'], queryFn: fetchStats });

    return (
        <>
            {/* 1. Page Header */}
            <Group justify="space-between" align="center" mb="xl">
                <div>
                    <Title order={2}>Dashboard</Title>
                    <Text c="dimmed" size="sm">Overview of your CMS activity</Text>
                </div>
                <Button leftSection={<IconPlus size={16} />}>
                    New Record
                </Button>
            </Group>

            {/* 2. Key Metrics / Stats Grid */}
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg" mb="xl">
                {/* Stat Card 1 */}
                <Paper withBorder p="md" radius="md">
                    <Group justify="space-between">
                        <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Total Users</Text>
                        <IconUsers size={20} stroke={1.5} color="gray" />
                    </Group>
                    <Group align="flex-end" gap="xs" mt={25}>
                        <Text size="xl" fw={700}>1,432</Text>
                        <Badge color="teal" variant="light" size="sm">+12%</Badge>
                    </Group>
                </Paper>

                {/* Stat Card 2 */}
                <Paper withBorder p="md" radius="md">
                    <Group justify="space-between">
                        <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Active Vouchers</Text>
                        <IconTicket size={20} stroke={1.5} color="gray" />
                    </Group>
                    <Group align="flex-end" gap="xs" mt={25}>
                        <Text size="xl" fw={700}>84</Text>
                        <Badge color="red" variant="light" size="sm">-2%</Badge>
                    </Group>
                </Paper>

                {/* Stat Card 3 */}
                <Paper withBorder p="md" radius="md">
                    <Group justify="space-between">
                        <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Daily Scans</Text>
                        <IconReceipt2 size={20} stroke={1.5} color="gray" />
                    </Group>
                    <Group align="flex-end" gap="xs" mt={25}>
                        <Text size="xl" fw={700}>312</Text>
                        <Badge color="teal" variant="light" size="sm">+18%</Badge>
                    </Group>
                </Paper>
            </SimpleGrid>

            {/* 3. Main Content Area Placeholder */}
            <Title order={3} size="h4" mb="md">Recent Activity</Title>
            <Paper withBorder p="xl" radius="md" style={{ minHeight: 300 }}>
                <Group justify="center" align="center" h="100%" mt="xl">
                    <Text c="dimmed" ta="center">
                        Your data table or charts will go here.
                    </Text>
                </Group>
            </Paper>
        </>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<Text>Loading dashboard...</Text>}>
            <Dashboard />
        </Suspense>
    );
}