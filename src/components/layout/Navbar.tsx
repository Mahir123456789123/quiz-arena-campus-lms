import { Link, useNavigate } from "react-router-dom";
import { Bell, Book, Search, User, LogOut, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/hooks/useTheme";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const scrollToHero = () => {
    const heroElement = document.getElementById('hero');
    if (heroElement) {
      heroElement.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Successfully logged out");
      navigate("/");
    } catch (error: any) {
      toast.error(`Error logging out: ${error.message}`);
    }
  };

  const handlePadhleBhaiClick = (e) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/#hero');
    } else {
      scrollToHero();
    }
  };

  return (
    <header className="bg-card sticky top-0 z-50 shadow-sm border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
        <a
  href="#hero"
  onClick={handlePadhleBhaiClick}
  className="flex items-center gap-2"
>
  <Book className="h-6 w-6 text-edu-primary" />
  <span className="text-xl font-bold text-foreground">PadhleBhai</span>
</a>

        </div>

        <div className="hidden md:flex items-center space-x-6">
          <Link to="/dashboard" className="text-foreground/80 hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <Link to="/courses" className="text-foreground/80 hover:text-foreground transition-colors">
            Courses
          </Link>
          <Link to="/content-hub" className="text-foreground/80 hover:text-foreground transition-colors">
            Content Hub
          </Link>
          <Link to="/quizzes" className="text-foreground/80 hover:text-foreground transition-colors">
            Quizzes
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="hidden md:flex">
            <div className="relative">
              <Input
                type="search"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[200px] pl-8"
              />
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </form>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-foreground/70 hover:text-foreground"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <Link to="/notifications">
            <Button variant="ghost" size="icon" className="text-foreground/70 hover:text-foreground">
              <Bell className="h-5 w-5" />
            </Button>
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link to="/profile" className="w-full">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link to="/settings" className="w-full">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <span className="flex items-center">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/dashboard">
              <Button variant="default">Get Started</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
