import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.min.js';
import {createVehicleKit,FOMO_VEHICLE_COLOR} from '../village-vehicles.js';
import {createCampusKit} from '../village-campus-kit.js';
import {createCampusTraffic} from '../village-campus-life.js';

test('vehicle variants have grounded tires, road-sized bodies and outward-facing door logos',()=>{
  const kit=createVehicleKit(THREE);
  for(const style of ['sedan','crossover','shuttle']){
    const parent=new THREE.Group(),car=kit.create(parent,{style,branded:true});parent.updateMatrixWorld(true);
    const bounds=new THREE.Box3().setFromObject(car.group);
    assert.equal(car.wheels.length,4);
    assert(bounds.min.y>=.045-.001);assert(bounds.max.y<2.6);
    assert(bounds.max.x<1.2&&bounds.min.x>-1.2,'Vehicle must fit its lane');
    assert(bounds.max.z<car.model.length/2+.15&&bounds.min.z>-car.model.length/2-.15);
    for(const wheel of car.wheels){const b=new THREE.Box3().setFromObject(wheel);assert(Math.abs(b.min.y-.05)<1e-6);}
    const logo=car.group.getObjectByName('fomo-vehicle-logos'),normals=logo.geometry.attributes.normal;
    assert([...normals.array].every(Number.isFinite));
    assert([...Array(normals.count).keys()].some(i=>normals.getX(i)>.99));
    assert([...Array(normals.count).keys()].some(i=>normals.getX(i)<-.99));
    assert([...Array(normals.count).keys()].some(i=>normals.getY(i)>.99),'Roof logo must face the aerial camera');
    assert.equal(car.group.getObjectByName('vehicle-paint').material.color.getHex(),FOMO_VEHICLE_COLOR);
    const unbranded=kit.create(parent,{style});assert(!unbranded.group.getObjectByName('fomo-vehicle-logos'));
    assert.equal(car.model,unbranded.model,'Models must share cached geometry');
  }
});
test('traffic retains eight cars with a mixed fleet and rotating, steering front wheels',()=>{
  const kit=createCampusKit(THREE),traffic=createCampusTraffic(THREE,kit);
  assert.equal(traffic.cars.length,8);assert.equal(traffic.cars.filter(c=>c.branded).length,4);
  traffic.cars.forEach((car,i)=>{assert.equal(car.branded,i%2===1);if(car.branded)assert.equal(car.color,FOMO_VEHICLE_COLOR);});
  assert.deepEqual(new Set(traffic.cars.map(c=>c.style)),new Set(['sedan','crossover','shuttle']));
  const batch=traffic.fleet.batches.find(b=>b.records.some(r=>r.wheel)),index=batch.records.findIndex(r=>r.wheel&&r.position.z>0);
  const poses=traffic.cars.map(()=>({x:0,z:0,angle:0,steer:0}));
  traffic.fleet.update(poses,0);const start=new THREE.Matrix4();batch.mesh.getMatrixAt(index,start);
  traffic.fleet.update(poses,.1);const rolled=new THREE.Matrix4();batch.mesh.getMatrixAt(index,rolled);assert(!start.equals(rolled));
  poses.forEach(p=>p.steer=.3);traffic.fleet.update(poses,.1);const steered=new THREE.Matrix4();batch.mesh.getMatrixAt(index,steered);assert(!rolled.equals(steered));
  assert.equal(start.elements[13],rolled.elements[13],'Wheel rolling must not change axle height');
});

test('each parking row alternates fomo cars and retains exactly half branded after streaming',async()=>{
  const {createDistricts}=await import('../village-districts.js');
  const districts=createDistricts(THREE);
  for(const [x,z] of [[0,0],[300,300],[0,0]]){
    districts.update(x,z);
    let total=0,branded=0;
    for(const chunk of districts.chunks.values()){
      const cars=[];chunk.group.traverse(o=>{if(o.name==='parked-campus-car')cars.push(o);});
      cars.forEach((car,i)=>assert.equal(car.userData.branded,i%2===1));
      total+=cars.length;branded+=cars.filter(c=>c.userData.branded).length;
    }
    assert(total>0);assert.equal(branded,total/2);
  }
  districts.dispose();
});
