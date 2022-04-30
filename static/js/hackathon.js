function isFRCChecked() {
    if ($("#hackathon-frc-affiliated").is(":checked")) {
        $("#hackathon-frc-team-name").prop("disabled", false);
        $("#hackathon-frc-team-name-group").css("display", "block");
    } else {
        $("#hackathon-frc-team-name").prop("disabled", true);
    }
}

$(function () {
    isFRCChecked();
    $("#hackathon-frc-affiliated").click(function () {
        $("#hackathon-frc-team-name-group").slideToggle();
        isFRCChecked();
    });
});
