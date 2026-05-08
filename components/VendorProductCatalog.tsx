'use client';

import { useRef, useState } from 'react';
import { Button, Group, SimpleGrid, Card, Text, Center, Loader, Box } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { IconDownload, IconPrinter } from '@tabler/icons-react';
import Barcode from 'react-barcode';
import { useReactToPrint } from 'react-to-print';
import { fetchVendorProducts } from '@/api/product_api';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';


export const VendorProductCatalog = ({ vendor_code }: { vendor_code: string }) => {
    // 1. Create a reference to the DOM element we want to print
    const printRef = useRef<HTMLDivElement>(null);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

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

    const handleDownloadPdf = async () => {
        setIsGeneratingPdf(true);
        try {
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
            const response = await fetch(`${apiBaseUrl}/cms/vendor-catalog/download/${vendor_code}`, {
                method: 'GET',
                headers: {
                    // If your API needs a token, add it here:
                    // 'Authorization': `Bearer ${yourToken}` 
                }
            });

            if (!response.ok) throw new Error('Download failed');

            // ✨ Convert the response to a Blob (Binary Large Object)
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            
            // Create a temporary link and click it to trigger the download
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `catalog-${vendor_code}.pdf`);
            document.body.appendChild(link);
            link.click();
            
            // Cleanup
            link.remove();
            window.URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error("PDF Generation Error:", error);
            alert("Failed to download catalog. Please try again.");
        } finally {
            setIsGeneratingPdf(false);
        }
    };

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
                    color="green"
                    variant="light"
                    onClick={handleDownloadPdf}
                    loading={isGeneratingPdf}
                    leftSection={<IconDownload stroke={1.5} size={16} />}
                >
                    Download PDF
                </Button>
                
                <Button
                    color="blue"
                    onClick={() => handlePrint()}
                    disabled={isGeneratingPdf}
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
                <SimpleGrid cols={2} spacing="xs" verticalSpacing="xs">
                    {products.map((product:any) => (
                        <Box 
                            key={product.id} 
                            style={{ 
                                border: '2.5px dashed #000000', 
                                padding: '8px', 
                                pageBreakInside: 'avoid',
                                display: 'flex',
                                flexDirection: 'column',
                                // ✨ FIX 1: Removed justifyContent: 'space-between'
                                // Now items will naturally stack tightly from top to bottom
                            }} 
                        >
                            {/* Product Description */}
                            <Text 
                                fw={700} 
                                size="xs" 
                                lineClamp={3} 
                                // ✨ FIX 2: Removed minHeight, added a tiny bottom margin
                                style={{ lineHeight: 1.2, marginBottom: '6px' }}
                            >
                                {product.description}
                            </Text>
                            
                            {/* SKU and Prominent Price */}
                            {/* ✨ FIX 3: Removed top margin (mt) to hug the title closely */}
                            <Group justify="space-between" align="flex-end" mb="xs">
                                <Text size="10px" c="dimmed">SKU: {product.sku}</Text>
                                <Text fw={900} size="lg" c="black" style={{ letterSpacing: '-0.5px', lineHeight: 1 }}>
                                    ₱{product.price}
                                </Text>
                            </Group>

                            {/* The Scannable Barcode */}
                            {/* ✨ FIX 4: Ensured the barcode hugs the price */}
                            <Center mt={-4}>
                                <Barcode 
                                    value={product.barcode} 
                                    format="CODE128" 
                                    width={1.3}     
                                    height={35}     
                                    displayValue={true} 
                                    fontSize={10}   
                                    margin={0}      
                                />
                            </Center>
                        </Box>
                    ))}
                </SimpleGrid>
            </div>
        </Box>
    );
};