'use client';

import { 
    Title, Button, Text, Group, Paper, Badge, Grid, Container, 
    Skeleton, SimpleGrid, Tabs, ThemeIcon, rem 
} from '@mantine/core';
import { 
    IconArrowLeft, IconPackage, IconUsers, IconReceipt2, 
    IconCurrencyDollar, IconInfoCircle, IconTrendingUp
} from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetchSupplierDetails } from '@/api/supplier_api';
import SupplierProductsDatatable from '@/components/datatables/suppliersProductsDatatable';
// import SupplierUsersDatatable from '@/components/datatables/supplierUsersDatatable';
// import SupplierOrdersDatatable from '@/components/datatables/supplierOrdersDatatable';

export default function SupplierDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const supplierCode = params.id as string; 

    const { data: supplier, isLoading } = useQuery({
        queryKey: ['Supplier', supplierCode],
        queryFn: () => fetchSupplierDetails(supplierCode)
    });

    // 1. Loading State (Shows full page skeleton)
    if (isLoading) {
        return (
            <Container fluid px={0}>
                <Skeleton height={40} width="20%" mb="xl" />
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="xl">
                    <Skeleton height={100} radius="md" />
                    <Skeleton height={100} radius="md" />
                    <Skeleton height={100} radius="md" />
                    <Skeleton height={100} radius="md" />
                </SimpleGrid>
                <Skeleton height={400} radius="md" />
            </Container>
        );
    }

    // 2. Fallback if supplier is not found
    if (!supplier) return <div>Supplier not found.</div>;

    return (
        <Container fluid px={0}>
            {/* --- HEADER --- */}
            <Group mb="md">
                <Button 
                    variant="subtle" color="gray"
                    leftSection={<IconArrowLeft size={16} />}
                    onClick={() => router.back()}
                >
                    Back to Suppliers
                </Button>
            </Group>

            <Group justify="space-between" align="center" mb="xl">
                <div>
                    <Title order={2}>{supplier?.supplier_details?.name || 'Supplier Details'}</Title>
                    <Text c="dimmed" size="sm">Code: {supplierCode}</Text>
                </div>
                <Badge color={supplier.supplier_details.is_active === '1' ? 'green' : 'red'} size="lg" variant="light">
                    {supplier.supplier_details.is_active === '1' ? 'Active' : 'Inactive'}
                </Badge>
            </Group>

            {/* --- ANALYTICS / KPI CARDS --- */}
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="xl">
                <Paper withBorder p="md" radius="md">
                    <Group justify="space-between">
                        <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Total Sales</Text>
                        <ThemeIcon color="green" variant="light" size="lg"><IconCurrencyDollar size={20} /></ThemeIcon>
                    </Group>
                    <Group align="flex-end" gap="xs" mt={25}>
                        <Text size="xl" fw={700}>₱24,500.00</Text>
                        <Badge color="green" variant="light" size="sm" leftSection={<IconTrendingUp size={10}/>}>+14%</Badge>
                    </Group>
                </Paper>

                <Paper withBorder p="md" radius="md">
                    <Group justify="space-between">
                        <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Active Products</Text>
                        <ThemeIcon color="blue" variant="light" size="lg"><IconPackage size={20} /></ThemeIcon>
                    </Group>
                    <Text size="xl" fw={700} mt={25}>{supplier.supplierProducts?.length || 0}</Text>
                </Paper>

                <Paper withBorder p="md" radius="md">
                    <Group justify="space-between">
                        <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Total Orders</Text>
                        <ThemeIcon color="orange" variant="light" size="lg"><IconReceipt2 size={20} /></ThemeIcon>
                    </Group>
                    <Text size="xl" fw={700} mt={25}>342</Text>
                </Paper>

                <Paper withBorder p="md" radius="md">
                    <Group justify="space-between">
                        <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Registered Users</Text>
                        <ThemeIcon color="grape" variant="light" size="lg"><IconUsers size={20} /></ThemeIcon>
                    </Group>
                    <Text size="xl" fw={700} mt={25}>12</Text>
                </Paper>
            </SimpleGrid>

            {/* --- TABBED DATA TABLES --- */}
            <Paper withBorder shadow="sm" radius="md" p="md">
                <Tabs defaultValue="products" variant="outline">
                    <Tabs.List mb="md">
                        <Tabs.Tab value="products" leftSection={<IconPackage style={{ width: rem(16), height: rem(16) }} />}>
                            Products
                        </Tabs.Tab>
                        <Tabs.Tab value="users" leftSection={<IconUsers style={{ width: rem(16), height: rem(16) }} />}>
                            Users
                        </Tabs.Tab>
                        <Tabs.Tab value="orders" leftSection={<IconReceipt2 style={{ width: rem(16), height: rem(16) }} />}>
                            Orders
                        </Tabs.Tab>
                        <Tabs.Tab value="info" leftSection={<IconInfoCircle style={{ width: rem(16), height: rem(16) }} />}>
                            Supplier Info
                        </Tabs.Tab>
                    </Tabs.List>

                    {/* Products Tab */}
                    <Tabs.Panel value="products">
                        <SupplierProductsDatatable products={supplier.supplierProducts ?? []} vendor_code={supplierCode} />
                    </Tabs.Panel>

                    {/* Users Tab (Placeholder for your next component) */}
                    <Tabs.Panel value="users">
                        <Text c="dimmed" my="xl" ta="center">User management datatable will go here.</Text>
                        {/* <SupplierUsersDatatable users={supplier.supplierUsers ?? []} /> */}
                    </Tabs.Panel>

                    {/* Orders Tab (Placeholder for your next component) */}
                    <Tabs.Panel value="orders">
                        <Text c="dimmed" my="xl" ta="center">Orders history datatable will go here.</Text>
                        {/* <SupplierOrdersDatatable orders={supplier.supplierOrders ?? []} /> */}
                    </Tabs.Panel>

                    {/* Info Tab (The original details card) */}
                    <Tabs.Panel value="info">
                        <Grid gutter="xl" p="md">
                            <Grid.Col span={{ base: 12, md: 6 }}>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Supplier Name</Text>
                                <Text size="lg" fw={500} mb="xl">{supplier?.supplier_details?.name || 'N/A'}</Text>

                                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Supplier Code</Text>
                                <Text size="lg" fw={500} mb="xl">{supplier?.supplier_code || supplierCode}</Text>
                            </Grid.Col>

                            <Grid.Col span={{ base: 12, md: 6 }}>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Date Added</Text>
                                <Text size="lg" fw={500} mb="xl">{supplier?.created_at || 'N/A'}</Text>
                            </Grid.Col>
                        </Grid>
                    </Tabs.Panel>

                </Tabs>
            </Paper>
        </Container>
    );
}