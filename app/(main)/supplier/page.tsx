'use client';

import { Title, Button, Text, Group, Container } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { Suspense } from 'react';
import SupplierDatatable from '@/components/datatables/suppliersDatatable';

function Supplier() {
    return (
        <Container fluid px={0}>
            {/* Page Header (Matches your Dashboard style) */}
            <Group justify="space-between" align="center" mb="xl">
                <div>
                    <Title order={2}>Suppliers</Title>
                    <Text c="dimmed" size="sm">Manage and view your supplier network</Text>
                </div>
                <Button leftSection={<IconPlus size={16} />}>
                    New Supplier
                </Button>
            </Group>

            {/* Main Data Table */}
            <SupplierDatatable />
        </Container>
    );
}

export default function SupplierPage() {
    return (
        <Suspense fallback={<Text>Loading suppliers...</Text>}>
            <Supplier />
        </Suspense>
    );
}