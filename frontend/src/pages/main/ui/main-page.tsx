import { Sidebar } from "@/pages/main/ui/sidebar";
import { Outlet } from "react-router-dom";

export default function MainPage() {
  return (
    <div className="flex h-screen w-screen">
      <Sidebar />
      <div className="flex flex-col w-full p-4">
        <Outlet />
      </div>
    </div>
  );
}
