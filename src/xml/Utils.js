export class Utils {
  static getNotesByBackup(notes) {
    const bList = [];
    let nList = [];
    notes.forEach((n) => {
      nList.push(n);
      if (n.isLast) {
        bList.push(nList);
        nList = [];
      }
    });
    return bList;
  }
}
