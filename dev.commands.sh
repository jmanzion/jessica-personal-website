docker build -t jessica-personal-website-dev -f Dockerfile.dev .
docker run --env DATABASE_URL=postgres://igvoxqwfepyoxl:98a6e08ee66a1b384c3df5673570ae76cca60b5f5560d3fdaaa0076b0eca4c10@ec2-52-4-111-46.compute-1.amazonaws.com:5432/ddhqnu1qusofm8 --env ANGULAR_DEV_APP=http://10.0.0.12:4200/ --env PORT=5000 -p 5000:5000 -v /Users/jessica/Documents/GitHub/jessica-personal-website:/jessica-personal-website jessica-personal-website-dev

#192.168.1.12