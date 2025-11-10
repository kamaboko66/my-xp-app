"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../utils/supabaseClient"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import Calendar from "react-calendar"
import "react-calendar/dist/Calendar.css"

type Task = {
  id: string
  title: string
  xp: number
  date: string
}

export default function MonthTaskPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [showEditor, setShowEditor] = useState(false)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("date", { ascending: false })

    if (error) console.error("Fetch error:", error)
    else setTasks(data || [])
  }

  const addTask = async (title: string, xp: number, date: string) => {
    const newTask = { title, xp, date }
    const { error } = await supabase.from("tasks").insert([newTask])
    if (error) {
      console.error("Insert error:", error)
      return
    }

    const { error: xpError } = await supabase.rpc("increment_xp", {
      xp_to_add: xp,
    })
    if (xpError) console.error("XP increment error:", xpError)
    fetchTasks()
  }

  const deleteTask = async (task: Task) => {
    const { error } = await supabase.from("tasks").delete().eq("id", task.id)
    if (error) {
      console.error("Delete error:", error)
      return
    }

    const { error: xpError } = await supabase.rpc("decrement_xp", {
      xp_to_subtract: task.xp,
    })
    if (xpError) console.error("XP decrement error:", xpError)
    fetchTasks()
  }

  const handleDayClick = (value: Date) => {
    setSelectedDate(value)
    setShowEditor(true)
  }

  return (
    <div className="flex flex-col items-center w-full min-h-screen p-4 bg-gray-50">
      <h1 className="text-xl font-bold text-center mb-4">月ごとのXP履歴</h1>

      {/* 🗓 カレンダー */}
      <div className="flex justify-center w-full mb-4">
        <div
          className="
            w-[95%] sm:w-[90%] md:w-[700px] lg:w-[900px]
            flex justify-center
          "
        >
          <div className="bg-white rounded-2xl shadow-lg p-4 w-full flex justify-center">
            <Calendar
              onClickDay={handleDayClick}
              value={selectedDate}
              locale="ja-JP"
              className="!w-full !max-w-none scale-[1.05] md:scale-[1.2] lg:scale-[1.3]"
            />
          </div>
        </div>
      </div>

      {/* 📅 編集画面 */}
      {showEditor && (
        <div className="w-full fixed bottom-24 bg-white rounded-t-2xl shadow-lg border-t border-gray-200 p-4 z-20 overflow-y-auto max-h-[60vh]">
          <TaskEditor
            date={selectedDate}
            tasks={tasks.filter(
              (t) =>
                format(new Date(t.date), "yyyy-MM-dd") ===
                format(selectedDate, "yyyy-MM-dd")
            )}
            onClose={() => setShowEditor(false)}
            onAdd={addTask}
            onDelete={deleteTask}
          />
        </div>
      )}
    </div>
  )
}

function TaskEditor({
  date,
  tasks,
  onClose,
  onAdd,
  onDelete,
}: {
  date: Date
  tasks: Task[]
  onClose: () => void
  onAdd: (title: string, xp: number, date: string) => void
  onDelete: (task: Task) => void
}) {
  const [title, setTitle] = useState("")
  const [xp, setXp] = useState(0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd(title, xp, format(date, "yyyy-MM-dd"))
    setTitle("")
    setXp(0)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">
          {format(date, "yyyy年MM月dd日", { locale: ja })}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-800 text-2xl"
        >
          ✕
        </button>
      </div>

      <div className="space-y-2">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <div
              key={task.id}
              className="flex justify-between items-center bg-gray-100 p-3 rounded-lg"
            >
              <div>
                <p className="font-semibold">{task.title}</p>
                <p className="text-sm text-gray-600">{task.xp} XP</p>
              </div>
              <button
                onClick={() => onDelete(task)}
                className="text-red-500 font-bold"
              >
                ✕
              </button>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 text-center">
            この日にタスクはありません
          </p>
        )}
      </div>

      {/* ➕ タスク追加フォーム */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="タスク名"
          className="border p-2 rounded w-full"
          required
        />
        <input
          type="number"
          value={xp}
          onChange={(e) => setXp(Number(e.target.value))}
          placeholder="XP"
          className="border p-2 rounded w-full"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded-lg font-semibold"
        >
          追加
        </button>
      </form>
    </div>
  )
}
