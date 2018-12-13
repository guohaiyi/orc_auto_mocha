const config = require("../../config");
const common = require("../common/common");
const API = common.api;
const expect = require("chai").expect;
const tenant_account_data = require("../../data/tenant_account.json");
const profile_data = require("../../data/profile.json");
const imagepath = config.source.image;
const videopath = config.source.video;
const LIMIT = config.sql_limit;
let tenant_admin_id = "";
let tenant_admin_token = "";
let user_id = "";
let vod_profile_id = "";
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
describe("CMBDEV_API TEST", function() {
    describe("1.1 Login Tenant Admin", function() {
        it("登陆成功", function(done) {
            API.post("/tenant_admin/login")
                .send(tenant_account_data.tenant_admin)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    tenant_admin_token = body.tenant_admin_token;
                    tenant_admin_id = body._id;
                    done();
                });
        });

        it("登录失败：username或者password为空", function(done) {
            API.post("/tenant_admin/login")
                .send(tenant_account_data.tenant_admin_no_pw)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    done();
                });
        });

        it("登录失败：tenant_name为空", function(done) {
            API.post("/tenant_admin/login")
                .send(tenant_account_data.tenant_admin_no_tenant)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    done();
                });
        });

        it("登录失败：密码错误", function(done) {
            API.post("/tenant_admin/login")
                .send(tenant_account_data.tenant_admin_error_pw)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    done();
                });
        });

        it("登录失败：user name与tenant_name不符", function(done) {
            API.post("/tenant_admin/login")
                .send(tenant_account_data.tenant_admin_error_tenant)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    done();
                });
        });

        it("登录失败：Tenant账户不存在", function(done) {
            API.post("/tenant_admin/login")
                .send(tenant_account_data.tenant_admin_error_tenant)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    done();
                });
        });

        it("登录失败：账户被阻塞", function(done) {
            API.get("/tenant_admin/block/" + tenant_admin_id)
                // .set("Authorization", "Bearer " + orchestrator_admin_token)
                .expect(200)
                .end(function(err, res) {
                    API.post("/tenant_admin/login")
                        .send(tenant_account_data.tenant_admin)
                        .expect(200)
                        .end(function(err, res) {
                            if (err) throw err;
                            let body = JSON.parse(res.text);
                            expect(body.status).to.be.false;
                            expect(body.err.code).to.be.equal(403);
                            done();
                        });
                });
        });

        it("登录成功：账户已解除阻塞", function(done) {
            API.get("/tenant_admin/unblock/" + tenant_admin_id)
                // .set("Authorization", "Bearer " + orchestrator_admin_token)
                .expect(200)
                .end(function(err, res) {
                    API.post("/tenant_admin/login")
                        .send(tenant_account_data.tenant_admin)
                        .expect(200)
                        .end(function(err, res) {
                            if (err) throw err;
                            let body = JSON.parse(res.text);
                            expect(body.status).to.be.true;
                            tenant_admin_token = body.tenant_admin_token;
                            tenant_admin_id = body._id;
                            done();
                        });
                });
        });
    });

    describe("1.2 Create User", function() {
        it("创建用户成功", function(done) {
            API.post("/user")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(tenant_account_data.teant_user)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    user_id = body.user_id;
                    user_total_count++;
                });
            API.post("/user")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(tenant_account_data.teant_user2)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    user_total_count++;
                    done();
                });
        });

        it("创建用户失败：user_id被占用", function(done) {
            API.post("/user")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(tenant_account_data.teant_user)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    done();
                });
        });

        it("创建用户失败：user_id为空", function(done) {
            API.post("/user")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(tenant_account_data.teant_user_no_id)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    done();
                });
        });
        // doc delete this test case
        // it("创建用户失败：creator不存在", function(done) {
        //     API.post("/user")
        //         .set("Authorization", "Bearer " + tenant_admin_token)
        //         .send(tenant_account_data.teant_user_no_creator)
        //         .expect(200)
        //         .end(function(err, res) {
        //             if (err) throw err;
        //             let body = JSON.parse(res.text);
        //             console.log(body);
        //             expect(body.status).to.be.false;
        //             expect(body.err.code).to.be.equal(400);
        //             done();
        //         });
        // });
    });

    describe("1.4  Users – Get paginated", function() {
        let next = "";
        let previous = "";
        it("获取用户列表", function(done) {
            API.get("/user?limit=" + 1)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.total_count).to.be.equal(user_total_count);
                    next = body.next;
                    done();
                });
        });

        it("获取下一页用户列表", function(done) {
            API.get("/user?limit=" + 1 + "&next=" + next)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.total_count).to.be.equal(user_total_count);
                    previous = body.previous;
                    done();
                });
        });

        it("获取下一页用户列表", function(done) {
            API.get("/user?limit=" + 1 + "&previous=" + previous)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.total_count).to.be.equal(user_total_count);
                    done();
                });
        });
    });

    describe("1.5 Get User", function() {
        // it("根据_id获取用户详细信息", function(done) {
        //     API.get("/user/_id/" + user_id)
        //         .set("Authorization", "Bearer " + tenant_admin_token)
        //         .expect(200)
        //         .end(function(err, res) {
        //             if (err) throw err;
        //             let body = JSON.parse(res.text);
        //             console.log(body);
        //             expect(body.user_id).to.be.equal(tenant_account_data.teant_user.user_id);
        //             done();
        //         });
        // });

        it("根据user_id获取用户详细信息", function(done) {
            API.get("/user/" + tenant_account_data.teant_user.user_id)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.user_id).to.be.equal(tenant_account_data.teant_user.user_id);
                    done();
                });
        });

        it("获取用户详细信息失败：user_id不存在", function(done) {
            API.get("/user/enduser_qa4")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(404);
                    done();
                });
        });

        // it("获取用户详细信息失败：_id不存在", function(done) {
        //     API.get("/user/_id/5ab1f860a5ecc9b69735284c")
        //         .set("Authorization", "Bearer " + tenant_admin_token)
        //         .expect(200)
        //         .end(function(err, res) {
        //             if (err) throw err;
        //             let body = JSON.parse(res.text);
        //             expect(body.status).to.be.false;
        //             expect(body.err.code).to.be.equal(500);
        //             done();
        //         });
        // });

        // it("获取用户详细信息失败：_id数据类型无效", function(done) {
        //     API.get("/user/_id/notexist")
        //         .set("Authorization", "Bearer " + tenant_admin_token)
        //         .expect(200)
        //         .end(function(err, res) {
        //             if (err) throw err;
        //             let body = JSON.parse(res.text);
        //             expect(body.status).to.be.false;
        //             expect(body.err.code).to.be.equal(400);
        //             done();
        //         });
        // });

        it("获取用户详细信息失败：user_id数据类型无效", function(done) {
            API.get("/user/123")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(404);
                    done();
                });
        });
    });

    describe("1.7 Create Proc profile", function() {
        it("创建成功：VOD Profile", function(done) {
            API.post("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(profile_data.vod_profile)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    vod_profile_id = body.proc_profile_id;
                    profile_total_count++;
                    done();
                });
        });

        it("创建成功：Live Profile", function(done) {
            API.post("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(profile_data.live_profile)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    live_profile_id = body.proc_profile_id;
                    profile_total_count++;
                    done();
                });
        });

        it("创建失败；profile_name已被占用", function(done) {
            API.post("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(profile_data.vod_profile)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    done();
                });
        });

        it("创建失败；profile_name为空", function(done) {
            let data = profile_data.vod_profile;
            data.profile_name = null;
            API.post("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    done();
                });
        });

        it("创建失败；profile_name含非字母和数字字符", function(done) {
            let data = profile_data.vod_profile;
            data.profile_name = "test*test";
            API.post("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    done();
                });
        });

        it("创建失败；profile_type无效", function(done) {
            let data = profile_data.vod_profile_error;
            data.profile_name = "profileTypeError";
            API.post("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(profile_data.vod_profile_error)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    done();
                });
        });

        it("创建失败；audio info codec为空", function(done) {
            let data = Object.assign({}, profile_data.vod_profile_error);
            data.transcode_audio_info = null;
            API.post("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(profile_data.vod_profile_error)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    done();
                });
        });

        it("创建失败；video info codec为空", function(done) {
            let data = Object.assign({}, profile_data.vod_profile_error);
            data.transcode_video_info = null;
            API.post("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(profile_data.vod_profile_error)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    done();
                });
        });

        it("创建失败；audio info codec无效", function(done) {
            let data = Object.assign({}, profile_data.vod_profile_error);
            data.transcode_audio_info.codec = "novalid";
            API.post("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(profile_data.vod_profile_error)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    done();
                });
        });

        it("创建失败；audio samplingRate无效", function(done) {
            let data = Object.assign({}, profile_data.vod_profile_error);
            data.transcode_audio_info.sampling_rate = "novalid";
            API.post("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(profile_data.vod_profile_error)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    done();
                });
        });

        it("创建失败；audio channelNum 无效", function(done) {
            let data = Object.assign({}, profile_data.vod_profile_error);
            data.transcode_audio_info.channel_num = "novalid";
            API.post("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(profile_data.vod_profile_error)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    done();
                });
        });

        it("创建失败；audio bitrate 无效", function(done) {
            let data = Object.assign({}, profile_data.vod_profile_error);
            data.transcode_audio_info.bitrate = "novalid";
            API.post("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(profile_data.vod_profile_error)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    done();
                });
        });

        it("创建失败；video info codec 无效", function(done) {
            let data = Object.assign({}, profile_data.vod_profile_error);
            data.transcode_video_info.codec = "novalid";
            API.post("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(profile_data.vod_profile_error)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    done();
                });
        });

        it("创建失败；video width 无效", function(done) {
            let data = Object.assign({}, profile_data.vod_profile_error);
            data.transcode_video_info.width = "novalid";
            API.post("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(profile_data.vod_profile_error)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    done();
                });
        });

        it("创建失败；video height 无效", function(done) {
            let data = Object.assign({}, profile_data.vod_profile_error);
            data.transcode_video_info.width = "novalid";
            API.post("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(profile_data.vod_profile_error)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    done();
                });
        });

        it("创建失败；video bitrate 无效", function(done) {
            let data = Object.assign({}, profile_data.vod_profile_error);
            data.transcode_video_info.width = "novalid";
            API.post("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(profile_data.vod_profile_error)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    done();
                });
        });
    });

    describe("1.8 Read Proc profile", function() {
        it("读取profile详细信息", function(done) {
            API.get("/profile/" + vod_profile_id)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body).to.be.an("object");
                    expect(body._id).to.be.equal(vod_profile_id);
                    done();
                });
        });

        it("读取失败：profile ID不存在", function(done) {
            API.get("/profile/" + not_exist_id)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(404);
                    done();
                });
        });

        it("读取失败：profile ID无效", function(done) {
            API.get("/profile/novalid")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(500);
                    done();
                });
        });
    });

    describe("1.9 Update Proc profile", function() {
        it("更新成功", function(done) {
            API.put("/profile/" + vod_profile_id)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(profile_data.vod_profile_update)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    done();
                });
        });

        it("无法更新：profile ID不存在", function(done) {
            API.put("/profile/" + not_exist_id)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(profile_data.vod_profile_update)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(404);
                    done();
                });
        });

        it("无法更新：profile ID无效", function(done) {
            API.put("/profile/" + NOVALID)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(profile_data.vod_profile_update)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(500);
                    done();
                });
        });

        it("更新失败；profile name已被占用", function(done) {
            API.put("/profile/" + vod_profile_id)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(profile_data.live_profile)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    done();
                });
        });

        it("更新失败；profile_name含非字母和数字字符", function(done) {
            let data = Object.assign({}, profile_data.vod_profile_update);
            data.profile_name = "test$&test";
            API.put("/profile/" + vod_profile_id)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    done();
                });
        });

        it("更新失败；profile_type无效", function(done) {
            let data = Object.assign({}, profile_data.vod_profile_update);
            data.profile_type = "ttt";
            API.put("/profile/" + vod_profile_id)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    done();
                });
        });

        it("更新失败；audio info codec为空", function(done) {
            let data = Object.assign({}, profile_data.vod_profile_update);
            data.transcode_audio_info = null;
            API.put("/profile/" + vod_profile_id)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    done();
                });
        });

        it("更新失败；video info codec为空", function(done) {
            let data = Object.assign({}, profile_data.vod_profile_update);
            data.transcode_video_info = null;
            API.put("/profile/" + vod_profile_id)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    done();
                });
        });

        it("更新失败；audio info codec无效", function(done) {
            let data = Object.assign({}, profile_data.vod_profile_update);
            data.transcode_audio_info.codec = NOVALID;
            API.put("/profile/" + vod_profile_id)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    done();
                });
        });

        it("更新失败；audio channelNum无效", function(done) {
            let data = Object.assign({}, profile_data.vod_profile_update);
            data.transcode_audio_info.channel_num = NOVALID;
            API.put("/profile/" + vod_profile_id)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    done();
                });
        });

        it("更新失败；audio samplingRate无效", function(done) {
            let data = Object.assign({}, profile_data.vod_profile_update);
            data.transcode_audio_info.sampling_rate = NOVALID;
            API.put("/profile/" + vod_profile_id)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    done();
                });
        });

        it("更新失败；audio bitrate无效", function(done) {
            let data = Object.assign({}, profile_data.vod_profile_update);
            data.transcode_audio_info.bitrate = NOVALID;
            API.put("/profile/" + vod_profile_id)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    done();
                });
        });

        it("更新失败；video info codec无效", function(done) {
            let data = Object.assign({}, profile_data.vod_profile_update);
            data.transcode_video_info.codec = NOVALID;
            API.put("/profile/" + vod_profile_id)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    done();
                });
        });

        it("更新失败；video width无效", function(done) {
            let data = Object.assign({}, profile_data.vod_profile_update);
            data.transcode_video_info.width = NOVALID;
            API.put("/profile/" + vod_profile_id)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    done();
                });
        });

        it("更新失败；video height无效", function(done) {
            let data = Object.assign({}, profile_data.vod_profile_update);
            data.transcode_video_info.height = NOVALID;
            API.put("/profile/" + vod_profile_id)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    done();
                });
        });

        it("更新失败；video bitrate无效", function(done) {
            let data = Object.assign({}, profile_data.vod_profile_update);
            data.transcode_video_info.bitrate = NOVALID;
            API.put("/profile/" + vod_profile_id)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    done();
                });
        });
    });

    describe("1.12 List Proc profile", function() {
        let next = "";
        let previous = "";
        it("获取profile列表：自定义列表返回数量", function(done) {
            API.get("/profile?limit=" + LIMIT)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    next = body.next;
                    expect(body.results).to.be.an("array");
                    expect(body.total_count).to.be.equal(profile_total_count);
                    done();
                });
        });

        it("获取profile列表：下一页", function(done) {
            API.get("/profile?limit=" + LIMIT)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    previous = body.previous;
                    expect(body.results).to.be.an("array");
                    expect(body.total_count).to.be.equal(profile_total_count);
                    done();
                });
        });

        it("获取profile列表：上一页", function(done) {
            API.get("/profile?limit=" + LIMIT)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.results).to.be.an("array");
                    expect(body.total_count).to.be.equal(profile_total_count);
                    done();
                });
        });
    });

    describe("1.13  Allocate Source file ID", function() {
        it("59 Source file ID分配成功", function(done) {
            API.get("/source/id")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    source_file_id = body.source_file_id;
                    done();
                });
        });
    });

    describe("1.14  Upload VOD source", function() {
        it("上传成功：MP4", function(done) {
            API.post("/library/upload")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .field("type", "video")
                .field("source_id", source_file_id)
                .attach("file", videopath.mp4, "sample.mp4")
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    vod_source_total_count++;
                    done();
                });
        });

        it("上传失败：source_id被占用", function(done) {
            API.post("/library/upload")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .field("type", "video")
                .field("source_id", source_file_id)
                .attach("file", videopath.mp4, "sample.mp4")
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    done();
                });
        });

        it("上传失败：source_id不存在", function(done) {
            API.post("/library/upload")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .field("type", "video")
                .field("source_id", not_exist_id)
                .attach("file", videopath.mp4, "sample.mp4")
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    done();
                });
        });

        it("上传失败：source_id错误", function(done) {
            API.post("/library/upload")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .field("type", "video")
                .field("source_id", NOVALID)
                .attach("file", videopath.mp4, "sample.mp4")
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    done();
                });
        });
    });

    describe("1.18  List VOD source", function() {
        it("83 获取vod源列表", function(done) {
            API.get("/source?limit=" + LIMIT)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.results).to.be.an("array");
                    expect(body.total_count).to.be.equal(vod_source_total_count);
                    done();
                });
        });
    });

    describe("1.15  Start VOD source transcode", function() {
        it("启动编码：未进行过任何编码的源文件", function(done) {
            API.post("/library/encode")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    source_file_id: source_file_id,
                    proc_profile_id: [vod_profile_id]
                })
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    library_id = body.library[0];
                    done();
                });
        });

        it("启动转码失败：source_file_id数据无效", function(done) {
            API.post("/library/encode")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    source_file_id: NOVALID,
                    proc_profile_id: [vod_profile_id]
                })
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(404);
                    done();
                });
        });

        it("启动转码失败：source_file_id不存在", function(done) {
            API.post("/library/encode")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    source_file_id: not_exist_id,
                    proc_profile_id: [vod_profile_id]
                })
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(404);
                    done();
                });
        });

        it("启动转码失败：proc_profile不存在", function(done) {
            API.post("/library/encode")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    source_file_id: source_file_id,
                    proc_profile_id: [not_exist_id]
                })
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(404);
                    done();
                });
        });
    });

    describe("1.16  Monitor VOD source transcode", function() {
        it("查询vod的编码情况", function(done) {
            API.post("/library/monitor")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    library_id: [library_id]
                })
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body).to.be.an("array");
                    expect(body[0].library_id).to.be.equal(library_id);
                    done();
                });
        });

        it("查询失败：library_id不存在", function(done) {
            API.post("/library/monitor")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    library_id: [not_exist_id]
                })
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(404);
                    done();
                });
        });

        it("查询失败：library_id无效", function(done) {
            API.post("/library/monitor")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    library_id: [NOVALID]
                })
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    done();
                });
        });

        it("查询失败：library_id为空", function(done) {
            API.post("/library/monitor")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    library_id: []
                })
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    done();
                });
        });
    });

    describe("1.19  Read VOD output", function() {
        it("读取vod输出", function(done) {
            API.get("/library/" + library_id)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body).to.be.an("object");
                    expect(body._id).to.be.equal(library_id);
                    done();
                });
        });

        it("读取失败：library_id不存在", function(done) {
            API.get("/library/" + not_exist_id)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(404);
                    done();
                });
        });

        it("读取失败：library_id无效", function(done) {
            API.get("/library/" + NOVALID)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    done();
                });
        });
    });

    describe("1.21  List VOD output", function() {
        let next = "";
        let previous = "";
        it("获取vod输出列表", function(done) {
            API.get("/library?limit=" + LIMIT)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.results).to.be.an("array");
                    expect(body.total_count).to.be.equal(1);
                    next = body.next;
                    previous = body.previous;
                    done();
                });
        });

        it("获取下一页的vod输出列表失败：没有下一页", function(done) {
            API.get("/library?limit=" + LIMIT + "&next=" + next)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(404);
                    done();
                });
        });

        it("获取上一页的vod输出列表失败：没有上一页", function(done) {
            API.get("/library?limit=" + LIMIT + "&previous=" + previous)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(404);
                    done();
                });
        });
    });

    describe("1.3 Update User", function() {
        it("更新成功", function(done) {
            API.put("/user")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    user_id: tenant_account_data.teant_user.user_id,
                    media_type: "VOD",
                    media_id: library_id,
                    delivery_type: 0
                })
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    done();
                });
        });

        it("更新失败：media type无效", function(done) {
            API.put("/user")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    user_id: tenant_account_data.teant_user.user_id,
                    media_type: NOVALID,
                    media_id: library_id,
                    delivery_type: 0
                })
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    done();
                });
        });

        it("更新失败：media id无效", function(done) {
            API.put("/user")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    user_id: tenant_account_data.teant_user.user_id,
                    media_type: "VOD",
                    media_id: NOVALID,
                    delivery_type: 0
                })
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    done();
                });
        });

        it("更新失败：user_id为空", function(done) {
            API.put("/user")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    user_id: "",
                    media_type: "VOD",
                    media_id: library_id,
                    delivery_type: 0
                })
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(404);
                    done();
                });
        });

        it("更新失败：user_id不存在", function(done) {
            API.put("/user")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    user_id: not_exist_id,
                    media_type: "VOD",
                    media_id: library_id,
                    delivery_type: 0
                })
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(404);
                    done();
                });
        });
    });

    describe("1.10 delete Proc profile", function() {
        it("删除失败：profile ID不存在", function(done) {
            API.delete("/profile/" + not_exist_id)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(404);
                    done();
                });
        });

        it("删除失败：profile ID无效", function(done) {
            API.delete("/profile/" + NOVALID)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    done();
                });
        });

        it("删除一个profile", function(done) {
            API.delete("/profile/" + vod_profile_id)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    done();
                });
        });
    });

    describe("1.11 delete Proc profile list", function() {
        it("删除失败：profiles字段为空", function(done) {
            API.delete("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({ profiles: [] })
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    done();
                });
        });

        it("删除失败：profiles字段为非数组", function(done) {
            API.delete("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({ profiles: { live_profile_id } })
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    done();
                });
        });

        it("删除多个profile", function(done) {
            API.delete("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({ profiles: [live_profile_id] })
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    done();
                });
        });
    });

    describe("1.20  Delete VOD output", function() {
        it("删除失败：library_id不存在", function(done) {
            API.delete("/library/" + not_exist_id)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .send({
                    delete_source: false
                })
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(404);
                    done();
                });
        });

        it("删除失败：library_id无效", function(done) {
            API.delete("/library/" + NOVALID)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .send({
                    delete_source: false
                })
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    done();
                });
        });

        it("只删除输出文件", function(done) {
            API.delete("/library/" + library_id)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .send({
                    delete_source: false
                })
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    done();
                });
        });
    });

    describe("1.24  Delete LIVE tube", function() {
        it("删除Live Tube：live tube不存在", function(done) {
            API.delete("/liveTube/" + not_exist_id)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(404);
                    done();
                });
        });

        it("删除Live Tube：live tube id无效", function(done) {
            API.delete("/liveTube/" + NOVALID)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    done();
                });
        });

        it("删除Live Tube", function(done) {
            API.delete("/liveTube/" + live_tube_id)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    done();
                });
        });
    });

    describe("1.6 Delete User", function() {
        it("删除失败：user_id无效", function(done) {
            API.delete("/user/" + NOVALID)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(profile_data.vod_profile)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(404);
                    done();
                });
        });

        it("删除失败：user_id不存在", function(done) {
            API.delete("/user/" + not_exist_id)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(profile_data.vod_profile)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(404);
                    done();
                });
        });
        // hasn't delete by id api
        // it("删除失败：_id无效", function(done) {
        //     API.delete("/user/_id/" + NOVALID)
        //         .set("Authorization", "Bearer " + tenant_admin_token)
        //         .send(profile_data.vod_profile)
        //         .expect(200)
        //         .end(function(err, res) {
        //             if (err) throw err;
        //             let body = JSON.parse(res.text);
        //             console.log(body)
        //             expect(body.status).to.be.false;
        //             expect(body.err.code).to.be.equal(400);
        //             done();
        //         });
        // });

        // it("删除失败：_id不存在", function(done) {
        //     API.delete("/user/_id/" + not_exist_id)
        //         .set("Authorization", "Bearer " + tenant_admin_token)
        //         .send(profile_data.vod_profile)
        //         .expect(200)
        //         .end(function(err, res) {
        //             if (err) throw err;
        //             let body = JSON.parse(res.text);
        //             console.log(body)
        //             expect(body.status).to.be.false;
        //             expect(body.err.code).to.be.equal(400);
        //             done();
        //         });
        // });

        it("通过user_id删除用户", function(done) {
            API.delete("/user/" + tenant_account_data.teant_user.user_id)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(profile_data.vod_profile)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    done();
                });
        });
    });

    describe("1.17  Delete VOD source", function() {
        it("删除失败：vod source_id不存在", function(done) {
            API.delete("/source/" + not_exist_id)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    forceDelete: true
                })
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(404);
                    done();
                });
        });

        it("删除失败：vod source_id无效", function(done) {
            API.delete("/source/" + NOVALID)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    forceDelete: true
                })
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    done();
                });
        });

        it("删除成功：无任何输出", function(done) {
            API.delete("/source/" + source_file_id)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    forceDelete: true
                })
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    done();
                });
        });
    });
});
