/*
    INVOLT FRAMEWORK UI ELEMENTS AND UPDATING VALUES OF THEM
    Ernest Warzocha 2015
    involt.github.io

    This file is not required for Involt to work. 
    If you don't need Involt UI kit just remove this file.
*/

//UPDATE OF READ-ONLY ELEMENTS

//Updated in 50ms interval to reduce CPU usage
var analogUpdate = function(){

  //show
  $(".show").each(function() {
    $(this).html(analogPins[$(this).data("pinNumber")]);
  });

  //bar
  $(".bar").each(function() {
      var $t = $(this);
      //map the value to bar pixel width
      var bar = {

        minValue : $t.data('min'),
        maxValue : $t.data('max'),
        maxWidth : parseInt($t.css('width'))

      };
      //scaling the css width of active element to total width
      var widthMap = (analogPins[$t.data("pinNumber")]-bar.minValue)*(bar.maxWidth-0)/(bar.maxValue-bar.minValue)+0;
      //change bar width
      $t.children(".bar-value").css('width', widthMap);
      //display the value
      $t.children(".bar-value").children('div').html(analogPins[$t.data("pinNumber")]);
  });

  //knob
  $(".knob").each(function() {
    $(this).children().children('.knob-read').val(analogPins[$(this).data("pinNumber")]).trigger('change');
  });

  //value
  $(".value").each(function() {
    $(this).attr('value', analogPins[$(this).data("pinNumber")]);
  });

};

setInterval(analogUpdate, updateRate);

//USER INTERFACE AND SEND EVENTS

$(document).ready(function() {

  //button
  $(document).on("click",".button",function() {
    $(this).updateValue().sendValue();
  });

  //button-toggle
  $(document).on("click",".button-toggle",function() {
    var $t = $(this);

    $t.toggleClass('state2');

    if ($t.hasClass('state2')) {
      digitalPins[$t.data("pinNumber")] = $t.data("value2");
        $t.sendValue();
    }
    else {
      digitalPins[$t.data("pinNumber")] = $t.data("value");
        $t.sendValue();       
    };
  });

  //toggle
  $(document).on("click",".toggle",function() {
    var $t = $(this);
    var index = $t.data('pinNumber');
    if (digitalPins[index] == 0){
      if ($t.html() == "OFF") {
        $t.html("ON");
      };
      digitalPins[index] = 1;
        $t.sendValue();
    }
    else if (digitalPins[index] == 1){
      if ($t.html() == "ON") {
        $t.html("OFF");
      };
        digitalPins[index] = 0; 
          $t.sendValue();    
    };
    $t.toggleClass('inactive');

  });

  //increase
  $(document).on("click",".increase",function() {
    var $t = $(this);
    var index = $t.data("pinNumber");

      digitalPins[index] = digitalPins[index] + $t.data("step");
      digitalPins[index] = Math.min(Math.max(digitalPins[index], $t.data("min")), $t.data("max"));
        $t.sendValue(); 
  });

  //decrease
  $(document).on("click",".decrease",function() {
    var $t = $(this);
    var index = $t.data("pinNumber");

      digitalPins[index] = digitalPins[index] - $t.data("step");
      digitalPins[index] = Math.min(Math.max(digitalPins[index], $t.data("min")), $t.data("max"));
        $t.sendValue(); 
  });

  //hover
  $(document).on({
      mouseenter: function () {
        var $t = $(this);
        digitalPins[$t.data("pinNumber")] = $t.data("value");
          $t.sendValue();
      },
      mouseleave: function () {
        var $t = $(this);
        digitalPins[$t.data("pinNumber")] = $t.data("value2");
          $t.sendValue();
      }
  }, ".hover");

  //knob-send (plugin function)
  $(".knob-send").each(function() {
    //definePin will not work
    var $t = $(this);

      var index = $t.data("pinNumber");
      var currentValue = $t.data("value");
      var max = $t.data("max");
        $t.children('.knob-write').val(currentValue).data($t.data());

    $t.children('.knob-write').knob({
      'min':  $t.data("min"),
      'max':  max,
      'step': $t.data("step"),
      'change' : function (value) {
        //prevent from sending duplicated values when step is higher than 1
        if (digitalPins[index] !== this.cv){

          if (this.cv <= max){
            digitalPins[index] = this.cv;
             $t.sendValue();
          }
          else {
            digitalPins[index] = max;
          };

        };

      },
      'release' : function (value){

        if (digitalPins[index] !== value){

          if (value <= max){
            digitalPins[index] = value;
          }
          else {
            digitalPins[index] = max;
          };

          $t.sendValue(); 

        };
        $t.sendFn()
      }
    });

  });

  //custom-button
  $(document).on("click",".custom-button",function() {
    var customBut = $(this).data("pin");
      involt.send(customBut);
      $(this).sendFn();
  });

  //input-write
 $(document).on("change",".input-write",function() {
    var $t = $(this);
      $t.updateValue($t.val()).sendValue();
  });

  //custom-write
  $(document).on("change",".custom-write",function() {
    var valCustom = $(this).val();
    var valCustomSend = valCustom+"\n";
      involt.send(valCustomSend);
      $(this).sendFn();
  });

  //checkbox
  $(document).on("change",".checkbox",function() {
    var $t = $(this);
    if (this.checked) {
      digitalPins[$t.data("pinNumber")] = $t.data("value");
        $t.sendValue();
    }
    else {
      digitalPins[$t.data("pinNumber")] = $t.data("value2");
        $t.sendValue();
    };
  });

  //radio 
  $(document).on("change",".radio",function() {
    if (this.checked) {
      $(this).updateValue().sendValue(); 
    };
  });

  //slider (plugin function)
  $(".slider").each(function() {
    var $t = $(this);
    var $tp = $(this).parent(".rangeslider");
    var $ts = $t.siblings('.tooltip');

    $ts.html($tp.data('value')).hide();
    $t.siblings('.label').html($tp.data('value')).hide();

    $t.noUiSlider({
      start: [$tp.data("value")],
      range: {
        'min': [$tp.data("min")],
        'max': [$tp.data("max")]
      },
      step: $tp.data("step")
    });
    
    $t.on({
      slide: function(){
        var cssPos = $t.children('.noUi-base').children('.noUi-origin').css('left');
        var val = parseInt($t.val());
          $ts.css('left',cssPos).html(val);
          $t.siblings('.label').html(val);
            digitalPins[$tp.data("pinNumber")] = val;
            involt.arduinoSend($tp.data("pin"), val);
      },
      set: function(){
        $tp.sendFn();
      }
    });

    $tp.hover(function() {
      $ts.css('left', $t.children('.noUi-base').children('.noUi-origin').css('left'));
      $ts.fadeIn(250);
    }, function() {
      $ts.fadeOut(250);
    });

  });

});