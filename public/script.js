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

    $("#map").click(function(e){
            // console.log( e );
            var x = e.pageX - this.offsetLeft;
            var y = e.pageY - this.offsetTop;
            
            postCoordinates(x, y);

            var n = $("<div class='point'></div>").css("left", x).css("top", y);
            $(this).append( n );
        });

    function postCoordinates(x, y) {
        $.ajax({
                url: "http://heatmap.vroy.ca/click/"+x+"/"+y+"/"+$("#channel").val(),
                beforeSend: function(xhr) {
                    xhr.setRequestHeader("X-Session-ID", jug.sessionID);
                }
            });
                
    }

});
