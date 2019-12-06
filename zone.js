(function(){
    function zone(object){
        if(typeof object!="object")return;
        this.ctx=object.ctx;
        this.zone=object.zone || [0,0,0,0];
        this.radius=object.radius || 0;
        this.changeLine=[];
    }
    function isInteger(obj) {
        return (obj | 0) === obj;
    }
    zone.prototype = {
        create: function(ctx,zone,radius){
            this.ctx=ctx;
            this.zone=zone || [0,0,0,0];
            this.radius=radius || 0;
            return this;
        },
        copy:function(){
            var newZone=new zone();
            Object.keys(this).forEach((name)=>{
                    newZone[name]=this[name];
            });
            this.changeLine.push(this);
            return newZone.setValue("changeLine",this.changeLine);
        },
        setCtx:function(data,value){
            if(typeof data=="object"){
                Object.keys(data).forEach((name)=>{
                    this.ctx[name]=data[name];
                });
                return this;
            }
            this.ctx[data]=value;
            return this;
        },
        setValue: function(data,value){
            if(typeof data=="object"){
                Object.keys(data).forEach((name)=>{
                    this[name]=data[name];
                });
                return this;
            }
            this[data]=value;
            return this;
        },
        out:function(name){
            console.log(this[name]);
            return this;
        },
        exit:function(){
            var len=this.changeLine.length;
            if(len==0)return this;
            return this.changeLine.pop().setValue("changeLine",this.changeLine);
        },
        scale:function(scale,point,isNew){
            var ctx=this.ctx,w=this.zone[2],h=this.zone[3],r=this.radius*Math.min(this.zone[2],this.zone[3]);
            point=point || [w/2,h/2];
            if(point=="center"){
                point=[w/2,h/2];
            }
            if(isNew)return this.copy().setValue("zone",[this.zone[0]+point[0]*(1-scale),
        this.zone[1]+point[1]*(1-scale),this.zone[2]*scale,this.zone[3]*scale]);
            else return this.setValue("zone",[this.zone[0]+point[0]*(1-scale),
            this.zone[1]+point[1]*(1-scale),this.zone[2]*scale,this.zone[3]*scale]);
        },
        move:function(x,y,isNew){
            if(!isInteger(x))x=this.zone[2]*x;
            if(!isInteger(y))y=this.zone[3]*y;
            if(isNew){
                return this.copy().setValue("zone",[this.zone[0]+x,this.zone[1]+y,this.zone[2],this.zone[3]]);;
            }
            return this.setValue("zone",[this.zone[0]+x,this.zone[1]+y,this.zone[2],this.zone[3]]);
        },
        moveX:function(x){
            return this.move(x,0);
        },
        moveY:function(y){
            return this.move(0,y);
        },
        moveTo:function(x,y,isNew){
            if(!isInteger(x))x=this.width*x;
            if(!isInteger(y))y=this.height*y;
            if(isNew){
                return this.copy().setValue("zone",[x,y,this.zone[2],this.zone[3]]);
            }
            return this.setValue("zone",[x,y,this.zone[2],this.zone[3]]);
        },
        getZone:function(x,y,width,height){
            var ctx=this.ctx,w=this.zone[2],h=this.zone[3],r=this.radius*Math.min(this.zone[2],this.zone[3]);
            if(!isInteger(x))x=w*x;
            if(!isInteger(y))y=h*y;
            if(!isInteger(width))width=w*width;
            if(!isInteger(height))height=h*height;
            return this.copy().setValue("zone",[this.zone[0]+x,this.zone[1]+y,width,height]);
        },
        repeat:function(count,func){
            var now=this;
            for(var i=0;i<count;i++){
                now=func(now,i);
            }
            return now;
        },
        getPath:function(){
            var ctx=this.ctx,w=this.zone[2],h=this.zone[3],r=this.radius*Math.min(this.zone[2],this.zone[3]);
            ctx.beginPath(0); 
            ctx.arc(w - r, h - r, r, 0, Math.PI / 2); 
            ctx.lineTo(r, h);
            ctx.arc(r, h - r, r, Math.PI / 2, Math.PI);
            ctx.lineTo(0, r);
            ctx.arc(r, r, r, Math.PI, Math.PI * 3 / 2);
            ctx.lineTo(w - r, 0);
            ctx.arc(w - r, r, r, Math.PI * 3 / 2, Math.PI * 2);
            ctx.lineTo(w, h - r);
            ctx.closePath();
        },
        fill:function(fillStyle){
            var ctx=this.ctx,x=this.zone[0],y=this.zone[1],w=this.zone[2],h=this.zone[3],r=this.radius*Math.min(this.zone[2],this.zone[3]);
            ctx.save();
            ctx.translate(x,y);
            ctx.fillStyle=fillStyle || ctx.fillStyle; 
            if(r==0)ctx.fillRect(0,0,w,h);
            else {
                this.getPath();
                ctx.fill();
            }
            ctx.restore();
            return this;
        },
        stroke:function(strokeStyle,line){
            var ctx=this.ctx,x=this.zone[0],y=this.zone[1],w=this.zone[2],h=this.zone[3],r=this.radius*Math.min(this.zone[2],this.zone[3]);
            ctx.save();
            ctx.translate(x,y);
            if(typeof line=="object"){
                Object.keys(line).forEach((name)=>{
                    if(typeof ctx[name]=="function"){
                        ctx[name](line[name]);
                    }
                    else ctx[name]=line[name];
                });
            }
            else {
                ctx.lineWidth=line || ctx.lineWidth;
            }
            ctx.strokeStyle=strokeStyle || ctx.strokeStyle;
            if(r==0)ctx.strokeRect(0,0,w,h);
            else {
                this.getPath();
                ctx.stroke();
            }
            ctx.restore();
            return this;
        },
        clear:function(){
            var ctx=this.ctx,x=this.zone[0],y=this.zone[1],w=this.zone[2],h=this.zone[3],r=this.radius*Math.min(this.zone[2],this.zone[3]);
            if(r==0)ctx.clearRect(x,y,w,h);
            else {
                ctx.save();
                ctx.translate(x,y);
                this.getPath();
                ctx.clip();
                ctx.clearRect(0,0,w,h);
                ctx.restore();
            }
            return this;
        },
        line:function(text,size,color,style,maxWidth){
            var ctx=this.ctx,x=this.zone[0],y=this.zone[1],w=this.zone[2],h=this.zone[3],r=this.radius*Math.min(this.zone[2],this.zone[3]);
            ctx.save();
            ctx.textAlign="center";
            ctx.textBaseline="middle";
            ctx.font=font || ctx.font;
            ctx.fillStyle=color || (ctx.color || ctx.fillStyle);
            if(size)ctx.font = font.replace(/(\d+)px/, size+"px");
            ctx.fillText(text,x+w/2,y+h/2,maxWidth || w);
            ctx.restore();
            return this;
        }
    };
    window.zone=zone;
}());
