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
import { Paper } from '@mantine/core';
import {  useQuery } from '@tanstack/react-query';
import { fetchSupplierStocks } from '@/api/supplier_api';

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
const formatDateYYMMDD = (rawDate: string | number) => {
    if (!rawDate) return 'N/A';
    
    // Ensure it's a string and pad with leading zero if it accidentally became an integer (e.g. 50509 -> 050509)
    const str = rawDate.toString().padStart(6, '0'); 
    
    if (str.length !== 6) return str; // Fallback if data is malformed

    const year = `20${str.substring(0, 2)}`; // "25" -> "2025"
    const month = str.substring(2, 4);       // "05" -> "05"
    const day = str.substring(4, 6);         // "09" -> "09"

    // Create a JavaScript Date object (Month is 0-indexed in JS, so we subtract 1)
    const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    // Format it nicely (e.g., "May 09, 2025")
    return new Intl.DateTimeFormat('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: '2-digit' 
    }).format(dateObj);
};

export const SupplierStocksDatatable = ({ vendor_code }: SupplierUsersDatatableProps) => {
    const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});

    const { data: supplierStocks, isLoading } = useQuery({
        queryKey: ['supplier_stocks', vendor_code],
        queryFn: () => fetchSupplierStocks(vendor_code)
    });
    
    const columns = useMemo<MRT_ColumnDef<SupplierUsers>[]>(
        () => [
        {
            accessorKey: 'sku',
            header: 'SKU',
        },
        {
            accessorKey: 'uom',
            header: 'UOM',
        },
        {
            accessorKey: 'cost',
            header: 'Cost',
            Cell: ({ cell }) => {
                const value = Number(cell.getValue());
                
                return value.toLocaleString('en-PH', {
                style: 'currency',
                currency: 'PHP',
                });
            },
        },
        {
            accessorKey: 'price',
            header: 'Price',
            Cell: ({ cell }) => {
                const value = Number(cell.getValue());
                
                return  value.toLocaleString('en-PH', {
                style: 'currency',
                currency: 'PHP',
                }); 
            },
        },
        {
            accessorKey:'description',
            header:'Description'
        },
        {
            accessorKey: 'quantity',
            header: 'Quantity',
            Cell: ({ cell }) => {
                const value = Number(cell.getValue());
                
                return  value.toLocaleString('en-PH'); 
            },
        },
        ],
        [validationErrors],
    );

    const table = useMantineReactTable({
        columns,
        data: supplierStocks ?? [],
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

export default SupplierStocksDatatable;