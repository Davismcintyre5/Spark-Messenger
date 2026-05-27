import React from 'react';
import { Check } from 'lucide-react';
import Button from '@/components/ui/Button';

interface PlanCardProps {
  name: string;
  price: string;
  period: string;
  features: string[];
  popular?: boolean;
  onSelect: () => void;
  loading?: boolean;
}

export default function PlanCard({ name, price, period, features, popular, onSelect, loading }: PlanCardProps) {
  return (
    <div
      className={`relative rounded-2xl border-2 p-6 ${
        popular
          ? 'border-spark-500 bg-spark-50 dark:bg-spark-900/20'
          : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      {popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-spark-500 text-white text-xs font-medium rounded-full">
          Popular
        </span>
      )}
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold">{name}</h3>
        <div className="mt-2">
          <span className="text-3xl font-bold">{price}</span>
          <span className="text-gray-400 text-sm">/{period}</span>
        </div>
      </div>
      <ul className="space-y-2 mb-6">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <Check className="w-4 h-4 text-spark-500 shrink-0" />
            {f}
          </li>
        ))}
      </ul>
      <Button
        onClick={onSelect}
        loading={loading}
        variant={popular ? 'primary' : 'secondary'}
        size="lg"
        className="w-full"
      >
        Choose {name}
      </Button>
    </div>
  );
}