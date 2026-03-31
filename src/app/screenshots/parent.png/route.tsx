import { ImageResponse } from 'next/og';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(180deg, #0f0326, #1a0940, #0d1b3e)',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 80, fontWeight: 900, marginBottom: 20 }}>
          PARENT STUDIO
        </div>
        <div style={{ fontSize: 32, opacity: 0.7, marginBottom: 60 }}>
          Review, Approve & Publish
        </div>
        <div
          style={{
            width: 800,
            height: 400,
            borderRadius: 40,
            background: 'rgba(255,255,255,0.08)',
            border: '2px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 36,
            opacity: 0.5,
          }}
        >
          Content Dashboard
        </div>
      </div>
    ),
    { width: 1080, height: 1920 },
  );
}
