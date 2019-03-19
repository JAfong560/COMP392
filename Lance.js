/// <reference path="./libs/three.min.js" />
/// <reference path="./libs/dat.gui.min.js" />
/// <reference path="./libs/orbitcontrols.js" />

//author: Narendra Pershad Feb 8, 2019
//filename: 00-lab-base.js
//purpose: a useful base for threejs applications

const renderer = new THREE.WebGLRenderer({ antialias: true });
const scene = new THREE.Scene();
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

var block;
var blocks = [];

function init() {

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x004400);
    renderer.domElement.addEventListener('click', removeBlock, false);
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
        tableTop.name = 'tableTop';
        scene.add(tableTop);

    tableLegs = new THREE.Mesh(
        new THREE.BoxGeometry(1, 10, 2),
        new THREE.MeshStandardMaterial({color: 0x765c48})
    );
    tableLegs.position.set(8, 5, 10);
    tableLegs.name ='tableLegs';
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

function createBlock()
{
    block = new THREE.Mesh(
        new THREE.BoxGeometry(2,2,2),
        new THREE.MeshBasicMaterial({color: 0xff00ff})
    );
    block.position.y = 12;    
    blocks.push(block);
    block.name = 'block';

    let block2 = block.clone();
    block2.position.x = 5;
    block2.position.y = 12;
    blocks.push(block2);

   
}

function addBlockToScene()
{
    blocks.forEach(block => {
        
        scene.add(block);
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
        }
    }
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
    if(orbitControls.target == "block")
    {
        removeBlock();
    }
    if (toRotate)
    {
        scene.rotation.y += speed;
        
        
    }

    
    
     renderer.render(scene, camera);   
    requestAnimationFrame(render);  
}

window.onload = () => {

    init();
    setupCameraAndLight();
    createGeometry();
    createTable();
    createBlock();
    addBlockToScene();
    setupDatGui();
    render();
}
