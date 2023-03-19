function storeToken() {
    var token = document.getElementById("apitoken").value;
    localStorage.setItem("token", token);
}

function getToken(){
    return localStorage.getItem("token") || "Not Available";
}

document.getElementById("storeTokenbtn").addEventListener("click", function() {
    storeToken();
})

document.getElementById("apitoken").value = getToken();