'use client';

import { Title, Text, Group, Button, Paper} from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { InventoryDatatable } from '@/components/datatables/rcrDatatable';
import ProductComponentDatatable from '@/components/datatables/productComponentDatatable';
import { FlashDealsComponentDatatable } from '@/components/datatables/flashDealsComponentDatatable';

export default function InventoryPage() {
    
    return (
        <>
            {/* Page Header */}
            <Group justify="space-between" align="center" mb="xl">
                <div>
                    <Title order={2}>Manage Flash Deals</Title>
                    <Text c="dimmed" size="sm">Perform actions to the schemes of each flash deal.</Text>
                </div>
            </Group>

            {/* Datatable */}
            <Paper p="sm" radius="md">
                <FlashDealsComponentDatatable />
            </Paper>
        </>
    );
}