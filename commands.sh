#run angular app
#cd client
#ng serve --host 0.0.0.0
#create compiled files for angular to use in container
rm -R -f client-compiled
cd client
ng build --output-path ../client-compiled 
cd ..
#build image
docker build -t jessica-personal-website .
#run container
#docker run --env DATABASE_URL=postgres://igvoxqwfepyoxl:98a6e08ee66a1b384c3df5673570ae76cca60b5f5560d3fdaaa0076b0eca4c10@ec2-52-4-111-46.compute-1.amazonaws.com:5432/ddhqnu1qusofm8 --env ANGULAR_DEV_APP=http://10.0.0.17:4200/ --env PORT=5000 -p 5000:5000 jessica-personal-website

#deploy to heroku
heroku login
heroku container:login
heroku container:push web
heroku container:release web