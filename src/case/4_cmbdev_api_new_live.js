const config = require("../../config");
const common = require("../common/common");
const API = common.api;
const OMP_API = common.omp_api;
const expect = require("chai").expect;
const tenant_account_data = require("../../data/tenant_account.json");
const orchestrator_account_data = require("../../data/orchestrator_account.json");
const profile_data = require("../../data/profile.json");
const tenant_data = require("../../data/tenant.json");
const videopath = config.source.video;
const live_tube_data = require("../../data/live_tube.json");
//const ts_live_url = "http://172.16.1.20/main";
const ts_live_url = "http://61.216.153.218:8001/ext";    //客户第三方源

const omp_host = "172.16.1.215";
const orchestrator_host = "172.16.1.87";

delete require.cache[require.resolve('../../data/profile.json')];

let live_profile_id = "";

global.orchestrator_admin_token = "";
global.tenant_admin_token = "";
global.tenant_admin_token_1 = "";

let live_tube_id_1 = "";
let channel_name_1 = "";
let live_tube_id_2 = "";
let tube2_kernel = "";
let live_tube_id_3 = "";
let tube3_kernel = "";
let live_tube_id_4 = "";
let channel_name_4 = "";
let tube4_kernel = "";
let live_tube_id_5 = "";
let channel_name_5 = "";
let live_tube_id_6 = "";
let channel_name_6 = "";
let channel_name_6_1 = "";
let live_tube_id_7 = "";
let channel_name_7 = "";
let tube7_kernel = "";
let tube6_kernel = "";

let live_tube_id_14 = "";
let channel_name_14 = "";
let channel_name_14_1 = "";
let live_tube_id_15 = "";
let channel_name_15 = "";
let channel_name_15_1 = "";

let onlyVideo_live_Profile_id
let onlyVideo_live_tube_id
let onlyVideo_channel_name
let onlyAudio_live_Profile_id
let onlyAudio_live_tube_id
let onlyAudio_channel_name

let ts_live_tube_id_1 = "";
let ts_channel_name_1 = "";
let ts_live_tube_id_2 = "";
let ts_channel_name_2 = "";
let ts_live_tube_id_3 = "";
let ts_channel_name_3 = "";

let ts_kernel_1 = "";
let ts_kernel_1_1
let hlsURL_1 = "";
let flvURL_1 = "";
let mp4URL_cdn_1 = "";
let hlsURL_cdn_1 = "";
let ts_kernel_2 = "";

let thumbnail_1 = "";
let facialdetect_1 = "";

const callfile = require('child_process');
let stream_link = "";
let input_file = "/var/backend/orchestrator_auto_test/source/sample.mp4";
function FFmpeg() {
    callfile.execFile('/var/backend/orchestrator_auto_test/ffmpeg.sh', [input_file, stream_link], null, function (err, stdout, stderr) {
        console.log("Push flow information:");
        // callback(err, stdout, stderr);
        // if(err){
        //     throw err;
        // }
        console.log(err);
        console.log(stdout);
        console.log(stderr);
    });
};

function OMPrestart_different() {
    callfile.execFile("/var/backend/orchestrator_auto_test/auto_restart_omp_different.sh")
};

function OMPrestart_same() {
    callfile.execFile("/var/backend/orchestrator_auto_test/auto_restart_omp_same.sh")
};

function OMPsotp() {
    callfile.execFile("/var/backend/orchestrator_auto_test/stopOMP.sh")
};

function OMPstart() {
    callfile.execFile("/var/backend/orchestrator_auto_test/startOMP.sh")
};

function RestartOrchestrator() {
    callfile.execFile("/var/backend/orchestrator_auto_test/restartOrchestrator.sh")
};

var fs = require('fs');
let path = ``;
function checkDirExist(path) {
    if (fs.existsSync(path) == true) {
        return true;
    }
    else {
        return false;
    }
};



// Object.defineProperty(global, '__stack', {
//     get: function(){
//       var orig = Error.prepareStackTrace;
//       Error.prepareStackTrace = function(_, stack){ return stack; };
//       var err = new Error;
//       Error.captureStackTrace(err, arguments.callee);
//       var stack = err.stack;
//       Error.prepareStackTrace = orig;
//       return stack;
//     }
//   });

// Object.defineProperty(global, '__line', {
//     get: function(){
//       return __stack[1].getLineNumber();
//     }
//   });

describe("2.0 Live tube new feature test", function () {

    describe("Test precondition", function () {

        it("Get orchestrator_admin token", function (done) {
            API.post("/orchestrator_admin/login")
                .send(orchestrator_account_data.orc_admin)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log("当前运行的脚本位置是：" + __filename + "的第" + __line + "行 ： ");
                    console.log(body);
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
                        console.log("当前运行的脚本位置是：" + __filename + "的第" + __line + "行 ： ");
                        console.log(body);
                    };
                    expect(body.status).to.be.true;
                    expect(body.username).to.equal("autotest");
                    tenant_admin_token = body.tenant_admin_token;
                    done();
                });
        });

        it("Get another DB's tenant_admin token", function (done) {
            API.post("/tenant_admin/login")
                .send(tenant_account_data.new_tenant_admin)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    if (body.status == false) {
                        console.log(body);
                    };
                    expect(body.status).to.be.true;
                    expect(body.username).to.equal(tenant_account_data.new_tenant_admin.username);
                    tenant_admin_token_1 = body.tenant_admin_token;
                    done();
                });
        });

        it("Create live profile", function (done) {
            API.post("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(profile_data.live_auto_profile)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    if (body.status == false) {
                        console.log(body);
                    };
                    expect(body.status).to.be.true;
                    live_profile_id = body.proc_profile_id;
                    done();
                });
        });
    });

    describe("165-12:Live tube increase is default parameter", function () {
        let atuo_live_tube_id = "";
        let not_atuo_live_tube_id = "";

        it("165-12_01:Get the live tube id of is_auto=true", function (done) {
            API.get("/liveTube")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "source_type": "RTMP"
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    if (body.status == false) {
                        console.log(body);
                    };
                    atuo_live_tube_id = body.results[0]._id;
                    expect(body.status).to.be.true;
                    done();
                });
        });

        it("165-12_02:Check live tube with is_auto=true", function (done) {
            API.get("/liveTube/" + atuo_live_tube_id)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    if (body.status == false) {
                        console.log(body);
                    };
                    expect(body.autorestart).to.be.true;
                    expect(body.is_default).to.be.true;
                    done();
                });
        });

        it("165-12_03:reate a live tube in BD with is_auto=false", function (done) {
            API.post("/liveTube")
                .set("Authorization", "Bearer " + tenant_admin_token_1)
                .send({
                    "source_type": "RTMP",
                    "channel_profile": "RTMP auto false"
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    if (body.status == false) {
                        console.log(body);
                    };
                    not_atuo_live_tube_id = body.live_tube_id;
                    expect(body.status).to.be.true;
                    done();
                });
        });


        it("165-12_04:Check the live tube of is_auto=false", function (done) {
            API.get("/liveTube/" + not_atuo_live_tube_id)
                .set("Authorization", "Bearer " + tenant_admin_token_1)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    if (body.status == false) {
                        console.log(body);
                    };
                    expect(body.autorestart).to.be.true;
                    expect(body.is_default).to.be.false;
                    done();
                });
        });

        it("Delete live tube with is_auto=true", function (done) {
            API.delete("/liveTube/" + atuo_live_tube_id)
                .set("Authorization", "Bearer " + tenant_admin_token)
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
    });

    //TSoHTTP Live tube 暂时跳过的测试
    /*
        describe("Create TSoHTTP Live", function(){
    
            it("164-1:Created TSoHTTP Tube successfully", function(done){
                this.timeout(35000);
                API.post("/liveTube")
                    .set("Authorization", "Bearer " + tenant_admin_token)
                    .send({
                        "source_type": "TSoHTTP",
                        "channel_profile": "TSoHTTP tube",
                        "ts_url": ts_live_url,
                        "autorestart":true,
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
                        if(body.status == false){
                            console.log(body);
                        };
                        expect(body.status).to.be.true;
                        ts_live_tube_id_1 = body.live_tube_id;
                        ts_channel_name_1 = body.channel_name;
                        setTimeout(done, 32000);
                    });
            });
    
            it("164-2:Failed to create TSoHTTP: proc_profile_id does not exist", function(done){
                this.timeout(10000);
                API.post("/liveTube")
                    .set("Authorization", "Bearer " + tenant_admin_token)
                    .send({
                        "source_type": "TSoHTTP",
                        "channel_profile": "RTMP xx",
                        "ts_url": ts_live_url,
                        "proc_profile_id": "5b45b5960e44213f3a2cd594"
                    })
                    .expect(200)
                    .end(function(err, res) {
                        if (err) throw err;
                        let body = JSON.parse(res.text);
                        expect(body.status).to.be.false;
                        expect(body.err.code).to.equal(404);
                        expect(body.err.message).to.equal("Process Profile doesn't exist/not enabled");
                        setTimeout(done, 8000);
                    });
            });
    
            it("Auxiliary 164-3 test: disable live profile", function(done){
                API.put("/profile")
                    .set("Authorization", "Bearer " + tenant_admin_token)
                    .send({
                        "_id": live_profile_id,
                        "profile_name": "autolive1",
                        "profile_type": "LIVE",
                        "is_default": false,
                        "is_use": false,
                        "is_video_out": true,
                        "is_audio_out": true,
                        "is_transcode": true,
                        "transcode_video_info": {
                            "codec": "H264",
                            "bitrate": 960,
                            "height": 480,
                            "width": 640
                        },
                        "is_facialDetect_out": true,
                        "is_thumbnail_out": true,
                        "transcode_audio_info": {
                            "codec": "AAC-LC",
                            "bitrate": 256,
                            "sampling_rate": 44100,
                            "channel_num": 2
                        }
                        
                    })
                    .expect(200)
                    .end(function(err, res) {
                        if (err) throw err;
                        let body = JSON.parse(res.text);
                        console.log(body);
                        expect(body.status).to.be.true;
                        done();
                    });
            });
    
            it("164-3:Failed to create TSoHTTP: proc_profile_id has been disabled", function(done){
                this.timeout(10000);
                API.post("/liveTube")
                    .set("Authorization", "Bearer " + tenant_admin_token)
                    .send({
                        "source_type": "TSoHTTP",
                        "channel_profile": "RTMP xx",
                        "ts_url": ts_live_url,
                        "proc_profile_id": live_profile_id
                    })
                    .expect(200)
                    .end(function(err, res) {
                        if (err) throw err;
                        let body = JSON.parse(res.text);
                        expect(body.status).to.be.false;
                        expect(body.err.code).to.equal(404);
                        expect(body.err.message).to.equal("Process Profile doesn't exist/not enabled");
                        setTimeout(done, 8000);
                    });
            });
    
            it("165:Failed to create TSoHTTP Tube: missing ts_url parameter", function(done){
                this.timeout(10000);
                API.post("/liveTube")
                    .set("Authorization", "Bearer " + tenant_admin_token)
                    .send({
                        "source_type": "TSoHTTP",
                        "channel_profile": "RTMP xx",
                        "autorestart":true
                    })
                    .expect(200)
                    .end(function(err, res) {
                        if (err) throw err;
                        let body = JSON.parse(res.text);
                        expect(body.status).to.be.false;
                        expect(body.err.code).to.equal(400);
                        expect(body.err.message).to.equal("Source URL is needed for TSoHTTP");
                        setTimeout(done, 8000);
                    });
            });
    
            it("165-1:Failed to create TSoHTTP Tube: ts_url address is empty", function(done){
                this.timeout(10000);
                API.post("/liveTube")
                    .set("Authorization", "Bearer " + tenant_admin_token)
                    .send({
                        "source_type": "TSoHTTP",
                        "channel_profile": "RTMP xx",
                        "ts_url": "",
                        "autorestart":true
                    })
                    .expect(200)
                    .end(function(err, res) {
                        if (err) throw err;
                        let body = JSON.parse(res.text);
                        expect(body.status).to.be.false;
                        expect(body.err.code).to.equal(400);
                        expect(body.err.message).to.equal("Source URL is needed for TSoHTTP");
                        setTimeout(done, 8000);
                    });
            });
    
            it("165-4:Create TSoHTTP Tube: Generate thumbnail image", function(done){
                this.timeout(30000);
                API.post("/image")
                    .set("Authorization", "Bearer " + tenant_admin_token)
                    .send({
                        "image_type": "thumbnail",
                        "media_type": "LIVE",
                        "media_id": ts_channel_name_1,
                        "limit": 10
                      })
                    .expect(200)
                    .end(function(err, res) {
                        if (err) throw err;
                        let body = JSON.parse(res.text);
                        console.log(body);
                        expect(body.status).to.be.true;
                        expect(body).to.have.all.keys("status", "total_count", "image");
                        setTimeout(done, 28000);
                    });
            });
    
            it("165-5:Create TSoHTTP Tube: Generate facialDetect image", function(done){
                this.timeout(10000);
                API.post("/image")
                    .set("Authorization", "Bearer " + tenant_admin_token)
                    .send({
                        "image_type": "facialDetect",
                        "media_type": "LIVE",
                        "media_id": ts_channel_name_1,
                        "limit": 10
                      })
                    .expect(200)
                    .end(function(err, res) {
                        if (err) throw err;
                        let body = JSON.parse(res.text);
                        console.log(body);
                        expect(body.status).to.be.true;
                        expect(body).to.have.all.keys("status", "total_count", "image");
                        done();
                    });
            });
    
            it("Auxiliary 164-3 test: Enable live profile", function(done){
                API.put("/profile")
                    .set("Authorization", "Bearer " + tenant_admin_token)
                    .send({
                        "_id": live_profile_id,
                        "profile_name": "autolive1",
                        "profile_type": "LIVE",
                        "is_default": false,
                        "is_use": true,
                        "is_video_out": true,
                        "is_audio_out": true,
                        "is_transcode": true,
                        "transcode_video_info": {
                            "codec": "H264",
                            "bitrate": 960,
                            "height": 480,
                            "width": 640
                        },
                        "is_facialDetect_out": true,
                        "is_thumbnail_out": true,
                        "transcode_audio_info": {
                            "codec": "AAC-LC",
                            "bitrate": 256,
                            "sampling_rate": 44100,
                            "channel_num": 2
                        }
                        
                    })
                    .expect(200)
                    .end(function(err, res) {
                        if (err) throw err;
                        let body = JSON.parse(res.text);
                        if(body.status == false){
                            console.log(body);
                        };
                        expect(body.status).to.be.true;
                        done();
                    });
            });
        });
    
        describe("Test data preparation:Case165-8 and 165-10", function(){
    
            it("Get the play address", function(done){
                API.get("/liveChannel/" + ts_channel_name_1)
                    .set("Authorization", "Bearer " + tenant_admin_token)
                    .expect(200)
                    .end(function(err, res) {
                        if (err) throw err;
                        let body = JSON.parse(res.text);
                        if(body.status == false){
                            console.log(body);
                        };
                        expect(body.status).to.be.true;
                        hlsURL_1 = body.playbackURL.hlsOutput[0].hlsURL
                        flvURL_1 = body.playbackURL.flvOutput[0].flvURL
                        mp4URL_cdn_1 = body.playbackURL.mp4Output[0].mp4URL_cdn
                        hlsURL_cdn_1 = body.playbackURL.hlsOutput[0].hlsURL_cdn
                        done();
                    });
            });
    
            it("Get kernel", function(done){
                API.get("/liveTube/" + ts_live_tube_id_1)
                    .set("Authorization", "Bearer " + tenant_admin_token)
                    .expect(200)
                    .end(function(err, res) {
                        if (err) throw err;
                        let body = JSON.parse(res.text);
                        if(body.status == false){
                            console.log(body);
                        };
                        expect(body.status).to.be.true;
                        ts_kernel_1 = body.kernel;
                        done();
                    });
            });
    
            it("Stop ts live tube 1 kernel from stream controler", function(done){
                this.timeout(10000)
                OMP_API.delete("/omp/ompKernel?kernelId=" + ts_kernel_1)
                    .expect(200)
                    .end(function(err, res){
                        if (err) throw err;
                        console.log(res.text)
                        expect(res.text).to.be.equal("OK")
                        setTimeout(done, 8000);
                });
            });
    
            it("Remove ts live tube 1 from stream controler", function(done){
                this.timeout(10000)
                OMP_API.delete("/omp/ompProfile?name=" + ts_live_tube_id_1)
                    .expect(200)
                    .end(function(err, res){
                        if (err) throw err;
                        console.log(res.text)
                        expect(res.text).to.be.equal("OK")
                        setTimeout(done, 8000);
                });
            });
        });
    
        describe("Test data preparation:Case165-9 and 165-11", function(){
    
            it("Create TSoHTTP live tube", function(done){
                this.timeout(20000);
                API.post("/liveTube")
                    .set("Authorization", "Bearer " + tenant_admin_token)
                    .send({
                        "source_type": "TSoHTTP",
                        "channel_profile": "165-9",
                        "ts_url": ts_live_url,
                        "autorestart":false,
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
                    .end(function(err, res) {
                        if (err) throw err;
                        let body = JSON.parse(res.text);
                        if(body.status == false){
                            console.log(body);
                        };
                        expect(body.status).to.be.true;
                        ts_live_tube_id_2 = body.live_tube_id;
                        ts_channel_name_2 = body.channel_name;
                        setTimeout(done, 18000);
                    });
            });
    
            it("Get kernel", function(done){
                API.get("/liveTube/" + ts_live_tube_id_2)
                    .set("Authorization", "Bearer " + tenant_admin_token)
                    .end(function(err, res) {
                        if (err) throw err;
                        let body = JSON.parse(res.text);
                        if(body.status == false){
                            console.log(body);
                        };
                        expect(body.status).to.be.true;
                        ts_kernel_2 = body.kernel;
                        done();
                    });
            });
    
            it("Stop ts live tube 2 kernel from stream controler", function(done){
                OMP_API.delete("/omp/ompKernel?kernelId=" + ts_kernel_2)
                    .expect(200)
                    .end(function(err, res){
                        if (err) throw err;
                        console.log(res.text)
                        expect(res.text).to.be.equal("OK")
                        done();
                });
            });
    
            it("Remove ts live tube 2 from stream controler", function(done){
                this.timeout(20000);
                OMP_API.delete("/omp/ompProfile?name=" + ts_live_tube_id_2)
                    .expect(200)
                    .end(function(err, res){
                        if (err) throw err;
                        console.log(res.text)
                        expect(res.text).to.be.equal("OK")
                        setTimeout(done, 18000);
                });
            });  
        });
    
        describe("197-1:delete live tube(TSoHTTP)", function(){
    
            it("197-1_01(164-1):Created TSoHTTP Tube successfully", function(done){
                this.timeout(40000);
                API.post("/liveTube")
                    .set("Authorization", "Bearer " + tenant_admin_token)
                    .send({
                        "source_type": "TSoHTTP",
                        "channel_profile": "197-1_01",
                        "ts_url": ts_live_url,
                        "autorestart":true,
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
                        ts_live_tube_id_3 = body.live_tube_id;
                        ts_channel_name_3 = body.channel_name;
                        expect(body.status).to.be.true;
                        setTimeout(done, 38000);
                    });
            });
            it("Read LIVE tube success", function(done) {
                this.timeout(10000);
                API.get("/liveTube/" + ts_live_tube_id_3)
                    .set("Authorization", "Bearer " + tenant_admin_token)
                    .expect(200)
                    .end(function(err, res) {
                        if (err) throw err;
                        console.log(res.body)
                        expect(res.body.status).to.be.equal(true)
                        expect(res.body.channel_profile).to.be.equal("197-1_01");
                        setTimeout(done, 8000);
                    });
            });
    
            it("197-1_02:Delete ts live tube 3", function(done){
                this.timeout(50000);
                API.delete("/liveTube/" + ts_live_tube_id_3) 
                    .set("Authorization", "Bearer " + tenant_admin_token)
                    .expect(200)
                    .end(function(err, res) {
                        if (err) throw err;
                        let body = JSON.parse(res.text);
                        // console.log("当前运行的脚本位置是："+__filename+"的第"+__line+"行 ： ");
                        console.log(body);
                        expect(body.status).to.be.true;
                        setTimeout(done, 45000);
                    });
            });
    
            it("197-1_03:Check the list of ts live channel 3", function(done){
                this.timeout(10000);
                API.get("/liveChannel/" + ts_channel_name_3)
                    .set("Authorization", "Bearer " + tenant_admin_token)
                    .expect(200)
                    .end(function(err, res) {
                        if (err) throw err;
                        let body = JSON.parse(res.text);
                        console.log(body);
                        expect(body.status).to.be.true;
                        setTimeout(done, 9000);
                    });
            });
    
            it("197-1_04:Check TSoHTTP List output images:thumbnail", function(done){
                API.post("/image")
                    .set("Authorization", "Bearer " + tenant_admin_token)
                    .send({
                        "image_type": "thumbnail",
                        "media_type": "LIVE",
                        "media_id": ts_channel_name_3,
                        "limit": 10
                    })
                    .end(function(err, res) {
                        if (err) throw err;
                        let body = JSON.parse(res.text);
                        console.log(body);
                        expect(body.status).to.be.true;
                        expect(body).to.have.all.keys("status", "total_count", "image");
                        done();
                    });
            });
    
            it("197-1_05:Check TSoHTTP List output images:facialDetect", function(done){
                API.post("/image")
                    .set("Authorization", "Bearer " + tenant_admin_token)
                    .send({
                        "image_type": "facialDetect",
                        "media_type": "LIVE",
                        "media_id": ts_channel_name_3,
                        "limit": 10
                    })
                    .end(function(err, res) {
                        if (err) throw err;
                        let body = JSON.parse(res.text);
                        console.log(body);
                        expect(body.status).to.be.true;
                        expect(body).to.have.all.keys("status", "total_count", "image");
                        done();
                    });
            });
            
        });
    
        describe("165-8:Do not restart OMP, delete the kernel corresponding to autorestart TSoHTTP in stream controler, live tube automatically recovers", function(){
    
            it("165-8_01:Check ts live tube 1 kernel has been restored", function(done){
                 API.get("/liveTube/" + ts_live_tube_id_1)
                    .set("Authorization", "Bearer " + tenant_admin_token)
                    .end(function(err, res) {
                        if (err) throw err;
                        let body = JSON.parse(res.text);
                        console.log(body);
                        expect(body.status).to.be.true;
                        expect(body.kernel).to.not.equal(ts_kernel_1);
                        expect(body.kernel_status).to.equal(1);
                        ts_kernel_1_1 = body.kernel;
                        done();
                    });
            });
    
            it("165-8_02:Check ts live channel 1 has been restored", function(done){
                this.timeout(50000);
                API.get("/liveChannel/" + ts_channel_name_1)
                   .set("Authorization", "Bearer " + tenant_admin_token)
                   .end(function(err, res) {
                       if (err) throw err;
                       let body = JSON.parse(res.text);
                       console.log(body);
                       expect(body.status).to.be.true;
                       expect(body.playbackURL.hlsOutput[0].hlsURL).to.equal(hlsURL_1);
                       expect(body.playbackURL.flvOutput[0].flvURL).to.equal(flvURL_1);
                       expect(body.playbackURL.mp4Output[0].mp4URL_cdn).to.equal(mp4URL_cdn_1);
                       expect(body.playbackURL.hlsOutput[0].hlsURL_cdn).to.equal(hlsURL_cdn_1);
                       setTimeout(done, 48000);
                   });
           });
        });
    
        describe("165-9:Do not restart OMP, delete the kernel corresponding to non-autorestart TSoHTTP in stream controler, live tube will not be automatically restored", function(){
    
            it("165-9_01:Check ts live tube 2 kernel will not recover", function(done){
                this.timeout(40000);
                 API.get("/liveTube/" + ts_live_tube_id_2)
                    .set("Authorization", "Bearer " + tenant_admin_token)
                    .end(function(err, res) {
                        if (err) throw err;
                        let body = JSON.parse(res.text);
                        console.log(body);
                        expect(body.status).to.be.true;
                        expect(body.kernel).to.equal(ts_kernel_2);
                        expect(body.kernel_status).to.equal(0);
                        setTimeout(done, 27000);
                    });
            });
    
            it("165-9_02:Check ts live channel 2 will not recover", function(done){
                this.timeout(30000);
                API.get("/liveChannel/" + ts_channel_name_2)
                   .set("Authorization", "Bearer " + tenant_admin_token)
                   .end(function(err, res) {
                       if (err) throw err;
                       let body = JSON.parse(res.text);
                       console.log(body);
                       expect(body.status).to.be.true;
                       expect(body.playbackURL.hlsOutput[0]).to.not.have.all.keys("hlsURL", "hlsURL_cdn");
                       //expect(body.playbackURL.flvOutput[0]).to.not.have.all.keys("flvURL");
                       expect(body.playbackURL.mp4Output[0]).to.not.have.all.keys("mp4URL_cdn");
                       setTimeout(done, 18000);
                   });
           });
        });
    
        describe("165-10:Restart OMP, autorestart=true TSOHTTP returns to normal", function(){
                //165-10:重启OMP,autorestart=true的TSoHTTP恢复正常
            let ts_kernel_22 = "";
            it("Get the kernel before omp restart", function(done){
                API.get("/liveTube/" + ts_live_tube_id_1)
                    .set("Authorization", "Bearer " + tenant_admin_token)
                    .expect(200)
                    .end(function(err, res) {
                        if (err) throw err;
                        let body = JSON.parse(res.text);
                        console.log(body);
                        ts_kernel_22 = body.kernel;
                        expect(body.status).to.be.true;
                        done();
                    });
            });
    
    
            it("===Restart OMP===", function(done) {
                OMPrestart_different();
                this.timeout(88000);
                console.log("Restarting OMP...");
                setTimeout(done, 78000);
            });
    
            it("165-10_01:Check ts live channel 1 data has been restored", function(done){
                this.timeout(40000);
                API.get("/liveChannel/" + ts_channel_name_1)
                    .set("Authorization", "Bearer " + tenant_admin_token)
                    .expect(200)
                    .end(function(err, res) {
                        if (err) throw err;
                        let body = JSON.parse(res.text);
                        console.log(body);
                        console.log(hlsURL_1);
                        expect(body.status).to.be.true;
                        expect(body.playbackURL.hlsOutput[0].hlsURL).to.equal(hlsURL_1);
                        setTimeout(done, 28000);
                    });
            });
    
            it("165-10_02:Check ts live tube 1 kernel_id has been restored", function(done){
                this.timeout(40000);
                API.get("/liveTube/" + ts_live_tube_id_1)
                    .set("Authorization", "Bearer " + tenant_admin_token)
                    .expect(200)
                    .end(function(err, res) {
                        if (err) throw err;
                        let body = JSON.parse(res.text);
                        console.log(body);
                        expect(body.status).to.be.true;
                        expect(body.kernel).to.not.equal(ts_kernel_22);
                        expect(body.kernel_status).to.equal(1);
                        setTimeout(done, 18000);
                    });
            });
    
            it("Delete Live Tube:TSoHTTP live tube", function(done){
                this.timeout(80000);
                API.delete("/liveTube/" + ts_live_tube_id_1)
                    .set("Authorization", "Bearer " + tenant_admin_token)
                    .expect(200)
                    .end(function(err, res) {
                        if (err) throw err;
                        let body = JSON.parse(res.text);
                        console.log(body);
                        expect(body.status).to.be.true;
                        setTimeout(done, 28000);
                    });
            });
        });
    
        describe("165-11:Restart OMP, autorestart=false TSOHTTP will not recover", function(){
    
            it("165-11_01:Check ts live channel 2 data has been restored", function(done){
                API.get("/liveChannel/" + ts_channel_name_2)
                    .set("Authorization", "Bearer " + tenant_admin_token)
                    .expect(200)
                    .end(function(err, res) {
                        if (err) throw err;
                        let body = JSON.parse(res.text);
                        //console.log(body);
                        console.log(body.playbackURL);
                        expect(body.status).to.be.true;
                        expect(body.playbackURL.hlsOutput[0]).to.not.have.all.keys("hlsURL", "hlsURL_cdn");
                        done();
                    });
            });
    
            it("165-11_02:Check ts live tube 2 kernel_id will not recover", function(done){
                API.get("/liveTube/" + ts_live_tube_id_2)
                    .set("Authorization", "Bearer " + tenant_admin_token)
                    .expect(200)
                    .end(function(err, res) {
                        if (err) throw err;
                        let body = JSON.parse(res.text);
                        console.log(ts_kernel_2);
                        expect(body.status).to.be.true;
                        expect(body.kernel).to.equal(ts_kernel_2);
                        expect(body.kernel_status).to.equal(0);
                        done();
                    });
            });
    
            it("Delete Live Tube:TSoHTTP live tube", function(done){
                this.timeout(20000);
                API.delete("/liveTube/" + ts_live_tube_id_2)
                    .set("Authorization", "Bearer " + tenant_admin_token)
                    .expect(200)
                    .end(function(err, res) {
                        if (err) throw err;
                        let body = JSON.parse(res.text);
                        console.log(body);
                        expect(body.status).to.be.true;
                        setTimeout(done, 18000);
                    });
            });
        });
    */
    //RTMP Live Tube

    /*
        //只有video和只有audio的live tube  暂时跳过的测试
        describe("163_1:Create a live tube with only video", function(){
    
            it("Create a profile with only video", function(done){
                API.post("/profile")
                    .set("Authorization", "Bearer " + tenant_admin_token)
                    .send(profile_data.live_profile_onlyVideo)
                    .expect(200)
                    .end(function(err, res){
                        if (err) throw err;
                        let body = JSON.parse(res.text);
                        console.log(body)
                        expect(body.status).to.be.true;
                        onlyVideo_live_Profile_id = body.proc_profile_id
                    done()
                    });
            });
    
            it("Create only video live tube", function(done){
                this.timeout(8000)
                API.post("/liveTube")
                    .set("Authorization", "Bearer " + tenant_admin_token)
                    .send({
                        "source_type": "RTMP",
                        "channel_profile": "onlyVideo_live_tube",
                        "proc_profile_id": onlyVideo_live_Profile_id
                      })
                    .expect(200)
                    .end(function(err, res){
                        if (err) throw err;
                        let body = JSON.parse(res.text);
                        console.log(body)
                        expect(body.status).to.be.true;
                        onlyVideo_live_tube_id = body.live_tube_id;
                    setTimeout(done, 6000);
                    });
            });
    
            it("Create only video live channel", function(done){
                this.timeout(60000)
                API.post("/liveChannel")
                    .set("Authorization", "Bearer " + tenant_admin_token)
                    .send({
                        "live_tube_id": onlyVideo_live_tube_id
                      })
                    .expect(200)
                    .end(function(err, res){
                        if (err) throw err;
                        let body = JSON.parse(res.text);
                        console.log(body)
                        expect(body.status).to.be.true;
                        onlyVideo_channel_name = body.channel_name;
                        stream_link = body.inbound_url;
                        if(body.inbound_url){
                            console.log(stream_link);
                            FFmpeg();
                            expect(err,"if this case test fail,pls check streaming live!").to.be.equal(null);
                        };
                    setTimeout(done, 58000);
                    });
            });
        });
    
        describe("163_2:Create a live tube with only audio", function(){
    
            it("Create a profile with only audio", function(done){
                API.post("/profile")
                    .set("Authorization", "Bearer " + tenant_admin_token)
                    .send(profile_data.live_profile_onlyAudio)
                    .expect(200)
                    .end(function(err, res){
                        if (err) throw err;
                        let body = JSON.parse(res.text);
                        console.log(body)
                        expect(body.status).to.be.true;
                        onlyAudio_live_Profile_id = body.proc_profile_id
                    done()
                    });
            });
    
            it("Create only audio live tube", function(done){
                this.timeout(8000)
                API.post("/liveTube")
                    .set("Authorization", "Bearer " + tenant_admin_token)
                    .send({
                        "source_type": "RTMP",
                        "channel_profile": "onlyAudio_live_tube",
                        "proc_profile_id": onlyAudio_live_Profile_id
                      })
                    .expect(200)
                    .end(function(err, res){
                        if (err) throw err;
                        let body = JSON.parse(res.text);
                        console.log(body)
                        expect(body.status).to.be.true;
                        onlyAudio_live_tube_id = body.live_tube_id;
                    setTimeout(done, 6000);
                    });
            });
    
            it("Create only video live channel", function(done){
                this.timeout(60000)
                API.post("/liveChannel")
                    .set("Authorization", "Bearer " + tenant_admin_token)
                    .send({
                        "live_tube_id": onlyAudio_live_tube_id
                      })
                    .expect(200)
                    .end(function(err, res){
                        if (err) throw err;
                        let body = JSON.parse(res.text);
                        console.log(body)
                        expect(body.status).to.be.true;
                        onlyAudio_channel_name = body.channel_name;
                        stream_link = body.inbound_url;
                        if(body.inbound_url){
                            console.log(stream_link);
                            FFmpeg();
                            expect(err,"if this case test fail,pls check streaming live!").to.be.equal(null);
                        };
                    setTimeout(done, 58000);
                    });
            });
        });
    */

    describe("172 and 173:Set the autorestart parameter to create multiple autorestart live tubes (autorestart defaults to true)", function () {

        it("172:Create Live tube 1", function (done) {
            this.timeout(9000);
            API.post("/liveTube")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "source_type": "RTMP",
                    "channel_profile": "RTMP live tube 1",
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
                                "isVod": true
                            }
                        ]
                    }
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    live_tube_id_1 = body.live_tube_id;
                    port01 = body.port;
                    setTimeout(done, 4000);
                });
        });

        it("173:Check autorestart default equal to true", function (done) {
            API.get("/liveTube/" + live_tube_id_1)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    expect(body.autorestart).to.equal(true);
                    done();
                });
        });

    });

    describe("Test data preparation:Case181 and 182", function () {

        it("Create live channel under Live tube 1", function (done) {
            this.timeout(50000);
            API.post("/liveChannel")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "live_tube_id": live_tube_id_1
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    console.log(body);
                    channel_name_1 = body.channel_name;
                    stream_link = body.inbound_url;
                    if (body.inbound_url) {
                        console.log(stream_link);
                        FFmpeg();
                        expect(err, "if this case test fail,pls check streaming live!").to.be.equal(null);
                    };
                    setTimeout(done, 45000);
                });
        });

        it("Delete Live tube 1", function (done) {
            API.delete("/liveTube/" + live_tube_id_1)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    done();
                });
        });
    });

    describe("Test data preparation:Case183", function () {

        it("01 Create autorestart: Live tube 2", function (done) {
            delete require.cache[require.resolve('../../data/live_tube.json')];
            const tube_data = require("../../data/live_tube.json");
            let data = Object.assign({}, tube_data.not_autorestart_live_tube);
            data.channel_profile = "not_autorestart_live_tube 2"
            this.timeout(10000);
            API.post("/liveTube")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    live_tube_id_2 = body.live_tube_id;
                    expect(body.status).to.be.true;
                    setTimeout(done, 8000);
                });
        });

        it("02 Get live tube 2 kernel", function (done) {
            API.get("/liveTube/" + live_tube_id_2)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    tube2_kernel = body.kernel;
                    expect(body.status).to.be.true;
                    done();
                });
        });

        it("Delete Live tube 2", function (done) {
            this.timeout(8000);
            API.delete("/liveTube/" + live_tube_id_2)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    setTimeout(done, 6000);
                });
        });
    });

    describe("Test data preparation:Case186", function () {

        it("Create a non-autorestart: Create a Live tube 3", function (done) {
            delete require.cache[require.resolve('../../data/live_tube.json')];
            const tube_data = require("../../data/live_tube.json");
            let data = Object.assign({}, tube_data.not_autorestart_live_tube);
            data.channel_profile = "not_autorestart_live_tube 3"
            this.timeout(9000);
            API.post("/liveTube")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    live_tube_id_3 = body.live_tube_id;
                    expect(body.status).to.be.true;
                    setTimeout(done, 3500);
                });
        });

        it("Get the kernel of live tube 3", function (done) {
            API.get("/liveTube/" + live_tube_id_3)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    tube3_kernel = body.kernel;
                    expect(body.status).to.be.true;
                    done();
                });

        })

        it("Remove the kernel corresponding to live tube 3 from swagger", function (done) {
            OMP_API.delete("/omp/ompKernel?kernelId=" + tube3_kernel)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.text)
                    expect(res.text).to.be.equal("OK")
                    done();
                });
        });

        it("Remove live tube 3 from stream controler", function (done) {
            OMP_API.delete("/omp/ompProfile?name=" + live_tube_id_3)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.text)
                    expect(res.text).to.be.equal("OK")
                    done();
                });
        });

    });

    describe("Test data preparation:Case187", function () {

        it("Create autorestart:Live tube 4", function (done) {
            delete require.cache[require.resolve('../../data/live_tube.json')];
            const tube_data = require("../../data/live_tube.json");
            let data = Object.assign({}, tube_data.live_tube);
            data.channel_profile = "live_tube 4"
            this.timeout(9000);
            API.post("/liveTube")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    live_tube_id_4 = body.live_tube_id;
                    expect(body.status).to.be.true;
                    setTimeout(done, 3500);
                });
        });

        it("Get the kernel of live tube 4", function (done) {
            API.get("/liveTube/" + live_tube_id_4)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    tube4_kernel = body.kernel;
                    expect(body.status).to.be.true;
                    done();
                });
        });

        it("Remove the kernel of live tube 4 from the stream controler", function (done) {
            OMP_API.delete("/omp/ompKernel?kernelId=" + tube4_kernel)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.text)
                    expect(res.text).to.be.equal("OK")
                    done();
                });
        });

        it("Remove live tube 4 from stream controler", function (done) {
            OMP_API.delete("/omp/ompProfile?name=" + live_tube_id_4)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.text)
                    expect(res.text).to.be.equal("OK")
                    done();
                });
        });
    });

    describe("Test data preparation:Case184", function () {

        it("Create autorestart:Live tube 5", function (done) {
            delete require.cache[require.resolve('../../data/live_tube.json')];
            const tube_data = require("../../data/live_tube.json");
            let data = Object.assign({}, tube_data.autorestart_live_tube);
            data.channel_profile = "live_tube 5"
            this.timeout(15000);
            API.post("/liveTube")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    live_tube_id_5 = body.live_tube_id;
                    expect(body.status).to.be.true;
                    setTimeout(done, 12000);
                });
        });

        it("Create live channel under Live tube 5", function (done) {
            this.timeout(70000);
            API.post("/liveChannel")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "live_tube_id": live_tube_id_5
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    channel_name_5 = body.channel_name;
                    stream_link = body.inbound_url;
                    if (body.inbound_url) {
                        console.log(stream_link);
                        FFmpeg();
                        expect(err, "if this case test fail,pls check streaming live!").to.be.equal(null);
                    }
                    setTimeout(done, 65000);
                });
        });

        it("Delete live channel 5", function (done) {
            this.timeout(20000);
            API.delete("/liveChannel/" + channel_name_5)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    setTimeout(done, 16000);
                });
        });

    });

    describe("181:Delete autorestart live tube, check the corresponding omp kernel, hls file should be completely deleted, will not automatically recover", function () {
        //删除autorestart live tube，检查相应的omp kernel，hls文件应该被完全删除，不会自动恢复。
        it("181_01:Check channel_name_1 live stream directory is deleted", function (done) {
            this.timeout(6000);
            setTimeout(function () {
                let tenant_db = tenant_account_data.tenant_admin.tenant_name
                var stream_mulu_1 = true;
                const stream_mulu = `/var/panel/library/video/live/output/${tenant_db}/${channel_name_1}`;
                //console.log(stream_mulu);
                path = stream_mulu;
                stream_mulu_1 = checkDirExist(path);
                expect(stream_mulu_1).to.be.false;
                setTimeout(done, 5000)
            });
        });

        it("181_02:Check channel_name_1 mp4 Archive file directory is not deleted", function (done) {
            this.timeout(6000);
            setTimeout(function () {
                let tenant_db = tenant_account_data.tenant_admin.tenant_name
                var mp4Archive_mulu_1 = false;
                const mp4Archive_mulu = `/var/panel/library/video/live/output/${tenant_db}/mp4Archive/${channel_name_1}`;
                console.log(mp4Archive_mulu);
                path = mp4Archive_mulu;
                mp4Archive_mulu_1 = checkDirExist(path);
                expect(mp4Archive_mulu_1).to.be.true;
                setTimeout(done, 5000)
            });
        });

        it("181_03:Check channel_name_1 hls Archive file directory is not deleted", function (done) {
            this.timeout(6000);
            setTimeout(function () {
                let tenant_db = tenant_account_data.tenant_admin.tenant_name
                var hlsArchive_mulu_1 = false;
                const hlsArchive_mulu = `/var/panel/library/video/live/output/${tenant_db}/tsArchive/${channel_name_1}`;
                //console.log(hlsArchive_mulu);
                path = hlsArchive_mulu;
                hlsArchive_mulu_1 = checkDirExist(path);
                expect(hlsArchive_mulu_1).to.be.true;
                setTimeout(done, 5000)
            });
        });

        it("181_04:Check channel_name_1 thumbnail image file directory not deleted", function (done) {
            this.timeout(6000);
            setTimeout(function () {
                let tenant_db = tenant_account_data.tenant_admin.tenant_name
                var thumbnail_mulu_1 = false;
                const thumbnail_mulu = `/var/panel/library/video/live/output/${tenant_db}/thumbnails/${channel_name_1}`;
                //console.log(hlsArchive_mulu);
                path = thumbnail_mulu;
                thumbnail_mulu_1 = checkDirExist(path);
                expect(thumbnail_mulu_1).to.be.true;
                setTimeout(done, 5000)
            });
        });
        //2018-11-5跳过测试facialDetect图片
        // it("181_05:Check channel_name_1 facialDetect image file directory not deleted", function (done) {
        //     this.timeout(6000);
        //     setTimeout(function () {
        //         let tenant_db = tenant_account_data.tenant_admin.tenant_name
        //         var facialDetect_mulu_1 = false;
        //         const facialDetect_mulu = `/var/panel/library/video/live/output/${tenant_db}/facialDetect/${channel_name_1}`;
        //         //console.log(hlsArchive_mulu);
        //         path = facialDetect_mulu;
        //         facialDetect_mulu_1 = checkDirExist(path);
        //         expect(facialDetect_mulu_1).to.be.true;
        //         setTimeout(done, 5000)
        //     });
        // });

    });
    describe("186:Do not restart OMP, delete the kernel of non-autorestart RTMP in stream controler, live tube will not automatically recover", function () {

        it("Check the kernel of live tube 3 is not restored", function (done) {
            API.get("/liveTube/" + live_tube_id_3)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.kernel).to.equal(tube3_kernel);
                    expect(body.kernel_status).to.equal(0);
                    done();
                });
        });

        it("Delete live tube 3", function (done) {
            this.timeout(20000);
            API.delete("/liveTube/" + live_tube_id_3)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    setTimeout(done, 18000);
                });

        });
    });

    describe("187:Do not restart OMP, delete autorestart RTMP kernel in stream controler, live tube automatically recovers", function () {

        it("Check that the kernel of live tube 4 has been restored", function (done) {
            API.get("/liveTube/" + live_tube_id_4)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body)
                    tube4_kernel_1 = body.kernel;
                    expect(body.kernel).to.not.equal(tube4_kernel);
                    expect(body.kernel_status).to.equal(1);
                    done();
                });
        });
    });
    
    describe("Test data preparation:Case187-1", function () {
        it(" 01 Create live channel 4", function (done) {
            this.timeout(35000);
            API.post("/liveChannel")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "live_tube_id": live_tube_id_4
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    expect(body.channel_name).to.be.a("string")
                    expect(body.inbound_url).to.be.a("string")
                    channel_name_4 = body.channel_name;
                    stream_link = body.inbound_url;
                    if (body.inbound_url) {
                        console.log(stream_link);
                        FFmpeg();
                        expect(err, "if this case test fail,pls check streaming live!").to.be.equal(null);
                    };
                    setTimeout(done, 33000);
                });
        });

        it("02 End live channel 4", function (done) {
            this.timeout(20000);
            API.put("/liveChannel/" + channel_name_4)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    setTimeout(done, 18000);
                });
        });

        it("Remove the kernel from the stream controler", function (done) {
            this.timeout(20000);
            OMP_API.delete("/omp/ompKernel?kernelId=" + tube4_kernel_1)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.text)
                    expect(res.text).to.be.equal("OK")
                    setTimeout(done, 18000);
                });
        });

        it("Remove live tube from stream controler", function (done) {
            this.timeout(50000);
            OMP_API.delete("/omp/ompProfile?name=" + live_tube_id_4)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.text)
                    expect(res.text).to.be.equal("OK")
                    setTimeout(done, 48000);
                });
        });
    });

    describe("187-1:Do not restart OMP, delete autorestart RTMP kernel in stream controler, live tube automatically recovers", function () {

        it("Check that the kernel of live tube 4 has been restored", function (done) {
            API.get("/liveTube/" + live_tube_id_4)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.kernel).to.not.equal(tube4_kernel_1);
                    expect(body.kernel_status).to.equal(1);
                    done();
                });
        });

        it("Delete Live Tube:TSoHTTP live tube", function (done) {
            this.timeout(20000);
            API.delete("/liveTube/" + live_tube_id_4)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    setTimeout(done, 18000);
                });
        });
    });

    describe("===Restart OMP===", function () {
        it("Restart omp", function (done) {
            if (omp_host == orchestrator_host) {
                OMPrestart_same();
            }
            else {
                OMPrestart_different();
            }
            this.timeout(30000);
            console.log("Restarting omp...");
            setTimeout(done, 28000);
        });
    });

    describe("182:Delete autorestart live tube, restart omp, check the corresponding omp kernel should not be restored", function () {

        it("Check omp restart, check live tube 1 will not recover", function (done) {
            this.timeout(8000)
            API.get("/liveTube/" + live_tube_id_1)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.err.code).to.equal(404);
                    expect(body.err.message).to.equal("No records exist");
                    setTimeout(done, 6000)
                });
        });
    });

    describe("184:Restart omp, the autorestart live channel that has been deleted will not be restored.", function () {

        it("After restarting omp, check live channel 5 will not recover", function (done) {
            this.timeout(8000)
            API.get("/liveChannel/" + channel_name_5)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.equal(404);
                    expect(body.err.message).to.equal("Live channel not found");
                    setTimeout(done, 6000)
                });
        });

        it("Delete Live Tube:TSoHTTP live tube", function (done) {
            this.timeout(20000);
            API.delete("/liveTube/" + live_tube_id_5)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    setTimeout(done, 18000);
                });
        });
    });

    describe("183:Delete the non-autorestart live tube, check that the corresponding omp kernel should be completely removed.", function () {

        //检查live tube 2的kernel不会恢复
        it("Check the kernel of live tube 2 will not be restored", function (done) {
            this.timeout(8000);
            OMP_API.delete("/omp/ompKernel?kernelId=" + tube2_kernel)
                .expect(404)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.text)
                    expect(res.text).to.be.equal("Kernel Not Found");
                    setTimeout(done, 6000);
                });
        });
    });

    //清除DB
    describe("Clear DB data_1", function () {

        it("Delete DB_1", function (done) {
            this.timeout(80000);
            API.delete("/clearDB/autotest")
                .set("Authorization", "Bearer " + orchestrator_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    setTimeout(done, 65000);
                });
        });

        it("Delete another DB_1", function (done) {
            this.timeout(20000);
            API.delete("/clearDB/autotestlive")
                .set("Authorization", "Bearer " + orchestrator_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    setTimeout(done, 18000);
                });
        });
    });
    //重新创建DB
    describe("Recreate DB_1", function () {

        it("Create Tenant db_1", function (done) {
            this.timeout(20000);
            API.post("/tenant")
                .set("Authorization", "Bearer " + orchestrator_admin_token)
                .send(tenant_data.tenant_db)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body)
                    tenant_db_id = body.tenant_db_id;
                    expect(body.status).to.be.true;
                    setTimeout(done, 18000)
                });
        });

        it("Create Tenant admin_1", function (done) {
            this.timeout(10000);
            API.post("/tenant_admin")
                .set("Authorization", "Bearer " + orchestrator_admin_token)
                .send(tenant_account_data.tenant_admin)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body)
                    tenant_admin_id = body._id;
                    expect(body.status).to.be.true;
                    setTimeout(done, 8000)
                });
        });

        it("Create another Tenant DB_1", function (done) {
            API.post("/tenant")
                .set("Authorization", "Bearer " + orchestrator_admin_token)
                .send(tenant_data.new_live_tenant_db)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    tenant_db_id_1 = body.tenant_db_id;
                    expect(body.status).to.be.true;
                    done();
                });
        });

        it("Create another DB's Tenant admin_1", function (done) {
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

    });
    //重新获取token
    describe("Regain tenant admin token", function () {

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
                    tenant_admin_token = body.tenant_admin_token;
                    expect(body.status).to.be.true;
                    expect(body.username).to.equal(tenant_account_data.tenant_admin.username);
                    done();
                });
        });

        it("Get another DB's tenant_admin token", function (done) {
            API.post("/tenant_admin/login")
                .send(tenant_account_data.new_tenant_admin)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    if (body.status == false) {
                        console.log(body);
                    };
                    tenant_admin_token_1 = body.tenant_admin_token;
                    expect(body.status).to.be.true;
                    expect(body.username).to.equal(tenant_account_data.new_tenant_admin.username);
                    done();
                });
        });

        it("Create live profile", function (done) {
            API.post("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(profile_data.live_auto_profile)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    if (body.status == false) {
                        console.log(body);
                    };
                    live_profile_id = body.proc_profile_id;
                    expect(body.status).to.be.true;
                    done();
                });
        });
    });

    // 准备测试数据
    describe("Test data preparation:Case177 and 178", function () {

        it("01 Data Preparation: Create autorestart: Live tube", function (done) {
            delete require.cache[require.resolve('../../data/live_tube.json')];
            const tube_data = require("../../data/live_tube.json");
            let data = Object.assign({}, tube_data.autorestart_live_tube);
            data.channel_profile = "live_tube 5 01"
            this.timeout(20000);
            API.post("/liveTube")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    live_tube_id_6 = body.live_tube_id;
                    expect(body.status).to.be.true;
                    setTimeout(done, 18000);
                });
        });

        it("02 create a live channel under live tube 6", function (done) {
            this.timeout(60000);
            API.post("/liveChannel")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "live_tube_id": live_tube_id_6
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    channel_name_6 = body.channel_name;
                    expect(body.status).to.be.true;
                    expect(body.channel_name).to.be.a("string");
                    expect(body.inbound_url).to.be.a("string");
                    stream_link = body.inbound_url;
                    if (body.inbound_url) {
                        console.log(stream_link);
                        FFmpeg();
                        expect(err, "if this case test fail,pls check streaming live!").to.be.equal(null);
                    }
                    setTimeout(done, 55000);
                });
        });

        it("03 create a live channel under live tube 6", function (done) {
            this.timeout(60000);
            API.post("/liveChannel")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "live_tube_id": live_tube_id_6
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    channel_name_6_1 = body.channel_name;
                    expect(body.status).to.be.true;
                    expect(body.channel_name).to.be.a("string");
                    expect(body.inbound_url).to.be.a("string");
                    stream_link = body.inbound_url;
                    if (body.inbound_url) {
                        console.log(stream_link);
                        FFmpeg();
                        expect(err, "if this case test fail,pls check streaming live!").to.be.equal(null);
                    }
                    setTimeout(done, 55000);
                });
        });
    });

    describe("===Restart omp===", function () {

        it("Restart omp", function (done) {
            if (omp_host == orchestrator_host) {
                OMPrestart_same();
            }
            else {
                OMPrestart_different();
            }
            this.timeout(60000);
            console.log("Restarting omp...");
            setTimeout(done, 58000);
        });
    });

    describe("177:End Live channel,Check the corresponding Archive file", function () {
        it("177_01:Resume the push", function (done) {
            this.timeout(60000);
            API.get("/liveChannel/" + channel_name_6)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    channel_name_6 = body.channel_name;
                    expect(body.status).to.be.true;
                    expect(body.channel_name).to.be.a("string");
                    expect(body.source_url).to.be.a("string");
                    console.log(body);
                    stream_link = body.source_url;
                    if (body.source_url) {
                        console.log(stream_link);
                        FFmpeg();
                        expect(err, "if this case test fail,pls check streaming live!").to.be.equal(null);
                    }
                    setTimeout(done, 55000);
                });
        });

        it("177_02:End Live channel 03", function (done) {
            this.timeout(15000);
            API.put("/liveChannel/" + channel_name_6)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    setTimeout(done, 13000);
                });
        });

        it("177_03:Check the live channel to generate the archive play address", function (done) {
            API.get("/liveChannel/" + channel_name_6)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    expect(body.playbackURL.mp4Output[0]).to.have.all.keys("isVod", "archive_duration", "archive_dateupload", "mp4URL", "mp4URL_cdn");
                    expect(body.playbackURL.hlsOutput[1]).to.have.all.keys("isVod", "hls_version", "archive_duration", "archive_dateupload", "hlsURL", "hlsURL_cdn");
                    done();
                });
        });
    });

    describe("178:Restart OMP, archive cache file will not be restored", function () {

        it("178_01:End Live channel 6_1", function (done) {
            this.timeout(60000);
            API.put("/liveChannel/" + channel_name_6_1)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    setTimeout(done, 58000);
                });
        });

        it("178_02:Check that the corresponding hls Archive file directory has been deleted.", function (done) {
            this.timeout(6000);
            setTimeout(function () {
                let tenant_db = tenant_account_data.tenant_admin.tenant_name
                var is_hlsArchive_mulu = true;
                const hlsArchive_mulu = `/var/panel/library/video/live/output/${tenant_db}/tsArchive/${channel_name_6_1}`;
                path = hlsArchive_mulu;
                is_hlsArchive_mulu = checkDirExist(path);
                console.log(is_hlsArchive_mulu)
                expect(is_hlsArchive_mulu).to.be.false;
                setTimeout(done, 5000);
            });
        });

        it("178_03:Check that the corresponding mp4 Archive file directory has been deleted.", function (done) {
            this.timeout(6000);
            setTimeout(function () {
                let tenant_db = tenant_account_data.tenant_admin.tenant_name
                var is_mp4Archive_mulu = true;
                const mp4Archive_mulu = `/var/panel/library/video/live/output/${tenant_db}/mp4Archive/${channel_name_6_1}`;
                path = mp4Archive_mulu;
                is_mp4Archive_mulu = checkDirExist(path);
                expect(is_mp4Archive_mulu).to.be.false;
                setTimeout(done, 5000);
            });
        });
    });

    describe("Test data preparation:224", function () {

        it("Create autorestart:Live tube 06", function (done) {
            delete require.cache[require.resolve('../../data/live_tube.json')];
            const tube_data = require("../../data/live_tube.json");
            let data = Object.assign({}, tube_data.non_autorestart_live_tube);
            //data.channel_profile = "live_tube 224 06"
            this.timeout(10000);
            API.post("/liveTube")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    live_tube_id_7 = body.live_tube_id;
                    expect(body.status).to.be.true;
                    setTimeout(done, 8000);
                });
        });

        it("01 Create live channel in live tube id 06", function (done) {
            this.timeout(80000);
            API.post("/liveChannel")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "live_tube_id": live_tube_id_7
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    channel_name_7 = body.channel_name;
                    expect(body.channel_name).to.be.a("string");
                    expect(body.inbound_url).to.be.a("string");
                    stream_link = body.inbound_url;
                    if (body.inbound_url) {
                        console.log(stream_link);
                        FFmpeg();
                        expect(err, "if this case test fail,pls check streaming live!").to.be.equal(null);
                    };
                    setTimeout(done, 75000);
                });
        });

        it("02 Get live tube 06 kernel", function (done) {
            this.timeout(10000);
            API.get("/liveTube/" + live_tube_id_7)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    tube7_kernel = body.kernel;
                    expect(body.status).to.be.true;
                    setTimeout(done, 8000);
                });
        });

        it("03 Remove tube06_kernel from swagger", function (done) {
            this.timeout(50000);
            OMP_API.delete("/omp/ompKernel?kernelId=" + tube7_kernel)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.text)
                    expect(res.text).to.be.equal("OK")
                    setTimeout(done, 46000);
                });
        });

        it("Check the details of live channel 06: no stream play address", function (done) {
            API.get("/liveChannel/" + channel_name_7)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    expect(body.playbackURL.flvOutput[0]).to.not.have.all.keys("flvURL");
                    //expect(body.playbackURL.mp4Output[0]).to.not.have.all.keys("mp4URL_cdn");
                    expect(body.playbackURL.hlsOutput[0]).to.not.have.all.keys("hlsURL", "hlsURL_cdn");
                    done();
                });
        });
    });

    describe("224-1:no archive,have stream:after enc live channel,live_tube_id will removed from live channel object", function () {
        let live_tube_id_8 = "";
        let channel_name_8 = "";

        it("224-1_01 Data preparation: Create autorestart: Live tube", function (done) {
            delete require.cache[require.resolve('../../data/live_tube.json')];
            const tube_data = require("../../data/live_tube.json");
            let data = Object.assign({}, tube_data.only_stream_auto_live_tube);
            data.channel_profile = "224-1_01"
            this.timeout(20000);
            API.post("/liveTube")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    live_tube_id_8 = body.live_tube_id;
                    expect(body.status).to.be.true;
                    setTimeout(done, 18000);
                });
        });

        it("224-1_02 Data preparation: create live channel under live tube", function (done) {
            this.timeout(60000)
            API.post("/liveChannel")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "live_tube_id": live_tube_id_8
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    expect(body.channel_name).to.be.a("string");
                    expect(body.inbound_url).to.be.a("string");
                    stream_link = body.inbound_url;
                    if (body.inbound_url) {
                        console.log(stream_link);
                        FFmpeg();
                        expect(err, "if this case test fail,pls check streaming live!").to.be.equal(null);
                    };
                    channel_name_8 = body.channel_name;
                    setTimeout(done, 55000);
                });
        });

        it("224-1_03 Data preparation: End live channel", function (done) {
            this.timeout(20000);
            API.put("/liveChannel/" + channel_name_8)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    setTimeout(done, 18000);
                });
        });

        it("224-1_04 Check the expected result: check the details of live channel 8: live_tube_id is deleted", function (done) {
            API.get("/liveChannel/" + channel_name_8)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    expect(body).to.not.have.all.keys("live_tube_id");
                    done();
                });
        });

        after("Delete 224-1 test data", function (done) {
            this.timeout(10000);
            API.delete("/liveTube/" + live_tube_id_8)
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
    });

    describe("224-2:no archive,no stream:after enc live channel,live_tube_id will removed from live channel object", function () {
        let live_tube_id_9 = "";
        let channel_name_9 = "";

        it("224-2_01 Data preparation: Create autorestart: Live tube 09", function (done) {
            delete require.cache[require.resolve('../../data/live_tube.json')];
            const tube_data = require("../../data/live_tube.json");
            let data = Object.assign({}, tube_data.not_Stream_And_Archive_live_tube);
            data.channel_profile = "224-2_01"
            this.timeout(10000);
            API.post("/liveTube")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    live_tube_id_9 = body.live_tube_id;
                    setTimeout(done, 8000);
                });
        });

        it("224-2_02 Data preparation: create live channel in live tube id 9", function (done) {
            this.timeout(50000);
            API.post("/liveChannel")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "live_tube_id": live_tube_id_9
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    channel_name_9 = body.channel_name;
                    expect(body.status).to.be.true;
                    expect(body.channel_name).to.be.a("string");
                    expect(body.inbound_url).to.be.a("string");
                    stream_link = body.inbound_url;
                    if (body.inbound_url) {
                        console.log(stream_link);
                        FFmpeg();
                        expect(err, "if this case test fail,pls check streaming live!").to.be.equal(null);
                    };
                    setTimeout(done, 47000);
                });
        });

        it("224-2_03 Data preparation: End live channel", function (done) {
            this.timeout(6000);
            API.put("/liveChannel/" + channel_name_9)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    setTimeout(done, 5000);
                });
        });

        it("224-2_04 Check the expected result: live_tube_id is deleted in the details of live channel 09", function (done) {
            API.get("/liveChannel/" + channel_name_9)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    expect(body).to.not.have.all.keys("live_tube_id");
                    done();
                });
        });

        after("Delete 224-2 test data", function (done) {
            this.timeout(10000);
            API.delete("/liveTube/" + live_tube_id_9)
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
    });

    describe("224-3:have archive,have stream:after enc live channel,live_tube_id will removed from live channel object", function () {
        let live_tube_id_10 = "";
        let channel_name_10 = "";

        it("224-3_01 Data preparation: Create autorestart: Live tube 10", function (done) {
            delete require.cache[require.resolve('../../data/live_tube.json')];
            const tube_data = require("../../data/live_tube.json");
            let data = Object.assign({}, tube_data.autorestart_live_tube);
            data.channel_profile = "224-3_01"
            this.timeout(10000);
            API.post("/liveTube")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    live_tube_id_10 = body.live_tube_id;
                    expect(body.status).to.be.true;
                    setTimeout(done, 8000);
                });
        });

        it("224-3_02 Data preparation: create live channel in live tube id 10", function (done) {
            this.timeout(60000);
            API.post("/liveChannel")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "live_tube_id": live_tube_id_10
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    channel_name_10 = body.channel_name;
                    expect(body.status).to.be.true;
                    expect(body.channel_name).to.be.a("string");
                    expect(body.inbound_url).to.be.a("string");
                    stream_link = body.inbound_url;
                    if (body.inbound_url) {
                        console.log(stream_link);
                        FFmpeg();
                        expect(err, "if this case test fail,pls check streaming live!").to.be.equal(null);
                    };
                    setTimeout(done, 55000);
                });
        });

        it("224-3_03 Data preparation: End live channel", function (done) {
            this.timeout(10000);
            API.put("/liveChannel/" + channel_name_10)
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

        it("224-3_04 Check the expected result: check live_tube_id is deleted in the details of live channel 10.", function (done) {
            API.get("/liveChannel/" + channel_name_10)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    expect(body).to.not.have.all.keys("live_tube_id");
                    done();
                });
        });

        after("Delete 224-3 test data", function (done) {
            this.timeout(10000);
            API.delete("/liveTube/" + live_tube_id_10)
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
    });

    describe("224-5:no playback link return(TSoHTTP)", function () {
        let ts_live_tube_id_4 = "";
        let ts_channel_name_4 = "";
        let ts_kernel_4 = "";

        it("224-5_01 Data preparation: Create TSOHTTP live tube 4", function (done) {
            this.timeout(30000);
            API.post("/liveTube")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "source_type": "TSoHTTP",
                    "channel_profile": "224-5_01",
                    "ts_url": ts_live_url,
                    "autorestart": false,
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
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    ts_live_tube_id_4 = body.live_tube_id;
                    ts_channel_name_4 = body.channel_name;
                    expect(body.status).to.be.true;
                    setTimeout(done, 28000);
                });
        });

        it("224-5_02 Data preparation: Get the ts ive tube 4 kernel", function (done) {
            API.get("/liveTube/" + ts_live_tube_id_4)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    ts_kernel_4 = body.kernel;
                    expect(body.status).to.be.true;
                    done();
                });
        });

        it("224-5_03 Data preparation: stop ts live tube 4 kernel from stream controler", function (done) {
            this.timeout(10000);
            OMP_API.delete("/omp/ompKernel?kernelId=" + ts_kernel_4)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.text)
                    expect(res.text).to.be.equal("OK")
                    setTimeout(done, 8000);
                });
        });

        it("224-5_04 Data preparation: delete ts live tube 4 from stream controler", function (done) {
            OMP_API.delete("/omp/ompProfile?name=" + ts_live_tube_id_4)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.text)
                    expect(res.text).to.be.equal("OK")
                    done();
                });
        });

        it("224-5_05 Check the expected result: check the details of ts live channel 4: do not display live stream play address", function (done) {
            this.timeout(10000)
            API.get("/liveChannel/" + ts_channel_name_4)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    expect(body.playbackURL.mp4Output[0]).to.not.have.all.keys("mp4URL_cdn");
                    expect(body.playbackURL.hlsOutput[0]).to.not.have.all.keys("hlsURL", "hlsURL_cdn");
                    setTimeout(done, 8000)
                });
        });

        after("Delete 224-5 test data", function (done) {
            this.timeout(10000);
            API.delete("/liveTube/" + ts_live_tube_id_4)
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
    });

    //测试TSoHTTP图片在90s之后会自动删除
    // describe("227,237-1,237-2: live channel(TSoHTTP)", function(){
    //     let ts_live_tube_id_5 = "";
    //     let ts_channel_name_5 = "";

    //     it("227 and 237-1 and 237-2 Test data preparation: Create a TSOHTTP live tube", function(done){
    //         this.timeout(35000);
    //         API.post("/liveTube")
    //         .set("Authorization", "Bearer " + tenant_admin_token)
    //         .send({
    //             "source_type": "TSoHTTP",
    //             "channel_profile": "227 and 237-1 and 237-2",
    //             "ts_url": ts_live_url,
    //             "autorestart": true,
    //             "proc_profile_id": live_profile_id,
    //             "out_type":
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
    //                 "rtmp_out": 1,
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
    //             let body = JSON.parse(res.text);
    //             console.log(body);
    //             ts_live_tube_id_5 = body.live_tube_id;
    //             ts_channel_name_5 = body.channel_name;
    //             expect(body.status).to.be.true;
    //             setTimeout(done, 33000);
    //         });
    //     });

    //     it("237-1:list TSoHTTP's thumbnail", function(done){
    //         this.timeout(100000);
    //         API.post("/image")
    //             .set("Authorization", "Bearer " + tenant_admin_token)
    //             .send({
    //                 "image_type": "thumbnail",
    //                 "media_type": "LIVE",
    //                 "media_id": ts_channel_name_5,
    //                 "limit": 10
    //             })
    //             .end(function(err, res) {
    //                 if (err) throw err;
    //                 let body = JSON.parse(res.text);
    //                 console.log(body);
    //                 let thumbnail_url_1 = body.image[0];
    //                 thumbnail_1 = thumbnail_url_1.substring(thumbnail_url_1.indexOf("thumbnail")+36, thumbnail_url_1.length);
    //                 console.log(thumbnail_1);
    //                 expect(body.status).to.be.true;
    //                 expect(body).to.have.all.keys("status", "total_count", "image");
    //                 setTimeout(done, 95000);
    //             });
    //     });

    //     //新增 测试90s删除TSoHTTP thumbnail图片
    //     /*
    //     it("TSoHTTP thumbnail: After 90S, check whether the thumbnail is deleted successfully.should be not exist", function(done) {
    //         let tenant_db = tenant_account_data.tenant_admin.tenant_name
    //         let found_thumbnail = false;
    //         //const thumbnail_path = `/var/panel/library/video/live/output/${tenant_db}/thumbnails/5b7e5b27b3ad7a14b48bab2d/`;
    //         const thumbnail_path = `/var/panel/library/video/live/output/${tenant_db}/thumbnails/${ts_channel_name_5}/`;
    //         console.log(thumbnail_path+thumbnail_1)
    //         fs.exists(thumbnail_path+thumbnail_1, function(exists) {
    //             console.log(exists);
    //             if(exists == false){
    //                 found_thumbnail=true
    //             }
    //             expect(found_thumbnail).to.equal(true);
    //             done();
    //         });
    //     });
    //     */

    //     // it("237-2: list TSoHTTP's facialdetect", function(done){
    //     //     this.timeout(100000);
    //     //     API.post("/image")
    //     //         .set("Authorization", "Bearer " + tenant_admin_token)
    //     //         .send({
    //     //             "image_type": "facialDetect",
    //     //             "media_type": "LIVE",
    //     //             "media_id": ts_channel_name_5,
    //     //             "limit": 10
    //     //         })
    //     //         .end(function(err, res) {
    //     //             if (err) throw err;
    //     //             let body = JSON.parse(res.text);
    //     //             console.log(body);
    //     //             //let facialdetect_url_1 = body.image[0]
    //     //             //facialdetect_1 = facialdetect_url_1.substring(facialdetect_url_1.indexOf("facialDetect")+38, facialdetect_url_1.length)
    //     //             //console.log(facialdetect_1);
    //     //             expect(body.status).to.be.true;
    //     //             expect(body).to.have.all.keys("status", "total_count", "image");
    //     //             setTimeout(done, 95000);
    //     //         });
    //     // });

    //     //新增 测试90s删除TSoHTTP facialdetect图片
    //     /*
    //     it("TSoHTTP facialdetect: After 90S, check whether the facialdetect is deleted successfully.should be not exist", function(done) {
    //         let tenant_db = tenant_account_data.tenant_admin.tenant_name
    //         let found_facialdetect = false;
    //         //const thumbnail_path = `/var/panel/library/video/live/output/${tenant_db}/facialDetect/5b7e5b27b3ad7a14b48bab2d/`;
    //         const facialdetect_path = `/var/panel/library/video/live/output/${tenant_db}/facialDetect/${ts_channel_name_5}/`;
    //         console.log(facialdetect_path+facialdetect_1)
    //         fs.exists(facialdetect_path+facialdetect_1, function(exists) {
    //             console.log(exists);
    //             if(exists == false){
    //                 found_facialdetect=true
    //             }
    //             expect(found_facialdetect).to.equal(true);
    //             done();
    //         });
    //     });
    //     */
    //     it("227_01 Data preparation: delete ts live tube 5", function(done){
    //         this.timeout(20000);
    //         API.delete("/liveTube/" + ts_live_tube_id_5)
    //             .set("Authorization", "Bearer " + tenant_admin_token)
    //             .expect(200)
    //             .end(function(err, res) {
    //                 if (err) throw err;
    //                 let body = JSON.parse(res.text);
    //                 // console.log("当前运行的脚本位置是："+__filename+"的第"+__line+"行 ： ");
    //                 console.log(body);
    //                 expect(body.status).to.be.true;
    //                 setTimeout(done, 10000);
    //             });
    //     });
    //     it("227_02 Data preparation: delete ts live channel 5", function(done){
    //         this.timeout(60000);
    //         API.delete("/liveChannel/" + ts_channel_name_5)
    //             .set("Authorization", "Bearer " + tenant_admin_token)
    //             .expect(200)
    //             .end(function(err, res) {
    //                 if (err) throw err;
    //                 let body = JSON.parse(res.text);
    //                 // console.log("当前运行的脚本位置是："+__filename+"的第"+__line+"行 ： ");
    //                 console.log(body);
    //                 expect(body.status).to.be.true;
    //                 setTimeout(done, 50000);
    //             });
    //     });

    //     it("Check 227 expected result 01: check ts live channel list is deleted", function(done){
    //         API.get("/liveChannel/" + ts_channel_name_5)
    //             .set("Authorization", "Bearer " + tenant_admin_token)
    //             .expect(200)
    //             .end(function(err, res) {
    //                 if (err) throw err;
    //                 let body = JSON.parse(res.text);
    //                 console.log(body);
    //                 expect(body.status).to.be.false;
    //                 expect(body.err.code).to.equal(404);
    //                 expect(body.err.message).to.equal("Live channel not found");
    //                 done();
    //             });
    //     });

    //     it("Check 227 expected result 02: check ts live channel 5 stream directory is deleted", function(done) {
    //         setTimeout(function() {
    //                 let tenant_db = tenant_account_data.tenant_admin.tenant_name
    //                 var stream_mulu_1 = true;
    //                 const stream_mulu = `/var/panel/library/video/live/output/${tenant_db}/${ts_channel_name_5}`;
    //                 path = stream_mulu;
    //                 stream_mulu_1 = checkDirExist(path);
    //                 expect(stream_mulu_1).to.be.false;
    //                 done()
    //             });
    //     });

    //     it("Check 227 expected result 03: check ts live channel 5 mp4 Archive file directory is deleted", function(done) {
    //             setTimeout(function() {
    //                 let tenant_db = tenant_account_data.tenant_admin.tenant_name
    //                 var mp4Archive_mulu_1 = true;
    //                 const mp4Archive_mulu = `/var/panel/library/video/live/output/${tenant_db}/mp4Archive/${ts_channel_name_5}`;
    //                 path = mp4Archive_mulu;
    //                 mp4Archive_mulu_1 = checkDirExist(path);
    //                 expect(mp4Archive_mulu_1).to.be.false;
    //                 done();
    //             });
    //     });

    //     it("Check 227 expected result 04: check ts live channel 5 hls Archive file directory is deleted", function(done) {
    //         setTimeout(function() {
    //             let tenant_db = tenant_account_data.tenant_admin.tenant_name
    //             var hlsArchive_mulu_1 = true;
    //             const hlsArchive_mulu = `/var/panel/library/video/live/output/${tenant_db}/tsArchive/${ts_channel_name_5}`;
    //             path = hlsArchive_mulu;
    //             hlsArchive_mulu_1 = checkDirExist(path);
    //             expect(hlsArchive_mulu_1).to.be.false;
    //             done();
    //         });
    //     });

    //     it("Check 227 expected result 05: check ts live channel 5 thumbnail image file directory is deleted", function(done) {
    //         this.timeout(6000);	
    //         setTimeout(function() {
    //             let tenant_db = tenant_account_data.tenant_admin.tenant_name
    //             var thumbnail_mulu_1 = true;
    //             const thumbnail_mulu = `/var/panel/library/video/live/output/${tenant_db}/thumbnails/${ts_channel_name_5}`;
    //             path = thumbnail_mulu;
    //             thumbnail_mulu_1 = checkDirExist(path);
    //             expect(thumbnail_mulu_1).to.be.false;
    //             setTimeout(done, 5000)
    //         });
    //     });

    //     it("Check 227 expected result 06: check ts live channel 5 facialDetect image file directory has been deleted", function(done) {
    //         this.timeout(6000);	
    //         setTimeout(function() {
    //             let tenant_db = tenant_account_data.tenant_admin.tenant_name
    //             var facialDetect_mulu_1 = true;
    //             const facialDetect_mulu = `/var/panel/library/video/live/output/${tenant_db}/facialDetect/${ts_channel_name_5}`;
    //             path = facialDetect_mulu;
    //             facialDetect_mulu_1 = checkDirExist(path);
    //             expect(facialDetect_mulu_1).to.be.false;
    //             setTimeout(done, 5000)
    //         });
    //     });


    // });

    describe("245-2:LiveChannel not found", function () {

        let live_tube_id_11 = "";
        let channel_name_11 = "";

        it("245-2_01 Data Preparation: Create autorestart: Live tube 12", function (done) {
            delete require.cache[require.resolve('../../data/live_tube.json')];
            const tube_data = require("../../data/live_tube.json");
            let data = Object.assign({}, tube_data.autorestart_live_tube);
            data.channel_profile = "245-2_01"
            this.timeout(20000);
            API.post("/liveTube")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    live_tube_id_11 = body.live_tube_id;
                    expect(body.status).to.be.true;
                    setTimeout(done, 18000);
                });
        });

        it("245-2_02 Data preparation: create live channel in live tube id 12", function (done) {
            this.timeout(20000);
            API.post("/liveChannel")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "live_tube_id": live_tube_id_11
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    expect(body.channel_name).to.be.a("string");
                    expect(body.inbound_url).to.be.a("string");
                    /*
                    stream_link = body.inbound_url;
                    if(body.inbound_url){
                        console.log(stream_link);
                        FFmpeg();
                        expect(err,"if this case test fail,pls check streaming live!").to.be.equal(null);
                    };
                    */
                    channel_name_11 = body.channel_name;
                    setTimeout(done, 18000);
                });
        });


        it("245-2_03 Data preparation: delete live tube 12", function (done) {
            this.timeout(10000);
            API.delete("/liveTube/" + live_tube_id_11)
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

        it("Check 245-2 expected result: check the returned error message", function (done) {
            API.get("/liveChannel/monitor/" + channel_name_11)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.equal(404);
                    expect(body.err.message).to.equal("LiveTube not found");
                    done();
                });
        });
    });

    describe("245-3:LiveTube not found", function () {
        let live_tube_id_12 = "";
        let channel_name_12 = "";

        it("245-3_01 Data preparation: Create autorestart: Live tube 13", function (done) {
            delete require.cache[require.resolve('../../data/live_tube.json')];
            const tube_data = require("../../data/live_tube.json");
            let data = Object.assign({}, tube_data.autorestart_live_tube);
            data.channel_profile = "245-3_01"
            this.timeout(20000);
            API.post("/liveTube")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    live_tube_id_12 = body.live_tube_id;
                    setTimeout(done, 18000);
                });
        });

        it("245-3_02 Data preparation: create live channel in live tube id 13", function (done) {
            this.timeout(20000);
            API.post("/liveChannel")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "live_tube_id": live_tube_id_12
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    expect(body.channel_name).to.be.a("string");
                    expect(body.inbound_url).to.be.a("string");
                    /*
                    stream_link = body.inbound_url;
                    if(body.inbound_url){
                        console.log(stream_link);
                        FFmpeg();
                        expect(err,"if this case test fail,pls check streaming live!").to.be.equal(null);
                    };
                    */
                    channel_name_12 = body.channel_name;
                    setTimeout(done, 18000);
                });
        });

        it("245-3_03 Data preparation: delete liveChannel", function (done) {
            this.timeout(6000);
            API.delete("/liveChannel/" + channel_name_12)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    setTimeout(done, 5000);
                });
        });

        it("Check 245-3 expected result: check the returned error message", function (done) {
            API.get("/liveChannel/monitor/" + channel_name_12)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.equal(404);
                    expect(body.err.message).to.equal("LiveChannel not found");
                    done();
                });
        });

        after("Delete 245-3 test data", function (done) {
            this.timeout(10000);
            API.delete("/liveTube/" + live_tube_id_12)
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
    });

    describe("245-4:LiveTube is not active", function () {
        let live_tube_id_13 = "";
        let channel_name_13 = "";
        let tube13_kernel = "";

        it("245-4_01 Data preparation: Create autorestart: Live tube 13", function (done) {
            delete require.cache[require.resolve('../../data/live_tube.json')];
            const tube_data = require("../../data/live_tube.json");
            let data = Object.assign({}, tube_data.autorestart_live_tube);
            data.channel_profile = "245-4_01"
            this.timeout(20000);
            API.post("/liveTube")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    live_tube_id_13 = body.live_tube_id;
                    expect(body.status).to.be.true;
                    setTimeout(done, 18000);
                });
        });

        it("245-4_02 Data preparation: create live channel in live tube id 13", function (done) {
            this.timeout(20000);
            API.post("/liveChannel")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "live_tube_id": live_tube_id_13
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    channel_name_13 = body.channel_name;
                    expect(body.status).to.be.true;
                    expect(body.channel_name).to.be.a("string");
                    expect(body.inbound_url).to.be.a("string");
                    /*
                    stream_link = body.inbound_url;
                    if(body.inbound_url){
                        console.log(stream_link);
                        FFmpeg();
                        expect(err,"if this case test fail,pls check streaming live!").to.be.equal(null);
                    };
                    */
                    setTimeout(done, 18000);
                });
        });

        it("245-4_03 Data preparation: Get the kernel of live tube 13", function (done) {
            API.get("/liveTube/" + live_tube_id_13)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    tube13_kernel = body.kernel;
                    expect(body.status).to.be.true;
                    done();
                });
        });

        it("245-4_04 Data preparation: delete the kernel of live tube 13", function (done) {
            this.timeout(30000);
            OMP_API.delete("/omp/ompKernel?kernelId=" + tube13_kernel)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.text)
                    expect(res.text).to.be.equal("OK")
                    setTimeout(done, 28000);
                });
        });

        it("Check 245-4 expected result: check the returned error message", function (done) {
            API.get("/liveChannel/monitor/" + channel_name_13)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.equal(400);
                    expect(body.err.message).to.equal("LiveTube is not active");
                    done();
                });
        });

        after("Delete 245-4 test data", function (done) {
            this.timeout(15000);
            API.delete("/liveTube/" + live_tube_id_13)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    setTimeout(done, 12000);
                });
        });
    });

    describe("Test data preparation:Case174 and 175", function () {

        it("175_01 Data preparation: Create autorestart: Live tube 14", function (done) {
            delete require.cache[require.resolve('../../data/live_tube.json')];
            const tube_data = require("../../data/live_tube.json");
            let data = Object.assign({}, tube_data.autorestart_live_tube);
            data.channel_profile = "175_01 Data"
            this.timeout(20000);
            API.post("/liveTube")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    live_tube_id_14 = body.live_tube_id;
                    expect(body.status).to.be.true;
                    setTimeout(done, 18000);
                });
        });

        it("175_02 Data preparation: create live channel in live tube id 14", function (done) {
            this.timeout(60000);
            API.post("/liveChannel")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "live_tube_id": live_tube_id_14
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    expect(body.channel_name).to.be.a("string");
                    expect(body.inbound_url).to.be.a("string");
                    stream_link = body.inbound_url;
                    if (body.inbound_url) {
                        console.log(stream_link);
                        FFmpeg();
                        expect(err, "if this case test fail,pls check streaming live!").to.be.equal(null);
                    };
                    channel_name_14 = body.channel_name;
                    setTimeout(done, 55000);
                });
        });

        it("184 Data preparation: create live channel in live tube id 14", function (done) {
            this.timeout(20000);
            API.post("/liveChannel")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "live_tube_id": live_tube_id_14
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    channel_name_14_1 = body.channel_name;
                    expect(body.status).to.be.true;
                    expect(body.channel_name).to.be.a("string");
                    expect(body.inbound_url).to.be.a("string");
                    setTimeout(done, 18000);
                });
        });

        it("175_03 Data preparation: Create an Autorestart live tube in another DB", function (done) {
            delete require.cache[require.resolve('../../data/live_tube.json')];
            const tube_data = require("../../data/live_tube.json");
            let data = Object.assign({}, tube_data.autorestart_live_tube);
            data.channel_profile = "175_03 Data"
            this.timeout(35000);
            API.post("/liveTube")
                .set("Authorization", "Bearer " + tenant_admin_token_1)
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    live_tube_id_15 = body.live_tube_id;
                    expect(body.status).to.be.true;
                    setTimeout(done, 33000);
                });
        });

        it("175_04 Data preparation: create a live channel under another DB's Live tube", function (done) {
            this.timeout(60000);
            API.post("/liveChannel")
                .set("Authorization", "Bearer " + tenant_admin_token_1)
                .send({
                    "live_tube_id": live_tube_id_15
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    channel_name_15 = body.channel_name;
                    expect(body.status).to.be.true;
                    expect(body.channel_name).to.be.a("string");
                    expect(body.inbound_url).to.be.a("string");
                    stream_link = body.inbound_url;
                    if (body.inbound_url) {
                        console.log(stream_link);
                        FFmpeg();
                        expect(err, "if this case test fail,pls check streaming live!").to.be.equal(null);
                    };
                    setTimeout(done, 55000);
                });
        });

        it("185 Data preparation: create live channel in live tube id 15", function (done) {
            this.timeout(6000);
            API.post("/liveChannel")
                .set("Authorization", "Bearer " + tenant_admin_token_1)
                .send({
                    "live_tube_id": live_tube_id_15
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    channel_name_15_1 = body.channel_name;
                    expect(body.status).to.be.true;
                    expect(body.channel_name).to.be.a("string");
                    expect(body.inbound_url).to.be.a("string");
                    setTimeout(done, 5000);
                });
        });

        it("184 Data preparation: delete live channel", function (done) {
            API.delete("/liveChannel/" + channel_name_14_1)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    done();
                });
        });

        it("185 Data preparation: delete live channel", function (done) {
            API.delete("/liveChannel/" + channel_name_15_1)
                .set("Authorization", "Bearer " + tenant_admin_token_1)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    done();
                });
        });
    });

    describe("Test data preparation:Case176", function () {

        it("01 Create a non-autorestart: Create a Live tube 6", function (done) {
            this.timeout(15000);
            API.post("/liveTube")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "source_type": "RTMP",
                    "channel_profile": "01 Create a non-autorestart",
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
                                "isVod": true
                            }
                        ]
                    },
                    "autorestart": false
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    live_tube_id_6 = body.live_tube_id;
                    expect(body.status).to.be.true;
                    setTimeout(done, 10000);
                });
        });

        it("02 Data preparation: create live channel in live tube id 6", function (done) {
            this.timeout(60000);
            API.post("/liveChannel")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "live_tube_id": live_tube_id_6
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    channel_name_6 = body.channel_name;
                    expect(body.status).to.be.true;
                    expect(body.channel_name).to.be.a("string");
                    expect(body.inbound_url).to.be.a("string");
                    stream_link = body.inbound_url;
                    if (body.inbound_url) {
                        console.log(stream_link);
                        FFmpeg();
                        expect(err, "if this case test fail,pls check streaming live!").to.be.equal(null);
                    };
                    setTimeout(done, 55000);
                });
        });

        it("03 Get the kernel of Live tube 6", function (done) {
            this.timeout(6000);
            API.get("/liveTube/" + live_tube_id_6)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    tube6_kernel = body.kernel;
                    expect(body.status).to.be.true;
                    setTimeout(done, 5000);
                });
        });
    });

    describe("===Restart omp===", function () {

        it("Restart omp", function (done) {
            if (omp_host == orchestrator_host) {
                OMPrestart_same();
            }
            else {
                OMPrestart_different();
            }
            this.timeout(60000);
            console.log("Restarting omp...");
            setTimeout(done, 58000);
        });
    });

    describe("176:Restart OMP, the live channel data of non-autorestart live tube will be cleared, including kernel, only keep live tube list, channel list", function () {

        it("176_01:Check live tube 6 kernel has been deleted", function (done) {
            this.timeout(8000);
            OMP_API.delete("/omp/ompKernel?kernelId=" + tube6_kernel)
                .expect(404)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log("Return error message:");
                    console.log(res.text);
                    expect(res.text).to.equal("Kernel Not Found");
                    setTimeout(done, 6000);
                });
        });

        it("176_02:Check can get live tube list and keep old kernel", function (done) {
            this.timeout(8000);
            API.get("/liveTube/" + live_tube_id_6)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    expect(body.kernel).to.equal(tube6_kernel);
                    expect(body.kernel_status).to.equal(0);
                    setTimeout(done, 6000);
                });

        });

        it("176_03:Check can get live channel list", function (done) {
            this.timeout(8000);
            API.get("/liveChannel/" + channel_name_6)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    expect(body.channel_name).to.equal(channel_name_6);
                    expect(body.channel_title).to.equal(channel_name_6);
                    setTimeout(done, 6000);
                });
        });

        it("176_04:Check channel_name_6 tsArchive file has been deleted", function (done) {
            this.timeout(6000);
            setTimeout(function () {
                let tenant_db = tenant_account_data.tenant_admin.tenant_name
                var is_tsArchivePath = true;
                const tsArchivePath = `/var/panel/library/video/live/output/${tenant_db}/tsArchive/${channel_name_6}`;
                console.log(tsArchivePath)
                path = tsArchivePath;
                is_tsArchivePath = checkDirExist(path);
                if (is_tsArchivePath == true) {
                    console.log("**tsArchive file directory has not been deleted**")
                };
                expect(is_tsArchivePath).to.be.false;
                setTimeout(done, 5000);
            });
        });

        it("176_05:Check channel_name_6_1 mp4Archive file has been deleted", function (done) {
            this.timeout(6000);
            setTimeout(function () {
                let tenant_db = tenant_account_data.tenant_admin.tenant_name
                var is_mp4ArchivePath = true;
                const mp4ArchivePath = `/var/panel/library/video/live/output/${tenant_db}/mp4Archive/${channel_name_6}`;
                path = mp4ArchivePath;
                is_mp4ArchivePath = checkDirExist(path);
                if (is_mp4ArchivePath == true) {
                    console.log("**mp4Archive file directory has not been deleted**")
                };
                expect(is_mp4ArchivePath).to.be.false;
                setTimeout(done, 5000);
            });
        });

        it("176_06:Check channel_name_6_1 thumbnail image file directory not deleted", function (done) {
            this.timeout(10000);
            setTimeout(function () {
                let tenant_db = tenant_account_data.tenant_admin.tenant_name
                var is_thumbnail_mulu = true;
                const thumbnail_mulu = `/var/panel/library/video/live/output/${tenant_db}/thumbnails/${channel_name_6}`;
                path = thumbnail_mulu;
                is_thumbnail_mulu = checkDirExist(path);
                if (is_thumbnail_mulu == false) {
                    console.log("**Thumbnail image file directory is deleted**")
                };
                expect(is_thumbnail_mulu).to.be.true;
                setTimeout(done, 8000);
            });
        });
        /*
                it.skip("176_07:检查channel_name_6_1 facialDetect图片文件目录没有删除", function(done) {
                    this.timeout(6000);	
                    setTimeout(function() {
                        let tenant_db = tenant_account_data.tenant_admin.tenant_name
                        var is_facialDetect_mulu = true;
                        const facialDetect_mulu = `/var/panel/library/video/live/output/${tenant_db}/facialDetect/${channel_name_6}`;
                        path = hlsArchive_mulu;
                        is_facialDetect_mulu = checkDirExist(path);
                        if(is_facialDetect_mulu == false){
                            console.log("**thumbnail图片文件目录被删除**")
                        };
                        expect(is_facialDetect_mulu).to.be.true;
                        setTimeout(done, 5000);
                    });
                });
        */
        it("Delete 176 test data", function (done) {
            this.timeout(20000);
            API.delete("/liveTube/" + live_tube_id_6)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    setTimeout(done, 18000);
                });
        });

    });

    describe("174:After the same DB:OMP restart, the live channel of multiple autorestart live tubes can resume streaming and playback.", function () {
        it("174:Check if the flow is restored", function (done) {
            this.timeout(80000);
            API.get("/liveChannel/" + channel_name_14)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    expect(body.channel_name).to.be.a("string");
                    expect(body.source_url).to.be.a("string");
                    stream_link = body.source_url;
                    if (body.source_url) {
                        console.log(stream_link);
                        FFmpeg();
                        expect(err, "if this case test fail,pls check streaming live!").to.be.equal(null);
                    }
                    setTimeout(done, 75000);
                });
        });
    });

    describe("175:After different DB:OMP restart, multiple autorestart live tube live channels can resume push flow", function () {

        it("175:Check if another DB's Live Tube resumes pushing traffic", function (done) {
            this.timeout(80000);
            API.get("/liveChannel/" + channel_name_15)
                .set("Authorization", "Bearer " + tenant_admin_token_1)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    expect(body.channel_name).to.be.a("string");
                    expect(body.source_url).to.be.a("string");
                    stream_link = body.source_url;
                    if (body.source_url) {
                        console.log(stream_link);
                        FFmpeg();
                        expect(err, "if this case test fail,pls check streaming live!").to.be.equal(null);
                    }
                    setTimeout(done, 75000);
                });
        });
    });

    describe("184 and 185:Restart omp, the non-autorestart and autorestart live channels that have been deleted will not be restored.", function () {

        it("184:After restarting omp, check that live channel will not be restored.", function (done) {
            API.get("/liveChannel/" + channel_name_14_1)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.equal(404);
                    expect(body.err.message).to.equal("Live channel not found");
                    done();
                });
        });

        it("185:After restarting omp, check that live channel will not be restored.", function (done) {
            API.get("/liveChannel/" + channel_name_15_1)
                .set("Authorization", "Bearer " + tenant_admin_token_1)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.equal(404);
                    expect(body.err.message).to.equal("Live channel not found");
                    done();
                });
        });
    });

    //清除DB
    describe("Clear DB data_2", function () {

        it("Delete DB_2", function (done) {
            this.timeout(80000);
            API.delete("/clearDB/autotest")
                .set("Authorization", "Bearer " + orchestrator_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    setTimeout(done, 75000);
                });
        });

        it("Delete another DB_2", function (done) {
            this.timeout(20000);
            API.delete("/clearDB/autotestlive")
                .set("Authorization", "Bearer " + orchestrator_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    setTimeout(done, 18000);
                });
        });

    });
    //重新创建DB
    describe("Recreate DB_2", function () {

        it("Create Tenant db_2", function (done) {
            this.timeout(20000);
            API.post("/tenant")
                .set("Authorization", "Bearer " + orchestrator_admin_token)
                .send(tenant_data.tenant_db)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body)
                    tenant_db_id = body.tenant_db_id;
                    expect(body.status).to.be.true;
                    setTimeout(done, 18000);
                });
        });

        it("Create Tenant admin_2", function (done) {
            this.timeout(8000);
            API.post("/tenant_admin")
                .set("Authorization", "Bearer " + orchestrator_admin_token)
                .send(tenant_account_data.tenant_admin)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body)
                    tenant_admin_id = body._id;
                    expect(body.status).to.be.true;
                    //expect(body.username).to.be.equal(tenant_account_data.tenant_admin.username);
                    setTimeout(done, 6000);
                });
        });

        it("Create another Tenant DB_2", function (done) {
            this.timeout(10000);
            API.post("/tenant")
                .set("Authorization", "Bearer " + orchestrator_admin_token)
                .send(tenant_data.new_live_tenant_db)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    tenant_db_id_1 = body.tenant_db_id;
                    expect(body.status).to.be.true;
                    setTimeout(done, 8000);
                });
        });

        it("Create another DB's Tenant admin", function (done) {
            this.timeout(8000);
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
                    setTimeout(done, 6000);
                });
        });

    });
    //重新获取token
    describe("Regain tenant admin token", function () {

        it("Get tenant_admin token", function (done) {
            this.timeout(8000);
            API.post("/tenant_admin/login")
                .send(tenant_account_data.tenant_admin)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    tenant_admin_token = body.tenant_admin_token;
                    expect(body.status).to.be.true;
                    expect(body.username).to.equal("autotest");
                    setTimeout(done, 6000);
                });
        });

        it("Get another DB's tenant_admin token", function (done) {
            API.post("/tenant_admin/login")
                .send(tenant_account_data.new_tenant_admin)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    tenant_admin_token_1 = body.tenant_admin_token;
                    expect(body.status).to.be.true;
                    expect(body.username).to.equal(tenant_account_data.new_tenant_admin.username);
                    done();
                });
        });

        it("Create live profile", function (done) {
            API.post("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(profile_data.live_auto_profile)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    live_profile_id = body.proc_profile_id;
                    expect(body.status).to.be.true;
                    done();
                });
        });
    });
    /*
    ///////////////////////////////////////////////////////////////
    describe("189 LIVE tube can be auto re-established after Orchestrator restart", function(){

        it("189_01 Create a Live tube 1 that is re-established after restarting the orchestrator", function(done){
            //创建用于重启orchestrator后re-established的Live tube 1
            this.timeout(30000);
            API.post("/liveTube")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(live_tube_data.autorestart_live_tube)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    restart_live_tube_id_1 = body.live_tube_id
                    expect(body.status).to.be.true;
                    setTimeout(done, 28000);
                });
        });

        it("189_02 Create a live channel 1 that is re-established after restarting the orchestrator", function(done){
            //创建用于重启orchestrator后re-established的Live channel 1
            this.timeout(60000);
            API.post("/liveChannel")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "live_tube_id": restart_live_tube_id_1
                })
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    restart_live_channel_name_1 = body.channel_name;
                    expect(body.status).to.be.true;
                    expect(body.channel_name).to.be.a("string");
                    expect(body.inbound_url).to.be.a("string");
                    stream_link = body.inbound_url;
                    if(body.inbound_url){
                        console.log(stream_link);
                        FFmpeg();
                        expect(err,"if this case test fail,pls check streaming live!").to.be.equal(null);
                    }
                    setTimeout(done, 58000);
                });
        });

        it("189_03 Create a Live tube 2 that is re-established after restarting the orchestrator", function(done){
            ////创建用于重启orchestrator后re-established的Live tube 2
            this.timeout(20000);
            API.post("/liveTube")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(live_tube_data.autorestart_live_tube)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    restart_live_tube_id_2 = body.live_tube_id
                    expect(body.status).to.be.true;
                    setTimeout(done, 18000);
                });
        });

        it("189_04 Create a live channel 2 that is re-established after restarting the orchestrator", function(done){
            //创建用于重启orchestrator后re-established的Live channel 2
            this.timeout(60000);
            API.post("/liveChannel")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "live_tube_id": restart_live_tube_id_2
                })
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    restart_live_channel_name_2 = body.channel_name;
                    expect(body.status).to.be.true;
                    expect(body.channel_name).to.be.a("string");
                    expect(body.inbound_url).to.be.a("string");
                    stream_link = body.inbound_url;
                    if(body.inbound_url){
                        console.log(stream_link);
                        FFmpeg();
                        expect(err,"if this case test fail,pls check streaming live!").to.be.equal(null);
                    }
                    setTimeout(done, 58000);
                });
        });
    });

    describe("===Restart Orchestrator===", function(){
        it("Restart Orchestrator", function(done) {
            RestartOrchestrator()
            this.timeout(30000);
            console.log("Restarting Orchestrator...");
            setTimeout(done,28000);
        });
    });
    
    describe("Check if all live channels are restored", function(){

        it("Check restart Live channel 1", function(done){
            this.timeout(60000);
            API.get("/liveChannel/" + restart_live_channel_name_1)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    expect(body.channel_name).to.equal(restart_live_channel_name_1);
                    stream_link = body.source_url;
                    if(body.source_url){
                        console.log(stream_link);
                        FFmpeg();
                        expect(err,"if this case test fail,pls check streaming live!").to.be.equal(null);
                    }
                    setTimeout(done, 58000);
                });
        });

        it("Check restart Live channel 2", function(done){
            this.timeout(60000);
            API.get("/liveChannel/" + restart_live_channel_name_2)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    expect(body.channel_name).to.equal(restart_live_channel_name_2);
                    stream_link = body.source_url;
                    if(body.source_url){
                        console.log(stream_link);
                        FFmpeg();
                        expect(err,"if this case test fail,pls check streaming live!").to.be.equal(null);
                    }
                    setTimeout(done, 58000);
                });
        });
    });
    /////////////////////////////////////////////////////////////////////////
    */
    //清除DB
    describe("Clear DB data_3", function () {

        it("Get orchestrator_admin token", function (done) {
            API.post("/orchestrator_admin/login")
                .send(orchestrator_account_data.orc_admin)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    orchestrator_admin_token = body.orchestrator_admin_token
                    expect(body.status).to.be.true;
                    expect(body.username).to.equal("orc_admin")
                    done();
                });
        });

        it("Delete DB_3", function (done) {
            this.timeout(80000);
            API.delete("/clearDB/autotest")
                .set("Authorization", "Bearer " + orchestrator_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    setTimeout(done, 75000);
                });
        });

        it("Delete another DB_3", function (done) {
            this.timeout(20000);
            API.delete("/clearDB/autotestlive")
                .set("Authorization", "Bearer " + orchestrator_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    setTimeout(done, 18000);
                });
        });
    });
    //重新创建DB
    describe("Recreate DB_3", function () {

        it("Create Tenant db_3", function (done) {
            this.timeout(20000);
            API.post("/tenant")
                .set("Authorization", "Bearer " + orchestrator_admin_token)
                .send(tenant_data.tenant_db)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body)
                    expect(body.status).to.be.true;
                    setTimeout(done, 18000);
                });
        });

        it("Create Tenant admin_3", function (done) {
            this.timeout(20000);
            API.post("/tenant_admin")
                .set("Authorization", "Bearer " + orchestrator_admin_token)
                .send(tenant_account_data.tenant_admin)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body)
                    expect(body.status).to.be.true;
                    expect(body.username).to.be.equal(tenant_account_data.tenant_admin.username)
                    setTimeout(done, 18000);
                });
        });
    });
});