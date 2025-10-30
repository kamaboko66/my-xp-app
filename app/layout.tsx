import './globals.css'
import FooterNav from './FooterNav'

export const metadata = {
  title: 'XP Tracker',
  description: '毎日のタスクに経験値をつけよう！',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="flex flex-col min-h-screen bg-gray-50">
        <main className="flex-1 pb-28">{children}</main>
        <FooterNav />
      </body>
    </html>
  )
}
