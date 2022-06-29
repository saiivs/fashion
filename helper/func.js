var db = require('../config/conection')
var bcrypt = require('bcrypt')

const collections = require('../config/collections');
const async = require('hbs/lib/async');

const { ObjectId } = require('mongodb');
const res = require('express/lib/response');
var objectId=require('mongodb').ObjectId
const RazorPay=require('razorpay');
const { resolve } = require('path');
const paypal=require('paypal-rest-sdk');
const { exitCode } = require('process');
var instance = new RazorPay({
    key_id: 'rzp_test_ZE8zDNmBvMPZXe',
    key_secret: 'qU6UsHaXFxDClWanmJxjRMrz',
});

module.exports={
    addData:(con)=>{
        
        return new Promise(async(res,rej)=>{
            con.password=await bcrypt.hash(con.password,10)
            db.get().collection(collections.UDATA).insertOne(con).then((data)=>{
            db.get().collection('userdata').update({username:con.username},{$set:{status:true}})
                res(data)
            })
        })
    },

    getData:()=>{
        return new Promise((res,rej)=>{
            let user=db.get().collection('userdata').find().toArray()
            res(user)
        })
    },
    doLogin:(doc)=>{
        console.log(doc);
        return new Promise(async(res,rej)=>{
           let response={}
            let user=await db.get().collection('userdata').findOne({email:doc.email})
            if(user){
                bcrypt.compare(doc.password,user.password).then((data)=>{
                    console.log(data+"hayay");
                    if(data){
                        console.log(data);
                        console.log("login success");
                        response.user=user
                        response.status=true
                        res(response)
                    }
                    else{
                        console.log("login failed");
                        response.status=false;
                        res(response)
                    }
                })
            }
            else{
                console.log("login failed");
                response.status=false;
                res(response)

            }
        })
    },
    blockuser:(id)=>{
        return new Promise((res,rej)=>{
            db.get().collection("userdata").updateOne({_id:objectId(id)},{$set:{status:true,status:false}}).then((data)=>{
                console.log(data);
                res(data)
            })
        })
    },
    unblockuser:(id)=>{
        return new Promise((res,rej)=>{
            db.get().collection("userdata").updateOne({_id:objectId(id)},{$set:{status:false,status:true}}).then((data)=>{
                res(data)
            })
        })
    },

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>products>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>


    addProducts:(con)=>{ 
        con.price=parseInt(con.price)
        con.quantity=parseInt(con.quantity)
        return new Promise((res,rej)=>{
            db.get().collection("prodata").insertOne(con).then((data)=>{
                db.get().collection(collections.PRODATA).update({},{$set:{status:true}})
                db.get().collection(collections.PRODATA).update({},{$set:{offername:null}})
                db.get().collection(collections.PRODATA).update({},{$set:{offer:0}})
                
                console.log(data);
                res(data.insertedId)
            })
        })
    },
    getProducts:()=>{
        return new Promise(async(res,rej)=>{
         let pro=await db.get().collection('prodata').find().toArray()
         res(pro)
        
        })
    },

    delProducts:(id)=>{
        return new Promise((res,rej)=>{
            db.get().collection('prodata').deleteOne({_id:objectId(id)}).then((result)=>{
                res(result)
            })
        })
    },
 
    editProducts:(id,detname)=>{
        return new Promise((res,rej)=>{
            db.get().collection("prodata").updateOne({_id:objectId(id)},{$set:{name:detname.name,quantity:detname.quantity,cat:detname.cat,price:detname.price}}).then((result)=>{
                res(result)
            })
        })
    },

    getedit:(id)=>{
        return new Promise((res,rej)=>{
            db.get().collection('prodata').findOne({_id:objectId(id)}).then((data)=>{
                res(data)
            })
        })
    },
    checkUser:(doc)=>{
        return new Promise((res,rej)=>{
            let exist={}
            let done=db.get().collection('userdata').findOne({email:doc.email}).then((data)=>{
               
                if(data){
                    exist.user=true;
                    res(exist)
                }
                else{
                    exist.user=false;
                    res(exist)
                }
            })
           
        })
    },
// ........................................ catagories-----------------------------------------------------------------


    AddCatog:(doc)=>{
        return new Promise((res,rej)=>{
            db.get().collection("catgories").insertOne(doc).then((data)=>{
                res(data);
            })
        })
    },

    getCatog:()=>{
        return new Promise(async(res,rej)=>{
            let catog=await db.get().collection("catgories").find().toArray()
            res(catog)
        })
    },

    delCatog:(id)=>{
        return new Promise((res,rej)=>{
            db.get().collection("catgories").remove({_id:objectId(id)}).then((data)=>{
                res(data)
            })
        })
    },
    checkCatEx:(name)=>{
        return new Promise((res,rej)=>{
            let got=db.get().collection(collections.PRODATA).find({cat:name}).toArray()
            if(got==null){
                res({status:true})
            }
            else{
                res({status:false})
            }
        })
    },
   catStatus:(name)=>{
     return new Promise((res,rej)=>{
        db.get().collection(collections.PRODATA).update({cat:name},{$set:{status:false}}).then((response)=>{
            res()
        })
     })
   },

    editcatog:(id,editcat)=>{
        return new Promise((res,rej)=>{
            db.get().collection("catgories").updateOne({_id:objectId(id)},{$set:{cat:editcat.cat}}).then((data)=>{
                console.log(data);
                res(data)
            })
        })
    },

    geteditcatog:(id)=>{
        return new Promise((res,rej)=>{
            db.get().collection("catgories").findOne({_id:objectId(id)}).then((data)=>{
                res(data)
            })
        })
    },

    checkCat:(con)=>{
        return new Promise((res,rej)=>{
            let response={}
            db.get().collection("catgories").findOne({cat:con.cat}).then((cate)=>{
                if(cate){
                
                    response.got=true;
                    res(response)
                }
                else{
                   
                    response.got=false;
                    res(response)
                }
            })
           
        })
    },
    catUpdateStatus:(name)=>{
        return new Promise((res,rej)=>{
             db.get().collection(collections.PRODATA).update({cat:name},{$set:{status:true}}).then((response)=>{
                res()
             })
        })
    },
    

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>ADD CART>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    addCart:(prodId,userId)=>{
        let proObj={
            item:objectId(prodId),
            quantity:1
        }
        return new Promise(async(res,rej)=>{
            let cart=await db.get().collection("userCart").findOne({user:objectId(userId)})
            if(cart){
                let proExist=cart.products.findIndex(product=> product.item==prodId)
                if(proExist!=-1){
                    
                   db.get().collection('userCart').updateOne({user:objectId(userId),'products.item':objectId(prodId)},{$inc:{'products.$.quantity':1}}).then((data)=>{
                       res({status:true})
                   })
                }
                else{
                    db.get().collection("userCart").updateOne({user:objectId(userId)},{$push:{products:proObj}}).then((data)=>{
                        res({status:false})
                    })
                }
               
            }
            else{
                let cart={
                    user:objectId(userId),
                    products:[proObj]
                }
                db.get().collection("userCart").insertOne(cart).then((data)=>{
                    res({status:false})
                })
            }
        })
    },

     getCartProd:(userId)=>{
        return new Promise(async(res,rej)=>{
            let cartItems=await db.get().collection('userCart').aggregate([
                {
                    $match:{user:objectId(userId)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        items:'$products.item',
                        quantity:'$products.quantity'
                    }
                },
                {
                    $lookup:{
                        from:'prodata',
                        localField:'items',
                        foreignField:'_id',
                        as:'product'
                    }
                },
                {
                    $project:{
                        items:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                    }
                },
                {
                    $project:{
                        items:1,quantity:1,product:1,total:{$multiply:['$quantity','$product.price']}
                    }
                }
            ]).toArray()
            
            res(cartItems)
        })
    },

    // >>>>>>>>>>>>>>>>>>>>>>checkCart>>>>>>>>>>>>>>>>>>><<<<<<<<<<<
    // checkCart:(id)=>{
    //     return new Promise((res,rej)=>{
    //         db.get()
    //     })
    // }

    // >>>>>>>>>>>>>>>>>>>>>>>>Count Cart>>>>>>>>>>>>>>>>>>>>>>>>>>

    getCount:(id)=>{
        return new Promise(async(res,rej)=>{
            let count=0
            let cart=await db.get().collection('userCart').findOne({user:objectId(id)})
            console.log(cart);
            if(cart){
                count=cart.products.length
                res(count)
            }
            else{
                res(count)
            }
        })
    },

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>change product Quantity>>>>>>>>>>>>>>>>>>>>>>>>>>>

    changeProQuantity:(details)=>{
        count=parseInt(details.count)
        quantity=parseInt(details.quantity)
       let price=details.price
        return new Promise((res,rej)=>{
           
            if(count==-1 && quantity==1){
                db.get().collection('userCart').updateOne({_id:objectId(details.cart)},{$pull:{products:{item:objectId(details.product)}}}).then((data)=>{
                res({removeProduct:true})
                }) 
            }
            else{
                total=price*(quantity+count)
               db.get().collection('userCart').updateOne({_id:objectId(details.cart),'products.item':objectId(details.product)},{$inc:{'products.$.quantity':count}}).then((data)=>{
               res({status:true})
                })
            }
        }) 
    },

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>remove cart product>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 
    
    removeProCart:(details)=>{
        return new Promise((res,rej)=>{
            db.get().collection('userCart').updateOne({_id:objectId(details.cart)},{$pull:{products:{item:objectId(details.product)}}}).then((data)=>{
                res(data)
            })
        })
    },

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>Total>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

getTotal:(id)=>{
    return new Promise(async(res,rej)=>{
        let total=await db.get().collection('userCart').aggregate([
            {
                $match:{user:objectId(id)}
            },
            {
                $unwind:'$products'
            },
            {
                $project:{  
                    items:'$products.item',
                    quantity:'$products.quantity'
                }
            },
            {
                $lookup:{
                    from:'prodata',
                    localField:'items',
                    foreignField:'_id',
                    as:'product'
                }
            },
            {
                $project:{
                    items:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                }
            },
            {
                $group:{
                    _id:null,
                    sum:{$sum:{$multiply:['$quantity','$product.price']}}
                }
            }
          
        ]).toArray()
        if(!total[0]){
            res(0)
        }
        else{

            console.log(total);
            res(total[0].sum)
        }
       
    })
},

getCatName:(name)=>{
    
    return new Promise(async(res,rej)=>{
       let pro=await db.get().collection('prodata').find({cat:name}).toArray()
       res(pro)

    })
},

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>address details>>>>>>>>>>>>>>>>>>>>>>>>>>>>

placeOrder:(order,products,total)=>{
    console.log("hai order");
    console.log(order);
    return new Promise((res,rej)=>{
       let status=order.paymentMethod==='COD'?'placed':'pending'
       var date=new Date()
       var month=date.getUTCMonth() + 1
       var day=date.getUTCDate()
       var year=date.getUTCFullYear()
       let orderObj={
        deliveryDetails:{
            name:order.name,
            mobile:order.phone,
            address:{
                    ST:order.STaddress,
                    AP:order.APaddress,
                    town:order.Town_city,
                    country:order.Country_state,
                    postCode:order.postCode, 
                    }
        },
        email:order.email,
        user:objectId(order.user),
        products:products,
        totalPrice:total,
        paymentMethod:order.paymentMethod,
        date:year + "/" + month + "/" + day,
        status:status
       }
       db.get().collection('orderCollection').insertOne(orderObj).then((response)=>{
       
        res(response.insertedId)
        
      })
    })

},

saveAddress:(address)=>{
    return new Promise((res,rej)=>{
        db.get().collection(collections.ADDRESS).insertOne(address).then((success)=>{
            res(success)
        })
    })
},

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>saved address>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

getSavedAddress:(ID)=>{
    console.log(ID);
    return new Promise(async(res,rej)=>{
    let address=await db.get().collection(collections.ADDRESS).find({user:ID}).toArray()
    res(address)
})
},
getSavedRAddress:(ID)=>{
    console.log(ID);
    return new Promise(async(res,rej)=>{
    let address=await db.get().collection(collections.ADDRESS).findOne({_id:ObjectId(ID)})
    res(address)
})
},

getCartProdList:(id)=>{
    return new Promise(async(res,rej)=>{
        let cart=await db.get().collection('userCart').findOne({user:objectId(id)})
        res(cart.products)
    })
},

getAddress:(id)=>{
    console.log(id);
return new Promise(async(res,rej)=>{
    let address=await db.get().collection('orderCollection').find({user:objectId(id)}).toArray()
     
   
}) 
},

removeCart:(id)=>{
    return new Promise((res,rej)=>{
        db.get().collection('userCart').deleteOne({user:objectId(id)}).then((response)=>{
            res(response)
        }) 
    })  
},
 
getorderProd:(id)=>{
    
    return new Promise(async(res,rej)=>{
        let order=await db.get().collection('orderCollection').aggregate([
            {
                $match:{_id:objectId(id)}
            },
            {
                $unwind:'$products'
            },
            {
                $project:{
                    items:'$products.item',
                    quantity:'$products.quantity',
                    deliver:'$deliveryDetails.address',
                    sum:'$totalPrice',
                    Date:'$date'
                }
            },
            {
                $lookup:{
                    from:'prodata',
                    localField:'items',
                    foreignField:'_id',
                    as:'product'
                }
            },
            {
                $project:{
                    sum:1,items:1,quantity:1,deliver:1,Date:1,product:{$arrayElemAt:['$product',0]}
                }
            },
            {
                $project:{
                    sum:1,items:1,quantity:1,product:1,Date:1,deliver:1,total:{$multiply:['$quantity','$product.price']}
                }
            }
        ]).sort({Date:-1}).toArray()
        
        res(order)
    })
          
},

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>get profile>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

getprofile:(id)=>{
return new Promise((res,rej)=>{
    db.get().collection(collections.UDATA).findOne({_id:objectId(id)}).then((prodata)=>{
        res(prodata)
    })
})
},

getOrder:(id)=>{
    return new Promise((res,rej)=>{
        db.get().collection('orderCollection').findOne({_id:objectId(id)}).then((data)=>{
            res(data)
        })
    }) 
},

getOrderHistory:(id)=>{
    return new Promise(async(res,rej)=>{
      let order=await  db.get().collection('orderCollection').aggregate([
        {
            $match:{user:objectId(id)}
        },
        {
            $project:{
                paymentMethod:'$paymentMethod',
                status:'$status',
                Date:'$date',
                items:'$products.item',
                quantity:'$products.quantity', 
                totalPrice:'$totalPrice',
                address:'$deliveryDetails.address'
            }
        },
        {
            $lookup:{
                from:collections.PRODATA,
                localField:'items',
                foreignField:'_id',
                as:'products'
            }
        },
        {
            $project:{
                paymentMethod:1,status:1,Date:1,items:1,products:1,totalPrice:1,quantity:1,address:1
            }
        }
      ]).toArray()
      console.log(order);
      res(order)
    })
},
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>orderList>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.

getOrderAdmin:()=>{
    return new Promise(async(res,rej)=>{
       let order=await db.get().collection(collections.ORDER).aggregate([
        {
            $project:{
                paymentMethod:'$paymentMethod',
                name:'$deliveryDetails.name',
                status:'$status',
                user:'$user',
                Date:'$date',
                items:'$products.item',
                mobile:'$deliveryDetails.mobile', 
                totalPrice:'$totalPrice',
                Email:'$email' 
            }
        },
        {
            $lookup:{
                from:collections.PRODATA,
                localField:'items',
                foreignField:'_id',
                as:'products'
            }
        },
        {
            $lookup:{
                from:collections.UDATA,
                localField:'user',
                foreignField:'_id',
                as:'Names'
            }
        },
        {
            $project:{
                paymentMethod:1,status:1,Date:1,items:1,products:1,totalPrice:1,quantity:1,name:1,mobile:1,Email:1,Names:1
            }
        }
       ]).toArray()
       console.log('ithan sanam');
       console.log(order);
       res(order)
    })
},
statusUpdate:(id)=>{
return new Promise((res,rej)=>{
    db.get().collection(collections.ORDER).updateOne({_id:objectId(id)},{$set:{status:'cancelled'}}).then((response)=>{
        res(response)
    })
})
},

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.wishList>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
AddWishList:(proID,user)=>{
    return new Promise(async(res,rej)=>{
            let wishlist={
               item:objectId(proID)
            }
            let exist=await db.get().collection(collections.WISHLIST).findOne({user:objectId(user)})
            if(exist){
                let proExist=exist.products.findIndex(product=> product.item==proID)
                if(proExist!=-1){
                   res()
                }
                else{
                    db.get().collection(collections.WISHLIST).updateOne({user:objectId(user)},{$push:{products:wishlist}}).then((data)=>{
                        res()
                    })
                }
            }
            else{
                let wish={
                    user:objectId(user),
                    products:[wishlist]
                }
                db.get().collection(collections.WISHLIST).insertOne(wish).then((data)=>{
                    res()
                })
            }
        })
    },

    getWishList:(userID)=>{
        return new Promise(async(res,rej)=>{
            let list=await db.get().collection(collections.WISHLIST).aggregate([
                {
                    $match:{user:objectId(userID)}
                },
                {
                    $project:{
                        items:'$products.item',
                    }
                },
                {
                    $lookup:{
                        from:collections.PRODATA,
                        localField:'items',
                        foreignField:'_id',
                        as:'wishProduct'
                    }
                },
                {
                    $project:{
                        wishProduct:1
                    }
                }
            ]).toArray()
            console.log(list);
            res(list)
          
        })
    },

    removeList:(proID,userID)=>{
        return new Promise((res,rej)=>{
            db.get().collection(collections.WISHLIST).updateOne({user:objectId(userID)},{$pull:{products:{item:objectId(proID)}}}).then(()=>{
                res()
            })
        })
    },

    //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>razorPay>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    getRazorPay:(orderID,totalPrice)=>{
        return new Promise((res,rej)=>{
            var options ={
                amount: totalPrice*100, 
                currency: "INR",
                receipt: ''+orderID
            };
            instance.orders.create(options, function(err,order){
                if(err){
                    console.log(err);
                }
                else{
                    console.log(order);
                    res(order)
                }
                
            })
        })
    },
    getPayPal:(orderID,totalPrice)=>{
        console.log(totalPrice);
        console.log('getpaypal gottttttttttttt');
        return new Promise((res,rej)=>{
            const create_payment_json = {
                "intent": "sale",
                "payer": {
                    "payment_method": "paypal"
                },
                "redirect_urls": {
                    "return_url": "http://localhost:3000/success",
                    "cancel_url": "http://localhost:3000/cancel"
                },
                "transactions": [{
                    "item_list": {
                        "items": [{
                            "name": "Red Sox Hat",
                            "sku": "001",
                            "price": totalPrice,
                            "currency": "USD",
                            "quantity": 1
                        }]
                    },
                    "amount": {
                        "currency": "USD",
                        "total": totalPrice
                    },
                    "description": "Hat for the best team ever"
                }]
            }
            paypal.payment.create(create_payment_json, function (error, payment) {
                console.log('create gotttttttttttttttttttttttt');
                if (error) { 
                    console.log('got the errrorrrrr');
                    throw error; 
                } else {
                    // for(let i = 0;i < payment.links.length;i++){
                    //   if(payment.links[i].rel === 'approval_url'){
                    //     res.redirect(payment.links[i].href);
                    //   }
                    // }
                    res(payment)
                }
              })
            
        })   
    },
   

    

    verifyPayment:(details)=>{
        return new Promise((res,rej)=>{
        const crypto = require('crypto');
        let hmac = crypto.createHmac('sha256','qU6UsHaXFxDClWanmJxjRMrz')
        
        hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]'])
        hmac=hmac.digest('hex')

        if(hmac==details['payment[razorpay_signature]']){
            console.log('matched55555');
            res()
        }
        else{
            console.log("rejected");
            rej()
        }
        })
    },

    changePaymentStatus:(orderID)=>{
        console.log(orderID+"statussssssssss");
        return new Promise((res,req)=>{
            db.get().collection(collections.ORDER).updateOne({_id:objectId(orderID)},
            {
                $set:{
                    status:'placed'
                }
            }).then(()=>{
                res()
            })
        })
    },

   // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>verifyuserpassword>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

   checkPassword:(body,ID)=>{
    return new Promise(async(res,rej)=>{
        let response={}
        
        console.log(body.old_Pass);
        let pass=await db.get().collection(collections.UDATA).findOne({_id:objectId(ID)})
        if(pass){
            bcrypt.compare( body.old_Pass,pass.password).then(async(done)=>{
                console.log(done);
                if(done){
                    if(body.new_Pass==body.con_Pass){
                        body.new_Pass=await bcrypt.hash(body.new_Pass,10)
                        db.get().collection(collections.UDATA).updateOne({_id:objectId(ID)},{$set:{password:body.new_Pass}})
                        response.status=true;
                        console.log('matched');
                        res(response)
                    } 
                    else{
                        response.status=false;
                        res(response)
                    }   
                }
                else{
                    response.status=false;
                    res(response)
                }
            })
        }
    })
   },

   //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>banners>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.

   addBanner:(body)=>{
    return new Promise(async(res,rej)=>{
        let banner=await db.get().collection(collections.BANNERS).findOne()
        if(!banner){
            let created=await db.get().createCollection(collections.BANNERS,{"capped":true,"size":2000,"max":1})
        }
       
        db.get().collection(collections.BANNERS).insertOne(body).then((banner)=>{
            res(banner.insertedId)
        })
    })
   },

   getBanner:()=>{
    console.log("bannner functionnnnnnn");
    return new Promise((res,rej)=>{
        db.get().collection(collections.BANNERS).findOne().then((response)=>{
            res(response)
        })
    })
   },

   //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>offers>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.

   addOffer:(offer)=>{
    console.log("offer functionnnnnnnnnnnnnnnnnnnnnnnnn");
    return new Promise((res,rej)=>{
        db.get().collection(collections.OFFERS).insertOne(offer).then((response)=>{
            res(response)
        })
    })
   },

   getOffer:()=>{
    console.log("getoferrrrrrrrrrrr");
    return new Promise(async(res,rej)=>{
       let offer=await db.get().collection(collections.OFFERS).find().toArray()
       res(offer)
    })
   },
 
   updateOffer:(id,value)=>{
    value=parseInt(value)
    return new Promise(async(res,rej)=>{
       let product=await db.get().collection(collections.PRODATA).findOne({_id:objectId(id)})
       let userOfferDisplay=value
        value=parseInt((product.price/100)*value)
        db.get().collection(collections.PRODATA).updateOne({_id:objectId(id)},{$set:{offer:value,offername:userOfferDisplay}}).then((response)=>{
            res()
        })
    })
   },

   getOffervalue:(offer)=>{
    return new Promise((res,rej)=>{
        db.get().collection(collections.OFFERS).findOne({offername:offer}).then((offer)=>{
            res(offer.percentage)
        })
    }) 
   },

   getOfferSum:(id)=>{
    return new Promise(async(res,rej)=>{
       let offer=await db.get().collection(collections.USERCART).aggregate([
            {
                $match:{user:objectId(id)}
            },
            {
                $unwind:'$products'
            },
            {
                $project:{
                    items:'$products.item',
                    quantity:'$products.quantity'
                }
            },
            {
                $lookup:{
                    from:'prodata',
                    localField:'items',
                    foreignField:'_id',
                    as:'product'
                }
            },
            {
                $project:{
                    items:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                }
            },
            {
                $group:{
                    _id:null,
                    offer:{$sum:{$multiply:['$quantity','$product.offer']}}
                }
            }
        ]).toArray()
        if(!offer[0]){
            res(0)
        }
        else{
            res(offer[0].offer)
        }
       
    })
   },

   rmvOffer:(id)=>{
    console.log("hghgjhgjh");
    return new Promise((res,rej)=>{
        db.get().collection(collections.PRODATA).updateOne({_id:objectId(id)},{$set:{offer:0,offername:null}}).then((result)=>{
            console.log("64989415498");
            console.log(result);
            res(result)
        })
    })
   },

   delOffer:(ID)=>{
    return new Promise((res,rej)=>{
        db.get().collection(collections.OFFERS).deleteOne({_id:objectId(ID)}).then((done)=>{
            res(done)
        })
    })
   },

   //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>coupon>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

   AddCoupon:(BODY)=>{
    let coupon_num=BODY.Coupon_Value
    BODY.Coupon_Value=parseInt(coupon_num)
    return new Promise((res,rej)=>{
        db.get().collection(collections.COUPON).insertOne(BODY).then((ADDED)=>{
            res(ADDED)
        })
    })
   },

   getCoupon:()=>{
    return new Promise(async(res,rej)=>{
      let Coupons=await db.get().collection(collections.COUPON).find().toArray()
      res(Coupons)
    })
   },

   checkCoupon:(code,ID)=>{
    return new Promise(async(res,rej)=>{
        let CouponCheck={}
        console.log(code);
        // let CouponCart= await db.get().collection(collections.USERCART).findOne({user:objectId(ID)})
        // console.log(CouponCart.Coupon);
       

        
        let Coupons=await db.get().collection(collections.COUPON).findOne({Coupon_Name:code})
        console.log(Coupons);
        if(Coupons){
           let Coupon_Exist=await db.get().collection(collections.UDATA).findOne({_id:objectId(ID),Coupon:code})
           console.log(Coupon_Exist);
           if(Coupon_Exist){
            console.log('existedddddddddddddddd');
                CouponCheck.status=true;
                res(CouponCheck)
           }
           else{
            CouponCheck.newCoupon=false;
            console.log(Coupons.Coupon_Value);
            CouponCheck.value=Coupons.Coupon_Value
            console.log('applieddddddddddddd');
            res(CouponCheck)
           }
        }
        else{
            console.log('not approvedddddddd');
            CouponCheck.notFound=true;
            res(CouponCheck)
        
    }
   
    })
   },

   addUsedCoupon:(UsedCoupon,ID)=>{
        return new Promise(async(res,rej)=>{
            let Coupon=[UsedCoupon]
            let USER=await db.get().collection(collections.UDATA).findOne({_id:objectId(ID)})
            if(USER.Coupon){
               db.get().collection(collections.UDATA).updateOne({_id:objectId(ID)},{$push:{Coupon:add}}).then(()=>{
                res()
               })

            }
            else{
                db.get().collection(collections.UDATA).updateOne({_id:objectId(ID)},{$set:{Coupon:Coupon}}).then(()=>{
                    res()
                })
            }
           
        })
   },

   AddCouponCart:(ID,code)=>{
    return new Promise(async(res,rej)=>{
        let match={}
        let cart=await db.get().collection(collections.USERCART).findOne({user:objectId(ID)})
        if(cart.coupon){
            if(cart.coupon==code){
                match.equal=true;
                res(match)
            }
            else{
                match.notequal=true;
                res(match)
            }
        }
        else{
            db.get().collection(collections.USERCART).updateOne({user:objectId(ID)},{$set:{coupon:code}}).then((match)=>{
                res(match)
            })
        }
       
    })
   }

   


 

   



  

   

// getUser:()=>{
//     return new Promise((res,rej)=>{
//         let name=db.get().collection(collections.ORDER).aggregate([
//             {
//                 $project:{
//                     Name:'$user'
//                 }
//             },
//             {
//                 $lookup:{
//                     from:collections.UDATA,
//                     localField:'Name',
//                     foreignField:'_id',
//                     as:'Names'
//                 }
//             },
//             {
//                 $project:{
//                     Names:1
//                 }
//             },
//             {
//                 $project:{
//                     name:'$Names.username'
//                 }
//             },
//             {
//                 $project:{
//                     name:1
//                 }
//             }
//         ]).toArray()
//         console.log(name);
//         res(name)
//     })
// }

}
