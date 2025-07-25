import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Formata um número de telefone com máscara brasileira
 * @param {string} value - Valor a ser formatado
 * @returns {string} - Número formatado
 */
export const formatPhoneNumber = (value) => {
  // Remove todos os caracteres não numéricos
  const numbers = value.replace(/\D/g, '');
  
  // Aplica máscara baseada no número de dígitos
  if (numbers.length <= 2) {
    return `(${numbers}`;
  } else if (numbers.length <= 6) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  } else if (numbers.length <= 10) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  } else {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  }
};

/**
 * Remove todos os caracteres não numéricos de um número de telefone
 * @param {string} value - Valor a ser limpo
 * @returns {string} - Apenas números
 */
export const cleanPhoneNumber = (value) => {
  return value.replace(/\D/g, '');
};
