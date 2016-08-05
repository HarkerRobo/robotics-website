function konami() {
  window.open('http://youtube.com');
}


$(function(){

  // konami code
  var kkeys = [], konami = "38,38,40,40,37,39,37,39,66,65";

  $(document).keydown(function(e) {

    kkeys.push( e.keyCode );

    if ( kkeys.toString().indexOf( konami ) >= 0 ) {


      // do something awesome

      window.open('https://www.youtube.com/watch?v=ApcFBZVbAPA');
      kkeys = [], konami = "38,38,40,40,37,39,37,39,66,65";

    }

  });



  $(':checkbox').checkboxpicker();
  $(".landingtext").fadeIn(1500);

  var $root = $('html, body');
  $('a').click(function() {
    var href = $.attr(this, 'href');
    var gotoname = $.attr(this, 'gotoname');
    $root.animate({
      scrollTop: $(href).offset().top
    }, 500, function () {
      window.location.hash = gotoname;
    });
    return false;
  });
});
