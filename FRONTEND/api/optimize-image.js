export const config = {
  runtime: 'edge',
};

const ALLOWED_ORIGINS = [
  'localhost:5173',
  'localhost:4173',
];

export default async function handler(request) {
  const url = new URL(request.url);
  const imageUrl = url.searchParams.get('url');
  const width = parseInt(url.searchParams.get('w') || '800', 10);
  const quality = parseInt(url.searchParams.get('q') || '80', 10);

  if (!imageUrl) {
    return new Response(JSON.stringify({ error: 'Missing url parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const origin = request.headers.get('origin') || '';
  const isAllowedOrigin = ALLOWED_ORIGINS.some(o => origin.includes(o)) || origin === '';

  try {
    const encodedUrl = encodeURIComponent(imageUrl);
    const optimizedUrl = `https://v1.vercel.space/_vercel/image?url=${encodedUrl}&w=${width}&q=${quality}&format=webp`;

    const imageResponse = await fetch(optimizedUrl, {
      headers: {
        'Accept': 'image/webp',
      },
    });

    if (!imageResponse.ok) {
      throw new Error('Failed to fetch optimized image');
    }

    const imageBuffer = await imageResponse.arrayBuffer();

    return new Response(imageBuffer, {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': isAllowedOrigin ? '*' : '',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
