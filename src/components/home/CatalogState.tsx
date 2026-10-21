import { RetryCatalogButton } from "./RetryCatalogButton";

interface CatalogStateProps {
  error: string | null;
  emptyMessage: string;
}

export function CatalogState({ error, emptyMessage }: CatalogStateProps) {
  if (error) {
    return (
      <div className="catalog-state catalog-state-error" role="alert">
        <strong>Не удалось загрузить этот раздел</strong>
        <span>{error}</span>
        <RetryCatalogButton />
      </div>
    );
  }

  return (
    <div className="catalog-state" role="status">
      <strong>Пока здесь пусто</strong>
      <span>{emptyMessage}</span>
    </div>
  );
}
