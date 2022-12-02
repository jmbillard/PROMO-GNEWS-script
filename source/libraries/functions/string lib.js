/*

---------------------------------------------------------------
> 🖌️ string manipulation
---------------------------------------------------------------

*/

//  linter settings:
//  jshint -W061
//  jshint -W085
//  jshint -W043

function deleteFileExt(str) {
  return str.replace(/\.[0-9a-z]+$/i, '');
}

function getFileExt(str) {
  return str
    .match(/\.[0-9a-z]+$/i)
    .toString()
    .toLowerCase();
}

function deletePrefix(name) {
  var prefixArray = getPrefixes();

  for (var p = 0; p < prefixArray.length; p++) {
    var pattern = eval('new RegExp(/^' + prefixArray[p] + '/)');
    if (name.match(pattern) != null) name = name.replace(pattern, '');
  }

  return name;
}

function titleCase(str) {
  str = str.toLowerCase().split(' ');

  for (var i = 0; i < str.length; i++) {
    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
  }

  str = str.join(' ');
  str = str.split(/\n|\r/);

  for (var t = 0; t < str.length; t++) {
    str[t] = str[t].charAt(0).toUpperCase() + str[t].slice(1);
  }

  return str.join('\n');
}

// format short date and time → SHORT DATE TIME
function formatShortDateAndTime(str) {
  return str
    .toString()
    .trim()
    .toUpperCase()
    .toShortDate()
    .split(/\s+—\s+|[\n\r]+|\s+\|\s+/)
    .join(' ');
}

function limitNameSize(name, limit) {
  var limit1 = limit / 2 - 5;
  var limit2 = name.length - limit / 2;

  var name1 = name.substring(0, limit1);
  var name2 = name.substring(limit2, name.length);

  name = name.length < limit ? name : name1 + '...' + name2;

  return name;
}
