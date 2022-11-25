const express = require("express")
const router = express.Router()
const { pool } = require("../index.js")

router.put("/", async (req, res) => {
    const pass = req.body.pass
    const email = req.body.email
    try {
        const stm =
            'insert into STU_AUTH (email , password, createdDate) values (?,?,NOW())'
        await pool.query(stm, [pass, email]);
        await recentVotesQuery;
        res.send('successfully added')
    } catch (err) {
        logger.error(err);
        res
            .status(500)
            .send(
                'Unable to load page. Please check the application logs for more details.'
            )
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
        return res.send('successfully added')
    else {
        console.log("Error")
        res.statusCode(401)
    }
})


module.exports = router