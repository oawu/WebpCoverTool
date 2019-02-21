/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, WebpCoverTool
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const rq = require;
const Exec = rq('child_process').exec;
const newline = '\n';
let sprintf = null;

const color = function(str, fontColor, backgroundColor, options) {
  if (str === '')
    return '';

  const colors = { n: '30', r: '31', g: '32', y: '33', b: '34', p: '35', c: '36', w: '37' };
  const styles = { underline: '4', blink: '5', reverse: '7', hidden: '8', u: '4', b: '5', r: '7', h: '8' };

  let tmps = [];

  if (typeof options === 'undefined')
    options = [];

  if (typeof options === 'string')
    options = options.split(',').map(Function.prototype.call, String.prototype.trim);
  
  if (Array.isArray(options) && (options = options.map(Function.prototype.call, String.prototype.toLowerCase)).length)
    for(let i = 0; i < options.length; i++)
      if (typeof styles[options[i]] !== 'undefined')
        tmps.push(['\033[' + styles[options[i]] + 'm', '\033[0m']);

  if (typeof backgroundColor !== 'undefined') {
    let c = backgroundColor[0].toLowerCase();
    if (typeof colors[c] !== 'undefined')
      tmps.push(['\033[' + (parseInt(colors[c], 10) + 10) + 'm', '\033[0m']);
  }

  if (typeof fontColor !== 'undefined') {
    if (fontColor.length < 2)
      fontColor += '_';

    let c = fontColor[0], w = fontColor[1];

    w = w === '_' ? c === c.toUpperCase() ? '2' : w : w;
    c = c.toLowerCase();

    if (!['0', '1', '2'].includes(w))
      w = '1';

    w = w !== '0' ? w === '1' ? '0' : '1' : '2';

    if (typeof colors[c] !== 'undefined')
    tmps.push(['\033[' + w + ';' + colors[c] + 'm', '\033[0m']);
  }

  for(let i = 0; i < tmps.length; i++)
    str = tmps[i][0] + str + tmps[i][1];

  return str;
};


const print = function(str) {
  process.stdout.write('\r' + str);
  return true;
};

const ctrlC = function() {
  return '過程中若要關閉請直接按鍵盤上的 ' + color('control', 'W') + color(' + ', 'w0') + color('c', 'W') + newline + ' '.repeat(37) + color('^^^^^^^^^^^', 'c1');
};

const susses = function(title) {
  return print(title + color(' ─ ', 'w0') + color('成功', 'g') + newline);
};

const init = function(header, closure) {
  process.stdout.write('\x1b[2J');
  process.stdout.write('\x1b[0f');

  const tmp = function() {
    rq('sharp');
    rq('sprintf-js');
    sprintf = rq("sprintf-js").sprintf;
    return true;
  };

  const errMsg = function(err) {
    return newline + color(' '.repeat(30), 'w', 'r') + newline + color('  發生錯誤', 'y2', 'r') + color('，以下為錯誤原因', 'w2', 'r') + color('：  ', 'w', 'r') + newline + color(' '.repeat(30), 'w', 'r') + newline + color('─'.repeat(30), 'w0') + newline + err + newline + color('─'.repeat(30), 'w0') + newline + newline;
  };

  try {
    return tmp() && print(newline + color(' ' + '【' + header + '】', 'r2') + newline) && closure(true);
  } catch(e) {
    if (!(e + '').match(/^Error: Cannot find module/))
      return print(errMsg(e)) && process.exit(1);
  
    print(newline + color(' ' + '【' + header + '】', 'r2') + newline);
    print(color('    ➤ ', 'C') + '首次使用，所以建立初始化環境！' + newline + color('    ➤ ', 'C') + '注意喔，過程中請勿隨意結束！' + newline + newline + color(' 【建立環境】', 'y') + newline);
    print((title = color('    ➤ ', 'C') + '執行 ' + color('npm install .', 'w2') + ' 指令') + color('… ', 'w0'));

    Exec('npm install .', function(err, stdout, stderr) {
      try {
        return susses(title) && tmp() && print(newline + color(' ' + '【開始' + header + '】', 'y') + newline) && closure(false);
      } catch(e) {

        if (!(e + '').match(/^Error: Cannot find module/))
          return print(errMsg(e)) && process.exit(1);
        
        print(title + color(' ─ ', 'w0') + color('失敗', 'r') + newline + color('      ◎ ', 'p2') + color('cmd 目錄', 'w2') + '無法寫入' + newline);
        print((title = color('    ➤ ', 'C') + '改用最高權限執行 ' + color('sudo npm install .', 'w2') + ' 指令') + color('… ', 'w0'));
        
        Exec('sudo npm install .', function(err, stdout, stderr) {
          try {
            return susses(title) && tmp() && print(newline + color(' ' + '【開始' + header + '】', 'y') + newline) && closure(false);
          } catch(e) {
            if (!(e + '').match(/^Error: Cannot find module/))
              return print(errMsg(e)) && process.exit(1);

            print(title + color(' ─ ', 'w0') + color('失敗', 'r') + newline + color('      ◎ ', 'p2') + color('cmd 目錄', 'w2') + '無法寫入' + newline);
            print(newline + color(' '.repeat(50), 'r', 'r') + newline + color('  錯誤！', 'y2', 'r') + color('執行', 'n', 'r') + color(' npm install . ', 'w2', 'r') + color('失敗', 'n', 'r') + color(' '.repeat(19), 'r', 'r') + newline + color(' '.repeat(8), 'y2', 'r') + color('請在終端機手動輸入指令', 'n1', 'r') + color(' npm install . ', 'w2', 'r') + color('吧！ ', 'n1', 'r') + newline + color(' '.repeat(31), 'r', 'r') + color('^^^^^^^^^^^^^', 'y2', 'r') + color(' '.repeat(6), 'r', 'r') + newline + newline);
          }
        });
      }
    });
  }
};

const progressInfo = {
  title: null,
  total: 0,
  index: 0,
  present: 0,
};

const progress = function(total, err) {
  if (typeof total === 'string') {
    if (total === '')
      return print(progressInfo.title + color('(' + progressInfo.total + '/' + progressInfo.total + ')', 'w0') + color(' ─ ', 'w0') + '100%' + color(' ─ ', 'w0') + color("完成", 'g') + newline);
    else if (total === '_')
      return print(progressInfo.title + color('(' + progressInfo.index + '/' + progressInfo.total + ')', 'w0') + color(' ─ ', 'w0') + sprintf('%3d%%', progressInfo.present) + color(' ─ ', 'w0') + color("失敗", 'r') + newline + (err ? err.map(function(t) {
        return color('      ◎ ', 'p2') + t + newline;
      }).join('') : '') + newline);
    else
      return print((progressInfo.title = total) + color('… ', 'w0'));
  }

  if (!isNaN(total)) {
    progressInfo.total = total;
    progressInfo.index = -1;
  }

  progressInfo.present = progressInfo.total ? Math.ceil((progressInfo.index + 1) * 100) / progressInfo.total : 100;
  progressInfo.present = progressInfo.present <= 100 ? progressInfo.present >= 0 ? progressInfo.present : 0 : 100;

  return print(progressInfo.title + color('(' + (++progressInfo.index) + '/' + progressInfo.total + ')', 'w0') + color(' ─ ', 'w0') + sprintf('%3d%%', progressInfo.present));
};
module.exports = {
  init: init,
  newline: newline,
  color: color,
  print: print,
  ctrlC: ctrlC,
  progress: progress,
};