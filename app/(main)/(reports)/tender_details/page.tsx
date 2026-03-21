'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { 
    Button, 
    Card, 
    Container, 
    SegmentedControl, 
    Stack, 
    Text, 
    Title, 
    ThemeIcon,
    Center,
    Box
} from '@mantine/core';
import { IconDownload, IconFileSpreadsheet } from '@tabler/icons-react';
import { useState } from 'react';

export default function SupplierTenderReportGenerator() {
    const token = useAuthStore.getState().token;
    
    // 1. State for the selected convention day
    const [selectedDate, setSelectedDate] = useState('2026-03-18');
    const [isExporting, setIsExporting] = useState(false);

    // 2. Excel Export Function
    const handleExport = async () => {
        setIsExporting(true);
        try {
            // Call your Elysia Backend
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reports/tender/details/export?date=${selectedDate}`,{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-account-session-token': token || ''
            }
            });
            
            if (!res.ok) throw new Error('Failed to generate report');
                console.log('res',res);
        
            const blob = await res.blob();
                console.log('blob',blob);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Order_Payment_Report_${selectedDate}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export Error:', error);
            // Optional: Add a toast notification here if it fails
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Container size="sm" py="xl">
            <Card shadow="sm" radius="md" padding="xl" withBorder>
                <Stack align="center" gap="md" mb="xl">
                    <ThemeIcon size={64} radius="100%" variant="light" color="blue">
                        <IconFileSpreadsheet size={32} />
                    </ThemeIcon>
                    
                    <Center style={{ flexDirection: 'column' }}>
                        <Title order={2}>Order Payments Report</Title>
                        <Text c="dimmed" size="sm" ta="center" mt="xs">
                            Generate and download order payments breakdown per supplier.
                        </Text>
                    </Center>
                </Stack>

                <Stack gap="lg">
                    <Box>
                        <Text fw={600} size="sm" mb="xs">Select Convention Day</Text>
                        <SegmentedControl
                            value={selectedDate}
                            onChange={setSelectedDate}
                            data={[
                                { label: 'March 17 (Day 1)', value: '2026-03-17' },
                                { label: 'March 18 (Day 2)', value: '2026-03-18' },
                                { label: 'March 19 (Day 3)', value: '2026-03-19' },
                            ]}
                            size="md"
                            color="blue"
                            fullWidth
                        />
                    </Box>

                    <Button 
                        size="lg"
                        leftSection={<IconDownload size={20} />} 
                        color="blue" 
                        onClick={handleExport}
                        loading={isExporting}
                        fullWidth
                    >
                        Download Excel Report
                    </Button>
                </Stack>
            </Card>
        </Container>
    );
}