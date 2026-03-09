'use client';

import '@mantine/core/styles.css';
import '@mantine/dates/styles.css'; 
import 'mantine-react-table/styles.css'; 
import { useMemo, useState } from 'react';
import {
  type MRT_ColumnDef,
  MantineReactTable,
  useMantineReactTable,
  MRT_TableOptions,
} from 'mantine-react-table';
import { Badge, Paper, ActionIcon, Tooltip, Group, Button, Text, Modal, Stack, Grid, Divider, Center, ThemeIcon, ScrollArea, Box, SimpleGrid, Card } from '@mantine/core';
import { IconEdit, IconTrash, IconPlus, IconListDetails, IconReceipt2, IconInbox, IconPackage, IconHash, IconCalendar, IconCash, IconDeviceMobile } from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { showSuccessNotification, showErrorNotification, showWarningNotification } from '@/lib/notifications';
import { fetchSupplierOrders, fetchOrderItems, fetchOrderPayments } from '@/api/order_api';
import { Loader } from '@mantine/core'; // For loading states

type SupplierOrders = {
    id: number;
    order_no: string;
    total: string;
    order_status: string;
    created_at: string;
    items_count: number; 
    customer_card_no: string; 
};

type SupplierOrdersDatatableProps = {
    vendor_code:string
}

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
  payment_method: string;   // e.g. 'cash' | 'gcash' | 'maya' | 'bank_transfer' | etc.
  amount: number;
  // Cash-specific
  cash_bill?: number;
  cash_change?: number;
  created_at?: string;
  // Online-specific
  reference_no?: string;
};

export const SupplierOrdersDatatable = ({ vendor_code }: SupplierOrdersDatatableProps) => {
    const queryClient = useQueryClient();
    const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});

    const [openedModal, setOpenedModal] = useState<'items' | 'payments' | null>(null);
    const [selectedOrderNo, setSelectedOrderNo] = useState<string | null>(null);

    const { data: supplierOrders, isLoading } = useQuery({
        queryKey: ['supplier_orders', vendor_code],
        queryFn: () => fetchSupplierOrders(vendor_code)
    });

    // 1. Query for Items (Only runs if 'items' modal is open AND we have an orderNo)
    const { data: orderItems, isLoading: isLoadingItems } = useQuery({
        queryKey: ['order-items', selectedOrderNo],
        queryFn: () => fetchOrderItems(selectedOrderNo!),
        enabled: openedModal === 'items' && !!selectedOrderNo,
    });

    // 2. Query for Payments (Only runs if 'payments' modal is open AND we have an orderNo)
    const { data: orderPayments, isLoading: isLoadingPayments } = useQuery({
        queryKey: ['order-payments', selectedOrderNo],
        queryFn: () => fetchOrderPayments(selectedOrderNo!),
        enabled: openedModal === 'payments' && !!selectedOrderNo,
    });

    const handleOpenModal = (type: 'items' | 'payments', orderNo: string) => {
        setSelectedOrderNo(orderNo);
        setOpenedModal(type);
    };

    const handleCloseModal = () => {
        setOpenedModal(null);
        setSelectedOrderNo(null);
    };

   // ── Order items modal columns (MRT) ──────────────────────────────────────

  const itemColumns = useMemo<MRT_ColumnDef<OrderItem>[]>(
    () => [
      {
        accessorKey: 'sku',
        header: 'SKU',
        size: 110,
        Cell: ({ cell }) => (
          <Badge variant="outline" color="gray" size="sm" radius="sm">
            {cell.getValue<string>() || '—'}
          </Badge>
        ),
      },
      {
        accessorKey: 'barcode',
        header: 'Barcode',
        size: 140,
        Cell: ({ cell }) => (
          <Text size="xs" ff="monospace" c="dimmed">
            {cell.getValue<string>() || '—'}
          </Text>
        ),
      },
      {
        // Merge description / product_name into one searchable column
        id: 'description',
        header: 'Description',
        accessorFn: (row) => row.description || row.product_name || '',
        Cell: ({ cell, row }) => {
          const label = row.original.description || row.original.product_name || 'Unnamed product';
          return (
            <Tooltip
              label={label}
              multiline
              w={300}
              withArrow
              disabled={label.length < 50}
            >
              <Text size="sm" fw={500} lineClamp={1}>
                {label}
              </Text>
            </Tooltip>
          );
        },
      },
      {
        accessorKey: 'unit_price',
        header: 'Price',
        size: 110,
        enableGlobalFilter: false, // numbers don't need text search
        Cell: ({ cell }) => (
          <Text size="sm" fw={700} c="blue.7" ff="monospace" ta="right">
            ₱
            {Number(cell.getValue<number>()).toLocaleString('en-PH', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
        ),
      
      },
    ],
    [],
  );
    
    const columns = useMemo<MRT_ColumnDef<SupplierOrders>[]>(
        () => [
        {
            accessorKey: 'id', 
            header: 'ID',
            enableEditing: false, // Never editable
            size: 80,
        },
        {
            accessorKey: 'order_no',
            header: 'Order No',
        },
        {
            accessorKey: 'total',
            header: 'Total',
        },
        {
            accessorKey: 'order_status',
            header: 'Status',
            Cell: ({ cell }) => {
                const status = cell.getValue<string>();

                const color =
                status === 'completed'
                    ? 'green'
                    : status === 'pending'
                    ? 'yellow'
                    : 'red';

                return <Badge color={color}>{status}</Badge>;
            }
        },
        {
            accessorKey: 'created_at',
            header: 'Date Created',
        },
        {
            accessorKey: 'item_count',
            header: 'Items Sold',
        },
        {
            accessorKey: 'customer_card_no',
            header: 'Customer Card #',
        }],
        [validationErrors],
    );

    // ── Inner MRT instance for order items ───────────────────────────────────

    const itemsTable = useMantineReactTable({
        columns: itemColumns,
        data: orderItems || [],
        initialState: {
            density: 'xs',
            showGlobalFilter: true,   // search bar visible by default
        },
        state: {
        isLoading: isLoadingItems,
        },

        // Features
        enableGlobalFilter: true,
        globalFilterFn: 'includesString',
        enableSorting: true,
        enablePagination: true,
        paginationDisplayMode: 'pages',

        // Disable features we don't need inside a modal
        enableColumnActions: false,
        enableColumnFilters: false,
        enableFullScreenToggle: false,
        enableDensityToggle: false,
        enableHiding: false,
        enableRowSelection: false,
        enableEditing: false,

        // Show footer row (for total)
        // enableColumnFooter: true,

        // Styling
        mantinePaperProps: { shadow: 'none', withBorder: false },
        mantineTableProps: {
        striped: 'even',
        highlightOnHover: true,
        withColumnBorders: true,
        withRowBorders: true,
        },
        mantineSearchTextInputProps: {
        placeholder: 'Search SKU, barcode, description...',
        size: 'sm',
        },

        // Custom empty state
        renderEmptyRowsFallback: () => (
        <Center p="xl">
            <Stack align="center" gap="xs">
            <ThemeIcon variant="light" color="gray" size="xl" radius="xl">
                <IconInbox size={20} />
            </ThemeIcon>
            <Text c="dimmed" size="sm">No items found for this order.</Text>
            </Stack>
        </Center>
        ),
    });

    const table = useMantineReactTable({
        columns,
        data: supplierOrders ?? [],
        initialState: { 
            density: 'xs',
            showGlobalFilter: true
        },
        paginationDisplayMode: 'pages', 
        
        enableRowActions: true,
        positionActionsColumn: 'last', // ilalagay yung action sa pinaka huli
        renderRowActions: ({ row }) => (
            <Group gap="xs" wrap="nowrap">
                <Tooltip label="View Items">
                    <ActionIcon 
                        variant="light" 
                        color="blue" 
                        onClick={() => handleOpenModal('items', row.original.order_no)}
                    >
                        <IconListDetails stroke={1.5} size={18} />
                    </ActionIcon>
                </Tooltip>

                <Tooltip label="View Payments">
                    <ActionIcon 
                        variant="light" 
                        color="teal" 
                        onClick={() => handleOpenModal('payments', row.original.order_no)}
                    >
                        <IconReceipt2 stroke={1.5} size={18} />
                    </ActionIcon>
                </Tooltip>
            </Group>
        ),

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

            {/* ── Items Modal ─────────────────────────────────────────────────── */}
            <Modal
                opened={openedModal === 'items'}
                onClose={handleCloseModal}
                title={
                <Group gap="xs">
                    <ThemeIcon variant="light" color="blue" size="sm">
                    <IconPackage size={14} />
                    </ThemeIcon>
                    <Text fw={700} size="sm">Order Items</Text>
                    <Badge variant="light" color="blue" size="sm">{selectedOrderNo}</Badge>
                    {orderItems && orderItems.length > 0 && (
                    <Badge variant="filled" color="gray" size="sm">
                        {orderItems.length} items
                    </Badge>
                    )}
                </Group>
                }
                size="70%"
            >
                {isLoadingItems ? (
                <Group justify="center" p="xl">
                    <Loader size="sm" />
                </Group>
                ) : (
                <Box>
                    <MantineReactTable table={itemsTable} />
                </Box>
                )}
            </Modal>

           {/* ── Payments Modal ──────────────────────────────────────────────── */}
      <Modal
        opened={openedModal === 'payments'}
        onClose={handleCloseModal}
        title={
          <Group gap="xs">
            <ThemeIcon variant="light" color="teal" size="sm">
              <IconReceipt2 size={14} />
            </ThemeIcon>
            <Text fw={700} size="sm">Payments</Text>
            <Badge variant="light" color="teal" size="sm">{selectedOrderNo}</Badge>
            {orderPayments && orderPayments.length > 0 && (
              <Badge variant="filled" color="gray" size="sm">
                {orderPayments.length} payment{orderPayments.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </Group>
        }
        size="lg"
      >
        {isLoadingPayments ? (
          <Group justify="center" p="xl">
            <Loader size="sm" />
          </Group>
        ) : !orderPayments || orderPayments.length === 0 ? (
          <Center p="xl">
            <Stack align="center" gap="xs">
              <ThemeIcon variant="light" color="gray" size="xl" radius="xl">
                <IconInbox size={20} />
              </ThemeIcon>
              <Text c="dimmed" size="sm">No payments found for this order.</Text>
            </Stack>
          </Center>
        ) : (
          <Stack gap="md">
            {(orderPayments as OrderPayment[]).map((payment, index) => {
              const isCash = payment.payment_method?.toLowerCase() === 'cash';

              return (
                <Card
                  key={payment.id ?? index}
                  withBorder
                  radius="md"
                  padding="md"
                  style={{
                    borderColor: isCash
                      ? 'var(--mantine-color-green-3)'
                      : 'var(--mantine-color-blue-3)',
                  }}
                >
                  {/* ── Card Header ── */}
                  <Group justify="space-between" mb="sm">
                    <Group gap="xs">
                      <ThemeIcon
                        variant="light"
                        color={isCash ? 'green' : 'blue'}
                        size="md"
                        radius="xl"
                      >
                        {isCash ? <IconCash size={16} /> : <IconDeviceMobile size={16} />}
                      </ThemeIcon>
                      <Text fw={700} size="sm" tt="capitalize">
                        {payment.payment_method?.replace(/_/g, ' ') || 'Unknown'}
                      </Text>
                    </Group>
                    <Badge
                      variant="light"
                      color={isCash ? 'green' : 'blue'}
                      size="sm"
                    >
                      {isCash ? 'Cash' : 'Online'}
                    </Badge>
                  </Group>

                  <Divider mb="sm" />

                  {isCash ? (
                    /* ── Cash Payment Fields ── */
                    <SimpleGrid cols={2} spacing="xs">
                      <Stack gap={2}>
                        <Text size="xs" c="dimmed" tt="uppercase" fw={600} lts={0.4}>
                          Amount Tendered
                        </Text>
                        <Text size="sm" fw={700} ff="monospace" c="green.7">
                          ₱{Number(payment.amount).toLocaleString('en-PH', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </Text>
                      </Stack>

                      <Stack gap={2}>
                        <Text size="xs" c="dimmed" tt="uppercase" fw={600} lts={0.4}>
                          Cash Bill
                        </Text>
                        <Text size="sm" fw={700} ff="monospace">
                          ₱{Number(payment.cash_bill ?? 0).toLocaleString('en-PH', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </Text>
                      </Stack>

                      <Stack gap={2}>
                        <Text size="xs" c="dimmed" tt="uppercase" fw={600} lts={0.4}>
                          Cash Change
                        </Text>
                        <Text size="sm" fw={700} ff="monospace" c="orange.6">
                          ₱{Number(payment.cash_change ?? 0).toLocaleString('en-PH', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </Text>
                      </Stack>

                      <Stack gap={2}>
                        <Group gap={4}>
                          <IconCalendar size={11} color="var(--mantine-color-dimmed)" />
                          <Text size="xs" c="dimmed" tt="uppercase" fw={600} lts={0.4}>
                            Date
                          </Text>
                        </Group>
                        <Text size="sm" fw={500}>
                          {payment.created_at
                            ? new Date(payment.created_at).toLocaleString('en-PH', {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                              })
                            : '—'}
                        </Text>
                      </Stack>
                    </SimpleGrid>
                  ) : (
                    /* ── Online Payment Fields ── */
                    <SimpleGrid cols={2} spacing="xs">
                      <Stack gap={2}>
                        <Text size="xs" c="dimmed" tt="uppercase" fw={600} lts={0.4}>
                          Amount
                        </Text>
                        <Text size="sm" fw={700} ff="monospace" c="blue.7">
                          ₱{Number(payment.amount).toLocaleString('en-PH', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </Text>
                      </Stack>

                      <Stack gap={2}>
                        <Group gap={4}>
                          <IconHash size={11} color="var(--mantine-color-dimmed)" />
                          <Text size="xs" c="dimmed" tt="uppercase" fw={600} lts={0.4}>
                            Reference No.
                          </Text>
                        </Group>
                        <Text size="sm" fw={600} ff="monospace" c="blue.6">
                          {payment.reference_no || '—'}
                        </Text>
                      </Stack>
                    </SimpleGrid>
                  )}
                </Card>
              );
            })}

            {/* ── Total Footer ── */}
            <Divider />
            <Group justify="space-between" px={4}>
              <Text size="xs" c="dimmed">
                {(orderPayments as OrderPayment[]).length} payment
                {(orderPayments as OrderPayment[]).length !== 1 ? 's' : ''}
              </Text>
              <Group gap="xs">
                <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Total Paid</Text>
                <Text size="md" fw={800} c="teal.7" ff="monospace">
                  ₱{(orderPayments as OrderPayment[])
                    .reduce((sum, p) => sum + Number(p.amount), 0)
                    .toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </Group>
            </Group>
          </Stack>
        )}
      </Modal>
        </Paper>
    );
};

export default SupplierOrdersDatatable;