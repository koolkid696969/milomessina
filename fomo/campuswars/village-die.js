import {DIE_TABLE,dieSeat,dieTurn} from './village-layout.js?v=65';
import {lawnGameKit,throwingHand} from './village-pong.js?v=56';

// Die: two players a side, one cup each, and a die thrown to bounce off the
// table into a cup opposite. Tables share the pong layout and clock conventions.
export function createDieGames(T,members){
  const root=new T.Group();root.name='chapter-die-games';const games=[];
  const kit=lawnGameKit(T),boxGeometry=kit.box,cupGeometry=kit.cup,rimGeometry=kit.rim;
  const {top,metal,red,white}=kit;
  function box(parent,x,y,z,w,h,d,material){const mesh=new T.Mesh(boxGeometry,material);mesh.position.set(x,y,z);mesh.scale.set(w,h,d);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
  const {x,z,width,length,height,cupOffset}=DIE_TABLE;
  for(const player of members.filter(m=>m.action==='die'&&m.seat===0)){
    const table=members.filter(m=>m.chapter===player.chapter&&m.action==='die');
    const players=[0,1,2,3].map(seat=>table.find(m=>m.seat===seat)),group=new T.Group();
    group.name=`die-${player.chapter}`;group.position.set(player.lot.x,0,player.lot.z);group.rotation.y=player.lot.rotation;root.add(group);
    box(group,x,height,z,width,.07,length,top);
    for(const side of [-1,1])for(const dx of [-width/2+.1,width/2-.1])box(group,x+dx,height/2,z+side*(length/2-.08),.05,height,.05,metal);
    const cups=[0,1,2,3].map(seat=>{
      const {side,dx}=dieSeat(seat),cx=x+dx,cz=z+side*cupOffset;
      const cup=new T.Mesh(cupGeometry,red),rim=new T.Mesh(rimGeometry,white);
      cup.position.set(cx,height+.145,cz);group.add(cup);
      rim.rotation.x=-Math.PI/2;rim.position.set(cx,height+.25,cz);group.add(rim);
      return cup;
    });
    // Every thrown die is one instance of a single world-space mesh, so the
    // tables batch and all the dice in the village cost one draw between them.
    const die=new T.Object3D();die.name=`die-cube-${player.chapter}`;
    games.push({chapter:player.chapter,group,players,die,cups});
  }
  const dice=new T.InstancedMesh(new T.BoxGeometry(.075,.075,.075),white,Math.max(1,games.length));
  dice.name='chapter-dice';dice.instanceMatrix.setUsage(T.DynamicDrawUsage);dice.frustumCulled=false;dice.castShadow=false;root.add(dice);
  const toWorldPoint=(game,point)=>point.clone().applyAxisAngle(new T.Vector3(0,1,0),game.players[0].lot.rotation).add(new T.Vector3(game.players[0].lot.x,0,game.players[0].lot.z));
  // The bounce lands on the thrower's half of the table, in line with the target cup.
  function bouncePoint(game,shot){
    const thrower=dieSeat(shot.seat),target=dieSeat(shot.target);
    return toWorldPoint(game,new T.Vector3(x+(thrower.dx+target.dx)/2,height+.073,z+thrower.side*(length/2-.18)));
  }
  function cupPoint(game,shot){const local=game.cups[shot.target].position;return toWorldPoint(game,new T.Vector3(local.x,height+.14,local.z));}
  function write(game,index){
    game.die.scale.setScalar(game.die.visible?1:0);game.die.updateMatrix();dice.setMatrixAt(index,game.die.matrix);
  }
  function animate(time){
    games.forEach((game,index)=>{
      const shot=dieTurn(game.chapter,time),thrower=game.players[shot.seat],t=shot.elapsed;
      game.die.visible=t<shot.release+shot.flight+.12;
      if(!game.die.visible){write(game,index);return;}
      if(t<shot.release){game.die.rotation.set(.4,shot.turn,.25);game.die.position.copy(throwingHand(T,thrower,time));write(game,index);return;}
      game.die.rotation.set(t*7.3+shot.turn,t*5.1,t*6.4);
      const bounce=bouncePoint(game,shot),cup=cupPoint(game,shot),u=Math.min(1,(t-shot.release)/shot.flight);
      if(u<shot.bounce){
        const s=u/shot.bounce,start=throwingHand(T,thrower,time-(t-shot.release));
        game.die.position.lerpVectors(start,bounce,s);game.die.position.y+=4*.38*s*(1-s);
      }else{
        const s=(u-shot.bounce)/(1-shot.bounce);
        game.die.position.lerpVectors(bounce,cup,s);game.die.position.y+=4*.26*s*(1-s);
      }
      write(game,index);
    });
    dice.instanceMatrix.needsUpdate=true;
  }
  animate(0);return {root,games,dice,animate,handPosition:(player,time)=>throwingHand(T,player,time)};
}
