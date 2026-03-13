'use client';

import { Title, Text, Group, Button, Paper} from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { InventoryDatatable } from '@/components/datatables/rcrDatatable';

export default function InventoryPage() {
    
    return (
        <>
            {/* Page Header */}
            <Group justify="space-between" align="center" mb="xl">
                <div>
                    <Title order={2}>Convention Inventory</Title>
                    <Text c="dimmed" size="sm">Manage master stock levels and purchase orders.</Text>
                </div>
            </Group>

            {/* Datatable */}
            <Paper p="sm" radius="md">
                <InventoryDatatable />
            </Paper>
        </>
    );
}