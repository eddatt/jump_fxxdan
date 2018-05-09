var Game = function() {
  // 基本参数
  this.config = {
    isMobile: false,
    background: 0x282828, // 背景颜色
    ground: -1, // 地面y坐标
    fallingSpeed: 0.2, // 游戏失败掉落速度
    cubeColor: 0xbebebe, // 底座颜色
    cubeWidth: 4, // 底座宽度
    cubeHeight: 2, // 底座高度
    cubeDeep: 4, // 底座深度
    jumperColor: 0x536689,
    jumperWidth: 1, // jumper宽度
    jumperHeight: 2, // jumper高度
    jumperDeep: 1, // jumper深度
  }
  // 游戏状态
  this.score = 0
  // this.level_1_score = 15 //第一关的基础分数，第二关勋章的发放需要在此基础上进行计数
  this.size = {
    width: window.innerWidth,
    height: window.innerHeight
  }
  this.scene = new THREE.Scene()
  this.cameraPos = {
    current: new THREE.Vector3(0, 0, 0), // 摄像机当前的坐标
    next: new THREE.Vector3() // 摄像机即将要移到的位置
  }
  this.camera = new THREE.OrthographicCamera(this.size.width / -80, this.size.width / 80, this.size.height / 80, this.size.height / -80, 0, 5000)
  this.renderer = new THREE.WebGLRenderer({ antialias: true,precision: 'highp' })

  this.cubes = [] // 底座数组
  this.cubeStat = {
    nextDir: '',    // 下一个底座相对于当前底座的方向: 'left' 或 'right'
    heightBias:0,
    heightBiasCon:0,
    heightBiasRec1:0,
    heightBiasRec2:0,
    heightBiasRec3:5,
    gameLevel: 1, //游戏关卡，一共2关
    cubeTextureImg: "./imgs/xxq_1.png", //底座纹理图片
    medal: "./imgs/xxq_1.png", //勋章
    cubeTextureIndex: 0, //底座纹理图片序号
  }
  this.jumperStat = {
    ready: false, // 鼠标按完没有
    xSpeed: 0, // xSpeed根据鼠标按的时间进行赋值
    ySpeed: 0,// ySpeed根据鼠标按的时间进行赋值
    tRecord:0,
    xBias:  0,
    zBias:  0,
    everReach:  0
  }
  this.falledStat = {
    location: -1, // jumper所在的位置
    distance: 0 // jumper和最近底座的距离
  }
  this.fallingStat = {
    speed: 0.2, // 游戏失败后垂直方向上的掉落速度
    end: false // 掉到地面没有
  }
  //底座相关信息
  this.buildings = [
      {"title":"校训墙","img":"./imgs/xxq_1.png","floor":1, medal: "./imgs/medals/xxq_1.jpg"},
      {"title":"旦苑","img":"./imgs/dy_2.png","floor":2, medal: "./imgs/medals/dy_2.jpg"},
      {"title":"校史馆","img":"./imgs/xsg_2.png","floor":2, medal: "./imgs/medals/xsg_2.jpg"},
      {"title":"老校门","img":"./imgs/lxm_2.png","floor":2, medal: "./imgs/medals/lxm_2.jpg"},
      {"title":"新校门","img":"./imgs/xxm_2.png","floor":2, medal: "./imgs/medals/xxm_2.jpg"},
      {"title":"相辉堂","img":"./imgs/xht_2.png","floor":2, medal: "./imgs/medals/xht_2.jpg"},
      {"title":"第一教学楼","img":"./imgs/tb1_4.png","floor":4, medal: "./imgs/medals/tb1_4.jpg"},
      {"title":"第二教学楼","img":"./imgs/tb2_4.png","floor":4, medal: "./imgs/medals/tb2_4.jpg"},
      {"title":"第三教学楼","img":"./imgs/tb3_4.png","floor":4, medal: "./imgs/medals/tb3_4.jpg"},
      {"title":"第四教学楼","img":"./imgs/tb4_4.png","floor":4, medal: "./imgs/medals/tb4_4.jpg"},
      {"title":"第五教学楼","img":"./imgs/tb5_4.png","floor":4, medal: "./imgs/medals/tb5_4.jpg"},
      {"title":"第六教学楼","img":"./imgs/tb6_4.png","floor":4, medal: "./imgs/medals/tb6_4.jpg"},
      {"title":"文科楼","img":"./imgs/wkl_5.png","floor":5, medal: "./imgs/medals/wkl_5.jpg"},
      {"title":"光华楼","img":"./imgs/ghl_6.png","floor":6, medal: "./imgs/medals/ghl_6.jpg"}
  ]
  this.level_1_score = this.buildings.length-1 //第一关的基础分数，第二关勋章的发放需要在此基础上进行计数
}
Game.prototype = {
  init: function() {
    this._checkUserAgent() // 检测是否移动端
    this._setCamera() // 设置摄像机位置
    this._setRenderer() // 设置渲染器参数
    this._setLight() // 设置光照
    this._createplane()
    this._createCube() // 加一个底座
    this._createCube() // 再加一个底座
    this._createJumper() // 加入游戏者jumper
    this._updateCamera() // 更新相机坐标

    var self = this
    var mouseEvents = (self.config.isMobile) ? {
        down: 'touchstart',
        up: 'touchend',
      } :
      {
        down: 'mousedown',
        up: 'mouseup',
      }
    // 事件绑定到canvas中
    var canvas = document.querySelector('canvas')
    canvas.addEventListener(mouseEvents.down, function() {
      self._handleMousedown()
    })
    // 监听鼠标松开的事件
    canvas.addEventListener(mouseEvents.up, function(evt) {
      self._handleMouseup()
    })
    // 监听窗口变化的事件
    window.addEventListener('resize', function() {
      self._handleWindowResize()
    })
  },
  // 游戏失败重新开始的初始化配置
  restart: function() {
    this.score = 0
    this.cubeStat.heightBiasCon = 0
    this.cubeStat.heightBiasRec1 = 0
    this.cubeStat.heightBiasRec2 = 0
    this.cubeStat.heightBiasRec3 = 5
    this.cubeStat.cubeTextureIndex = 0
    this.cubeStat.gameLevel = 1
    this.jumperStat.xBias = 0
    this.jumperStat.zBias = 0
    this.jumperStat.tRecord = 0
    this.cameraPos = {
      current: new THREE.Vector3(0, 0, 0),
      next: new THREE.Vector3()
    }
    this.fallingStat = {
      speed: 0.2,
      end: false
    }
    // 删除所有底座
    var length = this.cubes.length
    for (var i = 0; i < length; i++) {
      this.scene.remove(this.cubes.pop())
    }
    // 删除jumper
    this.scene.remove(this.jumper)
    // 显示的分数设为 0
    this.successCallback(this.score)
    this._createplane()
    this._createCube()
    this._createCube()
    this._createJumper()
    this._updateCamera()
    //重新开始音效
    var aud_restart = document.getElementById('aud_restart')
    aud_restart.play()
  },
  // 游戏成功的执行函数, 外部传入
  addSuccessFn: function(fn) {
    this.successCallback = fn
  },
  // 游戏失败的执行函数, 外部传入
  addFailedFn: function(fn) {
    this.failedCallback = fn
  },
  // 检测是否手机端
  _checkUserAgent: function() {
    var n = navigator.userAgent;
    if (n.match(/Android/i) || n.match(/webOS/i) || n.match(/iPhone/i) || n.match(/iPad/i) || n.match(/iPod/i) || n.match(/BlackBerry/i)) {
      this.config.isMobile = true
    }
  },
  // THREE.js辅助工具
  _createHelpers: function() {
    var axesHelper = new THREE.AxesHelper(10)
    this.scene.add(axesHelper)
  },
  // 窗口缩放绑定的函数
  _handleWindowResize: function() {
    this._setSize()
    this.camera.left = this.size.width / -80
    this.camera.right = this.size.width / 80
    this.camera.top = this.size.height / 80
    this.camera.bottom = this.size.height / -80
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(this.size.width, this.size.height)
    this._render()
  },
  /**
   *鼠标按下或触摸开始绑定的函数
   *根据鼠标按下的时间来给 xSpeed 和 ySpeed 赋值
   *@return {Number} this.jumperStat.xSpeed 水平方向上的速度
   *@return {Number} this.jumperStat.ySpeed 垂直方向上的速度
   **/
  _handleMousedown: function() {
    var self = this
    if (!self.jumperStat.ready && self.jumper.scale.y > 0.02) {
      self.jumper.scale.y -= 0.01
      self.jumperStat.xSpeed = 0.24
      self.jumperStat.ySpeed += 0.03
      self.jumperStat.tRecord += 1
      self._render(self.scene, self.camera)
      //按下鼠标音效
      var music = document.getElementById('aud_mousedown')
      music.play()
      requestAnimationFrame(function() {
        self._handleMousedown()
      })
    }
  },
  // 鼠标松开或触摸结束绑定的函数
  _handleMouseup: function() {
    var self = this
    // if (self.jumperStat.xSpeed < 0.1) {
    //   console.log("return")
    //   self.jumperStat.ready = true
    //   return
    // }
    // console.log("_handleMouseup, xSpeed:"+self.jumperStat.xSpeed+", ySpeed:"+self.jumperStat.ySpeed)
    // 标记鼠标已经松开
    self.jumperStat.ready = true
    // 判断jumper是在底座水平面之上，是的话说明需要继续运动
    if ((self.jumper.position.y >= self.config.cubeHeight +self.cubeStat.heightBiasRec1 -1) && self.jumperStat.ySpeed>=0) {
        //if (self.jumper.position.y >= self.config.cubeHeight[1]  -1) {
        // jumper根据下一个底座的位置来确定水平运动方向
        if (self.cubeStat.nextDir === 'left') {
          self.jumper.position.x -= self.jumperStat.xSpeed
          self.jumper.position.x += (this.cubeStat.heightBiasRec2 / 2) / self.jumperStat.tRecord
          self.jumper.position.x -= (this.cubeStat.heightBiasRec1 / 2) / self.jumperStat.tRecord
          self.jumper.position.z += (this.cubeStat.heightBiasRec2 / 2) / self.jumperStat.tRecord
          self.jumper.position.z -= (this.cubeStat.heightBiasRec1 / 2) / self.jumperStat.tRecord
        } else {
          self.jumper.position.z -= self.jumperStat.xSpeed
          self.jumper.position.x += (this.cubeStat.heightBiasRec2 / 2) / self.jumperStat.tRecord
          self.jumper.position.x -= (this.cubeStat.heightBiasRec1 / 2) / self.jumperStat.tRecord
          self.jumper.position.z += (this.cubeStat.heightBiasRec2 / 2) / self.jumperStat.tRecord
          self.jumper.position.z -= (this.cubeStat.heightBiasRec1 / 2) / self.jumperStat.tRecord
        }
        // jumper在垂直方向上运动
        self.jumper.position.y += self.jumperStat.ySpeed
        // 运动伴随着缩放
        if (self.jumper.scale.y < 1) {
          self.jumper.scale.y += 0.015
        }
        // jumper在垂直方向上先上升后下降
        self.jumperStat.ySpeed -= 0.07
        //self.jumper.rotation.z -=0.1
        if (self.cubeStat.nextDir === 'left') {
          //self.jumper.rotation.y -= 0.02
          self.jumper.rotation.z += 2.1*Math.PI /self.jumperStat.tRecord
          self.jumper.position.z -= self.jumperStat.zBias /self.jumperStat.tRecord
          //self.jumper.position.y += 0.05/self.jumperStat.tRecord
        } else {
          //self.jumper.rotation.y -= 0.02
          self.jumper.rotation.x -= 2.1*Math.PI /self.jumperStat.tRecord
          self.jumper.position.x -= self.jumperStat.xBias /self.jumperStat.tRecord
          //self.jumper.position.y += 0.05/self.jumperStat.tRecord
        }
        // 每一次的变化，渲染器都要重新渲染，才能看到渲染效果
        self._render(self.scene, self.camera)
          //抬起鼠标，音效停止
          var music = document.getElementById('aud_mousedown')
          music.pause()
          music.currentTime = 0
        requestAnimationFrame(function() {
          self._handleMouseup()
        })
    } 
    else if((self.jumper.position.y >= self.config.cubeHeight +self.cubeStat.heightBiasRec2 -1) && self.jumperStat.ySpeed < 0){
        self.jumperStat.everReach = 1
        if (self.cubeStat.nextDir === 'left') {
          self.jumper.position.x -= self.jumperStat.xSpeed
          self.jumper.position.x += (this.cubeStat.heightBiasRec2 / 2) / self.jumperStat.tRecord *1.05
          self.jumper.position.x -= (this.cubeStat.heightBiasRec1 / 2) / self.jumperStat.tRecord *1.05
          self.jumper.position.z += (this.cubeStat.heightBiasRec2 / 2) / self.jumperStat.tRecord *1.05
          self.jumper.position.z -= (this.cubeStat.heightBiasRec1 / 2) / self.jumperStat.tRecord *1.05
        } else {
          self.jumper.position.z -= self.jumperStat.xSpeed
          self.jumper.position.x += (this.cubeStat.heightBiasRec2 / 2) / self.jumperStat.tRecord *1.05
          self.jumper.position.x -= (this.cubeStat.heightBiasRec1 / 2) / self.jumperStat.tRecord *1.05
          self.jumper.position.z += (this.cubeStat.heightBiasRec2 / 2) / self.jumperStat.tRecord *1.05
          self.jumper.position.z -= (this.cubeStat.heightBiasRec1 / 2) / self.jumperStat.tRecord *1.05
        }
        // jumper在垂直方向上运动
        self.jumper.position.y += self.jumperStat.ySpeed
        // 运动伴随着缩放
        if (self.jumper.scale.y < 1) {
          self.jumper.scale.y += 0.015
        }
        // jumper在垂直方向上先上升后下降
        self.jumperStat.ySpeed -= 0.07
        //self.jumper.rotation.z -=0.1
        if (self.cubeStat.nextDir === 'left') {
          //self.jumper.rotation.y -= 0.02
          self.jumper.rotation.z += 2.1*Math.PI /self.jumperStat.tRecord
          self.jumper.position.z -= self.jumperStat.zBias /self.jumperStat.tRecord
          //self.jumper.position.y += 0.05/self.jumperStat.tRecord
        } else {
          //self.jumper.rotation.y -= 0.02
          self.jumper.rotation.x -= 2.1*Math.PI /self.jumperStat.tRecord
          self.jumper.position.x -= self.jumperStat.xBias /self.jumperStat.tRecord
          //self.jumper.position.y += 0.05/self.jumperStat.tRecord
        }
        // 每一次的变化，渲染器都要重新渲染，才能看到渲染效果
        self._render(self.scene, self.camera)
        requestAnimationFrame(function() {
          self._handleMouseup()
        })
    }
    else {
      // jumper掉落到底座水平位置，开始充值状态，并开始判断掉落是否成功
      self.jumperStat.ready = false
      self.jumperStat.xSpeed = 0
      self.jumperStat.ySpeed = 0
      self.jumperStat.tRecord = 0
      //self.jumperStat.reach = 0
      self.jumper.rotation.x = 0
      self.jumper.rotation.z = 0
      self.jumper.position.y = (self.cubeStat.heightBiasRec2>0) ? (self.config.cubeHeight +self.cubeStat.heightBiasRec2 -1):(self.config.cubeHeight +self.cubeStat.heightBiasRec2 -0.5)
      //self.jumper.position.y = self.config.cubeHeight[1]  -1
      self._checkInCube()
      self.jumperStat.everReach = 0
      //self._printContent()
      if (self.falledStat.location === 1) {
        // 掉落成功，进入下一步
        self.score++
        self._createCube()
        self._updateCamera()

        if (self.successCallback) {
          var aud_success = document.getElementById('aud_success')
          aud_success.play()
          self.successCallback(self.score)
        }
      } else {
        // 掉落失败，进入失败动画
        self._falling()
        //掉落音效
        var aud_failed = document.getElementById('aud_failed')
        aud_failed.play()
      }
    }
  },
  /**
   *游戏失败执行的碰撞效果
   *@param {String} dir 传入一个参数用于控制倒下的方向：'rightTop','rightBottom','leftTop','leftBottom','none'
   **/
  _fallingRotate: function(dir) {
    var self = this
    var offset = self.falledStat.distance - self.config.cubeWidth / 2
    var rotateAxis = 'z' // 旋转轴
    var rotateAdd = self.jumper.rotation[rotateAxis] + 0.1 // 旋转速度
    var rotateTo = self.jumper.rotation[rotateAxis] < Math.PI / 2 // 旋转结束的弧度
    var fallingTo = self.config.ground + self.config.jumperWidth / 2 + offset

    if (dir === 'rightTop') {
      rotateAxis = 'x'
      rotateAdd = self.jumper.rotation[rotateAxis] - 0.1
      rotateTo = self.jumper.rotation[rotateAxis] > -Math.PI / 2
      // self.jumper.geometry.translate.z = offset
    } else if (dir === 'rightBottom') {
      rotateAxis = 'x'
      rotateAdd = self.jumper.rotation[rotateAxis] + 0.1
      rotateTo = self.jumper.rotation[rotateAxis] < Math.PI / 2
      // self.jumper.geometry.translate.z = -offset
    } else if (dir === 'leftBottom') {
      rotateAxis = 'z'
      rotateAdd = self.jumper.rotation[rotateAxis] - 0.1
      rotateTo = self.jumper.rotation[rotateAxis] > -Math.PI / 2
      // self.jumper.geometry.translate.x = -offset
    } else if (dir === 'leftTop') {
      rotateAxis = 'z'
      rotateAdd = self.jumper.rotation[rotateAxis] + 0.1
      rotateTo = self.jumper.rotation[rotateAxis] < Math.PI / 2
      // self.jumper.geometry.translate.x = offset
    } else if (dir === 'none') {
      rotateTo = false
      fallingTo = self.config.ground
    } else {
      throw Error('Arguments Error')
    }
    if (!self.fallingStat.end) {
      if (rotateTo) {
        self.jumper.rotation[rotateAxis] = rotateAdd
      } else if (self.jumper.position.y > fallingTo) {
        self.jumper.position.y -= self.config.fallingSpeed
      } else {
        self.fallingStat.end = true
      }
      self._render()
      requestAnimationFrame(function() {
        self._falling()
      })
    } else {
      if (self.failedCallback) {
        if (this.cubeStat.gameLevel == 2) {
          //第二关勋章
          if (self.score < self.level_1_score) {
            // use the level 1 medal
          }else if (self.score < self.level_1_score+5) {
            this.cubeStat.medal = "./imgs/medals/medal_1.jpg"
          }else if (self.score < self.level_1_score+10) {
            this.cubeStat.medal = "./imgs/medals/medal_2.jpg"
          }else if (self.score < self.level_1_score+15) {
            this.cubeStat.medal = "./imgs/medals/medal_3.jpg"
          }else if (self.score < self.level_1_score+20) {
            this.cubeStat.medal = "./imgs/medals/medal_4.jpg"
          }else{
            this.cubeStat.medal = "./imgs/medals/medal_5.jpg"
          }
          self.failedCallback(this.cubeStat.medal)
        }else{
          //第一关勋章
          self.failedCallback(this.cubeStat.medal)
        }
      }
    }
  },
  /**
   *游戏失败进入掉落阶段
   *通过确定掉落的位置来确定掉落效果
   **/
  _falling: function() {
    var self = this
    if (self.falledStat.location == 0) {
      self._fallingRotate('none')
    } else if (self.falledStat.location === -10) {
      if (self.cubeStat.nextDir == 'left') {
        self._fallingRotate('leftTop')
      } else {
        self._fallingRotate('rightTop')
      }
    } else if (self.falledStat.location === 10) {
      if (self.cubeStat.nextDir == 'left') {
        if (self.jumper.position.x < self.cubes[self.cubes.length - 1].position.x) {
          self._fallingRotate('leftTop')
        } else {
          self._fallingRotate('leftBottom')
        }
      } else {
        if (self.jumper.position.z < self.cubes[self.cubes.length - 1].position.z) {
          self._fallingRotate('rightTop')
        } else {
          self._fallingRotate('rightBottom')
        }
      }
    }
  },
  
  _printContent: function(){
      var str="123";
      document.getElementById("title").innerHTML=str;
  },
  /**
   *判断jumper的掉落位置
   *@return {Number} this.falledStat.location
   * -1 : 掉落在原来的底座，游戏继续
   * -10: 掉落在原来底座的边缘，游戏失败
   *  1 : 掉落在下一个底座，游戏成功，游戏继续
   *  10: 掉落在下一个底座的边缘，游戏失败
   *  0 : 掉落在空白区域，游戏失败
   **/
  _checkInCube: function() {
    if (this.cubes.length > 1) {
      // jumper 的位置（视觉位置）
      var pointO = {
        x: this.jumper.position.x,
        z: this.jumper.position.z
      }
      // jumper 的真实位置（非视觉）
      var pointR = {
        x: this.jumper.position.x - this.cubeStat.heightBiasRec2,
        z: this.jumper.position.z - this.cubeStat.heightBiasRec2
      }
      // 当前底座的位置
      var pointA = {
        x: this.cubes[this.cubes.length - 1 - 1].position.x,
        z: this.cubes[this.cubes.length - 1 - 1].position.z
      }
      // 下一个底座的位置
      var pointB = {
        x: this.cubes[this.cubes.length - 1].position.x,
        z: this.cubes[this.cubes.length - 1].position.z
      }
      var distanceS, // jumper和当前底座的坐标轴距离
        distanceL,   // jumper和下一个底座的坐标轴距离
        distanceLR
      // 判断下一个底座相对当前底座的方向来确定计算距离的坐标轴
      if (this.cubeStat.nextDir === 'left') {
        distanceS = Math.abs(pointO.x - pointA.x)
        distanceL = Math.abs(pointO.x - pointB.x)
        distanceLR =Math.abs(pointR.x - pointB.x)
      } else {
        distanceS = Math.abs(pointO.z - pointA.z)
        distanceL = Math.abs(pointO.z - pointB.z)
        distanceLR =Math.abs(pointR.z - pointB.z)
      }
      var should = this.config.cubeWidth / 2 + this.config.jumperWidth / 2
      var result = 0
      if (distanceS < should) {
        // 落在当前底座，将距离储存起来，并继续判断是否可以站稳
        this.falledStat.distance = distanceS
        //result = distanceS < (this.config.cubeWidth+this.cubeStat.heightBiasRec1 * 2) / 2 ? -1 : -10
        result = distanceS < (this.config.cubeWidth) / 2 ? -1 : -10
        if (result == -1){
            this.jumperStat.xBias=this.jumper.position.x-this.cubes[this.cubes.length - 1 - 1].position.x-this.cubeStat.heightBiasRec1 /2
            this.jumperStat.zBias=this.jumper.position.z-this.cubes[this.cubes.length - 1 - 1].position.z-this.cubeStat.heightBiasRec1 /2
        }
      }else if ((distanceL < should) && (this.jumperStat.everReach ==1)) {
        this.falledStat.distance = distanceL
        // 落在下一个底座，将距离储存起来，并继续判断是否可以站稳
        // if((distanceL >((this.config.cubeWidth-this.cubeStat.heightBiasRec2 * 2) / 2)) && (distanceL <((this.config.cubeWidth+this.cubeStat.heightBiasRec2 * 2) / 2)){
            // result =1
        // }
        // else{
            // result=10
        // }
        //result = distanceL < ((this.config.cubeWidth+this.cubeStat.heightBiasRec2 * 2) / 2) ? 1 : 10
        result = distanceL < ((this.config.cubeWidth) / 2) ? 1 : 10
        if (result == 1){
            this.jumperStat.xBias=this.jumper.position.x-this.cubes[this.cubes.length - 1 ].position.x-this.cubeStat.heightBiasRec2 /2 
            this.jumperStat.zBias=this.jumper.position.z-this.cubes[this.cubes.length - 1 ].position.z-this.cubeStat.heightBiasRec2 /2 
        }
      } else {
        result = 0
      }
      // console.log('distanceS:'+distanceS+', distanceL:'+ distanceL+', distanceR:'+distanceLR+",result:"+result)
      this.falledStat.location = result
    }
  },
  // 每成功一步, 重新计算摄像机的位置，保证游戏始终在画布中间进行
  _updateCameraPos: function() {
    var lastIndex = this.cubes.length - 1
    var pointA = {
      x: this.cubes[lastIndex].position.x,
      z: this.cubes[lastIndex].position.z
    }
    var pointB = {
      x: this.cubes[lastIndex - 1].position.x,
      z: this.cubes[lastIndex - 1].position.z
    }
    var pointR = new THREE.Vector3()
    pointR.x = (pointA.x + pointB.x) / 2
    pointR.y = 0
    pointR.z = (pointA.z + pointB.z) / 2
    this.cameraPos.next = pointR
  },
  // 基于更新后的摄像机位置，重新设置摄像机坐标
  _updateCamera: function() {
    var self = this
    var c = {
      x: self.cameraPos.current.x,
      y: self.cameraPos.current.y,
      z: self.cameraPos.current.z
    }
    var n = {
      x: self.cameraPos.next.x,
      y: self.cameraPos.next.y,
      z: self.cameraPos.next.z
    }
    if (c.x > n.x || c.z > n.z) {
      self.cameraPos.current.x -= 0.1
      self.cameraPos.current.z -= 0.1
      if (self.cameraPos.current.x - self.cameraPos.next.x < 0.05) {
        self.cameraPos.current.x = self.cameraPos.next.x
      }
      if (self.cameraPos.current.z - self.cameraPos.next.z < 0.05) {
        self.cameraPos.current.z = self.cameraPos.next.z
      }
      self.camera.lookAt(new THREE.Vector3(c.x, 0, c.z))
      self._render()
      requestAnimationFrame(function() {
        self._updateCamera()
      })
    }
  },
  // 初始化jumper：游戏主角
  _createJumper: function() {
    var material = new THREE.MeshLambertMaterial({ color: this.config.jumperColor })
    var sphere = new THREE.SphereGeometry(0.35,15,15)
    var cone = new THREE.ConeGeometry(0.45,1.3,20)
    var mesh_s = new THREE.Mesh(sphere, material)
    var mesh_c = new THREE.Mesh(cone,material)
    mesh_s.position.y = 1.97
    mesh_c.position.y = 0.73
    //var mesh = new THREE.Mesh(geometry, material)
    mesh_s.castShadow=true
    mesh_c.castShadow=true
   // mesh.receiveShadow=true
   // mesh.position.y = 1
    //this.jumper = mesh
    this.jumper=new THREE.Group()
    this.jumper.add(mesh_s)
    this.jumper.add(mesh_c)
    this.jumper.position.y=1
    this.scene.add(this.jumper)
  },
  // 底座样式控制
  _cubeStyle: function() {
    //第一关，建筑按照顺序出现
    if (this.cubeStat.gameLevel == 1) {
      console.log('1 level cubeTextureIndex:'+this.cubeStat.cubeTextureIndex)
      this.cubeStat.heightBiasRec1 = this.cubeStat.heightBiasRec2
      this.cubeStat.heightBiasRec2 = this.buildings[this.cubeStat.cubeTextureIndex]['floor'] - 2
      this.cubeStat.cubeTextureImg = this.buildings[this.cubeStat.cubeTextureIndex]['img']
      if (this.cubeStat.cubeTextureIndex > 0) {
        this.cubeStat.medal = this.buildings[this.cubeStat.cubeTextureIndex-1]['medal']
      }
      this.cubeStat.cubeTextureIndex += 1
      if (this.cubeStat.cubeTextureIndex >= this.buildings.length) {
        console.log("goto 2 level")
        this.cubeStat.cubeTextureIndex = 0
        this.cubeStat.gameLevel = 2
      }
    }else{
      //第二关，建筑随机出现
      console.log('2 level cubeTextureIndex:'+this.cubeStat.cubeTextureIndex)
      this.cubeStat.heightBiasRec1 = this.cubeStat.heightBiasRec2
      this.cubeStat.heightBiasRec2 = this.buildings[this.cubeStat.cubeTextureIndex]['floor'] - 2
      this.cubeStat.cubeTextureImg = this.buildings[this.cubeStat.cubeTextureIndex]['img']
      //随机数
      this.cubeStat.cubeTextureIndex = Math.floor(this.buildings.length*Math.random())
    }
  },
  // 新增一个底座, 新的底座有2个随机方向
  _createCube: function() {
    this._cubeStyle()
    var geometry = new THREE.CubeGeometry(this.config.cubeWidth, this.config.cubeHeight+this.cubeStat.heightBiasRec2, this.config.cubeDeep)
    var textureLoader = new THREE.TextureLoader();

    //var material = new THREE.MeshLambertMaterial({ color: this.config.cubeColor })
    switch(this.cubeStat.heightBiasRec2){
        case -1:
            var texture = textureLoader.load(this.cubeStat.cubeTextureImg);
            texture.magFilter = THREE.LinearFilter; 
            texture.minFilter = THREE.LinearFilter;
            texture.wrapS=1001;
            texture.wrapT=1001;
            var material = new THREE.MeshBasicMaterial({map:texture,transparent:true})
            var m1 = [new THREE.Vector2(0, .2), new THREE.Vector2(.8, .2), new THREE.Vector2(.8, 1), new THREE.Vector2(0, 1)];
            var m2 = [new THREE.Vector2(.8, .2), new THREE.Vector2(1, .2), new THREE.Vector2(1, 1), new THREE.Vector2(.8, 1)];
            var m3 = [new THREE.Vector2(0, 0), new THREE.Vector2(.8, 0), new THREE.Vector2(.8, .2), new THREE.Vector2(0, .2)];

            break;
        case 0:
            var texture = textureLoader.load(this.cubeStat.cubeTextureImg);
            texture.magFilter = THREE.LinearFilter; 
            texture.minFilter = THREE.LinearFilter;
            texture.wrapS=1001;
            texture.wrapT=1001;
            var material = new THREE.MeshBasicMaterial({map:texture,transparent:true})
            var m1 = [new THREE.Vector2(0, .333), new THREE.Vector2(.666, .333), new THREE.Vector2(.666, 1), new THREE.Vector2(0, 1)];
            var m2 = [new THREE.Vector2(.666, .333), new THREE.Vector2(1, .333), new THREE.Vector2(1, 1), new THREE.Vector2(.666, 1)];
            var m3 = [new THREE.Vector2(0, 0), new THREE.Vector2(.666, 0), new THREE.Vector2(.666, .333), new THREE.Vector2(0, .333)];


            break;
        case 1:
            var texture = textureLoader.load(this.cubeStat.cubeTextureImg);
            texture.magFilter = THREE.LinearFilter; 
            texture.minFilter = THREE.LinearFilter;
            texture.wrapS=1001;
            texture.wrapT=1001;
            var material = new THREE.MeshBasicMaterial({map:texture,transparent:true})
            var m1 = [new THREE.Vector2(0, .429), new THREE.Vector2(.571, .429), new THREE.Vector2(.571, 1), new THREE.Vector2(0, 1)];
            var m2 = [new THREE.Vector2(.571, .429), new THREE.Vector2(1, .429), new THREE.Vector2(1, 1), new THREE.Vector2(.571, 1)];
            var m3 = [new THREE.Vector2(0, 0), new THREE.Vector2(.571, 0), new THREE.Vector2(.571, .429), new THREE.Vector2(0, .429)];


            break;
        case 2:
            var texture = textureLoader.load(this.cubeStat.cubeTextureImg);
            texture.magFilter = THREE.LinearFilter; 
            texture.minFilter = THREE.LinearFilter;
            texture.wrapS=1001;
            texture.wrapT=1001;
            var material = new THREE.MeshBasicMaterial({map:texture,transparent:true})
            var m1 = [new THREE.Vector2(0, .5), new THREE.Vector2(.5, .5), new THREE.Vector2(.5, 1), new THREE.Vector2(0, 1)];
            var m2 = [new THREE.Vector2(.5, .5), new THREE.Vector2(1, .5), new THREE.Vector2(1, 1), new THREE.Vector2(.5, 1)];
            var m3 = [new THREE.Vector2(0, 0), new THREE.Vector2(.5, 0), new THREE.Vector2(.5, .5), new THREE.Vector2(0, .5)];
            break;
        case 3:
            var texture = textureLoader.load(this.cubeStat.cubeTextureImg);
            texture.magFilter = THREE.LinearFilter; 
            texture.minFilter = THREE.LinearFilter;
            texture.wrapS=1001;
            texture.wrapT=1001;
            var material = new THREE.MeshBasicMaterial({map:texture,transparent:true})
            var m1 = [new THREE.Vector2(0, .555), new THREE.Vector2(.444, .555), new THREE.Vector2(.444, 1), new THREE.Vector2(0, 1)];
            var m2 = [new THREE.Vector2(.444, .555), new THREE.Vector2(1, .555), new THREE.Vector2(1, 1), new THREE.Vector2(.444, 1)];
            var m3 = [new THREE.Vector2(0, 0), new THREE.Vector2(.444, 0), new THREE.Vector2(.444, .555), new THREE.Vector2(0, .555)];

            break;
        case 4:
            var texture = textureLoader.load(this.cubeStat.cubeTextureImg);
            texture.magFilter = THREE.LinearFilter; 
            texture.minFilter = THREE.LinearFilter;
            texture.wrapS=1001;
            texture.wrapT=1001;
            var material = new THREE.MeshBasicMaterial({map:texture,transparent:true})
            var m1 = [new THREE.Vector2(0, .6), new THREE.Vector2(.4, .6), new THREE.Vector2(.4, 1), new THREE.Vector2(0, 1)];
            var m2 = [new THREE.Vector2(.4, .6), new THREE.Vector2(1, .6), new THREE.Vector2(1, 1), new THREE.Vector2(.4, 1)];
            var m3 = [new THREE.Vector2(0, 0), new THREE.Vector2(.4, 0), new THREE.Vector2(.4, .6), new THREE.Vector2(0, .6)];
            break;
    }

    geometry.faceVertexUvs[0] = [];
    geometry.faceVertexUvs[0][4] = [ m1[3], m1[0], m1[2] ];
    geometry.faceVertexUvs[0][5] = [ m1[0], m1[1], m1[2] ];
    geometry.faceVertexUvs[0][0] = [ m2[0], m2[1], m2[3] ];
    geometry.faceVertexUvs[0][1] = [ m2[1], m2[2], m2[3] ];
    geometry.faceVertexUvs[0][2] = [ m3[0], m3[1], m3[3] ];
    geometry.faceVertexUvs[0][3] = [ m3[1], m3[2], m3[3] ];
    geometry.faceVertexUvs[0][10]= [ m1[0], m1[1], m1[3] ];
    geometry.faceVertexUvs[0][11]= [ m1[1], m1[2], m1[3] ];
    geometry.faceVertexUvs[0][6] = [ m2[0], m2[1], m2[3] ];
    geometry.faceVertexUvs[0][7] = [ m2[1], m2[2], m2[3] ];
    geometry.faceVertexUvs[0][8] = [ m3[3], m3[0], m3[2] ];
    geometry.faceVertexUvs[0][9] = [ m3[0], m3[1], m3[2] ];
    
    var mesh = new THREE.Mesh(geometry, material)
    mesh.castShadow=true
    mesh.receiveShadow = true

    if (this.cubes.length) {
      var random = Math.random()
      this.cubeStat.nextDir = random > 0.5 ? 'left' : 'right'
      //this.cubeStat.heightBias = handom
      //this.cubeStat.heightBias = this.cubeStat.heightBiasRec1
      mesh.position.x = this.cubes[this.cubes.length - 1].position.x
      mesh.position.y = this.cubes[this.cubes.length - 1].position.y
      mesh.position.z = this.cubes[this.cubes.length - 1].position.z
      if (this.cubeStat.nextDir === 'left') {
        mesh.position.x = this.cubes[this.cubes.length - 1].position.x - 4 * Math.random() - 6
      } else {
        mesh.position.z = this.cubes[this.cubes.length - 1].position.z - 4 * Math.random() - 6
      }
    }
    this.cubes.push(mesh)
    // 当底座数大于6时，删除前面的底座，因为不会出现在画布中
    if (this.cubes.length > 4) {
      this.scene.remove(this.cubes.shift())
    }
    this.scene.add(mesh)
    // 每新增一个底座，重新计算摄像机坐标
    if (this.cubes.length > 1) {
      this._updateCameraPos()
    }
  },
  _render: function() {
    this.renderer.render(this.scene, this.camera)
  },
  _setLight: function() {
    var directionalLight = new THREE.DirectionalLight(0xffffff, 1.1)
    directionalLight.position.set(600, 600, -200)
    directionalLight.target.position.set(0,0,0)
    directionalLight.castShadow = true
   // directionalLight.shadowDarkness=0.5
    //directionalLight.castShadow = true;
    var d = 30;
    directionalLight.shadow.camera = new THREE.OrthographicCamera(-d, d, d, -d, 50, 1000);
   // directionalLight.shadow.bias = 0.0001;
    directionalLight.shadow.mapSize.width = directionalLight.shadow.mapSize.height = 1024;
    shadowCameraVisible=true;
    this.scene.add(directionalLight)

    var light = new THREE.AmbientLight(0xffffff, 0.3)
    this.scene.add(light)
  },
  _setCamera: function() {
    this.camera.position.set(100, 100, 100)
    this.camera.lookAt(this.cameraPos.current)
  },
  _setRenderer: function() {
    this.renderer.setSize(this.size.width, this.size.height)
    this.renderer.setClearColor(this.config.background)
    //this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    document.body.appendChild(this.renderer.domElement)
  },
  _setSize: function() {
    this.size.width = window.innerWidth,
      this.size.height = window.innerHeight
  },
  _createplane: function(){
  var planeGeometry = new THREE.BoxBufferGeometry(3200, 6, 3200)
  var planeMaterial=new THREE.MeshLambertMaterial({color:0xd5e2fb})
  var plane = new THREE.Mesh(planeGeometry,planeMaterial)
  plane.position.y = -4
  plane.receiveShadow=true
  this.scene.add(plane)
  }
}