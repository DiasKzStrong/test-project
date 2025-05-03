import { ColumnDef } from "@tanstack/react-table";

// Define interfaces for each dictionary type
interface StatusItem {
  id: string;
  name: string;
}

interface TypeItem {
  id: string;
  name: string;
}

interface CategoryItem {
  id: string;
  name: string;
  cfs_type: TypeItem;
}

interface SubcategoryItem {
  id: string;
  name: string;
  cfs_category: CategoryItem;
}

// Status columns - only name
export const statusColumns: ColumnDef<StatusItem>[] = [
  {
    accessorKey: "name",
    header: "Название",
  },
];

// Type columns - only name
export const typeColumns: ColumnDef<TypeItem>[] = [
  {
    accessorKey: "name",
    header: "Название",
  },
];

// Category columns - name and type name
export const categoryColumns: ColumnDef<CategoryItem>[] = [
  {
    accessorKey: "name",
    header: "Название",
  },
  {
    accessorKey: "cfs_type",
    header: "Тип",
    cell: ({ row }) => {
      const type = row.original.cfs_type;
      return type ? type.name : "Без типа";
    },
  },
];

// Subcategory columns - name and category name
export const subcategoryColumns: ColumnDef<SubcategoryItem>[] = [
  {
    accessorKey: "name",
    header: "Название",
  },
  {
    accessorKey: "cfs_category",
    header: "Категория",
    cell: ({ row }) => {
      const category = row.original.cfs_category;
      return category ? category.name : "Без категории";
    },
  },
];

// Helper function to get the appropriate columns based on dictionary ID
export const getColumnsForDictionary = (id: string) => {
  switch (id) {
    case "1":
      return statusColumns;
    case "2":
      return typeColumns;
    case "3":
      return categoryColumns;
    case "4":
      return subcategoryColumns;
    default:
      return [];
  }
};
