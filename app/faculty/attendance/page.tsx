"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { ArrowLeft, Save, Users, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"

interface Student {
  id: string
  full_name: string
  email: string
}

interface TimetableSlot {
  id: string
  subjects: {
    code: string
    name: string
  }
  start_time: string
  end_time: string
  day_of_week: number
}

export default function AttendancePage() {
  const [user, setUser] = useState<any>(null)
  const [selectedSlot, setSelectedSlot] = useState<string>("")
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [students, setStudents] = useState<Student[]>([])
  const [attendance, setAttendance] = useState<Record<string, { status: string; notes: string }>>({})
  const [timetableSlots, setTimetableSlots] = useState<TimetableSlot[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user) {
      fetchTimetableSlots()
    }
  }, [user])

  useEffect(() => {
    if (selectedSlot) {
      fetchStudents()
    }
  }, [selectedSlot])

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

  const fetchTimetableSlots = async () => {
    setIsLoading(true)
    const { data } = await supabase
      .from("timetable_slots")
      .select(`
        id,
        start_time,
        end_time,
        day_of_week,
        subjects (code, name)
      `)
      .eq("faculty_id", user.id)
      .eq("is_active", true)
      .order("day_of_week")
      .order("start_time")

    setTimetableSlots(data || [])
    setIsLoading(false)
  }

  const fetchStudents = async () => {
    if (!selectedSlot) return

    setIsLoading(true)
    // Get subject from selected slot
    const slot = timetableSlots.find((s) => s.id === selectedSlot)
    if (!slot) return

    // Get enrolled students for this subject
    const { data } = await supabase
      .from("student_enrollments")
      .select(`
        users (id, full_name, email)
      `)
      .eq(
        "subject_id",
        (await supabase.from("timetable_slots").select("subject_id").eq("id", selectedSlot).single()).data?.subject_id,
      )

    const studentList = data?.map((enrollment) => enrollment.users).filter(Boolean) || []
    setStudents(studentList as Student[])

    // Initialize attendance state
    const initialAttendance: Record<string, { status: string; notes: string }> = {}
    studentList.forEach((student) => {
      initialAttendance[student.id] = { status: "present", notes: "" }
    })
    setAttendance(initialAttendance)
    setIsLoading(false)
  }

  const updateAttendance = (studentId: string, status: string) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], status },
    }))
  }

  const updateNotes = (studentId: string, notes: string) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], notes },
    }))
  }

  const saveAttendance = async () => {
    if (!selectedSlot || !attendanceDate) return

    setIsSaving(true)
    try {
      const attendanceRecords = Object.entries(attendance).map(([studentId, data]) => ({
        student_id: studentId,
        timetable_slot_id: selectedSlot,
        attendance_date: attendanceDate,
        status: data.status,
        notes: data.notes || null,
        marked_by: user.id,
      }))

      const { error } = await supabase.from("attendance_records").upsert(attendanceRecords, {
        onConflict: "student_id,timetable_slot_id,attendance_date",
      })

      if (error) throw error

      alert("Attendance saved successfully!")
      router.push("/faculty")
    } catch (error) {
      console.error("Error saving attendance:", error)
      alert("Error saving attendance. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const getDayName = (dayOfWeek: number) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    return days[dayOfWeek]
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
            <Button
              onClick={saveAttendance}
              disabled={!selectedSlot || students.length === 0 || isSaving}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save Attendance"}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Selection Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Mark Attendance
            </CardTitle>
            <CardDescription>Select class and date to mark student attendance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="slot">Select Class</Label>
                <Select value={selectedSlot} onValueChange={setSelectedSlot}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {timetableSlots.map((slot) => (
                      <SelectItem key={slot.id} value={slot.id}>
                        {slot.subjects.code} - {getDayName(slot.day_of_week)} {slot.start_time}-{slot.end_time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Student List */}
        {selectedSlot && students.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Student Attendance
              </CardTitle>
              <CardDescription>
                {students.length} students enrolled • {attendanceDate}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {students.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{student.full_name}</div>
                      <div className="text-sm text-gray-600">{student.email}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant={attendance[student.id]?.status === "present" ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateAttendance(student.id, "present")}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          Present
                        </Button>
                        <Button
                          variant={attendance[student.id]?.status === "absent" ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateAttendance(student.id, "absent")}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          Absent
                        </Button>
                        <Button
                          variant={attendance[student.id]?.status === "late" ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateAttendance(student.id, "late")}
                          className="bg-yellow-600 hover:bg-yellow-700 text-white"
                        >
                          Late
                        </Button>
                      </div>
                      <Input
                        placeholder="Notes (optional)"
                        value={attendance[student.id]?.notes || ""}
                        onChange={(e) => updateNotes(student.id, e.target.value)}
                        className="w-32"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedSlot && students.length === 0 && !isLoading && (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Enrolled</h3>
              <p className="text-gray-600">No students are enrolled in this subject yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
