import { useState } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Home, BarChart3, DollarSign, Menu, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DemoForm } from '@/components/DemoForm'
import { InvestorForm } from '@/components/InvestorForm'
import { SignalsList } from '@/components/SignalsList'
import { WalletPanel } from '@/components/WalletPanel'
import { Dashboard } from '@/pages/Dashboard'
import { Invest } from '@/pages/Invest'
import SignalsPage from './pages/SignalsPage'

const mockData = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 500 },
  { name: 'Jun', value: 900 },
]

function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Главная', icon: Home },
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/signals', label: 'Сигналы', icon: BarChart3 },
    { path: '/invest', label: 'Инвестиции', icon: DollarSign },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold text-[#00FFD1]">
            CerebellumBot vX
          </Link>

          <div className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'text-[#00FFD1] bg-gray-800'
                    : 'text-[#F2F2F2] hover:text-[#00FFD1] hover:bg-gray-800'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-[#F2F2F2]"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-[#101112] rounded-lg mt-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'text-[#00FFD1] bg-gray-800'
                      : 'text-[#F2F2F2] hover:text-[#00FFD1] hover:bg-gray-800'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

function LandingPage() {
  const [isDemoFormOpen, setIsDemoFormOpen] = useState(false)
  const [isInvestorFormOpen, setIsInvestorFormOpen] = useState(false)
  const [isSignalsListOpen, setIsSignalsListOpen] = useState(false)

  return (
    <main className="bg-[#0A0A0A] text-[#F2F2F2] font-sans pt-16">
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-[#00FFD1]">
            CerebellumBot vX
          </h1>
          <p className="text-xl md:text-2xl max-w-2xl text-[#999] mb-2">
            AI-маркет-мейкер, работающий в тени
          </p>
          <p className="text-lg text-[#F2F2F2] italic mb-8">
            "Invisible. Adaptive. Profitable."
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button 
            onClick={() => setIsDemoFormOpen(true)}
            className="bg-[#00FFD1] text-black hover:bg-[#00B5FF] transition-colors px-8 py-3 text-lg"
          >
            Получить демо
          </Button>
          <Button 
            onClick={() => setIsInvestorFormOpen(true)}
            variant="outline" 
            className="border-[#00FFD1] text-[#00FFD1] hover:bg-[#00FFD1] hover:text-black transition-colors px-8 py-3 text-lg"
          >
            Стать инвестором
          </Button>
        </motion.div>
      </section>

      <section className="py-16 px-6 border-t border-gray-800">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-semibold text-[#00FFD1] mb-4 text-center">
            🤖 Что такое CerebellumBot vX
          </h2>
          <p className="text-[#F2F2F2] max-w-3xl mx-auto mb-6">
            Автономный AI-маркет-мейкер и HFT-система с нативной поддержкой DeFi, CEX, OTC и ZKP. 
            Предоставляет высокочастотную ликвидность, адаптируется благодаря Reinforcement Learning, 
            ML и кросс-биржевым стратегиям.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="bg-[#101112] border-gray-800">
              <CardHeader>
                <CardTitle className="text-[#00FFD1]">🔁 Кросс-биржевой арбитраж</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#999]">CEX + DEX интеграция для максимальной прибыли</p>
              </CardContent>
            </Card>
            
            <Card className="bg-[#101112] border-gray-800">
              <CardHeader>
                <CardTitle className="text-[#00FFD1]">🔒 Анонимность</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#999]">ZKP и TOR Layer для полной конфиденциальности</p>
              </CardContent>
            </Card>
            
            <Card className="bg-[#101112] border-gray-800">
              <CardHeader>
                <CardTitle className="text-[#00FFD1]">🧠 AI-прогнозирование</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#999]">Самообучающиеся алгоритмы и предиктивная аналитика</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-8 flex justify-center"
        >
          <Button 
            onClick={() => setIsSignalsListOpen(true)}
            variant="outline" 
            className="border-[#00FFD1] text-[#00FFD1] hover:bg-[#00FFD1] hover:text-black transition-colors"
          >
            Показать сигналы
          </Button>
        </motion.div>
      </section>

      <section className="py-16 px-6 border-t border-gray-800">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-semibold text-[#00FFD1] mb-6 text-center">🧱 Архитектура</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <div>
              <ul className="space-y-3 text-[#F2F2F2]">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-[#00FFD1] rounded-full mr-3"></span>
                  Микросервисная инфраструктура (FastAPI, Redis, PostgreSQL)
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-[#00FFD1] rounded-full mr-3"></span>
                  AI-ядро: PyTorch, CleanRL, Optuna
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-[#00FFD1] rounded-full mr-3"></span>
                  Execution Layer: Cython, C++, FPGA-ready
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-[#00FFD1] rounded-full mr-3"></span>
                  Облако: AWS, Hetzner, Cloudflare Zero Trust
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-[#00FFD1] rounded-full mr-3"></span>
                  Интерфейс: React, WebSocket, TradingView
                </li>
              </ul>
            </div>
            <div className="bg-[#101112] p-6 rounded-lg border border-gray-800">
              <h3 className="text-[#00FFD1] mb-4">Производительность</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={mockData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#101112', 
                      border: '1px solid #333',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#00FFD1" 
                    strokeWidth={2}
                    dot={{ fill: '#00FFD1', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="py-16 px-6 border-t border-gray-800">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-semibold text-[#00FFD1] mb-6 text-center">📈 Инвест-модель</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="bg-[#101112] border-gray-800">
              <CardHeader>
                <CardTitle className="text-[#00FFD1]">Этап I</CardTitle>
                <CardDescription className="text-[#999]">AI-сигналы, MVP</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-[#F2F2F2]">$1K AUM</p>
              </CardContent>
            </Card>
            
            <Card className="bg-[#101112] border-gray-800">
              <CardHeader>
                <CardTitle className="text-[#00FFD1]">Этап II</CardTitle>
                <CardDescription className="text-[#999]">Пулы ликвидности</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-[#F2F2F2]">$10K–$100K</p>
              </CardContent>
            </Card>
            
            <Card className="bg-[#101112] border-gray-800">
              <CardHeader>
                <CardTitle className="text-[#00FFD1]">Этап III</CardTitle>
                <CardDescription className="text-[#999]">Статус маркет-мейкера</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-[#F2F2F2]">Биржевой</p>
              </CardContent>
            </Card>
            
            <Card className="bg-[#101112] border-gray-800">
              <CardHeader>
                <CardTitle className="text-[#00FFD1]">Этап IV</CardTitle>
                <CardDescription className="text-[#999]">Масштабирование</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-[#F2F2F2]">$1B/мес</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </section>

      <section className="py-16 px-6 border-t border-gray-800">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-semibold text-[#00FFD1] mb-6 text-center">🔐 Режим «Паранойя»</h2>
          <div className="bg-[#101112] p-8 rounded-lg border border-gray-800 max-w-4xl mx-auto">
            <p className="text-[#F2F2F2] mb-6">
              Цифровая невидимость для максимальной безопасности торговых операций
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-[#00FFD1] mb-3">Сетевая защита</h3>
                <ul className="space-y-2 text-[#999]">
                  <li>• IP-обфускация (VPN + TOR + Proxy-chain)</li>
                  <li>• Эмуляция поведения человека</li>
                  <li>• Зашифрованные ephemeral-контейнеры</li>
                </ul>
              </div>
              <div>
                <h3 className="text-[#00FFD1] mb-3">Блокчейн анонимность</h3>
                <ul className="space-y-2 text-[#999]">
                  <li>• zkRollup-исполнение ордеров (zkSync, StarkEx)</li>
                  <li>• Миксеры и privacy coins</li>
                  <li>• Децентрализованная маршрутизация</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="py-16 px-6 border-t border-gray-800">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-semibold text-[#00FFD1] mb-6 text-center">🗺 Дорожная карта</h2>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-[#00FFD1] rounded-full flex items-center justify-center text-black font-bold">1</div>
                <div>
                  <h3 className="text-[#F2F2F2] font-semibold">Месяц 1</h3>
                  <p className="text-[#999]">MVP: сигнализация, дашборд, бэктест</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-[#00FFD1] rounded-full flex items-center justify-center text-black font-bold">2</div>
                <div>
                  <h3 className="text-[#F2F2F2] font-semibold">Месяц 2–3</h3>
                  <p className="text-[#999]">Запуск ордеров на Testnet</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white font-bold">3</div>
                <div>
                  <h3 className="text-[#F2F2F2] font-semibold">Месяц 4–6</h3>
                  <p className="text-[#999]">DeFi-пулы, DAO, инвесторы</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white font-bold">4</div>
                <div>
                  <h3 className="text-[#F2F2F2] font-semibold">Месяц 6+</h3>
                  <p className="text-[#999]">Статус MM, институциональный трафик</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <footer className="py-12 px-6 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center lg:text-left"
            >
              <h2 className="text-2xl font-semibold text-[#00FFD1] mb-6">💬 Контакты</h2>
              <div className="space-y-2 text-[#F2F2F2]">
                <p>Telegram: <a href="https://t.me/YourHandle" className="text-[#00FFD1] hover:underline">@YourHandle</a></p>
                <p>Email: <a href="mailto:founder@cerebellumbot.ai" className="text-[#00FFD1] hover:underline">founder@cerebellumbot.ai</a></p>
                <p className="text-[#999] mt-4">GitHub: по запросу</p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <WalletPanel />
            </motion.div>
          </div>
        </div>
      </footer>

      <DemoForm open={isDemoFormOpen} onOpenChange={setIsDemoFormOpen} />
      <InvestorForm open={isInvestorFormOpen} onOpenChange={setIsInvestorFormOpen} />
      <SignalsList open={isSignalsListOpen} onOpenChange={setIsSignalsListOpen} />
    </main>
  )
}

export default function App() {
  return (
    <>
      <Navigation />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/signals" element={<SignalsPage />} />
        <Route path="/invest" element={<Invest />} />
      </Routes>
    </>
  )
}
