/* eslint-disable */


import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteCFS, createCFS, updateCFS } from '../api/cfs-api';
import apiInstance from "@/shared/api/api_instance";

// Define the CFS item type
export interface CFSItem {
  id: number;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  status: {
    id: number;
    name: string;
  };
  cfs_type: {
    id: number;
    name: string;
  };
  cfs_category: {
    id: number;
    name: string;
  };
  cfs_subcategory: {
    id: number;
    name: string;
  };
  [key: string]: any;
}

// Define filter state
export interface FilterState {
  search: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  status: string | null;
  type: string | null;
  category: string | null;
  subcategory: string | null;
  amount: string | null;
}

const useCFS = () => {
  const queryClient = useQueryClient();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    dateFrom: undefined,
    dateTo: undefined,
    status: null,
    type: null,
    category: null,
    subcategory: null,
    amount: null,
  });
  
  // Filter options
  const [statuses, setStatuses] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  
  // Filtered options based on dependencies
  const [filteredCategories, setFilteredCategories] = useState<any[]>([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState<any[]>([]);

  // Fetch CFS data with filters and pagination
  const fetchCFSData = async () => {
    // Build query parameters
    const params = new URLSearchParams();
    
    // Add pagination params (using limit & offset)
    params.append('limit', pageSize.toString());
    params.append('offset', ((currentPage - 1) * pageSize).toString());
    
    // Add filter params
    if (filters.search) params.append('search', filters.search);
    if (filters.dateFrom) {
      // Format as YYYY-MM-DD for the backend
      const formattedDate = filters.dateFrom.getFullYear() + '-' + 
        (filters.dateFrom.getMonth() + 1).toString().padStart(2, '0') + '-' + 
        filters.dateFrom.getDate().toString().padStart(2, '0');
      params.append('date_from', formattedDate);
    }
    if (filters.dateTo) {
      // Format as YYYY-MM-DD for the backend
      const formattedDate = filters.dateTo.getFullYear() + '-' + 
        (filters.dateTo.getMonth() + 1).toString().padStart(2, '0') + '-' + 
        filters.dateTo.getDate().toString().padStart(2, '0');
      params.append('date_to', formattedDate);
    }
    if (filters.status) params.append('status', filters.status);
    if (filters.type) params.append('type', filters.type);
    if (filters.category) params.append('category', filters.category);
    if (filters.subcategory) params.append('subcategory', filters.subcategory);
    if (filters.amount) params.append('amount', filters.amount);
    
    const response = await apiInstance.get(`/cfs?${params.toString()}`);
    
    // Set total items for pagination
    setTotalItems(response.data.count || response.data.length);
    
    return response.data.results || response.data;
  };

  // Main query for CFS data
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['cfs', currentPage, pageSize, filters],
    queryFn: fetchCFSData,
    refetchOnWindowFocus: false,
    enabled: true,
  });

  // Fetch dictionary data for filters
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        // Fetch statuses
        const statusesResponse = await apiInstance.get("/dictionaries/cfs-statuses/");
        setStatuses(statusesResponse.data);

        // Fetch types
        const typesResponse = await apiInstance.get("/dictionaries/cfs-types/");
        setTypes(typesResponse.data);

        // Fetch categories
        const categoriesResponse = await apiInstance.get("/dictionaries/cfs-categories/");
        setCategories(categoriesResponse.data);

        // Fetch subcategories
        const subcategoriesResponse = await apiInstance.get("/dictionaries/cfs-subcategories/");
        setSubcategories(subcategoriesResponse.data);
      } catch (error) {
        console.error("Error fetching filter options:", error);
      }
    };

    fetchFilterOptions();
  }, []);

  // Update filtered categories when type changes
  useEffect(() => {
    if (filters.type) {
      const filtered = categories.filter(
        (category) => category.cfs_type.id === parseInt(filters.type!)
      );
      setFilteredCategories(filtered);
      
      // Reset category if it's not in the filtered list
      if (
        filters.category &&
        !filtered.some((c) => c.id === parseInt(filters.category!))
      ) {
        setFilters((prev) => ({ ...prev, category: null, subcategory: null }));
      }
    } else {
      setFilteredCategories(categories);
    }
  }, [filters.type, categories]);

  // Update filtered subcategories when category changes
  useEffect(() => {
    if (filters.category) {
      const filtered = subcategories.filter(
        (subcategory) => subcategory.cfs_category.id === parseInt(filters.category!)
      );
      setFilteredSubcategories(filtered);
      
      // Reset subcategory if it's not in the filtered list
      if (
        filters.subcategory &&
        !filtered.some((s) => s.id === parseInt(filters.subcategory!))
      ) {
        setFilters((prev) => ({ ...prev, subcategory: null }));
      }
    } else {
      setFilteredSubcategories(subcategories);
    }
  }, [filters.category, subcategories]);

  // Handle filter changes
  const handleFilterChange = (name: keyof FilterState, value: any) => {
    // Reset dependent filters
    if (name === "type") {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
        category: null,
        subcategory: null,
      }));
    } else if (name === "category") {
      setFilters((prev) => ({ ...prev, [name]: value, subcategory: null }));
    } else {
      setFilters((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      search: "",
      dateFrom: undefined,
      dateTo: undefined,
      status: null,
      type: null,
      category: null,
      subcategory: null,
      amount: null,
    });
  };

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCFS(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cfs'] });
      
      // Refresh data
      const newPage =
        data && data.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      setCurrentPage(newPage);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateCFS(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cfs'] });
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => createCFS(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cfs'] });
    },
  });

  // Add a new function to apply all filters at once and manually refetch
  const applyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
    // We manually call refetch after setting all filters
    setTimeout(() => {
      refetch();
    }, 0);
  };

  return {
    data,
    isLoading,
    error,
    refetch,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalItems,
    filters,
    setFilters,
    handleFilterChange,
    resetFilters,
    statuses,
    types,
    categories,
    subcategories,
    filteredCategories,
    filteredSubcategories,
    deleteMutation,
    updateMutation,
    createMutation,
    applyFilters,
  };
};

export default useCFS;