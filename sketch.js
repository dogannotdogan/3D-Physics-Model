let easycam;
let gravitationalConstant = .001;
const pointsCount = 50;
const trailLength = 12;
const r = 200;
let particles = [];

function setup() { 
  createCanvas(windowWidth, windowHeight, WEBGL);
  easycam = createEasyCam({distance: windowWidth});
  noStroke();
  fill(200,200);
  
  const maxAbsVelocity = 1;
  const maxMass = 15;
  const minMass = 10;
  
  for (let i = 0; i < pointsCount; i++) {
    particles.push({
      mass: random(minMass,maxMass),
      x: random(-r,r),
      y: random(-r,r),
      z: random(-r,r),
      xv: random(-maxAbsVelocity,maxAbsVelocity),
      yv: random(-maxAbsVelocity,maxAbsVelocity),
      zv: random(-maxAbsVelocity,maxAbsVelocity),
      tx: Array(trailLength),
      ty: Array(trailLength),
      tz: Array(trailLength)
    });
  }
} 

function draw(){  
  background(0);
  
  // reset all forces on the particles
  particles.forEach(p => {
    p.xf = 0;
    p.yf = 0;
    p.zf = 0;
  });
  
  for(let i = 0; i < pointsCount; i++){
    const pi = particles[i];
    for(let j = i+1; j < pointsCount; j++){
      const pj = particles[j];
      const ddx = pj.x-pi.x;
      const ddy = pj.y-pi.y;
      const ddz = pj.z-pi.z;
      const d = sqrt((ddx*ddx)+(ddy*ddy)+(ddz*ddz));
      const mainF = (gravitationalConstant*pi.mass*pj.mass)/d;
      
      // determine gravitational force
      const xc = mainF*ddx;
      const yc = mainF*ddy;
      const zc = mainF*ddz;
      
      // apply gravitational force to both particles
      pi.xf += xc;
      pi.yf += yc;
      pi.zf += zc;
      pj.xf += -xc;
      pj.yf += -yc;
      pj.zf += -zc;
    }
    
    pi.xa = (pi.xf/pi.mass);
    pi.ya = (pi.yf/pi.mass);
    pi.za = (pi.zf/pi.mass);
  }
  
  let x = 0, y = 0, z = 0;
  particles.forEach(p => {
    // integrate acceleration for velocity
    p.xv += p.xa; 
    p.yv += p.ya; 
    p.zv += p.za;
    
    // integrate velocity for position
    p.x += p.xv; 
    p.y += p.yv; 
    p.z += p.zv;
    
    // track position across all particles
    x += p.x;
    y += p.y;
    z += p.z;
  });
  
  // compute average position across all particles
  x /= pointsCount;
  y /= pointsCount;
  z /= pointsCount;
  
  // offset by average position to keep everything centered
  translate(-x, -y, -z);
  
  particles.forEach(p => {    
    let spot = frameCount % trailLength;
    p.tx[spot] = p.x;
    p.ty[spot] = p.y;
    p.tz[spot] = p.z;
    
    // color by z position. this was previously using
    // lights() which had a nice falloff, but doesn't
    // seem to work the same in p5js
    fill(map(p.z - z, -r, r, 0, 255), 200);
    
    // draw each particle trail using all points
    // in previous versions i skipped the first and last
    // points, which was probably a bug.
    beginShape(TESS);
    for(let j = 0; j < trailLength; j++){
      vertex(p.tx[j], p.ty[j], p.tz[j]);
    }
    endShape(CLOSE);
  });
}
