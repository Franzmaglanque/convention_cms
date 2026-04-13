'use client';

import { useMemo, useState } from 'react';
import { Title, Text, Group, Paper, Badge, ActionIcon, Tooltip, Modal, ThemeIcon, Loader, Center, Stack, Card, Divider, SimpleGrid, Box, Button } from '@mantine/core';
import { IconEye, IconDiscountCheck, IconListDetails, IconReceipt2, IconInbox, IconCash, IconDeviceMobile, IconCalendar, IconHash, IconPackage, IconBolt } from '@tabler/icons-react';
import { MantineReactTable, useMantineReactTable, type MRT_ColumnDef } from 'mantine-react-table';
import { useQuery } from '@tanstack/react-query';
import { fetchAllOrders, fetchOrderItems, fetchOrderPayments } from '@/api/order_api';
import { modals } from '@mantine/modals';

// --- FORMATTER ---
const formatPhP = (amount: number) => {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
};

type SupplierOrders = {
    id: number;
    order_no: string;
    total: string;
    order_status: string;
    created_at: string;
    items_count: number; 
    customer_card_no: string; 
};

type OrderItem = {
  id: number;
  sku: string;
  barcode: string;
  description: string;
  product_name: string;
  unit_price: number;
};

type OrderPayment = {
  id: number;
  payment_method: string;
  amount: number;
  // Cash-specific
  cash_bill?: number;
  cash_change?: number;
  created_at?: string;
  // Online-specific
  reference_no?: string;
};

export default function ManageOrdersPage() {
    const [globalFilter, setGlobalFilter] = useState('');
    const [openedModal, setOpenedModal] = useState<'items' | 'payments' | null>(null);
    const [selectedOrderNo, setSelectedOrderNo] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    const { data: orderData, isError, isFetching, isLoading } = useQuery({
        queryKey: ['global-orders',pagination.pageIndex,pagination.pageSize,globalFilter],
        queryFn: () => fetchAllOrders({
            pageIndex: pagination.pageIndex,
            pageSize: pagination.pageSize,
            globalFilter: globalFilter
        })
    });

    const { data: orderPayments, isLoading: isLoadingPayments } = useQuery({
        queryKey: ['order-payments', selectedOrderNo],
        queryFn: () => fetchOrderPayments(selectedOrderNo!),
        enabled: openedModal === 'payments' && !!selectedOrderNo,
    });
    
    const { data: orderItems, isLoading: isLoadingItems } = useQuery({
        queryKey: ['order-items', selectedOrderNo],
        queryFn: () => fetchOrderItems(selectedOrderNo!),
        enabled: openedModal === 'items' && !!selectedOrderNo,
    });

    // --- TABLE COLUMNS ---
    const columns = useMemo<MRT_ColumnDef<SupplierOrders>[]>(() => [
        { 
            accessorKey: 'created_at', 
            header: 'Date & Time', 
            size: 160 
        },
        { 
            accessorKey: 'order_no', 
            header: 'Order No.', 
            size: 130,
            Cell: ({ cell }) => <Text fw={600} c="blue">{cell.getValue<string>()}</Text>
        },
        { 
            accessorKey: 'customer_card_no', 
            header: 'Customer Card', 
            size: 180 
        },
        { 
            accessorKey: 'vendor_code', 
            header: 'Vendor', 
            size: 100 
        },
        { 
            accessorKey: 'total', 
            header: 'Total Amount',
            size: 120,
            Cell: ({ cell }) => <Text fw={700}>{formatPhP(cell.getValue<number>())}</Text>
        },
        { 
            accessorKey: 'order_status', 
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
    ], []);

    const table = useMantineReactTable({
        columns,
        data: orderData?.data || [],
        enableGlobalFilter: true, // This enables the search bar at the top right!
        initialState: { 
            density: 'xs',
            showGlobalFilter: true, // Show search bar by default
        },
        rowCount: orderData?.meta?.totalRowCount ?? 0,
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
             const handleConfirmExecution = async (orderNo: string) => {
                console.log("Executing load for:", orderNo);
                // TODO: Add your API call here to execute the load
                // e.g., await fetch(`/api/load/execute/${orderNo}`, { method: 'POST' });
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
                onConfirm: () => handleConfirmExecution(row.original.order_no),
            });

             return (
                <Button 
                    size="xs" 
                    color="blue" 
                    variant="light"
                    leftSection={<IconBolt stroke={1.5} size={16} />}
                    onClick={openConfirmModal}
                    // Optional: Disable the button if it's already completed!
                    // disabled={row.original.load_status === 'completed'}
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