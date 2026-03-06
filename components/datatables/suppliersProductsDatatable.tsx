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
import { showSuccessNotification, showErrorNotification, showWarningNotification } from '@/lib/notifications';


type SupplierProducts = {
    id: number;
    sku: string;
    barcode: string;
    description: string;
    promo_price: string;
    is_active: string; 
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
        },
        {
            accessorKey: 'promo_price',
            header: 'Price',
        },
        {
            accessorKey:'is_active',
            id: 'is_active',
            header: 'Status',
            editVariant: 'select',
            mantineEditSelectProps: {
                data: [
                    { value: 'true', label: 'Active' },
                    { value: 'false', label: 'Inactive' },
                ],
            },
            Cell: ({ cell }) => {
                const value = cell.getValue();
                // console.log('djklasjdklsadsa',value);
                const isActive = value === 'true';
                // console.log('is_active',isActive);
                return (
                    <Badge color={isActive ? 'green' : 'red'} variant="light">
                        {isActive ? 'Active' : 'Inactive'}
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
        row,
        table,
    }) => {
        if (!values.sku) {
            setValidationErrors({ sku: 'SKU is required' });
            return;
        }
        const params = {
            ...values,
            id: row.original.id,
            // is_active: values.is_active === 'true' ? 1 : 0,
            vendor_code: vendor_code
        }
        try {
            const updateResponse = await updateProductMutation.mutateAsync(params);

            // 3. Handle your custom API response statuses
            if (updateResponse.status === 'SUCCESS') {
                showSuccessNotification('Success', updateResponse.message || 'Update success');

                queryClient.invalidateQueries({ queryKey: ['Supplier', vendor_code] });
                
                // ✅ Only close the modal and clear errors if it actually succeeded
                table.setEditingRow(null); 
                setValidationErrors({});
            } else {
                
                showErrorNotification('Failed', updateResponse.message || 'Update Failed');
            }
        } catch (error) {
            // ❌ Network failed completely. Leave modal open and notify user.
            console.error('Mutation failed:', error);
            showErrorNotification('Error', 'A network error occurred while updating the product.');
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