// Advanced scheduling algorithms for optimal timetable generation

export interface Course {
  id: string
  name: string
  category: string
  teacher: string
  students: number
  duration: number
  preferredSlots?: string[]
  preferredDays?: string[]
  priority?: number
}

export interface Room {
  id: string
  name: string
  capacity: number
  type: string
  equipment?: string[]
}

export interface TimeSlot {
  day: string
  time: string
  index: number
}

export interface Assignment {
  courseId: string
  courseName: string
  category: string
  teacher: string
  roomId: string | null
  roomName: string
  day: string | null
  slot: string | null
  students: number
  conflict?: boolean
  score?: number
}

export interface SchedulerOptions {
  algorithm: "greedy" | "genetic" | "backtrack"
  maxIterations?: number
  populationSize?: number
  mutationRate?: number
  priorities?: {
    roomCapacity: number
    teacherConflict: number
    timePreference: number
    roomType: number
  }
}

class AdvancedScheduler {
  private courses: Course[]
  private rooms: Room[]
  private timeSlots: TimeSlot[]
  private options: SchedulerOptions

  constructor(courses: Course[], rooms: Room[], days: string[], slots: string[], options: SchedulerOptions) {
    this.courses = courses
    this.rooms = rooms
    this.timeSlots = this.generateTimeSlots(days, slots)
    this.options = {
      maxIterations: 1000,
      populationSize: 50,
      mutationRate: 0.1,
      priorities: {
        roomCapacity: 10,
        teacherConflict: 15,
        timePreference: 5,
        roomType: 3,
      },
      ...options,
    }
  }

  private generateTimeSlots(days: string[], slots: string[]): TimeSlot[] {
    const timeSlots: TimeSlot[] = []
    let index = 0

    for (const day of days) {
      for (const time of slots) {
        timeSlots.push({ day, time, index: index++ })
      }
    }

    return timeSlots
  }

  public generateTimetable(): Assignment[] {
    switch (this.options.algorithm) {
      case "genetic":
        return this.geneticAlgorithm()
      case "backtrack":
        return this.backtrackingAlgorithm()
      default:
        return this.improvedGreedyAlgorithm()
    }
  }

  private improvedGreedyAlgorithm(): Assignment[] {
    const assignments: Assignment[] = []
    const occupied = new Map<string, boolean>()
    const teacherSchedule = new Map<string, Set<string>>()

    // Sort courses by priority score
    const sortedCourses = [...this.courses].sort((a, b) => {
      const scoreA = this.calculateCoursePriority(a)
      const scoreB = this.calculateCoursePriority(b)
      return scoreB - scoreA
    })

    for (const course of sortedCourses) {
      const bestAssignment = this.findBestSlot(course, occupied, teacherSchedule)

      if (bestAssignment) {
        const key = `${bestAssignment.day}-${bestAssignment.slot}-${bestAssignment.roomId}`
        occupied.set(key, true)

        if (!teacherSchedule.has(course.teacher)) {
          teacherSchedule.set(course.teacher, new Set())
        }
        teacherSchedule.get(course.teacher)!.add(`${bestAssignment.day}-${bestAssignment.slot}`)

        assignments.push(bestAssignment)
      } else {
        // Course couldn't be scheduled
        assignments.push({
          courseId: course.id,
          courseName: course.name,
          category: course.category,
          teacher: course.teacher,
          roomId: null,
          roomName: "Unassigned",
          day: null,
          slot: null,
          students: course.students,
          conflict: true,
          score: 0,
        })
      }
    }

    return assignments
  }

  private calculateCoursePriority(course: Course): number {
    let score = 0

    // Larger classes get higher priority
    score += course.students * 0.5

    // Courses with specific preferences get higher priority
    if (course.preferredSlots && course.preferredSlots.length > 0) {
      score += 20
    }

    // Manual priority override
    if (course.priority) {
      score += course.priority * 10
    }

    return score
  }

  private findBestSlot(
    course: Course,
    occupied: Map<string, boolean>,
    teacherSchedule: Map<string, Set<string>>,
  ): Assignment | null {
    let bestAssignment: Assignment | null = null
    let bestScore = -1

    const slotsToTry =
      course.preferredSlots && course.preferredSlots.length > 0
        ? this.timeSlots.filter((ts) => course.preferredSlots!.includes(ts.time))
        : this.timeSlots

    for (const timeSlot of slotsToTry) {
      for (const room of this.rooms) {
        const key = `${timeSlot.day}-${timeSlot.time}-${room.id}`

        if (occupied.get(key)) continue
        if (room.capacity < course.students) continue

        // Check teacher conflict
        const teacherKey = `${timeSlot.day}-${timeSlot.time}`
        if (teacherSchedule.get(course.teacher)?.has(teacherKey)) continue

        const score = this.calculateAssignmentScore(course, room, timeSlot)

        if (score > bestScore) {
          bestScore = score
          bestAssignment = {
            courseId: course.id,
            courseName: course.name,
            category: course.category,
            teacher: course.teacher,
            roomId: room.id,
            roomName: room.name,
            day: timeSlot.day,
            slot: timeSlot.time,
            students: course.students,
            score,
          }
        }
      }
    }

    return bestAssignment
  }

  private calculateAssignmentScore(course: Course, room: Room, timeSlot: TimeSlot): number {
    let score = 100 // Base score

    // Room capacity efficiency (prefer rooms that fit well)
    const capacityRatio = course.students / room.capacity
    if (capacityRatio > 0.7 && capacityRatio <= 1.0) {
      score += this.options.priorities!.roomCapacity
    } else if (capacityRatio > 1.0) {
      score -= this.options.priorities!.roomCapacity * 2 // Penalty for overcapacity
    }

    // Room type matching
    if (this.isRoomTypeMatch(course, room)) {
      score += this.options.priorities!.roomType
    }

    // Time preference
    if (course.preferredSlots?.includes(timeSlot.time)) {
      score += this.options.priorities!.timePreference
    }

    // Day preference
    if (course.preferredDays?.includes(timeSlot.day)) {
      score += this.options.priorities!.timePreference
    }

    return score
  }

  private isRoomTypeMatch(course: Course, room: Room): boolean {
    const typeMatches: Record<string, string[]> = {
      "Computer Science": ["Computer Lab", "Laboratory"],
      Engineering: ["Laboratory", "Engineering Lab"],
      Sciences: ["Laboratory", "Science Lab"],
      Business: ["Classroom", "Seminar Room"],
      Mathematics: ["Classroom", "Lecture Hall"],
      "Liberal Arts": ["Classroom", "Seminar Room"],
    }

    const preferredTypes = typeMatches[course.category] || ["Classroom"]
    return preferredTypes.includes(room.type)
  }

  private geneticAlgorithm(): Assignment[] {
    // Simplified genetic algorithm implementation
    let population = this.generateInitialPopulation()

    for (let generation = 0; generation < this.options.maxIterations!; generation++) {
      population = this.evolvePopulation(population)
    }

    // Return the best solution
    const bestSolution = population.reduce((best, current) =>
      this.calculateSolutionFitness(current) > this.calculateSolutionFitness(best) ? current : best,
    )

    return bestSolution
  }

  private generateInitialPopulation(): Assignment[][] {
    const population: Assignment[][] = []

    for (let i = 0; i < this.options.populationSize!; i++) {
      population.push(this.generateRandomSolution())
    }

    return population
  }

  private generateRandomSolution(): Assignment[] {
    const assignments: Assignment[] = []
    const occupied = new Set<string>()
    const shuffledCourses = [...this.courses].sort(() => Math.random() - 0.5)

    for (const course of shuffledCourses) {
      const availableSlots = this.timeSlots.filter((ts) => {
        return this.rooms.some((room) => {
          const key = `${ts.day}-${ts.time}-${room.id}`
          return !occupied.has(key) && room.capacity >= course.students
        })
      })

      if (availableSlots.length > 0) {
        const randomSlot = availableSlots[Math.floor(Math.random() * availableSlots.length)]
        const availableRooms = this.rooms.filter((room) => {
          const key = `${randomSlot.day}-${randomSlot.time}-${room.id}`
          return !occupied.has(key) && room.capacity >= course.students
        })

        if (availableRooms.length > 0) {
          const randomRoom = availableRooms[Math.floor(Math.random() * availableRooms.length)]
          const key = `${randomSlot.day}-${randomSlot.time}-${randomRoom.id}`
          occupied.add(key)

          assignments.push({
            courseId: course.id,
            courseName: course.name,
            category: course.category,
            teacher: course.teacher,
            roomId: randomRoom.id,
            roomName: randomRoom.name,
            day: randomSlot.day,
            slot: randomSlot.time,
            students: course.students,
          })
        }
      }
    }

    return assignments
  }

  private evolvePopulation(population: Assignment[][]): Assignment[][] {
    const newPopulation: Assignment[][] = []

    // Keep best solutions (elitism)
    const sortedPopulation = population.sort(
      (a, b) => this.calculateSolutionFitness(b) - this.calculateSolutionFitness(a),
    )

    const eliteCount = Math.floor(this.options.populationSize! * 0.2)
    newPopulation.push(...sortedPopulation.slice(0, eliteCount))

    // Generate new solutions through crossover and mutation
    while (newPopulation.length < this.options.populationSize!) {
      const parent1 = this.selectParent(population)
      const parent2 = this.selectParent(population)
      let child = this.crossover(parent1, parent2)

      if (Math.random() < this.options.mutationRate!) {
        child = this.mutate(child)
      }

      newPopulation.push(child)
    }

    return newPopulation
  }

  private calculateSolutionFitness(solution: Assignment[]): number {
    let fitness = 0
    const conflicts = new Set<string>()

    for (const assignment of solution) {
      if (assignment.roomId && assignment.day && assignment.slot) {
        const key = `${assignment.day}-${assignment.slot}-${assignment.roomId}`
        if (conflicts.has(key)) {
          fitness -= 50 // Penalty for conflicts
        } else {
          conflicts.add(key)
          fitness += 10 // Reward for successful assignment
        }

        // Additional scoring based on preferences
        fitness += assignment.score || 0
      }
    }

    return fitness
  }

  private selectParent(population: Assignment[][]): Assignment[] {
    // Tournament selection
    const tournamentSize = 3
    let best = population[Math.floor(Math.random() * population.length)]

    for (let i = 1; i < tournamentSize; i++) {
      const candidate = population[Math.floor(Math.random() * population.length)]
      if (this.calculateSolutionFitness(candidate) > this.calculateSolutionFitness(best)) {
        best = candidate
      }
    }

    return best
  }

  private crossover(parent1: Assignment[], parent2: Assignment[]): Assignment[] {
    // Simple crossover: take first half from parent1, second half from parent2
    const crossoverPoint = Math.floor(parent1.length / 2)
    return [...parent1.slice(0, crossoverPoint), ...parent2.slice(crossoverPoint)]
  }

  private mutate(solution: Assignment[]): Assignment[] {
    // Simple mutation: randomly reassign one course
    if (solution.length === 0) return solution

    const mutatedSolution = [...solution]
    const randomIndex = Math.floor(Math.random() * mutatedSolution.length)

    // Try to find a new assignment for this course
    const course = this.courses.find((c) => c.id === mutatedSolution[randomIndex].courseId)
    if (course) {
      const occupied = new Map<string, boolean>()
      solution.forEach((assignment, idx) => {
        if (idx !== randomIndex && assignment.roomId && assignment.day && assignment.slot) {
          occupied.set(`${assignment.day}-${assignment.slot}-${assignment.roomId}`, true)
        }
      })

      const newAssignment = this.findBestSlot(course, occupied, new Map())
      if (newAssignment) {
        mutatedSolution[randomIndex] = newAssignment
      }
    }

    return mutatedSolution
  }

  private backtrackingAlgorithm(): Assignment[] {
    const assignments: Assignment[] = []
    const occupied = new Map<string, boolean>()
    const teacherSchedule = new Map<string, Set<string>>()

    if (this.backtrack(0, assignments, occupied, teacherSchedule)) {
      return assignments
    }

    // If backtracking fails, fall back to greedy
    return this.improvedGreedyAlgorithm()
  }

  private backtrack(
    courseIndex: number,
    assignments: Assignment[],
    occupied: Map<string, boolean>,
    teacherSchedule: Map<string, Set<string>>,
  ): boolean {
    if (courseIndex >= this.courses.length) {
      return true // All courses assigned
    }

    const course = this.courses[courseIndex]

    for (const timeSlot of this.timeSlots) {
      for (const room of this.rooms) {
        const key = `${timeSlot.day}-${timeSlot.time}-${room.id}`
        const teacherKey = `${timeSlot.day}-${timeSlot.time}`

        if (occupied.get(key)) continue
        if (room.capacity < course.students) continue
        if (teacherSchedule.get(course.teacher)?.has(teacherKey)) continue

        // Try this assignment
        occupied.set(key, true)
        if (!teacherSchedule.has(course.teacher)) {
          teacherSchedule.set(course.teacher, new Set())
        }
        teacherSchedule.get(course.teacher)!.add(teacherKey)

        assignments.push({
          courseId: course.id,
          courseName: course.name,
          category: course.category,
          teacher: course.teacher,
          roomId: room.id,
          roomName: room.name,
          day: timeSlot.day,
          slot: timeSlot.time,
          students: course.students,
        })

        if (this.backtrack(courseIndex + 1, assignments, occupied, teacherSchedule)) {
          return true
        }

        // Backtrack
        occupied.delete(key)
        teacherSchedule.get(course.teacher)!.delete(teacherKey)
        assignments.pop()
      }
    }

    return false
  }
}

export function generateOptimalTimetable(
  courses: Course[],
  rooms: Room[],
  days: string[],
  timeSlots: string[],
  options: SchedulerOptions = { algorithm: "greedy" },
): Assignment[] {
  const scheduler = new AdvancedScheduler(courses, rooms, days, timeSlots, options)
  return scheduler.generateTimetable()
}
