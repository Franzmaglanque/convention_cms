'use client';

import { Title, Button, Text, Group, Badge, SimpleGrid, Paper, Stack, Progress, ThemeIcon, RingProgress, Center, Avatar, ScrollArea } from '@mantine/core';
import { IconReceipt2, IconBuildingStore, IconTrophy, IconCreditCard, IconChartBar, IconDownload, IconTrendingUp, IconMedal } from '@tabler/icons-react';
import { dashboardAnalytics } from '@/api/dashboard_api';
import { useQuery } from '@tanstack/react-query';


// --- MOCK DATA (Replace these with your TanStack Query data later) ---
const mockStats = {
    totalRevenue: '₱1,245,000',
    totalOrders: 4231,
    activeSuppliers: 84,
};

// const topSuppliers = [
//     { id: 1, name: 'Vendor A (Tech Gadgets)', sales: '₱450,000', percent: 80 },
//     { id: 2, name: 'Vendor B (Anime Merch)', sales: '₱320,000', percent: 65 },
//     { id: 3, name: 'Vendor C (Food Stall)', sales: '₱150,000', percent: 40 },
//     { id: 4, name: 'Vendor D (Art Prints)', sales: '₱85,000', percent: 25 },
// ];

// const topSuppliers = [
//     { id: '10154', name: 'Vendor A (Tech Gadgets)', score: 450000 },
//     { id: '10252', name: 'Vendor B (Anime Merch)', score: 320000 },
//     { id: '10399', name: 'Vendor C (Food Stall)', score: 150000 },
//     { id: '10400', name: 'Vendor D (Art Prints)', score: 85000 },
// ];

// const topProducts = [
//     { id: 1, name: 'Mechanical Keyboard X1', sold: 450, supplier: 'Vendor A' },
//     { id: 2, name: 'Mystery Blind Box', sold: 380, supplier: 'Vendor B' },
//     { id: 3, name: 'Spicy Ramen Bowl', sold: 310, supplier: 'Vendor C' },
//     { id: 4, name: 'Convention Exclusive Pin', sold: 295, supplier: 'Vendor B' },
// ];

// const paymentMethods = [
//     { id: 1, method: 'Cash', amount: '₱650,000', percent: 52, color: 'green' },
//     { id: 2, method: 'E-Wallet (GCash/Maya)', amount: '₱425,000', percent: 34, color: 'blue' },
//     { id: 3, method: 'Credit/Debit Card', amount: '₱170,000', percent: 14, color: 'violet' },
// ];

const topProducts = [
    { id: '853077', name: 'HANA SHAMPOO PINK PASSION', sold: 450, trend: '+12%' },
    { id: '825523', name: 'OK YUMSHOTS MIXED 70G', sold: 380, trend: '+5%' },
    { id: '10252', name: 'UNIQUE TOOTHPASTE RED', sold: 310, trend: '+18%' },
    { id: '12169', name: 'THOSE DAYS SANITARY NAPKIN', sold: 295, trend: '-2%' },
];

const topSuppliers = [
    { vendor_code: 'GLOBE', name: 'Globe Telecom', total: 526450.00 },
    { vendor_code: '10154', name: 'Smart Communications', total: 158187.50 },
    { vendor_code: '10156', name: 'DITO Telecommunity', total: 204.50 },
];

const paymentMethods = [
    { label: 'Cash', amount: 650000, color: 'teal' },
    { label: 'E-Wallet', amount: 425000, color: 'blue' },
    { label: 'Card', amount: 170000, color: 'violet' },
];

// const formatPhP = (num: number) => `₱${num.toLocaleString()}`;
const formatPhP = (num: number) =>
  `₱${num.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function Dashboard() {

    const { data: analytics, isError, isFetching, isLoading } = useQuery({
        queryKey: ['dashboard-analytics'],
        queryFn: () => dashboardAnalytics()
    });
    console.log('dashboardAnalytics test',analytics)

    // You can use React Query here later to fetch real dashboard statistics
    // const { data: stats } = useQuery({ queryKey: ['dashboardStats'], queryFn: fetchStats });
    // Convert payment amounts to percentages for the RingProgress
    const totalPayments = paymentMethods.reduce((acc, curr) => acc + curr.amount, 0);
    const ringData = paymentMethods.map(pm => ({
        value: (pm.amount / totalPayments) * 100,
        color: pm.color,
        tooltip: pm.label
    }));

    // Helper to get medal colors based on rank index
    const getMedalColor = (index: number) => {
        if (index === 0) return 'yellow.5'; // Gold
        if (index === 1) return 'gray.5';   // Silver
        if (index === 2) return 'orange.6'; // Bronze
        return 'gray.2';                    // Others
    };

    const PAYMENT_COLORS: Record<string, string> = {
        'GCASH': 'blue',
        'CASH': 'teal',
        'PWALLET': 'yellow', 
        'CREDIT_DEBIT_CARD': 'violet',
        'SHOPEE_PAY': 'orange',
        'HOME_CREDIT': 'red',
        'DEFAULT': 'gray' // Fallback color
    };

    // 2. Map over your database results
    // Assuming `dbResults` is the array you get from your backend
    // const formattedPayments = dbResults.map((item: any) => ({
    //     label: item.label,
    //     // Convert the string decimal from SQL into a JavaScript Number
    //     amount: parseFloat(item.total), 
    //     // Lookup the color, or use gray if it's a new payment type
    //     color: PAYMENT_COLORS[item.label] || PAYMENT_COLORS.DEFAULT 
    // }));
    return (
        <>
            {/* 1. Page Header */}
            <Group justify="space-between" align="center" mb="xl">
                <div>
                    <Title order={2}>Convention CMS Dashboard</Title>
                    <Text c="dimmed" size="sm">Real-time overview of convention sales and metrics.</Text>
                </div>
                {/* <Button leftSection={<IconDownload size={16} />} variant="outline">
                    Export Daily Report
                </Button> */}
            </Group>

            {/* 2. Key Metrics / Stats Grid (Revenue, Orders, Active Suppliers) */}
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg" mb="xl">
                <Paper withBorder p="md" radius="md">
                    <Group justify="space-between">
                        <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Gross Revenue (Today)</Text>
                        <ThemeIcon color="green" variant="light" size={38} radius="md">
                            <IconChartBar size={24} stroke={1.5} />
                        </ThemeIcon>
                    </Group>
                    <Group align="flex-end" gap="xs" mt={25}>
                        {/* <Text size="xl" fw={700}>{mockStats.totalRevenue}</Text> */}
                        <Text size="xl" fw={700}>{Number(analytics?.total_sales).toLocaleString()}</Text>

                        <Badge color="green" variant="light" size="sm">+12% vs Yesterday</Badge>
                    </Group>
                </Paper>

                <Paper withBorder p="md" radius="md">
                    <Group justify="space-between">
                        <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Total Transactions</Text>
                        <ThemeIcon color="blue" variant="light" size={38} radius="md">
                            <IconReceipt2 size={24} stroke={1.5} />
                        </ThemeIcon>
                    </Group>
                    <Group align="flex-end" gap="xs" mt={25}>
                        <Text size="xl" fw={700}>{analytics?.transaction_count?.toLocaleString()}</Text>
                    </Group>
                </Paper>

                <Paper withBorder p="md" radius="md">
                    <Group justify="space-between">
                        <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Active Suppliers Selling</Text>
                        <ThemeIcon color="grape" variant="light" size={38} radius="md">
                            <IconBuildingStore size={24} stroke={1.5} />
                        </ThemeIcon>
                    </Group>
                    <Group align="flex-end" gap="xs" mt={25}>
                        <Text size="xl" fw={700}>{analytics?.active_suppliers_count}</Text>
                        <Badge color="grape" variant="dot" size="sm">Live</Badge>
                    </Group>
                </Paper>
            </SimpleGrid>

            <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg" mb="xl">

                {/* 3. Leaderboards Grid */}
                {/* 1. TOP SELLING ITEMS (Replaced Leaderboards Grid) */}
                <Paper withBorder p="md" radius="md">
                    <Title order={4} size="h5" mb="md" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <IconTrophy size={20} color="#FFD700" /> Top Selling Items
                    </Title>
                    
                    {/* 1. Added ScrollArea to lock the height (e.g., 400px) so it matches other dashboard cards */}
                    <ScrollArea h={400} type="hover" offsetScrollbars>
                        
                        {/* 2. Added padding right (pr="sm") so the scrollbar doesn't overlap your text */}
                        <Stack gap="md" pr="sm"> 
                            
                            {/* 3. Added .slice(0, 50) to protect performance. It will only render the top 50 rows. */}
                            {analytics?.top_selling_items?.slice(0, 50).map((item:any, index:any) => (
                                <Group key={item.sku} wrap="nowrap" align="flex-start">
                                    
                                    {/* Medal / Ranking Icon */}
                                    <ThemeIcon 
                                        size={32} 
                                        radius="xl" 
                                        color={getMedalColor(index)}
                                        variant={index < 3 ? 'filled' : 'light'}
                                        style={{ flexShrink: 0 }} 
                                    >
                                        {index < 3 ? <IconMedal size={18} /> : <Text size="sm" fw={700}>{index + 1}</Text>}
                                    </ThemeIcon>
                                    
                                    {/* Main Item Details */}
                                    <div style={{ flex: 1, minWidth: 0 }}> 
                                        <Text size="sm" fw={600} lineClamp={2} title={item.description}>
                                            {item.description}
                                        </Text>
                                        <Text size="xs" c="dimmed" mt={4}>
                                            SKU: {item.sku} • {item.total_quantity_sold} sold
                                        </Text>
                                    </div>
                                    
                                    {/* Revenue & Pricing */}
                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                        <Text size="sm" fw={700} c="green.7">{formatPhP(Number(item.total))}</Text>
                                        <Text size="xs" c="dimmed">@{formatPhP(Number(item.unit_price))}</Text>
                                    </div>
                                    
                                </Group>
                            ))}
                        </Stack>
                    </ScrollArea>
                </Paper>

                {/* 2. TOP SUPPLIERS */}
                {/* 2. TOP SUPPLIERS BY REVENUE */}
                <Paper withBorder p="md" radius="md">
                    <Title order={4} size="h5" mb="md" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <IconBuildingStore size={20} color="#1c7ed6" /> Top Suppliers by Revenue
                    </Title>
                    <ScrollArea h={400} type="hover" offsetScrollbars>
                    <Stack gap="md">
                        {analytics?.top_suppliers.map((supplier:any,index:any) => {
                            return (
                                <div key={supplier.vendor_code}>
                                    <Group justify="space-between" mb={8} wrap="nowrap" align="center">
                                        
                                        {/* Avatar and Text Container */}
                                        <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                                            {/* <Avatar color="blue" radius="xl" size="md">
                                                {supplier.name.substring(0, 2).toUpperCase()}
                                            </Avatar> */}
                                            {/* Medal / Ranking Icon */}
                                    <ThemeIcon 
                                        size={32} 
                                        radius="xl" 
                                        color={getMedalColor(index)}
                                        variant={index < 3 ? 'filled' : 'light'}
                                        style={{ flexShrink: 0 }} 
                                    >
                                        {index < 3 ? <IconMedal size={18} /> : <Text size="sm" fw={700}>{index + 1}</Text>}
                                    </ThemeIcon>
                                            
                                            {/* Stack Name and Vendor Code */}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <Text size="sm" fw={600} lineClamp={1} title={supplier.name}>
                                                    {supplier.name}
                                                </Text>
                                                <Text size="xs" c="dimmed">
                                                    {supplier.vendor_code}
                                                </Text>
                                            </div>
                                        </Group>
                                        
                                        {/* Total Revenue */}
                                        <Text size="sm" fw={700} style={{ flexShrink: 0 }}>
                                            {formatPhP(Number(supplier.total))}
                                        </Text>
                                    </Group>
                                </div>
                            );
                        })}
                    </Stack>
                    </ScrollArea>
                </Paper>

                {/* 3. PAYMENT METHODS (Using Mantine RingProgress) */}
                <Paper withBorder p="md" radius="md">
                    <Title order={4} size="h5" mb="sm" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <IconCreditCard size={20} color="#CD7F32" /> Payment Methods
                    </Title>
                    
                    <Group justify="center" mt="md">
                        <RingProgress
                            size={180}
                            thickness={20}
                            roundCaps
                            sections={ringData}
                            label={
                                <Center>
                                    <Stack gap={0} align="center">
                                        <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Total</Text>
                                        <Text size="md" fw={700}>{formatPhP(Number(analytics?.total_sales))}</Text>
                                    </Stack>
                                </Center>
                            }
                        />
                    </Group>

                    <Stack gap="xs" mt="md">
                        {analytics?.tender_breakdown.map((method:any) => (
                            <Group key={method.label} justify="space-between">
                                <Group gap="xs">
                                    <ThemeIcon color={method.color} size={12} radius="xl" />
                                    <Text size="sm" c="dimmed">{method.label}</Text>
                                </Group>
                                <Text size="sm" fw={600}>{formatPhP(Number(method.amount))}</Text>
                            </Group>
                        ))}
                    </Stack>
                </Paper>

            </SimpleGrid>


            {/* 4. Live Feed Placeholder */}
            <Title order={3} size="h4" mb="md">Live Transaction Feed</Title>
            <Paper withBorder p="xl" radius="md" style={{ minHeight: 200 }}>
                <Group justify="center" align="center" h="100%" mt="xl">
                    <Text c="dimmed" ta="center">
                        (A real-time list of the last 10 orders placed across all vendors will appear here.)
                    </Text>
                </Group>
            </Paper>
        </>
    );
}