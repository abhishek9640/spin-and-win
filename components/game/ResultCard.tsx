import { format } from 'date-fns';

interface ResultCardProps {
  gameTitle: string;
  luckyNumber: string;
  status: 'waiting' | 'completed';
  timestamp?: Date;
}

export function ResultCard({ gameTitle, luckyNumber, status, timestamp = new Date() }: ResultCardProps) {
  return (
    <div className="w-full max-w-2xl mx-auto rounded-3xl bg-gradient-to-br from-gray-700 to-gray-800 p-6 text-white shadow-xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold tracking-wider uppercase">
          {gameTitle}
        </h2>
        <div className="flex gap-4 text-gray-300">
          <span>{format(timestamp, 'hh:mm a')}</span>
          <span>{format(timestamp, 'dd/MM/yyyy')}</span>
        </div>
      </div>

      {/* Lucky Number Display */}
      <div className="bg-gray-600/50 rounded-xl p-8 mb-8">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl md:text-3xl font-bold uppercase tracking-widest">
            Your Lucky Number
          </h3>
          <span className="text-5xl md:text-7xl font-bold">
            {luckyNumber.padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex justify-between items-center text-lg">
        <div className="uppercase font-semibold tracking-wider">
          {status === 'waiting' ? 'Waiting for Result' : 'Result Announced'}
        </div>
        <div className="uppercase font-semibold tracking-wider">
          {status === 'waiting' ? 'Countdown' : 'Completed'}
        </div>
      </div>
    </div>
  );
} 