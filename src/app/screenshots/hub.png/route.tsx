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
          AHANA&apos;S STUDIO
        </div>
        <div style={{ fontSize: 32, opacity: 0.7, marginBottom: 60 }}>
          Songs, Sketches, Stories & Stars
        </div>
        <div style={{ display: 'flex', gap: 30 }}>
          {['Sing', 'Show', 'Draw', 'Read'].map((label) => (
            <div
              key={label}
              style={{
                width: 160,
                height: 160,
                borderRadius: 30,
                background: 'rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                fontWeight: 700,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 1080, height: 1920 },
  );
}
