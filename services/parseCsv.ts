const fs = require('fs');

import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify';
import { transform } from 'stream-transform';
import moment from 'moment';
import { Storage } from '@google-cloud/storage';

moment.locale('pt-br');

const parser = parse({ delimiter: ',' });
const stringifier = stringify();

const storage = new Storage({
  projectId: 'seu-projeto-id',
  keyFilename: 'firebase-key.json',
});

const bucket = storage.bucket('aios-parser.appspot.com'); // Substitua com o nome do seu bucket

const columns = [2, 5, 6, 7];

// Função para converter timestamp para formato de data brasileiro
const timestampToDateBR = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  return [moment(date).format('L'), moment(date).format('LTS')];
};

const transformer = transform((row, callback) => {
  const filteredRow = row.filter((_: any, index: number) =>
    columns.includes(index)
  );

  const [date, time] = timestampToDateBR(row[1]);

  const dateRow = isNaN(row[1]) ? 'Date' : date;
  const timeRow = isNaN(row[1]) ? 'Time' : time;

  callback(null, [dateRow, timeRow, ...filteredRow]);
});

export async function parseCsv(path: string) {
  const filename = `parsed-csv/${Date.now()}.csv`;

  fs.createReadStream(path)
    .pipe(parser)
    .pipe(transformer) // Aplica a conversão de data
    .pipe(stringifier) // Converte de volta para CSV
    .pipe(bucket.file(filename).createWriteStream()); // Escreve o novo CSV

  const [url] = await bucket.file(filename).getSignedUrl({
    action: 'read',
    expires: moment(new Date()).add(1, 'days').format(), // Data de expiração opcional
  });

  return url;
}
