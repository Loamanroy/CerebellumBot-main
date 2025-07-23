import { useState } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, TrendingUp, Shield, Users } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { InvestorForm } from '@/components/InvestorForm'

export function Invest() {
  const [isInvestorFormOpen, setIsInvestorFormOpen] = useState(false)

  const investmentStages = [
    {
      stage: 'Seed Round',
      target: '$25K - $100K',
      valuation: '$500K',
      equity: '5% - 20%',
      status: 'Открыт',
      description: 'Запуск HFT-инфраструктуры и MVP'
    },
    {
      stage: 'Series A',
      target: '$500K - $2M',
      valuation: '$5M',
      equity: '10% - 40%',
      status: 'Планируется',
      description: 'Масштабирование и институциональные клиенты'
    }
  ]

  const benefits = [
    {
      icon: DollarSign,
      title: 'Доля прибыли',
      description: 'Получайте процент от торговой прибыли бота'
    },
    {
      icon: TrendingUp,
      title: 'Рост капитала',
      description: 'Участие в росте стоимости платформы'
    },
    {
      icon: Shield,
      title: 'White-label доступ',
      description: 'Возможность использования под своим брендом'
    },
    {
      icon: Users,
      title: 'AI-сигналы',
      description: 'Приоритетный доступ к торговым сигналам'
    }
  ]

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F2F2F2] p-6 pt-20">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-bold text-[#00FFD1] mb-4">Инвестиции</h1>
          <p className="text-xl text-[#999] max-w-3xl mx-auto">
            Присоединяйтесь к революции в алгоритмической торговле. 
            Инвестируйте в будущее автономных торговых систем.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <Card className="bg-gradient-to-r from-[#101112] to-[#0A0A0A] border-[#00FFD1] border-2">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-[#00FFD1]">
                Почему инвестировать в CerebellumBot?
              </CardTitle>
              <CardDescription className="text-[#999] text-lg">
                Уникальная возможность войти в растущий рынок алгоритмической торговли
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="text-center"
                  >
                    <div className="w-12 h-12 bg-[#00FFD1] rounded-full flex items-center justify-center mx-auto mb-4">
                      <benefit.icon className="w-6 h-6 text-black" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#F2F2F2] mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-[#999] text-sm">
                      {benefit.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-[#00FFD1] mb-6 text-center">
            Инвестиционные раунды
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {investmentStages.map((stage, index) => (
              <motion.div
                key={stage.stage}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <Card className="bg-[#101112] border-gray-800 h-full">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-[#00FFD1]">{stage.stage}</CardTitle>
                      <Badge
                        variant={stage.status === 'Открыт' ? 'default' : 'secondary'}
                        className={
                          stage.status === 'Открыт'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-600 text-white'
                        }
                      >
                        {stage.status}
                      </Badge>
                    </div>
                    <CardDescription className="text-[#999]">
                      {stage.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-[#999]">Цель:</span>
                        <span className="text-[#F2F2F2] font-semibold">{stage.target}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#999]">Оценка:</span>
                        <span className="text-[#F2F2F2] font-semibold">{stage.valuation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#999]">Доля:</span>
                        <span className="text-[#F2F2F2] font-semibold">{stage.equity}</span>
                      </div>
                    </div>
                    {stage.status === 'Открыт' && (
                      <Button 
                        className="w-full mt-4 bg-[#00FFD1] text-black hover:bg-[#00B5FF]"
                        onClick={() => setIsInvestorFormOpen(true)}
                      >
                        Подать заявку
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <Card className="bg-[#101112] border-gray-800">
            <CardHeader>
              <CardTitle className="text-[#00FFD1]">Готовы инвестировать?</CardTitle>
              <CardDescription className="text-[#999]">
                Свяжитесь с нами для обсуждения инвестиционных возможностей
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="outline"
                  className="border-[#00FFD1] text-[#00FFD1] hover:bg-[#00FFD1] hover:text-black"
                >
                  Скачать презентацию
                </Button>
                <Button 
                  className="bg-[#00FFD1] text-black hover:bg-[#00B5FF]"
                  onClick={() => setIsInvestorFormOpen(true)}
                >
                  Связаться с нами
                </Button>
              </div>
              <div className="mt-6 text-sm text-[#999]">
                <p>Email: founder@cerebellumbot.ai</p>
                <p>Telegram: @YourHandle</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <InvestorForm 
        open={isInvestorFormOpen} 
        onOpenChange={setIsInvestorFormOpen} 
      />
    </div>
  )
}
