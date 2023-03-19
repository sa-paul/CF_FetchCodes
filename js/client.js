// console.log("hello world");
// console.log(window.location.href);
// console.log(localStorage.getItem("token"))

var child = document.createElement("ul")
child.id = "friends_stat";
document.getElementById("sidebar").append(child)

setInterval(function() {
    var c = document.createElement("h5");
    c.innerText = "Hello test";
    document.getElementById("friends_stat").append(c);
}, 1000);