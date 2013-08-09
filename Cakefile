flour = require 'flour'
fs = require 'fs'

task 'build:coffee', ->
    flour.minifiers.disable 'js'
    compile 'src/*.coffee', 'build', ->
        bundle ['build/pivot.js','build/*.js'], 'dist/pivot.all.js', ->
            flour.minifiers.enable 'js'
            minify 'dist/pivot.all.js', 'dist/pivot.min.js'
            fs.createReadStream('dist/pivot.all.js').pipe(fs.createWriteStream('examples/pivot.js'));

task 'build', ->
    invoke 'build:coffee'
    

task 'watch', ->
    watch 'src/*.coffee', -> invoke 'build:coffee'