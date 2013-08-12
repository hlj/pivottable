flour = require 'flour'
fs = require 'fs'

task 'build:coffee', ->
    flour.minifiers.disable 'js'
    compile 'src/*.coffee', 'build', ->
        flour.getFiles 'build/*.js', (files) ->
            js_specs = ['build/pivot.js', 'build/decorator_default.js']
            files.splice(files.indexOf(file),1) for file in js_specs
            bundle js_specs.concat(files), 'dist/pivot.all.js', ->
                flour.minifiers.enable 'js'
                minify 'dist/pivot.all.js', 'dist/pivot.min.js'
                fs.createReadStream('dist/pivot.all.js').pipe(fs.createWriteStream('examples/pivot.js'));
                
task 'build:less', ->
    compile 'src/*.less', 'build', ->
        bundle ['build/*.css'], 'dist/pivot.min.css', ->
            fs.createReadStream('dist/pivot.min.css').pipe(fs.createWriteStream('examples/pivot.css'));

task 'build', ->
    invoke 'build:coffee'
    invoke 'build:less'
    

task 'watch', ->
    watch 'src/*.coffee', -> invoke 'build:coffee'
    watch 'src/*.less', -> invoke 'build:less'