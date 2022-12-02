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
router.get("/jobs/:stuId", async (req, res) => {
    try {
        const res = 'select * from JOBS J,JOB_APP JA WHERE JA.stuId=? and JA.jobId = J.jobId'
        const r=await pool.query(stm, [req.params.stuId]);
        res.send(r)
    } catch (err) {
        res
            .status(500)
            .send('Unable to load page. Please check the application logs for more details.')
            .end();
    }
})
router.get("/students/:jobId", async (req, res) => {
    try {
        const stm = 'select * from STU_INFO S,JOB_APP JA WHERE JA.jobId=? and JA.stuId = S.stuId'
        const r=await pool.query(stm, [req.params.jobId]);
        res.send(r)
    } catch (err) {
        res
            .status(500)
            .send('Unable to load page. Please check the application logs for more details.')
            .end();
    }
})
router.put("/", async (req, res) => {
    try {
        const stm = 'insert into JOB_APP (jobId , stuId) values (?,?)'
        await pool.query(stm, [req.body.jobId, req.body.stuId]);
        res.send('successfully added')
    } catch (err) {
        res
            .status(500)
            .send('Unable to load page. Please check the application logs for more details.')
            .end();
    }
})


module.exports = router