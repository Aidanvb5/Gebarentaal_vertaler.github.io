import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f5f6fa', position: 'relative' }}>
      <h1 style={{ fontSize: '2.5rem', color: '#222' }}>Gebarentaal Vertaler</h1>
      <p style={{ fontSize: '1.2rem', color: 'darkslategrey', marginBottom: 32, fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Oxygen, Ubuntu, Cantarell, \'Open Sans\', \'Helvetica Neue\', sans-serif' }}>
        Welkom! Probeer onze Gebarentaalvertaler met behulp van uw camera.
      </p>
      <Link href="/try-out">
        <button style={{ padding: '12px 32px', fontSize: '1.1rem', background: 'dodgerblue', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
          Proberen
        </button>
      </Link>
      <img 
        src="istockphoto-1445441554-612x612.jpg" 
        alt="Decoratief" 
        style={{ position: 'fixed', bottom: -20, left: -15, width: 380, maxWidth: '60vw', zIndex: 1, opacity: 0.85, pointerEvents: 'none' }}
      />
    </div>
  );
}
