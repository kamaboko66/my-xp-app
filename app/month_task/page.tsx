"use client"

import { useEffect, useState, FormEvent } from "react"
import { supabase } from "../../utils/supabaseClient"
import { format } from "date-fns"
import { ja } from "date-fns/locale"

type Task = {
  id: string
  title: string
  xp: number
  date: string
}

export default function MonthTaskPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())

  useEffect(() => {
    fetchTasks()
  }, [])

  // 🔹 タスク読み込み
  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("date", { ascending: false })

    if (error) console.error("Fetch error:", error)
    else setTasks(data as Task[])
  }

  // 🔹 タスク追加
  const addTask = async (title: string, xp: number, date: string) => {
    const newTask = { title, xp, date }
    const { error } = await supabase.from("tasks").insert([newTask])
    if (error) {
      console.error("Insert error:", error)
      return
    }

    // ✅ XP加算
    const { error: xpError } = await supabase.rpc("increment_xp", {
      xp_to_add: xp,
    })
    if (xpError) console.error("XP increment error:", xpError)

    fetchTasks()
  }

  // 🔹 タスク削除
  const deleteTask = async (task: Task) => {
    const { error } = await supabase.from("tasks").delete().eq("id", task.id)
    if (error) {
      console.error("Delete error:", error)
      return
    }

    // ✅ XP減算
    const { error: xpError } = await supabase.rpc("decrement_xp", {
      xp_to_subtract: task.xp,
    })
    if (xpError) console.error("XP decrement error:", xpError)

    fetchTasks()
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold text-center">月ごとのXP履歴</h1>

      {/* カレンダー（日付選択） */}
      <input
        type="date"
        value={format(selectedDate, "yyyy-MM-dd")}
        onChange={(e) => setSelectedDate(new Date(e.target.value))}
        className="border p-2 rounded w-full"
      />

      {/* 当日のタスク一覧 */}
      <div className="space-y-2">
        {tasks
          .filter(
            (task) =>
              format(new Date(task.date), "yyyy-MM-dd") ===
              format(selectedDate, "yyyy-MM-dd")
          )
          .map((task) => (
            <div
              key={task.id}
              className="flex justify-between items-center bg-gray-100 p-3 rounded-lg"
            >
              <div>
                <p className="font-semibold">{task.title}</p>
                <p className="text-sm text-gray-600">{task.xp} XP</p>
              </div>
              <button
                onClick={() => deleteTask(task)}
                className="text-red-500 font-bold"
              >
                ✕
              </button>
            </div>
          ))}
      </div>

      {/* タスク追加フォーム */}
      <AddTaskForm onAdd={addTask} defaultDate={selectedDate} />
    </div>
  )
}

// 🔹 AddTaskForm に型注釈を追加
type AddTaskFormProps = {
  onAdd: (title: string, xp: number, date: string) => void
  defaultDate: Date
}

function AddTaskForm({ onAdd, defaultDate }: AddTaskFormProps) {
  const [title, setTitle] = useState("")
  const [xp, setXp] = useState(0)
  const [date, setDate] = useState(format(defaultDate, "yyyy-MM-dd"))

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onAdd(title, xp, date)
    setTitle("")
    setXp(0)
  }

  return (
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
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="border p-2 rounded w-full"
      />
      <button
        type="submit"
        className="w-full bg-blue-500 text-white p-2 rounded-lg font-semibold"
      >
        追加
      </button>
    </form>
  )
}
