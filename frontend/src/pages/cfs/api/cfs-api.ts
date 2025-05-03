/* eslint-disable */

import apiInstance from "@/shared/api/api_instance";


export const deleteCFS = async (id: string) => {
    const response = await apiInstance.delete(`/cfs/${id}/`);
    return response.data;
};

export const createCFS = async (data: any) => {
    const response = await apiInstance.post('/cfs/', data);
    return response.data;
};

export const updateCFS = async (id: string, data: any) => {
    const response = await apiInstance.put(`/cfs/${id}/`, data);
    return response.data;
};

export const getCFS = async (id: string) => {
    const response = await apiInstance.get(`/cfs/${id}/`);
    return response.data;
};

export const getCFSList = async (params?: URLSearchParams) => {
    const url = params ? `/cfs?${params.toString()}` : '/cfs';
    const response = await apiInstance.get(url);
    return response.data;
};


