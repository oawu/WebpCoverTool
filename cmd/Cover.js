/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, WebpCoverTool
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const formats = ['.png', '.jpg', '.jpeg', '.gif'];

// ================================

const rq = require;
const Tool = rq('./Tool.js');
const print = Tool.print;
const color = Tool.color;
const newline = Tool.newline;
const progress = Tool.progress;
const Path = rq('path');
const FileSystem  = rq('fs');
const Sharp = rq('sharp');

var mapDir = function(dir, filelist) {
  const files = FileSystem.readdirSync(dir);

  filelist = filelist || [];
  files.forEach(function(file) {
    const path = dir + file;

    if (!FileSystem.statSync(path).isDirectory())
      if (file[0] !== '.' && formats.indexOf(Path.extname(file).toLowerCase()) !== -1)
        if ((stats = FileSystem.statSync(path)) && (stats.size > 0))
          return filelist.push(path);

    if (FileSystem.statSync(path).isDirectory())
      filelist = mapDir(path + Path.sep, filelist);
  });

  return filelist;
};

Tool.init('轉換工具', function() {

  print(color('    ➤ ', 'C') + '注意喔，過程中請勿隨意結束！' + newline + color('    ➤ ', 'C') + Tool.ctrlC());
  print(newline + color(' 【開始轉換】', 'y') + newline);

  const oriDir = Path.resolve(__dirname, '..' + Path.sep + 'ori' + Path.sep) + Path.sep;
  const webpDir = Path.resolve(__dirname, '..' + Path.sep + 'webp' + Path.sep) + Path.sep;
  
  const tmps = mapDir(oriDir, []);

  progress(color('    ➤ ', 'C') + '掃描 Ori 目錄內容');
  progress(tmps.length);

  const files = tmps.map(function(file) {
    return progress() ? {
      path: file,
      dirname: (Path.dirname(file) + Path.sep).replace(oriDir, ''),
      basename: Path.basename(file).split('.').slice(0, -1).join('.'),
    } : null;
  }).filter(function(t) { return t !== null; });
  progress('');

  progress(color('    ➤ ', 'C') + '轉換到 webp 目錄');
  progress(files.length);
  Promise.all(files.map(function(file) {
    if (file.dirname.length)
      FileSystem.mkdirSync(webpDir + file.dirname, {recursive: true});

    if (!FileSystem.existsSync(webpDir + file.dirname))
      progress('_', ['錯誤原因：' + color('無法建立目錄！', 'w2')]);


    return new Promise(function(resolve, reject) {
      Sharp(file.path).toFile(webpDir + file.dirname + file.basename + '.webp', function(err, info) {
        if (err) reject(err);
        else progress() && resolve(info);
      })
    });
  })).then(function() {
    progress('');

    print(newline + color(' 【轉換完成】', 'R') + newline);
    return print(color('    ➤ ', 'C') + '轉換結束囉！' + newline + newline);
  }).catch(function(err) {
    return progress('_', ['錯誤原因：' + color(err.message, 'w2')]);
  });
});
