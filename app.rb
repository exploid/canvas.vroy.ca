require "rubygems"
require "ramaze"
require "json"

class MainController < Ramaze::Controller
  map '/'
  
  def index
    "Heatmap"
  end
end
