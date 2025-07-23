import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { api, Signal } from '@/services/api'

interface SignalsListProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignalsList({ open, onOpenChange }: SignalsListProps) {
  const [signals, setSignals] = useState<Signal[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open) {
      fetchSignals()
    }
  }, [open])

  async function fetchSignals() {
    setIsLoading(true)
    try {
      const data = await api.getSignals()
      setSignals(data)
    } catch (error) {
      toast.error('Ошибка при загрузке сигналов', {
        description: error instanceof Error ? error.message : 'Попробуйте еще раз',
      })
    } finally {
      setIsLoading(false)
    }
  }

  function getConfidenceColor(confidence: number) {
    if (confidence >= 0.8) return 'bg-green-500'
    if (confidence >= 0.6) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  function formatTimestamp(timestamp: string) {
    return new Date(timestamp).toLocaleString('ru-RU')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-[#0A0A0A] border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-[#00FFD1]">Торговые сигналы</DialogTitle>
          <DialogDescription className="text-[#999]">
            Последние сигналы от CerebellumBot AI
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-[#999]">
            Всего сигналов: {signals.length}
          </div>
          <Button
            onClick={fetchSignals}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="border-[#00FFD1] text-[#00FFD1] hover:bg-[#00FFD1] hover:text-black font-semibold"
          >
            {isLoading ? 'Обновление...' : 'Обновить'}
          </Button>
        </div>

        <div className="max-h-96 overflow-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="text-[#999]">Загрузка сигналов...</div>
            </div>
          ) : signals.length === 0 ? (
            <div className="flex justify-center items-center h-32">
              <div className="text-[#999]">Сигналы не найдены</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800">
                  <TableHead className="text-[#F2F2F2]">Время</TableHead>
                  <TableHead className="text-[#F2F2F2]">Биржа</TableHead>
                  <TableHead className="text-[#F2F2F2]">Пара</TableHead>
                  <TableHead className="text-[#F2F2F2]">Тип</TableHead>
                  <TableHead className="text-[#F2F2F2]">Цена</TableHead>
                  <TableHead className="text-[#F2F2F2]">Уверенность</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {signals.map((signal, index) => (
                  <motion.tr
                    key={signal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-gray-800"
                  >
                    <TableCell className="text-[#999] text-xs">
                      {formatTimestamp(signal.timestamp)}
                    </TableCell>
                    <TableCell className="text-[#F2F2F2]">
                      {signal.exchange}
                    </TableCell>
                    <TableCell className="text-[#F2F2F2] font-mono">
                      {signal.symbol}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={signal.signal_type === 'BUY' ? 'default' : 'secondary'}
                        className={
                          signal.signal_type === 'BUY'
                            ? 'bg-green-600 text-white'
                            : 'bg-red-600 text-white'
                        }
                      >
                        {signal.signal_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[#F2F2F2] font-mono">
                      ${signal.price.toFixed(4)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${getConfidenceColor(signal.confidence)}`}
                        />
                        <span className="text-[#F2F2F2] text-sm">
                          {(signal.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
