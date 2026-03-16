'use client';

import { useState } from 'react';
import { Title, Text, Group, Paper, Select, Button, SimpleGrid, ThemeIcon, Badge, Center, Loader } from '@mantine/core';
import { IconBuildingStore, IconFileAnalytics, IconCash, IconDeviceMobile, IconWallet, IconReceipt2 } from '@tabler/icons-react';
import { MantineReactTable, useMantineReactTable, type MRT_ColumnDef } from 'mantine-react-table';

// --- FORMATTER ---
const formatPhP = (amount: number) => {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
};

// --- MOCK VENDORS (For the dropdown) ---
const vendorOptions = [
    { value: 'all', label: 'All Vendors' },
    { value: '10391', label: 'Vendor A (Tech Gadgets)' },
    { value: '20247', label: 'Vendor B (Anime Merch)' },
    { value: '22818', label: 'Vendor C (Food Stall)' },
];

export default function PaymentReportPage() {
    // 1. Form State
    const [selectedVendor, setSelectedVendor] = useState<string | null>('all');
    
    // 2. Report State
    const [isGenerating, setIsGenerating] = useState(false);
    const [reportData, setReportData] = useState<any[] | null>(null);
    const [totals, setTotals] = useState({ total: 0, cash: 0, gcash: 0, pwallet: 0 });

    // 3. The API Trigger Function
    const handleGenerateReport = async () => {
        setIsGenerating(true);
        setReportData(null); // Clear old report

        try {
            // TODO: Replace this setTimeout with your actual API fetch!
            // Example: const response = await fetch(`/api/reports/payments?vendor=${selectedVendor}`);
            // const data = await response.json();
            
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulating network delay
            
            // Mock response from your Elysia backend
            const mockApiResponse = [
                { order_no: '1724054143', vendor_code: '10391', payment_method: 'CASH', amount: 5000.00, status: 'completed', date: '2026-03-12 10:15 AM' },
                { order_no: '4937800686', vendor_code: '20247', payment_method: 'GCASH', amount: 1250.50, status: 'completed', date: '2026-03-12 11:30 AM' },
                { order_no: '8242702233', vendor_code: '10391', payment_method: 'PWALLET', amount: 890.00, status: 'completed', date: '2026-03-12 01:45 PM' },
            ];

            // Calculate totals (or you can have your API do this and return it in the payload)
            const calculatedTotals = mockApiResponse.reduce((acc, curr) => {
                acc.total += curr.amount;
                if (curr.payment_method === 'CASH') acc.cash += curr.amount;
                if (curr.payment_method === 'GCASH') acc.gcash += curr.amount;
                if (curr.payment_method === 'PWALLET') acc.pwallet += curr.amount;
                return acc;
            }, { total: 0, cash: 0, gcash: 0, pwallet: 0 });

            setTotals(calculatedTotals);
            setReportData(mockApiResponse);

        } catch (error) {
            console.error("Failed to fetch report:", error);
            // Show error notification here
        } finally {
            setIsGenerating(false);
        }
    };

    // 4. Table Setup
    const columns: MRT_ColumnDef<any>[] = [
        { accessorKey: 'date', header: 'Date & Time', size: 150 },
        { accessorKey: 'order_no', header: 'Order No.', size: 120 },
        { accessorKey: 'vendor_code', header: 'Vendor Code', size: 120 },
        { 
            accessorKey: 'payment_method', 
            header: 'Method', 
            size: 100,
            Cell: ({ cell }) => {
                const method = cell.getValue<string>();
                const color = method === 'CASH' ? 'green' : method === 'GCASH' ? 'blue' : 'violet';
                return <Badge color={color} variant="light">{method}</Badge>;
            }
        },
        { 
            accessorKey: 'amount', 
            header: 'Amount',
            Cell: ({ cell }) => <Text fw={600}>{formatPhP(cell.getValue<number>())}</Text>
        },
    ];

    const table = useMantineReactTable({
        columns,
        data: reportData || [],
        // initialState: { density: 'sm' },
        mantinePaperProps: { shadow: 'sm', radius: 'md', withBorder: true },
    });

    return (
        <>
            <Title order={2} mb="xs">Payment Methods Report</Title>
            <Text c="dimmed" size="sm" mb="xl">Generate transaction records filtered by vendor.</Text>

            {/* --- THE CONTROL PANEL --- */}
            <Paper withBorder p="md" radius="md" shadow="sm" mb="xl">
                <Group align="flex-end">
                    <Select
                        label="Select Vendor"
                        placeholder="Choose a vendor"
                        data={vendorOptions}
                        value={selectedVendor}
                        onChange={setSelectedVendor}
                        leftSection={<IconBuildingStore size={16} />}
                        w={300}
                        allowDeselect={false}
                    />
                    
                    <Button 
                        leftSection={<IconFileAnalytics size={18} />} 
                        color="blue"
                        onClick={handleGenerateReport}
                        loading={isGenerating}
                    >
                        Generate Report
                    </Button>
                </Group>
            </Paper>

            {/* --- LOADING STATE --- */}
            {isGenerating && (
                <Center p="xl" mt="xl">
                    <Group>
                        <Loader size="sm" />
                        <Text c="dimmed">Compiling report data...</Text>
                    </Group>
                </Center>
            )}

            {/* --- THE REPORT RESULTS (Only visible after generation) --- */}
            {reportData && !isGenerating && (
                <div>
                    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg" mb="xl">
                        <Paper withBorder p="md" radius="md">
                            <Group justify="space-between">
                                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Total Collected</Text>
                                <ThemeIcon color="gray" variant="light" size={38} radius="md">
                                    <IconReceipt2 size={24} stroke={1.5} />
                                </ThemeIcon>
                            </Group>
                            <Text mt="sm" size="xl" fw={700}>{formatPhP(totals.total)}</Text>
                        </Paper>

                        <Paper withBorder p="md" radius="md">
                            <Group justify="space-between">
                                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Cash</Text>
                                <ThemeIcon color="green" variant="light" size={38} radius="md">
                                    <IconCash size={24} stroke={1.5} />
                                </ThemeIcon>
                            </Group>
                            <Text mt="sm" size="xl" fw={700}>{formatPhP(totals.cash)}</Text>
                        </Paper>

                        <Paper withBorder p="md" radius="md">
                            <Group justify="space-between">
                                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>GCash</Text>
                                <ThemeIcon color="blue" variant="light" size={38} radius="md">
                                    <IconDeviceMobile size={24} stroke={1.5} />
                                </ThemeIcon>
                            </Group>
                            <Text mt="sm" size="xl" fw={700}>{formatPhP(totals.gcash)}</Text>
                        </Paper>

                        <Paper withBorder p="md" radius="md">
                            <Group justify="space-between">
                                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>P-Wallet</Text>
                                <ThemeIcon color="violet" variant="light" size={38} radius="md">
                                    <IconWallet size={24} stroke={1.5} />
                                </ThemeIcon>
                            </Group>
                            <Text mt="sm" size="xl" fw={700}>{formatPhP(totals.pwallet)}</Text>
                        </Paper>
                    </SimpleGrid>

                    <MantineReactTable table={table} />
                </div>
            )}
        </>
    );
}