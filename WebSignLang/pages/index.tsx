import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '90vh', 
        position: 'relative', 
        zIndex: 2 
      }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          color: 'black', 
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Oxygen, Ubuntu, Cantarell, \'Open Sans\', \'Helvetica Neue\', sans-serif' 
        }}>
          Gebarentaalvertaler
        </h1>
        <p style={{ 
          fontSize: '1.2rem', 
          color: 'darkslategrey', 
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Oxygen, Ubuntu, Cantarell, \'Open Sans\', \'Helvetica Neue\', sans-serif',
          marginBottom: '32px'
        }}>
          Welkom! Probeer onze Gebarentaalvertaler met behulp van uw camera.
        </p>
        <Link href="/try-out">
          <button style={{ 
            padding: '12px 32px', 
            fontSize: '1.1rem', 
            background: 'dodgerblue', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: 'pointer' 
          }}>
            Proberen
          </button>
        </Link>
      </div>      <img 
        src="/Gebarentaal_vertaler.github.io/istockphoto-1445441554-612x612.jpg" 
        alt="Decorative" 
        style={{ 
          position: 'fixed', 
          bottom: '-20px', 
          left: '-15px', 
          width: '380px', 
          maxWidth: '60vw', 
          zIndex: 1, 
          opacity: 0.85, 
          pointerEvents: 'none' 
        }}
      />
    </>
  );
}
