let loaded = false;

window.addEventListener("load", function() {
    loaded = true;
});

document.getElementById("splash-robotics-logo").addEventListener("animationiteration", function() {
    if(loaded) {
        document.getElementById("splash-robotics-logo").classList.remove("spin");
        document.getElementById("splash-robotics-logo").classList.add("disappear");
        document.getElementById("splash-loading-overlay").classList.add("curtain");

        setTimeout(function() {
            document.body.style.overflow = "visible"
            document.getElementById("splash-loading-overlay").style.zIndex = -100000;
            document.getElementById("splash-robotics-logo").style.zIndex = -100000;
        }, 1500);
    }
});

let marginTop; 
setTimeout(function() {
    marginTop = Number(getComputedStyle(document.getElementById("header-navigation-wrapper")).marginTop.slice(0, -2));
}, 1000);

document.addEventListener("scroll", function() {
    console.log(marginTop)
    document.getElementById("header-navigation-wrapper").style.animationDelay = window.scrollY / -marginTop + "s"; 
});