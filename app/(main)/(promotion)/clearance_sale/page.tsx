'use client';

import { Title, Text, Group, Button, Paper, Modal, TextInput, Select, Stack } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import ClearanceSaleComponentDatatable from '@/components/datatables/clearanceSaleComponentDatatable';

export default function PriceUpdatePage() {
    const [opened, { open, close }] = useDisclosure(false);

    const [vendor, setVendor] = useState<string | null>(null);
    // const [startTime, setStartTime] = useState<Date | null>(null);
    const [startTime, setStartTime] = useState<string | null>(null);
    const [label, setLabel] = useState('');

    const handleCreateClearance = () => {
        // Logic to call your CmsService.saveClearanceSchemes goes here
        console.log({ vendor, startTime, label });
        close();
    };
    
    return (
        <>

            {/* Modal for Creating Clearance */}
            <Modal opened={opened} onClose={close} title="Create New Clearance Sale" centered>
                <Stack>
                    <Select
                        label="Select Vendor"
                        placeholder="Choose a vendor"
                        data={['Vendor A', 'Vendor B', 'Vendor C']} // Map your vendor list here
                        value={vendor}
                        onChange={setVendor}
                        searchable
                    />
                    
                    <DateTimePicker
                        label="Start Time"
                        placeholder="Pick date and time"
                        value={startTime}
                        onChange={setStartTime}
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