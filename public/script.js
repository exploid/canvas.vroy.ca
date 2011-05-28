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

    $(".color").click(function() {
            selectColor( $(this).css("background-color") );
        });

    $("#save").click( saveImage );
    
    function loadCanvas() {
        $.getJSON("/load/"+$("#canvas_name").val(), function(data) {
                drawList(data);
            });
    }

    function drawList(data) {
        for (var i in data) {
            var x = data[i][0];
            var y = data[i][1];
            var color = data[i][2];
            var shape = data[i][3];
            var size = data[i][4];
            drawCanvasPoint(x, y, color, shape, size);
        }
    }

    function selectedColor() {
        return $(".picked .color").css("background-color");
    }
    function selectColor(color) {
        $(".picked .color").css("background-color", color);
    }
    function selectedShape() {
        return $(".shape").val();
    }
    function selectedSize() {
        return parseInt( $(".size").val() );
    }


    function captureDrawing(e) {
        var x = e.offsetX;
        var y = e.offsetY;
        drawCanvasPoint( x, y );
        captured_coordinates.push( [x, y, selectedColor(), selectedShape(), selectedSize() ] );
    }

    function drawCanvasPoint(x, y, color, shape, size) {
        x = parseInt(x);
        y = parseInt(y);
        
        var ctx = canvas.getContext("2d");
        ctx.strokeStyle = (color==undefined) ? selectedColor() : color;
        ctx.lineWidth = (size==undefined) ? selectedSize() : size;
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

    function saveImage(e) {
        // Post image to the server so it can be saved and served for download in the callback.
        // I couldn't get it to work by passing the image information through a GET request and
        // sending back the file immediately.
        var opts = {
            image: canvas.toDataURL("image/png"),
            canvas_name: $("#canvas_name").val()
        }
        $.post("/save_image", opts, function(data) {
                window.location = window.location.origin + data.filename;
            }, "JSON");
    }

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
