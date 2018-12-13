const config = require("../../config");
const common = require("../common/common");
const API = common.api;
const expect = require("chai").expect;
const tenant_data = require("../../data/tenant.json");
const tenant_account_data = require("../../data/tenant_account.json");
const orchestrator_account_data = require("../../data/orchestrator_account.json");
delete require.cache[require.resolve('../../data/profile.json')];
const videopath = config.source.video

let hls_library_id = "";
let mp4_library_id = "";
let library_id = "";
let end_user_id1 = "";
let end_user_id2 = "";
let source_file_id = "";
let hls_playback_token = "";
let mp4_playback_token = "";
let library_id_v = "";
let hls_url_v = "";
let hls_url_v_cdn = "";
let hls_url_v1 = "";
let hls_url_v1_cdn = "";
let hls_url_1 = "";
let hls_url_1_cdn = "";
let mp4_url_1 = "";
let mp4_url_1_cdn = "";
let hls_playback_token_default = ""

let hls_playback_token_1 = "";
let hls_playback_token_2 = "";
let hls_cdn_url = "http://172.16.1.215:9225/vod/"
let hls_url = "http://172.16.1.215:8033/origin/vod/"
//let vodhls_playback_url = "";
//let vodmp4_playback_url = "";

global.tenant_admin_token = "";
global.orchestrator_admin_token = "";


describe("2.0 SDKDEV_API TEST", function () {
    /*
        afterEach(function(){
            console.log("-+-------------------------------------------------------+-");
        });
    */

    describe("Test preconditions", function () {

        it("Get the orchestrator_admin token before the update", function (done) {
            API.post("/orchestrator_admin/login")
                .send(orchestrator_account_data.orc_admin)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    if (body.status == false) {
                        console.log(body);
                    };
                    expect(body.status).to.be.true;
                    expect(body.username).to.equal("orc_admin")
                    orchestrator_admin_token = body.orchestrator_admin_token
                    done();
                });
        });

        it("Get tenant_admin token", function (done) {
            API.post("/tenant_admin/login")
                .send(tenant_account_data.tenant_admin)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    if (body.status == false) {
                        console.log(body);
                    };
                    expect(body.status).to.be.true;
                    expect(body.username).to.equal("autotest");
                    tenant_admin_token = body.tenant_admin_token;
                    done();
                });
        });

        it("Create End User1", function (done) {
            API.post("/user")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(tenant_account_data.teant_user04)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    if (body.status == false) {
                        console.log(body);
                    };
                    expect(body.status).to.be.true;
                    done();
                });
        });

        it("Create End User2", function (done) {
            API.post("/user")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(tenant_account_data.teant_user05)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    if (body.status == false) {
                        console.log(body);
                    };
                    expect(body.status).to.be.true;
                    done();
                });
        });

        it("Create End User3", function (done) {
            API.post("/user")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(tenant_account_data.teant_user06)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    if (body.status == false) {
                        console.log(body);
                    };
                    expect(body.status).to.be.true;
                    done();
                });
        });

        it("Create End User4", function (done) {
            API.post("/user")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(tenant_account_data.teant_user07)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    if (body.status == false) {
                        console.log(body);
                    };
                    expect(body.status).to.be.true;
                    done();
                });
        });

        it("Get user_id", function (done) {
            API.get("/user")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    if (body.status == false) {
                        console.log(body);
                    };
                    expect(body.status).to.be.true;
                    end_user_id1 = body.results[0].user_id;
                    end_user_id2 = body.results[1].user_id;
                    end_user_id3 = body.results[2].user_id;
                    end_user_id4 = body.results[3].user_id;
                    done();
                });
        });

    });

    describe("Auxiliary test:Get library_id", function () {
        it("A1 Get Source file ID", function (done) {
            API.get("/source/id")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    source_file_id = body.source_file_id;
                    done();
                });
        });

        it("A2 Upload source file", function (done) {
            this.timeout(6000);
            setTimeout(function () {
                API.post("/library/upload")
                    .set("Authorization", "Bearer " + tenant_admin_token)
                    .field("type", "video")
                    .field("source_file_id", source_file_id)
                    .attach("file", videopath.mp4, "sample.mp4")
                    .expect(200)
                    .end(function (err, res) {
                        if (err) throw err;
                        let body = JSON.parse(res.text);
                        console.log(body);
                        expect(body.status).to.be.true;
                        done();
                    });
            }, 5000);
        });

        it("A3 Default profile, output only HLS type", function (done) {
            this.timeout(50000);
            API.post("/library/encode")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "source_file_id": source_file_id,
                    "out_type": {
                        "hls_out": 1,
                        "mp4_out": false
                    }
                }
                )
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    hls_library_id = body.library[0];
                    setTimeout(done, 46000);
                });
        });

        it("A4 Default profile, output only MP4 type", function (done) {
            this.timeout(50000);
            API.post("/library/encode")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "source_file_id": source_file_id,
                    "out_type": {
                        "hls_out": 0,
                        "mp4_out": true
                    }
                }
                )
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    mp4_library_id = body.library[0];
                    setTimeout(done, 46000);
                });
        });

        it("A5 Default profile, output MP4 and hls type", function (done) {
            this.timeout(60000);
            API.post("/library/encode")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "source_file_id": source_file_id,
                    "out_type": {
                        "hls_out": 1,
                        "mp4_out": true
                    }
                }
                )
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    library_id = body.library[0];
                    setTimeout(done, 58000);
                });
        });

        // 新增H265 Profile output
        it("A6 Output HLS and MP4 types: Control the hls version via the hls_out array", function (done) {
            this.timeout(60000);
            API.post("/library/encode")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "source_file_id": source_file_id,
                    "out_type": {
                        "hls_out": [
                            {
                                "legacy_hls_support": false
                            },
                            {
                                "legacy_hls_support": true
                            }
                        ],
                        "mp4_out": true
                    }
                }
                )
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    library_id_v = body.library[0];
                    setTimeout(done, 58000);
                });
        });
    });

    describe("1.3 Generate playback token", function () {
        it("Get vod 1 output 的详细信息", function(done){
            API.get("/library/" + library_id)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    hls_url_1 = body.playbackURL.hlsOutput.hlsURL
                    hls_url_1_cdn = body.playbackURL.hlsOutput.hlsURL_cdn
                    mp4_url_1 = body.playbackURL.mp4Output.mp4URL
                    mp4_url_1_cdn = body.playbackURL.mp4Output.mp4URL_cdn
                    expect(body.status).to.be.true;
                    done();
                });
        });

        it("Get vod v output 的详细信息", function(done){
            API.get("/library/" + library_id_v)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    hls_url_v = body.playbackURL.hlsOutput[0].hlsURL
                    hls_url_v_cdn = body.playbackURL.hlsOutput[0].hlsURL_cdn
                    hls_url_v1 = body.playbackURL.hlsOutput[1].hlsURL
                    hls_url_v1_cdn = body.playbackURL.hlsOutput[1].hlsURL_cdn
                    expect(body.status).to.be.true;
                    done();
                });
        });

        it("1 Generate Playback token:VOD—hlsOutput", function (done) {
            API.put("/user")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "user_id": end_user_id1,
                    "media_type": "VOD",
                    "media_id": library_id,
                    "delivery_type": 0,
                    "delivery_id": 0
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    hls_playback_token = body.playback_token;
                    done();
                });
        });

        // 新增1-1、1-2

        it("1-1 Generate Playback token: hlsOutput—VOD", function (done) {
            API.put("/user")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "user_id": end_user_id2,
                    "media_type": "VOD",
                    "media_id": library_id_v,
                    "delivery_type": 0,
                    "delivery_id": 0
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    hls_playback_token_1 = body.playback_token;
                    done();
                });
        });

        it("1-2 Generate Playback token: hlsOutput—VOD (hls_output has two sets of data),Second group", function (done) {
            API.put("/user")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "user_id": end_user_id3,
                    "media_type": "VOD",
                    "media_id": library_id_v,
                    "delivery_type": 0,
                    "delivery_id": 1
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    hls_playback_token_2 = body.playback_token;
                    done();
                });
        });

        it("2 Generate Playback token:VOD—mp4Output", function (done) {
            API.put("/user")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "user_id": end_user_id4,
                    "media_type": "VOD",
                    "media_id": library_id,
                    "delivery_type": 1
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    mp4_playback_token = body.playback_token;
                    done();
                });
        });

        it("3 Generate Playback token: VOD - no corresponding hls play address", function (done) {
            API.put("/user")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "user_id": end_user_id1,
                    "media_type": "VOD",
                    "media_id": mp4_library_id,
                    "delivery_type": 0,
                    "delivery_id": 0
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(404);
                    expect(body.err.message).to.be.equal("Media playback not found");
                    done();
                });
        });

        it("4 Generate Playback token: VOD - no corresponding mp4 play address", function (done) {
            API.put("/user")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "user_id": end_user_id1,
                    "media_type": "VOD",
                    "media_id": hls_library_id,
                    "delivery_type": 1
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(404);
                    expect(body.err.message).to.be.equal("Media playback not found");
                    done();
                });
        });

        it("5 Failed to generate Playback token: user_id does not exist", function (done) {
            API.put("/user")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "user_id": "not_user",
                    "media_type": "VOD",
                    "media_id": library_id,
                    "delivery_type": 0,
                    "delivery_id": 0
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(404);
                    expect(body.err.message).to.be.equal("user_id doesn't exist");
                    done();
                });
        });

        it("6 Failed to generate Playback token: media_type is invalid", function (done) {
            API.put("/user")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "user_id": end_user_id1,
                    "media_type": "TEST",
                    "media_id": library_id,
                    "delivery_type": 0,
                    "delivery_id": 0
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    expect(body.err.message).to.be.equal("Media type Invalid");
                    done();
                });
        });

        it("7 Failed to generate Playback token: :media id does not exist", function (done) {
            API.put("/user")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "user_id": end_user_id1,
                    "media_type": "VOD",
                    "media_id": "5b2b102cb02c60728578337d",
                    "delivery_type": 0,
                    "delivery_id": 0
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(404);
                    expect(body.err.message).to.be.equal("Media doesn't exist");
                    done();
                });
        });

        it("8 Failed to generate Playback token: :media id is invalid", function (done) {
            API.put("/user")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "user_id": end_user_id1,
                    "media_type": "VOD",
                    "media_id": "abcde",
                    "delivery_type": 0,
                    "delivery_id": 0
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    expect(body.err.message).to.be.equal("Media Id Invalid");
                    done();
                });
        });

        it("9 Failed to generate Playback token: :vod delivery_type is invalid", function (done) {
            API.put("/user")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "user_id": end_user_id1,
                    "media_type": "VOD",
                    "media_id": library_id,
                    "delivery_type": 3
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    expect(body.err.message).to.be.equal("Delivery type Invalid");
                    done();
                });
        });
    });

    describe("2.1 Request Playback URL", function () {
        it("10 VOD:Get hls playback URL", function (done) {
            API.post("/playBackUrl")
                .send({
                    "playback_token": hls_playback_token
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    console.log("VOD hls playback URL:");
                    console.log(body.playback_url);
                    expect(body.status).to.be.true;
                    expect(body.playback_url).to.equal(hls_url_1)
                    done();
                });
        });

        //新增获取1-1、1-2、1-3的playback token
        it("1-2 VOD: Get the first set of hls playback URLs", function (done) {
            API.post("/playBackUrl")
                .send({
                    "playback_token": hls_playback_token_1
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    console.log("VOD hls playback URL:");
                    console.log(body.playback_url);
                    expect(body.playback_url).to.equal(hls_url_v);
                    //expect(body.playback_url).to.equal(hls_url + tenant_account_data.tenant_admin.username + library_id_v + "_demovod480" + "/hls0/index.m3u8")
                    //expect(body.playback_url).to.equal(hls_cdn_url + library_id_v + "_demovod480" + "/default/hls/0/index.m3u8")
                    done();
                });
        });

        it("1-3 VOD: Get the second set of hls playback URL", function (done) {
            API.post("/playBackUrl")
                .send({
                    "playback_token": hls_playback_token_2
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    console.log("VOD hls playback URL:");
                    console.log(body.playback_url);
                    expect(body.playback_url).to.equal(hls_url_v1);
                    //expect(body.playback_url).to.equal(hls_url + tenant_account_data.tenant_admin.username + library_id_v + "_demovod480" + "/hls1/index.m3u8")
                    //expect(body.playback_url).to.equal(hls_cdn_url + library_id_v + "_demovod480" + "/default/hls/1/index.m3u8")
                    done();
                });
        });

        it("Generate Playback token: hlsOutput—VOD (delivery_id default=0)", function (done) {
            API.put("/user")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "user_id": end_user_id2,
                    "media_type": "VOD",
                    "media_id": library_id_v,
                    "delivery_type": 0
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    hls_playback_token_default = body.playback_token;
                    done();
                });
        });

        it("VOD: Get the first set of hls playback URLs", function (done) {
            API.post("/playBackUrl")
                .send({
                    "playback_token": hls_playback_token_default
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    console.log("VOD hls playback URL:");
                    console.log(body.playback_url);
                    expect(body.playback_url).to.equal(hls_url_v);
                    //expect(body.playback_url).to.equal(hls_url + tenant_account_data.tenant_admin.username + library_id_v + "_demovod480" + "/hls0/index.m3u8")
                    //expect(body.playback_url).to.equal(hls_cdn_url + library_id_v + "_demovod480" + "/default/hls/0/index.m3u8")
                    done();
                });
        });

        it("11 VOD:Get mp4 playback URL", function (done) {
            API.post("/playBackUrl")
                .send({
                    "playback_token": mp4_playback_token
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    //vodmp4_playback_url = body.playback_url;
                    console.log("VOD mp4 playback URL:");
                    console.log(body.playback_url);
                    expect(body.status).to.be.true;
                    expect(body.playback_url).to.equal(mp4_url_1)
                    done();
                });
        });

        it("12 VOD acquisition failed: playback_token has been used", function (done) {
            API.post("/playBackUrl")
                .send({
                    "playback_token": mp4_playback_token
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    expect(body.err.message).to.be.equal("playback_token not matching/playback_token already used");
                    done();
                });
        });

    });
});