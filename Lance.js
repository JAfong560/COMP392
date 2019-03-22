/// <reference path="./libs/three.min.js" />
/// <reference path="./libs/dat.gui.min.js" />
/// <reference path="./libs/orbitcontrols.js" />

//author: Narendra Pershad Feb 8, 2019
//filename: 00-lab-base.js
//purpose: a useful base for threejs applications

Physijs.scripts.worker = './libs/other/physijs/physijs_worker.js';
Physijs.scripts.ammo = './ammo.js';
const renderer = new THREE.WebGLRenderer({ antialias: true });
const scene = new Physijs.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1.0, 1000);

var angle = 0;

var raycaster = new THREE.Raycaster();
var mouse = {x: 0, y: 0 };
var intersect;

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

var blockLower;
var blockMiddle;
var blockUpper;
var blocksLower = [];
var blocksMiddle = [];
var blocksUpper = [];

function init() {

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x004400);
    renderer.domElement.addEventListener('click', removeBlock, false);
    renderer.shadowMap.enabled = true;

    scene.setGravity(new THREE.Vector3(0, -50, 0));
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
    let planeGeom = new THREE.PlaneGeometry(40, 60);
    let planeMat =  Physijs.createMaterial(new THREE.MeshStandardMaterial({ color: 0xD2691E, transparent: true, opacity: 0.9 }),0.3,0.7)
    let plane = new Physijs.BoxMesh(planeGeom,planeMat,0);

    plane.receiveShadow = true;
    plane.rotation.x = -Math.PI * 0.5;
    scene.add(plane);  
}

function createTable()
{
    tableTop = new Physijs.BoxMesh(
        new THREE.BoxGeometry(15,1.2,20),
        Physijs.createMaterial(new THREE.MeshStandardMaterial({color: 0x765c48}))
        );
        tableTop.position.y = 10;
        tableTop.name = 'tableTop';
        scene.add(tableTop);

    tableLegs = new Physijs.BoxMesh(
        new THREE.BoxGeometry(1, 8, 2),
        Physijs.createMaterial(new THREE.MeshStandardMaterial({color: 0x765c48}))
    );
    tableLegs.position.set(5, 5, 7);
    tableLegs.name ='tableLegs';
    scene.add(tableLegs);

    tableLegs2 = tableLegs.clone();
    tableLegs2.position.set(-5, 5, 7);
    scene.add(tableLegs2);

    tableLegs3 = tableLegs.clone();
    tableLegs3.position.set(5, 5, -7);
    scene.add(tableLegs3);

    tableLegs4 = tableLegs.clone();
    tableLegs4.position.set(-5, 5, -7);
    scene.add(tableLegs4);
}

function createBlock({x = this.x, y = this.y, z = this.z, friction = 0.3, restitution = 0.35, mass =10, color= this.color})
{

    var blockColor = new THREE.Color(color);
    var blockGeom = new THREE.BoxGeometry(3,3,3)
    let blockMat = Physijs.createMaterial(new THREE.MeshStandardMaterial({
        color: blockColor, transparent: true, opacity: 0.9
    }), friction, restitution);
    block2 = new  Physijs.BoxMesh(
        blockGeom,
        blockMat,
        mass);
    block2.position.x = x;
    block2.position.y = y;
    block2.position.z = z;
    block2.castShadow = true;
    block2.receiveShadow = true;
    block2.name = "block"; 
    scene.add(block2);

    block = new Physijs.BoxMesh(
        new THREE.BoxGeometry(3,3,3),
        new THREE.MeshBasicMaterial({color: 0xff00ff})
    );
    


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
            // scene.simulate(undefined,1);
        }
        break;
    }
}

function createGame(data)
{   
    for(let i=0; i<data.length; i++)
    {
        createBlock(x=data[i].position.x, y=data[i].position.y, z=data[i].position.z, color=data[i].color);
        // console.log(i);
        // console.log(data[i].position.x);
        // console.log(data[i].position.y);
        console.log(data[i].position.z);
    }
    
    // createBlock({y=data[0].position.y});
    // createBlock({y:12});
    // createBlock({y:15});
    
}

function setupDatGui() {

    controls = new function() {

        this.rotate = toRotate;
        this.reverse = reverse;
        this.stage1 = function(){readFile(3000,"stage1");}
        this.stage2 = function(){readFile(3000,"stage2");}
        this.stage3 = function(){readFile(3000,"stage3");}
        this.stage4 = function(){readFile(3000,"stage4");}
        this.stage5 = function(){readFile(3000,"stage5");}

    }

    let gui = new dat.GUI();
    gui.add(controls, 'rotate').onChange((e) => toRotate = e);
    gui.add(controls, 'reverse').onChange((e) => reverse = e);
    gui.add(controls, "stage1").name("Stage 1");
    gui.add(controls, "stage2").name("Stage 2");
    gui.add(controls, "stage3").name("Stage 3");
    gui.add(controls, "stage4").name("Stage 4");
    gui.add(controls, "stage5").name("Stage 5");
    //let upperFolder = gui.addFolder('Upper arm');
    //upperFolder.add(controls, 'upperRotationX', -Math.PI * 0.5, Math.PI * 0.5);
    //upperFolder.add(controls, 'upperRotationY', -Math.PI * 0.5, Math.PI * 0.5);
    //upperFolder.add(controls, 'upperRotationZ', -Math.PI * 0.5, Math.PI * 0.5);

    
    //gui.add(controls, 'stop').name('Stop rotation').onChange((stop) => speed = !stop ? 0.01 : 0);

}


function render() {

    orbitControls.update();
    if(orbitControls.target == "block")
    {
        removeBlock();
    }
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
    request.responseType = 'text'; //try text if this doesn’t work
    request.send();
    request.onload = () => {
    let data = request.responseText;
    //console.log(data); //debugging code
    // createGame(data);
    createGame(JSON.parse(data)); //convert text to json
    }
   } 

window.onload = () => {

    init();
    setupCameraAndLight();
    createGeometry();
    createTable();

    // createGame();

    // createBlock();
    // addBlockToScene();

    setupDatGui();
    render();
}
