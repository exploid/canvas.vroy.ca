$(document).ready(
function() {

    var jug = new Juggernaut;

    var channel = $("#channel").val();
    jug.subscribe(channel, function(data){
            data = JSON.parse( data );

            if (data == "clear") {
                $("#map div.point").remove();
            } else {
                var x = data[0];
                var y = data[1];
  
                var n = $("<div class='point'></div>").css("left", x).css("top", y);
                $("#map").append( n );
            }
                
        });

    $("#change_channel").click(function() {
            window.location = "/heatmap/"+$("#channel").val();
        });

    $("#clear_channel").click(function() {
            $.getJSON( "/clear/"+$("#channel").val() );
        });

    // It sucks that the event doesn't have a click modifier in mousemove.
    var canvas_clicked = false;
    $("#map").mousedown(function(){ canvas_clicked = true; });
    $(document).mouseup(function(){ canvas_clicked = false; });
    
    $("#map").mousemove(function(e) {
            if (canvas_clicked == false) return;
            postCoordinates(this, e);
        });

    $("#map").click(function(e){
            postCoordinates(this, e);
        });

    function postCoordinates(map, e) {
        var x = e.pageX - map.offsetLeft;
        var y = e.pageY - map.offsetTop;
        
        var n = $("<div class='point'></div>").css("left", x).css("top", y);
        $(map).append( n );

        $.ajax({
                url: "/click/"+x+"/"+y+"/"+$("#channel").val(),
                beforeSend: function(xhr) {
                    xhr.setRequestHeader("X-Session-ID", jug.sessionID);
                }
            });
    }

});
