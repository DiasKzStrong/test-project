import { createBrowserRouter } from "react-router-dom";
import MainPage from "@/pages/main/ui/main-page";
import DictionaryPage from "@/pages/dictionaries/ui/dictionary-page";
import DirectoriesPage from "@/pages/dictionaries/ui/dictionaries-page";
import CFSPage from "@/pages/cfs/ui/cfs-page";
const router = createBrowserRouter([
  {
    path: "/",
    element: <MainPage />,
    children: [
      {
        path: "/cfs",
        element: <CFSPage />,
      },
      {
        path: "/dictionaries",
        element: <DirectoriesPage />,
      },
      {
        path: "/dictionaries/:id",
        element: <DictionaryPage />,
      },
    ],
  },
]);

export default router;
