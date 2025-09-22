import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { ArrowLeft, TrendingUp, Calendar, AlertTriangle } from "lucide-react"

export default async function StudentAttendance() {
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
    .select(`
      *,
      subjects (code, name, credits, is_lab)
    `)
    .eq("student_id", user.id)

  // Get all attendance records for the student
  const { data: attendanceRecords } = await supabase
    .from("attendance_records")
    .select(`
      *,
      timetable_slots (
        subjects (code, name),
        start_time,
        end_time,
        day_of_week,
        users (full_name)
      )
    `)
    .eq("student_id", user.id)
    .order("attendance_date", { ascending: false })

  // Calculate attendance statistics by subject
  const attendanceStats =
    enrollments?.map((enrollment) => {
      const subjectAttendance =
        attendanceRecords?.filter((record) => record.timetable_slots.subjects.code === enrollment.subjects.code) || []

      const totalClasses = subjectAttendance.length
      const presentClasses = subjectAttendance.filter((record) => record.status === "present").length
      const absentClasses = subjectAttendance.filter((record) => record.status === "absent").length
      const lateClasses = subjectAttendance.filter((record) => record.status === "late").length
      const attendancePercentage = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0

      return {
        subject: enrollment.subjects,
        totalClasses,
        presentClasses,
        absentClasses,
        lateClasses,
        attendancePercentage,
        records: subjectAttendance,
      }
    }) || []

  const overallAttendance =
    attendanceStats.length > 0
      ? Math.round(attendanceStats.reduce((sum, stat) => sum + stat.attendancePercentage, 0) / attendanceStats.length)
      : 0

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 75) return "text-green-600"
    if (percentage >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return <Badge className="bg-green-100 text-green-800">Present</Badge>
      case "absent":
        return <Badge className="bg-red-100 text-red-800">Absent</Badge>
      case "late":
        return <Badge className="bg-yellow-100 text-yellow-800">Late</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

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
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Overall Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getAttendanceColor(overallAttendance)}`}>{overallAttendance}%</div>
              <Progress value={overallAttendance} className="mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{attendanceRecords?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Across all subjects</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Present</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {attendanceRecords?.filter((r) => r.status === "present").length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Classes attended</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Absent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {attendanceRecords?.filter((r) => r.status === "absent").length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Classes missed</p>
            </CardContent>
          </Card>
        </div>

        {/* Subject-wise Attendance */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Subject-wise Attendance
            </CardTitle>
            <CardDescription>Your attendance percentage for each enrolled subject</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {attendanceStats.map((stat) => (
                <div key={stat.subject.code} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{stat.subject.code}</div>
                      <div className="text-sm text-gray-600">{stat.subject.name}</div>
                      <div className="text-xs text-gray-500">
                        {stat.subject.credits} credits • {stat.subject.is_lab ? "Lab" : "Theory"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xl font-bold ${getAttendanceColor(stat.attendancePercentage)}`}>
                        {stat.attendancePercentage}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {stat.presentClasses}/{stat.totalClasses} classes
                      </div>
                    </div>
                  </div>
                  <Progress value={stat.attendancePercentage} className="h-2" />
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-medium text-green-600">{stat.presentClasses}</div>
                      <div className="text-xs text-gray-500">Present</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-red-600">{stat.absentClasses}</div>
                      <div className="text-xs text-gray-500">Absent</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-yellow-600">{stat.lateClasses}</div>
                      <div className="text-xs text-gray-500">Late</div>
                    </div>
                  </div>
                  {stat.attendancePercentage < 75 && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <div className="text-sm text-red-800">
                        <strong>Warning:</strong> Attendance below 75% minimum requirement
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Attendance Records */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Attendance Records
            </CardTitle>
            <CardDescription>Your latest attendance entries</CardDescription>
          </CardHeader>
          <CardContent>
            {attendanceRecords && attendanceRecords.length > 0 ? (
              <div className="space-y-3">
                {attendanceRecords.slice(0, 10).map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">
                        {record.timetable_slots.subjects.code} - {record.timetable_slots.subjects.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(record.attendance_date).toLocaleDateString()} •{record.timetable_slots.start_time} -{" "}
                        {record.timetable_slots.end_time}
                      </div>
                      <div className="text-xs text-gray-500">Faculty: {record.timetable_slots.users.full_name}</div>
                      {record.notes && <div className="text-xs text-gray-500 mt-1">Note: {record.notes}</div>}
                    </div>
                    <div className="text-right">
                      {getStatusBadge(record.status)}
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(record.marked_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No attendance records found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
