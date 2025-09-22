import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Calendar, Users, Clock, BookOpen, AlertCircle, UserCheck } from "lucide-react"

export default async function FacultyDashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is faculty
  const { data: userData } = await supabase
    .from("users")
    .select("role, full_name, department")
    .eq("id", user.id)
    .single()

  if (!userData || userData.role !== "faculty") {
    redirect("/auth/login")
  }

  // Get faculty's assigned subjects
  const { data: assignments } = await supabase
    .from("faculty_subjects")
    .select(`
      *,
      subjects (code, name, is_lab, credits)
    `)
    .eq("faculty_id", user.id)

  // Get today's schedule
  const today = new Date().getDay()
  const { data: todaySchedule } = await supabase
    .from("timetable_slots")
    .select(`
      *,
      subjects (code, name, is_lab),
      rooms (room_number, name)
    `)
    .eq("faculty_id", user.id)
    .eq("day_of_week", today)
    .eq("is_active", true)
    .order("start_time")

  // Get recent attendance records
  const { data: recentAttendance } = await supabase
    .from("attendance_records")
    .select(`
      *,
      timetable_slots (
        subjects (code, name),
        start_time,
        end_time
      ),
      users (full_name)
    `)
    .eq("marked_by", user.id)
    .order("marked_at", { ascending: false })
    .limit(5)

  const handleSignOut = async () => {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-bold">FP</span>
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-gray-900">Faculty Portal</h1>
                <p className="text-sm text-gray-600">Welcome, {userData.full_name}</p>
              </div>
            </div>
            <form action={handleSignOut}>
              <Button variant="outline" type="submit">
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <UserCheck className="h-5 w-5 text-green-600" />
                Mark Attendance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                <Link href="/faculty/attendance">Take Attendance</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
                My Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/faculty/schedule">View Schedule</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                Report Unavailability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-orange-600 hover:bg-orange-700">
                <Link href="/faculty/unavailable">Report Absence</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="h-5 w-5 text-purple-600" />
                My Subjects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                <Link href="/faculty/subjects">Manage Subjects</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Today's Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Today's Classes
              </CardTitle>
              <CardDescription>
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {todaySchedule && todaySchedule.length > 0 ? (
                <div className="space-y-3">
                  {todaySchedule.map((slot) => (
                    <div key={slot.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <div className="font-medium text-blue-900">
                          {slot.subjects.code} - {slot.subjects.name}
                        </div>
                        <div className="text-sm text-blue-700">
                          {slot.rooms.room_number} • {slot.start_time} - {slot.end_time}
                        </div>
                      </div>
                      <Badge
                        className={
                          slot.subjects.is_lab ? "bg-purple-100 text-purple-800" : "bg-green-100 text-green-800"
                        }
                      >
                        {slot.subjects.is_lab ? "Lab" : "Theory"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No classes scheduled for today</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assigned Subjects */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                My Subjects
              </CardTitle>
              <CardDescription>Current semester assignments</CardDescription>
            </CardHeader>
            <CardContent>
              {assignments && assignments.length > 0 ? (
                <div className="space-y-3">
                  {assignments.map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{assignment.subjects.code}</div>
                        <div className="text-sm text-gray-600">{assignment.subjects.name}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {assignment.student_count} students • {assignment.subjects.credits} credits
                        </div>
                      </div>
                      <Badge
                        className={
                          assignment.subjects.is_lab ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                        }
                      >
                        {assignment.subjects.is_lab ? "Lab" : "Theory"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No subjects assigned</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Attendance */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Recent Attendance Records
            </CardTitle>
            <CardDescription>Latest attendance entries you've marked</CardDescription>
          </CardHeader>
          <CardContent>
            {recentAttendance && recentAttendance.length > 0 ? (
              <div className="space-y-3">
                {recentAttendance.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{record.users.full_name}</div>
                      <div className="text-sm text-gray-600">
                        {record.timetable_slots.subjects.code} • {record.attendance_date}
                      </div>
                    </div>
                    <Badge
                      className={
                        record.status === "present"
                          ? "bg-green-100 text-green-800"
                          : record.status === "absent"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {record.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No recent attendance records</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
