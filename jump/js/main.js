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
var level_score = game.level_1_score	//关卡1勋章获得需要的分数，总建筑数目-1（从0开始积分）
var level_medal = false		//当前发放的为关卡1的勋章，游戏不重启
medal.addEventListener('click', restart)
about.addEventListener('click', show_about)
about_close.addEventListener('click', close_about)

// 游戏重新开始，执行函数
function restart() {
  mask.style.display = 'none'
  info.style.display = 'inline'
  if (level_medal) {
  	// 当前发放的为关卡1的勋章，游戏不重启，只修改level_medal为普通状态
  	level_medal = false
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
}
// 游戏成功，更新分数
function success(score) {
  var scoreCurrent = document.querySelector('.score-current')
  scoreCurrent.innerText = score
  if (score == level_score) {
	  console.log('level medal')
	  medal_pic.src = './imgs/medals/medal_level_1.jpg'
	  mask.style.display = 'flex'
	  info.style.display = 'none'
	  level_medal = true
  }
}
// 显示关于
function show_about() {
	info.style.display = 'none'
	about_frame.style.display = 'block'
}
// 关闭关于
function close_about() {
	info.style.display = 'inline'
	about_frame.style.display = 'none'
}