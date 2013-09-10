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
            <td>The directory where the compiled <code>.min.js</code> files are stored. If not spcified, it is the same as the <code>src</code> directory.</td>
            <td>=<code>src</code></td>
        </tr>
        <tr>
            <td><code>debug</code></td>
            <td></td>
            <td><code>false</code></td>
        </tr>
        <tr>
            <td><code>force</code></td>
            <td></td>
            <td><code>false</code></td>
        </tr>
        <tr>
            <td><code>once</code></td>
            <td></td>
            <td><code>false</code></td>
        </tr>
        <tr>
            <td><code>generateSourceMap</code></td>
            <td></td>
            <td><code>false</code></td>
        </tr>
        <tr>
            <td><code>uglifyjs</code></td>
            <td></td>
            <td><code>{}</code></td>
        </tr>
    </tbody>
</table>