const config = require("../../config");
const common = require("../common/common");
const API = common.api;
const expect = require("chai").expect;
const tenant_data = require("../../data/tenant.json");
const tenant_account_data = require("../../data/tenant_account.json");
const orchestrator_account_data = require("../../data/orchestrator_account.json");
const LIMIT = config.sql_limit;
const not_tenant_db_id = "5b011d21a04d0a5c9ed737d2";
const not_tenant_admin_id = "5b011d91a04d1a5c9ed737d2";
const not_tenant_name = "tenant_qa";
const not_tenant_db_name = "tenant_db_qa";

global.orchestrator_admin_token = "";
global.orchestrator_admin_token1 = ""
let tenant_db_id_1 = "";
let tenant_db_id = "";
let tenant_admin_id = "";

describe("APPDEV_API TEST", function () {
    /*
        afterEach(function(){
            console.log("-+-------------------------------------------------------+-");
        });
    */
    describe("Login Orchestrator", function () {
        it("1 Get the orchestrator_admin token before the update", function (done) {
            //1 获取更新前orchestrator_admin token
            API.post("/orchestrator_admin/login")
                .send(orchestrator_account_data.orc_admin)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    expect(body.username).to.equal("orc_admin")
                    orchestrator_admin_token1 = body.orchestrator_admin_token
                    done();
                });
        });
    });

    describe("3.10 Updata Orchestrator Admin", function () {

        it("2 Failed to update password: old password is wrong", function (done) {
            //2更新密码失败:旧密码错误
            API.put("/orchestrator_admin/changepassword")
                .set("Authorization", "Bearer " + orchestrator_admin_token1)
                .send(orchestrator_account_data.updata_orc_admin_error_pw)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    expect(body.err.message).to.be.equal("Username or password error");
                    done();
                });
        });
        it("3 Failed to update password: username does not exist", function (done) {
            //3 更新密码失败:username不存在
            API.put("/orchestrator_admin/changepassword")
                .set("Authorization", "Bearer " + orchestrator_admin_token1)
                .send(orchestrator_account_data.updata_orc_admin_not_name)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    expect(body.err.message).to.be.equal("Username is needed");
                    done();
                });
        });
        it("4 Update orchestrator admin password successfully", function (done) {
            //4 更新orchestrator admin密码成功
            API.put("/orchestrator_admin/changepassword")
                .set("Authorization", "Bearer " + orchestrator_admin_token1)
                .send(orchestrator_account_data.updata_orc_admin)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    done();
                });
        });

    });

    describe("3.9 Login Orchestrator Admin", function () {

        it("5 orchestrator_admin token", function (done) {
            API.post("/orchestrator_admin/login")
                .send(orchestrator_account_data.new_orc_admin)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    expect(body.username).to.equal("orc_admin")
                    orchestrator_admin_token = body.orchestrator_admin_token
                    done();
                });
        });
        it("6 Login failed: password error", function (done) {
            API.post("/orchestrator_admin/login")
                .send(orchestrator_account_data.orc_admin_error_pw)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    expect(body.err.message).to.be.equal("Username or password error");
                    done();
                });
        });
        it("7 Login failed: password does not exist", function (done) {
            API.post("/orchestrator_admin/login")
                .send(orchestrator_account_data.orc_admin_not_pw)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    expect(body.err.message).to.be.equal("Password is needed");
                    done();
                });
        });
        it("8 Login failed: username missing", function (done) {
            API.post("/orchestrator_admin/login")
                .send(orchestrator_account_data.orc_admin_not_name)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    expect(body.err.message).to.be.equal("Username is needed");
                    done();
                });
        });
        it("9 Login failed: password missing", function (done) {
            API.post("/orchestrator_admin/login")
                .send(orchestrator_account_data.orc_admin_not_pw)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    expect(body.err.message).to.be.equal("Password is needed");
                    done();
                });
        });

    });

    describe("3.1 Create Tenant DB", function () {

        it("10 Create Tenant DB, but don't create autolive", function (done) {
            API.post("/tenant")
                .set("Authorization", "Bearer " + orchestrator_admin_token)
                .send(tenant_data.new_live_tenant_db)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    tenant_db_id_1 = body.tenant_db_id;
                    done();
                });
        });

        it("10 Create Tenant DB without creating autolive", function (done) {
            //10 创建Tenant DB,并创建autolive
            API.post("/tenant")
                .set("Authorization", "Bearer " + orchestrator_admin_token)
                .send(tenant_data.tenant_db)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    tenant_db_id = body.tenant_db_id;
                    done();
                });
        });
        it("11 Create failed: missing tenant name", function (done) {
            API.post("/tenant")
                .set("Authorization", "Bearer " + orchestrator_admin_token)
                .send(tenant_data.lack_tenant_name)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    expect(body.err.message).to.be.equal("Provide tenant name");
                    done();
                });
        });
        it("12 Create failed: missing db name", function (done) {
            API.post("/tenant")
                .set("Authorization", "Bearer " + orchestrator_admin_token)
                .send(tenant_data.lack_tenant_db_name)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    expect(body.err.message).to.be.equal("Provide db");
                    done();
                });
        });
        it("13 Create failed: tenant name is already occupied", function (done) {
            //13 创建失败:tenant name已被占用
            API.post("/tenant")
                .set("Authorization", "Bearer " + orchestrator_admin_token)
                .send(tenant_data.co_tenant_name)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    expect(body.err.message).to.be.equal("Tenant name/DB already exists");
                    done();
                });
        });
        it("14 Create failed: db name is already occupied", function (done) {
            //14 创建失败:db name已被占用
            API.post("/tenant")
                .set("Authorization", "Bearer " + orchestrator_admin_token)
                .send(tenant_data.co_db_name)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    expect(body.err.message).to.be.equal("Tenant name/DB already exists");
                    done();
                });
        });

    });

    describe("3.2 Get Tenant DB", function () {
        it("15 Get Tenant DB information via tenant name", function (done) {
            //15 通过tenant name获取Tenant DB信息
            API.get("/tenant/name/" + tenant_data.tenant_db.tenant_name)
                .set("Authorization", "Bearer " + orchestrator_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body._id).to.be.equal(tenant_db_id);
                    done();
                });
        });
        it("16 Get Tenant DB information via tenant id", function (done) {
            //16 通过tenant id获取Tenant DB信息
            API.get("/tenant/id/" + tenant_db_id)
                .set("Authorization", "Bearer " + orchestrator_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body._id).to.be.equal(tenant_db_id);
                    done();
                });
        });
        it("17 Get Tenant DB information via db name", function (done) {
            //17 通过db name获取Tenant DB信息
            API.get("/tenant/db/" + tenant_data.tenant_db.db)
                .set("Authorization", "Bearer " + orchestrator_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body._id).to.be.equal(tenant_db_id);
                    done();
                });
        });
        it("18 Failed to get DB information: tenant does not exist", function (done) {
            //18 获取DB信息失败:tenant不存在
            API.get("/tenant/name/" + tenant_data.co_db_name.tenant_name)
                .set("Authorization", "Bearer " + orchestrator_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(404);
                    expect(body.err.message).to.be.equal("No matching records found")
                    done();
                });
        });

    });

    describe("3.3 Enable/Disable Tenant DB", function () {
        it("19 Disable Tenant DB", function (done) {
            API.get("/tenant/disable/" + tenant_db_id)
                .set("Authorization", "Bearer " + orchestrator_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    done();
                });
        });

        it("20 Enable Tenant DB", function (done) {
            API.get("/tenant/enable/" + tenant_db_id)
                .set("Authorization", "Bearer " + orchestrator_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    done();
                });
        });
        it("21 Failed to disable DB: tenant id does not exist", function (done) {
            //21 禁用DB失败:tenant id不存在
            API.get("/tenant/disable/" + not_tenant_db_id)
                .set("Authorization", "Bearer " + orchestrator_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(404);
                    expect(body.err.message).to.be.equal("No record exist for given ID");
                    done();
                });
        });
        it("22 Failed to Enable DB: tenant id does not exist", function (done) {
            //22 启用DB失败:tenant id不存在
            API.get("/tenant/enable/" + not_tenant_db_id)
                .set("Authorization", "Bearer " + orchestrator_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(404);
                    expect(body.err.message).to.be.equal("No record exist for given ID");
                    done();
                });
        });
    });

    /*
        describe.skip("3.4  Update Tenant DB", function() {
            it("19 更新全部信息", function(done) {
                API.put("/tenant")
                    .set("Authorization", "Bearer " + orchestrator_admin_token)
                    .send(
                        Object.assign(
                            {
                                _id: tenant_db_id
                            },
                            tenant_data.tenant_db_update
                        )
                    )
                    .expect(200)
                    .end(function(err, res) {
                        if (err) throw err;
                        let body = JSON.parse(res.text);
                        expect(body.status).to.be.true;
                        done();
                    });
            });
        });
    */

    describe("3.5 Create Tenant_Admin", function () {
        it("23 Creat success:tenant_admin", function (done) {
            API.post("/tenant_admin")
                .set("Authorization", "Bearer " + orchestrator_admin_token)
                .send(tenant_account_data.tenant_admin)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body)
                    expect(body.status).to.be.true;
                    expect(body.username).to.be.equal(tenant_account_data.tenant_admin.username);
                    tenant_admin_id = body._id;
                    done();
                });
        });
        it("23 Creat success:new_tenant_admin", function (done) {
            API.post("/tenant_admin")
                .set("Authorization", "Bearer " + orchestrator_admin_token)
                .send(tenant_account_data.new_tenant_admin)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    expect(body.username).to.be.equal(tenant_account_data.new_tenant_admin.username);
                    done();
                });
        });
        it("24 Creat fail:missing username", function (done) {
            API.post("/tenant_admin")
                .set("Authorization", "Bearer " + orchestrator_admin_token)
                .send(tenant_account_data.tenant_admin_no_us)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    expect(body.err.message).to.be.equal("Username is needed");
                    done();
                });
        });
        it("25 Creat fail:missing password", function (done) {
            API.post("/tenant_admin")
                .set("Authorization", "Bearer " + orchestrator_admin_token)
                .send(tenant_account_data.tenant_admin_no_pw)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    expect(body.err.message).to.be.equal("Password is needed");
                    done();
                });
        });
        it("26 Creat fail:missing tenant_name", function (done) {
            API.post("/tenant_admin")
                .set("Authorization", "Bearer " + orchestrator_admin_token)
                .send(tenant_account_data.tenant_admin_no_tenant)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    expect(body.err.message).to.be.equal("Tenant name is needed");
                    done();
                });
        });
        it("27 Creat fail:Username is already occupied", function (done) {
            API.post("/tenant_admin")
                .set("Authorization", "Bearer " + orchestrator_admin_token)
                .send(tenant_account_data.tenant_admin)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    expect(body.err.message).to.be.equal("Username not available for this tenant. Try another username.");
                    done();
                });
        });
        it("28 Creat failed: tenant_name does not exist", function (done) {
            API.post("/tenant_admin")
                .set("Authorization", "Bearer " + orchestrator_admin_token)
                .send(tenant_account_data.tenant_admin_no_tenantname)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(404);
                    expect(body.err.message).to.be.equal("Tenant doesn't exist");
                    done();
                });
        });

    });

    describe("3.6 Block/Unblock Tenant_Admin", function () {
        it("29 Disable Tenant admin account", function (done) {
            API.get("/tenant_admin/block/" + tenant_admin_id)
                .set("Authorization", "Bearer " + orchestrator_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    done();
                });
        });
        it("30 Enable Tenant admin account", function (done) {
            API.get("/tenant_admin/unblock/" + tenant_admin_id)
                .set("Authorization", "Bearer " + orchestrator_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    done();
                });
        });
        it("31 Failed to disable Tenant admin account: tenant admin id does not exist", function (done) {
            //31 禁用Tenant admin账户失败:tenant admin id不存在
            API.get("/tenant_admin/block/" + not_tenant_admin_id)
                .set("Authorization", "Bearer " + orchestrator_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(404);
                    expect(body.err.message).to.be.equal("Tenant Admin account doesn't exist");
                    done();
                });
        });
        it("32 Failed to enable Tenant admin account: tenant admin id does not exist", function (done) {
            //32 启用Tenant admin账户失败:tenant admin id不存在
            API.get("/tenant_admin/unblock/" + not_tenant_admin_id)
                .set("Authorization", "Bearer " + orchestrator_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(404);
                    expect(body.err.message).to.be.equal("Tenant Admin account doesn't exist");
                    done();
                });
        });

    });

    describe("3.7 Get Tenant_Admin", function () {
        it("33 Get details of tenant admin account", function (done) {
            //console.log(tenant_admin_id);
            API.get("/tenant_admin/" + tenant_admin_id)
                .set("Authorization", "Bearer " + orchestrator_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body._id).to.be.equal(tenant_admin_id);
                    done();
                });

        });
        it("34 Get failed: tenant admin id does not exist", function (done) {
            API.get("/tenant_admin/" + not_tenant_admin_id)
                .set("Authorization", "Bearer " + orchestrator_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(404);
                    expect(body.err.message).to.be.equal("No tenant_admin exist with matching ID");
                    done();
                });
        });

    });

    describe("3.8  Get Tenant_Admin List", function () {
        it("35 Get a list of all tenant admin accounts", function (done) {
            API.get("/tenant_admin")
                .set("Authorization", "Bearer " + orchestrator_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    //console.log(body);
                    expect(body.status).to.be.true;
                    done();
                });
        });

    });

    describe("3.12 Get Tenant DB List", function () {
        it("36 get a list of all Tenant DB", function (done) {
            API.get("/tenant")
                .set("Authorization", "Bearer " + orchestrator_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    done();
                });
        });

    });

    describe("3.13 Get Tenant DB", function () {
        it("37 Get Tenant DB details by tenant_name", function (done) {
            //37 通过tenant_name获取Tenant DB的详细信息
            API.get("/tenant/name/" + tenant_data.tenant_db.tenant_name)
                .set("Authorization", "Bearer " + orchestrator_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    expect(body.tenant_name).to.be.equal(tenant_data.tenant_db.tenant_name);
                    done();
                });
        });
        it("38 Get Tenant DB details by db_name", function (done) {
            API.get("/tenant/db/" + tenant_data.tenant_db.db)
                .set("Authorization", "Bearer " + orchestrator_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    expect(body.db).to.be.equal(tenant_data.tenant_db.db);
                    done();
                });
        });
        it("39 Failed to get Tenant DB details via tenant_name: tenant_naem does not exist", function (done) {
            //39 通过tenant_name获取Tenant DB的详细信息失败:tenant_naem不存在
            API.get("/tenant/db/" + not_tenant_name)
                .set("Authorization", "Bearer " + orchestrator_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(404);
                    expect(body.err.message).to.be.equal("No matching records found");
                    done();
                });
        });
        it("40 Get the details of Tenant DB through db_name: db_name does not exist", function (done) {
            //40 通过db_name获取Tenant DB的详细信息:db_name不存在
            API.get("/tenant/db/" + not_tenant_db_name)
                .set("Authorization", "Bearer " + orchestrator_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(404);
                    expect(body.err.message).to.be.equal("No matching records found");
                    done();

                });
        });

    });

    /*
        describe.skip("3.11 Clear Database", function(){
    
            it("清除非autolive Tenant DB", function(done){
                API.delete("/clearDB/" + tenant_data.new_live_tenant_db.tenant_name)
                    .set("Authorization", "Bearer " + orchestrator_admin_token)
                    .expect(200)
                    .end(function(err, res) {
                        if (err) throw err;
                        let body = JSON.parse(res.text);
                        expect(body.status).to.be.true;
                        done();
                    });
            });
    
            it("清除autolive Tenant DB", function(done){
                API.delete("/clearDB/" + tenant_data.tenant_db.tenant_name)
                    .set("Authorization", "Bearer " + orchestrator_admin_token)
                    .expect(200)
                    .end(function(err, res) {
                        if (err) throw err;
                        let body = JSON.parse(res.text);
                        expect(body.status).to.be.true;
                        done();
                    });
            });
        });
    */
    describe("Update to initial password", function () {
        it("41 Orchestrator admin updated to initial password", function (done) {
            API.put("/orchestrator_admin/changepassword")
                .set("Authorization", "Bearer " + orchestrator_admin_token)
                .send(orchestrator_account_data.initialize_orc_admin)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    done(); it
                });
        });

    });
});