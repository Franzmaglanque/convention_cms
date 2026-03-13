'use client';

import { useMemo } from 'react';
import { MantineReactTable, useMantineReactTable, type MRT_ColumnDef } from 'mantine-react-table';
import { Paper, Badge, Text } from '@mantine/core';
import { fetchRcrProducts } from '@/api/product_api';
import { useQuery } from '@tanstack/react-query';

// 1. Define the TypeScript type based on your requested fields
export type InventoryProduct = {
    id: string | number;
    sku: string;
    description: string;
    quantity: number;
    retail: number;
    cost: number;
    uom: string; // Unit of Measure (e.g., 'pcs', 'box', 'kg')
};

export const InventoryDatatable = () => {

    const { data: rcrProducts, isLoading } = useQuery({
        queryKey: ['rcr_products'],
        queryFn: () => fetchRcrProducts()
    });

    const columns = useMemo<MRT_ColumnDef<InventoryProduct>[]>(() => [
        {
            accessorKey: 'rcr_no',
            header: 'RCR #',
            size: 50,
        },
        {
            accessorKey: 'po_no',
            header: 'PO #',
            size: 50,
        },
        {
            accessorKey: 'sku',
            header: 'SKU',
            size: 100,
            Cell: ({ cell }) => <Text fw={600}>{cell.getValue<string>()}</Text>,
        },
        {
            accessorKey: 'IDESCR',
            header: 'Description',
            size: 300,
        },
        {
            accessorKey: 'uom',
            header: 'UOM',
            size: 100,
            Cell: ({ cell }) => <Text c="dimmed" size="sm">{cell.getValue<string>()}</Text>,
        },
        {
            accessorKey: 'cost',
            header: 'Cost',
            size: 120,
            Cell: ({ cell }) => (
                <Text size="sm">₱{cell.getValue<number>()}</Text>
            ),
        },
        {
            accessorKey: 'quantity',
            header: 'In Stock',
            size: 120,
            Cell: ({ cell }) => {
                const qty = cell.getValue<number>();
                // Dynamic styling based on stock levels
                let color = 'green';
                if (qty === 0) color = 'red';
                else if (qty < 20) color = 'orange'; // Low stock threshold

                return (
                    <Badge color={color} variant={qty === 0 ? 'filled' : 'light'} size="lg">
                        {qty}
                    </Badge>
                );
            },
        },
    ], []);

    const table = useMantineReactTable({
        columns,
        data: rcrProducts || [], 
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