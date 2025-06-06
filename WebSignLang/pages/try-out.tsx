import dynamic from 'next/dynamic';
import Link from 'next/link';
import React, { useRef, useEffect, useState } from 'react';

function TryOut() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [translatedText, setTranslatedText] = useState<string>('');

  useEffect(() => {
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
            hands = new window.Hands({
              locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
            });
            hands.setOptions({
              maxNumHands: 2,
              modelComplexity: 1,
              minDetectionConfidence: 0.5,
              minTrackingConfidence: 0.5,
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
          window.drawConnectors(ctx, landmarks, window.HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 2 });
          window.drawLandmarks(ctx, landmarks, { color: '#FF0000', lineWidth: 1 });
          const flat = landmarks.flatMap((lm: any) => [lm.x, lm.y, lm.z]);
          while (flat.length < 63) flat.push(0);
          handsLandmarks.push(flat);
        }
        while (handsLandmarks.length < 2) {
          handsLandmarks.push(Array(63).fill(0));
        }
        fetch('https://gebarentaal-vertaler-github-io.onrender.com/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ landmarks: handsLandmarks }),
        })
          .then((res) => res.json())
          .then((data) => setTranslatedText(data.label))
          .catch(() => setTranslatedText(''));
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
      if (stream) stream.getTracks().forEach((track) => track.stop());
      if (animationId) cancelAnimationFrame(animationId);
      if (handsScript) document.body.removeChild(handsScript);
      if (drawingScript) document.body.removeChild(drawingScript);
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f5f6fa' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: 480, height: 360, marginTop: 24, border: '10px solid dodgerblue', borderRadius: 12, background: 'dodgerblue' }}>
          <video ref={videoRef} style={{ display: 'none' }} width={480} height={360} playsInline />
          <canvas ref={canvasRef} width={480} height={360} style={{ position: 'absolute', top: 0, left: 0, borderRadius: 12, background: '#000' }} />
        </div>
        <div style={{ marginTop: 32, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', width: 500 }}>
          <div style={{ flex: 1, background: '#e0e0e0', borderRadius: 8, padding: 24, minHeight: 60, fontSize: 18, color: '#222', textAlign: 'center', marginRight: 10 }}>
            <strong>Translated Text:</strong>
            <div style={{ marginTop: 8 }}>{translatedText || <span style={{ color: '#aaa' }}>(No sign detected yet)</span>}</div>
          </div>
          <Link href="/index">
            <button style={{ padding: '8px 20px', fontSize: '1rem', background: '#0070f3', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
              Go back
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default dynamic(() => Promise.resolve(TryOut), { ssr: false });
