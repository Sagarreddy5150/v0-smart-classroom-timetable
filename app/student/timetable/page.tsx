import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, Calendar, Download } from "lucide-react"

export default async function StudentTimetable() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is student
  const { data: userData } = await supabase.from("users").select("role, full_name").eq("id", user.id).single()

  if (!userData || userData.role !== "student") {
    redirect("/auth/login")
  }

  // Get student's enrolled subjects
  const { data: enrollments } = await supabase
    .from("student_enrollments")
    .select("subjects (code)")
    .eq("student_id", user.id)

  const enrolledSubjectCodes = enrollments?.map((e) => e.subjects.code) || []

  // Get all timetable slots for enrolled subjects
  const { data: timetableSlots } = await supabase
    .from("timetable_slots")
    .select(`
      *,
      subjects (code, name, is_lab),
      rooms (room_number, name),
      users (full_name)
    `)
    .eq("is_active", true)
    .order("day_of_week")
    .order("start_time")

  // Filter for enrolled subjects
  const mySchedule = timetableSlots?.filter((slot) => enrolledSubjectCodes.includes(slot.subjects.code)) || []

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

  // Organize schedule by day and time
  const scheduleGrid: Record<number, Record<string, any>> = {}
  mySchedule.forEach((slot) => {
    if (!scheduleGrid[slot.day_of_week]) {
      scheduleGrid[slot.day_of_week] = {}
    }
    const timeKey = `${slot.start_time}-${slot.end_time}`
    scheduleGrid[slot.day_of_week][timeKey] = slot
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/student" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
            <Button variant="outline" className="flex items-center gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              Export Schedule
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              My Weekly Timetable
            </CardTitle>
            <CardDescription>Your personalized class schedule</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium bg-gray-50">Time</th>
                    {days.slice(1, 6).map((day) => (
                      <th key={day} className="text-left p-3 font-medium min-w-[180px] bg-gray-50">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((timeSlot) => (
                    <tr key={timeSlot} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium text-sm bg-gray-50 border-r">{timeSlot}</td>
                      {[1, 2, 3, 4, 5].map((dayIndex) => {
                        const slot = scheduleGrid[dayIndex]?.[timeSlot]
                        return (
                          <td key={dayIndex} className="p-3 border-r">
                            {slot ? (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                <div className="font-medium text-sm text-green-900 mb-1">{slot.subjects.code}</div>
                                <div className="text-xs text-green-700 mb-2">{slot.subjects.name}</div>
                                <div className="flex items-center justify-between">
                                  <div className="text-xs text-green-600">{slot.rooms.room_number}</div>
                                  <Badge
                                    className={
                                      slot.subjects.is_lab
                                        ? "bg-purple-100 text-purple-800 text-xs"
                                        : "bg-blue-100 text-blue-800 text-xs"
                                    }
                                  >
                                    {slot.subjects.is_lab ? "Lab" : "Theory"}
                                  </Badge>
                                </div>
                                <div className="text-xs text-green-600 mt-1">{slot.users.full_name}</div>
                              </div>
                            ) : (
                              <div className="text-gray-400 text-sm text-center">-</div>
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

        {/* Schedule Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Weekly Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Classes:</span>
                  <span className="font-medium">{mySchedule.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Theory Classes:</span>
                  <span className="font-medium">{mySchedule.filter((s) => !s.subjects.is_lab).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Lab Sessions:</span>
                  <span className="font-medium">{mySchedule.filter((s) => s.subjects.is_lab).length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Daily Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {days.slice(1, 6).map((day, index) => {
                  const dayClasses = mySchedule.filter((s) => s.day_of_week === index + 1).length
                  return (
                    <div key={day} className="flex justify-between">
                      <span className="text-sm text-gray-600">{day}:</span>
                      <span className="font-medium">{dayClasses} classes</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Peak Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Busiest Day:</span>
                  <span className="font-medium">
                    {days.slice(1, 6).reduce((busiest, day, index) => {
                      const dayClasses = mySchedule.filter((s) => s.day_of_week === index + 1).length
                      const busiestClasses = mySchedule.filter(
                        (s) => s.day_of_week === days.indexOf(busiest) + 1,
                      ).length
                      return dayClasses > busiestClasses ? day : busiest
                    }, "Monday")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">First Class:</span>
                  <span className="font-medium">08:00 AM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Last Class:</span>
                  <span className="font-medium">
                    {mySchedule.length > 0
                      ? Math.max(...mySchedule.map((s) => Number.parseInt(s.end_time.split(":")[0]))) + ":50"
                      : "N/A"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
