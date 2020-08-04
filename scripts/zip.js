const path = require('path');
const JSZip = require('jszip');
const FileSaver = require('file-saver');

// const PATH_SOURCE_CODE = path.join(__dirname, '..', 'client', 'build');
// const WOPTS = { encoding: 'utf8', flag: 'w' };

// function writeFiles(name, content) {
//   [PATH_SOURCE_CODE].forEach((root) => {
//     const filePath = `${root}/${BUILD_IPFS_SUBDIRECTORY}/${name}`;
//     fs.writeFileSync(filePath, content, WOPTS,
//       function() { console.log(`Wrote ${filePath}`) })
//   });
// }

const main = async () => {
  const zip = new JSZip();
  const file = await zip.file('ethquad.txt', "Hello World\n");
  console.log('zip file: ', file);

  const content = await zip.generateAsync({ type: 'string' });
  console.log('zip file content: ', content);
  FileSaver.saveAs(content, 'ethquad.zip');
}

main()
  .catch(console.error)
  .finally(() => process.exit());
