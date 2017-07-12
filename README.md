# Vexflow MusicXML parser [![Build Status](https://travis-ci.org/bneumann/vexflow-musicxml.svg?branch=develop)](https://travis-ci.org/bneumann/vexflow-musicxml)

This is a ES6 approach to an easy Music XML renderer. It uses [Vexflow](https://github.com/0xfe/vexflow) to display the score. It does __not__ take care about the layout (at the moment) and always renders the score in respect to the given canvas. The VexRenderer class has an interface for layout calculations and redrawing if the dimensions change.

Please consider that this project is under development and needs some more care.

## Installation

```javascript
npm install
```
Grunt
```javascript
npm install -g grunt-cli
```

## Build

```javascript
grunt
```
## Test
```javascript
grunt test
```

## Screenshots

Here are some shots from the current development:

![PC Browser](doc/images/screenshot_bach1.png)

It scales also to the small browser screens:

![Smartphone Browser](doc/images/screenshot_bach2.png)

## Usage

Apply like this:

```html
<!doctype html>

<html lang="en">
<body>
  <style>
  html, body, canvas {
    width:  100%;
    height: 100%;
    margin: 5px;
  }
  </style>
  <script src="../build/vexflow-musicxml.js"></script>
  <script>
    const reader = new FileReader();
    const openFile = function(event) {
      const input = event.target;
      reader.onload = function(){
        const dStart = new Date();
        const text = reader.result;
        const node = document.getElementById('output'); // get the element where you want the score to be rendered
        const vex = new Vex.Flow.MusicXmlRenderer(text, node); // call the MusicXmlRenderer
        const dStop = new Date();
        console.log('Time for loading: ' + (dStop.getMilliseconds() - dStart.getMilliseconds()) + ' ms');
      };
      reader.readAsText(input.files[0]);
    };

  </script>
  <form name="foo" method="post" enctype="multipart/form-data">
    <input type='file'
           accept='text/xml'
           onchange='openFile(event)'><br>
  </form>
  <canvas id='output' width='1280' height='1024'>
  ...
  </canvas>
</body>

</html>

```

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## History

TODO: Write history

## Credits

TODO: Write credits

## License

MIT License

Copyright (c) 2017 Benjamin Giesinger

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
