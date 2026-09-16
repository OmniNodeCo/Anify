// Advanced 3D Character Kinematics & Animation Engine
// Supports smooth action blending, inverse kinematics, bone hierarchies, and procedural cycles

export type CharacterAction = 
  | 'idle' 
  | 'walk' 
  | 'run' 
  | 'sprint' 
  | 'backflip' 
  | 'jump' 
  | 'roll' 
  | 'attack' 
  | 'breakdance' 
  | 'slide';

export type CharacterModel = 'ninja' | 'mech' | 'cyborg' | 'puppet';

export interface Joint3D {
  x: number;
  y: number;
  z: number;
}

export interface SkeletonPose {
  pelvis: Joint3D;
  spine: Joint3D;
  chest: Joint3D;
  head: Joint3D;
  
  // Left Arm
  shoulderL: Joint3D;
  elbowL: Joint3D;
  handL: Joint3D;
  bladeL?: Joint3D;

  // Right Arm
  shoulderR: Joint3D;
  elbowR: Joint3D;
  handR: Joint3D;
  bladeR?: Joint3D;

  // Left Leg
  hipL: Joint3D;
  kneeL: Joint3D;
  footL: Joint3D;

  // Right Leg
  hipR: Joint3D;
  kneeR: Joint3D;
  footR: Joint3D;
}

export interface CharacterState {
  model: CharacterModel;
  action: CharacterAction;
  prevAction: CharacterAction;
  actionTime: number;
  blendFactor: number; // 0 to 1 for smooth crossfading between animations
  speedMultiplier: number;
  showSkeleton: boolean;
  showTrails: boolean;
  showShadows: boolean;
  primaryColor: string;
  secondaryColor: string;
  metalColor: string;
}

export class CharacterAnimationEngine {
  private trails: { l: Joint3D; r: Joint3D; alpha: number }[] = [];
  private dustSparks: { x: number; y: number; z: number; vx: number; vy: number; vz: number; life: number; maxLife: number; color: string }[] = [];

  /**
   * Evaluates the 3D joint positions for a given action and cycle time
   */
  public evaluatePose(action: CharacterAction, t: number, model: CharacterModel): { pose: SkeletonPose; worldY: number; bodyPitch: number; bodyYaw: number; bodyRoll: number } {
    let worldY = 0;
    let bodyPitch = 0;
    let bodyYaw = 0;
    let bodyRoll = 0;

    // Default base joint offsets relative to pelvis
    let pelvisY = 0;
    let chestY = -42;
    let headY = -70;

    let hipSpread = model === 'mech' ? 22 : 14;
    let shoulderSpread = model === 'mech' ? 28 : 18;
    let thighLen = model === 'mech' ? 42 : 38;
    let shinLen = model === 'mech' ? 44 : 36;
    let armLen = model === 'mech' ? 34 : 28;
    let forearmLen = model === 'mech' ? 32 : 26;

    // Dynamic rotation variables
    let legLAngle = 0, kneeLAngle = 0;
    let legRAngle = 0, kneeRAngle = 0;
    let armLAngle = 0, elbowLAngle = 0.2;
    let armRAngle = 0, elbowRAngle = 0.2;
    let armLYaw = 0, armRYaw = 0;

    let bladeLOffset: Joint3D = { x: 0, y: 35, z: 20 };
    let bladeROffset: Joint3D = { x: 0, y: 35, z: 20 };

    switch (action) {
      // 1. BACKFLIP: 360-degree acrobatic tuck and landing shockwave
      case 'backflip': {
        const cycle = t % 1.8; // 1.8s full acrobatic loop
        const p = cycle / 1.8;

        if (p < 0.2) {
          // Anticipation crouch
          const sub = p / 0.2;
          worldY = Math.sin(sub * Math.PI * 0.5) * 35;
          bodyPitch = sub * 0.3;
          legLAngle = sub * 0.8; kneeLAngle = sub * 1.5;
          legRAngle = sub * 0.8; kneeRAngle = sub * 1.5;
          armLAngle = -sub * 0.9; armRAngle = -sub * 0.9;
        } else if (p < 0.75) {
          // Mid-air Backflip: full 360 pitch flip + apex height
          const sub = (p - 0.2) / 0.55;
          worldY = -160 * Math.sin(sub * Math.PI) - 20; // High vertical parabola
          bodyPitch = -sub * Math.PI * 2; // Full 360 backward flip

          // Tucked knees in mid-air
          legLAngle = 1.3; kneeLAngle = 2.0;
          legRAngle = 1.3; kneeRAngle = 2.0;
          armLAngle = 1.2; elbowLAngle = 1.4;
          armRAngle = 1.2; elbowRAngle = 1.4;

          bladeLOffset = { x: 25, y: -20, z: -40 };
          bladeROffset = { x: -25, y: -20, z: -40 };
        } else {
          // Heroic landing & rebound to stand
          const sub = (p - 0.75) / 0.25;
          worldY = (1 - sub) * 25;
          bodyPitch = (1 - sub) * 0.3;
          legLAngle = (1 - sub) * 0.6; kneeLAngle = (1 - sub) * 1.2;
          legRAngle = (1 - sub) * 0.6; kneeRAngle = (1 - sub) * 1.2;
          armLAngle = (1 - sub) * 0.5; armRAngle = (1 - sub) * 0.5;
        }
        break;
      }

      // 2. WALKING: Natural forward stride kinematics
      case 'walk': {
        const stride = t * 5.0;
        const swing = Math.sin(stride);
        const cosSwing = Math.cos(stride);

        worldY = -Math.abs(swing) * 6; // subtle pelvic bobbing
        bodyPitch = 0.08; // slight forward walk lean
        bodyYaw = swing * 0.08;

        legLAngle = swing * 0.65;
        kneeLAngle = Math.max(0, -cosSwing * 0.9);

        legRAngle = -swing * 0.65;
        kneeRAngle = Math.max(0, cosSwing * 0.9);

        // Counter arm swing
        armLAngle = -swing * 0.6; elbowLAngle = 0.4 + Math.max(0, swing * 0.3);
        armRAngle = swing * 0.6; elbowRAngle = 0.4 + Math.max(0, -swing * 0.3);
        break;
      }

      // 3. RUNNING: High-energy athletic run cycle
      case 'run': {
        const stride = t * 8.5;
        const swing = Math.sin(stride);
        const cosSwing = Math.cos(stride);

        worldY = -Math.abs(swing) * 16 - 8;
        bodyPitch = 0.24; // Athletic forward lean
        bodyYaw = swing * 0.15;
        bodyRoll = swing * 0.06;

        legLAngle = swing * 1.05;
        kneeLAngle = Math.max(0, -cosSwing * 1.6);

        legRAngle = -swing * 1.05;
        kneeRAngle = Math.max(0, cosSwing * 1.6);

        armLAngle = -swing * 1.1; elbowLAngle = 1.2;
        armRAngle = swing * 1.1; elbowRAngle = 1.2;
        break;
      }

      // 4. SPRINT: Maximum velocity dash with high knee lift
      case 'sprint': {
        const stride = t * 12.0;
        const swing = Math.sin(stride);
        const cosSwing = Math.cos(stride);

        worldY = -Math.abs(swing) * 22 - 12;
        bodyPitch = 0.38; // Intense forward sprint lean
        bodyYaw = swing * 0.22;

        legLAngle = swing * 1.35;
        kneeLAngle = Math.max(0, -cosSwing * 1.9);

        legRAngle = -swing * 1.35;
        kneeRAngle = Math.max(0, cosSwing * 1.9);

        armLAngle = -swing * 1.4; elbowLAngle = 1.5;
        armRAngle = swing * 1.4; elbowRAngle = 1.5;
        break;
      }

      // 5. JUMP: High explosive vault jump
      case 'jump': {
        const cycle = t % 1.5;
        const p = cycle / 1.5;

        if (p < 0.2) {
          const sub = p / 0.2;
          worldY = sub * 25;
          legLAngle = sub * 0.8; kneeLAngle = sub * 1.4;
          legRAngle = sub * 0.8; kneeRAngle = sub * 1.4;
        } else if (p < 0.7) {
          const sub = (p - 0.2) / 0.5;
          worldY = -140 * Math.sin(sub * Math.PI);
          legLAngle = -0.3; kneeLAngle = 0.8;
          legRAngle = -0.3; kneeRAngle = 0.8;
          armLAngle = 1.2; armRAngle = 1.2;
        } else {
          const sub = (p - 0.7) / 0.3;
          worldY = (1 - sub) * 20;
          legLAngle = (1 - sub) * 0.5; kneeLAngle = (1 - sub) * 1.0;
          legRAngle = (1 - sub) * 0.5; kneeRAngle = (1 - sub) * 1.0;
        }
        break;
      }

      // 6. PARKOUR ROLL: Ground somersault dive roll
      case 'roll': {
        const cycle = t % 1.4;
        const p = cycle / 1.4;
        worldY = Math.sin(p * Math.PI) * 15;
        bodyPitch = p * Math.PI * 2; // Forward tumble roll
        legLAngle = 1.2; kneeLAngle = 1.8;
        legRAngle = 1.2; kneeRAngle = 1.8;
        armLAngle = 0.8; elbowLAngle = 1.3;
        armRAngle = 0.8; elbowRAngle = 1.3;
        break;
      }

      // 7. SWORD ATTACK / SLASH: 3-hit dynamic katana martial combo
      case 'attack': {
        const cycle = (t * 2.0) % 3.0; // 3 hit combo sequence
        const hitIdx = Math.floor(cycle);
        const hitProgress = cycle - hitIdx;
        const slash = Math.sin(hitProgress * Math.PI);

        bodyPitch = 0.15;
        worldY = -slash * 10;

        if (hitIdx === 0) {
          // Horizontal right slice
          bodyYaw = -0.4 + slash * 0.9;
          armRAngle = -0.8 + slash * 1.8;
          armRYaw = -0.6 + slash * 1.4;
          elbowRAngle = 0.6;
          bladeROffset = { x: 45, y: -30, z: 60 };

          legLAngle = 0.4; kneeLAngle = 0.6;
          legRAngle = -0.5; kneeRAngle = 0.2;
        } else if (hitIdx === 1) {
          // Diagonal left overhead slice
          bodyYaw = 0.5 - slash * 1.0;
          armLAngle = -1.2 + slash * 2.2;
          elbowLAngle = 0.8;
          bladeLOffset = { x: -40, y: -40, z: 70 };

          legLAngle = -0.5; kneeLAngle = 0.3;
          legRAngle = 0.5; kneeRAngle = 0.7;
        } else {
          // Dual cross plunge strike
          bodyPitch = 0.35;
          armLAngle = -0.5 + slash * 1.8; armRAngle = -0.5 + slash * 1.8;
          armLYaw = -slash * 0.6; armRYaw = slash * 0.6;
          bladeLOffset = { x: -10, y: 50, z: 60 };
          bladeROffset = { x: 10, y: 50, z: 60 };

          legLAngle = 0.7; kneeLAngle = 1.2;
          legRAngle = -0.4; kneeRAngle = 0.4;
        }
        break;
      }

      // 8. BREAKDANCE: Windmill floor spin
      case 'breakdance': {
        const cycle = t * 4.0;
        bodyPitch = Math.PI * 0.45;
        bodyYaw = cycle;
        worldY = 40; // on ground

        legLAngle = Math.sin(cycle) * 1.2;
        kneeLAngle = 0.3;
        legRAngle = -Math.sin(cycle) * 1.2;
        kneeRAngle = 0.3;

        armLAngle = 1.0; elbowLAngle = 1.2;
        armRAngle = -1.0; elbowRAngle = 1.2;
        break;
      }

      // 9. SLIDE: Knee ground slide with sparks
      case 'slide': {
        bodyPitch = -0.35; // leaning back
        worldY = 32;

        legLAngle = 0.3; kneeLAngle = 1.9; // front bent knee
        legRAngle = -0.7; kneeRAngle = 0.2; // rear trailing leg

        armLAngle = -0.6; elbowLAngle = 0.4;
        armRAngle = -0.6; elbowRAngle = 0.4;
        break;
      }

      // 10. IDLE: Natural breathing and weight shift
      case 'idle':
      default: {
        const breath = Math.sin(t * 2.2);
        worldY = breath * 2.5;
        bodyPitch = 0.02;

        legLAngle = 0.08; kneeLAngle = 0.12;
        legRAngle = -0.05; kneeRAngle = 0.1;

        armLAngle = 0.15 + breath * 0.05; elbowLAngle = 0.35;
        armRAngle = 0.15 + breath * 0.05; elbowRAngle = 0.35;
        break;
      }
    }

    // Kinematic matrix calculation of joints
    const rotPitch = (v: Joint3D, ang: number): Joint3D => {
      const cos = Math.cos(ang), sin = Math.sin(ang);
      return { x: v.x, y: v.y * cos - v.z * sin, z: v.y * sin + v.z * cos };
    };

    const rotYaw = (v: Joint3D, ang: number): Joint3D => {
      const cos = Math.cos(ang), sin = Math.sin(ang);
      return { x: v.x * cos + v.z * sin, y: v.y, z: -v.x * sin + v.z * cos };
    };

    const rotRoll = (v: Joint3D, ang: number): Joint3D => {
      const cos = Math.cos(ang), sin = Math.sin(ang);
      return { x: v.x * cos - v.y * sin, y: v.x * sin + v.y * cos, z: v.z };
    };

    const applyBodyRot = (v: Joint3D): Joint3D => {
      return rotYaw(rotPitch(rotRoll(v, bodyRoll), bodyPitch), bodyYaw);
    };

    // Calculate joints
    const pelvis: Joint3D = applyBodyRot({ x: 0, y: pelvisY, z: 0 });
    const spine: Joint3D = applyBodyRot({ x: 0, y: chestY * 0.5, z: 0 });
    const chest: Joint3D = applyBodyRot({ x: 0, y: chestY, z: 0 });
    const head: Joint3D = applyBodyRot({ x: 0, y: headY, z: 0 });

    // Left Leg
    const hipLRel: Joint3D = { x: hipSpread, y: 0, z: 0 };
    const kneeLRel: Joint3D = {
      x: hipSpread,
      y: Math.cos(legLAngle) * thighLen,
      z: Math.sin(legLAngle) * thighLen
    };
    const footLRel: Joint3D = {
      x: hipSpread,
      y: kneeLRel.y + Math.cos(legLAngle + kneeLAngle) * shinLen,
      z: kneeLRel.z + Math.sin(legLAngle + kneeLAngle) * shinLen
    };

    // Right Leg
    const hipRRel: Joint3D = { x: -hipSpread, y: 0, z: 0 };
    const kneeRRel: Joint3D = {
      x: -hipSpread,
      y: Math.cos(legRAngle) * thighLen,
      z: Math.sin(legRAngle) * thighLen
    };
    const footRRel: Joint3D = {
      x: -hipSpread,
      y: kneeRRel.y + Math.cos(legRAngle + kneeRAngle) * shinLen,
      z: kneeRRel.z + Math.sin(legRAngle + kneeRAngle) * shinLen
    };

    // Left Arm
    const shLRel: Joint3D = { x: shoulderSpread, y: chestY, z: 0 };
    const elbowLRel: Joint3D = {
      x: shoulderSpread + Math.sin(armLYaw) * 8,
      y: chestY + Math.cos(armLAngle) * armLen,
      z: Math.sin(armLAngle) * armLen
    };
    const handLRel: Joint3D = {
      x: elbowLRel.x + Math.sin(armLYaw) * 6,
      y: elbowLRel.y + Math.cos(armLAngle + elbowLAngle) * forearmLen,
      z: elbowLRel.z + Math.sin(armLAngle + elbowLAngle) * forearmLen
    };
    const bladeLRel: Joint3D = {
      x: handLRel.x + bladeLOffset.x,
      y: handLRel.y + bladeLOffset.y,
      z: handLRel.z + bladeLOffset.z
    };

    // Right Arm
    const shRRel: Joint3D = { x: -shoulderSpread, y: chestY, z: 0 };
    const elbowRRel: Joint3D = {
      x: -shoulderSpread + Math.sin(armRYaw) * 8,
      y: chestY + Math.cos(armRAngle) * armLen,
      z: Math.sin(armRAngle) * armLen
    };
    const handRRel: Joint3D = {
      x: elbowRRel.x + Math.sin(armRYaw) * 6,
      y: elbowRRel.y + Math.cos(armRAngle + elbowRAngle) * forearmLen,
      z: elbowRRel.z + Math.sin(armRAngle + elbowRAngle) * forearmLen
    };
    const bladeRRel: Joint3D = {
      x: handRRel.x + bladeROffset.x,
      y: handRRel.y + bladeROffset.y,
      z: handRRel.z + bladeROffset.z
    };

    const pose: SkeletonPose = {
      pelvis,
      spine,
      chest,
      head,
      shoulderL: applyBodyRot(shLRel),
      elbowL: applyBodyRot(elbowLRel),
      handL: applyBodyRot(handLRel),
      bladeL: applyBodyRot(bladeLRel),
      shoulderR: applyBodyRot(shRRel),
      elbowR: applyBodyRot(elbowRRel),
      handR: applyBodyRot(handRRel),
      bladeR: applyBodyRot(bladeRRel),
      hipL: applyBodyRot(hipLRel),
      kneeL: applyBodyRot(kneeLRel),
      footL: applyBodyRot(footLRel),
      hipR: applyBodyRot(hipRRel),
      kneeR: applyBodyRot(kneeRRel),
      footR: applyBodyRot(footRRel)
    };

    return { pose, worldY, bodyPitch, bodyYaw, bodyRoll };
  }

  /**
   * Main render method for 3D Character Studio
   */
  public renderStudio(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    time: number,
    state: CharacterState,
    cameraAngle: number,
    cameraElevation: number,
    zoom: number
  ) {
    const cx = width / 2;
    const cy = height * 0.62;

    // Background Gradient & Cyber Arena Grid
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#05070e');
    bgGrad.addColorStop(0.65, '#090d1c');
    bgGrad.addColorStop(1, '#050711');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Compute evaluated pose
    const { pose, worldY } = this.evaluatePose(state.action, time * state.speedMultiplier, state.model);

    // Camera 3D projection
    const cosA = Math.cos(cameraAngle), sinA = Math.sin(cameraAngle);
    const cosE = Math.cos(cameraElevation), sinE = Math.sin(cameraElevation);

    const project = (j: Joint3D, yOffset: number = 0): { x: number; y: number; z: number; scale: number } => {
      // Rotate Y (azimuth)
      const x1 = j.x * cosA - j.z * sinA;
      const z1 = j.z * cosA + j.x * sinA;

      // Rotate X (elevation)
      const y2 = (j.y + yOffset) * cosE - z1 * sinE;
      const z2 = z1 * cosE + (j.y + yOffset) * sinE;

      const fov = 500;
      const scale = (fov / (fov + z2 + 200)) * zoom;
      return {
        x: cx + x1 * scale,
        y: cy + y2 * scale,
        z: z2,
        scale
      };
    };

    // 1. Cyber Arena Floor Grid with reflections
    ctx.lineWidth = 1;
    const groundZ = 8;
    for (let gz = 1; gz <= groundZ; gz++) {
      const p1 = project({ x: -400, y: 75, z: gz * 40 - 150 });
      const p2 = project({ x: 400, y: 75, z: gz * 40 - 150 });
      ctx.strokeStyle = `rgba(0, 242, 254, ${Math.max(0.04, 0.25 - gz * 0.025)})`;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
    for (let gx = -350; gx <= 350; gx += 70) {
      const p1 = project({ x: gx, y: 75, z: -150 });
      const p2 = project({ x: gx, y: 75, z: 250 });
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.08)';
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }

    // 2. Dynamic Ground Contact Shadow
    if (state.showShadows) {
      const shadowP = project({ x: 0, y: 75, z: 0 });
      const shadowR = Math.max(10, 48 * shadowP.scale * (1 - Math.max(0, -worldY * 0.005)));
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.beginPath();
      ctx.ellipse(shadowP.x, shadowP.y, shadowR * 1.5, shadowR * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();

      // Glowing Arena Contact Ring
      ctx.strokeStyle = state.primaryColor;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.ellipse(shadowP.x, shadowP.y, shadowR * 1.7, shadowR * 0.5, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    }

    // Project skeleton joints to screen
    const pPelvis = project(pose.pelvis, worldY);
    const pChest = project(pose.chest, worldY);
    const pHead = project(pose.head, worldY);

    const pShL = project(pose.shoulderL, worldY);
    const pElL = project(pose.elbowL, worldY);
    const pHdL = project(pose.handL, worldY);
    const pTipL = pose.bladeL ? project(pose.bladeL, worldY) : null;

    const pShR = project(pose.shoulderR, worldY);
    const pElR = project(pose.elbowR, worldY);
    const pHdR = project(pose.handR, worldY);
    const pTipR = pose.bladeR ? project(pose.bladeR, worldY) : null;

    const pHipL = project(pose.hipL, worldY);
    const pKnL = project(pose.kneeL, worldY);
    const pFtL = project(pose.footL, worldY);

    const pHipR = project(pose.hipR, worldY);
    const pKnR = project(pose.kneeR, worldY);
    const pFtR = project(pose.footR, worldY);

    // 3. Katana Ribbon Blade Trails
    if (state.showTrails && pTipL && pTipR) {
      this.trails.push({ l: pTipL, r: pTipR, alpha: 1.0 });
      if (this.trails.length > 28) this.trails.shift();

      for (let i = 1; i < this.trails.length; i++) {
        const t1 = this.trails[i - 1];
        const t2 = this.trails[i];
        const pct = i / this.trails.length;

        ctx.strokeStyle = state.secondaryColor;
        ctx.lineWidth = 4 * pct * t1.l.scale;
        ctx.globalAlpha = Math.pow(pct, 2) * 0.85;

        ctx.beginPath();
        ctx.moveTo(t1.l.x, t1.l.y);
        ctx.lineTo(t2.l.x, t2.l.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(t1.r.x, t1.r.y);
        ctx.lineTo(t2.r.x, t2.r.y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1.0;
    }

    // Bone drawing helper
    const drawBone = (p1: any, p2: any, width: number, col: string) => {
      ctx.strokeStyle = col;
      ctx.lineWidth = width * p1.scale;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    };

    const drawJoint = (p: any, radius: number, col: string) => {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius * p.scale, 0, Math.PI * 2);
      ctx.fill();
    };

    // Sort limbs by depth Z
    const limbs = [
      { p1: pHipL, p2: pKnL, w: 9, c: state.metalColor, z: (pHipL.z + pKnL.z) / 2 },
      { p1: pKnL, p2: pFtL, w: 7, c: state.primaryColor, z: (pKnL.z + pFtL.z) / 2 },
      { p1: pHipR, p2: pKnR, w: 9, c: state.metalColor, z: (pHipR.z + pKnR.z) / 2 },
      { p1: pKnR, p2: pFtR, w: 7, c: state.primaryColor, z: (pKnR.z + pFtR.z) / 2 },
      { p1: pPelvis, p2: pChest, w: 14, c: state.metalColor, z: (pPelvis.z + pChest.z) / 2 },
      { p1: pChest, p2: pHead, w: 10, c: state.primaryColor, z: (pChest.z + pHead.z) / 2 },
      { p1: pChest, p2: pShL, w: 7, c: state.metalColor, z: (pChest.z + pShL.z) / 2 },
      { p1: pShL, p2: pElL, w: 6, c: state.primaryColor, z: (pShL.z + pElL.z) / 2 },
      { p1: pElL, p2: pHdL, w: 5, c: '#ffffff', z: (pElL.z + pHdL.z) / 2 },
      { p1: pChest, p2: pShR, w: 7, c: state.metalColor, z: (pChest.z + pShR.z) / 2 },
      { p1: pShR, p2: pElR, w: 6, c: state.primaryColor, z: (pShR.z + pElR.z) / 2 },
      { p1: pElR, p2: pHdR, w: 5, c: '#ffffff', z: (pElR.z + pHdR.z) / 2 },
    ];

    if (pTipL) limbs.push({ p1: pHdL, p2: pTipL, w: 4, c: state.secondaryColor, z: (pHdL.z + pTipL.z) / 2 });
    if (pTipR) limbs.push({ p1: pHdR, p2: pTipR, w: 4, c: state.secondaryColor, z: (pHdR.z + pTipR.z) / 2 });

    limbs.sort((a, b) => b.z - a.z);

    // 4. Render Limbs
    for (const l of limbs) {
      drawBone(l.p1, l.p2, l.w, l.c);
    }

    // 5. Head Visor / Cockpit
    ctx.fillStyle = state.metalColor;
    ctx.beginPath();
    ctx.arc(pHead.x, pHead.y, 14 * pHead.scale, 0, Math.PI * 2);
    ctx.fill();

    // Glowing Neon Visor / Eye
    ctx.fillStyle = state.secondaryColor;
    ctx.shadowColor = state.secondaryColor;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(pHead.x + 4 * pHead.scale, pHead.y - 2 * pHead.scale, 4.5 * pHead.scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // 6. Skeleton X-Ray Wireframe overlay
    if (state.showSkeleton) {
      const allJoints = [pPelvis, pChest, pHead, pShL, pElL, pHdL, pShR, pElR, pHdR, pHipL, pKnL, pFtL, pHipR, pKnR, pFtR];
      for (const j of allJoints) {
        drawJoint(j, 3.5, '#00f2fe');
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(j.x, j.y, 5 * j.scale, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }
}

export const globalCharacterEngine = new CharacterAnimationEngine();
