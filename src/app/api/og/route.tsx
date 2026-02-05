import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)

        // Parameters
        const title = searchParams.get('title') || 'EPOCH FILM'
        const category = searchParams.get('category') || 'MEMORIES'
        const nickname = searchParams.get('nickname') || 'Unknown Director'

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
                        backgroundColor: '#0A0908', // void
                        backgroundImage: 'radial-gradient(circle at center, #1A1816 0%, #0A0908 100%)',
                        color: '#F7F2E9', // celluloid
                        padding: '80px',
                    }}
                >
                    {/* Film Frame Border */}
                    <div style={{
                        position: 'absolute',
                        top: 40, bottom: 40, left: 40, right: 40,
                        border: '1px solid rgba(201, 162, 39, 0.2)', // gold-film/20
                    }} />

                    {/* Content */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                    }}>
                        <div style={{
                            fontSize: 16,
                            fontFamily: 'serif',
                            color: 'rgba(201, 162, 39, 0.6)', // gold-film/60
                            letterSpacing: '0.4em',
                            textTransform: 'uppercase',
                            marginBottom: 20,
                        }}>
                            {category}
                        </div>

                        <h1 style={{
                            fontSize: 72,
                            fontWeight: 700,
                            fontFamily: 'serif',
                            marginBottom: 30,
                            lineHeight: 1.1,
                        }}>
                            {title}
                        </h1>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: 24,
                            color: 'rgba(247, 242, 233, 0.4)', // smoke
                            letterSpacing: '0.2em',
                        }}>
                            DIRECTED BY <span style={{ color: '#C9A227', marginLeft: 12 }}>{nickname.toUpperCase()}</span>
                        </div>
                    </div>

                    {/* Logo / Footer */}
                    <div style={{
                        position: 'absolute',
                        bottom: 80,
                        fontSize: 24,
                        fontFamily: 'serif',
                        letterSpacing: '0.6em',
                        color: '#C9A227',
                    }}>
                        EPOCH FILM
                    </div>

                    {/* Technical Stats */}
                    <div style={{
                        position: 'absolute',
                        top: 80,
                        right: 80,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        fontSize: 12,
                        fontFamily: 'monospace',
                        color: 'rgba(201, 162, 39, 0.3)',
                    }}>
                        <div>FPS: 24.00</div>
                        <div>REF: ARCHIVE_V2</div>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        )
    } catch (e: any) {
        console.log(`${e.message}`)
        return new Response(`Failed to generate the image`, {
            status: 500,
        })
    }
}
