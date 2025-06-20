
const http = require('http');
const fs = require('fs');
const url = require('url');

const MAX_TICKETS = 7000;
const TICKET_PRICE = 400;

let ticketsSold = [];

function generateTicketNumbers(count) {
  const soldNumbers = new Set();
  ticketsSold.forEach(t => t.ticketNumbers.forEach(n => soldNumbers.add(n)));

  let numbers = [];
  while (numbers.length < count) {
    const num = Math.floor(Math.random() * MAX_TICKETS) + 1;
    if (!soldNumbers.has(num)) {
      soldNumbers.add(num);
      numbers.push(num);
    }
  }
  return numbers;
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);

  if (parsedUrl.pathname === '/admin') {
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    let rows = ticketsSold.map((t, i) => \`
      <tr>
        <td>\${i + 1}</td>
        <td>\${t.buyer}</td>
        <td>\${t.ticketNumbers.join(', ')}</td>
      </tr>
    \`).join('');

    res.end(\`
      <html>
      <head><title>Админка</title></head>
      <body>
        <h1>Купленные билеты</h1>
        <table border="1">
          <tr><th>#</th><th>Покупатель</th><th>Билеты</th></tr>
          \${rows || '<tr><td colspan="3">Нет данных</td></tr>'}
        </table>
      </body>
      </html>
    \`);
    return;
  }

  if (req.method === 'GET' && parsedUrl.pathname === '/') {
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(\`
      <html>
      <head><title>Lux King Car</title></head>
      <body style="text-align:center; font-family:sans-serif;">
        <h1>Lux King Car</h1>
        <img src="https://cdn.pixabay.com/photo/2016/02/19/11/53/car-1209816_1280.jpg" width="400"/>
        <p>Участвуй в розыгрыше автомобиля!</p>
        <form method="POST" action="/buy">
          <input type="text" name="buyer" placeholder="Ваше имя" required/><br/><br/>
          <input type="number" name="count" placeholder="Сколько билетов (до 10)" max="10" min="1" required/><br/><br/>
          <button type="submit">Купить билеты</button>
        </form>
      </body>
      </html>
    \`);
    return;
  }

  if (req.method === 'POST' && parsedUrl.pathname === '/buy') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      const params = new URLSearchParams(body);
      const buyer = params.get('buyer');
      const count = parseInt(params.get('count'), 10);
      if (!buyer || count < 1 || count > 10) {
        res.writeHead(400);
        return res.end('Неверные данные');
      }

      const ticketNumbers = generateTicketNumbers(count);
      ticketsSold.push({ buyer, ticketNumbers });

      res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
      res.end(\`
        <html>
        <head><title>Успех</title></head>
        <body style="text-align:center; font-family:sans-serif;">
          <h1>Спасибо, \${buyer}!</h1>
          <p>Вы купили \${count} билета(ов):</p>
          <p>\${ticketNumbers.join(', ')}</p>
          <a href="/">Вернуться назад</a>
        </body>
        </html>
      \`);
    });
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log('Server started on port ' + PORT);
});
