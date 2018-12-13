const config = require("../../config");
const common = require("../common/common");
const API = common.api;
const expect = require("chai").expect;
const tenant_account_data = require("../../data/tenant_account.json");
delete require.cache[require.resolve('../../data/profile.json')];
const orchestrator_account_data = require("../../data/orchestrator_account.json");
const tenant_data = require("../../data/tenant.json");
const profile_data = require("../../data/profile.json");
const tenant = require("../../data/tenant.json");
const imagepath = config.source.image;
const videopath = config.source.video;
const LIMIT = config.sql_limit;
let tenant_admin_id = "";
let tenant_admin_token = "";
let user_id = "";
let vod_profile_id1 = "";
let vod_profile_id2 = "";
let live_profile_id = "";
let source_file_id = "";
let orchestrator_admin_token = "";

let library_id1_1 = "";
let library_id1_2 = "";
let library_id2_1 = "";
let library_id2_2 = "";

let live_id = "";
let live_tube_id = "";
let live_channel_id = "";
const not_exist_id = "5ab1f860a5ecc9b69735284c";
const NOVALID = "novalid";
const LIVE_CHANNEL_NAME = "TSoHTTPLiveAuto";

let user_total_count = 0;
let profile_total_count = 2;
let vod_source_total_count = 0;
let live_tube_total_count = 0;
let live_channel_total_count = 0;
let library_total_count = 0;

let source_file_id1
let source_file_id2

let source_file_id_d
let library_id_d
let library_idT_1
let library_idT_2
let default_vod_pro
let default_vod_pro_name
let source_file_name

let library_id3_1
let vod_profile_id3
let source_file_id3
let Adaptive_bitrate_library_id = "";
let vod_profile_id_multiple_bitrate = ""
let h265_vod_profile_id = ""
let source_file_id_new = ""
let library_id_h265_1 = ""
let library_id_h265_2 = ""
let library_id_h265_3 = ""
let library_id_h265_4 = ""
let library_id_default = "";

const orchestrator_host = "172.16.1.87:8033";
const Transfer_url = "http://172.16.1.87:8033/origin/vod/";
const transfer_tenant_name = tenant_account_data.tenant_admin.tenant_name
let transfer_source_id = "";
let transfer_profile_name = "";
let transfer_source_id_mov = "";
let transfer_source_id_s = ""
let vod_file
//let fs = require('fs');

const callfile = require('child_process');
function CreateTestFile() {
    callfile.execFile("/var/backend/orchestrator_auto_test/createTestFile.sh")
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


describe("CMBDEV_API TEST vod", function () {
    /*
        afterEach(function(){
            console.log("-+-------------------------------------------------------+-");
        });
    */

    describe("1.1 Login Tenant Admin", function () {
        it("login successful", function (done) {
            API.post("/tenant_admin/login")
                .send(tenant_account_data.tenant_admin)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    tenant_admin_token = body.tenant_admin_token;
                    tenant_admin_id = body._id;
                    done();
                });
        });

        it("Create vod profile", function (done) {
            API.post("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(profile_data.h265_vod_profile)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    if (body.status == false) {
                        console.log(body);
                    };
                    expect(body.status).to.be.true;
                    h265_vod_profile_id = body.proc_profile_id;
                    done();
                });
        });

    })
    describe("1.14  Upload VOD source", function () {
        before("create success : VOD Profile1,have image", function (done) {
            this.timeout(3000);
            setTimeout(function () {
                API.post("/profile")
                    .set("Authorization", "Bearer " + tenant_admin_token)
                    .send(profile_data.vod_profile)
                    .expect(200)
                    .end(function (err, res) {
                        if (err) throw err;
                        let body = JSON.parse(res.text);
                        console.log("Created successfully:VOD Profile====================1")
                        console.log(body);
                        console.log(profile_data.vod_profile);
                        expect(body.status).to.be.true;
                        vod_profile_id1 = body.proc_profile_id;
                        profile_total_count++;
                        done();
                    });
            }, 1000);
        });
        before("create success : VOD Profile2,have iamge", function (done) {
            this.timeout(3000);
            setTimeout(function () {
                API.post("/profile")
                    .set("Authorization", "Bearer " + tenant_admin_token)
                    .send(profile_data.vod_profile2)
                    .expect(200)
                    .end(function (err, res) {
                        if (err) throw err;
                        let body = JSON.parse(res.text);
                        console.log("Created successfully:VOD Profile====================2")
                        console.log(body)
                        console.log(profile_data.vod_profile2)
                        expect(body.status).to.be.true;
                        vod_profile_id2 = body.proc_profile_id;
                        profile_total_count++;
                        done();
                    });
            }, 1000);
        });
        it("1.18  List VOD source fail : No records exist", function (done) {
            API.get("/source")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.body)
                    let body = JSON.parse(res.text);
                    expect(body.err.code).to.be.equal(404)
                    expect(body.err.message).to.be.equal("No records exist")
                    done();
                });
        });
        it("1.13  Allocate Source file ID1", function (done) {
            API.get("/source/id")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    source_file_id1 = body.source_file_id;
                    done();
                });
        });
        it("103 upload success 1:MP4", function (done) {
            this.timeout(5000);	// it takes some time to create the directory....
            setTimeout(function () {
                API.post("/library/upload")
                    .set("Authorization", "Bearer " + tenant_admin_token)
                    .field("type", "video")
                    .field("source_file_id", source_file_id1)
                    .attach("file", videopath.mp4, "sample.mp4")
                    .expect(200)
                    .end(function (err, res) {
                        if (err) throw err;
                        console.log(res.body)
                        let body = JSON.parse(res.text);
                        expect(body.status).to.be.true;
                        vod_source_total_count++;
                        done();
                    });
            }, 2000)
        });
        it("108 upload fail : Source file id already in use", function (done) {
            this.timeout(5000);	// it takes some time to create the directory....
            setTimeout(function () {
                API.post("/library/upload")
                    .set("Authorization", "Bearer " + tenant_admin_token)
                    .field("type", "video")
                    .field("source_file_id", source_file_id1)
                    .attach("file", videopath.mp4, "sample.mp4")
                    .expect(200)
                    .end(function (err, res) {
                        if (err) throw err;
                        console.log(res.body)
                        let body = JSON.parse(res.text);
                        expect(body.status).to.be.false;
                        expect(body.err.message).to.be.equal("Source file id already in use")
                        expect(body.err.code).to.be.equal(400)
                        done();
                    });
            }, 3500)
        });

        //测试失败的
        /*
                it.skip("109 upload fail : source file id not found", function(done) {
                    this.timeout(5000);	// it takes some time to create the directory....
                    setTimeout(function() {
                        API.post("/library/upload")
                            .set("Authorization", "Bearer " + tenant_admin_token)
                            .field("type", "video")
                            .field("source_file_id", "5b238ba4e8791f0afd94bb82")
                            .attach("file", videopath.mp4, "sample.mp4")
                            .expect(200)
                            .end(function(err, res) {
                                if (err) throw err;
                                console.log(res.body)
                                let body = JSON.parse(res.text);
                                expect(body.status).to.be.false;
                                expect(body.err.message).to.be.equal("source file id not found")
                                expect(body.err.code).to.be.equal(404)
                                done();
                            });
                    },3500)		
                });
        */
        it("110 upload fail : Source id error.", function (done) {
            this.timeout(5000);	// it takes some time to create the directory....
            setTimeout(function () {
                API.post("/library/upload")
                    .set("Authorization", "Bearer " + tenant_admin_token)
                    .field("type", "video")
                    .field("source_file_id", "5b2382cce8791f0afd94AAAasdfasdf")
                    .attach("file", videopath.mp4, "sample.mp4")
                    .expect(200)
                    .end(function (err, res) {
                        if (err) throw err;
                        console.log(res.body)
                        let body = JSON.parse(res.text);
                        expect(body.status).to.be.false;
                        expect(body.err.message).to.be.equal("Source id error.")
                        expect(body.err.code).to.be.equal(400)
                        done();
                    });
            }, 2000)
        });
        it("1.13  Allocate Source file ID2", function (done) {
            API.get("/source/id")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    source_file_id2 = body.source_file_id;
                    done();
                });
        });
        it("upload success 2:MP4", function (done) {
            this.timeout(5000);	// it takes some time to create the directory....
            setTimeout(function () {
                API.post("/library/upload")
                    .set("Authorization", "Bearer " + tenant_admin_token)
                    .field("type", "video")
                    .field("source_file_id", source_file_id2)
                    .attach("file", videopath.mp4, "sample.mp4")
                    .expect(200)
                    .end(function (err, res) {
                        if (err) throw err;
                        let body = JSON.parse(res.text);
                        expect(body.status).to.be.true;
                        vod_source_total_count++;
                        done();
                    });
            }, 2000)
        })
    })
    describe("1.18  List VOD source", function () {
        let next
        let previous
        let next_no
        let previous_no
        it("133 Get the list of vod sources: no parameters added", function (done) {
            API.get("/source")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.body)
                    let body = JSON.parse(res.text);
                    expect(body.results).to.be.an("array");
                    expect(body.total_count).to.be.equal(vod_source_total_count);
                    next_no = body.next
                    previous_no = body.previous
                    done();
                });
        });
        it("134  Get the list of vod sources : use the limit parameter", function (done) {
            API.get("/source?limit=1")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.body)
                    let body = JSON.parse(res.text);
                    expect(body.results).to.be.an("array");
                    expect(body.results.length).to.be.equal(1)
                    expect(body.total_count).to.be.equal(vod_source_total_count);
                    next = body.next
                    done();
                });
        });
        it("136  get vod source list : next", function (done) {
            API.get("/source?limit=1&next=" + next)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.body)
                    let body = JSON.parse(res.text);
                    expect(body.results).to.be.an("array");
                    expect(body.results.length).to.be.equal(1)
                    expect(body.total_count).to.be.equal(vod_source_total_count);
                    previous = body.previous
                    done();
                });
        });
        it("137  get vod source list : previous", function (done) {
            API.get("/source?limit=1&previous=" + previous)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.body)
                    let body = JSON.parse(res.text);
                    expect(body.results).to.be.an("array");
                    expect(body.results.length).to.be.equal(1)
                    expect(body.total_count).to.be.equal(vod_source_total_count);
                    done();
                });
        });
        it("138 get vod source list fail : No records exist", function (done) {
            API.get("/source?limit=1&next=" + next_no)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.body)
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.equal(false)
                    expect(body.err.code).to.be.equal(404)
                    expect(body.err.message).to.be.equal("No records exist")
                    done();
                });
        });
        it("138 get vod source list fail : No records exist", function (done) {
            API.get("/source?limit=1&previous=" + previous_no)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.body)
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.equal(false)
                    expect(body.err.code).to.be.equal(404)
                    expect(body.err.message).to.be.equal("No records exist")
                    done();
                });
        });
    })
    describe("1.15 Start VOD source transcode", function () {
        let library_again1
        let library_again2
        let source_file_id_notupload
        let vod_pro_dis
        before("1.13  Allocate Source file ID : not upload", function (done) {
            API.get("/source/id")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    source_file_id_notupload = body.source_file_id;
                    done();
                });
        })
        before("create VOD Profile : disable", function (done) {
            delete require.cache[require.resolve('../../data/profile.json')];
            const profile_data = require("../../data/profile.json");
            let data = Object.assign({}, profile_data.vod_profile);
            data.profile_name = "disableprof"
            data.is_use = false
            API.post("/profile")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body)
                    expect(body.status).to.be.true;
                    vod_pro_dis = body.proc_profile_id;
                    done();
                });
        })
        it("121 encode fail : Process Profile doesn't exist/not enabled", function (done) {
            API.post("/library/encode")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    source_file_id: source_file_id1,
                    proc_profile_id: [vod_pro_dis]
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(404);
                    expect(body.err.message).to.be.equal("Process Profile doesn't exist/not enabled")
                    done()
                })
        })
        it("112 Start encoding successfully 1: source file without any encoding", function (done) {
            this.timeout(60000)
            API.post("/library/encode")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    source_file_id: source_file_id1,
                    proc_profile_id: [vod_profile_id1, vod_profile_id2]
                })
                .expect(200)
                .end(function (err, res) {
                    console.log("source_file_id1 : " + source_file_id1)

                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body)
                    expect(body.status).to.be.true;
                    library_total_count++
                    library_total_count++
                    library_id1_1 = body.library[0];
                    library_id1_2 = body.library[1];
                    console.log("==========================library_id1_1==========================++")
                    console.log(library_id1_1)
                    console.log("==========================library_id1_2==========================++")
                    console.log(library_id1_2)
                    console.log("==========================vod_profile_id1==========================++")
                    console.log(vod_profile_id1)
                    console.log("==========================vod_profile_id2==========================++")
                    console.log(vod_profile_id2)
                    setTimeout(done, 58000)
                });
        })
        it("112 Start encoding successfully 2: The source file has not been encoded.", function (done) {
            this.timeout(60000)
            API.post("/library/encode")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    source_file_id: source_file_id2,
                    proc_profile_id: [vod_profile_id1, vod_profile_id2]
                })
                .expect(200)
                .end(function (err, res) {
                    console.log("source_file_id2 : " + source_file_id2)
                    console.log(vod_profile_id1)
                    console.log(vod_profile_id2)
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body)
                    expect(body.status).to.be.true;
                    library_total_count++
                    library_total_count++
                    library_id2_1 = body.library[0];
                    library_id2_2 = body.library[1];
                    setTimeout(done, 58000)
                });
        })
        it("119 Start transcoding failed: source_file_id does not exist", function (done) {
            this.timeout(60000)
            API.post("/library/encode")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    source_file_id: not_exist_id,
                    proc_profile_id: [vod_profile_id1]
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.body)
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(404);
                    expect(body.err.message).to.be.equal("Source object doesn\'t exist or No source file binded to source file ID")
                    setTimeout(done, 58000)
                });
        })
        it("120 encode fail : No source file bounded to source file ID", function (done) {   //这里需要确认,如何出现这个err msg
            this.timeout(60000)
            API.post("/library/encode")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    source_file_id: source_file_id_notupload
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.body)
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(404);
                    expect(body.err.message).to.be.equal("Source object doesn\'t exist or No source file binded to source file ID")
                    setTimeout(done, 58000)
                });
        })
        it("121 encode fail:proc_profile not exist", function (done) {
            this.timeout(60000)
            API.post("/library/encode")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    source_file_id: source_file_id1,
                    proc_profile_id: [not_exist_id]
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.body)
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(404);
                    expect(body.err.message).to.be.equal('Process Profile doesn\'t exist/not enabled')
                    setTimeout(done, 58000)
                });
        })
        it("encode vod again, use default vod profile,only HLS out", function (done) {
            this.timeout(60000)
            API.post("/library/encode")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    source_file_id: source_file_id1,
                    out_type: {
                        "hls_out": 1
                    }
                })
                .expect(200)
                .end(function (err, res) {
                    console.log("source_file_id1 : " + source_file_id1)

                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body)
                    expect(body.status).to.be.true;
                    library_again1 = body.library[0]
                    setTimeout(done, 58000)
                });
        })
        it("encode vod again, use default vod profile,only MP4 out", function (done) {
            this.timeout(60000)
            API.post("/library/encode")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    source_file_id: source_file_id1,
                    out_type: {
                        "mp4_out": true
                    }
                })
                .expect(200)
                .end(function (err, res) {
                    console.log("source_file_id1 : " + source_file_id1)
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body)
                    expect(body.status).to.be.true;
                    library_again2 = body.library[0]
                    setTimeout(done, 58000)
                });
        })
        it("read vod output : again1,should only have HLSout", function (done) {
            API.get("/library/" + library_again1)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body).to.be.an("object");
                    console.log(body)
                    expect(body.playbackURL).to.have.all.keys("hlsOutput")
                    // 新增
                    expect(body.playbackURL.hlsOutput.hls_version).to.equal(4)
                    expect(body.playbackURL).to.not.have.all.keys("mp4Output")
                    done();
                });
        })
        it("read vod output : again2,should only have mp4out", function (done) {
            API.get("/library/" + library_again2)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body).to.be.an("object");
                    expect(body.playbackURL).to.have.all.keys("mp4Output")
                    done();
                });
        })

        after("delete vod output again1", function (done) {
            API.delete("/library/" + library_again1 + "?deleteSource=false&forceDelete=false")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    done();
                });
        })
        after("delete vod output again2", function (done) {
            API.delete("/library/" + library_again2 + "?deleteSource=false&forceDelete=false")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    done();
                });
        })
        after("delete vod_pro_dis profile", function (done) {
            this.timeout(60000)
            API.delete("/profile/" + vod_pro_dis)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    setTimeout(done, 58000)
                });
        })
    })
    describe("1.16 Monitor VOD source transcode", function () {
        it("124 Query the encoding of vod1", function (done) {
            this.timeout(20000)
            API.post("/library/monitor")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    library_id: [library_id1_1, library_id1_2]
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.body)
                    let body = JSON.parse(res.text);
                    expect(body.results).to.be.an("array");
                    expect(body.status).to.be.equal(true)
                    expect(body.results[0].library_id).to.be.equal(library_id1_1);
                    expect(body.results[0].encode_status).to.be.equal(3)
                    expect(body.results[0].encode_progress).to.be.equal(100)
                    setTimeout(done, 18000)
                });
        });
        it("124 Query the encoding of vod2", function (done) {
            this.timeout(60000)
            API.post("/library/monitor")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    library_id: [library_id2_1, library_id2_2]
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.body)
                    let body = JSON.parse(res.text);
                    expect(body.results).to.be.an("array");
                    expect(body.status).to.be.equal(true)
                    expect(body.results[0].library_id).to.be.equal(library_id2_1);
                    expect(body.results[0].encode_status).to.be.equal(3)
                    expect(body.results[0].encode_progress).to.be.equal(100)
                    setTimeout(done, 58000)
                });
        });

        it("125 Query failed: library_id does not exist", function (done) {
            API.post("/library/monitor")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    library_id: [not_exist_id]
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(404);
                    expect(body.err.message).to.be.equal('Media not found')
                    done();
                });
        });

        it("126 Query failed: library_id is invalid", function (done) {
            API.post("/library/monitor")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    library_id: [NOVALID]
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    expect(body.err.message).to.be.equal('Invalid Id')
                    done();
                });
        });

        it("127 Query failed: library_id is empty", function (done) {
            API.post("/library/monitor")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    library_id: []
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    expect(body.err.message).to.be.equal('Pass at least one library id')
                    done();
                });
        });
    })
    describe("1.19 Read VOD output", function () {
        it("140 Read vod output", function (done) {
            API.get("/library/" + library_id1_1)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body._id).to.be.equal(library_id1_1);
                    expect(body).to.have.all.keys('_id', 'source_file_id', 'playbackURL', 'type', 'profile', "created_time",
                        "owner", "encode_status", "encode_progress", "info", "process", "duration", "status")
                    done();
                });
        })
        it("141 Read failed: the library_id does not exist", function (done) {
            API.get("/library/" + not_exist_id)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(404);
                    expect(body.err.message).to.be.equal('Library doesn\'t exist')
                    done();
                });
        })
        it("142 Read failed: library_id is invalid", function (done) {
            API.get("/library/" + NOVALID)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    expect(body.err.message).to.be.equal('Invalid Id')
                    done();
                });
        })
    })
    describe("1.21 List VOD output", function () {
        let next = "";
        let previous = "";
        let nextN
        let previousN
        it("149 Get the vod output list, no limit parameter", function (done) {
            API.get("/library")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body)
                    expect(body.results).to.be.an("array");
                    expect(body.total_count).to.be.equal(library_total_count);
                    expect(body).to.have.all.keys("results", "previous", "hasPrevious", "next", "hasNext", "total_count", "status")
                    nextN = body.next
                    previousN = body.previous
                    done()
                });
        })
        it("150 Get the vod output list: there is a limit parameter", function (done) {
            API.get("/library?limit=2")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body)
                    expect(body.results).to.be.an("array");
                    expect(body.total_count).to.be.equal(library_total_count);
                    expect(body).to.have.all.keys("results", "previous", "hasPrevious", "next", "hasNext", "total_count", "status")
                    next = body.next;
                    done()
                });
        })
        it("151 get next page vod output", function (done) {
            API.get("/library?limit=2" + "&next=" + next)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body)
                    expect(body.results).to.be.an("array");
                    expect(body.total_count).to.be.equal(library_total_count);
                    expect(body).to.have.all.keys("results", "previous", "hasPrevious", "next", "hasNext", "total_count", "status")
                    previous = body.previous;
                    done()
                })
        })
        it("152 get previous page vod output", function (done) {
            API.get("/library?limit=2" + "&previous=" + previous)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body)
                    expect(body.results).to.be.an("array");
                    expect(body.total_count).to.be.equal(library_total_count);
                    expect(body).to.have.all.keys("results", "previous", "hasPrevious", "next", "hasNext", "total_count", "status")
                    done()
                })
        })
        it("153 get next page vod output fail : No records exist", function (done) {
            this.timeout(60000)
            API.get("/library?next=" + nextN)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body)
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(404);
                    expect(body.err.message).to.be.equal('No records exist')
                    setTimeout(done, 58000)
                });
        })
        it("154 get previous page vod output fail : No records exist", function (done) {
            this.timeout(60000)  //因为下面1.32,nfs比较慢,需要时间同步图片数据,在这里设置延迟
            API.get("/library?previous=" + previousN)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body)
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(404);
                    expect(body.err.message).to.be.equal('No records exist')
                    setTimeout(done, 58000)
                });
        })
        it("154-1 List VOD output by source_file_id", function (done) {
            API.get("/library?source_file_id=" + source_file_id1)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body)
                    expect(body.status).to.be.true;
                    expect(body.total_count).to.be.equal(2)
                    expect(body.results[0]._id).to.be.equal(library_id1_2)
                    expect(body.results[1]._id).to.be.equal(library_id1_1)
                    done()
                });
        })
    })
    describe("1.32 List output VOD images", function () {
        it("cread VOD Profile3 : no iamge", function (done) {
            this.timeout(3000);
            setTimeout(function () {
                API.post("/profile")
                    .set("Authorization", "Bearer " + tenant_admin_token)
                    .send(profile_data.vod_profile3)
                    .expect(200)
                    .end(function (err, res) {
                        if (err) throw err;
                        let body = JSON.parse(res.text);
                        console.log("cread VOD Profile====================3")
                        console.log(body)
                        console.log(profile_data.vod_profile3)
                        expect(body.status).to.be.true;
                        vod_profile_id3 = body.proc_profile_id;
                        done();
                    });
            }, 1000);
        })
        it("1.13 Allocate Source file ID3", function (done) {
            API.get("/source/id")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    source_file_id3 = body.source_file_id;
                    done();
                });
        });
        it("Successful upload 3:MP4", function (done) {
            this.timeout(5000);	// it takes some time to create the directory....
            setTimeout(function () {
                API.post("/library/upload")
                    .set("Authorization", "Bearer " + tenant_admin_token)
                    .field("type", "video")
                    .field("source_file_id", source_file_id3)
                    .attach("file", videopath.mp4, "sample.mp4")
                    .expect(200)
                    .end(function (err, res) {
                        if (err) throw err;
                        let body = JSON.parse(res.text);
                        expect(body.status).to.be.true;
                        done();
                    });
            }, 2000)
        })
        it("Start encoding successfully 3: The source file has not been encoded", function (done) {
            this.timeout(60000)
            API.post("/library/encode")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    source_file_id: source_file_id3,
                    proc_profile_id: [vod_profile_id3]
                })
                .expect(200)
                .end(function (err, res) {
                    console.log("source_file_id1 : " + source_file_id3)
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body)
                    expect(body.status).to.be.true;
                    library_id3_1 = body.library[0];
                    console.log("==========================library_id3_1==========================")
                    console.log(library_id3_1)
                    setTimeout(done, 58000)
                })
        })
        it("Query the encoding of vod3", function (done) {
            API.post("/library/monitor")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    library_id: [library_id3_1]
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.body)
                    let body = JSON.parse(res.text);
                    expect(body.results).to.be.an("array");
                    expect(body.status).to.be.equal(true)
                    expect(body.results[0].library_id).to.be.equal(library_id3_1);
                    expect(body.results[0].encode_status).to.be.equal(3)
                    expect(body.results[0].encode_progress).to.be.equal(100)
                    done()
                });
        })
        it('232 list vod1-output1 thumbnail', function (done) {
            API.post('/image')
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer ' + tenant_admin_token)
                .send({
                    "image_type": "thumbnail",
                    "media_type": "VOD",
                    "media_id": library_id1_1
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw (err);
                    console.log(res.body)
                    expect(res.body.status, "if test fail,the images may be deleted by OMP or nfs issue").to.be.equal(true)
                    expect(res.body.total_count).to.be.above(0)
                    expect(res.body.image).to.be.an('array')
                    done()
                });
        })
        //2018-11-5跳过测试facialDetect图片
        // it('233 list vod1-output1 facial', function (done) {
        //     API.post('/image')
        //         .set('Content-Type', 'application/json')
        //         .set('Authorization', 'Bearer ' + tenant_admin_token)
        //         .send({
        //             "image_type": "facialDetect",
        //             "media_type": "VOD",
        //             "media_id": library_id1_1
        //         })
        //         .expect(200)
        //         .end(function (err, res) {
        //             if (err) throw(err);
        //             console.log(res.body)
        //             expect(res.body.status, "if test fail,the images may be deleted by OMP or nfs issue").to.be.equal(true)
        //             expect(res.body.total_count).to.be.above(0)
        //             expect(res.body.image).to.be.an('array')
        //             done()
        //         });
        // })

        it('232 list vod2-output1 thumbnail', function (done) {
            API.post('/image')
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer ' + tenant_admin_token)
                .send({
                    "image_type": "thumbnail",
                    "media_type": "VOD",
                    "media_id": library_id2_1
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw (err);
                    console.log(res.body)
                    expect(res.body.status, "if test fail,the images may be deleted by OMP or nfs issue").to.be.equal(true)
                    expect(res.body.total_count).to.be.above(0)
                    expect(res.body.image).to.be.an('array')
                    done()
                });
        })
        //2018-11-5跳过测试facialDetect图片
        // it('233 list vod2-output1 facial', function (done) {
        //     API.post('/image')
        //         .set('Content-Type', 'application/json')
        //         .set('Authorization', 'Bearer ' + tenant_admin_token)
        //         .send({
        //             "image_type": "facialDetect",
        //             "media_type": "VOD",
        //             "media_id": library_id2_1
        //         })
        //         .expect(200)
        //         .end(function (err, res) {
        //             if (err) throw(err);
        //             console.log(res.body)
        //             expect(res.body.status, "if test fail,the images may be deleted by OMP or nfs issue").to.be.equal(true)
        //             expect(res.body.total_count).to.be.above(0)
        //             expect(res.body.image).to.be.an('array')
        //             done()
        //         });
        // })

        it('234 list vod thumbnail fail: No records exist', function (done) {
            API.post('/image')
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer ' + tenant_admin_token)
                .send({
                    "image_type": "thumbnail",
                    "media_type": "VOD",
                    "media_id": library_id3_1
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw (err);
                    let body = JSON.parse(res.text);
                    console.log(body)
                    expect(body.status).to.be.equal(false)
                    expect(body.err.code).to.be.equal(404)
                    expect(body.err.message).to.be.equal("No records exist")
                    done()
                });
        })

        it('235 list vod facial: No records exist', function (done) {
            API.post('/image')
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer ' + tenant_admin_token)
                .send({
                    "image_type": "facialDetect",
                    "media_type": "VOD",
                    "media_id": library_id3_1
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw (err);
                    let body = JSON.parse(res.text);
                    console.log(body)
                    expect(body.status).to.be.equal(false)
                    expect(body.err.code).to.be.equal(404)
                    expect(body.err.message).to.be.equal("No records exist")
                    done()
                });
        })

        it('240 list vod thumbnail fail : VOD output not found', function (done) {
            API.post('/image')
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer ' + tenant_admin_token)
                .send({
                    "image_type": "thumbnail",
                    "media_type": "VOD",
                    "media_id": "5ab1f860a5ecc9b69735284c"
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw (err);
                    let body = JSON.parse(res.text);
                    console.log(body)
                    expect(body.status).to.be.equal(false)
                    expect(body.err.code).to.be.equal(404)
                    expect(body.err.message).to.be.equal("VOD output not found")
                    done()
                });
        })
        it('241 list vod facial fail: VOD output not found', function (done) {
            API.post('/image')
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer ' + tenant_admin_token)
                .send({
                    "image_type": "facialDetect",
                    "media_type": "VOD",
                    "media_id": "5ab1f860a5ecc9b69735284c"
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw (err);
                    let body = JSON.parse(res.text);
                    console.log(body)
                    expect(body.status).to.be.equal(false)
                    expect(body.err.code).to.be.equal(404)
                    expect(body.err.message).to.be.equal("VOD output not found")
                    done()
                });
        })

    })
    describe("1.34 Read VOD source", function () {
        it('247  Read VOD source success', function (done) {
            let tenant_db = tenant_account_data.tenant_admin.tenant_name
            API.get('/source/' + source_file_id3)
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer ' + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw (err);
                    console.log(res.body)
                    expect(res.body.status).to.be.equal(true)
                    expect(res.body.vod_source_object).to.have.all.keys("_id", "path", "filename", "filesize", "type", "originalfilename")
                    expect(res.body.vod_source_object.path).to.have.string('/var/panel/library/video/vod/input/' + tenant_db + '/' + source_file_id3)
                    done()
                })
        })
        it('248 Read VOD source fail: Invalid Id', function (done) {
            let tenant_db = tenant_account_data.tenant_admin.tenant_name
            API.get('/source/' + source_file_id3 + 'AA')
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer ' + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw (err);
                    console.log(res.body)
                    expect(res.body.status).to.be.equal(false)
                    expect(res.body.err.code).to.be.equal(400)
                    expect(res.body.err.message).to.be.equal('Invalid Id')
                    done()
                })
        })
        it('249 Read VOD source fail: Source does not exist', function (done) {
            let tenant_db = tenant_account_data.tenant_admin.tenant_name
            API.get('/source/5b1f76a5e54fa82141e4eb19')
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer ' + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw (err);
                    console.log(res.body)
                    expect(res.body.status).to.be.equal(false)
                    expect(res.body.err.code).to.be.equal(404)
                    expect(res.body.err.message).to.be.equal('Source doesn\'t exist')
                    done()
                })
        })
        it("delete profile3", function (done) {
            this.timeout(10000)
            API.delete("/profile/" + vod_profile_id3)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    setTimeout(done, 8000)
                });
        })
        it("delete vod3 source and output", function (done) {
            this.timeout(10000)
            API.delete("/library/" + library_id3_1 + "?deleteSource=true&forceDelete=true")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body)
                    expect(body.status).to.be.true;
                    setTimeout(done, 8000)
                });
        })
    })
    describe("Check output", function () {
        it("check ts output", function (done) {
            this.timeout(60000);
            setTimeout(function () {

                let profile_name = profile_data.vod_profile.profile_name
                let tenant_db = tenant.tenant_db.db

                var foundTsFile = false;
                const tsFolder = `/var/panel/library/video/vod/output/${tenant_db}/${library_id1_1}_${profile_name}/hls0`;
                const fs = require('fs');

                fs.readdir(tsFolder, (err, files) => {
                    files.forEach(file => {
                        if (file.endsWith('.ts')) {
                            foundTsFile = true;
                        }
                    });
                    expect(foundTsFile).to.equal(true);
                    done();
                })
            }, 55000)
        })
    })
    describe("1.20 Delete VOD output", function () {
        it("check data : before delete vod1 output1,check VOD1 source files should be exist", function (done) {
            delete require.cache[require.resolve('../../data/tenant_account.json')];
            const tenant_account_data = require("../../data/tenant_account.json");
            let tenant_db = tenant_account_data.tenant_admin.tenant_name
            let found_vod1_source = false;
            const vod1_source = `/var/panel/library/video/vod/input/${tenant_db}/${source_file_id1}`;
            fs.exists(vod1_source, function (exists) {
                console.log(exists);
                if (exists) {
                    found_vod1_source = true
                }
                expect(found_vod1_source).to.equal(true);
                done()
            });
        })
        it("check data: before delete vod1 output1,check VOD1 output1 files should be exist", function (done) {
            let tenant_db = tenant_account_data.tenant_admin.tenant_name
            let found_vod1_out1 = false;
            const vod1_out1 = `/var/panel/library/video/vod/output/${tenant_db}/${library_id1_1}_${profile_data.vod_profile.profile_name}`;
            fs.exists(vod1_out1, function (exists) {
                console.log(exists);
                if (exists) {
                    found_vod1_out1 = true
                }
                expect(found_vod1_out1).to.equal(true);
                done()
            });
        })
        it("check data: before delete vod1 output1,check VOD1 output2 files should be exist", function (done) {
            let tenant_db = tenant_account_data.tenant_admin.tenant_name
            let found_vod1_out2 = false;
            const vod1_out2 = `/var/panel/library/video/vod/output/${tenant_db}/${library_id1_2}_${profile_data.vod_profile2.profile_name}`;
            fs.exists(vod1_out2, function (exists) {
                console.log(exists);
                if (exists) {
                    found_vod1_out2 = true
                }
                expect(found_vod1_out2).to.equal(true);
                done()
            });
        })
        it("VOD1 Output 1 is deleted successfully, VOD1 source is reserved and not deleted: source has multiple outputs, no other output is ignored, and error msg is returned.", function (done) {
            API.delete("/library/" + library_id1_1 + "?deleteSource=true&forceDelete=false")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body)
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(409);
                    expect(body.err.message).to.be.equal('Source is not deleted as it is referred by other libraries')
                    library_total_count--
                    done()
                });
        });
        it("check data: after delete vod1 output1,check VOD1 source files should be exist", function (done) {
            let tenant_db = tenant_account_data.tenant_admin.tenant_name
            let found_vod1_source = false;
            const vod1_source = `/var/panel/library/video/vod/input/${tenant_db}/${source_file_id1}`;
            fs.exists(vod1_source, function (exists) {
                console.log(exists);
                if (exists) {
                    found_vod1_source = true
                }
                expect(found_vod1_source).to.equal(true);
                done()
            });
        })
        it("check data: after delete vod1 output1,check VOD1 output1 files should be deleted", function (done) {
            let tenant_db = tenant_account_data.tenant_admin.tenant_name
            let found_vod1_out1 = false;
            const vod1_out1 = `/var/panel/library/video/vod/output/${tenant_db}/${library_id1_1}_${profile_data.vod_profile.profile_name}`;
            fs.exists(vod1_out1, function (exists) {
                console.log("应该返回false：")
                console.log(exists);
                if (!exists) {
                    found_vod1_out1 = true
                }
                expect(found_vod1_out1).to.equal(true);
                done()
            });
        })
        it("check data: after delete vod1 output1,check VOD1 output2 files should be exist", function (done) {
            let tenant_db = tenant_account_data.tenant_admin.tenant_name
            let found_vod1_out2 = false;
            const vod1_out2 = `/var/panel/library/video/vod/output/${tenant_db}/${library_id1_2}_${profile_data.vod_profile2.profile_name}`;
            fs.exists(vod1_out2, function (exists) {
                console.log(exists);
                if (exists) {
                    found_vod1_out2 = true
                }
                expect(found_vod1_out2).to.equal(true);
                done()
            });
        })

        it("check data: before delete VOD2 output1,check VOD2 source files should be exist", function (done) {
            let tenant_db = tenant_account_data.tenant_admin.tenant_name
            let found_vod2_source = false;
            const vod2_source = `/var/panel/library/video/vod/input/${tenant_db}/${source_file_id2}/${source_file_id2}.mp4`;
            fs.exists(vod2_source, function (exists) {
                console.log(exists);
                if (exists) {
                    found_vod1_source = true
                }
                expect(found_vod1_source).to.equal(true);
                done()
            });
        })
        it("check data: before delete VOD2 output1,check VOD2 output1 files should be exist", function (done) {
            let tenant_db = tenant_account_data.tenant_admin.tenant_name
            let found_vod2_out1 = false;
            const vod2_out1 = `/var/panel/library/video/vod/output/${tenant_db}/${library_id2_1}_${profile_data.vod_profile.profile_name}`;
            fs.exists(vod2_out1, function (exists) {
                console.log(exists);
                if (exists) {
                    found_vod2_out1 = true
                }
                expect(found_vod2_out1).to.equal(true);
                done()
            });
        })
        it("check data: before delete VOD2 output1,check VOD2 output2 files should be exist", function (done) {
            let tenant_db = tenant_account_data.tenant_admin.tenant_name
            let found_vod2_out2 = false;
            const vod2_out2 = `/var/panel/library/video/vod/output/${tenant_db}/${library_id2_2}_${profile_data.vod_profile2.profile_name}`;
            fs.exists(vod2_out2, function (exists) {
                console.log(exists);
                if (exists) {
                    found_vod2_out2 = true
                }
                expect(found_vod2_out2).to.equal(true);
                done()
            });
        })
        it("VOD2 Output 1 is deleted successfully, VOD2 source is deleted at the same time: source has multiple outputs, ignore other outputs, and will not return error msg", function (done) {
            API.delete("/library/" + library_id2_1 + "?deleteSource=true&forceDelete=true")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body)
                    expect(body.status).to.be.true;
                    library_total_count--
                    done();
                });
        });
        it("check data: after delete VOD2 output1,check VOD2 source files should be deleted", function (done) {
            let tenant_db = tenant_account_data.tenant_admin.tenant_name
            let found_vod2_source = false;
            const vod2_source = `/var/panel/library/video/vod/input/${tenant_db}/${source_file_id2}/${source_file_id2}.mp4`;
            fs.exists(vod2_source, function (exists) {
                console.log("应该返回false：")
                console.log(exists);
                if (!exists) {
                    found_vod1_source = true
                }
                expect(found_vod1_source).to.equal(true);
                done()
            });
        })
        it("check data: after delete VOD2 output1,check VOD2 output1 files should be deleted", function (done) {
            let tenant_db = tenant_account_data.tenant_admin.tenant_name
            let found_vod2_out1 = false;
            const vod2_out1 = `/var/panel/library/video/vod/output/${tenant_db}/${library_id2_1}_${profile_data.vod_profile.profile_name}`;
            fs.exists(vod2_out1, function (exists) {
                console.log(exists);
                if (!exists) {
                    found_vod2_out1 = true
                }
                expect(found_vod2_out1).to.equal(true);
                done()
            });
        })
        it("check data: after delete VOD2 output1,check VOD2 output2 files should be exist", function (done) {
            let tenant_db = tenant_account_data.tenant_admin.tenant_name
            let found_vod2_out2 = false;
            const vod2_out2 = `/var/panel/library/video/vod/output/${tenant_db}/${library_id2_2}_${profile_data.vod_profile2.profile_name}`;
            fs.exists(vod2_out2, function (exists) {
                console.log(exists);
                if (exists) {
                    found_vod2_out2 = true
                }
                expect(found_vod2_out2).to.equal(true);
                done()
            });
        })
        it("VOD output delete fail: Invalid Id", function (done) {
            API.delete("/library/asdf?deleteSource=true&forceDelete=true")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.body)
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400)
                    expect(body.err.message).to.be.equal('Invalid Id')
                    done();
                });
        });
        it("VOD output delete fail: Library doesn't exist", function (done) {
            API.delete("/library/5b14ed1fd032243d5722e1dc?deleteSource=true&forceDelete=true")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(404)
                    expect(body.err.message).to.be.equal('Library doesn\'t exist')
                    done();
                });
        });
        it("Read vod1 output, source id will not reset", function (done) {
            API.get("/library/" + library_id1_2)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body)
                    expect(body).to.be.an("object");
                    expect(body._id).to.be.equal(library_id1_2);
                    expect(body).to.have.all.keys('_id', 'source_file_id', 'playbackURL', 'type', 'profile', "created_time",
                        "owner", "encode_status", "encode_progress", "info", "process", "duration", "status")
                    expect(body.source_file_id).to.be.a('string')
                    done();
                });
        });
        it("Read vod2 output, source id should be reset to empty", function (done) {
            API.get("/library/" + library_id2_2)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body)
                    expect(body).to.be.an("object");
                    expect(body._id).to.be.equal(library_id2_2);
                    expect(body).to.have.all.keys('_id', 'source_file_id', 'playbackURL', 'type', 'profile', "created_time",
                        "owner", "encode_status", "encode_progress", "info", "process", "duration", "status")
                    expect(body.source_file_id).to.be.equal(null)
                    done();
                });
        });
    })
    describe("1.17 Delete VOD source", function () {
        let source_file_idNNN
        before("1.13  Allocate Source file ID", function (done) {
            API.get("/source/id")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    source_file_idNNN = body.source_file_id;
                    done();
                });
        })
        before("upload success: MP4", function (done) {
            this.timeout(5000);	// it takes some time to create the directory....
            setTimeout(function () {
                API.post("/library/upload")
                    .set("Authorization", "Bearer " + tenant_admin_token)
                    .field("type", "video")
                    .field("source_file_id", source_file_idNNN)
                    .attach("file", videopath.mp4, "sample.mp4")
                    .expect(200)
                    .end(function (err, res) {
                        if (err) throw err;
                        let body = JSON.parse(res.text);
                        expect(body.status).to.be.true;
                        done();
                    });
            }, 2000)
        })
        before('Read VOD source success', function (done) {
            let tenant_db = tenant_account_data.tenant_admin.tenant_name
            API.get('/source/' + source_file_idNNN)
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer ' + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw (err);
                    console.log(res.body)
                    expect(res.body.status).to.be.equal(true)
                    expect(res.body.vod_source_object).to.have.all.keys("_id", "path", "filename", "filesize", "type", "originalfilename")
                    expect(res.body.vod_source_object.path).to.have.string('/var/panel/library/video/vod/input/' + tenant_db + '/' + source_file_idNNN)
                    done()
                })
        })
        it("delete source success: source no output", function (done) {
            API.delete("/source/" + source_file_idNNN)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    forceDelete: true
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    done();
                });
        })
        it("Delete failed: vod source_id does not exist", function (done) {
            API.delete("/source/" + not_exist_id)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    forceDelete: true
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(404);
                    expect(body.err.message).to.be.equal('Source file doesn\'t exist')
                    done();
                });
        })
        it("Delete failed: vod source_id is invalid", function (done) {
            API.delete("/source/" + NOVALID)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    forceDelete: true
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    expect(body.err.message).to.be.equal('Invalid Id')
                    done();
                });
        })
        it("Delete failed: source has output, does not ignore output, returns err msg", function (done) {
            API.delete("/source/" + source_file_id1)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    forceDelete: false
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.body)
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(409)
                    expect(body.err.message).to.be.equal('Source cannot be deleted, as it has references')
                    done();
                });
        })
        it("Delete VOD1 successfully: Ignore the output quantity and delete it directly (in this case, there should be 1 output)", function (done) {
            API.delete("/source/" + source_file_id1)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    forceDelete: true
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    vod_source_total_count--
                    done();
                });
        })
        it("check data: after delete VOD1 source,check VOD1 source files should be deleted", function (done) {
            let tenant_db = tenant_account_data.tenant_admin.tenant_name
            let found_vod1_source = false;
            const vod1_source = `/var/panel/library/video/vod/input/${tenant_db}/${source_file_id1}`;
            fs.exists(vod1_source, function (exists) {
                console.log(exists);
                if (!exists) {
                    found_vod1_source = true
                }
                expect(found_vod1_source).to.equal(true);
                done()
            });
        })
        after("Read the remaining output of VOD1, the source id should be reset to empty", function (done) {
            API.get("/library/" + library_id1_2)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body).to.be.an("object");
                    expect(body._id).to.be.equal(library_id1_2);
                    expect(body).to.have.all.keys('_id', 'source_file_id', 'playbackURL', 'type', 'profile', "created_time",
                        "owner", "encode_status", "encode_progress", "info", "process", "duration", "status")
                    expect(body.source_file_id).to.be.equal(null)
                    done();
                });
        })
        after('Read VOD source:should be deleted', function (done) {
            let tenant_db = tenant_account_data.tenant_admin.tenant_name
            API.get('/source/' + source_file_idNNN)
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer ' + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw (err);
                    console.log(res.body)
                    expect(res.body.status).to.be.equal(false)
                    expect(res.body.err.message).to.be.equal("Source doesn't exist")
                    done()
                })
        })
    })
    describe("1.17 and 1.20 Delete VOD source & output:use default vod profile,check data", function () {
        it("1.12 get default vod profile list", function (done) {
            API.get("/profile?is_default=true&profile_type=VOD")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.results).to.be.an("array");
                    expect(body.total_count).to.be.equal(1)
                    default_vod_pro = body.results[0]._id
                    done();
                });
        });
        it('Read default Proc Profile: get profile name', function (done) {
            API.get('/profile/' + default_vod_pro)
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer ' + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw (err);
                    console.log(res.body)
                    expect(res.body.status).to.be.equal(true)
                    expect(res.body.profile_type).to.be.equal('VOD')
                    default_vod_pro_name = res.body.profile_name
                    done()
                });
        })
        it("1.13 Allocate Source file ID", function (done) {
            API.get("/source/id")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    source_file_id_d = body.source_file_id;
                    done();
                });
        });
        it("Successful upload 1:MP4", function (done) {
            this.timeout(5000);	// it takes some time to create the directory....
            setTimeout(function () {
                API.post("/library/upload")
                    .set("Authorization", "Bearer " + tenant_admin_token)
                    .field("type", "video")
                    .field("source_file_id", source_file_id_d)
                    .attach("file", videopath.mp4, "sample.mp4")
                    .expect(200)
                    .end(function (err, res) {
                        if (err) throw err;
                        console.log(res.body)
                        let body = JSON.parse(res.text);
                        expect(body.status).to.be.true;
                        done();
                    });
            }, 2000)
        });
        it("1.34 get vod source detail", function (done) {
            API.get("/source/" + source_file_id_d)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.body)
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.equal(true)
                    expect(body.vod_source_object._id).to.be.equal(source_file_id_d)
                    expect(body.vod_source_object.path).to.be.equal("/var/panel/library/video/vod/input/" + tenant_account_data.tenant_admin.username + "/" + source_file_id_d)
                    expect(body.vod_source_object.filename).to.be.equal(source_file_id_d + ".mp4")
                    source_file_name = body.vod_source_object.filename
                    done()
                })
        })
        it("Successful use of default encoding: source files that have not been encoded", function (done) {
            this.timeout(60000)
            API.post("/library/encode")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    source_file_id: source_file_id_d,
                    out_type: {
                        "hls_out": 1,
                        "mp4_out": true
                    }
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body)
                    expect(body.status).to.be.true;
                    library_id_d = body.library[0];
                    console.log("==========================library_id_d==========================++")
                    console.log(library_id_d)
                    setTimeout(done, 58000)
                });
        });
        it("Query the encoding of vod - default encoding", function (done) {
            this.timeout(60000)
            API.post("/library/monitor")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    library_id: [library_id_d]
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.body)
                    let body = JSON.parse(res.text);
                    expect(body.results).to.be.an("array");
                    expect(body.status).to.be.equal(true)
                    expect(body.results[0].library_id).to.be.equal(library_id_d);
                    expect(body.results[0].encode_status).to.be.equal(3)
                    expect(body.results[0].encode_progress).to.be.equal(100)
                    setTimeout(done, 58000)
                });
        });
        it("Read vod output - default encoding", function (done) {//增加URL地址检查
            API.get("/library/" + library_id_d)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body).to.be.an("object");
                    expect(body._id).to.be.equal(library_id_d);
                    expect(body).to.have.all.keys('_id', 'source_file_id', 'playbackURL', 'type', 'profile', "created_time",
                        "owner", "encode_status", "encode_progress", "info", "process", "duration", "status")

                    expect(body.profile.profile_id).to.be.equal(default_vod_pro)
                    expect(body.playbackURL.hlsOutput).to.have.all.keys("hls_version", "hlsURL", "hlsURL_cdn")
                    expect(body.playbackURL.mp4Output).to.have.all.keys("mp4URL", "mp4URL_cdn")
                    expect(body.playbackURL.hlsOutput.hlsURL).to.have.string("/origin/vod/" + tenant_account_data.tenant_admin.username + '/' + library_id_d + "_" + body.profile.profile_name + "/hls0/index.m3u8")
                    expect(body.playbackURL.hlsOutput.hlsURL_cdn).to.have.string("/vod/" + library_id_d + "_" + body.profile.profile_name + "/default/hls/0/index.m3u8")

                    expect(body.playbackURL.mp4Output.mp4URL).to.have.string("/origin/vod/" + tenant_account_data.tenant_admin.username + '/' + library_id_d + "_" + body.profile.profile_name + "/mp40/output.mp4")
                    expect(body.playbackURL.mp4Output.mp4URL_cdn).to.have.string("/vod/" + library_id_d + "_" + body.profile.profile_name + "/default/mp4/0/output.mp4")

                    // expect(body.file).to.be.equal.string(source_file_name)
                    done();
                });
        })
        /*
        //目前的默认VOD profile关闭了image,所以这里暂不测试
        it('二次编码前:list thumbnail--默认编码', function (done) {
            API.post('/image')
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer '+tenant_admin_token)
                .send({
                    "image_type":"thumbnail",
                    "media_type":"VOD",
                    "media_id":library_id1_1          
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw(err);
                    console.log(res.body)
                    expect(res.body.status,"if test fail,the images may be deleted by OMP or nfs issue").to.be.equal(true)
                    expect(res.body.total_count).to.be.above(0)
                    expect(res.body.image).to.be.an('array')
                    done()
                });
        })
        it('二次编码前:list facial--默认编码', function (done) { 
            API.post('/image')
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer '+tenant_admin_token)
                .send({
                    "image_type":"facialDetect",
                    "media_type":"VOD",
                    "media_id":library_id1_1
                  })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw(err);
                    console.log(res.body)
                    expect(res.body.status,"if test fail,the images may be deleted by OMP or nfs issue").to.be.equal(true)
                    expect(res.body.total_count).to.be.above(0)
                    expect(res.body.image).to.be.an('array')
                    done()
                });
        })
        */
        it("Complete transcoding with manually created code: once transcoded with default encoding", function (done) {
            this.timeout(180000)
            API.post("/library/encode")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    source_file_id: source_file_id_d,
                    proc_profile_id: [vod_profile_id1, vod_profile_id2],
                    out_type: {
                        "hls_out": 1,
                        "mp4_out": true
                    }
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body)
                    expect(body.status).to.be.true;
                    library_idT_1 = body.library[0];
                    library_idT_2 = body.library[1];
                    setTimeout(done, 178000)
                });
        })
        it("Query the encoding of vod - manual coding", function (done) {
            API.post("/library/monitor")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    library_id: [library_idT_1, library_idT_2]
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log(res.body)
                    let body = JSON.parse(res.text);
                    expect(body.results).to.be.an("array");
                    expect(body.status).to.be.equal(true)
                    expect(body.results[0].library_id).to.be.equal(library_idT_1);
                    expect(body.results[0].encode_status).to.be.equal(3);
                    expect(body.results[0].encode_progress).to.be.equal(100);
                    expect(body.results[1].library_id).to.be.equal(library_idT_2);
                    expect(body.results[1].encode_status).to.be.equal(3)
                    expect(body.results[1].encode_progress).to.be.equal(100)
                    done()
                });
        })
        it("Read vod output - manual coding", function (done) {//增加URL地址检查
            API.get("/library/" + library_idT_1)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body).to.be.an("object");
                    expect(body._id).to.be.equal(library_idT_1);
                    expect(body).to.have.all.keys('_id', 'source_file_id', 'playbackURL', 'type', 'profile', "created_time",
                        "owner", "encode_status", "encode_progress", "info", "process", "duration", "status")
                    //expect(body.profile.profile_id).to.be.equal(vod_profile_id1)
                    expect(body.profile.profile_name).to.be.equal(profile_data.vod_profile.profile_name)
                    expect(body.playbackURL.hlsOutput).to.have.all.keys("hls_version", "hlsURL", "hlsURL_cdn")
                    expect(body.playbackURL.mp4Output).to.have.all.keys("mp4URL", "mp4URL_cdn")
                    expect(body.playbackURL.hlsOutput.hlsURL).to.have.string("/origin/vod/" + tenant_account_data.tenant_admin.username + '/' + library_idT_1 + "_" + body.profile.profile_name + "/hls0/index.m3u8")
                    expect(body.playbackURL.hlsOutput.hlsURL_cdn).to.have.string("/vod/" + library_idT_1 + "_" + body.profile.profile_name + "/default/hls/0/index.m3u8")

                    expect(body.playbackURL.mp4Output.mp4URL).to.have.string("/origin/vod/" + tenant_account_data.tenant_admin.username + '/' + library_idT_1 + "_" + body.profile.profile_name + "/mp40/output.mp4")
                    expect(body.playbackURL.mp4Output.mp4URL_cdn).to.have.string("/vod/" + library_idT_1 + "_" + body.profile.profile_name + "/default/mp4/0/output.mp4")

                    // expect(body.file).to.be.equal.string(library_id_d+".mp4")
                    // vod_file=body.file
                    done();
                });
        })
        /*
        it('list thumbnail--默认编码', function (done) {
            API.post('/image')
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer '+tenant_admin_token)
                .send({
                    "image_type":"thumbnail",
                    "media_type":"VOD",
                    "media_id":library_id1_1          
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw(err);
                    console.log(res.body)
                    expect(res.body.status,"if test fail,the images may be deleted by OMP or nfs issue").to.be.equal(true)
                    expect(res.body.total_count).to.be.above(0)
                    expect(res.body.image).to.be.an('array')
                    done()
                });
        })
        it('list facial--默认编码', function (done) { 
            API.post('/image')
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer '+tenant_admin_token)
                .send({
                    "image_type":"facialDetect",
                    "media_type":"VOD",
                    "media_id":library_id1_1
                  })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw(err);
                    console.log(res.body)
                    expect(res.body.status,"if test fail,the images may be deleted by OMP or nfs issue").to.be.equal(true)
                    expect(res.body.total_count).to.be.above(0)
                    expect(res.body.image).to.be.an('array')
                    done()
                });
        })
        */
        it("Before delete manual encoding out1, check default ts output should be exist--default encoding", function (done) {
            this.timeout(60000);
            setTimeout(function () {
                let tenant_db = tenant_account_data.tenant_admin.tenant_name

                var foundTsFile = false;
                const tsFolder = `/var/panel/library/video/vod/output/${tenant_db}/${library_id_d}_${default_vod_pro_name}/hls0`;
                const fs = require('fs');

                fs.readdir(tsFolder, (err, files) => {
                    files.forEach(file => {
                        if (file.endsWith('.ts')) {
                            foundTsFile = true;
                        }
                    });
                    expect(foundTsFile).to.equal(true);
                    done();
                })
            }, 55000)
        })
        it("Check data: before delete manual encoding out1, VOD source should be exist", function (done) {
            let tenant_db = tenant_account_data.tenant_admin.tenant_name
            let found_vod1_source = false;
            const vod1_source = `/var/panel/library/video/vod/input/${tenant_db}/${source_file_id_d}/${source_file_id_d}.mp4`;
            fs.exists(vod1_source, function (exists) {
                console.log(exists);
                if (exists) {
                    found_vod1_source = true
                }
                expect(found_vod1_source).to.equal(true);
                done()
            });
        })
        it("Check data: before delete Manual encoding out1, default encoding output should be exist", function (done) {
            let tenant_db = tenant_account_data.tenant_admin.tenant_name
            let found_vod1_out1 = false;
            const vod1_out1 = `/var/panel/library/video/vod/output/${tenant_db}/${library_id_d}_${default_vod_pro_name}`;
            console.log("Check data : before delete Manual encoding out1, default encoding output should be exist===============")
            console.log(vod1_out1);
            fs.exists(vod1_out1, function (exists) {
                console.log(exists);
                if (exists) {
                    found_vod1_out1 = true
                }
                expect(found_vod1_out1).to.equal(true);
                done()
            });
        })

        it("Check ts output1 should be exist--manual coding", function (done) {
            this.timeout(60000);
            setTimeout(function () {
                let tenant_db = tenant.tenant_db.db

                var foundTsFile = false;
                const tsFolder = `/var/panel/library/video/vod/output/${tenant_db}/${library_idT_1}_${profile_data.vod_profile.profile_name}/hls0`;
                const fs = require('fs');

                fs.readdir(tsFolder, (err, files) => {
                    files.forEach(file => {
                        if (file.endsWith('.ts')) {
                            foundTsFile = true;
                        }
                    });
                    expect(foundTsFile).to.equal(true);
                    done();
                })
            }, 55000)
        })
        it('List thumbnail--manual coding', function (done) {
            API.post('/image')
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer ' + tenant_admin_token)
                .send({
                    "image_type": "thumbnail",
                    "media_type": "VOD",
                    "media_id": library_idT_1
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw (err);
                    console.log(res.body)
                    expect(res.body.status, "if test fail,the images may be deleted by OMP or nfs issue").to.be.equal(true)
                    expect(res.body.total_count).to.be.above(0)
                    expect(res.body.image).to.be.an('array')
                    done()
                });
        })
        //2018-11-5跳过测试facialDetect图片
        // it('list facial--manual coding', function (done) {
        //     API.post('/image')
        //         .set('Content-Type', 'application/json')
        //         .set('Authorization', 'Bearer ' + tenant_admin_token)
        //         .send({
        //             "image_type": "facialDetect",
        //             "media_type": "VOD",
        //             "media_id": library_idT_1
        //         })
        //         .expect(200)
        //         .end(function (err, res) {
        //             if (err) throw(err);
        //             console.log(res.body)
        //             expect(res.body.status, "if test fail,the images may be deleted by OMP or nfs issue").to.be.equal(true)
        //             expect(res.body.total_count).to.be.above(0)
        //             expect(res.body.image).to.be.an('array')
        //             done()
        //         });
        // })
        it("Check data: before delete manual encoding out1, manual encoding out1 should be exist", function (done) {
            let tenant_db = tenant_account_data.tenant_admin.tenant_name
            let found_vod1_out1 = false;
            const vod1_out1 = `/var/panel/library/video/vod/output/${tenant_db}/${library_idT_1}_${profile_data.vod_profile.profile_name}`;
            fs.exists(vod1_out1, function (exists) {
                console.log(exists);
                if (exists) {
                    found_vod1_out1 = true
                }
                expect(found_vod1_out1).to.equal(true);
                done()
            });
        })
        it("Check data : before delete manual encoding out1, manual encoding out2 should be exist", function (done) {
            let tenant_db = tenant_account_data.tenant_admin.tenant_name
            let found_vod1_out2 = false;
            const vod1_out2 = `/var/panel/library/video/vod/output/${tenant_db}/${library_idT_2}_${profile_data.vod_profile2.profile_name}`;
            fs.exists(vod1_out2, function (exists) {
                console.log(exists);
                if (exists) {
                    found_vod1_out2 = true
                }
                expect(found_vod1_out2).to.equal(true);
                done()
            });
        })

        it("VOD Output 1 (manual coding) is deleted successfully, VOD source is reserved: source has multiple outputs, no other output is ignored, error msg is returned", function (done) {
            API.delete("/library/" + library_idT_1 + "?deleteSource=true&forceDelete=false")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    console.log("Output 1 (manual coding) is deleted successfully, VOD source is reserved: source has multiple outputs, no other output is ignored, error msg is returned==============")
                    console.log(res.body)
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(409);
                    expect(body.err.message).to.be.equal('Source is not deleted as it is referred by other libraries')
                    done();
                });
        });
        /*
        it('list thumbnail--默认编码', function (done) {
            API.post('/image')
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer '+tenant_admin_token)
                .send({
                    "image_type":"thumbnail",
                    "media_type":"VOD",
                    "media_id":library_id1_1          
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw(err);
                    console.log(res.body)
                    expect(res.body.status,"if test fail,the images may be deleted by OMP or nfs issue").to.be.equal(true)
                    expect(res.body.total_count).to.be.above(0)
                    expect(res.body.image).to.be.an('array')
                    done()
                });
        })
        it('list facial--默认编码', function (done) { 
            API.post('/image')
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer '+tenant_admin_token)
                .send({
                    "image_type":"facialDetect",
                    "media_type":"VOD",
                    "media_id":library_id1_1
                  })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw(err);
                    console.log(res.body)
                    expect(res.body.status,"if test fail,the images may be deleted by OMP or nfs issue").to.be.equal(true)
                    expect(res.body.total_count).to.be.above(0)
                    expect(res.body.image).to.be.an('array')
                    done()
                });
        })
        */
        it("After delete manual encoding out1: check ts output should be exist--default encoding", function (done) {
            this.timeout(60000);
            setTimeout(function () {
                let tenant_db = tenant.tenant_db.db

                var foundTsFile = false;
                const tsFolder = `/var/panel/library/video/vod/output/${tenant_db}/${library_id_d}_${default_vod_pro_name}/hls0`;
                const fs = require('fs');

                fs.readdir(tsFolder, (err, files) => {
                    files.forEach(file => {
                        if (file.endsWith('.ts')) {
                            foundTsFile = true;
                        }
                    });
                    expect(foundTsFile).to.equal(true);
                    done();
                })
            }, 55000)
        })
        it("After delete manual encoding out1: manual encoding out1 ts should be deleted--manual encoding", function (done) {
            let tenant_db = tenant.tenant_db.db
            var foundTsFile = false;
            const tsFolder = `/var/panel/library/video/vod/output/${tenant_db}/${library_idT_1}_${profile_data.vod_profile.profile_name}/hls0`;
            const fs = require('fs');
            fs.exists(tsFolder, function (exists) {
                console.log(exists);
                if (!exists) {
                    foundTsFile = true
                }
                expect(foundTsFile).to.equal(true);
                done()
            });
        })
        it("Check data: after delete manual encoding out1, VOD source should be exist", function (done) {
            let tenant_db = tenant_account_data.tenant_admin.tenant_name
            let found_vod1_source = false;
            const vod1_source = `/var/panel/library/video/vod/input/${tenant_db}/${source_file_id_d}/${source_file_id_d}.mp4`;
            fs.exists(vod1_source, function (exists) {
                console.log(exists);
                if (exists) {
                    found_vod1_source = true
                }
                expect(found_vod1_source).to.equal(true);
                done()
            });
        })
        it("Check data: after delete manual encoding out1, default encoding out should be exist", function (done) {
            let tenant_db = tenant_account_data.tenant_admin.tenant_name
            let found_vod1_out1 = false;
            const vod1_out1 = `/var/panel/library/video/vod/output/${tenant_db}/${library_id_d}_${default_vod_pro_name}`;
            fs.exists(vod1_out1, function (exists) {
                console.log(exists);
                if (exists) {
                    found_vod1_out1 = true
                }
                expect(found_vod1_out1).to.equal(true);
                done()
            });
        })
        it("Check data: after delete Manual encoding out1, manual encoding out1 should be deleted", function (done) {
            let tenant_db = tenant_account_data.tenant_admin.tenant_name
            let found_vod1_out1 = false;
            const vod1_out1 = `/var/panel/library/video/vod/output/${tenant_db}/${library_idT_1}_${profile_data.vod_profile.profile_name}`;
            fs.exists(vod1_out1, function (exists) {
                console.log(exists);
                if (!exists) {
                    found_vod1_out1 = true
                }
                expect(found_vod1_out1).to.equal(true);
                done()
            });
        })
        it("Check data: after delete manual encoding out1, manual encoding out2 should be exist", function (done) {
            let tenant_db = tenant_account_data.tenant_admin.tenant_name
            let found_vod1_out1 = false;
            const vod1_out1 = `/var/panel/library/video/vod/output/${tenant_db}/${library_idT_2}_${profile_data.vod_profile2.profile_name}`;
            fs.exists(vod1_out1, function (exists) {
                console.log(exists);
                if (exists) {
                    found_vod1_out1 = true
                }
                expect(found_vod1_out1).to.equal(true);
                done()
            });
        })
        it('After delete manual encoding out1: list thumbnail--manual encoding', function (done) {
            API.post('/image')
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer ' + tenant_admin_token)
                .send({
                    "image_type": "thumbnail",
                    "media_type": "VOD",
                    "media_id": library_idT_1
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw (err);
                    console.log(res.body)
                    expect(res.body.status).to.be.equal(false)
                    expect(res.body.err.code).to.be.equal(404)
                    expect(res.body.err.message).to.be.equal('VOD output not found')
                    done()
                });
        })
        //2018-11-5跳过测试facialDetect图片
        // it('After delete manual coding out1: list facial--manual coding', function (done) {
        //     API.post('/image')
        //         .set('Content-Type', 'application/json')
        //         .set('Authorization', 'Bearer ' + tenant_admin_token)
        //         .send({
        //             "image_type": "facialDetect",
        //             "media_type": "VOD",
        //             "media_id": library_idT_1
        //         })
        //         .expect(200)
        //         .end(function (err, res) {
        //             if (err) throw(err);
        //             console.log(res.body)
        //             expect(res.body.status).to.be.equal(false)
        //             expect(res.body.err.code).to.be.equal(404)
        //             expect(res.body.err.message).to.be.equal('VOD output not found')
        //             done()
        //         });
        // })

        it("VOD Output 2 (manual coding) is deleted successfully, VOD source is deleted at the same time: source has multiple outputs, ignore other outputs, will not return error msg", function (done) {
            API.delete("/library/" + library_idT_2 + "?deleteSource=true&forceDelete=true")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    done();
                });
        });
        it("Check data: after delete manual encoding out2, vod source should be deleted", function (done) {
            let tenant_db = tenant_account_data.tenant_admin.tenant_name
            let found_vod1_source = false;
            const vod1_source = `/var/panel/library/video/vod/input/${tenant_db}/${source_file_id_d}/${source_file_id_d}.mp4`;
            fs.exists(vod1_source, function (exists) {
                console.log(exists);
                if (!exists) {
                    found_vod1_source = true
                }
                expect(found_vod1_source).to.equal(true);
                done()
            });
        })
        it("Check data: after delete manual encoding out2, default encoding out should be exist", function (done) {
            let tenant_db = tenant_account_data.tenant_admin.tenant_name
            let found_vod1_out1 = false;
            const vod1_out1 = `/var/panel/library/video/vod/output/${tenant_db}/${library_id_d}_${default_vod_pro_name}`;
            fs.exists(vod1_out1, function (exists) {
                console.log(exists);
                if (exists) {
                    found_vod1_out1 = true
                }
                expect(found_vod1_out1).to.equal(true);
                done()
            });
        })
        it("Check data: after delete manual encoding out2, manual encoding out2 should be deleted", function (done) {
            let tenant_db = tenant_account_data.tenant_admin.tenant_name
            let found_vod1_out1 = false;
            const vod1_out1 = `/var/panel/library/video/vod/output/${tenant_db}/${library_idT_2}_${profile_data.vod_profile2.profile_name}`;
            fs.exists(vod1_out1, function (exists) {
                console.log(exists);
                if (!exists) {
                    found_vod1_out1 = true
                }
                expect(found_vod1_out1).to.equal(true);
                done()
            });
        })
        it("Get the list of vod output, the first one should be the default encoding output", function (done) {
            API.get("/library")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    //console.log(body)
                    expect(body.results).to.be.an("array");
                    expect(body).to.have.all.keys("results", "previous", "hasPrevious", "next", "hasNext", "total_count", "status")
                    expect(body.results[0]._id).to.be.equal(library_id_d)
                    done()
                });
        })
        it("Delete default encoding output", function (done) {
            API.delete("/library/" + library_id_d)
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

    //==========新增=========
    describe("上传source", function () {
        it("Allocate Source file ID2", function (done) {
            API.get("/source/id")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    source_file_id_new = body.source_file_id;
                    done();
                });
        });

        it("upload success 2:MP4", function (done) {
            this.timeout(5000);	// it takes some time to create the directory....
            setTimeout(function () {
                API.post("/library/upload")
                    .set("Authorization", "Bearer " + tenant_admin_token)
                    .field("type", "video")
                    .field("source_file_id", source_file_id_new)
                    .attach("file", videopath.mp4, "sample.mp4")
                    .expect(200)
                    .end(function (err, res) {
                        if (err) throw err;
                        let body = JSON.parse(res.text);
                        console.log(body)
                        expect(body.status).to.be.true;
                        done();
                    });
            }, 2000)
        });
    })

    describe("1.15 New Start vod source transcode", function () {
        it("112-1 Use default profile transcoding, default output type", function (done) {
            this.timeout(60000)
            API.post("/library/encode")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "source_file_id": source_file_id_new
                })
                .expect(200)
                .end(function (err, res) {
                    console.log("source_file_id_new: " + source_file_id_new)
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body)
                    expect(body.status).to.be.true;
                    library_id_default = body.library[0]
                    setTimeout(done, 58000)
                });
        });

        it("114 Transcode using the specified H265 proc_profile, default output type", function (done) {
            //使用指定H265 proc_profile进行转码，默认输出类型
            this.timeout(60000)
            API.post("/library/encode")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "source_file_id": source_file_id_new,
                    "proc_profile_id": [h265_vod_profile_id]
                })
                .expect(200)
                .end(function (err, res) {
                    console.log("source_file_id_new : " + source_file_id_new)
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body)
                    expect(body.status).to.be.true;
                    library_id_h265_1 = body.library[0]
                    setTimeout(done, 58000)
                });
        });

        it("test-114:Check the hls version", function (done) {
            API.get("/library/" + library_id_h265_1)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body)
                    expect(body).to.be.an("object");
                    expect(body.playbackURL).to.have.all.keys("hlsOutput", "mp4Output", "dashOutput")
                    expect(body.playbackURL.hlsOutput.hls_version).to.equal(6)
                    done();
                });
        })

        it("test-112-1:Check output", function (done) {
            this.timeout(8000)
            API.get("/library/" + library_id_default)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body)
                    expect(body).to.be.an("object");
                    expect(body.playbackURL).to.have.all.keys("hlsOutput", "mp4Output", "dashOutput")
                    expect(body.playbackURL.hlsOutput.hls_version).to.equal(4)
                    expect(body.profile.is_default).to.be.true
                    expect(body.playbackURL.hlsOutput.hlsURL).to.have.string('/origin/vod/' + tenant_account_data.tenant_admin.username + '/' + library_id_default + "_demovod480" + '/hls0/index.m3u8')
                    expect(body.playbackURL.mp4Output.mp4URL).to.have.string('/origin/vod/' + tenant_account_data.tenant_admin.username + '/' + library_id_default + "_demovod480" + '/mp40/output.mp4')
                    expect(body.playbackURL.dashOutput.dashURL).to.have.string('/origin/vod/' + tenant_account_data.tenant_admin.username + '/' + library_id_default + "_demovod480" + '/dash0/index.mpd')
                    setTimeout(done, 6000)
                });
        })

        it("115 Specify H265 proc_profile for transcoding, specify output type: control by hls_out=1", function (done) {
            this.timeout(60000)
            API.post("/library/encode")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "source_file_id": source_file_id_new,
                    "proc_profile_id": [h265_vod_profile_id],
                    "out_type": {
                        "hls_out": 1,
                        "mp4_out": true
                    }
                })
                .expect(200)
                .end(function (err, res) {
                    console.log("source_file_id_new : " + source_file_id_new)
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body)
                    expect(body.status).to.be.true;
                    library_id_h265_2 = body.library[0]
                    setTimeout(done, 58000)
                });
        });

        it("test-115:检查hls版本", function (done) {
            API.get("/library/" + library_id_h265_2)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body)
                    expect(body).to.be.an("object");
                    expect(body.playbackURL).to.have.all.keys("hlsOutput", "mp4Output")
                    expect(body.playbackURL.hlsOutput.hls_version).to.equal(6)
                    done();
                });
        })

        it("115_1 Specify H265 proc_profile for transcoding, specify the output type: control through the hls_out array", function (done) {
            this.timeout(60000)
            API.post("/library/encode")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "source_file_id": source_file_id_new,
                    "proc_profile_id": [h265_vod_profile_id],
                    "out_type": {
                        "hls_out": [
                            {
                                "legacy_hls_support": false
                            }
                        ],
                        "mp4_out": true
                    }
                })
                .expect(200)
                .end(function (err, res) {
                    console.log("source_file_id_new : " + source_file_id_new)
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body)
                    expect(body.status).to.be.true;
                    library_id_h265_3 = body.library[0]
                    setTimeout(done, 58000)
                });
        });

        it("test-115_1:检查hls版本", function (done) {
            API.get("/library/" + library_id_h265_3)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body)
                    expect(body).to.be.an("object");
                    expect(body.playbackURL).to.have.all.keys("hlsOutput", "mp4Output")
                    expect(body.playbackURL.hlsOutput[0].hls_version).to.equal(6)
                    done();
                });
        })

        it("115_2 Transcode using the specified H265 proc_profile, specifying the output type: controlled by the hls_out array if legacy_hls_support=ture", function (done) {
            API.post("/library/encode")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "source_file_id": source_file_id_new,
                    "proc_profile_id": [h265_vod_profile_id],
                    "out_type": {
                        "hls_out": [
                            {
                                "legacy_hls_support": true
                            }
                        ],
                        "mp4_out": true
                    }
                })
                .expect(200)
                .end(function (err, res) {
                    console.log("source_file_id_new : " + source_file_id_new)
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body)
                    expect(body.err.code).to.equal(400);
                    expect(body.err.message).to.equal("legacy_hls_support not supported with h265");
                    done()
                });
        });

        it("116_1 Output HLS and MP4 types: controlled by hls_out array", function (done) {
            this.timeout(60000)
            API.post("/library/encode")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "source_file_id": source_file_id_new,
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
                })
                .expect(200)
                .end(function (err, res) {
                    console.log("source_file_id_new : " + source_file_id_new)
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body)
                    expect(body.status).to.be.true;
                    library_id_h265_4 = body.library[0]
                    setTimeout(done, 58000)
                });
        });

        it("test-116_1:检查hls版本", function (done) {
            API.get("/library/" + library_id_h265_4)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body)
                    expect(body).to.be.an("object");
                    expect(body.playbackURL).to.have.all.keys("hlsOutput", "mp4Output")
                    expect(body.playbackURL.hlsOutput[0].hls_version).to.equal(4)
                    expect(body.playbackURL.hlsOutput[1].hls_version).to.equal(3)
                    done();
                });
        })
    })

    //清除数据
    describe("Clear DB data", function () {

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

        it("Delete DB", function (done) {
            this.timeout(60000);
            API.delete("/clearDB/autotest")
                .set("Authorization", "Bearer " + orchestrator_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    setTimeout(done, 55000);
                });
        });
    });
    //重新创建DB
    describe("Recreate DB", function () {

        it("Create Tenant db", function (done) {
            this.timeout(10000);
            API.post("/tenant")
                .set("Authorization", "Bearer " + orchestrator_admin_token)
                .send(tenant_data.tenant_db)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body)
                    expect(body.status).to.be.true;
                    setTimeout(done, 8000);
                });
        });

        it("Create Tenant admin", function (done) {
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
    });

    //新功能Transfer VOD list
    describe("Transfer VOD list Test", function () {

        it("154-3 Transfer VOD list, 转移的目录为空", function (done) {
            let is_unll = false;
            this.timeout(10000);
            API.post("/library/transfer")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "url": Transfer_url + transfer_tenant_name
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    if (body.succ.source_file_id_list.length == 0) {
                        is_unll = true
                    }
                    console.log(is_unll)
                    console.log(body.succ.source_file_id_list)
                    console.log(body)
                    console.log("转移的url：");
                    console.log(Transfer_url + transfer_tenant_name);
                    expect(body.status).to.be.true;
                    expect(body).to.have.all.keys("status", "succ")
                    expect(body.succ).to.have.all.keys("source_file_id_list")
                    expect(is_unll).to.be.true
                    setTimeout(done, 8000);
                });
        });
    });

    describe("Transfer VOD list：测试数据准备", function () {

        it("A1 Get Source file ID", function (done) {
            this.timeout(8000)
            API.get("/source/id")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    source_file_id = body.source_file_id;
                    setTimeout(done, 6000)
                });
        });

        it("A2 Upload source file", function (done) {
            this.timeout(10000);
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
                    setTimeout(done, 8000)
                });
        });

        it("A3 Default profile, output only HLS type", function (done) {
            this.timeout(50000);
            API.post("/library/encode")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "source_file_id": source_file_id,
                    "out_type": {
                        "hls_out": 1,
                        "mp4_out": true
                    }
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    setTimeout(done, 46000);
                });
        });

        // it("A4 获取profile name", function (done) {
        //     API.get("/library/" + hls_library_id)
        //         .set("Authorization", "Bearer " + tenant_admin_token)
        //         .expect(200)
        //         .end(function (err, res) {
        //             if (err) throw err;
        //             let body = JSON.parse(res.text);
        //             console.log(body);
        //             transfer_profile_name = body.profile.profile_name;
        //             expect(body.status).to.be.true;
        //             done()
        //         });
        // });
    });

    describe("Transfer VOD list", function () {

        it("154-2 Transfer VOD list(mp4、ts)", function (done) {
            this.timeout(20000);
            API.post("/library/transfer")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "url": Transfer_url + transfer_tenant_name
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    console.log("转移的url：");
                    console.log(Transfer_url + transfer_tenant_name);
                    transfer_source_id = body.succ.source_file_id_list[0]
                    expect(body.status).to.be.true;
                    expect(body).to.have.all.keys("status", "succ")
                    expect(body.succ).to.have.all.keys("source_file_id_list")
                    setTimeout(done, 18000);
                });
        });

        it("检查154-2 VOD List是否转移成功", function (done) {
            API.get("/source/" + transfer_source_id)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    expect(body.vod_source_object._id).to.be.equal(transfer_source_id)
                    expect(body.vod_source_object.path).to.be.equal("/var/panel/library/video/vod/input/" + transfer_tenant_name + "/" + transfer_source_id)
                    expect(body.vod_source_object.filename).to.be.equal(transfer_source_id + ".ts")
                    expect(body.vod_source_object.type).to.be.equal("video")
                    //expect(body.vod_source_object.originalfilename).to.be.equal(orchestrator_host + "/origin/vod/" + transfer_tenant_name + "/" + hls_library_id + "_" + transfer_profile_name)
                    done()
                });
        });

        it("创建测试文件", function(done) {
            this.timeout(8000)
            let filePath1 = "/var/panel/library/video/vod/output/testMOV"
            let filePath2 = "/var/panel/library/video/vod/output/testTransferNull"
            let is_testMOV = true
            let is_testTransferNull = true
            is_testMOV = checkDirExist(filePath1)
            is_testTransferNull =checkDirExist(filePath2)
            if (is_testMOV == false && is_testTransferNull == false) {
                CreateTestFile();
            }
            setTimeout(done, 6000)
        })

        it("154-3 Transfer VOD list(mov)", function (done) {
            this.timeout(20000);
            API.post("/library/transfer")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "url": Transfer_url + "testMOV"
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    console.log("转移的url：");
                    console.log(Transfer_url + "testMOV");
                    transfer_source_id_mov = body.succ.source_file_id_list[0]
                    expect(body.status).to.be.true;
                    expect(body).to.have.all.keys("status", "succ")
                    expect(body.succ).to.have.all.keys("source_file_id_list")
                    setTimeout(done, 18000);
                });
        });

        it("检查154-3 VOD List是否转移成功", function (done) {
            API.get("/source/" + transfer_source_id_mov)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    expect(body.vod_source_object._id).to.be.equal(transfer_source_id_mov)
                    expect(body.vod_source_object.path).to.be.equal("/var/panel/library/video/vod/input/" + transfer_tenant_name + "/" + transfer_source_id_mov)
                    expect(body.vod_source_object.filename).to.be.equal(transfer_source_id_mov + ".mov")
                    expect(body.vod_source_object.type).to.be.equal("video")
                    expect(body.vod_source_object.originalfilename).to.be.equal(orchestrator_host + "/origin/vod/testMOV/testMOV.mov")
                    done()
                });
        });

        it("154-4 Transfer VOD list(mp4、ts)-重复转移相同VOD list", function (done) {
            this.timeout(20000);
            API.post("/library/transfer")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "url": Transfer_url + transfer_tenant_name
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    console.log("转移的url：");
                    console.log(Transfer_url + transfer_tenant_name);
                    transfer_source_id_s = body.succ.source_file_id_list[0]
                    expect(body.status).to.be.true;
                    expect(body).to.have.all.keys("status", "succ")
                    expect(body.succ).to.have.all.keys("source_file_id_list")
                    setTimeout(done, 18000);
                });
        });

        it("检查154-4 VOD List是否转移成功", function (done) {
            API.get("/source/" + transfer_source_id_s)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    expect(body.vod_source_object._id).to.be.equal(transfer_source_id_s)
                    expect(body.vod_source_object.path).to.be.equal("/var/panel/library/video/vod/input/" + transfer_tenant_name + "/" + transfer_source_id_s)
                    expect(body.vod_source_object.filename).to.be.equal(transfer_source_id_s + ".ts")
                    expect(body.vod_source_object.type).to.be.equal("video")
                    //expect(body.vod_source_object.originalfilename).to.be.equal(orchestrator_host + "/origin/vod/" + transfer_tenant_name + "/" + hls_library_id + "_" + transfer_profile_name)
                    done()
                });
        });

        it("154-6 转移的目录存在，该目录下是不可转移的文件（非mp4，mov，ts文件）", function (done) {
            let list_is_unll = false;
            API.post("/library/transfer")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "url": Transfer_url + "/testTransferNull"
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    if (body.succ.source_file_id_list.length == 0) {
                        list_is_unll = true
                    }
                    console.log(body.succ.source_file_id_list)
                    console.log(list_is_unll);
                    console.log(body);
                    console.log("转移的url：");
                    console.log(Transfer_url + "/testTransferNull");
                    expect(body.status).to.be.true;
                    expect(body).to.have.all.keys("status", "succ")
                    expect(body.succ).to.have.all.keys("source_file_id_list")
                    expect(list_is_unll).to.be.true
                    done()
                });
        });

        it("154-7 转移失败，url为空", function (done) {
            API.post("/library/transfer")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "url": ""
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400)
                    expect(body.err.message).to.be.equal("URL is missing")
                    done()
                });
        });

        it("154-8 转移失败，url是无效的", function (done) {
            API.post("/library/transfer")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "url": "//172.16.1.87:8033/origin/vod"
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400)
                    expect(body.err.message).to.be.equal("Invalid URL")
                    done()
                });
        });

        it("154-9 转移失败，目录不存在", function (done) {
            API.post("/library/transfer")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "url": Transfer_url + "/test"
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    console.log("转移的url：");
                    console.log(Transfer_url + "/test");
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400)
                    expect(body.err.message).to.be.equal("URL not accessible. Failed to transfer source(s) from source URL")
                    done()
                });
        });
    });

    //清除数据
    describe("Clear DB data", function () {

        it("Delete DB", function (done) {
            this.timeout(60000);
            API.delete("/clearDB/autotest")
                .set("Authorization", "Bearer " + orchestrator_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    setTimeout(done, 55000);
                });
        });

        it("Create Tenant db", function (done) {
            API.post("/tenant")
                .set("Authorization", "Bearer " + orchestrator_admin_token)
                .send(tenant_data.tenant_db)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body)
                    expect(body.status).to.be.true;
                    done()
                });
        });

        it("Create Tenant admin", function (done) {
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
                    done();
                });
        });

        it("login", function (done) {
            API.post("/tenant_admin/login")
                .send(tenant_account_data.tenant_admin)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    tenant_admin_token = body.tenant_admin_token;
                    done();
                });
        });
    });
    
    //====↓========2018-10-24新增 自适应bitrate==============↓
    describe("1.7 Create multiple bitrate profiles", function () {
        it("57-1 Create multiple bitratre vod profiles", function (done) {
            this.timeout(6000);
            setTimeout(function () {
                API.post("/profile")
                    .set("Authorization", "Bearer " + tenant_admin_token)
                    .send(profile_data.vod_profile_multiple_bitrate)
                    .expect(200)
                    .end(function (err, res) {
                        if (err) throw err;
                        let body = JSON.parse(res.text);
                        console.log(body);
                        vod_profile_id_multiple_bitrate = body.proc_profile_id;
                        expect(body.status).to.be.true;
                        done();
                    });
            }, 4000);
        });
    });

    describe("1.15 start vod source transcode", function(){
        it("Allocate Source file ID", function (done) {
            API.get("/source/id")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    expect(body.status).to.be.true;
                    source_file_id = body.source_file_id;
                    done();
                });
        });

        it("Upload vod source", function (done) {
            this.timeout(5000);
            setTimeout(function () {
                API.post("/library/upload")
                    .set("Authorization", "Bearer " + tenant_admin_token)
                    .field("type", "video")
                    .field("source_file_id", source_file_id)
                    .attach("file", videopath.mp4, "sample.mp4")
                    .expect(200)
                    .end(function (err, res) {
                        if (err) throw err;
                        console.log(res.body)
                        let body = JSON.parse(res.text);
                        expect(body.status).to.be.true;
                        done();
                    });
            }, 2000);
        });

        it("123-1 Adaptive bitrate, only supports hls output", function(done){
            API.post("/library/encode")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "source_file_id": source_file_id,
                    "proc_profile_id": [vod_profile_id_multiple_bitrate],
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
                    Adaptive_bitrate_library_id = body.library[0]
                    expect(body.status).to.be.true;
                    done();
                });
        });

        it("123-2 Adaptive bitrate, only supports hls output, legacy_hls_support=true, prompt error", function(done){
            API.post("/library/encode")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "source_file_id": source_file_id,
                    "proc_profile_id": [vod_profile_id_multiple_bitrate],
                    "out_type": {
                        "hls_out": [
                          {
                            "legacy_hls_support": true
                          }
                        ],
                        "mp4_out": false
                      }
                    }
                  )
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    expect(body.err.message).to.be.equal("legacy_hls_support not supported with multiple video info set");
                    done();
                });
        });

        it("123-3 Adaptive bitrate, when mp4 output is turned on, an error is displayed.", function(done){
            this.timeout(600000)
            API.post("/library/encode")
                .set("Authorization", "Bearer " + tenant_admin_token)
                .send({
                    "source_file_id": source_file_id,
                    "proc_profile_id": [vod_profile_id_multiple_bitrate],
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
                    expect(body.status).to.be.false;
                    expect(body.err.code).to.be.equal(400);
                    expect(body.err.message).to.be.equal("mp4_out not supported with multiple video info set");
                    setTimeout(done, 58000);
                });
        });

        it("Check if vod is successfully transcoded", function(done){
            this.timeout(30000)
            API.get("/library/" + Adaptive_bitrate_library_id)
                .set("Authorization", "Bearer " + tenant_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    expect(body.encode_status).to.be.equal(4);
                    expect(body.encode_progress).to.be.equal(100);
                    expect(body.playbackURL.hlsOutput).to.have.all.keys("hls_version", "hlsURL", "hlsURL_cdn");
                    setTimeout(done, 28000);
                });
        });
    });
    //====↑========2018-10-24新增 自适应bitrate==============↑

    //清除数据
    describe("Clear DB data", function () {

        it("Delete DB", function (done) {
            this.timeout(60000);
            API.delete("/clearDB/autotest")
                .set("Authorization", "Bearer " + orchestrator_admin_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body);
                    expect(body.status).to.be.true;
                    setTimeout(done, 55000);
                });
        });

        it("Create Tenant db", function (done) {
            API.post("/tenant")
                .set("Authorization", "Bearer " + orchestrator_admin_token)
                .send(tenant_data.tenant_db)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;
                    let body = JSON.parse(res.text);
                    console.log(body)
                    expect(body.status).to.be.true;
                    done()
                });
        });

        it("Create Tenant admin", function (done) {
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
                    done();
                });
        });
    });
});