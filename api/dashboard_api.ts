import { useAuthStore } from '@/store/useAuthStore';
const token = useAuthStore.getState().token;

// Fetch Items for a specific order
export const dashboardAnalytics = async(date:string) => {
    try {
        const token = useAuthStore.getState().token;
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cms/dashboard_analytics`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-account-session-token': token || ''
            }
        });
        
        if (!res.ok) throw new Error('Failed to fetch order items');
        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}


export const getConventionDates = async() => {
    try {
        const token = useAuthStore.getState().token;
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/fetch-convention-dates`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-account-session-token': token || ''
            }
        });
        
        if (!res.ok) throw new Error('Failed to fetch order items');
        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

