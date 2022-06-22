var express = require('express');
const session = require('express-session');
const { redirect } = require('express/lib/response');
const async = require('hbs/lib/async');
const { Db } = require('mongodb');
var config=require('../config/otp')

var router = express.Router();
var helper = require('../helper/func')
var client=require('twilio')(config.accountSID,config.authToken)
function verify(req,res,next){
  if(req.session.logedin){
    res.redirect('/')
  }
  else{
   next()
  }
}
function ok(req,res,next){
  if(req.session.logedin){
    helper.getCount(req.session.user._id).then((count)=>{
      req.session.count=count;
      next()
    })
  }
  else{
    next()
  } 
}



/* GET home page. */
router.get('/',function(req, res, next) {
  
  if(req.session.logedin){
    
  helper.getCount(req.session.user._id).then((count)=>{
    console.log(count);
    
    let acc=req.session.user
    console.log(count);
    // req.session.count=count
    res.render('user/index',{value:true,user:true,acc,count});
    value=false;
  })
  
  }
  else{
    helper.getProducts().then((pro)=>{
     
        res.render('user/index',{value:true,user:true,pro});
        value=false;
      
    })
  }
  }
  );

router.get('/shop',ok,function(req,res){
 
  helper.getProducts().then((pro)=>{
   helper.getCatog().then((catog)=>{
    let acc=req.session.user
    if(req.session.help){
      product=req.session.CatShow
      console.log(product.status);
    }
    else{
      product=pro
      console.log(product[0].status);
      console.log("haiiiii poldddddddd");
    }
    res.render('user/shop',{valuea:true,user:true,product,acc,count:req.session.count,catog});
    req.session.help=false;
    
    valuea=false;
   })
  })
});

router.get('/contacts',function(req,res){
  res.render('user/contact',{valueb:true,user:true});
  valueb=false;
})

router.get('/login-user',(req,res)=>{
  
    if(req.session.logedin){
      res.redirect('/')
    }
    else{
      res.render('user/login-user',{user:true,eror:req.session.error})
      req.session.error=false;
    }
})

router.post('/login-user',(req,res)=>{

  
    helper.doLogin(req.body).then((response)=>{
      if(response.status){ 
        if(response.user.status){
          req.session.user=response.user;
          req.session.logedin=true;
          res.redirect('/')
        }
        else{
          req.session.error="You are blocked"
          res.redirect('/login-user')
        }
       
      }
      else{
          req.session.error="invalid email or password"
          res.redirect('/login-user')
      }
     
    })
})


// router.get('/add-cart',(req,res)=>{

//   res.render('user/shopping-cart',{count:req.session.count})
// })

router.get('/wishlist',(req,res)=>{
  res.render('user/wishlist',{user:true});
})

router.get('/signup',verify,(req,res)=>{
  res.render('user/user-signup',{user:true,EOR:req.session.preexist});
  req.session.preexist=false;
})

router.get('/otp',(req,res)=>{
  if(req.session.ok){
    res.redirect('/login-user')
  }
  else if(req.session.logedin){
    res.redirect('/')
  }
  else{
    var num=req.session.phone
    res.render('user/otp-verify',{num,er:req.session.Er_otp,user:true})
    req.session.Er_otp=false
  }
  
 
})

router.post('/sign-up',(req,res)=>{
  req.session.ok=false;
helper.checkUser(req.body).then((exist)=>{
  if(exist.user){
    req.session.preexist="user already exist"
    res.redirect('/signup')
  }
  else{
    if(req.body.username&&req.body.email&&req.body.phone&&req.body.password){
      var number=req.body.phone
      req.session.phone=req.body.phone
      req.session.userData=req.body
       
 

      client.verify.services(config.serviceSID).verifications.create({
        to: `+91${number}`,
        channel: "sms",
      }).then((data)=>{
        console.log(data);
      console.log("line 40 data");
     
      res.redirect('/otp')
       
      })
    }
  }
})

 
})
router.post('/otp-verify',(req,res)=>{
  var otp=req.body.otp
  var number=req.session.phone

  client.verify.services(config.serviceSID).verificationChecks.create({
     to: `+91${number}`,
    code: otp,
     }).then((data)=>{
      console.log(data.status+"otp status???????")

      if(data.status=='approved'){
       
    helper.addData(req.session.userData).then((response)=>{
    req.session.ok=true; 
    res.redirect('/login-user')
    })
   }
   else{
     req.session.Er_otp='invalid otp'
     res.redirect('/otp')
   }
})
})





// >>>>>>>>>>>>product details>>>>>>>>>>

router.get('/proDetails/:id',(req,res)=>{
   console.log(req.params.id)
   req.session.pro=req.params.id
  res.redirect('/proo')
})

router.get('/proo',ok,(req,res)=>{
  let got=req.session.pro
  helper.getedit(got).then((data)=>{
    let count=req.session.count
    console.log(data);
    res.render('user/product-detail',{user:true,valuea:true,data,count})
  })
 
})

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>Cart details>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
router.get('/Add-cart/:id',(req,res)=>{

  helper.addCart(req.params.id,req.session.user._id).then((data)=>{
    console.log("call apii");
    if(data.status){
      res.json({status:false})
    }
    else{
      res.json({status:true})
    }
    
    
  })
})

router.get('/cart',ok,async(req,res)=>{
  
  if(req.session.logedin){
    
    let total=await helper.getTotal(req.session.user._id)
    helper.getCartProd(req.session.user._id).then((products)=>{
      // helper.getCount(req.session.user._id).then((count)=>{
       
      // })
      
      let acc=req.session.user
      console.log("haii"); 
      res.render('user/shopping-cart',{valuec:true,user:true,acc,products,count:req.session.count,total})
     
    })
  }
  else{
    
    res.redirect('/login-user')
  }
  
})

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>changeQuantity>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

router.post('/changeQuantity',(req,res)=>{
  
  console.log(req.body);
  
  helper.changeProQuantity(req.body).then(async(response)=>{
    let total=await helper.getTotal(req.session.user._id)
    if(response.removeProduct){
      response.total=total
      res.json(response)
    }else{
      
      res.json({total:total})
    }
  
   
  })
})  

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>remve from cart>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

router.post('/removeCart',(req,res)=>{
  helper.removeProCart(req.body).then((data)=>{
    console.log(data);
    res.json(data)
  })
})

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.filter catagories>>>>>>>>>>>>>>>>>>>>>>>>>
router.get('/showCart/:name',(req,res)=>{
  let name=req.params.name;
  helper.getCatName(name).then((pro)=>{
    req.session.CatShow=pro
    req.session.help=true;
    res.redirect('/shop')
  })
})
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>check out>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

router.get('/check-out',(req,res)=>{
  helper.getCartProd(req.session.user._id).then(async(products)=>{
    acc=req.session.user
    let total=await helper.getTotal(req.session.user._id)
    if(total!=0){
      res.render('user/checkout',{products,user:true,acc,total})
    }
    else{
      res.render('user/shopping-cart',{valuec:true,user:true,acc})
    }
     
  })
})

router.post('/place-order',async(req,res)=>{
  let products=await helper.getCartProdList(req.session.user._id)
  let totalPrice=await helper.getTotal(req.session.user._id)
  helper.placeOrder(req.body,products,totalPrice).then((orderID)=>{
    let confirm={
      ID:orderID,
      codSuccess:true
    }
    
    if(req.body['paymentMethod']=='COD'){
      res.json(confirm)
    }
    else{ 
      console.log('ithanooooooooooooooo');
      
      helper.getRazorPay(orderID,totalPrice).then((response)=>{
       
        response.codSuccess=false;
        response.ID=orderID; 
       
        res.json(response)
      })
    }
  })
})

router.get('/confirm/:id',async(req,res)=>{
  acc=req.session.user
  let products=await helper.getorderProd(req.params.id)
  let address=products.slice(0,1) 
  res.render('user/confirm',{user:true,acc,products,address})
  helper.removeCart(req.session.user._id)
})

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>profile>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

router.get('/profile',(req,res)=>{
  helper.getprofile(req.session.user._id).then(async(profile)=>{
    let order=await helper.getOrderHistory(req.session.user._id)
    acc=req.session.user
    res.render('user/profile',{user:true,profile,order,acc})
  }) 
})

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.wishList>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

router.get('/wishlist/:id',(req,res)=>{
 let id=req.params.id
 let user=req.session.user._id
 console.log('nextObneeeeeeeeeeeeee');
 helper.AddWishList(id,user).then((pro)=>{
  res.json({status:true})
 })  
})

router.get('/wishlistpage',ok,(req,res)=>{
  let user=req.session.user._id
  helper.getWishList(user).then(async(list)=>{
    acc=req.session.user
   let count= req.session.count
    res.render('user/wishlist',{list,user:true,acc,count})
  })
})

router.get('/removelist/:id',(req,res)=>{
  proID=req.params.id
  userID=req.session.user._id
  helper.removeList(proID,userID).then(()=>{
    res.json({status:true})
  })
})

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>razorPay>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

router.post('/verify-payment',(req,res)=>{
  console.log(req.body);
  helper.verifyPayment(req.body).then((response)=>{
    helper.changePaymentStatus(req.body['order[receipt]']).then((response)=>{
      console.log("payment successfull");
      res.json({status:"true"})
    })
  }).catch((err)=>{
    console.log();
    res.json({status:false,errMsg:''})
  })
})

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.ordercancel userside>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

router.get('/cancelOrder/:id',(req,res)=>{
  helper.statusUpdate(req.params.id).then((response)=>{
    res.json({status:true})
  })
})

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>changePassword>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.

router.post('/changePassword',(req,res)=>{
  console.log(req.body);
  helper.checkPassword(req.body,req.session.user._id).then((verify)=>{
    if(verify.status){
      console.log("verifyeddddddddddd");
    res.json(verify)
    }
    else{
      res.json(verify)
    }
  })
})


router.get('/logout',(req,res)=>{
  req.session.logedin=false;
  req.session.catShow=false;
  res.redirect('/')
})
 


module.exports = router;
