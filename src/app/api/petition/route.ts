import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const getImageUrl = async (file: File) => {
    const buffer = Buffer.from(await file.arrayBuffer());
    const res = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID!}`,
      },
      body: buffer,
    });
    const data = await res.json();
    return data.data.link;
  };

  const images: string[] = [];

  for (let i = 0; i < 3; i++) {
    const file = formData.get(`image${i}`) as File;
    if (file && file.size > 0) {
      const url = await getImageUrl(file);
      images.push(url);
    } else {
      images.push('');
    }
  }

  const payload = {
    petitionNumber: formData.get('petitionNumber'),
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    position: formData.get('position'),
    employeeFirstName: formData.get('employeeFirstName'),
    employeeLastName: formData.get('employeeLastName'),
    imageUrls: images,
  };

  return NextResponse.json({ success: true, data: payload });
}