import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../services/api';

interface Signal {
  id: number;
  timestamp: string;
  exchange: string;
  symbol: string;
  signal_type: string;
  confidence: number;
  price: number;
  volume: number;
  metadata?: string;
}

export default function SignalsPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSignals = async () => {
    try {
      setLoading(true);
      const data = await api.getSignals();
      setSignals(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch signals');
      console.error('Error fetching signals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSignals();
    
    const interval = setInterval(fetchSignals, 30000);
    return () => clearInterval(interval);
  }, []);

  const getSignalTypeColor = (type: string) => {
    switch (type.toUpperCase()) {
      case 'BUY':
        return 'text-green-400';
      case 'SELL':
        return 'text-red-400';
      case 'HOLD':
        return 'text-yellow-400';
      default:
        return 'text-[#F2F2F2]';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-400';
    if (confidence >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F2F2F2] p-6 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-[#00FFD1]">AI Trading Signals</h1>
          <button
            onClick={fetchSignals}
            disabled={loading}
            className="bg-[#00FFD1] text-black px-4 py-2 rounded-lg hover:bg-[#00e6ba] transition-colors disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-[#101112] rounded-xl border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1A1B1E] border-b border-gray-800">
                <tr>
                  <th className="text-left p-4 text-[#999]">Time</th>
                  <th className="text-left p-4 text-[#999]">Exchange</th>
                  <th className="text-left p-4 text-[#999]">Symbol</th>
                  <th className="text-left p-4 text-[#999]">Signal</th>
                  <th className="text-left p-4 text-[#999]">Price</th>
                  <th className="text-left p-4 text-[#999]">Confidence</th>
                  <th className="text-left p-4 text-[#999]">Volume</th>
                </tr>
              </thead>
              <tbody>
                {loading && signals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-8 text-[#666]">
                      Loading signals...
                    </td>
                  </tr>
                ) : signals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-8 text-[#666]">
                      No signals available
                    </td>
                  </tr>
                ) : (
                  signals.map((signal, index) => (
                    <motion.tr
                      key={signal.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-b border-gray-800 hover:bg-[#1A1B1E] transition-colors"
                    >
                      <td className="p-4 text-[#F2F2F2]">
                        {new Date(signal.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="p-4 text-[#F2F2F2] capitalize">
                        {signal.exchange}
                      </td>
                      <td className="p-4 text-[#F2F2F2] font-mono">
                        {signal.symbol}
                      </td>
                      <td className={`p-4 font-bold ${getSignalTypeColor(signal.signal_type)}`}>
                        {signal.signal_type}
                      </td>
                      <td className="p-4 text-[#F2F2F2] font-mono">
                        ${signal.price.toLocaleString()}
                      </td>
                      <td className={`p-4 font-bold ${getConfidenceColor(signal.confidence)}`}>
                        {(signal.confidence * 100).toFixed(1)}%
                      </td>
                      <td className="p-4 text-[#F2F2F2]">
                        {signal.volume.toLocaleString()}
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#101112] rounded-xl border border-gray-800 p-6">
            <h3 className="text-xl font-semibold text-[#00FFD1] mb-2">Total Signals</h3>
            <p className="text-3xl font-bold text-[#F2F2F2]">{signals.length}</p>
          </div>
          
          <div className="bg-[#101112] rounded-xl border border-gray-800 p-6">
            <h3 className="text-xl font-semibold text-[#00FFD1] mb-2">Buy Signals</h3>
            <p className="text-3xl font-bold text-green-400">
              {signals.filter(s => s.signal_type === 'BUY').length}
            </p>
          </div>
          
          <div className="bg-[#101112] rounded-xl border border-gray-800 p-6">
            <h3 className="text-xl font-semibold text-[#00FFD1] mb-2">Sell Signals</h3>
            <p className="text-3xl font-bold text-red-400">
              {signals.filter(s => s.signal_type === 'SELL').length}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
