﻿﻿// delete require.cache[require.resolve('../../data/tenant_account.json')];  
const config = require("../../config");
const common = require("../common/common");
const API = common.api;
const expect = require("chai").expect;
const tenant_account_data = require("../../data/tenant_account.json");
delete require.cache[require.resolve('../../data/profile.json')];
const profile_data = require("../../data/profile.json");
const imagepath = config.source.image;
const videopath = config.source.video;
const LIMIT = config.sql_limit;
let tenant_admin_id = "";
let tenant_admin_token = "";
let user_id = "";
let vod_profile_id = "";
let vod_profile_id2 = "";
let live_profile_id = "";
let source_file_id = "";
let library_id = "";
let live_id = "";
let live_tube_id = "";
let live_channel_id = "";
const not_exist_id = "5ab1f860a5ecc9b69735284c";
const NOVALID = "novalid";
const LIVE_CHANNEL_NAME = "TSoHTTPLiveAuto";

let user_total_count = 0;
let profile_total_count = 0;
let vod_source_total_count = 0;
let live_tube_total_count = 0;
let live_channel_total_count = 0;

let def_live_proc_id
let def_vod_proc_id

let orc_admin_token
describe("CMBDEV_API TEST user and profile", function () {
    /*
        afterEach(function(){
            console.log("-+-------------------------------------------------------+-");
        });
    */
    describe("1.1 Login Tenant Admin", function () {
        before('orchestrator Admin login', function (done) {
            API.post('/orchestrator_admin/login')
                .set('Content-Type', 'application/json')
                .send(tenant_account_data.orchestrator_admin)
                .expect(200)
                .end(function (err, res) {
                    if (err) done(err);
                    console.log(res.body)
                    expect(res.body).to.have.all.keys("_id", "username", "status", "orchestrator_admin_token");
                    expect(res.body.orchestrator_admin_token).to.be.a("string")
                    orc_admin_token = res.body.orchestrator_admin_token
                    done()
                });
        })
        it("login success", function (done) {
            API.post("/tenant_admin/login")
                .send(tenant_account_data.tenant_admin)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(tenant_account_data.tenant_admin)
                    console.log(res.body)
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    expect(body).to.have.all.keys("status", "tenant_admin_token", "tenant_admin_id", "username")
                    tenant_admin_token = body.tenant_admin_token;
                    tenant_admin_id = body.tenant_admin_id;
                    done();
                });
        });
        it("login fail : lost username", function (done) {
            API.post("/tenant_admin/login")
                .set('Content-Type', 'application/json')
                .send(tenant_account_data.tenant_admin_no_us)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    //console.log("登录失败:缺少username 参数 : ")
                    console.log(res.body)
                    expect(res.body.status).to.be.equal(false)
                    expect(res.body.err.code).to.be.equal(400)
                    expect(res.body.err.message).to.be.equal("Username is needed")
                    done();
                });
        });
        it("login fail : lost password", function (done) {
            API.post("/tenant_admin/login")
                .set('Content-Type', 'application/json')
                .send(tenant_account_data.tenant_admin_no_pw)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    //console.log("登录失败:缺少password 参数 : ")
                    console.log(res.body)
                    expect(res.body.status).to.be.equal(false)
                    expect(res.body.err.code).to.be.equal(400)
                    expect(res.body.err.message).to.be.equal("Password is needed")
                    done();
                });
        });
        it("login fail : username is empty", function (done) {
            delete require.cache[require.resolve('../../data/tenant_account.json')];
            const tenant_account_data = require("../../data/tenant_account.json");

            let data = Object.assign({}, tenant_account_data.tenant_admin);
            data.username = ""
            API.post("/tenant_admin/login")
                .set('Content-Type', 'application/json')
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    //console.log("登录失败:username为空==== : ")
                    console.log(res.body)
                    expect(res.body.status).to.be.equal(false)
                    expect(res.body.err.code).to.be.equal(400)
                    expect(res.body.err.message).to.be.equal("Username/tenant_name error.")
                    done();
                });
        });
        it("login fail : password is empty", function (done) {
            delete require.cache[require.resolve('../../data/tenant_account.json')];
            const tenant_account_data = require("../../data/tenant_account.json");

            let data = Object.assign({}, tenant_account_data.tenant_admin);
            data.password = ""
            API.post("/tenant_admin/login")
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.body)
                    expect(res.body.status).to.be.equal(false)
                    expect(res.body.err.code).to.be.equal(400)
                    expect(res.body.err.message).to.be.equal("Username or password error.")
                    done();
                });
        });
        it("login fail : tenant_name is empty", function (done) {
            delete require.cache[require.resolve('../../data/tenant_account.json')];
            const tenant_account_data = require("../../data/tenant_account.json");

            let data = Object.assign({}, tenant_account_data.tenant_admin);
            data.tenant_name = ""
            API.post("/tenant_admin/login")
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    //console.log("登录失败:tenant_name为空 : ")
                    console.log(res.body)
                    expect(res.body.status).to.be.equal(false)
                    expect(res.body.err.code).to.be.equal(400)
                    expect(res.body.err.message).to.be.equal("Username/tenant_name error.")
                    done();
                });
        });
        it("login fail : password err", function (done) {
            delete require.cache[require.resolve('../../data/tenant_account.json')];
            const tenant_account_data = require("../../data/tenant_account.json");

            let data = Object.assign({}, tenant_account_data.tenant_admin);
            data.password = "asdfasdf"
            API.post("/tenant_admin/login")
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.body)
                    expect(res.body.status).to.be.equal(false)
                    expect(res.body.err.code).to.be.equal(400)
                    expect(res.body.err.message).to.be.equal("Username or password error.")
                    done();
                });
        });
        it("login fail : username err", function (done) {
            delete require.cache[require.resolve('../../data/tenant_account.json')];
            const tenant_account_data = require("../../data/tenant_account.json");

            let data = Object.assign({}, tenant_account_data.tenant_admin);
            data.username = "asdfasdf"
            API.post("/tenant_admin/login")
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.body)
                    expect(res.body.status).to.be.equal(false)
                    expect(res.body.err.code).to.be.equal(400)
                    expect(res.body.err.message).to.be.equal("Username/tenant_name error.")
                    done();
                });
        });
        it("login fail : tennat name err", function (done) {
            delete require.cache[require.resolve('../../data/tenant_account.json')];
            const tenant_account_data = require("../../data/tenant_account.json");

            let data = Object.assign({}, tenant_account_data.tenant_admin);
            data.tenant_name = ""
            API.post("/tenant_admin/login")
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.body)
                    expect(res.body.status).to.be.equal(false)
                    expect(res.body.err.code).to.be.equal(400)
                    expect(res.body.err.message).to.be.equal("Username/tenant_name error.")
                    done();
                });
        });
        it("Before login: disable users", function (done) {
            API.get("/tenant_admin/block/" + tenant_admin_id)
                .set("Authorization", "Bearer " + orc_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    expect(res.body.status).to.be.equal(true)
                    done();
                });
        });
        it("Login failed: user is disabled and cannot log in", function (done) {
            API.post("/tenant_admin/login")
                .send(tenant_account_data.tenant_admin)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    expect(res.body.status).to.be.equal(false)
                    expect(res.body.err.code).to.be.equal(403)
                    expect(res.body.err.message).to.be.equal("This Account is blocked.")
                    done();
                });
        });
        it("Before login: Un-disable users", function (done) {
            API.get("/tenant_admin/unblock/" + tenant_admin_id)
                .set("Authorization", "Bearer " + orc_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    expect(res.body.status).to.be.equal(true)
                    done();
                });
        });
        it("Login successful: account has been deactivated", function (done) {
            API.post("/tenant_admin/login")
                .send(tenant_account_data.tenant_admin)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(tenant_account_data.tenant_admin)
                    console.log(res.body)
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    expect(body).to.have.all.keys("status", "tenant_admin_token", "tenant_admin_id", "username")
                    tenant_admin_token = body.tenant_admin_token;
                    tenant_admin_id = body.tenant_admin_id;
                    done();
                });
        });
    });
    describe("1.2 Create User", function () {
        it("1.4  Users : no user,No records exist", function (done) {
            API.get("/user")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    expect(res.body.status).to.be.equals(false)
                    expect(res.body.err.code).to.be.equal(404)
                    expect(res.body.err.message).to.be.equal('No records exist');
                    done();
                });
        });
        it("Create user 1 successfully", function (done) {
            this.timeout(3000);
            API.post("/user")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(tenant_account_data.teant_user)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    user_id = body.user_id;
                    user_total_count++;
                    setTimeout(done, 2000);
                });
        });
        it("Create user 2 successfully", function (done) {
            API.post("/user")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(tenant_account_data.teant_user2)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    user_total_count++;
                    done();
                });
        });
        it("User creation failed: user_id is occupied", function (done) {
            API.post("/user")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(tenant_account_data.teant_user)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.body)
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    expect(body.err.message).to.be.equal('user_id already exists')
                    done();
                });
        });
        it("User creation failed: user_id is empty", function (done) {
            API.post("/user")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(tenant_account_data.teant_user_no_id)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    expect(res.body.err.code).to.be.equals(400)
                    expect(res.body.status).to.be.equals(false)
                    expect(res.body.err.message).to.be.equals("user_id is mandatory")
                    done();
                });
        });
    });
    describe("1.4  Users – Get paginated", function () {
        let next = "";
        let previous = "";
        it("Get user list: no limit parameter", function (done) {
            API.get("/user")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    expect(res.body.status).to.be.equals(true)
                    expect(res.body).to.have.all.keys("results", "previous", "hasPrevious", "next", "hasNext", "total_count", "status")
                    expect(res.body.total_count).to.be.equal(user_total_count);
                    done();
                });
        });
        it("Get user list: have limit parameter", function (done) {
            API.get("/user?limit=" + 1)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    expect(res.body.status).to.be.equals(true)
                    expect(res.body).to.have.all.keys("results", "previous", "hasPrevious", "next", "hasNext", "total_count", "status")
                    expect(res.body.results.length).to.be.equal(1)
                    expect(res.body.hasPrevious).to.be.equals(false)
                    expect(res.body.hasNext).to.be.equals(true)
                    expect(res.body.next).to.be.a('string')
                    expect(res.body.total_count).to.be.equal(user_total_count);
                    next = res.body.next
                    done();
                });
        });
        it("Get the next page user list", function (done) {
            API.get("/user?limit=" + 1 + "&next=" + next)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.total_count).to.be.equal(user_total_count);
                    previous = body.previous;
                    next = body.next
                    done();
                });
        });
        it("Failed to get next page user: no next page data", function (done) {
            API.get("/user?limit=" + 1 + "&next=" + next)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    expect(res.body.status).to.be.equal(false)
                    expect(res.body.err.code).to.be.equal(404)
                    expect(res.body.err.message).to.be.equal('No records exist')
                    done();
                });
        });
        it("Get the previous page user list", function (done) {
            API.get("/user?limit=" + 1 + "&previous=" + previous)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.total_count).to.be.equal(user_total_count);
                    previous = body.previous;
                    done();
                });
        });
        it("Failed to get the previous page user: no previous page data", function (done) {
            API.get("/user?limit=" + 1 + "&previous=" + previous)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    expect(res.body.status).to.be.equal(false)
                    expect(res.body.err.code).to.be.equal(404)
                    expect(res.body.err.message).to.be.equal('No records exist')
                    done();
                });
        });
    });
    describe("1.5 Get User", function () {
        it("Get user details based on user_id", function (done) {
            API.get("/user/" + tenant_account_data.teant_user.user_id)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log("Get user details based on user_id: ")
                    console.log(res.body)
                    let body = JSON.parse(res.text);
                    expect(body).to.be.have.all.keys("user_id", "created_time", "updated_time", "creator", "status")
                    expect(body.user_id).to.be.equal(tenant_account_data.teant_user.user_id);
                    done();
                });
        });
        it("Failed to get user details: user_id does not exist", function (done) {
            API.get("/user/enduser_qa4")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(404);
                    expect(body.err.message).to.be.equal('User doesn\'t exist');
                    done();
                });
        });
    });
    describe("1.7 Create Proc profile", function () {
        it("Created success :VOD Profile1", function (done) {
            API.post("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(profile_data.vod_profile)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body).to.have.all.keys('status', 'proc_profile_id')
                    expect(body.status).to.be.true;
                    expect(body.proc_profile_id).to.be.a('string')
                    vod_profile_id = body.proc_profile_id;
                    profile_total_count++;
                    done();
                });
        });
        it("Created success :VOD Profile2", function (done) {
            API.post("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(profile_data.vod_profile2)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body).to.have.all.keys('status', 'proc_profile_id')
                    expect(body.status).to.be.true;
                    expect(body.proc_profile_id).to.be.a('string')
                    vod_profile_id2 = body.proc_profile_id;
                    profile_total_count++;
                    done();
                });
        });
        it("Created success :Live Profile", function (done) {
            API.post("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(profile_data.live_profile)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body).to.have.all.keys('status', 'proc_profile_id')
                    expect(body.status).to.be.true;
                    expect(body.proc_profile_id).to.be.a('string')
                    live_profile_id = body.proc_profile_id;
                    profile_total_count++;
                    done();
                });
        });
        it("Created fail : Profile name exists.", function (done) {
            API.post("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(profile_data.vod_profile)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    expect(body.err.message).to.be.equal('Profile name exists.');
                    done();
                });
        });
        it("Created fail:profile_name is needed, profile_name can only contain alphabetic and numeric characters", function (done) {
            delete require.cache[require.resolve('../../data/profile.json')];
            const profile_data = require("../../data/profile.json");
            let data = Object.assign({}, profile_data.vod_profile);
            data.profile_name = "";
            console.log(data)
            API.post("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    expect(body.err.message).to.be.equal('profile_name is needed, profile_name can only contain alphabetic and numeric characters')
                    done();
                });
        });
        it("Created fail:profile_name is needed", function (done) {
            let data = profile_data.vod_profile_no_name;
            API.post("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    expect(body.err.message).to.be.equal('profile_name is needed')
                    done();
                });
        });
        it("Created fail:profile_name can only contain alphabetic and numeric characters", function (done) {
            delete require.cache[require.resolve('../../data/profile.json')];
            const profile_data = require("../../data/profile.json");
            let data = Object.assign({}, profile_data.vod_profile);
            data.profile_name = "test*test";
            API.post("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    expect(body.err.message).to.be.equal('profile_name can only contain alphabetic and numeric characters')
                    done();
                });
        });
        it("Created fail:invalid profile type", function (done) {
            delete require.cache[require.resolve('../../data/profile.json')];
            const profile_data = require("../../data/profile.json");
            let data = Object.assign({}, profile_data.vod_profile);
            data.profile_type = "asdf"
            API.post("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    expect(body.err.message).to.be.equal('invalid profile type')
                    done();
                });
        });
        it("Created fail:empty:audio codec invalid", function (done) {
            delete require.cache[require.resolve('../../data/profile.json')];
            const profile_data = require("../../data/profile.json");
            let data = Object.assign({}, profile_data.vod_profile);
            data.transcode_audio_info = {
                "codec": "",
                "bitrate": 64,
                "sampling_rate": 44100,
                "channel_num": 2
            };
            API.post("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.body)
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    expect(body.err.message).to.be.equal('audio codec invalid')
                    done();
                });
        });
        it("Created fail:empty:video codec invalid", function (done) {
            delete require.cache[require.resolve('../../data/profile.json')];
            const profile_data = require("../../data/profile.json");
            let data = Object.assign({}, profile_data.vod_profile);
            data.transcode_video_info = {
                "codec": "",
                "bitrate": 64,
                "height": 161,
                "width": 240
            }
            API.post("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    expect(body.err.message).to.be.equal('video codec invalid')
                    done();
                });
        });
        it("Created fail:audio codec invalid", function (done) {
            delete require.cache[require.resolve('../../data/profile.json')];
            const profile_data = require("../../data/profile.json");
            let data = Object.assign({}, profile_data.vod_profile);
            data.transcode_audio_info.codec = "novalid";
            API.post("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    expect(body.err.message).to.be.equal('audio codec invalid')
                    done();
                });
        });
        it("Created fail:audio sampling_rate invalid", function (done) {
            delete require.cache[require.resolve('../../data/profile.json')];
            const profile_data = require("../../data/profile.json");
            let data = Object.assign({}, profile_data.vod_profile);
            data.transcode_audio_info.sampling_rate = "novalid";
            API.post("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    expect(body.err.message).to.be.equal('audio sampling_rate invalid')
                    done();
                });
        });
        it("Created fail:audio channel_num invalid", function (done) {
            delete require.cache[require.resolve('../../data/profile.json')];
            const profile_data = require("../../data/profile.json");
            let data = Object.assign({}, profile_data.vod_profile);
            data.transcode_audio_info.channel_num = "novalid";
            API.post("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    expect(body.err.message).to.be.equal('audio channel_num invalid')
                    done();
                });
        });
        it("Created fail:audio bitrate invalid", function (done) {
            delete require.cache[require.resolve('../../data/profile.json')];
            const profile_data = require("../../data/profile.json");
            let data = Object.assign({}, profile_data.vod_profile);
            data.transcode_audio_info.bitrate = "novalid";
            API.post("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    expect(body.err.message).to.be.equal('audio bitrate invalid')
                    done();
                });
        });
        it("Created fail:video codec invalid", function (done) {
            delete require.cache[require.resolve('../../data/profile.json')];
            const profile_data = require("../../data/profile.json");
            let data = Object.assign({}, profile_data.vod_profile);
            data.transcode_video_info.codec = "novalid";
            API.post("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    expect(body.err.message).to.be.equal('video codec invalid')
                    done();
                });
        });
        it("Created fail:video track width invalid", function (done) {
            delete require.cache[require.resolve('../../data/profile.json')];
            const profile_data = require("../../data/profile.json");
            let data = Object.assign({}, profile_data.vod_profile);
            data.transcode_video_info.width = "novalid";
            API.post("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    expect(body.err.message).to.be.equal('video track width invalid')
                    done();
                });
        });
        it("Created fail:video track height invalid", function (done) {
            delete require.cache[require.resolve('../../data/profile.json')];
            const profile_data = require("../../data/profile.json");
            let data = Object.assign({}, profile_data.vod_profile);
            data.transcode_video_info.height = "novalid";
            API.post("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    expect(body.err.message).to.be.equal('video track height invalid')
                    done();
                });
        })
        it("Created fail: video track bitrate invalid", function (done) {
            delete require.cache[require.resolve('../../data/profile.json')];
            const profile_data = require("../../data/profile.json");
            let data = Object.assign({}, profile_data.vod_profile);
            data.transcode_video_info.bitrate = "novalid";
            API.post("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    expect(body.err.message).to.be.equal('video track bitrate invalid')
                    done();
                });
        })
        it("Created fail:audio transcode information is missing", function (done) {
            let data = Object.assign({}, profile_data.vod_profile_no_audio_tr);
            API.post("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    expect(body.err.message).to.be.equal('audio transcode information is missing')
                    done();
                });
        })
        it("Created fail:video transcode information is missing", function (done) {
            let data = Object.assign({}, profile_data.vod_profile_no_video_tr);
            API.post("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    expect(body.err.message).to.be.equal('video transcode information is missing')
                    done();
                });
        })
    })
    describe("1.8 Read Proc profile", function () {
        it('Read Proc Profile success:vod', function (done) {
            API.get('/profile/' + vod_profile_id)
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer ' + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) done(err);
                    console.log(res.body)
                    expect(res.body).to.have.all.keys("_id",
                        "profile_name",
                        "profile_type",
                        "is_video_out",
                        "is_audio_out",
                        "is_transcode",
                        "is_default",
                        "is_use",
                        "transcode_video_info",
                        "transcode_audio_info",
                        "is_thumbnail_out",
                        "is_facialDetect_out",
                        "status");
                    expect(res.body.status).to.be.equal(true)
                    expect(res.body.profile_type).to.be.equal('VOD')
                    done()
                });
        })
        it('Read Proc Profile success:live', function (done) {
            API.get('/profile/' + live_profile_id)
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer ' + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) done(err);
                    console.log(res.body)
                    expect(res.body).to.have.all.keys("_id",
                        "profile_name",
                        "profile_type",
                        "is_video_out",
                        "is_audio_out",
                        "is_transcode",
                        "is_default",
                        "is_use",
                        "transcode_video_info",
                        "transcode_audio_info",
                        "is_thumbnail_out",
                        "is_facialDetect_out",
                        "status");
                    expect(res.body.status).to.be.equal(true)
                    expect(res.body.profile_type).to.be.equal('LIVE')
                    done()
                });
        })
        it('Read Proc Profile fail: profile id not exist', function (done) {
            API.get('/profile/5add42a368b09f269ddd6271')
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer ' + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) done(err);
                    console.log(res.body)

                    expect(res.body.status).to.be.equal(false)
                    expect(res.body.err.code).to.be.equal(404)
                    expect(res.body.err.message).to.be.equal("Record not found")
                    done()
                });
        })
        it('Read Proc Profile fail: profile id invalid', function (done) {
            API.get('/profile/' + vod_profile_id + 1)
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer ' + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) done(err);
                    console.log(res.body)

                    expect(res.body.status).to.be.equal(false)
                    expect(res.body.err.code).to.be.equal(400)
                    expect(res.body.err.message).to.be.equal("Invalid Object ID")
                    done()
                });
        })
    })
    describe("1.9 Update Proc profile", function () {
        let def_live_proc_id
        let def_vod_proc_id
        let Ndef_vod_proc_id
        before("get default live profile id", function (done) {
            API.get("/profile?is_default=true&profile_type=LIVE")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    next = body.next;
                    expect(body.results).to.be.an("array")
                    def_live_proc_id = body.results[0]._id
                    done();
                });
        })
        before("get default VOD profile id", function (done) {
            API.get("/profile?is_default=true&profile_type=VOD")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    next = body.next;
                    expect(body.results).to.be.an("array")
                    def_vod_proc_id = body.results[0]._id
                    done();
                });
        })
        before("get not default VOD profile id", function (done) {
            API.get("/profile?is_default=false&profile_type=VOD")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    next = body.next;
                    expect(body.results).to.be.an("array")
                    Ndef_vod_proc_id = body.results[0]._id
                    done();
                });
        })
        it("update default live profile fail : is default=true", function (done) {
            delete require.cache[require.resolve('../../data/profile.json')];
            const profile_data = require("../../data/profile.json");
            let data = Object.assign({}, profile_data.vod_profile_update);
            data.profile_type = "LIVE"
            data._id = def_live_proc_id
            console.log("update default live profile fail : is default=true ")
            console.log(data)
            API.put("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body)
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400)
                    expect(body.err.message).to.be.equal('Cannot change is_default/is_use of Default LIVE profile')
                    done();
                });
        })
        it("update default vod profile fail : Cannot change is_default/is_use of the only available Default VOD profile", function (done) {
            delete require.cache[require.resolve('../../data/profile.json')];
            const profile_data = require("../../data/profile.json");
            let data = Object.assign({}, profile_data.vod_profile_update);
            data.profile_type = "VOD"
            data._id = def_vod_proc_id
            console.log("Cannot change is_default/is_use of the only available Default VOD profile  :   ")
            console.log(data)
            API.put("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body)
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400)
                    expect(body.err.message).to.be.equal('Cannot change is_default/is_use of the only available Default VOD profile')
                    done();
                });
        })
        it("update VOD profile2 success", function (done) {
            delete require.cache[require.resolve('../../data/profile.json')];
            const profile_data = require("../../data/profile.json");
            let data = Object.assign({}, profile_data.vod_profile_update);
            data.profile_name = "myupdateprofile"
            data._id = vod_profile_id2
            console.log("Update successfully:")
            console.log(data)
            API.put("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log("1.9 Update successfully:")
                    console.log(body)
                    expect(body.status).to.be.true;
                    done();
                });
        })
        it("update fail : profile_name is needed, profile_name can only contain alphabetic and numeric characters", function (done) {
            delete require.cache[require.resolve('../../data/profile.json')];
            const profile_data = require("../../data/profile.json");
            let data = Object.assign({}, profile_data.vod_profile_update);
            data.profile_name = ""
            data._id = Ndef_vod_proc_id
            console.log(' profile_name is needed, profile_name can only contain alphabetic and numeric characters :  ')
            console.log(data)
            API.put("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body)
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400)
                    expect(body.err.message).to.be.equal('profile_name is needed, profile_name can only contain alphabetic and numeric characters')
                    done();
                })
        })
        it("update fail : Profile doesn\'t exist", function (done) {
            delete require.cache[require.resolve('../../data/profile.json')];
            const profile_data = require("../../data/profile.json");
            let data = Object.assign({}, profile_data.vod_profile_update);
            data.profile_name = "myupdateprofile"
            data._id = not_exist_id
            API.put("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(404);
                    expect(body.err.message).to.be.equal('Profile doesn\'t exist')
                    done();
                });
        })
        it("update fail : Invalid Object ID", function (done) {
            delete require.cache[require.resolve('../../data/profile.json')];
            const profile_data = require("../../data/profile.json");
            let data = Object.assign({}, profile_data.vod_profile_update);
            data.profile_name = "myupdateprofile"
            data._id = "ASDF"
            API.put("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    expect(body.err.message).to.be.equal('Invalid Object ID')
                    done();
                });
        })
        it("update fail : Profile name exists.(same as VOD profile 1)", function (done) {
            delete require.cache[require.resolve('../../data/profile.json')];
            const profile_data = require("../../data/profile.json");
            let data = Object.assign({}, profile_data.vod_profile_update);
            data.profile_name = profile_data.vod_profile.profile_name
            data._id = vod_profile_id2
            console.log("Update failed: profile name is already occupied (update profile2 name, same as profile1): ")
            console.log(data)
            API.put("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log("Update failed, profile name is already occupied:")
                    console.log(res.body)
                    expect(res.body.status).to.be.false;
                    expect(res.body.err.code).to.be.equal(400);
                    expect(res.body.err.message).to.be.equal('Profile name exists.')
                    done();
                });
        })
        it("update fail : profile_name can only contain alphabetic and numeric characters", function (done) {
            delete require.cache[require.resolve('../../data/profile.json')];
            const profile_data = require("../../data/profile.json");
            let data = Object.assign({}, profile_data.vod_profile_update);
            data.profile_name = "est@#651"
            data._id = vod_profile_id2
            API.put("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log("Update failed, profile_name contains non-alphanumeric characters:")
                    console.log(data)
                    console.log(res.body)
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    expect(body.err.message).to.be.equal('profile_name can only contain alphabetic and numeric characters')
                    done();
                });
        })
        it("update fail : invalid profile type", function (done) {
            delete require.cache[require.resolve('../../data/profile.json')];
            const profile_data = require("../../data/profile.json");
            let data = Object.assign({}, profile_data.vod_profile_update);
            data.profile_type = "ttt";
            data._id = vod_profile_id2
            API.put("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    expect(body.err.message).to.be.equal('invalid profile type')
                    done();
                });
        })
        it("update fail : audio codec invalid", function (done) {
            delete require.cache[require.resolve('../../data/profile.json')];
            const profile_data = require("../../data/profile.json");
            let data = Object.assign({}, profile_data.vod_profile_update);
            data._id = vod_profile_id2
            data.transcode_audio_info.codec = "";
            API.put("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    expect(body.err.message).to.be.equal('audio codec invalid')
                    done();
                });
        })
        it("update fail : video codec invalid", function (done) {
            delete require.cache[require.resolve('../../data/profile.json')];
            const profile_data = require("../../data/profile.json");
            let data = Object.assign({}, profile_data.vod_profile_update);
            data._id = vod_profile_id2
            data.transcode_video_info.codec = "";
            API.put("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    expect(body.err.message).to.be.equal('video codec invalid')
                    done();
                });
        })
        it("update fail : audio channel_num invalid", function (done) {
            delete require.cache[require.resolve('../../data/profile.json')];
            const profile_data = require("../../data/profile.json");
            let data = Object.assign({}, profile_data.vod_profile_update);
            data._id = vod_profile_id2
            data.transcode_audio_info.channel_num = "asdf";
            API.put("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    expect(body.err.message).to.be.equal('audio channel_num invalid')
                    done();
                });
        })
        it("update fail : audio sampling_rate invalid", function (done) {
            delete require.cache[require.resolve('../../data/profile.json')];
            const profile_data = require("../../data/profile.json");
            let data = Object.assign({}, profile_data.vod_profile_update);
            data._id = vod_profile_id2
            data.transcode_audio_info.sampling_rate = "asdf";
            API.put("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    expect(body.err.message).to.be.equal('audio sampling_rate invalid')
                    done();
                });
        })
        it("update fail : audio bitrate invalid", function (done) {
            delete require.cache[require.resolve('../../data/profile.json')];
            const profile_data = require("../../data/profile.json");
            let data = Object.assign({}, profile_data.vod_profile_update);
            data._id = vod_profile_id2
            data.transcode_audio_info.bitrate = "asdf";
            API.put("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    expect(body.err.message).to.be.equal('audio bitrate invalid')
                    done();
                });
        })
        it("update fail :  video codec invalid", function (done) {
            delete require.cache[require.resolve('../../data/profile.json')];
            const profile_data = require("../../data/profile.json");
            let data = Object.assign({}, profile_data.vod_profile_update);
            data._id = vod_profile_id2
            data.transcode_video_info.codec = "asdf";
            API.put("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    expect(body.err.message).to.be.equal('video codec invalid')
                    done();
                });
        })
        it("update fail :  video track width invalid", function (done) {
            delete require.cache[require.resolve('../../data/profile.json')];
            const profile_data = require("../../data/profile.json");
            let data = Object.assign({}, profile_data.vod_profile_update);
            data._id = vod_profile_id2
            data.transcode_video_info.width = "asdf";
            API.put("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    expect(body.err.message).to.be.equal('video track width invalid')
                    done();
                });
        })
        it("update fail : video track height invalid", function (done) {
            delete require.cache[require.resolve('../../data/profile.json')];
            const profile_data = require("../../data/profile.json");
            let data = Object.assign({}, profile_data.vod_profile_update);
            data._id = vod_profile_id2
            data.transcode_video_info.height = "asdf";
            API.put("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    expect(body.err.message).to.be.equal('video track height invalid')
                    done();
                });
        })
        it("update fail : video track bitrate invalid", function (done) {
            delete require.cache[require.resolve('../../data/profile.json')];
            const profile_data = require("../../data/profile.json");
            let data = Object.assign({}, profile_data.vod_profile_update);
            data._id = vod_profile_id2
            data.transcode_video_info.bitrate = "asdf";
            API.put("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    expect(body.err.message).to.be.equal('video track bitrate invalid')
                    done();
                });
        })
        it("update fail : profile_name is needed", function (done) {
            delete require.cache[require.resolve('../../data/profile.json')];
            const profile_data = require("../../data/profile.json");
            let data = Object.assign({}, profile_data.vod_profile_update_no_name);
            data._id = vod_profile_id2
            API.put("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    expect(body.err.message).to.be.equal('profile_name is needed')
                    done();
                });
        })
        it("update fail : video transcode information is missing", function (done) {
            delete require.cache[require.resolve('../../data/profile.json')];
            const profile_data = require("../../data/profile.json");
            let data = Object.assign({}, profile_data.vod_profile_update_no_tr_vi);
            data._id = vod_profile_id2
            API.put("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    expect(body.err.message).to.be.equal('video transcode information is missing')
                    done();
                });
        })
        it("update fail : audio transcode information is missing", function (done) {
            delete require.cache[require.resolve('../../data/profile.json')];
            const profile_data = require("../../data/profile.json");
            let data = Object.assign({}, profile_data.vod_profile_update_no_tr_au);
            data._id = vod_profile_id2
            API.put("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    expect(body.err.message).to.be.equal('audio transcode information is missing')
                    done();
                });
        })
        after("delete update profile : vod_profile_id2", function (done) {
            API.delete("/profile/" + vod_profile_id2)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    done();
                });
        })
    })
    describe("1.12 List Proc profile", function () {
        let next = "";
        let previous = "";
        let vod_profile_idf
        let profile_lengh
        let next_no
        let previous_no
        before("create VOD Profile : is use=false", function (done) {
            delete require.cache[require.resolve('../../data/profile.json')];
            const profile_data = require("../../data/profile.json");
            let data = Object.assign({}, profile_data.vod_profile);
            data.profile_name = "falseprofile"
            data.is_use = false
            API.post("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body).to.have.all.keys('status', 'proc_profile_id')
                    expect(body.status).to.be.true;
                    expect(body.proc_profile_id).to.be.a('string')
                    vod_profile_idf = body.proc_profile_id;
                    done()
                })
        })
        it("get all profile list", function (done) {
            API.get("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.results).to.be.an("array");
                    profile_lengh = body.results.length
                    next_no = body.next
                    previous_no = body.previous
                    done();
                });
        })
        it("get profile list by limit", function (done) {
            API.get("/profile?limit=1")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.results).to.be.an("array");
                    expect(body.results.length).to.be.equal(1)
                    next = body.next;
                    done();
                });
        })
        it("get true only profile list : is use = true", function (done) {
            API.get("/profile?enabled_only=true")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.results).to.be.an("array");
                    expect(body.results.length).to.be.equal(profile_lengh - 1)
                    done();
                });
        })
        it("get all profile list : is use = false", function (done) {
            API.get("/profile?enabled_only=false")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.results).to.be.an("array");
                    expect(body.results.length).to.be.equal(profile_lengh)
                    done();
                });
        })
        it("get profile list : next", function (done) {
            API.get("/profile?limit=1&next=" + next)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log("get profile list : next   :   ")
                    console.log(res.body)
                    let body = JSON.parse(res.text);
                    expect(body.results).to.be.an("array");
                    expect(body.results.length).to.be.equal(1)
                    previous = body.previous
                    done();
                });
        })
        it("get profile list : previous", function (done) {
            API.get("/profile?limit=1&previous=" + previous)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log("get profile list : previous   :   ")
                    console.log(res.body)
                    expect(body.results).to.be.an("array");
                    expect(body.results.length).to.be.equal(1)
                    done();
                });
        })
        it("next profile list fail : No records exist", function (done) {
            API.get("/profile?next=" + next_no)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.equal(false)
                    expect(body.err.code).to.be.equal(404)
                    expect(body.err.message).to.be.equal('No records exist')
                    done();
                });
        })
        it("previous profile list fail: No records exist", function (done) {
            API.get("/profile?previous=" + previous_no)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.equal(false)
                    expect(body.err.code).to.be.equal(404)
                    expect(body.err.message).to.be.equal('No records exist')
                    done();
                });
        })
        after("delete live profile", function (done) {
            API.delete("/profile/" + vod_profile_idf)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    done();
                });
        })
    })
    describe("1.13 Allocate Source file ID", function () {
        it("1.13  Allocate Source file ID", function (done) {
            API.get("/source/id")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    expect(body.source_file_id).to.be.a('string')
                    done();
                });
        })
    })
    describe("1.6 Delete User", function () {
        it("Delete failed: user_id does not exist", function (done) {
            API.delete("/user/" + not_exist_id)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(404);
                    expect(body.err.message).to.be.equal('User doesn\'t exist/already deleted')
                    done();
                });
        });
        it("Delete user by user_id", function (done) {
            API.delete("/user/" + tenant_account_data.teant_user.user_id)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    done();
                });
        });
        it("Delete user by user_id2", function (done) {
            API.delete("/user/" + tenant_account_data.teant_user2.user_id)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    done();
                });
        });

    })
    describe("1.10 Delete Proc profile", function () {

        let Ndef_vod_proc_id
        before("get default live profile id", function (done) {
            API.get("/profile?is_default=true&profile_type=LIVE")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    next = body.next;
                    expect(body.results).to.be.an("array")
                    def_live_proc_id = body.results[0]._id
                    done();
                });
        })
        before("get default VOD profile id", function (done) {
            API.get("/profile?is_default=true&profile_type=VOD")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    next = body.next;
                    expect(body.results).to.be.an("array")
                    def_vod_proc_id = body.results[0]._id
                    done();
                });
        })
        it("delete live profile", function (done) {
            API.delete("/profile/" + live_profile_id)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    done();
                });
        })
        it("delete vod profile", function (done) {
            API.delete("/profile/" + vod_profile_id)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    done();
                });
        })
        it("delete profile fail : Profile doesn't exist", function (done) {
            API.delete("/profile/" + vod_profile_id)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(404)
                    expect(body.err.message).to.be.equal("Profile doesn't exist")
                    done()
                })
        })
        it("delete profile fail : Invalid Object ID", function (done) {
            API.delete("/profile/5b1f9aa2e54fa82141e4ee911")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400)
                    expect(body.err.message).to.be.equal("Invalid Object ID")
                    done()
                })
        })
        it("delete profile fail : Cannot delete the only available Default VOD profile", function (done) {
            API.delete("/profile/" + def_vod_proc_id)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400)
                    expect(body.err.message).to.be.equal("Cannot delete the only available Default VOD profile")
                    done()
                })
        })
        it("delete profile fail : Cannot delete Default LIVE profile", function (done) {
            API.delete("/profile/" + def_live_proc_id)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400)
                    expect(body.err.message).to.be.equal("Cannot delete Default LIVE profile")
                    done()
                })
        })
    })
    describe("1.11 Delete Proc profile list", function () {
        let vod_profile_id_d_1
        let vod_profile_id_d_2
        let vod_profile_id_d_3
        let vod_profile_id_d_4
        before("create VOD Profile1", function (done) {
            delete require.cache[require.resolve('../../data/profile.json')];
            const profile_data = require("../../data/profile.json");
            let data = Object.assign({}, profile_data.vod_profile);
            API.post("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body).to.have.all.keys('status', 'proc_profile_id')
                    expect(body.status).to.be.true;
                    expect(body.proc_profile_id).to.be.a('string')
                    vod_profile_id_d_1 = body.proc_profile_id;
                    done()
                })
        })
        before("create VOD Profile2", function (done) {
            delete require.cache[require.resolve('../../data/profile.json')];
            const profile_data = require("../../data/profile.json");
            let data = Object.assign({}, profile_data.vod_profile);
            data.profile_name = "autoautoauto"
            API.post("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body).to.have.all.keys('status', 'proc_profile_id')
                    expect(body.status).to.be.true;
                    expect(body.proc_profile_id).to.be.a('string')
                    vod_profile_id_d_2 = body.proc_profile_id;
                    done()
                })
        })
        before("create VOD Profile3", function (done) {
            delete require.cache[require.resolve('../../data/profile.json')];
            const profile_data = require("../../data/profile.json");
            let data = Object.assign({}, profile_data.vod_profile);
            data.profile_name = "autoautoauto333"
            API.post("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body).to.have.all.keys('status', 'proc_profile_id')
                    expect(body.status).to.be.true;
                    expect(body.proc_profile_id).to.be.a('string')
                    vod_profile_id_d_3 = body.proc_profile_id;
                    done()
                })
        })
        before("create VOD Profile4", function (done) {
            delete require.cache[require.resolve('../../data/profile.json')];
            const profile_data = require("../../data/profile.json");
            let data = Object.assign({}, profile_data.vod_profile);
            data.profile_name = "autoautoauto4444"
            API.post("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body).to.have.all.keys('status', 'proc_profile_id')
                    expect(body.status).to.be.true;
                    expect(body.proc_profile_id).to.be.a('string')
                    vod_profile_id_d_4 = body.proc_profile_id;
                    done()
                })
        })
        it("delete vod profile list success", function (done) {
            API.delete("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    profiles: [vod_profile_id_d_1, vod_profile_id_d_2]
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    done();
                });
        })
        it("delete vod profile list fail : Profile doesn't exist", function (done) {
            API.delete("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    profiles: [vod_profile_id_d_1, vod_profile_id_d_2]
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(404)
                    expect(body.err.message).to.be.equal("Profile doesn't exist")
                    done();
                })
        })
        it("delete vod profile list fail : Profiles field is needed", function (done) {
            API.delete("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    profiles: []
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400)
                    expect(body.err.message).to.be.equal("profiles field is needed")
                    done();
                })
        })
        it("delete vod profile list fail : profiles should be Array", function (done) {
            API.delete("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    profiles: ""
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400)
                    expect(body.err.message).to.be.equal("profiles should be Array")
                    done();
                })
        })
        it("delete vod profile list fail : Cannot delete the only available Default VOD profile", function (done) {
            API.delete("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    profiles: [vod_profile_id_d_3, def_vod_proc_id]
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400)
                    expect(body.err.message).to.be.equal("Cannot delete the only available Default VOD profile")
                    done();
                })
        })
        it("delete vod profile list fail : Cannot delete Default LIVE profile", function (done) {
            API.delete("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    profiles: [def_live_proc_id, vod_profile_id_d_4]
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400)
                    expect(body.err.message).to.be.equal("Cannot delete Default LIVE profile")
                    done();
                })
        })
        after("check vod_profile_id_d_1 has been deleted", function (done) {
            API.get("/profile/" + vod_profile_id_d_1)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(404)
                    expect(body.err.message).to.be.equal("Record not found")
                    done();
                })
        })
        after("check vod_profile_id_d_3 has been deleted", function (done) {
            API.get("/profile/" + vod_profile_id_d_3)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(404)
                    expect(body.err.message).to.be.equal("Record not found")
                    done();
                })
        })
        after("check vod_profile_id_d_4 should not deleted", function (done) {
            API.get("/profile/" + vod_profile_id_d_4)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    done();
                })
        })
        after("delete vod profile 4", function (done) {
            API.delete("/profile/" + vod_profile_id_d_4)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    done();
                });
        })
    })
})