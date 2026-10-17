import React from 'react';

/**
 * Format Indian Rupee currency safely without broken square glyphs
 */
export function formatCurrency(amount: number): string {
  const formatted = Math.abs(amount).toLocaleString('en-IN');
  return amount < 0 ? `-₹${formatted}` : `₹${formatted}`;
}

export function formatINR(amount: number): string {
  return formatCurrency(amount);
}
