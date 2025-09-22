"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Calendar, Users, BookOpen, CheckCircle, X } from "lucide-react"

interface Student {
  id: string
  registration_number: string
  name: string
  department: string
}

interface AttendanceRecord {
  student_id: string
  status: "present" | "absent"
}

export default function FacultyDashboard() {
  const [user, setUser] = useState<any>(null)
  const [showAttendanceModal, setShowAttendanceModal] = useState(false)
  const [selectedClass, setSelectedClass] = useState<any>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const todaysClasses = [
    {
      id: 1,
      name: "Data Visualization and Exploration with R",
      room: "Room 101",
      time: "08:00 - 08:50",
      subject_code: "CSEN2081",
    },
    {
      id: 2,
      name: "Database Management Systems",
      room: "Room 205",
      time: "09:00 - 09:50",
      subject_code: "CSEN2061",
    },
    {
      id: 3,
      name: "Introduction To Competitive Programming Lab",
      room: "Room 301",
      time: "10:00 - 10:50",
      subject_code: "CSEN2191P",
    },
    {
      id: 4,
      name: "Automata Theory and Compiler Design",
      room: "Room 205",
      time: "11:00 - 11:50",
      subject_code: "CSEN3061",
    },
    {
      id: 5,
      name: "Disaster Management",
      room: "Room 301",
      time: "12:00 - 12:50",
      subject_code: "CIVL2281",
    },
    {
      id: 6,
      name: "Design and analysis of algorithms",
      room: "Room 205",
      time: "14:00 - 14:50",
      subject_code: "CSEN3001",
    },
  ]

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }
      if (user.user_metadata?.role !== "faculty") {
        router.push("/auth/login")
        return
      }
      setUser(user)
    }
    getUser()
  }, [router, supabase])

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("students")
        .select("id, registration_number, name, department")
        .order("name")

      if (error) throw error

      setStudents(data || [])
      const initialAttendance = (data || []).map((student) => ({
        student_id: student.id,
        status: "present" as const,
      }))
      setAttendance(initialAttendance)
    } catch (error) {
      console.error("Error fetching students:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAttendance = (classInfo: any) => {
    setSelectedClass(classInfo)
    setShowAttendanceModal(true)
    fetchStudents()
  }

  const toggleAttendance = (studentId: string) => {
    setAttendance((prev) =>
      prev.map((record) =>
        record.student_id === studentId
          ? { ...record, status: record.status === "present" ? "absent" : "present" }
          : record,
      ),
    )
  }

  const saveAttendance = async () => {
    if (!selectedClass) return

    setLoading(true)
    try {
      const attendanceData = attendance.map((record) => ({
        student_id: record.student_id,
        subject_code: selectedClass.subject_code,
        date: new Date().toISOString().split("T")[0],
        time_slot: selectedClass.time,
        status: record.status,
        marked_by: user.id,
      }))

      const { error } = await supabase.from("attendance").upsert(attendanceData, {
        onConflict: "student_id,subject_code,date,time_slot",
      })

      if (error) throw error

      alert("Attendance saved successfully!")
      setShowAttendanceModal(false)
    } catch (error) {
      console.error("Error saving attendance:", error)
      alert("Error saving attendance. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  if (!user) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Faculty Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user.user_metadata?.full_name}</p>
            <p className="text-sm text-gray-500">Department: {user.user_metadata?.department}</p>
          </div>
          <Button onClick={handleSignOut} variant="outline">
            Sign Out
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Classes</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">This semester</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">Across all classes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Courses Taught</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground">Active courses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">87%</div>
              <p className="text-xs text-muted-foreground">Average this month</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Faculty Privileges</CardTitle>
              <CardDescription>Your teaching and administrative access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Post Attendance</span>
                <span className="text-green-600 font-medium">Enabled</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Update Attendance</span>
                <span className="text-green-600 font-medium">Enabled</span>
              </div>
              <div className="flex items-center justify-between">
                <span>View Course Info</span>
                <span className="text-green-600 font-medium">Enabled</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Classroom Management</span>
                <span className="text-green-600 font-medium">Enabled</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>Your classes for today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todaysClasses.map((classInfo, index) => (
                  <div
                    key={classInfo.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      index % 3 === 0 ? "bg-blue-50" : index % 3 === 1 ? "bg-green-50" : "bg-orange-50"
                    }`}
                  >
                    <div>
                      <p className="font-medium">{classInfo.name}</p>
                      <p className="text-sm text-gray-600">
                        {classInfo.room} • {classInfo.time}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleMarkAttendance(classInfo)}
                      className="bg-gray-800 hover:bg-gray-900"
                    >
                      Mark Attendance
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Dialog open={showAttendanceModal} onOpenChange={setShowAttendanceModal}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                Mark Attendance - {selectedClass?.name}
                <Button variant="ghost" size="sm" onClick={() => setShowAttendanceModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </DialogTitle>
              <DialogDescription>
                {selectedClass?.room} • {selectedClass?.time} • {new Date().toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="text-gray-500">Loading students...</div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                  {students.map((student) => {
                    const studentAttendance = attendance.find((a) => a.student_id === student.id)
                    const isPresent = studentAttendance?.status === "present"

                    return (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-gray-600">{student.registration_number}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleAttendance(student.id)}
                            className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg transition-colors ${
                              isPresent ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
                            }`}
                          >
                            {isPresent ? "P" : "A"}
                          </button>
                          <span className={`text-sm font-medium ${isPresent ? "text-green-600" : "text-red-600"}`}>
                            {isPresent ? "Present" : "Absent"}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    Present: {attendance.filter((a) => a.status === "present").length} | Absent:{" "}
                    {attendance.filter((a) => a.status === "absent").length} | Total: {students.length}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowAttendanceModal(false)}>
                      Cancel
                    </Button>
                    <Button onClick={saveAttendance} disabled={loading} className="bg-green-600 hover:bg-green-700">
                      {loading ? "Saving..." : "Save Attendance"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
