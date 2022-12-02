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

    try {
        const stm = 'insert into JOBS (cmpId,title,openings,description) values (?,?,?,?)'
        await pool.query(stm, [req.body.cmpId, req.body.title, req.body.openings, req.body.description]);
        res.send('successfully added')
    } catch (err) {
        res
            .status(500)
            .send('Unable to load page. Please check the application logs for more details.')
            .end();
    }
})
router.get("/", async (req, res) => {
    try {
        const stm = 'select * from JOBS J, COMPANY C where  J.cmpId=C.cmpId'
        const qu = await pool.query(stm);
        res.send(qu)
    } catch (err) {
        res
            .status(500)
            .send('Unable to load page. Please check the application logs for more details.')
            .end();
    }
})



module.exports = router