import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import Logo from "./Logo";
import { CornerRightDown, Trophy, Moon, Sun, LayoutDashboard, User } from "lucide-react";
import { useTheme } from "next-themes";
import { useUser } from "@clerk/clerk-react";
import { UserButton } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import UserModel from "@/models/user";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const { isSignedIn, user } = useUser();
  const location = useLocation();
  const isTop3Page = location.pathname === '/top3';
  const { setTheme, resolvedTheme } = useTheme();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  useEffect(() => {
    const loadUserData = async () => {
      if (user?.id && !username) {
        try {
          const userData = await UserModel.getByUserId(user.id);
          if (userData) {
            setUsername(userData.username);
          }
        } catch (error) {
          console.error("Error loading user data:", error);
        }
      }
    };

    loadUserData();
  }, [user, username]);

  const DownIcon = () => (
    <svg fill="currentColor" width="16px" height="16px" viewBox="0 -6 524 524" xmlns="http://www.w3.org/2000/svg">
      <title>down</title>
      <path d="M64 191L98 157 262 320 426 157 460 191 262 387 64 191Z" />
    </svg>
  );

  return (
    <header className={`navigation flex justify-between items-center py-5 px-6 sm:px-8 md:px-20 lg:px-24 ${isTop3Page ? 'bg-transparent' : ''
      }`}>
      <div>
        <Logo />
      </div>
      <div className="flex gap-2 items-center">
        <button className="subscribe-button">
          გამოწერა
        </button>
        {isSignedIn ? (
          <>
            <Button asChild size="sm">
              <Link
                to="/dashboard/manage"
                className="hero-btn gap-2"
              >
                მართვა
                <CornerRightDown className="!h-4 !w-4" />
              </Link>
            </Button>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: " !h-8 !w-8 ",
                  userButtonTrigger: "p-0",
                }
              }}
              afterSignOutUrl="/"
            ><UserButton.MenuItems>
                <UserButton.Action
                  label="დეშბორდი"
                  labelIcon={<LayoutDashboard className="h-4 w-4" />}
                  onClick={() => navigate('/dashboard')}
                />
                <UserButton.Action
                  label="ჩემი ფეიჯი"
                  labelIcon={<User className="h-4 w-4" />}
                  onClick={() => {
                    if (username) {
                      navigate(`/${username}`);
                    }
                  }}
                />
              </UserButton.MenuItems>
            </UserButton>

          </>
        ) : (
          <Button asChild size="sm">
            <Link
              to="/auth/sign-in"
              className="hero-btn gap-2"
            >
              დაიწყე
              <CornerRightDown className="!h-4 !w-4" />
            </Link>
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 rounded-[9999px]">
              სხვა
              <DownIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")} className="min-nav flex items-center gap-2 cursor-pointer">
              {resolvedTheme === "light" ? (
                <>
                  <Moon className="h-4 w-4" />
                  ბნელი თემა
                </>
              ) : (
                <>
                  <Sun className="h-4 w-4" />
                  ღია თემა
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/top3" className="min-nav flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                ლიდერბორდი
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
