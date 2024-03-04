const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
// Add handlers and middleware functions to create, read, update, delete, 
// and list orders.

//===middleware function to validate the request body==========
//=== create-order snd update-order validation==================================
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

function dishQuantityIsValid(req, res, next){
    const { data: { dishes } = {} } = req.body;
    for(let orderItem = 0; orderItem < dishes.length; orderItem++){
        const { quantity } = dishes[orderItem];
    if(!( quantity && Number.isInteger(quantity) && quantity > 0)){
     next({status:400,
          message: `dish ${orderItem} must have a quantity that is an integer greater than 0`
         });
     }
}
  next();
}

//===Check if id property exists in the request body and if it 
//===matches the order.id for the order being changed, for update-order handler 
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
        message: `Values of the 'status' property must be one of ${validStatus}. Recieved: ${status}`,
    })
   }
//===checks if status is "pending" for order-delete handler
 function statusPending(req, res, next){
    const { data: { status } = {} } = req.body;
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

//=========destroy-order handler (DELETE /orders/:orderId)================
function destroy(req, res){
    const { orderId } = req.params;
    const indexOfOrder = orders.findIndex(order => order.id === orderId);
    if(indexOfOrder > -1){
    orders.splice(indexOfOrder,1);
    }
    res.sendStatus(204);

}

//========read-order handler (GET /orders/:orderId)===========
function read(req, res){
    res.json({ data: res.locals.order });
}

//========update-order handler (PUT /order/:orderId)================
function update(req, res){
    const { data: {deliverTo, mobileNumber, status, dishes } = {} } = req.body;
    const order = res.locals.order;
    order.deliverTo = deliverTo;
    order.mobileNumber = mobileNumber;
    order.status = status;
    order.dishes = dishes;
    res.json({ data: order });
}

// function create(req, res){
//     const { data: { name, description, price, image_url } = {} } = req.body;
//     const newDish = {
//       id: nextId(),
//       name,
//       description,
//       price,
//       image_url,
//     };
//     dishes.push(newDish);
//     res.status(201).json({ data: newDish });
//     }

function create(req, res){
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
    const newOrder = {
        id: nextId(),
        deliverTo,
        mobileNumber,
        status,
        dishes,
    };
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
                          bodyDataHas("status"),
                          bodyDataHas("dishes"),
                          statusPropertyIsValid,
                          dishesPropertyIsValid,
                          dishQuantityIsValid,
                          create],
                   read: [orderExists,
                          read],
                 update: [orderExists,                         
                          bodyDataHas("deliverTo"),
                          bodyDataHas("mobileNumber"),
                          bodyDataHas("status"),
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