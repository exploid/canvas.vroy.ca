$(document).ready(
function() {

    var jug = new Juggernaut;

    var channel = $("#channel").val();
    jug.subscribe(channel, function(data){
            if (data.action == "clear") {
                $("#map div.point").remove();
            } else {
                for (var i in data) {
                    var x = data[i][0];
                    var y = data[i][1];
                    drawPoint( $("#map"), x, y );
                }
            }
        });

    $("#change_channel").click(function() {
            window.location = "/heatmap/"+$("#channel").val();
        });

    $("#clear_channel").click(function() {
            $.getJSON( "/clear/"+$("#channel").val() )
        });

    /* **************************************************************** Mousemove */
    // It sucks that the event doesn't have a click modifier in mousemove.
    var canvas_clicked = false;
    var captured_coordinates = [];

    $("#map").mousedown(function(){
            canvas_clicked = true;
            $(this).addClass("active_cursor");
        });

    $("#map").mousemove(function(e) {
            if (canvas_clicked == false) return;
            captureDrawing(this, e);
        });

    $(document).mouseup(function(){
            canvas_clicked = false;
            if (captured_coordinates.length > 0) {
                postClicks( $("#channel").val(), captured_coordinates );
                captured_coordinates = [];
            }
        });

    /* **************************************************************** Click */
    $("#map").click(function(e){
            captureDrawing(this, e);
        });



    function captureDrawing(map, e) {
        var x = e.pageX - map.offsetLeft;
        var y = e.pageY - map.offsetTop;
        var point_width;
        var point_height;

        // Do not draw outside of the canvas.
        if ( x >= e.currentTarget.clientWidth) return;
        if ( y >= e.currentTarget.clientHeight) return;

        // Adjust point size to fill more easily.
        if ( x > (e.currentTarget.clientWidth - 10) ) {
            point_width = (e.currentTarget.clientWidth - x);
        }
        if ( y > (e.currentTarget.clientHeight - 10) ) {
            point_height = (e.currentTarget.clientHeight - y);
        }

        drawPoint( map, x, y, point_width, point_height );
        captured_coordinates.push( [x,y] );
    }

    
    function drawPoint(map, x, y, width, height) {
        var n = $("<div class='point'></div>").css("left", x).css("top", y);

        if (width) n.css("width", width);
        if (height) n.css("height", height);

        $(map).append( n );
    }

    /*
      channel = string
      clicks = [ [x1,y1], [x2,y2], [x3,y3] ]
    */
    function postClicks(channel, clicks) {
        var data = {
            clicks: clicks,
            channel: channel
        }
        $.ajax({
                url: "/click",
                data: data,
                dataType: "json",
                type: "POST",
                beforeSend: function(xhr) {
                    xhr.setRequestHeader("X-Session-ID", jug.sessionID);
                }
            });
    }

});
