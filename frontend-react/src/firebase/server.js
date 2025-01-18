const io = require('socket.io')(5000);

console.log('Server Socket.IO running at port 5000');

let onlineUsers = [];

io.on('connection', (socket) => {
  console.log('Um usuário se conectou');

  // Quando um usuário se conecta, ele envia seu nome
  socket.on('user-online', (username) => {
    if (!onlineUsers.includes(username)) {
      onlineUsers.push(username); // Adiciona o usuário à lista se ele não estiver já nela
    }
    io.emit('online-users', onlineUsers); // Envia a lista atualizada para todos os clientes
  });

  // Quando um usuário se desconecta ou fecha a aba
  socket.on('user-offline', (username) => {
    onlineUsers = onlineUsers.filter(user => user !== username); // Remove o usuário da lista
    io.emit('online-users', onlineUsers); // Envia a lista atualizada para todos os clientes
  });

  socket.on('disconnect', () => {
    console.log('Um usuário se desconectou');
  });

  // Receber e encaminhar oferta de chamada
  socket.on('call-user', (data) => {
    io.emit('offer', data);
  });

  // Receber e encaminhar resposta à chamada
  socket.on('answer-call', (data) => {
    io.emit('answer', data);
  });

  // Receber e encaminhar candidatos ICE
  socket.on('ice-candidate', (data) => {
    io.emit('ice-candidate', data);
  });
});