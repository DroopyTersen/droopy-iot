const http = require('http');
const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World\n');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

var iot = require("../index").register("demo-server");
iot.subscribe("test-key", (payload) => {
    console.log(payload);
})
iot.trigger("test-key", "hello there");
