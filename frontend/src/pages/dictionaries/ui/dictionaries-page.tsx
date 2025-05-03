import { useState } from "react";
import {
  ListTree,
  CheckCircle,
  FolderTree,
  Layers,
  Search,
} from "lucide-react";
import { Input } from "@/shared/ui/input";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function DirectoriesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const directories = [
    {
      id: 1,
      name: "Статусы",
      logo: <CheckCircle className="h-12 w-12 text-purple-600" />,
    },
    {
      id: 2,
      name: "Типы",
      logo: <Layers className="h-12 w-12 text-blue-600" />,
    },
    {
      id: 3,
      name: "Категории",
      logo: <FolderTree className="h-12 w-12 text-green-600" />,
    },
    {
      id: 4,
      name: "Суб категории",
      logo: <ListTree className="h-12 w-12 text-amber-600" />,
    },
  ];

  const filteredDirectories = directories.filter((dir) =>
    dir.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
          <span className="text-purple-700">Справочники</span>
        </h1>

        {/* Search bar */}
        <div className="relative max-w-md mx-auto mb-12">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Поиск справочников..."
            className="pl-10 border-gray-300 focus-visible:ring-purple-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Directory grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredDirectories.map((directory) => (
            <Link key={directory.id} to={`/dictionaries/${directory.id}`}>
              <DirectoryCard name={directory.name} logo={directory.logo} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function DirectoryCard({
  name,
  logo,
}: {
  name: string;
  logo: React.ReactNode;
}) {
  return (
    <motion.div
      className="relative overflow-hidden rounded-lg bg-white dark:bg-gray-900 shadow-md hover:shadow-lg transition-all duration-300 h-48 cursor-pointer border border-gray-200 hover:bg-purple-50"
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
        {/* Logo (static, no blur animation) */}
        <div className="mb-2">{logo}</div>

        {/* Text content */}
        <motion.div
          className="relative"
          initial={{ y: 0 }}
          whileHover={{ y: 10, transition: { duration: 0.3 } }}
        >
          <h3 className="text-xl font-medium px-4 py-2 bg-white rounded-md text-gray-800 border-b-2 border-purple-500">
            {name}
          </h3>
        </motion.div>
      </div>
    </motion.div>
  );
}
