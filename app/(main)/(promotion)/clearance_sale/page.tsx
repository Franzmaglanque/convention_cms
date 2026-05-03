'use client';

import { Title, Text, Group, Button, Paper} from '@mantine/core';
import ClearanceSaleComponentDatatable from '@/components/datatables/clearanceSaleComponentDatatable';

export default function PriceUpdatePage() {
    
    return (
        <>
            {/* Page Header */}
            <Group justify="space-between" align="center" mb="xl">
                <div>
                    <Title order={2}>Manage Clearance Sale</Title>
                    <Text c="dimmed" size="sm">Encode Schemes for clearance sale.</Text>
                </div>
            </Group>

            {/* Datatable */}
            <Paper p="sm" radius="md">
                <ClearanceSaleComponentDatatable />
            </Paper>
        </>
    );
}