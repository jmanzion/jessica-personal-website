#killall Docker && open /Applications/Docker.app

ARG VARIANT="3.9"
FROM mcr.microsoft.com/vscode/devcontainers/python:0-${VARIANT}

#RUN apt-get update

#COPY ./requirements.txt /app/requirements.txt

COPY server /jessica-personal-website/server

WORKDIR /jessica-personal-website

#CMD git clone https://github.com/jmanzion/jessica-personal-website.git

RUN \
    #pip install -r requirements.txt\
    pip install psycopg2-binary\
    pip install flask

CMD python3 server/app.py --host 0.0.0.0 --port $PORT

