const grid=document.getElementById("grid");
const speech=document.getElementById("speech");
const scoreText=document.getElementById("score");
const bar=document.getElementById("bar");
let level=1;
let score=0;
let target=0;
function newRound(){
grid.replaceChildren();
target=Math.floor(Math.random()*8)+2;
speech.textContent = 'Feed me ' + target + ' apples!';
let total=target+Math.floor(Math.random()*6)+3;
for(let i=0;i<total;i++){
let div=document.createElement("div");
div.className="apple";
div.textContent = '🍎';
div.onclick=()=>{
div.classList.toggle("selected");
}
grid.appendChild(div);
}
bar.style.width=((level-1)%10)*10+"%";
}
document.getElementById("feed").onclick=()=>{
let selected=document.querySelectorAll(".selected").length;
if(selected===target){
score++;
level++;
scoreText.textContent = String(score);
alert("Yum! 😋");
newRound();
}else{
alert("Oops! I wanted "+target+" apples!");
}
};
newRound();
