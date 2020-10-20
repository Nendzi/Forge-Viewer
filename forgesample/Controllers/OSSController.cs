/////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Forge Partner Development
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////

using Autodesk.Forge;
using Autodesk.Forge.Model;
using Autodesk.Forge.Client;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using forgesample.Models;

namespace forgesample.Controllers
{
    public partial class OSSController : ApiController
    {
        public string ClientId { get { return OAuthController.GetAppSetting("FORGE_CLIENT_ID").ToLower(); } }

        /// <summary>
        /// Return list of buckets (id=#) or list of objects (id=bucketKey)
        /// </summary>
        [HttpGet]
        [Route("api/forge/oss/buckets")]
        public async Task<IList<TreeNode>> GetOSSAsync([FromUri] string id)
        {
            IList<TreeNode> nodes = new List<TreeNode>();
            dynamic oauth = await OAuthController.GetInternalAsync();

            if (id == "#") // root
            {
                // in this case, let's return all buckets
                BucketsApi appBckets = new BucketsApi();
                appBckets.Configuration.AccessToken = oauth.access_token;

                // to simplify, let's return only the first 100 buckets
                dynamic buckets = await appBckets.GetBucketsAsync("US", 100);
                foreach (KeyValuePair<string, dynamic> bucket in new DynamicDictionaryItems(buckets.items))
                {
                    nodes.Add(new TreeNode(bucket.Value.bucketKey, bucket.Value.bucketKey.Replace(ClientId + "-", string.Empty), "bucket", true));
                }
            }
            else
            {
                // as we have the id (bucketKey), let's return all 
                ObjectsApi objects = new ObjectsApi();
                objects.Configuration.AccessToken = oauth.access_token;
                var objectsList = objects.GetObjects(id);
                foreach (KeyValuePair<string, dynamic> objInfo in new DynamicDictionaryItems(objectsList.items))
                {
                    string fileName = objInfo.Value.objectKey;
                    if (fileName.ToLower().Contains("zip"))
                    {
                        nodes.Add(new TreeNode(Base64Encode((string)objInfo.Value.objectId),
                      objInfo.Value.objectKey, "zipfile", false));
                    }
                    else
                    {
                        nodes.Add(new TreeNode(Base64Encode((string)objInfo.Value.objectId),
                          objInfo.Value.objectKey, "object", false));
                    }
                }
            }
            return nodes;
        }

        /// <summary>
        /// Model data for jsTree used on GetOSSAsync
        /// </summary>
        public class TreeNode
        {
            public TreeNode(string id, string text, string type, bool children)
            {
                this.id = id;
                this.text = text;
                this.type = type;
                this.children = children;
            }

            public string id { get; set; }
            public string text { get; set; }
            public string type { get; set; }
            public bool children { get; set; }
        }

        /// <summary>
        /// Create a new bucket 
        /// </summary>
        [HttpPost]
        [Route("api/forge/oss/buckets")]
        public async Task<dynamic> CreateBucket([FromBody] BucketModel bucket)
        {
            BucketsApi buckets = new BucketsApi();
            dynamic token = await OAuthController.GetInternalAsync();
            buckets.Configuration.AccessToken = token.access_token;
            PostBucketsPayload bucketPayload = new PostBucketsPayload(string.Format("{0}-{1}", ClientId, bucket.bucketKey.ToLower()), null,
              PostBucketsPayload.PolicyKeyEnum.Transient);
            return await buckets.CreateBucketAsync(bucketPayload, "US");
        }

        /// <summary>
        /// Delete selected bucket 
        /// </summary>
        [HttpDelete]
        [Route("api/forge/oss/buckets")]
        public async Task DeleteBucket([FromBody] BucketModel bucket)
        {
            BucketsApi buckets = new BucketsApi();
            dynamic token = await OAuthController.GetInternalAsync();
            buckets.Configuration.AccessToken = token.access_token;
            await buckets.DeleteBucketAsync(bucket.bucketKey);
        }

        /// <summary>
        /// Receive a file from the client and upload to the bucket
        /// </summary>
        /// <returns></returns>
        [HttpPost]
        [Route("api/forge/oss/objects")]
        public async Task<dynamic> UploadObject()
        {
            // basic input validation
            HttpRequest req = HttpContext.Current.Request;
            if (string.IsNullOrWhiteSpace(req.Params["bucketKey"]))
                throw new System.Exception("BucketKey parameter was not provided.");

            if (req.Files.Count > 1)
            {
                throw new System.Exception("Only one file is alowed"); // for now, let's support just 1 file at a time
            }
            else if (req.Files.Count == 0)
            {
                throw new System.Exception("Missing file to upload");
            }


            string bucketKey = req.Params["bucketKey"];
            HttpPostedFile file = req.Files[0];

            // save the file on the server
            var fileSavePath = Path.Combine(HttpContext.Current.Server.MapPath("~/App_Data"), file.FileName);
            file.SaveAs(fileSavePath);

            // get the bucket...
            dynamic oauth = await OAuthController.GetInternalAsync();
            ObjectsApi objects = new ObjectsApi();
            objects.Configuration.AccessToken = oauth.access_token;

            // upload the file/object, which will create a new object
            dynamic uploadedObj;
            using (StreamReader streamReader = new StreamReader(fileSavePath))
            {
                uploadedObj = await objects.UploadObjectAsync(bucketKey,
                       file.FileName, (int)streamReader.BaseStream.Length, streamReader.BaseStream,
                       "application/octet-stream");
            }

            // cleanup
            File.Delete(fileSavePath);

            return uploadedObj;
        }

        /// <summary>
        /// Delete single file from bucket
        /// </summary>
        /// <param name="objInfo">Fields in DeleteObjectModel must be same as data in function deleteFile</param>
        /// <returns></returns>
        [HttpDelete]
        [Route("api/forge/oss/objects/delete")]
        public async Task<dynamic> DeleteObject([FromBody] DeleteObjectModel objInfo)
        {
            ObjectsApi objs = new ObjectsApi();
            dynamic token = await OAuthController.GetInternalAsync();
            objs.Configuration.AccessToken = token.access_token;

            await objs.DeleteObjectAsync(objInfo.bucketKey, objInfo.objectKey);

            return Task.CompletedTask;
        }

        /// <summary>
        /// Base64 enconde a string
        /// </summary>
        public static string Base64Encode(string plainText)
        {
            var plainTextBytes = System.Text.Encoding.UTF8.GetBytes(plainText);
            return System.Convert.ToBase64String(plainTextBytes);
        }
    }
}
