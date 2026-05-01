'use client';

import { useMemo, useState } from 'react';
import { MantineReactTable, useMantineReactTable, type MRT_ColumnDef } from 'mantine-react-table';
import { Paper, Badge, Text, Button, Modal } from '@mantine/core';
import { fetchActiveSuppliers } from '@/api/supplier_api';
import { useQuery } from '@tanstack/react-query';
import { IconBarcode  } from '@tabler/icons-react';
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
    const { data: active_suppliers, isLoading } = useQuery({
        queryKey: ['active-suppliers'],
        queryFn: () => fetchActiveSuppliers()
    });

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
                <Button 
                    size="xs" 
                    color="blue" 
                    variant="light"
                    leftSection={<IconBarcode stroke={1.5} size={16} />}
                    onClick={() => {
                        setSelectedVendor(row.original); // Save the clicked vendor's data
                        open(); // Open the modal
                    }}
                >
                    Print Barcode
                </Button>
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
                size="80%" // Make the modal wide enough for a datatable
            >
                {/* Only render the products table if a vendor is selected */}
                {selectedVendor && (
                    <VendorProductCatalog vendor_code={selectedVendor.vendor_code} />
                )}
            </Modal>
        </>
        
    );
};