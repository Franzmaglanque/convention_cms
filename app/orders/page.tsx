'use client';

import { Title, Button, Text, Group, Modal, Badge } from '@mantine/core';
import { useState, useEffect, Suspense } from 'react';
import { useQuery, useMutation } from "@tanstack/react-query";


function UpdateItemChangeContent() {
    const { data, isLoading } = useQuery({
        queryKey: ['BatchRecords'],
        queryFn: async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/order/test`);
            console.log('test',res);
            // CRITICAL: Fetch doesn't throw errors on 404/500, you must check manually
            if (!res.ok) {
                throw new Error('Network response was not ok');
            }
            
            return res.json();
        },
    });
    if (isLoading) console.log('Loading...');
    return (
        <>
        </>
    );
}

export default function UpdateItemChangePage() {
    return (
        <Suspense fallback={<Text>Loading...</Text>}>
            <UpdateItemChangeContent />
        </Suspense>
    );
}