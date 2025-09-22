"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { ArrowLeft, AlertCircle, Save } from "lucide-react"
import { useRouter } from "next/navigation"

interface Faculty {
  id: string
  full_name: string
  email: string
}

export default function UnavailablePage() {
  const [user, setUser] = useState<any>(null)
  const [unavailableFrom, setUnavailableFrom] = useState("")
  const [unavailableTo, setUnavailableTo] = useState("")
  const [reason, setReason] = useState("")
  const [substituteFaculty, setSubstituteFaculty] = useState("")
  const [facultyList, setFacultyList] = useState<Faculty[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUser()
    fetchFacultyList()
  }, [])

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      router.push("/auth/login")
      return
    }

    const { data: userData } = await supabase.from("users").select("role, full_name").eq("id", user.id).single()
    if (!userData || userData.role !== "faculty") {
      router.push("/auth/login")
      return
    }

    setUser({ ...user, ...userData })
  }

  const fetchFacultyList = async () => {
    const { data } = await supabase
      .from("users")
      .select("id, full_name, email")
      .eq("role", "faculty")
      .order("full_name")

    setFacultyList(data || [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !unavailableFrom || !unavailableTo || !reason) return

    setIsSaving(true)
    try {
      const { error } = await supabase.from("faculty_availability").insert({
        faculty_id: user.id,
        unavailable_from: unavailableFrom,
        unavailable_to: unavailableTo,
        reason: reason,
        substitute_faculty_id: substituteFaculty || null,
      })

      if (error) throw error

      alert("Unavailability reported successfully! Admin will be notified.")
      router.push("/faculty")
    } catch (error) {
      console.error("Error reporting unavailability:", error)
      alert("Error reporting unavailability. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  if (!user) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/faculty" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Report Unavailability
            </CardTitle>
            <CardDescription>
              Notify administration about your absence and suggest a substitute if available
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="from">Unavailable From</Label>
                  <Input
                    id="from"
                    type="datetime-local"
                    value={unavailableFrom}
                    onChange={(e) => setUnavailableFrom(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="to">Unavailable To</Label>
                  <Input
                    id="to"
                    type="datetime-local"
                    value={unavailableTo}
                    onChange={(e) => setUnavailableTo(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Absence</Label>
                <Textarea
                  id="reason"
                  placeholder="Please provide the reason for your unavailability..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="substitute">Suggested Substitute Faculty (Optional)</Label>
                <Select value={substituteFaculty} onValueChange={setSubstituteFaculty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a substitute faculty member" />
                  </SelectTrigger>
                  <SelectContent>
                    {facultyList
                      .filter((faculty) => faculty.id !== user.id)
                      .map((faculty) => (
                        <SelectItem key={faculty.id} value={faculty.id}>
                          {faculty.full_name} ({faculty.email})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-orange-900">Important Notes</h4>
                    <ul className="text-sm text-orange-800 mt-2 space-y-1">
                      <li>• Please report unavailability as early as possible</li>
                      <li>• Admin will be notified immediately</li>
                      <li>• If you suggest a substitute, they will be contacted</li>
                      <li>• You can transfer your attendance marking rights to the substitute</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Reporting..." : "Report Unavailability"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
