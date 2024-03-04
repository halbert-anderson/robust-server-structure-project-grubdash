const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
// Add handlers and middleware functions to create, read, update, delete, 
// and list orders.

//===middleware function to validate the request body===========================
//=== create-order and update-order validation==================================

//=====function to check that every property of the order object exists================
function bodyDataHas(propertyName) {
    return function (req, res, next) {
       const { data = {} } = req.body;  
       if (data[propertyName]) {  
         return next();
       }
         next({ status: 400,
                message: `Order must include a ${propertyName}` 
              });  
     };  
   }



//====functions to make sure the properties of the order object are defined correctly========
function dishQuantityIsValid(req, res, next){
    const { data: { dishes } = {} } = req.body;
    for(let orderItem = 0; orderItem < dishes.length; orderItem++){
        const { quantity } = dishes[orderItem];
        if( !( quantity && Number.isInteger(quantity) && quantity > 0 ) ){
            next({status:400,
                  message: `dish ${orderItem} must have a quantity that is an integer greater than 0`
                 });
          };
     };
     next();
 }


function idPropertyIsValid(req, res, next){
    const { orderId } = req.params;
    const { data: { id } = {} } = req.body;
  if(id){
     if( id === orderId ){
      next()
     }
     next({ status: 400,
            message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`
    });
  }
   next();
  }

function dishesPropertyIsValid(req, res, next){
    const { data: { dishes } = {} } = req.body;
    if(Array.isArray(dishes) && dishes.length>0){
        next();
     }
     next({  
        status: 400,  
        message: `Order must include at least one dish`,  
      });

 }

   function statusPropertyIsValid(req, res, next){
    const { data: { status } = {} } = req.body;
    const validStatus = [ "pending", "preparing", "delivered", "out-for-delivery"];
    if (validStatus.includes(status)){
        return next();
    }
    next({
        status: 400,
        message: `Values of the 'status' property must be one of ${validStatus}. Received: ${status}`,
    })
   }


//===checks if status is "pending" for order-delete handler
 function statusPending(req, res, next){
    const { status } = res.locals.order;
    if( status === "pending"){
       return next();
    }
    next({ status: 400,
           message: "An order cannot be deleted unless it is pending."
         });
 }


function orderDelivered(req, res, next){
    if( res.locals.order.status === "delivered" ){
     next({ status: 400,
            message: "A delivered order cannot be changed"
         });
      }
      next();
    }

function orderExists(req, res, next){
    const { orderId } = req.params;
    const foundOrder = orders.find( order => order.id === orderId);
    if(foundOrder){
        res.locals.order = foundOrder;
        return next();
    }
    next({ status: 404,
           message: `Order id not found: ${orderId}`});
}
//=====route handlers for list, create, read, update, and delete.===============
function destroy(req, res){
    const { orderId } = req.params;
    const indexOfOrder = orders.findIndex(order => order.id === orderId);
    if(indexOfOrder > -1){
    orders.splice(indexOfOrder,1);
    }
    res.sendStatus(204);
}

function read(req, res){
    res.json({ data: res.locals.order });
}

function update(req, res){
    const { data: {deliverTo, mobileNumber, status, dishes } = {} } = req.body;
    const order = res.locals.order;
    order.deliverTo = deliverTo;
    order.mobileNumber = mobileNumber;
    order.status = status;
    order.dishes = dishes;
    res.json({ data: order });
}

function create(req, res){
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
    const newOrder = {
        id: nextId(),
        deliverTo,
        mobileNumber,
        status,
        dishes,
    }
    orders.push(newOrder);
    res.status(201).json({ data: newOrder });
}

function list(req, res){
 res.json({ data: orders });
}


module.exports ={ 
                 list,
                 create: [bodyDataHas("deliverTo"),
                          bodyDataHas("mobileNumber"),
                        /*bodyDataHas("status"),*/
                          bodyDataHas("dishes"),
                        /*statusPropertyIsValid,*/
                          dishesPropertyIsValid,
                          dishQuantityIsValid,
                          create],
                   read: [orderExists,
                          read],
                 update: [orderExists,
                          bodyDataHas("deliverTo"),
                          bodyDataHas("mobileNumber"),
                        /*bodyDataHas("status"),*/
                          bodyDataHas("dishes"),
                          idPropertyIsValid,
                          statusPropertyIsValid,
                          dishesPropertyIsValid,
                          dishQuantityIsValid,
                          orderDelivered,
                          update],
                 delete: [orderExists,
                          statusPending,
                          destroy],
}


////==violates principle of function doing one thing=====================
// const validateProperties = (req, res, next) => {
//   const { data } = req.body;
//   const requiredProps = ['deliverTo', 'mobileNumber', 'dishes'];

//   requiredProps.forEach(prop => {
//     if (!data[prop]) {
//       next({
//           status: 400,
//           message: `Order must include a ${prop}`
//       });
//     }
//     if (prop === 'dishes') {
//       // check if data['dishes'] is an array OR has length > 0 ||
//       if (data[prop].length === 0 || !Array.isArray(data[prop])) {
//           next({
//               status: 400,
//               message: 'Order must include at least one dish'
//           });
//       }
//       // check if each dish contains quantity
//       data[prop].forEach((dish, index) => {
//         if (!dish['quantity'] || !Number.isInteger(dish['quantity']) || dish['quantity'] <= 0) {
//           next({
//               status: 400,
//               message: `Dish ${index} must have a quantity that is an integer greater than 0`
//           });
//         }
//       })
//     }
//   })
//   return next();
// }