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
        return res.send({ hrId: result[0].hrId, cmpId: result[0].cmpId })
    else {
        console.log("Error")
        res.sendStatus(401)
    }
})
router.get("/", async (req, res) => {
    try {
        const stm = 'select  H.hrId,email,C.name as companyName,H.name as hrName from  HR_AUTH H,COMPANY C where C.cmpId=H.cmpId'
        const result = await pool.query(stm);
        return res.send(result)
    }
    catch {
        res.status(500)
    }
})
router.delete("/:hrId", async (req, res) => {
    try {
        const stm = 'delete from HR_AUTH where hrId=?'
        await pool.query(stm, [parseInt(req.params.hrId)]);
        return res.send("Success")
    }
    catch {
        res.status(500)
    }
})

module.exports = router