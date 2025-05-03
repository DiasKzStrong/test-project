/* eslint-disable */


import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteDictionary, getDictionary, updateDictionary, createDictionary } from '../api/dict-api';
import { getColumnsForDictionary } from './columns';

const getTitleName = (id: string) => {
  switch (id) {
    case "1":
      return "Статусы";
    case "2":
      return "Типы";
    case "3":
      return "Категории";
    case "4":
      return "Подкатегории";
      
  }
}

const useDictionary = (id: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dictionary', id],
    queryFn: () => getDictionary(id),
  });

  const queryClient = useQueryClient();
  
  const editMutation = useMutation({
    mutationFn: ({ id_item, data }: { id_item: string, data: any }) => 
      updateDictionary(id, id_item, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dictionary', id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id_item: string) => deleteDictionary(id, id_item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dictionary', id] });
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => createDictionary(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dictionary', id] });
    },
  });

  const handleEdit = (item: any) => {
    // This function will be called from the UI
    // You can implement the edit logic here or pass the mutation
    editMutation.mutate({ id_item: item.id, data: item });
  };

  const handleDelete = (item: any) => {
    deleteMutation.mutate(item.id);
  };

  const handleCreate = (data: any) => {
    createMutation.mutate(data);
  };

  const columns = getColumnsForDictionary(id);
  const title = getTitleName(id);

  return {
    data,
    isLoading,
    error,
    columns,
    title,
    handleEdit,
    handleDelete,
    handleCreate,
  };
};

export default useDictionary;