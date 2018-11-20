w().ready(function() {

  // GPIOポートの設定
  var MOTOR_L1 = 26;
  var MOTOR_L2 = 19;
  var MOTOR_R1 = 13;
  var MOTOR_R2 = 6;
  var MOTORS   = [MOTOR_L1, MOTOR_L2, MOTOR_R1, MOTOR_R2];

  // 超音波距離センサーの設定
  var TRIG_F   = 14;
  var ECHO_F   = 15;
  var TRIG_R   = 14;
  var ECHO_R   = 15;
  var TRIG_L   = 14;
  var ECHO_L   = 15;
  var TRIG_B   = 14;
  var ECHO_B   = 15;

  // その他設定
  var MOTOR_FREQ  = 500;   // モーターのPWM周波数 500Hz

  // 作動状態を保存する変数
  var direction = "STOP";  // 方向: STOP,FOWARD,BACK,RIGHT,LEFT
  var speed = 0;           // スピード: 0〜100%
  var oldspd = [];         // 各GPIO毎のスピード
  var cookie_btnrev = 0;   // クッキーの値

  // クッキーの読み込み
  var pos = document.cookie.indexOf('btnrev=');
  if(pos >= 0) {
    cookie_btnrev = parseInt(document.cookie.charAt(pos+7));
  }

  // ボタンのイベントtouchXXX <==> mouseXXXの入れ替え
  if(cookie_btnrev) {
    BUTTON_DOWN = ! isTouchDevice ? "touchstart" : "mousedown";
    BUTTON_UP   = ! isTouchDevice ? "touchend"   : "mouseup";
  }

  // 関数：GPIOポートの初期設定（PWMモードに設定する）
  function init_gpio() {
    for (var i=0; i<MOTORS.length; i++) {
      var gpio = MOTORS[i];
      w().callMacro('pwm_set_function', gpio);
    }

    w().callMacro('init_ultrasound_gpio', [TRIG_F, ECHO_F]);
    w().callMacro('init_ultrasound_gpio', [TRIG_R, ECHO_R]);
    w().callMacro('init_ultrasound_gpio', [TRIG_L, ECHO_L]);
    w().callMacro('init_ultrasound_gpio', [TRIG_B, ECHO_B]);
  }

  // 関数：モーターを指定した方向とスピードで動かす
  function motor(gpio_in1, gpio_in2, mdir, mspeed) {
    if(mdir) {   // 正転
      motor_speed(gpio_in1, mspeed);
      motor_speed(gpio_in2, 0);
    } else {     // 後転
      motor_speed(gpio_in1, 0);
      motor_speed(gpio_in2, mspeed);
    }
  }

  // 関数：モーターを指定したスピードに変更する
  function motor_speed(gpio, mspeed) {
    if(mspeed > 0) {   // スタート
      if((oldspd[gpio] == undefined) || (oldspd[gpio] == 0)) {
        w().callMacro('pwm_start', [gpio, MOTOR_FREQ,mspeed]);
      } else {   // 変更
        w().callMacro('pwm_duty', [gpio, mspeed]);
      }
    } else {   // ストップ
      w().callMacro('pwm_stop', gpio);
    }
    oldspd[gpio] = mspeed;
  }

  // 関数：キャタピラのモーターを動かす
  function change_direction(mode) {
    direction = mode;
    if(mode == "FOWARD") {    // 前進
      motor(MOTOR_L1, MOTOR_L2, 1, speed);
      motor(MOTOR_R1, MOTOR_R2, 1, speed);
    } else if(mode == "BACKWARD") {    // 後退
      motor(MOTOR_L1, MOTOR_L2, 0, speed);
      motor(MOTOR_R1, MOTOR_R2, 0, speed);
    } else if(mode == "RIGHT") {    // 右旋回
      motor(MOTOR_L1, MOTOR_L2, 1, speed);
      motor(MOTOR_R1, MOTOR_R2, 0, speed);
    } else if(mode == "LEFT") {    // 左旋回
      motor(MOTOR_L1, MOTOR_L2, 0, speed);
      motor(MOTOR_R1, MOTOR_R2, 1, speed);
    } else if(mode == "STOP") {    // 停止
      motor_speed(MOTOR_L1, 0);
      motor_speed(MOTOR_L2, 0);
      motor_speed(MOTOR_R1, 0);
      motor_speed(MOTOR_R2, 0);
    }
  }

  // 関数：キャタピラーのスピードの変化
  function change_speed(num) {
    speed = num;
    if(direction != "STOP") {
      for (var i=0; i<MOTORS.length; i++) {
        var gpio = MOTORS[i];
        if(oldspd[gpio] > 0) {
          motor_speed(gpio, speed);
        }
      }
    }
  }

  // 関数：マクロを呼んで指定された方向に進む
  function move_to_direction() {
    w().callMacro('get_direction_to_move', [TRIG_F ,ECHO_F ,TRIG_R ,ECHO_R ,TRIG_L ,ECHO_L ,TRIG_B ,ECHO_B], function(macro, args, resp) {
      console.log(resp) // DEBUG
      if(resp == "forward") {
        change_direction('FOWARD');
      } else if(resp == "right") {
        change_direction('RIGHT');
      } else if(resp == "left") {
        change_direction('LEFT');
      } else if(resp == "backward") {
        change_direction('BACKWARD');
      }
    });
  }

  // 関数：move_to_directionを一定秒ごとに呼び出すため
  function self_driving_loop(maxCount, i, msec) {
    if (i <= maxCount) {
      move_to_direction();
      setTimeout(function(){
        self_driving_loop(maxCount, ++i)
      }, msec);
    }
  }

  // 関数：自動運転を始める
  function self_driving() {
    self_driving_loop(5, 0, 3000)
  }

  // 「前進」ボタンが押されたときのイベント処理
  $('#forward').bind(BUTTON_DOWN, function(event) {
    if(direction == "STOP") {
      $(this).addClass('ledon');
      change_direction('FOWARD');
    }
  }).bind(BUTTON_UP, function(event) {
    $(this).removeClass('ledon');
    change_direction('STOP');
  });

  // 「後退」ボタンが押されたときのイベント処理
  $('#backward').bind(BUTTON_DOWN, function(event) {
    if(direction == "STOP") {
      $(this).addClass('ledon');
      change_direction('BACKWARD');
    }
  }).bind(BUTTON_UP, function(event) {
    $(this).removeClass('ledon');
    change_direction('STOP');
  });

  // 「右」ボタンが押されたときのイベント処理
  $('#right').bind(BUTTON_DOWN, function(event) {
    if(direction == "STOP") {
      $(this).addClass('ledon');
      change_direction('RIGHT');
    }
  }).bind(BUTTON_UP, function(event) {
    $(this).removeClass('ledon');
    change_direction('STOP');
  });

  // 「左」ボタンが押されたときのイベント処理
  $('#left').bind(BUTTON_DOWN, function(event) {
    if(direction == "STOP") {
      $(this).addClass('ledon');
      change_direction('LEFT');
    }
  }).bind(BUTTON_UP, function(event) {
    $(this).removeClass('ledon');
    change_direction('STOP');
  });

  // 「自動運転」ボタンが押されたときのイベント処理
  $('#self-driving').bind(BUTTON_DOWN, function(event) {
    $(this).addClass('ledon');
    self_driving();
  }).bind(BUTTON_UP, function(event) {
    $(this).removeClass('ledon');
    change_direction('STOP');
  });

  // 「スピード」スライダーが変化したときのイベント処理
  $('#slider').change(function(){
    change_speed( parseInt($(this).val()) );
  });

  // 「スピードDOWN」ボタンが押されたときのイベント処理
  $('#speeddown').bind(BUTTON_DOWN, function(event) {
    $(this).addClass('ledon');
    var sptemp = parseInt($('#slider').val()) - 10;
    if(sptemp < 0) sptemp = 0;
    $('#slider').val(sptemp);
    change_speed(sptemp);
  }).bind(BUTTON_UP, function(event) {
    $(this).removeClass('ledon');
  });

  // 「スピードUP」ボタンが押されたときのイベント処理
  $('#speedup').bind(BUTTON_DOWN, function(event) {
    var sptemp = parseInt($('#slider').val()) + 10;
    if(sptemp > 100) sptemp = 100;
    $('#slider').val(sptemp);
    change_speed(sptemp);
  }).bind(BUTTON_UP, function(event) {
    $(this).removeClass('ledon');
  });

  // 関数：「ここ」が押されたときのイベント処理
  $('#kokobtn').click(function(event) {
    var new_cookie_btnrev = (cookie_btnrev) ? 0 : 1;
    // クッキーの送信とリロード
    document.cookie = 'btnrev=' + new_cookie_btnrev;
    window.location.reload(true);
  });

  // スクロールの抑制、ただし#sliderは除外
  $('body').delegate('#wrapper','touchmove',function(e){
    e.preventDefault();
  }).delegate('#slider','touchmove',function(e){
    e.stopPropagation();
  });

  // メイン
  init_gpio();    // GPIOポートの初期設定
  speed = $('#slider').val();
});
