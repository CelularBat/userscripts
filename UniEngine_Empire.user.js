// ==UserScript==
// @name         UniEngine_Empire
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Enhanced Empire view for OGame-like games running on Uniengine. Currently only support for PL lang, but may be easily adjusted.
// @author       https://github.com/CelularBat
// @match        */empire.php*
// @icon         http://megaverse.pl/skins/epicblue/planeten/small/s_wasserplanet07.jpg
// @require      http://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js
// @grant        none
// ==/UserScript==

/*        SETTINGS    */
const MOTHER_PLANET_ID = "154"; // ID of Mother Planet or another target planet for SendRes mode ; Must be string
const LEAVE_METAL_ON_PLANET = 4000000; // Minimum amount of metal to be left on the colony in SendRes mode

const MT_CAPACITY = 125000;  // Mega Transporter capacity
const LEAVE_CAPACITY_FOR_DEU = 5000; // fixed space left in cargo for fuel, when sending fleets




(function() {
    'use strict';
    jQuery.noConflict();
    var $ = window.jQuery;

var Wsp = new Array(); // planet coords Array of [galaxy,system,planet]
var IDs = new Array(); //plamnet number for css
var Metal = new Array();
var MetalProd = new Array();
var Crystal = new Array();
var CrystalProd = new Array();
var Deuter = new Array();
var DeuterProd = new Array();

var Prices = [          // Prices for first N buildings on the list. You can add more.
    [2000,1000,10,1.35],     //kopalnia metalu
    [2000,1500,10,1.35],     // kopalnia kryształu
    [2500,1800,0,1.35]       /// kopalnia deuteru
    ];

var Buds = new Array (Prices.length);
var MTsAmount = new Array(); // int

/////////////////// INIT SECTION //////////////////////

for(let i =0; i <Buds.length;i++){
  if (i==0){ Buds[i] = $(".c:contains('Budynki')").parent().next().children(":first").siblings(); }
  else{ Buds[i] = $(Buds[i-1]).parent().next().children(":first").siblings(); }
}

$("th:contains('Mega transporter')").siblings().each(function(idx){
    MTsAmount.push( parseInt( $(this).children(":first").text().replaceAll("\.",''),10 ) );
});

$("th:contains('Współrzędne')").siblings().each(function(idx){
    let WspArr = $(this).find('a').text().split(":");
    Wsp.push(WspArr);
});

var M = $("th:contains('Metal')").siblings().each(function(){
    IDs.push($(this).children(":first").attr("href").replace(/re=0/g,'').replace(/[^0-9]/g,''));
    Metal.push($(this).children(":first").text().replace(/[^0-9]/g,''));
    MetalProd.push($(this).children(":last").text().replace(/[^0-9]/g,''));
});

var C = $("th:contains('Kryształ')").siblings().each(function(){
    Crystal .push($(this).children(":first").text().replace(/[^0-9]/g,''));
    CrystalProd.push($(this).children(":last").text().replace(/[^0-9]/g,''));
});

var D = $("th:contains('Deuter')").siblings().each(function(){
    Deuter.push($(this).children(":first").text().replace(/[^0-9]/g,''));
    DeuterProd.push($(this).children(":last").text().replace(/[^0-9]/g,''));
});

////////////////// PROGRAM SECTION /////////////////

function OverallRes(){
    var Msum, Csum, Dsum, Mpsum, Cpsum, Dpsum = 0;
    Msum = Metal.reduce(function(a,b){ return Number(a) + Number(b); });
    Csum = Crystal.reduce(function(a,b){ return Number(a) + Number(b); });
    Dsum = Deuter.reduce(function(a,b){ return Number(a) + Number(b); });
    Mpsum = MetalProd.reduce(function(a,b){ return Number(a) + Number(b); });
    Cpsum = CrystalProd.reduce(function(a,b){ return Number(a) + Number(b); });
    Dpsum = DeuterProd.reduce(function(a,b){ return Number(a) + Number(b); });
    console.log(Msum, Csum, Dsum, Mpsum, Cpsum, Dpsum );
    $("th:contains('Metal')").append( "<br>"+Msum.toLocaleString('de-DE') ).append('<br><span style="color:#0f0">'+Mpsum.toLocaleString('de-DE')+"/h</span>");
    $("th:contains('Kryształ')").append( "<br>"+Csum.toLocaleString('de-DE') ).append('<br><span style="color:#0f0">'+Cpsum.toLocaleString('de-DE')+"/h</span>");
    $("th:contains('Deuter')").append( "<br>"+Dsum.toLocaleString('de-DE') ).append('<br><span style="color:#0f0">'+Dpsum.toLocaleString('de-DE')+"/h</span>");
}
OverallRes();


$(".red.fmin2").parent().parent().css("border", "4px solid red"); // Red border around full depos.

function getRes(PlanetIdx){
    var res = new Array(3);
    res[0]= Metal[PlanetIdx];
    res[1]= Crystal[PlanetIdx]
    res[2]= Deuter[PlanetIdx]
		return res;
}


function getUpgradeCost(BuildingID,CurrentLvl){
    var c = new Array(3);
    for (let i=0;i<3;i++){ c[i]=Prices[BuildingID][i]*Prices[BuildingID][3]**CurrentLvl;}
    return c;
}

function getResDifference(PlanetIdx , BuildingID){
    var diff = new Array();
    let lvl = $(Buds[BuildingID][PlanetIdx])[0].childNodes[0].nodeValue.trim();
    let cost = getUpgradeCost(BuildingID, lvl);
    let res = getRes(PlanetIdx);
    for (let i=0;i<3;i++){
        diff.push(res[i]-cost[i]);
    }
    return diff;
}

function costDifParsder(Md,Cd,Dd,Mprod,Cprod,Dprod){
    let s = "";
    if (Md<0) { s = s + "<span style=\"color:orange\">M: "+Math.round(Md).toLocaleString('de-DE')+"</span><br>"; }
    if (Cd<0) { s = s + "<span style=\"color:red\">C: "+Math.round(Cd).toLocaleString('de-DE')+"</span><br>"; }
    if (Dd<0) { s = s + "<span style=\"color:grey\">D: "+Math.round(Dd).toLocaleString('de-DE')+"</span><br>"; }
    return s;
}

var styleDymek = $("<style>.dymek { position: absolute;color: red; display: none; width: max-content; z-index:99;"+
                   "padding: 3px 10px 3px 10px; border: 2px solid #20918e; background: black; font-size: 11px }</style>");
$('html > head').append(styleDymek);

var styleOpis = $("<style>.opis { position: static; display: none; width: max-content;"+
                   "background: black; font-size: 8px }</style>");
$('html > head').append(styleOpis);

for(let i =0; i <Buds.length;i++){
  $(Buds[i]).each(function(idx){ // here we edit each building lvl area
      let AreaID = "dymek_"+i+","+idx;
      let diff = getResDifference(idx,i);
      if(diff[0]>0&&diff[1]>0&&diff[2]>0){ $(this).css("background-color", "green"); }
      else{

          let ParsedCost = costDifParsder(diff[0],diff[1],diff[2],MetalProd[idx],CrystalProd[idx],DeuterProd[idx]);
          $(this).append("<span class=\"opis\">"+ParsedCost+"</span>");              // cost inline description

          let popup = $("<span class=\"dymek\" id=\""+AreaID+"\">"+ParsedCost+"</span>"); // cost popup
          popup.on( "mouseout", function() {
              $(popup).css( {"display":"none"});
          });
          $(this).append(popup).
          on( "mouseover", function() {
              $(popup).css( {"display":"table"});
          }).
          on( "mouseout", function() {
              $(popup).css( {"display":"none"});
          });
      }
  });
}

function isBuildingUpgradeble(idx,i){
    let d = document.getElementById("dymek_"+i+","+idx);
    return (d == null);
}

///////////////////// FLEET MODULE  /////////////


$("th:contains('Nazwa')").siblings().each(function(idx){
    let b = $(' <button type="button" id="SendRes_'+idx+'">Send Res</button> ').css({ "background-color": "green", "font-size" : "8px"}).click(function(){ onResSend(idx) }) ;
    if (MTsAmount[idx] == 0) { b.css("background-color", "grey") }
    $(this).append(b);
});

async function sendFleetMTs(FromID, ToGalaxy,ToSystem,ToPlanet,M,C,D, amount){
    await $.get('fleet.php?cp='+FromID+'&re=0');
    var ResultData = await $.post('fleet3.php',{sending_fleet:"1",useQuickRes:"0",galaxy:ToGalaxy,system:ToSystem,planet:ToPlanet,planettype:"1",speed:"10",FleetArray:"217,"+amount,
                     mission:"3",resource1:M.toLocaleString('de-DE'),resource2:C.toLocaleString('de-DE'),resource3:D.toLocaleString('de-DE'),expeditiontime:"1",holdingtime:"1"})
    if (ResultData.indexOf("Flota została wysłana")>0) {
         console.log('Flota wysłana');
        // updating game data
        let idx = IDs.indexOf(FromID);
         MTsAmount[idx] = MTsAmount[idx] - amount; // it updates actually only internal values, no changes show in Empire page.
         Deuter[idx] = Deuter[idx] - D;
         Crystal[idx] = Crystal[idx] - C;
         Metal[idx] = Metal[idx] - M;
         return(1);
    } else {
          console.log('Błąd floty');
          return (-1);
    }

}



function onResSend(idx,target=MOTHER_PLANET_ID){
    let tidx = IDs.indexOf(target);
    let amount = Math.min(MTsAmount[idx], 20);
    console.log(amount);
    if (amount > 0) {
        let TotalCapacity = amount*MT_CAPACITY-LEAVE_CAPACITY_FOR_DEU;
        D = Math.min(Deuter[idx]-LEAVE_CAPACITY_FOR_DEU ,TotalCapacity);
        TotalCapacity = Math.max(TotalCapacity - D,0);
        C = Math.min(Crystal[idx],TotalCapacity);
        TotalCapacity = Math.max(TotalCapacity - C,0);
        M = Math.min(Math.max(Metal[idx]-LEAVE_METAL_ON_PLANET,0),TotalCapacity);
        sendFleetMTs(IDs[idx],Wsp[tidx][0],Wsp[tidx][1],Wsp[tidx][2],M,C,D,amount).then( function(SendResult){
            //console.log("res: " + SendResult);
            switch (SendResult){
                case 1:
                    $("#SendRes_"+idx).css("background-color", "white").css("border", "1px solid #90EE90");
                    break;
                case -1:
                    $("#SendRes_"+idx).css("border", "2px solid red");
                    break;
            }
        } );


    } else { console.log("No MegaTransporters at planet " + IDs[idx]) };
}

///////////////////// FLEET MODULE - RES DESTRIBUTION  /////////////
var style_btn_Fund= $("<style>.btn_Fund { float:left; position: relative; top: -3px; display:none;"+
                   "border-radius: 100px;background: green;color:yellow; font-size: 6px;font-weight: bolder } "+
                    ".btn_Fund:hover{box-shadow: rgba(44, 187, 99, .2) 0 -25px 18px -14px inset,rgba(255, 255, 51, .7) 0 10px 20px}"+
                    "</style>");
$('html > head').append(style_btn_Fund);

function onFundUpgrade(idx,i){
  var needed = getResDifference(idx,i);
  var sumSpace = LEAVE_CAPACITY_FOR_DEU;
  for (let i=0;i<3;i++){
      if (needed[i] > 0) { needed[i] = 0 }
      needed[i] = (Math.ceil(Math.abs(needed[i]) /100000)*100000);
      sumSpace = sumSpace + needed[i];
  }
  var MTneeded = Math.ceil(sumSpace/MT_CAPACITY);
  console.log(MTneeded);
  var foundFlag = false;
  for (var j=0;j<Metal.length;j++){
      if (Metal[j] < needed[0]){continue; }
      if (Crystal[j] < needed[1]){continue; }
      if (Deuter[j] < needed[2]){continue; }
      if (MTsAmount[j] < MTneeded){continue; }
      foundFlag = true;
      break;
  }
  if(foundFlag){
      sendFleetMTs(IDs[j],Wsp[idx][0],Wsp[idx][1],Wsp[idx][2],needed[0],needed[1],needed[2],MTneeded ).then(function(Result){
          switch (Result){
              case 1:
                  $('#FundUpgrade_'+i+'_'+idx).css('background','white');
                  break;
              case -1:
                  $('#FundUpgrade_'+i+'_'+idx).css('background','red');
                  break;
          }
      });
  }else{ console.log('No planet with sufficient fund found')}

}

/// Add Fund button
for(let i =0; i <Buds.length;i++){
    $(Buds[i]).each(function(idx){
        if (isBuildingUpgradeble(idx,i)) { return; } //continue for jQuery loop
        let b = $(' <button type="button" class="btn_Fund" id="FundUpgrade_'+i+'_'+idx+'">↑</button> ')
        .click(function(){ onFundUpgrade(idx,i) }) ;
        $(this).children().first().before(b);

    });
}

///////////////////////////////// GUZIK TESTOWY ////////////////////
function onGuzik(){
    $(Buds).each(function(i){
        $(Buds[i]).each(function(idx){
            let lvl = $(this)[0].childNodes[0].nodeValue.trim();
            if (lvl == parseInt( $('#guzik_edit').val(),10 )){
                $(this).css("border","2px solid yellow");
            }
        })
    })
}

var PriceCostSwitch_flag = false;
function onPriceCostSwitch(){
    if (PriceCostSwitch_flag ){ $('span.opis').css("display","none"); $('button.btn_Fund').css("display","none"); }
    else { $('span.opis').css("display","table"); $('button.btn_Fund').css("display","inline"); }
    PriceCostSwitch_flag = !PriceCostSwitch_flag;

}

function Guziki(){
    let megaverseNapis = $('b').first();
    let guzik= $(' <button type="button">MARK LVL</button> ').css( "background-color", "green").click(function(){ onGuzik() }) ;
    let edit = $('<input value="22" id="guzik_edit"></input>').css({'background-color':'white','width':'30px','margin-right':'15','color':'black'});
    megaverseNapis.append(guzik).append(edit);

    let PriceCostSwitch = $(' <button type="button">TURN PRICES</button> ').css( {"background-color":"blue","color":"white","font-size":"10px"}).click(function(){ onPriceCostSwitch() }) ;
    megaverseNapis.append( PriceCostSwitch );
}

Guziki();





})();