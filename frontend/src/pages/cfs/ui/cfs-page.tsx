/* eslint-disable */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Filter,
  Edit,
  Trash2,
  MoreHorizontal,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
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
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  FilterFn,
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
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Label } from "@/shared/ui/label";
import { Calendar as CalendarComponent } from "@/shared/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import useCFS, { CFSItem } from "../models/useCFS";
import React from "react";
import { rankItem } from "@tanstack/match-sorter-utils";
import { toast } from "sonner";

const CFSPage = () => {
  const navigate = useNavigate();

  const {
    data,
    isLoading,
    error,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalItems,
    filters,
    handleFilterChange,
    resetFilters,
    statuses,
    types,
    categories,
    subcategories,
    filteredCategories,
    filteredSubcategories,
    deleteMutation,
    createMutation,
    updateMutation,
    setFilters,
    applyFilters,
  } = useCFS();

  // Local copy of filters for the dialog
  const [localFilters, setLocalFilters] = useState(filters);

  // State for the "Create CFS" modal form (only date, status, type, category, sub_category, user)
  const [createFormData, setCreateFormData] = useState<{
    date: Date | null;
    amount: string;
    status: string | null;
    type: string | null;
    category: string | null;
    sub_category: string | null;
  }>({
    date: new Date(),
    amount: "",
    status: null,
    type: null,
    category: null,
    sub_category: null,
  });

  // Local state for UI
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<CFSItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<{
    id: string;
    date: Date | null;
    amount: string;
    status: string | null;
    type: string | null;
    category: string | null;
    sub_category: string | null;
  } | null>(null);

  // Состояние для локального поиска (без запросов к API)
  const [localSearch, setLocalSearch] = useState("");

  // Добавим состояние для ошибок валидации
  // Ошибки валидации для формы создания
  const [createErrors, setCreateErrors] = useState<{
    amount?: string;
    type?: string;
    category?: string;
    sub_category?: string;
  }>({});

  // Ошибки валидации для формы редактирования
  const [editErrors, setEditErrors] = useState<{
    amount?: string;
    type?: string;
    category?: string;
    sub_category?: string;
  }>({});

  // Derive category/subcategory lists for creation
  const createCategories = React.useMemo(() => {
    if (!createFormData.type) return [];
    return categories.filter(
      (cat) => String(cat.cfs_type.id) === createFormData.type
    );
  }, [createFormData.type, categories]);

  const createSubcategories = React.useMemo(() => {
    if (!createFormData.category) return [];
    return subcategories.filter(
      (sub) => String(sub.cfs_category.id) === createFormData.category
    );
  }, [createFormData.category, subcategories]);

  // Derive category/subcategory lists for the EDIT form
  const editCategories = React.useMemo(() => {
    if (!editFormData?.type) return [];
    return categories.filter(
      (cat) => String(cat.cfs_type.id) === editFormData.type
    );
  }, [editFormData?.type, categories]);

  const editSubcategories = React.useMemo(() => {
    if (!editFormData?.category) return [];
    return subcategories.filter(
      (sub) => String(sub.cfs_category.id) === editFormData.category
    );
  }, [editFormData?.category, subcategories]);

  // Filtered filter categories based on selected type in filter dialog
  const filteredFilterCategories = React.useMemo(() => {
    if (!localFilters.type) return [];
    return categories.filter(
      (cat) => String(cat.cfs_type.id) === localFilters.type
    );
  }, [localFilters.type, categories]);

  // Filtered filter subcategories based on selected category in filter dialog
  const filteredFilterSubcategories = React.useMemo(() => {
    if (!localFilters.category) return [];
    return subcategories.filter(
      (sub) => String(sub.cfs_category.id) === localFilters.category
    );
  }, [localFilters.category, subcategories]);

  // Функция fuzzy-фильтрации для поиска по всем полям
  const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
    // Пропускаем пустые значения
    if (!value || value === "") return true;

    const itemRank = rankItem(row.getValue(columnId), value);

    // Сохраняем ранг совпадения для сортировки результатов
    addMeta({ itemRank });

    // Возвращаем true если есть совпадение
    return itemRank.passed;
  };

  // Добавим вспомогательную функцию для правильного форматирования даты
  const formatDateForAPI = (date: Date) => {
    // Получаем год, месяц и день в локальном часовом поясе
    const year = date.getFullYear();
    // В JS месяцы начинаются с 0, поэтому добавляем 1
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    // Форматируем в YYYY-MM-DD
    return `${year}-${month}-${day}`;
  };

  // Define columns
  const columns: ColumnDef<CFSItem>[] = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "date",
      header: "Дата создания",
      cell: ({ row }) => {
        const date = new Date(row.original.date);
        return format(date, "dd.MM.yyyy", { locale: ru });
      },
    },
    {
      accessorKey: "amount",
      header: "Сумма",
    },
    {
      accessorKey: "status.name",
      header: "Статус",
    },
    {
      accessorKey: "type.name",
      header: "Тип",
    },
    {
      accessorKey: "category.name",
      header: "Категория",
    },
    {
      accessorKey: "sub_category.name",
      header: "Подкатегория",
    },
    {
      id: "actions",
      header: "Действия",
      cell: ({ row }) => {
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
                onClick={() => {
                  // prefill edit form
                  setEditFormData({
                    id: item.id.toString(),
                    date: new Date(item.date),
                    amount: item.amount,
                    status: item.status.id.toString(),
                    type: item.type.id.toString(),
                    category: item.category.id.toString(),
                    sub_category: item.sub_category.id.toString(),
                  });
                  setIsEditModalOpen(true);
                }}
                className="cursor-pointer"
              >
                <Edit className="mr-2 h-4 w-4" />
                <span>Изменить</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => openDeleteDialog(item)}
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

  // Create table instance
  const table = useReactTable({
    data: data || [],
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      // Включаем глобальный фильтр для всех колонок
      globalFilter: localSearch,
    },
    onGlobalFilterChange: setLocalSearch,
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // Handle edit
  const handleEdit = (item: CFSItem) => {
    navigate(`/cfs/${item.id}/edit`);
  };

  // Open delete dialog
  const openDeleteDialog = (item: CFSItem) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Handle page size change
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page when page size changes
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return (
      filters.search ||
      filters.dateFrom ||
      filters.dateTo ||
      filters.status ||
      filters.type ||
      filters.category ||
      filters.subcategory
    );
  };

  // Reset create form when opening the modal
  const handleOpenCreateModal = () => {
    setCreateFormData({
      date: new Date(),
      amount: "",
      status: null,
      type: null,
      category: null,
      sub_category: null,
    });
    setCreateErrors({});
    setIsCreateModalOpen(true);
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">
          Ошибка загрузки данных
        </h1>
        <p className="mt-4 text-gray-700">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Обращения в ДДС</h1>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 bg-gray-50 border-gray-200"
              onClick={() => setIsFilterDialogOpen(true)}
            >
              <Filter className="h-4 w-4" />
              <span>Фильтры</span>
            </Button>

            <Button
              size="sm"
              className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={handleOpenCreateModal}
            >
              <Plus className="h-4 w-4" />
              <span>Создать</span>
            </Button>
          </div>
        </div>

        <div className="relative mb-4">
          <Input
            placeholder="Поиск по всем полям..."
            value={localSearch}
            onChange={(e) => {
              // Обновляем только локальное состояние (без запроса к API)
              setLocalSearch(e.target.value);
            }}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 w-full"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="border-b border-gray-200"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="py-3 px-4 text-sm font-medium text-gray-700"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
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
                  <TableRow
                    key={row.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-2 px-4">
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
                    colSpan={columns.length}
                    className="h-24 text-center text-gray-500"
                  >
                    Данные не найдены
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Показано {table.getFilteredRowModel().rows.length} из{" "}
            {data?.length ?? 0}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="border-gray-300 text-gray-700"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            >
              Назад
            </Button>

            <span className="px-3 py-1 rounded-md bg-white border border-gray-300 text-sm text-gray-700">
              {currentPage} из {Math.ceil(totalItems / pageSize) || 1}
            </span>

            <Button
              variant="outline"
              size="sm"
              className="border-gray-300 text-gray-700"
              disabled={
                !currentPage ||
                !pageSize ||
                currentPage >= Math.ceil(totalItems / pageSize) ||
                table.getFilteredRowModel().rows.length === 0
              }
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Вперед
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Показывать:</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(v) => {
                setPageSize(Number(v));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[80px] h-8 text-sm focus:ring-indigo-500">
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 50, 100].map((s) => (
                  <SelectItem key={s} value={s.toString()} className="text-sm">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Filter Dialog */}
      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Фильтры</DialogTitle>
            <DialogDescription>
              Настройте фильтры для поиска обращений
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dateFrom" className="block mb-2">
                  Дата с
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {localFilters.dateFrom ? (
                        format(localFilters.dateFrom, "dd.MM.yyyy")
                      ) : (
                        <span>Выберите дату</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={localFilters.dateFrom}
                      onSelect={(date) =>
                        setLocalFilters((prev) => ({ ...prev, dateFrom: date }))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="dateTo" className="block mb-2">
                  Дата по
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {localFilters.dateTo ? (
                        format(localFilters.dateTo, "dd.MM.yyyy")
                      ) : (
                        <span>Выберите дату</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={localFilters.dateTo}
                      onSelect={(date) =>
                        setLocalFilters((prev) => ({ ...prev, dateTo: date }))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Amount */}
            <div>
              <Label htmlFor="flt-amount">Сумма</Label>
              <Input
                id="flt-amount"
                type="number"
                value={localFilters.amount ?? ""}
                onChange={(e) =>
                  setLocalFilters((f) => ({
                    ...f,
                    amount: e.target.value || null,
                  }))
                }
                placeholder="≥"
              />
            </div>

            {/* Status */}
            <div>
              <Label htmlFor="status" className="block mb-2">
                Статус
              </Label>
              <Select
                value={localFilters.status ?? "all"}
                onValueChange={(v) =>
                  setLocalFilters((f) => ({
                    ...f,
                    status: v === "all" ? null : v,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Все статусы" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status.id} value={status.id.toString()}>
                      {status.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Type */}
            <div>
              <Label htmlFor="type" className="block mb-2">
                Тип
              </Label>
              <Select
                value={localFilters.type ?? "all"}
                onValueChange={(v) =>
                  setLocalFilters((f) => ({
                    ...f,
                    type: v === "all" ? null : v,
                    category: null,
                    subcategory: null,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Все типы" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все типы</SelectItem>
                  {types.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category" className="block mb-2">
                Категория
              </Label>
              <Select
                value={localFilters.category ?? "all"}
                disabled={!localFilters.type}
                onValueChange={(v) =>
                  setLocalFilters((f) => ({
                    ...f,
                    category: v === "all" ? null : v,
                    subcategory: null,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Все категории" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все категории</SelectItem>
                  {filteredFilterCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subcategory */}
            <div>
              <Label htmlFor="subcategory" className="block mb-2">
                Подкатегория
              </Label>
              <Select
                value={localFilters.subcategory ?? "all"}
                disabled={!localFilters.category}
                onValueChange={(v) =>
                  setLocalFilters((f) => ({
                    ...f,
                    subcategory: v === "all" ? null : v,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Все подкатегории" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все подкатегории</SelectItem>
                  {filteredFilterSubcategories.map((s) => (
                    <SelectItem key={s.id} value={s.id.toString()}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                resetFilters();
                setIsFilterDialogOpen(false);
              }}
            >
              Сбросить
            </Button>
            <Button
              onClick={() => {
                applyFilters(localFilters);
                setCurrentPage(1);
                setIsFilterDialogOpen(false);
              }}
            >
              Применить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Подтверждение удаления</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить это обращение?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {itemToDelete && (
              <p>
                <strong>{itemToDelete.title}</strong>
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (itemToDelete) {
                  deleteMutation.mutate(itemToDelete.id.toString());
                  setIsDeleteDialogOpen(false);
                }
              }}
            >
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create CFS Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Новое обращение</DialogTitle>
            <DialogDescription>
              Заполните форму и нажмите «Создать».
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            {/* Date */}
            <div className="col-span-1">
              <Label htmlFor="new-date">Дата*</Label>
              <CalendarComponent
                mode="single"
                selected={createFormData.date ?? undefined}
                onSelect={(d) =>
                  setCreateFormData((f) => ({ ...f, date: d as Date }))
                }
              />
            </div>

            {/* Amount */}
            <div>
              <Label htmlFor="new-amount" className="flex items-center">
                Сумма <span className="text-red-500 ml-1">*</span>
              </Label>
              {createErrors.amount && (
                <p className="text-xs text-red-500 mt-1">
                  {createErrors.amount}
                </p>
              )}
              <Input
                id="new-amount"
                type="number"
                value={createFormData.amount}
                onChange={(e) =>
                  setCreateFormData((f) => ({ ...f, amount: e.target.value }))
                }
              />
            </div>

            {/* Status */}
            <div className="col-span-1">
              <Label htmlFor="new-status">Статус*</Label>
              <Select
                value={createFormData.status ?? "all"}
                onValueChange={(v) =>
                  setCreateFormData((f) => ({
                    ...f,
                    status: v === "all" ? null : v,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">—</SelectItem>
                  {statuses.map((s) => (
                    <SelectItem key={s.id} value={s.id.toString()}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Type */}
            <div>
              <Label htmlFor="new-type" className="flex items-center">
                Тип <span className="text-red-500 ml-1">*</span>
              </Label>
              {createErrors.type && (
                <p className="text-xs text-red-500 mt-1">{createErrors.type}</p>
              )}
              <Select
                value={createFormData.type ?? "all"}
                onValueChange={(v) =>
                  setCreateFormData((f) => ({
                    ...f,
                    type: v === "all" ? null : v,
                    category: null,
                    sub_category: null,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тип" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">—</SelectItem>
                  {types.map((t) => (
                    <SelectItem key={t.id} value={t.id.toString()}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category (only those for selected Type) */}
            <div>
              <Label htmlFor="new-category" className="flex items-center">
                Категория <span className="text-red-500 ml-1">*</span>
              </Label>
              {createErrors.category && (
                <p className="text-xs text-red-500 mt-1">
                  {createErrors.category}
                </p>
              )}
              <Select
                value={createFormData.category ?? "all"}
                onValueChange={(v) =>
                  setCreateFormData((f) => ({
                    ...f,
                    category: v === "all" ? null : v,
                    sub_category: null,
                  }))
                }
                disabled={!createFormData.type}
              >
                <SelectTrigger>
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">—</SelectItem>
                  {createCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subcategory (only those for selected Category) */}
            <div>
              <Label htmlFor="new-subcategory" className="flex items-center">
                Подкатегория <span className="text-red-500 ml-1">*</span>
              </Label>
              {createErrors.sub_category && (
                <p className="text-xs text-red-500 mt-1">
                  {createErrors.sub_category}
                </p>
              )}
              <Select
                value={createFormData.sub_category ?? "all"}
                onValueChange={(v) =>
                  setCreateFormData((f) => ({
                    ...f,
                    sub_category: v === "all" ? null : v,
                  }))
                }
                disabled={!createFormData.category}
              >
                <SelectTrigger>
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">—</SelectItem>
                  {createSubcategories.map((s) => (
                    <SelectItem key={s.id} value={s.id.toString()}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Отмена
            </Button>
            <Button
              onClick={() => {
                // Сброс предыдущих ошибок
                setCreateErrors({});

                // Проверка обязательных полей
                let hasErrors = false;
                const newErrors: any = {};

                if (!createFormData.amount) {
                  newErrors.amount = "Поле обязательно для заполнения";
                  hasErrors = true;
                }

                if (!createFormData.type) {
                  newErrors.type = "Поле обязательно для заполнения";
                  hasErrors = true;
                }

                if (!createFormData.category) {
                  newErrors.category = "Поле обязательно для заполнения";
                  hasErrors = true;
                }

                if (!createFormData.sub_category) {
                  newErrors.sub_category = "Поле обязательно для заполнения";
                  hasErrors = true;
                }

                if (hasErrors) {
                  setCreateErrors(newErrors);
                  return;
                }

                // Отправка данных
                createMutation.mutate(
                  {
                    date: formatDateForAPI(createFormData.date!),
                    amount: createFormData.amount,
                    status: createFormData.status,
                    type: createFormData.type,
                    category: createFormData.category,
                    sub_category: createFormData.sub_category,
                  },
                  {
                    onSuccess: () => {
                      toast.success("Обращение успешно создано");
                      setIsCreateModalOpen(false);
                    },
                    onError: (error) => {
                      toast.error(
                        "Не удалось создать обращение. Пожалуйста, попробуйте еще раз."
                      );
                    },
                  }
                );
              }}
            >
              Создать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit CFS Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Редактировать обращение</DialogTitle>
          </DialogHeader>
          {editFormData && (
            <div className="grid grid-cols-2 gap-4 py-4">
              {/* Date */}
              <div>
                <Label>Дата</Label>
                <CalendarComponent
                  mode="single"
                  selected={editFormData.date || undefined}
                  onSelect={(d) =>
                    setEditFormData((f) => f && { ...f, date: d as Date })
                  }
                />
              </div>
              {/* Amount */}
              <div>
                <Label className="flex items-center">
                  Сумма <span className="text-red-500 ml-1">*</span>
                </Label>
                {editErrors.amount && (
                  <p className="text-xs text-red-500 mt-1">
                    {editErrors.amount}
                  </p>
                )}
                <Input
                  type="number"
                  value={editFormData.amount}
                  onChange={(e) =>
                    setEditFormData(
                      (f) =>
                        f && {
                          ...f,
                          amount: e.target.value,
                        }
                    )
                  }
                />
              </div>
              {/* Status */}
              <div>
                <Label htmlFor="edit-status">Статус</Label>
                <Select
                  value={editFormData.status ?? "all"}
                  onValueChange={(v) =>
                    setEditFormData(
                      (f) =>
                        f && {
                          ...f,
                          status: v,
                        }
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите статус" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">—</SelectItem>
                    {statuses.map((s) => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Type */}
              <div>
                <Label htmlFor="edit-type" className="flex items-center">
                  Тип <span className="text-red-500 ml-1">*</span>
                </Label>
                {editErrors.type && (
                  <p className="text-xs text-red-500 mt-1">{editErrors.type}</p>
                )}
                <Select
                  value={editFormData.type ?? "all"}
                  onValueChange={(v) =>
                    setEditFormData(
                      (f) =>
                        f && {
                          ...f,
                          type: v,
                        }
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тип" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">—</SelectItem>
                    {types.map((t) => (
                      <SelectItem key={t.id} value={t.id.toString()}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Category */}
              <div>
                <Label htmlFor="edit-category" className="flex items-center">
                  Категория <span className="text-red-500 ml-1">*</span>
                </Label>
                {editErrors.category && (
                  <p className="text-xs text-red-500 mt-1">
                    {editErrors.category}
                  </p>
                )}
                <Select
                  value={editFormData.category ?? "all"}
                  onValueChange={(v) =>
                    setEditFormData(
                      (f) =>
                        f && {
                          ...f,
                          category: v,
                        }
                    )
                  }
                  disabled={!editFormData.type}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">—</SelectItem>
                    {editCategories.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Subcategory */}
              <div>
                <Label htmlFor="edit-subcategory" className="flex items-center">
                  Подкатегория <span className="text-red-500 ml-1">*</span>
                </Label>
                {editErrors.sub_category && (
                  <p className="text-xs text-red-500 mt-1">
                    {editErrors.sub_category}
                  </p>
                )}
                <Select
                  value={editFormData.sub_category ?? "all"}
                  onValueChange={(v) =>
                    setEditFormData(
                      (f) =>
                        f && {
                          ...f,
                          sub_category: v,
                        }
                    )
                  }
                  disabled={!editFormData.category}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите подкатегорию" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">—</SelectItem>
                    {editSubcategories.map((s) => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Отмена
            </Button>
            <Button
              onClick={() => {
                if (!editFormData) return;

                // Сброс предыдущих ошибок
                setEditErrors({});

                // Проверка обязательных полей
                let hasErrors = false;
                const newErrors: any = {};

                if (!editFormData.amount) {
                  newErrors.amount = "Поле обязательно для заполнения";
                  hasErrors = true;
                }

                if (!editFormData.type) {
                  newErrors.type = "Поле обязательно для заполнения";
                  hasErrors = true;
                }

                if (!editFormData.category) {
                  newErrors.category = "Поле обязательно для заполнения";
                  hasErrors = true;
                }

                if (!editFormData.sub_category) {
                  newErrors.sub_category = "Поле обязательно для заполнения";
                  hasErrors = true;
                }

                if (hasErrors) {
                  setEditErrors(newErrors);
                  return;
                }

                // Отправка данных
                updateMutation.mutate(
                  {
                    id: editFormData.id,
                    data: {
                      date: formatDateForAPI(editFormData.date!),
                      amount: editFormData.amount,
                      status: editFormData.status,
                      type: editFormData.type,
                      category: editFormData.category,
                      sub_category: editFormData.sub_category,
                    },
                  },
                  {
                    onSuccess: () => {
                      toast.success("Обращение успешно обновлено");
                      setIsEditModalOpen(false);
                    },
                    onError: (error) => {
                      toast.error(
                        "Не удалось обновить обращение. Пожалуйста, попробуйте еще раз."
                      );
                    },
                  }
                );
              }}
            >
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CFSPage;
