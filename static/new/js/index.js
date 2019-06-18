/** requires in-view.js */

inView.offset(0);

function step(elem, value, total) {
    elem.innerHTML = "" + value;
    if(value != total) {
        setTimeout(function() {
            step(elem, value + 1, total);
        }, (1200 - total * 5) / (value + 5))
    }
}

function animateNumber(className) {
    const elements = document.getElementsByClassName(className);
    for(let i = 0;i < elements.length;i ++) {
        const elem = elements[i];
        inView("#" + elem.id).once("enter", function() {
            const total = Number(elem.innerHTML);
            elem.innerHTML = "1";
            setTimeout(function() {
                step(elem, 1, total);
            }, (800 - total * 10) / 2);
        });
    }
}

animateNumber("team-stat-value");