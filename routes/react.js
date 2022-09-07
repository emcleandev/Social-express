const express = require("express");
const { reactPost, getReact } = require("../controllers/react");
const { authUser } = require("../middleware/auth");

const router = express.Router();

router.put("/reactPost", authUser, reactPost);
router.get("/getReact/:id", authUser, getReact);

module.exports = router;
