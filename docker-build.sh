source ~/.bash_profile
ACCESS_TOKEN=$(gcloud auth print-access-token)
docker build --tag keun-static --build-arg TOKEN=$ACCESS_TOKEN  --file Dockerfile --target keun-deploy .