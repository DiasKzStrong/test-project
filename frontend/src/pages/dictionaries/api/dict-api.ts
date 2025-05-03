/* eslint-disable */

import apiInstance from "@/shared/api/api_instance";


function getDictionaryName(id: string) {
  switch (id) {
    case "1":
      return "cfs-statuses";
    case "2":
      return "cfs-types";
    case "3":
      return "cfs-categories";
    case "4":
      return "cfs-subcategories";
      
  }
}

export const getDictionary = async (id: string) => {
  const name = getDictionaryName(id);
  const response = await apiInstance.get(`/dictionaries/${name}/`);
  return response.data;
};

export const createDictionary = async (id: string, data: any) => {
  const name = getDictionaryName(id);
  const response = await apiInstance.post(`/dictionaries/${name}/`, data);
  return response.data;
};

export const updateDictionary = async (id: string, id_item: string, data: any) => {
  const name = getDictionaryName(id);
  const response = await apiInstance.put(`/dictionaries/${name}/${id_item}/`, data);
  return response.data;
};

export const deleteDictionary = async (id: string, id_item: string) => {
  const name = getDictionaryName(id);
  const response = await apiInstance.delete(`/dictionaries/${name}/${id_item}/`);
  return response.data;
};


