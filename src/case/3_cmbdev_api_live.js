const config = require("../../config");
const common = require("../common/common");
const API = common.api;
const expect = require("chai").expect;
const tenant_account_data = require("../../data/tenant_account.json");
const tenant_data = require("../../data/tenant.json");
const orchestrator_account_data = require("../../data/orchestrator_account.json");
delete require.cache[require.resolve('../../data/profile.json')];
const profile_data = require("../../data/profile.json");
const imagepath = config.source.image;
const videopath = config.source.video;
const LIMIT = config.sql_limit;
let tenant_admin_id = "";
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
let live_channel_id_auto

let live_channel_id_noarchive
let live_tube_id_noarchive

let tube1
let tube2

let live_channel_id_st
let live_channel_id_st2
let live_tube_id_st

let user_total_count = 0;
let profile_total_count = 0;
let vod_source_total_count = 0;
let live_tube_total_count = 1;
let live_channel_total_count = 0;
let live_channel_total_count_end = 0

let live_channel_id_image

let tenant_db_id_no_auto
let tenant_admin_token_no_auto
let live_profile_id_notuse

let live_tube_id_1 = "";
let live_channel_name_1 = "";
let thumbnail_2 = "";
let facialdetect_2 = "";
let live_profile_id_h265 = "";
let live_tube_id_h265 = "";
let channel_name_h265 = ""

let tube_next
let tube_previous
let tube_s1
let tube_s2

let live_profile_id_multiple_bitrate = ""
let no_transcode_live_profile_id = ""
let live_tube_id_no_transcode = "";
let channel_name_no_transcode = "";
let live_tube_id_multiple_bitrate = "";
let channel_name_multiple_bitrate = "";

let live_tube_id_default_set = "";
let live_tube_id_bitrate_arcAndStr = ""
let channel_name_bitrate_arcAndStr = ""
let channel_name_bitrate_archive = ""
let live_tube_id_bitrate_archive = ""

global.orchestrator_admin_token_1 = "";
global.tenant_admin_token = "";

let fs = require('fs');

const callfile = require('child_process');
let stream_link
let input_file = "/var/backend/orchestrator_auto_test/source/sample.mp4"
function FFmpeg() {
    callfile.execFile('/var/backend/orchestrator_auto_test/ffmpeg.sh', [input_file, stream_link], null, function (err, stdout, stderr) {
        // callback(err, stdout, stderr);
        // if(err){
        //     throw err;
        // }
        console.log("Push flow information:");
        console.log(err);
        console.log(stdout);
        console.log(stderr);
    });
}

//用于测试90s删除图片的测试
let stream_link_1
let input_file_1 = "/var/backend/orchestrator_auto_test/source/test.mp4"
function FFmpeg_1() {
    callfile.execFile('/var/backend/orchestrator_auto_test/ffmpeg.sh', [input_file_1, stream_link_1], null, function (err, stdout, stderr) {
        // callback(err, stdout, stderr);
        // if(err){
        //     throw err;
        // }
        console.log("Push flow information:")
        console.log(err);
        console.log(stdout);
        console.log(stderr);
    });
}


describe("CMBDEV_API TEST live", function () {

    /*
        afterEach(function(){
            console.log("-+-------------------------------------------------------+-");
        });
    */

    describe("1.1 Login Tenant Admin", function () {
        it("tenant admin login success", function (done) {
            API.post("/tenant_admin/login")
                .send(tenant_account_data.tenant_admin)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    tenant_admin_token = body.tenant_admin_token;
                    tenant_admin_id = body._id;
                    done();
                });
        });
    })

    describe("Create Live Profile", function () {
        it("create Live profile", function (done) {
            this.timeout(10000);
            setTimeout(function () {
                API.post("/profile")
                    .set("Authorization", "Bearer " + tenant_admin_token)
                    .send(profile_data.live_profile)
                    .expect(200)
                    .end(function (err, res) {
                        if (err) throw err;
                        let body = JSON.parse(res.text);
                        console.log(body);
                        expect(body.status).to.be.true;
                        live_profile_id = body.proc_profile_id;
                        done();
                    });
            }, 8000);
        });
    });

    describe("1.22 Create and run LIVE tube", function () {

        it("create Live Profile : isuse = false", function (done) {
            delete require.cache[require.resolve('../../data/profile.json')];
            const profile_data = require("../../data/profile.json")
            let data = Object.assign({}, profile_data.live_profile);
            data.profile_name = "notuse";
            data.is_use = false;
            API.post("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    live_profile_id_notuse = body.proc_profile_id;
                    done();
                });
        });
        it("156 create RTMP live tube", function (done) {
            this.timeout(10000);
            API.post("/liveTube")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "source_type": "RTMP",
                    "channel_profile": "auto test live tube",
                    "proc_profile_id": live_profile_id,
                    "out_type":
                    {
                        "hls_out": [
                            {
                                "isVod": false,
                                "legacy_hls_support": true
                            },
                            {
                                "isVod": true,
                                "legacy_hls_support": true
                            }
                        ],
                        "rtmp_out": 1,
                        "dash_out": 1,
                        "mp4_out": [
                            {
                                "isVod": true
                            }
                        ]
                    },
                    "autorestart": false
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.body)
                    expect(res.body.status).to.be.true;
                    expect(res.body.live_tube_id).to.be.a('string');
                    expect(res.body.port).to.be.a('number');
                    live_tube_total_count++;
                    live_tube_id_st = res.body.live_tube_id;
                    setTimeout(done, 8000);
                });
        });
        it("166 create liv tube fail : Process Profile doesn't exist/not enabled", function (done) {
            this.timeout(5000)
            API.post("/liveTube")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    source_type: "RTMP",
                    channel_profile: "RTMP xx",
                    proc_profile_id: live_profile_id_notuse,
                    out_type:
                    {
                        "hls_out": [
                            {
                                "isVod": false,
                                "legacy_hls_support": true
                            },
                            {
                                "isVod": true,
                                "legacy_hls_support": true
                            }
                        ],
                        "rtmp_out": 1,
                        "mp4_out": [
                            {
                                "isVod": false
                            },
                            {
                                "isVod": true
                            }
                        ]
                    },
                    autorestart: false
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.body)
                    expect(res.body.status).to.be.false;
                    expect(res.body.err.code).to.be.equal(404)
                    expect(res.body.err.message).to.be.equal("Process Profile doesn't exist/not enabled")
                    done()
                })
        })
        /**
        it("使用创建的默认profile,创建并运行Tube:RTSP", function(done) {
            API.post("/liveTube")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    source_type: "RTSP",
                    proc_profile_id: live_profile_id
                })
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    live_tube_total_count++;
                    // live_tube_id = body.liveTube_id;
                    done();
                });
        });
        **/
        it("165 Create and Run LIVE TS tube fail: Source URL is needed for TSoHTTP", function (done) {
            API.post("/liveTube")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    source_type: "TSoHTTP",
                    channel_profile: "RTMP xx",
                    proc_profile_id: live_profile_id,
                    out_type:
                    {
                        "hls_out": [
                            {
                                "isVod": false,
                                "legacy_hls_support": true
                            }
                        ],
                        "rtmp_out": 1,
                        "mp4_out": [
                            {
                                "isVod": false
                            }
                        ]
                    },
                    autorestart: false
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    expect(res.body.status).to.be.false;
                    expect(res.body.err.code).to.be.equal(400);
                    expect(res.body.err.message).to.be.equal('Source URL is needed for TSoHTTP');
                    done();
                });
        });
        it("164-2 Failed to create TS Tube: proc_profile does not exist, Process Profile doesn't exist/not enabled", function (done) {
            API.post("/liveTube")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    source_type: "TSoHTTP",
                    channel_profile: "RTMP xx",
                    ts_url: config.ts_url,
                    proc_profile_id: not_exist_id,
                    "autorestart": false,
                    "out_type":
                    {
                        "hls_out": [
                            {
                                "isVod": false,
                                "legacy_hls_support": true
                            }
                        ],
                        "rtmp_out": 1,
                        "mp4_out": [
                            {
                                "isVod": false
                            }
                        ]
                    }
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(404);
                    expect(body.err.message).to.be.equal('Process Profile doesn\'t exist/not enabled');
                    done();
                });
        });
        it("168 Creation failed:Source type is invalid", function (done) {
            API.post("/liveTube")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    source_type: "RATSP",
                    channel_profile: "RTMP 3",
                    proc_profile_id: live_profile_id,
                    "autorestart": false,
                    "out_type":
                    {
                        "hls_out": [
                            {
                                "isVod": false,
                                "legacy_hls_support": true
                            }
                        ],
                        "rtmp_out": 1,
                        "mp4_out": [
                            {
                                "isVod": false
                            }
                        ]
                    }
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    expect(body.err.message).to.be.equal("Source type is invalid")
                    done();
                });
        });
        it("Creation failed:Source_type parameter is missing", function (done) {
            API.post("/liveTube")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    channel_profile: "RTMP xx",
                    proc_profile_id: live_profile_id,
                    "autorestart": false,
                    "out_type":
                    {
                        "hls_out": [
                            {
                                "isVod": false,
                                "legacy_hls_support": true
                            }
                        ],
                        "rtmp_out": 1,
                        "mp4_out": [
                            {
                                "isVod": false
                            }
                        ]
                    }
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    expect(body.err.message).to.be.equal("Source type is needed")
                    done();
                });
        })
        it("171-2 create liv tube fail : Channel Profile already exists.", function (done) {
            API.post("/liveTube")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    source_type: "RTMP",
                    channel_profile: "auto test live tube",
                    proc_profile_id: live_profile_id,
                    out_type:
                    {
                        "hls_out": [
                            {
                                "isVod": false,
                                "legacy_hls_support": true
                            },
                            {
                                "isVod": true,
                                "legacy_hls_support": true
                            }
                        ],
                        "rtmp_out": 1,
                        "mp4_out": [
                            {
                                "isVod": true
                            }
                        ]
                    },
                    autorestart: false
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log("当前运行的脚本位置是：" + __filename + "的第" + __line + "行 ： ");
                    console.log(res.body)
                    expect(res.body.status).to.be.false;
                    expect(res.body.err.code).to.be.equal(400)
                    expect(res.body.err.message).to.be.equal("Channel Profile already exists")
                    done()
                });
        });

        it("delete live profile : is use = false", function (done) {
            API.delete("/profile/" + live_profile_id_notuse)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    done();
                })
        })
    });

    describe("1.25 List LIVE tube", function () {
        let next;
        let previous;
        let next_error;
        let previous_error;

        before("Get a list of Live Tubes", function (done) {
            API.get("/liveTube")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body)
                    expect(body.results).to.be.an("array");
                    expect(body.total_count).to.be.equal(live_tube_total_count);
                    expect(body.results[0]._id).to.be.equal(live_tube_id_st)
                    tube1 = body.results[0]._id
                    tube2 = body.results[1]._id
                    console.log("tube list:")
                    console.log(tube1)
                    console.log(tube2)
                    next_error = body.next;
                    previous_error = body.previous;
                    done();
                });
        })
        it("Get Live Tube List: Custom Return Quantity", function (done) {
            API.get("/liveTube?limit=" + 1)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.results).to.be.an("array");
                    expect(body.results.length).to.be.equal(1);
                    expect(body.total_count).to.be.equal(live_tube_total_count);
                    expect(body.results[0]._id).to.be.equal(tube1)
                    next = body.next;
                    done();
                });
        })
        it("Get the next page of Live Tube list", function (done) {
            API.get("/liveTube?limit=" + 1 + "&next=" + next)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.results).to.be.an("array");
                    expect(body.total_count).to.be.equal(live_tube_total_count);
                    expect(body.results[0]._id).to.be.equal(tube2)
                    previous = body.previous;
                    done();
                });
        })
        it("Get the previous Live Tube list", function (done) {
            API.get("/liveTube?limit=" + 1 + "&previous=" + previous)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.results).to.be.an("array");
                    expect(body.total_count).to.be.equal(live_tube_total_count);
                    expect(body.results[0]._id).to.be.equal(tube1)
                    done();
                });
        })
        it("Getting the next page Live Tube list failed: no next page", function (done) {
            API.get("/liveTube?next=" + next_error)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(404);
                    expect(body.err.message).to.be.equal('No records exist')
                    done();
                });
        })
        it("Failed to get the previous Live Tube list: no previous page", function (done) {
            API.get("/liveTube?previous=" + previous_error)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(404);
                    expect(body.err.message).to.be.equal('No records exist')
                    done();
                });
        })
    });

    describe("1.23 Read LIVE tube", function () {
        it("Read LIVE tube success", function (done) {
            API.get("/liveTube/" + live_tube_id_st)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.body)
                    expect(res.body).to.have.all.keys("_id", "source_type", "profile", "created_time", "channel_profile",
                        "owner", "port", "autorestart", "is_default","enableAdInsert", "channel_archiving", "out_type", "transcode_status", "kernel", "kernel_status",
                        "updated", "status");
                    expect(res.body.profile).to.have.all.keys("profile_name", "is_video_out", "is_audio_out", "is_transcode", "transcode_video_info", "transcode_audio_info", "is_thumbnail_out",
                        "is_facialDetect_out", "profile_id")
                    expect(res.body.status).to.be.equal(true)
                    expect(res.body).to.be.an("object");
                    expect(res.body._id).to.be.equal(live_tube_id_st);
                    expect(res.body.source_type).to.be.equal('RTMP');
                    expect(res.body.autorestart).to.be.equal(false);
                    expect(res.body.channel_profile).to.be.equal("auto test live tube");
                    expect(res.body.out_type.dash_out).to.be.equal(1);
                    done();
                });
        });
        it("Read LIVE tube success: defaul tube,autorestart", function (done) {
            API.get("/liveTube/" + tube2)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log("当前运行的脚本位置是：" + __filename + "的第" + __line + "行 ： ");
                    console.log(res.body)
                    // expect(res.body).to.have.all.keys("_id","source_type","profile","created_time",
                    //                                 "owner","port","status","autorestart","channel_archiving","is_default",
                    //                                 "out_type","transcode_status","kernel","updated","kernel_status");
                    // expect(res.body.profile).to.have.all.keys("profile_name","is_video_out","is_audio_out","is_transcode", 
                    //                                 "is_thumbnail_out","is_facialDetect_out","profile_id")
                    // expect(res.body.profile).to.have.all.keys("profile_id","profile_name")
                    expect(res.body.status).to.be.equal(true)
                    expect(res.body).to.be.an("object");
                    expect(res.body.source_type).to.be.equal('RTMP');
                    expect(res.body.autorestart).to.be.equal(true);
                    done();
                });
        });
        it("Read LIVE tube fail: No records exist", function (done) {
            API.get("/liveTube/" + not_exist_id)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(404);
                    expect(body.err.message).to.be.equal("No records exist")
                    done();
                });
        });
        it("Read LIVE tube fail: Id invalid", function (done) {
            API.get("/liveTube/" + NOVALID)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    expect(body.err.message).to.be.equal("Id invalid")
                    done();
                });
        });
    });

    describe("1.26 Create LIVE channel", function () {
        let live_tube_id_default
        let live_tube_id_zd
        let live_tube_id_zd1
        let live_tube_id_zd2
        let live_tube_id_zd3
        let live_tube_id_zd4
        let live_channel_id_same1
        let live_channel_id_same2
        let live_profile_id_no
        /*
        // before("get orchestrator_admin token", function(done) {
        //     API.post("/orchestrator_admin/login")
        //         .send({
		// 			username:"orc_admin",
		// 			password:"orc_admin"
        //         })
        //         .expect(200)
        //         .end(function(err, res) {
        //             if (err) throw err;
        //             let body = JSON.parse(res.text);
		// 			expect(body.username).to.equal("orc_admin")
		// 			orchestrator_admin_token = body.orchestrator_admin_token
        //             done()
        //         })
        // })
        // before("create DB : no autorestart", function(done) {
        //     API.post("/tenant")
        //     .set("Authorization", "Bearer " + orchestrator_admin_token)
        //     .send(tenant_account_data.teant_DB_no_auto)
        //     .expect(200)
        //     .end(function(err, res) {
        //         if (err) throw err;
        //         let body = JSON.parse(res.text)
        //         console.log(body)
        //         expect(body.status).to.be.true
        //         done()
        //     })
        // })
        // before("create admin : no auto restart", function(done) {
        //     API.post("/tenant_admin")
        //         .set("Authorization", "Bearer " + orchestrator_admin_token)
        //         .send(tenant_account_data.tenant_admin_no_auto)
        //         .expect(200)
        //         .end(function(err, res) {
        //             if (err) throw err;
        //             let body = JSON.parse(res.text);
		// 			console.log(body)
        //             expect(body.status).to.be.true;
        //             done();
        //         });
        // });
        // before("login admin success : no autorestart", function(done) {
        //     API.post("/tenant_admin/login")
        //         .send(tenant_account_data.tenant_admin_no_auto)
        //         .expect(200)
        //         .end(function(err, res) {
        //             if (err) throw err;
        //             let body = JSON.parse(res.text);
        //             expect(body.status).to.be.true;
        //             tenant_admin_token_no_auto = body.tenant_admin_token;
        //             done();
        //         });
        // })
        // before("create Live profile", function(done) {
        //     delete require.cache[require.resolve('../../data/profile.json')];  
        //     const pro_data = require("../../data/profile.json");
        //     let data = Object.assign({}, pro_data.live_profile);
        //         data.profile_name="profileliveno"	
		// 	this.timeout(10000);
		// 	setTimeout(function() {
		// 		API.post("/profile")
		// 			.set("Authorization", "Bearer " + tenant_admin_token_no_auto)
        //             .send(data)
		// 			.expect(200)
		// 			.end(function(err, res) {
		// 				if (err) throw err;
        //                 let body = JSON.parse(res.text);
        //                 console.log("当前运行的脚本位置是："+__filename+"的第"+__line+"行 ： ");
		// 			    console.log(body);
		// 				expect(body.status).to.be.true;
		// 				live_profile_id_no = body.proc_profile_id;
		// 				done();
		// 			});
		// 	},8000);
        // });
        // before("get live tube list", function(done) {
        //     API.get("/liveTube")
        //         .set("Authorization", "Bearer " + tenant_admin_token_no_auto)
        //         .expect(200)
        //         .end(function(err, res) {
        //             if (err) throw err;
        //             let body = JSON.parse(res.text);
		// 			console.log(body)
        //             expect(body.status).to.be.equal(false)
        //             expect(body.err.code).to.be.equal(404)
        //             expect(body.err.message).to.be.equal('No records exist')
        //             done()
        //         })
        // })
        // it("create Live Channel fail : No autorestart LiveTube available", function(done) {	
        //     API.post("/liveChannel")
        //         .set("Authorization", "Bearer " + tenant_admin_token_no_auto)
        //         .send({

        //         })
        //         .expect(200)
        //         .end(function(err, res) {
        //             if (err) throw err;
        //             console.log(res.body)
        //             expect(res.body.status).to.be.equal(false)
        //             expect(res.body.err.code).to.be.equal(404)
        //             expect(res.body.err.message).to.be.equal('LiveTube not found/No default LiveTube available')
        //             done()
        //         })		
        // })

        // it("create autorestart live tube manual success : in no auto DB", function(done) {
        //     this.timeout(30000)
        //     API.post("/liveTube")
        //         .set("Authorization", "Bearer " + tenant_admin_token_no_auto)
        //         .send({
        //             source_type: "RTMP",
        //             autorestart:true,
        //             channel_profile: "create autorestart live tube"
        //         })
        //         .expect(200)
        //         .end(function(err, res) {
        //             if (err) throw err;
		// 			console.log(res.body)
        //             expect(res.body.status).to.be.true;
        //             expect(res.body.live_tube_id).to.be.a('string')
        //             expect(res.body.port).to.be.a('number')
        //             live_tube_id_default=res.body.live_tube_id
        //             setTimeout(done, 8000)
        //         })
        // })
        // it("Read LIVE tube : use default out type,default profile : it should be 2 hls out,1 rtmp out,1 mp4 out : in no auto DB", function(done) {
        //     API.get("/liveTube/" + live_tube_id_default)
        //         .set("Authorization", "Bearer " + tenant_admin_token_no_auto)
        //         .expect(200)
        //         .end(function(err, res) {
        //             if (err) throw err;
        //             console.log(res.body)
        //             expect(res.body.status).to.be.equal(true)
        //             expect(res.body.out_type).to.have.all.keys('hls_out',"rtmp_out","mp4_out")
        //             expect(res.body.out_type.hls_out.length).to.be.equal(2)
        //             expect(res.body.out_type.rtmp_out).to.be.equal(1)
        //             expect(res.body.out_type.mp4_out.length).to.be.equal(1)
        //             done();
        //         })
        // })
        // it('delete LIVE tube success : live_tube_id_default', function (done) {
        //     this.timeout(30000)
        //     API.delete('/liveTube/'+live_tube_id_default)
        //         .set('Content-Type', 'application/json')
        //         .set('Authorization', 'Bearer ' + tenant_admin_token_no_auto)
        //         .expect(200)
        //         .end(function (err, res) {
        //             if (err) done(err);
        //             expect(res.body.status).to.be.equal(true)
        //             setTimeout(done, 8000)
        //         });
        // })

        // it("create live tube success : set type out ,use default profile : in no auto DB", function(done) {
        //     this.timeout(30000)
        //     API.post("/liveTube")
        //         .set("Authorization", "Bearer " + tenant_admin_token_no_auto)
        //         .send({
        //             source_type: "RTMP",
        //             autorestart:false,
        //             channel_profile: "live_tube_id_zd3",
        //             out_type:
        //                 {
        //                     "hls_out": [
        //                         {
        //                             "isVod":false,
        //                             "legacy_hls_support":true
        //                         },
        //                         {
        //                             "isVod":true,
        //                             "legacy_hls_support":true
        //                             }
        //                     ],
        //                     "rtmp_out": 1,
        //                     "mp4_out": [
        //                         {
        //                             "isVod":false
        //                         },
        //                         {
        //                             "isVod":true
        //                         }
        //                     ]
        //                 }
        //         })
        //         .expect(200)
        //         .end(function(err, res) {
        //             if (err) throw err;
		// 			console.log(res.body)
        //             expect(res.body.status).to.be.true;
        //             expect(res.body.live_tube_id).to.be.a('string')
        //             expect(res.body.port).to.be.a('number')
        //             live_tube_id_zd3=res.body.live_tube_id
        //             setTimeout(done, 8000)
        //         })
        // })
        // it("Read LIVE tube : set type out,use default profile : it should be 2 hls out,1 rtmp out,1 mp4 out : in no auto DB", function(done) {
        //     API.get("/liveTube/" + live_tube_id_zd3)
        //         .set("Authorization", "Bearer " + tenant_admin_token_no_auto)
        //         .expect(200)
        //         .end(function(err, res) {
        //             if (err) throw err;
        //             console.log(res.body)
        //             expect(res.body.status).to.be.equal(true)
        //             expect(res.body.out_type).to.have.all.keys('hls_out',"rtmp_out","mp4_out")
        //             expect(res.body.out_type.hls_out.length).to.be.equal(2)
        //             expect(res.body.out_type.rtmp_out).to.be.equal(1)
        //             expect(res.body.out_type.mp4_out.length).to.be.equal(2)
        //             done();
        //         })
        // })
        // it('delete LIVE tube success : live_tube_id_zd3', function (done) {
        //     this.timeout(30000)
        //     API.delete('/liveTube/'+live_tube_id_zd3)
        //         .set('Content-Type', 'application/json')
        //         .set('Authorization', 'Bearer ' + tenant_admin_token_no_auto)
        //         .expect(200)
        //         .end(function (err, res) {
        //             if (err) done(err);
        //             expect(res.body.status).to.be.equal(true)
        //             setTimeout(done, 8000)
        //         });
        // })

        // it("create live tube success : default out type,use create profile", function(done) {
        //     this.timeout(30000)
        //     API.post("/liveTube")
        //         .set("Authorization", "Bearer " + tenant_admin_token_no_auto)
        //         .send({
        //             source_type: "RTMP",
        //             proc_profile_id:live_profile_id_no,
        //             channel_profile: "live_tube_id_zd4",
        //             autorestart:false
        //         })
        //         .expect(200)
        //         .end(function(err, res) {
        //             if (err) throw err;
        //             console.log("当前运行的脚本是："+__filename+"的第"+__line+"行 ： ");
		// 			console.log(res.body)
        //             expect(res.body.status).to.be.true;
        //             expect(res.body.live_tube_id).to.be.a('string')
        //             expect(res.body.port).to.be.a('number')
        //             live_tube_id_zd4=res.body.live_tube_id
        //             setTimeout(done, 8000)
        //         })
        // })
        // it("Read LIVE tube : default out type,use create profile,it should be 2 hls out,1 rtmp out,1 mp4 out", function(done) {
        //     API.get("/liveTube/" + live_tube_id_zd4)
        //         .set("Authorization", "Bearer " + tenant_admin_token_no_auto)
        //         .expect(200)
        //         .end(function(err, res) {
        //             if (err) throw err;
        //             console.log(res.body)
        //             expect(res.body.status).to.be.equal(true)
        //             expect(res.body.out_type).to.have.all.keys('hls_out',"rtmp_out","mp4_out")
        //             expect(res.body.out_type.hls_out.length).to.be.equal(2)
        //             expect(res.body.out_type.rtmp_out).to.be.equal(1)
        //             expect(res.body.out_type.mp4_out.length).to.be.equal(1)
        //             expect(res.body.profile.profile_id).to.be.equal(live_profile_id)
        //             done();
        //         })
        // })
        // it('delete LIVE tube success : live_tube_id_zd4', function (done) {
        //     this.timeout(30000)
        //     API.delete('/liveTube/'+live_tube_id_zd4)
        //         .set('Content-Type', 'application/json')
        //         .set('Authorization', 'Bearer ' + tenant_admin_token_no_auto)
        //         .expect(200)
        //         .end(function (err, res) {
        //             if (err) done(err);
        //             expect(res.body.status).to.be.equal(true)
        //             setTimeout(done, 8000)
        //         });
        // })

        // it("create live tube success : set type out,use default profile,no mp4 out : in no auto DB", function(done) {
        //     this.timeout(30000)
        //     API.post("/liveTube")
        //         .set("Authorization", "Bearer " + tenant_admin_token_no_auto)
        //         .send({
        //             source_type: "RTMP",
        //             autorestart:false,
        //             channel_profile: "live_tube_id_zd1",
        //             out_type:
        //                 {
        //                     "hls_out": [
        //                         {
        //                             "isVod":false,
        //                             "legacy_hls_support":true
        //                         },
        //                         {
        //                             "isVod":true,
        //                             "legacy_hls_support":true
        //                             }
        //                     ],
        //                     "rtmp_out": 1
        //                 }
        //         })
        //         .expect(200)
        //         .end(function(err, res) {
        //             if (err) throw err;
		// 			console.log(res.body)
        //             expect(res.body.status).to.be.true;
        //             expect(res.body.live_tube_id).to.be.a('string')
        //             expect(res.body.port).to.be.a('number')
        //             live_tube_id_zd1=res.body.live_tube_id
        //             setTimeout(done, 8000)
        //         })
        // })
        // it("Read LIVE tube : set type out,use default profile,it should be 2 hls out,1 rtmp out,lost mp4 out", function(done) {
        //     API.get("/liveTube/" + live_tube_id_zd1)
        //         .set("Authorization", "Bearer " + tenant_admin_token_no_auto)
        //         .expect(200)
        //         .end(function(err, res) {
        //             if (err) throw err;
        //             console.log(res.body)
        //             expect(res.body.status).to.be.equal(true)
        //             expect(res.body.out_type).to.have.all.keys('hls_out',"rtmp_out")
        //             expect(res.body.out_type.hls_out.length).to.be.equal(2)
        //             expect(res.body.out_type.rtmp_out).to.be.equal(1)
        //             done();
        //         })
        // })
        // it('delete LIVE tube : live_tube_id_zd1', function (done) {
        //     this.timeout(30000)
        //     API.delete('/liveTube/'+live_tube_id_zd1)
        //         .set('Content-Type', 'application/json')
        //         .set('Authorization', 'Bearer ' + tenant_admin_token_no_auto)
        //         .expect(200)
        //         .end(function (err, res) {
        //             if (err) done(err);
        //             expect(res.body.status).to.be.equal(true)
        //             setTimeout(done, 8000)
        //         });
        // })

        // it("create live tube success : set type out,use create profile", function(done) {
        //     this.timeout(30000)
        //     API.post("/liveTube")
        //         .set("Authorization", "Bearer " + tenant_admin_token_no_auto)
        //         .send({
        //             source_type: "RTMP",
        //             autorestart:false,
        //             channel_profile: "live_tube_id_zd2",
        //             out_type:
        //             {
        //                 "hls_out": [
        //                     {
        //                         "isVod":false,
        //                         "legacy_hls_support":true
        //                     },
        //                     {
        //                         "isVod":true,
        //                         "legacy_hls_support":true
        //                         }
        //                 ],
        //                 "mp4_out": [
        //                     {
        //                         "isVod":false
        //                     },
        //                     {
        //                         "isVod":true
        //                     }
        //                 ]
        //             }
        //         })
        //         .expect(200)
        //         .end(function(err, res) {
        //             if (err) throw err;
		// 			console.log(res.body)
        //             expect(res.body.status).to.be.true;
        //             expect(res.body.live_tube_id).to.be.a('string')
        //             expect(res.body.port).to.be.a('number')
        //             live_tube_id_zd2=res.body.live_tube_id
        //             setTimeout(done, 8000)
        //         })
        // })
        // it("Read LIVE tube : set type out,use create profile,it should be 2 hls out,lost rtmp out,2 mp4 out", function(done) {
        //     API.get("/liveTube/" + live_tube_id_zd2)
        //         .set("Authorization", "Bearer " + tenant_admin_token_no_auto)
        //         .expect(200)
        //         .end(function(err, res) {
        //             if (err) throw err;
        //             console.log(res.body)
        //             expect(res.body.status).to.be.equal(true)
        //             expect(res.body.out_type).to.have.all.keys('hls_out',"mp4_out")
        //             expect(res.body.out_type.hls_out.length).to.be.equal(2)
        //             expect(res.body.out_type.mp4_out.length).to.be.equal(2)
        //             done();
        //         })
        // });
        // it("create Live Channel 1, in the same live tube", function(done) {	
        //     this.timeout(30000);
        //     API.post("/liveChannel")
        //         .set("Authorization", "Bearer " + tenant_admin_token_no_auto)
        //         .send({
        //             live_tube_id: live_tube_id_zd2
        //         })
        //         .expect(200)
        //         .end(function(err, res) {
        //             if (err) throw err;
        //             console.log(res.body)
        //             expect(res.body.status).to.be.equal(true)
        //             expect(res.body.channel_name).to.be.a("string")
        //             expect(res.body.inbound_url).to.be.a("string")

        //             live_channel_id_same1 =res.body.channel_name
        //             setTimeout(done,10000)
        //         })
        // })
        // it("create Live Channel 2, in the same live tube", function(done) {	
        //     this.timeout(30000);
        //     API.post("/liveChannel")
        //         .set("Authorization", "Bearer " + tenant_admin_token_no_auto)
        //         .send({
        //             live_tube_id: live_tube_id_zd2
        //         })
        //         .expect(200)
        //         .end(function(err, res) {
        //             if (err) throw err;
        //             console.log(res.body)
        //             expect(res.body.status).to.be.equal(true)
        //             expect(res.body.channel_name).to.be.a("string")
        //             expect(res.body.inbound_url).to.be.a("string")

        //             live_channel_id_same2 =res.body.channel_name
        //             setTimeout(done,10000)
        //         })
        // })
        // it("delete live channel 1", function(done) {
        //     this.timeout(30000)
        //     API.delete("/liveChannel/"+ live_channel_id_same1)
        //         .set("Authorization", "Bearer " + tenant_admin_token_no_auto)
        //         .expect(200)
        //         .end(function(err, res) {
        //             if (err) throw err
        //             let body = JSON.parse(res.text)
        //             expect(body.status).to.be.true
        //             setTimeout(done, 10000)
        //         })
        // })
        // it("delete live channel 2", function(done) {
        //     this.timeout(30000)
        //     API.delete("/liveChannel/"+ live_channel_id_same2)
        //         .set("Authorization", "Bearer " + tenant_admin_token_no_auto)
        //         .expect(200)
        //         .end(function(err, res) {
        //             if (err) throw err
        //             let body = JSON.parse(res.text)
        //             expect(body.status).to.be.true
        //             setTimeout(done, 10000)
        //         })
        // })
        // it('delete LIVE tube : live_tube_id_zd2', function (done) {
        //     this.timeout(30000)
        //     API.delete('/liveTube/'+live_tube_id_zd2)
        //         .set('Content-Type', 'application/json')
        //         .set('Authorization', 'Bearer ' + tenant_admin_token_no_auto)
        //         .expect(200)
        //         .end(function (err, res) {
        //             if (err) done(err);
        //             expect(res.body.status).to.be.equal(true)
        //             setTimeout(done, 10000)
        //         });
        // })
        */

        it("create Live Channel and stream success", function (done) {
            this.timeout(50000);
            API.post("/liveChannel")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    live_tube_id: live_tube_id_st
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.body);
                    expect(res.body.status).to.be.equal(true);
                    expect(res.body.channel_name).to.be.a("string");
                    expect(res.body.inbound_url).to.be.a("string");
                    live_channel_total_count++;
                    stream_link = res.body.inbound_url;
                    live_channel_id_st = res.body.channel_name;
                    if (res.body.inbound_url) {
                        FFmpeg();
                        expect(err, "if this case test fail,pls check streaming live!").to.be.equal(null);
                    };
                    setTimeout(done, 45000);
                });
        });
        it("1.28 Read live channel: live channel not end, check playbackURL", function (done) {
            this.timeout(8000)
            API.get("/liveChannel/" + live_channel_id_st)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log("当前运行的脚本位置是：" + __filename + "的第" + __line + "行 ： ");
                    console.log("1.28 Read live channel: live channel not end, check playbackURL : ")
                    console.log(res.body)
                    expect(res.body._id).to.be.equal(live_channel_id_st);
                    expect(res.body.live_tube_id).to.be.equal(live_tube_id_st);
                    expect(res.body.status).to.be.equal(true)
                    // expect(res.body).to.have.all.keys("_id","live_tube_id","channel_name","is_tsArchive","is_ended","created_time","source_url","playbackURL","updated","status")
                    expect(res.body.is_ended).to.be.equal(false)
                    expect(res.body.is_tsArchive).to.be.equal(true)
                    expect(res.body.playbackURL.flvOutput[0].flvURL).to.have.string('/live/' + tenant_account_data.tenant_admin.username + '/' + live_channel_id_st + '.flv')
                    //mp4Output
                    //expect(res.body.playbackURL.mp4Output[0]).to.have.all.keys("isVod", "mp4URL_cdn")
                    //expect(res.body.playbackURL.mp4Output[0].isVod).to.be.equal(false)
                    //expect(res.body.playbackURL.mp4Output[0].mp4URL_cdn).to.have.string('/live/' + live_channel_id_st + '/default/0/mp4/0/output.mp4')
                    //hlsOutput
                    expect(res.body.playbackURL.hlsOutput[0]).to.have.all.keys("isVod", "hls_version", "hlsURL", "hlsURL_cdn")
                    expect(res.body.playbackURL.hlsOutput[0].isVod).to.be.equal(false)
                    expect(res.body.playbackURL.hlsOutput[0].hls_version).to.be.a('number')
                    expect(res.body.playbackURL.hlsOutput[0].hlsURL).to.have.string('/origin/live/' + tenant_account_data.tenant_admin.username + '/' + live_channel_id_st + '/hls0/index.m3u8')
                    expect(res.body.playbackURL.hlsOutput[0].hlsURL_cdn).to.have.string('/live/' + live_channel_id_st + '/default/0/hls/0/index.m3u8')
                    //dashOutput
                    expect(res.body.playbackURL.dashOutput[0]).to.have.all.keys("dashURL", "dashURL_cdn")
                    expect(res.body.playbackURL.dashOutput[0].dashURL).to.have.string('/origin/live/' + tenant_account_data.tenant_admin.username + '/' + live_channel_id_st + '/dash0/index.mpd')
                    expect(res.body.playbackURL.dashOutput[0].dashURL_cdn).to.have.string('/live/' + live_channel_id_st + '/default/0/dash/0/index.mpd')
                    setTimeout(done, 6000)
                });
        })

        it("create autorestart live channel success : lost live_tube_id,Default = use live tube with autorestart", function (done) {
            this.timeout(22000);
            API.post("/liveChannel")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({

                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;

                    console.log("当前运行的脚本是：" + __filename + "的第" + __line + "行 ： ");
                    console.log(res.body)
                    expect(res.body.status).to.be.equal(true)
                    expect(res.body.channel_name).to.be.a("string")
                    expect(res.body.inbound_url).to.be.a("string")
                    live_channel_total_count++;
                    live_channel_id_auto = res.body.channel_name;
                    stream_link = res.body.inbound_url
                    if (res.body.inbound_url) {
                        FFmpeg();
                        expect(err, "if this case test fail,pls check streaming live!").to.be.equal(null);
                    }
                    setTimeout(done, 20000)
                });
        })
        it("1.28 Read autorestart live channel: live channel not end,check playbackURL", function (done) {
            API.get("/liveChannel/" + live_channel_id_auto)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.body)
                    expect(res.body._id).to.be.equal(live_channel_id_auto);
                    expect(res.body.status).to.be.equal(true)
                    expect(res.body).to.have.all.keys("_id", "live_tube_id", "channel_name", "channel_title",
                        "is_tsArchive", "is_ended", "created_time", "playbackURL", "source_url", "updated", "status")
                    expect(res.body.is_ended).to.be.equal(false)
                    expect(res.body.is_tsArchive).to.be.equal(false)
                    //hlsOutput
                    expect(res.body.playbackURL.hlsOutput[0]).to.have.all.keys("isVod", "hls_version", "hlsURL", "hlsURL_cdn")
                    expect(res.body.playbackURL.hlsOutput[0].isVod).to.be.equal(false)
                    expect(res.body.playbackURL.hlsOutput[0].hls_version).to.be.equal(4)
                    expect(res.body.playbackURL.hlsOutput[0].hlsURL).to.have.string('/origin/live/' + tenant_account_data.tenant_admin.username + '/' + live_channel_id_auto + '/hls0/index.m3u8')
                    expect(res.body.playbackURL.hlsOutput[0].hlsURL_cdn).to.have.string('/live/' + live_channel_id_auto + '/default/0/hls/0/index.m3u8')
                    done();
                });
        })
        it('End LIVE channel:have archive(auto live)', function (done) {
            this.timeout(30000);
            API.put('/liveChannel/' + live_channel_id_auto)
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer ' + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) done(err);
                    console.log("当前运行的脚本是：" + __filename + "的第" + __line + "行 ： ");
                    console.log(res.body)
                    expect(res.body.status).to.be.equal(true)
                    live_channel_total_count_end++
                    console.log("live_channel_total_count_end的值为：")
                    console.log(live_channel_total_count_end)
                    setTimeout(done, 25000)
                });
        })

        /*
        it("clear DB : no auto restart", function(done) {
            this.timeout(20000)
            API.delete("/clearDB/"+tenant_account_data.teant_DB_no_auto.tenant_name)
                .set('Content-Type', 'application/json')
                .set("Authorization", "Bearer " + orchestrator_admin_token)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.equal(true)
                    setTimeout(done, 18000)
                })
        })
        */
        after("Create and run no archive's liveTube: RTMP using the created profile", function (done) {
            this.timeout(10000)
            API.post("/liveTube")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    source_type: "RTMP",
                    channel_profile: "auto test for no archive",
                    proc_profile_id: live_profile_id,
                    out_type:
                    {
                        "hls_out": [
                            {
                                "isVod": false,
                                "legacy_hls_support": true
                            }
                        ],
                        "rtmp_out": 1,
                        "mp4_out": [
                            {
                                "isVod": false
                            }
                        ]
                    },
                    autorestart: false
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log("当前运行的脚本位置是：" + __filename + "的第" + __line + "行 ： ");
                    console.log(res.body)
                    expect(res.body.status).to.be.true;
                    expect(res.body.live_tube_id).to.be.a('string')
                    expect(res.body.port).to.be.a('number')
                    live_tube_id_noarchive = res.body.live_tube_id
                    live_tube_total_count++;
                    setTimeout(done, 8000)
                });
        });

    });

    describe("1.32 List output images", function () {

        before("create live channel : test for image", function (done) {
            API.post("/liveChannel")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({

                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.body)
                    expect(res.body.status).to.be.equal(true)
                    expect(res.body.channel_name).to.be.a("string")
                    expect(res.body.inbound_url).to.be.a("string")
                    live_channel_id_image = res.body.channel_name;
                    done()
                });
        })
        it('list LIVE thumbnail', function (done) {
            this.timeout(110000);
            API.post('/image')
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer ' + tenant_admin_token)
                .send({
                    "image_type": "thumbnail",
                    "media_type": "LIVE",
                    "media_id": live_channel_id_st
                })
                .expect(200)
                .end(function (err, res) {
                    console.log(res.body)
                    if (err) done(err);
                    expect(res.body.status).to.be.equal(true)
                    expect(res.body.total_count).to.be.above(0)
                    //let thumbnail_url_2 = res.body.image[0]
                    //thumbnail_2 =  thumbnail_url_2.substring(thumbnail_url_2.indexOf("thumbnail")+36, thumbnail_url_2.length)
                    //console.log(thumbnail_2)
                    setTimeout(done, 105000);
                });
        })
        /*
                //新增 测试90s删除RTMP thumbnail图片
                it("RTMP thumbnail: After 90S, check whether the thumbnail is deleted successfully.should be not exist", function(done) {
                    let tenant_db = tenant_account_data.tenant_admin.tenant_name
                    let found_thumbnail = false;
                    //const thumbnail_path = `/var/panel/library/video/live/output/${tenant_db}/thumbnails/5b7e5b27b3ad7a14b48bab2d/`;
                    const thumbnail_path = `/var/panel/library/video/live/output/${tenant_db}/thumbnails/${live_channel_id_st}/`;
                    console.log(thumbnail_path+thumbnail_2)
                    fs.exists(thumbnail_path+thumbnail_2, function(exists) {
                        console.log(exists);
                        if(exists == false){
                            found_thumbnail=true
                        }
                        expect(found_thumbnail).to.equal(true);
                        done();
                    });
                });
        */
       //2018-11-5跳过测试facialDetect图片
        // it('list LIVE facial', function (done) {
        //     this.timeout(110000);
        //     API.post('/image')
        //         .set('Content-Type', 'application/json')
        //         .set('Authorization', 'Bearer ' + tenant_admin_token)
        //         .send({
        //             "image_type": "facialDetect",
        //             "media_type": "LIVE",
        //             "media_id": live_channel_id_st
        //         })
        //         .expect(200)
        //         .end(function (err, res) {
        //             console.log(res.body)
        //             if (err) done(err);
        //             //let facialdetect_url_2 = res.body.image[0]
        //             //facialdetect_2 =  facialdetect_url_2.substring(facialdetect_url_2.indexOf("facialDetect")+38, facialdetect_url_2.length)
        //             //console.log(facialdetect_2)
        //             expect(res.body.status).to.be.equal(true)
        //             expect(res.body.total_count).to.be.above(0)
        //             setTimeout(done, 105000);
        //         });
        // });
        /*
                //新增 测试90s删除RTMP facialdetect图片
                it("RTMP facialdetect: After 90S, check whether the facialdetect is deleted successfully.should be not exist", function(done) {
                    let tenant_db = tenant_account_data.tenant_admin.tenant_name
                    let found_facialdetect = false;
                    //const thumbnail_path = `/var/panel/library/video/live/output/${tenant_db}/facialDetect/5b7e5b27b3ad7a14b48bab2d/`;
                    const facialdetect_path = `/var/panel/library/video/live/output/${tenant_db}/facialDetect/${live_channel_id_st}/`;
                    console.log(facialdetect_path+facialdetect_2)
                    fs.exists(facialdetect_path+facialdetect_2, function(exists) {
                        console.log(exists);
                        if(exists == false){
                            found_facialdetect=true
                        }
                        expect(found_facialdetect).to.equal(true);
                        done();
                    });
                });
        */
        it('list LIVE thumbnail fail : LiveChannel not found', function (done) {
            API.post('/image')
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer ' + tenant_admin_token)
                .send({
                    "image_type": "thumbnail",
                    "media_type": "LIVE",
                    "media_id": "5b1f3ed3e54fa82141e4e5ef"
                })
                .expect(200)
                .end(function (err, res) {
                    console.log(res.body)
                    if (err) done(err);
                    expect(res.body.status).to.be.equal(false)
                    expect(res.body.err.code).to.be.equal(404)
                    expect(res.body.err.message).to.be.equal('LiveChannel not found')
                    done()
                });
        })
        it('list LIVE facial : LiveChannel not found', function (done) {
            API.post('/image')
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer ' + tenant_admin_token)
                .send({
                    "image_type": "facialDetect",
                    "media_type": "LIVE",
                    "media_id": "5b1f3ed3e54fa82141e4e5ef"
                })
                .expect(200)
                .end(function (err, res) {
                    console.log(res.body)
                    if (err) done(err);
                    expect(res.body.status).to.be.equal(false)
                    expect(res.body.err.code).to.be.equal(404)
                    expect(res.body.err.message).to.be.equal('LiveChannel not found')
                    done()
                });
        })
        it('list LIVE thumbnail fail : No records exist', function (done) {
            API.post('/image')
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer ' + tenant_admin_token)
                .send({
                    "image_type": "thumbnail",
                    "media_type": "LIVE",
                    "media_id": live_channel_id_image
                })
                .expect(200)
                .end(function (err, res) {
                    console.log(res.body)
                    if (err) done(err);
                    expect(res.body.status).to.be.equal(false)
                    expect(res.body.err.code).to.be.equal(404)
                    expect(res.body.err.message).to.be.equal('No records exist')
                    done()
                });
        })
        it('list LIVE facial : No records exist', function (done) {
            API.post('/image')
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer ' + tenant_admin_token)
                .send({
                    "image_type": "facialDetect",
                    "media_type": "LIVE",
                    "media_id": live_channel_id_image
                })
                .expect(200)
                .end(function (err, res) {
                    console.log(res.body)
                    if (err) done(err);
                    expect(res.body.status).to.be.equal(false)
                    expect(res.body.err.code).to.be.equal(404)
                    expect(res.body.err.message).to.be.equal('No records exist')
                    done()
                });
        })
        after("delete live channel : test for image", function (done) {
            API.delete("/liveChannel/" + live_channel_id_image)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    done();
                });
        })
    });

    describe("Check TS output", function () {
        it("check ts output ： have stream", function (done) {
            let tenant_db = tenant_account_data.tenant_admin.tenant_name
            console.log("当前运行的脚本位置是：" + __filename + "的第" + __line + "行 ： ");
            console.log(live_tube_id_st)
            console.log(live_channel_id_st)
            console.log(tenant_db)
            var foundTsFile = false;
            // const tsFolder = `/var/panel/library/video/live/output/${tenant_db}/${live_tube_id}/${live_channel_id}/hls0`;
            const tsFolder = `/var/panel/library/video/live/output/${tenant_db}/${live_channel_id_st}/hls0`;
            const fs = require('fs');
            console.log(tsFolder)
            fs.readdir(tsFolder, (err, files) => {
                files.forEach(file => {
                    if (file.endsWith('.ts')) {
                        foundTsFile = true;
                    }
                });
                expect(foundTsFile).to.equal(true);
                done();
            })
        })
        /*
        it("check auto live ts output", function(done) {
            this.timeout(6000);	
                setTimeout(function() {
                    let tenant_dbA = tenant_account_data.tenant_admin.tenant_name
                    console.log("xxxxxxxxxauto")
                    console.log(tenant_dbA)
                    var foundTsFileA=false;
                    const tsFolderA = `/var/panel/library/video/live/output/${tenant_dbA}/${live_channel_id_auto}/hls0`;
                    const fsA = require('fs');
                    console.log(tsFolderA)
                    fsA.readdir(tsFolderA, (err, files) => {
                      files.forEach(file => {
                        if (file.endsWith('.ts')){
                            foundTsFileA=true;
                        }
                      });
                      expect(foundTsFileA).to.equal(true);				
                      done();
                    })
                }, 5500)
            })
        it("check live channel: not end,have archive, check HLSURL", function(done) {
            API.get("/liveChannel/"+ live_channel_id_st)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    console.log("check live channel: not end, have archive, check HLSURL    :    ")
                    console.log(res.body)
                    console.log("==========================")
                    console.log(res.body.playbackURL)
                    console.log("==========================")
                    console.log(res.body.playbackURL.mp4Output[0])
                    console.log(res.body.playbackURL.mp4Output[0].mp4URL)
                    console.log(res.body.playbackURL.mp4Output[0].mp4URL_cdn)
                    expect(res.body._id).to.be.equal(live_channel_id_st);
                    expect(res.body.live_tube_id).to.be.equal(live_tube_id_st);
                    expect(res.body.status).to.be.equal(true)
                    // expect(res.body).to.have.all.keys("_id","live_tube_id","channel_name","is_tsArchive","is_ended","status","created_time","source_url","playbackURL","updated")
                    expect(res.body.is_ended).to.be.equal(false)
                    expect(res.body.is_tsArchive).to.be.equal(true)
                    //flv(rtmp_out)
                    expect(res.body.playbackURL.flvOutput[0]).to.have.all.keys("flvURL")
                    expect(res.body.playbackURL.flvOutput[0].flvURL).to.have.string('/live/'+tenant_account_data.tenant_admin.username+'/'+live_channel_id_st+'.flv')
                    //mp4output
                    expect(res.body.playbackURL.mp4Output[0]).to.have.all.keys("isVod","mp4URL_cdn")
                    expect(res.body.playbackURL.mp4Output[0].isVod).to.be.equal(false)
                    expect(res.body.playbackURL.mp4Output[0].mp4URL_cdn).to.have.string('/live/'+live_channel_id_st+'/default/0/mp4/0/output.mp4')
                    //hlsOutput
                    expect(res.body.playbackURL.hlsOutput[0]).to.have.all.keys("isVod","hls_version","hlsURL","hlsURL_cdn")
                    expect(res.body.playbackURL.hlsOutput[0].isVod).to.be.equal(false)
                    expect(res.body.playbackURL.hlsOutput[0].hlsURL).to.have.string('/origin/live/'+tenant_account_data.tenant_admin.username+'/'+live_channel_id_st+'/hls0/index.m3u8')
                    expect(res.body.playbackURL.hlsOutput[0].hlsURL_cdn).to.have.string('/live/'+live_channel_id_st+'/default/0/hls/0/index.m3u8')
                    done();
                });
        });
        it("check auto live channel: not end, check HLSURL", function(done) {
            API.get("/liveChannel/"+ live_channel_id_auto)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    console.log("check auto live channel: not end,have archive,check HLSURL    :    ")
                    console.log(res.body)
                    console.log("==========================")
                    expect(res.body._id).to.be.equal(live_channel_id_auto);
                    expect(res.body.live_tube_id).to.be.equal(tube2);
                    expect(res.body.status).to.be.equal(true)
                    expect(res.body).to.have.all.keys("_id","live_tube_id","channel_name",
                                                    "is_tsArchive","is_ended","status","created_time","source_url","playbackURL","updated")
                    expect(res.body.is_ended).to.be.equal(false)
                    expect(res.body.is_tsArchive).to.be.equal(true)
                    //flv(rtmp_out)
                    expect(res.body.playbackURL.flvOutput[0]).to.have.all.keys("flvURL")
                    expect(res.body.playbackURL.flvOutput[0].flvURL).to.have.string('/live/'+tenant_account_data.tenant_admin.username+'/'+live_channel_id_auto+'.flv')
                    //mp4output
                    expect(res.body.playbackURL.mp4Output[0]).to.have.all.keys("isVod")
                    expect(res.body.playbackURL.mp4Output[0].isVod).to.be.equal(true)
                    //hlsOutput
                    expect(res.body.playbackURL.hlsOutput[0]).to.have.all.keys("isVod","hls_version","hlsURL","hlsURL_cdn")
                    expect(res.body.playbackURL.hlsOutput[0].isVod).to.be.equal(false)
                    expect(res.body.playbackURL.hlsOutput[0].hlsURL).to.have.string('/origin/live/'+tenant_account_data.tenant_admin.username+'/'+live_channel_id_auto+'/hls0/index.m3u8')
                    expect(res.body.playbackURL.hlsOutput[0].hlsURL_cdn).to.have.string('/live/'+live_channel_id_auto+'/default/0/hls/0/index.m3u8')
                    done();
                });
        });
        it('End LIVE channel:have archive(auto live)', function (done) {
            this.timeout(30000);
            API.put('/liveChannel/'+live_channel_id_auto)
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer ' + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) done(err);
                    console.log("当前运行的脚本是："+__filename+"的第"+__line+"行 ： ");
                    console.log(res.body)
                    expect(res.body.status).to.be.equal(true)
                    live_channel_total_count_end++
                    setTimeout(done, 25000)
                });
        })
        */
        it("Create live channel fail : Invalid live_tube_id", function (done) {
            this.timeout(60000);
            API.post("/liveChannel")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    live_tube_id: NOVALID
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);

                    expect(body.status).to.be.equal(false)
                    expect(body.err.code).to.be.equal(400)
                    expect(body.err.message).to.be.equal("Invalid live_tube_id")
                    setTimeout(done, 55000)
                });
        })
        it("create live channel fail : live_tube_id not exist", function (done) {
            this.timeout(60000);
            API.post("/liveChannel")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    live_tube_id: not_exist_id
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.body)
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(404);
                    expect(body.err.message).to.be.equal("LiveTube not found/No default LiveTube available")
                    setTimeout(done, 55000)
                });
        })
    });

    describe('1.33 Monitor LIVE channel status', function () {
        it('Monitor LIVE channel status,live stream is stop,is ready should be true', function (done) {
            API.get('/liveChannel/monitor/' + live_channel_id_st)
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer ' + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) done(err);
                    expect(res.body.status).to.be.equal(true)
                    expect(res.body.is_ready).to.be.equal(true)
                    done()
                });
        })
        it('Monitor LIVE channel status fail : LiveChannel not found', function (done) {
            API.get('/liveChannel/monitor/5b028359032dc60e09855621')
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer ' + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) done(err);
                    expect(res.body.status).to.be.equal(false)
                    expect(res.body.err.code).to.be.equal(404)
                    expect(res.body.err.message).to.be.equal("LiveChannel not found")
                    done()
                });
        })
    });

    describe('1.30 End LIVE channel', function () {
        /*
        before("Create and run no archivie's liveTube: RTMP using the created profile", function(done) {
            this.timeout(10000)
            API.post("/liveTube")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    source_type: "RTMP",
                    proc_profile_id: live_profile_id,
                    out_type:
                        {
                            "hls_out": [
                                {
                                    "isVod":false,
                                    "legacy_hls_support":true
                                }
                            ],
                            "rtmp_out": 1,
                            "mp4_out": [
                                {
                                    "isVod":false
                                }
                            ]
                        },
                    autorestart:false
                })
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
					console.log(res.body)
                    expect(res.body.status).to.be.true;
                    expect(res.body.live_tube_id).to.be.a('string')
                    expect(res.body.port).to.be.a('number')
                    live_tube_id_noarchive=res.body.live_tube_id
                    live_tube_total_count++;
                    setTimeout(done, 8000)
                });
        });
        */
        before("Create Live Channel for end live test : no archive", function (done) {
            this.timeout(10000);
            API.post("/liveChannel")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    live_tube_id: live_tube_id_noarchive
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log("当前运行的脚本位置是：" + __filename + "的第" + __line + "行 ： ");
                    console.log(res.body)
                    expect(res.body.status).to.be.equal(true)
                    expect(res.body.channel_name).to.be.a("string")
                    expect(res.body.inbound_url).to.be.a("string")
                    live_channel_total_count++;
                    live_channel_id_noarchive = res.body.channel_name
                    setTimeout(done, 8000);
                });
        });
        // before("create autorestart live channel for end live test = use live tube with autorestart", function(done) {
        //     this.timeout(60000);
        //     API.post("/liveChannel")
        //         .set("Authorization", "Bearer " + tenant_admin_token)
        //         .send({

        //         })
        //         .expect(200)
        //         .end(function(err, res) {
        //             if (err) throw err;

        //             console.log("当前运行的脚本是："+__filename+"的第"+__line+"行 ： ");
        //             console.log(res.body)
        //             expect(res.body.status).to.be.equal(true)
        //             expect(res.body.channel_name).to.be.a("string")
        //             expect(res.body.inbound_url).to.be.a("string")
        //             live_channel_total_count++;
        //             live_channel_id_auto =res.body.channel_name;
        //             stream_link=res.body.inbound_url
        //             if(res.body.inbound_url){
        //                 FFmpeg();
        //                 expect(err,"if this case test fail,pls check streaming live!").to.be.equal(null);
        //             }
        //             setTimeout(done,55000)
        //         });
        // })
        // it('End LIVE channel:have archive(auto live)', function (done) {
        //     this.timeout(30000);
        //     API.put('/liveChannel/'+live_channel_id_auto)
        //         .set('Content-Type', 'application/json')
        //         .set('Authorization', 'Bearer ' + tenant_admin_token)
        //         .expect(200)
        //         .end(function (err, res) {
        //             if (err) done(err);
        //             console.log("当前运行的脚本是："+__filename+"的第"+__line+"行 ： ");
        //             console.log(res.body)
        //             expect(res.body.status).to.be.equal(true)
        //             live_channel_total_count_end++
        //             setTimeout(done, 25000)
        //         });
        // })
        it('End LIVE channel:no archive', function (done) {
            this.timeout(10000);
            API.put('/liveChannel/' + live_channel_id_noarchive)
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer ' + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) done(err);
                    console.log(res.body)
                    expect(res.body.status).to.be.equal(true)
                    live_channel_total_count_end++
                    console.log("live_channel_total_count_end的值为：")
                    console.log(live_channel_total_count_end)
                    setTimeout(done, 8000);
                });
        })
        it('End LIVE channel : has been stream', function (done) {
            this.timeout(10000);
            API.put('/liveChannel/' + live_channel_id_st)
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer ' + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) done(err);
                    console.log(res.body)
                    expect(res.body.status).to.be.equal(true)
                    live_channel_total_count_end++
                    console.log("live_channel_total_count_end的值为：")
                    console.log(live_channel_total_count_end)
                    setTimeout(done, 8000);
                });
        })
        // it('End LIVE channel:have archive(auto live)', function (done) {
        //     this.timeout(30000);
        //     API.put('/liveChannel/'+live_channel_id_auto)
        //         .set('Content-Type', 'application/json')
        //         .set('Authorization', 'Bearer ' + tenant_admin_token)
        //         .expect(200)
        //         .end(function (err, res) {
        //             if (err) done(err);
        //             console.log("当前脚本是："+__filename+"的第"+__line+"行 ： ");
        //             console.log(res.body)
        //             expect(res.body.status).to.be.equal(true)
        //             live_channel_total_count_end++
        //             setTimeout(done, 25000)
        //         });
        // })
        it('End LIVE channel:have archive(auto live) again', function (done) {
            this.timeout(30000);
            API.put('/liveChannel/' + live_channel_id_auto)
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer ' + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) done(err);
                    console.log("当前运行的脚本是：" + __filename + "的第" + __line + "行 ： ");
                    console.log(res.body)
                    expect(res.body.status).to.be.equal(false)
                    setTimeout(done, 25000)
                });
        })
        it("after end auto live,list Live channel,check record should be not deleted", function (done) {
            API.get("/liveChannel")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    expect(res.body.results).to.be.an("array");
                    expect(res.body.status).to.be.equal(true)
                    expect(res.body).to.have.all.keys("results", "previous", "hasPrevious", "next", "hasNext", "total_count", "status")
                    expect(res.body.results[1]).to.have.all.keys("channel_name")
                    expect(res.body.results[1].channel_name).to.be.equal(live_channel_id_auto)
                    done();
                });
        });

        it("after end auto live,check live channel HLS files,only HLS should be deleted", function (done) {
            let tenant_db_au = tenant_account_data.tenant_admin.tenant_name
            let found_HLSFile_au = false;
            const HLSFile_au = `/var/panel/library/video/live/output/${tenant_db_au}/${live_channel_id_auto}`;
            fs.exists(HLSFile_au, function (exists) {
                console.log(exists);
                if (!exists) {
                    found_HLSFile_au = true
                }
                expect(found_HLSFile_au, "if this test fail,it should be HLS files not delete after end live").to.equal(true);
                done()
            });
        })
        it('End LIVE channel fail :LiveChannel not found', function (done) {
            API.put('/liveChannel/5b02879f032dc60e09855691')
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer ' + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) done(err);
                    console.log(res.body)
                    expect(res.body.status).to.be.equal(false)
                    expect(res.body.err.code).to.be.equal(404)
                    expect(res.body.err.message).to.be.equal("LiveChannel not found")
                    done()
                });
        })
        // it('End LIVE channel fail : Invalid live_channel_id', function (done) {
        //     API.put('/liveChannel/5b1e34b1e54fa82141e4cd3311')
        //         .set('Content-Type', 'application/json')
        //         .set('Authorization', 'Bearer ' + tenant_admin_token)
        //         .expect(200)
        //         .end(function (err, res) {
        //             if (err) done(err);
        //             console.log(res.body)
        //             expect(res.body.status).to.be.equal(false)
        //             expect(res.body.err.code).to.be.equal(400)
        //             expect(res.body.err.message).to.be.equal("Invalid live_channel_id")
        //             done()
        //         });
        // })
        //live channel已经end,不能再 monitor
        // after('Monitor LIVE channel st status,is ready should be true,because live stream has been stop', function (done) {
        //     API.get('/liveChannel/monitor/'+live_channel_id_st)
        //         .set('Content-Type', 'application/json')
        //         .set('Authorization', 'Bearer ' + tenant_admin_token)
        //         .expect(200)
        //         .end(function (err, res) {
        //             if (err) done(err);
        //             expect(res.body.status).to.be.equal(true)
        //             expect(res.body.is_ready).to.be.equal(true)
        //             done()
        //         });
        // })
    });

    describe("1.27 Read LIVE channel list-ALL or by Live Tube ID", function () {
        let next;
        let previous;
        let next_error;
        let previous_error;
        let next_live;
        let previous_live;
        let next_error_live;
        let previous_error_live;
        let live_again
        let live_anagain
        let live_anagain2
        let live_tube_id_search


        it("Get all Live Tube Live channels: no parameters", function (done) {
            API.get("/liveChannel")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.body)
                    expect(res.body.results).to.be.an("array");
                    expect(res.body.status).to.be.equal(true)
                    expect(res.body).to.have.all.keys("results", "previous", "hasPrevious", "next", "hasNext", "total_count", "status")
                    expect(res.body.results[0]).to.have.all.keys("channel_name")
                    expect(res.body.total_count).to.be.equal(live_channel_total_count);
                    next_error = res.body.next;
                    previous_error = res.body.previous;
                    done();
                });
        });
        it("Get all Live Tube Live channels: Custom return quantity", function (done) {
            API.get("/liveChannel?limit=" + 1)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.body)
                    expect(res.body.results).to.be.an("array");
                    expect(res.body.status).to.be.equal(true)
                    expect(res.body).to.have.all.keys("results", "previous", "hasPrevious", "next", "hasNext", "total_count", "status")
                    expect(res.body.results[0]).to.have.all.keys("channel_name")
                    expect(res.body.results.length).to.be.equal(1)
                    expect(res.body.total_count).to.be.equal(live_channel_total_count);
                    next = res.body.next;
                    done();
                });
        });
        it("Get all Live Channel Live channels: next page", function (done) {
            API.get("/liveChannel?limit=1&next=" + next)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.body)
                    expect(res.body.results).to.be.an("array");
                    expect(res.body.status).to.be.equal(true)
                    expect(res.body).to.have.all.keys("results", "previous", "hasPrevious", "next", "hasNext", "total_count", "status")
                    expect(res.body.results[0]).to.have.all.keys("channel_name")
                    expect(res.body.results.length).to.be.equal(1)
                    expect(res.body.total_count).to.be.equal(live_channel_total_count);
                    previous = res.body.previous;
                    done();
                });
        });
        it("Get all Live Channel Live channels: Previous", function (done) {
            API.get("/liveChannel?limit=" + 1 + "&previous=" + previous)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.body)
                    expect(res.body.results).to.be.an("array");
                    expect(res.body.status).to.be.equal(true)
                    expect(res.body).to.have.all.keys("results", "previous", "hasPrevious", "next", "hasNext", "total_count", "status")
                    expect(res.body.results[0]).to.have.all.keys("channel_name")
                    expect(res.body.results.length).to.be.equal(1)
                    expect(res.body.total_count).to.be.equal(live_channel_total_count);
                    done();
                });
        });
        it("Get all Live Tube Live channel failed: no next page", function (done) {
            API.get("/liveChannel?limit=" + 1 + "&next=" + next_error)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.body)
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(404);
                    expect(body.err.message).to.be.equal('No records exist');
                    done();
                });
        });
        it("Get all Live Tube Live channel failed: no previous page", function (done) {
            API.get("/liveChannel?limit=" + 1 + "&previous=" + previous_error)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.body)
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(404);
                    expect(body.err.message).to.be.equal('No records exist');
                    done();
                });
        });
        it('get LIVE channel list: all live channel-by live_channel_state_req=0', function (done) {
            API.get('/liveChannel?live_channel_state_req=0')
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer ' + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) done(err);
                    console.log(res.body)
                    expect(res.body.results).to.be.an("array");
                    expect(res.body.status).to.be.equal(true)
                    expect(res.body).to.have.all.keys("results", "previous", "hasPrevious", "next", "hasNext", "total_count", "status")
                    expect(res.body.results[0]).to.have.all.keys("channel_name")
                    expect(res.body.total_count).to.be.equal(live_channel_total_count);
                    done()
                });
        })
        it('get LIVE channel list: active,all not ended-by live_channel_state_req=1, should be no records exist!', function (done) {
            API.get('/liveChannel?live_channel_state_req=1')
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer ' + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) done(err);
                    console.log(res.body)
                    expect(res.body.status).to.be.equal(false)
                    expect(res.body.err.code).to.be.equal(404)
                    expect(res.body.err.message).to.be.equal('No records exist')
                    done()
                });
        })
        it('get LIVE channel list: ended (is_tsArchive = true)-by live_channel_state_req=2', function (done) {
            API.get('/liveChannel?live_channel_state_req=2')
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer ' + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) done(err);
                    console.log(res.body)
                    expect(res.body.status).to.be.equal(true)
                    expect(res.body).to.have.all.keys("results", "previous", "hasPrevious", "next", "hasNext", "total_count", "status")
                    expect(res.body.results[0]).to.have.all.keys("channel_name")
                    expect(res.body.total_count).to.be.equal(1)
                    expect(res.body.results[0].channel_name).to.be.equal(live_channel_id_st)
                    done()
                });
        })
        it('get LIVE channel list: ended (ALL)-by live_channel_state_req=3', function (done) {
            API.get('/liveChannel?live_channel_state_req=3')
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer ' + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) done(err);
                    console.log("当前运行的脚本位置是：" + __filename + "的第" + __line + "行 ： ");
                    console.log(res.body)
                    expect(res.body.status).to.be.equal(true)
                    expect(res.body).to.have.all.keys("results", "previous", "hasPrevious", "next", "hasNext", "total_count", "status")
                    expect(res.body.results[0]).to.have.all.keys("channel_name")
                    expect(res.body.total_count).to.be.equal(live_channel_total_count_end)
                    console.log("live_channel_total_count_end的值为：")
                    console.log(live_channel_total_count_end)
                    expect(res.body.results[0].channel_name).to.be.equal(live_channel_id_noarchive)
                    done()
                });
        })

        it("create RTMP live tube for test live_tube_id search", function (done) {
            this.timeout(80000);
            API.post("/liveTube")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    source_type: "RTMP",
                    channel_profile: "for test live_tube_id search",
                    proc_profile_id: live_profile_id,
                    out_type:
                    {
                        "hls_out": [
                            {
                                "isVod": false,
                                "legacy_hls_support": true
                            },
                            {
                                "isVod": true,
                                "legacy_hls_support": true
                            }
                        ],
                        "rtmp_out": 1,
                        "mp4_out": [
                            {
                                "isVod": false
                            },
                            {
                                "isVod": true
                            }
                        ]
                    },
                    autorestart: false
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.body)
                    expect(res.body.status).to.be.true;
                    expect(res.body.live_tube_id).to.be.a('string');
                    expect(res.body.port).to.be.a('number');
                    live_tube_id_search = res.body.live_tube_id;
                    setTimeout(done, 75000);
                });
        });
        it("Read LIVE tube success : for test live_tube_id search", function (done) {
            this.timeout(12000);
            API.get("/liveTube/" + live_tube_id_search)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.body)
                    expect(res.body).to.include.keys('kernel');
                    expect(res.body.status).to.be.equal(true)
                    setTimeout(done, 10000)
                });
        });
        it("create 3 live channel", function (done) {
            this.timeout(8000);
            API.post("/liveChannel")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "live_tube_id": live_tube_id_search
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;

                    console.log("当前运行的脚本是：" + __filename + "的第" + __line + "行 ： ");
                    console.log(res.body)
                    expect(res.body.status).to.be.equal(true)
                    expect(res.body.channel_name).to.be.a("string")
                    expect(res.body.inbound_url).to.be.a("string")
                    live_anagain2 = res.body.channel_name
                    setTimeout(done, 5000)
                });
        })
        it("create 1 live channel ", function (done) {
            this.timeout(8000);
            API.post("/liveChannel")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "live_tube_id": live_tube_id_search
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;

                    console.log("当前运行的脚本是：" + __filename + "的第" + __line + "行 ： ");
                    console.log(res.body)
                    expect(res.body.status).to.be.equal(true)
                    expect(res.body.channel_name).to.be.a("string")
                    expect(res.body.inbound_url).to.be.a("string")
                    live_again = res.body.channel_name
                    setTimeout(done, 5000)
                });
        })
        //已经end的live channel，在使用live tube id搜索的时候，不会搜索到。但通过live channel state req可以搜索到。
        it('End LIVE channel:live_anagain2', function (done) {
            this.timeout(10000);
            API.put('/liveChannel/' + live_anagain2)
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer ' + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) done(err);
                    console.log("当前运行的脚本位置是：" + __filename + "的第" + __line + "行 ： ");
                    console.log(res.body)
                    expect(res.body.status).to.be.equal(true)
                    setTimeout(done, 8000);
                });
        })
        it("create 2 live channel", function (done) {
            this.timeout(8000);
            API.post("/liveChannel")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "live_tube_id": live_tube_id_search
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log("当前运行的脚本是：" + __filename + "的第" + __line + "行 ： ");
                    console.log(res.body)
                    expect(res.body.status).to.be.equal(true)
                    expect(res.body.channel_name).to.be.a("string")
                    expect(res.body.inbound_url).to.be.a("string")
                    live_anagain = res.body.channel_name
                    setTimeout(done, 5000)
                });
        })
        it("221-1 Get one Live Tube's Live channel: success", function (done) {
            API.get("/liveChannel?live_tube_id=" + live_tube_id_search)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.body)
                    expect(res.body.total_count).to.be.equal(2)
                    expect(res.body.results.length).to.be.equal(2)
                    expect(res.body.status).to.be.equal(true)
                    tube_s1 = res.body.results[0].channel_name
                    tube_s2 = res.body.results[1].channel_name
                    done();
                });
        });
        it("221-2 Get one Live Tube's Live channel by limit: success", function (done) {
            API.get("/liveChannel?live_tube_id=" + live_tube_id_search + "&limit=1")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.body)
                    expect(res.body.total_count).to.be.equal(2)
                    expect(res.body.results.length).to.be.equal(1)
                    expect(res.body.status).to.be.equal(true)
                    expect(res.body.results[0].channel_name).to.be.equal(tube_s1)
                    tube_next = res.body.next
                    done();
                });
        });
        it("221-3 Get one Live Tube's Live channel by next: success", function (done) {
            API.get("/liveChannel?live_tube_id=" + live_tube_id_search + "&limit=1" + "&next=" + tube_next)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.body)
                    expect(res.body.total_count).to.be.equal(2)
                    expect(res.body.results.length).to.be.equal(1)
                    expect(res.body.status).to.be.equal(true)
                    expect(res.body.results[0].channel_name).to.be.equal(tube_s2)
                    tube_previous = res.body.previous
                    done();
                });
        });
        it("221-4 Get one Live Tube's Live channel by previous: success", function (done) {
            API.get("/liveChannel?live_tube_id=" + live_tube_id_search + "&limit=1" + "&previous=" + tube_previous)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.body)
                    expect(res.body.total_count).to.be.equal(2)
                    expect(res.body.results.length).to.be.equal(1)
                    expect(res.body.status).to.be.equal(true)
                    expect(res.body.results[0].channel_name).to.be.equal(tube_s1)
                    done();
                });
        });
        it("221-5 Get one Live Tube's Live channel: fail,live tube id not exist", function (done) {
            API.get("/liveChannel?live_tube_id=5b9a3155d5fd8e7da557af7b")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.body)
                    expect(res.body.err.code).to.be.equal(404)
                    expect(res.body.err.message).to.be.equal("No records exist")
                    expect(res.body.status).to.be.equal(false)
                    done();
                });
        });

        after("Deleted by live channel id: live_again", function (done) {
            API.delete("/liveChannel/" + live_again)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log("940940")
                    console.log(res.body)
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    done();
                });
        });
        after("Deleted by live channel id: live_again", function (done) {
            API.delete("/liveChannel/" + live_anagain)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log("940940")
                    console.log(res.body)
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    done();
                });
        });
        after("Deleted by live channel id: live_anagain2", function (done) {
            API.delete("/liveChannel/" + live_anagain2)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log("940940")
                    console.log(res.body)
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    done();
                });
        });
        after('delete LIVE tube success: for test live_tube_id search', function (done) {
            API.delete('/liveTube/' + live_tube_id_search)
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer ' + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) done(err);
                    expect(res.body.status).to.be.equal(true)
                    done()
                });
        })
    });


    //===================================================

    describe("1.28 Read LIVE channel", function () {
        it("Read LIVE channel by live_channel_id: id ended,have archive, check archiveURL", function (done) {
            API.get("/liveChannel/" + live_channel_id_st)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log("Read LIVE channel by live_channel_id: id ended,have archive, check archiveURL:")
                    console.log(res.body)
                    expect(res.body._id).to.be.equal(live_channel_id_st);
                    // expect(res.body.live_tube_id).to.be.equal(live_tube_id_st);
                    expect(res.body.status).to.be.equal(true)
                    // expect(res.body).to.have.all.keys("_id","channel_name","is_tsArchive","is_ended","created_time","playbackURL","updated","status")
                    expect(res.body.is_ended).to.be.equal(true)
                    expect(res.body.is_tsArchive).to.be.equal(true)

                    // expect(res.body.playbackURL.flvOutput).to.be.empty

                    //mp4Output
                    // expect(res.body.playbackURL.mp4Output[1]).to.have.all.keys("isVod", "archive_duration", "archive_dateupload", "mp4URL", "mp4URL_cdn")
                    // expect(res.body.playbackURL.mp4Output[1].isVod).to.be.equal(true)
                    // expect(res.body.playbackURL.mp4Output[1].archive_duration).to.be.a('number')
                    // expect(res.body.playbackURL.mp4Output[1].archive_dateupload).to.be.a('string')
                    // expect(res.body.playbackURL.mp4Output[1].mp4URL).to.have.string('/origin/live/' + tenant_account_data.tenant_admin.username + '/mp4Archive/' + live_channel_id_st + '/mp41/output.mp4')
                    // expect(res.body.playbackURL.mp4Output[1].mp4URL_cdn).to.have.string('/vod/' + live_channel_id_st + '/default/mp4/1/output.mp4')
                    //hlsOutput
                    expect(res.body.playbackURL.hlsOutput[1]).to.have.all.keys("isVod", "hls_version", "archive_duration", "archive_dateupload", "hlsURL", "hlsURL_cdn")
                    expect(res.body.playbackURL.hlsOutput[1].archive_duration).to.be.a('number')
                    expect(res.body.playbackURL.hlsOutput[1].archive_dateupload).to.be.a('string')
                    expect(res.body.playbackURL.hlsOutput[1].hlsURL).to.have.string('/origin/live/' + tenant_account_data.tenant_admin.username + '/tsArchive/' + live_channel_id_st + '/hls1/index.m3u8')
                    expect(res.body.playbackURL.hlsOutput[1].hlsURL_cdn).to.have.string('/vod/' + live_channel_id_st + '/default/hls/1/index.m3u8')
                    done();
                });
        })
        it("Read LIVE channel by live_channel_id: is ended,not stream, no archive", function (done) {
            this.timeout(10000);
            API.get("/liveChannel/" + live_channel_id_noarchive)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.body);
                    expect(res.body.status).to.be.equal(true);
                    expect(res.body._id).to.be.equal(live_channel_id_noarchive);
                    expect(res.body.channel_name).to.be.equal(live_channel_id_noarchive);
                    expect(res.body).to.have.all.keys("_id", "channel_name", "channel_title", "is_tsArchive", "is_ended", "created_time", "playbackURL", "status");
                    expect(res.body.is_ended).to.be.equal(true);
                    expect(res.body.is_tsArchive).to.be.equal(false);
                    setTimeout(done, 8000);
                });
        })
        it("Read LIVE channel by live_channel_id: is ended,have archive", function (done) {
            API.get("/liveChannel/" + live_channel_id_auto)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log("当前运行的脚本位置是：" + __filename + "的第" + __line + "行 ： ");
                    console.log(res.body)
                    expect(res.body.status).to.be.equal(true)
                    expect(res.body).to.have.all.keys("_id", "channel_name", "channel_title",
                        "is_tsArchive", "is_ended", "created_time", "playbackURL", "updated", "status")
                    expect(res.body.is_ended).to.be.equal(true)
                    expect(res.body.is_tsArchive).to.be.equal(false)
                    //hlsOutput
                    expect(res.body.playbackURL.hlsOutput[0]).to.have.all.keys("isVod", "hls_version")
                    expect(res.body.playbackURL.hlsOutput[0].hls_version).to.be.equal(4)
                    done();
                });
        })
        // it("Read LIVE channel by live_channel_id fail : Invalid live_channel_id", function(done) {
        //     API.get("/liveChannel/"+ NOVALID)
        //         .set("Authorization", "Bearer " + tenant_admin_token)
        //         .expect(200)
        //         .end(function(err, res) {
        //             if (err) throw err;
        //             let body = JSON.parse(res.text);
        //             expect(body.status).to.be.false;
        //             expect(body.err.code).to.be.equal(400);
        //             expect(body.err.message).to.be.equal('Invalid live_channel_id');
        //             done();
        //         });
        // })
        it("Read LIVE channel by live_channel_id fail: Live channel not found", function (done) {
            API.get("/liveChannel/" + not_exist_id)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(404);
                    expect(body.err.message).to.be.equal('Live channel not found');
                    done();
                });
        })
    });

    describe("1.29 Delete LIVE channel", function () {
        it("Deleted by live channel id: success", function (done) {
            API.delete("/liveChannel/" + live_channel_id_st)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log("940940")
                    console.log(res.body)
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    done();
                });
        });
        it("Delete autolive:success", function (done) {
            API.delete("/liveChannel/" + live_channel_id_auto)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log("953953")
                    console.log(res.body)
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    done();
                });
        });
        it("after delete auto live,list Live channel,check record should be deleted", function (done) {
            API.get("/liveChannel")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    expect(res.body.results).to.be.an("array");
                    expect(res.body.status).to.be.equal(true)
                    expect(res.body).to.have.all.keys("results", "previous", "hasPrevious", "next", "hasNext", "total_count", "status")
                    expect(res.body.results[0]).to.have.all.keys("channel_name")
                    expect(res.body.results[0].channel_name).to.be.equal(live_channel_id_noarchive)
                    expect(res.body.results.length).to.be.equal(1)
                    done();
                });
        });
        it("after delete auto live,check live channel TSarchive files,only HLS should be deleted", function (done) {
            let tenant_db_au = tenant_account_data.tenant_admin.tenant_name
            // let found_facialDetect_au=false;
            // let found_thumbnails_au=false;
            let found_tstsArchive_au = false;
            // const facialDetect_au = `/var/panel/library/video/live/output/${tenant_db_au}/facialDetect/${live_channel_id_auto}`;
            // const thumbnails_au = `/var/panel/library/video/live/output/${tenant_db_au}/thumbnails/${live_channel_id_auto}`;
            const tsArchive_au = `/var/panel/library/video/live/output/${tenant_db_au}/tsArchive/${live_channel_id_auto}`;

            // fs.exists(facialDetect_au, function(exists) {
            //     console.log(exists);
            //     if(exists){
            //         found_facialDetect_au=true
            //     }
            //     expect(found_facialDetect_au).to.equal(true);
            // });

            // fs.exists(thumbnails_au, function(exists) {
            //     console.log(exists);
            //     if(exists){
            //         found_thumbnails_au=true
            //     }
            //     expect(found_thumbnails_au).to.equal(true);
            // });
            fs.exists(tsArchive_au, function (exists) {
                console.log(exists);
                if (!exists) {
                    found_tstsArchive_au = true
                }
                expect(found_tstsArchive_au).to.equal(true);
                done()
            });

        })
        it("after delete auto live,check live channel HLS files,only HLS should be deleted", function (done) {
            let tenant_db_au = tenant_account_data.tenant_admin.tenant_name
            let found_HLSFile_au = false;
            const HLSFile_au = `/var/panel/library/video/live/output/${tenant_db_au}/${live_channel_id_auto}`;

            fs.exists(HLSFile_au, function (exists) {
                console.log(exists);
                if (!exists) {
                    found_HLSFile_au = true
                }
                expect(found_HLSFile_au).to.equal(true);
                done()
            });
        })
        it("after delete auto live,check live channel MP4archive files,only HLS should be deleted", function (done) {
            let tenant_db_au = tenant_account_data.tenant_admin.tenant_name
            let found_mp4Archive_au = false;
            const mp4Archive_au = `/var/panel/library/video/live/output/${tenant_db_au}/mp4Archive/${live_channel_id_auto}`;

            fs.exists(mp4Archive_au, function (exists) {
                console.log(exists);
                if (!exists) {
                    found_mp4Archive_au = true
                }
                expect(found_mp4Archive_au).to.equal(true);
                done()
            });
        })
        it("delete test for end live:success", function (done) {
            API.delete("/liveChannel/" + live_channel_id_noarchive)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log("end live : ")
                    console.log(res.body)
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    done();
                });
        });
        it('Delete LIVE channel fail: channel id has been delete or not exist', function (done) {
            API.delete('/liveChannel/' + not_exist_id)
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer ' + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) done(err);
                    expect(res.body.status).to.be.equal(false)
                    expect(res.body.err.code).to.be.equal(404)
                    expect(res.body.err.message).to.be.equal("LiveChannel not found")
                    done()
                });
        })
        // it('Delete LIVE channel fail: channel id invalid', function (done) {
        //     API.delete('/liveChannel/5afe4087e7dd48f73d206999111')
        //         .set('Content-Type', 'application/json')
        //         .set('Authorization', 'Bearer ' + tenant_admin_token)
        //         .expect(200)
        //         .end(function (err, res) {
        //             if (err) done(err);
        //             expect(res.body.status).to.be.equal(false)
        //             expect(res.body.err.code).to.be.equal(400)
        //             expect(res.body.err.message).to.be.equal("Invalid live_channel_id")
        //             done()
        //         });
        // })
    });

    describe("1.24 Delete LIVE tube", function () {
        it('delete LIVE tube success: no archive', function (done) {
            API.delete('/liveTube/' + live_tube_id_noarchive)
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer ' + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) done(err);

                    expect(res.body.status).to.be.equal(true)
                    done()
                });
        })
        it('Delete LIVE tube success: have archive', function (done) {
            API.delete('/liveTube/' + live_tube_id_st)
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer ' + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) done(err);
                    console.log(res.body)
                    expect(res.body.status).to.be.equal(true)
                    done()
                });
        })
        it('Delete LIVE tube fail: not exist,live tube has been delete', function (done) {
            API.delete('/liveTube/' + live_tube_id_st)
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer ' + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) done(err);
                    console.log(res.body)
                    expect(res.body.status).to.be.equal(false)
                    expect(res.body.err.code).to.be.equal(404)
                    expect(res.body.err.message).to.be.equal("Live tube doesn't exist")
                    done()
                });
        })
        it('Delete LIVE tube fail: live tube id invalid', function (done) {
            API.delete('/liveTube/5afe7e91e7dd48f73d2068e0111')
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer ' + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) done(err);

                    expect(res.body.status).to.be.equal(false)
                    expect(res.body.err.code).to.be.equal(400)
                    expect(res.body.err.message).to.be.equal("Id invalid")
                    done()
                });
        })
        /*
        after("To get a list of Live Tubes, there should be only the default tube:restart tube", function(done) {
            API.get("/liveTube")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
					console.log(body)
                    expect(body.results).to.be.an("array");
                    expect(body.total_count).to.be.equal(1);
                    expect(body.results[0]._id).to.be.equal(tube2)
                    done();
                });
        });
        */
    });

    describe("Check: delete tube", function () {
        it("Create and run Tube:RTMP 1 using the created profile", function (done) {
            this.timeout(13000)
            API.post("/liveTube")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    source_type: "RTMP",
                    channel_profile: "RTMP 1",
                    proc_profile_id: live_profile_id,
                    out_type:
                    {
                        "hls_out": [
                            {
                                "isVod": false,
                                "legacy_hls_support": true
                            },
                            {
                                "isVod": true,
                                "legacy_hls_support": true
                            }
                        ],
                        "rtmp_out": 1,
                        "mp4_out": [
                            {
                                "isVod": false
                            },
                            {
                                "isVod": true
                            }
                        ]
                    },
                    autorestart: false
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.body)
                    expect(res.body.status).to.be.true;
                    expect(res.body.live_tube_id).to.be.a('string')
                    expect(res.body.port).to.be.a('number')
                    live_tube_total_count++;
                    live_tube_id = res.body.live_tube_id;
                    setTimeout(done, 10000)
                });
        });
        it("Create Live Channel", function (done) {
            this.timeout(60000);
            setTimeout(function () {
                API.post("/liveChannel")
                    .set("Authorization", "Bearer " + tenant_admin_token)
                    .send({
                        live_tube_id: live_tube_id
                    })
                    .expect(200)
                    .end(function (err, res) {
                        if (err) throw err;
                        console.log(res.body)
                        expect(res.body.status).to.be.equal(true)
                        expect(res.body.channel_name).to.be.a("string")
                        expect(res.body.inbound_url).to.be.a("string")
                        live_channel_total_count++;
                        stream_link = res.body.inbound_url
                        live_channel_id = res.body.channel_name;
                        if (res.body.inbound_url) {
                            FFmpeg();
                            expect(err, "if this case test fail,pls check streaming live!").to.be.equal(null);
                        }
                        done();
                    });
            }, 55000);

        });
        it("Read by live_channel_id: This is just for the delay, adding time to the above push stream", function (done) {
            this.timeout(60000)
            API.get("/liveChannel/" + live_channel_id)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.body)
                    expect(res.body.status).to.be.equal(true)
                    setTimeout(done, 57000)
                });
        });
        it("Before delete tube,check live channel HLS files should be exist", function (done) {
            let tenant_db = tenant_account_data.tenant_admin.tenant_name
            let found_HLSFile = false;
            const HLSFile = `/var/panel/library/video/live/output/${tenant_db}/${live_channel_id}`;
            fs.exists(HLSFile, function (exists) {
                // console.log(exists ? "1" : "2");
                console.log(exists);
                if (exists) {
                    found_HLSFile = true
                }
                expect(found_HLSFile).to.equal(true);
                done()
            });
        })
        //2018-11-5跳过检查facialDetect图片
        // it("Before delete tube,check live channel facialDetect files should be exist", function (done) {
        //     let tenant_db = tenant_account_data.tenant_admin.tenant_name
        //     let found_facialDetect = false;
        //     const facialDetect = `/var/panel/library/video/live/output/${tenant_db}/facialDetect/${live_channel_id}`;
        //     fs.exists(facialDetect, function (exists) {
        //         console.log(exists);
        //         if (exists) {
        //             found_facialDetect = true
        //         }
        //         expect(found_facialDetect).to.equal(true);
        //         done()
        //     });
        // })
        it("Before delete tube,check live channel mp4Archive files should be exist", function (done) {
            let tenant_db = tenant_account_data.tenant_admin.tenant_name
            let found_mp4Archive = false;
            const mp4Archive = `/var/panel/library/video/live/output/${tenant_db}/mp4Archive/${live_channel_id}`;
            fs.exists(mp4Archive, function (exists) {
                console.log(exists);
                if (exists) {
                    found_mp4Archive = true
                }
                expect(found_mp4Archive).to.equal(true);
                done()
            });
        })
        it("Before delete tube,check live channel thumbnails files should be exist", function (done) {
            let tenant_db = tenant_account_data.tenant_admin.tenant_name
            let found_thumbnails = false;
            const thumbnails = `/var/panel/library/video/live/output/${tenant_db}/thumbnails/${live_channel_id}`;
            fs.exists(thumbnails, function (exists) {
                console.log(exists);
                if (exists) {
                    found_thumbnails = true
                }
                expect(found_thumbnails).to.equal(true);
                done()
            });
        })
        it("Before delete tube,check live channel tstsArchive files should be exist", function (done) {
            let tenant_db = tenant_account_data.tenant_admin.tenant_name
            let found_tstsArchive = false;
            const tsArchive = `/var/panel/library/video/live/output/${tenant_db}/tsArchive/${live_channel_id}`;
            fs.exists(tsArchive, function (exists) {
                console.log(exists);
                if (exists) {
                    found_tstsArchive = true
                }
                expect(found_tstsArchive).to.equal(true);
                done()
            });

        })
        it("Before delete tube,check tube record", function (done) {
            API.get("/liveTube")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body)
                    expect(body.results).to.be.an("array");
                    // expect(body.total_count).to.be.equal(live_tube_total_count);
                    expect(body.results[0]._id).to.be.equal(live_tube_id)
                    expect(body.results.length).to.be.equal(2)
                    done();
                });
        });
        it('Delete LIVE tube', function (done) {
            this.timeout(10000);
            API.delete('/liveTube/' + live_tube_id)
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer ' + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) done(err);
                    console.log(res.body)
                    expect(res.body.status).to.be.equal(true)
                    live_tube_total_count--
                    setTimeout(done, 8000)
                });
        })
        it("After delete,list Live tube,check record", function (done) {
            API.get("/liveTube")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body)
                    expect(body.results).to.be.an("array");
                    // expect(body.total_count).to.be.equal(live_tube_total_count);
                    expect(body.results[0]._id).to.be.not.equal(live_tube_id)
                    expect(body.results.length).to.be.equal(1)
                    done();
                });
        });
        it("After delete,list Live channel,check record", function (done) {
            API.get("/liveChannel")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    expect(res.body.results).to.be.an("array");
                    expect(res.body.status).to.be.equal(true)
                    expect(res.body).to.have.all.keys("results", "previous", "hasPrevious", "next", "hasNext", "total_count", "status")
                    expect(res.body.results[0]).to.have.all.keys("channel_name")
                    expect(res.body.results[0].channel_name).to.be.equal(live_channel_id)
                    expect(res.body.total_count).to.be.equal(1);
                    done();
                });
        });
        it("After delete tube,check live channel HLS files should be not exist", function (done) {
            let tenant_db = tenant_account_data.tenant_admin.tenant_name
            let found_HLSFile = false;
            const HLSFile = `/var/panel/library/video/live/output/${tenant_db}/${live_channel_id}`;
            fs.exists(HLSFile, function (exists) {
                // console.log(exists ? "1" : "2");
                console.log(exists);
                if (!exists) {
                    found_HLSFile = true
                }
                expect(found_HLSFile).to.equal(true);
                done()
            });
        })
        //2018-11-5跳过测试facialDetect图片
        // it("After delete tube,check live channel facialDetect files should be exist", function (done) {
        //     let tenant_db = tenant_account_data.tenant_admin.tenant_name
        //     let found_facialDetect = false;
        //     const facialDetect = `/var/panel/library/video/live/output/${tenant_db}/facialDetect/${live_channel_id}`;
        //     fs.exists(facialDetect, function (exists) {
        //         console.log(exists);
        //         if (exists) {
        //             found_facialDetect = true
        //         }
        //         expect(found_facialDetect).to.equal(true);
        //         done()
        //     });
        // })
        it("After delete tube,check live channel mp4Archive files should be exist", function (done) {
            let tenant_db = tenant_account_data.tenant_admin.tenant_name
            let found_mp4Archive = false;
            const mp4Archive = `/var/panel/library/video/live/output/${tenant_db}/mp4Archive/${live_channel_id}`;
            fs.exists(mp4Archive, function (exists) {
                console.log(exists);
                if (exists) {
                    found_mp4Archive = true
                }
                expect(found_mp4Archive).to.equal(true);
                done()
            });
        })
        it("After delete tube,check live channel thumbnails files should be exist", function (done) {
            let tenant_db = tenant_account_data.tenant_admin.tenant_name
            let found_thumbnails = false;
            const thumbnails = `/var/panel/library/video/live/output/${tenant_db}/thumbnails/${live_channel_id}`;
            fs.exists(thumbnails, function (exists) {
                console.log(exists);
                if (exists) {
                    found_thumbnails = true
                }
                expect(found_thumbnails).to.equal(true);
                done()
            });
        })
        it("After delete tube,check live channel tstsArchive files should be exist", function (done) {
            let tenant_db = tenant_account_data.tenant_admin.tenant_name
            let found_tstsArchive = false;
            const tsArchive = `/var/panel/library/video/live/output/${tenant_db}/tsArchive/${live_channel_id}`;
            fs.exists(tsArchive, function (exists) {
                console.log(exists);
                if (exists) {
                    found_tstsArchive = true
                }
                expect(found_tstsArchive).to.equal(true);
                done()
            });

        })
        after("Delete live channel", function (done) {
            API.delete("/liveChannel/" + live_channel_id)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log("940940")
                    console.log(res.body)
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    live_channel_total_count--
                    done();
                });
        });
    });

    describe("Check: delete live channel", function () {
        it("Create and run Tube:RTMP 2 using the created profile", function (done) {
            this.timeout(13000)
            API.post("/liveTube")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    source_type: "RTMP",
                    channel_profile: "RTMP 2",
                    proc_profile_id: live_profile_id,
                    out_type:
                    {
                        "hls_out": [
                            {
                                "isVod": false,
                                "legacy_hls_support": true
                            },
                            {
                                "isVod": true,
                                "legacy_hls_support": true
                            }
                        ],
                        "rtmp_out": 1,
                        "mp4_out": [
                            {
                                "isVod": false
                            },
                            {
                                "isVod": true
                            }
                        ]
                    },
                    autorestart: false
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.body)
                    expect(res.body.status).to.be.true;
                    expect(res.body.live_tube_id).to.be.a('string')
                    expect(res.body.port).to.be.a('number')
                    live_tube_total_count++;
                    live_tube_id = res.body.live_tube_id;
                    setTimeout(done, 10000)
                });
        });
        it("Create Live Channel", function (done) {
            this.timeout(60000);
            setTimeout(function () {
                API.post("/liveChannel")
                    .set("Authorization", "Bearer " + tenant_admin_token)
                    .send({
                        live_tube_id: live_tube_id
                    })
                    .expect(200)
                    .end(function (err, res) {
                        if (err) throw err;
                        console.log(res.body)
                        expect(res.body.status).to.be.equal(true)
                        expect(res.body.channel_name).to.be.a("string")
                        expect(res.body.inbound_url).to.be.a("string")
                        live_channel_total_count++;
                        stream_link = res.body.inbound_url
                        live_channel_id = res.body.channel_name;
                        if (res.body.inbound_url) {
                            FFmpeg();
                            expect(err, "if this case test fail,pls check streaming live!").to.be.equal(null);
                        }
                        done();
                    });
            }, 55000);

        });
        it("1.28 get live channel detail", function (done) {
            this.timeout(60000)
            API.get("/liveChannel/" + live_channel_id)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.body)
                    expect(res.body.status).to.be.equal(true)
                    setTimeout(done, 57000)
                });
        });
        it("before delete,check live channel facialDetect HLS files,should be exist", function (done) {
            let tenant_db = tenant_account_data.tenant_admin.tenant_name
            let found_HLSFile = false;
            const HLSFile = `/var/panel/library/video/live/output/${tenant_db}/${live_channel_id}`;
            fs.exists(HLSFile, function (exists) {
                console.log(exists);
                if (exists) {
                    found_HLSFile = true
                }
                expect(found_HLSFile).to.equal(true);
                done()
            });
        })
        //2018-11-5跳过测试facialDetect图片
        // it("before delete,check live channel facialDetect files,should be exist", function (done) {
        //     let tenant_db = tenant_account_data.tenant_admin.tenant_name
        //     let found_facialDetect = false;
        //     const facialDetect = `/var/panel/library/video/live/output/${tenant_db}/facialDetect/${live_channel_id}`;
        //     fs.exists(facialDetect, function (exists) {
        //         console.log(exists);
        //         if (exists) {
        //             found_facialDetect = true
        //         }
        //         expect(found_facialDetect).to.equal(true);
        //         done()
        //     });
        // })
        it("before delete,check live channel mp4Archive files,should be exist", function (done) {
            let tenant_db = tenant_account_data.tenant_admin.tenant_name
            let found_mp4Archive = false;
            const mp4Archive = `/var/panel/library/video/live/output/${tenant_db}/mp4Archive/${live_channel_id}`;
            fs.exists(mp4Archive, function (exists) {
                console.log(exists);
                if (exists) {
                    found_mp4Archive = true
                }
                expect(found_mp4Archive).to.equal(true);
                done()
            });
        })
        it("before delete,check live channel thumbnails files,should be exist", function (done) {
            let tenant_db = tenant_account_data.tenant_admin.tenant_name
            let found_thumbnails = false;
            const thumbnails = `/var/panel/library/video/live/output/${tenant_db}/thumbnails/${live_channel_id}`;
            fs.exists(thumbnails, function (exists) {
                console.log(exists);
                if (exists) {
                    found_thumbnails = true
                }
                expect(found_thumbnails).to.equal(true);
                done()
            });
        })
        it("before delete live channel,check live channel tsArchive files,should be exist", function (done) {
            let tenant_db = tenant_account_data.tenant_admin.tenant_name
            let found_tstsArchive = false;
            const tsArchive = `/var/panel/library/video/live/output/${tenant_db}/tsArchive/${live_channel_id}`;
            fs.exists(tsArchive, function (exists) {
                console.log(exists);
                if (exists) {
                    found_tstsArchive = true
                }
                expect(found_tstsArchive).to.equal(true);
                done()
            });

        })
        it("before delete,list Live channel,check record", function (done) {
            API.get("/liveChannel")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    expect(res.body.results).to.be.an("array");
                    expect(res.body.status).to.be.equal(true)
                    expect(res.body).to.have.all.keys("results", "previous", "hasPrevious", "next", "hasNext", "total_count", "status")
                    expect(res.body.results[0]).to.have.all.keys("channel_name")
                    expect(res.body.results[0].channel_name).to.be.equal(live_channel_id)
                    // expect(res.body.total_count).to.be.equal(live_channel_total_count);
                    done();
                });
        });
        it("delete live channel", function (done) {
            API.delete("/liveChannel/" + live_channel_id)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log("940940")
                    console.log(res.body)
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    live_channel_total_count--
                    done();
                });
        });
        it("after delete live channel,list Live channel,check record", function (done) {
            API.get("/liveChannel")
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
        it("after delete live channel,check live channel facialDetect HLS files,should be not exist", function (done) {
            let tenant_db = tenant_account_data.tenant_admin.tenant_name
            let found_HLSFile = false;
            const HLSFile = `/var/panel/library/video/live/output/${tenant_db}/${live_channel_id}`;
            fs.exists(HLSFile, function (exists) {
                console.log(exists);
                if (!exists) {
                    found_HLSFile = true
                }
                expect(found_HLSFile).to.equal(true);
                done()
            });
        })
        //2018-11-5跳过测试facialDetect图片
        // it("after delete live channel,check live channel facialDetect files,should be not exist", function (done) {
        //     let tenant_db = tenant_account_data.tenant_admin.tenant_name
        //     let found_facialDetect = false;
        //     const facialDetect = `/var/panel/library/video/live/output/${tenant_db}/facialDetect/${live_channel_id}`;
        //     fs.exists(facialDetect, function (exists) {
        //         console.log(exists);
        //         if (!exists) {
        //             found_facialDetect = true
        //         }
        //         expect(found_facialDetect).to.equal(true);
        //         done()
        //     });
        // })
        it("after delete live channel,check live channel mp4Archive files,should be not exist", function (done) {
            let tenant_db = tenant_account_data.tenant_admin.tenant_name
            let found_mp4Archive = false;
            const mp4Archive = `/var/panel/library/video/live/output/${tenant_db}/mp4Archive/${live_channel_id}`;
            fs.exists(mp4Archive, function (exists) {
                console.log(exists);
                if (!exists) {
                    found_mp4Archive = true
                }
                expect(found_mp4Archive).to.equal(true);
                done()
            });
        })
        it("after delete live channel,check live channel thumbnails files,should be not exist", function (done) {
            let tenant_db = tenant_account_data.tenant_admin.tenant_name
            let found_thumbnails = false;
            const thumbnails = `/var/panel/library/video/live/output/${tenant_db}/thumbnails/${live_channel_id}`;
            fs.exists(thumbnails, function (exists) {
                console.log(exists);
                if (!exists) {
                    found_thumbnails = true
                }
                expect(found_thumbnails).to.equal(true);
                done()
            });
        })
        it("after delete live channel,check live channel tsArchive files,should be not exist", function (done) {
            let tenant_db = tenant_account_data.tenant_admin.tenant_name
            let found_tstsArchive = false;
            const tsArchive = `/var/panel/library/video/live/output/${tenant_db}/tsArchive/${live_channel_id}`;
            fs.exists(tsArchive, function (exists) {
                console.log(exists);
                if (!exists) {
                    found_tstsArchive = true
                }
                expect(found_tstsArchive).to.equal(true);
                done()
            });

        })
        after('delete LIVE tube', function (done) {
            API.delete('/liveTube/' + live_tube_id)
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer ' + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) done(err);
                    console.log(res.body)
                    expect(res.body.status).to.be.equal(true)
                    live_tube_total_count--
                    done()
                });
        })
    });

    describe("check: end live channel", function () {
        it("Create and run Tube:RTMP 3 using the created profile", function (done) {
            this.timeout(12000)
            API.post("/liveTube")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    source_type: "RTMP",
                    channel_profile: "RTMP 3",
                    proc_profile_id: live_profile_id,
                    out_type:
                    {
                        "hls_out": [
                            {
                                "isVod": false,
                                "legacy_hls_support": true
                            },
                            {
                                "isVod": true,
                                "legacy_hls_support": true
                            }
                        ],
                        "rtmp_out": 1,
                        "mp4_out": [
                            {
                                "isVod": true
                            }
                        ]
                    },
                    autorestart: false
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.body)
                    expect(res.body.status).to.be.true;
                    expect(res.body.live_tube_id).to.be.a('string')
                    expect(res.body.port).to.be.a('number')
                    live_tube_total_count++;
                    live_tube_id = res.body.live_tube_id;
                    setTimeout(done, 10000)
                });
        });
        it("Create Live Channel", function (done) {
            this.timeout(60000);
            setTimeout(function () {
                API.post("/liveChannel")
                    .set("Authorization", "Bearer " + tenant_admin_token)
                    .send({
                        live_tube_id: live_tube_id
                    })
                    .expect(200)
                    .end(function (err, res) {
                        if (err) throw err;
                        console.log(res.body)
                        expect(res.body.status).to.be.equal(true)
                        expect(res.body.channel_name).to.be.a("string")
                        expect(res.body.inbound_url).to.be.a("string")
                        live_channel_total_count++;
                        stream_link = res.body.inbound_url
                        live_channel_id = res.body.channel_name;
                        if (res.body.inbound_url) {
                            FFmpeg();
                            expect(err, "if this case test fail,pls check streaming live!").to.be.equal(null);
                        }
                        done();
                    });
            }, 55000);

        });
        it("1.28 get live channel detail", function (done) {
            this.timeout(60000)
            API.get("/liveChannel/" + live_channel_id)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.body)
                    expect(res.body.status).to.be.equal(true)
                    setTimeout(done, 57000)
                });
        });
        it("before end live channel,check live channel HLS files should be exist", function (done) {
            let tenant_db = tenant_account_data.tenant_admin.tenant_name
            let found_HLSFile = false;
            const HLSFile = `/var/panel/library/video/live/output/${tenant_db}/${live_channel_id}`;
            fs.exists(HLSFile, function (exists) {
                // console.log(exists ? "1" : "2");
                console.log(exists);
                if (exists) {
                    found_HLSFile = true
                }
                expect(found_HLSFile).to.equal(true);
                done()
            });
        })
        //2018-11-5跳过测试facialDetect图片
        // it("before end live channel,check live channel facialDetect files should be exist", function (done) {
        //     let tenant_db = tenant_account_data.tenant_admin.tenant_name
        //     let found_facialDetect = false;
        //     const facialDetect = `/var/panel/library/video/live/output/${tenant_db}/facialDetect/${live_channel_id}`;
        //     fs.exists(facialDetect, function (exists) {
        //         console.log(exists);
        //         if (exists) {
        //             found_facialDetect = true
        //         }
        //         expect(found_facialDetect).to.equal(true);
        //         done()
        //     });
        // })
        it("before end live channel,check live channel mp4Archive files should be exist", function (done) {
            let tenant_db = tenant_account_data.tenant_admin.tenant_name
            let found_mp4Archive = false;
            const mp4Archive = `/var/panel/library/video/live/output/${tenant_db}/mp4Archive/${live_channel_id}`;
            fs.exists(mp4Archive, function (exists) {
                console.log(exists);
                if (exists) {
                    found_mp4Archive = true
                }
                expect(found_mp4Archive).to.equal(true);
                done()
            });
        })
        it("before end live channel,check live channel thumbnails files should be exist", function (done) {
            let tenant_db = tenant_account_data.tenant_admin.tenant_name
            let found_thumbnails = false;
            const thumbnails = `/var/panel/library/video/live/output/${tenant_db}/thumbnails/${live_channel_id}`;
            fs.exists(thumbnails, function (exists) {
                console.log(exists);
                if (exists) {
                    found_thumbnails = true
                }
                expect(found_thumbnails).to.equal(true);
                done()
            });
        })
        it("before end live channel,check live channel tsArchive files should be exist", function (done) {
            let tenant_db = tenant_account_data.tenant_admin.tenant_name
            let found_tstsArchive = false;
            const tsArchive = `/var/panel/library/video/live/output/${tenant_db}/tsArchive/${live_channel_id}`;
            fs.exists(tsArchive, function (exists) {
                console.log(exists);
                if (exists) {
                    found_tstsArchive = true
                }
                expect(found_tstsArchive).to.equal(true);
                done()
            });
        })
        it("before end,list Live channel,check record", function (done) {
            API.get("/liveChannel")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    expect(res.body.results).to.be.an("array");
                    expect(res.body.status).to.be.equal(true)
                    expect(res.body).to.have.all.keys("results", "previous", "hasPrevious", "next", "hasNext", "total_count", "status")
                    expect(res.body.results[0].channel_name).to.be.equal(live_channel_id)
                    // expect(res.body.total_count).to.be.equal(live_channel_total_count);
                    done();
                });
        });
        it('End LIVE channel', function (done) {
            API.put('/liveChannel/' + live_channel_id)
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer ' + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) done(err);
                    console.log(res.body)
                    expect(res.body.status).to.be.equal(true)
                    done()
                });
        })
        it("after end,list Live channel,check record", function (done) {
            this.timeout(10000);
            API.get("/liveChannel")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    expect(res.body.results).to.be.an("array");
                    expect(res.body.status).to.be.equal(true)
                    expect(res.body).to.have.all.keys("results", "previous", "hasPrevious", "next", "hasNext", "total_count", "status")
                    expect(res.body.results[0]).to.have.all.keys("channel_name")
                    expect(res.body.results[0].channel_name).to.be.equal(live_channel_id)
                    // expect(res.body.total_count).to.be.equal(live_channel_total_count);
                    setTimeout(done, 8000);
                });
        });
        
        it("after end live channel,check live channel HLS files should be not exist,onle delete HLS files", function (done) {
            let tenant_db = tenant_account_data.tenant_admin.tenant_name
            let found_HLSFile = false;
            const HLSFile = `/var/panel/library/video/live/output/${tenant_db}/${live_channel_id}`;
            fs.exists(HLSFile, function (exists) {
                // console.log(exists ? "1" : "2");
                console.log(exists);
                if (!exists) {
                    found_HLSFile = true
                }
                expect(found_HLSFile).to.equal(true);
                done()
            });
        })
        //2018-11-5跳过测试facialDetect图片
        // it("after end live channel,check live channel facialDetect files should be exist", function (done) {
        //     let tenant_db = tenant_account_data.tenant_admin.tenant_name
        //     let found_facialDetect = false;
        //     const facialDetect = `/var/panel/library/video/live/output/${tenant_db}/facialDetect/${live_channel_id}`;
        //     fs.exists(facialDetect, function (exists) {
        //         console.log(exists);
        //         if (exists) {
        //             found_facialDetect = true
        //         }
        //         expect(found_facialDetect).to.equal(true);
        //         done()
        //     });
        // })
        it("after end live channel,check live channel mp4Archive files should be exist", function (done) {
            let tenant_db = tenant_account_data.tenant_admin.tenant_name
            let found_mp4Archive = false;
            const mp4Archive = `/var/panel/library/video/live/output/${tenant_db}/mp4Archive/${live_channel_id}`;
            fs.exists(mp4Archive, function (exists) {
                console.log(exists);
                if (exists) {
                    found_mp4Archive = true
                }
                expect(found_mp4Archive).to.equal(true);
                done()
            });
        })
        it("after end live channel,check live channel thumbnails files should be exist", function (done) {
            let tenant_db = tenant_account_data.tenant_admin.tenant_name
            let found_thumbnails = false;
            const thumbnails = `/var/panel/library/video/live/output/${tenant_db}/thumbnails/${live_channel_id}`;
            fs.exists(thumbnails, function (exists) {
                console.log(exists);
                if (exists) {
                    found_thumbnails = true
                }
                expect(found_thumbnails).to.equal(true);
                done()
            });
        })
        it("after end live channel,check live channel tsArchive files should be exist", function (done) {
            let tenant_db = tenant_account_data.tenant_admin.tenant_name
            let found_tstsArchive = false;
            const tsArchive = `/var/panel/library/video/live/output/${tenant_db}/tsArchive/${live_channel_id}`;
            fs.exists(tsArchive, function (exists) {
                console.log(exists);
                if (exists) {
                    found_tstsArchive = true
                }
                expect(found_tstsArchive).to.equal(true);
                done()
            });
        })
        after("delete live channel", function (done) {
            API.delete("/liveChannel/" + live_channel_id)
                .set('Content-Type', 'application/json')
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log("940940")
                    console.log(res.body)
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    live_channel_total_count--
                    done();
                });
        });
        after('delete LIVE tube', function (done) {
            API.delete('/liveTube/' + live_tube_id)
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer ' + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) done(err);
                    console.log(res.body)
                    expect(res.body.status).to.be.equal(true)
                    live_tube_total_count--
                    done()
                });
        })
    });

    /*
    //测试RTMP图片在90s之后会自动删除
    describe("Test RTMP images will be deleted automatically after 90s", function() {

        it("Create a LiveTube to check the image", function(done) {
            this.timeout(10000);
            API.post("/liveTube")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "source_type": "RTMP",
                    "proc_profile_id": live_profile_id,
                    "out_type": {
                    "hls_out": [
                      {
                        "isVod": false,
                        "legacy_hls_support": true
                      },
                      {
                        "isVod": true,
                        "legacy_hls_support": false
                      }
                      ],
                    "rtmp_out": 1,
                    "mp4_out": [
                        {
                        "isVod": false
                      },
                      {
                        "isVod": true
                      }
                      ]
                    }
                })
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    live_tube_id_1 = body.live_tube_id;
                    expect(body.status).to.be.true;
                    setTimeout(done, 8000);
                });
        });
    
        it("Create a liveChannel to check the picture", function(done){
            this.timeout(300000);
            API.post("/liveChannel")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "live_tube_id": live_tube_id_1
                })
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    stream_link_1 = body.inbound_url;
                    live_channel_name_1 = body.channel_name;
                    expect(body.status).to.be.true;
                    if(body.inbound_url){
                        console.log(stream_link_1);
                        FFmpeg_1();
                    }
                    setTimeout(done, 285000);
                });
        });
    
        it('Get RTMP thumbnail file', function (done) {
            API.post('/image')
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer '+tenant_admin_token)
                .send({
                    "image_type":"thumbnail",
                    "media_type":"LIVE",
                    "media_id":live_channel_name_1          
                })
                .expect(200)
                .end(function (err, res) {
                    console.log(res.body)
                    if (err) done(err);
                    let thumbnail_url_2 = res.body.image[0]
                    thumbnail_2 =  thumbnail_url_2.substring(thumbnail_url_2.indexOf("thumbnail")+36, thumbnail_url_2.length)
                    console.log(thumbnail_2)
                    expect(res.body.status).to.be.equal(true)
                    expect(res.body.total_count).to.be.above(0)
                    done();
                });
        });
    
        it('Get RTMP facialDetect file', function (done) {
            this.timeout(95000)
            API.post('/image')
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer '+tenant_admin_token)
                .send({
                    "image_type":"facialDetect",
                    "media_type":"LIVE",
                    "media_id":live_channel_name_1
                  })
                .expect(200)
                .end(function (err, res) {
                    console.log(res.body)
                    if (err) done(err);
                    let facialdetect_url_2 = res.body.image[0]
                    facialdetect_2 =  facialdetect_url_2.substring(facialdetect_url_2.indexOf("facialDetect")+38, facialdetect_url_2.length)
                    console.log(facialdetect_2)
                    expect(res.body.status).to.be.equal(true)
                    expect(res.body.total_count).to.be.above(0)
                    setTimeout(done, 93000)
                });
        });
    
        it("Second time push stream", function(done){
            this.timeout(300000)
            API.get("/liveChannel/" + live_channel_name_1)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    stream_link_1 = body.source_url;
                    if(body.source_url){
                        console.log(stream_link_1);
                        FFmpeg_1();
                    }
                    setTimeout(done, 285000);
                });
        });
    
        //检查90s后RTMP thumbnail图片是否删除

        // it("RTMP thumbnail: After 90S, check whether the thumbnail is deleted successfully.should be not exist", function(done) {
        //     let tenant_db = tenant_account_data.tenant_admin.tenant_name
        //     let found_thumbnail = false;
        //     const thumbnail_path = `/var/panel/library/video/live/output/${tenant_db}/thumbnails/${live_channel_name_1}/`;
        //     console.log(thumbnail_path+thumbnail_2)
        //     fs.exists(thumbnail_path+thumbnail_2, function(exists) {
        //         console.log(exists);
        //         if(exists == false){
        //             found_thumbnail=true
        //         }
        //         expect(found_thumbnail).to.equal(true);
        //         done();
        //     });
        // });

    
        //检查测试90s后RTMP facialdetect图片是否删除
        it("RTMP facialdetect: After 90S, check whether the facialdetect is deleted successfully.should be not exist", function(done) {
            let tenant_db = tenant_account_data.tenant_admin.tenant_name
            let found_facialdetect = false;
            const facialdetect_path = `/var/panel/library/video/live/output/${tenant_db}/facialDetect/${live_channel_name_1}/`;
            console.log(facialdetect_path+facialdetect_2)
            fs.exists(facialdetect_path+facialdetect_2, function(exists) {
                console.log(exists);
                if(exists == false){
                    found_facialdetect=true
                }
                expect(found_facialdetect).to.equal(true);
                done();
            });
        });
    });

    describe("Clean up", function() {	
        it("Delete 一个profile", function(done) {
            API.delete("/profile/" + live_profile_id)
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
    */
    //============2018-10-18新增 H265==============
    describe("1.22 Create H265 Live tube", function () {
        it("create H265 Live profile", function (done) {
            this.timeout(10000);
            setTimeout(function () {
                API.post("/profile")
                    .set("Authorization", "Bearer " + tenant_admin_token)
                    .send(profile_data.live_profile_h265)
                    .expect(200)
                    .end(function (err, res) {
                        if (err) throw err;
                        let body = JSON.parse(res.text);
                        console.log(body);
                        live_profile_id_h265 = body.proc_profile_id;
                        expect(body.status).to.be.true;
                        done();
                    });
            }, 8000);
        });

        it("172-1 Create H265 Live tube", function (done) {
            this.timeout(10000);
            API.post("/liveTube")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "source_type": "RTMP",
                    "channel_profile": "h265 auto live",
                    "proc_profile_id": live_profile_id_h265,
                    "out_type":
                    {
                        "hls_out": [
                            {
                                "isVod": false,
                                "legacy_hls_support": false
                            },
                            {
                                "isVod": true,
                                "legacy_hls_support": false
                            }
                        ],
                        "rtmp_out": 0
                    },
                    "autorestart": true
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.body)
                    expect(res.body.status).to.be.true;
                    expect(res.body.live_tube_id).to.be.a('string');
                    expect(res.body.port).to.be.a('number');
                    live_tube_total_count++;
                    live_tube_id_h265 = res.body.live_tube_id;
                    setTimeout(done, 8000);
                });
        });

        it("207-1 Create H265 Live Channel", function (done) {
            this.timeout(50000);
            API.post("/liveChannel")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "live_tube_id": live_tube_id_h265
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    console.log(body);
                    channel_name_h265 = body.channel_name;
                    stream_link = body.inbound_url;
                    if (body.inbound_url) {
                        console.log(stream_link);
                        FFmpeg();
                        expect(err, "if this case test fail,pls check streaming live!").to.be.equal(null);
                    };
                    setTimeout(done, 45000);
                });
        });

        it("test 207-1 H265 Live Channel hls stream", function (done) {
            API.get("/liveChannel/" + channel_name_h265)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    expect(body.playbackURL.hlsOutput[0]).to.have.all.keys("isVod", "hls_version", "hlsURL", "hlsURL_cdn")
                    expect(body.playbackURL.hlsOutput[0].hls_version).to.be.equal(6)
                    expect(body.playbackURL.hlsOutput[0].isVod).to.be.false
                    done();
                });
        });

        it("test 207-1 End H265 live channel", function (done) {
            this.timeout(10000);
            API.put("/liveChannel/" + channel_name_h265)
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

        it("test 207-1 H265 Live Channel hls active", function (done) {
            API.get("/liveChannel/" + channel_name_h265)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    expect(body.playbackURL.hlsOutput[1]).to.have.all.keys("isVod", "hls_version", "archive_duration", "archive_dateupload", "hlsURL", "hlsURL_cdn")
                    expect(body.playbackURL.hlsOutput[1].hls_version).to.be.equal(6)
                    expect(body.playbackURL.hlsOutput[1].isVod).to.be.true
                    done();
                });
        });

        it("172-2 Create H265 Live tube，legacy_hls_support=true", function (done) {
            this.timeout(10000);
            API.post("/liveTube")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "source_type": "RTMP",
                    "channel_profile": "h265 auto live",
                    "proc_profile_id": live_profile_id_h265,
                    "out_type":
                    {
                        "hls_out": [
                            {
                                "isVod": false,
                                "legacy_hls_support": false
                            },
                            {
                                "isVod": true,
                                "legacy_hls_support": true
                            }
                        ],
                        "rtmp_out": 0
                    },
                    "autorestart": true
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.body)
                    expect(res.body.status).to.be.false;
                    expect(res.body.err.code).to.equal(400);
                    expect(res.body.err.message).to.equal("legacy_hls_support not supported with h265");
                    setTimeout(done, 8000);
                });
        });

        after("delete live profile", function (done) {
            API.delete("/profile/" + live_profile_id_h265)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    done();
                })
        })

    });

    //====↓========2018-10-24新增 自适应bitrate==============↓
    describe("1.7 Create multiple bitrate profiles", function () {
        it("57-2 Create multiple bitratre live profiles", function (done) {
            this.timeout(6000);
            setTimeout(function () {
                API.post("/profile")
                    .set("Authorization", "Bearer " + tenant_admin_token)
                    .send(profile_data.live_profile_multiple_bitrate)
                    .expect(200)
                    .end(function (err, res) {
                        if (err) throw err;
                        let body = JSON.parse(res.text);
                        console.log(body);
                        live_profile_id_multiple_bitrate = body.proc_profile_id;
                        expect(body.status).to.be.true;
                        done();
                    });
            }, 4000);
        });

        
        it("57-3 Creating multiple bitratre profiles failed, codec is invalid", function (done) {
            this.timeout(6000);
            setTimeout(function () {
                API.post("/profile")
                    .set("Authorization", "Bearer " + tenant_admin_token)
                    .send(profile_data.codec_invalid_profile)
                    .expect(200)
                    .end(function (err, res) {
                        if (err) throw err;
                        let body = JSON.parse(res.text);
                        console.log(body);
                        expect(body.status).to.be.false;
                        expect(body.err.code).to.be.equal(400);
                        expect(body.err.message).to.be.equal("video0 codec invalid");
                        done();
                    });
            }, 4000);
        });

        it("57-4 Create no transcode live profile", function (done) {
            this.timeout(6000);
            setTimeout(function () {
                API.post("/profile")
                    .set("Authorization", "Bearer " + tenant_admin_token)
                    .send(profile_data.no_transcode_live_profile)
                    .expect(200)
                    .end(function (err, res) {
                        if (err) throw err;
                        let body = JSON.parse(res.text);
                        console.log(body);
                        no_transcode_live_profile_id = body.proc_profile_id;
                        expect(body.status).to.be.true;
                        done();
                    });
            }, 4000);
        });
    });

    describe("1.22 Create adaptive bitrate Live tube", function(){
        it("190-1 Create a live tube without transcode", function(done){
            this.timeout(10000);
            API.post("/liveTube")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "source_type": "RTMP",
                    "channel_profile": "no transcode live",
                    "proc_profile_id": no_transcode_live_profile_id,
                    "out_type":
                    {
                        "hls_out": [
                            {
                                "isVod": false,
                                "legacy_hls_support": false
                            },
                            {
                                "isVod": true,
                                "legacy_hls_support": false
                            }
                        ],
                        "rtmp_out": 1
                    },
                    "autorestart": true
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.body)
                    live_tube_id_no_transcode = res.body.live_tube_id;
                    expect(res.body.status).to.be.true;                    
                    setTimeout(done, 8000);
                });
        });

        it("test 190-1:Create no transcode Live Channel", function (done) {
            this.timeout(50000);
            API.post("/liveChannel")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "live_tube_id": live_tube_id_no_transcode
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    console.log(body);
                    channel_name_no_transcode = body.channel_name;
                    stream_link = body.inbound_url;
                    if (body.inbound_url) {
                        console.log(stream_link);
                        FFmpeg();
                        expect(err, "if this case test fail,pls check streaming live!").to.be.equal(null);
                    };
                    setTimeout(done, 45000);
                });
        });

        it("test 190-1:Get no transcode Live Channel", function (done) {
            API.get("/liveChannel/" + channel_name_no_transcode)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    expect(res.body.playbackURL.flvOutput[0]).to.have.all.keys("flvURL");
                    expect(res.body.playbackURL.hlsOutput[0]).to.have.all.keys("isVod", "hls_version", "hlsURL", "hlsURL_cdn");
                    done()
                });
        });

        it("190-2 Adaptive bitrate, support hls stream and archive output.", function(done){
            this.timeout(10000);
            API.post("/liveTube")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "source_type": "RTMP",
                    "proc_profile_id": live_profile_id_multiple_bitrate,
                    "out_type": {
                      "hls_out": [
                        {
                          "isVod": false,
                          "legacy_hls_support": false
                        },
                        {
                          "isVod": true,
                          "legacy_hls_support": false
                        }
                      ],
                      "rtmp_out": 0
                    },
                    "autorestart": true
                  })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.body)
                    live_tube_id_bitrate_arcAndStr = res.body.live_tube_id;
                    expect(res.body.status).to.be.true;                  
                    setTimeout(done, 8000);
                });
        });

        it("test 190-2:Create multiple_bitrate Live Channel-only hls stream", function (done) {
            this.timeout(50000);
            API.post("/liveChannel")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "live_tube_id": live_tube_id_bitrate_arcAndStr
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    console.log(body);
                    channel_name_bitrate_arcAndStr = body.channel_name;
                    stream_link = body.inbound_url;
                    if (body.inbound_url) {
                        console.log(stream_link);
                        FFmpeg();
                        expect(err, "if this case test fail,pls check streaming live!").to.be.equal(null);
                    };
                    setTimeout(done, 45000);
                });
        });

        it("test 190-2:Get multiple_bitrate Live Channel-hls stream and archive", function (done) {
            API.get("/liveChannel/" + channel_name_bitrate_arcAndStr)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    expect(res.body.playbackURL).to.not.have.all.keys("flvOutput");
                    expect(res.body.playbackURL.hlsOutput[0]).to.have.all.keys("isVod", "hls_version", "hlsURL", "hlsURL_cdn");
                    expect(res.body.playbackURL.hlsOutput[1]).to.have.all.keys("isVod", "hls_version");
                    done()
                });
        });

        it("test 190-2:End multiple_bitrate Live Channel-hls stream and archive", function (done) {
            this.timeout(8000)
            API.put("/liveChannel/" + channel_name_bitrate_arcAndStr)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    setTimeout(done, 6000)
                });
        });

        it("test 190-2:Get multiple_bitrate Live Channel-hls stream and archive", function (done) {
            API.get("/liveChannel/" + channel_name_bitrate_arcAndStr)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    expect(body.playbackURL).to.not.have.all.keys("flvOutput");
                    expect(body.playbackURL.hlsOutput[0]).to.have.all.keys("isVod", "hls_version");
                    expect(body.playbackURL.hlsOutput[1]).to.have.all.keys("isVod", "hls_version", "archive_duration", "archive_dateupload", "hlsURL", "hlsURL_cdn");
                    done()
                });
        });

        it("190-3 Adaptive bitrate, only supports hls stream output", function(done){
            this.timeout(10000);
            API.post("/liveTube")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "source_type": "RTMP",
                    "proc_profile_id": live_profile_id_multiple_bitrate,
                    "out_type": {
                        "hls_out": [
                          {
                            "isVod": false,
                            "legacy_hls_support": false
                          }
                        ],
                        "rtmp_out": 0
                      },
                      "autorestart": true
                    })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.body)
                    live_tube_id_multiple_bitrate = res.body.live_tube_id;
                    expect(res.body.status).to.be.true;                    
                    setTimeout(done, 8000);
                });
        });

        it("test 190-3:Create multiple_bitrate Live Channel-only hls stream", function (done) {
            this.timeout(50000);
            API.post("/liveChannel")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "live_tube_id": live_tube_id_multiple_bitrate
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    channel_name_multiple_bitrate = body.channel_name;
                    expect(body.status).to.be.true;
                    stream_link = body.inbound_url;
                    if (body.inbound_url) {
                        console.log(stream_link);
                        FFmpeg();
                        expect(err, "if this case test fail,pls check streaming live!").to.be.equal(null);
                    };
                    setTimeout(done, 45000);
                });
        });

        it("test 190-3:Get multiple_bitrate Live Channel-only hls stream", function (done) {
            API.get("/liveChannel/" + channel_name_multiple_bitrate)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    expect(res.body.playbackURL).to.not.have.all.keys("flvOutput");
                    expect(res.body.playbackURL.hlsOutput[0]).to.have.all.keys("isVod", "hls_version", "hlsURL", "hlsURL_cdn");
                    done()
                });
        });

        it("190-4 Adaptive bitrate, only supports hls archive output.", function(done){
            this.timeout(10000);
            API.post("/liveTube")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "source_type": "RTMP",
                    "proc_profile_id": live_profile_id_multiple_bitrate,
                    "out_type": {
                        "hls_out": [
                          {
                            "isVod": true,
                            "legacy_hls_support": false
                          }
                        ],
                        "rtmp_out": 0
                      },
                      "autorestart": true
                    })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.body)
                    live_tube_id_bitrate_archive = res.body.live_tube_id
                    expect(res.body.status).to.be.true;               
                    setTimeout(done, 8000);
                });
        });

        it("test 190-4:Create multiple_bitrate Live Channel-only hls archive", function (done) {
            this.timeout(50000);
            API.post("/liveChannel")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "live_tube_id": live_tube_id_bitrate_archive
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    channel_name_bitrate_archive = body.channel_name;
                    expect(body.status).to.be.true;
                    stream_link = body.inbound_url;
                    if (body.inbound_url) {
                        console.log(stream_link);
                        FFmpeg();
                        expect(err, "if this case test fail,pls check streaming live!").to.be.equal(null);
                    };
                    setTimeout(done, 45000);
                });
        });

        it("test 190-4:End multiple_bitrate Live Channel", function (done) {
            this.timeout(8000)
            API.put("/liveChannel/" + channel_name_bitrate_archive)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    setTimeout(done, 6000)
                });
        });

        it("test 190-4:Get multiple_bitrate Live Channel-hls archive", function (done) {
            API.get("/liveChannel/" + channel_name_bitrate_archive)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    expect(body.playbackURL).to.not.have.all.keys("flvOutput");
                    expect(body.playbackURL.hlsOutput[0]).to.have.all.keys("isVod", "hls_version", "archive_duration", "archive_dateupload", "hlsURL", "hlsURL_cdn");
                    done()
                });
        });

        it("190-5 Adaptive bitrate, only supports hls stream output, legacy_hls_support=true, prompt error", function(done){
            this.timeout(10000);
            API.post("/liveTube")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "source_type": "RTMP",
                    "proc_profile_id": live_profile_id_multiple_bitrate,
                    "out_type": {
                        "hls_out": [
                          {
                            "isVod": false,
                            "legacy_hls_support": true
                          }
                        ],
                        "rtmp_out": 0
                      },
                      "autorestart": true
                    })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.body)
                    expect(res.body.status).to.be.false;
                    expect(res.body.err.code).to.be.equal(400);
                    expect(res.body.err.message).to.equal("legacy_hls_support not supported with multiple video info set");                    
                    setTimeout(done, 8000);
                });
        });

        it("190-6 Adaptive bitrate, when rtmp output is turned on, an error is displayed.", function(done){
            this.timeout(10000);
            API.post("/liveTube")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "source_type": "RTMP",
                    "proc_profile_id": live_profile_id_multiple_bitrate,
                    "out_type": {
                        "hls_out": [
                          {
                            "isVod": false,
                            "legacy_hls_support": false
                          }
                        ],
                        "rtmp_out": 1
                      },
                      "autorestart": true
                    })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.body)
                    expect(res.body.status).to.be.false;
                    expect(res.body.err.code).to.be.equal(400);
                    expect(res.body.err.message).to.equal("rtmp_out not supported with multiple video info set");                    
                    setTimeout(done, 8000);
                });
        });
    });
    //====↑========2018-10-24新增 自适应bitrate==============↑

    //============2018-10-26新增默认设置==============↓
    describe("1.22 Create default setting Live tube", function () {

        it("158 The default profile creates a tube, the default out_type (only hls stream output)", function (done) {
            this.timeout(8000);
            API.post("/liveTube")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "source_type": "RTMP"
                    })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.body)
                    live_tube_id_default_set = res.body.live_tube_id;
                    expect(res.body.status).to.be.true;
                    expect(res.body.live_tube_id).to.be.a('string');
                    expect(res.body.port).to.be.a('number');
                    setTimeout(done, 6000);
                });
        });

        it("Check 158", function (done) {
            API.get("/liveTube/" + live_tube_id_default_set)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.body)
                    expect(res.body.status).to.be.true;
                    expect(res.body.channel_profile).to.equal(live_tube_id_default_set);
                    expect(res.body.channel_archiving).to.be.false;
                    expect(res.body.out_type.hls_out[0].isVod).to.be.false;
                    expect(res.body.out_type.hls_out[0].legacy_hls_support).to.be.false;
                    expect(res.body.out_type.rtmp_out).to.equal(0);
                    expect(res.body.out_type.dash_out).to.equal(0);
                    expect(res.body._id).to.equal(res.body.channel_profile);
                    done()
                });
        });
    });

    describe("Clear DB data", function () {

        before("Get orchestrator_admin token", function (done) {
            API.post("/orchestrator_admin/login")
                .send(orchestrator_account_data.orc_admin)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    if (body.status == false) {
                        console.log(body);
                    };
                    orchestrator_admin_token_1 = body.orchestrator_admin_token
                    expect(body.status).to.be.true;
                    expect(body.username).to.equal("orc_admin")
                    done();
                });
        });

        it("Delete DB", function (done) {
            this.timeout(70000);
            API.delete("/clearDB/autotest")
                .set("Authorization", "Bearer " + orchestrator_admin_token_1)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    if (body.status == false) {
                        console.log(body);
                    };
                    expect(body.status).to.be.true;
                    setTimeout(done, 60000);
                });
        });
    });

    describe("Recreate DB", function () {

        it("Create Tenant db", function (done) {
            API.post("/tenant")
                .set("Authorization", "Bearer " + orchestrator_admin_token_1)
                .send(tenant_data.tenant_db)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body)
                    tenant_db_id = body.tenant_db_id;
                    expect(body.status).to.be.true;
                    done();
                });
        });

        it("Create Tenant admin", function (done) {
            API.post("/tenant_admin")
                .set("Authorization", "Bearer " + orchestrator_admin_token_1)
                .send(tenant_account_data.tenant_admin)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body)
                    tenant_admin_id = body._id;
                    expect(body.status).to.be.true;
                    expect(body.username).to.be.equal(tenant_account_data.tenant_admin.username);
                    done();
                });
        });
    });
});