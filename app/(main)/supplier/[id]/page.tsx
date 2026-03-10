'use client';

import { 
    Title, Button, Text, Group, Paper, Badge, Grid, Container, 
    Skeleton, SimpleGrid, Tabs, ThemeIcon, rem, 
    FileButton,
    Modal,
    FileInput
} from '@mantine/core';
import { 
    IconArrowLeft, IconPackage, IconUsers, IconReceipt2, 
    IconCurrencyDollar, IconInfoCircle, IconTrendingUp,
    IconUpload
} from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchSupplierDetails } from '@/api/supplier_api';
import { showErrorNotification, showSuccessNotification } from '@/lib/notifications';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import { bulkUploadProducts } from '@/api/product_api';

import SupplierProductsDatatable from '@/components/datatables/suppliersProductsDatatable';
import SupplierOrdersDatatable from '@/components/datatables/suppliersOrdersDatatable';
import SupplierUsersDatatable from '@/components/datatables/suppliersUsersDatatable';


export default function SupplierDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const supplierCode = params.id as string; 
    const [uploadModalOpened, { open: openUploadModal, close: closeUploadModal }] = useDisclosure(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const { data: supplier, isLoading } = useQuery({
        queryKey: ['Supplier', supplierCode],
        queryFn: () => fetchSupplierDetails(supplierCode)
    });

    const uploadBulkMutation = useMutation({
        mutationFn: async (file: File) => bulkUploadProducts(file,supplierCode),
        onSuccess: () => {
            showSuccessNotification('Success', 'Bulk products uploaded successfully!');
            queryClient.invalidateQueries({ queryKey: ['Supplier', supplierCode] });
            
            // NEW: Close the modal and reset the file input on success
            closeUploadModal();
            setSelectedFile(null);
        },
        onError: (error) => {
            console.error(error);
            showErrorNotification('Upload Failed', 'There was an error processing the Excel file.');
        }
    });

    const handleUploadSubmit = () => {
        if (selectedFile) {
            uploadBulkMutation.mutate(selectedFile);
        }
    };  

    if (isLoading) {
        return (
            <Container fluid px={0}>
                <Skeleton height={40} width="20%" mb="xl" />
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="xl">
                    <Skeleton height={100} radius="md" />
                    <Skeleton height={100} radius="md" />
                    <Skeleton height={100} radius="md" />
                    <Skeleton height={100} radius="md" />
                </SimpleGrid>
                <Skeleton height={400} radius="md" />
            </Container>
        );
    }

    // 2. Fallback if supplier is not found
    if (!supplier) return <div>Supplier not found.</div>;
    const activeProductCount = supplier.supplierProducts.filter((p:any) => p.is_active === 'true').length;


    return (
        <Container fluid px={0}>
            {/* --- UPLOAD MODAL --- */}
            <Modal 
                opened={uploadModalOpened} 
                onClose={() => {
                    closeUploadModal();
                    setSelectedFile(null); // Clear file if they cancel
                }} 
                title={<Text fw={700}>Bulk Upload Products</Text>}
                centered
            >
                <Text size="sm" c="dimmed" mb="md">
                    Please upload an Excel (.xlsx, .xls) or CSV file. The file should contain the required columns: SKU, Barcode, Description, and Price.
                </Text>

                <FileInput
                    label="Select File"
                    placeholder="Click to choose a file"
                    accept=".xlsx, .xls, .csv"
                    value={selectedFile}
                    onChange={setSelectedFile}
                    clearable
                    leftSection={<IconUpload size={16} />}
                    mb="xl"
                />

                <Group justify="flex-end">
                    <Button variant="default" onClick={closeUploadModal}>
                        Cancel
                    </Button>
                    <Button 
                        color="teal" 
                        onClick={handleUploadSubmit}
                        loading={uploadBulkMutation.isPending}
                        disabled={!selectedFile} // Prevent clicking if no file is chosen
                    >
                        Upload
                    </Button>
                </Group>
            </Modal>
            {/* -------------------- */}

            {/* --- HEADER --- */}
            <Group mb="md">
                <Button 
                    variant="subtle" color="gray"
                    leftSection={<IconArrowLeft size={16} />}
                    onClick={() => router.back()}
                >
                    Back to Suppliers
                </Button>
            </Group>

            <Group justify="space-between" align="center" mb="xl">
                <div>
                    <Title order={2}>{supplier?.supplier_details?.name || 'Supplier Details'}</Title>
                    <Text c="dimmed" size="sm">Vendor Code: <b>{supplierCode}</b></Text>
                </div>
                <Badge color={supplier.supplier_details.is_active === '1' ? 'green' : 'red'} size="lg" variant="light">
                    {supplier.supplier_details.is_active === '1' ? 'Active' : 'Inactive'}
                </Badge>
            </Group>

            {/* --- ANALYTICS / KPI CARDS --- */}
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="xl">
                <Paper withBorder p="md" radius="md">
                    <Group justify="space-between">
                        <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Total Sales</Text>
                        <ThemeIcon color="green" variant="light" size="lg"><IconCurrencyDollar size={20} /></ThemeIcon>
                    </Group>
                    <Group align="flex-end" gap="xs" mt={25}>
                        <Text size="xl" fw={700}>₱{supplier.total_sales}</Text>
                        <Badge color="green" variant="light" size="sm" leftSection={<IconTrendingUp size={10}/>}>+14%</Badge>
                    </Group>
                </Paper>

                <Paper withBorder p="md" radius="md">
                    <Group justify="space-between">
                        <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Active Products</Text>
                        <ThemeIcon color="blue" variant="light" size="lg"><IconPackage size={20} /></ThemeIcon>
                    </Group>
                    <Text size="xl" fw={700} mt={25}>{activeProductCount || 0}</Text>
                </Paper>

                <Paper withBorder p="md" radius="md">
                    <Group justify="space-between">
                        <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Total Orders</Text>
                        <ThemeIcon color="orange" variant="light" size="lg"><IconReceipt2 size={20} /></ThemeIcon>
                    </Group>
                    <Text size="xl" fw={700} mt={25}>{supplier.order_count}</Text>
                </Paper>

                <Paper withBorder p="md" radius="md">
                    <Group justify="space-between">
                        <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Registered Users</Text>
                        <ThemeIcon color="grape" variant="light" size="lg"><IconUsers size={20} /></ThemeIcon>
                    </Group>
                    <Text size="xl" fw={700} mt={25}>12</Text>
                </Paper>
            </SimpleGrid>

            {/* --- TABBED DATA TABLES --- */}
            <Paper withBorder shadow="sm" radius="md" p="md">
                <Tabs defaultValue="products" variant="outline">
                    <Tabs.List mb="md">
                        <Tabs.Tab value="products" leftSection={<IconPackage style={{ width: rem(16), height: rem(16) }} />}>
                            Products
                        </Tabs.Tab>
                        <Tabs.Tab value="orders" leftSection={<IconReceipt2 style={{ width: rem(16), height: rem(16) }} />}>
                            Orders
                        </Tabs.Tab>
                        <Tabs.Tab value="users" leftSection={<IconUsers style={{ width: rem(16), height: rem(16) }} />}>
                            Users
                        </Tabs.Tab>
                        <Tabs.Tab value="info" leftSection={<IconInfoCircle style={{ width: rem(16), height: rem(16) }} />}>
                            Supplier Info
                        </Tabs.Tab>
                    </Tabs.List>

                    {/* Products Tab */}
                    <Tabs.Panel value="products">
                        <Group justify="space-between" mb="md" mt="md">
                            <div>
                                <Text fw={600}>Supplier Products</Text>
                                <Text size="sm" c="dimmed">
                                Manage supplier product list or upload in bulk.
                                </Text>
                            </div>

                            <Button
                                leftSection={<IconUpload size={16} />}
                                variant="light"
                                color="teal"
                                radius="md"
                                onClick={openUploadModal}
                            >
                                Bulk Upload
                            </Button>
                        </Group>
                        
                        <SupplierProductsDatatable 
                            products={supplier.supplierProducts ?? []} 
                            vendor_code={supplierCode} 
                        />
                    </Tabs.Panel>

                    <Tabs.Panel value="orders">
                        <SupplierOrdersDatatable vendor_code={supplierCode} />
                    </Tabs.Panel>

                    <Tabs.Panel value="users">
                        <Text c="dimmed" my="xl" ta="center">User management datatable will go here.</Text>
                        <SupplierUsersDatatable vendor_code={supplierCode}/>
                    </Tabs.Panel>

                    <Tabs.Panel value="info">
                        <Grid gutter="xl" p="md">
                            <Grid.Col span={{ base: 12, md: 6 }}>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Supplier Name</Text>
                                <Text size="lg" fw={500} mb="xl">{supplier?.supplier_details?.name || 'N/A'}</Text>

                                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Supplier Code</Text>
                                <Text size="lg" fw={500} mb="xl">{supplier?.supplier_code || supplierCode}</Text>
                            </Grid.Col>

                            <Grid.Col span={{ base: 12, md: 6 }}>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Date Added</Text>
                                <Text size="lg" fw={500} mb="xl">{supplier?.created_at || 'N/A'}</Text>
                            </Grid.Col>
                        </Grid>
                    </Tabs.Panel>

                </Tabs>
            </Paper>
        </Container>
    );
}