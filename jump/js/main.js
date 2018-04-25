var game = new Game()
game.init()
game.addSuccessFn(success)
game.addFailedFn(failed)

var mask = document.querySelector('.mask')
var medal = document.querySelector('.medal')
var info = document.querySelector('.info')
var medal_pic = document.querySelector('.medal_pic')

medal.addEventListener('click', restart)

// 游戏重新开始，执行函数
function restart() {
  mask.style.display = 'none'
  info.style.display = 'inline'
  game.restart()
}
// 游戏失败执行函数
function failed(score) {
  console.log('failed score:'+score)
  if (score>2) {
  	medal_pic.src = "./imgs/medals/high.png"
  }else{
  	medal_pic.src = "./imgs/medals/low.png"
  }
  mask.style.display = 'flex'
  info.style.display = 'none'
}
// 游戏成功，更新分数
function success(score) {
  var scoreCurrent = document.querySelector('.score-current')
  scoreCurrent.innerText = score
}