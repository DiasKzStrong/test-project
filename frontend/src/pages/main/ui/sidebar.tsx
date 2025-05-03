import {
  FileText,
  Layers,
  Search,
  ChevronLeft,
  User,
  Database,
} from "lucide-react";
import { ThemeToggle } from "@/shared/ui/theme-toggle";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "@/lib/utils";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Progress } from "@/shared/ui/progress";
import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  active: boolean;
}

export function Sidebar() {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(true);

  const [navItems, setNavItems] = useState<NavItem[]>([
    { icon: Layers, label: "ДДС", path: "/cfs", active: false },
    {
      icon: FileText,
      label: "Cправочники",
      path: "/dictionaries",
      active: false,
    },
  ]);

  useEffect(() => {
    const updatedNavItems = navItems.map((item) => ({
      ...item,
      active: location.pathname.includes(item.path),
    }));
    setNavItems(updatedNavItems);
  }, [location.pathname]);

  return (
    <motion.div
      className={cn(
        "flex h-screen flex-col border-r bg-white dark:bg-gray-950 dark:border-gray-800"
      )}
      animate={{
        width: expanded ? "280px" : "72px",
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
    >
      <div className="flex items-center justify-between p-4">
        <AnimatePresence mode="wait">
          {expanded ? (
            <motion.div
              className="flex items-center gap-2"
              key="expanded-logo"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Database className="h-6 w-6 text-violet-600 dark:text-violet-400" />
              <motion.span
                className="font-semibold text-lg text-violet-600 dark:text-violet-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                ДДС
              </motion.span>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed-logo"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setExpanded(!expanded)}
                className="h-8 w-8 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <motion.div
                  animate={{ rotate: expanded ? 0 : 180 }}
                  transition={{ duration: 0.3, type: "spring" }}
                >
                  <ChevronLeft size={16} />
                </motion.div>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex items-center gap-2">
          {expanded && (
            <>
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setExpanded(!expanded)}
                className="h-8 w-8 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <motion.div
                  animate={{ rotate: expanded ? 0 : 180 }}
                  transition={{ duration: 0.3, type: "spring" }}
                >
                  <ChevronLeft size={16} />
                </motion.div>
              </Button>
            </>
          )}
        </div>
      </div>

      {!expanded && (
        <div className="px-3 flex flex-col gap-4 items-center justify-center">
          <div className="flex items-center justify-center">
            <Database className="h-6 w-6 text-violet-600 dark:text-violet-400" />
          </div>
          <div className="flex items-center justify-center">
            <ThemeToggle />
          </div>
        </div>
      )}

      <AnimatePresence>
        {expanded ? (
          <motion.div
            className="px-4 mb-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search"
                className="pl-9 h-9 bg-gray-50 border-gray-100 dark:bg-gray-900 dark:border-gray-800"
              />
              <div className="absolute right-2.5 top-2.5 text-xs text-gray-400">
                /
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="px-3 py-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="w-full h-10 rounded-full bg-gray-50 dark:bg-gray-900"
            >
              <Search className="h-4 w-4 text-gray-500" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col flex-1 overflow-y-auto">
        <AnimatePresence>
          {expanded && (
            <motion.div
              className="px-4 py-2 text-xs font-medium text-gray-500"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              NAVIGATION
            </motion.div>
          )}
        </AnimatePresence>
        <div className="space-y-1 px-3">
          {navItems.map((item, i) => (
            <div
              key={i}
              className="relative"
              onMouseEnter={() => !expanded && setHoveredItem(i)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Button
                variant={item.active ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  item.active
                    ? "bg-violet-100 text-violet-600 hover:bg-violet-200 dark:bg-violet-900/30 dark:text-violet-400 dark:hover:bg-violet-900/40"
                    : "",
                  !expanded ? "px-0 justify-center" : ""
                )}
                asChild
              >
                <Link to={item.path}>
                  <item.icon
                    className={cn(
                      "h-5 w-5",
                      item.active && !expanded
                        ? "text-violet-600 dark:text-violet-400"
                        : "text-gray-500"
                    )}
                  />
                  <AnimatePresence>
                    {expanded && (
                      <motion.span
                        className="ml-2"
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </Button>
              <AnimatePresence>
                {!expanded && hoveredItem === i && (
                  <motion.div
                    className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 bg-white dark:bg-gray-800 shadow-md rounded-md px-3 py-2 whitespace-nowrap"
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -5 }}
                    transition={{ duration: 0.15 }}
                  >
                    {item.label}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        <div className="mt-auto px-3 pb-4 pt-2">
          <motion.div
            className={cn(
              "rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 text-white",
              !expanded ? "mx-auto flex items-center justify-center" : ""
            )}
            animate={{
              padding: expanded ? "16px" : "0px",
              width: expanded ? "auto" : "40px",
              height: expanded ? "auto" : "40px",
              borderRadius: expanded ? "12px" : "9999px",
            }}
            transition={{
              duration: 0.3,
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
          >
            <AnimatePresence mode="wait">
              {expanded ? (
                <motion.div
                  key="expanded-promo"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-center mb-2">
                    <NolitoIcon white />
                  </div>
                  <div className="text-center mb-1">
                    Супер-пупер разработчик
                  </div>
                  <div className="text-xs text-center text-white/80 mb-2">
                    Возьмите меня на работу, пожалуйста! 🙏
                  </div>
                  <Progress value={99} className="h-1.5 mb-4 bg-white/20" />
                  <Button
                    variant="outline"
                    className="w-full bg-white text-purple-600 hover:bg-white/90 border-0"
                  >
                    Я очень хороший
                  </Button>
                  <Button className="w-full mt-2 bg-black hover:bg-black/90 text-white">
                    Нанять сейчас
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="ml-1"
                    >
                      <path
                        d="M9 6L15 12L9 18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="collapsed-promo"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <NolitoIcon white />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        <div className="border-t px-3 py-3 flex items-center justify-between dark:border-gray-800">
          <Button
            variant="ghost"
            className={cn(
              "flex items-center gap-2",
              !expanded && "justify-center w-full"
            )}
          >
            <User className="h-5 w-5 text-gray-500" />
            <AnimatePresence>
              {expanded && (
                <motion.div
                  className="text-left"
                  initial={{ opacity: 0, width: 0, x: -10 }}
                  animate={{ opacity: 1, width: "auto", x: 0 }}
                  exit={{ opacity: 0, width: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-sm font-medium">User Name</div>
                  <div className="text-xs text-gray-500">user@example.com</div>
                </motion.div>
              )}
            </AnimatePresence>
          </Button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setExpanded(!expanded)}
                  className="rounded-full"
                >
                  <ChevronLeft className="h-[1.2rem] w-[1.2rem]" />
                  <span className="sr-only">Toggle sidebar</span>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function NolitoIcon({ white }: { white?: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M19.5 12L14.5 7V10H7.5V14H14.5V17L19.5 12Z"
        fill={white ? "white" : "#8B5CF6"}
      />
      <path
        d="M4.5 12L9.5 17V14H16.5V10H9.5V7L4.5 12Z"
        fill={white ? "white" : "#8B5CF6"}
      />
    </svg>
  );
}
