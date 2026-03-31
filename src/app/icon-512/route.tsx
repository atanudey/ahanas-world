import { ImageResponse } from 'next/og';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #7c3aed, #ec4899, #f43f5e)',
          borderRadius: '100px',
        }}
      >
        <div
          style={{
            fontSize: 240,
            fontWeight: 900,
            color: 'white',
            letterSpacing: '-10px',
          }}
        >
          AW
        </div>
      </div>
    ),
    { width: 512, height: 512 },
  );
}
