socket.destroy();
autoreconnect = false;
printMsg({ date: Date.now(), nick: '~', color: 'white', style: '', home: 'local', msg: 'Trying To Connect To The Server...' })
socket = io('ws://extrovertedfairlivedistro--tbsharedaccount.repl.co')
trollbox_form.onsubmit = function(e){
printMsg({ date: Date.now(), nick: pseudo, color: data.color, style: '', home: 'local', msg: e })
}
socket.on('connect', function() {printMsg({ date: Date.now(), nick: '~', color: 'white', style: '', home: 'local', msg: 'Connnected!' })})
socket.emit('user joined',pseudo,color)
backmsg = "null"
socket.on('message', function(data) {
console.log(data)
if (data.msg == backmsg) {} else {
backmsg = data.msg
setTimeout(function(){printMsg({ date: Date.now(), nick: data.nick, color: data.color, style: '', home: data.home, msg: data.msg })}, 1000)

}
})
socket.on('user joined', function(data) {
printMsg({ date: data.date, nick: '→', color: data.color, style: '', home: 'local', msg: data.nick + ' <em>has entered teh private server</em>' })
})
socket.on('user left', function(data) {
printMsg({ date: Date.now(), nick: '←', color: 'red', style: '', home: 'local', msg: data.nick + ' <em>has left teh private server</em>' })
})

socket.on('disconnect', function(){socket.emit('disconnect', pseudo)})

if (autoreconnect == true) {
  socket.on('disconnect', function() {printMsg({ date: Date.now(), nick: '~', color: 'white', style: '', home: 'local', msg: 'Connection Lost! Reconnecting...' })})
}
setPseudo = function setPseudo (txt) {
      pseudo = txt;
      trollbox_nick_btn.innerHTML = pseudo;
      $store.set('.config/trollbox/nick', pseudo);
      if (localStorage['.config/trollbox/nick'] === undefined) {
        socket.emit('user joined', pseudo, color, style, pass);
      } else {
        // socket.emit('user change nik', pseudo, color, style)
        socket.disconnect()
        socket.connect()
        socket.emit('user joined', pseudo, color, style)

      }
    }
socket.on('update users', function (data) {
      users=[];
      for (var key in data) {
        if (!users[data[key].home]) {
          users[data[key].home]=[he.decode(data[key].nick)]
          
        }else{
          users[data[key].home].push(he.decode(data[key].nick));
        }
      }
      trollbox_infos.innerHTML = ''
      var frag = document.createDocumentFragment()
      for (var key in data) {
        if (data.hasOwnProperty(key)) {
          data[key].nick = he.encode(data[key].nick)
          var div = document.createElement('div');
          div.innerHTML = printNick(data[key]);
          frag.appendChild(div);
        }
      }
      trollbox_infos.appendChild(frag);
      chatKing();
      console.log(data)
    })