var aws = require("aws-sdk");
var fs = require("fs");
var mime = require("mime");
var path = require("path");

var creds = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_DEFAULT_REGION || "us-east-1"
};
aws.config.update(creds);

var s3 = new aws.S3();

var upload = function(bucket, path, buffer) {
  return new Promise((ok, fail) => {
    if (typeof buffer == "string") {
      buffer = Buffer.from(buffer);
    }
    //normalize addresses for Windows
    path = path.replace(/\\/g, "/");
    var obj = {
      Bucket: bucket,
      Key: path,
      Body: buffer,
      ACL: "public-read",
      ContentType: mime.getType(path),
      CacheControl: "public,max-age=30"
    };
    s3.putObject(obj, function(err) {
      if (err) return fail(err);
      console.log(`Uploaded ${(buffer.length / 1024) | 0}KB to s3://${bucket}/${path}`);
      ok(path);
    });
  });
};

var download = function(bucket, path) {
  return new Promise((ok, fail) => {
    s3.getObject({
      Bucket: bucket,
      Key: path
    }, function(err, data) {
      if (err) return fail(err);
      var buffer = data.Body;
      console.log(`Downloaded ${(buffer.length / 1024) | 0}KB from s3://${bucket}/${path}`);
      ok(buffer);
    })
  });
};

var getRemote = function(bucket, path, Marker = null) {
  return new Promise((ok, fail) => {
    s3.listObjects({
      Bucket: bucket,
      Prefix: path,
      Marker
    }, function(err, results) {
      if (err) return fail(err);
      var items = results.Contents.map(function(obj) {
        return {
          file: obj.Key.replace(/.*\/synced\//, ""),
          size: obj.Size,
          key: obj.Key,
          mtime: obj.LastModified
        }
      }).filter(i => i.size);
      var next = results.isTruncated ? items[items.length - 1].key : null;
      ok({ items, next });
    });
  });
};

var ls = async function(bucket, path) {
  var response = null;
  var list = [];
  do {
    var marker = response && response.next;
    response = await getRemote(bucket, path, marker);
    list.push(...response.items);
  } while (response.next);
  return list;
}

module.exports = { upload, download, ls };
