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

export const bulkUploadProducts = async(file:File,vendor_code:string) => {

    try {
        const formData = new FormData();
            formData.append('file', file);
            formData.append('vendor_code', vendor_code);

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/bulk-upload`, {
                method: 'POST',
                 headers: {
                    'x-account-session-token': token || ''
                },
                body: formData,
            });

            if (!res.ok) throw new Error('Failed to upload file');
            return await res.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const fetchRcrProducts = async() => {

    try {
        const token = useAuthStore.getState().token;
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/rcr/fetch`, {
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

export const fetchDistinctRcrSkus = async() => {

    try {
        const token = useAuthStore.getState().token;
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/rcr/distinct-sku`, {
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


export const fetchAllProducts = async() => {

    try {
        const token = useAuthStore.getState().token;
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/list-all`, {
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

export const fetchComponentProducts = async() => {

    try {
        const token = useAuthStore.getState().token;
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/list-all`, {
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

export const saveProductComponents = async(product:any) => {

    try {

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/component/save`, {
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

export const fetchProductComponents = async(product_id:any) => {

    try {

        const token = useAuthStore.getState().token;
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/components-fetch/${product_id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-account-session-token': token || ''
            }
        });
        
        if (!res.ok) throw new Error('Failed to fetch product components');
        const json = await res.json();
        return json.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

