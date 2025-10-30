"use client"

import { useState, useEffect } from "react"
import { PieChart, Pie, Cell } from "recharts"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

type Task = {
  id: string
  title: string
  xp: number
}

type Profile = {
  id: string
  level: number
  xp: number
}

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [xpToNextLevel, setXpToNextLevel] = useState(500)
  const [selectedTask, setSelectedTask] = useState<string | null>(null)

  const currentXp = profile?.xp || 0
  const level = profile?.level || 1
  const progress = (currentXp / xpToNextLevel) * 100
  const COLORS = ["#3b82f6", "#e5e7eb"]

  const data = [
    { name: "Current XP", value: currentXp },
    { name: "Remaining", value: xpToNextLevel - currentXp },
  ]

  // ✅ 初期読み込み
  useEffect(() => {
    fetchTasks()
    fetchProfile()
  }, [])

  async function fetchTasks() {
    const { data, error } = await supabase
      .from("tasks")
      .select("id, title, xp")
      .order("order_index", { ascending: true })
    if (error) console.error("Task fetch error:", error)
    else setTasks(data || [])
  }

  async function fetchProfile() {
    const { data, error } = await supabase.from("profiles").select("*").limit(1).single()
    if (error) console.error("Profile fetch error:", error)
    else setProfile(data)
  }

  // ✅ 報告処理（DBも更新）
  async function reportTask() {
    if (!selectedTask) return alert("タスクを選択してください")

    const task = tasks.find((t) => t.id === selectedTask)
    if (!task || !profile) return

    let newXp = profile.xp + task.xp
    let newLevel = profile.level

    if (newXp >= xpToNextLevel) {
      newXp -= xpToNextLevel
      newLevel += 1
    }

    // DB更新
    const { error } = await supabase
      .from("profiles")
      .update({ xp: newXp, level: newLevel })
      .eq("id", profile.id)

    if (error) {
      console.error("Update error:", error)
      alert("XP更新中にエラーが発生しました")
    } else {
      
      setProfile({ ...profile, xp: newXp, level: newLevel })
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] text-center space-y-6">
      <h1 className="text-3xl font-bold mb-4">XP トラッカー ホーム</h1>

      {/* 円グラフ */}
      <div className="relative w-64 h-64">
        <PieChart width={256} height={256}>
          <Pie
            data={data}
            innerRadius={90}
            outerRadius={120}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}
          </Pie>
        </PieChart>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-2xl font-bold">Lv. {level}</p>
          <p className="text-lg text-gray-600">
            {currentXp} / {xpToNextLevel} XP
          </p>
          <p className="text-sm text-blue-500 font-medium">
            {progress.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* タスク選択 */}
      <div className="w-64">
        <select
          className="border p-2 w-full rounded"
          onChange={(e) => setSelectedTask(e.target.value)}
          defaultValue=""
        >
          <option value="" disabled>
            タスクを選択
          </option>
          {tasks.map((task) => (
            <option key={task.id} value={task.id}>
              {task.title} (+{task.xp} XP)
            </option>
          ))}
        </select>
      </div>

      {/* 報告ボタン */}
      <button
        onClick={reportTask}
        className="bg-blue-500 text-white px-6 py-3 rounded-full font-bold hover:bg-blue-600 transition"
      >
        🚀 報告する
      </button>
    </div>
  )
}
