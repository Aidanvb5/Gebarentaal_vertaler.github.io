import React, { useRef, useEffect } from 'react';

export default function TryOut() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    async function getCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        alert('Could not access camera.');
      }
    }
    getCamera();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f5f6fa' }}>
      <h2 style={{ color: '#222' }}>Try Out the Sign Language Translator</h2>
      <video ref={videoRef} autoPlay playsInline style={{ width: 480, height: 360, background: '#000', borderRadius: 12, marginTop: 24 }} />
    </div>
  );
}
