const mongo=require("mongodb");
const uri="mongodb+srv://root:QU4VUL4RU8@mycluster.d6kk2.mongodb.net/?retryWrites=true&w=majority&appName=MyCluster";
const client=new mongo.MongoClient(uri);
let db=null;
async function initDB(err){
    if(err){
        console.log("連線失敗",err);
        return;
    }else{
        await client.connect();
        db=client.db("homework2");
        console.log("資料庫連線成功");
    }
};
initDB();
const express=require("express");
const app=express();
const session=require("express-session");
app.use(session({
    secret:"anything",
    resave:false,
    saveUninitialized:true
}));
app.set("view engine","ejs");
app.set("views","./views2");
app.use(express.static("public"));
app.use(express.urlencoded({extended:true}));
app.get("/",async function(req,res){
    res.render("index.ejs");
});
app.get("/member",async function(req,res){
    if(!req.session.member){
        res.redirect("/error?msg=請登入會員");
        return;
    }
    const collection=db.collection("msgBoard");
    const name=req.session.member.name;
    let result=await collection.find({}).sort({
        time:1
    });
    let data=[];
    await result.forEach(function(member){
        data.push(member);
    });
    res.render("member.ejs",{name:name,data:data});
});
app.get("/success",function(req,res){
    const msg=req.query.msg;
    res.render("success.ejs",{msg:msg});
});
app.get("/error_member",function(req,res){
    const msg=req.query.msg;
    res.render("error_member.ejs",{msg:msg});
});
app.get("/error",function(req,res){
    const msg=req.query.msg;
    res.render("error.ejs",{msg:msg});
});
app.get("/signout",function(req,res){
    req.session.member=null;
    res.redirect("/");
});
app.post("/signin",async function(req,res){
    const email=req.body.loginEmailEnter;
    const password=req.body.loginPasswordEnter;
    const collection=db.collection("member");
    let result=await collection.findOne({
        $and:[
            {email:email},
            {password:password}
        ]
    });
    if(result===null){
        res.redirect("/error?msg=登入失敗，電子郵件或密碼輸入錯誤");
        return;
    }else{
        req.session.member=result;
        res.redirect("member");
    }
});
app.post("/signup",async function(req,res){
    const name=req.body.nameEnter;
    const email=req.body.registerEmailEnter;
    const password1=req.body.registerPasswordEnter1;
    const password2=req.body.registerPasswordEnter2;
    const collection=db.collection("member");
    let result=await collection.findOne({
        email:email
    });
    if(result!==null){
        res.redirect("/error?msg=註冊失敗，信箱重複");
        return;
    }else if(name.length==0 || password1.length<=2){
        res.redirect("/error?msg=註冊失敗(稱呼需至少1個字、密碼3個字)");
        return;
    }else if(password1!==password2){
        res.redirect("/error?msg=註冊失敗，確認密碼錯誤");
        return;
    }else if(name.length!==0 && password1.length>=3){
        await collection.insertOne({
        name:name,email:email,password:password1
    })};
    res.redirect("/success?msg=恭喜！註冊成功！");
});
app.post("/msg",async function(req,res){
    const name=req.session.member.name;
    const msg=req.body.msg;
    const time=Date.now();
    const year=new Date().getFullYear();
    const month=new Date().getMonth()+1;
    const day=new Date().getDate();
    const hours=new Date().getHours();
    const minutes=new Date().getMinutes();
    const seconds=new Date().getSeconds();
    const collection=db.collection("msgBoard");
    if(msg.length!==0){
        await collection.insertOne({
        name:name,msg:msg,time:time,year:year,month:month,day:day,hours:hours,minutes:minutes,seconds:seconds
    })}else{
        res.redirect("error_member?msg=請輸入留言");
        return;
    };
    res.redirect("/member");
});
app.listen(3000,function(){
    console.log("Server Started");
});