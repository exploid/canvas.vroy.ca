require "rubygems"

gem "ramaze", "2009.03"
require "ramaze"

require "json"
require "juggernaut"

require "sequel"

DB = Sequel.connect("mysql://root:asdf@localhost/canvas")

unless DB.table_exists? :coordinates
  DB.create_table :coordinates do
    primary_key :id
    String :canvas
    String :x
    String :y
    String :color
  end
end

class Coordinate < Sequel::Model(DB[:coordinates])
  def self.clear(canvas)
    self.filter(:canvas => canvas).delete
  end
  def self.load(canvas)
    DB["SELECT * FROM canvas.coordinates WHERE canvas=?", canvas].map do |coord|
      [ coord[:x], coord[:y], coord[:color] ]
    end
  end
end

class MainController < Ramaze::Controller
  map '/'
  
  def index(canvas="index")
    @canvas = canvas
  end
  
  deny_layout :load
  def load(canvas)
    return Coordinate.load(canvas).to_json
  end

  deny_layout :clear
  def clear(canvas)
    Coordinate.clear(canvas)
    Juggernaut.publish( canvas, { :action => "clear" } )
    return true.to_json
  end

  # Action to receive clicks via AJAX posts.
  # Expects an array of coordinates in the "clicks" key: [ [x1,y1,color], [x2,y2,color], [x3,y3,color] ]
  # Expects a string to identify the canvas in the "canvas" key.
  deny_layout :click
  def click
    canvas = request[:canvas]

    clicks = request[:clicks].map{|x| x.last }
    clicks.each do |click|
      Coordinate.create(:canvas => canvas,
                        :x => click[0],
                        :y => click[1],
                        :color => click[2])
    end
      
    Juggernaut.publish(canvas, clicks, :except => request.env["HTTP_X_SESSION_ID"])
  end

end
