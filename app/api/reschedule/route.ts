import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is authenticated and is admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (!userData || userData.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { facultyId, unavailableFrom, unavailableTo, reason } = await request.json()

    // Get affected timetable slots
    const { data: affectedSlots } = await supabase
      .from("timetable_slots")
      .select(`
        *,
        subjects (code, name),
        rooms (room_number, name)
      `)
      .eq("faculty_id", facultyId)
      .eq("is_active", true)

    if (!affectedSlots || affectedSlots.length === 0) {
      return NextResponse.json({ message: "No affected slots found" })
    }

    // Find available substitute faculty for each subject
    const reschedulingResults = []

    for (const slot of affectedSlots) {
      // Find faculty who can teach this subject and are available at this time
      const { data: potentialSubstitutes } = await supabase
        .from("faculty_subjects")
        .select(`
          faculty_id,
          users (id, full_name, email)
        `)
        .eq("subject_id", slot.subject_id)
        .neq("faculty_id", facultyId)

      // Check availability of potential substitutes
      let assignedSubstitute = null

      if (potentialSubstitutes && potentialSubstitutes.length > 0) {
        for (const substitute of potentialSubstitutes) {
          // Check if substitute has conflicting slots
          const { data: conflicts } = await supabase
            .from("timetable_slots")
            .select("id")
            .eq("faculty_id", substitute.faculty_id)
            .eq("day_of_week", slot.day_of_week)
            .eq("start_time", slot.start_time)
            .eq("is_active", true)

          if (!conflicts || conflicts.length === 0) {
            // No conflicts, assign this substitute
            assignedSubstitute = substitute
            break
          }
        }
      }

      if (assignedSubstitute) {
        // Create new slot with substitute faculty
        const { error: insertError } = await supabase.from("timetable_slots").insert({
          subject_id: slot.subject_id,
          faculty_id: assignedSubstitute.faculty_id,
          room_id: slot.room_id,
          day_of_week: slot.day_of_week,
          start_time: slot.start_time,
          end_time: slot.end_time,
          academic_year: slot.academic_year,
          semester: slot.semester,
          is_active: true,
        })

        if (!insertError) {
          // Deactivate original slot
          await supabase.from("timetable_slots").update({ is_active: false }).eq("id", slot.id)

          reschedulingResults.push({
            originalSlot: slot,
            substitute: assignedSubstitute.users,
            status: "rescheduled",
          })
        } else {
          reschedulingResults.push({
            originalSlot: slot,
            substitute: null,
            status: "failed",
            error: insertError.message,
          })
        }
      } else {
        // No substitute available
        reschedulingResults.push({
          originalSlot: slot,
          substitute: null,
          status: "no_substitute",
        })
      }
    }

    // Record the faculty unavailability
    await supabase.from("faculty_availability").insert({
      faculty_id: facultyId,
      unavailable_from: unavailableFrom,
      unavailable_to: unavailableTo,
      reason: reason,
    })

    return NextResponse.json({
      message: "Rescheduling completed",
      results: reschedulingResults,
      summary: {
        total: affectedSlots.length,
        rescheduled: reschedulingResults.filter((r) => r.status === "rescheduled").length,
        noSubstitute: reschedulingResults.filter((r) => r.status === "no_substitute").length,
        failed: reschedulingResults.filter((r) => r.status === "failed").length,
      },
    })
  } catch (error) {
    console.error("Rescheduling error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
