// const func = require("../../helper/func");



function addToCart(prodId){
    $.ajax({
        url:'/Add-cart/'+prodId,
        method:'get',
        success: (response)=>{
            console.log(response);
            if(response.status){
                console.log('ajax////////////////////');
               let count=$('#Add-Cart').html()
               count=parseInt(count)+1
               $('#Add-Cart').html(count)
               swal("ADDED")
            } 
        }
    })
}

function changeQuantity(cartId,prodId,count,name,price){
    let quantity=parseInt(document.getElementById(prodId).innerHTML)
    count=parseInt(count)

    
    $.ajax({
        url:'/changeQuantity',
        data:{
            cart:cartId,
            product:prodId,
            count:count,
            quantity:quantity,
            price:price
        },
        method:'post',
        success:(response)=>{
            if(response.removeProduct){
                
               alert('product removed from cart')
               
               location.reload()  
            }
            else{
                let total=response.total
                let offer=response.offer
                let Coupon=response.Coupon
               document.getElementById(prodId).innerHTML=quantity+count
               document.getElementById(name).innerHTML=price*(quantity+count)
               document.getElementById('total').innerHTML=total-offer-Coupon
               document.getElementById('subtotal').innerHTML=total
               document.getElementById('off').innerHTML=offer
               document.getElementById('Code').innerHTML=Coupon

            }  
        }
    })
}

function removePro(cart,prodId){
    swal({
        title: "Are you sure to remove this product?",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      }).then((willDelete)=>{
        if(willDelete){
            $.ajax({
                url:'/removeCart',
                data:{
                    cart:cart,
                    product:prodId
                },
                method:'post',
                success:(response)=>{
                    if(response){
                        swal("Product Removed", {
                            icon: "success",
                          }).then(()=>{
                            // document.getElementById('TP'+prodId).innerHTML=""
                            // let count=$('#Add-Cart').html()
                            // count=parseInt(count)-1
                            // $('#Add-Cart').html(count)
                            location.reload()            
                          })   
                    }   
                }
            })
        }
        else{
            swal("cancelled");  
        }
      })  
}

$('#checkOut').submit((e)=>{
    console.log("867777777777778");
    e.preventDefault()
    $.ajax({
        url:'/place-order',
        method:'post',
        data:$('#checkOut').serialize(),
        success:(response)=>{
            console.log(response.codSuccess);
           
           if(response.codSuccess){
            console.log('ajiosdfhoia5165156151651');
            location.href='/confirm'
           }
           else if(response.razorpay){
            
            razorpayPayment(response)
            
           }
           else{
             for(let i = 0;i < response.links.length;i++){
                      if(response.links[i].rel === 'approval_url'){
                         location.href=response.links[i].href
                      }
                    }
           }
        } 
    }) 
})

function razorpayPayment(order){
    console.log(order);
    
    var options = {
        "key": "rzp_test_ZE8zDNmBvMPZXe", // Enter the Key ID generated from the Dashboard
        "amount": order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        "currency": "INR",
        "name": "Mens Fashion",
        "description": "Test Transaction",
        "image": "https://example.com/your_logo",
        "order_id": order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        "handler": function (response){
            // alert(response.razorpay_payment_id);
            // alert(response.razorpay_order_id);
            // alert(response.razorpay_signature)

            verifyPayment(response,order)
        },
        "prefill": {
            "name": "Gaurav Kumar",
            "email": "gaurav.kumar@example.com", 
            "contact": "9999999999"
        },
        "notes": {
            "address": "Razorpay Corporate Office"
        },
        "theme": {
            "color": "#3399cc"
        }
    };
    var rzp1 = new Razorpay(options);
    rzp1.open();
}

function verifyPayment(payment,order){
   
    $.ajax({
        
        url:'/verify-payment',
        data:{ 
            payment,
            order
        },
        method:'post',
        success:(response)=>{
            if(response.status){
              location.href='/confirm'
            } 
            else{
                alert('payment failed')
            }
        }
    })
}

// >>>>>>>>>>>>>>>>>>>>wishlist>>>>>>>>>>>>>>>>>>>>>>>>

function wish(id){    
    $.ajax({  
        url:'/wishList/'+id,  
        method:'get',
        success:(response)=>{
                if(response.status){
                    let heart=document.querySelector('#heart')
                    let change=document.querySelector('#'+'R'+id)
                    change.src="img/icon/heart.png"
                    if(response.count){
                        heart.src="img/icon/Colorheart.png"
                    }
                    else{
                        heart.src="img/icon/heart.png"    
                    }
                    document.getElementById('R'+id).style.width = "2.5rem";  
                    document.getElementById('heart').style.width = "1.5rem";  
                }else{
                    console.log('else caseeeeeeeeeeeeee');
                    let heart=document.querySelector('#heart')
                    let change= document.querySelector('#'+'R'+id)
                    change.src="img/icon/Colorheart.png"
                    document.getElementById('R'+id).style.width = "2.5rem";
                    if(response.count){
                        
                        heart.src="img/icon/Colorheart.png"
                        document.getElementById('heart').style.width = "1.5rem";
                    }
                    else{
                        heart.src="img/icon/heart.png"    
                    }
                   
                     
            
            }
               
            
            
           
        }   
    })
}

// function wishCancel(id){
//     $.ajax({
//         url:'/removelist/'+id,
//         method:'get',
//         success:(response)=>{
//             if(response){
//                 let change= document.querySelector('#'+'R'+id)
//                 change.src="img/icon/heart.png"
//                 // location.reload() 
//             }
//         }
//     })
// }

function cancel(id){
    swal({
        title: "Are you sure to remove this product?",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      }).then((willDelete)=>{
        if(willDelete){
            $.ajax({
                url:'/CancelList/'+id,
                method:'get',
                success:(response)=>{
                    if(response.status){
                        swal("Product Removed", {
                            icon: "success",
                          }).then(()=>{
                            location.reload()
                          })   
                    }   
                }
            })
        }
        else{
            swal('cancelled');
        }
      })

}
function cancelUser(id){
    swal({
        title: "Are you sure to cancel your order?",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      }).then((willDelete)=>{
        if(willDelete){
            $.ajax({
                url:'/cancelOrder/'+id,
                method:'get',
                success:(response)=>{
                    if(response.status){
                        swal("order cancelled", {
                            icon: "success",
                          }).then(()=>{
                            location.reload()
                          })   
                    }   
                }
            })
        }
        else{
            swal('cancelled');
        }
      })

}

$('#Saved').submit((e)=>{
    e.preventDefault()
    $.ajax({
        url:'/radioAddress',
        method:'post',
        data:$('#Saved').serialize()
    })
})

$('#Coupon').submit((e)=>{
    e.preventDefault()
    console.log('callllllllllllllllll');
    $.ajax({
    
        url:'/couponForUser',
        method:'post',
        data:$('#Coupon').serialize(),
        success:(response)=>{
            if(response.equal){
                let ERR=document.getElementById('ERR')
                ERR.innerHTML='COUPON ALLREADY USED'
                
            }
            else if(response.notequal){
                let ERR=document.getElementById('ERR')
                ERR.innerHTML='ONLY ONE COUPON IS APPLICABLE'   
            }else{
                if(response.status){
                    let ERR=document.getElementById('ERR')
                    ERR.innerHTML="COUPON ALLREADY USED"
                    
                }
                else if(response.notFound){
                    let ERR=document.getElementById('ERR')
                    ERR.innerHTML="INVALID COUPON"
                    
                }
                else{
                    if(response.Expired){
                        let ERR=document.getElementById('ERR')
                        ERR.innerHTML='COUPON EXPIRED'
                    }else{
                        location.reload()
                    }
                   
                   
                    
                }
            }
           
           
        }
    })
})

// $('#checkOut').submit((e)=>{
//     e.preventDefault()
//     $.ajax({
//         url:'/place-order',
//         method:'post',
//         data:$('#checkOut').serialize(),
//         success:(response)=>{
//             console.log(response.codSuccess);
           
//            if(response.codSuccess){
//             console.log('ajiosdfhoia5165156151651');
//             location.href='/confirm/'+response.ID
//            }
//            else{
            
//             razorpayPayment(response)
            
//            }
//         } 
//     }) 
// })

$('#changePassword').submit((e)=>{
    e.preventDefault()
    $.ajax({
        url:'/changePassword',
        method:'post',
        data:$('#changePassword').serialize(),
        success:(response)=>{
            if(response.status){
                
                swal("Password Updated").then(()=>{
                    location.reload()
                })
            }
            else{
                swal("Something Went Wrong")
            }
        }
    })
})

 $('#addressPRO').submit((e)=>{
    e.preventDefault()
    $.ajax({
        url:'/takeAddress',
        data:$("#addressPRO").serialize(),
        method:'post',
        success:(response)=>{
            if(response.status){
                swal('UPDATED').then(()=>{
                    location.reload()
                })
                
            }
            
        }
    })
 })

