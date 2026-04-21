'use client';

import { useMemo, useState } from 'react';
import { Title, Text, Group, Paper, Badge, ActionIcon, Tooltip, Modal, ThemeIcon, Loader, Center, Stack, Card, Divider, SimpleGrid, Box, Button } from '@mantine/core';
import { IconEye, IconDiscountCheck, IconListDetails, IconReceipt2, IconInbox, IconCash, IconDeviceMobile, IconCalendar, IconHash, IconPackage, IconBolt } from '@tabler/icons-react';
import { MantineReactTable, useMantineReactTable, type MRT_ColumnDef } from 'mantine-react-table';
import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchAllOrders, fetchLoadOrders, fetchOrderItems, fetchOrderPayments } from '@/api/order_api';
import { modals } from '@mantine/modals';
import { executeLoad } from '@/api/load_api';
import { showErrorNotification, showSuccessNotification } from '@/lib/notifications';

// --- FORMATTER ---
const formatPhP = (amount: number) => {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
};

type SupplierOrders = {
    id: number;
    vendor_code:string;
    order_no: string;
    load_type:string;
    mobile_number:string;
    network:string;
    amount:string;
    load_status:string;
    sku:string;
};

export default function ManageOrdersPage() {
    const [globalFilter, setGlobalFilter] = useState('');
    const [openedModal, setOpenedModal] = useState<'items' | 'payments' | null>(null);
    const [selectedOrderNo, setSelectedOrderNo] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    const { data: loadData, isError, isFetching, isLoading,refetch } = useQuery({
        queryKey: ['load-orders',pagination.pageIndex,pagination.pageSize,globalFilter],
        queryFn: () => fetchLoadOrders({
            pageIndex: pagination.pageIndex,
            pageSize: pagination.pageSize,
            globalFilter: globalFilter
        })
    });

    const executeLoadMutation = useMutation({
        mutationFn: async (row:any) => executeLoad(row),
        onSuccess: (res) => {
            console.log('executeLoadMutation',res)
            showSuccessNotification('Success', res.description);
            refetch()
        },
        onError: (error) => {
            console.error(error);
            showErrorNotification('Upload Failed', 'There was an error processing the Excel file.');
        }
    });

    // --- TABLE COLUMNS ---
    const columns = useMemo<MRT_ColumnDef<SupplierOrders>[]>(() => [
        { 
            accessorKey: 'vendor_code', 
            header: 'Vendor', 
            size: 100 
        },
        { 
            accessorKey: 'order_no', 
            header: 'Order No.', 
            size: 130,
            Cell: ({ cell }) => <Text fw={600} c="blue">{cell.getValue<string>()}</Text>
        },
        { 
            accessorKey: 'load_type', 
            header: 'Load Type', 
            size: 160 
        },
        { 
            accessorKey: 'mobile_number', 
            header: 'Mobile Number', 
            size: 160 
        },
        { 
            accessorKey: 'amount', 
            header: 'Total Amount',
            size: 120,
            Cell: ({ cell }) => <Text fw={700}>{formatPhP(cell.getValue<number>())}</Text>
        },
        { 
            accessorKey: 'load_status', 
            header: 'Status',
            size: 120,
            Cell: ({ cell }) => {
                const status = cell.getValue<string>();
                let color = 'gray';
                if (status === 'completed') color = 'teal';
                if (status === 'pending') color = 'yellow';
                if (status === 'cancelled') color = 'red';
                
                return <Badge color={color} variant="light">{status.toUpperCase()}</Badge>;
            }
        },
        { 
            accessorKey: 'created_at', 
            header: 'Date & Time', 
            size: 160 
        },   
    ], []);

    const table = useMantineReactTable({
        columns,
        data: loadData?.data || [],
        enableGlobalFilter: true, // This enables the search bar at the top right!
        initialState: { 
            density: 'xs',
            showGlobalFilter: true, // Show search bar by default
        },
        rowCount: loadData?.meta?.totalRowCount ?? 0,
        mantineSearchTextInputProps: {
            placeholder: 'Search Order No. or Card...',
            style: { minWidth: '300px' }, // Make the search bar wide and prominent
            variant: 'filled',
        },

        manualPagination: true,
        manualFiltering: true,
        manualSorting: true,
        enableColumnFilters: false,

        onGlobalFilterChange:setGlobalFilter,
        onPaginationChange:setPagination,

        state:{
            globalFilter,
            pagination,
            isLoading,
            showProgressBars: isFetching
        },
        mantinePaperProps: { shadow: 'sm', radius: 'md', withBorder: true },

        enableRowActions: true,
        positionActionsColumn: 'last',
        renderRowActions: ({ row }) => {
            const isCompleted = row.original.load_status === 'completed';
             const handleConfirmExecution = async (rowData: any) => {
                console.log("Executing load for:", rowData);
                executeLoadMutation.mutate(rowData);
            };

            const openConfirmModal = () => modals.openConfirmModal({
                title: 'Confirm Load Execution',
                centered: true,
                children: (
                    <Text size="sm">
                        Are you sure you want to proceed and execute the load for order <strong>{row.original.order_no}</strong>? 
                        This action will dispense the load and cannot be undone.
                    </Text>
                ),
                labels: { confirm: 'Yes, Execute Load', cancel: 'Cancel' },
                confirmProps: { color: 'blue', leftSection: <IconBolt size={16} /> },
                onConfirm: () => handleConfirmExecution(row.original),
            });

             return (
                <Button 
                    size="xs" 
                    color="blue" 
                    variant="light"
                    leftSection={<IconBolt stroke={1.5} size={16} />}
                    onClick={openConfirmModal}
                    disabled={isCompleted}
                >
                    Execute
                </Button>
            );
        },
    });

    return (
        <>
            {/* Header Section */}
            <Group justify="space-between" align="center" mb="xl">
                <div>
                    <Title order={2}>Convention Load-orders</Title>
                    <Text c="dimmed" size="sm">
                        <b>Search Order # and proceed to execute load orders.</b>
                    </Text>
                    
                </div>
            </Group>

            {/* Datatable */}
            <Paper p="sm" radius="md">
                <MantineReactTable table={table} />
            </Paper>
        </>
    );
}