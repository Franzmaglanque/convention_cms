import { useAuthStore } from '@/store/useAuthStore';
const token = useAuthStore.getState().token;

export const updateProduct = async(product:any) => {

    try {

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-account-session-token': token || ''
            },
            body: JSON.stringify(product)
        });
        
        if (!res.ok) throw new Error('Failed to Update ');
        const json = await res.json();
        return json.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}