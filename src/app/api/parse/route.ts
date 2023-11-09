import { NextRequest } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { parseCsv } from '../../../../services/parseCsv';

export async function POST(req: NextRequest) {
  const data = await req.formData();
  const file: File | null = data.get('file') as File | null;

  if (file) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const path = `tmp/${file.name}`;
    await writeFile(path, buffer);

    const url = await parseCsv(path);

    await unlink(path);

    return Response.json({
      url,
    });
  }
  return Response.json('error');
}
