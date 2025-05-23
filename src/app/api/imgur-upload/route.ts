import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const image = formData.get('image');

    if (!(image instanceof Blob)) {
      console.error('Invalid or missing file in formData:', image);
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await image.arrayBuffer());
    console.log('Image buffer size:', buffer.length);

    const res = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID!}`,
        'Content-Type': 'application/octet-stream',
      },
      body: buffer,
    });

    const result = await res.json();
    console.log('Imgur upload response:', result);

    if (!res.ok) {
      return NextResponse.json({ error: result?.data?.error || 'Imgur upload failed' }, { status: 502 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('Upload route error:', err);
    return NextResponse.json({ error: 'Internal server error', message: (err as Error).message }, { status: 500 });
  }
}