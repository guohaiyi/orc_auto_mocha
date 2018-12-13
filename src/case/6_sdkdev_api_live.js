const config = require("../../config");
const common = require("../common/common");
const API = common.api;
const expect = require("chai").expect;
const tenant_data = require("../../data/tenant.json");
const tenant_account_data = require("../../data/tenant_account.json");
const orchestrator_account_data = require("../../data/orchestrator_account.json");
const live_tube_data = require("../../data/live_tube.json");
delete require.cache[require.resolve('../../data/profile.json')];

let end_user_id1 = "";
let end_user_id2 = "";
let end_user_id3 = "";

let live_tube_id = "";
let channel_name = "";

let hls_playback_token = "";
let flv_playback_token = "";
let mp4_playback_token = "";
let flv_url = "";
let hls_url = "";
let hls_url_cdn = "";
let mp4_archvie_url = ""
let mp4_archvie_url_cdn = ""
let hls_archvie_url = "";
let hls_archvie_url_cdn = "";

let stream_hls_playback_url = "";
let archvie_mp4_playback_url = "";

global.tenant_admin_token = "";
global.orchestrator_admin_token = "";

const callfile = require('child_process');
let stream_link = "";
let input_file = "/var/backend/orchestrator_auto_test/source/sample.mp4";
function FFmpeg() {
    callfile.execFile('/var/backend/orchestrator_auto_test/ffmpeg.sh', [input_file, stream_link], null, function (err, stdout, stderr) {
        console.log("Push flow information:")
        console.log(err);
        console.log(stdout);
        console.log(stderr);
    });
};


describe("2.0 SDKDEV_API TEST", function () {
    /*
        afterEach(function(){
            console.log("-+-------------------------------------------------------+-");
        });
    */

    describe("Test precondition", function () {

        it("01 Get the orchestrator_admin token before the update", function (done) {
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

        it("02 Get tenant_admin token", function (done) {
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

        it("03 Create End User1", function (done) {
            API.post("/user")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(tenant_account_data.teant_user01)
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

        it("04 Create End User2", function (done) {
            API.post("/user")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(tenant_account_data.teant_user02)
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

        it("05 Create End User3", function (done) {
            API.post("/user")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(tenant_account_data.teant_user03)
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

        it("06 Get user_id", function (done) {
            this.timeout(5000);
            API.get("/user")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    end_user_id1 = body.results[0].user_id;
                    end_user_id2 = body.results[1].user_id;
                    end_user_id3 = body.results[2].user_id;
                    expect(body.status).to.be.true;
                    setTimeout(done, 4800);
                });
        });

    });

    describe("Auxiliary test: Create a Live", function () {
        it("07 Create Live Tube", function (done) {
            delete require.cache[require.resolve('../../data/live_tube.json')];
            const tube_data = require("../../data/live_tube.json");
            let data = Object.assign({}, tube_data.live_tube);
            data.channel_profile = "live_tube 07"
            this.timeout(18000);
            API.post("/liveTube")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    live_tube_id = body.live_tube_id;
                    expect(body.status).to.be.true;
                    setTimeout(done, 15000);
                });
        });

        it("08 Create Live Channel", function (done) {
            this.timeout(55000);
            API.post("/liveChannel")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "live_tube_id": live_tube_id
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    stream_link = body.inbound_url;
                    if (body.inbound_url) {
                        console.log(stream_link);
                        FFmpeg();
                        expect(err, "if this case test fail,pls check streaming live!").to.be.equal(null);
                    };
                    channel_name = body.channel_name;
                    setTimeout(done, 52000);
                });
        });

    });


    describe("1.3 Generate playback token-Stream", function () {

        it("1 Gnerate Playback token:flvOutput—LIVE", function (done) {
            API.put("/user")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "user_id": end_user_id2,
                    "media_type": "LIVE",
                    "media_id": channel_name,
                    "delivery_type": 1,
                    "delivery_id": 0
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    flv_playback_token = body.playback_token;
                    expect(body.status).to.be.true;
                    done();
                });
        });

        it("2 Gnerate Playback token:hlsOutput—LIVE Stream", function (done) {
            API.put("/user")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "user_id": end_user_id1,
                    "media_type": "LIVE",
                    "media_id": channel_name,
                    "delivery_type": 0,
                    "delivery_id": 0
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    hls_playback_token = body.playback_token;
                    expect(body.status).to.be.true;
                    done()
                });
        });

        // it("3 Gnerate Playback token:mp4Output—LIVE Stream", function (done) {
        //     API.put("/user")
        //         .set("Authorization", "Bearer " + tenant_admin_token)
        //         .send({
        //             "user_id": end_user_id3,
        //             "media_type": "LIVE",
        //             "media_id": channel_name,
        //             "delivery_type": 2,
        //             "delivery_id": 0
        //         })
        //         .expect(200)
        //         .end(function (err, res) {
        //             if (err) throw err;
        //             let body = JSON.parse(res.text);
        //             console.log(body);
        //             mp4_playback_token = body.playback_token;
        //             expect(body.status).to.be.true;
        //             done();
        //         });
        // });

        it("4 Generate Playback token failed: LIVE - no corresponding hls play address", function (done) {
            API.put("/user")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "user_id": end_user_id3,
                    "media_type": "LIVE",
                    "media_id": channel_name,
                    "delivery_type": 0,
                    "delivery_id": 1
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

        it("5 Failed to generate Playback token: LIVE - no corresponding flv play address", function (done) {
            API.put("/user")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "user_id": end_user_id3,
                    "media_type": "LIVE",
                    "media_id": channel_name,
                    "delivery_type": 1,
                    "delivery_id": 1
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

        it("6 Failed to generate Playback token: LIVE - no corresponding mp4 play address", function (done) {
            API.put("/user")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "user_id": end_user_id3,
                    "media_type": "LIVE",
                    "media_id": channel_name,
                    "delivery_type": 2,
                    "delivery_id": 1
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

        it("7 Failed to generate Playback token: user_id does not exist", function (done) {
            API.put("/user")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "user_id": "qa_user",
                    "media_type": "LIVE",
                    "media_id": channel_name,
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

        it("8 Failed to generate Playback token: media_type is invalid", function (done) {
            API.put("/user")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "user_id": end_user_id1,
                    "media_type": "TEST",
                    "media_id": channel_name,
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

        it("9 Failed to generate Playback token: :media id does not exist", function (done) {
            API.put("/user")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "user_id": end_user_id1,
                    "media_type": "LIVE",
                    "media_id": "5b2b1331b02c607285783b7d",
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

        it("10 Failed to generate Playback token: :media id is invalid", function (done) {
            API.put("/user")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "user_id": end_user_id1,
                    "media_type": "LIVE",
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

        it("11 Failed to generate Playback token: :live delivery_type is invalid", function (done) {
            API.put("/user")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "user_id": end_user_id1,
                    "media_type": "LIVE",
                    "media_id": channel_name,
                    "delivery_type": 4,
                    "delivery_id": 0
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

    describe("2.1 Request Playback URL-Stream", function () {

        it("获取live channel的详细信息", function(done){
            API.get("/liveChannel/" + channel_name)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    flv_url = body.playbackURL.flvOutput[0].flvURL
                    hls_url = body.playbackURL.hlsOutput[0].hlsURL
                    hls_url_cdn = body.playbackURL.hlsOutput[0].hlsURL_cdn
                    done();
                });
        });

        it("12 LIVE:Get flv playback URL", function (done) {
            API.post("/playBackUrl")
                .send({
                    "playback_token": flv_playback_token
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    console.log("LIVE flv playback URL:")
                    console.log(body.playback_url)
                    expect(body.status).to.be.true;
                    expect(body.playback_url).to.equal(flv_url);
                    done();
                });
        });

        it("13 LIVE:Get hls_out stream playback URL", function (done) {
            API.post("/playBackUrl")
                .send({
                    "playback_token": hls_playback_token
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    console.log("LIVE hls_Stream playback URL:")
                    console.log(body.playback_url)
                    stream_hls_playback_url = body.playback_url;
                    expect(body.status).to.be.true;
                    expect(body.playback_url).to.equal(hls_url);
                    done();
                });
        });
        /*
                it.skip("检查hls_out stream playback URL是否可以播放", function(done) {
                    API.get(stream_hls_playback_url)
                        .expect(200)
                        .end(function(err, res) {
                            if (err) throw err;
                            let body = JSON.parse(res.text);
                            console.log(body)
                            done();
                        });
                });
        */
        // it("14 LIVE:Get mp4_out stream playback URL", function (done) {
        //     API.post("/playBackUrl")
        //         .send({
        //             "playback_token": mp4_playback_token
        //         })
        //         .expect(200)
        //         .end(function (err, res) {
        //             if (err) throw err;
        //             let body = JSON.parse(res.text);
        //             console.log(body);
        //             console.log("LIVE mp4_Stream playback URL:");
        //             console.log(body.playback_url);
        //             stream_mp4_playback_url = body.playback_url;
        //             expect(body.status).to.be.true;
        //             done();
        //         });
        // });
        /*
                it.skip("检查mp4_out stream playback URL是否可以播放", function(done) {
                    API.get(stream_mp4_playback_url)
                        .expect(200)
                        .end(function(err, res) {
                            if (err) throw err;
                            let body = JSON.parse(res.text);
                            console.log(body)
                            done();
                        });
                });
        */
        // it("15 LIVE acquisition failed: playback_token has been used", function (done) {
        //     API.post("/playBackUrl")
        //         .send({
        //             "playback_token": mp4_playback_token
        //         })
        //         .expect(200)
        //         .end(function (err, res) {
        //             if (err) throw err;
        //             let body = JSON.parse(res.text);
        //             console.log(body);
        //             expect(body.status).to.be.false;
        //             expect(body.err.code).to.be.equal(400);
        //             expect(body.err.message).to.be.equal("playback_token not matching/playback_token already used");
        //             done();
        //         });
        // });

    });

    describe("Auxiliary test:1.30 End LIVE channel", function () {

        it("End Live channel", function (done) {
            this.timeout(10000);
            API.put("/liveChannel/" + channel_name)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    setTimeout(done, 8000);
                });
        });

        it("Get live channel", function (done) {
            this.timeout(10000)
            API.get("/liveChannel/" + channel_name)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    mp4_archvie_url = body.playbackURL.mp4Output[0].mp4URL
                    mp4_archvie_url_cdn = body.playbackURL.mp4Output[0].mp4URL_cdn
                    hls_archvie_url = body.playbackURL.hlsOutput[1].hlsURL
                    hls_archvie_url_cdn = body.playbackURL.hlsOutput[1].hlsURL_cdn
                    expect(body.status).to.be.true;
                    setTimeout(done, 8000)
                });
        });
    });

    describe("1.3 Generate playback token-Archive", function () {

        it("16 Generate Playback token:hlsOutput—LIVE Archeive", function (done) {
            API.put("/user")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "user_id": end_user_id1,
                    "media_type": "LIVE",
                    "media_id": channel_name,
                    "delivery_type": 0,
                    "delivery_id": 1
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    hls_playback_token = body.playback_token;
                    expect(body.status).to.be.true;
                    done();
                });
        });

        it("17 Generate Playback token:mp4Output—LIVE Archeive", function (done) {
            API.put("/user")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "user_id": end_user_id2,
                    "media_type": "LIVE",
                    "media_id": channel_name,
                    "delivery_type": 2,
                    "delivery_id": 0
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    mp4_playback_token = body.playback_token;
                    expect(body.status).to.be.true;
                    done();
                });
        });
    });

    describe("2.1 Request Playback URL-Archive", function () {

        it("test16 LIVE:Get hls_out archive playback URL", function (done) {
            API.post("/playBackUrl")
                .send({
                    "playback_token": hls_playback_token
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    console.log("LIVE hls_Archive playback URL:")
                    console.log(body.playback_url);
                    archive_hls_playback_url = body.playback_url;
                    expect(body.status).to.be.true;
                    expect(body.playback_url).to.equal(hls_archvie_url);
                    done();
                });
        });
        /*
                it.skip("检查hls_out archive playback URL是否可以播放", function(done) {
                    API.get(archive_hls_playback_url)
                        .expect(200)
                        .end(function(err, res) {
                            if (err) throw err;
                            let body = JSON.parse(res.text);
                            console.log(body)
                            done();
                        });
                });
        */
        it("test17 LIVE:Get mp4_out archive playback URL", function (done) {
            API.post("/playBackUrl")
                .send({
                    "playback_token": mp4_playback_token
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    console.log("LIVE mp4_Archive playback URL:")
                    console.log(body.playback_url);
                    archvie_mp4_playback_url = body.playback_url;
                    expect(body.status).to.be.true;
                    expect(body.playback_url).to.equal(mp4_archvie_url);
                    done();
                });
        });
        /*
                it.skip("检查hls_out archive playback URL是否可以播放", function(done) {
                    API.get(archvie_mp4_playback_url)
                        .expect(200)
                        .end(function(err, res) {
                            if (err) throw err;
                            let body = JSON.parse(res.text);
                            console.log(body)
                            done();
                        });
                });
        */
    });
});