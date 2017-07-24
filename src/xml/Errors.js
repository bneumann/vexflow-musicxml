export class MusicXmlError extends TypeError {
  constructor(code, msg) {
    super();
    this.name = 'MusicXmlError:' + code;
    this.message = msg;
  }
}
