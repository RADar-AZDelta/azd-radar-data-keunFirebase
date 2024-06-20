source ~/.bash_profile
gcloud auth print-access-token > ./access_token
docker build --tag keun-static --build-arg TOKEN=$(cat ./access_token)  --file Dockerfile --target keun-deploy .