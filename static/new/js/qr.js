function resetQR() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "./attendance/qrcode", true);
    xhr.onload = function() {
        const data = JSON.parse(xhr.responseText);
        QRCode.toCanvas(document.getElementById("qr-canvas"), data.data, {
            color: {
                dark: "#000",
                light: "#F0F0F0"
            },
            width: 256,
            height: 256
        });
    };
    xhr.send();
}

resetQR();

document.getElementById("check-out-button").addEventListener("click", function() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "./attendance/checkOut", true);
    xhr.onload = function() {
        document.getElementById("checkoutbutton").innerHTML = "";
        alert("Checked out");
    
        // document.getElementById("checkoutbutton").innerHTML = "<p id='check-out-message'> Checked out. </p>";
    }
    xhr.send();
});