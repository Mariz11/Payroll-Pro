export type ToastifyProps = {
  loading(): void;
  clear(): void;
  success(summary?: string, message?: string): void;
  error(summary?: string, message?: string): void;
};

export type PagingAssetProps = {
  offset?: number;
  limit?: number;
  searchPhrase?: string;
};
