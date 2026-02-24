import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

import { OrbitControls }
from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';

import { GLTFLoader }
from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';

import { STLExporter }
from 'https://unpkg.com/three@0.160.0/examples/jsm/exporters/STLExporter.js';


let scene, camera, renderer, controls;
let snowman;

let parts = {
  head:null,
  torso:null,
  bottom:null
};

const loader = new GLTFLoader();

init();
animate();


function init(){

scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);

camera = new THREE.PerspectiveCamera(
75,
(window.innerWidth-300)/window.innerHeight,
0.1,
1000
);

camera.position.set(0,3,6);

renderer = new THREE.WebGLRenderer({
canvas:document.getElementById("canvas"),
antialias:true
});

renderer.setSize(window.innerWidth-300,window.innerHeight);

controls = new OrbitControls(camera,renderer.domElement);

const light = new THREE.DirectionalLight(0xffffff,1);
light.position.set(5,10,5);
scene.add(light);

const ambient = new THREE.AmbientLight(0xffffff,0.6);
scene.add(ambient);

snowman = new THREE.Group();
scene.add(snowman);

}


window.loadPart = function(type,file){

const path = `models/${type}s/${file}`;

loader.load(path,function(gltf){

const model = gltf.scene;

model.traverse(child=>{
if(child.isMesh){
child.castShadow=true;
child.receiveShadow=true;
}
});

if(parts[type])
snowman.remove(parts[type]);

parts[type]=model;

snowman.add(model);

snapParts();

});

};


function snapParts(){

if(parts.bottom){

const bottomBox =
new THREE.Box3().setFromObject(parts.bottom);

const bottomHeight =
bottomBox.max.y-bottomBox.min.y;

parts.bottom.position.y = 0;

if(parts.torso){

const torsoBox =
new THREE.Box3().setFromObject(parts.torso);

const torsoHeight =
torsoBox.max.y-torsoBox.min.y;

parts.torso.position.y =
bottomHeight;

if(parts.head){

const headBox =
new THREE.Box3().setFromObject(parts.head);

const headHeight =
headBox.max.y-headBox.min.y;

parts.head.position.y =
bottomHeight + torsoHeight;

}

}

}

}


window.resizePart=function(type,scale){

if(parts[type]){

parts[type].scale.set(scale,scale,scale);

snapParts();

}

};


window.exportSTL=function(){

const exporter=new STLExporter();

const clone=snowman.clone(true);

clone.updateMatrixWorld(true);

const result=exporter.parse(clone);

const blob=new Blob([result],{type:'text/plain'});

const link=document.createElement("a");

link.href=URL.createObjectURL(blob);

link.download="snowman.stl";

link.click();

};


function animate(){

requestAnimationFrame(animate);

snowman.rotation.y+=0.005;

renderer.render(scene,camera);

}