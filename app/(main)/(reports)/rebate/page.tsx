'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { 
    Button, 
    Card, 
    Container, 
    Stack, 
    Text, 
    Title, 
    ThemeIcon,
    Center,
    Box
} from '@mantine/core';
import { IconDownload, IconPackages } from '@tabler/icons-react';
import { useState } from 'react';

export default function ProductsSchemeReportGenerator() {
    const token = useAuthStore((state) => state.token);
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reports/rebate/export`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'x-account-session-token': token || ''
                }
            });
            
            if (!res.ok) throw new Error('Failed to generate report');

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            
            const fileName = `rebate_report_${new Date().toISOString().split('T')[0]}.xlsx`;
                
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error('Export Error:', error);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Container size="sm" py={60}>
            <Card 
                shadow="xl" 
                radius="lg" 
                padding="xl" 
                withBorder 
                style={{ overflow: 'hidden' }}
            >
                {/* Decorative Top Accent Line */}
                <Box 
                    h={6} 
                    w="100%" 
                    pos="absolute" 
                    top={0} 
                    left={0} 
                    style={{ 
                        background: 'linear-gradient(90deg, var(--mantine-color-grape-6), var(--mantine-color-pink-5))' 
                    }}
                />

                <Stack align="center" gap="lg" mt="sm" mb="xl">
                    {/* Elevated Icon Container */}
                    <Box
                        style={(theme) => ({
                            backgroundColor: theme.colors.grape[0],
                            padding: theme.spacing.md,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        })}
                    >
                        <ThemeIcon size={64} radius="100%" variant="transparent" color="grape.7">
                            <IconPackages size={48} stroke={1.5} />
                        </ThemeIcon>
                    </Box>
                    
                    <Center style={{ flexDirection: 'column' }}>
                        <Title order={2} fw={800} style={{ letterSpacing: '-0.5px' }}>
                            Rebate Report
                        </Title>
                        <Text 
                            c="dimmed" 
                            size="sm" 
                            ta="center" 
                            mt="sm" 
                            maw={320} // Constrains text width so it wraps nicely
                            lh={1.6}  // Improves line height for readability
                        >
                            Generate an Excel report calculating the remaining balance (Inventory Amount minus Sales) per vendor.
                        </Text>
                    </Center>
                </Stack>

                {/* Upgraded Gradient Button */}
                <Button 
                    size="lg"
                    radius="md"
                    variant="gradient"
                    gradient={{ from: 'grape.6', to: 'pink.6', deg: 105 }}
                    leftSection={<IconDownload size={22} />} 
                    onClick={handleExport}
                    loading={isExporting}
                    fullWidth
                    style={{
                        boxShadow: '0 4px 14px 0 rgba(190, 75, 219, 0.39)' // Custom soft shadow to match the grape color
                    }}
                >
                    Download Excel Report
                </Button>
            </Card>
        </Container>
    );
}