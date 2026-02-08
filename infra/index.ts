import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

// Create an AWS resource (S3 Bucket)
const bucket = new aws.s3.Bucket("my-bucket", {
    website: {
        indexDocument: "index.html",
    },
});

// Export the name of the bucket
export const bucketName = bucket.id;
export const bucketEndpoint = pulumi.interpolate`http://${bucket.websiteEndpoint}`;
