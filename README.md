## dotscience deploy demo

A web application that posts MNIST image data to a user defined endpoint and displays the prediction results.

### running locally

```
docker build -t dotscience-deploy-demo:local .
docker run -d \
  -p 8085:80 \
  -v $PWD/app/www:/app/www \
  dotscience-deploy-demo:local
```

### deploy

The repo is built in drone and pushed to quay.io

There is a webhook in the quay.io repo that triggers keel to deploy on the `dotscience-e2e` k8s cluster on gcloud.

There is a LoadBalancer that is pointed at via `deploy-demo.dotscience.com` from CloudFlare.
