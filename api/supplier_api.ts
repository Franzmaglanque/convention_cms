import { useAuthStore } from '@/store/useAuthStore';
const token = useAuthStore.getState().token;

export const fetchSupplierRecords = async() => {

    try {
 
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/supplier/fetch-list`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-account-session-token': token || ''
            }
        });

        if (!res.ok) {
            throw new Error(`Error: Failed to fetch suppliers`);
        }

        const response = await res.json();
        return response.data;

    } catch (error) {

        console.error(error);
        throw error;
    }
}

export const fetchSupplierDetails = async(supplierCode:string) => {

    try {
        const token = useAuthStore.getState().token;
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/supplier/fetch-details/${supplierCode}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-account-session-token': token || ''
            }
        });
        
        if (!res.ok) throw new Error('Failed to fetch supplier details');
        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

