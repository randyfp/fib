import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const image = formData.get('image') as File;

  if (!image || !(image instanceof File)) {
    return NextResponse.json({ error: 'Нет файла' }, { status: 400 });
  }

  const buffer = Buffer.from(await image.arrayBuffer());

  const res = await fetch('https://api.imgur.com/3/image', {
    method: 'POST',
    headers: {
      Authorization: `Client-ID 0ddc35efe43f0ed`,
    },
    body: buffer,
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }

  return NextResponse.json(data);
}
