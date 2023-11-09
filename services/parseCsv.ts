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
  credentials: {
    client_email: 'firebase-adminsdk-tzg56@aios-parser.iam.gserviceaccount.com',
    private_key:
      '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCvJqH6bo0N+p8A\nV+kXNI/wTCC2jHZbUz3ZZqZRKQYlmTHrYqVnnbNTzbQsqnxsNl1FW8mGmGV4FId0\nO5dWCPmM0nzXm6AsdYW2fDAiGPqOauiAa7QyX506cODGMdp0o7lvKVvBbfg8lvRW\nR0iCTS+XEzV/eAcfwu98jxMy4pB8cPb7qTDEpIomyNSZX5Igde8DnMPnGHNNgDGk\n4JSQrS0DuOjh6SfZ+aRUdZeUgx/COKxAYDI6We4jpelks3tYfV35MoLJcyOqaadS\nReUf0oaTRwfRZn6q+qmchkbcVeFMq6HC45Mcc8eje1txAZRwgCUiXEcQbDLrulyP\nQn4Bu9HPAgMBAAECggEAHbZKhQ6q7AOnZGoFVxPqFQP9CqqiS1TAKbiRnzP74HXv\n83PNBlpIuP8swOT87Wh9gw4Sjjwc/nVREyUmw4gLOVndpr+2OMSI9c90ZNxi6LT3\nEw3ySBdTNz49yzFa0y2Q/+v+rj4G/dRHx7kY8k3AtHqkOSb14mvxr2ogAiJQC2Pg\nYNf9LJnB5K2xdImQMJi4ifmXgXKk8MVuyJM3br7w3Q4o4yZ65J2qIhY/YQftMqYd\nFbjDCgIINI0mhfR/Ah0o68dRf3IY5tyi+uUsB3Ws53Wg2T/Le/ZjqPrnndRGMorj\n1N1DjrzWLhvfJRJBhHWoMrz4k/aJrseBeCiXAzj6hQKBgQDj2x2CUYxioCC6FOI0\naT+s5Q/UxbB+u0EyInvNqE1CEWvPfdNmfY1WA8ntC1CNecTthXECDdpQi+FC1Qmc\nFMqKp32mxnshGL8m8If2jzoIRLk2/QDLm6ZZYwB5UaPLZQNuiY9E+/FBSYH6Ta0r\nOZMCTXROjet2tOz6AE8hErqSvQKBgQDEyPdmdFD8DY6TSZ8ScAD1sGMy1AhftIkt\ncpMDuOV7YcXu9P7UyCn4uvnyR+jedx7FWqyrXFuklF0QIu5GIktamlDb/ncBkXsd\nth63ETrepdApBmWFePS87O8l6cCsIr3fBU9GkArbTGYPVjWrEO2avvUuSlCeEJLS\nfNmpRYolewKBgQDGJ24YQRcXRi5v5W17KvSnRWVpIqsE65AdK4QDLBRUGpZpkgFg\npltdrFnU/fwFrRonfd7zbFypo5w45NBAnowt3M8XVJEMDVtfX9q9/3z2Z92zBn/E\nkg4uujxVRTxuy+AaJyMjWP9MScLxjM/GQYGphPZawm09hMZ5+/7Uwlbi+QKBgHUZ\nvhcqynJjQt+k5NMc8YVCtJUvldgV37e6wX9qjKyyTw3WnrpSbp+D7G7fmdSggCAi\nyDOk3yf93a9XigEUMVE2GT4AnCLDxsa0dGyuBSEu/MMc+lbF1qWCPQGLq0sD1Ycc\nasNrvfon6Wfg/kjQ5wO59L7aHEUjSauV/hR7vCx3AoGAT+mRA2boFHhYree6+OhX\nphnpiWIsAkXEGw279HsPxsHWhMo7Ae29DUISZ2dHl2ZmdVQumYxyg2ieFVKDxFH6\nBcl5xO0BcMB3vh7Slzuro9JjKEQw30zLXeSEUtve1GU7D6DI4BAK3M50JxnOAK9e\nPPCwqQ459vK+xd+IknnMVG4=\n-----END PRIVATE KEY-----\n',
  },
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
