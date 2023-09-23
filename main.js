app={}
app.init = function(){
	_this=this;

	this.state = "loading";
	this.progressBar.show();
	console.log(this.data.site.title, "v" + this.data.site.version + " " + this.data.site.langauge_code);

	this.queryParams = $.getQueryParameters();
	if(this.queryParams.page) { this.page = this.queryParams.page;}
	
	getSpecs(this);

	if( ( this.browser.name=="Chrome" && this.browser.version<20 ) || ( this.browser.name=="IE" && this.browser.version<11 ) ||  ( this.browser.name=="MSIE" && this.browser.version<11 ) ){
	}

	if(this.isMobile){
		$("body").addClass("mobile");

	}

	var page="step1"; // used for jumping to a page during dev/debug	

	this.checkPreloadComplete = function(){
		console.log("CHECKING IF READY");
		if(!app.modelsLoaded) { return null;}
		app.webGL.show();
		if( page ) { app.go ( page );} else { app.go("step1");}
	}

	
	app.webGL.init();
	app.info.init();
	app.HUD.init();
	app.toolTip.init();

	app.sounds=[];
	$.each(app.data.soundAssets,function(i, s){
		var sound = new Howl({
		  src: s.file,
		  loop: s.loop,
		  volume: s.volume,
		  html5: s.html5,
		  onend: function(o) {},
		  name: s.name
		});
		app.sounds[s.name] = sound;
		app.sounds[s.name].volume(s.volume);
		app.sounds[s.name].maxVolume=s.volume;
	});

	app.muteAll = function(ignoreGlobalSoundState){
		console.log("mute all ");
		clearInterval(window.muteInterval);
		var v = Howler.volume();
		window.muteInterval=setInterval(function(){
			v-=.1;
			Howler.volume(v);
			if(v<=0.0){ Howler.volume(0.0); clearInterval(window.muteInterval);}
		},50);

		if( !ignoreGlobalSoundState ) { _this.soundOn = false; }
	}

	app.unMuteAll = function(ignoreGlobalSoundState){
		console.log("unMute all ");
		clearInterval(window.muteInterval);
		var v = Howler.volume();
		window.muteInterval=setInterval(function(){
			v+=.1;
			Howler.volume(v);
			if(v>=1){ Howler.volume(1); clearInterval(window.muteInterval);}
		},50);

		if( !ignoreGlobalSoundState ) { _this.soundOn = true; }
	}

	if(!this.isMobile){
		app.sounds["ambient"].play();
		app.soundOn=true;
	}
	
	$("body").click(function(){
		app.sounds["click"].play();
	});

	$(".background").click(function(){
		app.sounds["click"].play();
	});

	$("#webgl").click(function(){
		app.sounds["click"].play();
	});
}


app.trackEvent = function(e){
	dataLayer.push(e);
}

window.addEventListener( 'resize', onWindowResize, false );
function onWindowResize() {
	if(app.currentTip){
		app.toolTip.show(app.state,app.currentTip);
	}
}

app.go = function(state){
	if(this.state==state) { return false; }

	switch(state){
		case "step1":
			app.info.hide(this.state); 
			app.webGL.hideAllCircle();
			setTimeout(function(){
				app.info.show(state);
			},4000); // show new state info
			app.webGL.animateState(state);
			this.state = state;
			break;
		case "step1-2":
			app.info.hide(state); 
			app.webGL.animateState(state);
			app.webGL.showAllCircle();
			this.state = state;
			break;

		case "step2":
			app.webGL.hideAllCircle();
			app.info.hide(); 
			setTimeout(function(){
				app.info.show(state);
			},1500); // show new state info
			app.webGL.animateState(state);
			this.state = state;
			break;

		case "step3":
			app.info.hide();
			setTimeout(function(){
				app.info.show(state);
			},1500); // show new state info
			this.state = state;
			app.webGL.animateState(state);
			break;

		case "step4":
			app.info.hide();
			setTimeout(function(){
				app.info.show(state);
			},700); // show new state info
			this.state = state;
			app.webGL.animateState(state);
			
			// aniamte timeline on a loop for a while
			app.meterCounter=0;
			app.meterLoop = setInterval(function(){
				if(app.meterCounter>=30){ clearInterval(app.meterLoop); return false;}
				app.info.updateMeter("happiness",Math.random()*100);
				app.info.updateMeter("security",Math.random()*100);
				app.info.updateMeter("population",Math.random()*100);
				app.meterCounter++;
				
			},1800);


			break;
		case "step5":
			app.info.subStepHide(this.state); // hide current state version of info
			setTimeout(function(){
				app.info.subStepShow(state);
				app.info.openConsole();
				app.toolTip.show(state,0); // 0 is the index of the tooltip
			},500); // show new state info
			this.state = state;
			app.webGL.animateState(state);
			break;
		case "step6":
			app.toolTip.hide();
			app.info.subStepHide(this.state); // hide current state version of info
			setTimeout(function(){
				app.info.subStepShow(state);
				app.info.closeConsole(); // make sure closed
			},500); // show new state info
			this.state = state;
			app.webGL.animateState(state);
			break;

		case "step7":
			app.info.hide();
			setTimeout(function(){
				app.info.show(state);
			},1500); // show new state info
			this.state = state;
			app.webGL.animateState(state);

			

			break;

		case "step8":
			app.info.hide();
			app.HUD.updateMeter("happiness",15);
			app.HUD.updateMeter("security",15);
			app.HUD.updateMeter("population",15);
			setTimeout(function(){
				app.info.show(state);
				app.HUD.show();
				app.HUD.updateMeter("happiness",15);
				app.HUD.updateMeter("security",15);
				app.HUD.updateMeter("population",15);
				app.HUD.updateStage(1);
			},1500); // show new state info

			setTimeout(function(){
				app.toolTip.show(state,1); //1 is msg index from data.js
			},3500);
			app.webGL.animateState(state);
			this.state = state;
			break;

		case "step9":
			//app.info.hide();
			
			app.HUD.updateMeter("happiness",30);
			setTimeout(function(){
				app.toolTip.show(state,1); //1 is msg index from data.js
			},500);
			
			this.state = state;
			break;

		case "step10":
			//app.info.hide();
			
			app.HUD.updateMeter("happiness",40);
			setTimeout(function(){
				app.toolTip.show(state,1); //1 is msg index from data.js
			},500);
			
			this.state = state;
			break;

		case "step11":
			app.info.hide();
			app.HUD.updateMeter("happiness",50);
			setTimeout(function(){
				app.info.show(state);
				app.HUD.show();
				
			},1500); // show new state info
			setTimeout(function(){
				app.toolTip.show(state,2);
			},3500);
			this.state = state;
			app.webGL.animateState(state);
			//tmp
            app.webGL.upgradeBuilding(app.webGL.models["building_02_primary"],2);
            app.webGL.upgradeBuilding(app.webGL.models["building_01_primary"],2);
            //app.webGL.upgradeBuilding(app.webGL.models["building_03_primary"],2);
            app.webGL.upgradeBuilding(app.webGL.models["building_04_primary"],2);
			break;

		case "step12":
			//app.info.hide();
			app.HUD.updateMeter("population",30);
			app.info.show(state);
			
			setTimeout(function(){
				app.toolTip.show(state,2);
			},500);
			this.state = state;
		
			break;

		case "step13":
			//app.info.hide();
			app.HUD.updateMeter("population",50);
			app.info.show(state);
			
			setTimeout(function(){
				//app.toolTip.show(state,2);
			},500);
			this.state = state;
		
			break;

		case "step14":
			app.HUD.updateMeter("happiness",50); // tmp
			app.HUD.updateMeter("population",50); // tmp
			

			app.info.hide();
			setTimeout(function(){
				app.info.show(state);
				app.toolTip.show(state,3);
				app.HUD.show();

			},500); // show new state info
			this.state = state;
			app.webGL.animateState(state);
			break;
		case "step15":
			setTimeout(function(){
				app.toolTip.show(state,3);
				
			},500); // show new state info
			this.state = state;
			app.webGL.animateState(state);
			break;

		case "step15b":
			app.toolTip.hide();
			app.info.hide();
			setTimeout(function(){
				app.info.show(state);
			},500); // show new state info
			this.state = state;
			app.webGL.animateState(state);
			break;

		case "step16":
			app.toolTip.hide();
			app.info.hide();
			setTimeout(function(){
				app.toolTip.show(state,4);
				app.info.show(state);
				//app.HUD.show();
			},500); // show new state info
			this.state = state;
			app.webGL.animateState(state);

			break;

		case "step17":
			setTimeout(function(){
				app.info.subStepShow(state);
			},500); 
			this.state = state;
			app.webGL.animateState(state);

			break;

		case "step18":
			app.info.hide();
			setTimeout(function(){
				//app.toolTip.show(state,4);
				app.info.show(state);
				app.info.updateSlider(1);
				app.HUD.show();
			},500); // show new state info
			this.state = state;
			app.webGL.animateState(state);

			

			break;

		case "step19":
			//alert("here");
			setTimeout(function(){
				app.info.subStepShow(state);
			},1000); 
			this.state = state;
			break;

		case "step20":
			app.info.hide();
			setTimeout(function(){
				
				app.info.show(state);
				app.HUD.updateStage(2);
				app.HUD.show();
			},500); // show new state info

			setTimeout(function(){
				app.toolTip.show(state,5);
			},4000);
			this.state = state;
			app.webGL.animateState(state);
			break;
		case "step21":
			app.webGL.animateState(state);
			app.HUD.updateMeter("happiness",100); 
			app.HUD.updateMeter("population",80);
			app.HUD.updateMeter("security",50); 
			this.state = state;
			$(".istioOn").html("Istio ON");
		    $(".istioOn").addClass("active");
			app.go("step22");
			break;

		case "step22":
			app.toolTip.hide();
			app.info.hide();
			setTimeout(function(){
				app.toolTip.show(state,10);
				app.info.show(state);
				app.HUD.updateStage(3);
				app.HUD.show();
				
			},500); // show new state info

			app.webGL.animateState(state);
			this.state = state;
			break;

		case "step23":
			app.toolTip.hide();
			setTimeout(function(){
				app.info.subStepShow(state);
				app.toolTip.show(state,6);
			},1000); 
			app.webGL.animateState(state);
			app.HUD.updateMeter("happiness",100); 
			app.HUD.updateMeter("population",80);
			app.HUD.updateMeter("security",100); 
			this.state = state;
			break;

		case "step23b":
			app.toolTip.hide();
			setTimeout(function(){
				app.info.subStepShow(state);
				app.toolTip.show(state,6);
			},1000); 
			app.webGL.animateState(state);
			app.HUD.updateMeter("happiness",100); 
			app.HUD.updateMeter("population",80);
			app.HUD.updateMeter("security",100); 
			this.state = state;
			break;

		case "step24":
			app.info.hide(this.state);
			setTimeout(function(){
				
				app.info.show(state);
				app.HUD.updateStage(3);
				app.HUD.show();
				app.toolTip.show(state,7);
			},500); // show new state info
			app.webGL.animateState(state);
			this.state = state;
			break;

		case "step25":
			app.toolTip.hide();
			setTimeout(function(){
				app.info.subStepShow(state);
			},1000); 
			app.webGL.animateState(state);
			app.HUD.updateMeter("happiness",100); 
			app.HUD.updateMeter("population",100);
			app.HUD.updateMeter("security",100); 
			this.state = state;
			//app.go("step26");
			break;

		case "step26":
			app.info.hide(this.state);
			setTimeout(function(){
				
				app.info.show(state);
				app.HUD.updateStage(3);
				app.HUD.show();
				app.toolTip.show(state,8);
			},500); // show new state info
			app.webGL.animateState(state);
			this.state = state;
			break;

		case "step27":
			app.toolTip.hide();
			setTimeout(function(){
				app.info.subStepShow(state);
				app.toolTip.show(state,9);
			},1000); 
			app.webGL.animateState(state);
			this.state = state;
			break;

		case "step28":
			app.toolTip.hide();
			setTimeout(function(){
				app.info.subStepShow(state);
			},1000); 
			app.webGL.animateState(state);
			this.state = state;
			break;

		case "step29":
			app.toolTip.hide();
			app.info.hide(this.state);
			setTimeout(function(){
				app.info.show(state);
				app.HUD.updateStage(3);
				//app.HUD.show();
				app.HUD.updateMeter("happiness",100); 
				app.HUD.updateMeter("population",100);
				app.HUD.updateMeter("security",100); 
			},500); // show new state info
			app.webGL.animateState(state);
			this.state = state;
			break;
			
	}

	setTimeout(function(){app.progressBar.hide();},500);
}



