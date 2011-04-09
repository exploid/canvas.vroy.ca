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
    Juggernaut.publish( channel, { :action => "clear" } )
    return true.to_json
  end

  # Action to receive clicks via AJAX posts.
  # Expects an array of coordinates in the "clicks" key: [ [x1,y1], [x2,y2], [x3,y3] ]
  # Expects a string to identify the channel in the "channel" key.
  deny_layout :click
  def click
    channel = request[:channel]
    Coordinates[channel] ||= []

    clicks = request[:clicks].map{|x| x.last }

    Coordinates[channel] << clicks
    Juggernaut.publish(channel, clicks, :except => request.env["HTTP_X_SESSION_ID"])
  end

end
