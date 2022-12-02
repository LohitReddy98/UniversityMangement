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
router.put("/", async (req, res) => {
    const pass = req.body.pass
    const name = req.body.name
    const email = req.body.email
    const cmpId = req.body.cmpId

    try {
        const stm = 'insert into HR_AUTH (cmpId, email , password,name) values (?,?,?,?)'
        await pool.query(stm, [cmpId, pass, email, name]);
        res.send('successfully added')
    } catch (err) {
        res
            .status(500)
            .send('Unable to load page. Please check the application logs for more details.')
            .end();
    }
})

router.post("/", async (req, res) => {
    const pass = req.body.pass
    const email = req.body.email
    const stm = 'select  * from  HR_AUTH where email= ? and password=?'
    const result = await pool.query(stm, [pass, email]);
    if (result.length > 0)
    return res.send(result.hrId)
    else {
        console.log("Error")
        res.sendStatus(401)
    }
})


module.exports = router