require "rubygems"

gem "ramaze", "2009.03"
require "ramaze"

# Ramaze::Log.ignored_tags = [:debug, :info]

require "base64"

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
    String :shape
    String :size
  end
end

class Coordinate < Sequel::Model(DB[:coordinates])
  def self.clear(canvas)
    self.filter(:canvas => canvas).delete
  end
  def self.load(canvas)
    DB["SELECT * FROM canvas.coordinates WHERE canvas=?", canvas].map do |coord|
      [ coord[:x], coord[:y], coord[:color], coord[:shape], coord[:size] ]
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
  # Expects an array of coordinates in the "clicks" key: [ [x1,y1,color,shape,size], [x2,y2,color,shape,size], [x3,y3,color,shape,size] ]
  # Expects a string to identify the canvas in the "canvas" key.
  deny_layout :click
  def click
    canvas = request[:canvas]

    clicks = request[:clicks].map{|x| x.last }
    clicks.each do |click|
      Coordinate.create(:canvas => canvas,
                        :x => click[0],
                        :y => click[1],
                        :color => click[2],
                        :shape => click[3],
                        :size => click[4])
    end
      
    Juggernaut.publish(canvas, clicks, :except => request.env["HTTP_X_SESSION_ID"])
  end

  deny_layout :save_image
  def save_image
    canvas_name = h(request[:canvas_name])

    # See http://www.permadi.com/blog/2010/10/html5-saving-canvas-image-data-using-php-and-ajax/
    # for information about the base64 operation
    image = Base64.decode64( request[:image].split(",").last )

    File.open("saved_images/#{canvas_name}.png", "w") {|f| f.write(image) }

    return { :filename => "/download_image/#{canvas_name}.png" }.to_json
  end

  deny_layout :download_image
  def download_image(canvas_name)
    send_data_as_file( File.read("saved_images/#{h(canvas_name)}"), "#{h(canvas_name)}", "image/png" )
  end

  private

  # Based on a more recent version of the send_file helper.
  # https://github.com/Ramaze/ramaze/blob/a96af85d1572b6bf06ee1e1d58d576db25c78af0/lib/ramaze/helper/send_file.rb
  def send_data_as_file(data, filename, content_type)
    response.body = data
    response['Content-Length'] = data.size.to_s
    response['Content-Type'] = content_type
    response['Content-Disposition'] = "Content-disposition: attachment; filename=#{filename}"
    response.status = 200

    throw(:respond, response)
  end
end
