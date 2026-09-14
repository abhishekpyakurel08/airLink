export default function HomePage() {
  return (
    <main style={{ padding: '60px 20px', maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
      <h1 style={{ fontSize: '3rem', color: '#38bdf8', marginBottom: '12px' }}>📡 AirLink</h1>
      <p style={{ fontSize: '1.2rem', color: '#94a3b8', marginBottom: '40px' }}>
        Real-Time Remote Control for your Browser. No Account Required. 1-Second QR Pairing.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', textAlign: 'left' }}>
        <div style={{ background: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155' }}>
          <h3 style={{ color: '#38bdf8' }}>⚡ 1-Second QR Pairing</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Scan short-lived 60-second QR codes to pair instantly without creating accounts.</p>
        </div>

        <div style={{ background: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155' }}>
          <h3 style={{ color: '#38bdf8' }}>🖱️ Batched Trackpad</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>60fps gesture movement batching, left/right clicks, double-tap & two-finger smooth scrolling.</p>
        </div>

        <div style={{ background: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155' }}>
          <h3 style={{ color: '#38bdf8' }}>⌨️ Keyboard Remote</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Full key controls (Enter, Escape, Tab, Backspace, Space, Arrow keys) and active input text typing.</p>
        </div>

        <div style={{ background: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155' }}>
          <h3 style={{ color: '#38bdf8' }}>🌐 Smart Tab Search</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Filter active browser tabs in real-time by string search, switch, close, or launch custom workspace presets.</p>
        </div>
      </div>
    </main>
  );
}
