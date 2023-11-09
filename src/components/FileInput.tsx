interface FileInputProps {
  file: File | null;
  onChange: (files: FileList | null) => void;
}

export function FileInput({ file, onChange }: FileInputProps) {
  return (
    <div className="h-10 border-2 border-red-400 w-[450px] flex justify-between items-center overflow-hidden">
      <span className="block px-4 truncate">
        {file ? file.name : 'Nenhum arquivo selecionado'}
      </span>

      <label
        htmlFor="file"
        className="h-full px-4 bg-red-400 text-white grid place-items-center cursor-pointer shrink-0">
        Escolher Arquivo
      </label>

      <input
        onChange={(e) => {
          onChange(e.target.files);
        }}
        className="sr-only"
        accept=".csv"
        id="file"
        type="file"
      />
    </div>
  );
}
