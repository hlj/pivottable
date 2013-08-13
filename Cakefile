flour = require 'flour'
fs = require 'fs'
path = require 'path'

compile_dir = (srcDir, targetDir, extFilters=['.coffee', '.less']) ->
    results = []
    paths = []
    getAllFile = (dir) ->
        files = fs.readdirSync dir
        for file in files
            fullPath = path.join(dir, file)
            if not fs.statSync(fullPath).isDirectory() 
                results.push fullPath if path.extname(file) in extFilters
            else
                getAllFile fullPath
        paths.pop
    
    getAllFile srcDir
    
    for file in results
        dstFileDir = path.dirname(file).replace(srcDir, targetDir)
        pathNames = dstFileDir.split path.sep
        for i in [0..pathNames.length]
            pathName = path.join.apply(path,pathNames[0..i])
            fs.mkdirSync pathName if not fs.existsSync(pathName)
        compile file, dstFileDir 
        
task 'build:coffee', ->
    compile_dir 'src', 'build', ['.coffee'] 
    
task 'build:less', ->
    compile_dir 'src', 'build', ['.less']

task 'bundle:js', ->
    invoke 'build:coffee'
    flour.minifiers.disable 'js'
    file_order = ['build/pivot.js', 'build/decorator/default.js']
    flour.getFiles 'build/**/*.js', (files) ->
        files.splice(files.indexOf(file),1) for file in file_order
        bundle file_order.concat(files), 'dist/pivot.all.js', ->
            flour.minifiers.enable 'js'
            minify 'dist/pivot.all.js', 'dist/pivot.min.js'
            fs.createReadStream('dist/pivot.all.js').pipe(fs.createWriteStream('examples/pivot.js'))
      
task 'bundle:css', ->
    invoke 'build:less'
    flour.minifiers.disable 'css'
    file_order = ['build/decorator/default.css']
    flour.getFiles 'build/**/*.css', (files) ->
        files.splice(files.indexOf(file),1) for file in file_order
        bundle file_order.concat(files), 'dist/pivot.all.css', ->
            flour.minifiers.enable 'css'
            minify 'dist/pivot.all.css', 'dist/pivot.min.css'
            fs.createReadStream('dist/pivot.all.css').pipe(fs.createWriteStream('examples/pivot.css'))     

task 'build', ->
    compile_dir 'src', 'build'
    
task 'bundle', ->
    invoke 'build'
    invoke 'bundle:js'
    invoke 'bundle:css'
    
task 'watch', ->
    watch 'src/*.coffee', -> invoke 'bundle:js'
    watch 'src/*.less', -> invoke 'bundle:css'