'use client';

import '@mantine/core/styles.css';
import '@mantine/dates/styles.css'; 
import 'mantine-react-table/styles.css'; 
import { useEffect, useMemo, useState } from 'react';
import {
  type MRT_ColumnDef,
  MantineReactTable,
  useMantineReactTable,
} from 'mantine-react-table';
import { Badge, Paper, ActionIcon, Tooltip, Group, Button, Text, Stack, Modal, NumberInput, Select, Table, Divider } from '@mantine/core';
import { IconTrash, IconPuzzle, IconPlus } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAllProducts, fetchDistinctRcrSkus, fetchProductComponents, saveProductComponents } from '@/api/product_api';
import { showErrorNotification, showSuccessNotification } from '@/lib/notifications';

type SupplierProducts = {
    id: number;
    sku: string;
    barcode: string;
    description: string;
    promo_price: string;
    is_active: string; 
};

// New Type for the components inside a bundle
type BundleComponent = SupplierProducts & { quantity: number };

export const ProductComponentDatatable = () => {
    const [searchValue, setSearchValue] = useState('');
    const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});
    
    const [isComponentModalOpen, setIsComponentModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<SupplierProducts | null>(null);
    // Bundle Builder State
    const [bundleComponents, setBundleComponents] = useState<BundleComponent[]>([]);
    const [selectedComponentSku, setSelectedComponentSku] = useState<string | null>(null);
    const [componentQty, setComponentQty] = useState<number | string>(1);

    const { data: all_products, isLoading } = useQuery({
        queryKey: ['all_products'],
        queryFn: () => fetchAllProducts()
    });

    const { data: rcrSkus, isLoading:isRcrSkusLoading } = useQuery({
        queryKey: ['rcr_products'],
        queryFn: () => fetchDistinctRcrSkus(),
    });

    const { data: productComponents, isLoading:isProductComponentsLoading } = useQuery({
        queryKey: ['product_components',selectedProduct?.id],
        queryFn: () => fetchProductComponents(selectedProduct?.id),
        enabled:isComponentModalOpen && !!selectedProduct?.id
    });

    const uploadBulkMutation = useMutation({
        mutationFn: async (body:any) => saveProductComponents(body),
        onSuccess: () => {
            showSuccessNotification('Success', 'Bulk products uploaded successfully!');
            setBundleComponents([]);
            setIsComponentModalOpen(false);
        },
        onError: (error) => {
            console.error(error);
            showErrorNotification('Upload Failed', 'There was an error processing the Excel file.');
        }
    });

    useEffect(() => {
        if(productComponents){
            setBundleComponents(productComponents)
        }
    },[productComponents])

    // Click Handler to Open Modal
    const handleManageComponentsClick = (product: SupplierProducts) => {
        setSelectedProduct(product);
        // Note: If you have an API to fetch EXISTING components for this bundle, 
        // you would set them here. For now, we start with an empty array.
        setBundleComponents([]); 
        setIsComponentModalOpen(true);
        // setBundleComponents(productComponents);       
        console.log('bundleComponents',bundleComponents)
    };

    // Function to add a component to the temporary bundle list
    const handleAddComponent = () => {
        console.log('selectedComponentSku',selectedComponentSku)
        console.log('componentQty',componentQty)

        if (!selectedComponentSku || !componentQty) return;
        
        const productToAdd = rcrSkus?.find((p:any) => p.sku === selectedComponentSku);
        console.log('productToAdd',productToAdd);
        if (productToAdd) {
            setBundleComponents(prev => {
                // If it already exists in the list, just increase the quantity
                const existing = prev.find(c => c.sku === selectedComponentSku);
                if (existing) {
                    return prev.map(c => 
                        c.sku === selectedComponentSku 
                        ? { ...c, quantity: Number(c.quantity) + Number(componentQty) } 
                        : c
                    );
                }
                // Otherwise, add it as a new component
                return [...prev, { ...productToAdd, quantity: Number(componentQty) }];
            });
            // Reset the inputs
            setSelectedComponentSku(null);
            setComponentQty(1);
        }
    };

    const handleRemoveComponent = (sku: string) => {
        setBundleComponents(prev => prev.filter(c => c.sku !== sku));
    };

    const handlesaveComponent = () => {
        const params = {
            bundle_components:bundleComponents,
            bundle_details:{
                id:selectedProduct?.id,
                sku:selectedProduct?.sku,
            }
        }
        console.log('params', params);

        uploadBulkMutation.mutate(params);
    }
    
    const columns = useMemo<MRT_ColumnDef<SupplierProducts>[]>(
        () => [
            { accessorKey: 'vendor_code', header: 'Vendor',size:50 },
            { accessorKey: 'sku', header: 'SKU',size:50 },
            { accessorKey: 'barcode', header: 'Barcode' ,size:50},
            { accessorKey: 'description', header: 'Description' },
            { accessorKey: 'promo_price', header: 'Price',size:50 },
            {
                accessorKey: 'is_active',
                header: 'Status',
                size:50,
                Cell: ({ cell }) => {
                    const status = cell.getValue<string>();
                    const color = status === 'true' ? 'green' : 'red';
                    return <Badge color={color}>{status === 'true' ? 'Active' : 'Inactive'}</Badge>;
                }
            }
        ],
        [validationErrors],
    );

    const table = useMantineReactTable({
        columns,
        data: all_products ?? [],
        initialState: { density: 'xs', showGlobalFilter: true },
        enableRowActions: true,
        positionActionsColumn: 'last', 
        renderRowActions: ({ row }) => (
            <Group gap="xs" wrap="nowrap">
                <Tooltip label="Manage Bundle Components">
                    <ActionIcon 
                        variant="light" 
                        color="violet" 
                        onClick={() => handleManageComponentsClick(row.original)}
                    >
                        <IconPuzzle stroke={1.5} size={18} />
                    </ActionIcon>
                </Tooltip>
            </Group>
        ),
        paginationDisplayMode: 'pages', 
        mantinePaperProps: { shadow: 'sm', radius: 'md', withBorder: true },
        mantineTableProps: { striped: 'even', highlightOnHover: true, withColumnBorders: true },
    });

    const allOptions = useMemo(() => {
        return rcrSkus?.map((p: any) => ({
            value: p.sku,
            label: `[${p.sku}] ${p.description}`
        })) || [];
    }, [rcrSkus]);

    const filteredOptions = useMemo(() => {
        // If the user hasn't typed anything, just show the first 50 items
        if (!searchValue.trim()) {
            return allOptions.slice(0, 50);
        }

        const query = searchValue.toLowerCase();
        const results = [];

        // We use a standard 'for' loop instead of .filter() so we can STOP early
        for (let i = 0; i < allOptions.length; i++) {
            if (allOptions[i].label.toLowerCase().includes(query)) {
                results.push(allOptions[i]);
                
                // CRITICAL: Stop searching once we have 50 results!
                if (results.length === 50) break; 
            }
        }
        
        return results;
    }, [searchValue, allOptions]);

    return (
        <Paper p="sm" radius="md">
            <MantineReactTable table={table} />

            <Modal
                opened={isComponentModalOpen}
                onClose={() => setIsComponentModalOpen(false)}
                title={<Text fw={600}>Manage Bundle Components</Text>}
                size="lg" // Made larger to accommodate the table
            >
                {selectedProduct && (
                    <Stack>
                        {/* Bundle Context */}
                        <Paper withBorder p="sm" bg="gray.0">
                            <Text size="sm" c="dimmed">Main Bundle Product:</Text>
                            <Text fw={600} size="lg">{selectedProduct.description}</Text>
                            <Group mt={4}>
                                <Badge variant="light">SKU: {selectedProduct.sku}</Badge>
                                <Badge color="green" variant="light">Price: ₱{selectedProduct.promo_price}</Badge>
                            </Group>
                        </Paper>

                        <Divider my="sm" />

                        {/* Add Component Form */}
                        <Text fw={600}>Add Items to Bundle</Text>
                        <Group align="flex-end">
                            <Select
                                label="Search Product by SKU or Name"
                                placeholder="Select a product..."
                                searchable
                                
                                // 4. Bind our custom state and filtered data to the component
                                searchValue={searchValue}
                                onSearchChange={setSearchValue}
                                data={filteredOptions}
                                onChange={setSelectedComponentSku}
                                
                                // Limit the internal render (optional safety net)
                                limit={50} 
                                style={{ flex: 1 }}
                                
                                // Optional: Tell Mantine to skip its internal filtering 
                                // since we already did the hard work perfectly
                                filter={({ options }) => options}
                            />
                            <NumberInput
                                label="Qty"
                                value={componentQty}
                                onChange={setComponentQty}
                                min={1}
                                w={80}
                            />
                            <Button 
                                onClick={handleAddComponent} 
                                disabled={!selectedComponentSku}
                                leftSection={<IconPlus size={16} />}
                            >
                                Add
                            </Button>
                        </Group>

                        {/* Current Components Table */}
                        <Text fw={600} mt="md">Bundle Contents</Text>
                        {isProductComponentsLoading ? (
                            <Text c="dimmed" size="sm" fs="italic">Loading existing components...</Text>
                        ) : bundleComponents.length === 0 ? (
                            <Text c="dimmed" size="sm" fs="italic">No components added yet. Use the form above to add items.</Text>
                        ) : (
                            <Table striped highlightOnHover withTableBorder>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>SKU</Table.Th>
                                        <Table.Th>Description</Table.Th>
                                        <Table.Th style={{ width: 80 }}>Qty</Table.Th>
                                        <Table.Th style={{ width: 50 }}></Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {bundleComponents.map((comp) => (
                                        <Table.Tr key={comp.sku}>
                                            <Table.Td>{comp.sku}</Table.Td>
                                            <Table.Td>{comp.description}</Table.Td>
                                            <Table.Td fw={600}>{comp.quantity}</Table.Td>
                                            <Table.Td>
                                                <ActionIcon color="red" variant="subtle" onClick={() => handleRemoveComponent(comp.sku)}>
                                                    <IconTrash size={16} />
                                                </ActionIcon>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        )}

                        {/* <Button mt="xl" fullWidth color="violet" onClick={() => {
                            // TODO: Connect to useMutation for saving the bundle components to the backend
                            console.log('Ready to save bundle components for SKU:', selectedProduct.sku, bundleComponents);
                        }}> */}
                        <Button mt="xl" fullWidth color="violet" onClick={() => handlesaveComponent()}>
                            Save Bundle Configuration
                        </Button>
                    </Stack>
                )}
            </Modal>
        </Paper>
    );
};

export default ProductComponentDatatable;