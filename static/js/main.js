'use strict'

$(function() {

  // blur after a nav click
  $('*').focus(function(){
    $(this).blur()
  })

  $(':checkbox').checkboxpicker()
  $('.landingtext').fadeIn(1500)

})
