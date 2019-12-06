var canvas=document.getElementById("mainCanvas");
var ctx=canvas.getContext('2d');
var allZone=new zone({
    ctx:ctx,
    zone:[50,50,300,300],
    radius:0.2
});
var dx=150;
var dottedLine={
    lineWidth:2,
    setLineDash:[2,8],
    lineJoin:"round",
    lineCap:"round"
};
var color=["green","red","blue"];
function stroke(now,i){
    return now.scale(0.7).stroke(color[i%3],dottedLine);
}
function draw(now,i){
    var all=now.scale(1,"center",1);
    var first=all.getZone(0,0,0.5,0.5).fill("thistle");
    if(i%2==0)first.scale(0.5,"center",1)
    .clear().scale(0.6,"center",1)
    .fill("#C1CDC1").exit().exit();
    var second=first.moveX("1").fill("#C1CDC1");
    if(i%2==1)second.scale(0.5,"center",1)
    .clear().scale(0.6,"center",1)
    .fill("thistle").exit().exit();
    var third=second.move("-1","1").fill("#B9D3EE");
    third.copy().repeat(Math.max(4-i,0),stroke);
    var fourth=third.moveX("1");
    return fourth;
}
allZone.repeat(10,draw);

