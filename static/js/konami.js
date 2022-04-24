var kkeys = [],
    konami = "38,38,40,40,37,39,37,39,66,65";

function onYouTubePlayerAPIReady() {
    console.log("ready");
    $(document).keydown(function (e) {
        kkeys.push(e.keyCode);

        if (kkeys.toString().indexOf(konami) >= 0) {
            // do something awesome

            console.log("should be happening");
            var player = new YT.Player("player", {
                videoId: "ApcFBZVbAPA", // this is the id of the video at youtube (the stuff after "?v=")
                loop: true,
                events: {
                    onReady: function (e) {
                        e.target.playVideo();
                        console.log("loaded");
                    },
                    onStateChange: function (event) {
                        if (event.data === 1) {
                            console.log("started playing");
                        }
                    },
                },
            });

            // change to comic sans
            console.log("before");
            $("*").css("font-family", "'Comic Sans MS'");
            $("header, section").css(
                "background",
                "url('/img/art/datboi.gif')"
            );
            $("*").css("color", "black");

            // unbind
            $(document).unbind("keydown", arguments.callee);
        }
    });
}
