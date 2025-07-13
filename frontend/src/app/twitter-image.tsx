import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'AI Tools Finder - Находите и сравнивайте лучшие AI-инструменты'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f172a',
          backgroundImage: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          fontSize: 32,
          fontWeight: 600,
          position: 'relative',
        }}
      >
        {/* Background pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 25% 25%, #3b82f630 0%, transparent 50%), radial-gradient(circle at 75% 75%, #8b5cf630 0%, transparent 50%)',
          }}
        />
        
        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '40px',
            maxWidth: '1000px',
            zIndex: 1,
          }}
        >
          {/* Logo/Brand */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '30px',
            }}
          >
            <div
              style={{
                width: '70px',
                height: '70px',
                borderRadius: '14px',
                backgroundColor: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '20px',
                fontSize: '36px',
              }}
            >
              🤖
            </div>
            <span
              style={{
                fontSize: '42px',
                fontWeight: 800,
                color: '#ffffff',
              }}
            >
              AI Tools Finder
            </span>
          </div>

          {/* Main title */}
          <h1
            style={{
              fontSize: '58px',
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 1.1,
              marginBottom: '20px',
              textAlign: 'center',
            }}
          >
            Каталог AI-инструментов
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: '24px',
              color: '#94a3b8',
              lineHeight: 1.4,
              marginBottom: '30px',
              textAlign: 'center',
              maxWidth: '700px',
            }}
          >
            Сравнивайте и выбирайте лучшие AI решения
          </p>

          {/* Stats */}
          <div
            style={{
              display: 'flex',
              gap: '30px',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                padding: '10px 20px',
                backgroundColor: '#1e293b',
                borderRadius: '20px',
                fontSize: '18px',
                color: '#3b82f6',
                fontWeight: 600,
                border: '1px solid #3b82f630',
              }}
            >
              1000+ инструментов
            </div>
            <div
              style={{
                padding: '10px 20px',
                backgroundColor: '#1e293b',
                borderRadius: '20px',
                fontSize: '18px',
                color: '#10b981',
                fontWeight: 600,
                border: '1px solid #10b98130',
              }}
            >
              Реальные отзывы
            </div>
            <div
              style={{
                padding: '10px 20px',
                backgroundColor: '#1e293b',
                borderRadius: '20px',
                fontSize: '18px',
                color: '#f59e0b',
                fontWeight: 600,
                border: '1px solid #f59e0b30',
              }}
            >
              Обновления каждый день
            </div>
          </div>
        </div>

        {/* Bottom gradient */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '100px',
            background: 'linear-gradient(to top, #0f172a, transparent)',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  )
}