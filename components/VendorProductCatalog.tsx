'use client';

import { useRef } from 'react';
import { Button, Group, SimpleGrid, Card, Text, Center, Loader, Box } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { IconPrinter } from '@tabler/icons-react';
import Barcode from 'react-barcode';
import { useReactToPrint } from 'react-to-print';
import { fetchVendorProducts } from '@/api/product_api';
// import { fetchProductsByVendor } from '@/api/supplier_api';

type VendorProduct = {
    id: number;
    sku: string;
    barcode: string;
    description: string;
    promo_price: string;
    is_active: string;
};

export const VendorProductCatalog = ({ vendor_code }: { vendor_code: string }) => {
    // 1. Create a reference to the DOM element we want to print
    const printRef = useRef<HTMLDivElement>(null);

    // 2. Fetch the specific products for the selected vendor
    const { data: products, isLoading } = useQuery({
        queryKey: ['vendor-products', vendor_code],
        // Uncomment and replace with your actual API call:
        queryFn: () => fetchVendorProducts(vendor_code)
        // queryFn: () => Promise.resolve([] as VendorProduct[]), // Placeholder
    });

    // 3. Setup the print function using react-to-print
    const handlePrint = useReactToPrint({
        contentRef: printRef, // Use contentRef for the latest react-to-print version
        documentTitle: `Vendor_${vendor_code}_Barcode_Catalog`,
    });

    if (isLoading) {
        return <Center p="xl"><Loader /></Center>;
    }

    if (!products || products.length === 0) {
        return <Text c="dimmed" ta="center" p="xl">No products found for this vendor.</Text>;
    }

    return (
        <Box>
            {/* Header / Action Bar */}
            <Group justify="flex-end" mb="md">
                <Button
                    color="blue"
                    onClick={() => handlePrint()}
                    leftSection={<IconPrinter stroke={1.5} size={16} />}
                >
                    Print Catalog
                </Button>
            </Group>

            {/* 
              This Box is what actually gets printed!
              We wrap it in a div and attach the printRef here.
            */}
            <div ref={printRef} style={{ padding: '20px' }}>
                {/* <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg"> */}
                <SimpleGrid cols={2} spacing="sm">
                    {products.map((product:any) => (
                        <Card key={product.id} shadow="xs" padding="sm" radius="md" withBorder>
                            <Text fw={700} size="md">
                                {product.description}
                            </Text>
                            
                            <Group justify="space-between" mt="xs" mb="md">
                                <Text size="sm" c="dimmed">SKU: {product.sku}</Text>
                                <Text fw={700} c="blue">₱{product.price}</Text>
                            </Group>

                            {/* The actual Barcode visual */}
                            <Center>
                                <Barcode 
                                    value={product.barcode} 
                                    format="CODE128" // Standard retail format
                                    width={1.5}     // Adjust thickness
                                    height={50}     // Adjust height
                                    displayValue={true} // Shows the numbers under the barcode
                                    fontSize={14}
                                />
                            </Center>
                        </Card>
                    ))}
                </SimpleGrid>
            </div>
        </Box>
    );
};