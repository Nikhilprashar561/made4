import { PriceBreakdown } from './types';

export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ');
}

export function formatRupees(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculatePrice(hourlyRate: number, durationHours: number): PriceBreakdown {
  const hostSubtotal = hourlyRate * durationHours;
  // Transparent Togethr safety, escrow & verification fee (~18%)
  const connectionFee = Math.round(hostSubtotal * 0.18);
  // Statutory 18% GST on the connection fee
  const gst = Math.round(connectionFee * 0.18);
  const totalPayable = hostSubtotal + connectionFee + gst;

  return {
    hourlyRate,
    durationHours,
    hostSubtotal,
    connectionFee,
    gst,
    totalPayable,
  };
}

export function generateStartCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}
