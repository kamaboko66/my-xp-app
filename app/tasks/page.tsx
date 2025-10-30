"use client"
import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

type Task = {
  id: string
  title: string
  xp: number
  order_index: number
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [title, setTitle] = useState("")
  const [xp, setXp] = useState(0)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editXp, setEditXp] = useState(0)

  useEffect(() => {
    fetchTasks()
  }, [])

  async function fetchTasks() {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("order_index", { ascending: true })
    if (error) console.error("Fetch error:", error)
    else setTasks(data || [])
  }

  async function addTask() {
    const newOrder = tasks.length
    const { error } = await supabase
      .from("tasks")
      .insert([{ title, xp, order_index: newOrder }])
    if (error) console.error("Insert error:", error)
    else {
      setTitle("")
      setXp(0)
      fetchTasks()
    }
  }

  async function deleteTask(id: string) {
    await supabase.from("tasks").delete().eq("id", id)
    fetchTasks()
  }

  // 編集開始
  function startEdit(task: Task) {
    setEditingId(task.id)
    setEditTitle(task.title)
    setEditXp(task.xp)
  }

  // 編集保存
  async function saveEdit(id: string) {
    const { error } = await supabase
      .from("tasks")
      .update({ title: editTitle, xp: editXp })
      .eq("id", id)

    if (error) console.error("Update error:", error)
    else {
      setEditingId(null)
      fetchTasks()
    }
  }

  // 並び替え処理
  async function handleDragEnd(result: DropResult) {
    if (!result.destination) return

    const newTasks = Array.from(tasks)
    const [moved] = newTasks.splice(result.source.index, 1)
    newTasks.splice(result.destination.index, 0, moved)

    // order_indexを再割り当て
    const updatedTasks = newTasks.map((t, index) => ({
      ...t,
      order_index: index,
    }))

    setTasks(updatedTasks)

    // DBに一括更新
    await Promise.all(
      updatedTasks.map((t) =>
        supabase.from("tasks").update({ order_index: t.order_index }).eq("id", t.id)
      )
    )
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold mb-4">タスク管理（編集・並び替え）</h1>

      {/* タスク追加フォーム */}
      <div className="flex space-x-2">
        <input
          className="border p-2 rounded w-1/2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="タスク名"
        />
        <input
          className="border p-2 rounded w-1/4"
          type="number"
          value={xp}
          onChange={(e) => setXp(Number(e.target.value))}
          placeholder="XP"
        />
        <button
          onClick={addTask}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          追加
        </button>
      </div>

      {/* タスクリスト（ドラッグ＆ドロップ） */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="tasks">
          {(provided) => (
            <ul
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {tasks.map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                  {(provided) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="flex justify-between items-center bg-gray-100 p-3 rounded shadow"
                    >
                      {editingId === task.id ? (
                        // 編集モード
                        <div className="flex items-center space-x-2 w-full">
                          <input
                            className="border p-1 rounded flex-1"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                          />
                          <input
                            className="border p-1 rounded w-20"
                            type="number"
                            value={editXp}
                            onChange={(e) => setEditXp(Number(e.target.value))}
                          />
                          <button
                            onClick={() => saveEdit(task.id)}
                            className="bg-green-500 text-white px-3 py-1 rounded"
                          >
                            保存
                          </button>
                        </div>
                      ) : (
                        // 通常モード
                        <>
                          <div>
                            <p className="font-semibold">{task.title}</p>
                            <p className="text-sm text-gray-600">XP: {task.xp}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => startEdit(task)}
                              className="bg-yellow-400 text-white px-2 py-1 rounded"
                            >
                              編集
                            </button>
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="bg-red-400 text-white px-2 py-1 rounded"
                            >
                              削除
                            </button>
                          </div>
                        </>
                      )}
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}
