'use client';

import { useMemo, useState } from 'react';
import { MantineReactTable, useMantineReactTable, type MRT_ColumnDef } from 'mantine-react-table';
import { Paper, Badge, Text, Button, Modal, Group } from '@mantine/core';
import { fetchActiveSuppliers } from '@/api/supplier_api';
import { useQuery } from '@tanstack/react-query';
import { IconBarcode, IconDownload  } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { VendorProductCatalog } from '../VendorProductCatalog';

type Supplier = {
    id: number;
    vendor_code: string;
    vendor_name: string;
    scheme_count: number;
};

export const BarcodePrintingDatable = () => {
    const [opened, { open, close }] = useDisclosure(false);
    const [selectedVendor, setSelectedVendor] = useState<Supplier | null>(null);
    const [generatingPdfFor, setGeneratingPdfFor] = useState<string | null>(null);

    const { data: active_suppliers, isLoading } = useQuery({
        queryKey: ['active-suppliers'],
        queryFn: () => fetchActiveSuppliers()
    });

    const handleDownloadPdf = async (vendor_code:string) => {
        setGeneratingPdfFor(vendor_code);
        try {
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
            const response = await fetch(`${apiBaseUrl}/cms/vendor-catalog/download/${vendor_code}`, {
                method: 'GET',
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
            setGeneratingPdfFor(null);
        }
    };

    const columns = useMemo<MRT_ColumnDef<Supplier>[]>(() => [
        { accessorKey: 'id', header: 'ID',size:50 },

        { accessorKey: 'vendor_code', header: 'Vendor Code',size:50 },
        { accessorKey: 'vendor_name', header: 'Vendor Name',size:50 },

        { accessorKey: 'scheme_count', header: '# of Products',size:50 },
    ], []);

    const table = useMantineReactTable({
        columns,
        data: active_suppliers || [], 
        positionActionsColumn: 'last',
        initialState: { 
            density: 'xs',
            showGlobalFilter: true,
        },
        state: { isLoading },
        mantinePaperProps: {
            shadow: 'sm',
            radius: 'md',
            withBorder: true,
        },
        mantineTableProps: {
            striped: 'even',
            highlightOnHover: true,
            withColumnBorders: true,
        },
        enableRowActions: true,
        renderRowActions: ({ row }) => {
             return (
               <Group gap="xs" wrap="nowrap">
                    <Button 
                        size="xs" 
                        color="blue" 
                        variant="light"
                        leftSection={<IconBarcode stroke={1.5} size={16} />}
                        onClick={() => {
                            setSelectedVendor(row.original);
                            open();
                        }}
                    >
                        Print Barcode
                    </Button>

                    {/* NEW: Generate PDF Button */}
                    <Button 
                        size="xs" 
                        color="red"
                        variant="light"
                        leftSection={<IconDownload stroke={1.5} size={16} />}
                        loading={generatingPdfFor === row.original.vendor_code}
                        onClick={() => {
                            handleDownloadPdf(row.original.vendor_code)
                        }}
                    >
                        Generate PDF
                    </Button>
                </Group>
            );
        },
    });

    return (
        <>
            <Paper p="sm" radius="md">
                <MantineReactTable table={table} />
            </Paper>

            {/* Modal to display the selected vendor's products */}
            <Modal 
                opened={opened} 
                onClose={close} 
                title={<Text fw={700} size="lg">Products for {selectedVendor?.vendor_name}</Text>}
                size="80%"
            >
                {/* Only render the products table if a vendor is selected */}
                {selectedVendor && (
                    <VendorProductCatalog vendor_code={selectedVendor.vendor_code} />
                )}
            </Modal>
        </>
        
    );
};