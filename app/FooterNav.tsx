'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function FooterNav() {
  const pathname = usePathname()

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg flex justify-around items-center py-3 text-sm">
      {/* 左：タスク */}
      <Link
        href="/tasks"
        className={`flex flex-col items-center justify-center w-24 h-16 rounded-xl transition-all ${
          pathname === '/tasks'
            ? 'text-blue-600 font-bold scale-110 bg-blue-50'
            : 'text-gray-500 hover:text-blue-500 active:bg-gray-100'
        }`}
      >
        <span className="text-lg">🗒</span>
        <span className="text-xs mt-1">タスク</span>
      </Link>

      {/* 中央：ホーム（四角く、青で目立たせる） */}
      <Link
        href="/"
        className={`flex flex-col items-center justify-center w-28 h-16 rounded-xl shadow-md transition-all ${
          pathname === '/'
            ? 'bg-blue-600 text-white scale-110'
            : 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700'
        }`}
      >
        <span className="text-lg">🏠</span>
        <span className="text-xs mt-1">ホーム</span>
      </Link>

      {/* 右：月の記録 */}
      <Link
        href="/month_task"
        className={`flex flex-col items-center justify-center w-24 h-16 rounded-xl transition-all ${
          pathname === '/month_task'
            ? 'text-blue-600 font-bold scale-110 bg-blue-50'
            : 'text-gray-500 hover:text-blue-500 active:bg-gray-100'
        }`}
      >
        <span className="text-lg">📅</span>
        <span className="text-xs mt-1">月の記録</span>
      </Link>
    </footer>
  )
}
