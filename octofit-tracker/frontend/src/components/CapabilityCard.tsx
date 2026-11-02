import { useEffect, useState, type ReactNode } from 'react';
import { getJson } from '../api/client.js';

type Props<T, K extends string> = {
  title: string;
  description: string;
  endpoint: string;
  responseKey: K;
  emptyMessage: string;
  renderItem: (item: T) => ReactNode;
};

export function CapabilityCard<T, K extends string>({
  title,
  description,
  endpoint,
  responseKey,
  emptyMessage,
  renderItem,
}: Props<T, K>) {
  const [items, setItems] = useState<T[]>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    let active = true;
    setItems(undefined);
    setError(undefined);
    getJson<Record<K, T[]>>(endpoint)
      .then((response) => {
        if (active) setItems(response[responseKey]);
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Request failed');
      });
    return () => {
      active = false;
    };
  }, [endpoint, responseKey]);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        {error ? (
          <p role="alert">Unable to load {title.toLowerCase()}: {error}</p>
        ) : items === undefined ? (
          <p role="status">Loading {title.toLowerCase()}...</p>
        ) : items.length === 0 ? (
          <p role="status">{emptyMessage}</p>
        ) : (
          <ul className="list-group">
            {items.map((item, index) => <li className="list-group-item" key={index}>{renderItem(item)}</li>)}
          </ul>
        )}
      </div>
    </section>
  );
}
