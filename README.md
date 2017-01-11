# Vexflow MusicXML parser [![Build Status](https://travis-ci.org/bneumann/vexflow-musicxml.svg?branch=master)](https://travis-ci.org/bneumann/vexflow-musicxml)

This is a ES6 approach for a easy Music XML renderer. It uses [Vexflow](https://github.com/0xfe/vexflow) as to display the score.

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

TODO: Write license
