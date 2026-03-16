import { useAuthStore } from '@/store/useAuthStore';
const token = useAuthStore.getState().token;

export const fetchSupplierOrders = async(supplierCode:string) => {

    try {
        const token = useAuthStore.getState().token;
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/order/cms/list/${supplierCode}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-account-session-token': token || ''
            }
        });
        
        if (!res.ok) throw new Error('Failed to fetch supplier Orders');
        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// Fetch Items for a specific order
export const fetchOrderItems = async(orderNo: string) => {
    try {
        const token = useAuthStore.getState().token;
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/order/items-list/${orderNo}`, {
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

//  Fetch Payments for a specific order
export const fetchOrderPayments = async(orderNo: string) => {
    try {
        const token = useAuthStore.getState().token;
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/order/payments-list/${orderNo}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-account-session-token': token || ''
            }
        });
        
        if (!res.ok) throw new Error('Failed to fetch order payments');
        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const fetchAllOrders = async (params:any) => {

    try {
        const queryParams = new URLSearchParams({
            pageIndex: params.pageIndex.toString(),
            pageSize: params.pageSize.toString(),
            search: params.globalFilter || '', // Fallback to empty string if undefined
        });
        const token = useAuthStore.getState().token;
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/order/cms/all?${queryParams.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-account-session-token': token || '',
            },
        });
        
        if (!res.ok) throw new Error('Failed to fetch orders');
        const json = await res.json();
        return json.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}