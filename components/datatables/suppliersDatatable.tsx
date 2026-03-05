'use client';

import '@mantine/core/styles.css';
import '@mantine/dates/styles.css'; 
import 'mantine-react-table/styles.css'; 
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  type MRT_ColumnDef,
  MantineReactTable,
  useMantineReactTable,
} from 'mantine-react-table';
import { Badge, Paper, ActionIcon, Tooltip } from '@mantine/core';
import { IconEye } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { fetchSupplierRecords } from '@/api/supplier_api';

export type Supplier = {
    supplier_code: string;
    name: string;
    is_active: string;
};

export const SupplierDatatable = () => {
    const router = useRouter(); // Next.js router for redirection

    const { data, isLoading } = useQuery({
        queryKey: ['BatchRecords'],
        queryFn: () => fetchSupplierRecords(),
    });

    const columns = useMemo<MRT_ColumnDef<Supplier>[]>(
        () => [
        {
            accessorKey: 'supplier_code', // Updated to match type definition
            header: 'Supplier Code',
        },
        {
            accessorKey: 'name',
            header: 'Supplier Name',
        },
        {
            accessorKey: 'is_active',
            header: 'Status',
            Cell: ({ cell }) => {
                const value = cell.getValue<string>();
                return (
                    <Badge color={value === '1' ? 'green' : 'red'} variant="light">
                        {value === '1' ? 'Active' : 'Inactive'}
                    </Badge>
                );
            },
        }
        ],
        [],
    );

    const table = useMantineReactTable({
        columns,
        data: data ?? [],
        state: {
            isLoading, 
        },
        initialState: {
            density: 'xs',
        },

        // --- NEW: Enable Row Actions ---
        enableRowActions: true,
        positionActionsColumn: 'last', // Places the action column on the far right
        renderRowActions: ({ row }) => (
            <Tooltip label="View Supplier Details">
                <ActionIcon 
                    color="blue" 
                    variant="light"
                    onClick={() => router.push(`/supplier/${row.original.supplier_code}`)}
                >
                    <IconEye size={20} stroke={1.5} />
                </ActionIcon>
            </Tooltip>
        ),
        // -------------------------------

        paginationDisplayMode: 'pages', 
        mantinePaperProps: {
            shadow: 'sm',
            radius: 'md',
            withBorder: true,
        },
        mantineTableProps: {
            striped: 'even', 
            highlightOnHover: true, 
            withColumnBorders: true,
            withRowBorders: true,
        },
    });

    return (
        <Paper p="sm" radius="md">
            <MantineReactTable table={table} />
        </Paper>
    );
};

export default SupplierDatatable;