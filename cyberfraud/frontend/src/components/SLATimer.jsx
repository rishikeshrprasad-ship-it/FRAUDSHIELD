import React, { useState, useEffect } from 'react';
import { Timer, AlertCircle } from 'lucide-react';

export default function SLATimer({ deadlineISO }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const target = deadlineISO ? new Date(deadlineISO).getTime() : Date.now() + 2700000;

    const updateTimer = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft('00:00 EXPIRED');
      } else {
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [deadlineISO]);

  return (
    <div className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono font-bold ${
      isExpired
        ? 'bg-rose-950/80 border-rose-700 text-rose-300'
        : 'bg-amber-950/50 border-amber-800 text-amber-300 animate-pulse'
    }`}>
      <Timer className="w-3.5 h-3.5" />
      <span>{timeLeft}</span>
    </div>
  );
}
