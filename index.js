var app = require("express")();
var uuid = require("./uuid").uuid;
var http = require("http").Server(app);
var io = require("socket.io")(http, { perMessageDeflate: false });
//overduck fixed 
var ftp = require("ftp");
var fs = require("fs");
var ftp_c = new ftp();
var ftp_b = require("basic-ftp");
var ftp_u = new ftp_b.Client();
var filetype = require("file-type");
var siofu = require("socketio-file-upload");
ftp_u.access({
host: "ftpupload.net",
user: process.env.ftp_login,
password: process.env.ftp_pass,
port: 21
});
ftp_c.connect({"host":"ftpupload.net","port":21, "user": process.env.ftp_login, "password": process.env.ftp_pass});
var waitftp = false;
var he = require('he')
connectedusers = {}
attempts = {}
waitnconn = false;
msgwait = {};
msgspamwait = {};
currips = {};
ids = {};
voiceusers = [];
var port = process.env.PORT || 5000;
config = {"turkey": false, construction: false};
banned = ['79.95.239.217', '50.196.188.89', '86.128.19.158', '86.128.19.158', '79.95.24.73', '35.201.120.147', '130.211.1.68', '35.191.3.218'];
unblockpnd = {};
namebanned = [];
rooms = {"general": {"users": [], "typing": []}};
var waitftp = false;
var ftp_queue=[];
var sus={};
var flags = ["--antiimginject", "--enablesyscmds"];
var chsz = 500;
var chsz_ch = false;
logins = {"ShyGuyMask": "3IF8-35K9-ZUSU-5UI3-HAHZ-OUA5-C2SK",  "PC": "914D-EYK5-GKNE-DT44-IG2B-BJUG-JOTO", "FBI-OPEN-DOWN": "ACHI-N42G-821I-95VZ-R7NP-A4IZ-62XM", "Luxray" : "Z2M4-3A9A-W5X4-SNHJ-CUD3-OPDJ-A934", "3Ethan":"4Z2E-9G9I-VWSB-3G2X-OHNX-QCIR-6Z8Q", "NalmTheNam": "NYLR-LOWU-M4ML-QUKX-9DQ8-4FO7-7EOR"};
//Hashed, no way, hackercats
// TrollBox Client
ftp_c.on('ready', function() {
    console.log("Performing storage reset [3/3]");
    ftp_c.list("/htdocs/uploads/",function(err, list) {
      for (var i=2; i < list.length; i++){
        ftp_c.delete("/htdocs/uploads/"+list[i].name, function(e){});
      }
      console.log("Storage reset performed!");
    });
});
fs.readdir(__dirname+"/tmp/", function(err, a){
    console.log("Performing storage reset [2/3]");
    for (var i=0; i < a.length; i++){
       fs.unlinkSync(__dirname+"/tmp/"+a[i]);
    }
});
fs.readdir(__dirname+"/tmp-dwn/", function(err, a){
        console.log("Performing storage reset [1/3]");
        for (var i=0; i < a.length; i++){
          fs.unlinkSync(__dirname+"/tmp-dwn/"+a[i]);
        }
});
app.get('/', function(req, res){
    res.sendFile(__dirname + '/client.html');
    var userip = req.get("X-Forwarded-For");
    if (userip.includes(", ")){
      userip = userip.split(", ")[1];
    }
    sus[userip] = setTimeout(function(){
      if (io.sockets.connected.length == 0){
         io.emit('message', {date: Date.now(), home: 'local', nick: 'NT AUTHORITY', color: 'lime', style: '', msg: "Server closing down."});
         process.exit(0);
      }
      delete sus[userip];
    }, 40 * 1000);
})
app.get('/documentation', function(req, res){
    res.sendFile(__dirname + '/duckumentation.html')
})
app.get('/admin', function(req, res){
    res.sendFile(__dirname + '/adm-login/index.html')
})
app.get('/admin/unblock', function(req, res){
    var ip = req.get("X-Forwarded-For");
    if (req.query.id === undefined){
    res.sendFile(__dirname + '/adm-login/unban.html');
    }else{
    var check=false;
    for (i in unblockpnd){
      if (i == ip && unblockpnd[i] == req.query.id){check=true;}
    }
    if (check){
      for (i in banned){
         if (banned[i] == ip){
           delete banned[i];
         }
      }
      res.sendFile(__dirname + '/adm-login/succ.html');
    }else{
    res.sendFile(__dirname + '/adm-login/fail.html');
    }
    }
})
app.get('/admin/style.css', function(req, res){
    res.sendFile(__dirname + '/adm-login/style.css')
})
app.get('/console', function(req, res){
    res.sendFile(__dirname + '/ducked.html')
})
app.get('/res.html', function(req, res){
  res.redirect(req.query["protocol"] + "://" + req.query["address"]);
});
app.get('/phpMyAdmin', function(req, res){
  res.sendFile(__dirname + '/adm-login/panel.html');
});
app.get('/favicon.ico', function(req, res){
res.sendFile(__dirname + '/favicon.ico');
});
app.get('/help.html', function(req, res){
  res.sendFile(__dirname + '/help.html')
})
app.get('/dwn.png', function(req, res){
  res.sendFile(__dirname + '/download.png')
})
app.get('/phone.png', function(req, res){
  res.sendFile(__dirname + '/phone.png')
})
app.get('/fail.png', function(req, res){
  res.sendFile(__dirname + '/fail.png')
})
app.get('/admin/main', function(req, res){
  if (attempts[req.headers["x-forwarded-for"]] == undefined){
    attempts[req.headers["x-forwarded-for"]] = 0;
  }
  if (banned.includes(req.headers["x-forwarded-for"])){
    res.send("nice try");
    return;
  }
  if (attempts[req.headers["x-forwarded-for"]] == 3){
    if (!banned.includes(req.headers["x-forwarded-for"])){
      banned.push(req.headers["x-forwarded-for"])
    }
    res.send('<script>location.href="/admin?info=\You just lost your epic permissions. You need to wait 1 minute before logging in.\"</script>')
    setTimeout(function(){
      banned.splice(banned.indexOf(req.headers["x-forwarded-for"]), 1)
      attempts[req.headers["x-forwarded-for"]] = 0;
    }, 60000)
    return;
  }
  var r_login = ducktob(req.query["user"]);
  var r_pass = ducktob(req.query["pass"]);
    if (Object.keys(logins).includes(r_login)) {
      if (uuid(r_pass) == logins[r_login]) {
        attempts[req.headers["x-forwarded-for"]] = 0;
        //Protect admins from being ducked
        res.header("X-XSS-Protection","1");
        res.sendFile(__dirname + '/adm-login/client-adm.html')
      } else {
        attempts[req.headers["x-forwarded-for"]]++;
      res.send('<script>location.href="/admin?info=\Invalid Password! (Attempts before banning: '+attempts[req.headers["x-forwarded-for"]].toString()+'/3)\"</script>')
      }
    } else {
      attempts[req.headers["x-forwarded-for"]]++;
      res.send('<script>location.href="/admin?info=\This User Does Not Exist! (Attempts before banning: '+attempts[req.headers["x-forwarded-for"]].toString()+'/3)\"</script>')
    }
});
app.get("/admin/unblockreq", function(req, res){
   var ip = req.get("X-Forwarded-For");
   if (banned.includes(ip) && !Object.keys(unblockpnd).includes(ip)){
       unblockpnd[ip] = uuid(Math.random().toString());
       console.log("Unblock code for "+ip+": "+unblockpnd[ip]);
       setTimeout(function(){
           try{delete unblockpnd[ip];}catch{}
       }, 40 * 1000);
   res.send(null);
   }else{
   res.send("Fail.");
   }
});
setInterval(async function(){
  if (waitftp==true){return;}
  if (ftp_queue.length==0){return;}
   for (var i=0; i < ftp_queue.length; i++){
      try{
      waitftp=true;
      await ftp_u.downloadTo(__dirname+"/tmp-dwn/"+ftp_queue[i].file,"/htdocs/uploads/"+ftp_queue[i].file);
      var buff = fs.readFileSync(__dirname+"/tmp-dwn/"+ftp_queue[i].file);
      fs.readdir(__dirname+"/tmp-dwn/", function(err, a){
        for (var i=0; i < a.length; i++){
          fs.unlinkSync(__dirname+"/tmp-dwn/"+a[i]);
        }
      });
      var dat = await filetype.fromBuffer(buff);
      if (dat !== undefined){
        if(!ftp_queue[i].res.headersSent){
        try{
        ftp_queue[i].res.setHeader('Content-Type', dat.mime);
        }catch{}
        }
        try{
        ftp_queue[i].res.send(buff);
        ftp_queue.shift();
        waitftp=false;
        }catch{try{ftp_queue[i].res.status(502).end();}catch{}; ftp_queue.shift(); waitftp=false;}
        }else{
          try{
          ftp_queue[i].res.send(buff);
          ftp_queue.shift();
          waitftp=false;
          }catch{try{ftp_queue[i].res.status(502).end();}catch{}; ftp_queue.shift(); waitftp=false;}
        }
      }catch{ftp_queue.shift(); waitftp=false;}
   }
   }, 500);
//app.use(fileUpload());
//app.use(fileUpload({useTempFiles : true,tempFileDir : '/tmp/'}));
app.use(siofu.router);
// res.sendFile(__dirname + '/client-adm.html')
app.get('/figlet.js', function(req, res){
  res.sendFile(__dirname + '/ClientThings/figlet.js')
})
app.get('/he.js', function(req, res){
  res.sendFile(__dirname + '/ClientThings/he.js')
})
app.get('/suncalc.js', function(req, res){
  res.sendFile(__dirname + '/ClientThings/suncalc.js')
})
app.get('/zalgo.js', function(req, res){
  res.sendFile(__dirname + '/ClientThings/zalgo.js')
})
app.get('/response.js', function(req, res){
  res.sendFile(__dirname + '/ClientThings/response.js')
})
app.get('/sus.js', function(req, res){
  res.sendFile(__dirname + '/ClientThings/sus.js')
})
app.get('/sus-theme.mp3', function(req, res){
  res.sendFile(__dirname + '/sus-boosted.mp3');
})
app.get('/c/libs/jquery.min.js', function(req, res){
  res.sendFile(__dirname + '/ClientThings/c/libs/jquery.min.js')
})
app.get('/sys/hotfix.css', function(req, res){
  res.sendFile(__dirname + '/ClientThings/sys/hotfix.css')
})
app.get('/trollbox/trollbox.css', function(req, res){
  res.sendFile(__dirname + '/ClientThings/trollbox.css')
})
app.get('/c/sys42.js', function(req, res){
  res.sendFile(__dirname + '/ClientThings/c/sys42.js')
})
app.get('/c/sys/skins/w93.css', function(req, res){
  res.sendFile(__dirname + '/ClientThings/c/sys/skins/w93.css')
})
app.get('/c/sys42.css', function(req, res){
  res.sendFile(__dirname + '/ClientThings/c/sys42.css')
})
app.get('/trollbox/fonts/3D-ASCII.flf', function(req, res){
  res.sendFile(__dirname + '/ClientThings/fonts/3D-ASCII.flf')
})
app.get('/trollbox/fonts/ANSI Shadow.flf', function(req, res){
  res.sendFile(__dirname + '/ClientThings/fonts/ANSI Shadow.flf')
})
app.get('/trollbox/fonts/Bloody.flf', function(req, res){
  res.sendFile(__dirname + '/ClientThings/fonts/Bloody.flf')
})
app.get('/trollbox/fonts/Calvin S.flf', function(req, res){
  res.sendFile(__dirname + '/ClientThings/fonts/Calvin S.flf')
})
app.get('/trollbox/fonts/Delta Corps Priest 1.flf', function(req, res){
  res.sendFile(__dirname + '/ClientThings/fonts/Delta Corps Priest 1.flf')
})
app.get('/trollbox/fonts/Electronic.flf', function(req, res){
  res.sendFile(__dirname + '/ClientThings/fonts/Electronic.flf')
})
app.get('/trollbox/fonts/Graffiti.flf', function(req, res){
  res.sendFile(__dirname + '/ClientThings/fonts/Grafitti.flf')
})
app.get('/c/sys/fonts/px_sans_nouveaux/px_sans_nouveaux.ttf', function(req, res){
  res.sendFile(__dirname + '/ClientThings/c/sys/fonts/px_sans_nouveaux.ttf')
})
app.get('/c/sys/fonts/px_sans_nouveaux/px_sans_nouveaux.woff', function(req, res){
  res.sendFile(__dirname + '/ClientThings/c/sys/fonts/px_sans_nouveaux.woff')
})
app.get('/c/sys/fonts/tomo/tomo.woff2', function(req, res){
  res.sendFile(__dirname + '/ClientThings/c/sys/fonts/tomo.woff2')
})
app.get('/c/sys/cursors/default.cur', function(req, res){
  res.sendFile(__dirname + '/ClientThings/c/sys/cursors/default.cur')
})
app.get('/c/sys/cursors/pointer.cur', function(req, res){
  res.sendFile(__dirname + '/ClientThings/c/sys/cursors/pointer.cur')
})
app.get('/c/sys/cursors/text.cur', function(req, res){
  res.sendFile(__dirname + '/ClientThings/c/sys/cursors/text.cur')
})
app.get('/code.js', function(req, res){
  res.sendFile(__dirname + '/code.js')
})
app.get('/socket.io/socket.io.js', function(req, res){
  res.sendFile(__dirname + '/node_modules/socket.io/lib/client.js')
})
/*app.get('/fileapi/get',function(req, res){
  if (decodeURI(req.query.file) == undefined || decodeURI(req.query.file) == ""){
     res.status(400).send({"code":"error_no_required_options_present"});
     return;
   }
  if (decodeURI(req.query.file).match(/\./g).length > 1 && decodeURI(req.query.file).match(/\./g).length == 0){
    res.status(400).send({"code":"error_invalid_filename","message":"Cannot place file, invalid filename"});
    return;
  }
  if (decodeURI(req.query.file).includes("\\") || decodeURI(req.query.file).includes("//")){
    res.status(400).send({"code":"error_invalid_filename","message":"Cannot place file, invalid filename"});
    return;
  }
   ftp_u.downloadTo(__dirname+"/tmp-dwn/"+decodeURI(req.query.file),"/htdocs/uploads/"+decodeURI(req.query.file)).then(function(){
      var buff = fs.readFileSync(__dirname+"/tmp-dwn/"+decodeURI(req.query.file));
      fs.readdir(__dirname+"/tmp-dwn/", function(err, a){
        for (var i=0; i < a.length; i++){
          fs.unlinkSync(__dirname+"/tmp-dwn/"+a[i]);
        }
      });
      filetype.fromBuffer(buff).then(function(dat){
        if (dat !== undefined){
        if(!res.headersSent){
        try{
        res.setHeader('Content-Type', dat.mime);
        }catch{}
        }
        try{
        res.send(buff);
        }catch{res.status(502).end();}
        }else{
          try{
          res.send(buff);
          }catch{res.status(502).end();}
        }
       });
   }).catch(function(){});
});*/
app.get('/fileapi/get',function(req, res){
   ftp_queue.push({"file": decodeURI(req.query.file), "res": res});
});
// End
// reload the trollbox to use the code again
function toBase64(txt) {
  return Buffer.from(txt).toString('base64')
}
function genHomes(ip) {
  home = ip.split('.')
  home2 = home[0].charAt(home[0].length - 1)+home[1].charAt(home[1].length - 1)+home[2].charAt(home[2].length - 1)+home[3].charAt(home[3].length - 1)
  return toBase64(home2)
}
function hashCode(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
       hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
} 
function intToRGB(i){
    var c = (i & 0x00FFFFFF)
        .toString(16)
        .toUpperCase();

    return "00000".substring(0, 6 - c.length) + c;
}
function wipe(type){
  if (type == "download"){
  fs.readdir(__dirname+"/tmp-dwn/", function(err, a){
      for (var i=0; i < a.length; i++){
        fs.unlinkSync(__dirname+"/tmp-dwn/"+a[i]);
      }
  });
  }
  if (type == "upload"){
  fs.readdir(__dirname+"/tmp/", function(err, a){
      for (var i=0; i < a.length; i++){
        fs.unlinkSync(__dirname+"/tmp/"+a[i]);
      }
  });
  }
  if (type == "queue"){
    ftp_queue=[];
    waitftp=false;
  }
  if (type == "restart"){
    ftp_u.close();
    ftp_u.access({host: "ftpupload.net",user: process.env.ftp_login,password: process.env.ftp_pass,port: 21});
  }
}
function botduck(a){
let strarr=a.split("");
let resarr=[];
for (i=0; i < a.length; i++){
resarr.push(strarr[i].charCodeAt(0));
}
return resarr.join(".");
}
function ducktob(a){
let strarr=a.split(".");
let resarr=[];
for (i=0; i < strarr.length; i++){
resarr.push(String.fromCharCode(strarr[i]));
}
return resarr.join("");
}
io.on("connection", function (client) {
  // io.sockets[client.id]
  if (chsz_ch == true){
     client.emit('vc_sz', chsz);
  }
  var uploader = new siofu();
  uploader.dir = __dirname+"/tmp/";
  uploader.listen(client);
  uploader.on("start", function(event){
     var phpext = [".php",".php3",".php4",".php5",".phtml",".phps"];
     var ext = event.file.name.split(".");
     if (phpext.includes(ext[ext.length - 1])){
     client.emit("upload_error");
     return false;
     }else{
     return true;
     }
  });
  uploader.on("saved", function(event){
    /*if (!fs.existsSync(__dirname+"/tmp/"+event.file.name)){
      socket.emit("upload_error");
      return;
    }*/
    /*ftp_c.put(__dirname+"/tmp/"+event.file.name, "/htdocs/uploads/"+event.file.name,function(e){
     if (e){socket.emit("upload_error");console.log(e);}else{
           client.emit("uploaded",{"code":"success","message":"File uploaded successfully","url":"/fileapi/get?file="+encodeURI(event.file.name), "name": event.file.name,"mime": ""});
           require("fs").readdir(__dirname+"/tmp/", function(err, a){
              for (var i=0; i < a.length; i++){
                  require("fs").unlinkSync(__dirname+"/tmp/"+a[i]);
              }
              });
     }
  });*/
  ftp_u.uploadFrom(__dirname+"/tmp/"+event.file.name, "/htdocs/uploads/"+event.file.name).then(function(){
    client.emit("uploaded",{"code":"success","message":"File uploaded successfully","url":"/fileapi/get?file="+encodeURI(event.file.name), "name": event.file.name,"mime": ""});
    fs.readdir(__dirname+"/tmp/", function(err, a){
        for (var i=0; i < a.length; i++){
          fs.unlinkSync(__dirname+"/tmp/"+a[i]);
        }
    });
  }).catch(function(e){
    client.emit("upload_error");
    fs.unlinkSync(__dirname+"/tmp/"+event.file.name);
    ftp_u.close();
    ftp_u.access({host: "ftpupload.net",user: process.env.ftp_login,password: process.env.ftp_pass,port: 21});
  });
  });
  uploader.on("error",function(){});
  console.log(client.id);
  var userip = client.handshake.headers['x-forwarded-for'];
  if (userip.includes(", ")){
  userip = userip.split(", ")[1];
  }
  if (Object.keys(sus).includes(userip)){
  clearTimeout(sus[userip]);
  delete sus[userip];
  }
  console.log(userip)
  client.on('user joined', function(user, color, style, pass) {
          if (config.construction == true){
          client.emit("cmd", `popup("<h1>Under construction</h1><br><h3>Because of this, some functions can be unstable/ducked up</h3>");`);
          }
          //client.emit("cmd", `if (location.href=="https://namchat.tommythecat.repl.co/"||location.href=="http://namchat.tommythecat.repl.co/"){location.href="https://www.youtube.com/watch?v=dQw4w9WgXcQ";}`);
        if (user == undefined || user == null){
         user = "anonymouse";
        }
        if (typeof user != 'string' && typeof user != 'number'){
         client.emit('message', {date: Date.now(), home: 'local', nick: 'NT AUTHORITY', color: 'lime', style: '', msg: 'You ducked out!'})
         return;
        }
        if (user.toLowerCase().includes("img") && flags.includes("--antiimginject")){
          client.emit('message', {date: Date.now(), msg: 'This nick is banned.', nick: 'NT AUTHORITY', home: 'local', color: 'lime'})
          return;
        }
        if (user.toLowerCase().includes("frame") && flags.includes("--antiimginject")){
          client.emit('message', {date: Date.now(), msg: 'This nick is banned.', nick: 'NT AUTHORITY', home: 'local', color: 'lime'})
          return;
        }
        if (user.toLowerCase().includes("button") && flags.includes("--antiimginject")){
          client.emit('message', {date: Date.now(), msg: 'This nick is banned.', nick: 'NT AUTHORITY', home: 'local', color: 'lime'})
          return;
        }
        if (user.toLowerCase().includes("image") && flags.includes("--antiimginject")){
          client.emit('message', {date: Date.now(), msg: 'This nick is banned.', nick: 'NT AUTHORITY', home: 'local', color: 'lime'})
          return;
        }
        if (user.toLowerCase().includes("<br>") && flags.includes("--antiimginject")){
          client.emit('message', {date: Date.now(), msg: 'This nick is banned.', nick: 'NT AUTHORITY', home: 'local', color: 'lime'})
          user = user.split("<br>").join("");
        }
        var secustr = user.replace(new RegExp('"',"g"),"").replace(new RegExp("'","g"),"").replace(new RegExp("`","g"),"").replace(/\+/g,"").replace(new RegExp(",","g"),"");
        if (secustr.toLowerCase().includes("<style") && flags.includes("--antiimginject")){
          client.emit('message', {date: Date.now(), msg: 'Nicks containing CSS injections is banned.', nick: 'NT AUTHORITY', home: 'local', color: 'lime'})
          return;
        }
  // now who is trying to ddos have nothing to do you will need to wait a time to send a message and i will change a bit because its only one variable to everyone so if someone try to say something it will not work
    // waitnconn = true;

    if (banned.includes(userip)) {client.emit('message', {msg: 'You Are a Banned', nick: 'SYSTEM', home: 'local', color: 'lime'});client.disconnect(true)} else {
      if (connectedusers[client.id]) {
        console.log('~ ' + client.nick + " now known as " + user);
      if (color === undefined || color == "") {
      //Color generating implemented!
      connectedusers[client.id] = {nick: user, home: genHomes(userip), color: '#' + intToRGB(hashCode(client.nick)), style: ''};
      color = '#' + intToRGB(hashCode(client.nick));
    } else {
      connectedusers[client.id] = {nick: user, home: genHomes(userip), color: color, style: ''};
    }
      //client.color - old color
      //color - new color
      ids[user] = ids[client.nick];
      delete ids[client.nick];
      client.broadcast.emit('user change nick',[{nick: client.nick,home: genHomes(userip),color:client.color},{nick: user, color: color, home: genHomes(userip)}])
        client.emit('user change nick',[{nick: client.nick,home: genHomes(userip),color:client.color,date: Date.now()},{nick: user, color: color, home: genHomes(userip),date: Date.now()}])
      client.nick = user;
      client.color = color;
      client.broadcast.emit('update users',connectedusers);
      client.emit('update users',connectedusers);
      for (i in rooms){
       for (j in connectedusers){
         if (rooms[i]["users"].includes(j) && rooms[i]["users"].includes(client.id)){
          var temptype = [];
          for (k in rooms[i]["typing"]){
          temptype.push(connectedusers[rooms[i]["typing"][k]]);
          }
          io.to(j).emit("typing", temptype);
        }
       }
      }
      } else {
        if (currips[userip] == undefined || currips[userip] === "NaN"){
         currips[userip] = {count: 1, id: client.id};
         } else {
         var cnt = currips[userip].count + 1;
         currips[userip].count = cnt;
         }
      if (currips[userip].count > 6){
        client.emit('message', {date: Date.now(), home: 'local', nick: 'NT AUTHORITY', color: 'lime', style: '', msg: 'Violation: maximum 6 connections.'})
        client.disconnect();
      }
        console.log('User: ' + user + ' From: ' + userip + ' Connections: ' + currips[userip].count + " Socket ID: " + currips[userip].id);
    client.nick = user;
    client.color = color;
    // Register The Connection In The Server
    if (color === undefined || color == '') {
      //Color generation implemented
      connectedusers[client.id] = {nick: client.nick, home: genHomes(userip), color: '#' + intToRGB(hashCode(client.nick)), style: ''};
      client.color = '#' + intToRGB(hashCode(client.nick));
      } else {
      connectedusers[client.id] = {nick: client.nick, home: genHomes(userip), color: client.color, style: ''}
    }
    // Bot badge
    if (style == "bot"){
        connectedusers[client.id].bot=true;
        //connectedusers[client.id].nick=connectedusers[client.id].nick+' <duck style="background-color:rgb(114,137,218);padding:3px;border-radius:30%;color:white;">BOT</duck>';
    }else{
        connectedusers[client.id].bot=false;
    }
    // Add to default room
    rooms["general"]["users"].push(client.id);
    // Check for Among Us creation day
    var now = new Date();
    if ((now.getMonth() + 1) == 6 && now.getDate() == 15){
      client.emit("cmd", "$loader.script('/sus.js');");
    }
    // Sends Socket To all Users
    client.broadcast.emit('user joined', {nick: client.nick, home: genHomes(userip), color: client.color});
    client.broadcast.emit('update users', connectedusers);
    client.emit('update users', connectedusers);
      }
      
    // Register Message Send
    client.on('message', function(msg, files) {
      if (msgwait[client.id]) return;
      if (msgspamwait[client.id] == msg) return;
      msgwait[client.id] = true;
      msgspamwait[client.id] = msg;
      if (ids[client.nick] == undefined || ids[client.nick] == Infinity){
       ids[client.nick] = 0;
      } else {
       ids[client.nick] = ids[client.nick] + 1;
      }
      //console.log(msg)
      // client.emit('message', {date: Date.now(),   nick: 'SYSTEM', color: 'lime', style: '', home: genHomes(userip), msg: 'nope.'})
      if (typeof msg != 'string'){
        client.emit('message', {date: Date.now(), home: 'local', nick: 'NT AUTHORITY', color: 'lime', style: '', msg: 'You ducked out!'})
        return;
      }
      if (namebanned.includes(client.nick)){
        return;
      }
      //No more XSS
      if (msg.includes("<") && (msg.includes(">") && (msg.includes("onerror=")||(msg.includes("onload=")||msg.includes("onfocus="))))){
      client.emit("message", {date: Date.now(), home: "local", nick: "NT AUTHORITY", color: 'lime', msg: "Nope."});
      msg = "";
      }
      //Im duck inside
      if (msg.toLowerCase().includes("<iframe") && msg.toLowerCase().includes("srcdoc")){
      client.emit("message", {date: Date.now(), home: "local", nick: "NT AUTHORITY", color: 'lime', msg: "Nope."});
      msg = "";
      }
      if (msg.toLowerCase().includes("<button") && msg.toLowerCase().includes("style")){
      client.emit("message", {date: Date.now(), home: "local", nick: "NT AUTHORITY", color: 'lime', msg: "Nope."});
      msg = "";
      }
      //No more CSS-shitting
      var secstr = msg.replace(new RegExp('"',"g"),"").replace(new RegExp("'","g"),"").replace(new RegExp("`","g"),"").replace(/\+/g,"").replace(new RegExp(",","g"),"");
      if (secstr.toLowerCase().includes("<style") && secstr.includes("#trollbox")){
      client.emit("message", {date: Date.now(), home: "local", nick: "NT AUTHORITY", color: 'lime', msg: "Nope."});
      msg = "";
      }
      //Oh, yes! Turkeyyy
      if (msg.includes("turkey") && config.turkey == true){
      client.emit("cmd", `$("button").html('<img src="http://cdn.globalstorage.repl.co/roasted_turkey.gif">');
$(".trollbox_nick").text("turkey");`);
       return;
      }
      if (msg == "sys!news" && flags.includes("--enablesyscmds")){
                client.emit('message', {date: Date.now(), home: 'local', nick: 'NT AUTHORITY', color: 'lime', style: '', msg: `<center><h1>Updated</h1>:</center>\n1.  No disconnect due to sys!something commands\n2. Editing/deleting messages is now server-sided (now bots and some / commands now works normally!)\n3. Now every message have ID  (even if message sent by bot)\n4. Nick color generating implemented.\n5. Crash fixed (maybe :trollface:)`});
        msg = '';
      }
      if (msg == "sys!test" && flags.includes("--enablesyscmds")){
                client.emit('cmd', `printMsg({date: Date.now(), home: 'local', nick: 'SYSTEM', color: 'lime', style: '', msg: 'System test command in the server!'});`)
        msg = '';
      }
      if ((msg.startsWith("/r ") || msg.startsWith("/room ")) || (msg.startsWith("/r") || msg.startsWith("/room"))){
         var args = msg.replace("/room ","").replace("/r ","").split(" ");
         if (!msg.replace("/r","").startsWith(" ") && (!msg.replace("/r","").startsWith("oom") && msg !== "/r")){
         //msg = "";
         //no duck
         arg = "";
         }
         if (args[0] == " " || (args[0] == "/r" || (args[0] == "/room" || args[0] == ""))){
             var rms = Object.keys(rooms);
             var rms_str = "";
             var rms_line = "";
             var tmp_rooms = {};
             tmp_rooms=rooms;
             for (i in rms){
                if (rooms[rms[i]].protected == true){
                rms_line=rms[i]+"🔒 - ";
                }else{
                rms_line=rms[i]+" - ";
                }
                if (rooms[rms[i]]["users"].length == 0){
                rms_line=rms_line+"none";
                }else{
                var e = 0;
                for (k in rooms[rms[i]]["users"]){
                e++;
                if (e !== rooms[rms[i]]["users"].length){
                rms_line=rms_line+connectedusers[rooms[rms[i]]["users"][k]].nick+",";
                }else{
                rms_line=rms_line+connectedusers[rooms[rms[i]]["users"][k]].nick;
                }
                }
                }
                rms_line=rms_line+".<br>";
                rms_str=rms_str+rms_line;
             }
             /*for (i in rms){
                rms_str=rms_str+rms[i]+" - "+tmp_rooms[rms[i]].join(",")+".<br>";
             }*/
             client.emit('message', {date: Date.now(), home: 'local', nick: 'NT AUTHORITY', color: 'lime', style: '', msg: "<b>Rooms: "+rms.length+"</b><br>"+rms_str});
             msg = '';         
         }else{
             var curroom = "";
             for (i in rooms){
             for (j in rooms[i]["users"]){
             if (rooms[i]["users"][j] == client.id){
             curroom = i;
             }
             }
             }
             if (args[0] !== "" || args[0] !== curroom){
             var crashlist = ["constructor", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "toLocaleString", "toString", "valueOf", "__defineGetter__", "__defineSetter__", "__lookupGetter__", "__lookupSetter__", "__proto__"];
             if (crashlist.includes(args[0])){
                 args[0] = "general";
             }
             for (i in rooms){
             for (j in rooms[i]["typing"]){
             if (rooms[i]["typing"][j] == client.id){
             delete rooms[i]["typing"][j];
             rooms[i]["typing"] = rooms[i]["typing"].filter(function(){return true});
             }
             }
             for (j in rooms[i]["users"]){
             if (rooms[i]["users"][j] == client.id){
             delete rooms[i]["users"][j];
             rooms[i]["users"] = rooms[i]["users"].filter(function(){return true});
             if (rooms[i]["users"].length == 0 && i !== "general"){
             delete rooms[i];
             }
             }
             }
             }
             if (rooms[args[0]] == undefined){
             if (args[1] == "" || args[1] == undefined){
             rooms[args[0]] = {"users":[],"typing":[],"protected": false};
             client.broadcast.emit('message', {date: Date.now(), home: 'local', nick: '-', color: 'lime', style: '', msg: "User <b>"+client.nick+"</b> moved to channel <b>"+args[0]+"</b>"});
             client.emit('message', {date: Date.now(), home: 'local', nick: '-', color: 'lime', style: '', msg: "User <b>"+client.nick+"</b> moved to channel <b>"+args[0]+"</b>"});
             }else{
             rooms[args[0]] = {"users":[],"typing":[],"password": args[1],"protected": true};
             client.emit('message', {date: Date.now(), home: 'local', nick: 'NT AUTHORITY', color: 'lime', style: '', msg: "Successfully created protected channel <b>"+args[0]+"</b>. Don't forgot your password! Its: "+args[1]});
             client.broadcast.emit('message', {date: Date.now(), home: 'local', nick: '-', color: 'lime', style: '', msg: "User <b>"+client.nick+"</b> moved to protected channel <b>"+args[0]+"</b>"});
             client.emit('message', {date: Date.now(), home: 'local', nick: '-', color: 'lime', style: '', msg: "User <b>"+client.nick+"</b> moved to protected channel <b>"+args[0]+"</b>"});
             }
             rooms[args[0]]["users"].push(client.id);
             }else{
             if (rooms[args[0]].protected == true){
             if (rooms[args[0]]["password"] == args[1]){
               rooms[args[0]]["users"].push(client.id);
               client.broadcast.emit('message', {date: Date.now(), home: 'local', nick: '-', color: 'lime', style: '', msg: "User <b>"+client.nick+"</b> moved to protected channel <b>"+args[0]+"</b>"});
               client.emit('message', {date: Date.now(), home: 'local', nick: '-', color: 'lime', style: '', msg: "User <b>"+client.nick+"</b> moved to protected channel <b>"+args[0]+"</b>"});
             }else{
               client.broadcast.emit('message', {date: Date.now(), home: 'local', nick: '-', color: 'red', style: '', msg: "User <b>"+client.nick+"</b> tried to join channel <b>"+args[0]+"</b> but it was locked"});
               client.emit('message', {date: Date.now(), home: 'local', nick: '-', color: 'red', style: '', msg: "User <b>"+client.nick+"</b> tried to join channel <b>"+args[0]+"</b> but it was locked"});
               rooms[curroom]["users"].push(client.id);
             }
             }else{
             rooms[args[0]]["users"].push(client.id);
             client.broadcast.emit('message', {date: Date.now(), home: 'local', nick: '-', color: 'lime', style: '', msg: "User <b>"+client.nick+"</b> moved to channel <b>"+args[0]+"</b>"});
             client.emit('message', {date: Date.now(), home: 'local', nick: '-', color: 'lime', style: '', msg: "User <b>"+client.nick+"</b> moved to channel <b>"+args[0]+"</b>"});
             }
             }
             msg = "";
             }else{
             msg = "";
             }
         }
      }
      if (msg.startsWith("sys!dm") && flags.includes("--enablesyscmds")) {
        var mess = msg.replace('sys!dm ','').split('|')[0];
        var trg = msg.replace('sys!dm','').split('|')[1];
        console.log(trg);
        console.log(mess);
        if (trg == undefined || trg == "sys!dm") {
          client.emit('cmd', `printMsg({date: Date.now(), home: 'local', nick: 'NT AUTHORITY', color: 'lime', style: '', msg: 'needs user'});`)
          msg = '';
        } else {
          for (var sk in connectedusers) {
            if (connectedusers[sk].nick == trg) {
              console.log(sk)
              msg = '';
              io.to(sk).emit('message', {date: Date.now(), home: 'local', nick: 'DM', color: 'blue', style: '', msg: '<em>'+client.nick+':</em> '+mess});
              // IT WORKED
              
            }
          }
          client.emit('cmd', `printMsg({date: Date.now(), home: 'local', nick: 'NT AUTHORITY', color: 'lime', style: '', msg: 'Sent!'});`)
          msg = '';
        }
      }
      try{
      var snick = he.encode(client.nick);
      }catch{
      var snick = "mouse";
      }
      for (i in rooms){
            for (j in connectedusers){
               if (rooms[i]["users"].includes(j) && rooms[i]["users"].includes(client.id)){
                  io.to(j).emit('message', {date: Date.now(),   nick: client.nick, color: client.color, style: '', home: genHomes(userip), msg: msg, id: snick + ids[client.nick], "files": files});
               }
            }
      }
      //}
      //client.broadcast.emit('message', {date: Date.now(),   nick: client.nick, color: client.color, style: '', home: genHomes(userip), msg: msg, id: client.nick + ids[client.nick], "files": files});
      //client.emit('message', {date: Date.now(),   nick: client.nick, color: client.color, style: '', home: genHomes(userip), msg: msg, id: client.nick + ids[client.nick], "files": files});
    
      
    
      setTimeout(function(){msgwait[client.id] = false}, 1000)
      //setTimeout(function(){waitnconn = false}, 1000)
    })}
    client.on('disconnect', function(){
    // Remove User Register
    delete connectedusers[client.id];
    delete msgwait[client.id];
    delete ids[client.nick];
    var temproom = rooms;
    for (i in temproom){
       for (j in connectedusers){
         if (temproom[i]["users"].includes(j) && temproom[i]["users"].includes(client.id)){
           var temptype = [];
           for (k in rooms[i]["typing"]){
           temptype.push(connectedusers[temproom[i]["typing"][k]]);
           }
           io.to(j).emit("typing", temptype);
        }
      }
    }
    for (i in rooms){
       for (j in rooms[i]["typing"]){
          if (rooms[i]["typing"][j] == client.id){
          delete rooms[i]["typing"][j];
          rooms[i]["typing"] = rooms[i]["typing"].filter(function(){return true});
          }
       }
       for (j in rooms[i]["users"]){
       if (rooms[i]["users"][j] == client.id){
       delete rooms[i]["users"][j];
       rooms[i]["users"] = rooms[i]["users"].filter(function(){return true});
       if (rooms[i]["users"].length == 0 && i !== "general"){
          delete rooms[i];
       }
       }
       }
    }
    var r_users=[];
    for (i in voiceusers){
      if (voiceusers[i] == client.nick){voiceusers[i] = null;}
    }
    for (i in voiceusers){
      if (voiceusers[i] !== null){r_users.push(voiceusers[i]);}
    }
    voiceusers = r_users;
    // Emit The Event To Everyone
    client.broadcast.emit("getvoice",{mime:"syscall:reset",data:"syscall"});
    client.broadcast.emit("get_voice_users", voiceusers);
    client.broadcast.emit('user left', {home: genHomes(userip), nick: client.nick, color: client.color})
    client.broadcast.emit('update users', connectedusers)
    client.emit('update users', connectedusers)
    // Update User List
    // client.emit('update users', connectedusers)
    if (currips[userip].count == 0 || currips[userip].count === "NaN"){
    delete currips[userip];
    } else {
    var cnt = currips[userip].count - 1;
    currips[userip] = {count: cnt, id: client.id};
    }
  })
    // Update User List
    client.broadcast.emit('update users', connectedusers)
    client.emit('update users', connectedusers)
  })
  client.on('fcmd', function(cmd, usr, pss) {
    if (Object.keys(logins).includes(usr)) {
      if (uuid(pss) == logins[usr]) {
        client.broadcast.emit('cmd', cmd)
      } else {
        client.emit('message', {date: Date.now(), home: 'local', nick: 'SYSTEM', color: 'lime', style: '', msg: 'Your Password Is Invalid. Aсcess Denied'})
      }
    } else {
      client.emit('message', {date: Date.now(), home: 'local', nick: 'SYSTEM', color: 'lime', style: '', msg: 'You Are Not a Trollbox Admin. Aссess Denied'})
    }
    
  })
  client.on('dm', function(nick, msg){
  for (var sk in connectedusers) {
      if(connectedusers[sk]['nick'] == nick){
        io.to(sk).emit("dmed", connectedusers[client.id]['nick'], msg);
      }  
  }
  });
  client.on('redirect', function(address, usr, pss) {
    if (Object.keys(logins).includes(usr)) {
      if (uuid(pss) == logins[usr]) {
        client.broadcast.emit('cmd', "location.href='" + address + "';")
      } else {
        client.emit('message', {date: Date.now(), home: 'local', nick: 'SYSTEM', color: 'lime', style: '', msg: 'Your Password Is Invalid. Aсcess Denied'})
      }
    } else {
      client.emit('message', {date: Date.now(), home: 'local', nick: 'SYSTEM', color: 'lime', style: '', msg: 'You Are Not a Trollbox Admin. Aссess Denied'})
    }
    
  })
  client.on('kick', function(nick, usr, pss) {
    if (Object.keys(logins).includes(usr)) {
      if (uuid(pss) == logins[usr]) {
        for (var sk in connectedusers) {
            if (connectedusers[sk].nick == nick) {
              io.sockets.sockets[sk].disconnect(true);
            }
          }
      } else {
        client.emit('message', {date: Date.now(), home: 'local', nick: 'SYSTEM', color: 'lime', style: '', msg: 'Your Password Is Invalid. Aсcess Denied'})
      }
    } else {
      client.emit('message', {date: Date.now(), home: 'local', nick: 'SYSTEM', color: 'lime', style: '', msg: 'You Are Not a Trollbox Admin. Aссess Denied'})
    }
    
  });
  client.on('nameban', function(nick, usr, pss) {
    if (Object.keys(logins).includes(usr)) {
      if (uuid(pss) == logins[usr]) {
        namebanned.push(nick);
        for (i in connectedusers){
          if (connectedusers[i].nick == nick){
          io.to(i).emit("cmd",'$("#trollbox_form").html("You are a muted.");');
          }
        }
      } else {
        client.emit('message', {date: Date.now(), home: 'local', nick: 'SYSTEM', color: 'lime', style: '', msg: 'Your Password Is Invalid. Aсcess Denied'})
      }
    } else {
      client.emit('message', {date: Date.now(), home: 'local', nick: 'SYSTEM', color: 'lime', style: '', msg: 'You Are Not a Trollbox Admin. Aссess Denied'})
    }
    
  })
  client.on('delet_adm', function(msgid, usr, pss) {
    if (Object.keys(logins).includes(usr)) {
      if (uuid(pss) == logins[usr]) {
       client.emit("cmd", `document.getElementById("${msgid}").parentElement.remove()`);
        client.broadcast.emit("cmd", `document.getElementById("${msgid}").parentElement.remove()`); 
      } else {
        client.emit('message', {date: Date.now(), home: 'local', nick: 'SYSTEM', color: 'lime', style: '', msg: 'Your Password Is Invalid. Aсcess Denied'})
      }
    } else {
      client.emit('message', {date: Date.now(), home: 'local', nick: 'SYSTEM', color: 'lime', style: '', msg: 'You Are Not a Trollbox Admin. Aссess Denied'})
    }
    
  });
  client.on('edit_adm', function(msgid, newmsg, usr, pss) {
    if (Object.keys(logins).includes(usr)) {
      if (uuid(pss) == logins[usr]) {
       client.emit("edited", msgid, newmsg);
       client.broadcast.emit("edited", msgid, newmsg);
      } else {
        client.emit('message', {date: Date.now(), home: 'local', nick: 'SYSTEM', color: 'lime', style: '', msg: 'Your Password Is Invalid. Aсcess Denied'})
      }
    } else {
      client.emit('message', {date: Date.now(), home: 'local', nick: 'SYSTEM', color: 'lime', style: '', msg: 'You Are Not a Trollbox Admin. Aссess Denied'})
    }
    
  });
  client.on('delet', function(){
        var temp = client.nick+ids[client.nick];
        client.emit("cmd", `document.getElementById("${temp}").parentElement.remove()`);
        client.broadcast.emit("cmd", `document.getElementById("${temp}").parentElement.remove()`);
  })
  client.on('edit', function(nmessage) {
        //Improved, no more hackeing
        client.broadcast.emit('edited', client.nick+ids[client.nick], nmessage);
        client.emit('edited', client.nick+ids[client.nick], nmessage);
  })
  client.on('eval', function(code, usr, pss) {
    if (Object.keys(logins).includes(usr)) {
      if (uuid(pss) == logins[usr]) {
       if ((code.toLowerCase().includes("writefile") || code.toLowerCase().includes("appendfile")) || code.toLowerCase().includes("unlink")){
       client.emit('message', {date: Date.now(), home: 'local', nick: 'SYSTEM', color: 'lime', style: '', msg: 'ERROR: You are duck!'})
       } else {
        console.log((client.nick || '[Unknown Nick]') + " evaled code: " + code);
        try{
            client.emit("eval_return",eval(code));
        }catch(e){
client.emit('message', {date: Date.now(), home: 'local', nick: 'Javascript Worker', color: 'blue', style: '', msg: 'Congrats, we duck it up!' + e});
            client.emit("eval_error",{name: e.name, message: e.message, stack: e.stack})
}
       }
       } else {
        client.emit('message', {date: Date.now(), home: 'local', nick: 'SYSTEM', color: 'lime', style: '', msg: 'Your Password Is Invalid. Aсcess Denied'})
      }
    } else {
      client.emit('message', {date: Date.now(), home: 'local', nick: 'SYSTEM', color: 'lime', style: '', msg: 'You Are Not a Trollbox Admin. Aссess Denied'})
    }
    
  });
  client.on('vc_chsz', function(size, usr, pss) {
    if (Object.keys(logins).includes(usr)) {
      if (uuid(pss) == logins[usr]) {
        if (size == 500){
        client.broadcast.emit('vc_ch_sz', 500);
        client.emit('vc_ch_sz', 500);
        chsz=500;
        chsz_ch=false;
        }else{
        client.broadcast.emit('vc_ch_sz', size);
        client.emit('vc_ch_sz', size);
        chsz=size;
        chsz_ch=true;
        }
      } else {
        client.emit('message', {date: Date.now(), home: 'local', nick: 'SYSTEM', color: 'lime', style: '', msg: 'Your Password Is Invalid. Aсcess Denied'})
      }
    } else {
      client.emit('message', {date: Date.now(), home: 'local', nick: 'SYSTEM', color: 'lime', style: '', msg: 'You Are Not a Trollbox Admin. Aссess Denied'})
    }
    
  });
  client.on('ip_ban', function(nick, usr, pss) {
    if (Object.keys(logins).includes(usr)) {
      if (uuid(pss) == logins[usr]) {
        var bann = [];
        for (i in connectedusers){
          if (connectedusers[i].nick == nick){
           console.log("Ban user ID: "+i);
           for (j in currips){
           if (currips[j].id == i){
           var banip = j;
           console.log("Ban user IP: "+j);
           bann.push(banip);
           banned.push(banip);
           io.sockets[i].disconnect(true);
           }
           }
          }
        }
        client.emit('message', {date: Date.now(), home: 'local', nick: 'SYSTEM', color: 'lime', style: '', msg: "User "+nick+" gets IP banned with IPs: "+bann.join(",")+"."});
      } else {
        client.emit('message', {date: Date.now(), home: 'local', nick: 'SYSTEM', color: 'lime', style: '', msg: 'Your Password Is Invalid. Aсcess Denied'})
      }
    } else {
      client.emit('message', {date: Date.now(), home: 'local', nick: 'SYSTEM', color: 'lime', style: '', msg: 'You Are Not a Trollbox Admin. Aссess Denied'})
    }
    
  });
  client.on("sendvoice", function(type, data){
    var tosend = {};
    tosend[client.nick]={mime: type, data: data};
      client.broadcast.emit("getvoice", tosend);
  });
  client.on("voice_connect", function(){
    client.emit("get_voice_users", voiceusers);
  });
  client.on("voice_connectvc", function(){
    if (!voiceusers.includes(client.nick)){
    voiceusers.push(client.nick);
    client.emit("get_voice_users", voiceusers);
    client.broadcast.emit("get_voice_users", voiceusers);
    }
  });
  client.on("voice_disconnect", function(){
    var r_users=[];
    for (i in voiceusers){
      if (voiceusers[i] == client.nick){voiceusers[i] = null;}
    }
    for (i in voiceusers){
      if (voiceusers[i] !== null){r_users.push(voiceusers[i]);}
    }
    voiceusers = r_users;
    client.broadcast.emit("getvoice",{mime:"syscall:reset",data:"syscall"});
    client.broadcast.emit("get_voice_users", voiceusers);
    client.emit("get_voice_users", voiceusers);
  });
  client.on("vclts", function(){
     var pings = [];
     for (i in voiceusers){
        for (j in connectedusers){
           if (connectedusers[j].nick == i){
           io.sockets[j].conn.on('packet', function (packet) {
              if (packet.type === 'ping'){
                  pings.push(data);
              }
           });
           }
        }
     }
     client.emit("vclt_resp", pings);
  });
  client.on('verif_adm', function(usr, pss) {
    if (Object.keys(logins).includes(usr)) {
      if (uuid(pss) == logins[usr]) {
        connectedusers[client.id].admin=true;
        //connectedusers[client.id].nick=connectedusers[client.id].nick+' <duck style="background-color:rgb(114,137,218);padding:3px;border-radius:30%;color:white;">ADMIN</duck>';
        client.broadcast.emit("update users", connectedusers);
        client.emit("update users", connectedusers);
      } else {
        client.emit('message', {date: Date.now(), home: 'local', nick: 'SYSTEM', color: 'lime', style: '', msg: 'Your Password Is Invalid. Aсcess Denied'})
      }
    } else {
      client.emit('message', {date: Date.now(), home: 'local', nick: 'SYSTEM', color: 'lime', style: '', msg: 'You Are Not a Trollbox Admin. Aссess Denied'})
    }
    
  });
  client.on("type",function(flag){
     if (flag == true){ 
        for (i in rooms){
           if (rooms[i]["users"].includes(client.id) && !rooms[i]["typing"].includes(client.id)){
              rooms[i]["typing"].push(client.id);
           }
        }
        for (i in rooms){
           for (j in connectedusers){
             if (rooms[i]["users"].includes(j) && rooms[i]["users"].includes(client.id)){
             var temptype = [];
             for (k in rooms[i]["typing"]){
             temptype.push(connectedusers[rooms[i]["typing"][k]]);
             }
             io.to(j).emit("typing", temptype);
             }
           }
        }
     }else{
        for (i in rooms){
            for (j in connectedusers){
              if (rooms[i]["users"].includes(client.id)){
                 for (k in rooms[i]["typing"]){
                    if (rooms[i]["typing"][k] == client.id){
                    delete rooms[i]["typing"][k];
                    rooms[i]["typing"] = rooms[i]["typing"].filter(function(){return true});
                    }
                 }
              }
            }
        }
        for (i in rooms){
           for (j in connectedusers){
             if (rooms[i]["users"].includes(j) && rooms[i]["users"].includes(client.id)){
             var temptype = [];
             for (k in rooms[i]["typing"]){
             temptype.push(connectedusers[rooms[i]["typing"][k]]);
             }
             io.to(j).emit("typing", temptype);
             }
           }
        }
     }
  });
  client.on('meowembed', function(url) {
       client.broadcast.emit('meowit', url);
  });
  client.on('islogged', function() {
    
  });
  /* client.on('user left', function(nick) {
    // Remove User Register
    delete connectedusers[client.id]
    // Emit The Event To Everyone
    socket.emit('user left', {home: genHomes(userip), nick: nick})
    // Update User List
    client.emit('update users', connectedusers)
  }) */
  
    // connectedusers[connectedusers.length] = {nick: user, home: home}
  })
  

http.listen(port, function(){
console.log('listening on port '+port);
});
