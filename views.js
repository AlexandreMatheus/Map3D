app.progressBar = { 
	_this : this,
	show : function(){
		$(".progressBar").addClass("show");
	},
	hide: function(){
		$(".progressBar").removeClass("show");
	},
	update: function(value){
		// *80 so it fills 80% of screen at max 100%
		// change for how much it fills at max
		$(".progressBar").css({"width":value*80+"%"});
		////console.log("Progress Bar",value*100+"%");
	}

}


app.info = {
	_this : this,
	sliderState : 1,
	init : function(){
		////console.log("info initilized");
		$(".button").click(function() {
			////console.log("info next button clicked");
			if(app.currentState == 'step1')
			{
				app.go(app.go('step1-2'));
			} else {
				app.go(app.currentState.nextState);
			}
			
		});


		$(".learnMoreButton").click(function(){
			//window.open("https://cloud.google.com/anthos");
			window.location.href = "https://cloud.google.com/anthos";
		})


		$(".startOver").click(function(){
			//window.open("https://cloud.google.com/anthos");
			window.location.reload();
		})



		$(".sound").click(function(e){

			
			if (app.soundOn) {
		    	$(".soundOn").hide();
		    	$(".soundOff").show();
		   		app.soundOn = false;
		   		app.muteAll();
		   		// udpate cookie
		   		setCookie("muted",1);
		  	} else {
		    	$(".soundOn").show();
		    	$(".soundOff").hide();
		    	app.soundOn = true;
		    	app.unMuteAll();
		    	setCookie("muted",0);
		  	}
			
		});



		$(".info .iHUD .slideButton").click(function() {
			if($(".info .iHUD .console").css("width")!="0px"){
				app.info.closeConsole();
				if(app.state=="step5"){
					// fire next step
					app.go("step6");
				}
			} else {
				if(app.state=="step5"){
					app.info.openConsole();
				}
			}
		});


		$(".info .share-fb").click(function(){
			//var url = "https://www.facebook.com/sharer/sharer.php?display=popup&ref=plugin&src=share_button&t=Watch%20The%20Meg%20Eat%20Everything!&u="+_this.url+ "/videos/" + $(this).attr("data-id");
			var url = "https://www.facebook.com/sharer/sharer.php?display=popup&ref=plugin&src=share_button&t=Watch%20The%20Meg%20Eat%20Everything!&u="+ app.data.url;
			window.open(url,"Facebook Share","width=550, height=420");
		});


		$(".info .share-twitter").click(function(){
			//var url = "https://twitter.com/intent/tweet?hashtags="+_this.data.hashtags+"&text="+encodeURI(_this.data.twitterShareCopy)+"&url="+_this.url+ "/videos/" + $(this).attr("data-id");
			var url = "https://twitter.com/intent/tweet?hashtags="+ app.data.hashtags+"&text="+(app.data.twitterShareCopy)+"&url="+app.data.url;
			window.open(url,"Twitter Share","width=550, height=420");
		});



		$(".info .indicator").mousedown(function(){
			if(app.state!="step18" && app.state!="step19") { return false; }
			//console.log("mouse down on slider handle");
			document.addEventListener( 'mouseup', onSliderMouseUp, false );
			function onSliderMouseUp( event ) {
				document.removeEventListener( 'mouseup', onSliderMouseUp );
				document.removeEventListener( 'mousemove', onSliderMouseMove);
				// snap to closest

			}

			document.addEventListener( 'mousemove', onSliderMouseMove, false );
			function onSliderMouseMove( event ) {
				var mouseX = (( event.clientX / window.innerWidth )*2- 1 ) * window.innerWidth/2 +150;
				////console.log("mouse moving with slider", mouseX);
				var w = parseInt($(".info .slider .sliderBar").css("width"));
				var pos = Math.min(Math.max((mouseX)/w*100 , 0), 100); 


				if( Math.abs(pos-0) < 10 ) { app.info.updateSlider(1); }
				if( Math.abs(pos-33.3) < 10 ) { app.info.updateSlider(2); }
				if( Math.abs(pos-66.6) < 10 ) { app.info.updateSlider(3); }
				if( Math.abs(pos-100) < 10 ) { app.info.updateSlider(4); }


				//$(".slider .indicator").removeClass("pos1 pos2 pos3 pos4");
				//$(".slider .indicator").css({"left": pos+"%"})
			}

		});

		

		// iHUD console data
		app.HUDCounter=0;
		window.HUDData = setInterval(function(){

			var options = { year: 'numeric', month: 'long', day: 'numeric', time:'short' };
			var today  = new Date();
			if(app.HUDCounter==0) { text = "Transmission Started:"; color="blue"; }
			if(app.HUDCounter==1) { text = "Packets Received: " + Math.floor(Math.random()*100000); color="grey"; }
			if(app.HUDCounter==2) { text = "Scanning: " + Math.floor(Math.random()*100000); color="red"; }
			if(app.HUDCounter==3) { text = "Transmission Success"; color="green"; }
			$(".info .iHUD .consoleList").prepend("<li class='"+color+"'>" + today.toLocaleString("en-US")+"<br />"+text+"</li>");
			$(".HUD .consoleList").prepend("<li class='"+color+"'>" + today.toLocaleString("en-US")+"<br />"+text+"</li>");
			app.HUDCounter++;
			if(app.HUDCounter==4){app.HUDCounter=0;}
		},2000);

	},

	openConsole : function(){
		$(".info .iHUD .console").css({"width":"200px"});
		TweenMax.to(".info .iHUD .slideButton .slideButtonArrow",.5,{rotation:180});
	},

	closeConsole : function(){
		$(".info .iHUD .console").css({"width":"0px"});
		TweenMax.to(".info .iHUD .slideButton .slideButtonArrow",.5,{rotation:0});
	},

	updateMeter : function(meter,value){
		// set the meter request to new value
		// update the bar length
		$(".iHUD ." + meter + " .bar").css({"width":value+"%"});
		// update color based on value
		$(".iHUD ." + meter ).removeClass("red yellow green");
		if(value<=35){ $(".iHUD ." + meter ).addClass("red"); }
		if(value>35 && value<75){ $(".iHUD ." + meter ).addClass("yellow"); }
		if(value>75){ $(".iHUD ." + meter ).addClass("green"); }
	},

	show : function(state){
		//find state data
		for(i=0;i<app.data.info.steps.length;i++){
			if(app.data.info.steps[i].name==state){
				var data = app.data.info.steps[i];
				app.currentState = data;
			}
		}
		
		//console.log("show info for step",data.name);
		//load data
		$(".info .title").html(data.title);
		$(".info .text").html(data.text);
		$(".info .buttonText").html(data.buttonText);

		$(".info .button").css({opacity:0,"display":"none"});
		if(data.buttonText){
			$(".info .button").css({opacity:1,"display":"block"});
		}

		// show learn more button
		if(data.buttonText=="Learn more"){
			$(".learnMoreButton").addClass("show");
			$(".info .button").css({opacity:0,"display":"none"});
			$(".info .buttonText").css({opacity:0,"display":"block"});
			$(".info .share").addClass("show");
			$(".info .labsitEnd").show();

			$(".startOver").show();
			
		}


		// look up the step and based on type, execute show animation
		$(".info").removeClass("noBackground left top narrow medium mediumWide wide right");
		$(".info").addClass(data.style);
		// hide media unless showing
		$(".info .media").removeClass("show");
		$(".info .mediaElement").removeClass("show");
		
		if(data.media){
			////console.log(data.media)
			$(".info ."+data.media).addClass("show");
			$(".info .media").addClass("show");

			if(data.media=="slider"){
				$(".sliderText").html(data.cta);

			}
		}

		if($(".info").hasClass("noBackground")){
			$(".info").css({opacity:0});
			TweenMax.to(".info",1.2,{opacity:1,delay:.25});
		} else if ($(".info").hasClass("customBackground")){
			$(".info").css({opacity:1});
			TweenMax.to(".info",1.2,{ease: Back.easeOut.config(0.8, 0.2), onComplete:function(){
				$(".info").css({"transition": "width .25s ease-out, height .25s ease-out"});
			}});
		} else {
			$(".info").css({"opacity":1});
			if(app.state=="step7"){
				$(".info").css({"transition": "width .0s ease-out, height .0s ease-out"}); 
			}
			TweenMax.to(".info",1.2,{top:"50%",ease: Back.easeOut.config(0.8, 0.2), onComplete:function(){
				$(".info").css({"transition": "width .25s ease-out, height .25s ease-out"});
			}});
		}

	},

	hide : function(){
		// look up the step and based on type, execute hide animation
		if($(".info").hasClass("noBackground") || $(".info").hasClass("customBackground")){
			// fade it out
			TweenMax.to(".info",.5,{opacity:0});
		} else {
			// slide it out
			TweenMax.to(".info",1,{top:"200%",ease: Quad.easeIn,clearProps:"top"});
		}

	},

	subStepHide : function(step){
		// fade out content but leave the media
		TweenMax.to(".info .title",.5,{opacity:0});
		TweenMax.to(".info .text",.5,{opacity:0});
		TweenMax.to(".info .button",.2,{opacity:0});
		TweenMax.to(".info .buttonText",.2,{opacity:0});

	},

	subStepShow : function(state){
		//find state data
		for(i=0;i<app.data.info.steps.length;i++){
			if(app.data.info.steps[i].name==state){
				var data = app.data.info.steps[i];
				app.currentState = data;
			}
		}
		//console.log("show info for step",data.name);
		//load data
		$(".info .title").html(data.title);
		$(".info .text").html(data.text);
		$(".info .buttonText").html(data.buttonText);
		// look up the step and based on type, execute show animation
		$(".info").removeClass("noBackground left top narrow medium mediumWide wide right");
		$(".info").addClass(data.style);
		// fade out content but leave the media
		TweenMax.to(".info .title",.5,{opacity:1});
		TweenMax.to(".info .text",.5,{opacity:1});
		if(data.buttonText) { 
			$(".info .button").css({"display":"block"});
			TweenMax.to(".info .button",.2,{opacity:1});
			TweenMax.to(".info .buttonText",.2,{opacity:1});
		}
		
		if(!data.media){
			$(".info .media").removeClass("show");
		}

	},

	updateSlider : function(pos){
		// update the slider control to the pos 
		if(app.info.sliderState==pos)  { return false; }
		pos = parseInt(pos);
		$(".info .slider .indicator").removeClass("pos1 pos2 pos3 pos4");
		$(".info .slider .sliderBarColor").removeClass("pos1 pos2 pos3 pos4");
		$(".sliderMark").removeClass("active");

		for(i=1;i<=pos;i++){
			$(".sliderBarMarker"+i+" .sliderMark").addClass("active");
		}

		$(".info .slider .indicator").addClass("pos"+pos);
		$(".info .slider .sliderBarColor").addClass("pos"+pos);

		app.HUD.updateMeter("happiness",40+15*pos)

		// trigger the webgl aniamtions for this state
		app.webGL.updateVersionUpgradeState(pos);

		app.info.sliderState = pos;

		if(pos==4){
			app.go("step19");
		}

	}

}





app.toolTip = { 
	_this : this,
	init: function(){
		$(".tooltip").click(function() {
			//console.log("tool tip button clicked");
			
			switch(app.state){
				case "step5":
					$(".info .iHUD .slideButton").click();
					break;
				case "step8":
					var obj = app.webGL.models["building_01_primary"];
					app.webGL.upgradeBuilding(obj,2);
              		app.toolTip.hide();
              		app.go("step9");
              		break;
              	case "step9":
              		var obj = app.webGL.models["building_04_primary"];
					app.webGL.upgradeBuilding(obj,2);
              		app.toolTip.hide();
              		app.go("step10");
              		break;
              	case "step10":
              		var obj = app.webGL.models["building_02_primary"];
					app.webGL.upgradeBuilding(obj,2);
              		app.toolTip.hide();
              		app.go("step11");
              		break;
              	case "step20":
              		var m = app.webGL.models["istio_switch"];
		            TweenMax.to(m.rotation,1.0,{x:Math.PI/180*-45,ease: Back.easeOut.config(1.0, 0.8)});
		            // turn on isto layer
		            setTimeout(function(){app.webGL.models["ground_cloud_google_road_02"].visible=true;app.webGL.models["ground_cloud_google_road_01"].visible=false; app.webGL.models["police"].visible=true; app.webGL.models["light"].visible=true; app.webGL.models["light2"].visible=true; },500);
		            // show police 
		            var m = _this.models["police"];
		              
		            TweenMax.to(m.rotation,2.0,{y:Math.PI/180*45,yoyo:true, repeat:-1, repeatDelay:1.0, ease: Back.easeOut.config(1.0, 0.8)});
		            TweenMax.from(m.position,.5,{y:.1,repeat:-1, repeatDelay:4.0, ease: Bounce.easeInOut});

		            $(".istioOn").html("Istio ON");
		            $(".istioOn").addClass("active");

		            // hide tooltip
		            app.toolTip.hide();

		            // go next step
		            setTimeout(function(){ app.go("step21"); }, 2000);
              		break;
              	case "step22":
              		app.go("step23");
              		break;

              	case "step24":
              		app.go("step25");
              		break;
              	case "step26":
              		app.toolTip.hide();
              		app.webGL.scene.remove(app.webGL.models["barricade"]);
              		app.go("step27");
              		break;
              	case "step27":
					app.toolTip.hide();
					app.toolTip.hide();

              
	              var m = app.webGL.models["google_02_building_03_primary_ground_02"];
	              m.scale.y=0.0;
	              setTimeout(function(){ app.webGL.models["google_02_building_03_primary_ground_02"].visible = true;},1000);
	              TweenMax.to(m.scale,1.0,{y:1.0,ease: Back.easeOut.config(1.0, 0.8),delay:1.0});

	              var m = app.webGL.models["google_02_building_03_primary_structure_01"];
	              //m.scale.y=0.0;
	              //m.visible = true;
	              //TweenMax.to(m.scale,1.0,{ y:0.0,ease: Back.easeOut.config(1.0, 0.8),delay:0.0, onComplete: function(){ app.webGL.models["google_02_building_03_primary_structure_01"].visible=false; } });

	              var m =  app.webGL.models["google_02_building_03_primary_structure_02"];
	              //m.scale.y=0.0;
	              //m.visible = true;
	              TweenMax.to(m.scale,0.0,{y:1.0,ease: Back.easeOut.config(1.0, 0.8),delay:0.0, onComplete: function(){app.webGL.models["google_02_building_03_primary_structure_02"].visible=true; }});
	              var m =  app.webGL.models["google_02_building_03_primary_structure_03"];
	              //m.scale.y=0.0;
	              //m.visible = true;
	              TweenMax.to(m.scale,0.0,{y:1.0,ease: Back.easeOut.config(1.0, 0.8),delay:0.0, onComplete: function(){app.webGL.models["google_02_building_03_primary_structure_03"].visible=true; }});

					app.go("step28");
					break;

			}
			
		});


	},

	show : function(step,tip){
		var step = parseInt(step.replace("step",""));
		app.currentTip = tip;
		var data = app.data.tooltips[tip];
		$(".tooltip .text").html(data.text);
		$(".tooltip").removeClass("leftShort small default");
		$(".tooltip").addClass(data.style);

		
		// any special case adjsutments to positon
		var w = $(".tooltip").width()/2;
		switch(step){
			case 5:
				var top = window.innerHeight/2.0+5;
				var left = window.innerWidth/2.0 + 300; // might need a ratio here on th 270 to use as factor
				break;
			case 8:
				var pos = app.webGL.getPos("building_01_primary");
				var left = pos.x - w; 
				var top = pos.y -10; 
				break;
			case 9:
				var pos = app.webGL.getPos("building_04_primary");
				var left = pos.x - w - 20; 
				var top = pos.y - 100; 
				break;
			case 10:
				var pos = app.webGL.getPos("building_02_primary");
				var left = pos.x - w; 
				var top = pos.y - 40; 
				break;
			case 11:
				var pos = app.webGL.getPos("building_04_primary");
				var left = pos.x- w; 
				var top = pos.y - 80; 

				break;
			case 12:
				var pos = app.webGL.getPos("building_02_primary");
				var left = pos.x - w; 
				var top = pos.y - 80; 

				break;

			case 14:
				var pos = app.webGL.getPos("connector_road_02");
				var left = pos.x - w; 
				var top = pos.y - 130; 

				break;
			case 15:
				var pos = app.webGL.getPos("connector_road_01");
				var left = pos.x - w; 
				var top = pos.y - 130; 

				break;

			case 16:
				var pos = app.webGL.getPos("building_02_primary");
				var left = pos.x - w; 
				var top = pos.y - 40; 
				break;

			case 20:
				var pos = app.webGL.getPos("istio");
				var left = pos.x +60; 
				var top = pos.y +40; 

				break;

			case 22:
				var pos = app.webGL.getPos("google_building_03_primary");
				var left = pos.x - w; 
				var top = pos.y -20; 
				break;

			case 23:
				var pos = app.webGL.getPos("barricade");
				var left = pos.x - w; 
				var top = pos.y -140; 
				break;

			case 24:
				var pos = app.webGL.getPos("google_building_03_primary");
				var left = pos.x - w; 
				var top = pos.y -80; 
				break;

			case 26:
				var pos = app.webGL.getPos("barricade");
				var left = pos.x- w; 
				var top = pos.y -140; 
				break;

			case 27:
				var pos = app.webGL.getPos("google_02_building_03_primary");
				var left = pos.x - w; 
				var top = pos.y -80; 
				break;


		}

		$(".tooltip").css({"top":top+"px","left":left + "px"});

		$(".tooltip").addClass("show");
	},
	hide: function(){
		app.currentTip = null;
		$(".tooltip").removeClass("show");
		//setTimeout(function(){$(".tooltip").removeClass("show");},1000);//just to be sure
	}

	
}




app.HUD = { 
	_this : this,
	init : function(){
		$(".HUD .slideButton").click(function() {
			if($(".HUD .console").css("width")!="0px"){
				app.HUD.closeConsole();
			} else {
				app.HUD.openConsole();
			}
		});
	},
	show : function(step,tip){
		
		$(".HUD").addClass("show");
	},
	hide: function(){
		$(".HUD").removeClass("show");
	},

	openConsole : function(){
		$(".HUD .console").css({"width":"200px"});
		TweenMax.to(".HUD .slideButton .slideButtonArrow",.5,{rotation:180});
	},

	closeConsole : function(){
		$(".HUD .console").css({"width":"0px"});
		TweenMax.to(".HUD .slideButton .slideButtonArrow",.5,{rotation:0});
	},

	updateMeter : function(meter,value){
		// set the meter request to new value
		// update the bar length
		//alert($(".HUD ." + meter + " .bar").css("width"));
		var w = Math.round($(".HUD ." + meter + " .bar").width() / $(".HUD ." + meter + " .bar").parent().width() * 100);
		//alert(w + " ," + value);
		if(w==value) { return false;}
		
		$(".HUD ." + meter + " .bar").css({"width":value+"%"});
		// update color based on value
		$(".HUD ." + meter ).removeClass("red yellow green");
		if(value<=35){ $(".HUD ." + meter ).addClass("red"); }
		if(value>35 && value<75){ $(".HUD ." + meter ).addClass("yellow"); }
		if(value>75){ $(".HUD ." + meter ).addClass("green"); }

		// call attention to the meter?
		// make the meter updated pulse
		var obj = $(".HUD ." + meter);
		CustomWiggle.create("myWiggle", {wiggles:10, type:"easeOut"});
		//now use it in an ease. "rotation" will wiggle to 30 and back just as much in the opposite direction, ending where it began. 
		TweenMax.to(obj, 2, {y:3, scaleX:1.01, ease:"myWiggle"});

	},

	updateStage : function(stageStep){
		// set the meter request to new value
		// update the bar length
		$(".HUD .stageNumber").removeClass("active");
		for(i=1;i<=parseInt(stageStep);i++){
			$(".HUD .stagesNumber"+i+" .stageNumber").addClass("active");
		}
		$(".HUD .stagesBar").css({"width": Math.round(parseInt(stageStep-1)/2*100)-2 +"%"})
	}
	
}
