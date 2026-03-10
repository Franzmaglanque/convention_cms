'use client';

import '@mantine/core/styles.css';
import '@mantine/dates/styles.css'; 
import 'mantine-react-table/styles.css'; 
import { useMemo, useState } from 'react';
import {
  type MRT_ColumnDef,
  MantineReactTable,
  useMantineReactTable,
} from 'mantine-react-table';
import { Badge, Paper, ActionIcon, Tooltip, Group, Button, Text } from '@mantine/core';
import { IconEdit } from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';

import { fetchSupplierUsers } from '@/api/supplier_api';
import { useQueryClient } from '@tanstack/react-query';
import { showSuccessNotification, showErrorNotification, showWarningNotification } from '@/lib/notifications';

type SupplierUsersDatatableProps = {
    vendor_code:string
}

type SupplierUsers = {
    id: number;
    full_name: string;
    user_name: string;
    created_at: string;
    department: string;
    role: string; 
};

export const SupplierUsersDatatable = ({ vendor_code }: SupplierUsersDatatableProps) => {
    const queryClient = useQueryClient();
    const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});

    const { data: supplierUsers, isLoading } = useQuery({
        queryKey: ['supplier_users', vendor_code],
        queryFn: () => fetchSupplierUsers(vendor_code)
    });
    
    const columns = useMemo<MRT_ColumnDef<SupplierUsers>[]>(
        () => [
        {
            accessorKey: 'id', 
            header: 'ID',
            enableEditing: false, // Never editable
            size: 80,
        },
        {
            accessorKey: 'full_name',
            header: 'Name',
        },
        {
            accessorKey: 'username',
            header: 'Username',
        },
        {
            accessorKey: 'createdAt',
            header: 'Date created',
        },
        {
            accessorKey: 'department',
            header: 'Department',
        },
        {
            accessorKey: 'role',
            header: 'Role',
        },
        ],
        [validationErrors],
    );

    const table = useMantineReactTable({
        columns,
        data: supplierUsers ?? [],
        initialState: { 
            density: 'xs',
            showGlobalFilter: true
        },

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

export default SupplierUsersDatatable;