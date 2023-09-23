app.webGL = {
    _this : this,
    statsEnabled:false,
    models:[],
    textures:[],
    objects:[],
    mouse : new THREE.Vector2(),
    raycaster : new THREE.Raycaster(),
    draggingObject : null,
    cloneRoad1 : null,
    cloneRoad2 : null,
    drawingRoad1 : false,
    drawingRoad2 : false,
    draggingBarricade : false,
    circleInformationRef: [],
    init : function(){
  
          // set up scene
          this.canvas= document.getElementById("webgl");
          this.camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 10, 500 );
          this.camera.position.set(-15,15,10);
          this.camera.lookAt(new THREE.Vector3(0,0,0));
          this.scene = new THREE.Scene();
          this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true , antialias: true });
          this.renderer.setPixelRatio( window.devicePixelRatio );
          this.renderer.setSize( window.innerWidth, window.innerHeight );
  
          this.target = new THREE.Object3D();
          this.target.position.set(5,15,-40);
          this.scene.add(this.target);
  
          // STATS
          if ( this.statsEnabled ) {
            this.stats = new Stats();
            $("body").append( this.stats.dom );
          }
  
          this.manager = new THREE.LoadingManager();
          this.manager.onProgress = function ( item, loaded, total ) {
            app.progressBar.update(loaded/total);
          };
  
          this.manager.onLoad = function ( ) {
            app.webGL.addObjects();
  
            app.modelsLoaded = true;
            app.checkPreloadComplete();
  
          };
          var loader = new THREE.FBXLoader(this.manager);
          $.each(app.data.models,function(i,m){
            loader.load( m.file, function ( object ) {
              if(m.name=="bamf"){
                app.webGL.models["bamf"] = object;
                
              }
              $.each(object.children,function(i,o){
                      o.name = o.name.replace(/\_$/, "");
                      app.webGL.models[o.name] = o;
                      app.webGL.objects.push(o);
                      $.each(o.children,function(i,c){
                        c.name = c.name.replace(/\_$/, "");
                        app.webGL.models[c.name] = c;
                        app.webGL.objects.push(c);

                        if(c.name=="ground_cloud_google_bottom_02"){
                            $.each(c.children,function(i,cc){
                                if(cc.name == "ground_cloud_google_bottom_02_monorail"){
                                  app.webGL.models["ground_cloud_google_train"] = cc;
                                }
                            });
                        }

                        if(c.name=="ground_cloud_generic_bottom_02"){
                            $.each(c.children,function(i,cc){
                                if(cc.name == "ground_cloud_generic_bottom_02_monorail"){
                                  app.webGL.models["ground_cloud_generic_train"] = cc;
                                }
                            });
                        }
                      });

                      o2 = o.clone();
                      app.webGL.models["google_" + o2.name] = o2;
                      app.webGL.objects.push(app.webGL.models["google_" + o2.name]);
                      
                      $.each(o2.children,function(i,c){
                        c.name = c.name.replace(/\_$/, "");
                        app.webGL.models["google_" + c.name] = c;
                      });

                      if(o2.name=="building_03_primary"){
                          o2_2 = o.clone();
                          app.webGL.models["google_02_" + o2_2.name] = o2_2;
                          app.webGL.objects.push(app.webGL.models["google_" + o2_2.name]);
                          
                          $.each(o2_2.children,function(i,c){
                            c.name = c.name.replace(/\_$/, "");
                            app.webGL.models["google_02_" + c.name] = c;

                          });
                      }
  
                      o3 = o.clone();
                      app.webGL.models["generic_" + o3.name] = o3;
                      app.webGL.objects.push(app.webGL.models["generic_" + o3.name]);
                      
                      $.each(o3.children,function(i,c){
                        c.name = c.name.replace(/\_$/, "");
                        app.webGL.models["generic_" + c.name] = c;
                      });
                    });
            });
          });
  
          var loader = new THREE.TextureLoader(this.manager);
          $.each(app.data.textures,function(i,t){
            loader.load( t.file, function (object) {
                  app.webGL.textures[t.name] = object;
                });
          });
  
          var light = new THREE.AmbientLight( 0xffffff,.75 );
          this.scene.add( light );
  
          var light = new THREE.DirectionalLight( 0xffffff,.45 );
          this.scene.add( light );
          light.position.set(30,150,200);
  
          this.render();
  
        },
  
        show : function(){
          setTimeout(function(){ $("#webgl").addClass("show");},1000);
        },
  
        render : function(){
          _this = app.webGL;
        
        var scene = _this.scene;
        var camera = _this.camera;
        var renderer = _this.renderer;
        var target = _this.target;
  
        if( scene &&  camera ) {  
          camera.lookAt(target.position);
          renderer.render(scene,camera ); 
        }
        if ( _this.statsEnabled ) { _this.stats.update(); }
        
        requestAnimationFrame(_this.render); 
  
      },
  
      createCircleIndication: function (x, y, z){
        var geometry = new THREE.CircleGeometry( 1, 20 ); 
        var material = new THREE.MeshBasicMaterial( { color: 0x000000 } ); 
        var circle = new THREE.Mesh( geometry, material ); 
        circle.position.set(x-5,10,z+5);
        circle.rotation.y= 150;
        app.webGL.circleInformationRef.push(circle);
        
        return circle;
      },

      hideAllCircle: function (){
        app.webGL.circleInformationRef.forEach((e) => e.visible = false);
      },

      showAllCircle: function (){
        app.webGL.circleInformationRef.forEach((e) => setTimeout(function(){e.visible=true;},4500));
      },

      createObject: function (
        cityName,
        objectName,
        position,
        rotation,
        scale,
        visible,
        hasIndication,
        stage
      ){
        var city  = _this.models[cityName];
        var m = _this.models[objectName];

        if (position) {
          console.log('position ' + position);
          m.position.set ( position.x, position.y , position.z);
        }
        
        if (!!rotation) {
          console.log('rotation ' + rotation);
          m.rotation.y = Math.PI/180 * rotation;
        }
        
        if (scale) {
          console.log('scale ' + position);
          m.scale.set( scale.x, scale.y, scale.z);
        }

        if (!visible) {
          m.visible = false;
        }

        if (stage) {
          m.currentStage = 1;
        }

        if (hasIndication) {
          city.add(app.webGL.createCircleIndication(position.x, position.y, position.z));
        }
        
        city.add(m);
      },
  
      addObjects : function(){
       _this = app.webGL;
        var masterTexture = new THREE.MeshLambertMaterial({map: _this.textures["texture_master"]});
        for (var key in _this.models) {
          var m = _this.models[key];
          m.traverse( function ( child ) {
            if ( child.isMesh ) {
              child.material = masterTexture;
            }
          });
  
          var stage = m.name.substring(m.name.length-2);
          if(stage=="02" || stage=="03" ){ m.visible=false; }
        };

        var geometry = new THREE.SphereGeometry( 1,30,30  );
        for(i=0;i<geometry.vertices.length;i++){
            geometry.vertices[i].z-=.3;
        }
  
        var sphereGeometry = new THREE.SphereGeometry(.8,30,30);
        for(i=0;i<sphereGeometry.vertices.length;i++){
            sphereGeometry.vertices[i].z+=.4;
            sphereGeometry.vertices[i].y+=.1;
        }
        var material = new THREE.MeshLambertMaterial( { color: 0xffffff }  );
        var ball = new THREE.Mesh(sphereGeometry, material);
            
        geometry.merge(ball.geometry, ball.matrix);
        geometry.normalize();
        geometry.computeFaceNormals();
  
        var m = new THREE.Mesh(geometry,material);
        _this.models["cloud1"] = m;
        m.scale.set(10.0,9.0,10.0);
        m.position.set(80,10,10);
        m.rotation.y = Math.PI/180*-90;
        app.webGL.scene.add(m);
  
        var m = _this.models["cloud1"].clone();
        _this.models["cloud2"] = m;
        m.scale.set(8.0,7.0,8.0);
        m.position.set(20,-10,50);
        m.rotation.y = Math.PI/180*70;
        app.webGL.scene.add(m);
  
        var m = _this.models["cloud1"].clone();
        _this.models["cloud3"] = m;
        m.scale.set(10.0,9.0,10.0);
        m.position.set(-50,-30,10);
        m.rotation.y = Math.PI/180*-40;
        app.webGL.scene.add(m);
  
        var m = _this.models["cloud1"].clone();
        _this.models["cloud4"] = m;
        m.scale.set(7.0,7.0,7.0);
        m.position.set(-70,5,0);
        m.rotation.y = Math.PI/180*100;
        app.webGL.scene.add(m);
  
        var m = _this.models["cloud1"].clone();
        _this.models["cloud5"] = m;
        m.scale.set(3.0,3.0,3.0);
        m.position.set(-50,5,40);
        m.rotation.y = Math.PI/180*100;
        app.webGL.scene.add(m);
  
        var m = _this.models["cloud1"].clone();
        _this.models["cloud6"] = m;
        m.scale.set(4.0,4.0,4.0);
        m.position.set(50,15,20);
        m.rotation.y = Math.PI/180*100;
        app.webGL.scene.add(m);
  
        var m = _this.models["ground_city"];
        m.rotation.y=Math.PI/180*45;
        _this.models["ground_city_top"].position.y=-.3; 
        _this.models["ground_cloud_google_locators"].visible=false; 
        _this.models["ground_city_road"].visible=false;
  
        _this.scene.add(m);

        var m  = _this.models["ground_cloud_generic"];
        m.position.set(-70.5,0,-80);
        m.rotation.y=Math.PI/180*45;
        _this.models["ground_cloud_generic_top"].position.y=-.3; 
        _this.scene.add(m);
         
        var m  = _this.models["ground_cloud_google"];
        m.position.set(69.5,0,-78.5);
        m.rotation.y=Math.PI/180*45;
        _this.models["ground_cloud_google_top"].position.y=-.3; 
        _this.scene.add(m);
  
        // add bamf
        var mb = _this.models["bamf"];
        mb.scale.set(.5,.5,.5);
        mb.position.y+=35;
        mb.rotation.y=Math.PI/180*-45;
        m.add(mb);
        mb.visible = false;

       var city = _this.models["ground_city"];
      //INITIATE NEEDED
       app.webGL.createObject("ground_city", "building_01_primary", {x: 25, y: 0, z: -25}, 0, {x: 1.0, y: 1.0, z: 1.0}, false, true, 1);
       setTimeout(function(){app.webGL.models["building_01_primary"].visible=true;},1300);
       var m2 = _this.models["building_01_primary_structure_01"];
       m2.scale.y=0.1;
       CustomBounce.create("myBounce", {strength:0.2});
       TweenMax.to(m2.scale,1,{y:1.0,ease: Back.easeOut.config(1.0, 0.9),delay:1.3});
  
       app.webGL.createObject("ground_city", "building_02_primary", {x: 15, y: 0, z: -25}, -90, {x: 1.0, y: 1.0, z: 1.0}, false, true, 1);
       setTimeout(function(){app.webGL.models["building_02_primary"].visible=true;},1600);
       var m2 = _this.models["building_02_primary_structure_01"];
       m2.scale.y=0.00001;
       CustomBounce.create("myBounce", {strength:0.3});
       TweenMax.to(m2.scale,1,{y:1.0,ease: Back.easeOut.config(1.0, 0.8),delay:1.6});
      
       app.webGL.createObject("ground_city", "building_03_primary", {x: -3.3333, y: 0, z: -21.666}, -90, {x: 1.0, y: 1.0, z: 1.0}, false, true, 1);
       setTimeout(function(){app.webGL.models["building_03_primary"].visible=true;},1700);
       var m2 = _this.models["building_03_primary_structure_01"];
       m2.scale.y=0.00001;
       CustomBounce.create("myBounce", {strength:0.3});
       TweenMax.to(m2.scale,1,{y:1.0,ease: Back.easeOut.config(.5, 0.9),delay:1.7});
  
       app.webGL.createObject("ground_city", "building_04_primary", {x: 20, y: 0, z: -6.6666}, -90, {x: 1.0, y: 1.0, z: 1.0}, false, true, 1);
       setTimeout(function(){app.webGL.models["building_04_primary"].visible=true;},1800);
       var m2 = _this.models["building_04_primary_structure_01"];
       m2.scale.y=0.00001;
       CustomBounce.create("myBounce", {strength:0.3});
       TweenMax.to(m2.scale,1,{y:1.0,ease: Back.easeOut.config(1.0, 0.8),delay:1.8});

       app.webGL.createObject("ground_city", "building_01_alternate", {x: -8.3, y: 0, z: 25}, 0, {x: 1.0, y: 1.0, z: 1.0}, false, true, 1);
       setTimeout(function(){app.webGL.models["building_01_alternate"].visible=true;},2000);
       var m2 = _this.models["building_01_alternate_structure_01"];
       m2.scale.y=0.00001;
       CustomBounce.create("myBounce", {strength:0.3});
       TweenMax.to(m2.scale,1,{y:1.0,ease: Back.easeOut.config(1.0, 0.9),delay:2.5});
  
       app.webGL.createObject("ground_city", "building_02_alternate", {x: 1.666, y: 0, z: -8.333}, 0, {x: 1.0, y: 1.0, z: 1.0}, false, true, 1);
       setTimeout(function(){app.webGL.models["building_02_alternate"].visible=true;},1800);
       var m2 = _this.models["building_02_alternate_structure_01"];
       m2.scale.y=0.00001;
       CustomBounce.create("myBounce", {strength:0.3});
       TweenMax.to(m2.scale,1,{y:1.0,ease: Back.easeOut.config(1.0, 0.8),delay:1.8});
  
       app.webGL.createObject("ground_city", "building_03_alternate", {x: 1.666, y: 0, z: 6.66666}, -90, {x: 1.0, y: 1.0, z: 1.0}, false, true, 1);
       setTimeout(function(){app.webGL.models["building_03_alternate"].visible=true;},1900);
       var m2 = _this.models["building_03_alternate_structure_01"];
       m2.scale.y=0.00001;
       CustomBounce.create("myBounce", {strength:0.3});
       TweenMax.to(m2.scale,1,{y:1.0,ease: Back.easeOut.config(1.0, 0.9),delay:1.9});

       app.webGL.createObject("ground_city", "building_04_alternate", {x: -26.666, y: 0, z: 0}, -90, {x: 1.0, y: 1.0, z: 1.0}, false, true, 1);
       setTimeout(function(){app.webGL.models["building_04_alternate"].visible=true;},2100);
       var m2 = _this.models["building_04_alternate_structure_01"];
       _this.models["building_04_alternate_structure_02"].visible=false;
       m2.scale.y=0.00001;
       CustomBounce.create("myBounce", {strength:0.3});
       TweenMax.to(m2.scale,1,{y:1.0,ease: Back.easeOut.config(1.0, 0.9),delay:2.1});
      //END NEEDED
        
       _this.models["ground_city_road"].position.y=-.3;
       setTimeout(function(){ _this.models["ground_city_road"].visible=true;},0);

        _this.models["ground_cloud_generic_road"].visible=false;
        _this.models["ground_cloud_generic_upgrade"].visible=false;
        _this.models["ground_cloud_generic_locators"].visible=false;
        _this.models["ground_cloud_google_road_01"].visible=false;
        _this.models["ground_cloud_google_road_02"].visible=false;
        _this.models["ground_cloud_google_upgrade"].visible=false;
        _this.models["connector_road_01"].visible=false;
        _this.models["connector_bridge_01"].visible=false;
        _this.models["connector_road_02"].visible=false;
        _this.models["connector_bridge_02"].visible=false;
        _this.models["ground_city_upgrade"].visible=false;
        
       app.webGL.cloneRoad1 = app.webGL.models["connector_road_02"].clone();
       c = app.webGL.cloneRoad1;
       var t = new THREE.MeshLambertMaterial({map: _this.textures["texture_master"], transparent:true, opacity:.3});
       c.traverse( function ( child ) {
              if ( child.isMesh ) { child.material=t; }
       });
       c.visible=false;
       var city  = _this.models["ground_city"];
       city.add(c); 
  
       app.webGL.cloneRoad2 = app.webGL.models["connector_road_01"].clone();
       c = app.webGL.cloneRoad2;
       var t = new THREE.MeshLambertMaterial({map: _this.textures["texture_master"], transparent:true, opacity:.3});
       c.traverse( function ( child ) {
              if ( child.isMesh ) { child.material=t; }
       });
       c.visible=false;
       var city  = _this.models["ground_city"];
       city.add(c); 

        var m = _this.models["istio"];
        m.position.set ( 85, -20 , -110);
        m.rotation.y = Math.PI/180*-45;
  
        var pointLight = new THREE.PointLight(0xffffff,.05);
        pointLight.position.set(2,2,10);
        m.add(pointLight);
        m.scale.set( 2.0,2.0,2.0);
        m.visible = false;
        app.webGL.scene.add(m);
        var m = _this.models["istio_switch"];
        m.rotation.x=Math.PI/180*45;
  
        var city  = _this.models["ground_cloud_google"];
        var m = _this.models["police"];
        m.position.set ( 5, 0 , -4.6);
        m.rotation.y = Math.PI/180*-45;
        m.scale.set( 2.0,2.0,2.0);
        m.visible = false;
        city.add(m);

        var city  = _this.models["ground_cloud_google"];
        var m = _this.models["light"];
        m.position.set ( 4, 0 , 10);
        m.rotation.y = Math.PI/180*-90;
        m.scale.set( 1.0,1.0,1.0);
        m.visible = false;
        city.add(m);

        var m = _this.models["light"].clone();
        _this.models["light2"] = m;
        m.position.set ( 0, 0 , -4);
        m.rotation.y = Math.PI/180*-90;
        m.scale.set( 1.0,1.0,1.0);
        m.visible = false;
        city.add(m);
  
        var m = _this.models["barricade"];
        m.position.set (70.5, 2 , -98.5);
        m.rotation.y = Math.PI/180*-45;
        m.scale.set( 2.0,2.0,2.0);
        m.visible = false;
        app.webGL.scene.add(m);
        var m2 = m.clone();
        var t = new THREE.MeshLambertMaterial({map: _this.textures["texture_master"], transparent:true, opacity:.5});
        m2.traverse( function ( child ) {
                if ( child.isMesh ) { child.material=t; }
        });
        m2.position.set(7,1,-1);
        m2.rotation.y = Math.PI/180*-90;
        city.add(m2);
        m2.visible = false;
        app.webGL.models["barricade_target"] = m2;

        var city = _this.models["ground_city"];
        var m = _this.models["car_01"];
        var t = new THREE.MeshPhongMaterial({map: _this.textures["car_blue"]});
        m.traverse( function ( child ) {
                if ( child.isMesh ) { child.material=t; }
        });
        m.visible = false;
        city.add(m);
        app.webGL.animateCar(m,38.0);

        var m = _this.models["car_01"].clone();
        _this.models["car_01_02"] = m;
        var t = new THREE.MeshPhongMaterial({map: _this.textures["car_red"]});
        m.traverse( function ( child ) {
                if ( child.isMesh ) { child.material=t; }
        });
        m.visible = false;
        city.add(m);
        app.webGL.animateCar(m,48.0);

        var m = _this.models["car_01"].clone();
        _this.models["car_01_03"] = m;
        m.scale.set( 1.0,1.0,1.0);
        var t = new THREE.MeshPhongMaterial({map: _this.textures["car_green"]});
        m.traverse( function ( child ) {
                if ( child.isMesh ) { child.material=t; }
        });
        m.visible = false;
        city.add(m);
        app.webGL.animateCar(m,58.0);
  
        var m = _this.models["car_01"].clone();
        _this.models["car_01_04"] = m;
        var t = new THREE.MeshPhongMaterial({map: _this.textures["car_yellow"]});
        m.traverse( function ( child ) {
                if ( child.isMesh ) { child.material=t; }
        });
        m.visible = false;
        city.add(m);
        app.webGL.animateCar(m,68.0);
  
        var m = _this.models["car_02"];
        var t = new THREE.MeshPhongMaterial({map: _this.textures["car_blue"]});
        m.traverse( function ( child ) {
                if ( child.isMesh ) { child.material=t; }
        });
        m.visible = false;
        city.add(m);
        app.webGL.animateCar(m,0.0);
  
        var m = _this.models["car_02"].clone();
        _this.models["car_02_02"] = m;
        var t = new THREE.MeshPhongMaterial({map: _this.textures["car_red"]});
        m.traverse( function ( child ) {
                if ( child.isMesh ) { child.material=t; }
        });
        m.visible = false;
        city.add(m);
        app.webGL.animateCar(m,8.0);
  
        var m = _this.models["car_02"].clone();
        _this.models["car_02_03"] = m;
        var t = new THREE.MeshPhongMaterial({map: _this.textures["car_green"]});
        m.traverse( function ( child ) {
                if ( child.isMesh ) { child.material=t; }
        });
        m.visible = false;
        city.add(m);
        app.webGL.animateCar(m,18.0);
  
        var m = _this.models["car_02"].clone();
        _this.models["car_02_04"] = m;
        var t = new THREE.MeshPhongMaterial({map: _this.textures["car_yellow"]});
        m.traverse( function ( child ) {
                if ( child.isMesh ) { child.material=t; }
        });
        m.visible = false;
        city.add(m);
        app.webGL.animateCar(m,28.0);

        var m = _this.models["car_01"].clone();
        _this.models["car_03"] = m;
        var t = new THREE.MeshPhongMaterial({map: _this.textures["car_blue"]});
        m.traverse( function ( child ) {
                if ( child.isMesh ) { child.material=t; }
        });
        m.visible = false;
        city.add(m);
        app.webGL.animateCar2(m,0.0);
  
        var m = _this.models["car_01"].clone();
        _this.models["car_03_02"] = m;
        var t = new THREE.MeshPhongMaterial({map: _this.textures["car_red"]});
        m.traverse( function ( child ) {
                if ( child.isMesh ) { child.material=t; }
        });
        m.visible = false;
        city.add(m);
        app.webGL.animateCar2(m,8.0);
  
        var m = _this.models["car_01"].clone();
        _this.models["car_03_03"] = m;
        var t = new THREE.MeshPhongMaterial({map: _this.textures["car_green"]});
        m.traverse( function ( child ) {
                if ( child.isMesh ) { child.material=t; }
        });
        m.visible = false;
        city.add(m);
        app.webGL.animateCar2(m,16.0);

        var m = _this.models["car_01"].clone();
        _this.models["car_04"] = m;
        var t = new THREE.MeshPhongMaterial({map: _this.textures["car_blue"]});
        m.traverse( function ( child ) {
                if ( child.isMesh ) { child.material=t; }
        });
        m.visible = false;
        city.add(m);

        var m = _this.models["car_01"].clone();
        _this.models["car_04_02"] = m;
        var t = new THREE.MeshPhongMaterial({map: _this.textures["car_red"]});
        m.traverse( function ( child ) {
                if ( child.isMesh ) { child.material=t; }
        });
        m.visible = false;
        city.add(m);
  
        var m = _this.models["car_01"].clone();
        _this.models["car_04_03"] = m;
        var t = new THREE.MeshPhongMaterial({map: _this.textures["car_green"]});
        m.traverse( function ( child ) {
                if ( child.isMesh ) { child.material=t; }
        });
        m.visible = false;
        city.add(m);
      },

      animateCar : function(car,delay){
          if(!delay){delay=0;}
          var tl = new TimelineMax({repeat:-1,delay:delay});
          tl.timeScale(.7);
          tl.to(car.position,0.0, {x:-39.2,y:.5,z:12.7,ease:Quad.easeInOut});
          tl.to(car.rotation,0.0, {y:Math.PI/180*90,ease:Quad.easeInOut});
          tl.to(car.position,4.0, {x:-6,y:.5,z:12.7,ease:Quad.easeInOut});
          tl.to(car.rotation,1.0, {y:Math.PI/180*0,ease:Quad.easeInOut},"-=0.8");
          tl.to(car.position,2.0, {x:-6,y:.5,z:17.7,ease:Quad.easeInOut});
          tl.to(car.rotation,1.0, {y:Math.PI/180*-90,ease:Quad.easeInOut},"-=0.8");
          tl.to(car.position,2.5, {x:-16,y:.5,z:17.7,ease:Quad.easeInOut});
          tl.to(car.rotation,1.0, {y:Math.PI/180*0,ease:Quad.easeInOut},"-=0.8");
          tl.to(car.position,2.5, {x:-16,y:.5,z:32.7,ease:Quad.easeInOut});
          tl.to(car.rotation,1.0, {y:Math.PI/180*90,ease:Quad.easeInOut},"-=0.8");
          tl.to(car.position,2.5, {x:-1.2,y:.5,z:32.7,ease:Quad.easeInOut});
          tl.to(car.rotation,1.0, {y:Math.PI/180*180,ease:Quad.easeInOut},"-=0.8");
          tl.to(car.position,1.5, {x:-1.2,y:.5,z:17.7,ease:Quad.easeInOut});
          
          tl.to(car.rotation,1.0, {y:Math.PI/180*270,ease:Quad.easeInOut},"-=0.8");
          tl.to(car.position,2.0, {x:-4.2,y:.5,z:17.7,ease:Quad.easeInOut});
          tl.to(car.rotation,1.0, {y:Math.PI/180*180,ease:Quad.easeInOut},"-=0.8");
          tl.to(car.position,5.0, {x:-4.2,y:.5,z:-13.7,ease:Quad.easeInOut});
          tl.to(car.rotation,1.0, {y:Math.PI/180*90,ease:Quad.easeInOut},"-=0.8");
          tl.to(car.position,2.0, {x:8.7,y:.5,z:-13.7,ease:Quad.easeInOut});
          
          tl.to(car.rotation,1.0, {y:Math.PI/180*180,ease:Quad.easeInOut},"-=0.8");
          tl.to(car.position,4.0, {x:8.7,y:.5,z:-17.2,ease:Quad.easeInOut});
          tl.to(car.rotation,1.0, {y:Math.PI/180*90,ease:Quad.easeInOut},"-=0.8");
          tl.to(car.position,4.0, {x:30.7,y:.5,z:-17.2,ease:Quad.easeInOut});
          
          tl.to(car.rotation,1.0, {y:Math.PI/180*0,ease:Quad.easeInOut},"-=0.8");
          tl.to(car.position,2.0, {x:30.7,y:.5,z:-7.2,ease:Quad.easeInOut});
          
          tl.to(car.rotation,1.0, {y:Math.PI/180*90,ease:Quad.easeInOut},"-=0.8"); 
          tl.to(car.position,7.0, {x:106.7,y:.5,z:-7.2,ease:Quad.easeInOut}); 
          tl.to(car.rotation,1.0, {y:Math.PI/180*180,ease:Quad.easeInOut},"-=0.8");
          tl.to(car.position,3.0, {x:106.7,y:.5,z:-31.7,ease:Quad.easeInOut}); 
          tl.to(car.rotation,1.0, {y:Math.PI/180*270,ease:Quad.easeInOut},"-=0.8");
          
          tl.to(car.position,3.0, {x:82.2,y:.5,z:-31.7,ease:Quad.easeInOut}); 
          tl.to(car.rotation,1.0, {y:Math.PI/180*360,ease:Quad.easeInOut},"-=0.8");
          tl.to(car.position,3.0, {x:82.2,y:.5,z:-9.2,ease:Quad.easeInOut}); 
          
          tl.to(car.rotation,1.0, {y:Math.PI/180*270,ease:Quad.easeInOut},"-=0.8");
          tl.to(car.position,6.0, {x:32.2,y:.5,z:-9.2,ease:Quad.easeInOut}); 
          
          tl.to(car.rotation,1.0, {y:Math.PI/180*180,ease:Quad.easeInOut},"-=0.8");
          tl.to(car.position,3.0, {x:32.2,y:.5,z:-32.2,ease:Quad.easeInOut});
         
          tl.to(car.rotation,1.0, {y:Math.PI/180*270,ease:Quad.easeInOut},"-=0.8");
          tl.to(car.position,4.0, {x:9.2,y:.5,z:-32.2,ease:Quad.easeInOut}); 
          tl.to(car.rotation,1.0, {y:Math.PI/180*180,ease:Quad.easeInOut},"-=0.8");
          tl.to(car.position,7.0, {x:9.2,y:.5,z:-105.7,ease:Quad.easeInOut}); 
          tl.to(car.rotation,1.0, {y:Math.PI/180*270,ease:Quad.easeInOut},"-=0.8");
          
          tl.to(car.position,3.0, {x:-5.7,y:.5,z:-105.7,ease:Quad.easeInOut}); 
          tl.to(car.rotation,1.0, {y:Math.PI/180*360,ease:Quad.easeInOut,onComplete:function(){car.rotation.y=0;}},"-=0.8");
           
          tl.to(car.position,2.0, {x:-5.7,y:.5,z:-81.7,ease:Quad.easeInOut}); 
          tl.to(car.rotation,1.0, {y:Math.PI/180*90,ease:Quad.easeInOut},"-=0.8");
          
          tl.to(car.position,2.0, {x:7.2,y:.5,z:-81.7,ease:Quad.easeInOut}); 
          
          tl.to(car.rotation,1.0, {y:Math.PI/180*0,ease:Quad.easeInOut},"-=0.8");
          tl.to(car.position,7.0, {x:7.2,y:.5,z:-15.7,ease:Quad.easeInOut}); 
          tl.to(car.rotation,1.0, {y:Math.PI/180*-90,ease:Quad.easeInOut},"-=0.8");
          tl.to(car.position,2.0, {x:-6.2,y:.5,z:-15.7,ease:Quad.easeInOut}); 
          tl.to(car.rotation,1.0, {y:Math.PI/180*0,ease:Quad.easeInOut},"-=0.8");
          tl.to(car.position,2.0, {x:-6.2,y:.5,z:-12.7,ease:Quad.easeInOut});
          tl.to(car.rotation,1.0, {y:Math.PI/180*-90,ease:Quad.easeInOut},"-=0.8");
          tl.to(car.position,4.0, {x:-39.2,y:.5,z:-12.7,ease:Quad.easeInOut});
          tl.to(car.rotation,1.0, {y:Math.PI/180*0,ease:Quad.easeInOut},"-=0.8");
          tl.to(car.position,4.0, {x:-39.2,y:.5,z:12.7,ease:Quad.easeInOut});
          tl.to(car.rotation,1.0, {y:Math.PI/180*90,ease:Quad.easeInOut},"-=0.8");
      },

      animateCar2 : function(car,delay){
          if(!delay){delay=0;}
          var tl = new TimelineMax({repeat:-1,delay:delay});
          tl.timeScale(.7);
          if(delay==0.0) { tl.seek(20); }
          if(delay==8.0) { tl.seek(16); }
          if(delay==16.0) { tl.seek(12); }
  
          tl.to(car.position,0.0, {x:-39.2,y:.5,z:12.7,ease:Quad.easeInOut});
          tl.to(car.rotation,0.0, {y:Math.PI/180*90,ease:Quad.easeInOut});
          tl.to(car.position,4.0, {x:-6,y:.5,z:12.7,ease:Quad.easeInOut});
          tl.to(car.rotation,1.0, {y:Math.PI/180*0,ease:Quad.easeInOut},"-=0.8");
          tl.to(car.position,2.0, {x:-6,y:.5,z:17.7,ease:Quad.easeInOut});
          tl.to(car.rotation,1.0, {y:Math.PI/180*-90,ease:Quad.easeInOut},"-=0.8");
          tl.to(car.position,2.5, {x:-16,y:.5,z:17.7,ease:Quad.easeInOut});
          tl.to(car.rotation,1.0, {y:Math.PI/180*0,ease:Quad.easeInOut},"-=0.8");
          tl.to(car.position,2.5, {x:-16,y:.5,z:32.7,ease:Quad.easeInOut});
          tl.to(car.rotation,1.0, {y:Math.PI/180*90,ease:Quad.easeInOut},"-=0.8");
          tl.to(car.position,2.5, {x:-1.2,y:.5,z:32.7,ease:Quad.easeInOut});
          tl.to(car.rotation,1.0, {y:Math.PI/180*180,ease:Quad.easeInOut},"-=0.8");
          tl.to(car.position,1.5, {x:-1.2,y:.5,z:17.7,ease:Quad.easeInOut});
          
          tl.to(car.rotation,1.0, {y:Math.PI/180*270,ease:Quad.easeInOut},"-=0.8");
          tl.to(car.position,2.0, {x:-4.2,y:.5,z:17.7,ease:Quad.easeInOut});
          tl.to(car.rotation,1.0, {y:Math.PI/180*180,ease:Quad.easeInOut},"-=0.8");
          tl.to(car.position,5.0, {x:-4.2,y:.5,z:-13.7,ease:Quad.easeInOut});
          tl.to(car.rotation,1.0, {y:Math.PI/180*90,ease:Quad.easeInOut},"-=0.8");
          tl.to(car.position,2.0, {x:7.7,y:.5,z:-13.7,ease:Quad.easeInOut});

          tl.to(car.rotation,1.0, {y:Math.PI/180*0,ease:Quad.easeInOut},"-=0.8");
          tl.to(car.position,4.0, {x:7.7,y:.5,z:17.2,ease:Quad.easeInOut});

          tl.to(car.rotation,1.0, {y:Math.PI/180*-90,ease:Quad.easeInOut},"-=0.8");
          tl.to(car.position,1.5, {x:-4.2,y:.5,z:17.2,ease:Quad.easeInOut});
  
          tl.to(car.rotation,1.0, {y:Math.PI/180*-180,ease:Quad.easeInOut},"-=0.8");
          tl.to(car.position,4.0, {x:-4.2,y:.5,z:-12.7,ease:Quad.easeInOut});
  
          tl.to(car.rotation,1.0, {y:Math.PI/180*-90,ease:Quad.easeInOut},"-=0.8");
          tl.to(car.position,4.0, {x:-39.2,y:.5,z:-12.7,ease:Quad.easeInOut});
          tl.to(car.rotation,1.0, {y:Math.PI/180*0,ease:Quad.easeInOut},"-=0.8");
          
          tl.to(car.position,4.0, {x:-39.2,y:.5,z:12.7,ease:Quad.easeInOut});
          tl.to(car.rotation,1.0, {y:Math.PI/180*90,ease:Quad.easeInOut},"-=0.8");
      },
  
      animateCar3 : function(car,delay){
          if(!delay){delay=0;}
          var tl = new TimelineMax({repeat:0,delay:delay});
          tl.timeScale(1.0);
          tl.to(car.position,0.0, {x:106.7,y:.5,z:-31.7,ease:Quad.easeInOut});
          tl.to(car.rotation,0.0, {y:Math.PI/180*0,ease:Quad.easeInOut});
          tl.to(car.position,3.0, {x:106.7,y:.5,z:6.0,ease:Quad.easeInOut});
          tl.to(car.rotation,1.0, {y:Math.PI/180*90,ease:Quad.easeInOut},"-=0.8");
          tl.to(car.position,2.0-delay/10.0, {x:118.7-delay,y:.5,z:6.0,ease:Quad.easeInOut},"-=0.3");
          tl.to(car.rotation,.5, {y:Math.PI/180*120,ease:Quad.easeInOut},"-=0.9");
          tl.to(car.position,1.0, {x:123.7-delay,y:.5,z:3.0,ease:Quad.easeInOut},"-=0.3");
          tl.to(car.rotation,1.0, {y:Math.PI/180*90,ease:Quad.easeInOut},"-=0.9");
      },
  
      animateCar4 : function(car,delay){
          if(!delay){delay=0;}
          var tl = new TimelineMax({repeat:0,delay:delay});
          tl.timeScale(.9);
          tl.to(car.position,0.0, {x:123.7-delay,y:.5,z:3.0,ease:Quad.easeInOut});
          tl.to(car.rotation,0.0, {y:Math.PI/180*90,ease:Quad.easeInOut});
  
          tl.to(car.rotation,2.0, {y:Math.PI/180*-90,ease:Quad.easeInOut});
          tl.to(car.position,2.0, {x:124.7-delay,y:.5,z:6.0,ease:Quad.easeInOut},"-=2.0");
          tl.to(car.position,2.0, {x:106.7,y:.5,z:6.0,ease:Quad.easeInOut},"-=.5");
  
           tl.to(car.rotation,1.0, {y:Math.PI/180*-180,ease:Quad.easeInOut},"-=0.5");
           tl.to(car.position,2.0, {x:106.7,y:.5,z:-7.0,ease:Quad.easeInOut},"-=.5");
           tl.to(car.rotation,1.0, {y:Math.PI/180*-270,ease:Quad.easeInOut},"-=.5");
  
          tl.to(car.position,2.0-delay/10.0, {x:118.7-delay,y:.5,z:-7.0,ease:Quad.easeInOut},"-=0.3");
          tl.to(car.rotation,1.0, {y:Math.PI/180*-220,ease:Quad.easeInOut},"-=0.5");
          tl.to(car.position,1.0, {x:123.7-delay,y:.5,z:-10.0,ease:Quad.easeInOut},"-=0.5");
          tl.to(car.rotation,1.0, {y:Math.PI/180*-270,ease:Quad.easeInOut},"-=0.5");
      },
  
  
      animateState : function(state) {
          _this = app.webGL;
          var camera  = _this.camera;
          var target = _this.target;
  
          switch ( state ){
            case "step1":
              TweenMax.to(target.position,6,{x:0,y:0,z:-30,ease: Back.easeInOut.config(.5, 0.9),delay:1.0});
              TweenMax.to(camera.position,5,{x:0,y:150,z:200,ease: Quad.easeInOut,delay:1.0});
              break;
            case "step1-2":
              TweenMax.to(target.position,6,{x:0,y:0,z:-30,ease: Back.easeInOut.config(.5, 0.9),delay:1.0});
              TweenMax.to(camera.position,5,{x:0,y:150,z:200,ease: Quad.easeInOut,delay:1.0});
              _this.models["car_03_02"].visible = true;
              _this.models["car_03_03"].visible = true;
              _this.models["car_03"].visible = true;
              break;
            case "step2":
              TweenMax.to(target.position,2.5,{x:0,y:5,z:-30,ease: Back.easeOut.config(1.0, 0.8),delay:.5});
              TweenMax.to(camera.position,3.0,{x:-25,y:50,z:35,ease: Quad.easeInOut,delay:.5});
              break;
            case "step3":
              //TweenMax.to(target.position, 3.5, {bezier:[{x:-5, y:10}, {x:-2, y:5}, {x:0,y:0,z:-30}], ease:Quad.easeInOut});
              TweenMax.to(target.position,3.5,{x:0,y:0,z:-30,ease:Back.easeOut.config(1.0, 0.7),delay:.4});
              TweenMax.to(camera.position,3,{x:0,y:150,z:220,ease:Quad.easeInOut,delay:.5});
              break;
            case "step4":
              break;
          } 
      },
  
  
     getPos : function(obj){
        var obj = app.webGL.models[obj];
        var pos = projectToScreenXY(obj,app.webGL.camera);
        return pos;
     },
  
     upgradeBuilding : function(obj,stage){
        if(obj.currentStage==stage){ return false; }
        var m1 = app.webGL.models[obj.name + "_structure_0" + stage];
        var m2 = app.webGL.models[obj.name + "_structure_0" + (stage-1)];
        m1.scale.y=0.00001;
        TweenMax.to(m1.scale,1,{y:1.0,ease: Quad.easeOut});
        TweenMax.to(m2.scale,1,{y:.01,ease: Back.easeOut.config(1.0, 0.8), onComplete: function() {m2.visible=false;} } );
        m1.visible=true;
        obj.currentStage = stage;
     },
  
      animateTrains : function(){
          app.webGL.models["ground_cloud_generic_train"].position.z=30; 
          TweenMax.to( app.webGL.models["ground_cloud_generic_train"].position,3+Math.random()*2,{z:0 } );
          app.webGL.models["ground_cloud_google_train"].position.x=-30;  
          TweenMax.to( app.webGL.models["ground_cloud_google_train"].position,3+Math.random()*2,{x:0,delay:1+Math.random()*2 } );
      },
  
      updateVersionUpgradeState : function(pos){
        var _models = [];
        var _models2 = [];
  
        if(pos==1){
          _models2.push(_this.models["ground_city_upgrade"]);
          _models2.push(_this.models["building_01_primary_ground_02"]);
          _models2.push(_this.models["building_02_primary_ground_02"]);
          _models2.push(_this.models["building_03_primary_ground_02"]);
          _models2.push(_this.models["building_04_primary_ground_02"]);
          _models2.push(_this.models["building_01_alternate_ground_02"]);
          _models2.push(_this.models["building_02_alternate_ground_02"]);
          _models2.push(_this.models["building_03_alternate_ground_02"]);
          _models2.push(_this.models["building_04_alternate_ground_02"]);
          _models2.push(_this.models["ground_cloud_google_upgrade"]);
          _models2.push(_this.models["google_building_01_primary_ground_02"]);
          _models2.push(_this.models["google_building_02_primary_ground_02"]);
          _models2.push(_this.models["google_building_03_primary_ground_02"]);
          _models2.push(_this.models["google_building_04_primary_ground_02"]);
          _models2.push(_this.models["google_02_building_03_primary_ground_02"]);
          _models2.push(_this.models["ground_cloud_generic_upgrade"]);
          _models2.push(_this.models["generic_building_01_alternate_ground_02"]);
          _models2.push(_this.models["generic_building_02_alternate_ground_02"]);
          _models2.push(_this.models["generic_building_03_alternate_ground_02"]);
          _models2.push(_this.models["generic_building_04_alternate_ground_02"]);
  
          
        }
      
        if(pos==2){
          _models.push(_this.models["ground_city_upgrade"]);
          _models.push(_this.models["building_01_primary_ground_02"]);
          _models.push(_this.models["building_02_primary_ground_02"]);
          _models.push(_this.models["building_03_primary_ground_02"]);
          _models.push(_this.models["building_04_primary_ground_02"]);
          _models.push(_this.models["building_01_alternate_ground_02"]);
          _models.push(_this.models["building_02_alternate_ground_02"]);
          _models.push(_this.models["building_03_alternate_ground_02"]);
          _models.push(_this.models["building_04_alternate_ground_02"]);
  
          _models2.push(_this.models["ground_cloud_google_upgrade"]);
          _models2.push(_this.models["google_building_01_primary_ground_02"]);
          _models2.push(_this.models["google_building_02_primary_ground_02"]);
          _models2.push(_this.models["google_building_03_primary_ground_02"]);
          _models2.push(_this.models["google_building_04_primary_ground_02"]);
          _models2.push(_this.models["google_02_building_03_primary_ground_02"]);
          _models2.push(_this.models["ground_cloud_generic_upgrade"]);
          _models2.push(_this.models["generic_building_01_alternate_ground_02"]);
          _models2.push(_this.models["generic_building_02_alternate_ground_02"]);
          _models2.push(_this.models["generic_building_03_alternate_ground_02"]);
          _models2.push(_this.models["generic_building_04_alternate_ground_02"]);
  
        }
        
        if(pos==3){
          _models.push(_this.models["ground_cloud_google_upgrade"]);
          _models.push(_this.models["google_building_01_primary_ground_02"]);
          _models.push(_this.models["google_building_02_primary_ground_02"]);
          _models.push(_this.models["google_building_03_primary_ground_02"]);
          _models.push(_this.models["google_building_04_primary_ground_02"]);
          _models.push(_this.models["google_02_building_03_primary_ground_02"]);
  
          _models2.push(_this.models["ground_cloud_generic_upgrade"]);
          _models2.push(_this.models["generic_building_01_alternate_ground_02"]);
          _models2.push(_this.models["generic_building_02_alternate_ground_02"]);
          _models2.push(_this.models["generic_building_03_alternate_ground_02"]);
          _models2.push(_this.models["generic_building_04_alternate_ground_02"]);
        }
  
        if(pos==4){
          _models.push(_this.models["ground_cloud_generic_upgrade"]);
          _models.push(_this.models["generic_building_01_alternate_ground_02"]);
          _models.push(_this.models["generic_building_02_alternate_ground_02"]);
          _models.push(_this.models["generic_building_03_alternate_ground_02"]);
          _models.push(_this.models["generic_building_04_alternate_ground_02"]);
        }
  
        for (i=0;i<=_models.length-1;i++){
            var m = _models[i];
            m.scale.y=0.00001;
            m.visible = true;
            TweenMax.to(m.scale,1.0+Math.random(),{y:1.0,ease: Back.easeOut.config(.5, 0.9)});
        }
  
        for (i=0;i<=_models2.length-1;i++){
            var m = _models2[i];
            TweenMax.to(m.scale,0.2,{y:0.00001, onCompleteParams:[m],onComplete:function(m){m.visible=false;} });
        }
      }
  }
  
  
  //add click event listener
  document.addEventListener('mousedown', onDocumentMouseDown, false );
  function onDocumentMouseDown( event ) {
      event.preventDefault();
      app.webGL.mouse.x = ( event.clientX / app.webGL.renderer.domElement.clientWidth ) * 2 - 1;
      app.webGL.mouse.y = - ( event.clientY / app.webGL.renderer.domElement.clientHeight ) * 2 + 1;
      app.webGL.raycaster.setFromCamera( app.webGL.mouse, app.webGL.camera );
  
      var intersects = app.webGL.raycaster.intersectObjects( app.webGL.objects , true);
      if ( intersects.length > 0 ) {
          var obj = intersects[ 0 ].object.parent.parent;
          console.log(obj);
          if(!obj || !obj.name) { obj = intersects[ 0 ].object.parent; }
          if(!obj || !obj.name) { obj = intersects[ 0 ].object; }
          if(!obj || obj==undefined ){ return false; }
          
          switch(obj.name)
          {
            case "building_01_primary":
              app.toolTip.hide();
              app.go("step2");
          }
      }
   }
  
  
   // listen for mosue and react if need to
  document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  function onDocumentMouseMove( event ) {
      if(!app.webGL.renderer) { return false; }
      app.webGL.mouse.x = ( event.clientX / app.webGL.renderer.domElement.clientWidth ) * 2 - 1;
      app.webGL.mouse.y = - ( event.clientY / app.webGL.renderer.domElement.clientHeight ) * 2 + 1;
      app.webGL.raycaster.setFromCamera( app.webGL.mouse, app.webGL.camera );

      if(app.webGL.draggingObject!=null){
          var c = app.webGL.draggingObject;
          var camera  = app.webGL.camera;
  
          var vector = new THREE.Vector3(app.webGL.mouse.x, app.webGL.mouse.y, 0.0);
          vector.unproject( camera );
          var dir = vector.sub( camera.position ).normalize();
          var distance = - camera.position.z / dir.z;
          var pos = camera.position.clone().add( dir.multiplyScalar( distance ) );
  
          c.position.x = pos.x;
          c.position.y = pos.y;
          c.position.z = pos.z;
      }
  
      if(app.webGL.drawingRoad1){
         var m = app.webGL.models["connector_road_02"].visible = true;
         var m = app.webGL.models["connector_road_02"].scale.x = Math.min (app.webGL.mouse.x*2.0,1.0);
      }
  
      if(app.webGL.drawingRoad2){
         var m = app.webGL.models["connector_road_01"].visible = true;
         var m = app.webGL.models["connector_road_01"].scale.z = Math.min (-app.webGL.mouse.x*2.0,1.0);
      }
  }
  
  document.addEventListener('mouseup', onDocumentMouseUp, false );
  function onDocumentMouseUp( event ) {}
  
  window.addEventListener('resize', onWindowResize, false );
  function onWindowResize() {
    windowHalfX = window.innerWidth / 2,
    windowHalfY = window.innerHeight / 2,
    app.webGL.camera.aspect = window.innerWidth / window.innerHeight;
    app.webGL.camera.updateProjectionMatrix();
    app.webGL.renderer.setSize( window.innerWidth, window.innerHeight );
  }
  
  function projectToScreenXY(obj, camera) {
    var vector = new THREE.Vector3();

    var widthHalf = 0.5*window.innerWidth;
    var heightHalf = 0.5*window.innerHeight;
    var bb = new THREE.Box3().setFromObject(obj);
    height=Math.abs(bb.max.y - bb.min.y) -2.0; 

    obj.position.y+=height;
    obj.getWorldPosition(vector);

    vector.project(camera);
    obj.position.y-=height;

    vector.x = ( vector.x * widthHalf ) + widthHalf;
    vector.y = - ( vector.y * heightHalf ) + heightHalf;

    return { 
        x: vector.x,
        y: vector.y
    }
  }