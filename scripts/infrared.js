w().ready(function() {

  var INFRARED = 25;

  function check_infrared_input() {
    w().digitalRead(INFRARED, function(io, data){
      if(data == 1) {
        console.log("INFRARED: 1");
        w().callMacro('notify_slack', []);
      } else {
        console.log("INFRARED: 0");
      }
    });
  }

  function wait_infrared_input_loop(maxCount, i) {
    return new Promise(resolve => {
      if (i <= maxCount) {
         check_infrared_input();
         setTimeout(function(){
  	 wait_infrared_input_loop(maxCount, ++i);
  	 resolve()
         }, 5000);
      }
    })
  };

  function wait_infrared_input() {
    wait_infrared_input_loop(5, 0);
  }

  wait_infrared_input_loop();
});
