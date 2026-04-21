import { useAuthStore } from '@/store/useAuthStore';
const token = useAuthStore.getState().token;

export const executeLoad = async(product:any) => {

    try {

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/load/execute-load`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-account-session-token': token || ''
            },
            body: JSON.stringify(product)
        });
        
        if (!res.ok) throw new Error('Failed to save product components ');
        const json = await res.json();
        return json.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}