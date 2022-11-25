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
    const name = req.body.name
    const about = req.body.about

    try {
        const stm = 'insert into COMPANY (name,about) values (?,?)'
        await pool.query(stm, [name, about]);
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
        const stm = 'select * from COMPANY'
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