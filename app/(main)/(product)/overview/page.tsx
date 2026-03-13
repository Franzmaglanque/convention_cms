'use client';

import { Title, Text, Group, Button, Paper, FileInput, Modal} from '@mantine/core';
import { ProductOverviewDatatable } from '@/components/datatables/productOverviewDatatable';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { showErrorNotification, showSuccessNotification } from '@/lib/notifications';
import { useDisclosure } from '@mantine/hooks';
import { bulkUploadProductsOverview } from '@/api/product_api';
import { IconUpload } from '@tabler/icons-react';


export default function ProductOverviewPage() {
    const queryClient = useQueryClient();

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadModalOpened, { open: openUploadModal, close: closeUploadModal }] = useDisclosure(false);
    
    const uploadBulkMutation = useMutation({
        mutationFn: async (file: File) => bulkUploadProductsOverview(file),
        onSuccess: () => {
            showSuccessNotification('Success', 'Bulk products uploaded successfully!');
            queryClient.invalidateQueries({ queryKey: ['product_overview'] });
            
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
    
    return (
        <>
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
                    Please upload an Excel (.xlsx, .xls) or CSV file. The file should contain the required columns: SKU, Barcode, Description, and Price and VENDOR CODE.
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
            <Group justify="space-between" align="center" mb="xl">
                <div>
                    <Title order={2}>Product Overview</Title>
                    <Text c="dimmed" size="sm">Overview of all the products listed in convention</Text>
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

            <Paper p="sm" radius="md">
                <ProductOverviewDatatable />
            </Paper>
        </>
    );
}