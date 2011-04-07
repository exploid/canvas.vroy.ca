$(document).ready(
function() {
    var coordinates = [];

    $("#map").click(function(e){
            console.log( e );
            var x = e.pageX - this.offsetLeft;
            var y = e.pageY - this.offsetTop;
            
            if ( !coordinatesExists(x, y) ) {
              coordinates.push( [ x, y ] );

              var n = $("<div class='point'></div>").css("position", "relative").css("left", x).css("top", y);
              $(this).append( n );
            }
        });

    // $(".point").live("click", function(e) {
            // console.log("Point was clicked.");
            // var x = e.offsetX;
            // var y = e.offsetY;
            // coordinatesExists(x, y);
        // });

    function coordinatesExists(x, y) {
        for (i in coordinates) {
            var xx = coordinates[i][0];
            var yy = coordinates[i][1];
            
            if (xx == x && yy == y) {
                return true;
            }
        }
        return false;
    }
});
