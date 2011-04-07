require "app"

$stdout.reopen( ::IO.popen("/bedrock/bin/cronolog /home/vince/code/heatmap/logs/stdout.%Y-%m-%d.log", "w") )
$stderr.reopen( ::IO.popen("/bedrock/bin/cronolog /home/vince/code/heatmap/logs/stderr.%Y-%m-%d.log", "w") )

Ramaze.trait[:essentials].delete Ramaze::Adapter
Ramaze.start!
run Ramaze::Adapter::Base
