import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, Calendar, Download, RefreshCw } from "lucide-react"

export default async function TimetableManagement() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

  if (!userData || userData.role !== "admin") {
    redirect("/auth/login")
  }

  // Get current timetable data with joins
  const { data: timetableSlots } = await supabase
    .from("timetable_slots")
    .select(`
      *,
      subjects (code, name, is_lab),
      users (full_name),
      rooms (room_number, name)
    `)
    .eq("is_active", true)
    .order("day_of_week")
    .order("start_time")

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const timeSlots = [
    "08:00-08:50",
    "09:00-09:50",
    "10:00-10:50",
    "11:00-11:50",
    "12:00-12:50",
    "13:00-13:50",
    "14:00-14:50",
    "15:00-15:50",
    "16:00-16:50",
  ]

  // Predefined GITAM timetable
  const predefinedSchedule = {
    1: {
      // Monday
      "08:00-08:50": "CSEN2081",
      "09:00-09:50": "CSEN2061",
      "10:00-10:50": "CSEN2191P",
      "11:00-11:50": "CSEN3061",
      "12:00-12:50": "CIVL2281",
      "13:00-13:50": "CSEN3001",
    },
    2: {
      // Tuesday
      "08:00-08:50": "CLAD2001",
      "09:00-09:50": "CLAD2001",
      "10:00-10:50": "CSEN2061",
      "11:00-11:50": "CSEN2191",
      "12:00-12:50": "CIVL2281",
      "13:00-13:50": "MECH2331",
    },
    3: {
      // Wednesday
      "08:00-08:50": "CSEN2061",
      "09:00-09:50": "CSEN2191P",
      "10:00-10:50": "CSEN3001",
      "11:00-11:50": "CSEN2081",
      "12:00-12:50": "CIVL2281",
    },
    4: {
      // Thursday
      "08:00-08:50": "CSEN3061",
      "09:00-09:50": "CSEN2081",
      "10:00-10:50": "CSEN2061P",
      "11:00-11:50": "CSEN2061P",
      "12:00-12:50": "MECH2331",
    },
    5: {
      // Friday
      "08:00-08:50": "CSEN3001",
      "09:00-09:50": "CSEN3061",
      "10:00-10:50": "CSEN2081P",
      "11:00-11:50": "CSEN2081P",
      "12:00-12:50": "MECH2331",
      "13:00-13:50": "CSEN2191P",
      "14:00-14:50": "CSEN2191P",
    },
  }

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
            <div className="flex items-center gap-2">
              <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              <Button className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Regenerate
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Current Timetable
            </CardTitle>
            <CardDescription>GITAM University - Current Academic Schedule</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Time</th>
                    {days.slice(1, 6).map((day) => (
                      <th key={day} className="text-left p-3 font-medium min-w-[150px]">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((timeSlot) => (
                    <tr key={timeSlot} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium text-sm bg-gray-50">{timeSlot}</td>
                      {[1, 2, 3, 4, 5].map((dayIndex) => {
                        const subjectCode = predefinedSchedule[dayIndex]?.[timeSlot]
                        return (
                          <td key={dayIndex} className="p-3">
                            {subjectCode ? (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                                <div className="font-medium text-sm text-blue-900">{subjectCode}</div>
                                <div className="text-xs text-blue-700 mt-1">
                                  {subjectCode.includes("P") ? "Lab" : "Theory"}
                                </div>
                              </div>
                            ) : (
                              <div className="text-gray-400 text-sm">-</div>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Schedule Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Slots:</span>
                  <span className="font-medium">32</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Theory Classes:</span>
                  <span className="font-medium">24</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Lab Sessions:</span>
                  <span className="font-medium">8</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Room Utilization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">ICT Classrooms:</span>
                  <span className="font-medium">85%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Computer Labs:</span>
                  <span className="font-medium">70%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Peak Hours:</span>
                  <span className="font-medium">10-12 AM</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Faculty Workload</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg Hours/Week:</span>
                  <span className="font-medium">18</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Max Load:</span>
                  <span className="font-medium">24 hrs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Conflicts:</span>
                  <Badge className="bg-green-100 text-green-800">0</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
