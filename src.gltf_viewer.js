// ASG Portfolio
// gltf_viewer src https home
// Arjun Singh Gill

// ThreeJS imports
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

function main() {
  // Set Up the three canvas
  // - get the canvas reference
  const THREE_canvas = document.getElementById("three_canvas");
  // - create the renderer and pass the canvas reference
  const renderer = new THREE.WebGLRenderer( {
    antialias : true,
    canvas    : THREE_canvas,
  });
  // - set the renderer size
  renderer.setSize( window.innerWidth, window.innerHeight );
  // - CSS styles for the renderer canvas
  renderer.domElement.style.zIndex = -5;
  renderer.domElement.style.position = 'fixed';
  renderer.domElement.style.top = 0;
  renderer.domElement.style.left = 0;

  // Create a ThreeJS scene
  const scene = new THREE.Scene();
  // Set the background color
  scene.background = new THREE.Color(0xf8f8f8);
  // Create a new Camera for the scene
  const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
  // Orbit Controls to move the camera around
  const controls = new OrbitControls(camera, THREE_canvas);
  // Position the orbit controls
  controls.target.set(0, 0, 0);
  // Update the orbit controls with the position
  controls.update();

  // Ambient Light Color
  const color = 0xFFFFFF;
  // Ambient Light Intensity
  const intensity = 1;
  // Ambient light to light up the scene
  const light = new THREE.AmbientLight(color, intensity);
  // Add the ambient light to the scene
  scene.add(light);

  // Directional Light for normal
  const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
  // Directional Light Position
  directionalLight.position.set(10,10,10);
  // Directional Light Target
  directionalLight.target.position.set(0,0,0);
  // Add the directional light to the scene
  scene.add( directionalLight );

  // move the camera out towards the screen
  camera.position.z = 5;


  // gltf loader
  const gltf_loader = new GLTFLoader();

  let GLTF_scene, GLTF_scene_object;
  let FLAG_auto_rotate = false;

  // function to remove existing gltf from the scene when a new one is loaded
  function fx_remove_gltf_from_scene()
  {
    // fetch the current gltf object
    let sel_object = scene.getObjectByName('loaded_gltf');
    // if there is one,
    if(sel_object) {
      // remove the object from the scene
      scene.remove(sel_object);
      // se auto rotate = false;
      FLAG_auto_rotate = false;
      // clean up the selected object 
      sel_object.traverse( (child) => {
        // clean up the mesh of the selected object
        if( child instanceof THREE.Mesh ) {
          // child geometry
          if( child.geometry ) {
            child.geometry.dispose();
          }
          // child material
          if(child.material) {
            if(Array.isArray(child.material)) {
              child.material.forEach( (mat) => { mat.dispose(); } );
            } else {
              child.material.dispose();
            }
          }
        }
      } );
    }
  }

  // function to load the new GLTF to the scene
  function fx_load_gltf_url_to_scene(url)
  {
    gltf_loader.load( 
      url,  
      function(gltf) {
        // delete the older gltf
        fx_remove_gltf_from_scene();
        // set the name of new gltf to identify it in the scene
        gltf.scene.name = 'loaded_gltf';
        // add the new gltf
        scene.add(gltf.scene);
        // render the scene
        renderer.render( scene, camera );
        // clean up the gltf URL
        URL.revokeObjectURL(url);
        // set the scene object
        GLTF_scene = scene.getObjectByName('loaded_gltf');
        if(GLTF_scene)
        {
          GLTF_scene.traverse( (child) => {
            if( child instanceof THREE.Mesh ) {
              GLTF_scene_object = child;
//              FLAG_auto_rotate = true;
            }
          });
        }
      },
      undefined,
      function(error) {
        console.error('Error loading GLTF file:', error);
        URL.revokeObjectURL(url);
      }
    );
  }

  // initialize the scene with the default sample gltf file
  fx_load_gltf_url_to_scene('/binary/sample.glb');

  // load a new gltf when button is pressed
  async function fx_load_gltf()
  {
    console.log('LOAD FILE ...');
    // get file handle from user
    const [fileHandle] = await window.showOpenFilePicker();
    // If there is no file handle, output to console
    if( !fileHandle )
    {
      console.log(`-E- Error fetching file ...`);
    } else {
      // get the file
      const file = await fileHandle.getFile();
      // generate a URL for the fetched file
      const url = URL.createObjectURL(file);
      // load the GLTF to the scene via its created URL
      fx_load_gltf_url_to_scene(url);
    }
  }
  // Get the button element by its ID
  const button = document.getElementById("button_load_gltf");

  // Add a 'click' event listener to the button, calling the function
  if (button) {
    button.addEventListener("click", fx_load_gltf);
  }


  function fx_auto_rotate()
  {
    if( FLAG_auto_rotate )
    {
      FLAG_auto_rotate = false;
    } else {
      FLAG_auto_rotate = true;
    }
  }

//  const button_auto_rotate = document.getElementById("button_auto_rotate");
//  if( button_auto_rotate )
//  {
//    button_auto_rotate.addEventListerner( 'click', fx_auto_rotate );
//  }

  // update the camera 
  function animate( time ) {

    if( FLAG_auto_rotate )
    {
      GLTF_scene_object.rotation.y += 0.003;
    }

    // update the orbit controls
    controls.update();
    // render the scene
    renderer.render( scene, camera );
  }
  // Set the animation loop for the renderer, required for the orbit controls to work
  renderer.setAnimationLoop( animate );
  // initial render
  renderer.render( scene, camera );
}

window.onload = () => {
  main();
}
