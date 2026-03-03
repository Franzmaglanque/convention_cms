export const fetchSupplierRecords = async() => {
    try {

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/supplier/fetch-list`, {
            method: 'GET',
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