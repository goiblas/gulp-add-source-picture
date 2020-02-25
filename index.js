const PLUGIN_NAME = 'gulp-add-source-picture';

var through = require('through2');
var cheerio = require('cheerio');
var sizeOf = require('image-size');
var fs = require('fs');
var path = require('path');

function getFiles(dir){
    return fs.readdirSync(dir).filter( file => {
        return fs.statSync(path.join(dir, file)).isFile()
    })
}

module.exports = function (folder = '/img') {
    
    var folderImages = getFiles(folder);

    return through.obj(function (file, codificacion, cb) {

        if (file.isNull()) {
            cb(null, file);
            return;
        }

        if (file.isStream()) {
            cb(new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
            return;
        }

        var content = file.contents.toString();
        var $ = cheerio.load(content, {decodeEntities: false});

        var globalPromises = [];

        function getImageName(imageName) {
            if(imageName.lastIndexOf('@') !== -1) {
                var aPos = imageName.lastIndexOf('@');
                return imageName.substr(0, aPos);
            }
            return imageName;
        }
        $('picture').each( function(item){
            var $this = $(this);
            var $img = $this.find('img');
            var src = $img.attr('src');

            var rootSrc = path.parse(src).dir + '/';
            var imageName = getImageName(path.parse(src).name);

            var promisesMatches = [];
            var source = [];
            var sourceWebP = [];

            folderImages.forEach( ins => {
            
                var insName = getImageName(ins);

                if(imageName === insName || imageName === path.parse(ins).name){
                    var route = folder + '/' + ins;
            
                    var pro = new Promise( (resolve, reject) =>{
                        sizeOf(route, (err, dimensions) => {
                            if(err) reject(err);

                            var sourceString = rootSrc + ins + ' ' + dimensions.width + 'w'; 
                            if(path.parse(ins).ext === '.webp'){
                                sourceWebP.push(sourceString);
                            } else {
                                source.push(sourceString);
                            }
                            resolve();
                        })
                    });
                    promisesMatches.push(pro);
                    globalPromises.push(pro);
                }
            })

            Promise.all(promisesMatches)
                .then( () => {
                    var htmlSourceWebP = '';
                    var htmlSource = '';

                    if(sourceWebP.length){
                        htmlSourceWebP = `<source type="image/webp" 
                                            srcset="${sourceWebP.join(', ')}" />`
                    }

                    if( source.length){
                        htmlSource = `<source srcset="${source.join(', ')}" />`
                    }
                    $this.prepend(htmlSource);
                    $this.prepend(htmlSourceWebP);
                })
                .catch( err => {
                    cb(new gutil.PluginError(PLUGIN_NAME, err));
                    return;
                })
            })
            
            Promise.all(globalPromises)
            .then( () => {
                file.contents = Buffer.from($.html());
                cb(null, file);
            })
            .catch( err => {
                cb(new gutil.PluginError(PLUGIN_NAME, err));
                return;
            })

        });
};
