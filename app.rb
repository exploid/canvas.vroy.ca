require "rubygems"

gem "ramaze", "2009.03"
require "ramaze"

require "json"
require "juggernaut"

Coordinates = {}

class MainController < Ramaze::Controller
  map '/'
  
  def index
    heatmap()
  end
  
  def heatmap(channel="index")
    @channel = channel
    @divs = ""

    (Coordinates[channel] || []).each do |x, y|
      @divs << %(<div class="point" style="left:#{x}; top:#{y};"></div>\n)
    end

    render_template("index.xhtml")
  end

  deny_layout :clear
  def clear(channel)
    Coordinates[channel] = []
    Juggernaut.publish(channel, "clear".to_json)
    return true.to_json
  end

  def click(x, y, channel="index")
    x, y = x.to_i, y.to_i
    if x != 0 and y != 0
      Coordinates[channel] ||= []
      Coordinates[channel] << [ x, y ]
      Juggernaut.publish(channel, [ x, y ].to_json, :except => request.env["HTTP_X_SESSION_ID"])
    end
  end

end
