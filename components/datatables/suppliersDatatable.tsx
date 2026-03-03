import '@mantine/core/styles.css';
import '@mantine/dates/styles.css'; //if using mantine date picker features
import 'mantine-react-table/styles.css'; //make sure MRT styles were imported in your app root (once)
import classes from './CSS.module.css';
import clsx from 'clsx';
import { useMemo } from 'react';
import {
  type MRT_ColumnDef,
  MRT_Table,
  useMantineReactTable,
} from 'mantine-react-table';
import { useMantineColorScheme } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { fetchSupplierRecords } from '@/api/supplier_api';
import { useAuthStore } from '../../store/useAuthStore';
// import { data, type Person } from './makeData';
// import 

export type Supplier = {
    supplier_code: string;
    name: string;
    is_active: string;
};

// export const data: Person[] = [
//   {
//     firstName: 'Juan',
//     lastName: 'Dela Cruz',
//     address: '123 Rizal St',
//     city: 'Quezon City',
//     state: 'NCR',
//   },
//   {
//     firstName: 'Maria',
//     lastName: 'Santos',
//     address: '456 Mabini Ave',
//     city: 'Manila',
//     state: 'NCR',
//   },
// ];

export const Example = () => {
    const user = useAuthStore((state) => state.user);
    console.log('dshajdshjkdas',user);
    const { data, isLoading } = useQuery({
        queryKey: ['BatchRecords'],
        queryFn: () => fetchSupplierRecords(),
    });
    
    const { colorScheme } = useMantineColorScheme();

    // const columns = useMemo<MRT_ColumnDef<Person>[]>(
    //     () => [
    //     {
    //         accessorKey: 'firstName',
    //         header: 'First Name',
    //     },
    //     {
    //         accessorKey: 'lastName',
    //         header: 'Last Name',
    //     },
    //     {
    //         accessorKey: 'address',
    //         header: 'Address',
    //     },
    //     {
    //         accessorKey: 'city',
    //         header: 'City',
    //     },
    //     {
    //         accessorKey: 'state',
    //         header: 'State',
    //     },
    //     ],
    //     [],
    // );
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
            header: 'status',
        },
        ],
        [],
    );

     if(isLoading) return <div>Loading...</div>


    const table = useMantineReactTable({
        columns,
        data,
        enableColumnActions: false,
        enableColumnFilters: false,
        enablePagination: false,
        enableSorting: false,
        mantineTableProps: {
        className: clsx(classes.table),
        highlightOnHover: false,
        striped: 'odd',
        withColumnBorders: true,
        withRowBorders: true,
        withTableBorder: true,
        },
    });

    //using MRT_Table instead of MantineReactTable if we do not want any of the toolbar features
    return <MRT_Table table={table} />;
};

export default Example;