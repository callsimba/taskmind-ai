'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useSettings } from './Settings'
import { Home, List, Settings, Menu, X } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const { settings } = useSettings()

  const toggleSidebar = () => setIsOpen(!isOpen)

  return (
    <>
      <button
        className="md:hidden fixed top-4 left-4 z-20 p-2 bg-gray-800 rounded-md"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      <aside
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed md:static inset-y-0 left-0 z-10 w-64 transition-transform duration-300 ease-in-out bg-gray-800 p-4 overflow-y-auto`}
      >
        <nav className="space-y-6">
          <Link href="/profile" className="flex items-center space-x-2">
            <Avatar>
              <AvatarImage src={settings.profilePicture} alt="Profile" />
              <AvatarFallback>{settings.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-xl font-bold">{settings.name}</span>
          </Link>
          <Link href="/" className="flex items-center space-x-2 text-xl">
            <Home size={24} />
            <span>Home</span>
          </Link>
          <Link href="/tasks" className="flex items-center space-x-2 text-xl">
            <List size={24} />
            <span>Tasks</span>
          </Link>
          <Link href="/settings" className="flex items-center space-x-2 text-xl">
            <Settings size={24} />
            <span>Settings</span>
          </Link>
        </nav>
      </aside>
    </>
  )
}