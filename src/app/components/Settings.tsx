'use client'

import React, { useState, useEffect, createContext, useContext, useCallback, useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { Switch } from "./ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Button } from "./ui/button"
import { Moon, Sun } from 'lucide-react'

type Settings = {
  theme: 'light' | 'dark'
  notificationsEnabled: boolean
  reminderTime: string
  taskSorting: 'priority' | 'dueDate' | 'category'
  apiKey: string
  name: string
  profilePicture: string
  language: string
}

const defaultSettings: Settings = {
  theme: 'dark',
  notificationsEnabled: true,
  reminderTime: '09:00',
  taskSorting: 'priority',
  apiKey: '',
  name: '',
  profilePicture: '',
  language: 'en'
}

type SettingsContextType = {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  updateSettings: () => {},
})

export const useSettings = () => useContext(SettingsContext)

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings)

  useEffect(() => {
    const savedSettings = localStorage.getItem('settings')
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  const updateSettings = useCallback((newSettings: Partial<Settings>) => {
    setSettings(prevSettings => {
      const updatedSettings = { ...prevSettings, ...newSettings }
      localStorage.setItem('settings', JSON.stringify(updatedSettings))
      return updatedSettings
    })
  }, [])

  const contextValue = useMemo(() => ({ settings, updateSettings }), [settings, updateSettings])

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  )
}

export default function Settings() {
  const { settings, updateSettings } = useSettings()
  const [tempSettings, setTempSettings] = useState(settings)

  useEffect(() => {
    setTempSettings(settings)
  }, [settings])

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setTempSettings(prev => ({ ...prev, profilePicture: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const handleSave = useCallback(() => {
    updateSettings(tempSettings)
  }, [tempSettings, updateSettings])

  const handleThemeChange = useCallback((checked: boolean) => {
    setTempSettings(prev => ({ ...prev, theme: checked ? 'dark' : 'light' }))
  }, [])

  const handleNotificationsChange = useCallback((checked: boolean) => {
    setTempSettings(prev => ({ ...prev, notificationsEnabled: checked }))
  }, [])

  const handleReminderTimeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTempSettings(prev => ({ ...prev, reminderTime: e.target.value }))
  }, [])

  const handleTaskSortingChange = useCallback((value: 'priority' | 'dueDate' | 'category') => {
    setTempSettings(prev => ({ ...prev, taskSorting: value }))
  }, [])

  const handleApiKeyChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTempSettings(prev => ({ ...prev, apiKey: e.target.value }))
  }, [])

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTempSettings(prev => ({ ...prev, name: e.target.value }))
  }, [])

  const handleLanguageChange = useCallback((value: string) => {
    setTempSettings(prev => ({ ...prev, language: value }))
  }, [])

  return (
    <Tabs defaultValue="theme">
      <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
        <TabsTrigger value="theme">Theme</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="taskSorting">Task Sorting</TabsTrigger>
        <TabsTrigger value="apiKey">API Key</TabsTrigger>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="language">Language</TabsTrigger>
      </TabsList>
      <TabsContent value="theme" className="mt-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="theme-toggle">Theme</Label>
          <div className="flex items-center space-x-2">
            <Sun className="h-4 w-4" />
            <Switch
              id="theme-toggle"
              checked={tempSettings.theme === 'dark'}
              onCheckedChange={handleThemeChange}
            />
            <Moon className="h-4 w-4" />
          </div>
        </div>
      </TabsContent>
      <TabsContent value="notifications" className="mt-4 space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="notifications-toggle"
            checked={tempSettings.notificationsEnabled}
            onCheckedChange={handleNotificationsChange}
          />
          <Label htmlFor="notifications-toggle">Enable Notifications</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="reminder-time">Reminder Time</Label>
          <Input
            id="reminder-time"
            type="time"
            value={tempSettings.reminderTime}
            onChange={handleReminderTimeChange}
          />
        </div>
      </TabsContent>
      <TabsContent value="taskSorting" className="mt-4">
        <Label htmlFor="task-sorting">Sort Tasks By</Label>
        <Select
          value={tempSettings.taskSorting}
          onValueChange={handleTaskSortingChange}
        >
          <SelectTrigger id="task-sorting">
            <SelectValue placeholder="Select task sorting" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="priority">Priority</SelectItem>
            <SelectItem value="dueDate">Due Date</SelectItem>
            <SelectItem value="category">Category</SelectItem>
          </SelectContent>
        </Select>
      </TabsContent>
      <TabsContent value="apiKey" className="mt-4">
        <Label htmlFor="api-key">API Key</Label>
        <Input
          id="api-key"
          type="password"
          value={tempSettings.apiKey}
          onChange={handleApiKeyChange}
          placeholder="Enter your API key"
        />
      </TabsContent>
      <TabsContent value="profile" className="mt-4 space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={tempSettings.name}
            onChange={handleNameChange}
            placeholder="Enter your name"
          />
        </div>
        <div>
          <Label htmlFor="profile-picture">Profile Picture</Label>
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={tempSettings.profilePicture} alt="Profile picture" />
              <AvatarFallback>{tempSettings.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <Input
              id="profile-picture"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
        </div>
      </TabsContent>
      <TabsContent value="language" className="mt-4">
        <Label htmlFor="language-select">Language</Label>
        <Select
          value={tempSettings.language}
          onValueChange={handleLanguageChange}
        >
          <SelectTrigger id="language-select">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="es">Español</SelectItem>
            <SelectItem value="fr">Français</SelectItem>
            <SelectItem value="de">Deutsch</SelectItem>
            <SelectItem value="ja">日本語</SelectItem>
          </SelectContent>
        </Select>
      </TabsContent>
      <div className="mt-6">
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </Tabs>
  )
}