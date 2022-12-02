const express = require("express")
const router = express.Router()
const getPool = require("../pool.js")
let pool

router.use(async (req, res, next) => {
    try {
        pool = await getPool();
        next();
    }
    catch (err) {
        return next(err);
    }

})

router.post("/", async (req, res) => {
    const pass = req.body.pass
    const email = req.body.email
    const stm =
        'select  * from  ADMIN_AUTH where email= ? and password=?'
    const result = await pool.query(stm, [pass, email]);
    if (result.length > 0)
    return res.send({adminId:result[0].adminId})
    else {
        console.log("Error")
        res.sendStatus(401)
    }
})


module.exports = router