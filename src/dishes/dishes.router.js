const router = require("express").Router({ mergeParams: true });
// TODO: Implement the /dishes routes needed to make the tests pass
const methodNotAllowed = require("../errors/methodNotAllowed");
const controller = require("./dishes.controller");

// Note: dishes cannot be deleted from menu, hence no delete method is included here.
router.route("/").get(controller.list).post(controller.create).all(methodNotAllowed);
router.route("/:dishId").get(controller.read).put(controller.update).all(methodNotAllowed);



module.exports = router;
