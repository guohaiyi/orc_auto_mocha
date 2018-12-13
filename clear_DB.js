const config = require("./config/index.js");
const common = require("./src/common/common.js");
const API = common.api;
const expect = require("chai").expect;
delete require.cache[require.resolve('./data/tenant.json')]; 
const tenant_data = require("./data/tenant.json");

let orchestrator_admin_token = "";


describe("3.0 login orchestrator", function() {
    it("get orchestrator_admin token", function(done) {
        API.post("/orchestrator_admin/login")
            .send({
                username:"orc_admin",
                password:"orc_admin"
            })
            .expect(200)
            .end(function(err, res) {
                if (err) throw err;
                let body = JSON.parse(res.text);
                expect(body.username).to.equal("orc_admin")
                orchestrator_admin_token = body.orchestrator_admin_token

                done();
            });
    })
    it("clear DB", function(done) {
        API.delete("/clearDB/"+tenant_data.tenant_db.tenant_name)
            .set('Content-Type', 'application/json')
            .set('Authorization', 'Bearer '+orchestrator_admin_token)
            .expect(200)
            .end(function(err, res) {
                if (err) throw err;
                let body = JSON.parse(res.text);
                // expect(body.status).to.be.equal(true)
                done();
            });
    })
    it("clear DB 1", function(done) {
        API.delete("/clearDB/"+tenant_data.new_live_tenant_db.tenant_name)
            .set('Content-Type', 'application/json')
            .set('Authorization', 'Bearer '+orchestrator_admin_token)
            .expect(200)
            .end(function(err, res) {
                if (err) throw err;
                let body = JSON.parse(res.text);
                // expect(body.status).to.be.equal(true)
                done();
            });
    })
    it("clear DB 2", function(done) {
        API.delete("/clearDB/"+tenant_data.tenant_db_no_auto.tenant_name)
            .set('Content-Type', 'application/json')
            .set('Authorization', 'Bearer '+orchestrator_admin_token)
            .expect(200)
            .end(function(err, res) {
                if (err) throw err;
                let body = JSON.parse(res.text);
                // expect(body.status).to.be.equal(true)
                done();
            });
    })
})