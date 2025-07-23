import { motion } from 'framer-motion'
import { TrendingUp, Activity, DollarSign, Zap } from 'lucide-react'
import { AdvancedRealTimeChart } from 'react-ts-tradingview-widgets'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function Dashboard() {
  const mockData = {
    connectedExchanges: ['Binance', 'Coinbase Pro', 'Kraken', 'Uniswap V3'],
    latency: '2.3ms',
    profit: '+$12,847.32',
    profitPercent: '+18.4%',
    activeStrategies: 7,
    totalTrades: 1247,
    winRate: '73.2%',
    volume24h: '$2.4M'
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F2F2F2] p-6 pt-20">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-[#00FFD1] mb-2">Dashboard</h1>
          <p className="text-[#999]">Мониторинг производительности CerebellumBot vX</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-[#101112] border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[#F2F2F2]">
                  Прибыль (24ч)
                </CardTitle>
                <DollarSign className="h-4 w-4 text-[#00FFD1]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#00FFD1]">{mockData.profit}</div>
                <p className="text-xs text-green-500">
                  {mockData.profitPercent} от вчера
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-[#101112] border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[#F2F2F2]">
                  Латентность
                </CardTitle>
                <Zap className="h-4 w-4 text-[#00FFD1]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#00FFD1]">{mockData.latency}</div>
                <p className="text-xs text-green-500">
                  Отличная производительность
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-[#101112] border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[#F2F2F2]">
                  Винрейт
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-[#00FFD1]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#00FFD1]">{mockData.winRate}</div>
                <p className="text-xs text-[#999]">
                  из {mockData.totalTrades} сделок
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-[#101112] border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[#F2F2F2]">
                  Объем (24ч)
                </CardTitle>
                <Activity className="h-4 w-4 text-[#00FFD1]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#00FFD1]">{mockData.volume24h}</div>
                <p className="text-xs text-[#999]">
                  Активных стратегий: {mockData.activeStrategies}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="bg-[#101112] rounded-xl border border-gray-800 p-6 mb-8">
          <h3 className="text-xl font-semibold text-[#00FFD1] mb-4">Live Market Data</h3>
          <div className="h-96">
            <AdvancedRealTimeChart
              theme="dark"
              symbol="BINANCE:BTCUSDT"
              interval="15"
              timezone="Etc/UTC"
              style="1"
              locale="en"
              toolbar_bg="#0A0A0A"
              enable_publishing={false}
              allow_symbol_change={true}
              container_id="tradingview_chart"
              autosize
            />
          </div>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-[#101112] border-gray-800">
              <CardHeader>
                <CardTitle className="text-[#00FFD1]">Подключенные биржи</CardTitle>
                <CardDescription className="text-[#999]">
                  Активные соединения с торговыми площадками
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {mockData.connectedExchanges.map((exchange) => (
                    <Badge
                      key={exchange}
                      variant="outline"
                      className="border-[#00FFD1] text-[#00FFD1]"
                    >
                      {exchange}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-[#101112] border-gray-800">
              <CardHeader>
                <CardTitle className="text-[#00FFD1]">Статус системы</CardTitle>
                <CardDescription className="text-[#999]">
                  Текущее состояние компонентов
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[#F2F2F2]">AI Engine</span>
                    <Badge className="bg-green-600 text-white">Активен</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#F2F2F2]">Risk Manager</span>
                    <Badge className="bg-green-600 text-white">Активен</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#F2F2F2]">Order Executor</span>
                    <Badge className="bg-green-600 text-white">Активен</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#F2F2F2]">Data Feed</span>
                    <Badge className="bg-green-600 text-white">Активен</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
