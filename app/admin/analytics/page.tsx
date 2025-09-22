import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { ArrowLeft, Users, MapPin, TrendingUp, AlertTriangle } from "lucide-react"

export default async function AnalyticsPage() {
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

  // Get room utilization data
  const { data: rooms } = await supabase.from("rooms").select("*").order("room_number")
  const { data: timetableSlots } = await supabase
    .from("timetable_slots")
    .select(`
      *,
      rooms (room_number, name, capacity),
      subjects (code, name, is_lab)
    `)
    .eq("is_active", true)

  // Calculate room utilization
  const roomUtilization =
    rooms?.map((room) => {
      const roomSlots = timetableSlots?.filter((slot) => slot.rooms.room_number === room.room_number) || []
      const totalPossibleSlots = 5 * 9 // 5 days * 9 time slots
      const utilizationPercentage = Math.round((roomSlots.length / totalPossibleSlots) * 100)

      return {
        ...room,
        slotsUsed: roomSlots.length,
        totalSlots: totalPossibleSlots,
        utilizationPercentage,
        peakDay: getPeakDay(roomSlots),
      }
    }) || []

  // Get faculty workload data
  const { data: faculty } = await supabase
    .from("users")
    .select("id, full_name, department")
    .eq("role", "faculty")
    .order("full_name")

  const facultyWorkload = await Promise.all(
    faculty?.map(async (f) => {
      const { data: assignments } = await supabase
        .from("timetable_slots")
        .select(`
          *,
          subjects (code, name, credits, is_lab)
        `)
        .eq("faculty_id", f.id)
        .eq("is_active", true)

      const totalHours = assignments?.length || 0
      const totalCredits = assignments?.reduce((sum, slot) => sum + (slot.subjects.credits || 0), 0) || 0
      const labHours = assignments?.filter((slot) => slot.subjects.is_lab).length || 0
      const theoryHours = assignments?.filter((slot) => !slot.subjects.is_lab).length || 0

      return {
        ...f,
        totalHours,
        totalCredits,
        labHours,
        theoryHours,
        workloadPercentage: Math.min(Math.round((totalHours / 24) * 100), 100),
      }
    }) || [],
  )

  // Get attendance analytics
  const { data: attendanceData } = await supabase.from("attendance_records").select(`
      *,
      timetable_slots (
        subjects (code, name, department)
      )
    `)

  const attendanceStats = {
    totalRecords: attendanceData?.length || 0,
    presentCount: attendanceData?.filter((r) => r.status === "present").length || 0,
    absentCount: attendanceData?.filter((r) => r.status === "absent").length || 0,
    lateCount: attendanceData?.filter((r) => r.status === "late").length || 0,
  }

  const overallAttendanceRate =
    attendanceStats.totalRecords > 0
      ? Math.round((attendanceStats.presentCount / attendanceStats.totalRecords) * 100)
      : 0

  // Get system alerts
  const alerts = [
    ...roomUtilization
      .filter((room) => room.utilizationPercentage > 90)
      .map((room) => ({
        type: "warning",
        message: `${room.room_number} is over-utilized (${room.utilizationPercentage}%)`,
      })),
    ...facultyWorkload
      .filter((f) => f.workloadPercentage > 80)
      .map((f) => ({
        type: "warning",
        message: `${f.full_name} has high workload (${f.totalHours} hours/week)`,
      })),
    ...(overallAttendanceRate < 75
      ? [
          {
            type: "error",
            message: `Overall attendance rate is below 75% (${overallAttendanceRate}%)`,
          },
        ]
      : []),
  ]

  function getPeakDay(slots: any[]) {
    const dayCount = [0, 0, 0, 0, 0, 0, 0]
    slots.forEach((slot) => dayCount[slot.day_of_week]++)
    const maxDay = dayCount.indexOf(Math.max(...dayCount))
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    return days[maxDay]
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
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* System Alerts */}
        {alerts.length > 0 && (
          <Card className="mb-8 border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <AlertTriangle className="h-5 w-5" />
                System Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {alerts.map((alert, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div
                      className={`w-2 h-2 rounded-full ${alert.type === "error" ? "bg-red-500" : "bg-orange-500"}`}
                    />
                    <span className="text-orange-800">{alert.message}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Room Utilization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(
                  roomUtilization.reduce((sum, room) => sum + room.utilizationPercentage, 0) / roomUtilization.length,
                ) || 0}
                %
              </div>
              <Progress
                value={
                  Math.round(
                    roomUtilization.reduce((sum, room) => sum + room.utilizationPercentage, 0) / roomUtilization.length,
                  ) || 0
                }
                className="mt-2"
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Faculty Workload</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(facultyWorkload.reduce((sum, f) => sum + f.totalHours, 0) / facultyWorkload.length) || 0}{" "}
                hrs
              </div>
              <p className="text-xs text-muted-foreground">Per week average</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Overall Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${overallAttendanceRate >= 75 ? "text-green-600" : "text-red-600"}`}>
                {overallAttendanceRate}%
              </div>
              <Progress value={overallAttendanceRate} className="mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Timetable Slots</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{timetableSlots?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Scheduled classes</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Room Utilization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Room Utilization Analysis
              </CardTitle>
              <CardDescription>Usage statistics for all rooms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {roomUtilization.map((room) => (
                  <div key={room.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{room.room_number}</div>
                        <div className="text-sm text-gray-600">{room.name}</div>
                        <div className="text-xs text-gray-500">
                          Capacity: {room.capacity} • Peak: {room.peakDay}
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`font-medium ${
                            room.utilizationPercentage > 90
                              ? "text-red-600"
                              : room.utilizationPercentage > 70
                                ? "text-yellow-600"
                                : "text-green-600"
                          }`}
                        >
                          {room.utilizationPercentage}%
                        </div>
                        <div className="text-xs text-gray-500">
                          {room.slotsUsed}/{room.totalSlots} slots
                        </div>
                      </div>
                    </div>
                    <Progress value={room.utilizationPercentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Faculty Workload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Faculty Workload Distribution
              </CardTitle>
              <CardDescription>Teaching hours and credit distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {facultyWorkload.slice(0, 8).map((faculty) => (
                  <div key={faculty.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{faculty.full_name}</div>
                        <div className="text-sm text-gray-600">{faculty.department}</div>
                        <div className="text-xs text-gray-500">
                          Theory: {faculty.theoryHours}h • Lab: {faculty.labHours}h
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`font-medium ${
                            faculty.workloadPercentage > 80
                              ? "text-red-600"
                              : faculty.workloadPercentage > 60
                                ? "text-yellow-600"
                                : "text-green-600"
                          }`}
                        >
                          {faculty.totalHours}h
                        </div>
                        <div className="text-xs text-gray-500">{faculty.totalCredits} credits</div>
                      </div>
                    </div>
                    <Progress value={faculty.workloadPercentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Analytics */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Attendance Analytics
            </CardTitle>
            <CardDescription>System-wide attendance patterns and statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{attendanceStats.totalRecords}</div>
                <div className="text-sm text-gray-600">Total Records</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{attendanceStats.presentCount}</div>
                <div className="text-sm text-gray-600">Present</div>
                <div className="text-xs text-gray-500">
                  {attendanceStats.totalRecords > 0
                    ? Math.round((attendanceStats.presentCount / attendanceStats.totalRecords) * 100)
                    : 0}
                  %
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{attendanceStats.absentCount}</div>
                <div className="text-sm text-gray-600">Absent</div>
                <div className="text-xs text-gray-500">
                  {attendanceStats.totalRecords > 0
                    ? Math.round((attendanceStats.absentCount / attendanceStats.totalRecords) * 100)
                    : 0}
                  %
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{attendanceStats.lateCount}</div>
                <div className="text-sm text-gray-600">Late</div>
                <div className="text-xs text-gray-500">
                  {attendanceStats.totalRecords > 0
                    ? Math.round((attendanceStats.lateCount / attendanceStats.totalRecords) * 100)
                    : 0}
                  %
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
