const http = require('http');
const { Command } = require('commander');
const fs = require('fs').promises;
const path = require('path');

const program = new Command();

program
  .requiredOption('-h, --host <host>', 'Адреса сервера')
  .requiredOption('-p, --port <port>', 'Порт сервера', parseInt)
  .requiredOption('-c, --cache <path>', 'Шлях до кешу');

program.parse(process.argv);
const options = program.opts();

const server = http.createServer(async (req, res) => {
  const code = req.url.slice(1); 
  const filePath = path.join(options.cache, `${code}.jpg`);

  if (!/^\d{3}$/.test(code)) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    return res.end('Невірний формат HTTP-коду');
  }

  switch (req.method) {
    case 'GET':
      try {
        const image = await fs.readFile(filePath);
        res.writeHead(200, { 'Content-Type': 'image/jpeg' });
        res.end(image);
      } catch (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Картинка не знайдена');
      }
      break;

    case 'PUT':
      let imageData = [];
      req.on('data', chunk => imageData.push(chunk));
      req.on('end', async () => {
        try {
          await fs.writeFile(filePath, Buffer.concat(imageData));
          res.writeHead(201, { 'Content-Type': 'text/plain' });
          res.end('Картинка збережена');
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Помилка запису файлу');
        }
      });
      break;

    case 'DELETE':
      try {
        await fs.unlink(filePath);
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Картинка видалена');
      } catch (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Файл не знайдено');
      }
      break;

    default:
      res.writeHead(405, { 'Content-Type': 'text/plain' });
      res.end('Метод не дозволений');
  }
});

server.listen(options.port, options.host, () => {
  console.log(`Сервер запущено на http://${options.host}:${options.port}`);
});


