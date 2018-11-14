w().ready(function() {

  // GPIOポートの設定
  var MOTOR_A1 = 26;
  var MOTOR_A2 = 19;
  var MOTOR_B1 = 13;
  var MOTOR_B2 = 6;
  var LIFT_C1  = 20;
  var LIFT_C2  = 16;
  var BUZZER   = 21;

  // その他設定
  var LIFT_CSPEED = 100;   // ショベルのスピード（0〜100%）
  var MOTOR_FREQ  = 500;   // モーターのPWM周波数 500Hz
  var BUZZER_FREQ = 100;   // クラクションのPWM周波数 100Hz

  // 作動状態を保存する変数
  var direction = "STOP";  // 方向: STOP,FOWARD,BACK,RIGHT,LEFT
  var lift = "STOP";       // ショベル: STOP,UP,DOWN
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
    var gpios = [MOTOR_A1, MOTOR_A2, MOTOR_B1, MOTOR_B2, LIFT_C1, LIFT_C2,BUZZER];
    for (var i=0; i<gpios.length; i++) {
      var gpio = gpios[i];
      w().callMacro('pwm_set_function', gpio);
    }
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
      motor(MOTOR_A1, MOTOR_A2, 1, speed);
      motor(MOTOR_B1, MOTOR_B2, 1, speed);
    } else if(mode == "BACKWARD") {    // 後退
      motor(MOTOR_A1, MOTOR_A2, 0, speed);
      motor(MOTOR_B1, MOTOR_B2, 0, speed);
    } else if(mode == "RIGHT") {    // 右旋回
      motor(MOTOR_A1, MOTOR_A2, 1, speed);
      motor(MOTOR_B1, MOTOR_B2, 0, speed);
    } else if(mode == "LEFT") {    // 左旋回
      motor(MOTOR_A1, MOTOR_A2, 0, speed);
      motor(MOTOR_B1, MOTOR_B2, 1, speed);
    } else if(mode == "STOP") {    // 停止
      motor_speed(MOTOR_A1, 0);
      motor_speed(MOTOR_A2, 0);
      motor_speed(MOTOR_B1, 0);
      motor_speed(MOTOR_B2, 0);
    }
  }

  // 関数：キャタピラーのスピードの変化
  function change_speed(num) {
    speed = num;
    if(direction != "STOP") {
      var gpios = [MOTOR_A1, MOTOR_A2, MOTOR_B1, MOTOR_B2];
      for (var i=0; i<gpios.length; i++) {
        var gpio = gpios[i];
        if(oldspd[gpio] > 0) {
          motor_speed(gpio, speed);
        }
      }
    }
  }

  // 関数：クラクションを鳴らす
  function buzzer(mode) {
    if(mode) {
      w().callMacro('pwm_start', [BUZZER, BUZZER_FREQ, 50]);
    } else {
      w().callMacro('pwm_stop', BUZZER);
    }
  }

  // 関数：自動運転を始める
  function self_driving() {
    w().callMacro('direction_to_move', null, function(direction) {
      if(direction == "forward") {
        change_direction('FOWARD');
      } else if(direction == "right") {
        change_direction('RIGHT');
      } else if(direction == "left") {
        change_direction('LEFT');
      } else if(direction == "backward") {
        change_direction('BACKWARD');
      }
    });
  }

  // 関数：ショベルのモーターを動かす
  function change_lift(mode) {
    lift = mode;
    if(mode == "UP") {    // 上昇
      motor(LIFT_C1, LIFT_C2, 1, LIFT_CSPEED);
    } else if(mode == "DOWN") {    // 下降
      motor(LIFT_C1, LIFT_C2, 0, LIFT_CSPEED);
    } else if(mode == "STOP") {    // 停止
      motor_speed(LIFT_C1, 0);
      motor_speed(LIFT_C2, 0);
    }
  }

  // 「前進」ボタンが押されたときのイベント処理
  $('#forward').bind(BUTTON_DOWN, function(event) {
    // 押されたとき
    if(direction == "STOP") {
      $(this).addClass('ledon');
      change_direction('FOWARD');
    }
  }).bind(BUTTON_UP, function(event) {
    // 離したとき
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

  // 「クラクション」ボタンが押されたときのイベント処理
  $('#buzzer').bind(BUTTON_DOWN, function(event) {
    $(this).addClass('ledon');
    buzzer(1);
  }).bind(BUTTON_UP, function(event) {
    $(this).removeClass('ledon');
    buzzer(0);
  });

  // 「自動運転」ボタンが押されたときのイベント処理
  $('#self-driving').bind(BUTTON_DOWN, function(event) {
    $(this).addClass('ledon');
    self_driving();
  }).bind(BUTTON_UP, function(event) {
    $(this).removeClass('ledon');
    change_direction('STOP');
  });

  // 「ショベルUP」ボタンが押されたときのイベント処理
  $('#liftup').bind(BUTTON_DOWN, function(event) {
    if(lift == "STOP") {
      $(this).addClass('ledon');
      change_lift('UP');
    }
  }).bind(BUTTON_UP, function(event) {
    $(this).removeClass('ledon');
    change_lift('STOP');
  });

  // 「ショベルDOWN」ボタンが押されたときのイベント処理
  $('#liftdown').bind(BUTTON_DOWN, function(event) {
    if(lift == "STOP") {
      $(this).addClass('ledon');
      change_lift('DOWN');
    }
  }).bind(BUTTON_UP, function(event) {
    $(this).removeClass('ledon');
    change_lift('STOP');
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
