import { useState, useEffect } from 'react';
import api from '../api/client';

export default function Footer() {
  const [visitas, setVisitas] = useState(null);

  useEffect(() => {
    api.get('/visits')
      .then(({ data }) => setVisitas(data.count))
      .catch(() => {});
  }, []);

  return (
    <footer className="text-center text-xs text-gray-400 py-6 mt-8 border-t border-gray-100 space-y-1">
      <p>Actualizado por última vez el {__LAST_COMMIT_DATE__}</p>
      {visitas !== null && (
        <p>{visitas.toLocaleString()} visitas en total</p>
      )}
    </footer>
  );
}
