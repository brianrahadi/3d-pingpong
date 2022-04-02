var canvas = document.getElementById("renderCanvas");

var startRenderLoop = function (engine, canvas) {
  engine.runRenderLoop(function () {
    if (sceneToRender && sceneToRender.activeCamera) {
      sceneToRender.render();
    }
  });
};

var engine = null;
var scene = null;
var sceneToRender = null;
var createDefaultEngine = function () {
  return new BABYLON.Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true,
    disableWebGL2Support: false,
  });
};

var createScene = function () {
  var scene = new BABYLON.Scene(engine);

  // I make the camera to be from above
  var camera = new BABYLON.ArcRotateCamera(
    "Camera",
    -Math.PI / 2,
    Math.PI / 3,
    90,
    BABYLON.Vector3.Zero(),
    scene
  );
  // var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);

  // This targets the camera to scene origin
  camera.setTarget(BABYLON.Vector3.Zero());

  // This attaches the camera to the canvas
  camera.attachControl(canvas, true);

  let ball = BABYLON.MeshBuilder.CreateSphere("ball", {
    diameter: 3,
  });

  let light = new BABYLON.DirectionalLight(
    "light",
    new BABYLON.Vector3(0, -1, 0)
  );

  let ambient = new BABYLON.HemisphericLight(
    "ambient",
    new BABYLON.Vector3(0, 1, 0)
  );
  ambient.intensity = 0.6;

  light.diffuse = new BABYLON.Color3(0.8, 0.8, 1);
  ambient.groundColor = new BABYLON.Color3(0, 0.3, 0);
  ambient.specular = new BABYLON.Color3(1, 1, 1);

  let ground = new BABYLON.MeshBuilder.CreateGround("ground", {
    width: 60,
    height: 40,
    depth: 100,
  });
  ground.position.y = -5;

  let groundMaterial = new BABYLON.StandardMaterial("ground material");
  ground.material = groundMaterial;
  groundMaterial.diffuseColor = new BABYLON.Color3(1, 0.1, 1);
  groundMaterial.diffuseTexture = new BABYLON.Texture(
    "https://media.istockphoto.com/photos/blue-neon-frame-picture-id1290826577?b=1&k=20&m=1290826577&s=170667a&w=0&h=fgQvvrHbekIpDJg1Ob9ceOiJO2OCPaRAZMAYCkwzEXY="
  );

  let backWall = new BABYLON.MeshBuilder.CreateCylinder("cylinder", {
    height: 60,
    diameter: 1,
    tessellation: 0,
  });

  backWall.rotation.z = (1 / 2) * Math.PI;
  backWall.position.z = 20;

  let frontWall = new BABYLON.MeshBuilder.CreateCylinder("cylinder", {
    height: 60,
    diameter: 1,
    tessellation: 0,
  });
  frontWall.rotation.z = (1 / 2) * Math.PI;
  frontWall.position.z = -20;

  let leftPaddle = new BABYLON.MeshBuilder.CreateBox("box", {
    width: 0,
    height: 0,
    depth: 7,
  });
  leftPaddle.position.x = -30;

  let rightPaddle = new BABYLON.MeshBuilder.CreateBox("box", {
    width: 0,
    height: 0,
    depth: 7,
  });
  rightPaddle.position.x = 30;

  ball.material = new BABYLON.StandardMaterial("x-material");
  ball.material.diffuseColor = new BABYLON.Color3(0, 1, 0);

  wallMaterial = new BABYLON.StandardMaterial("wall material");
  wallMaterial.diffuseColor = new BABYLON.Color3(75 / 256, 0, 130 / 256);
  backWall.material = wallMaterial;
  frontWall.material = wallMaterial;

  paddleMaterial = new BABYLON.StandardMaterial("padde material");
  paddleMaterial.diffuseColor = new BABYLON.Color3(1, 0.5, 0.5);
  leftPaddle.material = paddleMaterial;
  rightPaddle.material = paddleMaterial;

  // animation part
  const frameRate = 30;
  // set animation length
  const animationLength = 10;

  ballVelocity = {
    vx: 0.25,
    vz: 0.25,
  };

  leftPaddleVz = 0;
  rightPaddleVz = 0;

  scene.actionManager = new BABYLON.ActionManager(scene);
  scene.actionManager.registerAction(
    new BABYLON.ExecuteCodeAction(
      BABYLON.ActionManager.OnKeyDownTrigger,
      function (keyInfo) {
        let keyDirection = keyInfo.sourceEvent.key;
        if (keyDirection == "w") {
          leftPaddleVz = 0.25;
        } else if (keyDirection == "s") {
          leftPaddleVz = -0.25;
          console.log(leftPaddleVz);
        } else if (keyDirection == "i") {
          rightPaddleVz = 0.25;
        } else if (keyDirection == "k") {
          rightPaddleVz = -0.25;
        }
      }
    )
  );

  scene.registerBeforeRender(() => {
    if (leftPaddle.position.z > 15 || leftPaddle.position.z < -15) {
      leftPaddleVz *= -1;
    }

    if (rightPaddle.position.z > 15 || rightPaddle.position.z < -15) {
      rightPaddleVz *= -1;
    }

    if (ball.position.x > 75 || ball.position.x < -75) {
      ball.position.x = 0;
      ball.position.z = 0;
      ballVelocity.vx = Math.random() < 0.5 ? 0.25 : -0.25;
      ballVelocity.vy = Math.random() < 0.5 ? 0.25 : -0.25;
    }

    leftPaddle.position.z += leftPaddleVz;
    rightPaddle.position.z += rightPaddleVz;

    ball.position.x += ballVelocity.vx;
    ball.position.z += ballVelocity.vz;

    leftPaddleVz *= 0.95;
    rightPaddleVz *= 0.95;

    if (
      ball.intersectsMesh(leftPaddle, false) ||
      ball.intersectsMesh(rightPaddle, false) ||
      ball.intersectsMesh(frontWall, false) ||
      ball.intersectsMesh(backWall, false)
    ) {
      ballVelocity.vz = -1.02 * ballVelocity.vz;
      ball.position.z += ballVelocity.vz + 2 * ballVelocity.vz;
    }
    if (
      ball.intersectsMesh(leftPaddle, false) ||
      ball.intersectsMesh(rightPaddle, false)
    ) {
      ballVelocity.vx = -1.02 * ballVelocity.vx;
      ball.position.x += ballVelocity.vx + 2 * ballVelocity.vx;
    }
  });

  let movingBall1 = BABYLON.MeshBuilder.CreateSphere("movingBall", {
    diameter: 3,
  });

  // start of animation keyframe for moving ball 1
  movingBall1.position.z = 20;
  // movingBall.position.y = 3;

  movingBall1.material = new BABYLON.StandardMaterial(
    "moving ball material"
  );
  movingBall1.material.diffuseColor = new BABYLON.Color3(1, 1, 1);
  movingBall1.material.diffuseTexture = new BABYLON.Texture(
    "https://static.vecteezy.com/system/resources/previews/002/700/734/non_2x/neon-fire-icon-elements-in-neon-style-icons-simple-neon-flame-icon-for-websites-web-design-mobile-app-isolated-on-brick-wall-vector.jpg"
  );

  let movingBall1Animation = new BABYLON.Animation(
    "moving ball animation",
    "position.x",
    frameRate,
    BABYLON.Animation.ANIMATIONTYPE_FLOAT,
    BABYLON.Animation.ANIMATIONLOOPMODE_LOOP
  );

  let movingBall1KeyFrames = [
    {
      frame: 0,
      value: -30, // first keyframe
    },
    {
      frame: animationLength * frameRate * 1/3,
      value: 15,
    },
    {
      frame: animationLength * frameRate * 2/3,
      value: 30,
    },
    {
      frame: animationLength * frameRate,
      value: -30,
    }
  ];

  movingBall1Animation.setKeys(movingBall1KeyFrames);

  scene.beginDirectAnimation(
    movingBall1,
    [movingBall1Animation],
    0, // first frame
    animationLength * frameRate,
    true // loop = true
  );

  // end of moving ball 1
  // start of moving ball 2
  let movingBall2 = BABYLON.MeshBuilder.CreateSphere("movingBall", {
    diameter: 3,
  });

  movingBall2.position.z = -20;

  movingBall2.material = new BABYLON.StandardMaterial(
    "moving ball material"
  );
  movingBall2.material.diffuseColor = new BABYLON.Color3(1, 1, 1);
  movingBall2.material.diffuseTexture = new BABYLON.Texture(
    "https://static.vecteezy.com/system/resources/previews/002/700/734/non_2x/neon-fire-icon-elements-in-neon-style-icons-simple-neon-flame-icon-for-websites-web-design-mobile-app-isolated-on-brick-wall-vector.jpg"
  );

  let movingBall2Animation = new BABYLON.Animation(
    "moving ball animation",
    "position.x",
    frameRate,
    BABYLON.Animation.ANIMATIONTYPE_FLOAT,
    BABYLON.Animation.ANIMATIONLOOPMODE_LOOP
  );

  let movingBall2KeyFrames = [
    {
      frame: 0,
      value: 30, // first keyframe
    },
    {
      frame: animationLength * frameRate * 1/3,
      value: -15,
    },
    {
      frame: animationLength * frameRate * 2/3,
      value: -30,
    },
    {
      frame: animationLength * frameRate,
      value: 30,
    }
  ];

  movingBall2Animation.setKeys(movingBall2KeyFrames);

  scene.beginDirectAnimation(
    movingBall2,
    [movingBall2Animation],
    0, // first frame
    animationLength * frameRate,
    true // loop = true
  );

  return scene;
};
window.initFunction = async function () {
  var asyncEngineCreation = async function () {
    try {
      return createDefaultEngine();
    } catch (e) {
      console.log(
        "the available createEngine function failed. Creating the default engine instead"
      );
      return createDefaultEngine();
    }
  };

  window.engine = await asyncEngineCreation();
  if (!engine) throw "engine should not be null.";
  startRenderLoop(engine, canvas);
  window.scene = createScene();
};
initFunction().then(() => {
  sceneToRender = scene;
});

// Resize
window.addEventListener("resize", function () {
  engine.resize();
});
