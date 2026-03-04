import '@mantine/core/styles.css';
import '@mantine/dates/styles.css'; //if using mantine date picker features
import 'mantine-react-table/styles.css'; //make sure MRT styles were imported in your app root (once)
import clsx from 'clsx';
import { useMemo } from 'react';
import {
  type MRT_ColumnDef,
  MantineReactTable,
  useMantineReactTable,
} from 'mantine-react-table';
import { Badge, Paper, useMantineColorScheme } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { fetchSupplierRecords } from '@/api/supplier_api';

export type Supplier = {
    supplier_code: string;
    name: string;
    is_active: string;
};

export const Example = () => {
    const { data, isLoading } = useQuery({
        queryKey: ['BatchRecords'],
        queryFn: () => fetchSupplierRecords(),
    });
    
    const { colorScheme } = useMantineColorScheme();

    const columns = useMemo<MRT_ColumnDef<Supplier>[]>(
        () => [
        {
            accessorKey: 'supplierCode',
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
                const value = cell.getValue();

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

    console.log('suppliers',data);

    const table = useMantineReactTable({
        columns,
        data:data ?? [],
        state: {
            isLoading, // 2. Triggers the animated skeleton while fetching
        },
        // 3. Removed all the enable___: false lines to restore default features!
        
        // 4. UI Polish: Adds standard page numbers instead of just next/prev arrows
        paginationDisplayMode: 'pages', 
        
        // 5. UI Polish: Wraps the table in a nice card with a shadow
        mantinePaperProps: {
            shadow: 'sm',
            radius: 'md',
            withBorder: true,
        },
        mantineTableProps: {
            striped: 'even', // Alternating row colors are easier to read
            highlightOnHover: true, // Highlights row on mouse hover
            withColumnBorders: true,
            withRowBorders: true,
        },
    });

    //using MRT_Table instead of MantineReactTable if we do not want any of the toolbar features
    // return <MantineReactTable table={table} />;
    return (
        <Paper p="sm" radius="md">
            <MantineReactTable table={table} />
        </Paper>
    );
};

export default Example;