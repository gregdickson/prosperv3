import { useState, useRef, useEffect } from 'preact/hooks';
import {
  fundConfig,
  fundWarnings,
  fundTypeOptions,
  healthCheckProviders,
  projectBalance,
  formatCurrency,
  getRatingInfo,
} from '../../data/health-check';

type Step = 1 | 2 | 3 | 4;

interface FormState {
  fundKey: string;
  provider: string;
  balance: number;
  age: number;
  income: number;
  employeeContrib: number;
  employerContrib: number;
  firstHome: string;
  purchaseTimeframe: string;
  selfEmployed: boolean;
  selfEmployedMonthly: number;
}

const DEFAULTS: FormState = {
  fundKey: '',
  provider: '',
  balance: 30000,
  age: 35,
  income: 75000,
  employeeContrib: 3.5,
  employerContrib: 3.5,
  firstHome: 'yes',
  purchaseTimeframe: '',
  selfEmployed: false,
  selfEmployedMonthly: 500,
};

// ── Progress Dots ────
function StepDots({ current }: { current: Step }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '24px' }}>
      {[1, 2, 3, 4].map((n) => {
        const done = current > n;
        const active = current === n;
        return (
          <div
            key={n}
            style={{
              height: '8px',
              borderRadius: '4px',
              transition: 'all 0.3s',
              width: active ? '28px' : '8px',
              backgroundColor: active ? '#1c1b19' : done ? '#82cbee' : '#d4d4d4',
            }}
          />
        );
      })}
    </div>
  );
}

// ── Step Labels ────
function StepIndicator({ current }: { current: Step }) {
  const labels = ['Fund Type', 'Provider', 'Your Numbers', 'Results'];
  return (
    <div>
      <StepDots current={current} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '40px' }}>
        {labels.map((label, i) => {
          const stepNum = (i + 1) as Step;
          const done = current > stepNum;
          const active = current === stepNum;
          return (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    transition: 'all 0.3s',
                    backgroundColor: done ? '#82cbee' : active ? '#1c1b19' : '#e5e5e5',
                    color: done || active ? '#fff' : '#999',
                  }}
                >
                  {done ? (
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    stepNum
                  )}
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    marginTop: '4px',
                    fontWeight: active ? '700' : done ? '600' : '400',
                    color: active ? '#1c1b19' : done ? '#82cbee' : '#999',
                    fontFamily: '"Agrandir Tight", sans-serif',
                    textTransform: 'uppercase',
                  }}
                >
                  {label}
                </span>
              </div>
              {i < 3 && (
                <div
                  style={{
                    width: '32px',
                    height: '2px',
                    transition: 'all 0.3s',
                    backgroundColor: done ? '#82cbee' : '#e5e5e5',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Rating Badge ────
function RatingBadge({ fundKey, provider }: { fundKey: string; provider: string }) {
  const info = getRatingInfo(fundKey, provider);
  const colors = {
    green:   { bg: '#e8f5e9', border: '#81c784', text: '#2e7d32', dot: '#4caf50' },
    yellow:  { bg: '#fff8e1', border: '#ffd54f', text: '#f57f17', dot: '#ffc107' },
    red:     { bg: '#fbe9e7', border: '#ef9a9a', text: '#c62828', dot: '#f44336' },
    unknown: { bg: '#f5f5f5', border: '#bdbdbd', text: '#616161', dot: '#9e9e9e' },
  };
  const c = colors[info.rating];

  return (
    <div
      style={{
        backgroundColor: c.bg,
        border: `2px solid ${c.border}`,
        borderRadius: '12px',
        padding: '16px',
        marginTop: '16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div
          style={{
            width: '12px',
            height: '12px',
            backgroundColor: c.dot,
            borderRadius: '50%',
            marginTop: '4px',
            flexShrink: 0,
          }}
        />
        <div>
          <p style={{ color: c.text, fontSize: '14px', lineHeight: '1.5', margin: 0, fontFamily: '"Agrandir Tight", sans-serif' }}>
            {info.message}
          </p>
          <p style={{ fontSize: '11px', color: '#999', marginTop: '4px', fontFamily: '"Agrandir Tight", sans-serif' }}>
            Source: Morningstar Q4 2025
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Chart Component ────
function ProjectionChart({
  currentSeries,
  recommendedSeries,
  startAge,
  providerName,
}: {
  currentSeries: number[];
  recommendedSeries: number[];
  startAge: number;
  providerName: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;

    import('chart.js').then((mod) => {
      if (!mounted || !canvasRef.current) return;

      const {
        Chart,
        LineController,
        LineElement,
        PointElement,
        LinearScale,
        CategoryScale,
        Filler,
        Tooltip,
      } = mod;

      Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip);

      const labels = currentSeries.map((_, i) => startAge + i);

      if (chartRef.current) chartRef.current.destroy();

      chartRef.current = new Chart(canvasRef.current, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: providerName,
              data: currentSeries,
              borderColor: '#999',
              backgroundColor: 'rgba(153, 153, 153, 0.07)',
              borderWidth: 2,
              pointRadius: 0,
              fill: true,
              tension: 0.3,
              borderDash: [6, 3],
            },
            {
              label: 'Recommended',
              data: recommendedSeries,
              borderColor: '#1c1b19',
              backgroundColor: 'rgba(28, 27, 25, 0.06)',
              borderWidth: 2.5,
              pointRadius: 0,
              fill: true,
              tension: 0.3,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx: any) =>
                  `${ctx.dataset.label}: $${ctx.parsed.y.toLocaleString('en-NZ')}`,
              },
            },
          },
          scales: {
            x: {
              ticks: { color: '#999', font: { size: 11 }, maxTicksLimit: 8 },
              grid: { color: 'rgba(0, 0, 0, 0.05)' },
            },
            y: {
              ticks: {
                color: '#999',
                font: { size: 11 },
                callback: (v: any) =>
                  '$' + (v >= 1000000 ? (v / 1000000).toFixed(1) + 'M' : (v / 1000).toFixed(0) + 'k'),
              },
              grid: { color: 'rgba(0, 0, 0, 0.05)' },
            },
          },
        },
      });
    });

    return () => {
      mounted = false;
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [currentSeries, recommendedSeries, startAge, providerName]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '280px' }}>
      <canvas ref={canvasRef} />
    </div>
  );
}

// ── Shared Styles ────
const font = '"Agrandir Tight", sans-serif';

const btnPrimary: Record<string, string> = {
  width: '100%',
  padding: '16px 24px',
  borderRadius: '6px',
  border: 'none',
  backgroundColor: '#1c1b19',
  color: '#fff33e',
  fontFamily: font,
  fontSize: '20px',
  fontWeight: '700',
  textTransform: 'uppercase',
  cursor: 'pointer',
  transition: 'opacity 0.2s',
};

const btnBack: Record<string, string> = {
  padding: '14px 20px',
  borderRadius: '6px',
  border: '2px solid #1c1b19',
  backgroundColor: 'transparent',
  color: '#1c1b19',
  fontFamily: font,
  fontSize: '16px',
  fontWeight: '700',
  textTransform: 'uppercase',
  cursor: 'pointer',
};

const inputStyle: Record<string, string> = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: '6px',
  border: '2px solid #1c1b19',
  backgroundColor: '#fff',
  fontFamily: font,
  fontSize: '16px',
  color: '#1c1b19',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle: Record<string, string> = {
  display: 'block',
  fontSize: '13px',
  fontWeight: '700',
  color: '#1c1b19',
  marginBottom: '6px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  fontFamily: font,
};

// ── Main Wizard ────
export default function HealthCheckWizard() {
  const [step, setStep] = useState<Step>(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [form, setForm] = useState<FormState>(DEFAULTS);

  const goTo = (s: Step) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setStep(s);
      setIsTransitioning(false);
    }, 150);
  };

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Projection data
  const fd = fundConfig[form.fundKey] || fundConfig.unknown;
  const timeframeMap: Record<string, number> = { '0-3': 3, '3-5': 5, '5-10': 10 };
  const projectionYears = form.firstHome === 'no' && form.purchaseTimeframe
    ? Math.min(timeframeMap[form.purchaseTimeframe] || (65 - form.age), 65 - form.age)
    : Math.max(1, 65 - form.age);
  const years = Math.max(1, projectionYears);

  const effectiveEmployerContrib = form.selfEmployed ? 0 : form.employerContrib;
  const selfEmployedAnnual = form.selfEmployed ? form.selfEmployedMonthly * 12 : 0;

  const currentSeries = projectBalance(form.balance, form.income, form.employeeContrib, effectiveEmployerContrib, fd.cur, years, selfEmployedAnnual);
  const recommendedSeries = projectBalance(form.balance, form.income, form.employeeContrib, effectiveEmployerContrib, fd.rec, years, selfEmployedAnnual);
  const currentFinal = currentSeries[currentSeries.length - 1];
  const recommendedFinal = recommendedSeries[recommendedSeries.length - 1];
  const difference = recommendedFinal - currentFinal;
  const providerLabel = form.provider || 'your current provider';

  const cardBase: Record<string, string> = {
    backgroundColor: '#fff',
    border: '3px solid #1c1b19',
    borderRadius: '6px',
    padding: '24px',
    textAlign: 'center',
    fontFamily: font,
  };

  return (
    <div style={{ width: '100%', fontFamily: font }}>
      <StepIndicator current={step} />

      <div
        style={{
          transition: 'all 0.3s',
          opacity: isTransitioning ? 0 : 1,
          transform: isTransitioning ? 'translateX(16px)' : 'translateX(0)',
        }}
      >
        {/* ── Step 1: Fund Type ── */}
        {step === 1 && (
          <div>
            <div style={{ backgroundColor: '#82cbee', borderRadius: '6px', padding: '20px', marginBottom: '24px' }}>
              <h3 style={{ fontFamily: font, fontSize: '18px', fontWeight: '700', color: '#1c1b19', marginBottom: '8px', textTransform: 'uppercase' }}>
                Why does fund type matter?
              </h3>
              <p style={{ fontFamily: font, fontSize: '14px', color: '#1c1b19', lineHeight: '1.5', margin: 0 }}>
                Your fund type is the single biggest factor in how your KiwiSaver grows. A defensive fund might return 2-3% per year, while a growth fund targets 9-11%. Over 30 years, that difference can be <strong>hundreds of thousands of dollars</strong>.
              </p>
            </div>

            <h3 style={{ fontFamily: font, fontSize: '24px', fontWeight: '700', color: '#1c1b19', marginBottom: '8px', textTransform: 'uppercase' }}>
              What type of fund are you in?
            </h3>
            <p style={{ fontFamily: font, fontSize: '14px', color: '#666', marginBottom: '20px' }}>
              Pick the one that sounds closest. No stress if you're not sure.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '12px' }}>
              {fundTypeOptions.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => update('fundKey', opt.key)}
                  style={{
                    textAlign: 'left',
                    padding: '16px 20px',
                    borderRadius: '6px',
                    border: form.fundKey === opt.key ? '3px solid #1c1b19' : '3px solid #d4d4d4',
                    backgroundColor: form.fundKey === opt.key ? '#fff33e' : '#fff',
                    cursor: 'pointer',
                    fontFamily: font,
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{ fontWeight: '700', color: '#1c1b19', display: 'block', fontSize: '16px' }}>{opt.label}</span>
                  <span style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', color: '#666' }}>
                    {opt.key === 'unknown' && form.fundKey !== opt.key ? opt.timeframe : `Timeframe: ${opt.timeframe}`}
                  </span>
                </button>
              ))}
            </div>

            {form.fundKey && fundWarnings[form.fundKey] && (
              <div style={{ backgroundColor: '#fff33e', border: '2px solid #1c1b19', borderRadius: '6px', padding: '16px', marginTop: '16px', fontSize: '14px', color: '#1c1b19', lineHeight: '1.5', fontFamily: font }}>
                {fundWarnings[form.fundKey]}
              </div>
            )}

            <button
              type="button"
              onClick={() => form.fundKey && goTo(2)}
              disabled={!form.fundKey}
              style={{ ...btnPrimary, marginTop: '24px', opacity: form.fundKey ? 1 : 0.4 }}
            >
              Next
            </button>
          </div>
        )}

        {/* ── Step 2: Provider ── */}
        {step === 2 && (
          <div>
            <div style={{ backgroundColor: '#82cbee', borderRadius: '6px', padding: '20px', marginBottom: '24px' }}>
              <h3 style={{ fontFamily: font, fontSize: '18px', fontWeight: '700', color: '#1c1b19', marginBottom: '8px', textTransform: 'uppercase' }}>
                Why does your provider matter?
              </h3>
              <p style={{ fontFamily: font, fontSize: '14px', color: '#1c1b19', lineHeight: '1.5', margin: 0 }}>
                Not all KiwiSaver providers are created equal. A 2-3% difference in annual returns might sound small, but over 20+ years it compounds into <strong>hundreds of thousands</strong>.
              </p>
            </div>

            <h3 style={{ fontFamily: font, fontSize: '24px', fontWeight: '700', color: '#1c1b19', marginBottom: '8px', textTransform: 'uppercase' }}>
              Who looks after your KiwiSaver?
            </h3>
            <p style={{ fontFamily: font, fontSize: '14px', color: '#666', marginBottom: '20px' }}>
              Pick your current provider from the list below.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
              {healthCheckProviders.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => update('provider', p)}
                  style={{
                    padding: '14px 12px',
                    borderRadius: '6px',
                    border: form.provider === p ? '3px solid #1c1b19' : '3px solid #d4d4d4',
                    backgroundColor: form.provider === p ? '#fff33e' : '#fff',
                    textAlign: 'center',
                    fontSize: '14px',
                    fontWeight: '700',
                    color: '#1c1b19',
                    cursor: 'pointer',
                    fontFamily: font,
                    transition: 'all 0.2s',
                  }}
                >
                  {p === 'Other' ? 'Other / Unsure' : p}
                </button>
              ))}
            </div>

            {form.provider && (
              <RatingBadge fundKey={form.fundKey} provider={form.provider} />
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button type="button" onClick={() => goTo(1)} style={btnBack}>Back</button>
              <button
                type="button"
                onClick={() => form.provider && goTo(3)}
                disabled={!form.provider}
                style={{ ...btnPrimary, flex: 1, opacity: form.provider ? 1 : 0.4 }}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Your Numbers ── */}
        {step === 3 && (
          <div>
            <div style={{ backgroundColor: '#82cbee', borderRadius: '6px', padding: '20px', marginBottom: '24px' }}>
              <h3 style={{ fontFamily: font, fontSize: '18px', fontWeight: '700', color: '#1c1b19', marginBottom: '8px', textTransform: 'uppercase' }}>
                Small differences compound into big money
              </h3>
              <p style={{ fontFamily: font, fontSize: '14px', color: '#1c1b19', lineHeight: '1.5', margin: 0 }}>
                A couple of extra percent return each year doesn't sound like much. But thanks to compound interest, a $30,000 balance at age 30 could be worth anywhere from <strong>$180K to $650K+</strong> by 65.
              </p>
            </div>

            <h3 style={{ fontFamily: font, fontSize: '24px', fontWeight: '700', color: '#1c1b19', marginBottom: '8px', textTransform: 'uppercase' }}>
              Let's crunch the numbers
            </h3>
            <p style={{ fontFamily: font, fontSize: '14px', color: '#666', marginBottom: '20px' }}>
              Pop in your details and we'll project what your KiwiSaver could look like at 65.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>KiwiSaver balance ($)</label>
                <input
                  type="number"
                  value={form.balance}
                  onInput={(e) => update('balance', parseFloat((e.target as HTMLInputElement).value) || 0)}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Your age</label>
                  <input
                    type="number"
                    value={form.age}
                    min={18}
                    max={64}
                    onInput={(e) => update('age', parseInt((e.target as HTMLInputElement).value) || 35)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Annual income ($)</label>
                  <input
                    type="number"
                    value={form.income}
                    onInput={(e) => update('income', parseFloat((e.target as HTMLInputElement).value) || 0)}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: form.selfEmployed ? '1fr' : '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Your contribution</label>
                  <select
                    value={form.employeeContrib}
                    onChange={(e) => update('employeeContrib', parseFloat((e.target as HTMLSelectElement).value))}
                    style={inputStyle}
                  >
                    <option value={3.5}>3.5%</option>
                    <option value={4}>4%</option>
                    <option value={6}>6%</option>
                    <option value={8}>8%</option>
                    <option value={10}>10%</option>
                  </select>
                </div>
                {!form.selfEmployed && (
                  <div>
                    <label style={labelStyle}>Employer contribution</label>
                    <select
                      value={form.employerContrib}
                      onChange={(e) => update('employerContrib', parseFloat((e.target as HTMLSelectElement).value))}
                      style={inputStyle}
                    >
                      <option value={3.5}>3.5%</option>
                      <option value={4}>4%</option>
                      <option value={6}>6%</option>
                      <option value={8}>8%</option>
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label style={labelStyle}>Bought your first home?</label>
                <select
                  value={form.firstHome}
                  onChange={(e) => {
                    update('firstHome', (e.target as HTMLSelectElement).value);
                    if ((e.target as HTMLSelectElement).value === 'yes') {
                      update('purchaseTimeframe', '');
                    }
                  }}
                  style={inputStyle}
                >
                  <option value="yes">Yes — KiwiSaver locked until 65</option>
                  <option value="no">No — may use it for a first home</option>
                </select>
              </div>

              {form.firstHome === 'no' && (
                <div>
                  <label style={labelStyle}>Estimated purchase timeframe</label>
                  <select
                    value={form.purchaseTimeframe}
                    onChange={(e) => update('purchaseTimeframe', (e.target as HTMLSelectElement).value)}
                    style={inputStyle}
                  >
                    <option value="" disabled>Select timeframe</option>
                    <option value="0-3">0–3 years</option>
                    <option value="3-5">3–5 years</option>
                    <option value="5-10">5–10 years</option>
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="checkbox"
                  id="self-employed"
                  checked={form.selfEmployed}
                  onChange={(e) => update('selfEmployed', (e.target as HTMLInputElement).checked)}
                  style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#1c1b19' }}
                />
                <label for="self-employed" style={{ fontSize: '14px', fontWeight: '700', color: '#1c1b19', cursor: 'pointer', fontFamily: font }}>
                  I'm self-employed
                </label>
              </div>

              {form.selfEmployed && (
                <div>
                  <label style={labelStyle}>Monthly contribution ($)</label>
                  <input
                    type="number"
                    value={form.selfEmployedMonthly}
                    onInput={(e) => update('selfEmployedMonthly', parseFloat((e.target as HTMLInputElement).value) || 0)}
                    style={inputStyle}
                  />
                  <p style={{ fontSize: '12px', color: '#999', marginTop: '4px', fontFamily: font }}>
                    This replaces employer contributions in the projection.
                  </p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button type="button" onClick={() => goTo(2)} style={btnBack}>Back</button>
              <button type="button" onClick={() => goTo(4)} style={{ ...btnPrimary, flex: 1 }}>
                Show My Results
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: Results ── */}
        {step === 4 && (
          <div>
            <h3 style={{ fontFamily: font, fontSize: '28px', fontWeight: '700', color: '#1c1b19', marginBottom: '24px', textAlign: 'center', textTransform: 'uppercase' }}>
              Your KiwiSaver Projection
            </h3>

            {/* Comparison cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              <div style={cardBase}>
                <p style={{ fontSize: '11px', fontWeight: '700', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                  {form.firstHome === 'no' && form.purchaseTimeframe
                    ? `In ${timeframeMap[form.purchaseTimeframe]} yrs — ${providerLabel}`
                    : `At 65 — ${providerLabel}`}
                </p>
                <p style={{ fontSize: '32px', fontWeight: '900', color: '#999', margin: 0, fontFamily: '"Agrandir Narrow", sans-serif' }}>
                  {formatCurrency(currentFinal)}
                </p>
                <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                  {years} yrs at {fd.cur}% p.a.
                </p>
              </div>
              <div style={{ ...cardBase, border: '3px solid #1c1b19', backgroundColor: '#fff33e' }}>
                <p style={{ fontSize: '11px', fontWeight: '700', color: '#1c1b19', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                  {form.firstHome === 'no' && form.purchaseTimeframe
                    ? `In ${timeframeMap[form.purchaseTimeframe]} yrs — recommended`
                    : 'At 65 — recommended'}
                </p>
                <p style={{ fontSize: '32px', fontWeight: '900', color: '#1c1b19', margin: 0, fontFamily: '"Agrandir Narrow", sans-serif' }}>
                  {formatCurrency(recommendedFinal)}
                </p>
                <p style={{ fontSize: '16px', color: '#1c1b19', fontWeight: '800', marginTop: '4px' }}>
                  +{formatCurrency(difference)} more
                </p>
              </div>
            </div>

            {/* Chart */}
            <div style={{ ...cardBase, marginBottom: '24px', textAlign: 'left' }}>
              <h4 style={{ fontFamily: font, fontSize: '16px', fontWeight: '700', color: '#1c1b19', marginBottom: '4px', textTransform: 'uppercase' }}>
                {form.firstHome === 'no' && form.purchaseTimeframe
                  ? `Projected balance over ${years} years`
                  : 'Projected balance to age 65'}
              </h4>
              <p style={{ fontSize: '12px', color: '#999', marginBottom: '16px', fontFamily: font }}>
                {form.firstHome === 'no' && form.purchaseTimeframe
                  ? `From age ${form.age} to ${form.age + years}`
                  : `From age ${form.age} to 65`}
              </p>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#666', fontFamily: font }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: '#999' }} />
                  {providerLabel}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#666', fontFamily: font }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: '#1c1b19' }} />
                  Recommended
                </div>
              </div>
              <ProjectionChart
                currentSeries={currentSeries}
                recommendedSeries={recommendedSeries}
                startAge={form.age}
                providerName={providerLabel}
              />
            </div>

            {/* CTA for large differences */}
            {difference > 30000 && (
              <div style={{ backgroundColor: '#fff33e', border: '3px solid #1c1b19', borderRadius: '6px', padding: '20px', marginBottom: '24px', fontFamily: font }}>
                <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#1c1b19', marginBottom: '4px', textTransform: 'uppercase' }}>
                  Here are the straight facts.
                </h4>
                <p style={{ fontSize: '14px', color: '#1c1b19', lineHeight: '1.5', margin: 0 }}>
                  Switching to a better fund could mean{' '}
                  <strong>{formatCurrency(difference)} more</strong> at retirement. A 15-minute chat costs nothing.
                </p>
              </div>
            )}

            {/* CTA button */}
            <a
              href="#book"
              style={{ ...btnPrimary, display: 'block', textAlign: 'center', textDecoration: 'none' }}
            >
              Get This Sorted
            </a>

            {/* Start over */}
            <button
              type="button"
              onClick={() => {
                setForm(DEFAULTS);
                goTo(1);
              }}
              style={{
                width: '100%',
                marginTop: '12px',
                padding: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#999',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontFamily: font,
                textTransform: 'uppercase',
              }}
            >
              Start Over
            </button>

            {/* Disclaimer */}
            <p style={{ fontSize: '11px', color: '#999', textAlign: 'center', marginTop: '24px', lineHeight: '1.5', fontFamily: font }}>
              Projections are estimates based on historical returns and assumed 2% annual salary growth. Actual returns will vary. This tool provides general information only and does not constitute personalised financial advice.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
