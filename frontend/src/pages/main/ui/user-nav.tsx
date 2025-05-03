import { CreditCard, LogOut, Settings, User } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

export function UserNav() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-full justify-start gap-3 rounded-full px-2 hover:bg-rose-100 dark:hover:bg-slate-700"
        >
          <Avatar className="h-10 w-10 border-2 border-rose-200 dark:border-rose-800">
            <AvatarImage
              src="/placeholder.svg?height=40&width=40"
              alt="@user"
            />
            <AvatarFallback className="bg-rose-100 text-rose-600 dark:bg-rose-900 dark:text-rose-200">
              U
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start">
            <span className="font-medium text-slate-800 dark:text-white">
              User Name
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              user@example.com
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">User Name</p>
            <p className="text-xs leading-none text-muted-foreground">
              user@example.com
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <User className="mr-2 h-5 w-5 text-rose-500" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard className="mr-2 h-5 w-5 text-sky-500" />
            <span>Billing</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-5 w-5 text-violet-500" />
            <span>Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <LogOut className="mr-2 h-5 w-5 text-amber-500" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
