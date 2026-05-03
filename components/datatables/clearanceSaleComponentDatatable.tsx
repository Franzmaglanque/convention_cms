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
import { fetchAllProducts, fetchClearanceItems, fetchDistinctRcrSkus, fetchProductComponents, fetchVendorProducts, saveClearanceSchemes, saveProductComponents } from '@/api/product_api';
import { fetchFlashDealHeaders } from '@/api/supplier_api';
import { fetchClearance } from '@/api/product_api';

import { showErrorNotification, showSuccessNotification } from '@/lib/notifications';

type SupplierProducts = {
    id: number;
    sku: string;
    barcode: string;
    description: string;
    promo_price: string;
    is_active: string; 
};

type ClearanceHeader = {
    created_at:string;
    id: number;
    is_active: string;
    label:string;
    scheme_count:number;
    start_time:string;
    status:string;
    vendor_code:string; 
};

type BundleComponent = SupplierProducts & { quantity: number };

export const ClearanceSaleComponentDatatable = () => {
    
    const [searchValue, setSearchValue] = useState('');
    const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});
    
    const [isComponentModalOpen, setIsComponentModalOpen] = useState(false);
    const [selectedClearance, setSelectedClearance] = useState<ClearanceHeader | null>(null);

    // Bundle Builder State
    const [clearanceSchemes, setClearanceSchemes] = useState([]);
    const [selectedVendorScheme, setSelectedVendorScheme] = useState<string | null>(null);
    const [clearancePrice, setClearancePrice] = useState<number | string>('');

    const { data: clearanceSale, isLoading: isClearanceSaleLoading } = useQuery({
        queryKey: ['clearance_sale'],
        queryFn: () => fetchClearance()
    });

    const { data: vendor_products, isLoading } = useQuery({
        queryKey: ['vendor_products'],
        queryFn: () => fetchVendorProducts(selectedClearance!.vendor_code)
    });

    const { data: clearanceSchemesData, isLoading:isProductComponentsLoading } = useQuery({
        queryKey: ['clearance_schemes',selectedClearance?.id],
        queryFn: () => fetchClearanceItems(selectedClearance!.id),
        enabled:isComponentModalOpen && !!selectedClearance?.id
    });

    const saveClearanceSchemeMutation = useMutation({
        mutationFn: async (body:any) => saveClearanceSchemes(body),
        onSuccess: () => {
            showSuccessNotification('Success', 'Schemes saved successfully!');
            setClearanceSchemes([]);
            setIsComponentModalOpen(false);
        },
        onError: (error) => {
            console.error(error);
            showErrorNotification('Schemes saving Failed', 'There was an error saving the Schemes.');
        }
    });

    useEffect(() => {
        if(clearanceSchemesData){
            setClearanceSchemes(clearanceSchemesData)
        }
    },[clearanceSchemesData])

    // Click Handler to Open Modal
    const handleManageComponentsClick = (clearance: ClearanceHeader) => {
    
        // setSelectedProduct(clearance);
        setSelectedClearance(clearance)
        // Note: If you have an API to fetch EXISTING components for this bundle, 
        // you would set them here. For now, we start with an empty array.
        setClearanceSchemes([]); 
        setIsComponentModalOpen(true);   
        console.log('product',clearance)
    };

    // Function to add a component to the temporary bundle list
    const handleAddComponent = () => {

        console.log('selectedVendorScheme',selectedVendorScheme)
        console.log('clearancePrice',clearancePrice)

        if (!selectedVendorScheme || !clearancePrice) return;
        
        const productToAdd = vendor_products?.find((p:any) => p.id == selectedVendorScheme);
        if(productToAdd){
            console.log('meron');
        }
        

        // if (productToAdd) {
        //     setBundleComponents(prev => {
        //         // If it already exists in the list, just increase the quantity
        //         const existing = prev.find(c => c.sku === selectedComponentSku);
        //         if (existing) {
        //             return prev.map(c => 
        //                 c.sku === selectedComponentSku 
        //                 ? { ...c, quantity: Number(c.quantity) + Number(componentQty) } 
        //                 : c
        //             );
        //         }
        //         // Otherwise, add it as a new component
        //         return [...prev, { ...productToAdd, quantity: Number(componentQty) }];
        //     });
        //     // Reset the inputs
        //     setSelectedComponentSku(null);
        //     setSearchValue('');
        //     setClearancePrice(1);
        // }
    };

    const handleRemoveClearanceScheme = (sku: string) => {
        // setBundleComponents(prev => prev.filter(c => c.sku !== sku));
    };

    const handlesaveComponent = () => {
        // const params = {
        //     bundle_components:bundleComponents,
        //     bundle_details:{
        //         id:selectedClearance?.id,
        //         sku:selectedClearance?.sku,
        //     }
        // }
        // console.log('params', params);

        // uploadBulkMutation.mutate(params);
    }
    
    const columns = useMemo<MRT_ColumnDef<ClearanceHeader>[]>(
        () => [
            { accessorKey: 'id', header: 'Id',size:50 },
            { accessorKey: 'vendor_code', header: 'Vendor code',size:50 },
            { accessorKey: 'label', header: 'Description',size:50 },
            { accessorKey: 'start_time', header: 'Start Time' ,size:50},
            { 
                accessorKey: 'scheme_count', 
                header: 'Scheme count',
                size: 50,
                // Center the header text
                mantineTableHeadCellProps: {
                    align: 'center',
                },
                // Center the cell value
                mantineTableBodyCellProps: {
                    align: 'center',
                },
            },
            { accessorKey: 'created_at', header: 'Created At',size:50 }
        ],
        [validationErrors],
    );

    const table = useMantineReactTable({
        columns,
        data: clearanceSale ?? [],
        state: {
            isLoading: isClearanceSaleLoading,
        },
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
        return vendor_products?.map((p: any) => ({
            value: (p.id).toString(),
            label: `[${p.sku}] ${p.description}`
        })) || [];
    }, [vendor_products]);

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
                title={<Text fw={600}>Manage Flash Deal SKUs</Text>}
                size="lg" // Made larger to accommodate the table
            >
                {/* Note: Assuming 'selectedClearance' now represents your selected Flash Deal Header */}
                {selectedClearance && (
                    <Stack>
                        {/* Flash Deal Header Context */}
                        <Paper withBorder p="sm" bg="gray.0">
                            <Text size="sm" c="dimmed">Active Flash Deal Header:</Text>
                            <Text fw={600} size="lg">{selectedClearance.label}</Text>
                            <Group mt={4}>
                                <Badge variant="light">Header ID: {selectedClearance.id}</Badge>
                            </Group>
                        </Paper>

                        <Divider my="sm" />

                        {/* Add SKU Form */}
                        <Text fw={600}>Add Schemes to Clearance sale header</Text>
                        <Group align="flex-end">
                            <Select
                                label="Search Product by SKU or Name"
                                placeholder="Select a product..."
                                searchable
                                
                                // Bind custom state and filtered data
                                searchValue={searchValue}
                                onSearchChange={setSearchValue}
                                data={filteredOptions}
                                onChange={setSelectedVendorScheme}
                                
                                limit={50} 
                                style={{ flex: 1 }}
                                filter={({ options }) => options}
                            />
                            
                            {/* REPLACED QTY WITH FLASH DEAL PRICE */}
                            <NumberInput
                                label="Clearance Price"
                                placeholder="0.00"
                                prefix="₱"
                                decimalScale={2}
                                fixedDecimalScale
                                hideControls
                                value={clearancePrice} // Make sure to rename componentQty to flashDealPrice in your state!
                                onChange={setClearancePrice}
                                min={0.01}
                                w={120} // Made slightly wider to fit currency formatting
                            />
                            
                            <Button 
                                onClick={handleAddComponent} 
                                // Disabled if no SKU is selected or if price is 0/empty
                                disabled={!selectedVendorScheme || !clearancePrice}
                                leftSection={<IconPlus size={16} />}
                            >
                                Add
                            </Button>
                        </Group>

                        {/* Current Flash Deal SKUs Table */}
                        <Text fw={600} mt="md">Included SKUs</Text>
                        {isProductComponentsLoading ? (
                            <Text c="dimmed" size="sm" fs="italic">Loading existing SKUs...</Text>
                        ) : clearanceSchemes.length === 0 ? (
                            <Text c="dimmed" size="sm" fs="italic">No SKUs added yet. Use the form above to add items.</Text>
                        ) : (
                            <Table striped highlightOnHover withTableBorder>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>SKU</Table.Th>
                                        <Table.Th>Description</Table.Th>
                                        {/* UPDATED TABLE HEADER TO PRICE */}
                                        <Table.Th style={{ width: 120 }}>Clearance Price</Table.Th>
                                        <Table.Th style={{ width: 50 }}></Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    
                                    {clearanceSchemes.map((comp:any) => (
                                        <Table.Tr key={comp.sku}>
                                            <Table.Td>{comp.sku}</Table.Td>
                                            <Table.Td>{comp.description}</Table.Td>
                                            {/* UPDATED TABLE CELL TO FORMAT PRICE */}
                                            <Table.Td fw={600} c="green.7">₱{Number(comp.clearance_price || comp.quantity).toFixed(2)}</Table.Td>
                                            <Table.Td>
                                                <ActionIcon color="red" variant="subtle" onClick={() => handleRemoveClearanceScheme(comp.sku)}>
                                                    <IconTrash size={16} />
                                                </ActionIcon>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        )}

                        <Button mt="xl" fullWidth color="violet" onClick={() => handlesaveComponent()}>
                            Save Flash Deal SKUs
                        </Button>
                    </Stack>
                )}
            </Modal>
        </Paper>
    );
};

export default ClearanceSaleComponentDatatable;