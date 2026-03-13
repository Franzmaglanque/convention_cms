'use client';

import { Title, Text, Group, Button, Paper} from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { InventoryDatatable } from '@/components/datatables/rcrDatatable';
import ProductComponentDatatable from '@/components/datatables/productComponentDatatable';

export default function InventoryPage() {
    
    return (
        <>
            {/* Page Header */}
            <Group justify="space-between" align="center" mb="xl">
                <div>
                    <Title order={2}>Manage Product Components</Title>
                    <Text c="dimmed" size="sm">Perform actions to the components of each product.</Text>
                </div>
            </Group>

            {/* Datatable */}
            <Paper p="sm" radius="md">
                {/* <InventoryDatatable /> */}
                <ProductComponentDatatable />
            </Paper>
        </>
    );
}