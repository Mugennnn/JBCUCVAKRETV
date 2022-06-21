String.prototype.hashCode = function() {
    var hash = 0;
    if (this.length == 0) {
        return hash;
    }
    for (var i = 0; i < this.length; i++) {
        var char = this.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}
function uuid(txt) {
seed = txt.hashCode()
function random() {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}
function choose(arr) {return arr[Math.floor(random() * (arr.length -1))];}
    letters = "QWERTYUIOPASDFGHJKLZXCVBNM1234567890".split('')
    dip = 'XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX'
    dd = ""
    dip.split('').forEach((char) => {if (char !== "X") {dd += char} else {dd += choose(letters)}})
return dd;
}
module.exports = { uuid }