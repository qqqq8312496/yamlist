const net = require('net');

const PORT = 5173;

function checkPort(port) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.once('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        reject(new Error(`Port ${port} is already in use. Stop that service and try again.`));
        return;
      }

      reject(error);
    });

    server.once('listening', () => {
      server.close(() => resolve());
    });

    server.listen(port, '127.0.0.1');
  });
}

checkPort(PORT)
  .then(() => {
    console.log(`[YamList] Port ${PORT} is available.`);
  })
  .catch((error) => {
    console.error(`[YamList] ${error.message}`);
    process.exitCode = 1;
  });
