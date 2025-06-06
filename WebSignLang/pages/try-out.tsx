import dynamic from 'next/dynamic';
import Link from 'next/link';
import React, { useRef, useEffect, useState } from 'react';

function TryOut() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [translatedText, setTranslatedText] = useState<string>('');

  useEffect(() => {
    // Only run in the browser, not during static export or SSR
    if (typeof window === 'undefined' || !navigator.mediaDevices) return;

    let hands: any;
    let animationId: number;
    let stream: MediaStream;
    let video: HTMLVideoElement;
    let handsScript: HTMLScriptElement | null = null;
    let drawingScript: HTMLScriptElement | null = null;

    async function setupCameraAndHands() {
      stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        video = videoRef.current;
        await video.play();
        // Dynamically load MediaPipe Hands and Drawing Utils from CDN
        handsScript = document.createElement('script');
        handsScript.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js';
        handsScript.async = true;
        drawingScript = document.createElement('script');
        drawingScript.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js';
        drawingScript.async = true;
        document.body.appendChild(handsScript);
        document.body.appendChild(drawingScript);
        handsScript.onload = () => {
          drawingScript!.onload = () => {
            // @ts-ignore
            hands = new window.Hands({
              locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
            });
            hands.setOptions({
              maxNumHands: 2,
              modelComplexity: 1,
              minDetectionConfidence: 0.5,
              minTrackingConfidence: 0.5
            });
            hands.onResults(onResults);
            startDetection();
          };
        };
      }
    }

    function onResults(results: any) {
      if (!canvasRef.current || !videoRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      let handsLandmarks: number[][] = [];
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        for (const landmarks of results.multiHandLandmarks) {
          // @ts-ignore
          window.drawConnectors(ctx, landmarks, window.HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 2 });
          // @ts-ignore
          window.drawLandmarks(ctx, landmarks, { color: '#FF0000', lineWidth: 1 });
          const flat = landmarks.flatMap((lm: any) => [lm.x, lm.y, lm.z]);
          // Pad to 63 values if needed
          while (flat.length < 63) flat.push(0);
          handsLandmarks.push(flat);
        }
        // Always send 2 hands (pad with zeros if only 1 detected)
        while (handsLandmarks.length < 2) {
          handsLandmarks.push(Array(63).fill(0));
        }
        fetch('https://gebarentaal-vertaler-github-io.onrender.com/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ landmarks: handsLandmarks }),
        })
          .then(res => res.json())
          .then(data => setTranslatedText(data.label))
          .catch(() => setTranslatedText(''));
      } else {
        // setTranslatedText('');
      }
      ctx.restore();
    }

    async function startDetection() {
      if (!video) return;
      const detect = async () => {
        await hands.send({ image: video });
        animationId = requestAnimationFrame(detect);
      };
      detect();
    }

    setupCameraAndHands();
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
      if (animationId) cancelAnimationFrame(animationId);
      if (handsScript) document.body.removeChild(handsScript);
      if (drawingScript) document.body.removeChild(drawingScript);
    };
  }, []);  return (
    <>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh', 
        position: 'relative',
        zIndex: 2,
        padding: '20px'
      }}>
        <Link href="/">
          <button style={{ 
            padding: '12px 32px', 
            fontSize: '1.1rem', 
            background: 'dodgerblue', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: 'pointer', 
            position: 'absolute', 
            top: '24px', 
            left: '24px',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Oxygen, Ubuntu, Cantarell, \'Open Sans\', \'Helvetica Neue\', sans-serif',
            transition: 'background-color 0.3s ease',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            Terug
          </button>
        </Link>
        
        <h1 style={{ 
          fontSize: '2.2rem', 
          color: 'black',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Oxygen, Ubuntu, Cantarell, \'Open Sans\', \'Helvetica Neue\', sans-serif',
          marginBottom: '16px',
          textAlign: 'center'
        }}>
          Probeer de Gebarentaalvertaler
        </h1>
        
        <p style={{
          fontSize: '1.1rem',
          color: 'darkslategrey',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Oxygen, Ubuntu, Cantarell, \'Open Sans\', \'Helvetica Neue\', sans-serif',
          marginBottom: '32px',
          textAlign: 'center',
          maxWidth: '600px'
        }}>
          Houd uw hand voor de camera en maak een gebaar. De vertaler herkent automatisch uw gebarentaal.
        </p>

        <div style={{ 
          position: 'relative', 
          width: '480px', 
          height: '360px', 
          marginBottom: '24px',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          border: '2px solid #e1e5e9'
        }}>
          <video ref={videoRef} style={{ display: 'none' }} width={480} height={360} playsInline />
          <canvas 
            ref={canvasRef} 
            width={480} 
            height={360} 
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              background: '#000',
              width: '100%',
              height: '100%'
            }} 
          />
        </div>
        
        <div style={{ 
          width: '480px',
          maxWidth: '90vw', 
          background: '#ffffff', 
          borderRadius: '12px', 
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)', 
          padding: '24px', 
          minHeight: '80px',
          border: '1px solid #e1e5e9'
        }}>
          <h3 style={{
            fontSize: '1.2rem',
            color: 'black',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Oxygen, Ubuntu, Cantarell, \'Open Sans\', \'Helvetica Neue\', sans-serif',
            margin: '0 0 12px 0',
            textAlign: 'center'
          }}>
            Vertaling
          </h3>
          <div style={{ 
            fontSize: '1.4rem',
            color: translatedText ? 'black' : '#999',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Oxygen, Ubuntu, Cantarell, \'Open Sans\', \'Helvetica Neue\', sans-serif',
            textAlign: 'center',
            fontWeight: translatedText ? '600' : '400',
            minHeight: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {translatedText || "Nog geen gebaar herkend"}
          </div>
        </div>
      </div>
        <img 
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

export default dynamic(() => Promise.resolve(TryOut), { ssr: false });
