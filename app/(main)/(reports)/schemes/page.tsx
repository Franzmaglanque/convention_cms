'use client';

import { fetchSupplierWithProducts } from '@/api/supplier_api';
import { useAuthStore } from '@/store/useAuthStore';
import { 
    Button, 
    Card, 
    Container, 
    Stack, 
    Text, 
    Title, 
    ThemeIcon,
    Center,
    Box,
    Select
} from '@mantine/core';
import { IconDownload, IconPackages } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

// --- Placeholder for your actual Vendor API fetch ---
const mockVendors = [
    { value: 'all', label: 'All Vendors (Combined Report)' },
    { value: '10391', label: 'Universal Robina Corp (URC) - 10391' },
    { value: '10495', label: 'Monde Nissin - 10495' },
    { value: '12539', label: 'Nestle Philippines - 12539' },
    { value: '19996', label: 'Coca-Cola Beverages - 19996' },
];

export default function ProductsSchemeReportGenerator() {

    const { data: vendors, isError, isFetching, isLoading } = useQuery({
        queryKey: ['vendors-with-products'],
        queryFn: () => fetchSupplierWithProducts()
    });
    
    // Auth token for the API request
    const token = useAuthStore((state) => state.token);
    
    // State management
    const [selectedVendor, setSelectedVendor] = useState<string | null>('all');
    const [isExporting, setIsExporting] = useState(false);
    const [vendorList, setVendorList] = useState(mockVendors);

    const handleExport = async () => {
        // Prevent export if somehow cleared
        if (!selectedVendor) return; 

        setIsExporting(true);
        try {
            // Call your Elysia Backend, passing the vendor_code (or 'all') as a query parameter
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reports/scheme-component/export?vendor=${selectedVendor}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'x-account-session-token': token || ''
                }
            });
            
            if (!res.ok) throw new Error('Failed to generate report');

            // Handle the binary Excel file exactly like the Tender report
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            
            // Dynamically name the file based on the selection
            const fileName = selectedVendor === 'all' 
                ? 'Products_Scheme_Report_All_Vendors.xlsx' 
                : `Products_Scheme_Report_Vendor_${selectedVendor}.xlsx`;
                
            link.setAttribute('download', fileName);
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
                    <ThemeIcon size={64} radius="100%" variant="light" color="grape">
                        <IconPackages size={32} />
                    </ThemeIcon>
                    
                    <Center style={{ flexDirection: 'column' }}>
                        <Title order={2}>Products & Scheme Report</Title>
                        <Text c="dimmed" size="sm" ta="center" mt="xs">
                            Generate an Excel report of product performance and schemes. Select a specific vendor or download all.
                        </Text>
                    </Center>
                </Stack>

                <Stack gap="lg">
                    <Box>
                        <Text fw={600} size="sm" mb="xs">Select Vendor</Text>
                        <Select
                            placeholder="Pick a vendor or select All"
                            data={vendors}
                            value={selectedVendor}
                            onChange={setSelectedVendor}
                            searchable
                            nothingFoundMessage="No vendors found"
                            size="md"
                            radius="md"
                            checkIconPosition="right"
                        />
                    </Box>

                    <Button 
                        size="lg"
                        leftSection={<IconDownload size={20} />} 
                        color="grape" 
                        onClick={handleExport}
                        loading={isExporting}
                        disabled={!selectedVendor}
                        fullWidth
                    >
                        Download Excel Report
                    </Button>
                </Stack>
            </Card>
        </Container>
    );
}