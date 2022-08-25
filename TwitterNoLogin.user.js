// ==UserScript==
// @name         TwitterNoLogin
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Let you scroll Twitter without logging in.
// @author       https://github.com/CelularBat
// @match        *twitter.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=twitter.com
// @require      http://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
     jQuery.noConflict();

   // Removes main div with "log in" bar as well as many additional features
   var IV_overlayer = setInterval(function(){
       var layer = jQuery('#layers');
       if ( layer != null){
           layer.remove();
           console.log('TwitterNoLogin: OverLayer removed!');
           clearInterval(IV_overlayer);
       }
    },1000);

   // fixes scrollbar if hidden by 'you must log in' message (which doesnt apear after removing main div, but hiddes scrollbar anyway)
   var IV_scroll =  setInterval(function(){
       var scroll = jQuery('html').css('overflow');
       if ( scroll == 'hidden'){
            jQuery('html').css('overflow','visible');
           console.log('TwitterNoLogin: ScrollBar revived!');
           //clearInterval(IV_scroll);
        }
    },2000);

    // simple image browser, which shows large image on click. Images are also de-linked now !
    var st_photoOverlayer = jQuery('<style>.photoOverlayer{background-color: rgba(64, 15, 10, 0.9);transition-duration: 0.5s; transition-property: background-color;'+
                           'width: 100%; height: 100%; position: fixed; top: 0; left: 0;} </style>');
    jQuery('html > head').append(st_photoOverlayer);

    var IV_photo = setInterval(function(){
        var photos = jQuery('img[draggable="true"]').filter(function(){
            let a = jQuery(this).attr('alt');
            return a.length > 1;
        }).not('[done]');
        photos.attr('done',''); // img already processed - flag
        photos.closest('[href]').removeAttr('href'); //removing /photo/1 link on image
        photos.click(function(){
            var url = jQuery(this).attr('src').replace(/name=.+/,'name=large');
            var imgResize = ' style="height:'+window.innerHeight+'px;display: block;margin-left: auto;margin-right: auto;" ';
            var photoOverlayer = jQuery('<div class = "photoOverlayer"><img '+imgResize+'src="'+url+'"></div>').click(function(){jQuery(this).remove()});
            jQuery('html > body').append(photoOverlayer);
        })
    },1000);
})();
