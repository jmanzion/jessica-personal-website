FROM python:3.9

RUN apt-get update &&\
    apt-get install -y git

COPY ./requirements.txt /app/requirements.txt

COPY . /app

WORKDIR /app

#CMD git clone https://github.com/jmanzion/jessica-personal-website.git

RUN pip install -r requirements.txt\
    pip install psycopg2\
    pip install python-dotenv\
    pip install gunicorn\
    pip install flask\
    pip install flask_sqlalchemy

