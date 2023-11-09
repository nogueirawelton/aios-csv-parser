import { NextRequest } from 'next/server';
import { writeFile } from 'fs/promises';
import { parseCsv } from '../../../../services/parseCsv';

const fs = require('fs');
const path = require('path');

export async function POST(req: NextRequest) {
  const data = await req.formData();
  const file: File | null = data.get('file') as File | null;
  const fileName = data.get('fileName');
  const start = data.get('start') as string;
  const fileSize = data.get('fileSize') as string;

  if (file) {
    const end = parseInt(start, 10) + file.size;
    const filePath = path.join('tmp', fileName);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // // Escreva o chunk no arquivo
    const writer = fs.createWriteStream(filePath, {
      flags: 'a',
      start: parseInt(start, 10),
    });

    writer.write(buffer);
    writer.end();

    // // Verifique se é o último chunk verificando o tamanho do arquivo

    if (end >= parseInt(fileSize, 10)) {
      const url = await parseCsv(filePath);

      return Response.json({
        url,
      });
    } else {
      return Response.json({
        url: null,
      });
    }
  }
  return Response.json('error');
}
