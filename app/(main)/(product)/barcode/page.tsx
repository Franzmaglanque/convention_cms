'use client';

import { Title, Text, Group, Button, Paper, FileInput, Modal} from '@mantine/core';
import { BarcodePrintingDatable } from '../../../../components/datatables/barcodePrintingDatatable';

export default function BarcodePrintingPage() {    
    return (
        <>
            <Group justify="space-between" align="center" mb="xl">
                <div>
                    <Title order={2}>Print Vendor Barcodes</Title>
                    <Text c="dimmed" size="sm">Printing of barcodes</Text>
                </div>
            </Group>

            <Paper p="sm" radius="md">
                <BarcodePrintingDatable />
            </Paper>
        </>
    );
}