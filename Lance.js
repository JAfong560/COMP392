﻿/// <reference path="./libs/three.min.js" />
/// <reference path="./libs/dat.gui.min.js" />
/// <reference path="./libs/orbitcontrols.js" />

//author: Narendra Pershad Feb 8, 2019
//filename: 00-lab-base.js
//purpose: a useful base for threejs applications

const renderer = new THREE.WebGLRenderer({ antialias: true });
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1.0, 1000);

var angle = 0;
var wheel = new THREE.Object3D();


var orbitControls, controls,
    speed = 0.001,
    toRotate = false,
    reverse = false;


var table,
    tableTop, 
    tableLegs, 
    tableLegs2, 
    tableLegs3, 
    tableLegs4;

var block = [];

function init() {

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x004400);
    renderer.shadowMap.enabled = true;

    document.body.appendChild(renderer.domElement);
    orbitControls = new THREE.OrbitControls(camera, renderer.domElement);

    
}

function setupCameraAndLight() {
    camera.position.set(-100, 50, 40);
    camera.lookAt(scene.position);

    scene.add(new THREE.AmbientLight(0x666666));

    let directionalLight = new THREE.DirectionalLight(0xeeeeee);
    directionalLight.position.set(20, 60, 10);
    directionalLight.castShadow = true;
    directionalLight.target = scene;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 200;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    let hemiSphereLight = new THREE.HemisphereLight(0x7777cc, 0x00ff00, 0.6);//skycolor, groundcolor, intensity  
    hemiSphereLight.position.set(0, 100, 0);
    scene.add(hemiSphereLight);
}

function createGeometry() {

    scene.add(new THREE.AxesHelper(100));
    let plane = new THREE.Mesh(
        new THREE.PlaneGeometry(40, 60),
        new THREE.MeshStandardMaterial({ color: 0xD2691E })
    );
    plane.receiveShadow = true;
    plane.rotation.x = -Math.PI * 0.5;
    scene.add(plane);  
}

function createTable()
{
    tableTop = new THREE.Mesh(
        new THREE.BoxGeometry(25,1.2,30),
        new THREE.MeshStandardMaterial({color: 0x765c48})
        );
        tableTop.position.y = 10;
        scene.add(tableTop);

    tableLegs = new THREE.Mesh(
        new THREE.BoxGeometry(1, 10, 2),
        new THREE.MeshStandardMaterial({color: 0x765c48})
    );
    tableLegs.position.set(8, 5, 10);
    scene.add(tableLegs);

    tableLegs2 = tableLegs.clone();
    tableLegs2.position.set(-8, 5, 10);
    scene.add(tableLegs2);

    tableLegs3 = tableLegs.clone();
    tableLegs3.position.set(8, 5, -10);
    scene.add(tableLegs3);

    tableLegs4 = tableLegs.clone();
    tableLegs4.position.set(-8, 5, -10);
    scene.add(tableLegs4);
}

function createBlock({x = 0,y=12,z=0, friction = 0.3, restitution = 0.7, mass =10, color= 0xff00ff})
{

    var blockGeom = new THREE.BoxGeometry(2,2,2)
    let blockMat = Physijs.createMaterial(new THREE.MeshStandardMaterial({
        color: color, transparent: true, opacity: 0.9
    }), friction, restitution);
    block2 = new  Physijs.BoxMesh(
        blockGeom,
        blockMat,
        mass);
    block2.position.set(x,y,z);
    block2.castShadow = true;
    block2.receiveShadow = true;
    block2.name = 'block';
    scene.add(block2);

    block = new THREE.Mesh(
        new THREE.BoxGeometry(2,2,2),
        new THREE.MeshBasicMaterial({color: 0xff00ff})
    );
    block.position.y = 12;    
    blocks.push(block);
    block.name = 'block';

    let block3 = block.clone();
    block3.position.x = 5;
    block3.position.y = 12;
    blocks.push(block3);


}

function addBlockToScene()
{
    blocks.forEach(block => {
        
        // scene.add(block);
    });   
}

function removeBlock(object) //raycaster || destroys block on click using raycasting
{
    
    
    mouse.x = (object.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (object.clientY / window.innerHeight) * 2 + 1;
    //mouse.x = ((object.clientX - renderer.domElement.offsetLeft) / renderer.domElement.width) * 2 - 1;
    //mouse.y  = ((object.clientY - renderer.domElement.offsetTop) / renderer.domElement.height) * 2 + 1;
    

    
    raycaster.setFromCamera(mouse, camera);

    intersect = raycaster.intersectObjects(scene.children);
    
    //console.log(intersect);
    
   
    for(let i = 0; i < intersect.length; i++)
    {
        console.log('found an object!');
        if(intersect[i].object.name == "block")
        {
            console.log('removing block');
            scene.remove(intersect[i].object);
            scene.simulate(undefined, 1);   
        }
    }
}

function createGame()
{
    createBlock({y:12});
    createBlock({y:15});
    createBlock({y:16});
    createBlock({y:25});
}

function setupDatGui() {

    controls = new function() {

        this.rotate = toRotate;
        this.reverse = reverse;

    }

    let gui = new dat.GUI();
    gui.add(controls, 'rotate').onChange((e) => toRotate = e);
    gui.add(controls, 'reverse').onChange((e) => reverse = e);
    //let upperFolder = gui.addFolder('Upper arm');
    //upperFolder.add(controls, 'upperRotationX', -Math.PI * 0.5, Math.PI * 0.5);
    //upperFolder.add(controls, 'upperRotationY', -Math.PI * 0.5, Math.PI * 0.5);
    //upperFolder.add(controls, 'upperRotationZ', -Math.PI * 0.5, Math.PI * 0.5);

    
    //gui.add(controls, 'stop').name('Stop rotation').onChange((stop) => speed = !stop ? 0.01 : 0);

}


function render() {

    orbitControls.update();
    // if(orbitControls.target == "block")
    // {
    //     removeBlock();
    // }
    if (toRotate)
    {
        scene.rotation.y += speed;
    }

     renderer.render(scene, camera);
     scene.simulate(undefined, 1);   

    requestAnimationFrame(render);  
}

function readFile(port, filename) {
    let url = 'http://localhost:' +
    port + //port number from data.gui
    '/assets/games/' + //url path
    filename + //file name from dat.gui
    '.json'; //extension
    //console.log(url); //debugging code
    let request = new XMLHttpRequest();
    request.open('GET', url);
    request.responseType = 'json'; //try text if this doesn’t work
    request.send();
    request.onload = () => {
    let data = request.responseText;
    //console.log(data); //debugging code
    createGame(data);
    //createGame(JSON.parse(data)); //convert text to json
    }
   } 

window.onload = () => {

    init();
    setupCameraAndLight();
    createGeometry();
    createTable();

    createGame();

    // createBlock();
    addBlockToScene();

    setupDatGui();
    render();
}