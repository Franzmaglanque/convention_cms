'use client';

import { Title, Button, Text, Group, Badge, SimpleGrid, Paper } from '@mantine/core';
import { IconPlus, IconReceipt2, IconUsers, IconTicket } from '@tabler/icons-react';
import { Suspense } from 'react';
import { useQuery, useMutation } from "@tanstack/react-query";
import Example from '@/components/datatables/suppliersDatatable';

function Supplier() {
    // You can use React Query here later to fetch real dashboard statistics
    // const { data, isLoading } = useQuery({ queryKey: ['dashboardStats'], queryFn: fetchStats });

    return (
        <>
           <Example />
        </>
    );
}

export default function SupplierPage() {
    return (
        <Suspense fallback={<Text>Loading dashboard...</Text>}>
            <Supplier />
        </Suspense>
    );
}