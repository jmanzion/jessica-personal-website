""" DATABASES = {
    'default': {
        #'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'Faces',
        'USER': 'admin',
        'PASSWORD': 'datascience',
        'HOST': 'db',
        'PORT': 5432,
    }
} """

import os

DATABASE = {
    'HOST': os.environ['DB_HOST'],
    'PORT': os.environ['DB_PORT'],
    'NAME': os.environ['DB_NAME'],
    'USER': os.environ['DB_USER'],
    'PASSWORD': os.environ['DB_PASSWORD'],
}