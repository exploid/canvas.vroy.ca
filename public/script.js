var jug = new Juggernaut;

jug.subscribe("channel1", function(data){
  data = JSON.parse( data );

  var x = data[0];
  var y = data[1];
  
  var n = $("<div class='point'></div>").css("left", x).css("top", y);
  $("#map").append( n );
});

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
        $.ajax({
                url: "http://heatmap.vroy.ca/click/"+x+"/"+y,
                beforeSend: function(xhr) {
                    xhr.setRequestHeader("X-Session-ID", jug.sessionID);
                }
            });
                
    }

});
