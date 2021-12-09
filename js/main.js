import { Game } from './game.js';
import { Text } from './utils/text.js';

$("#playerNameModal").modal('show');
$("#restartGameBtn").click(function() {location.reload();});
$("#beginGameBtn").click(function(){
    createGame($("#playerNameInput").val());
});

$("#playerNameInput").keyup((evt) => {
    if($(evt.currentTarget).val().length > 0) {
        $("#beginGameBtn").prop('disabled',false);
    }
    else {
        $("#beginGameBtn").prop('disabled',true);
    }
});

var keys = Object.keys(Text);
for(var key in keys) {
    $("#" + keys[key]).text(Text[keys[key]]);
}
    
function createGame(playerName) {
    let temp = $('input[name="gameMode"]:checked').val().split('x');

    var game = new Game(playerName, temp[0], temp[1]);
    game.start();
}