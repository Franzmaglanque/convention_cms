import { useAuthStore } from '@/store/useAuthStore';
const token = useAuthStore.getState().token;

export const saveClearanceHeader = async(clearanceDetails:any) => {

    try {

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/promotion/clearance-header/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-account-session-token': token || ''
            },
            body: JSON.stringify(clearanceDetails)
        });
        
        if (!res.ok) throw new Error('Failed to save Clearance Details ');
        const json = await res.json();
        return json.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}