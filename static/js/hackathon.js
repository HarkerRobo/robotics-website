$("#hackathon-frc-affiliated").click(function(){
  if($("#hackathon-frc-affiliated").is(':checked')) {
    $("#hackathon-frc-team-name").prop('disabled', false);
  } else {
    $("#hackathon-frc-team-name").prop('disabled', true);
  }
});
