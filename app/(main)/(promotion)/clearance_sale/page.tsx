'use client';

import { Title, Text, Group, Button, Paper, Modal, TextInput, Select, Stack } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import ClearanceSaleComponentDatatable from '@/components/datatables/clearanceSaleComponentDatatable';
import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchActiveSuppliers } from '@/api/supplier_api';
import { saveClearanceHeader } from '@/api/promotion_api';
import { showErrorNotification, showSuccessNotification } from '@/lib/notifications';


export default function PriceUpdatePage() {
    const [opened, { open, close }] = useDisclosure(false);
    const { data: active_suppliers, refetch } = useQuery({
        queryKey: ['active-suppliers'],
        queryFn: () => fetchActiveSuppliers(),
        enabled: opened
    });

    const saveClearanceHeaderMutation = useMutation({
        mutationFn: async (row:any) => saveClearanceHeader(row),
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

    const [vendor, setVendor] = useState<string | null>(null);
    // const [startTime, setStartTime] = useState<Date | null>(null);
    // const [startTime, setStartTime] = useState<string | null>(null);
    const [label, setLabel] = useState('');

    const handleCreateClearance = () => {
        // Logic to call your CmsService.saveClearanceSchemes goes here
        console.log({ vendor,  label });
        saveClearanceHeaderMutation.mutate({
            vendor_code:vendor,
            label:label
        });

        close();
    };

    const vendorOptions = active_suppliers?.map((supplier:any) => ({
        value: supplier.vendor_code.toString(),
        label: `${supplier.vendor_code} - ${supplier.vendor_name}`
    }))
    console.log('active_suppliers',active_suppliers);
    console.log('foo',vendorOptions);
    
    return (
        <>

            {/* Modal for Creating Clearance */}
            <Modal opened={opened} onClose={close} title="Create New Clearance Sale" centered>
                <Stack>
                    <Select
                        label="Select Vendor"
                        placeholder="Choose a vendor"
                        data={vendorOptions}
                        value={vendor}
                        onChange={setVendor}
                        searchable
                    />

                    <TextInput
                        label="Label"
                        placeholder="Description of clearance (e.g., Summer Blowout 2026)"
                        value={label}
                        onChange={(event) => setLabel(event.currentTarget.value)}
                    />

                    <Button fullWidth onClick={handleCreateClearance} mt="md">
                        Create Clearance
                    </Button>
                </Stack>
            </Modal>
            {/* Page Header */}
            <Group justify="space-between" align="center" mb="xl">
                <div>
                    <Title order={2}>Manage Clearance Sale</Title>
                    <Text c="dimmed" size="sm">Encode Schemes for clearance sale.</Text>
                </div>
                {/* --- NEW BUTTON --- */}
                <Button onClick={open} leftSection={<Text size="xl">+</Text>}>
                    Create Clearance
                </Button>
            </Group>

            {/* Datatable */}
            <Paper p="sm" radius="md">
                <ClearanceSaleComponentDatatable />
            </Paper>
        </>
    );
}