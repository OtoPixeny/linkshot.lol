import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { useUser } from "@clerk/clerk-react";
import Logo from "./Logo";
import { CornerRightDown, User, LogOut, Settings, Moon, Sun, Trophy } from "lucide-react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const { isSignedIn, user, isLoaded } = useUser();
  const { setTheme, resolvedTheme } = useTheme();
  
  const DownIcon = () => (
    <svg fill="#000000" width="16px" height="16px" viewBox="0 -6 524 524" xmlns="http://www.w3.org/2000/svg">
      <title>down</title>
      <path d="M64 191L98 157 262 320 426 157 460 191 262 387 64 191Z" />
    </svg>
  );
  
  return (
    <header className="flex justify-between items-center py-5 px-6 sm:px-8 md:px-20 lg:px-24">
      <div>
        <Logo />
      </div>
      <div className="flex gap-2 items-center">
        {isSignedIn ? (
          <>
            <Button asChild size="sm">
              <Link
                to="/dashboard/manage"
                className="gap-2"
              >
                Dashboard
                <CornerRightDown className="!h-4 !w-4" />
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                  {user?.imageUrl ? (
                    <img
                      src={user.imageUrl}
                      alt="User avatar"
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.firstName && user?.lastName 
                        ? `${user.firstName} ${user.lastName}` 
                        : user?.firstName || 'User'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.emailAddresses?.[0]?.emailAddress}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/user-profile/profile" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Profile Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/auth/sign-out" className="flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    Log out
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <Button asChild size="sm">
            <Link
              to="/auth/sign-in"
              className="gap-2"
            >
              Get Started
              <CornerRightDown className="!h-4 !w-4" />
            </Link>
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              სხვა
              <DownIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")} className="flex items-center gap-2 cursor-pointer">
              {resolvedTheme === "light" ? (
                <>
                  <Moon className="h-4 w-4" />
                  მუქე თემა
                </>
              ) : (
                <>
                  <Sun className="h-4 w-4" />
                  ნათელი თემა
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/top3" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                ტოპ 3
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
