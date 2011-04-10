$(document).ready(
function() {
    /* ************************************************************* Onload ***/
    // Initialize canvas/context
    var canvas = document.getElementById("canvas");
    selectColor("black");

    // Setup status variables
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
            window.location = "/"+$("#canvas_name").val();
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

    $(".menu .color").click(function() {
            selectColor( $(this).css("background-color") );
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
            var strokeStyle = data[i][2];
            var selectedShape = data[i][3];
            drawCanvasPoint(x, y, strokeStyle, selectedShape);
        }
    }

    function selectedColor() {
        return $(".menu .picked .color").css("background-color");
    }
    function selectColor(color) {
        $(".menu .picked .color").css("background-color", color);
    }
    function selectedShape() {
        return $(".shape").val();
    }


    function captureDrawing(e) {
        var x = e.offsetX;
        var y = e.offsetY;
        drawCanvasPoint( x, y );
        captured_coordinates.push( [x, y, selectedColor(), selectedShape() ] );
    }

    function drawCanvasPoint(x, y, strokeStyle, shape) {
        x = parseInt(x);
        y = parseInt(y);
        
        var ctx = canvas.getContext("2d");
        ctx.strokeStyle = (strokeStyle==undefined) ? selectedColor() : strokeStyle;
        ctx.lineWidth = 10;
        ctx.lineCap = (shape==undefined) ? selectedShape() : shape;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x+1, y+1);
        ctx.stroke();
    }

    function clearCanvas() {
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
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
            canvas: canvas,
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
