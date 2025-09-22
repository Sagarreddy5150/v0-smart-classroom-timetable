import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { Calendar, BookOpen, Users, TrendingUp, Clock, GraduationCap } from "lucide-react"

export default async function StudentDashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is student
  const { data: userData } = await supabase
    .from("users")
    .select("role, full_name, department")
    .eq("id", user.id)
    .single()

  if (!userData || userData.role !== "student") {
    redirect("/auth/login")
  }

  // Get student's enrolled subjects
  const { data: enrollments } = await supabase
    .from("student_enrollments")
    .select(`
      *,
      subjects (code, name, credits, is_lab)
    `)
    .eq("student_id", user.id)

  // Get today's schedule
  const today = new Date().getDay()
  const { data: todaySchedule } = await supabase
    .from("timetable_slots")
    .select(`
      *,
      subjects (code, name, is_lab),
      rooms (room_number, name),
      users (full_name)
    `)
    .eq("day_of_week", today)
    .eq("is_active", true)
    .order("start_time")

  // Filter today's schedule for enrolled subjects
  const myTodaySchedule =
    todaySchedule?.filter((slot) =>
      enrollments?.some((enrollment) => enrollment.subjects.code === slot.subjects.code),
    ) || []

  // Get attendance summary
  const { data: attendanceRecords } = await supabase
    .from("attendance_records")
    .select(`
      *,
      timetable_slots (
        subjects (code, name)
      )
    `)
    .eq("student_id", user.id)

  // Calculate attendance statistics
  const attendanceStats =
    enrollments?.map((enrollment) => {
      const subjectAttendance =
        attendanceRecords?.filter((record) => record.timetable_slots.subjects.code === enrollment.subjects.code) || []

      const totalClasses = subjectAttendance.length
      const presentClasses = subjectAttendance.filter((record) => record.status === "present").length
      const attendancePercentage = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0

      return {
        subject: enrollment.subjects,
        totalClasses,
        presentClasses,
        attendancePercentage,
      }
    }) || []

  const totalCredits = enrollments?.reduce((sum, enrollment) => sum + enrollment.subjects.credits, 0) || 0
  const overallAttendance =
    attendanceStats.length > 0
      ? Math.round(attendanceStats.reduce((sum, stat) => sum + stat.attendancePercentage, 0) / attendanceStats.length)
      : 0

  const handleSignOut = async () => {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-bold">SP</span>
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-gray-900">Student Portal</h1>
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
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enrolled Subjects</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{enrollments?.length || 0}</div>
              <p className="text-xs text-muted-foreground">{totalCredits} total credits</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Attendance</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallAttendance}%</div>
              <Progress value={overallAttendance} className="mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Classes</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myTodaySchedule.length}</div>
              <p className="text-xs text-muted-foreground">Scheduled for today</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Department</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{userData.department || "Not Set"}</div>
              <p className="text-xs text-muted-foreground">Academic department</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                My Timetable
              </CardTitle>
              <CardDescription>View your complete weekly schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/student/timetable">View Timetable</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                Attendance Records
              </CardTitle>
              <CardDescription>Check your attendance history</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                <Link href="/student/attendance">View Attendance</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-purple-600" />
                My Subjects
              </CardTitle>
              <CardDescription>View enrolled courses and details</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                <Link href="/student/subjects">View Subjects</Link>
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
              {myTodaySchedule.length > 0 ? (
                <div className="space-y-3">
                  {myTodaySchedule.map((slot) => (
                    <div key={slot.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <div className="font-medium text-green-900">
                          {slot.subjects.code} - {slot.subjects.name}
                        </div>
                        <div className="text-sm text-green-700">
                          {slot.rooms.room_number} • {slot.start_time} - {slot.end_time}
                        </div>
                        <div className="text-xs text-green-600">Faculty: {slot.users.full_name}</div>
                      </div>
                      <Badge
                        className={slot.subjects.is_lab ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}
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

          {/* Attendance Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Attendance Summary
              </CardTitle>
              <CardDescription>Your attendance percentage by subject</CardDescription>
            </CardHeader>
            <CardContent>
              {attendanceStats.length > 0 ? (
                <div className="space-y-4">
                  {attendanceStats.map((stat) => (
                    <div key={stat.subject.code} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{stat.subject.code}</div>
                          <div className="text-sm text-gray-600">{stat.subject.name}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{stat.attendancePercentage}%</div>
                          <div className="text-xs text-gray-500">
                            {stat.presentClasses}/{stat.totalClasses} classes
                          </div>
                        </div>
                      </div>
                      <Progress
                        value={stat.attendancePercentage}
                        className={`h-2 ${
                          stat.attendancePercentage >= 75
                            ? "text-green-600"
                            : stat.attendancePercentage >= 60
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No attendance records yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
