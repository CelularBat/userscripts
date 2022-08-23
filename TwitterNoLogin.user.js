// ==UserScript==
// @name         TwitterNoLogin
// @namespace    http://tampermonkey.net/
// @version      0.1
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


   var IV_overlayer = setInterval(function(){
       var layer = jQuery('#layers');
       if ( layer != null){
           layer.remove();
           console.log('TwitterNoLogin: OverLayer removed!');
           clearInterval(IV_overlayer);
       }
    },1000);


   var IV_scroll =  setInterval(function(){
       var scroll = jQuery('html').css('overflow');
       if ( scroll == 'hidden'){
            jQuery('html').css('overflow','visible');
           console.log('TwitterNoLogin: ScrollBar revived!');
           clearInterval(IV_scroll);
        }
    },2000);


})();