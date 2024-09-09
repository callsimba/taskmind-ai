'use client'

import './globals.css'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { LayoutDashboard, CheckSquare, Calendar, Settings as SettingsIcon, Menu, X, User } from 'lucide-react'
import { useState, useEffect } from 'react'
import { SettingsProvider, useSettings } from '@/app/components/Settings'
import { ThemeProvider, useTheme } from '@/app/components/ThemeProvider'
import { TaskManagerProvider } from '@/app/components/TaskManager'
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar"
import { Button } from "@/app/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu"

const inter = Inter({ subsets: ['latin'] })

function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { settings } = useSettings()
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  const NavLink = ({ href, icon: Icon, children }: { href: string; icon: React.ElementType; children: React.ReactNode }) => (
    <Link 
      href={href} 
      className="flex items-center space-x-2 p-2 rounded hover:bg-gray-700 transition-colors duration-200"
      onClick={() => setIsSidebarOpen(false)}
    >
      <Icon size={20} aria-hidden="true" />
      <span>{children}</span>
    </Link>
  )

  const SidebarContent = () => (
    <>
      <div className="flex items-center space-x-2 mb-8">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="p-0">
              <Avatar>
                <AvatarImage src={settings.profilePicture} alt={`${settings.name}'s profile`} />
                <AvatarFallback>{settings.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="sr-only">Open user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-popover text-popover-foreground" align="start" forceMount>
            <DropdownMenuItem asChild>
              <Link href="/profile">View Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={toggleTheme}>
              Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <span className="text-xl font-bold">{settings.name}</span>
      </div>
      <nav className="space-y-2">
        <NavLink href="/" icon={LayoutDashboard}>Dashboard</NavLink>
        <NavLink href="/tasks" icon={CheckSquare}>Tasks</NavLink>
        <NavLink href="/calendar" icon={Calendar}>Calendar</NavLink>
        <NavLink href="/profile" icon={User}>Profile</NavLink>
        <NavLink href="/settings" icon={SettingsIcon}>Settings</NavLink>
      </nav>
    </>
  )

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen">
      <div className={`flex min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-white transition-colors duration-200 ${theme}`}>
        {/* Sidebar for larger screens */}
        <aside className="hidden lg:flex flex-col w-64 bg-gray-100 dark:bg-gray-800 p-4 transition-colors duration-200 overflow-y-auto">
          <SidebarContent />
        </aside>

        {/* Mobile and tablet sidebar */}
        <div className={`fixed inset-0 z-50 lg:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}>
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75" onClick={toggleSidebar} aria-hidden="true"></div>
          <aside className="fixed top-0 left-0 bottom-0 flex flex-col w-64 max-w-sm bg-gray-100 dark:bg-gray-800 p-4 transition-colors duration-200 overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold">AI Todo List</h1>
              <button 
                onClick={toggleSidebar} 
                className="text-gray-900 dark:text-white p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                aria-label="Close menu"
              >
                <X size={24} aria-hidden="true" />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </div>

        {/* Main content */}
        <main className="flex-1 flex flex-col min-h-screen">
          {/* Mobile and tablet header */}
          <header className="lg:hidden bg-white dark:bg-gray-800 p-4 flex justify-between items-center border-b dark:border-gray-700 transition-colors duration-200">
            <h1 className="text-xl font-bold">AI Todo List</h1>
            <button 
              onClick={toggleSidebar} 
              className="text-gray-900 dark:text-white p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
              aria-label="Open menu"
            >
              <Menu size={24} aria-hidden="true" />
            </button>
          </header>

          {/* Content area */}
          <div className="flex-1 p-4 lg:p-8 overflow-auto bg-white dark:bg-gray-900 transition-colors duration-200">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('Uncaught error:', error)
      setHasError(true)
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Oops! Something went wrong.</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">We are sorry, but an error occurred while rendering the page.</p>
          <button
            className="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }

  return children
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('/service-worker.js').then(
          function(registration) {
            console.log('Service Worker registration successful with scope: ', registration.scope);
          },
          function(err) {
            console.log('Service Worker registration failed: ', err);
          }
        );
      });
    }
  }, []);

  return (
    <html lang="en" className={`h-full ${inter.className}`}>
      <body className="h-full">
        <ErrorBoundary>
          <SettingsProvider>
            <ThemeProvider>
              <TaskManagerProvider>
                <Layout>{children}</Layout>
              </TaskManagerProvider>
            </ThemeProvider>
          </SettingsProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}