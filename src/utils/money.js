export function formatBRLFromCents(cents) {
  const n = Number(cents) || 0;
  return (n / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

