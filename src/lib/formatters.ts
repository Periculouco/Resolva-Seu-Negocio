export function findOptionLabel<T extends string>(options: Array<{ value: T; label: string }>, value: T | "") {
  return options.find((option) => option.value === value)?.label ?? "";
}

export function formatCategoryLabel(label: string) {
  const categoryMap: Record<string, string> = {
    "Gestao & Estrategia": "Gestão & Estratégia",
    Financas: "Finanças",
    Operacoes: "Operações",
    Tecnologia: "Tecnologia",
    Vendas: "Vendas",
    "Marketing & Growth": "Marketing & Growth",
    "Pessoas & Cultura": "Pessoas & Cultura",
    Todos: "Todos",
  };

  return categoryMap[label] ?? label;
}

export function toStatusClassName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "-");
}
