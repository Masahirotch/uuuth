const helper = {
  // 日付処理系
  getNow: function () {
    var d = new Date();
    var year = d.getFullYear();
    var month = d.getMonth() + 1;
    var day = d.getDate();
    var hour = ("00" + d.getHours()).slice(-2);
    var min = ("00" + d.getMinutes()).slice(-2);
    var sec = ("00" + d.getSeconds()).slice(-2);
    return `${year}-${month}-${day} ${hour}:${min}:${sec}`;
  },
  jpDate: function (da) {
    var d = new Date(da);
    var year = d.getFullYear();
    var month = d.getMonth() + 1;
    var day = d.getDate();
    var hour = ("00" + d.getHours()).slice(-2);
    var min = ("00" + d.getMinutes()).slice(-2);
    var sec = ("00" + d.getSeconds()).slice(-2);
    return `${year}年${month}月${day}日 ${hour}時${min}分${sec}秒`;
  },
  jpShortDate: function (da) {
    var d = new Date(da);
    var year = d.getFullYear();
    var month = d.getMonth() + 1;
    var day = d.getDate();
    return `${year}年${month}月${day}日`;
  },
  enDate: function (da) {
    var d = new Date(da);
    var year = d.getFullYear();
    var month = d.getMonth() + 1;
    var day = d.getDate();
    var hour = ("00" + d.getHours()).slice(-2);
    var min = ("00" + d.getMinutes()).slice(-2);
    var sec = ("00" + d.getSeconds()).slice(-2);
    return `${year}/${month}/${day} ${hour}:${min}`;
  },
  unixTime: function () {
    var date = new Date();
    var a = date.getTime();
    return Math.floor(a / 1000);
  },
};

module.exports = helper;
