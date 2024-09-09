'use client'

import React, { useState } from 'react'
import { useSettings } from '@/app/components/Settings'
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Textarea } from "@/app/components/ui/textarea"
import { Switch } from "@/app/components/ui/switch"
import { Button } from "@/app/components/ui/button"

export default function ProfilePage() {
  const { settings, updateSettings } = useSettings()
  const [name, setName] = useState(settings.name)
  const [email, setEmail] = useState('')
  const [bio, setBio] = useState('')
  const [phone, setPhone] = useState('')
  const [github, setGithub] = useState('')
  const [linkedin, setLinkedin] = useState('')

  const handleSave = () => {
    updateSettings({ name })
    // Here you would typically send the data to a backend API
    console.log('Profile updated:', { name, email, bio, phone, github, linkedin })
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        updateSettings({ profilePicture: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Profile</h1>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Avatar className="w-24 h-24">
            <AvatarImage src={settings.profilePicture} alt="Profile picture" />
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
          </Avatar>
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full sm:w-auto"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about yourself"
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter your phone number"
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="github" className="text-sm font-medium">GitHub</Label>
          <Input
            id="github"
            value={github}
            onChange={(e) => setGithub(e.target.value)}
            placeholder="Enter your GitHub profile URL"
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="linkedin" className="text-sm font-medium">LinkedIn</Label>
          <Input
            id="linkedin"
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
            placeholder="Enter your LinkedIn profile URL"
            className="w-full"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="theme-toggle"
            checked={settings.theme === 'dark'}
            onCheckedChange={(checked) => updateSettings({ theme: checked ? 'dark' : 'light' })}
          />
          <Label htmlFor="theme-toggle" className="text-sm font-medium">Dark Mode</Label>
        </div>
        <Button onClick={handleSave} className="w-full sm:w-auto">Save Changes</Button>
      </div>
    </div>
  )
}