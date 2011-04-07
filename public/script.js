$(document).ready(
function() {
    $("#map").click(function(e){
            // console.log( e );
            var x = e.pageX - this.offsetLeft;
            var y = e.pageY - this.offsetTop;
            
            postCoordinates(x, y);

            var n = $("<div class='point'></div>").css("left", x).css("top", y);
            $(this).append( n );
        });

    function postCoordinates(x, y) {
        $.get("http://heatmap.vroy.ca/click/"+x+"/"+y);
    }

});
