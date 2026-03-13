'use client';

import { useMemo } from 'react';
import { MantineReactTable, useMantineReactTable, type MRT_ColumnDef } from 'mantine-react-table';
import { Paper, Badge, Text } from '@mantine/core';
import { fetchAllProducts } from '@/api/product_api';
import { useQuery } from '@tanstack/react-query';

type SupplierProducts = {
    id: number;
    sku: string;
    barcode: string;
    description: string;
    promo_price: string;
    is_active: string; 
};

export const ProductOverviewDatatable = () => {

    const { data: all_products, isLoading } = useQuery({
        queryKey: ['product_overview'],
        queryFn: () => fetchAllProducts()
    });

    const columns = useMemo<MRT_ColumnDef<SupplierProducts>[]>(() => [
        { accessorKey: 'vendor_code', header: 'Vendor',size:50 },
        { accessorKey: 'sku', header: 'SKU',size:50 },
        { accessorKey: 'barcode', header: 'Barcode' ,size:50},
        { accessorKey: 'description', header: 'Description' },
        { accessorKey: 'promo_price', header: 'Price',size:50 },
        {
            accessorKey: 'is_active',
            header: 'Status',
            size:50,
            Cell: ({ cell }) => {
                const status = cell.getValue<string>();
                const color = status === 'true' ? 'green' : 'red';
                return <Badge color={color}>{status === 'true' ? 'Active' : 'Inactive'}</Badge>;
            }
        }
    ], []);

    const table = useMantineReactTable({
        columns,
        data: all_products || [], 
        positionActionsColumn: 'last',
        initialState: { 
            density: 'xs',
            showGlobalFilter: true,
        },
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
    });

    return (
        <Paper p="sm" radius="md">
            <MantineReactTable table={table} />
        </Paper>
    );
};