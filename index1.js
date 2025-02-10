const mongo=require("mongodb");
const uri="mongodb+srv://root:@mycluster.d6kk2.mongodb.net/?retryWrites=true&w=majority&appName=MyCluster";
const client=new mongo.MongoClient(uri);
let db=null;
async function initDB(err){
    if(err){
        console.log("連線失敗",err);
        return;
    }else{
        await client.connect();
        db=client.db("homework");
        console.log("資料庫連線成功");
    }
};
initDB();
const express=require("express");
const app=express();
app.set("view engine","ejs");
app.set("views","./views");
app.use(express.static("public"));
app.use(express.urlencoded({extended:true}));
app.get("/",async function(req,res){
    const collection=db.collection("msgBoard");
    let result=await collection.find({}).sort({
        time:1
    });
    let data=[];
    await result.forEach(function(msgBoard){
        data.push(msgBoard);
    });
    res.render("index.ejs",{data:data});
});
app.get("/error",function(req,res){
    const msg=req.query.msg;
    res.render("error.ejs",{msg:msg});
});
app.post("/signup",async function(req,res){
    const name=req.body.name;
    const msg=req.body.msg;
    const time=Date.now();
    const year=new Date().getFullYear();
    const month=new Date().getMonth()+1;
    const day=new Date().getDate();
    const hours=new Date().getHours();
    const minutes=new Date().getMinutes();
    const seconds=new Date().getSeconds();
    const collection=db.collection("msgBoard");
    if(name.length!==0 && msg.length!==0){
        await collection.insertOne({
        name:name,msg:msg,time:time,year:year,month:month,day:day,hours:hours,minutes:minutes,seconds:seconds
    })}else{
        res.redirect("/error?msg=請輸入稱呼和留言");
        return;
    };
    res.redirect("/");
});
app.listen(3000,function(){
    console.log("Server Started");
});
