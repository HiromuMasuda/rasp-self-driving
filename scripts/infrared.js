w().ready(function() {

  console.log("infrared.js is successfully loaded!");

  // 1. 毎秒、赤外線モジュールからの入力を確認
  // 2. 動きがあったらslack通知用のマクロを呼び出す

  var INFRARED = 25

  function check_infrared_input() {
    w().digitalRead(INFRARED, function(io, data){
      if(data == 1) {
        console.log("INFRARED: 1");
        w().callMacro('notify_slack', []);
      } else {
        console.log("INFRARED: 0");
      });
    }
  }

  check_infrared_input()
});
