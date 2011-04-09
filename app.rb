require "rubygems"

gem "ramaze", "2009.03"
require "ramaze"

require "json"
require "juggernaut"

Coordinates = {}

class MainController < Ramaze::Controller
  map '/'
  
  def index(canvas="index")
    @canvas = canvas
  end
  
  deny_layout :load_coordinates
  def load(canvas)
    coordinates = []
    if !Coordinates[canvas].to_a.empty?
      coordinates = Coordinates[canvas].first
    end
    return coordinates.to_json
  end

  deny_layout :clear
  def clear(canvas)
    Coordinates[canvas] = []
    Juggernaut.publish( canvas, { :action => "clear" } )
    return true.to_json
  end

  # Action to receive clicks via AJAX posts.
  # Expects an array of coordinates in the "clicks" key: [ [x1,y1], [x2,y2], [x3,y3] ]
  # Expects a string to identify the canvas in the "canvas" key.
  deny_layout :click
  def click
    canvas = request[:canvas]
    Coordinates[canvas] ||= []

    clicks = request[:clicks].map{|x| x.last }

    Coordinates[canvas] << clicks
    Juggernaut.publish(canvas, clicks, :except => request.env["HTTP_X_SESSION_ID"])
  end

end
