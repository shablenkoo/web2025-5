const http = require('http');
const { Command } = require('commander');

const program = new Command();

program
  .requiredOption('-h, --host <host>', 'Адреса сервера')
  .requiredOption('-p, --port <port>', 'Порт сервера', parseInt)
  .requiredOption('-c, --cache <path>', 'Шлях до кешу');

program.parse(process.argv);

const options = program.opts();

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Server work!\n');
});

server.listen(options.port, options.host, () => {
  console.log(`Сервер запущено на http://${options.host}:${options.port}`);
});

