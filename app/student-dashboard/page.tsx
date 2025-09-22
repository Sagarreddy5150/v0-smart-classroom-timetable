"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface AttendanceData {
  course_code: string
  course_name: string
  present: number
  absent: number
  total_classes: number
  percentage: number
  overall_classes: number
  overall_present: number
  overall_absent: number
  overall_percentage: number
}

interface DailyAttendance {
  date: string
  time: string
  course_name: string
  faculty_name: string
  status: "Present" | "Absent"
}

interface TimetableSlot {
  day: string
  time_slot: string
  course_code: string
}

export default function StudentDashboard() {
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("attendance")
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()
  const supabase = createClient()

  const attendanceData: AttendanceData[] = [
    {
      course_code: "CIVL2281",
      course_name: "Disaster Management",
      present: 49,
      absent: 2,
      total_classes: 51,
      percentage: 96.08,
      overall_classes: 438,
      overall_present: 399,
      overall_absent: 39,
      overall_percentage: 91.1,
    },
    {
      course_code: "CLAD2001",
      course_name: "Preparation For Campus Placement-1 (Soft Skills 5A)",
      present: 50,
      absent: 1,
      total_classes: 51,
      percentage: 98.04,
      overall_classes: 436,
      overall_present: 421,
      overall_absent: 15,
      overall_percentage: 96.56,
    },
    {
      course_code: "CSEN2061",
      course_name: "Database Management Systems",
      present: 46,
      absent: 5,
      total_classes: 51,
      percentage: 90.2,
      overall_classes: 435,
      overall_present: 385,
      overall_absent: 50,
      overall_percentage: 88.51,
    },
    {
      course_code: "CSEN2061P",
      course_name: "Database Management Systems Lab",
      present: 48,
      absent: 3,
      total_classes: 51,
      percentage: 94.12,
      overall_classes: 437,
      overall_present: 371,
      overall_absent: 66,
      overall_percentage: 84.9,
    },
    {
      course_code: "CSEN2081",
      course_name: "Data Visualization and Exploration with R",
      present: 50,
      absent: 1,
      total_classes: 51,
      percentage: 98.04,
      overall_classes: 436,
      overall_present: 382,
      overall_absent: 54,
      overall_percentage: 87.61,
    },
    {
      course_code: "CSEN2081P",
      course_name: "Data Visualization and Exploration With R Lab",
      present: 49,
      absent: 2,
      total_classes: 51,
      percentage: 96.08,
      overall_classes: 466,
      overall_present: 442,
      overall_absent: 24,
      overall_percentage: 94.85,
    },
    {
      course_code: "CSEN2191",
      course_name: "Introduction To Competitive Programming",
      present: 47,
      absent: 4,
      total_classes: 51,
      percentage: 92.16,
      overall_classes: 436,
      overall_present: 365,
      overall_absent: 71,
      overall_percentage: 83.72,
    },
    {
      course_code: "CSEN2191P",
      course_name: "Introduction To Competitive Programming Lab",
      present: 48,
      absent: 3,
      total_classes: 51,
      percentage: 94.12,
      overall_classes: 439,
      overall_present: 400,
      overall_absent: 39,
      overall_percentage: 91.12,
    },
    {
      course_code: "CSEN3001",
      course_name: "Design and analysis of algorithms",
      present: 50,
      absent: 1,
      total_classes: 51,
      percentage: 98.04,
      overall_classes: 453,
      overall_present: 421,
      overall_absent: 32,
      overall_percentage: 92.94,
    },
    {
      course_code: "CSEN3061",
      course_name: "Automata Theory and Compiler Design",
      present: 50,
      absent: 1,
      total_classes: 51,
      percentage: 98.04,
      overall_classes: 433,
      overall_present: 383,
      overall_absent: 50,
      overall_percentage: 88.45,
    },
  ]

  const dailyAttendance: DailyAttendance[] = [
    {
      date: "22-09-2025",
      time: "08:00",
      course_name: "Data Visualization and Exploration with R",
      faculty_name: "Dr. T Srikanth",
      status: "Present",
    },
    {
      date: "22-09-2025",
      time: "09:00",
      course_name: "Database Management Systems",
      faculty_name: "Dr. Ravi Teja Gedela",
      status: "Present",
    },
    {
      date: "22-09-2025",
      time: "10:00",
      course_name: "Introduction To Competitive Programming Lab",
      faculty_name: "Dr. Amanapu Yaswanth",
      status: "Present",
    },
    {
      date: "22-09-2025",
      time: "11:00",
      course_name: "Automata Theory and Compiler Design",
      faculty_name: "Dr. Manda Rama Narasinga Rao",
      status: "Present",
    },
    {
      date: "22-09-2025",
      time: "12:00",
      course_name: "Disaster Management",
      faculty_name: "Mr. Dr.Maddamsetty Ramesh",
      status: "Present",
    },
    {
      date: "22-09-2025",
      time: "14:00",
      course_name: "Design and analysis of algorithms",
      faculty_name: "Dr. Sreekanth Puli",
      status: "Present",
    },
  ]

  const timetable = [
    {
      day: "Monday",
      "08:00-08:50": "CSEN2081",
      "09:00-09:50": "CSEN2061",
      "10:00-10:50": "CSEN2191P",
      "11:00-11:50": "CSEN3061",
      "12:00-12:50": "CIVL2281",
      "13:00-13:50": "",
      "14:00-14:50": "CSEN3001",
      "15:00-15:50": "",
      "16:00-16:50": "",
    },
    {
      day: "Tuesday",
      "08:00-08:50": "CLAD2001",
      "09:00-09:50": "CLAD2001",
      "10:00-10:50": "CSEN2061",
      "11:00-11:50": "CSEN2191",
      "12:00-12:50": "CIVL2281",
      "13:00-13:50": "",
      "14:00-14:50": "MECH2331",
      "15:00-15:50": "",
      "16:00-16:50": "",
    },
    {
      day: "Wednesday",
      "08:00-08:50": "CSEN2061",
      "09:00-09:50": "CSEN2191P",
      "10:00-10:50": "CSEN3001",
      "11:00-11:50": "CSEN2081",
      "12:00-12:50": "CIVL2281",
      "13:00-13:50": "",
      "14:00-14:50": "",
      "15:00-15:50": "",
      "16:00-16:50": "",
    },
    {
      day: "Thursday",
      "08:00-08:50": "CSEN3061",
      "09:00-09:50": "CSEN2081",
      "10:00-10:50": "CSEN2061P",
      "11:00-11:50": "CSEN2061P",
      "12:00-12:50": "MECH2331",
      "13:00-13:50": "",
      "14:00-14:50": "",
      "15:00-15:50": "",
      "16:00-16:50": "",
    },
    {
      day: "Friday",
      "08:00-08:50": "CSEN3001",
      "09:00-09:50": "CSEN3061",
      "10:00-10:50": "CSEN2081P",
      "11:00-11:50": "CSEN2081P",
      "12:00-12:50": "MECH2331",
      "13:00-13:50": "",
      "14:00-14:50": "CSEN2191P",
      "15:00-15:50": "CSEN2191P",
      "16:00-16:50": "",
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
      if (user.user_metadata?.role !== "student") {
        router.push("/auth/login")
        return
      }
      setUser(user)
    }
    getUser()
  }, [router, supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  if (!user) return <div>Loading...</div>

  const filteredAttendance = attendanceData.filter(
    (item) =>
      item.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.course_code.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.user_metadata?.full_name || "Student"}</p>
            <p className="text-sm text-gray-500">Department: {user?.user_metadata?.department || "Computer Science"}</p>
          </div>
          <Button onClick={handleSignOut} variant="outline">
            Sign Out
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="timetable">Timetable</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
          </TabsList>

          <TabsContent value="attendance" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Overall course attendance report</CardTitle>
                    <CardDescription>Your attendance breakdown by subject</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search courses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course Code</TableHead>
                      <TableHead>Course Name</TableHead>
                      <TableHead className="text-center">My course classes</TableHead>
                      <TableHead className="text-center">Present</TableHead>
                      <TableHead className="text-center">Absent</TableHead>
                      <TableHead className="text-center">Per(%)</TableHead>
                      <TableHead className="text-center">Overall classes</TableHead>
                      <TableHead className="text-center">Overall present</TableHead>
                      <TableHead className="text-center">Overall absent</TableHead>
                      <TableHead className="text-center">Overall per(%)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAttendance.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.course_code}</TableCell>
                        <TableCell>{item.course_name}</TableCell>
                        <TableCell className="text-center">{item.total_classes}</TableCell>
                        <TableCell className="text-center">{item.present}</TableCell>
                        <TableCell className="text-center">{item.absent}</TableCell>
                        <TableCell className="text-center">
                          <span
                            className={
                              item.percentage < 75 ? "text-red-600 font-semibold" : "text-green-600 font-semibold"
                            }
                          >
                            {item.percentage.toFixed(2)}%
                          </span>
                        </TableCell>
                        <TableCell className="text-center">{item.overall_classes}</TableCell>
                        <TableCell className="text-center">{item.overall_present}</TableCell>
                        <TableCell className="text-center">{item.overall_absent}</TableCell>
                        <TableCell className="text-center">
                          <span
                            className={
                              item.overall_percentage < 75
                                ? "text-red-600 font-semibold"
                                : "text-green-600 font-semibold"
                            }
                          >
                            {item.overall_percentage.toFixed(2)}%
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Course wise percentage</CardTitle>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    <span>Below 65</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>Above 65 or equal</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course code</TableHead>
                      <TableHead>Course name</TableHead>
                      <TableHead className="text-right">Percentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.course_code}</TableCell>
                        <TableCell>{item.course_name}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <span className="text-sm font-medium">{item.percentage.toFixed(2)}%</span>
                            <div className="w-32">
                              <Progress
                                value={item.percentage}
                                className="h-2"
                                style={
                                  {
                                    "--progress-background": item.percentage < 65 ? "#16a34a" : "#3b82f6",
                                  } as React.CSSProperties
                                }
                              />
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="daily" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Attendance</CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700">
                      Today
                    </Button>
                    <Button variant="outline" size="sm">
                      Yesterday
                    </Button>
                    <Button variant="outline" size="sm">
                      Calendar
                    </Button>
                    <Button variant="outline" size="sm">
                      Semester
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Course name</TableHead>
                      <TableHead>Faculty name</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dailyAttendance.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {item.date} {item.time}
                        </TableCell>
                        <TableCell>{item.course_name}</TableCell>
                        <TableCell>{item.faculty_name}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.status === "Present" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            {item.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-4 text-sm text-gray-500">Showing 1 to 6 of 6 entries</div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timetable" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Time table</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-green-100">
                        <TableHead className="bg-green-200">WEEKDAY</TableHead>
                        <TableHead className="text-center">08:00 to 08:50</TableHead>
                        <TableHead className="text-center">09:00 to 09:50</TableHead>
                        <TableHead className="text-center">10:00 to 10:50</TableHead>
                        <TableHead className="text-center">11:00 to 11:50</TableHead>
                        <TableHead className="text-center">12:00 to 12:50</TableHead>
                        <TableHead className="text-center">13:00 to 13:50</TableHead>
                        <TableHead className="text-center">14:00 to 14:50</TableHead>
                        <TableHead className="text-center">15:00 to 15:50</TableHead>
                        <TableHead className="text-center">16:00 to 16:50</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {timetable.map((day, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium bg-green-50">{day.day}</TableCell>
                          <TableCell className="text-center">{day["08:00-08:50"]}</TableCell>
                          <TableCell className="text-center">{day["09:00-09:50"]}</TableCell>
                          <TableCell className="text-center">{day["10:00-10:50"]}</TableCell>
                          <TableCell className="text-center">{day["11:00-11:50"]}</TableCell>
                          <TableCell className="text-center">{day["12:00-12:50"]}</TableCell>
                          <TableCell className="text-center">{day["13:00-13:50"]}</TableCell>
                          <TableCell className="text-center">{day["14:00-14:50"]}</TableCell>
                          <TableCell className="text-center">{day["15:00-15:50"]}</TableCell>
                          <TableCell className="text-center">{day["16:00-16:50"]}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Enrolled Courses</CardTitle>
                <CardDescription>Your registered courses for this semester</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {attendanceData.map((course, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{course.course_code}</CardTitle>
                        <CardDescription className="text-sm">{course.course_name}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Attendance:</span>
                            <span
                              className={
                                course.percentage < 75 ? "text-red-600 font-semibold" : "text-green-600 font-semibold"
                              }
                            >
                              {course.percentage.toFixed(1)}%
                            </span>
                          </div>
                          <Progress value={course.percentage} className="h-2" />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Present: {course.present}</span>
                            <span>Total: {course.total_classes}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
