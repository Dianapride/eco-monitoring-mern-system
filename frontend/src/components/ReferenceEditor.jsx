import { useState, useEffect } from 'react';

export default function ReferenceEditor() {
  const [refs, setRefs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/health-risk/references')
      .then(r => r.json())
      .then(data => {
        setRefs(data);
        setLoading(false);
      });
  }, []);

  const save = async () => {
    await fetch('http://localhost:5000/api/health-risk/references', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(refs)
    });
    alert('Довідник оновлено! Перезапустіть бекенд, щоб зміни набрали чинності.');
  };

  const updateRef = (index, field, value) => {
    const updated = [...refs];
    updated[index][field] = Number(value) || value;
    setRefs(updated);
  };

  if (loading) return <p>Завантаження довідника...</p>;

  return (
    <div className="mt-16 p-8 bg-yellow-50 rounded-xl border-2 border-yellow-300">
      <h2 className="text-2xl font-bold mb-6">Редагування довідника нормативів (RfD, SF)</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-yellow-200">
            <th className="p-3 border">Забруднювач</th>
            <th className="p-3 border">Середовище</th>
            <th className="p-3 border">RfD</th>
            <th className="p-3 border">SF</th>
          </tr>
        </thead>
        <tbody>
          {refs.map((r, i) => (
            <tr key={i}>
              <td className="p-3 border">{r.pollutant}</td>
              <td className="p-3 border">{r.medium}</td>
              <td className="p-3 border">
                <input
                  type="number"
                  step="0.0001"
                  value={r.RfD}
                  onChange={e => updateRef(i, 'RfD', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </td>
              <td className="p-3 border">
                <input
                  type="number"
                  step="0.001"
                  value={r.SF || ''}
                  onChange={e => updateRef(i, 'SF', e.target.value || null)}
                  className="w-full p-2 border rounded"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={save}
        className="mt-6 px-8 py-4 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700"
      >
        Зберегти зміни в references.json
      </button>
    </div>
  );
}