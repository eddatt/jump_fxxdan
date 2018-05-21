var game = new Game()
game.init()
game.addSuccessFn(success)
game.addFailedFn(failed)

var mask = document.querySelector('.mask')
var medal = document.querySelector('.medal')
var info = document.querySelector('.info')
var medal_pic = document.querySelector('.medal_pic')
var about = document.querySelector('.about')
var about_frame = document.querySelector('.about-frame')
var about_close = document.querySelector('.about-close')
var scoreCurrent = document.querySelector('.score-current')
var level_1_score = game.level_1_score	//关卡1勋章获得需要的分数，总建筑数目-1（从0开始积分）
var level_medal_pic = false		//当前发放的为关卡1的勋章，游戏不重启

about.addEventListener('click', show_about)
about_close.addEventListener('click', close_about)

// medal.addEventListener('click', restart)
medal.addEventListener("touchstart", touchstart)
medal.addEventListener("touchend", touchend)

var start = 0;
//勋章开始按下
function touchstart(){
    start = new Date();
}
// 勋章按下结束
function touchend(){
    var press_time = new Date() - start;
    console.log("press_time:"+press_time);
    if (press_time < 200) {
      restart();
    }
}

// 游戏重新开始，执行函数
function restart() {
  mask.style.display = 'none'
  info.style.display = 'inline'
  if (level_medal_pic) {
  	// 当前发放的为关卡2的勋章，游戏不重启，只修改level_medal为普通状态
  	level_medal_pic = false
  }else{
  	// 当前发放的为普通勋章，游戏重启
  	game.restart()
  }  
}
// 游戏失败执行函数
function failed(medal) {
  console.log('medal:'+medal)
  medal_pic.src = medal
  mask.style.display = 'flex'
  info.style.display = 'none'
  document.title= "我在《登顶光华楼》获得"+scoreCurrent.innerText+"分，等你来挑战！（复旦大学113周年校庆）";
}
// 游戏成功，更新分数
function success(score) {
  scoreCurrent.innerText = score
  // 根据分数发放对应勋章
  switch(score){
      case level_1_score:
        medal_pic.src = './imgs/medals/level_1_succ.jpg'
        mask.style.display = 'flex'
        info.style.display = 'none'
        level_medal_pic = true
        break;
      case level_1_score + game.add_score*game.level_2_gap_num*1:
        medal_pic.src = './imgs/medals/level_2_medal_1.jpg'
        mask.style.display = 'flex'
        info.style.display = 'none'
        level_medal_pic = true
        break;
      case level_1_score + game.add_score*game.level_2_gap_num*2:
        medal_pic.src = './imgs/medals/level_2_medal_2.jpg'
        mask.style.display = 'flex'
        info.style.display = 'none'
        level_medal_pic = true
        break;
      case level_1_score + game.add_score*game.level_2_gap_num*3:
        medal_pic.src = './imgs/medals/level_2_medal_3.jpg'
        mask.style.display = 'flex'
        info.style.display = 'none'
        level_medal_pic = true
        break;
      case level_1_score + game.add_score*game.level_2_gap_num*4:
        medal_pic.src = './imgs/medals/level_2_medal_4.jpg'
        mask.style.display = 'flex'
        info.style.display = 'none'
        level_medal_pic = true
        break;
      case level_1_score + game.add_score*game.level_2_gap_num*5:
        medal_pic.src = './imgs/medals/level_2_medal_5.jpg'
        mask.style.display = 'flex'
        info.style.display = 'none'
        level_medal_pic = true
        break;
      case 114:
        medal_pic.src = './imgs/medals/level_2_medal_113.jpg'
        mask.style.display = 'flex'
        info.style.display = 'none'
        level_medal_pic = true
        break;
    }
}
// 显示关于
function show_about() {
  console.log('about')
	info.style.display = 'none'
	about_frame.style.display = 'block'
}
// 关闭关于
function close_about() {
	info.style.display = 'inline'
	about_frame.style.display = 'none'
}