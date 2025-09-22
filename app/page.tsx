import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { GraduationCap, Users, Calendar, BookOpen, Shield, TrendingUp } from "lucide-react"

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    // Get user role and redirect to appropriate dashboard
    const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (userData?.role === "admin") {
      redirect("/admin")
    } else if (userData?.role === "faculty") {
      redirect("/faculty")
    } else if (userData?.role === "student") {
      redirect("/student")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-bold">ST</span>
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-gray-900">Smart Timetable System</h1>
                <p className="text-sm text-gray-600">GITAM University</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button asChild variant="outline">
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <GraduationCap className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Smart Classroom
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
                Timetable System
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Revolutionize academic scheduling with AI-powered timetable generation, real-time attendance tracking, and
              intelligent resource management for modern universities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
              >
                <Link href="/auth/signup">Start Free Trial</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Smart Scheduling
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive features designed for administrators, faculty, and students
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Admin Features */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle>Admin Dashboard</CardTitle>
                <CardDescription>Complete system management and oversight</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• User management (Students, Faculty, Admins)</li>
                  <li>• Subject and room configuration</li>
                  <li>• Automated timetable generation</li>
                  <li>• System analytics and reporting</li>
                  <li>• Dynamic rescheduling capabilities</li>
                </ul>
              </CardContent>
            </Card>

            {/* Faculty Features */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Faculty Portal</CardTitle>
                <CardDescription>Streamlined teaching and attendance management</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Digital attendance marking</li>
                  <li>• Personal schedule management</li>
                  <li>• Unavailability reporting</li>
                  <li>• Substitute faculty coordination</li>
                  <li>• Student progress tracking</li>
                </ul>
              </CardContent>
            </Card>

            {/* Student Features */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Student Dashboard</CardTitle>
                <CardDescription>Personalized academic experience</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Personal timetable view</li>
                  <li>• Attendance history and analytics</li>
                  <li>• Course enrollment tracking</li>
                  <li>• Real-time schedule updates</li>
                  <li>• Academic progress monitoring</li>
                </ul>
              </CardContent>
            </Card>

            {/* Smart Scheduling */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Smart Scheduling</CardTitle>
                <CardDescription>AI-powered conflict-free timetables</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Automated conflict detection</li>
                  <li>• Optimal room allocation</li>
                  <li>• Faculty workload balancing</li>
                  <li>• Resource utilization optimization</li>
                  <li>• Multiple scheduling algorithms</li>
                </ul>
              </CardContent>
            </Card>

            {/* Analytics */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                </div>
                <CardTitle>Advanced Analytics</CardTitle>
                <CardDescription>Data-driven insights and reporting</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Room utilization metrics</li>
                  <li>• Faculty workload analysis</li>
                  <li>• Attendance trend reporting</li>
                  <li>• System performance monitoring</li>
                  <li>• Predictive scheduling insights</li>
                </ul>
              </CardContent>
            </Card>

            {/* Dynamic Rescheduling */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>Dynamic Rescheduling</CardTitle>
                <CardDescription>Intelligent adaptation to changes</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Automatic substitute assignment</li>
                  <li>• Real-time conflict resolution</li>
                  <li>• Emergency rescheduling</li>
                  <li>• Stakeholder notifications</li>
                  <li>• Minimal disruption optimization</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-amber-600 to-orange-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Academic Scheduling?
          </h2>
          <p className="text-xl text-amber-100 mb-8">
            Join thousands of educational institutions already using Smart Timetable System
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-amber-600 hover:bg-gray-100">
              <Link href="/auth/signup">Get Started Today</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-amber-600 bg-transparent"
            >
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-600 to-orange-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white text-sm font-bold">ST</span>
              </div>
              <div>
                <div className="font-semibold">Smart Timetable System</div>
                <div className="text-sm text-gray-400">GITAM University</div>
              </div>
            </div>
            <div className="text-sm text-gray-400">© 2024 Smart Timetable System. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
