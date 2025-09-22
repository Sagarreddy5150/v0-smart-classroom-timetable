"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, RefreshCw, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"

interface Faculty {
  id: string
  full_name: string
  email: string
  department: string
}

interface ReschedulingResult {
  originalSlot: any
  substitute: any
  status: string
  error?: string
}

export default function ReschedulePage() {
  const [user, setUser] = useState<any>(null)
  const [faculty, setFaculty] = useState<Faculty[]>([])
  const [selectedFaculty, setSelectedFaculty] = useState("")
  const [unavailableFrom, setUnavailableFrom] = useState("")
  const [unavailableTo, setUnavailableTo] = useState("")
  const [reason, setReason] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState<ReschedulingResult[]>([])
  const [summary, setSummary] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUser()
    fetchFaculty()
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
    if (!userData || userData.role !== "admin") {
      router.push("/auth/login")
      return
    }

    setUser({ ...user, ...userData })
  }

  const fetchFaculty = async () => {
    const { data } = await supabase
      .from("users")
      .select("id, full_name, email, department")
      .eq("role", "faculty")
      .order("full_name")

    setFaculty(data || [])
  }

  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFaculty || !unavailableFrom || !unavailableTo || !reason) return

    setIsProcessing(true)
    setResults([])
    setSummary(null)

    try {
      const response = await fetch("/api/reschedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          facultyId: selectedFaculty,
          unavailableFrom,
          unavailableTo,
          reason,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setResults(data.results || [])
        setSummary(data.summary || {})
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error("Rescheduling error:", error)
      alert("Error processing rescheduling request")
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "rescheduled":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "no_substitute":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "rescheduled":
        return <Badge className="bg-green-100 text-green-800">Rescheduled</Badge>
      case "no_substitute":
        return <Badge className="bg-yellow-100 text-yellow-800">No Substitute</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  if (!user) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Rescheduling Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Dynamic Rescheduling
            </CardTitle>
            <CardDescription>Automatically reschedule classes when faculty becomes unavailable</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleReschedule} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="faculty">Select Faculty</Label>
                  <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose faculty member" />
                    </SelectTrigger>
                    <SelectContent>
                      {faculty.map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.full_name} ({f.department})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason</Label>
                  <Input
                    id="reason"
                    placeholder="e.g., Medical leave, Conference"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  />
                </div>
              </div>

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

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <RefreshCw className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">How Dynamic Rescheduling Works</h4>
                    <ul className="text-sm text-blue-800 mt-2 space-y-1">
                      <li>• System identifies all affected timetable slots</li>
                      <li>• Searches for qualified substitute faculty</li>
                      <li>• Checks for scheduling conflicts automatically</li>
                      <li>• Assigns substitutes and updates timetable</li>
                      <li>• Notifies affected students and faculty</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isProcessing || !selectedFaculty || !unavailableFrom || !unavailableTo || !reason}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isProcessing ? "animate-spin" : ""}`} />
                {isProcessing ? "Processing Rescheduling..." : "Start Rescheduling"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results Summary */}
        {summary && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Rescheduling Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{summary.total}</div>
                  <div className="text-sm text-gray-600">Total Slots</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{summary.rescheduled}</div>
                  <div className="text-sm text-gray-600">Rescheduled</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{summary.noSubstitute}</div>
                  <div className="text-sm text-gray-600">No Substitute</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{summary.failed}</div>
                  <div className="text-sm text-gray-600">Failed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Detailed Results */}
        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Rescheduling Details</CardTitle>
              <CardDescription>Detailed results for each affected class</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <div className="font-medium text-gray-900">
                          {result.originalSlot.subjects.code} - {result.originalSlot.subjects.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {result.originalSlot.rooms.room_number} •{result.originalSlot.start_time} -{" "}
                          {result.originalSlot.end_time}
                        </div>
                        {result.substitute && (
                          <div className="text-xs text-green-600 mt-1">Substitute: {result.substitute.full_name}</div>
                        )}
                        {result.error && <div className="text-xs text-red-600 mt-1">Error: {result.error}</div>}
                      </div>
                    </div>
                    {getStatusBadge(result.status)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
