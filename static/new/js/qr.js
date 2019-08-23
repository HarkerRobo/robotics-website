function resetQR() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "./attendance/qrcode", true);
    xhr.onload = () => {
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