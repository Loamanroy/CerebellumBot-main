import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { api, InvestorRequest } from '@/services/api'

const formSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  email: z.string().email('Введите корректный email'),
  expected_investment: z.string().min(1, 'Выберите ожидаемый размер инвестиций'),
})

interface InvestorFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InvestorForm({ open, onOpenChange }: InvestorFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      expected_investment: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      const investorRequest: InvestorRequest = {
        name: values.name,
        email: values.email,
        expected_investment: values.expected_investment,
      }

      await api.submitInvestorRequest(investorRequest)
      
      toast.success('Заявка инвестора успешно отправлена!', {
        description: 'Мы свяжемся с вами для обсуждения деталей.',
      })
      
      form.reset()
      onOpenChange(false)
    } catch (error) {
      toast.error('Ошибка при отправке заявки', {
        description: error instanceof Error ? error.message : 'Попробуйте еще раз',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-[#0A0A0A] border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-[#00FFD1]">Стать инвестором</DialogTitle>
          <DialogDescription className="text-[#999]">
            Заполните форму для участия в инвестиционном раунде CerebellumBot vX
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#F2F2F2]">Имя</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ваше имя"
                      {...field}
                      className="bg-[#101112] border-gray-700 text-[#F2F2F2] focus:border-[#00FFD1]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#F2F2F2]">Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="your@email.com"
                      type="email"
                      {...field}
                      className="bg-[#101112] border-gray-700 text-[#F2F2F2] focus:border-[#00FFD1]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="expected_investment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#F2F2F2]">Ожидаемый размер инвестиций</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-[#101112] border-gray-700 text-[#F2F2F2] focus:border-[#00FFD1]">
                        <SelectValue placeholder="Выберите размер" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-[#101112] border-gray-700">
                      <SelectItem value="$1K-$5K" className="text-[#F2F2F2] focus:bg-gray-800">$1K - $5K</SelectItem>
                      <SelectItem value="$5K-$25K" className="text-[#F2F2F2] focus:bg-gray-800">$5K - $25K</SelectItem>
                      <SelectItem value="$25K-$100K" className="text-[#F2F2F2] focus:bg-gray-800">$25K - $100K</SelectItem>
                      <SelectItem value="$100K+" className="text-[#F2F2F2] focus:bg-gray-800">$100K+</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 border-gray-700 text-[#F2F2F2] hover:bg-gray-800"
              >
                Отмена
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-[#00FFD1] text-black hover:bg-[#00B5FF]"
              >
                {isSubmitting ? 'Отправка...' : 'Отправить'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
