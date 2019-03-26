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

var blocks = [];

var starter = false;
var isActive = false;
var points = 100;
var score = 0;
var finalScore = 0;
var time = 0; //in milliseconds
var clicks = 20;

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

    //scene.add(new THREE.AxesHelper(100));
    let planeGeom = new THREE.PlaneGeometry(40, 60);
    let planeMat =  Physijs.createMaterial(new THREE.MeshStandardMaterial({ color: 0xD2691E, transparent: true, opacity: 0.9 }),0.3,0.7)
    let plane = new Physijs.BoxMesh(planeGeom,planeMat,0);

    plane.name = 'plane';
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
        tableTop.castShadow = true;
        tableTop.receiveShadow = true;
        tableTop.name = 'tableTop';
        scene.add(tableTop);

    tableLegs = new Physijs.BoxMesh(
        new THREE.BoxGeometry(1, 8, 2),
        Physijs.createMaterial(new THREE.MeshStandardMaterial({color: 0x765c48}))
    );
    tableLegs.position.set(5, 5, 7);
    tableLegs.castShadow = true;
    tableLegs.receiveShadow = true;
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

function createBlock({x = this.x, y = this.y, z = this.z, friction = 0.3, restitution = 0.1, mass =10, color= this.color})
{
    
    var blockColor = new THREE.Color(color);
    var blockGeom = new THREE.BoxGeometry(3,3,3)
    let blockMat = Physijs.createMaterial(new THREE.MeshStandardMaterial({
        color: blockColor, transparent: true, opacity: 0.9,
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
    blocks.push(block2);

    scene.add(block2);
}

function removeBlock(object) //raycaster || destroys block on click using raycasting
{
    mouse.x = (object.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (object.clientY / window.innerHeight) * 2 + 1;
    //mouse.x = ((object.clientX - renderer.domElement.offsetLeft) / renderer.domElement.width) * 2 - 1;
    //mouse.y  = ((object.clientY - renderer.domElement.offsetTop) / renderer.domElement.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    intersect = raycaster.intersectObjects(scene.children);   
   
    for(let i = 0; i < intersect.length; i++)
    {
        //console.log('found an object!');
        if((intersect[i].object.name == "block") && (clicks != 0))
        {
            starter = true;
            console.log('removing block');
            scene.remove(intersect[i].object);
            score = score + points;
            controls.score = score;
            clicks--;
            controls.clicks = clicks;
            blocks.length --;
        }
        break;
    }
    blocks.forEach(block => {
        block.__dirtyPosition = true;
        block.__dirtyRotation = true;
    });

    if(blocks.length == 0 && starter)
    {
        isActive = false;
        starter = false;
        calculateScore(score);
    }
   
}

function removeObjects()
{
    for(var i = blocks.length; i > 0; i--)
    {
        var removeBlocks = scene.getObjectByName('block');
        scene.remove(removeBlocks);
    }
    isActive = false;
    starter = false;
}


function createGame(data)
{   
    if(scene.getObjectByName('block'))
    {
        console.log('a game is in progress!');
    }
    else
    {
        score = 0;
        time = 0;
        finalScore = 0;
        clicks = 20;
        controls.score = 0;
        controls.finalScore = 0;
        controls.time = 0;
        controls.clicks = 20;
        starter = true;
        for(let i=0; i<data.length; i++)
        {
            createBlock(x=data[i].position.x, y=data[i].position.y, z=data[i].position.z, color=data[i].color);
        }
    }
}

function timer()
{
    time += 1000;
    controls.time = time / 60000;
    
}

function calculateScore(score)
{
    console.log('final score:');
    finalScore = Math.round(score - (time / 60000 * 10) * 1.2);
    if(finalScore < 50)
    {
        finalScore = 50;
    }
    controls.finalScore = finalScore;
    console.log(finalScore);
    //post score before this line!
    score = 0;
}

function resetGame()
{
    isActive = false;
    starter = false;
    score = 0;
    finalScore = 0;
    time = 0;
    console.log('finding block(s) for reset')
    if(scene.getObjectByName('block'))
    {
        console.log('found blocks... resetting game');
        removeObjects();
    }
    else
    {
        console.log('no blocks found... reset not necessary');
    }
}



function setupDatGui() {

    controls = new function() {
        this.stage1 = function(){readFile(3000,"stage1");}
        this.stage2 = function(){readFile(3000,"stage2");}
        this.stage3 = function(){readFile(3000,"stage3");}
        this.stage4 = function(){readFile(3000,"stage4");}
        this.stage5 = function(){readFile(3000,"stage5");}
        this.reset = function()
        {
            resetGame();
        }
        this.score = score;
        this.finalScore = finalScore;
        this.time = time;
        this.clicks = clicks;
    }

    let gui = new dat.GUI();
    gui.width = 150;
    gui.add(controls, "stage1").name("Stage 1");
    gui.add(controls, "stage2").name("Stage 2");
    gui.add(controls, "stage3").name("Stage 3");
    gui.add(controls, "stage4").name("Stage 4");
    gui.add(controls, "stage5").name("Stage 5");
    gui.add(controls, 'reset').name('Reset Game');
    gui.add(controls, 'score').name('Score:').listen().onChange((c) => 
    {
        controls.score = score;
    });
    gui.add(controls, 'finalScore').name('Final Score:').listen().onChange((c) => 
    {
        controls.finalScore = finalScore;
    });
    gui.add(controls, 'time').step(.01,).name('Time:').listen().onChange((c) => 
    {
        controls.time = time;
    });
    gui.add(controls, 'clicks').name('Clicks Left:').listen().onChange((c) => 
    {
        controls.clicks = clicks;
    });
}

function render() {

    orbitControls.update();
    if(starter)
    {
        timer();
    }
    requestAnimationFrame(render);  
    renderer.render(scene, camera);
    scene.simulate(undefined, 1);   
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
    setupDatGui();
    createGeometry();
    createTable();

    // createGame();

    // createBlock();
    // addBlockToScene();

    render();
}
