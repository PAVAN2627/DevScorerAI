"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Zap,
  LayoutDashboard,
  FileText,
  Linkedin,
  Github,
  History,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  Sun,
  Moon,
  Monitor
} from "lucide-react"
import { useTheme } from "next-themes"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard
  },
  {
    title: "Resume Analyzer",
    href: "/dashboard/resume",
    icon: FileText
  },
  {
    title: "LinkedIn Analyzer",
    href: "/dashboard/linkedin",
    icon: Linkedin
  },
  {
    title: "GitHub Analyzer",
    href: "/dashboard/github",
    icon: Github
  },
  {
    title: "History",
    href: "/dashboard/history",
    icon: History
  },
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: User
  }
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const supabase = createClient()
      if (supabase) {
        await supabase.auth.signOut()
      }
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
      // Fallback redirect even if Supabase fails
      router.push("/")
    }
  }

  const ThemeIcon = () => {
    if (!mounted) return <Sun className="h-5 w-5" />
    if (resolvedTheme === "dark") return <Moon className="h-5 w-5" />
    return <Sun className="h-5 w-5" />
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-card border border-border shadow-lg"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        <Menu className="h-5 w-5 text-foreground" />
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden animate-fade-blur"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-out",
          isCollapsed ? "w-20" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className={cn(
            "flex h-16 items-center border-b border-sidebar-border px-4",
            isCollapsed ? "justify-center" : "justify-between"
          )}>
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary glow-primary transition-transform duration-300 group-hover:scale-110">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              {!isCollapsed && (
                <span className="text-lg font-bold text-sidebar-foreground">
                  DevScorer<span className="text-primary">AI</span>
                </span>
              )}
            </Link>
            
            {/* Collapse button - desktop only */}
            <button
              className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg hover:bg-sidebar-accent transition-all duration-200 hover:scale-105"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4 text-sidebar-foreground" />
              ) : (
                <ChevronLeft className="h-4 w-4 text-sidebar-foreground" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {navItems.map((item, index) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.href} style={{ animationDelay: `${index * 50}ms` }}>
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:translate-x-1",
                        isCollapsed && "justify-center px-2"
                      )}
                    >
                      <item.icon className={cn("h-5 w-5 flex-shrink-0 transition-transform duration-200", isActive && "scale-110")} />
                      {!isCollapsed && <span>{item.title}</span>}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Theme Toggle & Logout */}
          <div className="border-t border-sidebar-border p-4 space-y-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200",
                    isCollapsed ? "px-2" : "justify-start"
                  )}
                >
                  <ThemeIcon />
                  {!isCollapsed && (
                    <span className="ml-3">
                      {mounted ? (resolvedTheme === "dark" ? "Dark Mode" : "Light Mode") : "Theme"}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => setTheme("light")} className="gap-2">
                  <Sun className="h-4 w-4" />
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")} className="gap-2">
                  <Moon className="h-4 w-4" />
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")} className="gap-2">
                  <Monitor className="h-4 w-4" />
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className={cn(
                "w-full text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200",
                isCollapsed ? "px-2" : "justify-start"
              )}
            >
              <LogOut className="h-5 w-5" />
              {!isCollapsed && <span className="ml-3">{isLoggingOut ? "Logging out..." : "Logout"}</span>}
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
