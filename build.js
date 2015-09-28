/**
 * Created by James on 9/28/2015.
 * Written for Node 4.1.1
 */

var _fs = require('fs');


var bibly_files = [
    'bible.js',
    'bible.reference.js',
    'bibly.js'
    ],
    bibly_filename = 'bibly',
    bibly_version = 'jk-0.8.6',
    bibly_version_path = 'build/' + bibly_version + '/',
    bibly_active_path = 'build/';

if (!dirExists(bibly_active_path)) {
    _fs.mkdirSync(bibly_active_path);
}

if (!dirExists(bibly_version_path)) {
    _fs.mkdirSync(bibly_version_path);
}

// JavaScript
var biblyjs = bibly_filename + '.js',
    biblyjs_min = bibly_filename + '.min.js';


// Combine Files
concatFiles({
    src : bibly_files,
    dest : bibly_version_path + biblyjs
});


// copy versioned file to active path
_fs.writeFileSync(bibly_active_path  + biblyjs, _fs.readFileSync(bibly_version_path  + biblyjs)); // should have some error handling.


// create minified and copy it
uglify(bibly_version_path  + biblyjs, bibly_version_path + biblyjs_min);
_fs.writeFileSync(bibly_active_path  + biblyjs_min, _fs.readFileSync(bibly_version_path  + biblyjs_min)); // should have some error handling.


// CSS
{
    var biblycss = bibly_filename + '.css';
    var biblycss_min = bibly_filename + '.min.css';

    _fs.writeFileSync(bibly_version_path + biblycss, _fs.readFileSync(biblycss)); // should have some error handling.
    _fs.writeFileSync(bibly_active_path + biblycss, _fs.readFileSync(bibly_version_path + biblycss)); // should have some error handling.

    var _recess = require('recess');
    _recess(biblycss, {
        compile: true,
        compress: true,
        noIDs: false,
        noUnderscores: false,
        noUniversalSelectors: false
    }, function (err, obj) {
        if (err) throw err;
        //console.log(
        //    obj,        // recess instance for fat.less
        //    obj.output, // array of loggable content
        //    obj.errors // array of failed lint rules
        //);

        _fs.writeFileSync(bibly_version_path + biblycss_min, obj[0].output[0]);
        console.log(' '+ bibly_version_path + biblycss_min +' built.');
        _fs.writeFileSync(bibly_active_path + biblycss_min, _fs.readFileSync(bibly_version_path + biblycss_min));
    });
}


// Append header

var header = _fs.readFileSync('bibly.copyright.js');

addHeader(header, bibly_version_path + biblyjs);
addHeader(header, bibly_active_path + biblyjs);
addHeader(header, bibly_version_path + biblyjs_min);
addHeader(header, bibly_active_path + biblyjs_min);




/* Utilities */

/**
 * Concatenates given files.
 *
 * @param {Object} opts An object, with the following parameters:
 *      src - an array of files to be concatenated
 *      dest - the destination file name
 */
function concatFiles(opts) { /* HT: http://blog.millermedeiros.com/node-js-as-a-build-script/ */
    var fileList = opts.src;
    var distPath = opts.dest;
    var out = fileList.map(function(filePath){
        return _fs.readFileSync(filePath).toString();
    });
    _fs.writeFileSync(distPath, out.join('\n'));
    console.log(' '+ distPath +' built.');
}


/**
 * Runs uglifyJS on the file at the given source path, and returns the resulting minified output to the given
 * destination path.
 *
 * @param {string} srcPath Source path.
 * @param {string} destPath String. Destination path.
 */
function uglify(srcPath, destPath) {
    var _uglifyJS = require("uglify-js");
    var result = _uglifyJS.minify(srcPath);

    _fs.writeFileSync(destPath, result.code);
    console.log(' '+ destPath +' built.');
}


/**
 * Determines whether a directory exists.
 *
 * @param {string} dirPath The path to the directory.
 * @returns {boolean} True if the directory exists.
 */
function dirExists(dirPath) {
    try {
        return _fs.statSync(dirPath).isDirectory();
    } catch(err) {
        return false;
    }

}


/**
 * Adds the given headerText to the given target file.
 *
 * @param {string} headerText  The header text which should be added.
 * @param {string} targetFile  The file to which the header text will be added.
 */
function addHeader(headerText, targetFile) {
    _fs.appendFile(targetFile + ".tmp", headerText + "\n\n", function(err){
        if (err) throw err;
        _fs.appendFile(targetFile + ".tmp", _fs.readFileSync(targetFile), function(err) {
            if (err) throw err;
            _fs.rename(targetFile + ".tmp", targetFile);
        });
    });
}