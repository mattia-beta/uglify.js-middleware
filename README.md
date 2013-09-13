# uglify.js-middleware

## Installation

Npm mode:

    npm install zwe-uglifyjs-middleware
Package mode:

    "dependencies": {
        "zwe-uglifyjs-middleware": "*"
    }

## Options

<table>
    <thead>
        <tr>
            <th>Option</th>
            <th>Description</th>
            <th>Default</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><code>src</code></td>
            <td>The directory where the source <code>.js</code> files are stored. <strong>Required</strong></td>
            <td></td>
        </tr>
        <tr>
            <td><code>dest</code></td>
            <td>The directory where the compiled <code>.min.js</code> files are stored. If not specified, it is the same as the <code>src</code> directory.</td>
            <td>=<code>src</code></td>
        </tr>
        <tr>
            <td><code>prefix</code></td>
            <td>Path which should be stripped from the <code>public</code> pathname.</td>
            <td></td>
        </tr>
        <tr>
            <td><code>compress</code></td>
            <td>Force the compression of the output.<br>Possible values:<ul><li><code>false</code>: never compress output;</li><li><code>true</code>: always compress output;</li><li><code>'auto'</code>: compress output depending on the extension (<code>.min.js</code> or <code>.js</code>.</li></ul></td>
            <td><code>'auto'</code></td>
        </tr>
        <tr>
            <td><code>debug</code></td>
            <td>Output any debugging messages to the console.</td>
            <td><code>false</code></td>
        </tr>
        <tr>
            <td><code>force</code></td>
            <td>Always re-compile <code>.js</code> files on each request.</td>
            <td><code>false</code></td>
        </tr>
        <tr>
            <td><code>once</code></td>
            <td>Only check for need to recompile once after each server restart. Useful for reducing disk i/o on production.</td>
            <td><code>false</code></td>
        </tr>
        <tr>
            <td><code>generateSourceMap</code></td>
            <td>If it should also generate the <code>.map.js</code> file to use in browser debug.</td>
            <td><code>false</code></td>
        </tr>
        <tr>
            <td><code>uglifyjs</code></td>
            <td>The object with options to pass to the uglifyJS constructor.</td>
            <td><code>{}</code></td>
        </tr>
    </tbody>
</table>

## Examples

### Connect

    var server = connect.createServer(
        require('zwe-uglifyjs-middleware')({
            src: __dirname + '/public'
        }),
        connect.staticProvider(__dirname + '/public')
    );

### Express

    var app = express.createServer();

    app.use(require('zwe-uglifyjs-middleware')({
        src: __dirname + '/public'
    });

    app.use(express.static(__dirname + '/public'));
