import dynamic from 'next/dynamic';
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
        fetch('http://localhost:8000/predict', {
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
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f5f6fa' }}>
      <h2 style={{ color: '#222' }}>Try Out the Sign Language Translator</h2>
      <div style={{ position: 'relative', width: 480, height: 360, marginTop: 24 }}>
        <video ref={videoRef} style={{ display: 'none' }} width={480} height={360} playsInline />
        <canvas ref={canvasRef} width={480} height={360} style={{ position: 'absolute', top: 0, left: 0, borderRadius: 12, background: '#000' }} />
      </div>
      <div style={{ marginTop: 32, width: 480, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001', padding: 24, minHeight: 60, fontSize: 22, color: '#222', textAlign: 'center' }}>
        <strong>Translated Text:</strong>
        <div style={{ marginTop: 8 }}>{translatedText || <span style={{ color: '#aaa' }}>(No sign detected yet)</span>}</div>
      </div>
    </div>
  );
}

export default dynamic(() => Promise.resolve(TryOut), { ssr: false });
