import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const title = searchParams.get('title') || 'AI Tools Finder'
    const description = searchParams.get('description') || 'Находите и сравнивайте лучшие AI-инструменты'
    const category = searchParams.get('category')
    const rating = searchParams.get('rating')
    const price = searchParams.get('price')

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
                marginBottom: '40px',
              }}
            >
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '12px',
                  backgroundColor: '#3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '20px',
                  fontSize: '32px',
                }}
              >
                🤖
              </div>
              <span
                style={{
                  fontSize: '36px',
                  fontWeight: 700,
                  color: '#ffffff',
                }}
              >
                AI Tools Finder
              </span>
            </div>

            {/* Title */}
            <h1
              style={{
                fontSize: '56px',
                fontWeight: 800,
                color: '#ffffff',
                lineHeight: 1.1,
                marginBottom: '20px',
                textAlign: 'center',
                maxWidth: '900px',
              }}
            >
              {title}
            </h1>

            {/* Description */}
            <p
              style={{
                fontSize: '24px',
                color: '#cbd5e1',
                lineHeight: 1.4,
                marginBottom: '30px',
                textAlign: 'center',
                maxWidth: '800px',
              }}
            >
              {description}
            </p>

            {/* Metadata badges */}
            <div
              style={{
                display: 'flex',
                gap: '16px',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              {category && (
                <div
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#3b82f6',
                    borderRadius: '20px',
                    fontSize: '18px',
                    color: '#ffffff',
                    fontWeight: 600,
                  }}
                >
                  {category}
                </div>
              )}
              {rating && (
                <div
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#f59e0b',
                    borderRadius: '20px',
                    fontSize: '18px',
                    color: '#ffffff',
                    fontWeight: 600,
                  }}
                >
                  ⭐ {rating}
                </div>
              )}
              {price && (
                <div
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#10b981',
                    borderRadius: '20px',
                    fontSize: '18px',
                    color: '#ffffff',
                    fontWeight: 600,
                  }}
                >
                  {price}
                </div>
              )}
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
        width: 1200,
        height: 630,
      }
    )
  } catch (e: any) {
    console.log(`Failed to generate the image: ${e.message}`)
    return new Response(`Failed to generate the image`, {
      status: 500,
    })
  }
}