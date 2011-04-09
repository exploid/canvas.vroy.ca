$(document).ready(
function() {
    /* ************************************************************* Onload ***/
    // Initialize canvas/context
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    ctx.strokeStyle = 'red';

    // Setup status variablesp
    var canvas_clicked = false;
    var captured_coordinates = [];

    // Subscribe to a Juggernaut channel
    var jug = new Juggernaut;
    jug.subscribe($("#canvas_name").val(), function(data){
            if (data.action == "clear") {
                clearCanvas();
            } else {
                drawList( data );
            }
        });

    // Draw the saved values of the canvas
    loadCanvas();


    /* ************************************************************* Events ***/
    $("#join").click(function() {
            window.location = "/heatmap/"+$("#canvas_name").val();
        });

    $("#clear").click(function() {
            $.getJSON( "/clear/"+$("#canvas_name").val() )
        });

    $("#canvas").mousedown(function(){ canvas_clicked = true; });

    $("#canvas").mousemove(function(e) {
            if (canvas_clicked == false) return;
            captureDrawing(e);
        });

    $(document).mouseup(function(){
            canvas_clicked = false;
            if (captured_coordinates.length > 0) {
                postClicks( $("#canvas_name").val(), captured_coordinates );
                captured_coordinates = [];
            }
        });

    $("#map").click(function(e){
            captureDrawing(e);
        });

    
    function loadCanvas() {
        $.getJSON("/load/"+$("#canvas_name").val(), function(data) {
                drawList(data);
            });
    }

    function drawList(data) {
        for (var i in data) {
            var x = data[i][0];
            var y = data[i][1];
            drawCanvasPoint(x, y);
        }
    }

    function captureDrawing(e) {
        var x = e.offsetX;
        var y = e.offsetY;
        drawCanvasPoint( x, y );
        captured_coordinates.push( [x,y] );
    }

    function drawCanvasPoint(x, y) {
        x = parseInt(x);
        y = parseInt(y);

        ctx.lineWidth = 10;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x+1, y+1);
        ctx.stroke();
    }

    function clearCanvas() {
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "red";
        ctx.fillStyle = "red";
    }

    /* TODO: 
    function saveImage() {
        $("#save").click(function(){ 
            $("#result").append("<br /><br /><img src="+
            canvas.toDataURL()+ 
           " /><br /><a href="+canvas.toDataURL()+ 
           " target='_blank'>show</a>");
        });
    */


    /*
      canvas = string
      clicks = [ [x1,y1], [x2,y2], [x3,y3] ]
    */
    function postClicks(canvas, clicks) {
        var data = {
            clicks: clicks,
            canvas: canvas
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
