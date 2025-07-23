import { useState } from 'react'
import { ethers } from 'ethers'
import { Wallet, DollarSign, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

declare global {
  interface Window {
    ethereum?: any
    tronWeb?: any
    tronLink?: any
  }
}

interface WalletState {
  isConnected: boolean
  address: string
  ethBalance: string
  usdtBalance: string
  isLoading: boolean
}

interface TronWalletState {
  isConnected: boolean
  address: string
  trxBalance: string
  usdtBalance: string
  isLoading: boolean
}

interface TransactionState {
  hash: string
  status: 'pending' | 'confirmed' | 'failed'
  amount: string
  token: string
  network?: string
}

const CEREBELLUM_ADDRESS = '0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5A' // CerebellumBot ETH payment address
const USDT_CONTRACT = '0xdAC17F958D2ee523a2206206994597C13D831ec7' // USDT mainnet contract

const TRON_CEREBELLUM_ADDRESS = 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE' // CerebellumBot TRON payment address
const TRON_USDT_CONTRACT = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t' // USDT TRC20 contract

export function WalletPanel() {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: '',
    ethBalance: '0',
    usdtBalance: '0',
    isLoading: false
  })
  
  const [tronWallet, setTronWallet] = useState<TronWalletState>({
    isConnected: false,
    address: '',
    trxBalance: '0',
    usdtBalance: '0',
    isLoading: false
  })
  
  const [transaction, setTransaction] = useState<TransactionState | null>(null)
  const [paymentAmount, setPaymentAmount] = useState<string>('50')
  const [selectedToken, setSelectedToken] = useState<'ETH' | 'USDT'>('USDT')
  const [selectedTronToken, setSelectedTronToken] = useState<'TRX' | 'USDT'>('USDT')
  const [recipientAddress, setRecipientAddress] = useState<string>(CEREBELLUM_ADDRESS)
  const [tronRecipientAddress, setTronRecipientAddress] = useState<string>(TRON_CEREBELLUM_ADDRESS)

  const isValidEthereumAddress = (address: string): boolean => {
    return ethers.isAddress(address)
  }

  const isValidTronAddress = (address: string): boolean => {
    return address.length === 34 && address.startsWith('T')
  }

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error('Metamask не установлен. Пожалуйста, установите Metamask для продолжения.')
      return
    }

    try {
      setWallet(prev => ({ ...prev, isLoading: true }))
      
      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await provider.send('eth_requestAccounts', [])
      
      if (accounts.length === 0) {
        throw new Error('Нет доступных аккаунтов')
      }

      const network = await provider.getNetwork()
      console.log('Connected to network:', network.name, 'chainId:', network.chainId)
      
      if (network.chainId !== 1n) {
        toast.warning(`Подключена сеть: ${network.name}. Для корректного отображения USDT баланса рекомендуется Ethereum Mainnet.`)
      }

      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      
      const ethBalance = await provider.getBalance(address)
      const ethFormatted = ethers.formatEther(ethBalance)
      
      let usdtFormatted = '0'
      try {
        if (network.chainId === 1n) {
          const usdtContract = new ethers.Contract(
            USDT_CONTRACT,
            ['function balanceOf(address) view returns (uint256)', 'function decimals() view returns (uint8)'],
            provider
          )
          const usdtBalance = await usdtContract.balanceOf(address)
          const decimals = await usdtContract.decimals()
          usdtFormatted = ethers.formatUnits(usdtBalance, decimals)
        } else {
          console.warn('USDT balance not available on this network')
        }
      } catch (error) {
        console.warn('Could not fetch USDT balance:', error)
        toast.warning('Не удалось загрузить USDT баланс. Проверьте подключение к сети.')
      }

      setWallet({
        isConnected: true,
        address,
        ethBalance: parseFloat(ethFormatted).toFixed(4),
        usdtBalance: parseFloat(usdtFormatted).toFixed(2),
        isLoading: false
      })

      toast.success('Кошелёк успешно подключён!')
    } catch (error: any) {
      console.error('Wallet connection error:', error)
      toast.error(`Ошибка подключения: ${error.message}`)
      setWallet(prev => ({ ...prev, isLoading: false }))
    }
  }

  const sendPayment = async () => {
    if (!wallet.isConnected || !window.ethereum) {
      toast.error('Сначала подключите кошелёк')
      return
    }

    if (!isValidEthereumAddress(recipientAddress)) {
      toast.error('Неверный адрес получателя')
      return
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      
      let txHash: string

      if (selectedToken === 'ETH') {
        const tx = await signer.sendTransaction({
          to: recipientAddress,
          value: ethers.parseEther(paymentAmount)
        })
        txHash = tx.hash
      } else {
        const usdtContract = new ethers.Contract(
          USDT_CONTRACT,
          [
            'function transfer(address to, uint256 amount) returns (bool)',
            'function decimals() view returns (uint8)'
          ],
          signer
        )
        
        const decimals = await usdtContract.decimals()
        const amount = ethers.parseUnits(paymentAmount, decimals)
        
        const tx = await usdtContract.transfer(recipientAddress, amount)
        txHash = tx.hash
      }

      setTransaction({
        hash: txHash,
        status: 'pending',
        amount: paymentAmount,
        token: selectedToken
      })

      try {
        const response = await fetch('/api/wallet/tx', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            hash: txHash,
            from_address: wallet.address,
            to_address: recipientAddress,
            amount: paymentAmount,
            token: selectedToken,
            network: 'ETHEREUM',
            status: 'pending'
          })
        })

        if (!response.ok) {
          console.warn('Failed to save transaction to backend')
        }
      } catch (error) {
        console.warn('Backend transaction save error:', error)
      }

      toast.success(`Транзакция отправлена! Hash: ${txHash.slice(0, 10)}...`)

      const provider2 = new ethers.BrowserProvider(window.ethereum)
      const receipt = await provider2.waitForTransaction(txHash)
      
      if (receipt?.status === 1) {
        setTransaction(prev => prev ? { ...prev, status: 'confirmed' } : null)
        toast.success('Платёж подтверждён!')
      } else {
        setTransaction(prev => prev ? { ...prev, status: 'failed' } : null)
        toast.error('Транзакция не удалась')
      }

    } catch (error: any) {
      console.error('Payment error:', error)
      toast.error(`Ошибка платежа: ${error.message}`)
      setTransaction(prev => prev ? { ...prev, status: 'failed' } : null)
    }
  }

  const connectTronWallet = async () => {
    if (!window.tronLink) {
      toast.error('TronLink не установлен. Пожалуйста, установите расширение TronLink.')
      return
    }

    try {
      setTronWallet(prev => ({ ...prev, isLoading: true }))
      
      const response = await window.tronLink.request({
        method: 'tron_requestAccounts'
      })
      
      if (response.code === 200) {
        if (!window.tronWeb || !window.tronWeb.defaultAddress.base58) {
          throw new Error('TronLink не готов к использованию. Попробуйте перезагрузить страницу.')
        }
        
        const tronWeb = window.tronWeb
        const address = tronWeb.defaultAddress.base58
        
        const trxBalance = await tronWeb.trx.getBalance(address)
        const trxFormatted = tronWeb.fromSun(trxBalance)
        
        let usdtFormatted = '0'
        try {
          const contract = await tronWeb.contract().at(TRON_USDT_CONTRACT)
          const usdtBalance = await contract.balanceOf(address).call()
          usdtFormatted = (usdtBalance / Math.pow(10, 6)).toFixed(2)
        } catch (error) {
          console.warn('Could not fetch USDT TRC20 balance:', error)
        }

        setTronWallet({
          isConnected: true,
          address,
          trxBalance: parseFloat(trxFormatted).toFixed(4),
          usdtBalance: usdtFormatted,
          isLoading: false
        })

        toast.success('TronLink кошелёк успешно подключён!')
      } else if (response.code === 4001) {
        throw new Error('Пользователь отклонил подключение к TronLink')
      } else if (response.code === 4000) {
        throw new Error('Запрос на подключение в очереди. Попробуйте позже.')
      } else {
        throw new Error(`Ошибка авторизации TronLink: ${response.message || 'Неизвестная ошибка'}`)
      }
      
    } catch (error: any) {
      console.error('TronLink connection error:', error)
      toast.error(`Ошибка подключения TronLink: ${error.message}`)
      setTronWallet(prev => ({ ...prev, isLoading: false }))
    }
  }

  const sendTronPayment = async () => {
    if (!tronWallet.isConnected || !window.tronWeb) {
      toast.error('Сначала подключите TronLink кошелёк')
      return
    }

    if (!isValidTronAddress(tronRecipientAddress)) {
      toast.error('Неверный TRON адрес получателя')
      return
    }

    try {
      const tronWeb = window.tronWeb
      let txHash: string

      if (selectedTronToken === 'TRX') {
        const tx = await tronWeb.trx.sendTransaction(
          tronRecipientAddress,
          tronWeb.toSun(paymentAmount)
        )
        txHash = tx.txid
      } else {
        const contract = await tronWeb.contract().at(TRON_USDT_CONTRACT)
        const amount = parseFloat(paymentAmount) * Math.pow(10, 6)
        const tx = await contract.transfer(tronRecipientAddress, amount).send()
        txHash = tx
      }

      setTransaction({
        hash: txHash,
        status: 'pending',
        amount: paymentAmount,
        token: selectedTronToken,
        network: 'TRON'
      })

      try {
        await fetch('/api/wallet/tx', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hash: txHash,
            from_address: tronWallet.address,
            to_address: tronRecipientAddress,
            amount: paymentAmount,
            token: selectedTronToken,
            network: 'TRON',
            status: 'pending'
          })
        })
      } catch (error) {
        console.warn('Backend transaction save error:', error)
      }

      toast.success(`TRON транзакция отправлена! Hash: ${txHash.slice(0, 10)}...`)
    } catch (error: any) {
      console.error('TRON payment error:', error)
      toast.error(`Ошибка TRON платежа: ${error.message}`)
    }
  }

  const disconnectWallet = () => {
    setWallet({
      isConnected: false,
      address: '',
      ethBalance: '0',
      usdtBalance: '0',
      isLoading: false
    })
    setTransaction(null)
    toast.success('Metamask кошелёк отключён')
  }

  const disconnectTronWallet = () => {
    setTronWallet({
      isConnected: false,
      address: '',
      trxBalance: '0',
      usdtBalance: '0',
      isLoading: false
    })
    setTransaction(null)
    toast.success('TronLink кошелёк отключён')
  }

  return (
    <Card className="bg-[#101112] border-gray-800 max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-[#00FFD1] flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Liquidity Portal
        </CardTitle>
        <CardDescription className="text-[#999]">
          Пополните баланс CerebellumBot через криптокошелёк
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="metamask" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[#0A0A0A]">
            <TabsTrigger 
              value="metamask" 
              className="data-[state=active]:bg-[#00FFD1] data-[state=active]:text-black text-[#999]"
            >
              Metamask
            </TabsTrigger>
            <TabsTrigger 
              value="tronlink" 
              className="data-[state=active]:bg-[#00FFD1] data-[state=active]:text-black text-[#999]"
            >
              TronLink
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="metamask" className="space-y-4 mt-4">
            {!wallet.isConnected ? (
              <Button 
                onClick={connectWallet}
                disabled={wallet.isLoading}
                className="w-full bg-[#00FFD1] text-black hover:bg-[#00B5FF]"
              >
                {wallet.isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Подключение...
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4 mr-2" />
                    Подключить Metamask
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-[#0A0A0A] rounded-lg border border-gray-800">
                  <p className="text-xs text-[#999] mb-1">Адрес кошелька:</p>
                  <p className="text-sm text-[#F2F2F2] font-mono">
                    {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-[#0A0A0A] rounded-lg border border-gray-800">
                    <p className="text-xs text-[#999] mb-1">ETH</p>
                    <p className="text-sm text-[#F2F2F2] font-semibold">{wallet.ethBalance}</p>
                  </div>
                  <div className="p-3 bg-[#0A0A0A] rounded-lg border border-gray-800">
                    <p className="text-xs text-[#999] mb-1">USDT</p>
                    <p className="text-sm text-[#F2F2F2] font-semibold">{wallet.usdtBalance}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-[#999] mb-2 block">Адрес получателя:</label>
                    <div className="flex gap-2">
                      <Input
                        value={recipientAddress}
                        onChange={(e) => setRecipientAddress(e.target.value)}
                        placeholder="0x..."
                        className="bg-[#0A0A0A] border-gray-600 text-[#F2F2F2] placeholder:text-[#666]"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setRecipientAddress(CEREBELLUM_ADDRESS)}
                        className="border-gray-600 text-[#999] hover:border-[#00FFD1] hover:text-[#00FFD1] whitespace-nowrap"
                      >
                        CerebellumBot
                      </Button>
                    </div>
                    {recipientAddress && !isValidEthereumAddress(recipientAddress) && (
                      <p className="text-xs text-red-500 mt-1">Неверный формат адреса</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant={selectedToken === 'ETH' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedToken('ETH')}
                      className={selectedToken === 'ETH' ? 'bg-[#00FFD1] text-black' : 'border-gray-600 text-[#999]'}
                    >
                      ETH
                    </Button>
                    <Button
                      variant={selectedToken === 'USDT' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedToken('USDT')}
                      className={selectedToken === 'USDT' ? 'bg-[#00FFD1] text-black' : 'border-gray-600 text-[#999]'}
                    >
                      USDT
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    {['10', '50', '100'].map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        onClick={() => setPaymentAmount(amount)}
                        className={`border-gray-600 text-[#999] hover:border-[#00FFD1] hover:text-[#00FFD1] ${
                          paymentAmount === amount ? 'border-[#00FFD1] text-[#00FFD1]' : ''
                        }`}
                      >
                        {amount}
                      </Button>
                    ))}
                  </div>

                  <Button 
                    onClick={sendPayment}
                    disabled={!isValidEthereumAddress(recipientAddress)}
                    className="w-full bg-[#00FFD1] text-black hover:bg-[#00B5FF] disabled:opacity-50"
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Отправить {paymentAmount} {selectedToken}
                  </Button>
                </div>

                <Button 
                  onClick={disconnectWallet}
                  variant="outline"
                  size="sm"
                  className="w-full border-gray-600 text-[#999] hover:border-red-500 hover:text-red-500"
                >
                  Отключить Metamask
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="tronlink" className="space-y-4 mt-4">
            {!tronWallet.isConnected ? (
              <Button 
                onClick={connectTronWallet}
                disabled={tronWallet.isLoading}
                className="w-full bg-[#00FFD1] text-black hover:bg-[#00B5FF]"
              >
                {tronWallet.isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Подключение...
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4 mr-2" />
                    Подключить TronLink
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-[#0A0A0A] rounded-lg border border-gray-800">
                  <p className="text-xs text-[#999] mb-1">Адрес кошелька:</p>
                  <p className="text-sm text-[#F2F2F2] font-mono">
                    {tronWallet.address.slice(0, 6)}...{tronWallet.address.slice(-4)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-[#0A0A0A] rounded-lg border border-gray-800">
                    <p className="text-xs text-[#999] mb-1">TRX</p>
                    <p className="text-sm text-[#F2F2F2] font-semibold">{tronWallet.trxBalance}</p>
                  </div>
                  <div className="p-3 bg-[#0A0A0A] rounded-lg border border-gray-800">
                    <p className="text-xs text-[#999] mb-1">USDT</p>
                    <p className="text-sm text-[#F2F2F2] font-semibold">{tronWallet.usdtBalance}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-[#999] mb-2 block">TRON адрес получателя:</label>
                    <div className="flex gap-2">
                      <Input
                        value={tronRecipientAddress}
                        onChange={(e) => setTronRecipientAddress(e.target.value)}
                        placeholder="T..."
                        className="bg-[#0A0A0A] border-gray-600 text-[#F2F2F2] placeholder:text-[#666]"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTronRecipientAddress(TRON_CEREBELLUM_ADDRESS)}
                        className="border-gray-600 text-[#999] hover:border-[#00FFD1] hover:text-[#00FFD1] whitespace-nowrap"
                      >
                        CerebellumBot
                      </Button>
                    </div>
                    {tronRecipientAddress && !isValidTronAddress(tronRecipientAddress) && (
                      <p className="text-xs text-red-500 mt-1">Неверный формат TRON адреса</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant={selectedTronToken === 'TRX' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTronToken('TRX')}
                      className={selectedTronToken === 'TRX' ? 'bg-[#00FFD1] text-black' : 'border-gray-600 text-[#999]'}
                    >
                      TRX
                    </Button>
                    <Button
                      variant={selectedTronToken === 'USDT' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTronToken('USDT')}
                      className={selectedTronToken === 'USDT' ? 'bg-[#00FFD1] text-black' : 'border-gray-600 text-[#999]'}
                    >
                      USDT
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    {['10', '50', '100'].map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        onClick={() => setPaymentAmount(amount)}
                        className={`border-gray-600 text-[#999] hover:border-[#00FFD1] hover:text-[#00FFD1] ${
                          paymentAmount === amount ? 'border-[#00FFD1] text-[#00FFD1]' : ''
                        }`}
                      >
                        {amount}
                      </Button>
                    ))}
                  </div>

                  <Button 
                    onClick={sendTronPayment}
                    disabled={!isValidTronAddress(tronRecipientAddress)}
                    className="w-full bg-[#00FFD1] text-black hover:bg-[#00B5FF] disabled:opacity-50"
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Отправить {paymentAmount} {selectedTronToken}
                  </Button>
                </div>

                <Button 
                  onClick={disconnectTronWallet}
                  variant="outline"
                  size="sm"
                  className="w-full border-gray-600 text-[#999] hover:border-red-500 hover:text-red-500"
                >
                  Отключить TronLink
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {transaction && (
          <div className="p-3 bg-[#0A0A0A] rounded-lg border border-gray-800 mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#999]">Транзакция {transaction.network || 'ETHEREUM'}:</span>
              <Badge 
                variant="outline"
                className={
                  transaction.status === 'confirmed' ? 'border-green-500 text-green-500' :
                  transaction.status === 'failed' ? 'border-red-500 text-red-500' :
                  'border-yellow-500 text-yellow-500'
                }
              >
                {transaction.status === 'confirmed' && <CheckCircle className="w-3 h-3 mr-1" />}
                {transaction.status === 'failed' && <AlertCircle className="w-3 h-3 mr-1" />}
                {transaction.status === 'pending' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                {transaction.status === 'confirmed' ? 'Подтверждена' :
                 transaction.status === 'failed' ? 'Не удалась' : 'Ожидание'}
              </Badge>
            </div>
            <p className="text-xs text-[#F2F2F2] font-mono">
              {transaction.hash.slice(0, 10)}...{transaction.hash.slice(-6)}
            </p>
            <p className="text-xs text-[#999] mt-1">
              {transaction.amount} {transaction.token}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
