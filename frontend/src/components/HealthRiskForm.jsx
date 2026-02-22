import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const generateSyntheticData = () => ({
  pollutant: ['Бензол', 'Свинець', 'PM2.5', 'Формальдегід', 'Кадмій'][Math.floor(Math.random() * 5)],
  medium: Math.random() > 0.5 ? 'повітря' : 'вода',
  C: Number((Math.random() * (0.25 - 0.005) + 0.005).toFixed(6)),
  IR: Math.random() > 0.5 
    ? Number((Math.random() * 12 + 8).toFixed(1)) 
    : Number((Math.random() * 1 + 1.5).toFixed(1)),
  EF: Math.floor(Math.random() * 251 + 100),
  ED: Math.floor(Math.random() * 30 + 1),
  BW: Number((Math.random() * 70 + 20).toFixed(1)),
  AT: 365 * (Math.floor(Math.random() * 70 + 20))
});

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  return (
    <div className="flex gap-4">
      <button onClick={() => i18n.changeLanguage('uk')} className={`px-5 py-2 rounded-lg font-bold ${i18n.language === 'uk' ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>УКР</button>
      <button onClick={() => i18n.changeLanguage('en')} className={`px-5 py-2 rounded-lg font-bold ${i18n.language === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>ENG</button>
    </div>
  );
}

function ReferenceEditor() {
  const [refs, setRefs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/health-risk/references')
      .then(r => r.json())
      .then(data => { setRefs(data); setLoading(false); });
  }, []);

  const save = async () => {
    await fetch('http://localhost:5000/api/health-risk/references', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(refs)
    });
    toast.success('Довідник RfD та SF успішно оновлено!');
  };

  const update = (i, field, value) => {
    const updated = [...refs];
    updated[i][field] = field === 'pollutant' || field === 'medium' ? value : Number(value) || null;
    setRefs(updated);
  };

  if (loading) return <p className="mt-10 text-gray-600">Завантаження довідника...</p>;

  return (
    <div className="mt-16 p-8 bg-amber-50 rounded-xl border-2 border-amber-300">
      <h2 className="text-2xl font-bold mb-6 text-amber-800">Редагування довідника нормативів (RfD, SF)</h2>
      <table className="w-full border-collapse bg-white rounded-lg shadow">
        <thead>
          <tr className="bg-amber-200">
            <th className="p-4 border">Забруднювач</th>
            <th className="p-4 border">Середовище</th>
            <th className="p-4 border">RfD</th>
            <th className="p-4 border">SF</th>
          </tr>
        </thead>
        <tbody>
          {refs.map((r, i) => (
            <tr key={i}>
              <td className="p-3 border"><input value={r.pollutant} onChange={e => update(i, 'pollutant', e.target.value)} className="w-full p-2" /></td>
              <td className="p-3 border">
                <select value={r.medium} onChange={e => update(i, 'medium', e.target.value)} className="w-full p-2">
                  <option>повітря</option>
                  <option>вода</option>
                </select>
              </td>
              <td className="p-3 border"><input type="number" step="0.0001" value={r.RfD || ''} onChange={e => update(i, 'RfD', e.target.value)} className="w-full p-2" /></td>
              <td className="p-3 border"><input type="number" step="0.001" value={r.SF || ''} onChange={e => update(i, 'SF', e.target.value)} className="w-full p-2" /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={save} className="mt-6 px-8 py-4 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700">
        Зберегти зміни в references.json
      </button>
    </div>
  );
}

export default function HealthRiskForm() {
  const { t } = useTranslation();
  const [form, setForm] = useState(generateSyntheticData());
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/health-risk/calc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.data);
        toast.success(t('calc_success'));
      } else {
        toast.error(data.error || t('calc_error'));
      }
    } catch (err) {
      toast.error(t('server_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-6xl mx-auto p-8 bg-white rounded-3xl shadow-2xl">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-bold text-indigo-800">В1 — Оцінка ризику для здоров’я (МОЗ 2023)</h1>
          <LanguageSwitcher />
        </div>

        <button onClick={() => setForm(generateSyntheticData())} className="mb-8 px-8 py-4 bg-green-600 text-white text-lg font-bold rounded-xl hover:bg-green-700 shadow-lg transition">
          {t('generate_data') || 'Згенерувати синтетичні дані'}
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <input name="pollutant" value={form.pollutant} onChange={handleChange} placeholder="Забруднювач" className="p-4 border-2 rounded-xl focus:border-indigo-500" />
          <select name="medium" value={form.medium} onChange={handleChange} className="p-4 border-2 rounded-xl"><option>повітря</option><option>вода</option></select>
          <input type="number" step="0.000001" name="C" value={form.C} onChange={handleChange} placeholder="C (мг/м³ або мг/л)" className="p-4 border-2 rounded-xl" />
          <input type="number" step="0.1" name="IR" value={form.IR} onChange={handleChange} placeholder="IR (м³/добу або л/добу)" className="p-4 border-2 rounded-xl" />
          <input type="number" name="EF" value={form.EF} onChange={handleChange} placeholder="EF (100–350)" className="p-4 border-2 rounded-xl" />
          <input type="number" name="ED" value={form.ED} onChange={handleChange} placeholder="ED (1–30 років)" className="p-4 border-2 rounded-xl" />
          <input type="number" step="0.1" name="BW" value={form.BW} onChange={handleChange} placeholder="BW (20–90 кг)" className="p-4 border-2 rounded-xl" />
          <input type="number" name="AT" value={form.AT} onChange={handleChange} placeholder="AT (днів)" className="p-4 border-2 rounded-xl" />
        </div>

        <button onClick={submit} disabled={loading} className="w-full py-5 bg-indigo-600 text-white text-2xl font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-60 shadow-xl transition">
          {loading ? 'Обчислення...' : 'Розрахувати ризик'}
        </button>

        {result && (
          <div className="mt-12 p-10 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl border-2 border-indigo-200">
            <h2 className="text-3xl font-bold mb-8">{t('result') || 'Результат'}</h2>
            <div className="grid grid-cols-2 gap-8 text-xl">
              <p>CDI: <strong className="text-indigo-700">{result.CDI.toFixed(8)}</strong> мг/(кг·добу)</p>
              <p>HQ: <strong className={result.HQ > 1 ? 'text-red-600' : 'text-green-600'}>{result.HQ?.toFixed(3) || '—'}</strong></p>
              <p>HI: <strong className={result.HI > 1 ? 'text-red-600' : 'text-green-600'}>{result.HI?.toFixed(3) || '—'}</strong></p>
              <p>CR: <strong className={result.CR > 1e-5 ? 'text-red-600' : 'text-green-600'}>{result.CR ? result.CR.toExponential(2) : '—'}</strong></p>
            </div>
            {result.HQ > 1 && <p className="mt-8 text-red-600 text-3xl font-bold animate-pulse">{t('non_carcinogenic_risk_exceeded')}</p>}
            {result.CR > 1e-5 && <p className="mt-4 text-red-600 text-3xl font-bold animate-pulse">{t('carcinogenic_risk_exceeded')}</p>}
          </div>
        )}

        <ReferenceEditor />
      </div>
    </div>
  );
}