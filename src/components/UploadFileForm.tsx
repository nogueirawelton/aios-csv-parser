'use client';

import { FormEvent, useRef, useState } from 'react';
import { FileInput } from './FileInput';

export function UploadFileForm() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');

  function handleAddFile(files: FileList | null) {
    if (files) {
      setFile(files[0]);
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();

    if (!file) {
      return;
    }

    const chunkSize = 1 * 1024 * 1024 * 4; // 4MB
    let start = 0;

    while (start < file.size) {
      const chunk = file.slice(start, start + chunkSize);
      const formData = new FormData();
      formData.append('file', chunk);
      formData.append('fileName', file.name);
      formData.append('fileSize', String(file.size));
      formData.append('start', String(start));

      const response = await fetch('/api/parse', {
        method: 'POST',
        body: formData,
      });

      const { url } = await response.json();

      if (url) {
        setUrl(url);
      }

      start += chunkSize;
    }
  }

  return (
    <>
      <form onSubmit={onSubmit}>
        <FileInput
          onChange={handleAddFile}
          file={file}
        />
        {url ? (
          <div className="flex justify-center gap-8">
            <a
              href={url}
              className="bg-red-400 text-white h-10 px-4 mt-8 grid place-items-center w-fit rounded-sm disabled:opacity-70 disabled:cursor-not-allowed">
              Baixar
            </a>
            <button
              onClick={() => {
                setFile(null);
                setUrl('');
              }}
              type="button"
              className="bg-red-400 text-white h-10 px-4 mt-8 grid place-items-center w-fit rounded-sm disabled:opacity-70 disabled:cursor-not-allowed">
              Converter Outro
            </button>
          </div>
        ) : (
          <button
            disabled={!file}
            type="submit"
            className="bg-red-400 text-white h-10 px-4 mx-auto mt-8 grid place-items-center w-fit rounded-sm disabled:opacity-70 disabled:cursor-not-allowed">
            Converter
          </button>
        )}
      </form>
    </>
  );
}
