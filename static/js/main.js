$(function(){
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
