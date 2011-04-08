require "rubygems"

gem "ramaze", "2009.03"
require "ramaze"

require "json"
require "juggernaut"

Coordinates = []

class MainController < Ramaze::Controller
  map '/'
  
  def index
  end

  def heatmap
    @divs = ""

    Coordinates.each do |x, y|
      @divs << %(<div class="point" style="left:#{x}; top:#{y};"></div>\n)
    end

    render_template("index.xhtml")
  end

  def click(x, y)
    x, y = x.to_i, y.to_i
    if x != 0 and y != 0
      Coordinates << [ x, y ]
      Juggernaut.publish("channel1", [ x, y ].to_json, :except => request.env["HTTP_X_SESSION_ID"])
    end
  end

end
