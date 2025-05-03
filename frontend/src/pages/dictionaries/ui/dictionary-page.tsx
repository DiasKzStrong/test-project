/* eslint-disable */
import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  getPaginationRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Label } from "@/shared/ui/label";
import useDictionary from "../models/useDictionary";
import apiInstance from "@/shared/api/api_instance";

const DictionaryPage = () => {
  const { id } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const {
    data,
    isLoading,
    error,
    columns,
    title,
    handleEdit,
    handleDelete,
    handleCreate,
  } = useDictionary(id!);

  // State for related data
  const [types, setTypes] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // State for edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [editFormErrors, setEditFormErrors] = useState<Record<string, string>>(
    {}
  );

  // State for create modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState<any>({
    name: "",
  });
  const [createFormErrors, setCreateFormErrors] = useState<
    Record<string, string>
  >({});

  // Fetch types and categories when needed
  useEffect(() => {
    // Always fetch types and categories for both edit and create operations
    apiInstance
      .get("/dictionaries/cfs-types/")
      .then((response) => {
        setTypes(response.data);
      })
      .catch((error) => {
        console.error("Error fetching types:", error);
      });

    apiInstance
      .get("/dictionaries/cfs-categories/")
      .then((response) => {
        setCategories(response.data);
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
      });
  }, []);

  // Add action column to the columns
  const columnsWithActions = [
    ...((columns as ColumnDef<any>[]) || []),
    {
      id: "actions",
      header: "Действия",
      cell: ({ row }: { row: { original: any } }) => {
        // @ts-ignore - Ignoring type checking for this component
        const item = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Открыть меню</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => openEditModal(item)}
                className="cursor-pointer"
              >
                <Edit className="mr-2 h-4 w-4" />
                <span>Изменить</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => confirmDelete(item)}
                className="cursor-pointer text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Удалить</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Initialize table with empty data if dictionary is not loaded yet
  const tableData = data || [];
  const tableColumns = columnsWithActions || [];

  // Create table instance - moved outside of conditional rendering
  const table = useReactTable({
    data: tableData,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter: searchQuery,
    },
    onGlobalFilterChange: setSearchQuery,
  });

  // Open edit modal and set initial form data
  const openEditModal = (item: any) => {
    setEditingItem(item);
    setEditFormErrors({});

    // Format the data for the edit form
    const formattedData = { ...item };

    // For categories, extract the type ID
    if (id === "3" && item.cfs_type) {
      formattedData.cfs_type = item.cfs_type.id;
    }

    // For subcategories, extract the category ID
    if (id === "4" && item.cfs_category) {
      formattedData.cfs_category = item.cfs_category.id;
    }

    setEditFormData(formattedData);
    setIsEditModalOpen(true);
  };

  // Open create modal
  const openCreateModal = () => {
    // Initialize with default values
    const initialData: any = { name: "" };

    // Set default type/category if available
    if (id === "3" && types.length > 0) {
      initialData.cfs_type = types[0].id;
    }

    if (id === "4" && categories.length > 0) {
      initialData.cfs_category = categories[0].id;
    }

    setCreateFormData(initialData);
    setCreateFormErrors({});
    setIsCreateModalOpen(true);
  };

  // Handle edit form input changes
  const handleEditInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user changes it
    if (editFormErrors[name]) {
      setEditFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle create form input changes
  const handleCreateInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setCreateFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user changes it
    if (createFormErrors[name]) {
      setCreateFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validate edit form
  const validateEditForm = () => {
    const errors: Record<string, string> = {};

    if (!editFormData.name?.trim()) {
      errors.name = "Название обязательно";
    }

    if (id === "3" && !editFormData.cfs_type) {
      errors.cfs_type = "Тип обязателен";
    }

    if (id === "4" && !editFormData.cfs_category) {
      errors.cfs_category = "Категория обязательна";
    }

    setEditFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate create form
  const validateCreateForm = () => {
    const errors: Record<string, string> = {};

    if (!createFormData.name?.trim()) {
      errors.name = "Название обязательно";
    }

    if (id === "3" && !createFormData.cfs_type) {
      errors.cfs_type = "Тип обязателен";
    }

    if (id === "4" && !createFormData.cfs_category) {
      errors.cfs_category = "Категория обязательна";
    }

    setCreateFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit edit form
  const submitEditForm = () => {
    if (!validateEditForm()) {
      return;
    }

    // Format the data for the API
    const formattedData = { ...editFormData };

    // For categories, we need to format the cfs_type field
    if (id === "3" && formattedData.cfs_type) {
      formattedData.cfs_type = parseInt(formattedData.cfs_type);
    }

    // For subcategories, we need to format the cfs_category field
    if (id === "4" && formattedData.cfs_category) {
      formattedData.cfs_category = parseInt(formattedData.cfs_category);
    }

    handleEdit(formattedData);
    setIsEditModalOpen(false);
  };

  // Submit create form
  const submitCreateForm = () => {
    if (!validateCreateForm()) {
      return;
    }

    // Format the data for the API
    const formattedData = { ...createFormData };

    // For categories, we need to format the cfs_type field
    if (id === "3" && formattedData.cfs_type) {
      formattedData.cfs_type = parseInt(formattedData.cfs_type);
    }

    // For subcategories, we need to format the cfs_category field
    if (id === "4" && formattedData.cfs_category) {
      formattedData.cfs_category = parseInt(formattedData.cfs_category);
    }

    handleCreate(formattedData);
    setIsCreateModalOpen(false);
  };

  // Confirm delete with a dialog
  const confirmDelete = (item: any) => {
    if (window.confirm(`Вы уверены, что хотите удалить "${item.name}"?`)) {
      handleDelete(item);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-700">Загрузка...</h1>
        <div className="mt-4 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-red-700">Ошибка!</h1>
        <p className="text-gray-600 mt-2">
          Произошла ошибка при загрузке данных.
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-700">Нет данных</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-4">
        <Link
          to="/dictionaries"
          className="flex items-center text-purple-700 hover:text-purple-900 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Назад к справочникам
        </Link>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          <span className="text-purple-700">{title}</span>
        </h1>
        <Button
          className="bg-purple-600 hover:bg-purple-700"
          onClick={openCreateModal}
        >
          <Plus className="h-5 w-5 mr-1" /> Создать запись
        </Button>
      </div>

      {/* Search bar */}
      <div className="relative max-w-md mb-6">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <Input
          type="text"
          placeholder="Поиск..."
          className="pl-10 border-gray-300 focus-visible:ring-purple-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="h-24 text-center"
                >
                  Нет данных
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <button
          className="px-2 py-1 rounded border border-gray-300 disabled:opacity-50"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Назад
        </button>
        <span className="text-sm text-gray-700">
          Страница {table.getState().pagination.pageIndex + 1} из{" "}
          {table.getPageCount()}
        </span>
        <button
          className="px-2 py-1 rounded border border-gray-300 disabled:opacity-50"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Вперед
        </button>
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Редактировать запись</DialogTitle>
            <DialogDescription>
              Внесите изменения в данные и нажмите Сохранить.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Название*
              </Label>
              <div className="col-span-3">
                <Input
                  id="name"
                  name="name"
                  value={editFormData?.name || ""}
                  onChange={handleEditInputChange}
                  className={editFormErrors.name ? "border-red-500" : ""}
                  required
                />
                {editFormErrors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {editFormErrors.name}
                  </p>
                )}
              </div>
            </div>

            {/* Add additional fields based on dictionary type */}
            {id === "3" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-cfs_type" className="text-right">
                  Тип*
                </Label>
                <div className="col-span-3">
                  <select
                    id="edit-cfs_type"
                    name="cfs_type"
                    value={editFormData.cfs_type || ""}
                    onChange={handleEditInputChange}
                    className={`p-2 border rounded w-full ${
                      editFormErrors.cfs_type ? "border-red-500" : ""
                    }`}
                    required
                  >
                    {types.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                  {editFormErrors.cfs_type && (
                    <p className="text-red-500 text-sm mt-1">
                      {editFormErrors.cfs_type}
                    </p>
                  )}
                </div>
              </div>
            )}

            {id === "4" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-cfs_category" className="text-right">
                  Категория*
                </Label>
                <div className="col-span-3">
                  <select
                    id="edit-cfs_category"
                    name="cfs_category"
                    value={editFormData.cfs_category || ""}
                    onChange={handleEditInputChange}
                    className={`p-2 border rounded w-full ${
                      editFormErrors.cfs_category ? "border-red-500" : ""
                    }`}
                    required
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {editFormErrors.cfs_category && (
                    <p className="text-red-500 text-sm mt-1">
                      {editFormErrors.cfs_category}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Отмена
            </Button>
            <Button onClick={submitEditForm}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Создать новую запись</DialogTitle>
            <DialogDescription>
              Заполните данные и нажмите Создать.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="create-name" className="text-right">
                Название*
              </Label>
              <div className="col-span-3">
                <Input
                  id="create-name"
                  name="name"
                  value={createFormData.name}
                  onChange={handleCreateInputChange}
                  className={createFormErrors.name ? "border-red-500" : ""}
                  required
                />
                {createFormErrors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {createFormErrors.name}
                  </p>
                )}
              </div>
            </div>

            {/* Add additional fields based on dictionary type */}
            {id === "3" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="create-cfs_type" className="text-right">
                  Тип*
                </Label>
                <div className="col-span-3">
                  <select
                    id="create-cfs_type"
                    name="cfs_type"
                    value={createFormData.cfs_type || ""}
                    onChange={handleCreateInputChange}
                    className={`p-2 border rounded w-full ${
                      createFormErrors.cfs_type ? "border-red-500" : ""
                    }`}
                    required
                  >
                    {types.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                  {createFormErrors.cfs_type && (
                    <p className="text-red-500 text-sm mt-1">
                      {createFormErrors.cfs_type}
                    </p>
                  )}
                </div>
              </div>
            )}

            {id === "4" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="create-cfs_category" className="text-right">
                  Категория*
                </Label>
                <div className="col-span-3">
                  <select
                    id="create-cfs_category"
                    name="cfs_category"
                    value={createFormData.cfs_category || ""}
                    onChange={handleCreateInputChange}
                    className={`p-2 border rounded w-full ${
                      createFormErrors.cfs_category ? "border-red-500" : ""
                    }`}
                    required
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {createFormErrors.cfs_category && (
                    <p className="text-red-500 text-sm mt-1">
                      {createFormErrors.cfs_category}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Отмена
            </Button>
            <Button onClick={submitCreateForm}>Создать</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DictionaryPage;
