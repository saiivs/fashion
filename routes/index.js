var express = require('express');
const session = require('express-session');
const { redirect } = require('express/lib/response');
const async = require('hbs/lib/async');
const { Db } = require('mongodb');
var config=require('../config/otp')
const paypal = require('paypal-rest-sdk');

var router = express.Router();
var helper = require('../helper/func');
// const { getOffer } = require('../helper/func');
var client=require('twilio')(config.accountSID,config.authToken)

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'ARl89X7dn6cGfHYbINJntTQHmAwBzBt-9OWU2pBnqd07YLnAYXmbGvMFh8kJbbmhVVTjsvxs6FCTvzbV',
  'client_secret': 'EKzIsIgre162FnRM6J-wd0Tm6SyS00AWUWElZvAkvpvIIoZHOuEZrKSki9D2ii9ou7y2VKqDOfkRQP_N'
});

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
  helper.getBanner().then((banner)=>{
    if(req.session.logedin){
    
      helper.getCount(req.session.user._id).then((count)=>{
        console.log(count);
        
        let acc=req.session.user
        console.log(count);
        // req.session.count=count
        res.render('user/index',{value:true,user:true,acc,count,banner});
        value=false;
      })
      
      }
      else{
        helper.getProducts().then((pro)=>{
         
            res.render('user/index',{value:true,user:true,pro,banner});
            value=false;
          
        })
      }
  })
  
  
  }
  );

router.get('/shop',ok,function(req,res){
 
  helper.getProducts().then((pro)=>{
   helper.getCatog().then((catog)=>{
    // let offer=await helper.getOffer()
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

// router.get('/proDetails/:id',(req,res)=>{
//    console.log(req.params.id)
//    req.session.pro=req.params.id
//   res.redirect('/proo')
// })

router.get('/proDetails/:id',ok,(req,res)=>{
  let got=req.params.id
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
    
    let offer=await helper.getOfferSum(req.session.user._id)
    
   
    
    helper.getCartProd(req.session.user._id).then((products)=>{
      let preDeduction=total
      total=total-offer;
      let coupon=0
      console.log(req.session.percentage);
      if(req.session.percentage){
        console.log("coupnnnnnnnnnnnnnnnnn");
        coupon=req.session.percentage
        coupon=(total/100)*coupon
        total=total-coupon
      }
      let acc=req.session.user
      console.log("haii"); 
      res.render('user/shopping-cart',{valuec:true,user:true,acc,products,count:req.session.count,total,offer,preDeduction,coupon})
     
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
    let offer=await helper.getOfferSum(req.session.user._id)
    if(response.removeProduct){
      response.total=total
      response.offer=offer
      res.json(response)
    }else{
      
      res.json({total:total,offer:offer})
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
    let Address=await helper.getSavedAddress(req.session.user._id)
    let offer=await helper.getOfferSum(req.session.user._id)
    let preDeduction=total
     total=total-offer
     let coupon=0
     if(req.session.percentage){
      console.log("coupnnnnnnnnnnnnnnnnn");
      coupon=req.session.percentage
      coupon=(total/100)*coupon
      total=total-coupon
    }
    
    console.log(Address);
    if(total!=0){
      if(req.session.Address){
       let radio=req.session.Address
       res.render('user/checkout',{products,user:true,acc,total,Address,radio,offer,coupon,preDeduction})
      }
      else{
        res.render('user/checkout',{products,user:true,acc,total,Address,offer,coupon,preDeduction})
      }
      
    }
    else{
      res.render('user/shopping-cart',{valuec:true,user:true,acc})
    }
     
  })
})

router.post('/place-order',async(req,res)=>{
  console.log("new oneeeeeeeeeeee");
  console.log(req.body);
  let body=req.body
  console.log(req.body);
 if(req.body['savedaddress']=='save'){
  helper.saveAddress(req.body)
 }
 
  let products=await helper.getCartProdList(req.session.user._id)
  let totalPrice=await helper.getTotal(req.session.user._id)
  let offer=await helper.getOfferSum(req.session.user._id)
  totalPrice=totalPrice-offer
  if(req.session.percentage){
    let coupon=req.session.percentage 
    coupon=(totalPrice/100)*coupon
    totalPrice=totalPrice-coupon
  }
  if(req.body['radio']!='true'){
    console.log(req.body.radio);
     body=await helper.getSavedRAddress(req.body.radio)
     body.paymentMethod=req.body.paymentMethod
  }
  console.log(body);
  helper.placeOrder(body,products,totalPrice).then((orderID)=>{
    req.session.orderID=orderID
    let confirm={
      ID:orderID,
      codSuccess:true 
    }
    
    if(req.body['paymentMethod']=='COD'){
      res.json(confirm)
    }
    else if(req.body['paymentMethod']=='Razor'){ 
      console.log('ithanooooooooooooooo');
      
      helper.getRazorPay(orderID,totalPrice).then((response)=>{
       
        response.razorpay=true;
        response.ID=orderID; 
       
        res.json(response)
      })
    }
    else {
      console.log('paypal elseeeeeeeeeeeeeeeeeeeeeee');
      helper.getPayPal(orderID,totalPrice).then((payment)=>{
        payment.ID=orderID;
        res.json(payment)
      })
    }
  })
})

router.get('/confirm',async(req,res)=>{
  acc=req.session.user
  let ID=req.session.orderID
  let products=await helper.getorderProd(ID)  
  let offer=await helper.getOfferSum(req.session.user._id)
  let address=products.slice(0,1)
  if(req.session.percentage){
    let coupon=req.session.percentage
      coupon=(address[0].sum/100)*coupon
    address[0].sum=address[0].sum-coupon 
  }
  
  
  console.log(address);
  res.render('user/confirm',{user:true,acc,products,address,offer})
  helper.removeCart(req.session.user._id)
})


router.post('/radioAddress',(req,res)=>{
  req.session.Address=req.body;

  res.redirect('/check-out')

})

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>profile>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

router.get('/profile',(req,res)=>{
  if(req.url=='/profile'){
    helper.getprofile(req.session.user._id).then(async(profile)=>{
      let order=await helper.getOrderHistory(req.session.user._id)
      acc=req.session.user
      res.render('user/profile',{user:true,profile,order,acc})
    }) 
  }else{
    res.send("error page found")
  }
  
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
    helper.changePaymentStatus(req.body['order[receipt]']).then(async(response)=>{
      if(req.session.usedCoupon){
        let a=await helper.addUsedCoupon(req.session.usedCoupon,req.session.user._id)
        req.session.usedCoupon=false;
      }
      console.log("payment successfull"); 
      res.json({status:"true"})
    })
  }).catch((err)=>{
    console.log();
    res.json({status:false,errMsg:''})
  })
})

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>paypal>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.

router.get('/success',(req,res)=>{
  ID=req.session.orderID
  helper.changePaymentStatus(ID).then((response)=>{
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
   
    const execute_payment_json = {
      "payer_id": payerId,
      "transactions": [{
          "amount": {
              "currency": "USD",
              "total": "25.00"
          }
      }]
    }
    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
      if (error) {
          console.log(error.response);
          throw error;
      } else {
          console.log(JSON.stringify(payment));
          res.redirect('/confirm');
      }
  });
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

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>Coupon>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

router.post('/couponForUser',(req,res)=>{ 
  console.log(req.body);
  let Coupon=req.body.Coupon_Name
  helper.checkCoupon(Coupon,req.session.user._id).then((check)=>{
      if(check.status){
        res.json({status:true})
      }
      else if(check.notFound){
        console.log('notfounddddd');
        res.json({notFound:true})
      }
      else{
        req.session.usedCoupon=Coupon
        helper.AddCouponCart(req.session.user._id,Coupon).then(async(match)=>{
          console.log('sessionaaaaaaaaaaa');
          if(match.equal)
          {
            res.json(match)  
          }
          else if(match.notequal){
            res.json(match)
          }
          else{
            console.log('ok hereeeeeeeeeeeeee');
            req.session.percentage=check.value
            match.apply=true
            res.json(match)
          }
        })   
    }
  })
})

// router.get('*',(req,res)=>{
//   res.send("")
// })


router.get('/logout',(req,res)=>{
  req.session.logedin=false;
  req.session.catShow=false;
  req.session.percentage=false;
  res.redirect('/')
})
 


module.exports = router;
