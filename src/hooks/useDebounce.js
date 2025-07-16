import { useState, useEffect } from 'react';

// Hook personalizado para debounce de valores
export function useDebounce(value, delay) {
  // Estado para armazenar o valor "debounced"
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Configura um timer que atualiza o valor debounced após o atraso
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpa o timer se o valor mudar (ou o componente for desmontado)
    // Isso garante que o valor debounced só seja atualizado após o atraso sem novas chamadas
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // A cada mudança de 'value' ou 'delay', reinicia o timer

  return debouncedValue;
}