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
import { IconTrash, IconTags, IconPlus, IconBolt } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchClearanceItems, fetchVendorProducts, saveClearanceSchemes, fetchClearance, executeClearance } from '@/api/product_api';
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
    created_at: string;
    id: number;
    is_active: string;
    label: string;
    scheme_count: number;
    start_time: string;
    status: string;
    vendor_code: string; 
};

type ExecuteClearancePayload = {
    vendor_code: string;
    clearance_id: number;
};

// Updated type for the clearance array state
type ClearanceScheme = SupplierProducts & { clearance_price: number | string };

export const ClearanceSaleComponentDatatable = () => {
    const queryClient = useQueryClient();
    
    const [searchValue, setSearchValue] = useState('');
    const [isComponentModalOpen, setIsComponentModalOpen] = useState(false);
    const [selectedClearance, setSelectedClearance] = useState<ClearanceHeader | null>(null);

    // Clearance Scheme State
    const [clearanceSchemes, setClearanceSchemes] = useState<ClearanceScheme[]>([]);
    const [selectedVendorScheme, setSelectedVendorScheme] = useState<string | null>(null);
    const [clearancePrice, setClearancePrice] = useState<number | string>('');

    const { data: clearanceSale, isLoading: isClearanceSaleLoading } = useQuery({
        queryKey: ['clearance_sale'],
        queryFn: () => fetchClearance()
    });

    const { data: vendor_products, isLoading } = useQuery({
        queryKey: ['vendor_products', selectedClearance?.vendor_code],
        queryFn: () => fetchVendorProducts(selectedClearance!.vendor_code),
        enabled: !!selectedClearance?.vendor_code
    });

    const { data: clearanceSchemesData, isLoading: isProductComponentsLoading } = useQuery({
        queryKey: ['clearance_schemes', selectedClearance?.id],
        queryFn: () => fetchClearanceItems(selectedClearance!.id),
        enabled: isComponentModalOpen && !!selectedClearance?.id
    });

    const saveClearanceSchemeMutation = useMutation({
        mutationFn: async (body: any) => saveClearanceSchemes(body),
        onSuccess: () => {
            showSuccessNotification('Success', 'Clearance schemes saved successfully!');
            queryClient.invalidateQueries({ queryKey: ['clearance_sale'] });
            setClearanceSchemes([]);
            setIsComponentModalOpen(false);
        },
        onError: (error) => {
            console.error(error);
            showErrorNotification('Saving Failed', 'There was an error saving the clearance schemes.');
        }
    });

    useEffect(() => {
        if(clearanceSchemesData){
            setClearanceSchemes(clearanceSchemesData);
        }
    }, [clearanceSchemesData]);

    // Click Handler to Open Modal
    const handleManageComponentsClick = (clearance: ClearanceHeader) => {
        setSelectedClearance(clearance);
        setClearanceSchemes([]); 
        setClearancePrice('');
        setSelectedVendorScheme(null);
        setSearchValue('');
        setIsComponentModalOpen(true);   
    };

    // Function to add a component to the temporary list
    const handleAddComponent = () => {
        if (!selectedVendorScheme || !clearancePrice) return;
        
        const productToAdd = vendor_products?.find((p: any) => p.id.toString() === selectedVendorScheme);

        if (productToAdd) {
            setClearanceSchemes(prev => {
                // Check if product is already in the list to prevent duplicates
                const existing = prev.find(c => c.sku === productToAdd.sku);
                if (existing) {
                    // Update price if it already exists
                    return prev.map(c => 
                        c.sku === productToAdd.sku 
                        ? { ...c, clearance_price: clearancePrice } 
                        : c
                    );
                }
                // Add as new item
                return [...prev, { ...productToAdd, clearance_price: clearancePrice }];
            });

            // Reset the inputs
            setSelectedVendorScheme(null);
            setSearchValue('');
            setClearancePrice('');
        }
    };

    const handleRemoveClearanceScheme = (sku: string) => {
        setClearanceSchemes(prev => prev.filter(c => c.sku !== sku));
    };

    const handlesaveComponent = () => {
        if (!selectedClearance) return;
        console.log('clearanceSchemes',clearanceSchemes);
        // Construct the payload based on our new architecture
        const payload = {
            header_id: selectedClearance.id,
            vendor_code: selectedClearance.vendor_code,
            schemes: clearanceSchemes.map(scheme => ({
                clearance_id:selectedClearance.id,
                product_id:scheme.id,
                sku: scheme.sku,
                clearance_price: scheme.clearance_price
            }))
        };

        saveClearanceSchemeMutation.mutate(payload);
    };

    const executeClearanceMutation = useMutation({
        mutationFn:(body:ExecuteClearancePayload) => executeClearance(body),
        onSuccess: () => {
            showSuccessNotification('Success', 'Clearance prices are now live on the convention floor!');
            // Refresh the table so the badge turns Green/Executed
            queryClient.invalidateQueries({ queryKey: ['clearance_sale'] }); 
        },
        onError: (error) => {
            console.error(error);
            showErrorNotification('Execution Failed', 'There was an error activating the clearance.');
        }
    });

    const handleExecuteClearance = (clearance: ClearanceHeader) => {
        // CRITICAL: Always confirm destructive/live-event actions!
        const isConfirmed = window.confirm(
            `WARNING: Are you sure you want to execute "${clearance.label}"?\n\nThis will update the prices on all POS devices for Vendor ${clearance.vendor_code}.`
        );

        if (isConfirmed) {
            executeClearanceMutation.mutate({
                vendor_code:clearance.vendor_code,
                clearance_id:clearance.id
            });
        }
    };
    
    const columns = useMemo<MRT_ColumnDef<ClearanceHeader>[]>(
            () => [
                { accessorKey: 'id', header: 'Id', size: 50 },
                { accessorKey: 'vendor_code', header: 'Vendor code', size: 50 },
                { accessorKey: 'label', header: 'Description', size: 50 },
                { 
                    accessorKey: 'status', 
                    header: 'Status', 
                    size: 100,
                    // Center the header and cell
                    mantineTableHeadCellProps: { align: 'center' },
                    mantineTableBodyCellProps: { align: 'center' },
                    // Custom cell renderer to inject Mantine Badges
                    Cell: ({ cell }) => {
                        const status = cell.getValue<string>()?.toLowerCase() || 'draft';
                        
                        return (
                            <Badge 
                                // Executed gets a solid green badge, Draft gets a light gray badge
                                color={status === 'executed' ? 'green.6' : 'blue'}
                                variant={status === 'executed' ? 'filled' : 'light'}
                                size="md"
                                radius="sm"
                                style={{ minWidth: 80 }}
                            >
                                {status.toUpperCase()}
                            </Badge>
                        );
                    }
                },
                { 
                    accessorKey: 'scheme_count', 
                    header: 'Scheme count',
                    size: 50,
                    mantineTableHeadCellProps: { align: 'center' },
                    mantineTableBodyCellProps: { align: 'center' },
                },
                { accessorKey: 'created_at', header: 'Created At', size: 50 }
            ],
            [],
        );

        const table = useMantineReactTable({
        columns,
        data: clearanceSale ?? [],
        state: { isLoading: isClearanceSaleLoading },
        initialState: { density: 'xs', showGlobalFilter: true },
        enableRowActions: true,
        positionActionsColumn: 'last', 
        
        // UPDATED ROW ACTIONS
        renderRowActions: ({ row }) => {
            // Check if this specific clearance is already live
            const isExecuted = row.original.status?.toLowerCase() === 'executed';

            return (
                <Group gap="xs" wrap="nowrap">
                    {/* 1. Manage Schemes Button */}
                    <Tooltip label="Manage Clearance Schemes">
                        <ActionIcon 
                            variant="light" 
                            color="violet" 
                            onClick={() => handleManageComponentsClick(row.original)}
                        >
                            <IconTags stroke={1.5} size={18} />
                        </ActionIcon>
                    </Tooltip>

                    {/* 2. Execute / Go Live Button */}
                    <Tooltip label={isExecuted ? "Already Executed" : "Execute Clearance (Go Live)"}>
                        <ActionIcon 
                            variant="light" 
                            color={isExecuted ? "gray" : "red"} 
                            onClick={() => handleExecuteClearance(row.original)}
                            disabled={isExecuted} // Disable if already live
                            loading={executeClearanceMutation.isPending}
                        >
                            <IconBolt stroke={1.5} size={18} />
                        </ActionIcon>
                    </Tooltip>
                </Group>
            );
        },
        
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
        if (!searchValue.trim()) {
            return allOptions.slice(0, 50);
        }

        const query = searchValue.toLowerCase();
        const results = [];

        for (let i = 0; i < allOptions.length; i++) {
            if (allOptions[i].label.toLowerCase().includes(query)) {
                results.push(allOptions[i]);
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
                title={<Text fw={600}>Manage Clearance Schemes</Text>}
                size="lg" 
            >
                {selectedClearance && (
                    <Stack>
                        <Paper withBorder p="sm" bg="gray.0">
                            <Text size="sm" c="dimmed">Active Clearance Header:</Text>
                            <Text fw={600} size="lg">{selectedClearance.label}</Text>
                            <Group mt={4}>
                                <Badge variant="light">Header ID: {selectedClearance.id}</Badge>
                            </Group>
                        </Paper>

                        <Divider my="sm" />

                        <Text fw={600}>Add Products to Clearance</Text>
                        <Group align="flex-end">
                            <Select
                                label="Search Product by SKU or Name"
                                placeholder="Select a product..."
                                searchable
                                searchValue={searchValue}
                                onSearchChange={setSearchValue}
                                data={filteredOptions}
                                onChange={setSelectedVendorScheme}
                                value={selectedVendorScheme} // Added value binding to clear input
                                limit={50} 
                                style={{ flex: 1 }}
                                filter={({ options }) => options}
                            />
                            
                            <NumberInput
                                label="Clearance Price"
                                placeholder="0.00"
                                prefix="₱"
                                decimalScale={2}
                                fixedDecimalScale
                                hideControls
                                value={clearancePrice}
                                onChange={setClearancePrice}
                                min={0.01}
                                w={120} 
                            />
                            
                            <Button 
                                onClick={handleAddComponent} 
                                disabled={!selectedVendorScheme || !clearancePrice}
                                leftSection={<IconPlus size={16} />}
                            >
                                Add
                            </Button>
                        </Group>

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
                                        <Table.Th style={{ width: 120 }}>Clearance Price</Table.Th>
                                        <Table.Th style={{ width: 50 }}></Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {clearanceSchemes.map((comp) => (
                                        <Table.Tr key={comp.sku}>
                                            <Table.Td>{comp.sku}</Table.Td>
                                            <Table.Td>{comp.description}</Table.Td>
                                            <Table.Td fw={600} c="green.7">₱{Number(comp.clearance_price).toFixed(2)}</Table.Td>
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

                        <Button mt="xl" fullWidth color="violet" onClick={handlesaveComponent} loading={saveClearanceSchemeMutation.isPending}>
                            Save Clearance Schemes
                        </Button>
                    </Stack>
                )}
            </Modal>
        </Paper>
    );
};

export default ClearanceSaleComponentDatatable;