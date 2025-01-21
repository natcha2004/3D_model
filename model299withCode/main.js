import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
// To allow for the camera to move around the scene
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
// To allow for importing the .gltf file
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";


  
  //Create a Three.JS Scene
  const scene = new THREE.Scene();
  //create a new camera with positions and angles
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

  //Keep track of the mouse position, so we can make the eye move
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2; 

  //Keep the 3D object on a global variable so we can access it later
  let object;

  //OrbitControls allow the camera to move around the scene
  let controls;

  //Set which object to render
  let objToRender = 'island';

  //Instantiate a loader for the .gltf file
  const loader = new GLTFLoader();

  //Load the file
  /*loader.load(
    './island/island_wavemove.gltf',
    function (gltf) {
      //If the file is loaded, add it to the scene
      object = gltf.scene;
      scene.add(object);
    },
    function (xhr) {
      //While it is loading, log the progress
      console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
      //If there is an error, log it
      console.error(error);
    }
  );*/

  //Instantiate a new renderer and set its size
  const renderer = new THREE.WebGLRenderer({ alpha: true }); //Alpha: true allows for the transparent background
  renderer.setSize(window.innerWidth, window.innerHeight);


  //Add the renderer to the DOM
  document.getElementById("container3D").appendChild(renderer.domElement);

  //Set how far the camera will be from the 3D model
  camera.position.z = objToRender === "island" ? 25 : 500;

  // cerate skybox
  const skyboxTextureLoader = new THREE.CubeTextureLoader();
  const texture = skyboxTextureLoader.load([
     'skybox_right.jpg',  // right
     'skybox_left.jpg',  // left
     'skybox_top.jpg',  // top
     'skybox_bottom.jpg',  // bottom
     'skybox_front.jpg',  // front
     'skybox_back.jpg',   // back
  ]);
  scene.background = texture;


  // Add lights to the scene, so we can actually see the 3D model
  const topLight = new THREE.PointLight(0xffddb3, 0.3);
  topLight.position.set(50, 50, 50);
  topLight.castShadow = true;
  scene.add(topLight);

  const ambientLight = new THREE.HemisphereLight(0xffffff, 0x888888, 1.5); // Soft white ambient light
  scene.add(ambientLight);

  // Directional light aka light created by the sun
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2); // Soft white directional light
  scene.add(directionalLight);
  directionalLight.position.set(-40, 60, 100); // -20,30,60 -25,40,30
  directionalLight.castShadow = true;
  directionalLight.angle = 0.8;

  //This adds controls to the camera, so we can rotate / zoom it with the mouse
  if (objToRender === "island") {
  controls = new OrbitControls(camera, renderer.domElement);
  }
  const island_final = new URL('../island/island_wavemove_withsharkswim.glb', import.meta.url);

  
  const assetLoader = new GLTFLoader();
  //load our animation effect
  let mixer;
  assetLoader.load(island_final.href, function(gltf){
    const model = gltf.scene;
    scene.add(model);
    const rock = model.getObjectByName('CavePlatform_4');
    if(rock){
      const phongmat = new THREE.MeshPhongMaterial({color:0x1e1e1e});
      rock.material = phongmat;
    }
    mixer = new THREE.AnimationMixer(model);
    const clips = gltf.animations;
    /*const clip = THREE.AnimationClip.findByName(clips,'');
    const action = mixer.clipAction(clip);*/
    clips.forEach(function(clip){
      const action = mixer.clipAction(clip);
      action.play();
    });
    
  }, undefined, function(error){
    console.error(error);
  });



  const clock = new THREE.Clock();
  //Render the scene
  function animate() {
    requestAnimationFrame(animate);
    if(mixer)
      mixer.update(clock.getDelta());

    renderer.render(scene, camera);
  }

  //Add a listener to the window, so we can resize the window and the camera
  window.addEventListener("resize", function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  //add mouse position listener, so we can make the eye move
  document.onmousemove = (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }

  // create an AudioListener and add it to the camera
  const listener = new THREE.AudioListener();
  camera.add( listener );

  // create a global audio source
  const sound = new THREE.Audio( listener );

  // load a sound and set it as the Audio object's buffer
  const audioLoader = new THREE.AudioLoader();
  audioLoader.load( './sound/sound2.mp3', function( buffer ) {
    sound.setBuffer( buffer );
    sound.setLoop(true);
    sound.setVolume(0.5);
    //sound will start when user click mouse
    document.addEventListener('click', function () {
      sound.play();
    });
  });
  



  //Start the 3D rendering
  animate();



