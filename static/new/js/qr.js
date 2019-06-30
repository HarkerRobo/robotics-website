function resetQR() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "attendance/qrcode", true);
    xhr.onload = () => {
        const data = JSON.parse(xhr.responseText);
        QRCode.toCanvas(document.getElementById("qr-canvas"), data.data);
    };
    xhr.send();
}

resetQR();