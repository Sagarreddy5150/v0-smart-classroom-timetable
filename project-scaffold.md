// Repository: smart-timetable
// This single file lists the full project scaffold. Create files by copying the sections below into their respective paths.

// ============= file: README.md =============
# Smart Timetable Scheduler — Full Project Scaffold

This repo contains a minimal, runnable full-stack timetable scheduler (MVP) with:
- React + Vite frontend (Tailwind)
- Node.js + Express backend (simple greedy scheduler)
- Docker + docker-compose for running both

Quick start (local):
1. `cd backend && npm install && node server.js`
2. `cd frontend && npm install && npm run dev`

Or run with Docker: `docker-compose up --build`


// ============= file: docker-compose.yml =============
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "4000:4000"
  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://host.docker.internal:4000


// ============= file: backend/Dockerfile =============
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 4000
CMD ["node","server.js"]


// ============= file: frontend/Dockerfile =============
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 5173
CMD ["npm","run","dev","--","--host","0.0.0.0"]


// ============= file: backend/package.json =============
{
  "name": "smart-timetable-backend",
  "version": "1.0.0",
  "main": "server.js",
  "license": "MIT",
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "body-parser": "^1.20.2",
    "nodemon": "^2.0.22"
  },
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}


// ============= file: backend/server.js =============
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { generateTimetable } = require('./scheduler');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Simple in-memory store (for demo)
let DB = {
  courses: [],
  rooms: [],
  timeslots: ["Mon-9","Mon-11","Mon-14","Tue-9","Tue-11","Tue-14","Wed-9","Wed-11","Wed-14"],
};

app.get('/api/schema', (req, res) => res.json(DB));

app.post('/api/course', (req, res) => {
  const course = req.body;
  course.id = (DB.courses.length+1).toString();
  DB.courses.push(course);
  res.json({ok:true, course});
});

app.post('/api/room', (req, res) => {
  const room = req.body; room.id = (DB.rooms.length+1).toString();
  DB.rooms.push(room);
  res.json({ok:true, room});
});

app.post('/api/generate', (req, res) => {
  // optionally accept custom constraints
  const timetable = generateTimetable(DB.courses, DB.rooms, DB.timeslots);
  res.json({ok:true, timetable});
});

app.post('/api/reset', (req, res) => { DB.courses=[]; DB.rooms=[]; res.json({ok:true}); });

const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=> console.log(`Backend listening ${PORT}`));


// ============= file: backend/scheduler.js =============
// A small greedy scheduler implemented in JS for portability.

function generateTimetable(courses, rooms, timeslots) {
  // courses: [{id,name,teacher,students,preferredSlots:[...],duration:1}]
  // rooms: [{id,name,capacity}]
  // timeslots: ["Mon-9",...]

  // Sort courses by descending students (larger first)
  const bySize = [...courses].sort((a,b)=> (b.students||0)-(a.students||0));
  const assignments = [];
  const occupied = {}; // key = slot+room

  for (const c of bySize) {
    let placed = false;
    const prefs = c.preferredSlots && c.preferredSlots.length ? c.preferredSlots : timeslots;
    for (const slot of prefs) {
      for (const r of rooms) {
        const key = `${slot}::${r.id}`;
        if (occupied[key]) continue;
        if (r.capacity < (c.students||0)) continue;
        // assign
        occupied[key]=true;
        assignments.push({courseId:c.id, courseName:c.name, roomId:r.id, roomName:r.name, slot});
        placed=true; break;
      }
      if (placed) break;
    }
    if (!placed) assignments.push({courseId:c.id, courseName:c.name, roomId:null, roomName:null, slot:null, note:'unplaced'});
  }

  return assignments;
}

module.exports = { generateTimetable };


// ============= file: backend/sample-data.json =============
{
  "courses": [
    {"name":"Algorithms","teacher":"Prof A","students":50,"preferredSlots":["Mon-9","Tue-9"]},
    {"name":"Databases","teacher":"Prof B","students":40},
    {"name":"ML","teacher":"Prof C","students":80,"preferredSlots":["Wed-9"]}
  ],
  "rooms": [
    {"name":"Room 101","capacity":60},
    {"name":"Lab A","capacity":100},
    {"name":"Room 102","capacity":40}
  ]
}


// ============= file: frontend/package.json =============
{
  "name": "smart-timetable-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.4.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "tailwindcss": "^4.0.0",
    "postcss": "^8.0.0",
    "autoprefixer": "^10.0.0"
  }
}


// ============= file: frontend/vite.config.js =============
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()]
})


// ============= file: frontend/index.html =============
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Smart Timetable</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>


// ============= file: frontend/src/main.jsx =============
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

createRoot(document.getElementById('root')).render(<App />)


// ============= file: frontend/src/App.jsx =============
import React, {useEffect, useState} from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export default function App(){
  const [schema, setSchema] = useState({courses:[],rooms:[],timeslots:[]})
  const [courseForm, setCourseForm] = useState({name:'',teacher:'',students:30,preferredSlots:[]})
  const [roomForm, setRoomForm] = useState({name:'',capacity:50})
  const [timetable, setTimetable] = useState([])

  useEffect(()=>{ loadSchema() },[])
  async function loadSchema(){ const r = await axios.get(API+'/api/schema'); setSchema(r.data) }

  async function addCourse(e){ e.preventDefault(); await axios.post(API+'/api/course', courseForm); setCourseForm({name:'',teacher:'',students:30,preferredSlots:[]}); loadSchema(); }
  async function addRoom(e){ e.preventDefault(); await axios.post(API+'/api/room', roomForm); setRoomForm({name:'',capacity:50}); loadSchema(); }
  async function generate(){ const r = await axios.post(API+'/api/generate'); setTimetable(r.data.timetable); }
  async function reset(){ await axios.post(API+'/api/reset'); setTimetable([]); loadSchema(); }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Smart Timetable — MVP</h1>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 border rounded">
          <h2 className="font-semibold">Add Course</h2>
          <form onSubmit={addCourse} className="space-y-2">
            <input className="w-full p-2 border" placeholder="Course name" value={courseForm.name} onChange={e=>setCourseForm({...courseForm,name:e.target.value})} required />
            <input className="w-full p-2 border" placeholder="Teacher" value={courseForm.teacher} onChange={e=>setCourseForm({...courseForm,teacher:e.target.value})} />
            <input type="number" className="w-full p-2 border" value={courseForm.students} onChange={e=>setCourseForm({...courseForm,students:parseInt(e.target.value||0)})} />
            <button className="px-3 py-2 bg-slate-700 text-white rounded">Add</button>
          </form>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold">Add Room</h2>
          <form onSubmit={addRoom} className="space-y-2">
            <input className="w-full p-2 border" placeholder="Room name" value={roomForm.name} onChange={e=>setRoomForm({...roomForm,name:e.target.value})} required />
            <input type="number" className="w-full p-2 border" value={roomForm.capacity} onChange={e=>setRoomForm({...roomForm,capacity:parseInt(e.target.value||0)})} />
            <button className="px-3 py-2 bg-slate-700 text-white rounded">Add</button>
          </form>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button onClick={generate} className="px-4 py-2 bg-blue-600 text-white rounded">Generate Timetable</button>
        <button onClick={reset} className="px-4 py-2 bg-red-600 text-white rounded">Reset</button>
        <button onClick={loadSchema} className="px-4 py-2 border rounded">Refresh</button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="p-4 border rounded">
          <h3 className="font-semibold">Schema</h3>
          <div className="mt-2 text-sm">
            <div><strong>Timeslots:</strong> {schema.timeslots?.join(', ')}</div>
            <div className="mt-2"><strong>Rooms:</strong>
              <ul>{schema.rooms?.map(r=> <li key={r.id}>{r.name} (cap {r.capacity})</li>)}</ul>
            </div>
            <div className="mt-2"><strong>Courses:</strong>
              <ul>{schema.courses?.map(c=> <li key={c.id}>{c.name} — {c.teacher} ({c.students} students)</li>)}</ul>
            </div>
          </div>
        </div>

        <div className="p-4 border rounded">
          <h3 className="font-semibold">Generated Timetable</h3>
          <div className="mt-2">
            <table className="w-full text-sm">
              <thead><tr><th>Course</th><th>Room</th><th>Slot</th></tr></thead>
              <tbody>
                {timetable.map((t,i)=> (
                  <tr key={i} className={t.roomId? '':'text-red-600'}>
                    <td>{t.courseName}</td>
                    <td>{t.roomName||'—'}</td>
                    <td>{t.slot||'—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mt-6 text-xs text-gray-600">This is an MVP. For production: add authentication, persistence (DB), advanced solver, conflict checking, notifications and UI polish.</div>
    </div>
  )
}


// ============= file: frontend/src/styles.css =============
@tailwind base;
@tailwind components;
@tailwind utilities;

body { font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; }


// ============= file: frontend/tailwind.config.cjs =============
module.exports = {
  content: ['./index.html','./src/**/*.{js,jsx,ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
}


// ============= file: .gitignore =============
node_modules
dist
.env


// ============= Notes =============
// This scaffold is designed to be a fast MVP to demonstrate a working full-stack website.
// Next enhancements you might ask me to add (I can implement immediately):
// - Persist data with SQLite or Postgres
// - Replace greedy scheduler with OR-Tools Python solver (via a microservice)
// - Add authentication (JWT)
// - Add calendar export, CSV, and printable timetables
// - Improve frontend with drag & drop timetable editing and conflict highlighting

// End of scaffold
