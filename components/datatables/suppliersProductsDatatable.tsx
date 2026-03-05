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
import { Badge, Paper, ActionIcon, Tooltip, Group, Button, Text } from '@mantine/core';
import { IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { updateProduct } from '@/api/product_api';
import { useQueryClient } from '@tanstack/react-query';

type SupplierProducts = {
    id: number;
    sku: string;
    barcode: string;
    description: string;
    promo_price: string;
    is_active: number; 
};

type SupplierProductsDatatableProps = {
  products: SupplierProducts[];
  vendor_code:string
};

export const SupplierProductsDatatable = ({ products,vendor_code }: SupplierProductsDatatableProps) => {
    const queryClient = useQueryClient();
    const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});

    const updateProductMutation = useMutation({
        mutationFn: updateProduct,
        onSuccess: () => {
            console.log('Product updated!');
            // queryClient.invalidateQueries()
        },
        onError: (error: any) => {
            console.error(error);
        },
    });
    


    const columns = useMemo<MRT_ColumnDef<SupplierProducts>[]>(
        () => [
        {
            accessorKey: 'id', 
            header: 'ID',
            enableEditing: false, // Never editable
            size: 80,
        },
        {
            accessorKey: 'sku',
            header: 'SKU',
            mantineEditTextInputProps: ({ table }) => ({
                required: true,
                error: validationErrors?.sku,
                onFocus: () => setValidationErrors({ ...validationErrors, sku: undefined }),
                // NEW: Disable input if we are editing an existing row (not creating a new one)
                disabled: !table.getState().creatingRow, 
            }),
        },
        {
            accessorKey: 'barcode',
            header: 'Barcode',
            mantineEditTextInputProps: ({ table }) => ({
                // NEW: Disable input if we are editing an existing row
                disabled: !table.getState().creatingRow, 
            }),
        },
        {
            accessorKey: 'description',
            header: 'Description',
            // Left completely editable
        },
        {
            accessorKey: 'promo_price',
            header: 'Price',
            // Left completely editable
        },
        {
            accessorKey: 'is_active',
            header: 'Status',
            editVariant: 'select',
            mantineEditSelectProps: {
                data: [
                    { value: '1', label: 'Active' },
                    { value: '0', label: 'Inactive' },
                ],
            },
            Cell: ({ cell }) => {
                const value = Number(cell.getValue()); 
                return (
                    <Badge color={value === 1 ? 'green' : 'red'} variant="light">
                        {value === 1 ? 'Active' : 'Inactive'}
                    </Badge>
                );
            },
        }
        ],
        [validationErrors],
    );

    const handleCreateProduct: MRT_TableOptions<SupplierProducts>['onCreatingRowSave'] = async ({
        values,
        exitCreatingMode,
    }) => {
        if (!values.sku) {
            setValidationErrors({ sku: 'SKU is required' });
            return;
        }

        console.log('Creating new product:', values);
        exitCreatingMode();
    };

    const handleSaveProduct: MRT_TableOptions<SupplierProducts>['onEditingRowSave'] = async ({
        values,
        table,
    }) => {
        if (!values.sku) {
            setValidationErrors({ sku: 'SKU is required' });
            return;
        }
        const params = {
            ...values,
            vendor_code:vendor_code
        }
        await updateProductMutation.mutateAsync(params);

        table.setEditingRow(null); // ✅ close only if success
        setValidationErrors({});

        table.setEditingRow(null); 
    };

    const handleDeleteProduct = (row: any) => {
        if (window.confirm(`Are you sure you want to delete SKU ${row.original.sku}?`)) {
            console.log('Deleting product ID:', row.original.id);
        }
    };

    const table = useMantineReactTable({
        columns,
        data: products ?? [],
        initialState: { density: 'xs' },
        
        
        enableEditing: true,
        createDisplayMode: 'modal', 
        editDisplayMode: 'modal', 
        positionActionsColumn: 'last',
        
        // --- NEW: Set Modal Titles ---
        mantineEditRowModalProps: {
            title: 'Update Product', // Changes title for Edit Modal
        },
        mantineCreateRowModalProps: {
            title: 'Create New Product', // Changes title for Create Modal
        },
        // -----------------------------

        onCreatingRowSave: handleCreateProduct,
        onEditingRowSave: handleSaveProduct,
        onEditingRowCancel: () => setValidationErrors({}),
        state: {
            isSaving: updateProductMutation.isPending,
        },

        renderRowActions: ({ row, table }) => (
            <Group gap="xs">
                <Tooltip label="Edit">
                    <ActionIcon onClick={() => table.setEditingRow(row)} color="blue" variant="subtle">
                        <IconEdit size={20} stroke={1.5} />
                    </ActionIcon>
                </Tooltip>
                <Tooltip label="Delete">
                    <ActionIcon onClick={() => handleDeleteProduct(row)} color="red" variant="subtle">
                        <IconTrash size={20} stroke={1.5} />
                    </ActionIcon>
                </Tooltip>
            </Group>
        ),

        renderTopToolbarCustomActions: ({ table }) => (
            <Button
                leftSection={<IconPlus size={16} />}
                onClick={() => {
                    table.setCreatingRow(true); 
                }}
            >
                New Product
            </Button>
        ),

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

export default SupplierProductsDatatable;