import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f5f6fa' }}>
      <h1 style={{ fontSize: '2.5rem', color: '#222' }}>Sign Language Translator</h1>
      <p style={{ fontSize: '1.2rem', color: '#555', marginBottom: 32 }}>Welcome! Try out our sign language translator using your webcam.</p>
      <Link href="/try-out">
        <button style={{ padding: '12px 32px', fontSize: '1.1rem', background: '#0070f3', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
          Try Out
        </button>
      </Link>
    </div>
  );
}
