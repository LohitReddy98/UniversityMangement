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
    const email = req.body.email
    try {
        const stm = 'insert into STU_AUTH (email , password, createdDate) values (?,?,NOW())'
        await pool.query(stm, [pass, email]);
        const stm1 = 'insert into STU_INFO (name , phone, about,stuId,skills,address) values (?,?,?,LAST_INSERT_ID(),?,?)'
        await pool.query(stm1, [req.body.name, req.body.phone,req.body.about,req.body.skills,req.body.address]);
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
    const stm =
        'select  * from  STU_AUTH where email= ? and password=?'
    const result = await pool.query(stm, [pass, email]);
    if (result.length > 0)
        return res.send('successfully login')
    else {
        console.log("Error")
        res.sendStatus(401)
    }
})


module.exports = router